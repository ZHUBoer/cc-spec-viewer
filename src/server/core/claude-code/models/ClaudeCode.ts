import * as agentSdk from "@anthropic-ai/claude-agent-sdk";
import { Command, FileSystem, Path } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Data, Effect } from "effect";
import { uniq } from "es-toolkit";
import { CcvOptionsService } from "../../platform/services/CcvOptionsService";
import { UserConfigService } from "../../platform/services/UserConfigService";
import { readClaudeSettingsEnv } from "../functions/readClaudeSettingsEnv";
import * as ClaudeCodeVersion from "./ClaudeCodeVersion";

type AgentSdkQuery = typeof agentSdk.query;
type AgentSdkPrompt = Parameters<AgentSdkQuery>[0]["prompt"];
type AgentSdkQueryOptions = NonNullable<
  Parameters<AgentSdkQuery>[0]["options"]
>;

const npxCacheRegExp = /_npx[/\\].*node_modules[\\/]\.bin/;
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const localNodeModulesBinRegExp = new RegExp(
  `${escapeRegExp(process.cwd().replace(/\\/g, "/"))}/node_modules/\\.bin`,
);

const windowsExecutableExtensions: ReadonlyArray<string> = [
  ".exe",
  ".cmd",
  ".ps1",
  ".js",
  ".mjs",
  ".cjs",
];

// Windows 上只保留可直接执行的文件扩展名（.cmd / .exe / .ps1），
// 无扩展名的 Unix shell 脚本无法被 Windows 直接 spawn。
const isWindowsSpawnable = (filePath: string): boolean => {
  if (process.platform !== "win32") return true;
  const lower = filePath.toLowerCase();
  return (
    lower.endsWith(".cmd") || lower.endsWith(".exe") || lower.endsWith(".ps1")
  );
};

const isWindowsShimPath = (filePath: string): boolean => {
  if (process.platform !== "win32") return false;
  const lower = filePath.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".ps1");
};

const getWindowsExtensionPriority = (filePath: string): number => {
  if (process.platform !== "win32") return 0;
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".exe")) return 3;
  if (lower.endsWith(".cmd")) return 2;
  if (lower.endsWith(".ps1")) return 1;
  return 0;
};

export const claudeCodePathPriority = (path: string): number => {
  const normalizedPath = path.replace(/\\/g, "/");

  if (npxCacheRegExp.test(normalizedPath)) {
    return 0;
  }

  if (localNodeModulesBinRegExp.test(normalizedPath)) {
    return 1;
  }

  return 2;
};

const listClaudePathsFromPath = Effect.gen(function* () {
  const commands: ReadonlyArray<readonly [string, ...string[]]> =
    process.platform === "win32"
      ? [
          ["where", "claude"],
          ["where", "claude.cmd"],
          ["where", "claude.exe"],
          ["where", "claude.ps1"],
        ]
      : [["which", "-a", "claude"]];

  const pathLists = yield* Effect.forEach(commands, ([command, ...args]) =>
    Command.string(
      Command.make(command, ...args).pipe(Command.runInShell(true)),
    ).pipe(
      Effect.map((output) =>
        output
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== ""),
      ),
      Effect.catchAll(() => Effect.succeed<string[]>([])),
    ),
  );

  return uniq(pathLists.flat())
    .filter(isWindowsSpawnable)
    .toSorted((a, b) => {
      const aPriority = claudeCodePathPriority(a);
      const bPriority = claudeCodePathPriority(b);

      if (aPriority < bPriority) {
        return 1;
      }
      if (aPriority > bPriority) {
        return -1;
      }

      if (process.platform === "win32") {
        const aExtPriority = getWindowsExtensionPriority(a);
        const bExtPriority = getWindowsExtensionPriority(b);
        if (aExtPriority < bExtPriority) {
          return 1;
        }
        if (aExtPriority > bExtPriority) {
          return -1;
        }
      }

      return 0;
    });
});

