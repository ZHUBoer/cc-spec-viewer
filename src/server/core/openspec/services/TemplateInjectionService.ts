import { FileSystem, Path } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import YAML from "yaml";
import type { InferEffect } from "../../../lib/effect/types";
import { EventBus } from "../../events/services/EventBus";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  OpenSpecEnvironmentService,
  type ScenarioType,
} from "./OpenSpecEnvironmentService";
import { type Profile, ProfileConfigService } from "./ProfileConfigService";
import { SkillManagerService } from "./SkillManagerService";
import { SPECFORGE_MARKER_BLOCK_REPLACE_PATTERN } from "./specforgeMarker";
import { TemplateProcessor } from "./TemplateProcessor";

// ============================================================================
// Error Types
// ============================================================================

class ProjectPathNotFoundError extends Data.TaggedError(
  "ProjectPathNotFoundError",
)<{
  projectId: string;
}> {}

// ============================================================================
// Type Guards
// ============================================================================

interface YamlConfig {
  schema?: string;
  context?: string;
  rules?: Record<string, unknown[] | Record<string, unknown>>;
  [key: string]: unknown;
}

function isYamlConfig(value: unknown): value is YamlConfig {
  return typeof value === "object" && value !== null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readStringField = (
  value: Record<string, unknown>,
  field: string,
): string | undefined => {
  const target = value[field];
  if (typeof target !== "string") {
    return undefined;
  }
  const trimmed = target.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

// ============================================================================
// Types
// ============================================================================

export interface InjectionResult {
  success: boolean;
  created: string[];
  skipped: string[];
  updated: string[];
  /** 被清理的托管/废弃产物路径列表 */
  removed: string[];
  errors: Array<{ file: string; error: string }>;
  /** 非阻断性警告（如 git skill 安装失败），不影响 success 判定 */
  warnings: Array<{ file: string; message: string }>;
}

export interface InjectionOptions {
  /** 场景类型（决定注入策略） */
  scenario: ScenarioType;
  /** Profile 配置 */
  profile: Profile;
  /** 是否跳过已存在的用户文件 */
  skipUserFiles?: boolean;
  /** 是否强制重新注入（用于 S5_CONFIGURED 场景下的更新覆盖） */
  force?: boolean;
  /** config.yaml 是否已损坏（S6 场景需要重建） */
  isConfigCorrupted?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * SpecForge 框架内置的 Skills（可覆盖更新）
 * 注意：此处仅包含框架内置 skills，业务 skills（通过 git 动态安装）不应出现在这里
 */
const SPECFORGE_MANAGED_SKILLS = [
  "task-planning",
  "gitnexus",
  "d2c-baseline",
  "d2c-stitching",
  "spec-process",
  "design-process",
];

const QUERYING_INFRA_SKILL = "querying-infra-catalog";

/** SpecForge 框架托管的 agent 文件名（精确匹配，防止误删用户自定义 agent） */
const SPECFORGE_MANAGED_AGENTS = [
  "format-compliance-agent.md",
  "quality-gate-agent.md",
] as const;

/** 历史上曾托管过但现已废弃的 skills（只用于清理旧产物，不用于注入） */
const DEPRECATED_SKILLS = [
  "design-generation",
  "ast-grep",
  "gitnexus-exploring",
] as const;

/**
 * 历史托管 skills 总集合
 * 用于对账：找出不再托管但项目中仍存在的 skill 目录
 */
const ALL_HISTORICALLY_MANAGED_SKILLS = [
  ...SPECFORGE_MANAGED_SKILLS,
  QUERYING_INFRA_SKILL,
  ...DEPRECATED_SKILLS,
] as const;

const DEFAULT_TEMPLATE_VERSION = "1.0.5";

/**
 * 获取 Viewer 内置模板路径（已弃用，移至 LayerImpl 内部）
 * 开发环境：从项目根目录的 template-to-project 目录读取
 * 生产环境（npm包）：从 dist/template-to-project 目录读取
 */
// const getTemplateBasePath = (): string => {
//   已移至 LayerImpl 内部，使用 Effect-TS 和 Path.Path
// };

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const templateProcessor = yield* TemplateProcessor;
  const profileConfigService = yield* ProfileConfigService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const skillManagerService = yield* SkillManagerService;
  const eventBus = yield* EventBus;

  const shouldEnableQueryingInfraSkill = (profile: Profile): boolean => {
    const defs = profile.infra_catalog.mcp_tool_definitions;
    const allTools = [
      ...(defs.overview?.tools ?? []),
      ...(defs.search?.tools ?? []),
      ...(defs.specifications?.tools ?? []),
    ];
    return allTools.some((tool) => tool.trim().length > 0);
  };

  const parseSkillFrontmatter = (content: string) => {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const emptyResult: { name: string | null; description: string | null } = {
      name: null,
      description: null,
    };
    if (!frontmatterMatch?.[1]) {
      return emptyResult;
    }
    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
    const descriptionMatch = frontmatter.match(
      /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m,
    );
    return {
      name: nameMatch?.[1]?.trim() ?? null,
      description: descriptionMatch?.[1]?.trim() ?? null,
    };
  };

  const parseMcpToolId = (toolId: string): { server: string } | null => {
    const parts = toolId.split("__");
    if (parts.length < 3 || parts[0] !== "mcp") return null;
    const server = parts[1]?.trim();
    const toolName = parts.slice(2).join("__").trim();
    if (!server || !toolName) return null;
    return { server };
  };

  const validateMcpToolConsistency = (profile: Profile) =>
    Effect.gen(function* () {
      const providers = profile.infra_catalog.mcp_server_providers || {};
      const providerNames = Object.keys(providers).map((n) => n.trim());
      const defs = profile.infra_catalog.mcp_tool_definitions;
      const allTools = [
        ...(defs.overview?.tools ?? []),
        ...(defs.search?.tools ?? []),
        ...(defs.specifications?.tools ?? []),
      ]
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const issues: string[] = [];
      if (providerNames.length > 0 && allTools.length === 0) {
        issues.push(
          "检测到已配置 mcp_server_providers，但 mcp_tool_definitions 为空。请至少为 overview/search/specifications 配置一个 tool，或删除无效的 MCP server 配置。",
        );
      }

      const builtInServers = yield* loadBuiltInMcpServers;
      const knownServers = new Set([
        ...providerNames,
        ...Object.keys(builtInServers).map((n) => n.trim()),
      ]);

      const invalidToolIds: string[] = [];
      const unknownServerRefs = new Set<string>();
      for (const tool of allTools) {
        const parsed = parseMcpToolId(tool);
        if (!parsed) {
          invalidToolIds.push(tool);
          continue;
        }
        if (!knownServers.has(parsed.server)) {
          unknownServerRefs.add(parsed.server);
        }
      }

      if (invalidToolIds.length > 0) {
        issues.push(
          `以下 tool id 格式无效（需为 mcp__<server>__<tool>）: ${invalidToolIds.join(", ")}`,
        );
      }
      if (unknownServerRefs.size > 0) {
        issues.push(
          `以下 tool 引用了未配置的 mcp server: ${Array.from(unknownServerRefs).join(", ")}`,
        );
      }

      return issues;
    });

  const resolveLocalDevelopSkills = (
    projectPath: string,
    requestedSkills: string[],
  ) =>
    Effect.gen(function* () {
      const result: {
        resolved: Array<{ name: string; description: string }>;
        missing: string[];
      } = { resolved: [], missing: [] };
      const skillsDir = path.join(projectPath, ".claude", "skills");
      const hasSkillsDir = yield* fs.exists(skillsDir);
      if (!hasSkillsDir) {
        return {
          resolved: [],
          missing: requestedSkills
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        };
      }

      for (const raw of requestedSkills) {
        const requested = raw.trim();
        if (!requested) continue;
        const basename = path.basename(requested);
        const candidates = Array.from(new Set([requested, basename]));

        let found: { name: string; description: string } | null = null;
        for (const candidate of candidates) {
          if (!candidate) continue;
          const skillMdPath = path.join(skillsDir, candidate, "SKILL.md");
          const exists = yield* fs.exists(skillMdPath);
          if (!exists) continue;
          const content = yield* fs
            .readFileString(skillMdPath)
            .pipe(Effect.catchAll(() => Effect.succeed("")));
          const { name, description } = parseSkillFrontmatter(content);
          found = {
            name: name ?? candidate,
            description: description ?? "开发技能",
          };
          break;
        }

        if (found) {
          result.resolved.push(found);
        } else {
          result.missing.push(requested);
        }
      }

      return result;
    });

  const getManagedSkills = (includeQueryingInfra: boolean): string[] => {
    return includeQueryingInfra
      ? [...SPECFORGE_MANAGED_SKILLS, QUERYING_INFRA_SKILL]
      : [...SPECFORGE_MANAGED_SKILLS];
  };

  const removeDisabledManagedSkills = (
    projectPath: string,
    options: { includeQueryingInfraSkill: boolean },
  ) =>
    Effect.gen(function* () {
      const removed: string[] = [];
      const skillsDir = path.join(projectPath, ".claude", "skills");
      const hasSkillsDir = yield* fs.exists(skillsDir);
      if (!hasSkillsDir) return removed;

      // querying-infra-catalog 是按能力开关注入的托管 skill，关闭时需要主动移除
      if (!options.includeQueryingInfraSkill) {
        const queryingSkillDir = path.join(skillsDir, QUERYING_INFRA_SKILL);
        const exists = yield* fs.exists(queryingSkillDir);
        if (exists) {
          yield* fs
            .remove(queryingSkillDir, { recursive: true })
            .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
          removed.push(`.claude/skills/${QUERYING_INFRA_SKILL}`);
        }
      }

      return removed;
    });

  /**
   * 对账清理托管 skills：删除"历史曾托管但当前不在激活清单中"的 skill 目录
   * 同时清理废弃产物（design-generation、ast-grep 等）
   */
  const reconcileManagedSkills = (
    projectPath: string,
    activeManagedSkills: string[],
  ) =>
    Effect.gen(function* () {
      const removed: string[] = [];
      const skillsDir = path.join(projectPath, ".claude", "skills");
      const hasSkillsDir = yield* fs.exists(skillsDir);
      if (!hasSkillsDir) return removed;

      const activeSet = new Set(activeManagedSkills);
      for (const name of ALL_HISTORICALLY_MANAGED_SKILLS) {
        if (activeSet.has(name)) continue; // 仍在托管中，跳过
        const dir = path.join(skillsDir, name);
        const exists = yield* fs.exists(dir);
        if (exists) {
          yield* fs
            .remove(dir, { recursive: true })
            .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
          removed.push(`.claude/skills/${name}`);
        }
      }
      return removed;
    });

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

  const getTemplateVersion = Effect.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const manifestPath = path.join(templateBasePath, "template-manifest.json");
    const exists = yield* fs.exists(manifestPath);
    if (!exists) return DEFAULT_TEMPLATE_VERSION;

    const raw = yield* fs
      .readFileString(manifestPath)
      .pipe(Effect.catchAll(() => Effect.succeed("")));
    if (!raw) return DEFAULT_TEMPLATE_VERSION;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed)) {
        return (
          readStringField(parsed, "template_version") ??
          DEFAULT_TEMPLATE_VERSION
        );
      }
      return DEFAULT_TEMPLATE_VERSION;
    } catch {
      return DEFAULT_TEMPLATE_VERSION;
    }
  });

  /**
   * 对账清理托管 agents：删除"模板已移除但项目中仍存在"的框架托管 agent 文件
   * 只处理 SPECFORGE_MANAGED_AGENTS 列表中的文件，防止误删用户自定义 agent
   */
  const reconcileManagedAgents = (projectPath: string) =>
    Effect.gen(function* () {
      const removed: string[] = [];
      const agentsDir = path.join(projectPath, ".claude", "agents");
      const hasAgentsDir = yield* fs.exists(agentsDir);
      if (!hasAgentsDir) return removed;

      const templateBasePath = yield* getTemplateBasePath;
      const agentsTemplateDir = path.join(
        templateBasePath,
        ".claude",
        "agents",
      );
      const templateExists = yield* fs.exists(agentsTemplateDir);
      // 模板目录不可用时保守跳过，避免因打包/部署异常导致误删项目文件
      if (!templateExists) return removed;

      for (const agentFile of SPECFORGE_MANAGED_AGENTS) {
        const inProject = yield* fs.exists(path.join(agentsDir, agentFile));
        if (!inProject) continue;

        // 模板中已不包含该文件，则清理项目中的副本
        const inTemplate = yield* fs.exists(
          path.join(agentsTemplateDir, agentFile),
        );

        if (!inTemplate) {
          yield* fs
            .remove(path.join(agentsDir, agentFile))
            .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
          removed.push(`.claude/agents/${agentFile}`);
        }
      }
      return removed;
    });

  /**
   * 对账清理 openspec 托管模板文件：
   * 递归删除 openspec/schemas/specforge-enhanced/ 中"项目存在但模板已移除"的文件
   * 典型场景：proposal.md → spec.md 重命名后，旧的 proposal.md 不再被清理
   */
  const reconcileManagedOpenspecFiles = (projectPath: string) =>
    Effect.gen(function* () {
      const removed: string[] = [];
      const relBase = path.join("openspec", "schemas", "specforge-enhanced");
      const targetDir = path.join(projectPath, relBase);
      const hasTargetDir = yield* fs.exists(targetDir);
      if (!hasTargetDir) return removed;

      const templateBasePath = yield* getTemplateBasePath;
      const templateDir = path.join(templateBasePath, relBase);

      // 递归收集目录下所有文件的相对路径
      const collectFiles = (
        dir: string,
        baseDir: string,
      ): Effect.Effect<string[]> =>
        Effect.gen(function* () {
          const entries = yield* fs
            .readDirectory(dir)
            .pipe(Effect.catchAll(() => Effect.succeed([])));
          const results: string[] = [];
          for (const name of entries) {
            if (name.startsWith(".") || name.includes(".DS_Store")) continue;
            const fullPath = path.join(dir, name);
            const rel = path.relative(baseDir, fullPath);
            const stat = yield* fs
              .stat(fullPath)
              .pipe(Effect.catchAll(() => Effect.succeed(null)));
            if (stat?.type === "File") {
              results.push(rel);
            } else if (stat?.type === "Directory") {
              const subFiles = yield* collectFiles(fullPath, baseDir);
              results.push(...subFiles);
            }
          }
          return results;
        });

      // 收集模板中存在的文件集合（相对于 specforge-enhanced/）
      const hasTemplateDir = yield* fs.exists(templateDir);
      // 模板目录不可用时保守跳过，避免因打包/部署异常导致误删项目文件
      if (!hasTemplateDir) return removed;

      const templateFiles = yield* collectFiles(templateDir, templateDir);
      const templateFileSet = new Set(templateFiles);

      // 遍历项目中的文件，删除不在模板中的
      const projectFiles = yield* collectFiles(targetDir, targetDir);
      for (const relFile of projectFiles) {
        if (!templateFileSet.has(relFile)) {
          yield* fs
            .remove(path.join(targetDir, relFile))
            .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
          removed.push(`${relBase}/${relFile}`);
        }
      }
      return removed;
    });

  /**
   * 生成 specforge 标记块
   */
  const generateSpecforgeMarker = (
    profile: string,
    templateVersion: string,
  ): string => {
    return `_specforge:
  profile: "${profile}"
  template_version: "${templateVersion}"
  initialized_at: "${new Date().toISOString()}"

`;
  };

  /**
   * 在 config.yaml 中注入 specforge 标记
   */
  const injectSpecforgeMarker = (projectPath: string, profileName: string) =>
    Effect.gen(function* () {
      const configPath = path.join(projectPath, "openspec", "config.yaml");
      const exists = yield* fs.exists(configPath);
      const templateVersion = yield* getTemplateVersion;

      if (exists) {
        let content = yield* fs.readFileString(configPath);

        // 检查是否已有标记
        if (content.includes("_specforge:")) {
          // 更新现有标记
          content = content.replace(
            SPECFORGE_MARKER_BLOCK_REPLACE_PATTERN,
            generateSpecforgeMarker(profileName, templateVersion),
          );
        } else {
          // 在文件开头添加标记
          content =
            generateSpecforgeMarker(profileName, templateVersion) + content;
        }

        yield* fs.writeFileString(configPath, content);
      }
    });

  /**
   * 注入 openspec 目录
   */
  const injectOpenspecDir = (
    projectPath: string,
    variables: Record<string, string | undefined>,
    options: { scenario: ScenarioType },
  ) =>
    Effect.gen(function* () {
      const templateBasePath = yield* getTemplateBasePath;
      const templateDir = path.join(templateBasePath, "openspec");
      const targetDir = path.join(projectPath, "openspec");

      const result: { created: string[]; skipped: string[]; errors: string[] } =
        {
          created: [],
          skipped: [],
          errors: [],
        };

      // S2/S4/S5/S6 场景: openspec 目录已存在，只更新 schemas，保留用户的 config.yaml
      if (
        options.scenario === "S2_OPENSPEC_ONLY" ||
        options.scenario === "S4_BOTH_NON_SPECFORGE" ||
        options.scenario === "S5_CONFIGURED" ||
        options.scenario === "S6_PARTIAL"
      ) {
        // 只更新 schemas 目录（Viewer 管理的文件）
        const schemasTemplateDir = path.join(templateDir, "schemas");
        const schemasTargetDir = path.join(targetDir, "schemas");

        const schemasExists = yield* fs.exists(schemasTemplateDir);
        if (schemasExists) {
          const schemasResult =
            yield* templateProcessor.processTemplateDirectory(
              schemasTemplateDir,
              schemasTargetDir,
              variables,
              {
                skipExisting: false, // SpecForge schemas 可覆盖更新
                filter: (relativePath) =>
                  relativePath.startsWith("specforge-enhanced/"),
              },
            );
          result.created.push(
            ...schemasResult.created.map((f) => `openspec/schemas/${f}`),
          );
          result.skipped.push(
            ...schemasResult.skipped.map((f) => `openspec/schemas/${f}`),
          );
          result.errors.push(...schemasResult.errors);
        }

        return result;
      }

      // 其他场景: 完整注入 openspec 目录
      const templateExists = yield* fs.exists(templateDir);
      if (!templateExists) {
        result.errors.push("Template directory not found: openspec");
        return result;
      }

      // 处理模板目录（始终覆盖更新，确保旧版本文件被升级）
      const processResult = yield* templateProcessor.processTemplateDirectory(
        templateDir,
        targetDir,
        variables,
        {
          skipExisting: false,
          filter: (relativePath) => {
            // 跳过 .DS_Store 等系统文件
            return !relativePath.includes(".DS_Store");
          },
        },
      );

      result.created.push(...processResult.created.map((f) => `openspec/${f}`));
      result.skipped.push(...processResult.skipped.map((f) => `openspec/${f}`));
      result.errors.push(...processResult.errors);

      return result;
    });

  /**
   * 注入 .claude 目录
   */
  const injectClaudeDir = (
    projectPath: string,
    variables: Record<string, string | undefined>,
    options: { includeQueryingInfraSkill: boolean },
  ) =>
    Effect.gen(function* () {
      const templateBasePath = yield* getTemplateBasePath;
      const templateDir = path.join(templateBasePath, ".claude");
      const targetDir = path.join(projectPath, ".claude");

      const result: { created: string[]; skipped: string[]; errors: string[] } =
        {
          created: [],
          skipped: [],
          errors: [],
        };

      const templateExists = yield* fs.exists(templateDir);
      if (!templateExists) {
        result.errors.push("Template directory not found: .claude");
        return result;
      }

      // 处理 skills 目录
      const skillsTemplateDir = path.join(templateDir, "skills");
      const skillsTargetDir = path.join(targetDir, "skills");

      const skillsTemplateExists = yield* fs.exists(skillsTemplateDir);
      if (skillsTemplateExists) {
        const skillsResult = yield* templateProcessor.processTemplateDirectory(
          skillsTemplateDir,
          skillsTargetDir,
          variables,
          {
            skipExisting: false, // SpecForge skills 可覆盖更新
            filter: (relativePath) => {
              // 只处理 SpecForge 管理的 skills
              const skillName = relativePath.split(/[\\/]/)[0];
              if (!skillName) return false;
              if (relativePath.includes(".DS_Store")) return false;

              return getManagedSkills(
                options.includeQueryingInfraSkill,
              ).includes(skillName);
            },
          },
        );
        result.created.push(
          ...skillsResult.created.map((f) => `.claude/skills/${f}`),
        );
        result.skipped.push(
          ...skillsResult.skipped.map((f) => `.claude/skills/${f}`),
        );
        result.errors.push(...skillsResult.errors);
      }

      // 处理 agents 目录（与 skills 保持一致，始终覆盖框架托管文件）
      const agentsTemplateDir = path.join(templateDir, "agents");
      const agentsTargetDir = path.join(targetDir, "agents");

      const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);

      if (agentsTemplateExists) {
        const agentsResult = yield* templateProcessor.processTemplateDirectory(
          agentsTemplateDir,
          agentsTargetDir,
          variables,
          {
            skipExisting: false, // SpecForge agents 可覆盖更新
            filter: (relativePath) =>
              SPECFORGE_MANAGED_AGENTS.some((f) => relativePath === f),
          },
        );
        result.created.push(
          ...agentsResult.created.map((f) => `.claude/agents/${f}`),
        );
        result.skipped.push(
          ...agentsResult.skipped.map((f) => `.claude/agents/${f}`),
        );
        result.errors.push(...agentsResult.errors);
      }

      return result;
    });

  /**
   * 加载 .mcp.template.json 中的内置 MCP 服务器配置
   */
  const loadBuiltInMcpServers = Effect.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templatePath = path.join(
      templateBasePath,
      "profiles",
      ".mcp.template.json",
    );
    const exists = yield* fs.exists(templatePath);
    if (!exists) {
      return {};
    }
    try {
      const content = yield* fs.readFileString(templatePath);
      const parsed: unknown = JSON.parse(content);
      if (!isRecord(parsed)) {
        return {};
      }
      const mcpServers = parsed.mcpServers;
      if (!isRecord(mcpServers)) {
        return {};
      }
      return mcpServers;
    } catch {
      return {};
    }
  });

  /**
   * 合并 .mcp.json（内置 MCP + Profile MCP，每次覆盖写入）
   *
   * 合并策略：
   * 1. 读取项目已有的 .mcp.json（保留用户自行添加的服务器）
   * 2. 合并内置模板中的 MCP 服务器（来自 .mcp.template.json）
   * 3. 合并 Profile 中用户配置的 MCP 服务器
   * 内置和 Profile 中的服务器始终覆盖同名项，确保配置最新。
   */
  const mergeMcpConfig = (projectPath: string, profile: Profile) =>
    Effect.gen(function* () {
      const mcpPath = path.join(projectPath, ".mcp.json");
      const exists = yield* fs.exists(mcpPath);

      interface McpConfig {
        mcpServers: Record<string, unknown>;
      }

      let existingConfig: McpConfig = { mcpServers: {} };

      if (exists) {
        try {
          const content = yield* fs.readFileString(mcpPath);
          const parsed: unknown = JSON.parse(content);
          if (isRecord(parsed) && isRecord(parsed.mcpServers)) {
            existingConfig = {
              mcpServers: parsed.mcpServers,
            };
          }
        } catch {
          // 解析失败，使用空配置
        }
      }

      // 加载内置 MCP 服务器（始终覆盖同名项）
      const builtInServers = yield* loadBuiltInMcpServers;
      for (const [name, config] of Object.entries(builtInServers)) {
        existingConfig.mcpServers[name] = config;
      }

      // 合并 Profile 中的 MCP 服务器（始终覆盖同名项）
      const profileServers = profile.infra_catalog.mcp_server_providers || {};
      for (const [name, config] of Object.entries(profileServers)) {
        existingConfig.mcpServers[name] = config;
      }

      // 每次都写入，确保配置最新
      yield* fs.writeFileString(
        mcpPath,
        JSON.stringify(existingConfig, null, 2),
      );

      const totalServers = Object.keys(existingConfig.mcpServers).length;
      return {
        addedCount:
          Object.keys(builtInServers).length +
          Object.keys(profileServers).length,
        totalServers,
      };
    });

  /**
   * 合并 config.yaml
   * 策略：
   * - schema: 使用模板的值（specforge-enhanced）
   * - context: 如果用户有 context，在后面追加模板的 context
   * - rules: 深度合并，用户规则优先，模板规则作为增强
   */
  const mergeConfigYaml = (
    projectPath: string,
    variables: Record<string, string | undefined>,
  ) =>
    Effect.gen(function* () {
      const userConfigPath = path.join(projectPath, "openspec", "config.yaml");
      const templateBasePath = yield* getTemplateBasePath;
      const templateConfigPath = path.join(
        templateBasePath,
        "openspec",
        "config.yaml",
      );

      // 读取用户的 config.yaml（由 openspec init 创建）
      const userConfigExists = yield* fs.exists(userConfigPath);
      if (!userConfigExists) {
        return yield* Effect.fail(
          new Error("用户的 config.yaml 不存在，无法合并"),
        );
      }

      const userConfigContent = yield* fs.readFileString(userConfigPath);
      const userConfigParsed: unknown = YAML.parse(userConfigContent);
      if (!isYamlConfig(userConfigParsed)) {
        return yield* Effect.fail(new Error("用户的 config.yaml 格式无效"));
      }
      const userConfig = userConfigParsed;

      // 读取模板的 config.yaml
      const templateConfigExists = yield* fs.exists(templateConfigPath);
      if (!templateConfigExists) {
        return yield* Effect.fail(
          new Error("模板的 config.yaml 不存在，无法合并"),
        );
      }

      let templateConfigContent = yield* fs.readFileString(templateConfigPath);

      // 应用模板变量替换
      for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined) {
          templateConfigContent = templateConfigContent.replaceAll(
            `{{${key}}}`,
            value,
          );
        }
      }

      const templateConfigParsed: unknown = YAML.parse(templateConfigContent);
      if (!isYamlConfig(templateConfigParsed)) {
        return yield* Effect.fail(new Error("模板的 config.yaml 格式无效"));
      }
      const templateConfig = templateConfigParsed;

      // 合并配置
      const mergedConfig = { ...userConfig };

      // 1. schema: 必须使用 specforge-enhanced
      mergedConfig.schema = templateConfig.schema || "specforge-enhanced";

      // 2. context: 追加模板的 context 到用户的 context
      if (templateConfig.context) {
        if (userConfig.context) {
          // 用户已有 context，追加模板的 context
          mergedConfig.context = `${userConfig.context}\n\n# SpecForge 增强配置\n${templateConfig.context}`;
        } else {
          // 用户没有 context，直接使用模板的
          mergedConfig.context = templateConfig.context;
        }
      }

      // 3. rules: 深度合并
      if (templateConfig.rules) {
        mergedConfig.rules = mergedConfig.rules || {};

        for (const [artifactType, templateRules] of Object.entries(
          templateConfig.rules,
        )) {
          if (Array.isArray(templateRules)) {
            // 数组类型：追加模板规则到用户规则后面（两者都保留）
            // 例如：用户规则 [A, B] + 模板规则 [C, D] = [A, B, C, D]
            const existingRules = mergedConfig.rules?.[artifactType];
            if (Array.isArray(existingRules)) {
              mergedConfig.rules[artifactType] = [
                ...existingRules,
                ...templateRules,
              ];
            } else {
              mergedConfig.rules[artifactType] = templateRules;
            }
          } else if (
            typeof templateRules === "object" &&
            templateRules !== null
          ) {
            // 对象类型：用户规则优先，模板规则作为补充
            // 同名键：用户规则覆盖模板规则（用户有最终决定权）
            // 不同名键：两者都保留
            // 例如：模板 {max: 100, req: true} + 用户 {max: 200} = {max: 200, req: true}
            const existingRules = mergedConfig.rules?.[artifactType];
            if (
              typeof existingRules === "object" &&
              existingRules !== null &&
              !Array.isArray(existingRules)
            ) {
              mergedConfig.rules[artifactType] = {
                ...templateRules,
                ...existingRules,
              };
            } else {
              mergedConfig.rules[artifactType] = templateRules;
            }
          }
        }
      }

      // 写入合并后的配置
      // lineWidth=0: 禁止自动折行，避免把 context 的可读块样式重写成折叠样式导致观感歧义
      const mergedYaml = YAML.stringify(mergedConfig, { lineWidth: 0 });
      yield* fs.writeFileString(userConfigPath, mergedYaml);
    });

  /**
   * 注入 OpenSpec 增强配置（S1_NEW 场景专用）
   * 在 openspec init 之后调用，只注入 SpecForge 的增强部分
   */
  const injectOpenspecEnhancements = (
    projectPath: string,
    variables: Record<string, string | undefined>,
  ) =>
    Effect.gen(function* () {
      const result: { created: string[]; updated: string[]; errors: string[] } =
        {
          created: [],
          updated: [],
          errors: [],
        };

      // 1. 复制自定义 schemas 目录
      const templateBasePath = yield* getTemplateBasePath;
      const schemasTemplateDir = path.join(
        templateBasePath,
        "openspec",
        "schemas",
      );
      const schemasTargetDir = path.join(projectPath, "openspec", "schemas");

      const schemasExists = yield* fs.exists(schemasTemplateDir);
      if (schemasExists) {
        try {
          const schemasResult =
            yield* templateProcessor.processTemplateDirectory(
              schemasTemplateDir,
              schemasTargetDir,
              variables,
              {
                skipExisting: false, // SpecForge schemas 可覆盖更新
                filter: (relativePath) =>
                  relativePath.startsWith("specforge-enhanced/"),
              },
            );
          result.created.push(
            ...schemasResult.created.map((f) => `openspec/schemas/${f}`),
          );
          result.errors.push(...schemasResult.errors);
        } catch (error) {
          result.errors.push(
            `复制 schemas 目录失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // 2. 合并 config.yaml
      try {
        yield* mergeConfigYaml(projectPath, variables);
        result.updated.push("openspec/config.yaml");
      } catch (error) {
        result.errors.push(
          `合并 config.yaml 失败: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      return result;
    });

  /**
   * 注入 .claude 增强配置（S1_NEW 场景专用）
   * 在 openspec init 之后调用，只注入 SpecForge 自定义 skills
   */
  const injectClaudeEnhancements = (
    projectPath: string,
    variables: Record<string, string | undefined>,
    options: { includeQueryingInfraSkill: boolean },
  ) =>
    Effect.gen(function* () {
      const result: { created: string[]; skipped: string[]; errors: string[] } =
        {
          created: [],
          skipped: [],
          errors: [],
        };

      const templateBasePath = yield* getTemplateBasePath;
      const templateDir = path.join(templateBasePath, ".claude");
      const targetDir = path.join(projectPath, ".claude");

      // 1. 复制 SpecForge 管理的 skills
      const skillsTemplateDir = path.join(templateDir, "skills");
      const skillsTargetDir = path.join(targetDir, "skills");

      const skillsTemplateExists = yield* fs.exists(skillsTemplateDir);
      if (skillsTemplateExists) {
        try {
          const skillsResult =
            yield* templateProcessor.processTemplateDirectory(
              skillsTemplateDir,
              skillsTargetDir,
              variables,
              {
                skipExisting: false, // SpecForge skills 可覆盖更新
                filter: (relativePath) => {
                  // 只处理 SpecForge 管理的 skills
                  const skillName = relativePath.split(/[\\/]/)[0];
                  if (!skillName) return false;

                  return getManagedSkills(
                    options.includeQueryingInfraSkill,
                  ).includes(skillName);
                },
              },
            );
          result.created.push(
            ...skillsResult.created.map((f) => `.claude/skills/${f}`),
          );
          result.skipped.push(
            ...skillsResult.skipped.map((f) => `.claude/skills/${f}`),
          );
          result.errors.push(...skillsResult.errors);
        } catch (error) {
          result.errors.push(
            `复制 skills 目录失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // 2. 复制 agents 目录（如果有的话）
      const agentsTemplateDir = path.join(templateDir, "agents");
      const agentsTargetDir = path.join(targetDir, "agents");

      const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
      if (agentsTemplateExists) {
        try {
          const agentsResult =
            yield* templateProcessor.processTemplateDirectory(
              agentsTemplateDir,
              agentsTargetDir,
              variables,
              {
                skipExisting: false, // SpecForge agents 可覆盖更新
                filter: (relativePath) =>
                  SPECFORGE_MANAGED_AGENTS.some((f) => relativePath === f),
              },
            );
          result.created.push(
            ...agentsResult.created.map((f) => `.claude/agents/${f}`),
          );
          result.skipped.push(
            ...agentsResult.skipped.map((f) => `.claude/agents/${f}`),
          );
          result.errors.push(...agentsResult.errors);
        } catch (error) {
          result.errors.push(
            `复制 agents 目录失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      return result;
    });

  /**
   * 执行模板注入
   */
  const injectTemplates = (projectId: string, options: InjectionOptions) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const projectPath = project.meta.projectPath;
      const { scenario, profile, force } = options;
      const includeQueryingInfraSkill = shouldEnableQueryingInfraSkill(profile);
      const developSkillsConfig = profile.infra_catalog.develop_skills;
      let preResolvedLocalDevelopSkills: Array<{
        name: string;
        description: string;
      }> = [];

      const result: InjectionResult = {
        success: true,
        created: [],
        skipped: [],
        updated: [],
        removed: [],
        errors: [],
        warnings: [],
      };

      // 前置校验：MCP server 与 tools 必须一致，避免注入后产生不可执行歧义
      const mcpConsistencyIssues = yield* validateMcpToolConsistency(profile);
      if (mcpConsistencyIssues.length > 0) {
        result.success = false;
        result.errors.push(
          ...mcpConsistencyIssues.map((issue) => ({
            file: "profile-config",
            error: issue,
          })),
        );
        return result;
      }

      // 前置校验：develop_skills 可用性（闭环）
      if (developSkillsConfig && developSkillsConfig.skills.length > 0) {
        if (developSkillsConfig.gitUrl) {
          const preflight = yield* skillManagerService.preflightSkillsFromGit(
            developSkillsConfig.gitUrl,
            developSkillsConfig.skills,
          );
          if (!preflight.ok) {
            const missingText =
              preflight.missingSkills && preflight.missingSkills.length > 0
                ? `\n缺失路径: ${preflight.missingSkills.join(", ")}`
                : "";
            result.success = false;
            result.errors.push({
              file: "develop-skills-preflight",
              error:
                `develop_skills 预检失败（${preflight.category}）。` +
                `${preflight.message ? `\n原因: ${preflight.message}` : ""}` +
                missingText +
                "\n建议: 1) 修正 gitUrl/路径后重试（skills 支持名称或仓库相对路径，例如 zx-fe-skills/zx-h5-develop-experience）" +
                " 2) 或将 skills 手动放入 .claude/skills/<name>/SKILL.md 并移除 gitUrl 使用本地模式。",
            });
            return result;
          }
        } else {
          const localResolve = yield* resolveLocalDevelopSkills(
            projectPath,
            developSkillsConfig.skills,
          );
          if (localResolve.missing.length > 0) {
            result.success = false;
            result.errors.push({
              file: "develop-skills-preflight",
              error:
                `develop_skills 本地预检失败，以下 skills 未找到: ${localResolve.missing.join(", ")}。` +
                "\n请补充 gitUrl 以自动安装，或先将对应 skills 放入 .claude/skills/<name>/SKILL.md 后重试。",
            });
            return result;
          }
          preResolvedLocalDevelopSkills = localResolve.resolved;
        }
      }

      // ================================================================
      // 阶段 1: 确保 CLI 已安装（自动安装）
      // ================================================================
      const envStatus = yield* environmentService.checkEnvironment(projectId);

      if (!envStatus.cliInstalled || envStatus.cliInstallType === "npx") {
        // 自动安装 CLI
        // 注意：npx 检测通过不代表能稳定执行 openspec init（嵌套 npx 可能静默失败），
        // 因此 npx-only 时也需要全局安装
        console.log(
          envStatus.cliInstallType === "npx"
            ? "[SpecForge] OpenSpec CLI 仅通过 npx 可用，正在全局安装以确保稳定性..."
            : "[SpecForge] OpenSpec CLI 未安装，正在自动安装 @fission-ai/openspec@1.2.0...",
        );
        const globalInstallResult = yield* environmentService.installCliGlobal({
          initialize: false,
        });

        if (!globalInstallResult.success) {
          // Windows 企业环境常见无全局安装权限，回退项目内安装以提升兼容性
          console.warn(
            `[SpecForge] 全局安装失败，尝试项目内安装。原因: ${globalInstallResult.error ?? "未知错误"}`,
          );
          const projectInstallResult =
            yield* environmentService.installCliProject(projectId, {
              initialize: false,
            });
          if (!projectInstallResult.success) {
            result.success = false;
            result.errors.push({
              file: "openspec-cli-install",
              error:
                `自动安装 OpenSpec CLI 失败。` +
                `全局安装错误: ${globalInstallResult.error ?? "未知错误"}；` +
                `项目内安装错误: ${projectInstallResult.error ?? "未知错误"}。` +
                `请手动执行 npm install -g @fission-ai/openspec@1.2.0 或 npm install --save-dev @fission-ai/openspec@1.2.0`,
            });
            return result;
          }
          console.log("[SpecForge] OpenSpec CLI 项目内安装成功");
        } else {
          console.log("[SpecForge] OpenSpec CLI 安装成功");
        }
      }

      // ================================================================
      // 阶段 2: 执行 openspec init
      // ================================================================
      try {
        const initResult =
          yield* environmentService.initializeOpenspec(projectId);

        if (!initResult.success) {
          result.success = false;
          result.errors.push({
            file: "openspec-init",
            error:
              initResult.error || "执行 openspec init 失败，请检查项目配置。",
          });
          return result;
        }

        result.created.push(
          "openspec/config.yaml (by openspec init)",
          "openspec/specs/ (by openspec init)",
          "openspec/changes/ (by openspec init)",
          ".claude/skills/openspec-* (by openspec init)",
        );

        // 防御性校验：验证 openspec init 是否真正创建了 config.yaml
        const configCreatedCheck = yield* fs.exists(
          path.join(projectPath, "openspec", "config.yaml"),
        );
        if (!configCreatedCheck) {
          result.success = false;
          result.errors.push({
            file: "openspec-init-verify",
            error:
              "openspec init 报告成功但 config.yaml 未创建。" +
              "这可能是因为 openspec CLI 未正确安装。" +
              "请尝试手动执行: npm install -g @fission-ai/openspec@1.2.0",
          });
          return result;
        }
      } catch (error) {
        result.success = false;
        result.errors.push({
          file: "openspec-init",
          error: `执行 openspec init 时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        });
        return result;
      }

      // ================================================================
      // 阶段 2.5: GitNexus 安装与索引建立（非阻断性）
      // ================================================================
      try {
        console.log("[SpecForge] 正在全局安装 GitNexus CLI...");
        yield* eventBus.emit("initializationProgress", {
          message: "正在全局安装 GitNexus CLI...",
          stage: "loading",
        });
        const gitNexusInstallResult =
          yield* environmentService.installGitNexusGlobal();

        if (gitNexusInstallResult.success) {
          console.log("[SpecForge] GitNexus CLI 安装成功，正在建立仓库索引...");
          yield* eventBus.emit("initializationProgress", {
            message: "GitNexus CLI 安装成功，正在建立仓库索引...",
            stage: "loading",
          });
          const gitNexusAnalyzeResult =
            yield* environmentService.runGitNexusAnalyze(projectId);

          if (gitNexusAnalyzeResult.success) {
            console.log("[SpecForge] GitNexus 仓库索引建立成功");
            yield* eventBus.emit("initializationProgress", {
              message: "GitNexus 仓库索引建立成功",
              stage: "loading",
            });
          } else {
            console.warn(
              `[SpecForge] GitNexus 仓库索引建立失败: ${gitNexusAnalyzeResult.error}`,
            );
            result.warnings.push({
              file: "gitnexus-analyze",
              message:
                gitNexusAnalyzeResult.error ?? "gitnexus analyze 执行失败",
            });
          }
        } else {
          console.warn(
            `[SpecForge] GitNexus CLI 安装失败: ${gitNexusInstallResult.error}`,
          );
          result.warnings.push({
            file: "gitnexus-install",
            message:
              gitNexusInstallResult.error ??
              "npm install -g gitnexus@latest 执行失败",
          });
        }
      } catch (error) {
        console.warn(
          "[SpecForge] GitNexus 安装/索引过程出现异常:",
          error instanceof Error ? error.message : String(error),
        );
        result.warnings.push({
          file: "gitnexus",
          message: `GitNexus 安装/索引异常: ${error instanceof Error ? error.message : String(error)}`,
        });
      }

      // ================================================================
      // 阶段 3: 从 Git 安装 develop_skills（在 generateTemplateVariables 之前）
      // ================================================================
      let installedDevelopSkills: Array<{
        name: string;
        description: string;
      }> = [];

      if (developSkillsConfig && developSkillsConfig.skills.length > 0) {
        if (developSkillsConfig.gitUrl) {
          console.log(
            `[SpecForge] 正在从 ${developSkillsConfig.gitUrl} 安装 Skills...`,
          );
          installedDevelopSkills =
            yield* skillManagerService.installSkillsFromGit(
              projectPath,
              developSkillsConfig.gitUrl,
              developSkillsConfig.skills,
            );

          const hasWildcardPath = developSkillsConfig.skills.some((skillPath) =>
            skillPath.trim().endsWith("/*"),
          );
          const installedNames = new Set(
            installedDevelopSkills.map((s) => s.name.trim()),
          );
          const expectedNames = hasWildcardPath
            ? []
            : developSkillsConfig.skills
                .map((skillPath) => path.basename(skillPath.trim()))
                .filter((name) => name.length > 0);
          const missingSkills = expectedNames.filter(
            (expected) => !installedNames.has(expected),
          );

          if (installedDevelopSkills.length > 0 && missingSkills.length === 0) {
            result.created.push(
              ...installedDevelopSkills.map(
                (s) => `.claude/skills/${s.name} (from git)`,
              ),
            );
            console.log(
              `[SpecForge] 成功安装 ${installedDevelopSkills.length} 个 Skills: ${installedDevelopSkills.map((s) => s.name).join(", ")}`,
            );
          } else {
            const missingText =
              missingSkills.length > 0
                ? `\n  4. 未安装到的 skills: ${missingSkills.join(", ")}`
                : "";
            result.success = false;
            result.errors.push({
              file: "develop-skills",
              error:
                `从 Git 仓库安装 develop_skills 失败或不完整。请检查：\n` +
                `  1. Git URL 是否可访问: ${developSkillsConfig.gitUrl}\n` +
                `  2. skills 路径是否正确: ${developSkillsConfig.skills.join(", ")}\n` +
                `  3. 仓库中对应目录是否包含 SKILL.md 文件` +
                missingText,
            });
            return result;
          }
        } else {
          // 无 gitUrl：复用前置预检结果（避免重复扫描和行为分叉）
          installedDevelopSkills = preResolvedLocalDevelopSkills;
        }
      }

      // ================================================================
      // 阶段 4: 生成模板变量（此时 git skills 已安装到位）
      // ================================================================
      const variables = yield* profileConfigService.generateTemplateVariables(
        profile,
        projectPath,
        installedDevelopSkills,
      );

      // 3. 备份当前 config.yaml 为 config.origin.yaml（每次初始化都更新备份）
      try {
        const configPath = path.join(projectPath, "openspec", "config.yaml");
        const originConfigPath = path.join(
          projectPath,
          "openspec",
          "config.origin.yaml",
        );

        const configExists = yield* fs.exists(configPath);
        if (configExists) {
          const originalContent = yield* fs.readFileString(configPath);
          const originExists = yield* fs.exists(originConfigPath);
          // 添加说明注释到备份文件开头
          const backupHeader = `# ============================================================================
# OpenSpec 标准配置备份文件
# ============================================================================
#
# 这是由 SpecForge 在执行初始化/重初始化前自动创建的备份文件
#
# 用途：
#   - 对比查看 OpenSpec 原始配置和 SpecForge 的增强修改
#   - 了解 SpecForge 在标准配置基础上做了哪些调整
#   - 如需回退到标准配置，可以将此文件内容复制到 config.yaml
#
# 创建时间：${new Date().toISOString()}
# 场景：${scenario}
#
# ============================================================================

`;
          const backupContent = backupHeader + originalContent;
          yield* fs.writeFileString(originConfigPath, backupContent);

          if (originExists) {
            result.updated.push(
              "openspec/config.origin.yaml (backup refreshed)",
            );
          } else {
            result.created.push(
              "openspec/config.origin.yaml (backup of original config)",
            );
          }
        }
      } catch (error) {
        // 备份失败不应该中断整个流程，只记录警告
        console.warn(
          "备份 config.yaml 失败:",
          error instanceof Error ? error.message : String(error),
        );
      }

      try {
        // 1. 注入 openspec 目录
        if (scenario === "S1_NEW") {
          // S1_NEW 场景: 已执行 openspec init，只注入增强配置
          const enhancementResult = yield* injectOpenspecEnhancements(
            projectPath,
            variables,
          );
          result.created.push(...enhancementResult.created);
          result.updated.push(...enhancementResult.updated);
          result.errors.push(
            ...enhancementResult.errors.map((e) => ({
              file: "openspec-enhancements",
              error: e,
            })),
          );
        } else {
          // 其他场景: 完整注入 openspec 目录
          const openspecResult = yield* injectOpenspecDir(
            projectPath,
            variables,
            { scenario },
          );
          result.created.push(...openspecResult.created);
          result.skipped.push(...openspecResult.skipped);
          result.errors.push(
            ...openspecResult.errors.map((e) => ({
              file: "openspec",
              error: e,
            })),
          );

          // S2/S4 场景会保留用户 config.yaml，需要强制合并为 specforge-enhanced
          // S6 场景且 config.yaml 已损坏时，同样需要修复（尝试合并，失败则从模板重建）
          if (
            scenario === "S2_OPENSPEC_ONLY" ||
            scenario === "S4_BOTH_NON_SPECFORGE" ||
            (scenario === "S6_PARTIAL" && options.isConfigCorrupted === true)
          ) {
            try {
              yield* mergeConfigYaml(projectPath, variables);
              result.updated.push("openspec/config.yaml");
            } catch (mergeError) {
              if (
                scenario === "S6_PARTIAL" &&
                options.isConfigCorrupted === true
              ) {
                // 用户的 config.yaml 已损坏无法合并，从模板直接重建
                try {
                  const templateBasePath = yield* getTemplateBasePath;
                  const templateConfigPath = path.join(
                    templateBasePath,
                    "openspec",
                    "config.yaml",
                  );
                  let templateContent =
                    yield* fs.readFileString(templateConfigPath);
                  for (const [key, value] of Object.entries(variables)) {
                    if (value !== undefined) {
                      templateContent = templateContent.replaceAll(
                        `{{${key}}}`,
                        value,
                      );
                    }
                  }
                  const configPath = path.join(
                    projectPath,
                    "openspec",
                    "config.yaml",
                  );
                  yield* fs.writeFileString(configPath, templateContent);
                  result.updated.push(
                    "openspec/config.yaml (rebuilt from template)",
                  );
                } catch (rebuildError) {
                  result.errors.push({
                    file: "openspec-config",
                    error: `config.yaml 重建失败: ${rebuildError instanceof Error ? rebuildError.message : String(rebuildError)}`,
                  });
                }
              } else {
                result.errors.push({
                  file: "openspec-config",
                  error:
                    mergeError instanceof Error
                      ? mergeError.message
                      : String(mergeError),
                });
              }
            }
          }
        }

        // 2. 注入 .claude 目录
        if (scenario === "S1_NEW") {
          // S1_NEW 场景: 已执行 openspec init，只注入增强配置
          const claudeResult = yield* injectClaudeEnhancements(
            projectPath,
            variables,
            { includeQueryingInfraSkill },
          );
          result.created.push(...claudeResult.created);
          result.skipped.push(...claudeResult.skipped);
          result.errors.push(
            ...claudeResult.errors.map((e) => ({
              file: ".claude-enhancements",
              error: e,
            })),
          );
        } else {
          // 其他场景: 完整注入 .claude 目录
          const claudeResult = yield* injectClaudeDir(projectPath, variables, {
            includeQueryingInfraSkill,
          });
          result.created.push(...claudeResult.created);
          result.skipped.push(...claudeResult.skipped);
          result.errors.push(
            ...claudeResult.errors.map((e) => ({
              file: ".claude",
              error: e,
            })),
          );
        }

        // 2.5 托管能力开关对齐：移除当前配置中禁用的托管技能
        const removedManagedSkills = yield* removeDisabledManagedSkills(
          projectPath,
          { includeQueryingInfraSkill },
        );
        if (removedManagedSkills.length > 0) {
          result.updated.push(
            ...removedManagedSkills.map((s) => `${s} (removed by profile)`),
          );
        }

        // 2.6 对账清理（仅在 force 时执行）：删除模板已移除或废弃的托管文件
        if (force) {
          const activeManagedSkills = getManagedSkills(
            includeQueryingInfraSkill,
          );
          const reconciledSkills = yield* reconcileManagedSkills(
            projectPath,
            activeManagedSkills,
          );
          const reconciledAgents = yield* reconcileManagedAgents(projectPath);
          const reconciledOpenspec =
            yield* reconcileManagedOpenspecFiles(projectPath);
          result.removed.push(
            ...reconciledSkills,
            ...reconciledAgents,
            ...reconciledOpenspec,
          );
        }

        // 3. 注入 specforge 标记
        yield* injectSpecforgeMarker(projectPath, profile.displayName);

        // 4. 合并 .mcp.json
        yield* mergeMcpConfig(projectPath, profile);

        // 5. 保存 profile 配置到项目
        yield* profileConfigService.saveProjectProfileConfig(
          projectId,
          profile,
        );

        result.success = result.errors.length === 0;
      } catch (error) {
        result.success = false;
        result.errors.push({
          file: "unknown",
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return result;
    });

  return {
    injectTemplates,
    mergeMcpConfig,
    mergeConfigYaml,
    injectOpenspecEnhancements,
    injectClaudeEnhancements,
    injectSpecforgeMarker,
  };
});

// ============================================================================
// Service Export
// ============================================================================

export type ITemplateInjectionService = InferEffect<typeof LayerImpl>;

export class TemplateInjectionService extends Context.Tag(
  "TemplateInjectionService",
)<TemplateInjectionService, ITemplateInjectionService>() {
  static Live = Layer.effect(this, LayerImpl);
}
