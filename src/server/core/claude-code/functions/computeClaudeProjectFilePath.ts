import { Path } from "@effect/platform";
import { Effect } from "effect";
import { normalizeClaudeProjectPath } from "../../project/functions/normalizeClaudeProjectPath";

export const computeClaudeProjectFilePath = (options: {
  projectPath: string;
  claudeProjectsDirPath: string;
}) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const { projectPath, claudeProjectsDirPath } = options;
    const normalizedProjectPath = normalizeClaudeProjectPath(projectPath);

    // 统一路径字符，确保在不同平台下生成稳定的 Claude project 目录名
    return path.join(claudeProjectsDirPath, normalizedProjectPath);
  });
