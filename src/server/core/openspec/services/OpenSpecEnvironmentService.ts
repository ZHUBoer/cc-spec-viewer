import { Command, FileSystem, Path } from "@effect/platform";
import { Context, Data, Duration, Effect, Either, Layer } from "effect";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import { CliDetectionService } from "./CliDetectionService";

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

export type ScenarioType =
  | "S1_NEW" // 全新项目
  | "S2_OPENSPEC_ONLY" // 纯 openspec 项目（无 .claude）
  | "S3_CLAUDE_ONLY" // 纯 .claude 项目（无 openspec）
  | "S4_BOTH_NON_SPECFORGE" // 两者都有但非 specforge
  | "S5_CONFIGURED" // 已完整配置 specforge
  | "S6_PARTIAL"; // 部分 specforge 配置

export type RecommendedAction =
  | "full_init" // 完整初始化
  | "incremental_inject" // 增量注入
  | "reconfigure" // 重新配置
  | "repair" // 修复缺失
  | "none"; // 无需操作

export interface SpecforgeConfig {
  version: string;
  profile: string;
  initializedAt: string;
}

export interface EnvironmentStatus {
  // CLI 状态
  cliInstalled: boolean;
  cliVersion?: string;
  cliInstallType?: "global" | "project" | "npx";

  // 场景识别
  scenario: ScenarioType;
  scenarioDescription: string;

  // 目录状态
  hasOpenspecDir: boolean;
  hasClaudeDir: boolean;
  hasSpecforgeMarker: boolean;
  specforgeConfig: SpecforgeConfig | null; // 明确使用 null 而不是 optional

  // 配置验证
  isConfigCorrupted: boolean; // 配置是否损坏
  configErrors: string[]; // 配置错误列表

  // 缺失项分析
  missingSpecforgeSkills: string[];
  missingMcpServers: string[];

  // 推荐操作
  recommendedAction: RecommendedAction;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * SpecForge 必需的 Skills 列表
 */
const SPECFORGE_REQUIRED_SKILLS = [
  "design-generation",
  "querying-infra-catalog",
  "task-planning",
] as const;

/**
 * 场景描述映射
 */
const SCENARIO_DESCRIPTIONS: Record<ScenarioType, string> = {
  S1_NEW: "全新项目，需要完整初始化 SpecForge 配置",
  S2_OPENSPEC_ONLY: "已有 openspec 目录，需要增量注入 .claude 配置",
  S3_CLAUDE_ONLY: "已有 .claude 目录，需要增量注入 openspec 配置和 skills",
  S4_BOTH_NON_SPECFORGE:
    "已有 openspec 和 .claude 目录，需要注入 SpecForge skills",
  S5_CONFIGURED: "SpecForge 配置完整，可正常使用",
  S6_PARTIAL: "SpecForge 配置不完整，需要修复缺失部分",
};

/**
 * 场景对应的推荐操作
 */
const SCENARIO_ACTIONS: Record<ScenarioType, RecommendedAction> = {
  S1_NEW: "full_init",
  S2_OPENSPEC_ONLY: "incremental_inject",
  S3_CLAUDE_ONLY: "incremental_inject",
  S4_BOTH_NON_SPECFORGE: "incremental_inject",
  S5_CONFIGURED: "none",
  S6_PARTIAL: "repair",
};

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const cliDetection = yield* CliDetectionService;

  /**
   * 解析 specforge 标记
   */
  const parseSpecforgeMarker = (
    content: string,
  ): SpecforgeConfig | undefined => {
    const markerMatch = content.match(
      /_specforge:\s*\n\s*version:\s*["']?([^"'\n]+)["']?\s*\n\s*profile:\s*["']?([^"'\n]+)["']?\s*\n\s*initialized_at:\s*["']?([^"'\n]+)["']?/,
    );
    if (markerMatch?.[1] && markerMatch[2] && markerMatch[3]) {
      return {
        version: markerMatch[1],
        profile: markerMatch[2],
        initializedAt: markerMatch[3],
      };
    }
    return undefined;
  };

