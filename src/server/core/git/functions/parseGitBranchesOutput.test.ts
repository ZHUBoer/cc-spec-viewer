import { describe, expect, it } from "vitest";
import { parseGitBranchesOutput } from "./parseGitBranchesOutput";

describe("getBranches", () => {
  describe("Normal cases", () => {
    it("Can retrieve branch list", async () => {
      const mockOutput = `* main                abc1234 [origin/main: ahead 1] Latest commit
  remotes/origin/main abc1234 Latest commit
  feature             def5678 [origin/feature] Feature commit`;

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);

        expect(result.data[0]).toEqual({
          name: "main",
          current: true,
          remote: "origin/main",
          commit: "abc1234",
          ahead: 1,
          behind: undefined,
        });

        expect(result.data[1]).toEqual({
          name: "feature",
          current: false,
          remote: "origin/feature",
          commit: "def5678",
          ahead: undefined,
          behind: undefined,
        });
      }
    });

    it("Can handle branches with both ahead/behind", async () => {
      const mockOutput =
        "* main     abc1234 [origin/main: ahead 2, behind 3] Commit message";

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
          name: "main",
          current: true,
          remote: "origin/main",
          commit: "abc1234",
          ahead: 2,
          behind: 3,
        });
      }
    });

    it("Excludes remote tracking branches", async () => {
      const mockOutput = `* main                abc1234 [origin/main] Latest commit
  remotes/origin/main abc1234 Latest commit
  feature             def5678 Feature commit
  remotes/origin/feature def5678 Feature commit`;

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.name).toBe("main");
        expect(result.data[1]?.name).toBe("feature");
      }
    });

    it("Returns empty result (when no branches)", async () => {
      const mockOutput = "";

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("Skips incorrectly formatted lines", async () => {
      const mockOutput = `* main     abc1234 [origin/main] Latest commit
invalid line
  feature  def5678 Feature commit`;

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.name).toBe("main");
        expect(result.data[1]?.name).toBe("feature");
      }
    });
  });

  describe("Edge cases", () => {
    it("Can handle branch names with special characters", async () => {
      const mockOutput = `* feature/special-chars_123 abc1234 Commit
  feature/日本語ブランチ      def5678 日本語コミット`;

      const result = parseGitBranchesOutput(mockOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.name).toBe("feature/special-chars_123");
        expect(result.data[1]?.name).toBe("feature/日本語ブランチ");
      }
    });
  });
});
