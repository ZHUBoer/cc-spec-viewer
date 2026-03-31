import { Trans } from "@lingui/react";
import { useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  InfoIcon,
  LogOut,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { type FC, type ReactNode, Suspense, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { Loading } from "./Loading";
import { NotificationSettings } from "./NotificationSettings";
import { useSearch } from "./SearchProvider";
import { SettingsControls } from "./SettingsControls";
import { SystemInfoCard } from "./SystemInfoCard";
import { SpecSidebarPanel } from "./spec-dashboard/SpecSidebarPanel";

export interface SidebarTab {
  id: string;
  icon: LucideIcon;
  title: ReactNode;
  content: ReactNode;
}

interface GlobalSidebarProps {
  projectId?: string;
  className?: string;
  additionalTabs?: SidebarTab[];
  defaultActiveTab?: string;
  headerButton?: ReactNode;
  forceCollapsed?: boolean;
}

export const GlobalSidebar: FC<GlobalSidebarProps> = ({
  projectId,
  className,
  additionalTabs = [],
  defaultActiveTab,
  headerButton,
  forceCollapsed = false,
}) => {
  const { openSearch } = useSearch();
  const { authEnabled, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const settingsTab: SidebarTab = {
    id: "settings",
    icon: SettingsIcon,
    title: <Trans id="settings.tab.title" />,
    content: (
      <div className="h-full flex flex-col">
        <div className="border-sidebar-border p-4">
          <h2 className="font-semibold text-lg">
            <Trans id="settings.title" />
          </h2>
          <p className="text-xs text-sidebar-foreground/70">
            <Trans id="settings.description" />
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-sm text-sidebar-foreground/70">
                <Trans id="settings.loading" />
              </div>
            </div>
          }
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-sidebar-foreground">
                <Trans id="settings.section.session_display" />
              </h3>
              <SettingsControls openingProjectId={projectId ?? ""} />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-sidebar-foreground">
                <Trans id="settings.section.notifications" />
              </h3>
              <NotificationSettings />
            </div>
          </div>
        </Suspense>
      </div>
    ),
  };

  const specTab: SidebarTab = {
    id: "spec-dashboard",
    icon: BookOpenIcon,
    title: "Spec Dashboard", // TODO: i18n
    content: projectId ? (
      <SpecSidebarPanel projectId={projectId} />
    ) : (
      <div className="p-4 text-sm text-sidebar-foreground/50 text-center">
        请先选择一个项目
      </div>
    ),
  };

  const systemInfoTab: SidebarTab = {
    id: "system-info",
    icon: InfoIcon,
    title: <Trans id="settings.section.system_info" />,
    content: <SystemInfoCard projectId={projectId} />,
  };

  const allTabs = [
    ...additionalTabs,
    ...(projectId ? [specTab] : []),
    settingsTab,
    systemInfoTab,
  ];
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab ?? allTabs[allTabs.length - 1]?.id ?? "settings",
  );
  const [isExpanded, setIsExpanded] = useState(!!defaultActiveTab);
  const [suppressAutoCollapse, setSuppressAutoCollapse] = useState(false);

  // Auto-collapse when forceCollapsed becomes true (e.g. window resize)
  // But allow user to re-expand it manually
  useEffect(() => {
    if (forceCollapsed && !suppressAutoCollapse) {
      setIsExpanded(false);
    }
  }, [forceCollapsed, suppressAutoCollapse]);

  // 监听 specforge 事件，自动切换到 spec-dashboard/system-info 标签页
  useEffect(() => {
    if (!projectId) return;

    const handleOpenInitDialogEvent = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        const shouldRedispatch = activeTab !== "spec-dashboard" || !isExpanded;
        setSuppressAutoCollapse(true);
        setActiveTab("spec-dashboard");
        setIsExpanded(true);

        if (shouldRedispatch) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("specforge:open-init-dialog", {
                detail: { projectId },
              }),
            );
          }, 100);
        }
      }
    };
    const handleOpenNewSpecEvent = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        const shouldRedispatch = activeTab !== "spec-dashboard" || !isExpanded;
        setSuppressAutoCollapse(true);
        setActiveTab("spec-dashboard");
        setIsExpanded(true);

        if (shouldRedispatch) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("specforge:open-new-spec", {
                detail: { projectId },
              }),
            );
          }, 100);
        }
      }
    };
    const handleOpenSystemInfoEvent = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        setSuppressAutoCollapse(true);
        setActiveTab("system-info");
        setIsExpanded(true);
      }
    };

    window.addEventListener(
      "specforge:open-init-dialog",
      handleOpenInitDialogEvent as EventListener,
    );
    window.addEventListener(
      "specforge:open-new-spec",
      handleOpenNewSpecEvent as EventListener,
    );
    window.addEventListener(
      "specforge:open-new-proposal",
      handleOpenNewSpecEvent as EventListener,
    );
    window.addEventListener(
      "specforge:open-system-info",
      handleOpenSystemInfoEvent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "specforge:open-init-dialog",
        handleOpenInitDialogEvent as EventListener,
      );
      window.removeEventListener(
        "specforge:open-new-spec",
        handleOpenNewSpecEvent as EventListener,
      );
      window.removeEventListener(
        "specforge:open-new-proposal",
        handleOpenNewSpecEvent as EventListener,
      );
      window.removeEventListener(
        "specforge:open-system-info",
        handleOpenSystemInfoEvent as EventListener,
      );
    };
  }, [projectId, activeTab, isExpanded]);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId && isExpanded) {
      setIsExpanded(false);
      setSuppressAutoCollapse(false);
    } else {
      setActiveTab(tabId);
      setIsExpanded(true);
      setSuppressAutoCollapse(false);
    }
  };

  const activeTabContent = allTabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div
      className={cn(
        "h-full border-r border-sidebar-border transition-all duration-300 ease-in-out flex bg-sidebar text-sidebar-foreground",
        isExpanded ? "w-80 lg:w-80" : "w-14",
        className,
      )}
    >
      {/* Vertical Icon Menu - Always Visible */}
      <div className="w-14 flex flex-col border-r border-sidebar-border bg-sidebar/50">
        <TooltipProvider>
          {headerButton && (
            <div className="border-b border-sidebar-border">{headerButton}</div>
          )}
          {activeTab !== "sessions" && !projectId && (
            <div className="p-2 border-b border-sidebar-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={openSearch}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      "text-sidebar-foreground/70 cursor-pointer",
                    )}
                    data-testid="search-button"
                  >
                    <SearchIcon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Search <kbd className="ml-1 text-xs opacity-60">⌘K</kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <div className="flex-1 flex flex-col p-2 space-y-1">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleTabClick(tab.id)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-md transition-colors cursor-pointer",
                        "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        activeTab === tab.id && isExpanded
                          ? "bg-sidebar-accent text-primary ring-1 ring-primary/12"
                          : "text-sidebar-foreground/70",
                      )}
                      data-testid={`${tab.id}-tab-button`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{tab.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          {/* Logout button at bottom - only show when auth is enabled */}
          {authEnabled && (
            <div className="p-2 border-t border-sidebar-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "text-sidebar-foreground/70",
                    )}
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </div>

      {/* Content Area - Only shown when expanded */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<Loading />}>{activeTabContent}</Suspense>
        </div>
      )}
    </div>
  );
};
