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

export interface OpenSpecChangeDetails extends OpenSpecChangeItem {
  proposalContent?: string;
  designContent?: string;
  tasksContent?: string;
  testsContent?: string; // New: Tests content
  specsContent?: string; // New: Root specs content
  specFiles: { name: string; content: string }[];
}

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;

  const inferStatus = (existsTasks: boolean): OpenSpecChangeItem["status"] => {
    if (existsTasks) {
      return "implementing";
    }
    return "draft";
  };

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
        return [];
      }

      const entries = yield* fs.readDirectory(changesDir);
      const changes: OpenSpecChangeItem[] = [];

      for (const entry of entries) {
        if (entry === "archive") continue;

        const entryPath = path.join(changesDir, entry);
        const stat = yield* fs.stat(entryPath);

        if (stat.type === "Directory") {
          const tasksExists = yield* fs.exists(
            path.join(entryPath, "tasks.md"),
          );

          // Try to extract description from proposal.md
          let description = "";
          const proposalPath = path.join(entryPath, "proposal.md");
          if (yield* fs.exists(proposalPath)) {
            const content = yield* fs.readFileString(proposalPath);
            const lines = content.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (
                trimmed &&
                !trimmed.startsWith("#") &&
                !trimmed.startsWith("![")
              ) {
                description = trimmed;
                break;
              }
            }
          }

          changes.push({
            name: entry,
            status: inferStatus(tasksExists),
            updatedAt: Option.getOrElse(
              stat.mtime,
              () => new Date(),
            ).toISOString(),
            description: description,
          });
        }
      }

      return changes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });

  const getArchivedChanges = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const archiveDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        "archive",
      );

      const exists = yield* fs.exists(archiveDir);
      if (!exists) {
        return [];
      }

      const entries = yield* fs.readDirectory(archiveDir);
      const changes: OpenSpecChangeItem[] = [];

      for (const entry of entries) {
        const entryPath = path.join(archiveDir, entry);
        const stat = yield* fs.stat(entryPath);

        if (stat.type === "Directory") {
          changes.push({
            name: entry,
            status: "archived",
            updatedAt: Option.getOrElse(
              stat.mtime,
              () => new Date(),
            ).toISOString(),
            description: "", // Placeholder
          });
        }
      }

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

      // Check standard changes first
      let changeDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        changeId,
      );

      let exists = yield* fs.exists(changeDir);

      // If not found in changes, check archive
      if (!exists) {
        const archiveDir = path.join(
          project.meta.projectPath,
          "openspec",
          "changes",
          "archive",
          changeId,
        );
        if (yield* fs.exists(archiveDir)) {
          changeDir = archiveDir;
          exists = true;
        }
      }

      if (!exists) {
        return yield* Effect.fail(
          new OpenSpecDirectoryNotFoundError({
            path: changeDir,
            message: `Change directory not found: ${changeId}`,
          }),
        );
      }

      const stat = yield* fs.stat(changeDir);
      const isArchived = changeDir.includes("/archive/");

      // Read proposal.md
      const proposalPath = path.join(changeDir, "proposal.md");
      const proposalContent = (yield* fs.exists(proposalPath))
        ? yield* fs.readFileString(proposalPath)
        : undefined;

      // Extract description from proposal content
      let description = "";
      if (proposalContent) {
        const lines = proposalContent.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed &&
            !trimmed.startsWith("#") &&
            !trimmed.startsWith("![")
          ) {
            description = trimmed;
            break;
          }
        }
      }

      // Read architecture.md (preferred) or design.md (fallback)
      const architecturePath = path.join(changeDir, "architecture.md");
      const designPath = path.join(changeDir, "design.md");

      let designContent: string | undefined;

      if (yield* fs.exists(architecturePath)) {
        designContent = yield* fs.readFileString(architecturePath);
      } else if (yield* fs.exists(designPath)) {
        designContent = yield* fs.readFileString(designPath);
      }

      // Read tasks.md
      const tasksPath = path.join(changeDir, "tasks.md");
      const tasksExists = yield* fs.exists(tasksPath);
      const tasksContent = tasksExists
        ? yield* fs.readFileString(tasksPath)
        : undefined;

      // Read tests.md
      const testsPath = path.join(changeDir, "tests.md");
      const testsContent = (yield* fs.exists(testsPath))
        ? yield* fs.readFileString(testsPath)
        : undefined;

      // Read root specs.md
      const rootSpecsPath = path.join(changeDir, "specs.md");
      const specsContent = (yield* fs.exists(rootSpecsPath))
        ? yield* fs.readFileString(rootSpecsPath)
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
        status: isArchived ? "archived" : inferStatus(tasksExists),
        updatedAt: Option.getOrElse(stat.mtime, () => new Date()).toISOString(),
        description: description,
        proposalContent,
        designContent,
        tasksContent,
        testsContent,
        specsContent,
        specFiles,
      } as OpenSpecChangeDetails;
    });

  return {
    getChanges,
    getArchivedChanges,
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
