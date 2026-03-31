import { Command, CommandExecutor, FileSystem, Path } from "@effect/platform";
import { Context, Data, Duration, Effect, Layer } from "effect";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import type { D2CArtifactSummary } from "./d2cPreviewArtifacts";
import { listArtifactsFromEntries } from "./d2cPreviewArtifacts";
import {
  buildCorehashInjection,
  serializeCorehashMap,
} from "./d2cPreviewCorehash";
import {
  resolveD2CDir,
  resolvePreviewEntryFile,
  resolvePreviewRoot,
  resolvePreviewTargetDir,
} from "./d2cPreviewPaths";
import { applyPreviewTsxCompat } from "./d2cPreviewTsxCompat";
import { resolvePreviewUrl } from "./d2cPreviewUrl";

class ProjectPathNotFoundError extends Data.TaggedError(
  "ProjectPathNotFoundError",
)<{
  projectId: string;
}> {}

class PreviewWorkerScriptNotFoundError extends Data.TaggedError(
  "PreviewWorkerScriptNotFoundError",
)<{
  repoRoot: string;
  candidates: string[];
}> {}

const PREVIEW_URL =
  // biome-ignore lint/style/noProcessEnv: 允许通过环境变量覆盖预览服务地址
  resolvePreviewUrl(process.env);

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "unknown error";
  }
};

export interface SyncPreviewResult {
  success: boolean;
  message: string;
  targetDir: string;
}

export interface PreviewStatusResult {
  previewUrl: string;
  isRunning: boolean;
}

export interface EnsurePreviewResult {
  success: boolean;
  message: string;
  previewUrl: string;
  isRunning: boolean;
  starting?: boolean;
}

export interface PreviewProjectStatus {
  valid: boolean;
  previewRoot: string;
  progress?: {
    step: string;
    message?: string;
    updatedAt?: string;
  };
}

export interface TriggerRebuildResult {
  success: boolean;
  message: string;
  touchedFile?: string;
}

