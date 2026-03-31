import { Trans } from "@lingui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  DownloadIcon,
  GitBranchIcon,
  InfoIcon,
  LoaderIcon,
  MenuIcon,
  MessageSquareIcon,
  PauseIcon,
  TrashIcon,
} from "lucide-react";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PermissionDialog } from "@/components/PermissionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getTaskCompletionContentKey,
  getTaskStreamContentKey,
} from "@/hooks/taskNotificationState";
import { usePermissionRequests } from "@/hooks/usePermissionRequests";
import { useSchedulerJobs } from "@/hooks/useScheduler";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { honoClient } from "@/lib/api/client";
import {
  removeSessionProcessStateById,
  type SessionProcessesState,
  sessionProcessesStateQuery,
} from "@/lib/session-process/sessionProcessesState";
import { useExportSession } from "../hooks/useExportSession";
import type { useGitCurrentRevisions } from "../hooks/useGit";
import { useGitCurrentRevisions as useGitCurrentRevisionsHook } from "../hooks/useGit";
import {
  PendingAskUserQuestionContext,
  type PendingAskUserQuestionContextValue,
} from "../hooks/usePendingAskUserQuestion";
import { useSession } from "../hooks/useSession";
import { useSessionProcess } from "../hooks/useSessionProcess";
import { ConversationList } from "./conversationList/ConversationList";
import { DiffModal } from "./diffModal";
import { ChatActionMenu } from "./resumeChat/ChatActionMenu";
import { ContinueChat } from "./resumeChat/ContinueChat";
import { ResumeChat } from "./resumeChat/ResumeChat";
import { StartNewChat } from "./resumeChat/StartNewChat";
import { shouldShowPendingCost } from "./sessionMetaDisplay";
import { DeleteSessionDialog } from "./sessionSidebar/DeleteSessionDialog";

type SessionPageMainProps = {
  projectId: string;
  sessionId?: string;
  focusMessageId?: string;
  focusSource?: "search";
  setIsMobileSidebarOpen: (open: boolean) => void;
  projectPath?: string;
  currentBranch?: string;
  revisionsData?: ReturnType<typeof useGitCurrentRevisions>["data"];
  projectName: string;
};

type SessionData = ReturnType<typeof useSession>;

export const SessionPageMain: FC<SessionPageMainProps> = (props) => {
  if (!props.sessionId) {
    return <SessionPageMainContent {...props} sessionData={null} />;
  }

  return <SessionPageMainWithData {...props} sessionId={props.sessionId} />;
};

const SessionPageMainWithData: FC<
  SessionPageMainProps & { sessionId: string }
> = (props) => {
  const sessionData = useSession(props.projectId, props.sessionId);
  return (
    <SessionPageMainContent
      {...props}
      sessionId={props.sessionId}
      sessionData={sessionData}
    />
  );
};

const SessionPageMainContent: FC<
  SessionPageMainProps & {
    sessionId?: string;
    sessionData: SessionData | null;
  }
