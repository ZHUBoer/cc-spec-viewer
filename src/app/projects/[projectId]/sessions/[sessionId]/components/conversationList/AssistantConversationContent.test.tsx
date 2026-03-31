import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@lingui/react", () => ({
  Trans: ({ id }: { id?: string }) => <span>{id ?? "Trans"}</span>,
}));

vi.mock("@/app/components/CodeBlock", () => ({
  CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

vi.mock("@/components/AskUserQuestionInteractive", () => ({
  AskUserQuestionInteractive: () => <div>AskUserQuestionInteractive</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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

vi.mock("../../../../../../components/MarkdownContent", () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

vi.mock("./AskUserQuestionCard", () => ({
  AskUserQuestionCard: () => <div>AskUserQuestionCard</div>,
}));

vi.mock("./TaskModal", () => ({
  TaskModal: () => <div>TaskModal</div>,
}));

vi.mock("./ToolInputOneLine", () => ({
  ToolInputOneLine: () => <span>ToolInputOneLine</span>,
}));

const { AssistantConversationContent } = await import(
  "./AssistantConversationContent"
);

vi.mock("../../hooks/usePendingAskUserQuestion", () => ({
  usePendingAskUserQuestion: () => ({
    pendingRequestId: null,
    pendingToolUseId: null,
    onAnswersSubmit: null,
  }),
}));

describe("AssistantConversationContent", () => {
  it("thinking 内容提供断行和宽度约束，避免超长文本撑破消息气泡", () => {
    const markup = renderToStaticMarkup(
      <AssistantConversationContent
        content={{
          type: "thinking",
          thinking:
            "https://example.com/very/long/path/that/should/not/overflow",
        }}
        collapsible={false}
        getToolResult={() => undefined}
        getToolUseResult={() => undefined}
        getAgentIdForToolUse={() => undefined}
        getSidechainConversationByAgentId={() => undefined}
        getSidechainConversationByPrompt={() => undefined}
        getSidechainConversations={() => []}
        projectId="project-id"
        sessionId="session-id"
      />,
    );

    expect(markup).toContain("max-w-full min-w-0 overflow-hidden");
    expect(markup).toContain(
      "min-w-0 max-w-full break-all whitespace-pre-wrap",
    );
  });

  it("历史过程组会渲染外层折叠标题，而不是直接平铺所有过程项", () => {
    const markup = renderToStaticMarkup(
      <AssistantConversationContent
        content={[
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
        ]}
        collapsible
        getToolResult={() => undefined}
        getToolUseResult={() => undefined}
        getAgentIdForToolUse={() => undefined}
        getSidechainConversationByAgentId={() => undefined}
        getSidechainConversationByPrompt={() => undefined}
        getSidechainConversations={() => []}
        projectId="project-id"
        sessionId="session-id"
      />,
    );

    expect(markup).toContain("assistant.process_group.title");
    expect(markup).toContain("1 个工具 / 1 条思考");
  });

  it("最新过程组不应生成外层折叠标题，避免用户看不到过程细节", () => {
    const markup = renderToStaticMarkup(
      <AssistantConversationContent
        content={[
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
        ]}
        collapsible={false}
        getToolResult={() => undefined}
        getToolUseResult={() => undefined}
        getAgentIdForToolUse={() => undefined}
        getSidechainConversationByAgentId={() => undefined}
        getSidechainConversationByPrompt={() => undefined}
        getSidechainConversations={() => []}
        projectId="project-id"
        sessionId="session-id"
      />,
    );

    expect(markup).not.toContain("过程 2 条");
    expect(markup).toContain("assistant.thinking");
    expect(markup).toContain("Bash");
  });
});
