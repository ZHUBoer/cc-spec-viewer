import { Trans, useLingui } from "@lingui/react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { claudeCodeMetaQuery, systemVersionQuery } from "@/lib/api/queries";
import { useSpecForgeInitialization } from "./spec-dashboard/hooks/useSpecForgeInitialization";
import { specDashboardService } from "./spec-dashboard/SpecDashboardService";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface FeatureInfo {
  title: ReactNode;
  description: ReactNode;
}

const getFeatureInfo = (featureName: string): FeatureInfo => {
  switch (featureName) {
    case "tool-approval":
      return {
        title: <Trans id="system_info.feature.tool_approval.title" />,
        description: (
          <Trans id="system_info.feature.tool_approval.description" />
        ),
      };
    case "agent-sdk":
      return {
        title: <Trans id="system_info.feature.agent_sdk.title" />,
        description: <Trans id="system_info.feature.agent_sdk.description" />,
      };
    case "sidechain-separation":
      return {
        title: <Trans id="system_info.feature.sidechain_separation.title" />,
        description: (
          <Trans id="system_info.feature.sidechain_separation.description" />
        ),
      };
    case "uuid-on-sdk-message":
      return {
        title: <Trans id="system_info.feature.uuid_on_sdk_message.title" />,
        description: (
          <Trans id="system_info.feature.uuid_on_sdk_message.description" />
        ),
      };
    case "run-skills-directly":
      return {
        title: <Trans id="system_info.feature.run_skills_directly.title" />,
        description: (
          <Trans id="system_info.feature.run_skills_directly.description" />
        ),
      };
    default:
      return {
        title: featureName,
        description: <Trans id="system_info.feature.unknown.description" />,
      };
  }
};

