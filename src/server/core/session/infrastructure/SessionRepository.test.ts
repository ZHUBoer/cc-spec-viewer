import { SystemError } from "@effect/platform/Error";
import { Effect, Layer, Option } from "effect";
import type { Conversation } from "../../../../lib/conversation-schema";
import {
  createFileInfo,
  testFileSystemLayer,
} from "../../../../testing/layers/testFileSystemLayer";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { decodeProjectId } from "../../project/functions/id";
import type { ErrorJsonl, SessionDetail, SessionMeta } from "../../types";
import { SessionRepository } from "../infrastructure/SessionRepository";
import { VirtualConversationDatabase } from "../infrastructure/VirtualConversationDatabase";
import { SessionLiveDisplayService } from "../services/SessionLiveDisplayService";
import { SessionMetaService } from "../services/SessionMetaService";
import { createMockSessionMeta } from "../testing/createMockSessionMeta";

const testSessionMetaServiceLayer = (meta: SessionMeta) => {
  return Layer.mock(SessionMetaService, {
    getSessionMeta: () => Effect.succeed(meta),
    invalidateSession: () => Effect.void,
  });
};

const testPredictSessionsDatabaseLayer = (
  sessions: Map<string, SessionDetail>,
) => {
  return Layer.mock(VirtualConversationDatabase, {
    getProjectVirtualConversations: (projectId: string) =>
      Effect.succeed(
        Array.from(sessions.values())
          .filter((s) => {
            const projectPath = decodeProjectId(projectId);
            return s.jsonlFilePath.startsWith(projectPath);
          })
          .map((s) => ({
            projectId,
            sessionId: s.id,
            conversations: s.conversations,
          })),
      ),
    getSessionVirtualConversation: (sessionId: string) => {
      const session = sessions.get(sessionId);
      return Effect.succeed(
        session
          ? {
              projectId: "",
              sessionId: session.id,
              conversations: session.conversations,
            }
          : null,
      );
    },
  });
};

const testSessionLiveDisplayServiceLayer = (options?: {
  liveDisplays?: Array<{
    projectId: string;
    sessionId: string;
    displayMeta: {
      title: string;
      visibleMessageCount: number;
    };
    firstUserMessage: SessionMeta["firstUserMessage"];
    updatedAt?: Date;
  }>;
}) => {
  const liveDisplays = options?.liveDisplays ?? [];

  return Layer.succeed(SessionLiveDisplayService, {
    getProjectSessionLiveDisplays: (projectId: string) =>
      Effect.succeed(
        liveDisplays
          .filter((item) => item.projectId === projectId)
          .map((item) => ({
            ...item,
            updatedAt: item.updatedAt ?? new Date("2026-03-09T00:00:00.000Z"),
          })),
      ),
    getSessionLiveDisplay: (sessionId: string) =>
      Effect.succeed(
        liveDisplays
          .filter((item) => item.sessionId === sessionId)
          .map((item) => ({
            ...item,
            updatedAt: item.updatedAt ?? new Date("2026-03-09T00:00:00.000Z"),
          }))
          .at(0) ?? null,
      ),
    upsertSessionLiveDisplay: () => Effect.void,
    deleteSessionLiveDisplay: () => Effect.void,
  });
};

