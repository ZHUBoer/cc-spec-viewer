import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";
import parseGitDiff, {
  type AnyChunk,
  type AnyFileChange,
} from "parse-git-diff";
import {
  executeGitCommand,
  parseLines,
  stripAnsiColors,
} from "../functions/utils";
import type {
  GitComparisonResult,
  GitDiff,
  GitDiffFile,
  GitDiffHunk,
  GitDiffLine,
  GitResult,
} from "../types";

/**
 * Convert parse-git-diff file change to GitDiffFile
 */
function convertToGitDiffFile(
  fileChange: AnyFileChange,
  fileStats: Map<string, { additions: number; deletions: number }>,
): GitDiffFile {
  let filePath: string;
  let status: GitDiffFile["status"];
  let oldPath: string | undefined;

  switch (fileChange.type) {
    case "AddedFile":
      filePath = fileChange.path;
      status = "added";
      break;
    case "DeletedFile":
      filePath = fileChange.path;
      status = "deleted";
      break;
    case "RenamedFile":
      filePath = fileChange.pathAfter;
      oldPath = fileChange.pathBefore;
      status = "renamed";
      break;
    case "ChangedFile":
      filePath = fileChange.path;
      status = "modified";
      break;
    default:
      // Fallback for any unknown types
      filePath = "";
      status = "modified";
  }

  // Get stats from numstat
  const stats = fileStats.get(filePath) ||
    fileStats.get(oldPath || "") || { additions: 0, deletions: 0 };

  return {
    filePath,
    status,
    additions: stats.additions,
    deletions: stats.deletions,
    oldPath,
  };
}

/**
 * Convert parse-git-diff chunk to GitDiffHunk
 */
function convertToGitDiffHunk(chunk: AnyChunk): GitDiffHunk {
  if (chunk.type !== "Chunk") {
    // For non-standard chunks, return empty hunk
    return {
      oldStart: 0,
      oldCount: 0,
      newStart: 0,
      newCount: 0,
      header: "",
      lines: [],
    };
  }

  const lines: GitDiffLine[] = [];

  for (const change of chunk.changes) {
    let line: GitDiffLine;

    switch (change.type) {
      case "AddedLine":
        line = {
          type: "added",
          content: change.content,
          newLineNumber: change.lineAfter,
        };
        break;
      case "DeletedLine":
        line = {
          type: "deleted",
          content: change.content,
          oldLineNumber: change.lineBefore,
        };
        break;
      case "UnchangedLine":
        line = {
          type: "context",
          content: change.content,
          oldLineNumber: change.lineBefore,
          newLineNumber: change.lineAfter,
        };
        break;
      case "MessageLine":
        // This is likely a hunk header or context line
        line = {
          type: "context",
          content: change.content,
        };
        break;
      default:
        // Fallback for unknown line types
        line = {
          type: "context",
          content: "",
        };
    }

    lines.push(line);
  }

  return {
    oldStart: chunk.fromFileRange.start,
    oldCount: chunk.fromFileRange.lines,
    newStart: chunk.toFileRange.start,
    newCount: chunk.toFileRange.lines,
    header: `@@ -${chunk.fromFileRange.start},${chunk.fromFileRange.lines} +${chunk.toFileRange.start},${chunk.toFileRange.lines} @@${chunk.context ? ` ${chunk.context}` : ""}`,
    lines,
  };
}

const extractRef = (refText: string) => {
  const [group, ref] = refText.split(":");
  if (group === undefined || ref === undefined) {
    if (refText === "HEAD") {
      return "HEAD";
    }

    if (refText === "working") {
      return undefined;
    }

    throw new Error(`Invalid ref text: ${refText}`);
  }

  return ref;
};

/**
 * 获取未跟踪的文件（Effect 版本）
 */
const getUntrackedFiles = (cwd: string) =>
  Effect.gen(function* () {
    const statusData = yield* executeGitCommand(
      ["status", "--untracked-files=all", "--short"],
      cwd,
    );

    const untrackedFiles = parseLines(statusData)
      .map((line) => stripAnsiColors(line))
      .filter((line) => line.startsWith("??"))
      .map((line) => line.slice(3));

    return untrackedFiles;
  });

/**
 * 为未跟踪的文件创建人工 diff（所有行作为添加）（Effect 版本）
 */
