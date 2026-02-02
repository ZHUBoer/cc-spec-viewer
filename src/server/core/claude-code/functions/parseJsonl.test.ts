import { describe, expect, it } from "vitest";
import type { ErrorJsonl } from "../../types";
import { parseJsonl } from "./parseJsonl";

describe("parseJsonl", () => {
  describe("Normal flow: can parse valid JSONL", () => {
    it("Can parse a single User entry", () => {
      const jsonl = JSON.stringify({
        type: "user",
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: { role: "user", content: "Hello" },
        isSidechain: false,
        userType: "external",
        cwd: "/test",
        sessionId: "session-1",
        version: "1.0.0",
        parentUuid: null,
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "user");
      const entry = result[0];
      if (entry && entry.type === "user") {
        expect(entry.message.content).toBe("Hello");
      }
    });

    it("Can parse a single Summary entry", () => {
      const jsonl = JSON.stringify({
        type: "summary",
        summary: "This is a summary",
        leafUuid: "550e8400-e29b-41d4-a716-446655440003",
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "summary");
      const entry = result[0];
      if (entry && entry.type === "summary") {
        expect(entry.summary).toBe("This is a summary");
      }
    });

    it("Can parse multiple entries", () => {
      const jsonl = [
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        JSON.stringify({
          type: "summary",
          summary: "Test summary",
          leafUuid: "550e8400-e29b-41d4-a716-446655440002",
        }),
      ].join("\n");

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("type", "user");
      expect(result[1]).toHaveProperty("type", "summary");
    });
  });

  describe("Error cases: return invalid JSON lines as ErrorJsonl", () => {
    it("Passing invalid JSON throws an error", () => {
      const jsonl = "invalid json";

      // The parseJsonl implementation directly calls JSON.parse,
      // so invalid JSON will throw an exception
      expect(() => parseJsonl(jsonl)).toThrow();
    });

    it("Returns objects that don't match the schema as ErrorJsonl", () => {
      const jsonl = JSON.stringify({
        type: "unknown",
        someField: "value",
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      const errorEntry = result[0] as ErrorJsonl;
      expect(errorEntry.type).toBe("x-error");
      expect(errorEntry.lineNumber).toBe(1);
    });

    it("Returns entries missing required fields as ErrorJsonl", () => {
      const jsonl = JSON.stringify({
        type: "user",
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        // Missing required fields like timestamp, message, etc.
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      const errorEntry = result[0] as ErrorJsonl;
      expect(errorEntry.type).toBe("x-error");
      expect(errorEntry.lineNumber).toBe(1);
    });

    it("Returns a mix of normal entries and error entries", () => {
      const jsonl = [
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        JSON.stringify({ type: "invalid-schema" }),
        JSON.stringify({
          type: "summary",
          summary: "Summary text",
          leafUuid: "550e8400-e29b-41d4-a716-446655440001",
        }),
      ].join("\n");

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty("type", "user");
      expect(result[1]).toHaveProperty("type", "x-error");
      expect(result[2]).toHaveProperty("type", "summary");

      const errorEntry = result[1] as ErrorJsonl;
      expect(errorEntry.lineNumber).toBe(2);
    });
  });

  describe("Edge cases: empty lines, trimming, multiple entries", () => {
    it("Passing empty string returns empty array", () => {
      const result = parseJsonl("");

      expect(result).toEqual([]);
    });

    it("Passing only empty lines returns empty array", () => {
      const result = parseJsonl("\n\n\n");

      expect(result).toEqual([]);
    });

    it("Trims leading and trailing whitespace", () => {
      const jsonl = `  
        ${JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        })}
        `;

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "user");
    });

    it("Excludes empty lines between entries", () => {
      const jsonl = [
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        "",
        "",
        JSON.stringify({
          type: "summary",
          summary: "Summary text",
          leafUuid: "550e8400-e29b-41d4-a716-446655440001",
        }),
      ].join("\n");

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("type", "user");
      expect(result[1]).toHaveProperty("type", "summary");
    });

    it("Excludes lines containing only whitespace", () => {
      const jsonl = [
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        "   ",
        "\t",
        JSON.stringify({
          type: "summary",
          summary: "Summary text",
          leafUuid: "550e8400-e29b-41d4-a716-446655440001",
        }),
      ].join("\n");

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("type", "user");
      expect(result[1]).toHaveProperty("type", "summary");
    });

    it("Can parse JSONL containing a large number of entries", () => {
      const entries = Array.from({ length: 100 }, (_, i) => {
        return JSON.stringify({
          type: "user",
          uuid: `550e8400-e29b-41d4-a716-${String(i).padStart(12, "0")}`,
          timestamp: new Date(Date.UTC(2024, 0, 1, 0, 0, i)).toISOString(),
          message: {
            role: "user",
            content: `Message ${i}`,
          },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid:
            i > 0
              ? `550e8400-e29b-41d4-a716-${String(i - 1).padStart(12, "0")}`
              : null,
        });
      });

      const jsonl = entries.join("\n");
      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(100);
      expect(result.every((entry) => entry.type === "user")).toBe(true);
    });
  });

  describe("Line number accuracy", () => {
    it("Line numbers are accurately recorded on schema validation errors", () => {
      const jsonl = [
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2024-01-01T00:00:00.000Z",
          message: { role: "user", content: "Line 1" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        JSON.stringify({ type: "invalid", data: "schema error" }),
        JSON.stringify({
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440001",
          timestamp: "2024-01-01T00:00:01.000Z",
          message: { role: "user", content: "Line 3" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        }),
        JSON.stringify({ type: "another-invalid" }),
      ].join("\n");

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(4);
      expect((result[1] as ErrorJsonl).lineNumber).toBe(2);
      expect((result[1] as ErrorJsonl).type).toBe("x-error");
      expect((result[3] as ErrorJsonl).lineNumber).toBe(4);
      expect((result[3] as ErrorJsonl).type).toBe("x-error");
    });

    it("Line numbers are accurately recorded after filtering empty lines", () => {
      const jsonl = ["", "", JSON.stringify({ type: "invalid-schema" })].join(
        "\n",
      );

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      // After filtering empty lines, the index is 0, but lineNumber is recorded as 1
      expect((result[0] as ErrorJsonl).lineNumber).toBe(1);
    });
  });

  describe("ConversationSchema variations", () => {
    it("Can parse User entries with optional fields", () => {
      const jsonl = JSON.stringify({
        type: "user",
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: { role: "user", content: "Hello" },
        isSidechain: true,
        userType: "external",
        cwd: "/test",
        sessionId: "session-1",
        version: "1.0.0",
        parentUuid: "550e8400-e29b-41d4-a716-446655440099",
        gitBranch: "main",
        isMeta: false,
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      const entry = result[0];
      if (entry && entry.type === "user") {
        expect(entry.isSidechain).toBe(true);
        expect(entry.parentUuid).toBe("550e8400-e29b-41d4-a716-446655440099");
        expect(entry.gitBranch).toBe("main");
      }
    });

    it("Can parse entries with nullable fields set to null", () => {
      const jsonl = JSON.stringify({
        type: "user",
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: { role: "user", content: "Hello" },
        isSidechain: false,
        userType: "external",
        cwd: "/test",
        sessionId: "session-1",
        version: "1.0.0",
        parentUuid: null,
      });

      const result = parseJsonl(jsonl);

      expect(result).toHaveLength(1);
      const entry = result[0];
      if (entry && entry.type === "user") {
        expect(entry.parentUuid).toBeNull();
      }
    });

    it("Can parse Assistant entries with missing stop_sequence (repro Mode Error)", () => {
      const jsonl = JSON.stringify({
        parentUuid: "4095c49f-6da8-4e06-ab79-1561b8bc0f4b",
        isSidechain: false,
        userType: "external",
        cwd: "/Users/fage/Documents/ztrip/trn-ztrip-common-vip-nfes-function",
        sessionId: "cdb8f14d-9516-4355-b100-1568d7716ca5",
        version: "2.0.44",
        gitBranch: "feat/spec-forge-test-3",
        message: {
          id: "msg_1770014832794776791",
          type: "message",
          role: "assistant",
          model: "kimi-k2.5",
          content: [
            {
              type: "tool_use",
              id: "Bash:16",
              name: "Bash",
              input: {
                command:
                  "npm install @ctrip/openspec --save-dev 2>&1 | tail -10",
                description: "尝试安装 @ctrip/openspec 包",
                timeout: 120000,
              },
            },
          ],
          stop_reason: "tool_use",
          usage: { input_tokens: 28232, output_tokens: 159 },
          // stop_sequence is missing here
        },
        type: "assistant",
        uuid: "ce3464e2-e857-400c-9735-ac33e56228a8",
        timestamp: "2026-02-02T06:47:15.536Z",
      });

      const result = parseJsonl(jsonl);

      // Should succeed, but currently fails (returns ErrorJsonl)
      // We expect it to be an array of length 1
      expect(result).toHaveLength(1);
      // Once fixed, this should be 'assistant'. Before fix, it might be 'x-error' if we were strictly asserting failure first.
      // But let's assert what we WANT:
      expect(result[0]).toHaveProperty("type", "assistant");
    });
  });
});
