import { FileSystem, Path } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import YAML from "yaml";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  OpenSpecEnvironmentService,
  type ScenarioType,
} from "./OpenSpecEnvironmentService";
import { type Profile, ProfileConfigService } from "./ProfileConfigService";
import { SkillManagerService } from "./SkillManagerService";
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

// ============================================================================
// Types
// ============================================================================

export interface InjectionResult {
  success: boolean;
  created: string[];
  skipped: string[];
  updated: string[];
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
}

// ============================================================================
// Constants
// ============================================================================

/**
 * SpecForge 框架内置的 Skills（可覆盖更新）
 * 注意：此处仅包含框架内置 skills，业务 skills（通过 git 动态安装）不应出现在这里
 */
const SPECFORGE_MANAGED_SKILLS = [
  "design-generation",
  "querying-infra-catalog",
  "task-planning",
  "ast-grep",
];

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
   * 生成 specforge 标记块
   */
  const generateSpecforgeMarker = (profile: string): string => {
    return `_specforge:
  version: "1.0.0"
  profile: "${profile}"
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

      if (exists) {
        let content = yield* fs.readFileString(configPath);

        // 检查是否已有标记
        if (content.includes("_specforge:")) {
          // 更新现有标记
          content = content.replace(
            /_specforge:[\s\S]*?(?=\n[a-zA-Z]|\n$|$)/,
            generateSpecforgeMarker(profileName),
          );
        } else {
          // 在文件开头添加标记
          content = generateSpecforgeMarker(profileName) + content;
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

      // S2/S4 场景: openspec 目录已存在，只需要添加标记
      if (
        options.scenario === "S2_OPENSPEC_ONLY" ||
        options.scenario === "S4_BOTH_NON_SPECFORGE"
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
    options: { scenario: ScenarioType },
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

      // 根据场景决定注入策略
      const isIncrementalScenario =
        options.scenario === "S3_CLAUDE_ONLY" ||
        options.scenario === "S4_BOTH_NON_SPECFORGE";

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

              // 增量场景下，只注入缺失的 SpecForge skills
              if (isIncrementalScenario) {
                return SPECFORGE_MANAGED_SKILLS.includes(skillName);
              }

              return !relativePath.includes(".DS_Store");
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

      // 处理 agents 目录
      // S1_NEW: 全新项目，必须注入
      // S3_CLAUDE_ONLY: 已有 .claude 但可能缺 agents
      // S4_BOTH_NON_SPECFORGE: 已有配置但可能缺 agents
      // 其他场景: 根据是否存在决定是否注入
      const agentsTemplateDir = path.join(templateDir, "agents");
      const agentsTargetDir = path.join(targetDir, "agents");

      const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
      const agentsTargetExists = yield* fs.exists(agentsTargetDir);

      // 只在 agents 目录不存在时注入（避免覆盖用户的 agents 配置）
      if (agentsTemplateExists && !agentsTargetExists) {
        const agentsResult = yield* templateProcessor.processTemplateDirectory(
          agentsTemplateDir,
          agentsTargetDir,
          variables,
          {
            skipExisting: false, // SpecForge agents 可覆盖更新
            filter: (relativePath) => !relativePath.includes(".DS_Store"),
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
      const parsed = JSON.parse(content) as {
        mcpServers?: Record<string, unknown>;
      };
      return parsed.mcpServers ?? {};
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
          existingConfig = JSON.parse(content) as McpConfig;
          existingConfig.mcpServers = existingConfig.mcpServers || {};
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
      const mergedYaml = YAML.stringify(mergedConfig);
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

                  return SPECFORGE_MANAGED_SKILLS.includes(skillName);
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
                filter: (relativePath) => !relativePath.includes(".DS_Store"),
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

      const result: InjectionResult = {
        success: true,
        created: [],
        skipped: [],
        updated: [],
        errors: [],
        warnings: [],
      };

      // S5 场景默认不需要注入，除非 force=true（用于重新初始化更新）
      if (scenario === "S5_CONFIGURED" && !force) {
        return result;
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
            : "[SpecForge] OpenSpec CLI 未安装，正在自动安装 @fission-ai/openspec@latest...",
        );
        const installResult = yield* environmentService.installCliGlobal({
          initialize: false,
        });

        if (!installResult.success) {
          result.success = false;
          result.errors.push({
            file: "openspec-cli-install",
            error: `自动安装 OpenSpec CLI 失败: ${installResult.error ?? "未知错误"}。请手动执行 npm install -g @fission-ai/openspec@latest`,
          });
          return result;
        }

        console.log("[SpecForge] OpenSpec CLI 安装成功");
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
              "请尝试手动执行: npm install -g @fission-ai/openspec@latest",
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
      // 阶段 3: 从 Git 安装 develop_skills（在 generateTemplateVariables 之前）
      // ================================================================
      const developSkillsConfig = profile.infra_catalog.develop_skills;
      let installedDevelopSkills: Array<{
        name: string;
        description: string;
      }> = [];

      if (
        developSkillsConfig?.gitUrl &&
        developSkillsConfig.skills.length > 0
      ) {
        console.log(
          `[SpecForge] 正在从 ${developSkillsConfig.gitUrl} 安装 Skills...`,
        );
        installedDevelopSkills =
          yield* skillManagerService.installSkillsFromGit(
            projectPath,
            developSkillsConfig.gitUrl,
            developSkillsConfig.skills,
          );

        if (installedDevelopSkills.length > 0) {
          result.created.push(
            ...installedDevelopSkills.map(
              (s) => `.claude/skills/${s.name} (from git)`,
            ),
          );
          console.log(
            `[SpecForge] 成功安装 ${installedDevelopSkills.length} 个 Skills: ${installedDevelopSkills.map((s) => s.name).join(", ")}`,
          );
        } else {
          // Git skill 安装失败不阻断流程，降级为警告
          result.warnings.push({
            file: "develop-skills",
            message:
              `从 Git 仓库安装 develop_skills 失败。请检查：\n` +
              `  1. Git URL 是否可访问: ${developSkillsConfig.gitUrl}\n` +
              `  2. skills 路径是否正确: ${developSkillsConfig.skills.join(", ")}\n` +
              `  3. 仓库中对应目录是否包含 SKILL.md 文件`,
          });
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

      // 3. 备份原始 config.yaml 为 config.origin.yaml
      // 只在 config.yaml 不包含 _specforge: 标记时备份（说明是纯 OpenSpec 配置）
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

          // 只在没有 specforge 标记时才备份（避免重复备份）
          if (!originalContent.includes("_specforge:")) {
            // 添加说明注释到备份文件开头
            const backupHeader = `# ============================================================================
# OpenSpec 标准配置备份文件
# ============================================================================
#
# 这是由 SpecForge 在执行 openspec init 后自动创建的备份文件
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
        }

        // 2. 注入 .claude 目录
        if (scenario === "S1_NEW") {
          // S1_NEW 场景: 已执行 openspec init，只注入增强配置
          const claudeResult = yield* injectClaudeEnhancements(
            projectPath,
            variables,
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
            scenario,
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
