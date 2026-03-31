import { describe, expect, it } from "vitest";
import { deriveConfigCheckState } from "./configCheckState";

describe("deriveConfigCheckState", () => {
  it("returns upgrade-template when template upgrade is available", () => {
    const result = deriveConfigCheckState({
      templateUpgradeAvailable: true,
      scenario: "S5_CONFIGURED",
      isConfigCorrupted: false,
    });

    expect(result).toEqual({
      isConfigured: false,
      requiredDialogReason: "upgrade-template",
    });
  });

  it("returns not configured for corrupted config", () => {
    const result = deriveConfigCheckState({
      templateUpgradeAvailable: false,
      scenario: "S5_CONFIGURED",
      isConfigCorrupted: true,
    });

    expect(result).toEqual({
      isConfigured: false,
      requiredDialogReason: "init",
    });
  });

  it("returns configured when scenario is S5 and not corrupted", () => {
    const result = deriveConfigCheckState({
      templateUpgradeAvailable: false,
      scenario: "S5_CONFIGURED",
      isConfigCorrupted: false,
    });

    expect(result).toEqual({
      isConfigured: true,
      requiredDialogReason: "init",
    });
  });
});
