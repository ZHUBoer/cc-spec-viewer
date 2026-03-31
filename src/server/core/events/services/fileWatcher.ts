import { Path } from "@effect/platform";
import chokidar, { type FSWatcher } from "chokidar";
import { Context, Effect, Layer, Ref } from "effect";
import { ApplicationContext } from "../../platform/services/ApplicationContext";
import { encodeProjectIdFromSessionFilePath } from "../../project/functions/id";
import { parseSessionFilePath } from "../functions/parseSessionFilePath";
import { EventBus } from "./EventBus";

interface FileWatcherServiceInterface {
  readonly startWatching: () => Effect.Effect<void, Error>;
  readonly stop: () => Effect.Effect<void>;
}

export class FileWatcherService extends Context.Tag("FileWatcherService")<
  FileWatcherService,
  FileWatcherServiceInterface
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const eventBus = yield* EventBus;
      const context = yield* ApplicationContext;

      const isWatchingRef = yield* Ref.make(false);
      const watcherRef = yield* Ref.make<FSWatcher | null>(null);
      const debounceTimersRef = yield* Ref.make<
        Map<string, ReturnType<typeof setTimeout>>
      >(new Map());

      const clearDebounceTimer = (key: string) =>
        Effect.gen(function* () {
          const timers = yield* Ref.get(debounceTimersRef);
          const timer = timers.get(key);
          if (!timer) {
            return;
          }
          clearTimeout(timer);
          timers.delete(key);
          yield* Ref.set(debounceTimersRef, timers);
        });

      const emitChangeEvents = (
        debounceKey: string,
        projectId: string,
        fileType: "session" | "agent",
        fileId: string,
      ) =>
        Effect.gen(function* () {
          const timers = yield* Ref.get(debounceTimersRef);
          const existingTimer = timers.get(debounceKey);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          const timer = setTimeout(() => {
            if (fileType === "agent") {
              Effect.runFork(
                eventBus.emit("agentSessionChanged", {
                  projectId,
                  agentSessionId: fileId,
                }),
              );
            } else {
              Effect.runFork(
                eventBus.emit("sessionChanged", {
                  projectId,
                  sessionId: fileId,
                }),
              );
              Effect.runFork(
                eventBus.emit("sessionListChanged", {
                  projectId,
                }),
              );
            }
            Effect.runFork(clearDebounceTimer(debounceKey));
          }, 100);

          timers.set(debounceKey, timer);
          yield* Ref.set(debounceTimersRef, timers);
        });

      const startWatching = (): Effect.Effect<void, Error> =>
        Effect.gen(function* () {
          const isWatching = yield* Ref.get(isWatchingRef);
          if (isWatching) {
            return;
          }
          const claudeCodePaths = yield* context.claudeCodePaths;
          const rootPath = claudeCodePaths.claudeProjectsDirPath;
          const watchPattern = path.join(rootPath, "*", "*.jsonl");
          // biome-ignore lint/style/noProcessEnv: tests use polling to avoid EMFILE from fs.watch
          const isTestEnv = process.env.NODE_ENV === "test";

          const watcher = chokidar.watch(watchPattern, {
            persistent: false,
            ignoreInitial: true,
            usePolling: isTestEnv,
            interval: 100,
            awaitWriteFinish: {
              stabilityThreshold: 80,
              pollInterval: 20,
            },
          });

          watcher.on("all", (_eventName, changedPath) => {
            Effect.runFork(
              Effect.gen(function* () {
                const relativePath = path.relative(rootPath, changedPath);
                if (
                  relativePath.length === 0 ||
                  relativePath.startsWith("..") ||
                  path.isAbsolute(relativePath)
                ) {
                  return;
                }

                const fileMatch = parseSessionFilePath(relativePath);
                if (!fileMatch) {
                  return;
                }

                const fullPath = path.join(rootPath, relativePath);
                const encodedProjectId =
                  encodeProjectIdFromSessionFilePath(fullPath);

                if (fileMatch.type === "agent") {
                  const key = `${encodedProjectId}/agent-${fileMatch.agentSessionId}`;
                  yield* emitChangeEvents(
                    key,
                    encodedProjectId,
                    "agent",
                    fileMatch.agentSessionId,
                  );
                  return;
                }

                const key = `${encodedProjectId}/${fileMatch.sessionId}`;
                yield* emitChangeEvents(
                  key,
                  encodedProjectId,
                  "session",
                  fileMatch.sessionId,
                );
              }),
            );
          });

          const readyOrError = Effect.async<void, Error>((resume) => {
            let started = false;
            let settled = false;

            const onReady = () => {
              started = true;
              if (settled) {
                return;
              }
              settled = true;
              resume(Effect.void);
            };
            const onError = (error: unknown) => {
              const message =
                error instanceof Error ? error.message : String(error);
              if (started || settled) {
                console.error(
                  "[FileWatcherService] watcher runtime error:",
                  message,
                );
                return;
              }
              settled = true;
              resume(
                Effect.fail(
                  new Error(`Failed to start file watching: ${message}`),
                ),
              );
            };
            watcher.once("ready", onReady);
            watcher.on("error", onError);
          });

          const startResult = yield* readyOrError.pipe(
            Effect.tap(() => Ref.set(isWatchingRef, true)),
            Effect.tap(() => Ref.set(watcherRef, watcher)),
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.promise(() => watcher.close());
                yield* Ref.set(watcherRef, null);
                yield* Ref.set(isWatchingRef, false);
                return yield* Effect.fail(error);
              }),
            ),
          );

          return startResult;
        });

      const stop = (): Effect.Effect<void> =>
        Effect.gen(function* () {
          const timers = yield* Ref.get(debounceTimersRef);
          for (const timer of timers.values()) {
            clearTimeout(timer);
          }
          yield* Ref.set(debounceTimersRef, new Map());

          const watcher = yield* Ref.get(watcherRef);
          if (watcher) {
            yield* Effect.promise(() => watcher.close());
            yield* Ref.set(watcherRef, null);
          }

          yield* Ref.set(isWatchingRef, false);
        });

      return {
        startWatching,
        stop,
      } satisfies FileWatcherServiceInterface;
    }),
  );
}
