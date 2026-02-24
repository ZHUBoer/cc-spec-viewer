import { describe, expect, test } from "vitest";
import { SystemEntrySchema } from "./SystemEntrySchema";

describe("SystemEntrySchema", () => {
  describe("turn_duration subtype", () => {
    test("accepts valid turn_duration entry", () => {
      const result = SystemEntrySchema.safeParse({
        parentUuid: "be2d3283-d532-4771-9106-737788998164",
        isSidechain: false,
        userType: "external",
        cwd: "/home/user/projects/my-app",
        sessionId: "e3e4a2ef-c6b5-4c39-a1f9-713a943be524",
        version: "2.1.5",
        gitBranch: "develop",
        slug: "declarative-snuggling-quokka",
        type: "system",
        subtype: "turn_duration",
        durationMs: 325282,
        timestamp: "2026-01-12T08:21:45.506Z",
        uuid: "787e1f01-c75d-42e8-858d-2c3117b79fb7",
        isMeta: false,
      });
      expect(result.success).toBe(true);
    });

    test("accepts turn_duration entry without optional fields", () => {
      const result = SystemEntrySchema.safeParse({
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/some/path",
        sessionId: "abc123",
        version: "2.1.5",
        type: "system",
        subtype: "turn_duration",
        durationMs: 42967,
        timestamp: "2026-01-09T11:57:15.634Z",
        uuid: "c6a15d05-e435-4588-aff3-37e173f0b8a9",
      });
      expect(result.success).toBe(true);
    });

    test("rejects turn_duration entry without durationMs", () => {
      const result = SystemEntrySchema.safeParse({
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/some/path",
        sessionId: "abc123",
        version: "2.1.5",
        type: "system",
        subtype: "turn_duration",
        timestamp: "2026-01-09T11:57:15.634Z",
        uuid: "c6a15d05-e435-4588-aff3-37e173f0b8a9",
      });
      expect(result.success).toBe(false);
    });
  });
  describe("microcompact_boundary subtype", () => {
    test("accepts valid microcompact_boundary entry", () => {
      const result = SystemEntrySchema.safeParse({
        parentUuid: "4ed2e2fc-94b3-4c57-b576-32fc446157d3",
        isSidechain: false,
        userType: "external",
        cwd: "/Users/qao/CRN/ztrip-xtaro-train",
        sessionId: "f4a87526-e78d-420a-a67b-c6dea1fab8a3",
        version: "2.1.38",
        gitBranch: "feat/spect_test_jifen2",
        slug: "piped-crafting-brook",
        type: "system",
        subtype: "microcompact_boundary",
        content: "Context microcompacted",
        isMeta: false,
        timestamp: "2026-02-11T07:16:45.592Z",
        uuid: "0fd54212-8dc0-4955-8e99-c5da5c5a9cb9",
        level: "info",
        microcompactMetadata: {
          trigger: "auto",
          preTokens: 837,
          tokensSaved: 4000,
          compactedToolIds: [],
          clearedAttachmentUUIDs: [],
        },
      });
      expect(result.success).toBe(true);
    });

    test("accepts microcompact_boundary entry without optional fields", () => {
      const result = SystemEntrySchema.safeParse({
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/some/path",
        sessionId: "abc123",
        version: "2.1.38",
        type: "system",
        subtype: "microcompact_boundary",
        content: "Context microcompacted",
        timestamp: "2026-02-11T07:16:45.592Z",
        uuid: "0fd54212-8dc0-4955-8e99-c5da5c5a9cb9",
        level: "info",
      });
      expect(result.success).toBe(true);
    });
  });
});
