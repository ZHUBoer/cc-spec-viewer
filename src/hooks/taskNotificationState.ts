import type { ExtendedConversation } from "@/server/core/types";

export type TaskNotificationSnapshot = {
  isRunningTask: boolean;
  latestCompletionKey: string;
};

export type TaskNotificationState = {
  hasHydrated: boolean;
  previousRunning: boolean;
  runningBaselineCompletionKey: string;
  pendingCompletionBaselineKey: string | null;
};

export type TaskNotificationDecision = {
  nextState: TaskNotificationState;
  shouldNotify: boolean;
};

const isVisibleConversation = (conversation: ExtendedConversation) => {
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
    conversation.isSidechain === true;

  if (isHiddenSidechain) {
    return false;
  }

  if (conversation.type !== "user") {
    return true;
  }

  const content = conversation.message.content;
  if (typeof content === "string") {
    return true;
  }

  return content.some(
    (item) => typeof item === "string" || item.type !== "tool_result",
  );
};

const getConversationIdentity = (
  conversation: ExtendedConversation,
  index: number,
) => {
  if (conversation.type === "x-error") {
    return `x-error:${conversation.lineNumber}`;
  }

  const uuid =
    "uuid" in conversation && typeof conversation.uuid === "string"
      ? conversation.uuid
      : "no-uuid";
  const timestamp =
    "timestamp" in conversation && typeof conversation.timestamp === "string"
      ? conversation.timestamp
      : "no-timestamp";

  return `${conversation.type}:${uuid}:${timestamp}:${index}`;
};

const serializeCompletionContent = (conversation: ExtendedConversation) => {
  if (conversation.type === "assistant") {
    return JSON.stringify(
      conversation.message.content.filter((item) => item.type === "text"),
    );
  }

  if (conversation.type === "x-error") {
    return conversation.line;
  }

  return "completion:none";
};

const serializeStreamContent = (conversation: ExtendedConversation) => {
  if (conversation.type === "x-error") {
    return conversation.line;
  }

  if (conversation.type === "user") {
    return JSON.stringify(conversation.message.content);
  }

  if (conversation.type === "assistant") {
    return JSON.stringify(conversation.message.content);
  }

  return JSON.stringify(conversation);
};

const isCompletionEligibleConversation = (
  conversation: ExtendedConversation,
): boolean => {
  if (!isVisibleConversation(conversation)) {
    return false;
  }

  if (conversation.type === "x-error") {
    return true;
  }

  if (conversation.type === "assistant") {
    return conversation.message.content.some((item) => item.type === "text");
  }

  return false;
};

export const getTaskStreamContentKey = (
  conversations: ReadonlyArray<ExtendedConversation>,
) => {
  let lastKey = "stream:none";

  for (const [index, conversation] of conversations.entries()) {
    if (!isVisibleConversation(conversation)) {
      continue;
    }

    lastKey = `stream:${getConversationIdentity(conversation, index)}:${serializeStreamContent(conversation)}`;
  }

  return lastKey;
};

export const getTaskCompletionContentKey = (
  conversations: ReadonlyArray<ExtendedConversation>,
) => {
  let lastKey = "completion:none";

  for (const [index, conversation] of conversations.entries()) {
    if (!isCompletionEligibleConversation(conversation)) {
      continue;
    }

    lastKey = `completion:${getConversationIdentity(conversation, index)}:${serializeCompletionContent(conversation)}`;
  }

  return lastKey;
};

export const createInitialTaskNotificationState =
  (): TaskNotificationState => ({
    hasHydrated: false,
    previousRunning: false,
    runningBaselineCompletionKey: "completion:none",
    pendingCompletionBaselineKey: null,
  });

export const advanceTaskNotificationState = (
  state: TaskNotificationState,
  snapshot: TaskNotificationSnapshot,
): TaskNotificationDecision => {
  if (!state.hasHydrated) {
    return {
      shouldNotify: false,
      nextState: {
        hasHydrated: true,
        previousRunning: snapshot.isRunningTask,
        runningBaselineCompletionKey: snapshot.latestCompletionKey,
        pendingCompletionBaselineKey: null,
      },
    };
  }

  let pendingCompletionBaselineKey = state.pendingCompletionBaselineKey;
  let runningBaselineCompletionKey = state.runningBaselineCompletionKey;
  let shouldNotify = false;

  if (snapshot.isRunningTask && pendingCompletionBaselineKey !== null) {
    pendingCompletionBaselineKey = null;
  }

  if (
    pendingCompletionBaselineKey !== null &&
    snapshot.latestCompletionKey !== pendingCompletionBaselineKey
  ) {
    shouldNotify = true;
    pendingCompletionBaselineKey = null;
  }

  if (!state.previousRunning && snapshot.isRunningTask) {
    runningBaselineCompletionKey = snapshot.latestCompletionKey;
  }

  if (
    state.previousRunning &&
    !snapshot.isRunningTask &&
    pendingCompletionBaselineKey === null &&
    !shouldNotify
  ) {
    if (snapshot.latestCompletionKey !== runningBaselineCompletionKey) {
      shouldNotify = true;
    } else {
      pendingCompletionBaselineKey = snapshot.latestCompletionKey;
    }
  }

  return {
    shouldNotify,
    nextState: {
      hasHydrated: true,
      previousRunning: snapshot.isRunningTask,
      runningBaselineCompletionKey,
      pendingCompletionBaselineKey,
    },
  };
};
