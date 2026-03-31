import { NodeContext } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { testProjectRepositoryLayer } from "../../../../testing/layers/testProjectRepositoryLayer";
import { ApplicationContext } from "../../platform/services/ApplicationContext";
import type { CCSessionProcessState } from "../models/CCSessionProcess";
import { AdaModelService } from "../services/AdaModelService";
import { ClaudeCodeService } from "../services/ClaudeCodeService";
import { ClaudeCodeSessionProcessService } from "../services/ClaudeCodeSessionProcessService";
import { ClaudeCodeController } from "./ClaudeCodeController";

const projectLayer = testProjectRepositoryLayer({
  projects: [
    {
      id: "project-1",
      claudeProjectPath: "/tmp/project-1",
      lastModifiedAt: new Date(),
      meta: {
        projectName: "Project 1",
        projectPath: "/tmp/project-1",
        sessionCount: 0,
        isWorkspace: false,
      },
    },
  ],
});

const appContextLayer = Layer.succeed(
  ApplicationContext,
  ApplicationContext.of({
    claudeCodePaths: Effect.succeed({
      globalClaudeDirectoryPath: "/tmp/.claude",
      claudeCommandsDirPath: "/tmp/.claude/commands",
      claudeSkillsDirPath: "/tmp/.claude/skills",
      claudeProjectsDirPath: "/tmp/.claude/projects",
    }),
  }),
);

const claudeCodeServiceLayer = Layer.succeed(
  ClaudeCodeService,
  ClaudeCodeService.of({
    getClaudeCodeMeta: () =>
      Effect.succeed({
        claudeCodeExecutablePath: "/mock/claude",
        claudeCodeVersion: null,
      }),
    getAvailableFeatures: () =>
      Effect.succeed({
        canUseTool: false,
        uuidOnSDKMessage: false,
        agentSdk: false,
        sidechainSeparation: false,
        runSkillsDirectly: false,
      }),
    getMcpList: () => Effect.succeed([]),
    getMcpConfig: () =>
      Effect.succeed({
        content: '{\n  "mcpServers": {}\n}',
        configPath: "/mock/project/.mcp.json",
      }),
    saveMcpConfig: () =>
      Effect.succeed({
        configPath: "/mock/project/.mcp.json",
      }),
  }),
);

const createSessionProcessServiceLayer = (processes: CCSessionProcessState[]) =>
  Layer.succeed(
    ClaudeCodeSessionProcessService,
    ClaudeCodeSessionProcessService.of({
      startSessionProcess: () => Effect.die("unused"),
      continueSessionProcess: () => Effect.die("unused"),
      getSessionProcess: () => Effect.die("unused"),
      getSessionProcesses: () => Effect.succeed(processes),
      getTask: () => Effect.die("unused"),
      dangerouslyChangeProcessState: () => Effect.die("unused"),
      changeTaskState: () => Effect.die("unused"),
      toNotInitializedState: () => Effect.die("unused"),
      toInitializedState: () => Effect.die("unused"),
      toFileCreatedState: () => Effect.die("unused"),
      toPausedState: () => Effect.die("unused"),
      toCompletedState: () => Effect.die("unused"),
    }),
  );

const createTestLayer = (options?: {
  processes?: CCSessionProcessState[];
  listModels?: () => Effect.Effect<{
    models: Array<{ index: number; label: string; isCurrent: boolean }>;
    currentIndex: number | null;
    currentLabel: string | null;
    switchSupported: boolean;
    unsupportedReason: "CUSTOM_API_KEY_MODE" | null;
  }>;
  switchModel?: (targetIndex: number) => Effect.Effect<{
    switchedTo: {
      index: number;
      label: string;
    };
    models: Array<{ index: number; label: string; isCurrent: boolean }>;
    currentIndex: number | null;
    currentLabel: string | null;
    switchSupported: boolean;
    unsupportedReason: "CUSTOM_API_KEY_MODE" | null;
  }>;
}) => {
  const adaModelLayer = Layer.succeed(
    AdaModelService,
    AdaModelService.of({
      listModels:
        options?.listModels ??
        (() =>
          Effect.succeed({
            models: [
              { index: 1, label: "model-a", isCurrent: true },
              { index: 2, label: "model-b", isCurrent: false },
            ],
            currentIndex: 1,
            currentLabel: "model-a",
            switchSupported: true,
            unsupportedReason: null,
          })),
      switchModel:
        options?.switchModel ??
        ((targetIndex) =>
          Effect.succeed({
            switchedTo: {
              index: targetIndex,
              label: `model-${targetIndex}`,
            },
            models: [
              { index: 1, label: "model-a", isCurrent: targetIndex === 1 },
              { index: 2, label: "model-b", isCurrent: targetIndex === 2 },
            ],
            currentIndex: targetIndex,
            currentLabel: `model-${targetIndex}`,
            switchSupported: true,
            unsupportedReason: null,
          })),
    }),
  );

  return ClaudeCodeController.Live.pipe(
    Layer.provide(claudeCodeServiceLayer),
    Layer.provide(adaModelLayer),
    Layer.provide(createSessionProcessServiceLayer(options?.processes ?? [])),
    Layer.provide(projectLayer),
    Layer.provide(appContextLayer),
    Layer.provide(NodeContext.layer),
    Layer.provide(testPlatformLayer()),
  );
};

