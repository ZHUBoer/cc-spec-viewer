import { useLingui } from "@lingui/react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { type FC, memo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { formatLocaleDate } from "@/lib/date/formatLocaleDate";
import { localeSchema } from "@/lib/i18n/schema";
import { AssistantConversationContent } from "./AssistantConversationContent";
import { buildAssistantContentSegments } from "./assistantContentSegments";
import { FileHistorySnapshotConversationContent } from "./FileHistorySnapshotConversationContent";
import { MetaConversationContent } from "./MetaConversationContent";
import { QueueOperationConversationContent } from "./QueueOperationConversationContent";
import { SummaryConversationContent } from "./SummaryConversationContent";
import { SystemConversationContent } from "./SystemConversationContent";
import { TurnDuration } from "./TurnDuration";
import { UserConversationContent } from "./UserConversationContent";

type ConversationItemProps = {
  conversation: Conversation;
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
  getToolUseResult: (toolUseId: string) => unknown;
  getAgentIdForToolUse: (toolUseId: string) => string | undefined;
  hasLaterVisibleAssistantText: (assistantUuid: string) => boolean;
  getTurnDuration: (uuid: string) => number | undefined;
  isRootSidechain: (conversation: Conversation) => boolean;
  getSidechainConversationByAgentId: (
    agentId: string,
  ) => SidechainConversation | undefined;
  getSidechainConversationByPrompt: (
    prompt: string,
  ) => SidechainConversation | undefined;
  getSidechainConversations: (rootUuid: string) => SidechainConversation[];
  existsRelatedTaskCall: (prompt: string) => boolean;
  projectId: string;
  sessionId: string;
  showTimestamp?: boolean;
  renderVersionKey: string;
};

