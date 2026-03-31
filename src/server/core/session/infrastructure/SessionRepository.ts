import { FileSystem, Path } from "@effect/platform";
import { Context, Effect, Layer, Option } from "effect";
import {
  buildSessionDisplayMeta,
  deriveSessionDisplayMetaFromConversations,
  mergeSessionDisplayMetaWithVirtualConversations,
} from "../../../../lib/session-display";
import type { InferEffect } from "../../../lib/effect/types";
import { parseJsonl } from "../../claude-code/functions/parseJsonl";
import { parseUserMessage } from "../../claude-code/functions/parseUserMessage";
import { decodeProjectId } from "../../project/functions/id";
import type { Session, SessionDetail, SessionMeta } from "../../types";
import {
  aggregateVirtualTokenUsage,
  countVisibleConversations,
  getFirstVisibleUserMessage,
  getLastConversationTimestamp,
  mergeSessionMetaWithVirtualConversations,
} from "../functions/getVisibleSessionMeta";
import { decodeSessionId, encodeSessionId } from "../functions/id";
import { isRegularSessionFile } from "../functions/isRegularSessionFile";
import { VirtualConversationDatabase } from "../infrastructure/VirtualConversationDatabase";
import {
  isSessionLiveDisplayCaughtUp,
  SessionLiveDisplayService,
} from "../services/SessionLiveDisplayService";
import { SessionMetaService } from "../services/SessionMetaService";

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const sessionMetaService = yield* SessionMetaService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const sessionLiveDisplayService = yield* SessionLiveDisplayService;

  // 创建默认的 SessionMeta，用于错误处理时的降级
  const createDefaultSessionMeta = (): SessionMeta => ({
    messageCount: 0,
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
    modelName: null,
    isCostPending: false,
  });

  const createDisplayMetaFromMeta = (options: {
    sessionId: string;
    meta: Pick<SessionMeta, "messageCount" | "firstUserMessage">;
    virtualConversations?: SessionDetail["conversations"];
  }) => {
    return mergeSessionDisplayMetaWithVirtualConversations({
      sessionId: options.sessionId,
      firstUserMessage: options.meta.firstUserMessage,
      visibleMessageCount: options.meta.messageCount,
      virtualConversations: options.virtualConversations ?? [],
    });
  };

  const mergeSessionMetaWithLiveDisplay = <
    TMeta extends {
      messageCount: number;
      firstUserMessage: SessionMeta["firstUserMessage"];
      isCostPending: boolean;
    },
  >(
    meta: TMeta,
    liveDisplay: {
      projectId: string;
      sessionId: string;
      displayMeta: Session["displayMeta"];
      firstUserMessage: SessionMeta["firstUserMessage"];
      updatedAt: Date;
    } | null,
  ) => {
    if (
      liveDisplay === null ||
      isSessionLiveDisplayCaughtUp({
        meta,
        liveDisplay,
      })
    ) {
      return meta;
    }

    return {
      ...meta,
      messageCount: Math.max(
        meta.messageCount,
        liveDisplay.displayMeta.visibleMessageCount,
      ),
      firstUserMessage: meta.firstUserMessage ?? liveDisplay.firstUserMessage,
      isCostPending: true,
    };
  };

  const resolveDisplayMeta = (options: {
    sessionId: string;
    meta: Pick<SessionMeta, "messageCount" | "firstUserMessage">;
    virtualConversations?: SessionDetail["conversations"];
    liveDisplay: {
      sessionId: string;
      displayMeta: Session["displayMeta"];
      firstUserMessage: SessionMeta["firstUserMessage"];
      projectId: string;
      updatedAt: Date;
    } | null;
  }) => {
    const baseDisplayMeta = createDisplayMetaFromMeta({
      sessionId: options.sessionId,
      meta: options.meta,
      virtualConversations: options.virtualConversations,
    });

    if (
      options.liveDisplay === null ||
      isSessionLiveDisplayCaughtUp({
        meta: options.meta,
        liveDisplay: options.liveDisplay,
      })
    ) {
      return baseDisplayMeta;
    }

    return options.liveDisplay.displayMeta;
  };

  const getLatestDate = (
    baseDate: Date,
    candidates: ReadonlyArray<Date | null>,
  ) => {
    return candidates.reduce<Date>((latest, current) => {
      if (current === null || current <= latest) {
        return latest;
      }

      return current;
    }, baseDate);
  };

  const getUserText = (
    conversation: SessionDetail["conversations"][number],
  ) => {
    if (conversation.type !== "user") {
      return null;
    }

    const content = conversation.message.content;
    if (typeof content === "string") {
      return content;
    }

    if (!Array.isArray(content)) {
      return null;
    }

    const parts: string[] = [];
    for (const item of content) {
      if (typeof item === "string") {
        parts.push(item);
        continue;
      }

      if (item.type === "text" && typeof item.text === "string") {
        parts.push(item.text);
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return parts.join("");
  };

  /**
   * 将 user 消息文本规范化为去重比较键。
   *
   * JSONL 中命令类型消息格式：<command-name>/init</command-name>...
   * 虚拟对话中原始输入：/init
   *
   * 规范化后两者都返回 "/init"，使去重匹配成功。
   */
  const normalizeUserTextForDedup = (text: string): string => {
    const parsed = parseUserMessage(text);
    if (parsed.kind === "command") {
      return parsed.commandName;
    }
    if (parsed.kind === "local-command") {
      return parsed.stdout;
    }
    return parsed.content;
  };

  const filterVirtualConversations = (
    conversations: SessionDetail["conversations"],
    virtualConversations: SessionDetail["conversations"],
    windowMs: number,
  ) => {
    if (virtualConversations.length === 0 || conversations.length === 0) {
      return virtualConversations;
    }

    const diskUserMessages = conversations.flatMap((conversation) => {
      if (conversation.type !== "user") {
        return [];
      }

      const text = getUserText(conversation);
      if (text === null) {
        return [];
      }

      const timestamp = new Date(conversation.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return [];
      }

      return [{ text, timestamp } as const];
    });

    if (diskUserMessages.length === 0) {
      return virtualConversations;
    }

    return virtualConversations.filter((conversation) => {
      if (conversation.type !== "user") {
        return true;
      }

      if (!conversation.uuid.startsWith("vc__")) {
        return true;
      }

      const text = getUserText(conversation);
      if (text === null) {
        return true;
      }

      const timestamp = new Date(conversation.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return true;
      }

      const isDuplicate = diskUserMessages.some((disk) => {
        const normalizedDisk = normalizeUserTextForDedup(disk.text);
        const normalizedVirtual = normalizeUserTextForDedup(text);
        if (normalizedDisk !== normalizedVirtual) {
          return false;
        }
        const diff = Math.abs(disk.timestamp.getTime() - timestamp.getTime());
        return diff <= windowMs;
      });

      return !isDuplicate;
    });
  };

  const getDisplayConversations = (
    conversations: SessionDetail["conversations"],
    virtualConversations: SessionDetail["conversations"],
  ) => {
    const mergedConversations = [...conversations, ...virtualConversations];

    const conversationMap = new Map(
      mergedConversations.flatMap((conversation, index) => {
        if (
          conversation.type === "user" ||
          conversation.type === "assistant" ||
          conversation.type === "system"
        ) {
          return [[conversation.uuid, { index }] as const];
        }

        return [];
      }),
    );

    const isBroken = mergedConversations.some((conversation, index) => {
      if (conversation.type !== "summary") {
        return false;
      }

      const leafMessage = conversationMap.get(conversation.leafUuid);
      if (leafMessage === undefined) {
        return false;
      }

      return index < leafMessage.index;
    });

    return isBroken ? conversations : mergedConversations;
  };

  const getSession = (projectId: string, sessionId: string) =>
    Effect.gen(function* () {
      const sessionPath = decodeSessionId(projectId, sessionId);

      const virtualConversation =
        yield* virtualConversationDatabase.getSessionVirtualConversation(
          sessionId,
        );
      const liveDisplay =
        yield* sessionLiveDisplayService.getSessionLiveDisplay(sessionId);

      // Check if session file exists
      const exists = yield* fs.exists(sessionPath);
      const sessionDetail = yield* exists
        ? Effect.gen(function* () {
            // Read session file
            const content = yield* fs.readFileString(sessionPath);
            const allLines = content.split("\n").filter((line) => line.trim());

            const conversations = parseJsonl(allLines.join("\n"));
            const virtualConversations =
              virtualConversation === null
                ? []
                : filterVirtualConversations(
                    conversations,
                    virtualConversation.conversations,
                    5000,
                  );

            // Get file stats
            const stat = yield* fs.stat(sessionPath);

            // Get session metadata
            const meta = yield* sessionMetaService
              .getSessionMeta(projectId, sessionId)
              .pipe(
                Effect.catchAll((error) => {
                  console.error(
                    `[SessionRepository] Failed to get meta for session ${sessionId}:`,
                    error,
                  );
                  return Effect.succeed(createDefaultSessionMeta());
                }),
              );

            const mergedMeta =
              virtualConversation !== null
                ? mergeSessionMetaWithVirtualConversations(
                    meta,
                    virtualConversations,
                  )
                : meta;
            const visibleMeta = mergeSessionMetaWithLiveDisplay(
              mergedMeta,
              liveDisplay,
            );
            const displayConversations = getDisplayConversations(
              conversations,
              virtualConversations,
            );

            const sessionDetail: SessionDetail = {
              id: sessionId,
              jsonlFilePath: sessionPath,
              displayMeta: resolveDisplayMeta({
                sessionId,
                meta: mergedMeta,
                liveDisplay,
              }),
              meta: visibleMeta,
              conversations: displayConversations,
              lastModifiedAt: Option.getOrElse(stat.mtime, () => new Date()),
            };

            return sessionDetail;
          })
        : (() => {
            if (virtualConversation === null) {
              return Effect.succeed(null);
            }

            const lastConversation = virtualConversation.conversations
              .filter(
                (conversation) =>
                  conversation.type === "user" ||
                  conversation.type === "assistant" ||
                  conversation.type === "system",
              )
              .at(-1);

            const virtualStats = aggregateVirtualTokenUsage(
              virtualConversation.conversations,
            );

            const virtualSession: SessionDetail = {
              id: sessionId,
              jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
              displayMeta: deriveSessionDisplayMetaFromConversations(
                sessionId,
                virtualConversation.conversations,
              ),
              meta: {
                messageCount: countVisibleConversations(
                  virtualConversation.conversations,
                ),
                firstUserMessage: getFirstVisibleUserMessage(
                  virtualConversation.conversations,
                ),
                cost: virtualStats.cost,
                modelName: virtualStats.modelName,
                isCostPending: true,
              },
              conversations: virtualConversation.conversations,
              lastModifiedAt:
                lastConversation !== undefined
                  ? new Date(lastConversation.timestamp)
                  : new Date(),
            };

            return Effect.succeed(virtualSession);
          })();

      return {
        session: sessionDetail,
      };
    });

  const buildPersistedSessionListItem = (options: {
    projectId: string;
    item: {
      id: string;
      jsonlFilePath: string;
      lastModifiedAt: Date;
    };
    virtualConversationsForSession: SessionDetail["conversations"];
    liveDisplay: {
      sessionId: string;
      displayMeta: Session["displayMeta"];
      firstUserMessage: SessionMeta["firstUserMessage"];
      projectId: string;
      updatedAt: Date;
    } | null;
  }) =>
    Effect.gen(function* () {
      const meta = yield* sessionMetaService
        .getSessionMeta(options.projectId, options.item.id)
        .pipe(
          Effect.catchAll((error) => {
            console.error(
              `[SessionRepository] Failed to get meta for session ${options.item.id}:`,
              error,
            );
            return Effect.succeed(createDefaultSessionMeta());
          }),
        );
      const mergedMeta = mergeSessionMetaWithVirtualConversations(
        meta,
        options.virtualConversationsForSession,
      );
      const visibleMeta = mergeSessionMetaWithLiveDisplay(
        mergedMeta,
        options.liveDisplay,
      );
      const displayMeta = resolveDisplayMeta({
        sessionId: options.item.id,
        meta: mergedMeta,
        liveDisplay: options.liveDisplay,
      });
      const virtualLastTimestamp = getLastConversationTimestamp(
        options.virtualConversationsForSession,
      );

      return {
        ...options.item,
        displayMeta,
        lastModifiedAt: getLatestDate(options.item.lastModifiedAt, [
          virtualLastTimestamp,
          options.liveDisplay?.updatedAt ?? null,
        ]),
        meta: visibleMeta,
      };
    });

  const getSessions = (
    projectId: string,
    options?: {
      maxCount?: number;
      cursor?: string;
    },
  ) =>
    Effect.gen(function* () {
      const { maxCount = 20, cursor } = options ?? {};

      const claudeProjectPath = decodeProjectId(projectId);

      // Check if project directory exists
      const dirExists = yield* fs.exists(claudeProjectPath);
      if (!dirExists) {
        console.warn(`Project directory not found at ${claudeProjectPath}`);
        return { sessions: [] };
      }

      // Read directory entries with error handling
      const dirents = yield* Effect.tryPromise({
        try: () => fs.readDirectory(claudeProjectPath).pipe(Effect.runPromise),
        catch: (error) => {
          console.warn(
            `Failed to read sessions for project ${projectId}:`,
            error,
          );
          return new Error("Failed to read directory");
        },
      }).pipe(Effect.catchAll(() => Effect.succeed([])));

      // Process session files (excluding agent-*.jsonl files)
      const sessionEffects = dirents.filter(isRegularSessionFile).map((entry) =>
        Effect.gen(function* () {
          const fullPath = path.resolve(claudeProjectPath, entry);
          const sessionId = encodeSessionId(fullPath);

          // Get file stats with error handling
          const stat = yield* Effect.tryPromise(() =>
            fs.stat(fullPath).pipe(Effect.runPromise),
          ).pipe(Effect.catchAll(() => Effect.succeed(null)));

          if (!stat) {
            return null;
          }

          return {
            id: sessionId,
            jsonlFilePath: fullPath,
            lastModifiedAt: Option.getOrElse(stat.mtime, () => new Date()),
          };
        }),
      );

      // Execute all effects in parallel and filter out nulls
      const sessionsWithNulls = yield* Effect.all(sessionEffects, {
        concurrency: 10,
      });
      const sessions = sessionsWithNulls
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort(
          (a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime(),
        );

      const sessionMap = new Map(
        sessions.map((session) => [session.id, session] as const),
      );
      const virtualConversations =
        yield* virtualConversationDatabase.getProjectVirtualConversations(
          projectId,
        );
      const virtualConversationMap = new Map(
        virtualConversations.map(
          (item) => [item.sessionId, item.conversations] as const,
        ),
      );
      const liveDisplays =
        yield* sessionLiveDisplayService.getProjectSessionLiveDisplays(
          projectId,
        );
      const liveDisplayMap = new Map(
        liveDisplays.map((item) => [item.sessionId, item] as const),
      );

      const index =
        cursor !== undefined
          ? sessions.findIndex((session) => session.id === cursor)
          : -1;

      if (index !== -1) {
        const sessionsToReturn = sessions.slice(
          index + 1,
          Math.min(index + 1 + maxCount, sessions.length),
        );

        const sessionsWithMeta = yield* Effect.all(
          sessionsToReturn.map((item) =>
            buildPersistedSessionListItem({
              projectId,
              item,
              virtualConversationsForSession:
                virtualConversationMap.get(item.id) ?? [],
              liveDisplay: liveDisplayMap.get(item.id) ?? null,
            }),
          ),
          { concurrency: 10 },
        );

        return {
          sessions: sessionsWithMeta,
        };
      }

      const virtualSessions = virtualConversations
        .filter(({ sessionId }) => !sessionMap.has(sessionId))
        .map(({ sessionId, conversations }): Session => {
          const firstUserMessage = getFirstVisibleUserMessage(conversations);
          const last = getLastConversationTimestamp(conversations);
          const virtualStats = aggregateVirtualTokenUsage(conversations);

          return {
            id: sessionId,
            jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
            lastModifiedAt: last ?? new Date(),
            displayMeta: buildSessionDisplayMeta({
              sessionId,
              firstUserMessage,
              visibleMessageCount: countVisibleConversations(conversations),
            }),
            meta: {
              messageCount: countVisibleConversations(conversations),
              firstUserMessage: firstUserMessage,
              cost: virtualStats.cost,
              modelName: virtualStats.modelName,
              isCostPending: true,
            },
          };
        })
        .sort((a, b) => {
          return b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime();
        });

      // Get sessions with metadata
      const sessionsToReturn = sessions.slice(
        0,
        Math.min(maxCount, sessions.length),
      );
      const sessionsWithMeta: Session[] = yield* Effect.all(
        sessionsToReturn.map((item) =>
          buildPersistedSessionListItem({
            projectId,
            item,
            virtualConversationsForSession:
              virtualConversationMap.get(item.id) ?? [],
            liveDisplay: liveDisplayMap.get(item.id) ?? null,
          }),
        ),
        { concurrency: 10 },
      );

      return {
        sessions: [...virtualSessions, ...sessionsWithMeta],
      };
    });

  return {
    getSession,
    getSessions,
  };
});

export type ISessionRepository = InferEffect<typeof LayerImpl>;

export class SessionRepository extends Context.Tag("SessionRepository")<
  SessionRepository,
  ISessionRepository
>() {
  static Live = Layer.effect(this, LayerImpl);
}
