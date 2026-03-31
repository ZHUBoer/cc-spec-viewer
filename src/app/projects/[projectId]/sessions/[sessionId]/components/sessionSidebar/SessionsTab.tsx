import { Trans } from "@lingui/react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import { useSearch as useGlobalSearch } from "@/components/SearchProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSessionProcessBySessionId } from "@/lib/session-process/sessionProcessesState";
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "../../../../../../../lib/date/formatLocaleDate";
import { useConfig } from "../../../../../../hooks/useConfig";
import { useProject } from "../../../../hooks/useProject";
import { useSessionProcess } from "../../hooks/useSessionProcess";
import { getVisibleSessionTotal } from "../sessionMetaDisplay";
import { DeleteSessionDialog } from "./DeleteSessionDialog";

export const SessionsTab: FC<{
  currentSessionId: string;
  projectId: string;
  isMobile?: boolean;
}> = ({ currentSessionId, projectId }) => {
  const {
    data: projectData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProject(projectId);
  const sessions = projectData.pages.flatMap((page) => page.sessions);
  const totalSessions = getVisibleSessionTotal(
    projectData.pages[0]?.totalSessions,
    sessions.length,
  );

  const { sessionProcesses } = useSessionProcess();
  const { config } = useConfig();
  const { openSearch } = useGlobalSearch();
  const search = useSearch({
    from: "/projects/$projectId/session",
  });
  const navigate = useNavigate();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Preserve current tab state or default to "sessions"
  const currentTab = search.tab ?? "sessions";

  const isNewChatActive = currentSessionId === "";

  // Sort sessions: Running > Paused > Others, then by lastModifiedAt (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const aProcess = getSessionProcessBySessionId(sessionProcesses, a.id);
    const bProcess = getSessionProcessBySessionId(sessionProcesses, b.id);

    const aStatus = aProcess?.status;
    const bStatus = bProcess?.status;

    // Define priority: running = 0, paused = 1, others = 2
    const getPriority = (status: "paused" | "running" | undefined) => {
      if (status === "running") return 0;
      if (status === "paused") return 1;
      return 2;
    };

    const aPriority = getPriority(aStatus);
    const bPriority = getPriority(bStatus);

    // First sort by priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then sort by lastModifiedAt (newest first)
    const aTime = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : 0;
    const bTime = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : 0;
    return bTime - aTime;
  });

  const handleDeleteClick = (
    e: React.MouseEvent,
    sessionId: string,
    sessionTitle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingSession({ id: sessionId, title: sessionTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    const deletedSessionId = deletingSession?.id;
    setDeletingSession(null);

    // If the deleted session was the current one, navigate to the new chat page
    if (deletedSessionId === currentSessionId) {
      void navigate({
        to: "/projects/$projectId/session",
        params: { projectId },
        search: { tab: currentTab },
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-sidebar-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">
            <Trans id="sessions.title" />
          </h2>
          <TooltipProvider>
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
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Search <kbd className="ml-1 text-xs opacity-60">⌘K</kbd>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-sidebar-foreground/70">
          {totalSessions} <Trans id="sessions.total" />
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <Link
          to="/projects/$projectId/session"
          params={{ projectId }}
          search={{ tab: currentTab }}
          className={cn(
            "block rounded-lg border border-dashed border-sidebar-border bg-sidebar/10 p-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-muted/20",
            isNewChatActive &&
              "border-primary/30 bg-muted/20 text-sidebar-foreground ring-1 ring-primary/12",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-sidebar-foreground">
                <Trans id="chat.modal.title" />
              </p>
            </div>
          </div>
        </Link>
        {sortedSessions.map((session) => {
          const isActive = session.id === currentSessionId;
          const title = session.displayMeta.title;
          const messageCount = session.displayMeta.visibleMessageCount;

          const sessionProcess = getSessionProcessBySessionId(
            sessionProcesses,
            session.id,
          );
          const isRunning = sessionProcess?.status === "running";
          const isPaused = sessionProcess?.status === "paused";

          return (
            <Link
              key={session.id}
              to="/projects/$projectId/session"
              params={{ projectId }}
              search={{ tab: currentTab, sessionId: session.id }}
              className={cn(
                "group relative block rounded-lg border border-sidebar-border/60 bg-sidebar/30 p-2.5 transition-all duration-200 hover:border-primary/25 hover:bg-muted/20",
                isActive &&
                  "border-primary/30 bg-muted/20 ring-1 ring-primary/12 hover:border-primary/30 hover:bg-muted/20",
              )}
            >
              {/* Delete button - shown on hover */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={(e) => handleDeleteClick(e, session.id, title)}
              >
                <TrashIcon className="w-3 h-3" />
              </Button>
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 pr-6">
                  <h3 className="text-sm font-medium line-clamp-2 leading-tight text-sidebar-foreground flex-1">
                    {title}
                  </h3>
                  {(isRunning || isPaused) && (
                    <Badge
                      variant={isRunning ? "default" : "secondary"}
                      className={cn(
                        "text-xs shrink-0",
                        isRunning && "bg-green-500 text-white",
                        isPaused && "bg-yellow-500 text-white",
                      )}
                    >
                      {isRunning ? (
                        <Trans id="session.status.running" />
                      ) : (
                        <Trans id="session.status.paused" />
                      )}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-sidebar-foreground/70">
                    <div className="flex items-center gap-1">
                      <MessageSquareIcon className="w-3 h-3" />
                      <span>{messageCount}</span>
                    </div>
                  </div>
                  {session.lastModifiedAt && (
                    <span className="text-xs text-sidebar-foreground/60">
                      {formatLocaleDate(session.lastModifiedAt, {
                        locale: config.locale,
                        target: "time",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* Load More Button */}
        {hasNextPage && fetchNextPage && (
          <div className="p-2">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
            >
              {isFetchingNextPage ? (
                <Trans id="common.loading" />
              ) : (
                <Trans id="sessions.load.more" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Session Dialog */}
      {deletingSession !== null && (
        <DeleteSessionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          projectId={projectId}
          sessionId={deletingSession.id}
          sessionTitle={deletingSession.title}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};
