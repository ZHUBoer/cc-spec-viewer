import { describe, expect, test } from "vitest";
import type { ExtendedConversation } from "../../types";
import {
  aggregateVirtualTokenUsage,
  mergeSessionMetaWithVirtualConversations,
} from "./getVisibleSessionMeta";

// 构造 assistant 类型的虚拟对话条目
const createAssistantConversation = (options: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}): ExtendedConversation => ({
  type: "assistant",
  uuid: `vc__${crypto.randomUUID()}`,
  timestamp: new Date().toISOString(),
  isSidechain: false,
  userType: "external",
  cwd: "/test",
  sessionId: "test-session",
  version: "1.0.0",
  parentUuid: "00000000-0000-0000-0000-000000000000",
  message: {
    type: "message",
    role: "assistant",
    model: options.model,
    id: `msg_${crypto.randomUUID()}`,
    content: [],
    usage: {
      input_tokens: options.inputTokens,
      output_tokens: options.outputTokens,
      cache_creation_input_tokens: options.cacheCreationTokens,
      cache_read_input_tokens: options.cacheReadTokens,
    },
    stop_reason: null,
  },
});

const createUserConversation = (): ExtendedConversation => ({
  type: "user",
  uuid: `vc__${crypto.randomUUID()}`,
  timestamp: new Date().toISOString(),
  isSidechain: false,
  userType: "external",
  cwd: "/test",
  sessionId: "test-session",
  version: "1.0.0",
  parentUuid: null,
  message: {
    role: "user",
    content: "测试消息",
  },
});

describe("aggregateVirtualTokenUsage", () => {
  test("空数组返回全 0 结果", () => {
    const result = aggregateVirtualTokenUsage([]);
    expect(result.modelName).toBeNull();
    expect(result.cost.totalUsd).toBe(0);
    expect(result.cost.tokenUsage.inputTokens).toBe(0);
    expect(result.cost.tokenUsage.outputTokens).toBe(0);
    expect(result.cost.tokenUsage.cacheCreationTokens).toBe(0);
    expect(result.cost.tokenUsage.cacheReadTokens).toBe(0);
  });

  test("仅含 user 消息时返回全 0 结果", () => {
    const result = aggregateVirtualTokenUsage([createUserConversation()]);
    expect(result.modelName).toBeNull();
    expect(result.cost.totalUsd).toBe(0);
  });

  test("单条 assistant 消息正确提取 token 和 cost", () => {
    const result = aggregateVirtualTokenUsage([
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 1000,
        outputTokens: 500,
        cacheCreationTokens: 100,
        cacheReadTokens: 50,
      }),
    ]);

    expect(result.modelName).toBe("claude-3-5-sonnet-20240620");
    expect(result.cost.tokenUsage.inputTokens).toBe(1000);
    expect(result.cost.tokenUsage.outputTokens).toBe(500);
    expect(result.cost.tokenUsage.cacheCreationTokens).toBe(100);
    expect(result.cost.tokenUsage.cacheReadTokens).toBe(50);
    expect(result.cost.totalUsd).toBeGreaterThan(0);
  });

  test("多条 assistant 消息累加 token", () => {
    const result = aggregateVirtualTokenUsage([
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 500,
        outputTokens: 250,
      }),
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 300,
        outputTokens: 150,
        cacheCreationTokens: 50,
        cacheReadTokens: 25,
      }),
    ]);

    expect(result.cost.tokenUsage.inputTokens).toBe(800);
    expect(result.cost.tokenUsage.outputTokens).toBe(400);
    expect(result.cost.tokenUsage.cacheCreationTokens).toBe(50);
    expect(result.cost.tokenUsage.cacheReadTokens).toBe(25);
  });

  test("modelName 取最后一条 assistant 消息的 model", () => {
    const result = aggregateVirtualTokenUsage([
      createAssistantConversation({
        model: "claude-3-haiku-20240307",
        inputTokens: 100,
        outputTokens: 50,
      }),
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 100,
        outputTokens: 50,
      }),
    ]);

    expect(result.modelName).toBe("claude-3-5-sonnet-20240620");
  });

  test("跳过非 assistant 类型的条目", () => {
    const result = aggregateVirtualTokenUsage([
      createUserConversation(),
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 1000,
        outputTokens: 500,
      }),
      createUserConversation(),
    ]);

    expect(result.cost.tokenUsage.inputTokens).toBe(1000);
    expect(result.cost.tokenUsage.outputTokens).toBe(500);
  });

  test("跳过 x-error 类型的条目", () => {
    const errorEntry: ExtendedConversation = {
      type: "x-error",
      line: "bad json",
      lineNumber: 1,
    };
    const result = aggregateVirtualTokenUsage([
      errorEntry,
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 100,
        outputTokens: 50,
      }),
    ]);

    expect(result.cost.tokenUsage.inputTokens).toBe(100);
  });
});

