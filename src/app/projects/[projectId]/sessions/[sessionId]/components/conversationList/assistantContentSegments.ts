import type { Conversation } from "@/lib/conversation-schema";
import type { AssistantMessageContent } from "@/lib/conversation-schema/message/AssistantMessageSchema";

type ProcessContent = Extract<
  AssistantMessageContent,
  { type: "thinking" | "tool_use" }
>;

export type AssistantContentSegment =
  | {
      type: "content";
      content: AssistantMessageContent;
    }
  | {
      type: "process-group";
      items: ProcessContent[];
    };

const isProcessContent = (
  content: AssistantMessageContent,
): content is ProcessContent => {
  return content.type === "thinking" || content.type === "tool_use";
};

export const isMeaningfulAssistantText = (
  content: Extract<AssistantMessageContent, { type: "text" }>,
) => {
  return content.text.trim().length > 0;
};

export const buildAssistantContentSegments = (
  contentItems: AssistantMessageContent[],
): AssistantContentSegment[] => {
  const segments: AssistantContentSegment[] = [];
  let processBuffer: ProcessContent[] = [];

  const flushProcessBuffer = () => {
    if (processBuffer.length >= 2) {
      segments.push({
        type: "process-group",
        items: processBuffer,
      });
      processBuffer = [];
      return;
    }

    if (processBuffer.length === 1) {
      const firstItem = processBuffer[0];
      if (firstItem !== undefined) {
        segments.push({
          type: "content",
          content: firstItem,
        });
      }
    }

    processBuffer = [];
  };

  for (const content of contentItems) {
    if (content.type === "tool_result") {
      continue;
    }

    if (content.type === "text" && !isMeaningfulAssistantText(content)) {
      continue;
    }

    if (isProcessContent(content)) {
      processBuffer.push(content);
      continue;
    }

    flushProcessBuffer();
    segments.push({
      type: "content",
      content,
    });
  }

  flushProcessBuffer();

  return segments;
};

export const hasAssistantTextContent = (
  conversation: Extract<Conversation, { type: "assistant" }>,
) => {
  return conversation.message.content.some(
    (content) => content.type === "text" && isMeaningfulAssistantText(content),
  );
};

export const hasVisibleAssistantContent = (
  conversation: Extract<Conversation, { type: "assistant" }>,
) => {
  return conversation.message.content.some((content) => {
    if (content.type === "tool_result") {
      return false;
    }

    if (content.type === "text") {
      return isMeaningfulAssistantText(content);
    }

    return content.type === "thinking" || content.type === "tool_use";
  });
};
