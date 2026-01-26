import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import { Context, Data, Effect, Layer, Option } from "effect";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";

class ProjectPathNotFoundError extends Data.TaggedError(
  "ProjectPathNotFoundError",
)<{
  projectId: string;
}> {}

class OpenSpecDirectoryNotFoundError extends Data.TaggedError(
  "OpenSpecDirectoryNotFoundError",
)<{
  path: string;
  message: string;
}> {}

export interface OpenSpecChangeItem {
  name: string;
  status: "draft" | "ready" | "implementing" | "review" | "archived";
  description?: string;
  updatedAt: string;
}

export interface OpenSpecChangeDetails {
  name: string;
  proposalContent?: string;
  designContent?: string;
  tasksContent?: string;
  specFiles: { name: string; content: string }[];
}

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;

  const getChanges = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const changesDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
      );

      const exists = yield* fs.exists(changesDir);
      if (!exists) {
        // If openspec/changes doesn't exist, return empty list (not error)
        return [];
      }

      const entries = yield* fs.readDirectory(changesDir);

      const changes: OpenSpecChangeItem[] = [];

      for (const entry of entries) {
        const entryPath = path.join(changesDir, entry);
        const stat = yield* fs.stat(entryPath);

        if (stat.type === "Directory") {
          // Basic status inference
          let status: OpenSpecChangeItem["status"] = "draft";

          // Check for tasks.md to upgrade status
          const tasksExists = yield* fs.exists(
            path.join(entryPath, "tasks.md"),
          );
          if (tasksExists) {
            status = "implementing"; // Simply assume implementing if tasks exist for now
          }

          // Check description from package.json or simple heuristics?
          // For now, no description reading to keep it fast.

          changes.push({
            name: entry,
            status,
            updatedAt: Option.getOrElse(
              stat.mtime,
              () => new Date(),
            ).toISOString(),
            description: "", // Placeholder
          });
        }
      }

      // Sort by updatedAt desc
      return changes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });

  const getChangeDetails = (projectId: string, changeId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const changeDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        changeId,
      );
      const exists = yield* fs.exists(changeDir);

      if (!exists) {
        return yield* Effect.fail(
          new OpenSpecDirectoryNotFoundError({
            path: changeDir,
            message: `Change directory not found: ${changeId}`,
          }),
        );
      }

      // Read proposal.md
      const proposalPath = path.join(changeDir, "proposal.md");
      const proposalContent = (yield* fs.exists(proposalPath))
        ? yield* fs.readFileString(proposalPath)
        : undefined;

      // Read design.md
      const designPath = path.join(changeDir, "design.md");
      const designContent = (yield* fs.exists(designPath))
        ? yield* fs.readFileString(designPath)
        : undefined;

      // Read tasks.md
      const tasksPath = path.join(changeDir, "tasks.md");
      const tasksContent = (yield* fs.exists(tasksPath))
        ? yield* fs.readFileString(tasksPath)
        : undefined;

      // List specs/ files recursively
      const specsDir = path.join(changeDir, "specs");
      let specFiles: { name: string; content: string }[] = [];

      const getFilesRecursively = (
        dir: string,
      ): Effect.Effect<string[], Error, FileSystem.FileSystem> =>
        Effect.gen(function* () {
          if (!(yield* fs.exists(dir))) return [];

          const entries = yield* fs.readDirectory(dir);
          let results: string[] = [];

          for (const entry of entries) {
            const entryPath = path.join(dir, entry);
            if (entry.startsWith(".")) continue;

            const stat = yield* fs.stat(entryPath);
            if (stat.type === "Directory") {
              const subFiles = yield* getFilesRecursively(entryPath);
              results = [...results, ...subFiles];
            } else {
              results.push(entryPath);
            }
          }
          return results;
        });

      if (yield* fs.exists(specsDir)) {
        const filePaths = yield* getFilesRecursively(specsDir);

        specFiles = yield* Effect.all(
          filePaths.map((filePath) =>
            Effect.gen(function* () {
              const content = yield* fs.readFileString(filePath);
              const relativeName = path.relative(specsDir, filePath);
              return { name: relativeName, content };
            }),
          ),
          { concurrency: "unbounded" },
        );
      }

      return {
        name: changeId,
        proposalContent,
        designContent,
        tasksContent,
        specFiles,
      } as OpenSpecChangeDetails;
    });

  return {
    getChanges,
    getChangeDetails,
  };
});

export type IOpenSpecService = InferEffect<typeof LayerImpl>;

export class OpenSpecService extends Context.Tag("OpenSpecService")<
  OpenSpecService,
  IOpenSpecService
>() {
  static Live = Layer.effect(this, LayerImpl);
}
