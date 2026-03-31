import type { Conversation } from "@/lib/conversation-schema";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import type { ErrorJsonl } from "@/server/core/types";
import { calculateDuration } from "../../../../../../../lib/date/formatDuration";
import { buildHistoricalAssistantTextMap } from "./historyFoldState";

type ConversationListItem = Conversation | ErrorJsonl;

export type ConversationRenderEntry = {
  conversation: ConversationListItem;
  showTimestamp: boolean;
  renderVersionKey: string;
};

export type ConversationListState = {
  validConversations: Conversation[];
  renderEntries: ConversationRenderEntry[];
  turnDurationMap: Map<string, number>;
  toolUseIdToAgentIdMap: Map<string, string>;
  historicalAssistantTextMap: Map<string, boolean>;
};

const hasAgentId = (
  toolUseResult: unknown,
): toolUseResult is { agentId: string } => {
  return (
    typeof toolUseResult === "object" &&
    toolUseResult !== null &&
    "agentId" in toolUseResult &&
    typeof toolUseResult.agentId === "string"
  );
};

export const getConversationKey = (conversation: Conversation) => {
  if (conversation.type === "user") {
    return `user_${conversation.uuid}`;
  }

  if (conversation.type === "assistant") {
    return `assistant_${conversation.uuid}`;
  }

  if (conversation.type === "system") {
    return `system_${conversation.uuid}`;
  }

  if (conversation.type === "summary") {
    return `summary_${conversation.leafUuid}`;
  }

  if (conversation.type === "file-history-snapshot") {
    return `file-history-snapshot_${conversation.messageId}`;
  }

  if (conversation.type === "queue-operation") {
    return `queue-operation_${conversation.operation}_${conversation.sessionId}_${conversation.timestamp}`;
  }

  if (conversation.type === "progress") {
    return `progress_${conversation.uuid}`;
  }

  if (conversation.type === "last-prompt") {
    return `last-prompt_${conversation.sessionId}`;
  }

  conversation satisfies never;
  throw new Error(`Unknown conversation type: ${conversation}`);
};

const getUniqueKey = (item: ConversationListItem): string => {
  if (item.type === "x-error") {
    return `error_${item.lineNumber}`;
  }

  return getConversationKey(item);
};

const isOnlyToolResultUserMessage = (conversation: Conversation) => {
  if (conversation.type !== "user") {
    return false;
  }

  const content = conversation.message.content;
  if (typeof content === "string") {
    return false;
  }

  return content.every(
    (item) => typeof item !== "string" && item.type === "tool_result",
  );
};

export const shouldRenderConversation = (
  conversation: ConversationListItem,
): boolean => {
  if (conversation.type === "x-error") {
    return true;
  }

  if (conversation.type === "progress") {
    return false;
  }

  const isHiddenSidechain =
    conversation.type !== "summary" &&
    conversation.type !== "file-history-snapshot" &&
    conversation.type !== "queue-operation" &&
    conversation.type !== "last-prompt" &&
    conversation.isSidechain;

  if (isHiddenSidechain) {
    return false;
  }

  if (
    conversation.type === "user" &&
    isOnlyToolResultUserMessage(conversation)
  ) {
    return false;
  }

  return true;
};

const shouldShowTimestamp = (conversation: ConversationListItem) => {
  if (!shouldRenderConversation(conversation)) {
    return false;
  }

  if (conversation.type === "x-error") {
    return false;
  }

  if (
    conversation.type === "summary" ||
    conversation.type === "progress" ||
    conversation.type === "queue-operation" ||
    conversation.type === "file-history-snapshot"
  ) {
    return false;
  }

  return true;
};

