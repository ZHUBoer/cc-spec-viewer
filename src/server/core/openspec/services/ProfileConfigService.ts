import { FileSystem, Path } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { Context, Data, Effect, Layer } from "effect";
import { z } from "zod";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import type { TemplateVariables } from "./TemplateProcessor";

// ============================================================================
// Error Types
// ============================================================================

class ProjectPathNotFoundError extends Data.TaggedError(
  "ProjectPathNotFoundError",
)<{
  projectId: string;
}> {}

class ProfileNotFoundError extends Data.TaggedError("ProfileNotFoundError")<{
  profileId: string;
}> {}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * MCP Server 配置 Schema
 */
const McpServerConfigSchema = z.object({
  type: z.enum(["http", "sse", "stdio"]),
  url: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
});

/**
 * MCP Tool 定义 Schema
 */
const McpToolDefinitionSchema = z.object({
  description: z.string(),
  tools: z.array(z.string()),
});

/**
 * Profile InfraCatalog Schema
 */
const ProfileInfraCatalogSchema = z.object({
  mcp_server_providers: z.record(z.string(), McpServerConfigSchema),
  mcp_tool_definitions: z.object({
    overview: McpToolDefinitionSchema,
    search: McpToolDefinitionSchema,
    specifications: McpToolDefinitionSchema,
  }),
  develop_skills: z
    .object({
      description: z.string(),
      gitUrl: z.string().optional(),
      skills: z.array(z.string()),
    })
    .optional(),
  code_examples: z
    .object({
      examples: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          paths: z.array(z.string()),
        }),
      ),
    })
    .optional(),
});

/**
 * 完整 Profile Schema（用于验证 JSON 文件）
 */
const ProfileSchema = z.object({
  displayName: z.string(),
  custom_variables: z.record(z.string(), z.string()).optional(),
  infra_catalog: ProfileInfraCatalogSchema,
});

// ============================================================================
// Type Guards
// ============================================================================

function isValidProfile(value: unknown): value is Profile {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("displayName" in value) || typeof value.displayName !== "string") {
    return false;
  }
  if (!("infra_catalog" in value)) {
    return false;
  }
  const infraCatalog = value.infra_catalog;
  return typeof infraCatalog === "object" && infraCatalog !== null;
}

// ============================================================================
// Skill Frontmatter Parser
// ============================================================================

/**
 * 解析 SKILL.md 的 frontmatter，提取 name 和 description
 */
function parseSkillFrontmatter(content: string): {
  name: string | null;
  description: string | null;
} {
  // 匹配 YAML frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch?.[1]) {
    return { name: null, description: null };
  }

  const frontmatter = frontmatterMatch[1];

  // 提取 name 字段
  const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
  const name = nameMatch?.[1]?.trim() ?? null;

  // 提取 description 字段（支持引号和非引号）
  const descriptionMatch = frontmatter.match(
    /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m,
  );
  const description = descriptionMatch?.[1]?.trim() ?? null;

  return { name, description };
}

// ============================================================================
// Types
// ============================================================================

export interface McpServerConfig {
  type: "http" | "sse" | "stdio";
  url?: string;
  command?: string;
  args?: string[];
}

export interface McpToolDefinition {
  description: string;
  tools: string[];
}

export interface ProfileInfraCatalog {
  mcp_server_providers: Record<string, McpServerConfig>;
  mcp_tool_definitions: {
    overview: McpToolDefinition;
    search: McpToolDefinition;
    specifications: McpToolDefinition;
  };
  develop_skills?: {
    description: string;
    gitUrl?: string;
    skills: string[];
  };
  code_examples?: {
    examples: Array<{
      name: string;
      description?: string;
      paths: string[];
    }>;
  };
}

const hasInfraCatalogToolsConfigured = (
  infraCatalog: ProfileInfraCatalog,
): boolean => {
  const defs = infraCatalog.mcp_tool_definitions;
  const allTools = [
    ...(defs.overview?.tools ?? []),
    ...(defs.search?.tools ?? []),
    ...(defs.specifications?.tools ?? []),
  ];
  return allTools.some((tool) => tool.trim().length > 0);
};

export interface Profile {
  displayName: string;
  custom_variables?: Record<string, string>;
  infra_catalog: ProfileInfraCatalog;
}

export interface ProfilesConfig {
  version: string;
  profiles: Record<string, Profile>;
}

export interface BuiltInProfile {
  id: string;
  displayName: string;
  infra_catalog: ProfileInfraCatalog;
  custom_variables?: Record<string, string>;
}

