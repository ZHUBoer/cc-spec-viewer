import type { SDKSystemMessage } from "@anthropic-ai/claude-agent-sdk";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { testProjectRepositoryLayer } from "../../../../testing/layers/testProjectRepositoryLayer";
import { UserConfigService } from "../../platform/services/UserConfigService";
import type * as CCSessionProcess from "../models/CCSessionProcess";
import { ClaudeCodeLifeCycleService } from "../services/ClaudeCodeLifeCycleService";
import { ClaudeCodeSessionProcessController } from "./ClaudeCodeSessionProcessController";

const testUserConfigLayer = Layer.succeed(
  UserConfigService,
  UserConfigService.of({
    getUserConfig: () => Effect.die("unused"),
    setUserConfig: () => Effect.die("unused"),
  }),
);

describe("ClaudeCodeSessionProcessController.abortSessionProcess", () => {
  const createInitMessage = (sessionId: string): SDKSystemMessage => ({
    type: "system",
    subtype: "init",
    agents: [],
    apiKeySource: "user",
    betas: [],
    claude_code_version: "1.0.0",
    cwd: "/tmp/project-1",
    tools: [],
    mcp_servers: [],
    model: "claude-sonnet-4",
    permissionMode: "default",
    slash_commands: [],
    output_style: "default",
    skills: [],
    plugins: [],
    uuid: "00000000-0000-4000-8000-000000000000",
    session_id: sessionId,
  });

  const createPublicProcesses =
    (): CCSessionProcess.CCSessionProcessStatePublic[] => [
      {
        def: {
          sessionProcessId: "running-process",
          projectId: "project-1",
          cwd: "/tmp/project-1",
          abortController: new AbortController(),
          setNextMessage: () => {},
        },
        type: "initialized",
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
          initMessage: createInitMessage("session-1"),
        },
      },
      {
        def: {
          sessionProcessId: "paused-process",
          projectId: "project-1",
          cwd: "/tmp/project-1",
          abortController: new AbortController(),
          setNextMessage: () => {},
        },
        type: "paused",
        tasks: [],
        sessionId: "session-2",
      },
    ];

  const createControllerLayer = (
    abortTaskSpy: ReturnType<typeof vi.fn<(sessionProcessId: string) => void>>,
    projectIds = ["project-1"],
  ) =>
    ClaudeCodeSessionProcessController.Live.pipe(
      Layer.provide(
        Layer.succeed(
          ClaudeCodeLifeCycleService,
          ClaudeCodeLifeCycleService.of({
            startTask: () => Effect.die("unused"),
            continueTask: () => Effect.die("unused"),
            abortAllTasks: () => Effect.die("unused"),
            getPublicSessionProcesses: () =>
              Effect.succeed(createPublicProcesses()),
            abortTask: (sessionProcessId: string) =>
              Effect.sync(() => {
                abortTaskSpy(sessionProcessId);
              }),
          }),
        ),
      ),
      Layer.provide(
        testProjectRepositoryLayer({
          projects: projectIds.map((projectId) => ({
            id: projectId,
            claudeProjectPath: `/tmp/${projectId}`,
            lastModifiedAt: new Date("2026-03-06T00:00:00.000Z"),
            meta: {
              projectName: projectId,
              projectPath: `/tmp/${projectId}`,
              sessionCount: 1,
              isWorkspace: false,
            },
          })),
        }),
      ),
      Layer.provide(testUserConfigLayer),
      Layer.provide(testPlatformLayer()),
    );

  it("只允许中止当前项目下 running 的会话进程", async () => {
    const abortTask = vi.fn<(sessionProcessId: string) => void>();
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeSessionProcessController;
        return yield* controller.abortSessionProcess({
          projectId: "project-1",
          sessionProcessId: "running-process",
        });
      }).pipe(Effect.provide(createControllerLayer(abortTask))),
    );

    expect(result.status).toBe(200);
    expect(result.response).toEqual({ message: "Task aborted" });
    expect(abortTask).toHaveBeenCalledWith("running-process");
  });

  it("允许中止 paused 的会话进程", async () => {
    const abortTask = vi.fn<(sessionProcessId: string) => void>();
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeSessionProcessController;
        return yield* controller.abortSessionProcess({
          projectId: "project-1",
          sessionProcessId: "paused-process",
        });
      }).pipe(Effect.provide(createControllerLayer(abortTask))),
    );

    expect(result.status).toBe(200);
    expect(result.response).toEqual({ message: "Task aborted" });
    expect(abortTask).toHaveBeenCalledWith("paused-process");
  });

  it("拒绝跨项目中止会话进程", async () => {
    const abortTask = vi.fn<(sessionProcessId: string) => void>();
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ClaudeCodeSessionProcessController;
        return yield* controller.abortSessionProcess({
          projectId: "project-2",
          sessionProcessId: "running-process",
        });
      }).pipe(Effect.provide(createControllerLayer(abortTask, ["project-2"]))),
    );

    expect(result.status).toBe(404);
    expect(result.response).toEqual({
      error: "Session process not found",
    });
    expect(abortTask).not.toHaveBeenCalledWith("project-2");
  });
});