const ConversationItemImpl: FC<ConversationItemProps> = ({
  conversation,
  getToolResult,
  getToolUseResult,
  getAgentIdForToolUse,
  hasLaterVisibleAssistantText,
  getTurnDuration,
  getSidechainConversationByPrompt,
  getSidechainConversations,
  getSidechainConversationByAgentId,
  projectId,
  sessionId,
  showTimestamp = true,
}) => {
  const { i18n } = useLingui();
  const localeParse = localeSchema.safeParse(i18n.locale);
  const locale = localeParse.success ? localeParse.data : "en";
  const [copiedReportUuid, setCopiedReportUuid] = useState<string | null>(null);

  if (conversation.type === "summary") {
    return (
      <SummaryConversationContent>
        {conversation.summary}
      </SummaryConversationContent>
    );
  }

  if (conversation.type === "system") {
    if (conversation.subtype === "api_error" && "error" in conversation) {
      const error = conversation.error;
      const errorMsg =
        error?.error?.error?.message ||
        error?.error?.message ||
        (error?.error
          ? JSON.stringify(error.error, null, 2)
          : "Unknown API error");

      const reportContent = [
        i18n._({
          id: "conversation.api_error.report.header",
          message: "Incident Report",
        }),
        i18n._({
          id: "conversation.api_error.report.issue_type",
          message: "Issue Type: Upstream API Error",
        }),
        i18n._({
          id: "conversation.api_error.report.time",
          message: "Error Time: {timestamp}",
          values: { timestamp: conversation.timestamp },
        }),
        i18n._({
          id: "conversation.api_error.report.session_id",
          message: "Session ID: {sessionId}",
          values: { sessionId: conversation.sessionId },
        }),
        i18n._({
          id: "conversation.api_error.report.message_uuid",
          message: "Message UUID: {uuid}",
          values: { uuid: conversation.uuid },
        }),
        i18n._({
          id: "conversation.api_error.report.parent_uuid",
          message: "Parent UUID: {parentUuid}",
          values: { parentUuid: conversation.parentUuid ?? "null" },
        }),
        i18n._({
          id: "conversation.api_error.report.request_id",
          message: "Request ID: {requestId}",
          values: { requestId: error.requestID ?? "N/A" },
        }),
        i18n._({
          id: "conversation.api_error.report.http_status",
          message: "HTTP Status: {status}",
          values: { status: error.status ?? "N/A" },
        }),
        i18n._({
          id: "conversation.api_error.report.error",
          message: "Error: {error}",
          values: { error: errorMsg },
        }),
        i18n._({
          id: "conversation.api_error.report.version",
          message: "Version: {version}",
          values: { version: conversation.version },
        }),
        i18n._({
          id: "conversation.api_error.report.cwd",
          message: "CWD: {cwd}",
          values: { cwd: conversation.cwd },
        }),
        i18n._({
          id: "conversation.api_error.report.git_branch",
          message: "Git Branch: {gitBranch}",
          values: { gitBranch: conversation.gitBranch ?? "N/A" },
        }),
        conversation.retryAttempt !== undefined
          ? i18n._({
              id: "conversation.api_error.report.retry",
              message: "Retry: {attempt}/{maxRetries}",
              values: {
                attempt: conversation.retryAttempt,
                maxRetries: conversation.maxRetries,
              },
            })
          : null,
        conversation.retryInMs !== undefined
          ? i18n._({
              id: "conversation.api_error.report.retry_in",
              message: "Retry In: {seconds}s",
              values: {
                seconds: (conversation.retryInMs / 1000).toFixed(2),
              },
            })
          : null,
      ]
        .filter((line): line is string => line !== null)
        .join("\n");

      const handleCopyReport = async () => {
        try {
          await navigator.clipboard.writeText(reportContent);
          setCopiedReportUuid(conversation.uuid);
          setTimeout(() => {
            setCopiedReportUuid((prev) =>
              prev === conversation.uuid ? null : prev,
            );
          }, 2000);
        } catch (copyError) {
          console.error("Failed to copy api error report:", copyError);
          toast.error(
            i18n._({
              id: "conversation.api_error.copy_failed",
              message: "Failed to copy incident report",
            }),
          );
        }
      };

      return (
        <Collapsible defaultOpen>
          <div className="border border-red-300 rounded-md bg-red-50/60">
            <CollapsibleTrigger asChild>
              <div className="group flex items-start justify-between gap-3 p-3 cursor-pointer">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-base font-semibold text-red-700">
                      {i18n._({
                        id: "conversation.api_error.title",
                        message: "Server Error (API Error)",
                      })}
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {i18n._({
                        id: "conversation.api_error.description",
                        message:
                          "This error is returned by the upstream model service or platform, not a local SpecForge parsing error. Please contact your model provider or platform team for investigation.",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleCopyReport();
                    }}
                  >
                    {copiedReportUuid === conversation.uuid
                      ? i18n._({
                          id: "conversation.api_error.copied",
                          message: "Copied",
                        })
                      : i18n._({
                          id: "conversation.api_error.copy_report",
                          message: "Copy Incident Report",
                        })}
                  </Button>
                  <ChevronDown className="h-4 w-4 text-red-700 transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mx-3 mb-3 mt-1 bg-background rounded border border-red-200 p-3">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {reportContent}
                </pre>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    }

    // Format system message with full details based on subtype
    const formatSystemMessage = () => {
      const lines: string[] = [];

      // Add subtype label if available
      if ("subtype" in conversation && conversation.subtype) {
        lines.push(`[${conversation.subtype}]`);
      }

      // Add level if available
      if ("level" in conversation && conversation.level) {
        lines.push(`Level: ${conversation.level}`);
      }

      // Handle content field
      if (
        "content" in conversation &&
        typeof conversation.content === "string"
      ) {
        lines.push(`\n${conversation.content}`);
      }

      // Handle stop_hook_summary
      if (conversation.subtype === "stop_hook_summary") {
        lines.push(`Hook Count: ${conversation.hookCount}`);
        lines.push(`Stop Reason: ${conversation.stopReason}`);
        lines.push(
          `Prevented Continuation: ${conversation.preventedContinuation}`,
        );
        lines.push(`Has Output: ${conversation.hasOutput}`);
        if (conversation.hookInfos.length > 0) {
          lines.push(
            `Commands: ${conversation.hookInfos.map((h) => h.command).join(", ")}`,
          );
        }
        if (conversation.hookErrors.length > 0) {
          lines.push(
            `Errors: ${JSON.stringify(conversation.hookErrors, null, 2)}`,
          );
        }
      }

      // Handle turn_duration
      if (conversation.subtype === "turn_duration") {
        lines.push(`Duration: ${(conversation.durationMs / 1000).toFixed(2)}s`);
      }

      // Handle compact_boundary
      if (
        conversation.subtype === "compact_boundary" &&
        conversation.compactMetadata
      ) {
        lines.push(`Trigger: ${conversation.compactMetadata.trigger}`);
        lines.push(`Pre-Tokens: ${conversation.compactMetadata.preTokens}`);
      }

      // Handle microcompact_boundary
      if (
        conversation.subtype === "microcompact_boundary" &&
        conversation.microcompactMetadata
      ) {
        lines.push(`Trigger: ${conversation.microcompactMetadata.trigger}`);
        lines.push(
          `Pre-Tokens: ${conversation.microcompactMetadata.preTokens}`,
        );
        lines.push(
          `Saved-Tokens: ${conversation.microcompactMetadata.tokensSaved}`,
        );
      }

      // Handle toolUseID
      if ("toolUseID" in conversation && conversation.toolUseID) {
        lines.push(`Tool Use ID: ${conversation.toolUseID}`);
      }

      // Handle slug
      if ("slug" in conversation && conversation.slug) {
        lines.push(`Slug: ${conversation.slug}`);
      }

      return lines.join("\n");
    };

    return (
      <SystemConversationContent>
        {formatSystemMessage()}
      </SystemConversationContent>
    );
  }

  if (conversation.type === "file-history-snapshot") {
    return (
      <FileHistorySnapshotConversationContent conversation={conversation} />
    );
  }

  if (conversation.type === "queue-operation") {
    return <QueueOperationConversationContent conversation={conversation} />;
  }

  if (conversation.type === "user") {
    const userConversationJsx =
      typeof conversation.message.content === "string" ? (
        <UserConversationContent
          content={conversation.message.content}
          id={`message-${conversation.uuid}`}
        />
      ) : (
        <ul className="w-full" id={`message-${conversation.uuid}`}>
          {conversation.message.content.map((content, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Order is static
            <li key={index}>
              <UserConversationContent content={content} />
            </li>
          ))}
        </ul>
      );

    const timestamp =
      showTimestamp && conversation.timestamp ? (
        <div className="text-xs text-muted-foreground mb-1 px-1 select-none text-right">
          {formatLocaleDate(conversation.timestamp, {
            locale,
            target: "datetime",
          })}
        </div>
      ) : null;

    return conversation.isMeta === true ? (
      // 设置为可展开，默认不展开
      <MetaConversationContent>
        <div className="flex flex-col w-full">
          {timestamp}
          {userConversationJsx}
        </div>
      </MetaConversationContent>
    ) : (
      <div className="flex flex-col w-full">
        {timestamp}
        {userConversationJsx}
      </div>
    );
  }

  if (conversation.type === "assistant") {
    const turnDuration = getTurnDuration(conversation.uuid);
    const segments = buildAssistantContentSegments(
      conversation.message.content,
    );
    let hasResolvedAssistantText = hasLaterVisibleAssistantText(
      conversation.uuid,
    );
    const segmentViews = [...segments]
      .reverse()
      .map((segment, index) => {
        const segmentKey = `assistant-segment-${segments.length - index - 1}`;

        if (segment.type === "content") {
          if (segment.content.type === "text") {
            hasResolvedAssistantText = true;
          }

          return (
            <li key={segmentKey}>
              <AssistantConversationContent
                content={segment.content}
                collapsible={false}
                getToolResult={getToolResult}
                getToolUseResult={getToolUseResult}
                getAgentIdForToolUse={getAgentIdForToolUse}
                getSidechainConversationByAgentId={
                  getSidechainConversationByAgentId
                }
                getSidechainConversationByPrompt={
                  getSidechainConversationByPrompt
                }
                getSidechainConversations={getSidechainConversations}
                projectId={projectId}
                sessionId={sessionId}
              />
            </li>
          );
        }

        const shouldCollapse = hasResolvedAssistantText;

        return (
          <li key={segmentKey}>
            <AssistantConversationContent
              content={segment.items}
              collapsible={shouldCollapse}
              getToolResult={getToolResult}
              getToolUseResult={getToolUseResult}
              getAgentIdForToolUse={getAgentIdForToolUse}
              getSidechainConversationByAgentId={
                getSidechainConversationByAgentId
              }
              getSidechainConversationByPrompt={
                getSidechainConversationByPrompt
              }
              getSidechainConversations={getSidechainConversations}
              projectId={projectId}
              sessionId={sessionId}
            />
          </li>
        );
      })
      .reverse();

    return (
      <div className="w-full" id={`message-${conversation.uuid}`}>
        {showTimestamp && conversation.timestamp && (
          <div className="text-xs text-muted-foreground mb-1 px-1 select-none text-left">
            {formatLocaleDate(conversation.timestamp, {
              locale,
              target: "datetime",
            })}
          </div>
        )}
        <ul className="w-full">{segmentViews}</ul>
        {turnDuration !== undefined && (
          <TurnDuration durationMs={turnDuration} />
        )}
      </div>
    );
  }

  return null;
};

export const ConversationItem = memo(
  ConversationItemImpl,
  (previousProps, nextProps) =>
    previousProps.renderVersionKey === nextProps.renderVersionKey &&
    previousProps.projectId === nextProps.projectId &&
    previousProps.sessionId === nextProps.sessionId,
);
