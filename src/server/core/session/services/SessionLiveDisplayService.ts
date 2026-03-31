import { Context, Effect, Layer, Ref } from "effect";
import { buildSessionDisplayMeta } from "../../../../lib/session-display";
import type { ParsedUserMessage } from "../../claude-code/functions/parseUserMessage";
import type { SessionDisplayMeta, SessionMeta } from "../../types";

export type SessionLiveDisplay = {
  projectId: string;
  sessionId: string;
  displayMeta: SessionDisplayMeta;
  firstUserMessage: ParsedUserMessage | null;
  updatedAt: Date;
};

export const isSessionLiveDisplayCaughtUp = (options: {
  meta: Pick<SessionMeta, "messageCount" | "firstUserMessage">;
  liveDisplay: SessionLiveDisplay;
}) => {
  if (options.meta.firstUserMessage === null) {
    return false;
  }

  const persistedDisplayMeta = buildSessionDisplayMeta({
    sessionId: options.liveDisplay.sessionId,
    firstUserMessage: options.meta.firstUserMessage,
    visibleMessageCount: options.meta.messageCount,
  });

  return (
    persistedDisplayMeta.title === options.liveDisplay.displayMeta.title &&
    options.meta.messageCount >=
      options.liveDisplay.displayMeta.visibleMessageCount
  );
};

export class SessionLiveDisplayService extends Context.Tag(
  "SessionLiveDisplayService",
)<
  SessionLiveDisplayService,
  {
    readonly getProjectSessionLiveDisplays: (
      projectId: string,
    ) => Effect.Effect<SessionLiveDisplay[]>;
    readonly getSessionLiveDisplay: (
      sessionId: string,
    ) => Effect.Effect<SessionLiveDisplay | null>;
    readonly upsertSessionLiveDisplay: (
      display: Omit<SessionLiveDisplay, "updatedAt"> & {
        updatedAt?: Date;
      },
    ) => Effect.Effect<void>;
    readonly deleteSessionLiveDisplay: (
      sessionId: string,
    ) => Effect.Effect<void>;
  }
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const storageRef = yield* Ref.make<SessionLiveDisplay[]>([]);

      const getProjectSessionLiveDisplays = (projectId: string) =>
        Effect.gen(function* () {
          const displays = yield* Ref.get(storageRef);
          return displays.filter((display) => display.projectId === projectId);
        });

      const getSessionLiveDisplay = (sessionId: string) =>
        Effect.gen(function* () {
          const displays = yield* Ref.get(storageRef);
          return (
            displays.find((display) => display.sessionId === sessionId) ?? null
          );
        });

      const upsertSessionLiveDisplay = (
        display: Omit<SessionLiveDisplay, "updatedAt"> & {
          updatedAt?: Date;
        },
      ) =>
        Effect.gen(function* () {
          const nextDisplay: SessionLiveDisplay = {
            ...display,
            updatedAt: display.updatedAt ?? new Date(),
          };

          yield* Ref.update(storageRef, (displays) => {
            const remainingDisplays = displays.filter(
              (item) => item.sessionId !== display.sessionId,
            );

            return [...remainingDisplays, nextDisplay];
          });
        });

      const deleteSessionLiveDisplay = (sessionId: string) =>
        Effect.gen(function* () {
          yield* Ref.update(storageRef, (displays) =>
            displays.filter((display) => display.sessionId !== sessionId),
          );
        });

      return {
        getProjectSessionLiveDisplays,
        getSessionLiveDisplay,
        upsertSessionLiveDisplay,
        deleteSessionLiveDisplay,
      };
    }),
  );
}

export type ISessionLiveDisplayService = Context.Tag.Service<
  typeof SessionLiveDisplayService
>;
