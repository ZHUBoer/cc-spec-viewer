import { describe, expect, it } from "vitest";
import type { Conversation } from "@/lib/conversation-schema";
import { buildHistoricalAssistantTextMap } from "./historyFoldState";

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

describe("historyFoldState", () => {
  it("只有后面还存在 assistant 文本回复时，前面的 assistant 才算历史过程", () => {
    const map = buildHistoricalAssistantTextMap([
      createUserConversation("hi"),
      createAssistantConversation("assistant-1", [
        {
          type: "thinking",
          thinking: "先思考",
        },
      ]),
      createAssistantConversation("assistant-2", [
        {
          type: "text",
          text: "已经有结果",
        },
      ]),
      createAssistantConversation("assistant-3", [
        {
          type: "thinking",
          thinking: "继续思考",
        },
      ]),
    ]);

    expect(map.get("assistant-1")).toBe(true);
    expect(map.get("assistant-2")).toBe(false);
    expect(map.get("assistant-3")).toBe(false);
  });

  it("隐藏 sidechain 与非可见消息不会让尾部过程误判为历史", () => {
    const map = buildHistoricalAssistantTextMap([
      createUserConversation("hi"),
      createAssistantConversation("assistant-1", [
        {
          type: "thinking",
          thinking: "主会话过程",
        },
      ]),
      createAssistantConversation(
        "assistant-sidechain",
        [
          {
            type: "text",
            text: "sidechain 文本",
          },
        ],
        {
          isSidechain: true,
        },
      ),
    ]);

    expect(map.get("assistant-1")).toBe(false);
    expect(map.has("assistant-sidechain")).toBe(false);
  });

  it("纯空白 assistant 文本不会被视为后续文本回复", () => {
    const map = buildHistoricalAssistantTextMap([
      createUserConversation("hi"),
      createAssistantConversation("assistant-1", [
        {
          type: "thinking",
          thinking: "主会话过程",
        },
      ]),
      createAssistantConversation("assistant-blank", [
        {
          type: "text",
          text: "\n\n  ",
        },
      ]),
    ]);

    expect(map.get("assistant-1")).toBe(false);
    expect(map.get("assistant-blank")).toBe(false);
  });
});
