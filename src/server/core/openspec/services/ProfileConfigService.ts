import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
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
  skills?: string[];
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

export interface Profile {
  displayName: string;
  description: string;
  infra_catalog: ProfileInfraCatalog;
}

export interface ProfilesConfig {
  version: string;
  profiles: Record<string, Profile>;
}

export interface BuiltInProfile {
  id: string;
  displayName: string;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 获取 Viewer 内置模板路径
 */
const getTemplateBasePath = (): string => {
  return path.join(process.cwd(), "template-to-project");
};

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;

  /**
   * 加载所有内置 Profile
   */
  const loadBuiltInProfiles = Effect.gen(function* () {
    const profilesDir = path.join(getTemplateBasePath(), "profiles");
    const exists = yield* fs.exists(profilesDir);

    if (!exists) {
      return [];
    }

    const files = yield* fs.readDirectory(profilesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const profiles: BuiltInProfile[] = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(profilesDir, file);
        const content = yield* fs.readFileString(filePath);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // biome-ignore lint/suspicious/noExplicitAny: JSON parsing requires any
        const json = JSON.parse(content) as any;
        const id = file.replace(".json", "");

        profiles.push({
          id,
          displayName: json.displayName || json.profile || id,
          description: json.description || "",
          infra_catalog: json.infra_catalog || {},
        } as BuiltInProfile);
      } catch (error) {
        console.warn(`Failed to load profile ${file}:`, error);
      }
    }

    return profiles;
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

      const profilePath = path.join(
        project.meta.projectPath,
        "specforge.profile.json",
      );
      const exists = yield* fs.exists(profilePath);

      if (!exists) {
        return undefined;
      }

      const content = yield* fs.readFileString(profilePath);
      try {
        return JSON.parse(content) as Profile;
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

      const profilePath = path.join(
        project.meta.projectPath,
        "specforge.profile.json",
      );
      yield* fs.writeFileString(profilePath, JSON.stringify(profile, null, 2));
    });

  /**
   * 根据 Profile 生成模板变量
   */
  const generateTemplateVariables = (
    profile: Profile,
    projectPath: string,
  ): TemplateVariables => {
    const { infra_catalog } = profile;
    const variables: TemplateVariables = {
      PROJECT_ROOT: projectPath,
      VERSION: "1.0.0",
      INFRA_CATALOG_TOOL_IDS_APPEND: "",
      INFRA_CATALOG_OVERVIEW_TOOLS_MD: "",
      INFRA_CATALOG_SEARCH_TOOLS_MD: "",
      INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD: "",
      INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD: "",
      DEVELOP_SKILLS_APPEND: "",
      DEVELOP_SKILLS_USAGE_MD: "",
      CODE_EXAMPLES_MD: "",
    };

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

      variables.INFRA_CATALOG_OVERVIEW_TOOLS_MD = overview?.tools
        ? formatToolsMd(overview.tools)
        : "";
      variables.INFRA_CATALOG_SEARCH_TOOLS_MD = search?.tools
        ? formatToolsMd(search.tools)
        : "";
      variables.INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD = specifications?.tools
        ? formatToolsMd(specifications.tools)
        : "";

      // 生成工具定义表格
      variables.INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD =
        generateToolDefinitionsTable(mcp_tool_definitions);
    }

    // 生成 Skills 追加片段
    const skills = infra_catalog.skills || [];
    variables.DEVELOP_SKILLS_APPEND =
      skills.length > 0 ? `, ${skills.join(", ")}` : "";

    // 生成 Skills 使用说明
    if (infra_catalog.develop_skills) {
      const { skills: devSkills, description } = infra_catalog.develop_skills;
      const lines = devSkills.map(
        (s) => `- **${s}**: ${description || "开发经验技能"}`,
      );
      variables.DEVELOP_SKILLS_USAGE_MD = lines.join("\n");
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

    return variables;
  };

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
      if (def) {
        const toolsStr = def.tools.map((t) => `\`${t}\``).join(", ");
        lines.push(`| ${name} | ${def.description} | ${toolsStr} |`);
      }
    }

    return lines.join("\n");
  };

  /**
   * 根据 Profile ID 获取内置配置
   */
  const getBuiltInProfile = (profileId: string) =>
    Effect.gen(function* () {
      const profiles = yield* loadBuiltInProfiles;
      const profile = profiles.find((p) => p.id === profileId);

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