const createUntrackedFileDiff = (cwd: string, filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const fullPath = path.resolve(cwd, filePath);

    // 读取文件内容
    const content = yield* fs.readFileString(fullPath);

    const lines = content.split("\n");

    const diffLines: GitDiffLine[] = lines.map((line, index) => ({
      type: "added" as const,
      content: line,
      newLineNumber: index + 1,
    }));

    const file: GitDiffFile = {
      filePath,
      status: "added",
      additions: lines.length,
      deletions: 0,
    };

    const hunk: GitDiffHunk = {
      oldStart: 0,
      oldCount: 0,
      newStart: 1,
      newCount: lines.length,
      header: `@@ -0,0 +1,${lines.length} @@`,
      lines: diffLines,
    };

    return {
      file,
      hunks: [hunk],
    };
  }).pipe(
    Effect.catchAll((error) => {
      // 跳过无法读取的文件（如二进制文件、权限错误）
      console.warn(`Failed to read untracked file ${filePath}:`, error);
      return Effect.succeed(null);
    }),
  );

/**
 * 获取两个引用（分支、提交、标签）之间的 Git diff（Effect 版本）
 */
export const getDiff = (cwd: string, fromRefText: string, toRefText: string) =>
  Effect.gen(function* () {
    const fromRef = extractRef(fromRefText);
    const toRef = extractRef(toRefText);

    if (fromRef === toRef) {
      return {
        success: true,
        data: {
          diffs: [],
          files: [],
          summary: {
            totalFiles: 0,
            totalAdditions: 0,
            totalDeletions: 0,
          },
        },
      } as const satisfies GitResult<GitComparisonResult>;
    }

    if (fromRef === undefined) {
      throw new Error(`Invalid fromRef: ${fromRefText}`);
    }

    const commandArgs = toRef === undefined ? [fromRef] : [fromRef, toRef];

    // 获取带有文件统计的 diff
    const numstatData = yield* executeGitCommand(
      ["diff", "--numstat", ...commandArgs],
      cwd,
    );

    // 获取带有完整内容的 diff
    const diffData = yield* executeGitCommand(
      ["diff", "--unified=5", ...commandArgs],
      cwd,
    );

    // 解析 numstat 输出以获取文件统计信息
    const fileStats = new Map<
      string,
      { additions: number; deletions: number }
    >();
    const numstatLines = parseLines(numstatData);

    for (const line of numstatLines) {
      const parts = line.split("\t");
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        const additions = parts[0] === "-" ? 0 : Number.parseInt(parts[0], 10);
        const deletions = parts[1] === "-" ? 0 : Number.parseInt(parts[1], 10);
        const filePath = parts[2];
        fileStats.set(filePath, { additions, deletions });
      }
    }

    // 使用 parse-git-diff 解析 diff 输出
    const parsedDiff = parseGitDiff(diffData);

    const files: GitDiffFile[] = [];
    const diffs: GitDiff[] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const fileChange of parsedDiff.files) {
      // 转换为 GitDiffFile 格式
      const file = convertToGitDiffFile(fileChange, fileStats);
      files.push(file);

      // 将 chunks 转换为 hunks
      const hunks: GitDiffHunk[] = [];
      for (const chunk of fileChange.chunks) {
        const hunk = convertToGitDiffHunk(chunk);
        hunks.push(hunk);
      }

      diffs.push({
        file,
        hunks,
      });

      totalAdditions += file.additions;
      totalDeletions += file.deletions;
    }

    // 当与工作目录比较时包含未跟踪的文件
    if (toRef === undefined) {
      const untrackedFiles = yield* getUntrackedFiles(cwd).pipe(
        Effect.catchAll(() => Effect.succeed<string[]>([])),
      );

      for (const untrackedFile of untrackedFiles) {
        const untrackedDiff = yield* createUntrackedFileDiff(
          cwd,
          untrackedFile,
        );
        if (untrackedDiff) {
          files.push(untrackedDiff.file);
          diffs.push(untrackedDiff);
          totalAdditions += untrackedDiff.file.additions;
        }
      }
    }

    return {
      success: true,
      data: {
        files,
        diffs,
        summary: {
          totalFiles: files.length,
          totalAdditions,
          totalDeletions,
        },
      },
    } as const satisfies GitResult<GitComparisonResult>;
  }).pipe(
    Effect.catchAll((error) => {
      // 处理所有错误并转换为 GitResult
      const errorMessage =
        error instanceof Error
          ? error.message
          : "message" in (error as object)
            ? String((error as { message: unknown }).message)
            : "Unknown error";

      return Effect.succeed({
        success: false,
        error: {
          code: "PARSE_ERROR" as const,
          message: `Failed to parse diff: ${errorMessage}`,
        },
      } as const satisfies GitResult<GitComparisonResult>);
    }),
  );

/**
 * 比较两个分支（getDiff 的快捷方式）（Effect 版本）
 */
export const compareBranches = (
  cwd: string,
  baseBranch: string,
  targetBranch: string,
) => getDiff(cwd, baseBranch, targetBranch);
