import { countVisibleSessionMessagesFromConversations } from "../../../../lib/session-display";
import type { ParsedUserMessage } from "../../claude-code/functions/parseUserMessage";
import type { ExtendedConversation, SessionMeta } from "../../types";
import { calculateTokenCost } from "./calculateSessionCost";
import { extractFirstUserMessage } from "./isValidFirstMessage";

export const countVisibleConversations = (
  conversations: ReadonlyArray<ExtendedConversation>,
) => {
  return countVisibleSessionMessagesFromConversations(conversations);
};

export const getFirstVisibleUserMessage = (
  conversations: ReadonlyArray<ExtendedConversation>,
): ParsedUserMessage | null => {
  for (const conversation of conversations) {
    const firstUserMessage = extractFirstUserMessage(conversation);
    if (firstUserMessage !== undefined) {
      return firstUserMessage;
    }
  }

  return null;
};

export const getLastConversationTimestamp = (
  conversations: ReadonlyArray<ExtendedConversation>,
) => {
  let lastTimestamp: Date | null = null;

  for (const conversation of conversations) {
    if (
      !("timestamp" in conversation) ||
      typeof conversation.timestamp !== "string"
    ) {
      continue;
    }

    const timestamp = new Date(conversation.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
      continue;
    }

    if (lastTimestamp === null || timestamp > lastTimestamp) {
      lastTimestamp = timestamp;
    }
  }

  return lastTimestamp;
};

/**
 * 从虚拟对话的 assistant 消息中聚合 token 统计和成本
 *
 * 虚拟对话中的 usage 数据与最终落盘到 JSONL 的数据同源（都来自 Claude Code 进程 stdout），
 * 因此可以作为预览值参与统计，不存在精度问题。
 */
export const aggregateVirtualTokenUsage = (
  conversations: ReadonlyArray<ExtendedConversation>,
): {
  modelName: string | null;
  cost: SessionMeta["cost"];
} => {
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreationTokens = 0;
  let totalCacheReadTokens = 0;
  let totalInputTokensUsd = 0;
  let totalOutputTokensUsd = 0;
  let totalCacheCreationUsd = 0;
  let totalCacheReadUsd = 0;
  let lastModelName: string | null = null;

  for (const conversation of conversations) {
    if (conversation.type !== "assistant") {
      continue;
    }

    const usage = conversation.message.usage;
    const modelName = conversation.message.model;

    const messageCost = calculateTokenCost(
      {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      },
      modelName,
    );

    totalInputTokens += usage.input_tokens;
    totalOutputTokens += usage.output_tokens;
    totalCacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
    totalCacheReadTokens += usage.cache_read_input_tokens ?? 0;

    totalInputTokensUsd += messageCost.breakdown.inputTokensUsd;
    totalOutputTokensUsd += messageCost.breakdown.outputTokensUsd;
    totalCacheCreationUsd += messageCost.breakdown.cacheCreationUsd;
    totalCacheReadUsd += messageCost.breakdown.cacheReadUsd;

    lastModelName = modelName;
  }

  return {
    modelName: lastModelName,
    cost: {
      totalUsd:
        totalInputTokensUsd +
        totalOutputTokensUsd +
        totalCacheCreationUsd +
        totalCacheReadUsd,
      breakdown: {
        inputTokensUsd: totalInputTokensUsd,
        outputTokensUsd: totalOutputTokensUsd,
        cacheCreationUsd: totalCacheCreationUsd,
        cacheReadUsd: totalCacheReadUsd,
      },
      tokenUsage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cacheCreationTokens: totalCacheCreationTokens,
        cacheReadTokens: totalCacheReadTokens,
      },
    },
  };
};

export const mergeSessionMetaWithVirtualConversations = <
  TMeta extends {
    messageCount: number;
    firstUserMessage: ParsedUserMessage | null;
    isCostPending: boolean;
    cost: SessionMeta["cost"];
    modelName: string | null;
  },
>(
  meta: TMeta,
  virtualConversations: ReadonlyArray<ExtendedConversation>,
) => {
  if (virtualConversations.length === 0) {
    return meta;
  }

  const virtualStats = aggregateVirtualTokenUsage(virtualConversations);

  return {
    ...meta,
    messageCount:
      meta.messageCount + countVisibleConversations(virtualConversations),
    firstUserMessage:
      meta.firstUserMessage ?? getFirstVisibleUserMessage(virtualConversations),
    modelName: meta.modelName ?? virtualStats.modelName,
    cost: {
      totalUsd: meta.cost.totalUsd + virtualStats.cost.totalUsd,
      breakdown: {
        inputTokensUsd:
          meta.cost.breakdown.inputTokensUsd +
          virtualStats.cost.breakdown.inputTokensUsd,
        outputTokensUsd:
          meta.cost.breakdown.outputTokensUsd +
          virtualStats.cost.breakdown.outputTokensUsd,
        cacheCreationUsd:
          meta.cost.breakdown.cacheCreationUsd +
          virtualStats.cost.breakdown.cacheCreationUsd,
        cacheReadUsd:
          meta.cost.breakdown.cacheReadUsd +
          virtualStats.cost.breakdown.cacheReadUsd,
      },
      tokenUsage: {
        inputTokens:
          meta.cost.tokenUsage.inputTokens +
          virtualStats.cost.tokenUsage.inputTokens,
        outputTokens:
          meta.cost.tokenUsage.outputTokens +
          virtualStats.cost.tokenUsage.outputTokens,
        cacheCreationTokens:
          meta.cost.tokenUsage.cacheCreationTokens +
          virtualStats.cost.tokenUsage.cacheCreationTokens,
        cacheReadTokens:
          meta.cost.tokenUsage.cacheReadTokens +
          virtualStats.cost.tokenUsage.cacheReadTokens,
      },
    },
    isCostPending: true,
  };
};
