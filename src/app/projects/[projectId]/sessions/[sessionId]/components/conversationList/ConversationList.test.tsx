import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Conversation } from "@/lib/conversation-schema";

vi.mock("@lingui/react", () => ({
  Trans: ({ id }: { id?: string }) => <span>{id ?? "Trans"}</span>,
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-slot="badge" className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/date/formatDuration", () => ({
  formatDuration: () => "2.5s",
}));

vi.mock("../../hooks/useSidechain", () => ({
  useSidechain: () => ({
    isRootSidechain: () => false,
    getSidechainConversations: () => [],
    getSidechainConversationByPrompt: () => undefined,
    getSidechainConversationByAgentId: () => undefined,
    existsRelatedTaskCall: () => false,
  }),
}));

vi.mock("./ConversationItem", () => ({
  ConversationItem: ({ conversation }: { conversation: Conversation }) => (
    <div>{conversation.type}</div>
  ),
}));

vi.mock("./ScheduledMessageNotice", () => ({
  ScheduledMessageNotice: () => null,
}));

const { ConversationList } = await import("./ConversationList");

type UserConversation = Extract<Conversation, { type: "user" }>;
type AssistantConversation = Extract<Conversation, { type: "assistant" }>;

const createUserConversation = (): UserConversation => {
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
      content: "hi",
    },
  };
};

const createAssistantConversation = (
  uuid: string,
  content: AssistantConversation["message"]["content"],
  timestamp: string,
): AssistantConversation => {
  return {
    parentUuid: "user-1",
    isSidechain: false,
    userType: "external",
    cwd: "/tmp/project",
    sessionId: "session-1",
    version: "1",
    uuid,
    timestamp,
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
  };
};

describe("ConversationList", () => {
  it("历史过程组使用当前系统的轻量卡片风格，而不是重阴影 dashboard 卡", () => {
    const markup = renderToStaticMarkup(
      <ConversationList
        conversations={[
          createUserConversation(),
          createAssistantConversation(
            "assistant-1",
            [
              {
                type: "thinking",
                thinking: "先思考",
              },
            ],
            "2026-03-08T14:00:03.000Z",
          ),
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
            ],
            "2026-03-08T14:00:05.500Z",
          ),
          createAssistantConversation(
            "assistant-3",
            [
              {
                type: "text",
                text: "最终答复",
              },
            ],
            "2026-03-08T14:00:06.000Z",
          ),
        ]}
        getToolResult={() => undefined}
        getToolUseResult={() => undefined}
        projectId="project-id"
        sessionId="session-id"
        scheduledJobs={[]}
      />,
    );

    expect(markup).toContain("border-border/80 bg-card p-0 shadow-none");
    expect(markup).toContain("hover:bg-muted/35");
    expect(markup).toContain('data-slot="badge"');
    expect(markup).toContain("text-muted-foreground");
    expect(markup).not.toContain("bg-gradient-to-br");
    expect(markup).not.toContain("shadow-sm");
  });
});
