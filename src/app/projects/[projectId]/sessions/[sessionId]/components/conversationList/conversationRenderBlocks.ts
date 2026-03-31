import type { Conversation } from "@/lib/conversation-schema";
import { calculateDuration } from "../../../../../../../lib/date/formatDuration";
import {
  hasAssistantTextContent,
  hasVisibleAssistantContent,
} from "./assistantContentSegments";
import type { ConversationRenderEntry } from "./conversationListState";

export type AssistantConversationRenderEntry = ConversationRenderEntry & {
  conversation: Extract<Conversation, { type: "assistant" }>;
};

export type ConversationRenderBlock =
  | {
      type: "single";
      entry: ConversationRenderEntry;
    }
  | {
      type: "assistant-process-group";
      entries: AssistantConversationRenderEntry[];
    };

export type AssistantProcessGroupSummary = {
  durationMs: number;
  toolUseCount: number;
  thinkingCount: number;
};

const isAssistantProcessConversation = (conversation: Conversation) => {
  if (conversation.type !== "assistant") {
    return false;
  }

  if (hasAssistantTextContent(conversation)) {
    return false;
  }

  return conversation.message.content.some((content) => {
    return content.type === "thinking" || content.type === "tool_use";
  });
};

const isEmptyAssistantConversation = (
  conversation: Extract<Conversation, { type: "assistant" }>,
) => {
  return !hasVisibleAssistantContent(conversation);
};

const isAssistantProcessRenderEntry = (
  entry: ConversationRenderEntry,
): entry is AssistantConversationRenderEntry => {
  return (
    entry.conversation.type === "assistant" &&
    isAssistantProcessConversation(entry.conversation)
  );
};

export const buildConversationRenderBlocks = (
  entries: ReadonlyArray<ConversationRenderEntry>,
  historicalAssistantTextMap: ReadonlyMap<string, boolean>,
) => {
  const blocks: ConversationRenderBlock[] = [];
  let processEntries: AssistantConversationRenderEntry[] = [];

  const flushProcessEntries = () => {
    if (processEntries.length >= 2) {
      const firstEntry = processEntries[0];
      const shouldCollapse =
        firstEntry?.conversation.type === "assistant" &&
        historicalAssistantTextMap.get(firstEntry.conversation.uuid) === true;

      if (shouldCollapse) {
        blocks.push({
          type: "assistant-process-group",
          entries: processEntries,
        });
      } else {
        blocks.push(
          ...processEntries.map(
            (entry) =>
              ({
                type: "single",
                entry,
              }) satisfies ConversationRenderBlock,
          ),
        );
      }
      processEntries = [];
      return;
    }

    if (processEntries.length === 1) {
      const firstEntry = processEntries[0];
      if (firstEntry !== undefined) {
        blocks.push({
          type: "single",
          entry: firstEntry,
        } satisfies ConversationRenderBlock);
      }
    }

    processEntries = [];
  };

  for (const entry of entries) {
    if (
      entry.conversation.type === "assistant" &&
      isEmptyAssistantConversation(entry.conversation)
    ) {
      continue;
    }

    if (
      entry.conversation.type === "x-error" ||
      !isAssistantProcessRenderEntry(entry)
    ) {
      flushProcessEntries();
      blocks.push({
        type: "single",
        entry,
      } satisfies ConversationRenderBlock);
      continue;
    }

    processEntries.push(entry);
  }

  flushProcessEntries();

  return blocks;
};

export const buildAssistantProcessGroupSummary = (
  entries: ReadonlyArray<AssistantConversationRenderEntry>,
): AssistantProcessGroupSummary => {
  const counts = entries.reduce(
    (acc, entry) => {
      for (const content of entry.conversation.message.content) {
        if (content.type === "thinking") {
          acc.thinkingCount += 1;
        }

        if (content.type === "tool_use") {
          acc.toolUseCount += 1;
        }
      }

      return acc;
    },
    { thinkingCount: 0, toolUseCount: 0 },
  );

  const firstEntry = entries[0];
  const lastEntry = entries.at(-1);
  const durationMs =
    firstEntry === undefined || lastEntry === undefined
      ? 0
      : (calculateDuration(
          firstEntry.conversation.timestamp,
          lastEntry.conversation.timestamp,
        ) ?? 0);

  return {
    durationMs: Math.max(durationMs, 0),
    toolUseCount: counts.toolUseCount,
    thinkingCount: counts.thinkingCount,
  };
};
