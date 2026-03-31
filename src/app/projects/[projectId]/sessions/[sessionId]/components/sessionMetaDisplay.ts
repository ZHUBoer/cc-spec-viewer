import type { SessionMeta } from "@/server/core/types";

const hasAnyTokenUsage = (meta: SessionMeta) =>
  meta.cost.tokenUsage.inputTokens > 0 ||
  meta.cost.tokenUsage.outputTokens > 0 ||
  meta.cost.tokenUsage.cacheCreationTokens > 0 ||
  meta.cost.tokenUsage.cacheReadTokens > 0;

export const shouldShowPendingCost = (meta: SessionMeta) =>
  meta.isCostPending && !hasAnyTokenUsage(meta);

export const getVisibleSessionTotal = (
  totalSessions: number | undefined,
  loadedSessions: number,
) => totalSessions ?? loadedSessions;
