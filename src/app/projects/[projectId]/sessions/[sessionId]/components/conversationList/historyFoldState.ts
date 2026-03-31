import type { Conversation } from "@/lib/conversation-schema";
import { hasAssistantTextContent } from "./assistantContentSegments";

export const buildHistoricalAssistantTextMap = (
  conversations: ReadonlyArray<Conversation>,
) => {
  const historyMap = new Map<string, boolean>();
  let hasLaterAssistantText = false;

  for (let index = conversations.length - 1; index >= 0; index -= 1) {
    const conversation = conversations[index];
    if (conversation === undefined) {
      continue;
    }

    if (conversation.type !== "assistant") {
      continue;
    }

    if (conversation.isSidechain) {
      continue;
    }

    historyMap.set(conversation.uuid, hasLaterAssistantText);

    if (hasAssistantTextContent(conversation)) {
      hasLaterAssistantText = true;
    }
  }

  return historyMap;
};
