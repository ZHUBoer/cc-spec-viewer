import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";
import { z } from "zod";
import { resolveHomeDirFromEnv } from "../../../lib/config/resolveHomeDirFromEnv";
import { CcvOptionsService } from "../../platform/services/CcvOptionsService";

const ClaudeSettingsSchema = z.object({
  env: z.record(z.string(), z.coerce.string()).optional(),
});

/**
 * 读取 ~/.claude/settings.json 中的 env 字段，作为进程环境变量的补充。
 * Windows 用户习惯把 ANTHROPIC_AUTH_TOKEN 等写在 settings.json 里，
 * 而不是系统环境变量中。读取失败时静默返回空对象。
 */
export const readClaudeSettingsEnv: Effect.Effect<
  Record<string, string>,
  never,
  FileSystem.FileSystem | Path.Path | CcvOptionsService
> = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const ccvOptionsService = yield* CcvOptionsService;

  const claudeDir = yield* ccvOptionsService
    .getCcvOptions("claudeDir")
    .pipe(
      Effect.map((envVar) =>
        envVar === undefined
          ? path.resolve(resolveHomeDirFromEnv(), ".claude")
          : path.resolve(envVar),
      ),
    );

  const settingsPath = path.join(claudeDir, "settings.json");

  return yield* fs.readFileString(settingsPath).pipe(
    Effect.flatMap((content) =>
      Effect.try(() => {
        const parsed = ClaudeSettingsSchema.parse(JSON.parse(content));
        return parsed.env ?? {};
      }),
    ),
    Effect.catchAll(() => Effect.succeed<Record<string, string>>({})),
  );
});
