import { describe, expect, it } from "vitest";
import type { Conversation } from "@/lib/conversation-schema";
import type { AssistantMessageContent } from "@/lib/conversation-schema/message/AssistantMessageSchema";
import {
  buildAssistantContentSegments,
  hasAssistantTextContent,
  hasVisibleAssistantContent,
  isMeaningfulAssistantText,
} from "./assistantContentSegments";

type AssistantConversation = Extract<Conversation, { type: "assistant" }>;

const createAssistantConversation = (
  content: AssistantMessageContent[],
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

describe("assistantContentSegments", () => {
  it("会把连续两个及以上过程块分成可折叠候选组", () => {
    const segments = buildAssistantContentSegments([
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
      {
        type: "text",
        text: "结果好了",
      },
    ]);

    expect(segments).toEqual([
      {
        type: "process-group",
        items: [
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
      {
        type: "content",
        content: {
          type: "text",
          text: "结果好了",
        },
      },
    ]);
  });

  it("文本会切断过程块，单条过程内容保持原样", () => {
    const segments = buildAssistantContentSegments([
      {
        type: "thinking",
        thinking: "先思考",
      },
      {
        type: "text",
        text: "中间输出",
      },
      {
        type: "tool_use",
        id: "tool-1",
        name: "Bash",
        input: {
          command: "pwd",
        },
      },
    ]);

    expect(segments).toEqual([
      {
        type: "content",
        content: {
          type: "thinking",
          thinking: "先思考",
        },
      },
      {
        type: "content",
        content: {
          type: "text",
          text: "中间输出",
        },
      },
      {
        type: "content",
        content: {
          type: "tool_use",
          id: "tool-1",
          name: "Bash",
          input: {
            command: "pwd",
          },
        },
      },
    ]);
  });

  it("只要 assistant content 内有文本就判定为文本回复", () => {
    expect(
      hasAssistantTextContent(
        createAssistantConversation([
          {
            type: "thinking",
            thinking: "先思考",
          },
          {
            type: "text",
            text: "你好",
          },
        ]),
      ),
    ).toBe(true);

    expect(
      hasAssistantTextContent(
        createAssistantConversation([
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
        ]),
      ),
    ).toBe(false);
  });

  it("纯空白文本不会切断过程块，也不算可见文本", () => {
    const segments = buildAssistantContentSegments([
      {
        type: "thinking",
        thinking: "先思考",
      },
      {
        type: "text",
        text: "\n\n   ",
      },
      {
        type: "tool_use",
        id: "tool-1",
        name: "Bash",
        input: {
          command: "pwd",
        },
      },
    ]);

    expect(segments).toEqual([
      {
        type: "process-group",
        items: [
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
    ]);
    expect(isMeaningfulAssistantText({ type: "text", text: "\n " })).toBe(
      false,
    );
    expect(
      hasAssistantTextContent(
        createAssistantConversation([
          {
            type: "text",
            text: "\n\n   ",
          },
        ]),
      ),
    ).toBe(false);
    expect(
      hasVisibleAssistantContent(
        createAssistantConversation([
          {
            type: "text",
            text: "\n\n   ",
          },
        ]),
      ),
    ).toBe(false);
  });
});
