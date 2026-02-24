import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";

export type FileCompletionEntry = {
  name: string;
  type: "file" | "directory";
  path: string;
};

export type FileCompletionResult = {
  entries: FileCompletionEntry[];
  basePath: string;
  projectPath: string;
};

/**
 * Get file and directory completions for a given project path
 * @param projectPath - The root project path
 * @param basePath - The relative path from project root (default: "/")
 * @returns File and directory entries at the specified path level
 */
export const getFileCompletion = (
  projectPath: string,
  basePath = "/",
): Effect.Effect<
  FileCompletionResult,
  Error,
  FileSystem.FileSystem | Path.Path
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Normalize basePath to prevent directory traversal
    const normalizedBasePath =
      basePath.startsWith("/") || basePath.startsWith("\\")
        ? basePath.slice(1)
        : basePath;
    const targetPath = path.resolve(projectPath, normalizedBasePath);
    const resolvedProjectPath = path.resolve(projectPath);
    const relativeToProject = path.relative(resolvedProjectPath, targetPath);
    const targetEscapesProject =
      relativeToProject !== "" &&
      (relativeToProject === ".." ||
        relativeToProject.startsWith(`..${path.sep}`) ||
        relativeToProject.startsWith("../") ||
        relativeToProject.startsWith("..\\") ||
        /^[A-Za-z]:[\\/]/.test(relativeToProject) ||
        relativeToProject.startsWith("/") ||
        relativeToProject.startsWith("\\"));

    // Security check: ensure target path is within project directory
    if (targetEscapesProject) {
      return yield* Effect.fail(
        new Error("Invalid path: outside project directory"),
      );
    }

    // Check if the target path exists
    const exists = yield* fs.exists(targetPath);
    if (!exists) {
      return {
        entries: [],
        basePath: normalizedBasePath,
        projectPath,
      };
    }

    try {
      const dirents = yield* fs.readDirectory(targetPath);
      const entries: FileCompletionEntry[] = [];

      // Process each directory entry
      for (const dirent of dirents) {
        // Skip hidden files and directories (starting with .)
        if (dirent.startsWith(".")) {
          continue;
        }

        const direntPath = path.join(targetPath, dirent);
        const stat = yield* fs.stat(direntPath);
        const entryPath = normalizedBasePath
          ? path.join(normalizedBasePath, dirent)
          : dirent;

        if (stat.type === "Directory") {
          entries.push({
            name: dirent,
            type: "directory",
            path: entryPath,
          });
        } else if (stat.type === "File") {
          entries.push({
            name: dirent,
            type: "file",
            path: entryPath,
          });
        }
      }

      // Sort entries: directories first, then files, both alphabetically
      entries.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        entries,
        basePath: normalizedBasePath,
        projectPath,
      };
    } catch (error) {
      console.error("Error reading directory:", error);
      return {
        entries: [],
        basePath: normalizedBasePath,
        projectPath,
      };
    }
  });
