import { describe, expect, test } from "vitest";
import { LastPromptEntrySchema } from "./LastPromptEntrySchema";

describe("LastPromptEntrySchema", () => {
  test("accepts valid last-prompt entry", () => {
    const result = LastPromptEntrySchema.safeParse({
      type: "last-prompt",
      lastPrompt: "hi",
      sessionId: "2ba375f7-4ed2-4429-9b3a-bb2a1ebde777",
    });
    expect(result.success).toBe(true);
  });

  test("rejects entry with missing required fields", () => {
    const result = LastPromptEntrySchema.safeParse({
      type: "last-prompt",
      sessionId: "2ba375f7-4ed2-4429-9b3a-bb2a1ebde777",
    });
    expect(result.success).toBe(false);
  });

  test("rejects entry with wrong type", () => {
    const result = LastPromptEntrySchema.safeParse({
      type: "other-type",
      lastPrompt: "hi",
      sessionId: "2ba375f7-4ed2-4429-9b3a-bb2a1ebde777",
    });
    expect(result.success).toBe(false);
  });
});
