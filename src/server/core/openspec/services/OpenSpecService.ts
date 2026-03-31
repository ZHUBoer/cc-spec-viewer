import { FileSystem, Path } from "@effect/platform";
import { Context, Data, Effect, Layer, Option } from "effect";
import {
  type D2CArtifactFile,
  type D2CInfo,
  extractD2CInfoFromSpec,
  mergeD2CInfo,
  parseD2CManifest,
} from "../../../../lib/openspec/d2c";
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
  status:
    | "draft"
    | "designing"
    | "design-confirmed"
    | "task-planning"
    | "implementing"
    | "completed"
    | "archived";
  description?: string;
  updatedAt: string;
  d2c?: D2CInfo;
}

export interface OpenSpecChangeDetails extends OpenSpecChangeItem {
  specContent?: string;
  proposalContent?: string;
  designContent?: string;
  tasksContent?: string;
  testsContent?: string; // New: Tests content
  specsContent?: string; // New: Root specs content
  specFiles: { name: string; content: string }[];
  d2c?: D2CInfo;
}

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const readPrimarySpecContent = (dirPath: string) =>
    Effect.gen(function* () {
      const specPath = path.join(dirPath, "spec.md");
      const proposalPath = path.join(dirPath, "proposal.md");

      const specContent = (yield* fs.exists(specPath))
        ? yield* fs.readFileString(specPath)
        : undefined;
      const proposalContent = (yield* fs.exists(proposalPath))
        ? yield* fs.readFileString(proposalPath)
        : undefined;

      return {
        specContent,
        proposalContent,
        primaryContent: specContent ?? proposalContent,
      };
    });

  /**
   * 检查 tasks.md 中的所有任务是否已完成
   */
  const checkAllTasksCompleted = (tasksContent: string): boolean => {
    const checkboxes = tasksContent.match(/- \[(x| )\]/g);
    if (!checkboxes || checkboxes.length === 0) {
      return false;
    }
    return checkboxes.every((cb) => cb.includes("x"));
  };

  /**
   * 推断 Change 的状态
   */
  const inferStatus = (
    designContent: string | undefined,
    tasksContent: string | undefined,
  ): OpenSpecChangeItem["status"] => {
    // 1. 实施阶段检测
    if (tasksContent) {
      const tasksConfirmed = tasksContent.includes(
        "<!-- TASKS_CONFIRMED: true -->",
      );
      const allTasksComplete = checkAllTasksCompleted(tasksContent);

      if (allTasksComplete) {
        return "completed";
      }

      if (tasksConfirmed) {
        return "implementing";
      }

      return "task-planning";
    }

    // 2. 设计阶段检测
    if (designContent) {
      const designFinalConfirmed = designContent.includes(
        "<!-- DESIGN_FINAL_CONFIRMATION: true -->",
      );

      if (designFinalConfirmed) {
        return "design-confirmed";
      }

      return "designing";
    }

    // 3. 初始阶段
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
          // Try to extract description from spec.md, fallback to proposal.md
          let description = "";
          const { primaryContent } = yield* readPrimarySpecContent(entryPath);
          if (primaryContent) {
            const lines = primaryContent.split("\n");
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

          const d2c = extractD2CInfoFromSpec(primaryContent);

          // Read design content for status inference
          const designPath = path.join(entryPath, "design.md");
          const architecturePath = path.join(entryPath, "architecture.md");
          let designContent: string | undefined;

          if (yield* fs.exists(architecturePath)) {
            designContent = yield* fs.readFileString(architecturePath);
          } else if (yield* fs.exists(designPath)) {
            designContent = yield* fs.readFileString(designPath);
          }

          // Read tasks content for status inference
          const tasksPath = path.join(entryPath, "tasks.md");
          let tasksContent: string | undefined;
          if (yield* fs.exists(tasksPath)) {
            tasksContent = yield* fs.readFileString(tasksPath);
          }

          changes.push({
            name: entry,
            status: inferStatus(designContent, tasksContent),
            updatedAt: Option.getOrElse(
              stat.mtime,
              () => new Date(),
            ).toISOString(),
            description: description,
            d2c,
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
      const isArchived = /[\\/]archive[\\/]/.test(changeDir);

      // Read spec.md first, fallback to proposal.md for compatibility
      const { specContent, proposalContent, primaryContent } =
        yield* readPrimarySpecContent(changeDir);

      // Extract description from primary spec content
      let description = "";
      if (primaryContent) {
        const lines = primaryContent.split("\n");
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

      const d2cDir = path.join(changeDir, "d2c");
      const d2cManifestPath = path.join(d2cDir, "manifest.json");

      const readArtifactFiles = (): Effect.Effect<
        D2CArtifactFile[],
        Error,
        FileSystem.FileSystem | Path.Path
      > =>
        Effect.gen(function* () {
          if (!(yield* fs.exists(d2cDir))) {
            return [];
          }

          const entries = yield* fs.readDirectory(d2cDir);
          const result: D2CArtifactFile[] = [];

          for (const entry of entries) {
            const entryPath = path.join(d2cDir, entry);
            const stat = yield* fs.stat(entryPath);
            if (stat.type !== "Directory") {
              continue;
            }

            const tsxPath = path.join(entryPath, "index.tsx");
            const scssPath = path.join(entryPath, "index.module.scss");
            const tsxExists = yield* fs.exists(tsxPath);
            const scssExists = yield* fs.exists(scssPath);
            if (!tsxExists || !scssExists) {
              continue;
            }

            const tsxContent = yield* fs.readFileString(tsxPath);
            const scssContent = yield* fs.readFileString(scssPath);
            result.push({
              name: path.relative(d2cDir, tsxPath),
              content: tsxContent,
            } satisfies D2CArtifactFile);
            result.push({
              name: path.relative(d2cDir, scssPath),
              content: scssContent,
            } satisfies D2CArtifactFile);
          }

          return result;
        });

      const specD2C = extractD2CInfoFromSpec(specContent ?? proposalContent);
      const d2cManifest = parseD2CManifest(
        (yield* fs.exists(d2cManifestPath))
          ? yield* fs.readFileString(d2cManifestPath)
          : undefined,
      );
      const generatedFiles = yield* readArtifactFiles();
      const previewFiles: D2CArtifactFile[] = [];
      const d2c = mergeD2CInfo({
        specInfo: specD2C,
        manifest: d2cManifest,
        generatedFiles,
        previewFiles,
      });

      const details: OpenSpecChangeDetails = {
        name: changeId,
        status: isArchived
          ? "archived"
          : inferStatus(designContent, tasksContent),
        updatedAt: Option.getOrElse(stat.mtime, () => new Date()).toISOString(),
        description: description,
        specContent,
        proposalContent,
        designContent,
        tasksContent,
        testsContent,
        specsContent,
        specFiles,
        d2c,
      };
      return details;
    });

  const updateChangeFile = (
    projectId: string,
    changeId: string,
    fileName: string,
    content: string,
  ) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      // Validate fileName to prevent directory traversal
      const allowedFiles = [
        "design.md",
        "spec.md",
        "proposal.md",
        "tasks.md",
        "tests.md",
        "specs.md",
      ];
      // Also allow files in specs/ directory
      const isSpecsFile =
        fileName.startsWith("specs/") && !fileName.includes("..");

      if (!allowedFiles.includes(fileName) && !isSpecsFile) {
        return yield* Effect.fail(
          new Error(`Invalid file name for update: ${fileName}`),
        );
      }

      let changeDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        changeId,
      );

      // Check standard changes first
      let exists = yield* fs.exists(changeDir);

      // If not found in changes, check archive (allow editing archived? maybe no, but let's locate it first)
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

      const specPath = path.join(changeDir, "spec.md");
      const proposalPath = path.join(changeDir, "proposal.md");
      const normalizedFileName =
        fileName === "proposal.md" ? "spec.md" : fileName;
      const writeLegacyProposalFile =
        normalizedFileName === "spec.md" &&
        !(yield* fs.exists(specPath)) &&
        (yield* fs.exists(proposalPath));
      const targetFileName = writeLegacyProposalFile
        ? "proposal.md"
        : normalizedFileName;
      const filePath = path.join(changeDir, targetFileName);
      yield* fs.writeFileString(filePath, content);
    });

  return {
    getChanges,
    getArchivedChanges,
    getChangeDetails,
    updateChangeFile,
  };
});

export type IOpenSpecService = Effect.Effect.Success<typeof LayerImpl>;

export class OpenSpecService extends Context.Tag("OpenSpecService")<
  OpenSpecService,
  IOpenSpecService
>() {
  static Live = Layer.effect(this, LayerImpl);
}