const COREHASH_MAP_FILENAME = "corehash-map.json";
const LEGACY_COREHASH_FILENAME = "webCoreBuildData.json";

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const projectRepository = yield* ProjectRepository;
  yield* CommandExecutor.CommandExecutor;

  const getProjectPath = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      const projectPath = project.meta.projectPath;
      if (projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }
      return projectPath;
    });

  const isPreviewProjectValid = (projectPath: string) =>
    Effect.gen(function* () {
      const previewRoot = yield* resolvePreviewRoot(projectPath);
      const requiredEntries = ["package.json", "app", "scripts"];
      for (const entry of requiredEntries) {
        const exists = yield* fs.exists(path.join(previewRoot, entry));
        if (!exists) {
          return false;
        }
      }
      return true;
    });

  const resolveStatusPath = (projectPath: string) =>
    Effect.gen(function* () {
      const sanitize = (value: string) =>
        value.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const tempDir =
        // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
        process.env.TMPDIR ||
        // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
        process.env.TEMP ||
        // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
        process.env.TMP ||
        "/tmp";
      const path = yield* Path.Path;
      return path.join(
        tempDir,
        `specforge-d2c-preview-${sanitize(projectPath)}.json`,
      );
    });

  const parseProgress = (
    raw: unknown,
  ): PreviewProjectStatus["progress"] | undefined => {
    if (typeof raw !== "object" || raw === null) return undefined;
    if (!("step" in raw)) return undefined;
    const stepValue = raw.step;
    if (typeof stepValue !== "string") return undefined;
    const messageValue =
      "message" in raw && typeof raw.message === "string"
        ? raw.message
        : undefined;
    const updatedAtValue =
      "updatedAt" in raw && typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : undefined;
    return {
      step: stepValue,
      message: messageValue,
      updatedAt: updatedAtValue,
    };
  };

  const resolveRepoRoot = () =>
    Effect.gen(function* () {
      const startDir = import.meta.dirname;
      const maxDepth = 8;
      let current = startDir;

      for (let depth = 0; depth < maxDepth; depth += 1) {
        const pkgPath = path.join(current, "package.json");
        const exists = yield* fs.exists(pkgPath);
        if (exists) {
          return current;
        }
        const parent = path.dirname(current);
        if (parent === current) {
          break;
        }
        current = parent;
      }

      return process.cwd();
    });

  const resolveWorkerScript = (repoRoot: string) =>
    Effect.gen(function* () {
      const cjsPath = path.join(
        repoRoot,
        "scripts",
        "start-d2c-preview-worker.cjs",
      );
      const jsPath = path.join(
        repoRoot,
        "scripts",
        "start-d2c-preview-worker.js",
      );

      const cjsExists = yield* fs.exists(cjsPath);
      if (cjsExists) return cjsPath;

      const jsExists = yield* fs.exists(jsPath);
      if (jsExists) return jsPath;

      return yield* Effect.fail(
        new PreviewWorkerScriptNotFoundError({
          repoRoot,
          candidates: [cjsPath, jsPath],
        }),
      );
    });

  const checkStatus = (): Effect.Effect<PreviewStatusResult, never, never> =>
    Effect.gen(function* () {
      const fetchEffect = Effect.tryPromise({
        try: () => fetch(PREVIEW_URL, { method: "GET", redirect: "manual" }),
        catch: (error) => new Error(formatUnknownError(error)),
      });

      const result = yield* Effect.either(
        Effect.timeout(fetchEffect, Duration.seconds(2)),
      );

      if (result._tag === "Right") {
        return { previewUrl: PREVIEW_URL, isRunning: true };
      }

      return { previewUrl: PREVIEW_URL, isRunning: false };
    });

  const checkPreviewProject = (projectId: string) =>
    Effect.gen(function* () {
      const projectPath = yield* getProjectPath(projectId);
      const previewRoot = yield* resolvePreviewRoot(projectPath);
      const valid = yield* isPreviewProjectValid(projectPath);
      const statusPath = yield* resolveStatusPath(projectPath);
      const statusExists = yield* fs.exists(statusPath);
      let progress: PreviewProjectStatus["progress"];
      if (statusExists) {
        const raw = yield* fs.readFileString(statusPath);
        try {
          const parsed = JSON.parse(raw);
          progress = parseProgress(parsed);
        } catch {
          progress = undefined;
        }
      }
      return { valid, previewRoot, progress };
    });

  const readProgress = (projectPath: string) =>
    Effect.gen(function* () {
      const statusPath = yield* resolveStatusPath(projectPath);
      const statusExists = yield* fs.exists(statusPath);
      if (!statusExists) return undefined;
      const raw = yield* fs.readFileString(statusPath);
      try {
        const parsed = JSON.parse(raw);
        return parseProgress(parsed);
      } catch {
        return undefined;
      }
    });

  const startPreviewWorker = (projectPath: string) =>
    Effect.gen(function* () {
      const repoRoot = yield* resolveRepoRoot();
      const workerScript = yield* resolveWorkerScript(repoRoot);

      const command = Command.make(
        "node",
        workerScript,
        "--project-root",
        projectPath,
      ).pipe(Command.runInShell(true));

      const result = yield* Effect.either(
        Command.string(command).pipe(Effect.timeout(Duration.seconds(10))),
      );

      if (result._tag === "Left") {
        console.error(
          "[D2CPreviewService] 预览 Worker 启动失败，详细错误:",
          result.left,
        );
        return yield* Effect.fail(result.left);
      }

      const output =
        typeof result.right === "string" ? result.right.trim() : "";
      if (output.length > 0) {
        console.log(`[D2CPreviewService] 预览 Worker 输出:\n${output}`);
      }
    });

  const ensureRunning = (projectId: string) =>
    Effect.gen(function* () {
      const projectPath = yield* getProjectPath(projectId);
      const status = yield* checkStatus();
      const isValid = yield* isPreviewProjectValid(projectPath);
      const progress = yield* readProgress(projectPath);

      if (progress?.step === "copying" || progress?.step === "installing") {
        return {
          success: true,
          message: "预览工程正在初始化，请耐心等待",
          previewUrl: PREVIEW_URL,
          isRunning: false,
          starting: true,
        } satisfies EnsurePreviewResult;
      }

      if (progress?.step === "starting") {
        return {
          success: true,
          message: "预览服务正在启动，请耐心等待",
          previewUrl: PREVIEW_URL,
          isRunning: false,
          starting: true,
        } satisfies EnsurePreviewResult;
      }

      if (status.isRunning && isValid) {
        return {
          success: true,
          message: "预览服务已在运行",
          previewUrl: status.previewUrl,
          isRunning: true,
        } satisfies EnsurePreviewResult;
      }

      const workerResult = yield* Effect.either(
        startPreviewWorker(projectPath),
      );
      if (workerResult._tag === "Left") {
        const errorDetail = formatUnknownError(workerResult.left);
        console.error(
          "[D2CPreviewService] ensureRunning: 预览服务启动失败:",
          errorDetail,
        );
        return {
          success: false,
          message: `预览服务启动失败: ${errorDetail}`,
          previewUrl: PREVIEW_URL,
          isRunning: false,
        } satisfies EnsurePreviewResult;
      }

      return {
        success: true,
        message: status.isRunning
          ? "预览工程校验失败，正在重新初始化"
          : "预览服务正在启动中",
        previewUrl: PREVIEW_URL,
        isRunning: false,
        starting: true,
      } satisfies EnsurePreviewResult;
    });

  const listArtifacts = (projectId: string, changeId: string) =>
    Effect.gen(function* () {
      const projectPath = yield* getProjectPath(projectId);
      const d2cDir = yield* resolveD2CDir(projectPath, changeId);

      const d2cExists = yield* fs.exists(d2cDir);
      if (!d2cExists) {
        return [] satisfies D2CArtifactSummary[];
      }

      const entries = yield* fs.readDirectory(d2cDir);
      const entryChecks: Array<{
        name: string;
        isDir: boolean;
        hasTsx: boolean;
        hasScss: boolean;
      }> = [];

      for (const entry of entries) {
        const entryPath = path.join(d2cDir, entry);
        const stat = yield* fs.stat(entryPath);
        const isDir = stat.type === "Directory";
        const tsxPath = path.join(entryPath, "index.tsx");
        const scssPath = path.join(entryPath, "index.module.scss");
        const tsxExists = isDir ? yield* fs.exists(tsxPath) : false;
        const scssExists = isDir ? yield* fs.exists(scssPath) : false;

        entryChecks.push({
          name: entry,
          isDir,
          hasTsx: tsxExists,
          hasScss: scssExists,
        });
      }

      return listArtifactsFromEntries({
        entries: entryChecks,
      });
    });

  const syncPreviewFiles = (
    projectId: string,
    changeId: string,
    artifactId: string,
  ) =>
    Effect.gen(function* () {
      const projectPath = yield* getProjectPath(projectId);
      const previewValid = yield* isPreviewProjectValid(projectPath);
      if (!previewValid) {
        return {
          success: false,
          message: "预览工程尚未初始化完成，请先启动预览服务",
          targetDir: "未初始化",
        } satisfies SyncPreviewResult;
      }
      const previewRoot = yield* resolvePreviewRoot(projectPath);
      const sourceDir = yield* resolveD2CDir(projectPath, changeId);
      const targetDir = yield* resolvePreviewTargetDir(previewRoot);

      if (
        artifactId.includes("..") ||
        artifactId.includes("/") ||
        artifactId.includes("\\")
      ) {
        return {
          success: false,
          message: "产物目录名非法",
          targetDir,
        } satisfies SyncPreviewResult;
      }

      const sourceBase = path.join(sourceDir, artifactId);
      const sourceTsxPath = path.join(sourceBase, "index.tsx");
      const sourceScssPath = path.join(sourceBase, "index.module.scss");

      const tsxExists = yield* fs.exists(sourceTsxPath);
      const scssExists = yield* fs.exists(sourceScssPath);

      if (!tsxExists || !scssExists) {
        const missing = [
          !tsxExists ? "index.tsx" : undefined,
          !scssExists ? "index.module.scss" : undefined,
        ]
          .filter((item): item is string => item !== undefined)
          .join(", ");

        return {
          success: false,
          message: `源代码文件不存在(缺少: ${missing}), sourceDir: ${sourceBase}`,
          targetDir,
        } satisfies SyncPreviewResult;
      }

      yield* fs.makeDirectory(targetDir, { recursive: true });

      const tsxContent = yield* fs.readFileString(sourceTsxPath);
      const scssContent = yield* fs.readFileString(sourceScssPath);
      const compatibleTsxContent = applyPreviewTsxCompat(tsxContent);
      const relativeSourcePath = path.relative(projectPath, sourceTsxPath);
      const filename = path.basename(sourceTsxPath);

      const injectionResult = yield* Effect.either(
        Effect.try({
          try: () =>
            buildCorehashInjection({
              sourceText: compatibleTsxContent,
              fileDir: relativeSourcePath,
              filename,
            }),
          catch: (error) =>
            new Error(`核心哈希注入失败: ${formatUnknownError(error)}`),
        }),
      );

      if (injectionResult._tag === "Left") {
        return {
          success: false,
          message: injectionResult.left.message,
          targetDir,
        } satisfies SyncPreviewResult;
      }

      yield* fs.writeFileString(
        path.join(targetDir, "index.tsx"),
        injectionResult.right.injectedCode,
      );
      yield* fs.writeFileString(
        path.join(targetDir, "index.module.scss"),
        scssContent,
      );
      const corehashPayload = serializeCorehashMap(
        injectionResult.right.corehashMap,
      );
      yield* fs.writeFileString(
        path.join(targetDir, COREHASH_MAP_FILENAME),
        corehashPayload,
      );

      const legacyDir = path.join(previewRoot, ".next");
      yield* fs.makeDirectory(legacyDir, { recursive: true });
      yield* fs.writeFileString(
        path.join(legacyDir, LEGACY_COREHASH_FILENAME),
        corehashPayload,
      );

      return {
        success: true,
        message: "代码已同步到预览工程",
        targetDir,
      } satisfies SyncPreviewResult;
    });

  const triggerRebuild = (projectId: string) =>
    Effect.gen(function* () {
      const projectPath = yield* getProjectPath(projectId);
      const previewRoot = yield* resolvePreviewRoot(projectPath);
      const entryFile = yield* resolvePreviewEntryFile(previewRoot);

      const exists = yield* fs.exists(entryFile);
      if (!exists) {
        return {
          success: false,
          message: "未找到可触发编译的入口文件",
        } satisfies TriggerRebuildResult;
      }

      const content = yield* fs.readFileString(entryFile);
      yield* fs.writeFileString(entryFile, content);

      return {
        success: true,
        message: "已触发重新编译",
        touchedFile: entryFile,
      } satisfies TriggerRebuildResult;
    });

  return {
    checkStatus,
    checkPreviewProject,
    ensureRunning,
    listArtifacts,
    syncPreviewFiles,
    triggerRebuild,
  };
});

export class D2CPreviewService extends Context.Tag("D2CPreviewService")<
  D2CPreviewService,
  Effect.Effect.Success<typeof LayerImpl>
>() {
  static Live = Layer.effect(this, LayerImpl);
}