  /**
   * 检查 specforge 标记是否存在
   */
  const hasSpecforgeMarker = (projectPath: string) =>
    Effect.gen(function* () {
      const configPath = path.join(projectPath, "openspec", "config.yaml");
      const exists = yield* fs.exists(configPath);
      if (!exists) return false;

      const content = yield* fs.readFileString(configPath);
      return content.includes("_specforge:");
    });

  /**
   * 获取 specforge 配置
   */
  const getSpecforgeConfig = (projectPath: string) =>
    Effect.gen(function* () {
      const configPath = path.join(projectPath, "openspec", "config.yaml");
      const exists = yield* fs.exists(configPath);
      if (!exists) return undefined;

      const content = yield* fs.readFileString(configPath);
      return parseSpecforgeMarker(content);
    });

  /**
   * 检查缺失的 specforge skills
   */
  const getMissingSkills = (projectPath: string) =>
    Effect.gen(function* () {
      const skillsDir = path.join(projectPath, ".claude", "skills");
      const missing: string[] = [];

      for (const skill of SPECFORGE_REQUIRED_SKILLS) {
        const skillPath = path.join(skillsDir, skill);
        const exists = yield* fs.exists(skillPath);
        if (!exists) {
          missing.push(skill);
        }
      }

      return missing;
    });

  /**
   * 验证配置完整性
   * 返回配置错误列表
   */
  const validateConfig = (
    hasOpenspecDir: boolean,
    hasClaudeDir: boolean,
    hasMarker: boolean,
    specforgeConfig: SpecforgeConfig | undefined,
    missingSkills: string[],
  ): string[] => {
    const errors: string[] = [];

    // 检查 openspec 目录
    if (!hasOpenspecDir) {
      errors.push("缺少 openspec 目录");
    }

    // 检查 .claude 目录
    if (!hasClaudeDir) {
      errors.push("缺少 .claude 目录");
    }

    // 检查 specforge 标记
    if (hasOpenspecDir && !hasMarker) {
      errors.push("openspec/config.yaml 中缺少 _specforge 标记");
    }

    // 检查配置完整性
    if (hasMarker && !specforgeConfig) {
      errors.push("_specforge 标记存在但解析失败（配置格式损坏）");
    }

    // 检查必需的 skills
    if (missingSkills.length > 0) {
      errors.push(`缺少必需的 skills: ${missingSkills.join(", ")}`);
    }

    return errors;
  };

  /**
   * 检查 .mcp.json 中缺失的 MCP 服务器
   * 暂时返回空数组，后续根据 profile 配置扩展
   */
  const getMissingMcpServers = (_projectPath: string) =>
    Effect.succeed([] as string[]);

  /**
   * 识别项目场景
   */
  const identifyScenario = (
    hasOpenspec: boolean,
    hasClaude: boolean,
    hasMarker: boolean,
    missingSkills: string[],
  ): ScenarioType => {
    if (!hasOpenspec && !hasClaude) {
      return "S1_NEW";
    }

    if (hasOpenspec && !hasClaude && !hasMarker) {
      return "S2_OPENSPEC_ONLY";
    }

    if (!hasOpenspec && hasClaude) {
      return "S3_CLAUDE_ONLY";
    }

    if (hasOpenspec && hasClaude && !hasMarker) {
      return "S4_BOTH_NON_SPECFORGE";
    }

    if (hasOpenspec && hasClaude && hasMarker) {
      // 检查是否完整
      const isComplete = missingSkills.length === 0;
      return isComplete ? "S5_CONFIGURED" : "S6_PARTIAL";
    }

    return "S1_NEW";
  };