describe("ClaudeCodeController ada model", () => {
  it("returns ada model list", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeController;
        return yield* controller.getAdaModels();
      }).pipe(Effect.provide(createTestLayer())),
    );

    expect(result.status).toBe(200);
    expect(result.response.currentLabel).toBe("model-a");
    expect(result.response.models).toHaveLength(2);
  });

  it("returns MODEL_SWITCH_ADA_CLI_MISSING when ada cli is unavailable", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeController;
        return yield* controller.getAdaModels();
      }).pipe(
        Effect.provide(
          createTestLayer({
            listModels: () =>
              Effect.die(
                new Error("failed to execute ada model: spawn ada ENOENT"),
              ),
          }),
        ),
      ),
    );

    expect(result.status).toBe(200);
    expect(result.response).toMatchObject({
      models: [],
      switchSupported: false,
      code: "MODEL_SWITCH_ADA_CLI_MISSING",
      error: "Ada CLI is not installed",
    });
  });

  it("switches model when no running process", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeController;
        return yield* controller.switchAdaModel({ targetIndex: 2 });
      }).pipe(Effect.provide(createTestLayer())),
    );

    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.response.currentIndex).toBe(2);
      expect(result.response.switchedTo).toEqual({
        index: 2,
        label: "model-2",
      });
    }
  });

  it("blocks switch when process is running", async () => {
    const runningProcess: CCSessionProcessState = {
      type: "initialized",
      def: {
        sessionProcessId: "p1",
        projectId: "project-1",
        cwd: "/tmp/project-1",
        abortController: new AbortController(),
        setNextMessage: () => {},
      },
      tasks: [],
      currentTask: {
        status: "running",
        def: {
          type: "new",
          taskId: "task-1",
        },
      },
      sessionId: "session-1",
      rawUserMessage: "hello",
      initContext: {
        initMessage: {
          type: "system",
          subtype: "init",
          session_id: "session-1",
          cwd: "/tmp/project-1",
          tools: [],
          mcp_servers: [],
          permissionMode: "default",
          model: "model-a",
          permission_mode: "default",
          apiKeySource: "user",
        } as never,
      },
    };

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeController;
        return yield* controller.switchAdaModel({ targetIndex: 2 });
      }).pipe(
        Effect.provide(
          createTestLayer({
            processes: [runningProcess],
          }),
        ),
      ),
    );

    expect(result.status).toBe(409);
    expect(result.response).toEqual({
      error: "Model switch is blocked while session process is running",
    });
  });

  it("includes debug cause in development when switch fails", async () => {
    // biome-ignore lint/style/noProcessEnv: test needs to simulate NODE_ENV behavior branch
    const originalNodeEnv = process.env.NODE_ENV;
    // biome-ignore lint/style/noProcessEnv: test needs to simulate NODE_ENV behavior branch
    process.env.NODE_ENV = "development";

    try {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const controller = yield* ClaudeCodeController;
          return yield* controller.switchAdaModel({ targetIndex: 2 });
        }).pipe(
          Effect.provide(
            createTestLayer({
              switchModel: () => Effect.die(new Error("switch failed boom")),
            }),
          ),
        ),
      );

      expect(result.status).toBe(502);
      if (result.status === 502) {
        expect(result.response).toMatchObject({
          error: "Failed to switch model via ada model",
        });
        expect(
          "cause" in result.response &&
            typeof result.response.cause === "string",
        ).toBe(true);
        if (
          "cause" in result.response &&
          typeof result.response.cause === "string"
        ) {
          expect(result.response.cause).toContain("switch failed boom");
        }
      }
    } finally {
      // biome-ignore lint/style/noProcessEnv: restore NODE_ENV after test
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("returns 422 when model switch is unsupported in current mode", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeController;
        return yield* controller.switchAdaModel({ targetIndex: 2 });
      }).pipe(
        Effect.provide(
          createTestLayer({
            switchModel: () =>
              Effect.die(
                "AdaModelUnsupportedModeError: unsupported in custom api mode",
              ),
          }),
        ),
      ),
    );

    expect(result.status).toBe(422);
    expect(result.response).toEqual({
      error:
        "Model switch is available only in team mode (unsupported in custom API key mode)",
      code: "MODEL_SWITCH_UNSUPPORTED_MODE",
    });
  });
});
