import { describe, expect, it } from "vitest";
import { EnvironmentStatusSchema } from "./schemas";

describe("EnvironmentStatusSchema", () => {
  it("accepts missing cliInstallType", () => {
    const result = EnvironmentStatusSchema.safeParse({
      cliInstalled: false,
      cliVersion: null,
      scenario: "S1_NEW",
      scenarioDescription: "new",
      hasOpenspecDir: false,
      hasClaudeDir: false,
      hasSpecforgeMarker: false,
      specforgeConfig: null,
      isConfigCorrupted: false,
      configErrors: [],
      missingSpecforgeSkills: [],
      missingMcpServers: [],
      recommendedAction: "full_init",
    });

    expect(result.success).toBe(true);
  });
});
