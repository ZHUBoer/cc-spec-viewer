import { Command, FileSystem, Path } from "@effect/platform";
import { Context, Data, Duration, Effect, Either, Layer } from "effect";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import { CliDetectionService } from "./CliDetectionService";
import { extractSpecforgeMarkerBlock } from "./specforgeMarker";

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
  profile: string;
  initializedAt: string;
  templateVersion?: string;
}

interface OpenspecConfigInfo {
  hasMarker: boolean;
  specforgeConfig?: SpecforgeConfig;
  schema?: string;
}

export interface EnvironmentStatus {
  // CLI 状态
  cliInstalled: boolean;
  cliVersion: string | null;
  cliInstallType?: "global" | "project" | "npx";

  // 场景识别
  scenario: ScenarioType;
  scenarioDescription: string;

  // 目录状态
  hasOpenspecDir: boolean;
  hasClaudeDir: boolean;
  hasSpecforgeMarker: boolean;
  specforgeConfig: SpecforgeConfig | null; // 明确使用 null 而不是 optional
  templateUpgradeAvailable: boolean;

  // 配置验证
  isConfigCorrupted: boolean; // 配置是否损坏
  configErrors: string[]; // 配置错误列表

  // 缺失项分析
  missingSpecforgeSkills: string[];
  missingSpecforgeAgents: string[]; // 缺失的框架托管 agent 文件
  missingManagedFiles: string[]; // 缺失的其他托管文件（如 schemas）
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
  "task-planning",
] satisfies ReadonlyArray<string>;

/**
 * SpecForge 框架托管的全量 Skills 列表（用于 S6_PARTIAL 完整性检测）
 */
const SPECFORGE_MANAGED_SKILLS = [
  "task-planning",
  "gitnexus",
  "d2c-baseline",
  "d2c-stitching",
  "spec-process",
  "design-process",
] satisfies ReadonlyArray<string>;

/**
 * SpecForge 框架托管的 agent 文件名（精确匹配）
 */
const SPECFORGE_MANAGED_AGENTS = [
  "format-compliance-agent.md",
  "quality-gate-agent.md",
] as const;

const OPENSPEC_PINNED_VERSION = "1.2.0";
const DEFAULT_TEMPLATE_VERSION = "1.0.0";
const NPM_EXECUTABLE = process.platform === "win32" ? "npm.cmd" : "npm";
const NPX_EXECUTABLE = process.platform === "win32" ? "npx.cmd" : "npx";
const OPENSPEC_EXECUTABLE =
  process.platform === "win32" ? "openspec.cmd" : "openspec";

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

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const joinPathForPlatform = (
  platform: NodeJS.Platform,
  ...parts: string[]
): string => {
  const separator = platform === "win32" ? "\\" : "/";
  const sanitizedParts = parts
    .map((part, index) =>
      index === 0
        ? part.replace(/[\\/]+$/g, "")
        : part.replace(/^[\\/]+|[\\/]+$/g, ""),
    )
    .filter((part) => part.length > 0);
  return sanitizedParts.join(separator);
};

/**
 * 解析 OpenSpec 全局配置基目录（不含 openspec 子目录）
 * - 优先 XDG_CONFIG_HOME（与 OpenSpec 约定一致）
 * - Windows 回退 APPDATA / USERPROFILE\\AppData\\Roaming
 * - 其他平台回退 HOME/.config
 */
export const resolveOpenSpecConfigHome = (options?: {
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
}): string | undefined => {
  // biome-ignore lint/style/noProcessEnv: 需要读取进程环境变量来解析配置目录
  const env = options?.env ?? process.env;
  const platform = options?.platform ?? process.platform;

  const xdgConfigHome = env.XDG_CONFIG_HOME?.trim();
  if (xdgConfigHome) return xdgConfigHome;

  if (platform === "win32") {
    const appData = env.APPDATA?.trim();
    if (appData) return appData;
    const userProfile = env.USERPROFILE?.trim();
    if (userProfile) {
      return joinPathForPlatform(platform, userProfile, "AppData", "Roaming");
    }
  }

  const homeDir = env.HOME?.trim();
  if (homeDir) {
    return joinPathForPlatform(platform, homeDir, ".config");
  }

  return undefined;
};