export interface ProfileLoadWarning {
  file: string;
  reason: string;
}

export interface ProfileLoadResult {
  profiles: BuiltInProfile[];
  warnings: ProfileLoadWarning[];
}

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  /**
   * 获取 Viewer 内置模板基础路径
   *
   * 优先使用 import.meta.dirname（适用于 npx 和生产环境打包后的 dist/main.js），
   * 若该路径下不存在模板目录，则回退到 process.cwd()（适用于开发环境 tsx watch）。
   */
  const getTemplateBasePath = Effect.gen(function* () {
    // 打包后路径：dist/template-to-project（适用于 npx、生产环境）
    const distPath = path.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }

    // 开发环境回退：从项目根目录获取
    return path.join(process.cwd(), "template-to-project");
  });

  /**
   * 加载所有内置 Profile
   */
  const loadBuiltInProfiles = Effect.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const profilesDir = path.join(templateBasePath, "profiles");
    const exists = yield* fs.exists(profilesDir);

    if (!exists) {
      return {
        profiles: [],
        warnings: [
          {
            file: "profiles/",
            reason: "Profile 目录不存在",
          },
        ],
      } satisfies ProfileLoadResult;
    }

    const files = yield* fs.readDirectory(profilesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const profiles: BuiltInProfile[] = [];
    const warnings: ProfileLoadWarning[] = [];

    for (const file of jsonFiles) {
      const filePath = path.join(profilesDir, file);
      const content = yield* fs.readFileString(filePath);
      const id = file.replace(".json", "");

      try {
        const parsed: unknown = JSON.parse(content);

        // 使用 Zod Schema 验证
        const result = ProfileSchema.safeParse(parsed);
        if (result.success) {
          profiles.push({
            id,
            displayName: result.data.displayName,
            infra_catalog: result.data.infra_catalog,
            custom_variables: result.data.custom_variables,
          });
        } else {
          // 提取第一个验证错误的详细信息
          const firstError = result.error.issues[0];
          if (firstError) {
            const errorPath = firstError.path.join(".");
            warnings.push({
              file,
              reason: `Schema 验证失败: ${errorPath} - ${firstError.message}`,
            });
          } else {
            warnings.push({
              file,
              reason: "Schema 验证失败：未知错误",
            });
          }
        }
      } catch (error) {
        warnings.push({
          file,
          reason: `JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return { profiles, warnings } satisfies ProfileLoadResult;
  });

  /**
   * 获取可用的 Profile 列表
   */
  const getAvailableProfiles = () => loadBuiltInProfiles;

  /**
   * 读取项目的 specforge.profile.json 配置
   */
  const getProjectProfileConfig = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const profileDir = path.join(project.meta.projectPath, "specforge");
      const profilePath = path.join(profileDir, "specforge.profile.json");

      // 1. 优先检查 specforge/ 目录下的配置
      let exists = yield* fs.exists(profilePath);

      // 2. 如果不存在，检查根目录下的配置（兼容旧版本）
      if (!exists) {
        const rootProfilePath = path.join(
          project.meta.projectPath,
          "specforge.profile.json",
        );
        const rootExists = yield* fs.exists(rootProfilePath);

        if (rootExists) {
          // 3. 如果根目录存在，迁移到 specforge/ 目录
          const dirExists = yield* fs.exists(profileDir);
          if (!dirExists) {
            yield* fs.makeDirectory(profileDir);
          }

          // 移动文件
          yield* fs.rename(rootProfilePath, profilePath);
          exists = true;
        }
      }

      if (!exists) {
        return undefined;
      }

      const content = yield* fs.readFileString(profilePath);
      try {
        const parsed: unknown = JSON.parse(content);
        if (isValidProfile(parsed)) {
          return parsed;
        }
        return undefined;
      } catch {
        return undefined;
      }
    });

  /**
   * 保存项目的 specforge.profile.json 配置
   */
  const saveProjectProfileConfig = (projectId: string, profile: Profile) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const profileDir = path.join(project.meta.projectPath, "specforge");
      const profilePath = path.join(profileDir, "specforge.profile.json");

      const dirExists = yield* fs.exists(profileDir);
      if (!dirExists) {
        yield* fs.makeDirectory(profileDir);
      }

      yield* fs.writeFileString(profilePath, JSON.stringify(profile, null, 2));
    });

  /**
   * 根据 Profile 生成模板变量
   *
   * @param profile - Profile 配置
   * @param projectPath - 项目路径
   * @param installedDevelopSkills - 从 Git 安装的 develop skills 结果（由 SkillManagerService 提供）
   *   如果传入非空数组，DEVELOP_SKILLS_APPEND / NAMES / USAGE_MD 将从此结果生成
   *   如果传入空数组或未传入，则不生成相关变量
   */
  const generateTemplateVariables = (
    profile: Profile,
    projectPath: string,
    installedDevelopSkills?: ReadonlyArray<{
      name: string;
      description: string;
    }>,
  ): Effect.Effect<
    TemplateVariables,
    PlatformError,
    FileSystem.FileSystem | Path.Path
  > =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const { infra_catalog, custom_variables } = profile;
      const queryingInfraEnabled =
        hasInfraCatalogToolsConfigured(infra_catalog);
      const variables: TemplateVariables = {
        PROJECT_ROOT: projectPath,
        VERSION: "1.0.0",
        INFRA_CATALOG_TOOL_IDS_APPEND: "",
        INFRA_CATALOG_OVERVIEW_TOOLS_MD: "（未配置）",
        INFRA_CATALOG_SEARCH_TOOLS_MD: "（未配置）",
        INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD: "（未配置）",
        INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD: "",
        DEVELOP_SKILLS_APPEND: "",
        DEVELOP_SKILLS_NAMES: "",
        DEVELOP_SKILLS_USAGE_MD:
          "- 当前未配置额外 develop skills；请优先参考项目内规范文档与现有代码实践。",
        DEVELOP_SKILLS_RULE_LINE:
          "MUST 遵循项目现有开发规范；若无现成规范，遵循通用工程最佳实践并保持与现有代码风格一致。",
        DEVELOP_SKILLS_TASK_INSTRUCTION:
          "查询并确认本项目的开发规范（优先使用已有规范文档或代码库最佳实践），作为后续实现的权威参考。",
        DEVELOP_SKILLS_APPLY_ITEM:
          "- 项目开发规范（如已配置 develop skills，优先使用对应 skills）: 开发规范/开发经验",
        QUERYING_INFRA_RULE_LINE:
          "SHOULD 通过可验证事实获取基建能力信息；若未配置专用查询能力，优先使用代码库与项目文档作为事实来源。",
        QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION:
          "梳理当前项目的整体技术栈和相关能力范围；建立技术认知，为后续查询打基础（优先使用代码库与项目文档）",
        QUERYING_INFRA_SEARCH_TASK_DESCRIPTION:
          "【执行指令】(1)查询基建能力：通过代码库检索、项目文档和现有实现梳理 D-1-1 和 D-1-3 中可能映射的组件/API；(2)多端支持检测：从 spec.md「多端支持说明」章节提取端支持要求（APP/小程序/H5），对比基建能力的端支持情况，若基建组件/API 不支持某个必需的端，标记为'端能力不兼容'并生成🔴临界问题；(3)源码验证：针对查询到的基建能力，使用 Read 工具读取相关源码验证实际使用情况；(4)对比分析：对比已有事实依据与源码实现，若不一致，参考 D-1-2 的开发规范或 D-1-4 的最佳实践；(5)歧义标记：若仍有歧义或端能力不匹配，标记为待用户确认",
        QUERYING_INFRA_FACT_CHECK_SOURCE: "基建组件（通过代码库/文档验证）",
        QUERYING_INFRA_APPLY_ITEM:
          "- 若未配置组件/API 规格查询能力，请基于代码库与官方文档核对规格",
        QUERYING_INFRA_QUALITY_USAGE_LINE:
          "- **审查内部组件/API 使用** → 若未配置专用查询能力，请通过代码库与文档核对规格，绝不猜测",
        CODE_EXAMPLES_MD: "",
      };

      if (queryingInfraEnabled) {
        variables.QUERYING_INFRA_RULE_LINE =
          "MUST 使用 querying-infra-catalog skill 来获取基建知识";
        variables.QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION =
          "使用 querying-infra-catalog skill 的 overview 功能；了解当前项目的整体技术栈和相关能力范围；建立技术认知，为后续查询打基础";
        variables.QUERYING_INFRA_SEARCH_TASK_DESCRIPTION =
          "【执行指令】(1)查询基建能力：使用 querying-infra-catalog skill 的 search 和 specifications 功能查询 D-1-1 和 D-1-3 中可能映射的组件/API；(2)多端支持检测：从 spec.md「多端支持说明」章节提取端支持要求（APP/小程序/H5），对比基建能力的端支持情况，若基建组件/API 不支持某个必需的端，标记为'端能力不兼容'并生成🔴临界问题；(3)源码验证：针对查询到的基建能力，使用 Read 工具读取相关源码验证实际使用情况；(4)对比分析：对比 MCP 查询结果与源码实现，若不一致，参考 D-1-2 的开发规范或 D-1-4 的最佳实践；(5)歧义标记：若仍有歧义或端能力不匹配，标记为待用户确认";
        variables.QUERYING_INFRA_FACT_CHECK_SOURCE =
          "基建组件（调用 querying-infra-catalog skill）";
        variables.QUERYING_INFRA_APPLY_ITEM =
          "- querying-infra-catalog skill: 查询组件/API 规格";
        variables.QUERYING_INFRA_QUALITY_USAGE_LINE =
          "- **审查内部组件/API 使用** → 使用 `querying-infra-catalog` Skill 查询 spec，**绝不猜测**";
      }

      // 生成 MCP 工具 ID 追加片段
      const allToolIds: string[] = [];
      const { mcp_tool_definitions } = infra_catalog;

      if (mcp_tool_definitions) {
        const { overview, search, specifications } = mcp_tool_definitions;

        // 收集所有工具 ID
        if (overview?.tools) allToolIds.push(...overview.tools);
        if (search?.tools) allToolIds.push(...search.tools);
        if (specifications?.tools) allToolIds.push(...specifications.tools);

        // 生成追加片段（带逗号前缀）
        variables.INFRA_CATALOG_TOOL_IDS_APPEND =
          allToolIds.length > 0 ? `, ${allToolIds.join(", ")}` : "";

        // 生成分组工具列表（Markdown 格式）
        const formatToolsMd = (tools: string[]): string =>
          tools.map((t) => `\`${t}\``).join(", ");

        variables.INFRA_CATALOG_OVERVIEW_TOOLS_MD =
          overview?.tools && overview.tools.length > 0
            ? formatToolsMd(overview.tools)
            : "（未配置）";
        variables.INFRA_CATALOG_SEARCH_TOOLS_MD =
          search?.tools && search.tools.length > 0
            ? formatToolsMd(search.tools)
            : "（未配置）";
        variables.INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD =
          specifications?.tools && specifications.tools.length > 0
            ? formatToolsMd(specifications.tools)
            : "（未配置）";

        // 生成工具定义表格
        variables.INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD =
          generateToolDefinitionsTable(mcp_tool_definitions);
      }

      // ================================================================
      // 生成 Skills 模板变量
      // 优先使用 SkillManagerService 的安装结果（准确的 name 和 description）
      // 如果没有安装结果，则回退到扫描 .claude/skills/ 目录
      // ================================================================
      const effectiveSkills = installedDevelopSkills ?? [];

      if (effectiveSkills.length > 0) {
        // 从安装结果生成（精确）
        const skillNames = effectiveSkills.map((s) => s.name);

        variables.DEVELOP_SKILLS_APPEND =
          skillNames.length > 0 ? `, ${skillNames.join(", ")}` : "";
        variables.DEVELOP_SKILLS_NAMES =
          skillNames.length > 0 ? skillNames.join(", ") : "";

        // 直接从安装结果生成使用说明（不再盲扫目录）
        const skillLines = effectiveSkills.map(
          (s) => `- **${s.name}**: ${s.description}`,
        );
        variables.DEVELOP_SKILLS_USAGE_MD = skillLines.join("\n");
        variables.DEVELOP_SKILLS_RULE_LINE = `MUST 使用 ${skillNames.join(", ")} skill 中的开发经验/规范。`;
        variables.DEVELOP_SKILLS_TASK_INSTRUCTION = `MUST 调用 ${skillNames.join(", ")} skill；获取业务线的标准开发规范；作为后续实现的权威参考`;
        variables.DEVELOP_SKILLS_APPLY_ITEM = `- ${skillNames.join(", ")} skill: 开发规范/开发经验`;
      } else if (infra_catalog.develop_skills) {
        // 回退：扫描 .claude/skills/ 目录（兼容已安装但没有 installedDevelopSkills 结果的情况）
        const skillsDir = path.join(projectPath, ".claude", "skills");
        const skillsDirExists = yield* fs.exists(skillsDir);

        if (skillsDirExists) {
          const skillLines: string[] = [];
          const detectedNames: string[] = [];

          const scanSkillsDir = Effect.gen(function* () {
            const items = yield* fs.readDirectory(skillsDir);

            for (const item of items) {
              if (item.startsWith(".")) continue;
              // 跳过 openspec 内置 skills（以 openspec- 开头）
              if (item.startsWith("openspec-")) continue;

              const itemPath = path.join(skillsDir, item);
              const stat = yield* fs.stat(itemPath);

              if (stat.type === "Directory") {
                const skillFilePath = path.join(itemPath, "SKILL.md");
                const skillFileExists = yield* fs.exists(skillFilePath);

                if (skillFileExists) {
                  const content = yield* fs.readFileString(skillFilePath);
                  const { name, description } = parseSkillFrontmatter(content);

                  if (name) {
                    detectedNames.push(name);
                    const desc = description || "开发技能";
                    skillLines.push(`- **${name}**: ${desc}`);
                  }
                }
              }
            }
          });

          yield* scanSkillsDir.pipe(
            Effect.catchAll(() => Effect.succeed(undefined)),
          );

          variables.DEVELOP_SKILLS_APPEND =
            detectedNames.length > 0 ? `, ${detectedNames.join(", ")}` : "";
          variables.DEVELOP_SKILLS_NAMES =
            detectedNames.length > 0 ? detectedNames.join(", ") : "";
          variables.DEVELOP_SKILLS_USAGE_MD =
            skillLines.length > 0
              ? skillLines.join("\n")
              : "- 当前未配置额外 develop skills；请优先参考项目内规范文档与现有代码实践。";

          if (detectedNames.length > 0) {
            const skillNamesText = detectedNames.join(", ");
            variables.DEVELOP_SKILLS_RULE_LINE = `MUST 使用 ${skillNamesText} skill 中的开发经验/规范。`;
            variables.DEVELOP_SKILLS_TASK_INSTRUCTION = `MUST 调用 ${skillNamesText} skill；获取业务线的标准开发规范；作为后续实现的权威参考`;
            variables.DEVELOP_SKILLS_APPLY_ITEM = `- ${skillNamesText} skill: 开发规范/开发经验`;
          }
        }
      }

      // 生成代码示例
      if (infra_catalog.code_examples?.examples) {
        const lines = ["### 代码最佳实践参考", ""];
        for (const example of infra_catalog.code_examples.examples) {
          lines.push(`#### ${example.name}`);
          if (example.description) {
            lines.push(`> ${example.description}`);
          }
          lines.push("**参考路径**:");
          for (const p of example.paths) {
            lines.push(`- \`${p}\``);
          }
          lines.push("");
        }
        variables.CODE_EXAMPLES_MD = lines.join("\n");
      }

      // 合并用户自定义变量（优先级最高，会覆盖同名预定义变量）
      if (custom_variables) {
        Object.assign(variables, custom_variables);
      }

      return variables;
    });

  /**
   * 生成工具定义表格
   */
  const generateToolDefinitionsTable = (
    definitions: ProfileInfraCatalog["mcp_tool_definitions"],
  ): string => {
    const lines = ["| 分组 | 说明 | tools |", "| --- | --- | --- |"];

    const groups: Array<{
      name: string;
      def: McpToolDefinition | undefined;
    }> = [
      { name: "overview", def: definitions.overview },
      { name: "search", def: definitions.search },
      { name: "specifications", def: definitions.specifications },
    ];

    for (const { name, def } of groups) {
      if (!def) continue;
      const effectiveTools = def.tools
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (effectiveTools.length === 0) continue;
      const toolsStr = effectiveTools.map((t) => `\`${t}\``).join(", ");
      lines.push(`| ${name} | ${def.description} | ${toolsStr} |`);
    }

    // 没有任何有效工具时不输出空表格，避免生成歧义文案
    return lines.length > 2 ? lines.join("\n") : "";
  };

  /**
   * 根据 Profile ID 获取内置配置
   */
  const getBuiltInProfile = (profileId: string) =>
    Effect.gen(function* () {
      const result = yield* loadBuiltInProfiles;
      const profile = result.profiles.find((p) => p.id === profileId);

      if (!profile) {
        return yield* Effect.fail(new ProfileNotFoundError({ profileId }));
      }

      return profile;
    });

  return {
    getAvailableProfiles,
    getProjectProfileConfig,
    saveProjectProfileConfig,
    generateTemplateVariables,
    getBuiltInProfile,
  };
});

// ============================================================================
// Service Export
// ============================================================================

export type IProfileConfigService = InferEffect<typeof LayerImpl>;

export class ProfileConfigService extends Context.Tag("ProfileConfigService")<
  ProfileConfigService,
  IProfileConfigService
>() {
  static Live = Layer.effect(this, LayerImpl);
}
