import { type FC, useState } from "react";
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

  const mainContentWidth = activeMode !== "none" ? 100 - panelWidth : 100;

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
      />
    </div>
  );
};