export const SystemInfoCard: FC<{ projectId?: string }> = ({ projectId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const { i18n } = useLingui();

  const { data: versionData } = useQuery({
    ...systemVersionQuery,
  });

  const { data: claudeCodeMetaData } = useQuery({
    ...claudeCodeMetaQuery,
  });

  const { flags } = useFeatureFlags();
  const { handlePostInitialization } = useSpecForgeInitialization(
    projectId ?? "",
  );
  const {
    data: environment,
    isLoading: envLoading,
    refetch: refetchEnvironment,
  } = useQuery({
    queryKey: ["specforge", "environment", projectId],
    queryFn: () => specDashboardService.getEnvironment(projectId ?? ""),
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!projectId) return;
    const handleInitComplete = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        refetchEnvironment();
      }
    };
    window.addEventListener(
      "specforge:init-complete",
      handleInitComplete as EventListener,
    );
    return () => {
      window.removeEventListener(
        "specforge:init-complete",
        handleInitComplete as EventListener,
      );
    };
  }, [projectId, refetchEnvironment]);

  const handleTemplateUpgrade = async () => {
    if (!projectId || !environment?.specforgeConfig) return;

    setUpgrading(true);
    try {
      const [savedConfig, profilesData] = await Promise.all([
        specDashboardService.getProjectProfileConfig(projectId),
        specDashboardService.getProfiles(projectId),
      ]);

      let profileToUse: {
        displayName: string;
        custom_variables?: Record<string, string>;
        infra_catalog: (typeof profilesData.profiles)[number]["infra_catalog"];
      } | null = null;

      if (savedConfig) {
        profileToUse = {
          displayName: savedConfig.displayName,
          custom_variables: savedConfig.custom_variables,
          infra_catalog: savedConfig.infra_catalog,
        };
      } else {
        const matched = profilesData.profiles.find(
          (profile) => profile.id === environment.specforgeConfig?.profile,
        );
        if (matched) {
          profileToUse = {
            displayName: matched.displayName,
            custom_variables: matched.custom_variables,
            infra_catalog: matched.infra_catalog,
          };
        }
      }

      if (!profileToUse) {
        toast.error(
          i18n._({
            id: "system_info.workflow.upgrade.profile_not_found",
            message:
              "Current profile configuration is missing. Save it in Spec Dashboard first.",
          }),
        );
        return;
      }

      const result = await specDashboardService.initialize(projectId, {
        scenario: environment.scenario,
        force: true,
        profile: profileToUse,
      });

      if (!result.success) {
        const primary = result.errors[0];
        toast.error(
          primary?.error ??
            i18n._({
              id: "system_info.workflow.upgrade.failed_retry",
              message: "Workflow version upgrade failed, please retry.",
            }),
        );
        return;
      }

      await handlePostInitialization();
      toast.success(
        i18n._({
          id: "system_info.workflow.upgrade.success",
          message: "Workflow version upgraded successfully.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n._({
              id: "system_info.workflow.upgrade.failed",
              message: "Workflow version upgrade failed.",
            }),
      );
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-sidebar-border p-4">
        <h2 className="font-semibold text-lg">
          <Trans id="system_info.title" />
        </h2>
        <p className="text-xs text-sidebar-foreground/70">
          <Trans id="system_info.description" />
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* SpecForge Viewer Version */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-sidebar-foreground">
            <Trans id="system_info.viewer_version" />
          </h3>
          <div className="flex justify-between items-center pl-2">
            <span className="text-xs text-sidebar-foreground/70">
              <Trans id="system_info.version_label" />
            </span>
            <Badge variant="secondary" className="text-xs font-mono">
              v{versionData?.version || "Unknown"}
            </Badge>
          </div>
        </div>

        {/* Claude Code Information */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-sidebar-foreground">
            <Trans id="system_info.claude_code" />
          </h3>
          <div className="space-y-2 pl-2">
            <div className="space-y-1">
              <div className="text-xs text-sidebar-foreground/70">
                <Trans id="system_info.executable_path" />
              </div>
              <div className="text-xs text-sidebar-foreground font-mono break-all">
                {claudeCodeMetaData?.executablePath || (
                  <span className="text-sidebar-foreground/50">
                    <Trans id="system_info.unknown" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-sidebar-foreground/70">
                <Trans id="system_info.version_label" />
              </span>
              <Badge variant="secondary" className="text-xs font-mono">
                {claudeCodeMetaData?.version || (
                  <Trans id="system_info.unknown" />
                )}
              </Badge>
            </div>
          </div>
        </div>

        {projectId && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-sidebar-foreground">
              SpecForge
            </h3>
            {envLoading ? (
              <div className="pl-2 text-xs text-sidebar-foreground/50">
                <Trans
                  id="system_info.workflow.checking"
                  message="Checking workflow status..."
                />
              </div>
            ) : (
              <div className="space-y-2 pl-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sidebar-foreground/70">
                    <Trans
                      id="system_info.workflow.current_version"
                      message="Current workflow version"
                    />
                  </span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {environment?.specforgeConfig?.templateVersion || "Unknown"}
                  </Badge>
                </div>
                {environment?.templateUpgradeAvailable ? (
                  <>
                    <div className="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-2">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        <Trans
                          id="system_info.workflow.update_available"
                          message="A workflow version update is available. You can upgrade here directly."
                        />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTemplateUpgrade}
                      disabled={upgrading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-sidebar-border bg-background px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-muted/25 disabled:opacity-50 cursor-pointer"
                    >
                      {upgrading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      {upgrading ? (
                        <Trans
                          id="system_info.workflow.upgrading"
                          message="Upgrading..."
                        />
                      ) : (
                        <Trans
                          id="system_info.workflow.upgrade_button"
                          message="Upgrade workflow version"
                        />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-sidebar-foreground/60">
                    <Trans
                      id="system_info.workflow.up_to_date"
                      message="Current workflow version is up to date."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Available Features */}
        <div className="space-y-3">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex w-full items-center justify-between group">
              <h3 className="font-medium text-sm text-sidebar-foreground">
                <Trans id="system_info.available_features" />
              </h3>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3">
              <TooltipProvider>
                <ul className="space-y-2 pl-2">
                  {flags.map(({ name, enabled }) => {
                    const featureInfo = getFeatureInfo(name);
                    return (
                      <li key={name} className="flex items-start gap-2">
                        {enabled ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-sidebar-foreground/30 mt-0.5 flex-shrink-0" />
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={
                                enabled
                                  ? "text-xs text-sidebar-foreground cursor-help"
                                  : "text-xs text-sidebar-foreground/50 line-through cursor-help"
                              }
                            >
                              {featureInfo.title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-xs text-xs"
                          >
                            {featureInfo.description}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};
