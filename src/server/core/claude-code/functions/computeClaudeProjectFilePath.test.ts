import path from "node:path";
import { Path } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { computeClaudeProjectFilePath } from "./computeClaudeProjectFilePath";

describe("computeClaudeProjectFilePath", () => {
  const TEST_GLOBAL_CLAUDE_DIR = "/test/mock/claude";
  const TEST_PROJECTS_DIR = path.join(TEST_GLOBAL_CLAUDE_DIR, "projects");

  it("Calculate Claude config directory path from project path", async () => {
    const projectPath = "/home/me/dev/example";
    const expected = `${TEST_PROJECTS_DIR}/-home-me-dev-example`;

    const result = await Effect.runPromise(
      computeClaudeProjectFilePath({
        projectPath,
        claudeProjectsDirPath: TEST_PROJECTS_DIR,
      }).pipe(Effect.provide(Path.layer)),
    );

    expect(result).toBe(expected);
  });

  it("Correctly handles trailing slashes", async () => {
    const projectPath = "/home/me/dev/example/";
    const expected = `${TEST_PROJECTS_DIR}/-home-me-dev-example`;

    const result = await Effect.runPromise(
      computeClaudeProjectFilePath({
        projectPath,
        claudeProjectsDirPath: TEST_PROJECTS_DIR,
      }).pipe(Effect.provide(Path.layer)),
    );

    expect(result).toBe(expected);
  });
});
