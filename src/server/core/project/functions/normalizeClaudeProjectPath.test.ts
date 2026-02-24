import { describe, expect, it } from "vitest";
import { normalizeClaudeProjectPath } from "./normalizeClaudeProjectPath";

describe("normalizeClaudeProjectPath", () => {
  it("normalizes Unix paths", () => {
    expect(normalizeClaudeProjectPath("/Users/me/my_project")).toBe(
      "-Users-me-my-project",
    );
  });

  it("normalizes Windows paths and strips trailing separators", () => {
    expect(normalizeClaudeProjectPath("C:\\Users\\me\\my_project\\")).toBe(
      "C--Users-me-my-project",
    );
  });
});
