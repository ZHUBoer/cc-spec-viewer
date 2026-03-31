import { Command, CommandExecutor, FileSystem, Path } from "@effect/platform";
import { Context, Duration, Effect, Either, Layer } from "effect";

// ============================================================================
// Types
// ============================================================================

/**
 * CLI 安装信息
 */
export interface CliInstallation {
  readonly installed: boolean;
  readonly version?: string;
  readonly type?: "global" | "project" | "npx";
  readonly cliPath?: string;
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * CLI 检测服务
 *
 * 负责检测 openspec CLI 的安装状态，包括：
 * - 全局安装（npm install -g openspec）
 * - 项目本地安装（npm install --save-dev openspec）
 * - npx 可用性（npx openspec）
 */
export class CliDetectionService extends Context.Tag("CliDetectionService")<
  CliDetectionService,
  {
    /**
     * 检查全局和 npx 的 openspec CLI 安装状态
     */
    readonly checkGlobalCli: () => Effect.Effect<CliInstallation, never>;

    /**
     * 检查项目本地的 openspec CLI 安装状态
     */
    readonly checkProjectCli: (
      projectPath: string,
    ) => Effect.Effect<CliInstallation, never>;
  }
>() {}

// ============================================================================
// Live Implementation（生产环境使用）
// ============================================================================

export const CliDetectionServiceLive = Layer.effect(
  CliDetectionService,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const commandExecutor = yield* CommandExecutor.CommandExecutor;

    // 创建 CommandExecutor Layer 用于在方法内部提供依赖
    const commandExecutorLayer = Layer.succeed(
      CommandExecutor.CommandExecutor,
      commandExecutor,
    );

    return {
      /**
       * 检查全局 CLI 安装状态
       * 先检查全局 openspec，再检查 npx 可用性
       */
      checkGlobalCli: () =>
        Effect.gen(function* () {
          const openspecExecutable =
            process.platform === "win32" ? "openspec.cmd" : "openspec";
          const npxExecutable =
            process.platform === "win32" ? "npx.cmd" : "npx";

          // 1. 检查全局 openspec 安装
          const globalCommand = Command.make(openspecExecutable, "--version");
          const globalResult = yield* Effect.either(
            Command.string(globalCommand.pipe(Command.runInShell(true))).pipe(
              Effect.timeout(Duration.seconds(5)),
            ),
          );

          if (Either.isRight(globalResult)) {
            return {
              installed: true,
              version: String(globalResult.right).trim(),
              type: "global" as const,
            };
          }

          // 2. 检查 npx openspec 可用性（--no-install 避免触发网络安装导致长时间等待）
          const npxCommand = Command.make(
            npxExecutable,
            "--no-install",
            "openspec",
            "--version",
          );
          const npxResult = yield* Effect.either(
            Command.string(npxCommand.pipe(Command.runInShell(true))).pipe(
              Effect.timeout(Duration.seconds(2)),
            ),
          );

          if (Either.isRight(npxResult)) {
            return {
              installed: false,
              version: String(npxResult.right).trim(),
              type: "npx" as const,
            };
          }

          // 3. 未安装
          return { installed: false };
        }).pipe(
          Effect.provide(commandExecutorLayer),
          Effect.catchAll(() => Effect.succeed({ installed: false as const })),
        ),

      /**
       * 检查项目本地 CLI 安装状态
       */
      checkProjectCli: (projectPath: string) =>
        Effect.gen(function* () {
          const nodeModulesBinDir = path.join(
            projectPath,
            "node_modules",
            ".bin",
          );
          const candidateCliNames =
            process.platform === "win32"
              ? ["openspec.cmd", "openspec.exe", "openspec.ps1", "openspec"]
              : ["openspec"];

          const candidatePaths = candidateCliNames.map((name) =>
            path.join(nodeModulesBinDir, name),
          );
          const checks = yield* Effect.forEach(
            candidatePaths,
            (candidatePath) =>
              fs
                .exists(candidatePath)
                .pipe(Effect.map((exists) => ({ candidatePath, exists }))),
          );
          const existingCliPath = checks.find(
            (item) => item.exists,
          )?.candidatePath;

          if (existingCliPath === undefined) {
            return { installed: false };
          }

          // 尝试执行版本命令
          const command = Command.make(existingCliPath, "--version");
          const result = yield* Effect.either(
            Command.string(command.pipe(Command.runInShell(true))).pipe(
              Effect.timeout(Duration.seconds(5)),
            ),
          );

          if (Either.isRight(result)) {
            return {
              installed: true,
              version: String(result.right).trim(),
              type: "project" as const,
              cliPath: existingCliPath,
            };
          }

          // 本地文件存在但不可执行时，不应回退为 npx（避免误判为项目安装）
          return { installed: false };
        }).pipe(
          Effect.provide(commandExecutorLayer),
          Effect.catchAll(() => Effect.succeed({ installed: false as const })),
        ),
    };
  }),
);

// ============================================================================
// Mock Implementation（测试环境使用）
// ============================================================================

/**
 * 创建 Mock CLI 检测服务
 *
 * 用于测试环境，允许预设 CLI 安装状态
 *
 * @example
 * ```typescript
 * const mockService = createMockCliDetectionService({
 *   globalCli: { installed: true, version: "1.0.0", type: "global" },
 *   projectCli: { installed: false }
 * });
 * ```
 */
export const createMockCliDetectionService = (config: {
  globalCli?: CliInstallation;
  projectCli?: CliInstallation;
}) =>
  Layer.succeed(CliDetectionService, {
    checkGlobalCli: () =>
      Effect.succeed(config.globalCli ?? { installed: false }),
    checkProjectCli: (_projectPath: string) =>
      Effect.succeed(config.projectCli ?? { installed: false }),
  });
