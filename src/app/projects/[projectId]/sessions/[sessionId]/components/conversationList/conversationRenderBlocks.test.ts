import { describe, expect, it } from "vitest";
import type { Conversation } from "@/lib/conversation-schema";
import type { ConversationRenderEntry } from "./conversationListState";
import {
  type AssistantConversationRenderEntry,
  buildAssistantProcessGroupSummary,
  buildConversationRenderBlocks,
} from "./conversationRenderBlocks";

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
  uuid: string,
  content: AssistantConversation["message"]["content"],
  overrides?: Partial<AssistantConversation>,
) => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid,
    timestamp: "2026-03-08T14:00:03.000Z",
    type: "assistant",
    message: {
      id: `msg-${uuid}`,
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4.5",
      content,
      stop_reason: "end_turn",
      usage: {
        input_tokens: 1,
        output_tokens: 1,
      },
    },
    ...overrides,
  } satisfies AssistantConversation;
};

const createRenderEntry = (
  conversation: Conversation,
  renderVersionKey?: string,
): ConversationRenderEntry => {
  return {
    conversation,
    showTimestamp: true,
    renderVersionKey: renderVersionKey ?? `${conversation.type}-entry`,
  };
};

const createAssistantRenderEntry = (
  conversation: AssistantConversation,
  renderVersionKey?: string,
): AssistantConversationRenderEntry => {
  return {
    conversation,
    showTimestamp: true,
    renderVersionKey: renderVersionKey ?? `${conversation.type}-entry`,
  };
};

describe("conversationRenderBlocks", () => {
  it("会把连续 assistant 过程 entry 合并成历史折叠组", () => {
    const blocks = buildConversationRenderBlocks(
      [
        createRenderEntry(createUserConversation("hi")),
        createRenderEntry(
          createAssistantConversation("assistant-1", [
            {
              type: "thinking",
              thinking: "先思考",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-2", [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "pwd",
              },
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-3", [
            {
              type: "text",
              text: "最终答复",
            },
          ]),
        ),
      ],
      new Map([
        ["assistant-1", true],
        ["assistant-2", true],
        ["assistant-3", false],
      ]),
    );

    expect(blocks).toHaveLength(3);
    expect(blocks[1]).toMatchObject({
      type: "assistant-process-group",
    });
  });

  it("最新尾部的连续过程 entry 不会被折叠", () => {
    const blocks = buildConversationRenderBlocks(
      [
        createRenderEntry(createUserConversation("hi")),
        createRenderEntry(
          createAssistantConversation("assistant-1", [
            {
              type: "thinking",
              thinking: "先思考",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-2", [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "pwd",
              },
            },
          ]),
        ),
      ],
      new Map([
        ["assistant-1", false],
        ["assistant-2", false],
      ]),
    );

    expect(blocks).toHaveLength(3);
    expect(blocks.every((block) => block.type === "single")).toBe(true);
  });

  it("assistant 文本会打断连续过程组", () => {
    const blocks = buildConversationRenderBlocks(
      [
        createRenderEntry(
          createAssistantConversation("assistant-1", [
            {
              type: "thinking",
              thinking: "先思考",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-2", [
            {
              type: "text",
              text: "中间文本",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-3", [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "pwd",
              },
            },
          ]),
        ),
      ],
      new Map([
        ["assistant-1", true],
        ["assistant-2", false],
        ["assistant-3", false],
      ]),
    );

    expect(blocks).toHaveLength(3);
    expect(blocks.every((block) => block.type === "single")).toBe(true);
  });

  it("会为过程组统计自身耗时、工具调用数和思考数", () => {
    const summary = buildAssistantProcessGroupSummary([
      createAssistantRenderEntry(
        createAssistantConversation(
          "assistant-1",
          [
            {
              type: "thinking",
              thinking: "先思考",
            },
          ],
          {
            timestamp: "2026-03-08T14:00:03.000Z",
          },
        ),
      ),
      createAssistantRenderEntry(
        createAssistantConversation(
          "assistant-2",
          [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "pwd",
              },
            },
            {
              type: "tool_use",
              id: "tool-2",
              name: "Read",
              input: {
                file: "a.ts",
              },
            },
          ],
          {
            timestamp: "2026-03-08T14:00:05.500Z",
          },
        ),
      ),
    ]);

    expect(summary).toEqual({
      durationMs: 2500,
      toolUseCount: 2,
      thinkingCount: 1,
    });
  });

  it("纯空白 assistant 文本不会打断连续过程组", () => {
    const blocks = buildConversationRenderBlocks(
      [
        createRenderEntry(
          createAssistantConversation("assistant-1", [
            {
              type: "thinking",
              thinking: "先思考",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-blank", [
            {
              type: "text",
              text: "\n\n ",
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-2", [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "pwd",
              },
            },
          ]),
        ),
        createRenderEntry(
          createAssistantConversation("assistant-3", [
            {
              type: "text",
              text: "最终答复",
            },
          ]),
        ),
      ],
      new Map([
        ["assistant-1", true],
        ["assistant-blank", false],
        ["assistant-2", true],
        ["assistant-3", false],
      ]),
    );

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      type: "assistant-process-group",
    });
    expect(blocks[1]).toMatchObject({
      type: "single",
    });
  });
});
