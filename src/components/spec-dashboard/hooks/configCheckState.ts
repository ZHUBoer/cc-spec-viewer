export type RequiredDialogReason = "init" | "upgrade-template";

type ConfigCheckInput = {
  templateUpgradeAvailable: boolean;
  scenario: string;
  isConfigCorrupted: boolean;
};

export const deriveConfigCheckState = (env: ConfigCheckInput) => {
  if (env.templateUpgradeAvailable) {
    return {
      isConfigured: false,
      requiredDialogReason: "upgrade-template" as RequiredDialogReason,
    };
  }

  const configured = env.scenario === "S5_CONFIGURED" && !env.isConfigCorrupted;
  return {
    isConfigured: configured,
    requiredDialogReason: "init" as RequiredDialogReason,
  };
};
