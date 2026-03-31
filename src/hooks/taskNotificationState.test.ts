import { describe, expect, it } from "vitest";
import type { ExtendedConversation } from "@/server/core/types";
import {
  advanceTaskNotificationState,
  createInitialTaskNotificationState,
  getTaskCompletionContentKey,
  getTaskStreamContentKey,
} from "./taskNotificationState";

const createUserConversation = (
  text: string,
  overrides?: Partial<Extract<ExtendedConversation, { type: "user" }>>,
): Extract<ExtendedConversation, { type: "user" }> => {
  return {
    parentUuid: null,
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid: "user-1",
    timestamp: "2026-03-08T14:00:00.000Z",
    type: "user",
    message: {
      role: "user",
      content: text,
    },
    ...overrides,
  };
};

const createAssistantConversation = (
  text: string,
  overrides?: Partial<Extract<ExtendedConversation, { type: "assistant" }>>,
): Extract<ExtendedConversation, { type: "assistant" }> => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid: "assistant-1",
    timestamp: "2026-03-08T14:00:01.000Z",
    type: "assistant",
    message: {
      id: "msg-1",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4.5",
      content: [{ type: "text", text }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 1,
        cache_creation_input_tokens: undefined,
        cache_read_input_tokens: undefined,
        output_tokens: 1,
        service_tier: undefined,
      },
    },
    ...overrides,
  };
};

const createThinkingAssistantConversation = (
  thinking: string,
  overrides?: Partial<Extract<ExtendedConversation, { type: "assistant" }>>,
): Extract<ExtendedConversation, { type: "assistant" }> => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid: "assistant-thinking-1",
    timestamp: "2026-03-08T14:00:01.000Z",
    type: "assistant",
    message: {
      id: "msg-thinking-1",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4.5",
      content: [{ type: "thinking", thinking }],
      stop_reason: null,
      usage: {
        input_tokens: 1,
        cache_creation_input_tokens: undefined,
        cache_read_input_tokens: undefined,
        output_tokens: 1,
        service_tier: undefined,
      },
    },
    ...overrides,
  };
};

const createToolUseAssistantConversation = (
  overrides?: Partial<Extract<ExtendedConversation, { type: "assistant" }>>,
): Extract<ExtendedConversation, { type: "assistant" }> => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid: "assistant-tool-1",
    timestamp: "2026-03-08T14:00:01.000Z",
    type: "assistant",
    message: {
      id: "msg-tool-1",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4.5",
      content: [
        {
          type: "tool_use",
          id: "tool-1",
          name: "Read",
          input: {
            file_path: "README.md",
          },
        },
      ],
      stop_reason: null,
      usage: {
        input_tokens: 1,
        cache_creation_input_tokens: undefined,
        cache_read_input_tokens: undefined,
        output_tokens: 1,
        service_tier: undefined,
      },
    },
    ...overrides,
  };
};

describe("taskNotificationState", () => {
  it("初次进入页面不会直接弹完成通知", () => {
    const decision = advanceTaskNotificationState(
      createInitialTaskNotificationState(),
      {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      },
    );

    expect(decision.shouldNotify).toBe(false);
  });

  it("任务完成且内容已更新时会立即通知", () => {
    const runningState = advanceTaskNotificationState(
      createInitialTaskNotificationState(),
      {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      },
    ).nextState;

    const decision = advanceTaskNotificationState(runningState, {
      isRunningTask: false,
      latestCompletionKey:
        'completion:assistant:assistant-1:2026-03-08T14:00:01.000Z:1:[{"type":"text","text":"你好"}]',
    });

    expect(decision.shouldNotify).toBe(true);
  });

  it("任务完成但内容未更新时会进入等待状态", () => {
    const runningState = advanceTaskNotificationState(
      createInitialTaskNotificationState(),
      {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      },
    ).nextState;

    const decision = advanceTaskNotificationState(runningState, {
      isRunningTask: false,
      latestCompletionKey: "completion:none",
    });

    expect(decision.shouldNotify).toBe(false);
    expect(decision.nextState.pendingCompletionBaselineKey).toBe(
      "completion:none",
    );
  });

  it("等待中的任务在内容到达后才通知", () => {
    const pendingState = advanceTaskNotificationState(
      advanceTaskNotificationState(createInitialTaskNotificationState(), {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      }).nextState,
      {
        isRunningTask: false,
        latestCompletionKey: "completion:none",
      },
    ).nextState;

    const decision = advanceTaskNotificationState(pendingState, {
      isRunningTask: false,
      latestCompletionKey:
        'completion:assistant:assistant-1:2026-03-08T14:00:01.000Z:1:[{"type":"text","text":"你好"}]',
    });

    expect(decision.shouldNotify).toBe(true);
    expect(decision.nextState.pendingCompletionBaselineKey).toBeNull();
  });

  it("thinking 变化只会推进流式内容，不会误判为完成", () => {
    const runningState = advanceTaskNotificationState(
      createInitialTaskNotificationState(),
      {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      },
    ).nextState;

    const decision = advanceTaskNotificationState(runningState, {
      isRunningTask: false,
      latestCompletionKey: "completion:none",
    });

    expect(decision.shouldNotify).toBe(false);
    expect(decision.nextState.pendingCompletionBaselineKey).toBe(
      "completion:none",
    );
  });

  it("流式 key 会跟踪 thinking 到 text 的变化", () => {
    const key = getTaskStreamContentKey([
      createUserConversation("hi"),
      createThinkingAssistantConversation("先思考"),
    ]);

    expect(key).toBe(
      'stream:assistant:assistant-thinking-1:2026-03-08T14:00:01.000Z:1:[{"type":"thinking","thinking":"先思考"}]',
    );
  });

  it("完成 key 会忽略纯 thinking，直到出现最终输出", () => {
    const thinkingOnlyKey = getTaskCompletionContentKey([
      createUserConversation("hi"),
      createThinkingAssistantConversation("先思考"),
    ]);
    const finalOutputKey = getTaskCompletionContentKey([
      createUserConversation("hi"),
      createAssistantConversation("你好", {
        uuid: "assistant-thinking-1",
        message: {
          ...createAssistantConversation("你好").message,
          id: "msg-thinking-1",
          content: [
            { type: "thinking", thinking: "先思考" },
            { type: "text", text: "你好" },
          ],
        },
      }),
    ]);

    expect(thinkingOnlyKey).toBe("completion:none");
    expect(finalOutputKey).toBe(
      'completion:assistant:assistant-thinking-1:2026-03-08T14:00:01.000Z:1:[{"type":"text","text":"你好"}]',
    );
  });

  it("完成 key 会忽略纯 tool_use", () => {
    const key = getTaskCompletionContentKey([
      createUserConversation("hi"),
      createToolUseAssistantConversation(),
    ]);

    expect(key).toBe("completion:none");
  });

  it("只有 tool_use 时结束不会误报完成", () => {
    const runningState = advanceTaskNotificationState(
      createInitialTaskNotificationState(),
      {
        isRunningTask: true,
        latestCompletionKey: "completion:none",
      },
    ).nextState;

    const pausedDecision = advanceTaskNotificationState(runningState, {
      isRunningTask: false,
      latestCompletionKey: "completion:none",
    });

    expect(pausedDecision.shouldNotify).toBe(false);
    expect(pausedDecision.nextState.pendingCompletionBaselineKey).toBe(
      "completion:none",
    );
  });
});
