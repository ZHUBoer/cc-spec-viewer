import { execSync } from "node:child_process";
import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";

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
  specforgeConfig?: SpecforgeConfig;

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

  /**
   * 检测 openspec CLI 安装状态
   */
  const checkCliInstallation = (): {
    installed: boolean;
    version?: string;
    type?: "global" | "project" | "npx";
  } => {
    // 1. 检查全局安装
    try {
      const version = execSync("openspec --version 2>/dev/null", {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      return { installed: true, version, type: "global" };
    } catch {
      // 继续检查其他方式
    }

    // 2. 检查 npx 可用性
    try {
      const version = execSync("npx openspec --version 2>/dev/null", {
        encoding: "utf-8",
        timeout: 10000,
      }).trim();
      return { installed: true, version, type: "npx" };
    } catch {
      // npx 也不可用
    }

    return { installed: false };
  };

  /**
   * 检查项目级 CLI 安装
   */
  const checkProjectCliInstallation = (
    projectPath: string,
  ): { installed: boolean; version?: string } => {
    const cliPath = path.join(projectPath, "node_modules", ".bin", "openspec");
    try {
      const version = execSync(`${cliPath} --version 2>/dev/null`, {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      return { installed: true, version };
    } catch {
      return { installed: false };
    }
  };

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
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const projectPath = project.meta.projectPath;

      // 1. 检测 CLI 安装状态
      const globalCli = checkCliInstallation();
      const projectCli = checkProjectCliInstallation(projectPath);

      const cliInstalled = globalCli.installed || projectCli.installed;
      const cliVersion = globalCli.version || projectCli.version;
      const cliInstallType = projectCli.installed
        ? ("project" as const)
        : globalCli.type;

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

      // 5. 识别场景
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
        specforgeConfig,

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
  ) => {
    try {
      // 1. 安装 CLI
      execSync("npm install -g openspec", {
        encoding: "utf-8",
        timeout: 120000,
        stdio: "pipe",
      });

      // 2. 可选：执行初始化
      if (options.initialize && options.projectPath) {
        execSync("openspec init --tools claude --force", {
          encoding: "utf-8",
          timeout: 60000,
          stdio: "pipe",
          cwd: options.projectPath,
        });
      }

      return Effect.succeed({
        success: true as const,
        error: undefined,
        initialized: options.initialize ?? false,
      });
    } catch (error) {
      return Effect.succeed({
        success: false as const,
        error: error instanceof Error ? error.message : String(error),
        initialized: false,
      });
    }
  };

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

      try {
        // 1. 安装 CLI
        execSync("npm install --save-dev openspec", {
          encoding: "utf-8",
          timeout: 120000,
          stdio: "pipe",
          cwd: project.meta.projectPath,
        });

        // 2. 可选：执行初始化
        if (options.initialize) {
          execSync("npx openspec init --tools claude --force", {
            encoding: "utf-8",
            timeout: 60000,
            stdio: "pipe",
            cwd: project.meta.projectPath,
          });
        }

        return {
          success: true,
          error: undefined,
          initialized: options.initialize ?? false,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          initialized: false,
        };
      }
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

      try {
        // 尝试使用全局 openspec
        execSync("openspec init --tools claude --force", {
          encoding: "utf-8",
          timeout: 60000,
          stdio: "pipe",
          cwd: project.meta.projectPath,
        });

        return {
          success: true,
          error: undefined,
          method: "global" as const,
        };
      } catch {
        // 如果全局命令失败，尝试使用 npx
        try {
          execSync("npx openspec init --tools claude --force", {
            encoding: "utf-8",
            timeout: 120000,
            stdio: "pipe",
            cwd: project.meta.projectPath,
          });

          return {
            success: true,
            error: undefined,
            method: "npx" as const,
          };
        } catch (npxError) {
          return {
            success: false,
            error:
              npxError instanceof Error ? npxError.message : String(npxError),
            method: null,
          };
        }
      }
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
