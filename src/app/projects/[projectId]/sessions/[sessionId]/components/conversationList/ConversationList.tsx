import { Trans } from "@lingui/react";
import {
  AlertTriangle,
  ChevronDown,
  Clock3,
  ExternalLink,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { type FC, useCallback, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  Conversation,
  SidechainConversation,
} from "@/lib/conversation-schema";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import { formatDuration } from "@/lib/date/formatDuration";
import type { SchedulerJob } from "@/server/core/scheduler/schema";
import type { ErrorJsonl } from "../../../../../../../server/core/types";
import { useSidechain } from "../../hooks/useSidechain";
import { ConversationItem } from "./ConversationItem";
import {
  buildConversationListState,
  getConversationKey,
  shouldRenderConversation,
} from "./conversationListState";
import type { AssistantConversationRenderEntry } from "./conversationRenderBlocks";
import {
  buildAssistantProcessGroupSummary,
  buildConversationRenderBlocks,
} from "./conversationRenderBlocks";
import { ScheduledMessageNotice } from "./ScheduledMessageNotice";

const SchemaErrorDisplay: FC<{ errorLine: string }> = ({ errorLine }) => {
  return (
    <li className="w-full flex justify-start">
      <div className="w-full max-w-3xl lg:max-w-4xl sm:w-[90%] md:w-[85%] px-2">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2 border-l-2 border-red-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  <Trans id="conversation.error.schema" />
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-background rounded border border-red-200 p-3 mt-2">
              <div className="space-y-3">
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-red-800">
                    <Trans id="conversation.error.schema_validation" />
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    <Trans id="conversation.error.schema_validation.description" />{" "}
                    <a
                      href="https://git.dev.sh.ctripcorp.com/ticket/spec-forge/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 underline underline-offset-4"
                    >
                      <Trans id="conversation.error.report_issue" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>
                <div className="bg-gray-50 border rounded px-3 py-2">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">
                    <Trans id="conversation.error.raw_content" />
                  </h5>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono text-gray-800">
                    {errorLine}
                  </pre>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </li>
  );
};

type ConversationListProps = {
  conversations: (Conversation | ErrorJsonl)[];
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
  getToolUseResult: (toolUseId: string) => unknown;
  projectId: string;
  sessionId: string;
  scheduledJobs: SchedulerJob[];
};

const ConversationProcessGroup: FC<{
  entries: AssistantConversationRenderEntry[];
  projectId: string;
  sessionId: string;
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
  getToolUseResult: (toolUseId: string) => unknown;
  getAgentIdForToolUse: (toolUseId: string) => string | undefined;
  hasLaterVisibleAssistantText: (assistantUuid: string) => boolean;
  getTurnDuration: (uuid: string) => number | undefined;
  isRootSidechain: (conversation: Conversation) => boolean;
  getSidechainConversations: (rootUuid: string) => SidechainConversation[];
  getSidechainConversationByAgentId: (
    agentId: string,
  ) => SidechainConversation | undefined;
  getSidechainConversationByPrompt: (
    prompt: string,
  ) => SidechainConversation | undefined;
  existsRelatedTaskCall: (prompt: string) => boolean;
}> = ({
  entries,
  projectId,
  sessionId,
  getToolResult,
  getToolUseResult,
  getAgentIdForToolUse,
  hasLaterVisibleAssistantText,
  getTurnDuration,
  isRootSidechain,
  getSidechainConversations,
  getSidechainConversationByAgentId,
  getSidechainConversationByPrompt,
  existsRelatedTaskCall,
}) => {
  const summary = buildAssistantProcessGroupSummary(entries);

  return (
    <li className="w-full flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-full min-w-0 max-w-full sm:w-[90%] md:w-[85%] lg:max-w-4xl xl:max-w-4xl">
        <Card className="mb-2 max-w-full min-w-0 overflow-hidden border-border/80 bg-card p-0 shadow-none">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader className="group cursor-pointer px-4 py-2.5 transition-colors duration-200 hover:bg-muted/35">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted/70 text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <CardTitle className="max-w-full truncate text-sm font-medium text-foreground">
                          {`Progress ${formatDuration(summary.durationMs)}`}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="h-6 rounded-full px-2.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {`${entries.length} 条记录`}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5" />
                          {`${summary.toolUseCount} 个工具调用`}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5" />
                          {`${summary.thinkingCount} 条思考`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-border bg-muted/15 px-3 pb-3 pt-3">
                <ul className="space-y-2">
                  {entries.map(
                    ({ conversation, showTimestamp, renderVersionKey }) => (
                      <li key={`group-item-${conversation.uuid}`}>
                        <ConversationItem
                          conversation={conversation}
                          getToolResult={getToolResult}
                          getToolUseResult={getToolUseResult}
                          getAgentIdForToolUse={getAgentIdForToolUse}
                          hasLaterVisibleAssistantText={
                            hasLaterVisibleAssistantText
                          }
                          getTurnDuration={getTurnDuration}
                          isRootSidechain={isRootSidechain}
                          getSidechainConversations={getSidechainConversations}
                          getSidechainConversationByAgentId={
                            getSidechainConversationByAgentId
                          }
                          getSidechainConversationByPrompt={
                            getSidechainConversationByPrompt
                          }
                          existsRelatedTaskCall={existsRelatedTaskCall}
                          projectId={projectId}
                          sessionId={sessionId}
                          showTimestamp={showTimestamp}
                          renderVersionKey={renderVersionKey}
                        />
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </li>
  );
};

export const ConversationList: FC<ConversationListProps> = ({
  conversations,
  getToolResult,
  getToolUseResult,
  projectId,
  sessionId,
  scheduledJobs,
}) => {
  const conversationListState = useMemo(
    () =>
      buildConversationListState(conversations, {
        getToolResult,
        getToolUseResult,
      }),
    [conversations, getToolResult, getToolUseResult],
  );
  const {
    validConversations,
    renderEntries,
    turnDurationMap,
    toolUseIdToAgentIdMap,
    historicalAssistantTextMap,
  } = conversationListState;
  const {
    isRootSidechain,
    getSidechainConversations,
    getSidechainConversationByPrompt,
    getSidechainConversationByAgentId,
    existsRelatedTaskCall,
  } = useSidechain(validConversations);

  const getTurnDuration = useCallback(
    (uuid: string): number | undefined => {
      return turnDurationMap.get(uuid);
    },
    [turnDurationMap],
  );

  const getAgentIdForToolUse = useCallback(
    (toolUseId: string): string | undefined => {
      return toolUseIdToAgentIdMap.get(toolUseId);
    },
    [toolUseIdToAgentIdMap],
  );

  const hasLaterVisibleAssistantText = useCallback(
    (assistantUuid: string): boolean => {
      return historicalAssistantTextMap.get(assistantUuid) ?? false;
    },
    [historicalAssistantTextMap],
  );

  const visibleRenderEntries = useMemo(() => {
    return renderEntries.filter((entry) =>
      shouldRenderConversation(entry.conversation),
    );
  }, [renderEntries]);

  const renderBlocks = useMemo(() => {
    return buildConversationRenderBlocks(
      visibleRenderEntries,
      historicalAssistantTextMap,
    );
  }, [visibleRenderEntries, historicalAssistantTextMap]);

  return (
    <>
      <ul className="notranslate" translate="no">
        {renderBlocks.map((block, blockIndex) => {
          if (block.type === "assistant-process-group") {
            const firstEntry = block.entries[0];
            const blockKey =
              firstEntry === undefined
                ? `assistant-process-group-${blockIndex}`
                : `assistant-process-group-${firstEntry.conversation.uuid}`;

            return (
              <ConversationProcessGroup
                key={blockKey}
                entries={block.entries}
                projectId={projectId}
                sessionId={sessionId}
                getToolResult={getToolResult}
                getToolUseResult={getToolUseResult}
                getAgentIdForToolUse={getAgentIdForToolUse}
                hasLaterVisibleAssistantText={hasLaterVisibleAssistantText}
                getTurnDuration={getTurnDuration}
                isRootSidechain={isRootSidechain}
                getSidechainConversations={getSidechainConversations}
                getSidechainConversationByAgentId={
                  getSidechainConversationByAgentId
                }
                getSidechainConversationByPrompt={
                  getSidechainConversationByPrompt
                }
                existsRelatedTaskCall={existsRelatedTaskCall}
              />
            );
          }

          const { conversation, showTimestamp, renderVersionKey } = block.entry;

          if (conversation.type === "x-error") {
            return (
              <SchemaErrorDisplay
                key={`error_${conversation.line}`}
                errorLine={conversation.line}
              />
            );
          }

          const isSidechain =
            conversation.type !== "summary" &&
            conversation.type !== "file-history-snapshot" &&
            conversation.type !== "queue-operation" &&
            conversation.type !== "progress" &&
            conversation.type !== "last-prompt" &&
            conversation.isSidechain;

          return (
            <li
              className={`w-full flex ${
                isSidechain ||
                conversation.type === "assistant" ||
                conversation.type === "system" ||
                conversation.type === "summary"
                  ? "justify-start"
                  : "justify-end"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              key={getConversationKey(conversation)}
            >
              <div className="w-full min-w-0 max-w-full sm:w-[90%] md:w-[85%] lg:max-w-4xl xl:max-w-4xl">
                <ConversationItem
                  conversation={conversation}
                  getToolResult={getToolResult}
                  getToolUseResult={getToolUseResult}
                  getAgentIdForToolUse={getAgentIdForToolUse}
                  hasLaterVisibleAssistantText={hasLaterVisibleAssistantText}
                  getTurnDuration={getTurnDuration}
                  isRootSidechain={isRootSidechain}
                  getSidechainConversations={getSidechainConversations}
                  getSidechainConversationByAgentId={
                    getSidechainConversationByAgentId
                  }
                  getSidechainConversationByPrompt={
                    getSidechainConversationByPrompt
                  }
                  existsRelatedTaskCall={existsRelatedTaskCall}
                  projectId={projectId}
                  sessionId={sessionId}
                  showTimestamp={showTimestamp}
                  renderVersionKey={renderVersionKey}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <ScheduledMessageNotice scheduledJobs={scheduledJobs} />
    </>
  );
};