class ClaudeCodePathNotFoundError extends Data.TaggedError(
  "ClaudeCodePathNotFoundError",
)<{
  message: string;
}> {}

class ClaudeCodeAgentSdkNotSupportedError extends Data.TaggedError(
  "ClaudeCodeAgentSdkNotSupportedError",
)<{
  message: string;
}> {}

class ClaudeCodeShimParseError extends Data.TaggedError(
  "ClaudeCodeShimParseError",
)<{
  message: string;
  shimPath: string;
}> {}

const resolveWindowsExecutableCandidates = (resolvedPath: string) => {
  return windowsExecutableExtensions.map((ext) => `${resolvedPath}${ext}`);
};

export const parseWindowsShimJsEntry = (
  content: string,
): string | undefined => {
  const patterns = [
    /"%~dp0\\?([^"]+?\.(?:mjs|cjs|js))"/i,
    /%~dp0\\?([^\s"'`]+?\.(?:mjs|cjs|js))/i,
    /["']?\$PSScriptRoot\\([^"'`]+?\.(?:mjs|cjs|js))["']?/i,
    /node(?:\.exe)?\s+["']?([^"'`]+?\.(?:mjs|cjs|js))["']?/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(content);
    if (match?.[1] !== undefined) {
      return match[1];
    }
  }

  return undefined;
};

// 在 Windows 上，将 .cmd/.ps1 shim 路径解析为实际的 JS 入口文件路径。
// 这是对 claude-agent-sdk 的 workaround：SDK 的 spawnLocalProcess 不带
// shell: true，导致 .cmd/.ps1 文件无法被直接 spawn（EINVAL）。
// 解析出 .js 路径后，SDK 会走 node + script.js 分支，规避此问题。
//
// 内部就地 provide NodeFileSystem，避免 FileSystem 依赖泄漏到 Config 类型签名。
const resolveJsEntryFromShim = (
  shimPath: string,
  pathModule: Path.Path,
): Effect.Effect<string | undefined> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(shimPath);
    const entry = parseWindowsShimJsEntry(content);
    if (entry === undefined) {
      const shimDir = pathModule.dirname(shimPath);
      const normalizedShimDir = shimDir.replace(/\\/g, "/");
      if (!normalizedShimDir.includes("/node_modules/.bin")) {
        return undefined;
      }

      const nodeModulesDir = pathModule.resolve(shimDir, "..");
      const packageDir = pathModule.join(
        nodeModulesDir,
        "@anthropic-ai",
        "claude-code",
      );
      const fallbackCandidates = [
        pathModule.join(packageDir, "cli.js"),
        pathModule.join(packageDir, "cli.mjs"),
        pathModule.join(packageDir, "cli.cjs"),
        pathModule.join(packageDir, "dist", "cli.js"),
        pathModule.join(packageDir, "dist", "cli.mjs"),
        pathModule.join(packageDir, "dist", "cli.cjs"),
      ];

      return yield* resolveFirstExistingPath(fallbackCandidates);
    }
    const shimDir = pathModule.dirname(shimPath);
    const jsEntry = pathModule.resolve(shimDir, entry);
    const exists = yield* fs.exists(jsEntry);
    return exists ? jsEntry : undefined;
  }).pipe(
    Effect.provide(NodeFileSystem.layer),
    Effect.catchAll(() => Effect.succeed(undefined)),
  );

const resolveFirstExistingPath = (
  candidates: ReadonlyArray<string>,
): Effect.Effect<string | undefined> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    for (const candidate of candidates) {
      if (yield* fs.exists(candidate)) {
        return candidate;
      }
    }
    return undefined;
  }).pipe(
    Effect.provide(NodeFileSystem.layer),
    Effect.catchAll(() => Effect.succeed(undefined)),
  );