describe("mergeSessionMetaWithVirtualConversations", () => {
  const createBaseMeta = () => ({
    messageCount: 5,
    firstUserMessage: null,
    isCostPending: false,
    cost: {
      totalUsd: 0.01,
      breakdown: {
        inputTokensUsd: 0.005,
        outputTokensUsd: 0.003,
        cacheCreationUsd: 0.001,
        cacheReadUsd: 0.001,
      },
      tokenUsage: {
        inputTokens: 1000,
        outputTokens: 500,
        cacheCreationTokens: 100,
        cacheReadTokens: 50,
      },
    },
    modelName: "claude-3-5-sonnet-20240620",
  });

  test("虚拟对话为空时原样返回 meta", () => {
    const meta = createBaseMeta();
    const result = mergeSessionMetaWithVirtualConversations(meta, []);
    expect(result).toBe(meta);
  });

  test("虚拟对话有 assistant 消息时累加 token 和 cost", () => {
    const meta = createBaseMeta();
    const virtualConversations = [
      createAssistantConversation({
        model: "claude-3-5-sonnet-20240620",
        inputTokens: 2000,
        outputTokens: 1000,
        cacheCreationTokens: 200,
        cacheReadTokens: 100,
      }),
    ];

    const result = mergeSessionMetaWithVirtualConversations(
      meta,
      virtualConversations,
    );

    expect(result.cost.tokenUsage.inputTokens).toBe(1000 + 2000);
    expect(result.cost.tokenUsage.outputTokens).toBe(500 + 1000);
    expect(result.cost.tokenUsage.cacheCreationTokens).toBe(100 + 200);
    expect(result.cost.tokenUsage.cacheReadTokens).toBe(50 + 100);
    expect(result.cost.totalUsd).toBeGreaterThan(meta.cost.totalUsd);
    expect(result.isCostPending).toBe(true);
  });

  test("虚拟对话的 modelName 覆盖 meta 中的 null", () => {
    const meta = { ...createBaseMeta(), modelName: null };
    const virtualConversations = [
      createAssistantConversation({
        model: "claude-opus-4-5-20251101",
        inputTokens: 100,
        outputTokens: 50,
      }),
    ];

    const result = mergeSessionMetaWithVirtualConversations(
      meta,
      virtualConversations,
    );

    expect(result.modelName).toBe("claude-opus-4-5-20251101");
  });

  test("meta 已有 modelName 时虚拟对话不覆盖", () => {
    const meta = createBaseMeta();
    const virtualConversations = [
      createAssistantConversation({
        model: "claude-opus-4-5-20251101",
        inputTokens: 100,
        outputTokens: 50,
      }),
    ];

    const result = mergeSessionMetaWithVirtualConversations(
      meta,
      virtualConversations,
    );

    expect(result.modelName).toBe("claude-3-5-sonnet-20240620");
  });

  test("仅含 user 虚拟对话时 cost 不变但 messageCount 增加", () => {
    const meta = createBaseMeta();
    const virtualConversations = [createUserConversation()];

    const result = mergeSessionMetaWithVirtualConversations(
      meta,
      virtualConversations,
    );

    expect(result.cost.tokenUsage.inputTokens).toBe(1000);
    expect(result.cost.tokenUsage.outputTokens).toBe(500);
    expect(result.messageCount).toBe(6);
    expect(result.isCostPending).toBe(true);
  });
});