const OPENSPEC_ALL_WORKFLOWS = [
  "propose",
  "explore",
  "new",
  "continue",
  "apply",
  "ff",
  "sync",
  "archive",
  "bulk-archive",
  "verify",
  "onboard",
] satisfies ReadonlyArray<string>;

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

  const ensureSpecforgeGlobalOpenspecConfig = () =>
    Effect.gen(function* () {
      const configHome = resolveOpenSpecConfigHome();

      if (!configHome) {
        return {
          success: false,
          error:
            "无法定位用户配置目录（XDG_CONFIG_HOME/APPDATA/USERPROFILE/HOME 均为空）",
        };
      }

      const configDir = path.join(configHome, "openspec");
      const configPath = path.join(configDir, "config.json");

      const desiredConfig = {
        profile: "custom",
        delivery: "both",
        workflows: [...OPENSPEC_ALL_WORKFLOWS],
      };

      const dirExists = yield* fs.exists(configDir);
      if (!dirExists) {
        yield* fs.makeDirectory(configDir, { recursive: true });
      }

      let mergedConfig: Record<string, unknown> = desiredConfig;
      const fileExists = yield* fs.exists(configPath);
      if (fileExists) {
        const existingRaw = yield* fs.readFileString(configPath);
        try {
          const parsed: unknown = JSON.parse(existingRaw);
          if (isRecord(parsed)) {
            mergedConfig = {
              ...parsed,
              ...desiredConfig,
            };
          }
        } catch {
          // 配置文件损坏时直接用期望配置覆盖，保证后续 init 稳定执行
          mergedConfig = desiredConfig;
        }
      }

      yield* fs.writeFileString(
        configPath,
        `${JSON.stringify(mergedConfig, null, 2)}\n`,
      );

      return {
        success: true,
        error: undefined,
      };
    });

  const getTemplateBasePath = Effect.gen(function* () {
    const distPath = path.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path.join(process.cwd(), "template-to-project");
  });

  const getLatestTemplateVersion = Effect.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const manifestPath = path.join(templateBasePath, "template-manifest.json");
    const exists = yield* fs.exists(manifestPath);
    if (!exists) return DEFAULT_TEMPLATE_VERSION;

    const raw = yield* fs.readFileString(manifestPath);
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
   * 解析 specforge 标记
   */
  const parseSpecforgeMarker = (
    content: string,
  ): SpecforgeConfig | undefined => {
    const block = extractSpecforgeMarkerBlock(content);
    if (!block) return undefined;
    const profileMatch = block.match(
      /^\s*profile:\s*["']?([^"'\r\n]+)["']?\s*$/m,
    );
    const initializedAtMatch = block.match(
      /^\s*initialized_at:\s*["']?([^"'\r\n]+)["']?\s*$/m,
    );
    const templateVersionMatch = block.match(
      /^\s*template_version:\s*["']?([^"'\r\n]+)["']?\s*$/m,
    );

    if (!profileMatch?.[1] || !initializedAtMatch?.[1]) return undefined;

    return {
      profile: profileMatch[1].trim(),
      initializedAt: initializedAtMatch[1].trim(),
      templateVersion: templateVersionMatch?.[1]
        ? templateVersionMatch[1].trim()
        : undefined,
    };
  };

  const parseOpenspecConfigInfo = (content: string): OpenspecConfigInfo => {
    const schemaMatch = content.match(/^schema:\s*["']?([^"'\r\n]+)["']?\s*$/m);
    return {
      hasMarker: content.includes("_specforge:"),
      specforgeConfig: parseSpecforgeMarker(content),
      schema: schemaMatch?.[1] ? schemaMatch[1].trim() : undefined,
    };
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

  const getOpenspecSchema = (projectPath: string) =>
    Effect.gen(function* () {
      const configPath = path.join(projectPath, "openspec", "config.yaml");
      const exists = yield* fs.exists(configPath);
      if (!exists) return undefined;
      const content = yield* fs.readFileString(configPath);
      return parseOpenspecConfigInfo(content).schema;
    });

  /**
   * 检查缺失的 specforge skills
   */
  const getMissingSkills = (projectPath: string) =>
    Effect.gen(function* () {
      const skillsDir = path.join(projectPath, ".claude", "skills");
      const missing: string[] = [];

      for (const skill of SPECFORGE_MANAGED_SKILLS) {
        const skillPath = path.join(skillsDir, skill);
        const exists = yield* fs.exists(skillPath);
        if (!exists) {
          missing.push(skill);
        }
      }

      return missing;
    });

  /**
   * 检查缺失的框架托管 agent 文件
   */
  const getMissingAgents = (projectPath: string) =>
    Effect.gen(function* () {
      const agentsDir = path.join(projectPath, ".claude", "agents");
      const missing: string[] = [];

      for (const agentFile of SPECFORGE_MANAGED_AGENTS) {
        const filePath = path.join(agentsDir, agentFile);
        const exists = yield* fs.exists(filePath);
        if (!exists) {
          missing.push(agentFile);
        }
      }

      return missing;
    });

  /**
   * 检查缺失的托管文件（openspec/schemas/specforge-enhanced/ 下全部托管文件）
   */
  const getMissingManagedFiles = (projectPath: string) =>
    Effect.gen(function* () {
      const missing: string[] = [];
      const base = path.join(
        projectPath,
        "openspec",
        "schemas",
        "specforge-enhanced",
      );

      for (const file of [
        "schema.yaml",
        "templates/design.md",
        "templates/spec.md",
        "templates/tasks.md",
      ]) {
        const exists = yield* fs.exists(path.join(base, file));
        if (!exists) {
          missing.push(`openspec/schemas/specforge-enhanced/${file}`);
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
    schema: string | undefined,
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

    // SpecForge 项目必须使用 specforge-enhanced schema
    if (hasMarker && schema !== "specforge-enhanced") {
      errors.push(
        `openspec/config.yaml 的 schema 必须是 specforge-enhanced（当前: ${schema ?? "未设置"}）`,
      );
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
    Effect.succeed<string[]>([]);

  /**
   * 识别项目场景
   */
  const identifyScenario = (
    hasOpenspec: boolean,
    hasClaude: boolean,
    hasMarker: boolean,
    missingSkills: string[],
    missingAgents: string[],
    missingManagedFiles: string[],
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
      // 缺失任一托管项均标记为 S6_PARTIAL
      const isComplete =
        missingSkills.length === 0 &&
        missingAgents.length === 0 &&
        missingManagedFiles.length === 0;
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
          cliVersion: globalCli.version ?? null,
          cliInstallType: globalCli.installed ? globalCli.type : undefined,
          scenario: "S1_NEW",
          scenarioDescription:
            "无法从 Claude 会话中解析项目路径，请先在目标项目目录发起一次 Claude 会话",
          hasOpenspecDir: false,
          hasClaudeDir: false,
          hasSpecforgeMarker: false,
          specforgeConfig: null,
          templateUpgradeAvailable: false,
          isConfigCorrupted: true,
          configErrors: [
            "无法解析项目路径（projectPath 为空）。请先在目标项目目录发起一次 Claude 会话后重试。",
          ],
          missingSpecforgeSkills: [...SPECFORGE_REQUIRED_SKILLS],
          missingSpecforgeAgents: [],
          missingManagedFiles: [],
          missingMcpServers: [],
          recommendedAction: "none",
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
      const cliVersion = globalCli.version ?? projectCli.version ?? null;
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
      const openspecSchema = hasOpenspecDir
        ? yield* getOpenspecSchema(projectPath)
        : undefined;

      // 4. 检测缺失项
      const missingSpecforgeSkills = hasClaudeDir
        ? yield* getMissingSkills(projectPath)
        : [...SPECFORGE_MANAGED_SKILLS];

      const missingSpecforgeAgents = hasClaudeDir
        ? yield* getMissingAgents(projectPath)
        : [...SPECFORGE_MANAGED_AGENTS];

      const missingManagedFiles = yield* getMissingManagedFiles(projectPath);

      const missingMcpServers = yield* getMissingMcpServers(projectPath);
      // 5. 验证配置
      const configErrors = validateConfig(
        hasOpenspecDir,
        hasClaudeDir,
        hasMarker,
        specforgeConfig,
        openspecSchema,
        missingSpecforgeSkills,
      );

      const isConfigCorrupted = configErrors.length > 0;
      const latestTemplateVersion = yield* getLatestTemplateVersion;
      const templateUpgradeAvailable =
        hasMarker &&
        !!specforgeConfig &&
        !isConfigCorrupted &&
        (specforgeConfig.templateVersion === undefined ||
          specforgeConfig.templateVersion !== latestTemplateVersion);

      // 6. 识别场景
      const scenario = identifyScenario(
        hasOpenspecDir,
        hasClaudeDir,
        hasMarker,
        missingSpecforgeSkills,
        missingSpecforgeAgents,
        missingManagedFiles,
      );
      const normalizedScenario =
        scenario === "S5_CONFIGURED" && isConfigCorrupted
          ? "S6_PARTIAL"
          : scenario;

      const status: EnvironmentStatus = {
        // CLI 状态
        cliInstalled,
        cliVersion,
        cliInstallType,

        // 场景识别
        scenario: normalizedScenario,
        scenarioDescription: SCENARIO_DESCRIPTIONS[normalizedScenario],

        // 目录状态
        hasOpenspecDir,
        hasClaudeDir,
        hasSpecforgeMarker: hasMarker,
        specforgeConfig: specforgeConfig ?? null, // 确保字段存在（null 而不是 undefined）
        templateUpgradeAvailable,

        // 配置验证
        isConfigCorrupted,
        configErrors,

        // 缺失项分析
        missingSpecforgeSkills,
        missingSpecforgeAgents,
        missingManagedFiles,
        missingMcpServers,

        // 推荐操作
        recommendedAction: SCENARIO_ACTIONS[normalizedScenario],
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
        NPM_EXECUTABLE,
        "install",
        "-g",
        `@fission-ai/openspec@${OPENSPEC_PINNED_VERSION}`,
      );
      const installResult = yield* Effect.either(
        Command.string(installCommand.pipe(Command.runInShell(true))).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isLeft(installResult)) {
        return {
          success: false,
          error: `安装失败: ${formatUnknownError(installResult.left)}`,
          initialized: false,
        };
      }

      // 2. 可选：执行初始化
      if (options.initialize && options.projectPath) {
        const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
        if (!configSetupResult.success) {
          return {
            success: false,
            error: `写入 OpenSpec 全局配置失败: ${configSetupResult.error}`,
            initialized: false,
          };
        }

        const initCommand = Command.make(
          OPENSPEC_EXECUTABLE,
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
          Command.string(
            initCommandWithCwd.pipe(Command.runInShell(true)),
          ).pipe(Effect.timeout(Duration.seconds(60))),
        );

        if (Either.isLeft(initResult)) {
          return {
            success: false,
            error: `初始化失败: ${formatUnknownError(initResult.left)}`,
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
        NPM_EXECUTABLE,
        "install",
        "--save-dev",
        `@fission-ai/openspec@${OPENSPEC_PINNED_VERSION}`,
      );

      const installCommandWithCwd = Command.workingDirectory(
        installCommand,
        projectPath,
      );

      const installResult = yield* Effect.either(
        Command.string(
          installCommandWithCwd.pipe(Command.runInShell(true)),
        ).pipe(Effect.timeout(Duration.seconds(120))),
      );

      if (Either.isLeft(installResult)) {
        return {
          success: false,
          error: `安装失败: ${formatUnknownError(installResult.left)}`,
          initialized: false,
        };
      }

      // 2. 可选：执行初始化
      if (options.initialize) {
        const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
        if (!configSetupResult.success) {
          return {
            success: false,
            error: `写入 OpenSpec 全局配置失败: ${configSetupResult.error}`,
            initialized: false,
          };
        }

        const initCommand = Command.make(
          NPX_EXECUTABLE,
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
          Command.string(
            initCommandWithCwd.pipe(Command.runInShell(true)),
          ).pipe(Effect.timeout(Duration.seconds(60))),
        );

        if (Either.isLeft(initResult)) {
          return {
            success: false,
            error: `初始化失败: ${formatUnknownError(initResult.left)}`,
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

      const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
      if (!configSetupResult.success) {
        return {
          success: false,
          error: `写入 OpenSpec 全局配置失败: ${configSetupResult.error}`,
          method: null,
        };
      }

      // 尝试使用全局 openspec
      const globalCommand = Command.make(
        OPENSPEC_EXECUTABLE,
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
        Command.string(
          globalCommandWithCwd.pipe(Command.runInShell(true)),
        ).pipe(Effect.timeout(Duration.seconds(60))),
      );

      if (Either.isRight(globalResult)) {
        return {
          success: true,
          error: undefined,
          method: "global",
        };
      }

      // 如果全局命令失败，尝试使用 npx
      const npxCommand = Command.make(
        NPX_EXECUTABLE,
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
        Command.string(npxCommandWithCwd.pipe(Command.runInShell(true))).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isRight(npxResult)) {
        return {
          success: true,
          error: undefined,
          method: "npx",
        };
      }

      return {
        success: false,
        error: `初始化失败: ${formatUnknownError(npxResult.left)}`,
        method: null,
      };
    });

  /**
   * 全局安装 GitNexus CLI（npm install -g gitnexus@latest）
   */
  const installGitNexusGlobal = () =>
    Effect.gen(function* () {
      const installCommand = Command.make(
        NPM_EXECUTABLE,
        "install",
        "-g",
        "gitnexus@latest",
      );
      const installResult = yield* Effect.either(
        Command.string(installCommand.pipe(Command.runInShell(true))).pipe(
          Effect.timeout(Duration.seconds(120)),
        ),
      );

      if (Either.isLeft(installResult)) {
        return {
          success: false,
          error: `GitNexus 安装失败: ${formatUnknownError(installResult.left)}`,
        };
      }

      return { success: true, error: undefined };
    });

  /**
   * 在项目目录执行 gitnexus analyze 建立索引
   */
  const runGitNexusAnalyze = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return {
          success: false,
          error: "gitnexus analyze 跳过: 无法解析项目路径",
        };
      }

      const projectPath = project.meta.projectPath;
      const gitnexusExecutable =
        process.platform === "win32" ? "gitnexus.cmd" : "gitnexus";

      const analyzeCommand = Command.make(gitnexusExecutable, "analyze");
      const analyzeCommandWithCwd = Command.workingDirectory(
        analyzeCommand,
        projectPath,
      );

      const analyzeResult = yield* Effect.either(
        Command.string(
          analyzeCommandWithCwd.pipe(Command.runInShell(true)),
        ).pipe(Effect.timeout(Duration.seconds(120))),
      );

      if (Either.isLeft(analyzeResult)) {
        return {
          success: false,
          error: `gitnexus analyze 执行失败: ${formatUnknownError(analyzeResult.left)}`,
        };
      }

      return { success: true, error: undefined };
    });

  return {
    checkEnvironment,
    installCliGlobal,
    installCliProject,
    initializeOpenspec,
    installGitNexusGlobal,
    runGitNexusAnalyze,
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