const resolveClaudeCodePath = Effect.gen(function* () {
  const path = yield* Path.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const userConfigService = yield* UserConfigService;

  let resolvedPath: string;

  // Environment variable (highest priority)
  const specifiedExecutablePath =
    yield* ccvOptionsService.getCcvOptions("executable");
  const userConfig = yield* userConfigService.getUserConfig();
  const userExecutablePathRaw = userConfig.claudeCodeExecutablePath;
  const userExecutablePath =
    typeof userExecutablePathRaw === "string" &&
    userExecutablePathRaw.trim().length > 0
      ? userExecutablePathRaw.trim()
      : undefined;
  const configuredExecutablePath =
    specifiedExecutablePath ?? userExecutablePath;
  if (configuredExecutablePath !== undefined) {
    const resolvedSpecifiedPath = path.resolve(configuredExecutablePath);
    if (process.platform === "win32") {
      const extension = path.extname(resolvedSpecifiedPath);
      if (extension.length > 0) {
        const exists = yield* resolveFirstExistingPath([resolvedSpecifiedPath]);
        if (exists === undefined) {
          return yield* Effect.fail(
            new ClaudeCodePathNotFoundError({
              message: `Claude Code CLI not found at ${resolvedSpecifiedPath}`,
            }),
          );
        }
        resolvedPath = exists;
      } else {
        const candidates = resolveWindowsExecutableCandidates(
          resolvedSpecifiedPath,
        );
        const existing = yield* resolveFirstExistingPath(candidates);
        if (existing === undefined) {
          return yield* Effect.fail(
            new ClaudeCodePathNotFoundError({
              message: `Claude Code CLI not found for ${resolvedSpecifiedPath}. Tried: ${candidates.join(
                ", ",
              )}`,
            }),
          );
        }
        resolvedPath = existing;
      }
    } else {
      resolvedPath = resolvedSpecifiedPath;
    }
  } else {
    // System PATH lookup
    const claudePaths = yield* listClaudePathsFromPath.pipe(
      Effect.catchAll(() => Effect.succeed<string[]>([])),
    );

    const firstPath = claudePaths.at(0);

    if (firstPath === undefined) {
      return yield* Effect.fail(
        new ClaudeCodePathNotFoundError({
          message: "Claude Code CLI not found in any location",
        }),
      );
    }

    resolvedPath = firstPath;
  }

  // Windows workaround: .cmd/.ps1 文件无法被 agent-sdk 直接 spawn（EINVAL），
  // 需要解析出实际的 JS 入口文件路径。
  // 无论路径来源（环境变量或 PATH 查找），都需要处理。
  if (isWindowsShimPath(resolvedPath)) {
    const jsEntry = yield* resolveJsEntryFromShim(resolvedPath, path);
    if (jsEntry === undefined) {
      return yield* Effect.fail(
        new ClaudeCodeShimParseError({
          message:
            "Windows 下检测到 Claude Code shim，但无法解析 JS 入口。请改用 claude.exe 或将 CCV_CC_EXECUTABLE_PATH 指向 cli.js。",
          shimPath: resolvedPath,
        }),
      );
    }
    console.log(
      `[SpecForge] Windows shim workaround: 解析 ${resolvedPath} → ${jsEntry}`,
    );
    return jsEntry;
  }

  return resolvedPath;
});

export const Config = Effect.gen(function* () {
  const claudeCodeExecutablePath = yield* resolveClaudeCodePath;

  // 读取 settings.json env，与 process.env 合并后传递给 claude --version
  // Windows 用户可能通过 settings.json 配置自定义代理环境变量
  const settingsEnv = yield* readClaudeSettingsEnv;
  // biome-ignore lint/style/noProcessEnv: Claude Code 版本检测需要完整环境变量，与 settings.json env 合并
  const mergedEnv = { ...settingsEnv, ...process.env };

  const claudeCodeVersion = ClaudeCodeVersion.fromCLIString(
    yield* Command.string(
      Command.make(claudeCodeExecutablePath, "--version").pipe(
        Command.env(mergedEnv),
        Command.runInShell(true),
      ),
    ),
  );

  return {
    claudeCodeExecutablePath,
    claudeCodeVersion,
  };
});

