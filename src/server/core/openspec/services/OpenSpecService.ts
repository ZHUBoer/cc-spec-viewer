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
  // specs, design, tasks content can be added here
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
      let proposalContent: string | undefined;
      const proposalExists = yield* fs.exists(proposalPath);

      if (proposalExists) {
        proposalContent = yield* fs.readFileString(proposalPath);
      }

      return {
        name: changeId,
        proposalContent,
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
