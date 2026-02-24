import { Command, FileSystem, Path } from "@effect/platform";
import { Data, Effect, Either } from "effect";

import type { GitError } from "../types";

/**
 * Git 命令错误（导出供测试使用）
 */
export class GitCommandError extends Data.TaggedError("GitCommandError")<{
  code: GitError["code"];
  message: string;
  command: string;
  stderr?: string;
}> {}

/**
 * 检查错误对象是否包含 stderr 信息
 */
function hasStderr(error: unknown): error is { stderr?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    ("stderr" in error || "message" in error)
  );
}

/**
 * 执行 Git 命令（Effect 版本）
 */
export const executeGitCommand = (args: string[], cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // 解析并检查目录是否存在
    const absoluteCwd = path.resolve(cwd);
    const dirExists = yield* fs.exists(absoluteCwd);

    if (!dirExists) {
      return yield* Effect.fail(
        new GitCommandError({
          code: "NOT_A_REPOSITORY",
          message: `Directory does not exist: ${cwd}`,
          command: `git ${args.join(" ")}`,
        }),
      );
    }

    // Git 会自动搜索父目录中的 .git，因此不需要显式检查

    // 创建并执行 git 命令
    const command = Command.make("git", ...args).pipe(
      Command.workingDirectory(absoluteCwd),
    );

    const result = yield* Effect.either(Command.string(command));

    if (Either.isLeft(result)) {
      const error = result.left;
      let errorCode: GitError["code"] = "COMMAND_FAILED";
      let errorMessage = "Unknown git command error";
      let stderr: string | undefined;

      // 安全地提取错误信息（不使用 as 转换）
      if (hasStderr(error)) {
        const stderrContent = String(error.stderr || "");
        stderr = stderrContent;

        if (stderrContent.includes("not a git repository")) {
          errorCode = "NOT_A_REPOSITORY";
          errorMessage = "Not a git repository";
        } else if (stderrContent.includes("unknown revision")) {
          errorCode = "BRANCH_NOT_FOUND";
          errorMessage = "Branch or commit not found";
        } else if ("message" in error) {
          errorMessage = String(error.message);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return yield* Effect.fail(
        new GitCommandError({
          code: errorCode,
          message: errorMessage,
          command: `git ${args.join(" ")}`,
          stderr,
        }),
      );
    }

    return result.right;
  });

/**
 * 检查目录是否是 Git 仓库（Effect 版本）
 */
export const isGitRepository = (cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const absoluteCwd = path.resolve(cwd);
    const cwdExists = yield* fs.exists(absoluteCwd);

    if (!cwdExists) {
      return false;
    }

    const gitPath = path.resolve(absoluteCwd, ".git");
    const gitExists = yield* fs.exists(gitPath);

    return gitExists;
  });

/**
 * Remove ANSI color codes from a string
 */
export function stripAnsiColors(text: string): string {
  // ANSI escape sequence pattern: \x1B[...m
  // biome-ignore lint/suspicious/noControlCharactersInRegex: this is a valid regex
  return text.replace(/\x1B\[[0-9;]*m/g, "");
}

/**
 * Safely parse git command output that might be empty
 */
export function parseLines(output: string): string[] {
  return output
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
}

/**
 * Parse git status porcelain output
 */
export function parseStatusLine(line: string): {
  status: string;
  filePath: string;
  oldPath?: string;
} {
  const status = line.slice(0, 2);
  const filePath = line.slice(3);

  // Handle renamed files (R  old -> new)
  if (status.startsWith("R")) {
    const parts = filePath.split(" -> ");
    return {
      status,
      filePath: parts[1] || filePath,
      oldPath: parts[0],
    };
  }

  return { status, filePath };
}

/**
 * Convert git status code to readable status
 */
export function getFileStatus(
  statusCode: string,
): "added" | "modified" | "deleted" | "renamed" | "copied" {
  const firstChar = statusCode[0];

  switch (firstChar) {
    case "A":
      return "added";
    case "M":
      return "modified";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "C":
      return "copied";
    default:
      return "modified";
  }
}