export const getMcpListOutput = (projectCwd: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const { claudeCodeExecutablePath } = yield* Config;
    const command = Command.make(claudeCodeExecutablePath, "mcp", "list").pipe(
      Command.workingDirectory(path.resolve(projectCwd)),
    );
    const output = yield* Command.string(
      command.pipe(Command.runInShell(true)),
    );
    return output;
  });

// 乐观策略：当版本解析失败（null）时，所有特性返回 true。
// 理由：能找到 claude 可执行文件说明已安装，当前最低可安装版本远超所有阈值，
// 版本解析失败是环境问题（如 Windows shell 输出格式）而非版本过低。
export const getAvailableFeatures = (
  claudeCodeVersion: ClaudeCodeVersion.ClaudeCodeVersion | null,
) => ({
  canUseTool:
    claudeCodeVersion !== null
      ? ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 1,
          minor: 0,
          patch: 82,
        })
      : true,
  uuidOnSDKMessage:
    claudeCodeVersion !== null
      ? ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 1,
          minor: 0,
          patch: 86,
        })
      : true,
  agentSdk:
    claudeCodeVersion !== null
      ? ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 1,
          minor: 0,
          patch: 125, // ClaudeCodeAgentSDK is available since v1.0.125
        })
      : true,
  sidechainSeparation:
    claudeCodeVersion !== null
      ? ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 2,
          minor: 0,
          patch: 28, // Sidechain conversations stored in agent-*.jsonl since v2.0.28
        })
      : true,
  runSkillsDirectly:
    claudeCodeVersion !== null
      ? ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 2,
          minor: 1,
          patch: 0,
        }) ||
        ClaudeCodeVersion.greaterThanOrEqual(claudeCodeVersion, {
          major: 2,
          minor: 0,
          patch: 77,
        })
      : true,
});

export const query = (
  prompt: AgentSdkPrompt,
  options: AgentSdkQueryOptions,
) => {
  const { canUseTool, permissionMode, hooks, ...baseOptions } = options;

  return Effect.gen(function* () {
    const { claudeCodeExecutablePath, claudeCodeVersion } = yield* Config;
    const availableFeatures = getAvailableFeatures(claudeCodeVersion);

    const versionText = claudeCodeVersion
      ? ClaudeCodeVersion.versionText(claudeCodeVersion)
      : "unknown";

    // 诊断日志：记录 spawn 信息，用于排查 todowrite vs tasklist 等工具可用性问题
    console.log(
      `[SpecForge] Claude Code query: path=${claudeCodeExecutablePath}, version=${versionText}, features=${JSON.stringify(availableFeatures)}`,
    );

    const queryOptions: AgentSdkQueryOptions = {
      ...baseOptions,
      pathToClaudeCodeExecutable: claudeCodeExecutablePath,
      disallowedTools: [],
      ...(availableFeatures.canUseTool
        ? { canUseTool, permissionMode }
        : {
            permissionMode: "bypassPermissions",
          }),
      // 捕获 Claude Code CLI 的 stderr 输出用于诊断
      // 仅当 CLI 开启 debug 模式时（通过 DEBUG_CLAUDE_AGENT_SDK=1）才会有实际输出
      stderr: (data: string) => {
        console.log(`[SpecForge:claude-code:stderr] ${data.trimEnd()}`);
      },
    };

    if (!availableFeatures.agentSdk) {
      return yield* Effect.fail(
        new ClaudeCodeAgentSdkNotSupportedError({
          message: "Agent SDK is not supported in this version of Claude Code",
        }),
      );
    }

    return agentSdk.query({
      prompt,
      options: {
        systemPrompt: { type: "preset", preset: "claude_code" },
        settingSources: ["user", "project", "local"],
        ...queryOptions,
      },
    });
  });
};
