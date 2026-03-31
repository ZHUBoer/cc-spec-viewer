import { describe, expect, it } from "vitest";
import type { Conversation } from "@/lib/conversation-schema";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import type { ErrorJsonl } from "@/server/core/types";
import {
  buildConversationListState,
  shouldRenderConversation,
} from "./conversationListState";

type UserConversation = Extract<Conversation, { type: "user" }>;
type AssistantConversation = Extract<Conversation, { type: "assistant" }>;

const createUserConversation = (
  content: UserConversation["message"]["content"],
  overrides?: Partial<UserConversation>,
) => {
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
      content,
    },
    ...overrides,
  } satisfies UserConversation;
};

const createAssistantConversation = (
  overrides?: Partial<AssistantConversation>,
) => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid: "assistant-1",
    timestamp: "2026-03-08T14:00:03.000Z",
    type: "assistant",
    message: {
      id: "msg-1",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4.5",
      content: [
        {
          type: "tool_use",
          id: "tool-1",
          name: "Task",
          input: {
            prompt: "run task",
          },
        },
      ],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 1,
        output_tokens: 1,
      },
    },
    ...overrides,
  } satisfies AssistantConversation;
};

describe("conversationListState", () => {
  it("会过滤 progress、幽灵 tool_result，并保留 turn duration 与 agent 映射", () => {
    const toolResultUser = createUserConversation(
      [
        {
          type: "tool_result",
          tool_use_id: "tool-1",
          content: "done",
        },
      ],
      {
        uuid: "tool-result-user",
        timestamp: "2026-03-08T14:00:02.000Z",
        toolUseResult: {
          agentId: "agent-1",
        },
      },
    );
    const progressConversation = {
      parentUuid: "user-1",
      isSidechain: false,
      userType: "external",
      cwd: "/tmp/project",
      sessionId: "session-1",
      version: "1",
      uuid: "progress-1",
      timestamp: "2026-03-08T14:00:01.000Z",
      type: "progress",
      data: {
        status: "running",
      },
    } satisfies Extract<Conversation, { type: "progress" }>;
    const schemaError = {
      type: "x-error",
      line: "bad line",
      lineNumber: 3,
    } satisfies ErrorJsonl;

    const state = buildConversationListState(
      [
        createUserConversation("hi"),
        progressConversation,
        createAssistantConversation(),
        toolResultUser,
        schemaError,
      ],
      {
        getToolResult: () => undefined,
        getToolUseResult: () => undefined,
      },
    );

    expect(state.validConversations).toHaveLength(4);
    expect(
      state.renderEntries.filter((entry) =>
        shouldRenderConversation(entry.conversation),
      ),
    ).toHaveLength(3);
    expect(state.turnDurationMap.get("assistant-1")).toBe(3000);
    expect(state.toolUseIdToAgentIdMap.get("tool-1")).toBe("agent-1");
    expect(state.historicalAssistantTextMap.get("assistant-1")).toBe(false);
  });

  it("assistant 的 renderVersionKey 会随 tool result 依赖变化而变化", () => {
    const conversations = [
      createUserConversation("hi"),
      createAssistantConversation(),
    ] satisfies Conversation[];

    const withoutResult = buildConversationListState(conversations, {
      getToolResult: () => undefined,
      getToolUseResult: () => undefined,
    });
    const withResult = buildConversationListState(conversations, {
      getToolResult: (): ToolResultContent => ({
        type: "tool_result",
        tool_use_id: "tool-1",
        content: "done",
      }),
      getToolUseResult: () => ({
        agentId: "agent-1",
      }),
    });

    const withoutAssistantKey = withoutResult.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;
    const withAssistantKey = withResult.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;

    expect(withoutAssistantKey).not.toBe(withAssistantKey);
  });

  it("assistant 的 renderVersionKey 会随消息内容变化而变化", () => {
    const withoutText = buildConversationListState(
      [
        createUserConversation("hi"),
        createAssistantConversation({
          message: {
            ...createAssistantConversation().message,
            content: [
              {
                type: "thinking",
                thinking: "先思考",
              },
            ],
            stop_reason: null,
          },
        }),
      ] satisfies Conversation[],
      {
        getToolResult: () => undefined,
        getToolUseResult: () => undefined,
      },
    );
    const withText = buildConversationListState(
      [
        createUserConversation("hi"),
        createAssistantConversation({
          message: {
            ...createAssistantConversation().message,
            content: [
              {
                type: "thinking",
                thinking: "先思考",
              },
              {
                type: "text",
                text: "你好",
              },
            ],
          },
        }),
      ] satisfies Conversation[],
      {
        getToolResult: () => undefined,
        getToolUseResult: () => undefined,
      },
    );

    const withoutTextKey = withoutText.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;
    const withTextKey = withText.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;

    expect(withoutTextKey).not.toBe(withTextKey);
  });

  it("assistant 的 renderVersionKey 会随历史折叠资格变化而变化", () => {
    const assistantOnlyThinking = createAssistantConversation({
      message: {
        ...createAssistantConversation().message,
        content: [
          {
            type: "thinking",
            thinking: "先思考",
          },
          {
            type: "tool_use",
            id: "tool-1",
            name: "Bash",
            input: {
              command: "pwd",
            },
          },
        ],
      },
    });

    const withoutLaterText = buildConversationListState(
      [
        createUserConversation("hi"),
        assistantOnlyThinking,
      ] satisfies Conversation[],
      {
        getToolResult: () => undefined,
        getToolUseResult: () => undefined,
      },
    );

    const withLaterText = buildConversationListState(
      [
        createUserConversation("hi"),
        assistantOnlyThinking,
        createAssistantConversation({
          uuid: "assistant-2",
          message: {
            ...createAssistantConversation().message,
            id: "msg-2",
            content: [
              {
                type: "text",
                text: "最终答复",
              },
            ],
          },
        }),
      ] satisfies Conversation[],
      {
        getToolResult: () => undefined,
        getToolUseResult: () => undefined,
      },
    );

    const withoutLaterTextKey = withoutLaterText.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;
    const withLaterTextKey = withLaterText.renderEntries.find(
      (entry) =>
        entry.conversation.type === "assistant" &&
        entry.conversation.uuid === "assistant-1",
    )?.renderVersionKey;

    expect(withoutLaterTextKey).not.toBe(withLaterTextKey);
    expect(withLaterText.historicalAssistantTextMap.get("assistant-1")).toBe(
      true,
    );
  });
});
