import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import { getDirectoryListing } from "../functions/getDirectoryListing";
import { getFileCompletion } from "../functions/getFileCompletion";

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;

  const getFileCompletionRoute = (options: {
    projectId: string;
    basePath: string;
  }) =>
    Effect.gen(function* () {
      const { projectId, basePath } = options;

      const { project } = yield* projectRepository.getProject(projectId);

      if (project.meta.projectPath === null) {
        return {
          response: { error: "Project path not found" },
          status: 400,
        } as const satisfies ControllerResponse;
      }

      const projectPath = project.meta.projectPath;

      const result = yield* getFileCompletion(projectPath, basePath).pipe(
        Effect.catchAll((error) => {
          console.error("File completion error:", error);
          return Effect.succeed({
            entries: [],
            basePath:
              basePath.startsWith("/") || basePath.startsWith("\\")
                ? basePath.slice(1)
                : basePath,
            projectPath,
          });
        }),
      );

      return {
        response: result,
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getDirectoryListingRoute = (options: {
    currentPath?: string | undefined;
    showHidden?: boolean | undefined;
  }) =>
    Effect.gen(function* () {
      const { currentPath, showHidden = false } = options;

      const rootPath = "/";
      // 使用 process.env 获取 home 目录
      // biome-ignore lint/style/noProcessEnv: 需要获取 Unix/Linux 用户 HOME 目录
      const home = process.env.HOME;
      // biome-ignore lint/style/noProcessEnv: 需要获取 Windows 用户 USERPROFILE 目录
      const userProfile = process.env.USERPROFILE;
      const defaultPath = home || userProfile || rootPath;

      const targetPath = currentPath ?? defaultPath;
      const windowsDriveMatch = /^[A-Za-z]:[\\/]/.exec(targetPath);
      const effectiveRootPath = windowsDriveMatch
        ? `${windowsDriveMatch[0].slice(0, 2)}\\`
        : rootPath;
      const relativePath = targetPath.startsWith(effectiveRootPath)
        ? targetPath.slice(effectiveRootPath.length)
        : targetPath;

      const result = yield* getDirectoryListing(
        effectiveRootPath,
        relativePath,
        showHidden,
      ).pipe(
        Effect.catchAll((error) => {
          console.error("Directory listing error:", error);
          return Effect.succeed({
            entries: [],
            basePath: "/",
            currentPath: rootPath,
          });
        }),
      );

      return {
        response: result,
        status: 200,
      } as const satisfies ControllerResponse;
    });

  return {
    getFileCompletionRoute,
    getDirectoryListingRoute,
  };
});

export type IFileSystemController = InferEffect<typeof LayerImpl>;
export class FileSystemController extends Context.Tag("FileSystemController")<
  FileSystemController,
  IFileSystemController
>() {
  static Live = Layer.effect(this, LayerImpl);
}
