import { FileSystem, Path } from "@effect/platform";
import { Context, Effect, Layer, Option, Ref } from "effect";
import { z } from "zod";
import type { InferEffect } from "../../../lib/effect/types";
import {
  FileCacheStorage,
  makeFileCacheStorageLayer,
} from "../../../lib/storage/FileCacheStorage";
import { PersistentService } from "../../../lib/storage/FileCacheStorage/PersistentService";
import { parseJsonl } from "../../claude-code/functions/parseJsonl";
import type { ProjectMeta } from "../../types";
import { decodeProjectId } from "../functions/id";
import { PROJECT_PATH_HINT_FILENAME } from "../functions/projectPathHint";

const ProjectPathSchema = z.string().nullable();

export type ProjectPathRepairResult =
  | {
      success: true;
      projectPath: string;
    }
  | {
      success: false;
      reason:
        | "no_project_path_found"
        | "ambiguous_project_paths"
        | "candidate_path_not_exists";
      candidates: string[];
    };

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const projectPathCache = yield* FileCacheStorage<string | null>();
  const projectMetaCacheRef = yield* Ref.make(new Map<string, ProjectMeta>());

  const extractProjectPathFromJsonl = (
    filePath: string,
  ): Effect.Effect<string | null, Error> =>
    Effect.gen(function* () {
      const cached = yield* projectPathCache.get(filePath);
      if (cached !== undefined) {
        return cached;
      }

      const content = yield* fs.readFileString(filePath);
      const lines = content.split("\n");

      let cwd: string | null = null;

      for (const line of lines) {
        const conversation = parseJsonl(line).at(0);

        if (
          conversation === undefined ||
          conversation.type === "summary" ||
          conversation.type === "x-error" ||
          conversation.type === "file-history-snapshot" ||
          conversation.type === "queue-operation" ||
          conversation.type === "last-prompt"
        ) {
          continue;
        }

        cwd = conversation.cwd;
        break;
      }

      if (cwd !== null) {
        yield* projectPathCache.set(filePath, cwd);
      }

      return cwd;
    });

  const getProjectMeta = (
    projectId: string,
  ): Effect.Effect<ProjectMeta, Error> =>
    Effect.gen(function* () {
      const metaCache = yield* Ref.get(projectMetaCacheRef);
      const cached = metaCache.get(projectId);
      if (cached !== undefined && cached.projectPath !== null) {
        return cached;
      }

      const claudeProjectPath = decodeProjectId(projectId);
      const projectPathHintFilePath = path.join(
        claudeProjectPath,
        PROJECT_PATH_HINT_FILENAME,
      );

      const dirents = yield* fs.readDirectory(claudeProjectPath);
      const fileEntries = yield* Effect.all(
        dirents
          .filter((name) => name.endsWith(".jsonl"))
          .map((name) =>
            Effect.gen(function* () {
              const fullPath = path.resolve(claudeProjectPath, name);
              const stat = yield* fs.stat(fullPath);
              const mtime = Option.getOrElse(stat.mtime, () => new Date(0));
              return {
                fullPath,
                mtime,
              } as const;
            }),
          ),
        { concurrency: "unbounded" },
      );

      const files = fileEntries.sort((a, b) => {
        return a.mtime.getTime() - b.mtime.getTime();
      });

      let projectPath: string | null = null;
      const hintedPath = yield* readProjectPathHint(projectPathHintFilePath);
      if (hintedPath !== null) {
        projectPath = hintedPath;
      } else {
        const repairResult = yield* repairProjectPathBySessionFiles({
          projectId,
          persistHint: true,
          files,
        });
        if (repairResult.success) {
          projectPath = repairResult.projectPath;
        }
      }

      const projectMeta: ProjectMeta = {
        projectName: projectPath ? path.basename(projectPath) : null,
        projectPath,
        sessionCount: files.length,
        isWorkspace: false,
      };

      if (projectPath !== null) {
        const settingsPath = path.join(projectPath, ".claude", "settings.json");
        const isWs = yield* Effect.gen(function* () {
          const exists = yield* fs.exists(settingsPath);
          if (!exists) return false;
          const content = yield* fs.readFileString(settingsPath);
          const parsed = yield* Effect.try({
            try: () => JSON.parse(content),
            catch: () => new Error("Invalid JSON in settings.json"),
          });
          const dirs = parsed?.permissions?.additionalDirectories;
          return Array.isArray(dirs) && dirs.length > 0;
        }).pipe(Effect.catchAll(() => Effect.succeed(false)));
        projectMeta.isWorkspace = isWs;
      }

      yield* Ref.update(projectMetaCacheRef, (cache) => {
        cache.set(projectId, projectMeta);
        return cache;
      });

      return projectMeta;
    });

  const invalidateProject = (projectId: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Ref.update(projectMetaCacheRef, (cache) => {
        cache.delete(projectId);
        return cache;
      });
    });

  const readProjectPathHint = (
    hintFilePath: string,
  ): Effect.Effect<string | null, Error> =>
    Effect.gen(function* () {
      if (!(yield* fs.exists(hintFilePath))) {
        return null;
      }
      const hintedPath = (yield* fs.readFileString(hintFilePath)).trim();
      if (hintedPath.length === 0) {
        return null;
      }
      if (!(yield* fs.exists(hintedPath))) {
        return null;
      }
      return hintedPath;
    });

  const repairProjectPathBySessionFiles = (options: {
    projectId: string;
    persistHint: boolean;
    files?: ReadonlyArray<{ fullPath: string; mtime: Date }>;
  }): Effect.Effect<ProjectPathRepairResult, Error> =>
    Effect.gen(function* () {
      const claudeProjectPath = decodeProjectId(options.projectId);
      const projectPathHintFilePath = path.join(
        claudeProjectPath,
        PROJECT_PATH_HINT_FILENAME,
      );
      const fileList =
        options.files ??
        (yield* Effect.gen(function* () {
          const dirents = yield* fs.readDirectory(claudeProjectPath);
          const entries = yield* Effect.all(
            dirents
              .filter((name) => name.endsWith(".jsonl"))
              .map((name) =>
                Effect.gen(function* () {
                  const fullPath = path.resolve(claudeProjectPath, name);
                  const stat = yield* fs.stat(fullPath);
                  return {
                    fullPath,
                    mtime: Option.getOrElse(stat.mtime, () => new Date(0)),
                  } as const;
                }),
              ),
            { concurrency: "unbounded" },
          );
          return entries.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
        }));

      const candidates = new Set<string>();
      for (const file of fileList) {
        const extracted = yield* extractProjectPathFromJsonl(file.fullPath);
        if (extracted !== null) {
          candidates.add(extracted);
        }
      }

      const candidateList = [...candidates];
      if (candidateList.length !== 1) {
        return {
          success: false,
          reason:
            candidateList.length === 0
              ? "no_project_path_found"
              : "ambiguous_project_paths",
          candidates: candidateList,
        };
      }

      const candidatePath = candidateList[0];
      if (candidatePath === undefined || !(yield* fs.exists(candidatePath))) {
        return {
          success: false,
          reason: "candidate_path_not_exists",
          candidates: candidateList,
        };
      }

      if (options.persistHint) {
        yield* fs
          .writeFileString(projectPathHintFilePath, candidatePath)
          .pipe(Effect.catchAll(() => Effect.void));
      }

      yield* invalidateProject(options.projectId);
      return {
        success: true,
        projectPath: candidatePath,
      };
    });

  const repairProjectPath = (
    projectId: string,
  ): Effect.Effect<ProjectPathRepairResult, Error> =>
    Effect.gen(function* () {
      const claudeProjectPath = decodeProjectId(projectId);
      const projectPathHintFilePath = path.join(
        claudeProjectPath,
        PROJECT_PATH_HINT_FILENAME,
      );
      const hintedPath = yield* readProjectPathHint(projectPathHintFilePath);
      if (hintedPath !== null) {
        return { success: true, projectPath: hintedPath };
      }
      return yield* repairProjectPathBySessionFiles({
        projectId,
        persistHint: true,
      });
    });

  return {
    getProjectMeta,
    invalidateProject,
    repairProjectPath,
  };
});

export type IProjectMetaService = InferEffect<typeof LayerImpl>;

export class ProjectMetaService extends Context.Tag("ProjectMetaService")<
  ProjectMetaService,
  IProjectMetaService
>() {
  static Live = Layer.effect(this, LayerImpl).pipe(
    Layer.provide(
      makeFileCacheStorageLayer("project-path-cache", ProjectPathSchema),
    ),
    Layer.provide(PersistentService.Live),
  );
}
