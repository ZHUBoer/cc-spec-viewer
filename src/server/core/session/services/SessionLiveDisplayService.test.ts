import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { SessionLiveDisplayService } from "./SessionLiveDisplayService";

describe("SessionLiveDisplayService", () => {
  it("按 sessionId 读写 overlay，并支持按项目过滤", async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionLiveDisplayService;

      yield* service.upsertSessionLiveDisplay({
        projectId: "project-1",
        sessionId: "session-1",
        displayMeta: {
          title: "/opsx:new",
          visibleMessageCount: 3,
        },
        firstUserMessage: {
          kind: "command",
          commandName: "/opsx:new",
        },
      });

      yield* service.upsertSessionLiveDisplay({
        projectId: "project-2",
        sessionId: "session-2",
        displayMeta: {
          title: "实现登录页",
          visibleMessageCount: 5,
        },
        firstUserMessage: {
          kind: "text",
          content: "实现登录页",
        },
      });

      const session = yield* service.getSessionLiveDisplay("session-1");
      const projectSessions =
        yield* service.getProjectSessionLiveDisplays("project-1");

      return {
        session,
        projectSessions,
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(SessionLiveDisplayService.Live)),
    );

    expect(result.session).toEqual({
      projectId: "project-1",
      sessionId: "session-1",
      displayMeta: {
        title: "/opsx:new",
        visibleMessageCount: 3,
      },
      firstUserMessage: {
        kind: "command",
        commandName: "/opsx:new",
      },
      updatedAt: expect.any(Date),
    });
    expect(result.projectSessions).toHaveLength(1);
    expect(result.projectSessions[0]?.sessionId).toBe("session-1");
  });

  it("重复写入相同 sessionId 时覆盖旧 overlay，删除后返回 null", async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionLiveDisplayService;

      yield* service.upsertSessionLiveDisplay({
        projectId: "project-1",
        sessionId: "session-1",
        displayMeta: {
          title: "旧标题",
          visibleMessageCount: 1,
        },
        firstUserMessage: {
          kind: "text",
          content: "旧标题",
        },
      });

      yield* service.upsertSessionLiveDisplay({
        projectId: "project-1",
        sessionId: "session-1",
        displayMeta: {
          title: "新标题",
          visibleMessageCount: 4,
        },
        firstUserMessage: {
          kind: "text",
          content: "新标题",
        },
      });

      const updated = yield* service.getSessionLiveDisplay("session-1");
      yield* service.deleteSessionLiveDisplay("session-1");
      const removed = yield* service.getSessionLiveDisplay("session-1");

      return {
        updated,
        removed,
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(SessionLiveDisplayService.Live)),
    );

    expect(result.updated?.displayMeta).toEqual({
      title: "新标题",
      visibleMessageCount: 4,
    });
    expect(result.removed).toBeNull();
  });
});
