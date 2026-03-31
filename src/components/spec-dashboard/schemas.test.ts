import { describe, expect, it } from "vitest";
import { EnvironmentStatusSchema, OpenSpecChangeSchema } from "./schemas";

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

  it("accepts missing cliVersion and normalizes to null", () => {
    const result = EnvironmentStatusSchema.safeParse({
      cliInstalled: false,
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
    if (result.success) {
      expect(result.data.cliVersion).toBeNull();
    }
  });

  it("accepts change details with d2c payload", () => {
    const result = OpenSpecChangeSchema.safeParse({
      name: "change-demo",
      status: "draft",
      updatedAt: "2026-03-06T00:00:00.000Z",
      d2c: {
        enabled: true,
        changeKind: "new",
        materials: [
          {
            link: "https://figma.com/design/demo-1",
            description: "活动首屏",
            scope: "page",
            artifactId: "activity-hero",
          },
        ],
        targetScope: "page",
        baselineFrozen: false,
        reviewOverride: false,
        reviewOverrideAt: undefined,
        reviewOverrideReason: undefined,
        reviewStatus: "passed",
        canEnterDesign: true,
        effectiveCanEnterDesign: true,
        entryFiles: ["activity-hero/index.tsx"],
        hasManifest: true,
        hasGeneratedFiles: true,
        generatedFiles: [
          {
            name: "activity-hero/index.tsx",
            content: "export const Demo = () => null;",
          },
        ],
        previewFiles: [],
      },
    });

    expect(result.success).toBe(true);
  });
});