describe("SessionRepository", () => {
  describe("getSession", () => {
    it("returns session details when session file exists", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "test-session";
      const sessionPath = `/test/project/${sessionId}.jsonl`;
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 3,
        firstUserMessage: null,
      });

      const mockContent = `{"type":"user","message":{"role":"user","content":"Hello"}}\n{"type":"assistant","message":{"role":"assistant","content":"Hi"}}\n{"type":"user","message":{"role":"user","content":"Test"}}`;

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(
            testFileSystemLayer({
              exists: (path: string) => Effect.succeed(path === sessionPath),
              readFileString: (path: string) =>
                path === sessionPath
                  ? Effect.succeed(mockContent)
                  : Effect.fail(
                      new SystemError({
                        method: "readFileString",
                        reason: "NotFound",
                        module: "FileSystem",
                        cause: undefined,
                      }),
                    ),
              stat: () =>
                Effect.succeed(
                  createFileInfo({
                    type: "File",
                    mtime: Option.some(mockDate),
                  }),
                ),
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.session).not.toBeNull();
      if (result.session) {
        expect(result.session.id).toBe(sessionId);
        expect(result.session.jsonlFilePath).toBe(sessionPath);
        expect(result.session.meta).toEqual(mockMeta);
        expect(result.session.displayMeta).toEqual({
          title: sessionId,
          visibleMessageCount: 3,
        });
        expect(result.session.conversations).toHaveLength(3);
        expect(result.session.lastModifiedAt).toEqual(mockDate);
      }
    });

    it("filters duplicate virtual user messages within 5 seconds", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "session-dedupe";
      const sessionPath = `/test/project/${sessionId}.jsonl`;
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const diskTimestamp = "2024-01-01T00:00:00.000Z";
      const virtualTimestamp = "2024-01-01T00:00:02.000Z";
      const mockContent = `{"type":"user","uuid":"550e8400-e29b-41d4-a716-446655440010","timestamp":"${diskTimestamp}","message":{"role":"user","content":"hi"},"isSidechain":false,"userType":"external","cwd":"/test","sessionId":"${sessionId}","version":"1.0.0","parentUuid":null}`;

      const virtualConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: `vc__${sessionId}__${virtualTimestamp}`,
          timestamp: virtualTimestamp,
          message: { role: "user", content: "hi" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId,
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === sessionId
                ? {
                    projectId,
                    sessionId,
                    conversations: virtualConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(
            testFileSystemLayer({
              exists: (path: string) => Effect.succeed(path === sessionPath),
              readFileString: (path: string) =>
                path === sessionPath
                  ? Effect.succeed(mockContent)
                  : Effect.fail(
                      new SystemError({
                        method: "readFileString",
                        reason: "NotFound",
                        module: "FileSystem",
                        cause: undefined,
                      }),
                    ),
              stat: () =>
                Effect.succeed(
                  createFileInfo({
                    type: "File",
                    mtime: Option.some(mockDate),
                  }),
                ),
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      const conversations = result.session?.conversations ?? [];
      expect(conversations).toHaveLength(1);
      expect(
        conversations.some(
          (conversation) =>
            conversation.type === "user" &&
            conversation.uuid.startsWith("vc__"),
        ),
      ).toBe(false);
    });

    it("keeps virtual user messages when outside dedupe window", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "session-keep-virtual";
      const sessionPath = `/test/project/${sessionId}.jsonl`;
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const diskTimestamp = "2024-01-01T00:00:00.000Z";
      const virtualTimestamp = "2024-01-01T00:00:06.000Z";
      const mockContent = `{"type":"user","uuid":"550e8400-e29b-41d4-a716-446655440011","timestamp":"${diskTimestamp}","message":{"role":"user","content":"hi"},"isSidechain":false,"userType":"external","cwd":"/test","sessionId":"${sessionId}","version":"1.0.0","parentUuid":null}`;

      const virtualConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: `vc__${sessionId}__${virtualTimestamp}`,
          timestamp: virtualTimestamp,
          message: { role: "user", content: "hi" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId,
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === sessionId
                ? {
                    projectId,
                    sessionId,
                    conversations: virtualConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(
            testFileSystemLayer({
              exists: (path: string) => Effect.succeed(path === sessionPath),
              readFileString: (path: string) =>
                path === sessionPath
                  ? Effect.succeed(mockContent)
                  : Effect.fail(
                      new SystemError({
                        method: "readFileString",
                        reason: "NotFound",
                        module: "FileSystem",
                        cause: undefined,
                      }),
                    ),
              stat: () =>
                Effect.succeed(
                  createFileInfo({
                    type: "File",
                    mtime: Option.some(mockDate),
                  }),
                ),
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      const conversations = result.session?.conversations ?? [];
      expect(conversations).toHaveLength(2);
      expect(
        conversations.some(
          (conversation) =>
            conversation.type === "user" &&
            conversation.uuid.startsWith("vc__"),
        ),
      ).toBe(true);
    });

    it("filters duplicate virtual user messages when JSONL has XML command format", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "session-dedupe-command";
      const sessionPath = `/test/project/${sessionId}.jsonl`;
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const diskTimestamp = "2024-01-01T00:00:00.000Z";
      const virtualTimestamp = "2024-01-01T00:00:02.000Z";
      // JSONL 中的命令格式：XML 包裹
      const mockContent = `{"type":"user","uuid":"550e8400-e29b-41d4-a716-446655440020","timestamp":"${diskTimestamp}","message":{"role":"user","content":"<command-name>/init</command-name><command-message>init</command-message>"},"isSidechain":false,"userType":"external","cwd":"/test","sessionId":"${sessionId}","version":"1.0.0","parentUuid":null}`;

      // 虚拟对话中的原始输入格式
      const virtualConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: `vc__${sessionId}__${virtualTimestamp}`,
          timestamp: virtualTimestamp,
          message: { role: "user", content: "/init" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId,
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === sessionId
                ? {
                    projectId,
                    sessionId,
                    conversations: virtualConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(
            testFileSystemLayer({
              exists: (path: string) => Effect.succeed(path === sessionPath),
              readFileString: (path: string) =>
                path === sessionPath
                  ? Effect.succeed(mockContent)
                  : Effect.fail(
                      new SystemError({
                        method: "readFileString",
                        reason: "NotFound",
                        module: "FileSystem",
                        cause: undefined,
                      }),
                    ),
              stat: () =>
                Effect.succeed(
                  createFileInfo({
                    type: "File",
                    mtime: Option.some(mockDate),
                  }),
                ),
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      const conversations = result.session?.conversations ?? [];
      // 虚拟对话的 "/init" 应被 JSONL 的 XML 命令格式去重过滤
      expect(conversations).toHaveLength(1);
      expect(
        conversations.some(
          (conversation) =>
            conversation.type === "user" &&
            conversation.uuid.startsWith("vc__"),
        ),
      ).toBe(false);
    });

    it("returns predicted session when session file does not exist but predicted session exists", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "predict-session";
      const mockDate = new Date("2024-01-01T00:00:00.000Z");

      const mockConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: mockDate.toISOString(),
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId,
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const FileSystemMock = testFileSystemLayer({
        exists: () => Effect.succeed(false),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(
        createMockSessionMeta({
          messageCount: 0,
          firstUserMessage: null,
        }),
      );
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === sessionId
                ? {
                    projectId,
                    sessionId,
                    conversations: mockConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.session).not.toBeNull();
      if (result.session) {
        expect(result.session.id).toBe(sessionId);
        expect(result.session.conversations).toHaveLength(1);
        expect(result.session.meta.messageCount).toBe(1);
        expect(result.session.meta.firstUserMessage).toEqual({
          kind: "text",
          content: "Hello",
        });
        expect(result.session.meta.isCostPending).toBe(true);
        expect(result.session.displayMeta).toEqual({
          title: "Hello",
          visibleMessageCount: 1,
        });
      }
    });

    it("returns null when session does not exist", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "nonexistent-session";

      const FileSystemMock = testFileSystemLayer({
        exists: () => Effect.succeed(false),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(
        createMockSessionMeta({
          messageCount: 0,
          firstUserMessage: null,
        }),
      );
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.session).toBeNull();
    });

    it("returns null when resuming session without predict session (reproduces bug)", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const sessionId = "resume-session-id";

      const FileSystemMock = testFileSystemLayer({
        exists: () => Effect.succeed(false),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(
        createMockSessionMeta({
          messageCount: 0,
          firstUserMessage: null,
        }),
      );
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.session).toBeNull();
    });
  });

  describe("getSessions", () => {
    it("returns list of sessions within project", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const date1 = new Date("2024-01-01T00:00:00.000Z");
      const date2 = new Date("2024-01-02T00:00:00.000Z");

      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed(["session1.jsonl", "session2.jsonl"])
            : Effect.succeed([]),
        stat: (path: string) => {
          if (path.includes("session1.jsonl")) {
            return Effect.succeed(
              createFileInfo({ type: "File", mtime: Option.some(date2) }),
            );
          }
          if (path.includes("session2.jsonl")) {
            return Effect.succeed(
              createFileInfo({ type: "File", mtime: Option.some(date1) }),
            );
          }
          return Effect.succeed(
            createFileInfo({ type: "File", mtime: Option.some(new Date()) }),
          );
        },
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions).toHaveLength(2);
      expect(result.sessions.at(0)?.lastModifiedAt).toEqual(date2);
      expect(result.sessions.at(1)?.lastModifiedAt).toEqual(date1);
    });

    it("can limit number of results with maxCount option", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const mockDate = new Date("2024-01-01T00:00:00.000Z");

      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([
                "session1.jsonl",
                "session2.jsonl",
                "session3.jsonl",
              ])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(mockDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId, { maxCount: 2 });
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions).toHaveLength(2);
    });

    it("can paginate with cursor option", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const mockDate = new Date("2024-01-01T00:00:00.000Z");

      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([
                "session1.jsonl",
                "session2.jsonl",
                "session3.jsonl",
              ])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(mockDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId, {
          cursor: "session1",
        });
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions.length).toBeGreaterThan(0);
      expect(result.sessions.every((s) => s.id !== "session1")).toBe(true);
    });

    it("returns empty array when project does not exist", async () => {
      const projectId = Buffer.from("/nonexistent").toString("base64url");

      const FileSystemMock = testFileSystemLayer({
        exists: () => Effect.succeed(false),
        readDirectory: () =>
          Effect.fail(
            new SystemError({
              method: "readDirectory",
              reason: "NotFound",
              module: "FileSystem",
              cause: undefined,
            }),
          ),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(
        createMockSessionMeta({
          messageCount: 0,
          firstUserMessage: null,
        }),
      );
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions).toEqual([]);
    });

    it("excludes agent-*.jsonl files from session list", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const mockDate = new Date("2024-01-01T00:00:00.000Z");

      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([
                "session1.jsonl",
                "agent-abc123.jsonl", // This should be excluded
                "session2.jsonl",
                "agent-def456.jsonl", // This should be excluded
              ])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(mockDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = testPredictSessionsDatabaseLayer(
        new Map(),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      // Should only contain session1 and session2, not agent files
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions.some((s) => s.id === "session1")).toBe(true);
      expect(result.sessions.some((s) => s.id === "session2")).toBe(true);
      expect(result.sessions.some((s) => s.id.startsWith("agent-"))).toBe(
        false,
      );
    });

    it("returns including predicted sessions", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      const virtualDate = new Date("2024-01-03T00:00:00.000Z");

      const mockMeta: SessionMeta = createMockSessionMeta({
        messageCount: 1,
        firstUserMessage: null,
      });

      const mockConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: virtualDate.toISOString(),
          message: { role: "user", content: "Hello" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "predict-session",
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed(["session1.jsonl"])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(mockDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(mockMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: (pid: string) =>
            Effect.succeed(
              pid === projectId
                ? [
                    {
                      projectId,
                      sessionId: "predict-session",
                      conversations: mockConversations,
                    },
                  ]
                : [],
            ),
          getSessionVirtualConversation: () => Effect.succeed(null),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions.length).toBeGreaterThanOrEqual(2);
      expect(result.sessions.some((s) => s.id === "predict-session")).toBe(
        true,
      );
      expect(
        result.sessions.find((s) => s.id === "predict-session")?.displayMeta,
      ).toEqual({
        title: "Hello",
        visibleMessageCount: 1,
      });
    });

    it("合并已落盘会话的 virtualConversation，用于列表标题和可见消息数", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const diskDate = new Date("2024-01-01T00:00:00.000Z");
      const virtualDate = new Date("2024-01-03T00:00:00.000Z");

      const diskMeta: SessionMeta = createMockSessionMeta({
        messageCount: 2,
        firstUserMessage: null,
      });

      const virtualConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440100",
          timestamp: "2024-01-02T00:00:00.000Z",
          message: {
            role: "user",
            content: "<command-name>/opsx:new</command-name>",
          },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session1",
          version: "1.0.0",
          parentUuid: null,
        },
        {
          type: "assistant",
          uuid: "550e8400-e29b-41d4-a716-446655440101",
          timestamp: virtualDate.toISOString(),
          message: {
            type: "message",
            role: "assistant",
            model: "claude-sonnet-4-20250514",
            content: [{ type: "text", text: "ok" }],
            usage: {
              input_tokens: 1,
              output_tokens: 1,
              cache_creation_input_tokens: 0,
              cache_read_input_tokens: 0,
            },
            stop_reason: null,
            stop_sequence: null,
            id: "msg_01",
          },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session1",
          version: "1.0.0",
          parentUuid: "550e8400-e29b-41d4-a716-446655440100",
        },
      ];

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed(["session1.jsonl"])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(diskDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(diskMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: (pid: string) =>
            Effect.succeed(
              pid === projectId
                ? [
                    {
                      projectId,
                      sessionId: "session1",
                      conversations: virtualConversations,
                    },
                  ]
                : [],
            ),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === "session1"
                ? {
                    projectId,
                    sessionId: "session1",
                    conversations: virtualConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]?.meta.messageCount).toBe(4);
      expect(result.sessions[0]?.meta.firstUserMessage).toEqual({
        kind: "command",
        commandName: "/opsx:new",
      });
      expect(result.sessions[0]?.displayMeta).toEqual({
        title: "/opsx:new",
        visibleMessageCount: 4,
      });
      expect(result.sessions[0]?.lastModifiedAt).toEqual(virtualDate);
    });

    it("getSession 与 getSessions 对同一会话返回相同 displayMeta", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const sessionId = "session1";
      const diskDate = new Date("2024-01-01T00:00:00.000Z");

      const diskMeta: SessionMeta = createMockSessionMeta({
        messageCount: 2,
        firstUserMessage: null,
      });

      const mockContent = `{"type":"assistant","message":{"role":"assistant","content":"Hi"}}\n{"type":"system","subtype":"info","content":"done","level":"info","uuid":"550e8400-e29b-41d4-a716-446655440001","timestamp":"2024-01-01T00:00:00.000Z","isSidechain":false,"userType":"external","cwd":"/test","sessionId":"session1","version":"1.0.0","parentUuid":null}`;

      const virtualConversations: (Conversation | ErrorJsonl)[] = [
        {
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440100",
          timestamp: "2024-01-02T00:00:00.000Z",
          message: {
            role: "user",
            content: "实现登录页",
          },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId,
          version: "1.0.0",
          parentUuid: null,
        },
      ];

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) =>
          Effect.succeed(
            path === projectPath ||
              path === `${projectPath}/${sessionId}.jsonl`,
          ),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([`${sessionId}.jsonl`])
            : Effect.succeed([]),
        readFileString: (path: string) =>
          path === `${projectPath}/${sessionId}.jsonl`
            ? Effect.succeed(mockContent)
            : Effect.succeed(""),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(diskDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(diskMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: (pid: string) =>
            Effect.succeed(
              pid === projectId
                ? [
                    {
                      projectId,
                      sessionId,
                      conversations: virtualConversations,
                    },
                  ]
                : [],
            ),
          getSessionVirtualConversation: (sid: string) =>
            Effect.succeed(
              sid === sessionId
                ? {
                    projectId,
                    sessionId,
                    conversations: virtualConversations,
                  }
                : null,
            ),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        const sessionDetail = yield* repo.getSession(projectId, sessionId);
        const sessionList = yield* repo.getSessions(projectId);
        return {
          sessionDetail,
          sessionList,
        };
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(testSessionLiveDisplayServiceLayer()),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessionDetail.session?.displayMeta).toEqual({
        title: "实现登录页",
        visibleMessageCount: 3,
      });
      expect(result.sessionList.sessions[0]?.displayMeta).toEqual({
        title: "实现登录页",
        visibleMessageCount: 3,
      });
    });

    it("列表 displayMeta 优先使用 live overlay，不再重读文件兜底", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const sessionId = "stale-session";
      const diskDate = new Date("2024-01-01T00:00:00.000Z");

      const staleMeta: SessionMeta = createMockSessionMeta({
        messageCount: 2,
        firstUserMessage: null,
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([`${sessionId}.jsonl`])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(diskDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(staleMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: () => Effect.succeed(null),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(
            testSessionLiveDisplayServiceLayer({
              liveDisplays: [
                {
                  projectId,
                  sessionId,
                  displayMeta: {
                    title: "/opsx:new",
                    visibleMessageCount: 3,
                  },
                  firstUserMessage: {
                    kind: "command",
                    commandName: "/opsx:new",
                  },
                },
              ],
            }),
          ),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions[0]?.meta.messageCount).toBe(3);
      expect(result.sessions[0]?.meta.firstUserMessage).toEqual({
        kind: "command",
        commandName: "/opsx:new",
      });
      expect(result.sessions[0]?.displayMeta).toEqual({
        title: "/opsx:new",
        visibleMessageCount: 3,
      });
    });

    it("详情 displayMeta 在磁盘未追平时同样优先使用 live overlay", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const sessionId = "detail-stale-session";
      const diskDate = new Date("2024-01-01T00:00:00.000Z");

      const staleMeta: SessionMeta = createMockSessionMeta({
        messageCount: 2,
        firstUserMessage: null,
      });

      const sessionFileContent = [
        `{"type":"assistant","uuid":"550e8400-e29b-41d4-a716-446655440201","timestamp":"2024-01-02T00:00:01.000Z","message":{"id":"msg_01","type":"message","role":"assistant","model":"claude-sonnet-4-20250514","content":[{"type":"text","text":"ok"}],"usage":{"input_tokens":1,"output_tokens":1,"cache_creation_input_tokens":0,"cache_read_input_tokens":0},"stop_reason":null,"stop_sequence":null},"isSidechain":false,"userType":"external","cwd":"/test","sessionId":"${sessionId}","version":"1.0.0","parentUuid":null}`,
        `{"type":"system","subtype":"info","content":"done","level":"info","uuid":"550e8400-e29b-41d4-a716-446655440202","timestamp":"2024-01-02T00:00:02.000Z","isSidechain":false,"userType":"external","cwd":"/test","sessionId":"${sessionId}","version":"1.0.0","parentUuid":"550e8400-e29b-41d4-a716-446655440201"}`,
      ].join("\n");

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) =>
          Effect.succeed(path === `${projectPath}/${sessionId}.jsonl`),
        readFileString: (path: string) =>
          path === `${projectPath}/${sessionId}.jsonl`
            ? Effect.succeed(sessionFileContent)
            : Effect.succeed(""),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(diskDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(staleMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: () => Effect.succeed(null),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSession(projectId, sessionId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(
            testSessionLiveDisplayServiceLayer({
              liveDisplays: [
                {
                  projectId,
                  sessionId,
                  displayMeta: {
                    title: "/opsx:new",
                    visibleMessageCount: 3,
                  },
                  firstUserMessage: {
                    kind: "command",
                    commandName: "/opsx:new",
                  },
                },
              ],
            }),
          ),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.session?.displayMeta).toEqual({
        title: "/opsx:new",
        visibleMessageCount: 3,
      });
      expect(result.session?.meta.messageCount).toBe(3);
      expect(result.session?.meta.firstUserMessage).toEqual({
        kind: "command",
        commandName: "/opsx:new",
      });
    });

    it("磁盘 meta 已追平时忽略过期 live overlay", async () => {
      const projectPath = "/test/project";
      const projectId = Buffer.from(projectPath).toString("base64url");
      const sessionId = "caught-up-session";
      const diskDate = new Date("2024-01-01T00:00:00.000Z");

      const freshMeta: SessionMeta = createMockSessionMeta({
        messageCount: 4,
        firstUserMessage: {
          kind: "command",
          commandName: "/opsx:new",
        },
      });

      const FileSystemMock = testFileSystemLayer({
        exists: (path: string) => Effect.succeed(path === projectPath),
        readDirectory: (path: string) =>
          path === projectPath
            ? Effect.succeed([`${sessionId}.jsonl`])
            : Effect.succeed([]),
        stat: () =>
          Effect.succeed(createFileInfo({ mtime: Option.some(diskDate) })),
      });

      const SessionMetaServiceMock = testSessionMetaServiceLayer(freshMeta);
      const PredictSessionsDatabaseMock = Layer.succeed(
        VirtualConversationDatabase,
        {
          getProjectVirtualConversations: () => Effect.succeed([]),
          getSessionVirtualConversation: () => Effect.succeed(null),
          createVirtualConversation: () => Effect.void,
          deleteVirtualConversations: () => Effect.void,
        },
      );

      const program = Effect.gen(function* () {
        const repo = yield* SessionRepository;
        return yield* repo.getSessions(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(SessionRepository.Live),
          Effect.provide(
            testSessionLiveDisplayServiceLayer({
              liveDisplays: [
                {
                  projectId,
                  sessionId,
                  displayMeta: {
                    title: "/opsx:new",
                    visibleMessageCount: 3,
                  },
                  firstUserMessage: {
                    kind: "command",
                    commandName: "/opsx:new",
                  },
                },
              ],
            }),
          ),
          Effect.provide(SessionMetaServiceMock),
          Effect.provide(PredictSessionsDatabaseMock),
          Effect.provide(FileSystemMock),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.sessions[0]?.meta.messageCount).toBe(4);
      expect(result.sessions[0]?.displayMeta).toEqual({
        title: "/opsx:new",
        visibleMessageCount: 4,
      });
    });
  });
});
