import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import YAML from "yaml";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  OpenSpecEnvironmentService,
  type ScenarioType,
} from "./OpenSpecEnvironmentService";
import { type Profile, ProfileConfigService } from "./ProfileConfigService";
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
// Types
// ============================================================================

export interface InjectionResult {
  success: boolean;
  created: string[];
  skipped: string[];
  updated: string[];
  errors: Array<{ file: string; error: string }>;
}

export interface InjectionOptions {
  /** 场景类型（决定注入策略） */
  scenario: ScenarioType;
  /** Profile 配置 */
  profile: Profile;
  /** 是否跳过已存在的用户文件 */
  skipUserFiles?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * SpecForge 管理的 Skills（可覆盖更新）
 */
const SPECFORGE_MANAGED_SKILLS = [
  "design-generation",
  "querying-infra-catalog",
  "task-planning",
  "ast-grep",
  "zx-h5-develop-experience",
];

/**
 * 获取 Viewer 内置模板路径
 * 注意：这里假设模板位于项目的 template-to-project 目录
 */
const getTemplateBasePath = (): string => {
  // 在实际部署中，这个路径需要根据运行环境动态确定
  // 开发环境可能是相对路径，生产环境可能是绝对路径
  return path.join(process.cwd(), "template-to-project");
};

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;
  const templateProcessor = yield* TemplateProcessor;
  const profileConfigService = yield* ProfileConfigService;
  const environmentService = yield* OpenSpecEnvironmentService;

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
      const templateDir = path.join(getTemplateBasePath(), "openspec");
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
              { skipExisting: false }, // schemas 可以覆盖
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

      // 处理模板目录
      const processResult = yield* templateProcessor.processTemplateDirectory(
        templateDir,
        targetDir,
        variables,
        {
          skipExisting:
            options.scenario !== "S1_NEW" && options.scenario !== "S6_PARTIAL",
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
      const templateDir = path.join(getTemplateBasePath(), ".claude");
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
            skipExisting: isIncrementalScenario,
            filter: (relativePath) => {
              // 只处理 SpecForge 管理的 skills
              const skillName = relativePath.split("/")[0];
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

      // 处理 agents 目录（只在全新项目时注入）
      if (options.scenario === "S1_NEW") {
        const agentsTemplateDir = path.join(templateDir, "agents");
        const agentsTargetDir = path.join(targetDir, "agents");

        const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
        if (agentsTemplateExists) {
          const agentsResult =
            yield* templateProcessor.processTemplateDirectory(
              agentsTemplateDir,
              agentsTargetDir,
              variables,
              {
                skipExisting: true, // agents 永不覆盖
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
      }

      return result;
    });

  /**
   * 增量合并 .mcp.json
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

      // 从 profile 获取 MCP 服务器配置
      const newServers = profile.infra_catalog.mcp_server_providers || {};
      let addedCount = 0;

      // 只添加不存在的服务器
      for (const [name, config] of Object.entries(newServers)) {
        if (!existingConfig.mcpServers[name]) {
          existingConfig.mcpServers[name] = config;
          addedCount++;
        }
      }

      // 只有有变更时才写入
      if (addedCount > 0 || !exists) {
        yield* fs.writeFileString(
          mcpPath,
          JSON.stringify(existingConfig, null, 2),
        );
      }

      return { addedCount, totalServers: Object.keys(newServers).length };
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
      const templateConfigPath = path.join(
        getTemplateBasePath(),
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
      // biome-ignore lint/suspicious/noExplicitAny: YAML 解析需要 any
      const userConfig = YAML.parse(userConfigContent) as any;

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

      // biome-ignore lint/suspicious/noExplicitAny: YAML 解析需要 any
      const templateConfig = YAML.parse(templateConfigContent) as any;

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
            // 如果用户已有该 artifact 的规则，合并数组
            if (mergedConfig.rules[artifactType]) {
              mergedConfig.rules[artifactType] = [
                ...mergedConfig.rules[artifactType],
                ...templateRules,
              ];
            } else {
              mergedConfig.rules[artifactType] = templateRules;
            }
          } else if (typeof templateRules === "object") {
            // 对象类型，递归合并
            mergedConfig.rules[artifactType] = {
              ...templateRules,
              ...mergedConfig.rules[artifactType],
            };
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
      const schemasTemplateDir = path.join(
        getTemplateBasePath(),
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
              { skipExisting: false }, // schemas 可以覆盖
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

      const templateDir = path.join(getTemplateBasePath(), ".claude");
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
                skipExisting: true, // 不覆盖已存在的 skills
                filter: (relativePath) => {
                  // 只处理 SpecForge 管理的 skills
                  const skillName = relativePath.split("/")[0];
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
                skipExisting: true, // agents 永不覆盖
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
      const { scenario, profile } = options;

      // 生成模板变量
      const variables = profileConfigService.generateTemplateVariables(
        profile,
        projectPath,
      );

      const result: InjectionResult = {
        success: true,
        created: [],
        skipped: [],
        updated: [],
        errors: [],
      };

      // S5 场景不需要注入
      if (scenario === "S5_CONFIGURED") {
        return result;
      }

      // S1_NEW 场景: 先执行 openspec init 创建标准结构
      if (scenario === "S1_NEW") {
        // 检查 CLI 是否安装
        const envStatus = yield* environmentService.checkEnvironment(projectId);

        if (!envStatus.cliInstalled) {
          result.success = false;
          result.errors.push({
            file: "openspec-init",
            error: "OpenSpec CLI 未安装。请先安装 CLI 后再执行初始化操作。",
          });
          return result;
        }

        // 执行 openspec init
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

          // 标记 openspec init 创建的文件
          result.created.push(
            "openspec/config.yaml (by openspec init)",
            "openspec/specs/ (by openspec init)",
            "openspec/changes/ (by openspec init)",
            ".claude/skills/openspec-* (by openspec init)",
          );
        } catch (error) {
          result.success = false;
          result.errors.push({
            file: "openspec-init",
            error: `执行 openspec init 时发生错误: ${error instanceof Error ? error.message : String(error)}`,
          });
          return result;
        }

        // 备份原始 config.yaml 为 config.origin.yaml
        // 这样用户可以查看 OpenSpec 标准配置，对比 SpecForge 的增强修改
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
            yield* fs.writeFileString(originConfigPath, originalContent);

            result.created.push(
              "openspec/config.origin.yaml (backup of original config)",
            );
          }
        } catch (error) {
          // 备份失败不应该中断整个流程，只记录警告
          console.warn(
            "备份 config.yaml 失败:",
            error instanceof Error ? error.message : String(error),
          );
        }
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