> = ({
  projectId,
  sessionId,
  focusMessageId,
  focusSource,
  setIsMobileSidebarOpen,
  projectPath,
  currentBranch,
  revisionsData: revisionsDataProp,
  projectName,
  sessionData,
}) => {
  const navigate = useNavigate();
  const conversations = sessionData?.conversations ?? [];
  const emptyToolResult: SessionData["getToolResult"] = () => undefined;
  const emptyToolUseResult: SessionData["getToolUseResult"] = () => undefined;
  const getToolResult = sessionData?.getToolResult ?? emptyToolResult;
  const getToolUseResult = sessionData?.getToolUseResult ?? emptyToolUseResult;
  const isExistingSession =
    Boolean(sessionId) && sessionData !== null && sessionData !== undefined;
  const sessionProcess = useSessionProcess();
  const relatedSessionProcess = useMemo(() => {
    if (!sessionId) return undefined;
    return sessionProcess.getSessionProcess(sessionId);
  }, [sessionProcess, sessionId]);
  const { currentPermissionRequest, isDialogOpen, onPermissionResponse } =
    usePermissionRequests({
      sessionProcessId: relatedSessionProcess?.id,
    });

  // AskUserQuestion 渲染为内嵌交互卡片，其他工具通过 PermissionDialog 处理
  const isPendingAskUserQuestion =
    isDialogOpen && currentPermissionRequest?.toolName === "AskUserQuestion";
  const dialogPermissionRequest = isPendingAskUserQuestion
    ? null
    : currentPermissionRequest;
  const dialogIsOpen = isDialogOpen && !isPendingAskUserQuestion;

  const handleAskUserQuestionAnswers = useCallback(
    async (answers: Record<string, string>) => {
      if (!currentPermissionRequest) return;
      await onPermissionResponse({
        permissionRequestId: currentPermissionRequest.id,
        decision: "allow",
        updatedInput: {
          ...currentPermissionRequest.toolInput,
          answers,
        },
      });
    },
    [currentPermissionRequest, onPermissionResponse],
  );

  const pendingAskUserQuestionValue =
    useMemo<PendingAskUserQuestionContextValue>(() => {
      const pendingToolUseId =
        isPendingAskUserQuestion &&
        typeof currentPermissionRequest?.toolUseId === "string"
          ? currentPermissionRequest.toolUseId
          : null;

      return {
        pendingRequestId: isPendingAskUserQuestion
          ? (currentPermissionRequest?.id ?? null)
          : null,
        pendingToolUseId,
        onAnswersSubmit: isPendingAskUserQuestion
          ? handleAskUserQuestionAnswers
          : null,
      };
    }, [
      isPendingAskUserQuestion,
      currentPermissionRequest?.id,
      currentPermissionRequest?.toolUseId,
      handleAskUserQuestionAnswers,
    ]);
  const { data: revisionsDataFallback } = useGitCurrentRevisionsHook(projectId);
  const revisionsData = revisionsDataProp ?? revisionsDataFallback;
  const exportSession = useExportSession();
  const { data: allSchedulerJobs } = useSchedulerJobs();
  const queryClient = useQueryClient();

  useTaskNotifications({
    isRunningTask: relatedSessionProcess?.status === "running",
    conversations,
  });

  // Filter scheduler jobs related to this session
  const sessionScheduledJobs = useMemo(() => {
    if (!sessionId || !allSchedulerJobs) return [];
    return allSchedulerJobs.filter(
      (job) =>
        job.message.baseSessionId === sessionId &&
        job.message.projectId === projectId &&
        job.schedule.type === "reserved" &&
        job.lastRunStatus === null, // Only show jobs that haven't been executed yet
    );
  }, [allSchedulerJobs, sessionId, projectId]);

  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const focusedKeyRef = useRef<string | null>(null);
  const previousTaskStreamKeyRef = useRef<string>("stream:none");
  const previousTaskCompletionKeyRef = useRef<string>("completion:none");
  const taskStreamKey = useMemo(
    () => getTaskStreamContentKey(conversations),
    [conversations],
  );
  const taskCompletionKey = useMemo(
    () => getTaskCompletionContentKey(conversations),
    [conversations],
  );

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;

    setIsUserScrolledUp(!isAtBottom);
    setShowScrollBottom(!isAtBottom);
  };

  const abortTask = useMutation({
    mutationFn: async (sessionProcessId: string) => {
      const response = await honoClient.api.cc["session-processes"][
        ":sessionProcessId"
      ].abort.$post({
        param: { sessionProcessId },
        json: { projectId },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    },
    onSuccess: (_, sessionProcessId) => {
      queryClient.setQueryData(
        sessionProcessesStateQuery.queryKey,
        (currentState: SessionProcessesState | undefined) =>
          removeSessionProcessStateById(currentState, sessionProcessId),
      );
    },
  });

  useEffect(() => {
    if (!isExistingSession) return;
    const didStreamChange = taskStreamKey !== previousTaskStreamKeyRef.current;

    previousTaskStreamKeyRef.current = taskStreamKey;
    previousTaskCompletionKeyRef.current = taskCompletionKey;

    if (!didStreamChange || isUserScrolledUp) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isExistingSession, taskStreamKey, taskCompletionKey, isUserScrolledUp]);

  useEffect(() => {
    previousTaskStreamKeyRef.current = taskStreamKey;
    previousTaskCompletionKeyRef.current = taskCompletionKey;
  }, [taskStreamKey, taskCompletionKey]);

  useEffect(() => {
    if (!sessionId || !focusMessageId || focusSource !== "search") {
      return;
    }

    const focusKey = `${sessionId}:${focusMessageId}`;
    if (focusedKeyRef.current === focusKey) {
      return;
    }

    let canceled = false;
    let attempt = 0;
    const maxAttempts = 10;

    const focusTarget = () => {
      if (canceled) return;

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const target = scrollContainer.querySelector<HTMLElement>(
        `#${focusMessageId}`,
      );

      if (target) {
        focusedKeyRef.current = focusKey;
        target.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });

        target.classList.remove("search-hit-highlight");
        // Force reflow so repeat highlights can restart animation.
        void target.offsetWidth;
        target.classList.add("search-hit-highlight");
        setTimeout(() => {
          target.classList.remove("search-hit-highlight");
        }, 2000);

        void navigate({
          to: "/projects/$projectId/session",
          params: { projectId },
          search: (prev) => ({
            ...prev,
            focusMessageId: undefined,
            focusSource: undefined,
          }),
          replace: true,
        });
        return;
      }

      if (attempt >= maxAttempts) {
        return;
      }

      attempt += 1;
      setTimeout(focusTarget, 50);
    };

    focusTarget();

    return () => {
      canceled = true;
    };
  }, [sessionId, focusMessageId, focusSource, navigate, projectId]);

  const handleScrollToTop = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const sessionTitle =
    sessionData?.session.displayMeta.title ?? sessionId ?? "";
  const projectPathDisplayName =
    projectPath
      ?.split(/[\\/]/)
      .filter((segment) => segment.length > 0)
      .at(-1) ?? projectPath;

  let headerTitle: ReactNode = projectName ?? projectId;
  if (!isExistingSession) {
    headerTitle = <Trans id="chat.modal.title" />;
  } else if (sessionData && sessionId) {
    headerTitle = sessionTitle;
  }

  const sessionMeta = sessionData?.session.meta;
  const showPendingCost = sessionMeta
    ? shouldShowPendingCost(sessionMeta)
    : false;

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <header className="px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-10 bg-background w-full flex-shrink-0 min-w-0 border-b space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden flex-shrink-0 cursor-pointer"
              onClick={() => setIsMobileSidebarOpen(true)}
              data-testid="mobile-sidebar-toggle-button"
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold break-all overflow-ellipsis line-clamp-1 min-w-0">
              {headerTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden flex-1">
              {projectPath && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="h-6 text-xs flex items-center max-w-full cursor-help"
                    >
                      <span className="truncate">{projectPathDisplayName}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{projectPath}</TooltipContent>
                </Tooltip>
              )}
              {currentBranch && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="h-6 text-xs flex items-center gap-1 max-w-full cursor-help"
                    >
                      <GitBranchIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{currentBranch}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Trans id="control.branch" />
                  </TooltipContent>
                </Tooltip>
              )}
              {isExistingSession && sessionId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="h-6 text-xs flex items-center max-w-full font-mono cursor-help"
                    >
                      <span className="truncate">{sessionId}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Trans id="control.session_id" />
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {relatedSessionProcess?.status === "running" && (
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-900 dark:text-green-200 border-green-500/20 flex-shrink-0 h-6 text-xs"
              >
                <LoaderIcon className="w-3 h-3 mr-1 animate-spin" />
                <Trans id="session.conversation.running" />
              </Badge>
            )}
            {relatedSessionProcess?.status === "paused" && (
              <Badge
                variant="secondary"
                className="bg-orange-500/10 text-orange-900 dark:text-orange-200 border-orange-500/20 flex-shrink-0 h-6 text-xs"
              >
                <PauseIcon className="w-3 h-3 mr-1" />
                <Trans id="session.conversation.paused" />
              </Badge>
            )}
            {sessionId !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-6 w-6 cursor-pointer"
                    onClick={() =>
                      exportSession.mutate({ projectId, sessionId })
                    }
                    disabled={exportSession.isPending}
                    aria-label="Export session to HTML"
                  >
                    <DownloadIcon
                      className={`w-3.5 h-3.5 ${exportSession.isPending ? "animate-pulse" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export to HTML</TooltipContent>
              </Tooltip>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-6 w-6 cursor-pointer"
                  aria-label="Session metadata"
                >
                  <InfoIcon className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">
                      <Trans id="control.metadata" />
                    </h3>
                    <div className="space-y-2">
                      {projectPath && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            <Trans id="control.project_path" />
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="h-7 text-xs flex items-center w-fit cursor-help"
                              >
                                {projectPathDisplayName}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{projectPath}</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                      {currentBranch && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            <Trans id="control.branch" />
                          </span>
                          <Badge
                            variant="secondary"
                            className="h-7 text-xs flex items-center gap-1 w-fit"
                          >
                            <GitBranchIcon className="w-3 h-3" />
                            {currentBranch}
                          </Badge>
                        </div>
                      )}
                      {sessionId && isExistingSession && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            <Trans id="control.session_id" />
                          </span>
                          <Badge
                            variant="secondary"
                            className="h-7 text-xs flex items-center w-fit font-mono"
                          >
                            {sessionId}
                          </Badge>
                        </div>
                      )}
                      {isExistingSession && sessionData && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            <Trans id="control.model" />
                          </span>
                          <Badge
                            variant="secondary"
                            className="h-7 text-xs flex items-center w-fit font-mono"
                          >
                            {sessionData.session.meta.modelName ??
                              (showPendingCost ? "统计中" : "Unknown")}
                          </Badge>
                        </div>
                      )}
                      {isExistingSession && sessionData && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            <Trans id="session.cost.label" />
                          </span>
                          <div className="space-y-1.5">
                            <div className="text-xs space-y-1 pl-2">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  <Trans id="session.cost.input_tokens" />:
                                </span>
                                <span>
                                  {showPendingCost
                                    ? "统计中"
                                    : sessionData.session.meta.cost.tokenUsage.inputTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  <Trans id="session.cost.output_tokens" />:
                                </span>
                                <span>
                                  {showPendingCost
                                    ? "统计中"
                                    : sessionData.session.meta.cost.tokenUsage.outputTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  <Trans id="session.cost.cache_creation" />:
                                </span>
                                <span>
                                  {showPendingCost
                                    ? "统计中"
                                    : sessionData.session.meta.cost.tokenUsage.cacheCreationTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  <Trans id="session.cost.cache_read" />:
                                </span>
                                <span>
                                  {showPendingCost
                                    ? "统计中"
                                    : sessionData.session.meta.cost.tokenUsage.cacheReadTokens.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {showPendingCost && (
                              <p className="text-xs text-muted-foreground pl-2">
                                运行中会话的成本与令牌统计将在落盘后自动补齐。
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {isExistingSession && sessionId && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        <Trans id="session.delete_dialog.title" />
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto min-h-0 min-w-0"
          data-testid="scrollable-content"
          onScroll={handleScroll}
        >
          <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative min-w-0 pb-4">
            <PendingAskUserQuestionContext.Provider
              value={pendingAskUserQuestionValue}
            >
              <ConversationList
                conversations={isExistingSession ? conversations : []}
                getToolResult={getToolResult}
                getToolUseResult={getToolUseResult}
                projectId={projectId}
                sessionId={sessionId ?? ""}
                scheduledJobs={sessionScheduledJobs}
              />
            </PendingAskUserQuestionContext.Provider>
            {!isExistingSession && (
              <div className="mt-[30vh] rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                  <MessageSquareIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">
                    <Trans id="chat.modal.title" />
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <Trans id="session.empty_state.description" />
                  </p>
                </div>
              </div>
            )}
            {isExistingSession &&
              relatedSessionProcess?.status === "running" && (
                <div className="flex justify-start items-center py-8 animate-in fade-in duration-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">
                      <Trans id="session.processing" />
                    </p>
                  </div>
                </div>
              )}
          </main>
        </div>

        <div className="w-full pt-3 relative">
          {showScrollBottom && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute -top-12 right-6 z-20 rounded-full h-10 w-10 shadow-lg hover:shadow-xl opacity-90 hover:opacity-100 transition-all cursor-pointer hover:scale-110"
              onClick={handleScrollToBottom}
            >
              <ArrowDownIcon className="w-5 h-5" />
            </Button>
          )}
          <ChatActionMenu
            projectId={projectId}
            onScrollToTop={handleScrollToTop}
            onScrollToBottom={handleScrollToBottom}
            onOpenDiffModal={
              isExistingSession ? () => setIsDiffModalOpen(true) : undefined
            }
            sessionProcess={relatedSessionProcess}
            abortTask={abortTask}
            isNewChat={!isExistingSession}
          />
        </div>

        <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {isExistingSession && sessionId && relatedSessionProcess ? (
            <ContinueChat
              projectId={projectId}
              sessionId={sessionId}
              sessionProcessId={relatedSessionProcess.id}
              sessionProcessStatus={relatedSessionProcess.status}
            />
          ) : isExistingSession && sessionId ? (
            <ResumeChat projectId={projectId} sessionId={sessionId} />
          ) : (
            <StartNewChat projectId={projectId} />
          )}
        </div>
      </div>

      {isExistingSession && (
        <DiffModal
          projectId={projectId}
          isOpen={isDiffModalOpen}
          onOpenChange={setIsDiffModalOpen}
          revisionsData={revisionsData}
        />
      )}

      {isExistingSession && sessionId && (
        <DeleteSessionDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          projectId={projectId}
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          onSuccess={() => {
            navigate({
              to: "/projects/$projectId/session",
              params: { projectId },
              search: { sessionId: undefined, tab: "sessions" },
            });
          }}
        />
      )}

      <PermissionDialog
        permissionRequest={dialogPermissionRequest}
        isOpen={dialogIsOpen}
        onResponse={onPermissionResponse}
      />
    </>
  );
};