const buildToolUseDependencyKey = (
  conversation: Conversation,
  options: {
    getToolResult: (toolUseId: string) => ToolResultContent | undefined;
    getToolUseResult: (toolUseId: string) => unknown;
    toolUseIdToAgentIdMap: Map<string, string>;
  },
) => {
  if (conversation.type !== "assistant") {
    return "";
  }

  const toolUseDependencies = conversation.message.content.flatMap(
    (content) => {
      if (content.type !== "tool_use") {
        return [];
      }

      const toolResult = options.getToolResult(content.id);
      const toolUseResult = options.getToolUseResult(content.id);
      const agentId = options.toolUseIdToAgentIdMap.get(content.id);

      return [
        `${content.id}:${toolResult !== undefined ? "result" : "no-result"}:${toolUseResult !== undefined ? "use-result" : "no-use-result"}:${agentId ?? "no-agent"}`,
      ];
    },
  );

  return toolUseDependencies.join("|");
};

const buildConversationContentKey = (conversation: ConversationListItem) => {
  if (conversation.type === "x-error") {
    return conversation.line;
  }

  if (conversation.type === "user") {
    return JSON.stringify({
      timestamp: conversation.timestamp,
      isMeta: conversation.isMeta === true,
      content: conversation.message.content,
    });
  }

  if (conversation.type === "assistant") {
    return JSON.stringify({
      timestamp: conversation.timestamp,
      content: conversation.message.content,
    });
  }

  if (conversation.type === "system") {
    return JSON.stringify({
      timestamp: conversation.timestamp,
      subtype: conversation.subtype,
      level: "level" in conversation ? conversation.level : undefined,
      content: "content" in conversation ? conversation.content : undefined,
      toolUseID:
        "toolUseID" in conversation ? conversation.toolUseID : undefined,
      slug: "slug" in conversation ? conversation.slug : undefined,
      hookCount:
        conversation.subtype === "stop_hook_summary"
          ? conversation.hookCount
          : undefined,
      stopReason:
        conversation.subtype === "stop_hook_summary"
          ? conversation.stopReason
          : undefined,
      hookInfos:
        conversation.subtype === "stop_hook_summary"
          ? conversation.hookInfos
          : undefined,
      hookErrors:
        conversation.subtype === "stop_hook_summary"
          ? conversation.hookErrors
          : undefined,
      durationMs:
        conversation.subtype === "turn_duration"
          ? conversation.durationMs
          : undefined,
      compactMetadata:
        conversation.subtype === "compact_boundary"
          ? conversation.compactMetadata
          : undefined,
      microcompactMetadata:
        conversation.subtype === "microcompact_boundary"
          ? conversation.microcompactMetadata
          : undefined,
    });
  }

  if (conversation.type === "summary") {
    return JSON.stringify({
      summary: conversation.summary,
      leafUuid: conversation.leafUuid,
    });
  }

  if (conversation.type === "file-history-snapshot") {
    return JSON.stringify({
      messageId: conversation.messageId,
      snapshot: conversation.snapshot,
      isSnapshotUpdate: conversation.isSnapshotUpdate,
    });
  }

  if (conversation.type === "queue-operation") {
    return JSON.stringify({
      operation: conversation.operation,
      timestamp: conversation.timestamp,
      sessionId: conversation.sessionId,
    });
  }

  if (conversation.type === "progress") {
    return JSON.stringify({
      uuid: conversation.uuid,
      timestamp: conversation.timestamp,
      data: conversation.data,
    });
  }

  if (conversation.type === "last-prompt") {
    return JSON.stringify({
      lastPrompt: conversation.lastPrompt,
      sessionId: conversation.sessionId,
    });
  }

  conversation satisfies never;
  throw new Error(`Unknown conversation type: ${conversation}`);
};

