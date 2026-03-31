import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { generateSessionHtml } from "./ExportService";

describe("generateSessionHtml", () => {
  it("includes project path, branch, model list, and token usage in metadata", async () => {
    const session = {
      id: "b6d66e98-1a0e-424f-9a3e-e86005fca016",
      jsonlFilePath: "/tmp/session.jsonl",
      lastModifiedAt: new Date("2026-02-27T10:00:00.000Z"),
      displayMeta: {
        title: "b6d66e98-1a0e-424f-9a3e-e86005fca016",
        visibleMessageCount: 3,
      },
      meta: {
        messageCount: 3,
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
        modelName: "claude-sonnet-4-20250514",
        isCostPending: false,
      },
      conversations: [
        {
          type: "user" as const,
          isSidechain: false,
          userType: "external" as const,
          cwd: "/Users/dev/workspace/demo-project",
          sessionId: "b6d66e98-1a0e-424f-9a3e-e86005fca016",
          version: "1.0.0",
          uuid: "11111111-1111-4111-8111-111111111111",
          timestamp: "2026-02-27T10:00:01.000Z",
          parentUuid: null,
          gitBranch: "feature/export-metadata",
          message: {
            role: "user" as const,
            content: "export this session",
          },
        },
        {
          type: "assistant" as const,
          isSidechain: false,
          userType: "external" as const,
          cwd: "/Users/dev/workspace/demo-project",
          sessionId: "b6d66e98-1a0e-424f-9a3e-e86005fca016",
          version: "1.0.0",
          uuid: "22222222-2222-4222-8222-222222222222",
          timestamp: "2026-02-27T10:00:02.000Z",
          parentUuid: "11111111-1111-4111-8111-111111111111",
          message: {
            id: "msg-1",
            type: "message" as const,
            role: "assistant" as const,
            model: "claude-sonnet-4-20250514",
            content: [],
            stop_reason: null,
            usage: {
              input_tokens: 100,
              output_tokens: 50,
            },
          },
        },
        {
          type: "assistant" as const,
          isSidechain: false,
          userType: "external" as const,
          cwd: "/Users/dev/workspace/demo-project",
          sessionId: "b6d66e98-1a0e-424f-9a3e-e86005fca016",
          version: "1.0.0",
          uuid: "33333333-3333-4333-8333-333333333333",
          timestamp: "2026-02-27T10:00:03.000Z",
          parentUuid: "22222222-2222-4222-8222-222222222222",
          message: {
            id: "msg-2",
            type: "message" as const,
            role: "assistant" as const,
            model: "claude-opus-4-20250514",
            content: [],
            stop_reason: null,
            usage: {
              input_tokens: 200,
              output_tokens: 100,
            },
          },
        },
      ],
    };

    const mockAgentSessionRepo = {
      getAgentSessionByAgentId: () => Effect.succeed(null),
    };

    const html = await Effect.runPromise(
      generateSessionHtml(
        session,
        "L1VzZXJzL2Rldi8uY2xhdWRlL3Byb2plY3RzL2RlbW8=",
        mockAgentSessionRepo,
      ),
    );

    expect(html).toContain("<strong>Project Path:</strong>");
    expect(html).toContain("/Users/dev/workspace/demo-project");
    expect(html).toContain("<strong>Branch:</strong>");
    expect(html).toContain("feature/export-metadata");
    expect(html).toContain("<strong>Models Used:</strong>");
    expect(html).toContain("claude-opus-4-20250514 (1)");
    expect(html).toContain("claude-sonnet-4-20250514 (1)");
    expect(html).toContain("<strong>Input Tokens:</strong> 300");
    expect(html).toContain("<strong>Output Tokens:</strong> 150");
    expect(html).toContain("<strong>Total Tokens:</strong> 450");
    expect(html).toContain(
      "<strong>Token Data Coverage:</strong> 2/2 assistant responses",
    );
  });

  it("renders Agent tool calls with subagent-specific block", async () => {
    const session = {
      id: "session-agent-tool",
      jsonlFilePath: "/tmp/session-agent-tool.jsonl",
      lastModifiedAt: new Date("2026-03-02T12:00:00.000Z"),
      displayMeta: {
        title: "run quality gate",
        visibleMessageCount: 2,
      },
      meta: {
        messageCount: 2,
        firstUserMessage: {
          kind: "text" as const,
          content: "run quality gate",
        },
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
        modelName: "claude-sonnet-4-20250514",
        isCostPending: false,
      },
      conversations: [
        {
          type: "user" as const,
          isSidechain: false,
          userType: "external" as const,
          cwd: "/Users/dev/workspace/demo-project",
          sessionId: "session-agent-tool",
          version: "2.1.63",
          uuid: "11111111-1111-4111-8111-111111111111",
          timestamp: "2026-03-02T12:00:01.000Z",
          parentUuid: null,
          message: {
            role: "user" as const,
            content: "run quality gate",
          },
        },
        {
          type: "assistant" as const,
          isSidechain: false,
          userType: "external" as const,
          cwd: "/Users/dev/workspace/demo-project",
          sessionId: "session-agent-tool",
          version: "2.1.63",
          uuid: "22222222-2222-4222-8222-222222222222",
          timestamp: "2026-03-02T12:00:02.000Z",
          parentUuid: "11111111-1111-4111-8111-111111111111",
          message: {
            id: "msg-agent-tool",
            type: "message" as const,
            role: "assistant" as const,
            model: "claude-sonnet-4-20250514",
            content: [
              {
                type: "tool_use" as const,
                id: "toolu_agent_1",
                name: "Agent",
                input: {
                  prompt:
                    "Please run quality-gate-agent to validate this implementation.",
                  description: "Quality gate review",
                },
              },
            ],
            stop_reason: "tool_use" as const,
            usage: {
              input_tokens: 100,
              output_tokens: 50,
            },
          },
        },
      ],
    };

    const mockAgentSessionRepo = {
      getAgentSessionByAgentId: () => Effect.succeed(null),
    };

    const html = await Effect.runPromise(
      generateSessionHtml(
        session,
        "L1VzZXJzL2Rldi8uY2xhdWRlL3Byb2plY3RzL2RlbW8=",
        mockAgentSessionRepo,
      ),
    );

    expect(html).toContain('class="task-tool-block collapsible"');
    expect(html).toContain('<span class="task-tool-name">Agent');
    expect(html).toContain("<strong>Agent ID:</strong>");
  });
});