  /**
   * 检测项目环境状态
   */
  const checkEnvironment = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        const globalCli = yield* cliDetection.checkGlobalCli();
        return {
          cliInstalled: globalCli.installed,
          cliVersion: globalCli.version,
          cliInstallType: globalCli.installed ? globalCli.type : undefined,
          scenario: "S1_NEW" as const,
          scenarioDescription:
            "无法从 Claude 会话中解析项目路径，请先在目标项目目录发起一次 Claude 会话",
          hasOpenspecDir: false,
          hasClaudeDir: false,
          hasSpecforgeMarker: false,
          specforgeConfig: null,
          isConfigCorrupted: true,
          configErrors: [
            "无法解析项目路径（projectPath 为空）。请先在目标项目目录发起一次 Claude 会话后重试。",
          ],
          missingSpecforgeSkills: [...SPECFORGE_REQUIRED_SKILLS],
          missingMcpServers: [],
          recommendedAction: "none" as const,
        } satisfies EnvironmentStatus;
      }

      const projectPath = project.meta.projectPath;

      // 1. 检测 CLI 安装状态（使用 CliDetectionService）
      const [globalCli, projectCli] = yield* Effect.all(
        [
          cliDetection.checkGlobalCli(),
          cliDetection.checkProjectCli(projectPath),
        ],
        { concurrency: "unbounded" },
      );

      // SpecForge 强制要求全局 openspec，项目本地安装仅作信息参考
      const cliInstalled = globalCli.installed;
      const cliVersion = globalCli.version ?? projectCli.version;
      const cliInstallType = globalCli.installed ? globalCli.type : undefined;

      // 2. 检测目录状态
      const openspecDir = path.join(projectPath, "openspec");
      const claudeDir = path.join(projectPath, ".claude");

      const hasOpenspecDir = yield* fs.exists(openspecDir);
      const hasClaudeDir = yield* fs.exists(claudeDir);

      // 3. 检测 specforge 标记
      const hasMarker = hasOpenspecDir
        ? yield* hasSpecforgeMarker(projectPath)
        : false;

      const specforgeConfig = hasMarker
        ? yield* getSpecforgeConfig(projectPath)
        : undefined;

      // 4. 检测缺失项
      const missingSpecforgeSkills = hasClaudeDir
        ? yield* getMissingSkills(projectPath)
        : [...SPECFORGE_REQUIRED_SKILLS];

      const missingMcpServers = yield* getMissingMcpServers(projectPath);

      // 5. 验证配置
      const configErrors = validateConfig(
        hasOpenspecDir,
        hasClaudeDir,
        hasMarker,
        specforgeConfig,
        missingSpecforgeSkills,
      );

      const isConfigCorrupted = configErrors.length > 0;

      // 6. 识别场景
      const scenario = identifyScenario(
        hasOpenspecDir,
        hasClaudeDir,
        hasMarker,
        missingSpecforgeSkills,
      );

      const status: EnvironmentStatus = {
        // CLI 状态
        cliInstalled,
        cliVersion,
        cliInstallType,

        // 场景识别
        scenario,
        scenarioDescription: SCENARIO_DESCRIPTIONS[scenario],

        // 目录状态
        hasOpenspecDir,
        hasClaudeDir,
        hasSpecforgeMarker: hasMarker,
        specforgeConfig: specforgeConfig ?? null, // 确保字段存在（null 而不是 undefined）

        // 配置验证
        isConfigCorrupted,
        configErrors,

        // 缺失项分析
        missingSpecforgeSkills,
        missingMcpServers,

        // 推荐操作
        recommendedAction: SCENARIO_ACTIONS[scenario],
      };

      return status;
    });

  /**
   * 安装 openspec CLI（全局）
   * @param options.initialize 是否在安装后执行初始化
   * @param options.projectPath 初始化的项目路径
   */
  const installCliGlobal = (
    options: { initialize?: boolean; projectPath?: string } = {},
  ) =>
    Effect.gen(function* () {
      // 1. 安装 CLI
      const installCommand = Command.make(
        "npm",
        "install",
        "-g",
        "@fission-ai/openspec@latest",
      );
      const installResult = yield* Effect.either(
        Command.string(installCommand).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isLeft(installResult)) {
        return {
          success: false as const,
          error: `安装失败: ${String(installResult.left)}`,
          initialized: false,
        };
      }

      // 2. 可选：执行初始化
      if (options.initialize && options.projectPath) {
        const initCommand = Command.make(
          "openspec",
          "init",
          "--tools",
          "claude",
          "--force",
        );

        const initCommandWithCwd = Command.workingDirectory(
          initCommand,
          options.projectPath,
        );

        const initResult = yield* Effect.either(
          Command.string(initCommandWithCwd).pipe(
            Effect.timeout(Duration.seconds(60)),
          ),
        );

        if (Either.isLeft(initResult)) {
          return {
            success: false as const,
            error: `初始化失败: ${String(initResult.left)}`,
            initialized: false,
          };
        }
      }

      return {
        success: true as const,
        error: undefined,
        initialized: options.initialize ?? false,
      };
    });

  /**
   * 安装 openspec CLI（项目依赖）
   * @param options.initialize 是否在安装后执行初始化
   */
  const installCliProject = (
    projectId: string,
    options: { initialize?: boolean } = {},
  ) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const projectPath = project.meta.projectPath;

      // 1. 安装 CLI
      const installCommand = Command.make(
        "npm",
        "install",
        "--save-dev",
        "@fission-ai/openspec@latest",
      );

      const installCommandWithCwd = Command.workingDirectory(
        installCommand,
        projectPath,
      );

      const installResult = yield* Effect.either(
        Command.string(installCommandWithCwd).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isLeft(installResult)) {
        return {
          success: false,
          error: `安装失败: ${String(installResult.left)}`,
          initialized: false,
        };
      }

      // 2. 可选：执行初始化
      if (options.initialize) {
        const initCommand = Command.make(
          "npx",
          "openspec",
          "init",
          "--tools",
          "claude",
          "--force",
        );

        const initCommandWithCwd = Command.workingDirectory(
          initCommand,
          projectPath,
        );

        const initResult = yield* Effect.either(
          Command.string(initCommandWithCwd).pipe(
            Effect.timeout(Duration.seconds(60)),
          ),
        );

        if (Either.isLeft(initResult)) {
          return {
            success: false,
            error: `初始化失败: ${String(initResult.left)}`,
            initialized: false,
          };
        }
      }

      return {
        success: true,
        error: undefined,
        initialized: options.initialize ?? false,
      };
    });

  /**
   * 在项目中执行 openspec init
   * 适用于已安装 CLI 的情况
   */
  const initializeOpenspec = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const projectPath = project.meta.projectPath;

      // 尝试使用全局 openspec
      const globalCommand = Command.make(
        "openspec",
        "init",
        "--tools",
        "claude",
        "--force",
      );

      const globalCommandWithCwd = Command.workingDirectory(
        globalCommand,
        projectPath,
      );

      const globalResult = yield* Effect.either(
        Command.string(globalCommandWithCwd).pipe(
          Effect.timeout(Duration.seconds(60)),
        ),
      );

      if (Either.isRight(globalResult)) {
        return {
          success: true,
          error: undefined,
          method: "global" as const,
        };
      }

      // 如果全局命令失败，尝试使用 npx
      const npxCommand = Command.make(
        "npx",
        "openspec",
        "init",
        "--tools",
        "claude",
        "--force",
      );

      const npxCommandWithCwd = Command.workingDirectory(
        npxCommand,
        projectPath,
      );

      const npxResult = yield* Effect.either(
        Command.string(npxCommandWithCwd).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isRight(npxResult)) {
        return {
          success: true,
          error: undefined,
          method: "npx" as const,
        };
      }

      return {
        success: false,
        error: `初始化失败: ${String(npxResult.left)}`,
        method: null,
      };
    });

  return {
    checkEnvironment,
    installCliGlobal,
    installCliProject,
    initializeOpenspec,
  };
});

// ============================================================================
// Service Export
// ============================================================================

export type IOpenSpecEnvironmentService = InferEffect<typeof LayerImpl>;

export class OpenSpecEnvironmentService extends Context.Tag(
  "OpenSpecEnvironmentService",
)<OpenSpecEnvironmentService, IOpenSpecEnvironmentService>() {
  static Live = Layer.effect(this, LayerImpl);
}
