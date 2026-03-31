export const getNextHandledQueuedMessageId = (
  currentHandledId: string | null,
  queuedMessageId: string,
  result: "success" | "aborted" | "failed",
): string | null => {
  if (result === "success") {
    return queuedMessageId;
  }

  if (currentHandledId === queuedMessageId) {
    return null;
  }

  return currentHandledId;
};
