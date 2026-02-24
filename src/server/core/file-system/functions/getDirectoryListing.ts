import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";

export type DirectoryEntry = {
  name: string;
  type: "file" | "directory";
  path: string;
};

export type DirectoryListingResult = {
  entries: DirectoryEntry[];
  basePath: string;
  currentPath: string;
};

export const getDirectoryListing = (
  rootPath: string,
  basePath = "/",
  showHidden = false,
): Effect.Effect<
  DirectoryListingResult,
  Error,
  FileSystem.FileSystem | Path.Path
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const normalizedBasePath =
      basePath === "/"
        ? ""
        : basePath.startsWith("/") || basePath.startsWith("\\")
          ? basePath.slice(1)
          : basePath;
    const targetPath = path.resolve(rootPath, normalizedBasePath);
    const resolvedRootPath = path.resolve(rootPath);
    const relativeToRoot = path.relative(resolvedRootPath, targetPath);
    const targetEscapesRoot =
      relativeToRoot !== "" &&
      (relativeToRoot === ".." ||
        relativeToRoot.startsWith(`..${path.sep}`) ||
        relativeToRoot.startsWith("../") ||
        relativeToRoot.startsWith("..\\") ||
        /^[A-Za-z]:[\\/]/.test(relativeToRoot) ||
        relativeToRoot.startsWith("/") ||
        relativeToRoot.startsWith("\\"));

    if (targetEscapesRoot) {
      return yield* Effect.fail(
        new Error("Invalid path: outside root directory"),
      );
    }

    const exists = yield* fs.exists(targetPath);
    if (!exists) {
      return {
        entries: [],
        basePath: "/",
        currentPath: rootPath,
      };
    }

    try {
      const dirents = yield* fs.readDirectory(targetPath);
      const entries: DirectoryEntry[] = [];

      if (normalizedBasePath !== "") {
        const parentPath = path.dirname(normalizedBasePath);
        entries.push({
          name: "..",
          type: "directory",
          path: parentPath === "." ? "" : parentPath,
        });
      }

      for (const dirent of dirents) {
        if (!showHidden && dirent.startsWith(".")) {
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

      entries.sort((a, b) => {
        if (a.name === "..") return -1;
        if (b.name === "..") return 1;
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        entries,
        basePath: normalizedBasePath || "/",
        currentPath: targetPath,
      };
    } catch (error) {
      console.error("Error reading directory:", error);
      return {
        entries: [],
        basePath: normalizedBasePath || "/",
        currentPath: targetPath,
      };
    }
  });
