import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { testFileSystemLayer } from "../../../../testing/layers/testFileSystemLayer";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { testProjectRepositoryLayer } from "../../../../testing/layers/testProjectRepositoryLayer";
import { testSessionRepositoryLayer } from "../../../../testing/layers/testSessionRepositoryLayer";
import { ClaudeCodeLifeCycleService } from "../../claude-code/services/ClaudeCodeLifeCycleService";
import { ApplicationContext } from "../../platform/services/ApplicationContext";
import { UserConfigService } from "../../platform/services/UserConfigService";
import type { Session } from "../../types";
import { ProjectMetaService } from "../services/ProjectMetaService";
import { ProjectController } from "./ProjectController";

const createSession = (id: string, overrides?: Partial<Session>): Session => ({
  id,
  jsonlFilePath: `/tmp/project/${id}.jsonl`,
  lastModifiedAt: new Date("2026-03-07T00:00:00.000Z"),
  displayMeta: {
    title: "/opsx:new",
    visibleMessageCount: 1,
  },
  meta: {
    messageCount: 1,
    firstUserMessage: {
      kind: "command",
      commandName: "/opsx:new",
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
    modelName: null,
    isCostPending: false,
  },
  ...overrides,
});

describe("ProjectController.getProject", () => {
  it("基于过滤和去重后的可见会话返回真实 total", async () => {
    const controllerLayer = ProjectController.Live.pipe(
      Layer.provide(
        testProjectRepositoryLayer({
          projects: [
            {
              id: "project-1",
              claudeProjectPath: "/tmp/project",
              lastModifiedAt: new Date("2026-03-07T00:00:00.000Z"),
              meta: {
                projectName: "Project 1",
                projectPath: "/tmp/project",
                sessionCount: 3,
                isWorkspace: false,
              },
            },
          ],
        }),
      ),
      Layer.provide(
        testSessionRepositoryLayer({
          sessions: [
            createSession("session-1"),
            createSession("session-2", {
              meta: {
                ...createSession("x").meta,
                firstUserMessage: {
                  kind: "command",
                  commandName: "/opsx:new",
                },
              },
            }),
            createSession("session-3", {
              meta: {
                ...createSession("x").meta,
                firstUserMessage: null,
              },
            }),
          ],
        }),
      ),
      Layer.provide(
        Layer.succeed(
          UserConfigService,
          UserConfigService.of({
            getUserConfig: () =>
              Effect.succeed({
                hideNoUserMessageSession: true,
                unifySameTitleSession: true,
                enterKeyBehavior: "shift-enter-send",
                permissionMode: "default",
                locale: "zh_CN",
                theme: "system",
                searchHotkey: "command-k",
                autoScheduleContinueOnRateLimit: false,
              }),
            setUserConfig: () => Effect.void,
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ClaudeCodeLifeCycleService,
          ClaudeCodeLifeCycleService.of({
            startTask: () => Effect.die("unused"),
            continueTask: () => Effect.die("unused"),
            abortTask: () => Effect.die("unused"),
            abortAllTasks: () => Effect.die("unused"),
            getPublicSessionProcesses: () => Effect.succeed([]),
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ProjectMetaService,
          ProjectMetaService.of({
            getProjectMeta: () =>
              Effect.succeed({
                projectName: "Project 1",
                projectPath: "/tmp/project",
                sessionCount: 3,
                isWorkspace: false,
              }),
            invalidateProject: () => Effect.void,
            repairProjectPath: () => Effect.die("unused"),
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ApplicationContext,
          ApplicationContext.of({
            claudeCodePaths: Effect.succeed({
              globalClaudeDirectoryPath: "/tmp/.claude",
              claudeCommandsDirPath: "/tmp/.claude/commands",
              claudeSkillsDirPath: "/tmp/.claude/skills",
              claudeProjectsDirPath: "/tmp/.claude/projects",
            }),
          }),
        ),
      ),
      Layer.provide(
        testFileSystemLayer({
          exists: () => Effect.succeed(false),
        }),
      ),
      Layer.provide(testPlatformLayer()),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ProjectController;
        return yield* controller.getProject({ projectId: "project-1" });
      }).pipe(Effect.provide(controllerLayer)),
    );

    expect(result.status).toBe(200);
    expect(result.response.totalSessions).toBe(1);
    expect(result.response.sessions).toHaveLength(1);
  });

  it("用 displayMeta.title 去重，而不是依赖 meta.firstUserMessage", async () => {
    const controllerLayer = ProjectController.Live.pipe(
      Layer.provide(
        testProjectRepositoryLayer({
          projects: [
            {
              id: "project-1",
              claudeProjectPath: "/tmp/project",
              lastModifiedAt: new Date("2026-03-07T00:00:00.000Z"),
              meta: {
                projectName: "Project 1",
                projectPath: "/tmp/project",
                sessionCount: 2,
                isWorkspace: false,
              },
            },
          ],
        }),
      ),
      Layer.provide(
        testSessionRepositoryLayer({
          sessions: [
            createSession("session-1", {
              displayMeta: {
                title: "实现登录页",
                visibleMessageCount: 5,
              },
              meta: {
                ...createSession("x").meta,
                firstUserMessage: null,
              },
            }),
            createSession("session-2", {
              lastModifiedAt: new Date("2026-03-08T00:00:00.000Z"),
              displayMeta: {
                title: "实现登录页",
                visibleMessageCount: 2,
              },
              meta: {
                ...createSession("x").meta,
                firstUserMessage: {
                  kind: "command",
                  commandName: "/opsx:new",
                  commandArgs: "登录页",
                },
              },
            }),
          ],
        }),
      ),
      Layer.provide(
        Layer.succeed(
          UserConfigService,
          UserConfigService.of({
            getUserConfig: () =>
              Effect.succeed({
                hideNoUserMessageSession: false,
                unifySameTitleSession: true,
                enterKeyBehavior: "shift-enter-send",
                permissionMode: "default",
                locale: "zh_CN",
                theme: "system",
                searchHotkey: "command-k",
                autoScheduleContinueOnRateLimit: false,
              }),
            setUserConfig: () => Effect.void,
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ClaudeCodeLifeCycleService,
          ClaudeCodeLifeCycleService.of({
            startTask: () => Effect.die("unused"),
            continueTask: () => Effect.die("unused"),
            abortTask: () => Effect.die("unused"),
            abortAllTasks: () => Effect.die("unused"),
            getPublicSessionProcesses: () => Effect.succeed([]),
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ProjectMetaService,
          ProjectMetaService.of({
            getProjectMeta: () =>
              Effect.succeed({
                projectName: "Project 1",
                projectPath: "/tmp/project",
                sessionCount: 2,
                isWorkspace: false,
              }),
            invalidateProject: () => Effect.void,
            repairProjectPath: () => Effect.die("unused"),
          }),
        ),
      ),
      Layer.provide(
        Layer.succeed(
          ApplicationContext,
          ApplicationContext.of({
            claudeCodePaths: Effect.succeed({
              globalClaudeDirectoryPath: "/tmp/.claude",
              claudeCommandsDirPath: "/tmp/.claude/commands",
              claudeSkillsDirPath: "/tmp/.claude/skills",
              claudeProjectsDirPath: "/tmp/.claude/projects",
            }),
          }),
        ),
      ),
      Layer.provide(
        testFileSystemLayer({
          exists: () => Effect.succeed(false),
        }),
      ),
      Layer.provide(testPlatformLayer()),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const controller = yield* ProjectController;
        return yield* controller.getProject({ projectId: "project-1" });
      }).pipe(Effect.provide(controllerLayer)),
    );

    expect(result.status).toBe(200);
    expect(result.response.totalSessions).toBe(1);
    expect(result.response.sessions).toHaveLength(1);
    expect(result.response.sessions[0]?.id).toBe("session-2");
  });
});
