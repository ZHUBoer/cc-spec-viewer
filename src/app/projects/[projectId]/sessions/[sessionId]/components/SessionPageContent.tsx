import { type FC, useEffect, useState } from "react";
import { useConfigCheckDialog } from "@/components/spec-dashboard/ConfigCheckProvider";
import { useConfigCheck } from "@/components/spec-dashboard/hooks/useConfigCheck";
import { useWorkspacePanel } from "@/hooks/useWorkspacePanel";

import { SessionPageMainWrapper } from "./SessionPageMainWrapper";
import type { Tab } from "./sessionSidebar/schema";

export const SessionPageContent: FC<{
  projectId: string;
  sessionId?: string;
  tab: Tab;
}> = ({ projectId, sessionId, tab }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { activeMode, panelWidth } = useWorkspacePanel();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const { isConfigured } = useConfigCheck(projectId);
  const { openInitRequiredDialog } = useConfigCheckDialog();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 检查配置状态，如果未初始化则弹出弹窗
  useEffect(() => {
    if (isConfigured === false) {
      openInitRequiredDialog(projectId);
    }
  }, [isConfigured, projectId, openInitRequiredDialog]);

  const mainContentWidth = activeMode !== "none" ? 100 - panelWidth : 100;

  // Calculate approximate pixel width of the session area
  // If undefined/0, assume full width for safety.
  // We want to collapse sidebar if the remaining width for chat (after 320px sidebar) is too small.
  // Say < 500px for chat is bad. So if session area < 320 + 500 = 820px, collapse.
  const sessionAreaPx = (windowWidth * mainContentWidth) / 100;

  // If in Split mode, we might want to be more aggressive with collapsing.
  const shouldCollapseSidebar = sessionAreaPx < 900;

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden transition-all duration-200"
      style={{ width: `${mainContentWidth}%` }}
    >
      <SessionPageMainWrapper
        projectId={projectId}
        sessionId={sessionId}
        tab={tab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        forceCollapsed={shouldCollapseSidebar}
      />
    </div>
  );
};