const buildTurnDurationMap = (conversations: Conversation[]) => {
  const turnDurationMap = new Map<string, number>();
  const turnStartIndices: number[] = [];

  for (let index = 0; index < conversations.length; index += 1) {
    const conversation = conversations[index];
    if (conversation === undefined || conversation.type !== "user") {
      continue;
    }

    if (conversation.isSidechain) {
      continue;
    }

    const content = conversation.message.content;
    if (Array.isArray(content)) {
      const firstItem = content[0];
      if (
        typeof firstItem === "object" &&
        firstItem !== null &&
        "type" in firstItem &&
        firstItem.type === "tool_result"
      ) {
        continue;
      }
    }

    turnStartIndices.push(index);
  }

  for (let turnIndex = 0; turnIndex < turnStartIndices.length; turnIndex += 1) {
    const turnStartIndex = turnStartIndices[turnIndex];
    if (turnStartIndex === undefined) {
      continue;
    }

    const turnEndIndex =
      turnStartIndices[turnIndex + 1] ?? conversations.length;
    const turnStartConversation = conversations[turnStartIndex];
    if (
      turnStartConversation === undefined ||
      turnStartConversation.type !== "user"
    ) {
      continue;
    }

    let lastAssistantConversation: Conversation | null = null;

    for (let index = turnStartIndex + 1; index < turnEndIndex; index += 1) {
      const conversation = conversations[index];
      if (
        conversation !== undefined &&
        conversation.type === "assistant" &&
        !conversation.isSidechain
      ) {
        lastAssistantConversation = conversation;
      }
    }

    if (lastAssistantConversation === null) {
      continue;
    }

    const duration = calculateDuration(
      turnStartConversation.timestamp,
      lastAssistantConversation.timestamp,
    );
    if (duration !== null && duration >= 0) {
      turnDurationMap.set(lastAssistantConversation.uuid, duration);
    }
  }

  return turnDurationMap;
};

export const buildConversationListState = (
  conversations: ReadonlyArray<ConversationListItem>,
  options: {
    getToolResult: (toolUseId: string) => ToolResultContent | undefined;
    getToolUseResult: (toolUseId: string) => unknown;
  },
): ConversationListState => {
  const seen = new Set<string>();
  const deduplicatedConversations: ConversationListItem[] = [];

  for (const conversation of conversations) {
    const key = getUniqueKey(conversation);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduplicatedConversations.push(conversation);
  }

  const validConversations = deduplicatedConversations.filter(
    (conversation): conversation is Conversation =>
      conversation.type !== "x-error",
  );

  const toolUseIdToAgentIdMap = new Map<string, string>();
  for (const conversation of validConversations) {
    if (conversation.type !== "user") {
      continue;
    }

    const messageContent = conversation.message.content;
    if (typeof messageContent === "string") {
      continue;
    }

    for (const content of messageContent) {
      if (typeof content === "string" || content.type !== "tool_result") {
        continue;
      }

      if (hasAgentId(conversation.toolUseResult)) {
        toolUseIdToAgentIdMap.set(
          content.tool_use_id,
          conversation.toolUseResult.agentId,
        );
      }
    }
  }

  const turnDurationMap = buildTurnDurationMap(validConversations);
  const historicalAssistantTextMap =
    buildHistoricalAssistantTextMap(validConversations);

  const renderEntries = deduplicatedConversations.map((conversation) => {
    const showTimestamp = shouldShowTimestamp(conversation);
    const baseKey = getUniqueKey(conversation);
    const contentKey = buildConversationContentKey(conversation);

    if (conversation.type === "x-error") {
      return {
        conversation,
        showTimestamp,
        renderVersionKey: `${baseKey}:error:${contentKey}`,
      } satisfies ConversationRenderEntry;
    }

    const toolDependencyKey = buildToolUseDependencyKey(conversation, {
      getToolResult: options.getToolResult,
      getToolUseResult: options.getToolUseResult,
      toolUseIdToAgentIdMap,
    });
    const turnDuration =
      conversation.type === "assistant"
        ? (turnDurationMap.get(conversation.uuid) ?? -1)
        : -1;
    const historicalAssistantText =
      conversation.type === "assistant"
        ? (historicalAssistantTextMap.get(conversation.uuid) ?? false)
        : false;

    return {
      conversation,
      showTimestamp,
      renderVersionKey: `${baseKey}:content:${contentKey}:ts:${showTimestamp ? "1" : "0"}:dur:${turnDuration}:deps:${toolDependencyKey}:hist:${historicalAssistantText ? "1" : "0"}`,
    } satisfies ConversationRenderEntry;
  });

  return {
    validConversations,
    renderEntries,
    turnDurationMap,
    toolUseIdToAgentIdMap,
    historicalAssistantTextMap,
  };
};
