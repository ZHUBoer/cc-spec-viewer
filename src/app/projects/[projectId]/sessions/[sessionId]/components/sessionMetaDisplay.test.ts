import { describe, expect, it } from "vitest";
import type { SessionMeta } from "@/server/core/types";
import {
  getVisibleSessionTotal,
  shouldShowPendingCost,
} from "./sessionMetaDisplay";

const createMeta = (overrides?: Partial<SessionMeta>): SessionMeta => ({
  messageCount: 0,
  firstUserMessage: null,
  cost: {
    totalUsd: 0,
    breakdown: {
      inputTokensUsd: 0,
      outputTokensUsd: 0,
      cacheCreationUsd: 0,
      cacheReadUsd: 0,
    },
    tokenUsage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
    },
  },
  modelName: null,
  isCostPending: false,
  ...overrides,
});

describe("sessionMetaDisplay", () => {
  it("运行中且成本尚未统计完成时显示 pending", () => {
    expect(
      shouldShowPendingCost(
        createMeta({
          isCostPending: true,
        }),
      ),
    ).toBe(true);

    expect(
      shouldShowPendingCost(
        createMeta({
          isCostPending: true,
          cost: {
            totalUsd: 1,
            breakdown: {
              inputTokensUsd: 1,
              outputTokensUsd: 0,
              cacheCreationUsd: 0,
              cacheReadUsd: 0,
            },
            tokenUsage: {
              inputTokens: 100,
              outputTokens: 0,
              cacheCreationTokens: 0,
              cacheReadTokens: 0,
            },
          },
        }),
      ),
    ).toBe(false);
  });

  it("总数字段优先使用真实 total", () => {
    expect(getVisibleSessionTotal(42, 20)).toBe(42);
    expect(getVisibleSessionTotal(undefined, 20)).toBe(20);
  });
});
