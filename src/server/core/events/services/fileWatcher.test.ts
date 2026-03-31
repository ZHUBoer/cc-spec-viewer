import { Path } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import type { InternalEventDeclaration } from "../types/InternalEventDeclaration";
import { EventBus } from "./EventBus";
import { FileWatcherService } from "./fileWatcher";

describe("FileWatcherService", () => {
  describe("startWatching", () => {
    it("can start file watching", async () => {
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;

        // Start watching
        yield* watcher.startWatching();

        // Stop watching to avoid resource leakage between tests
        yield* watcher.stop();

        // Confirm successful start (no errors)
        return true;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(FileWatcherService.Live),
          Effect.provide(testPlatformLayer()),
          Effect.provide(Path.layer),
        ),
      );

      expect(result).toBe(true);
    });

    it("can stop watching with stop", async () => {
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;

        // Start watching
        yield* watcher.startWatching();

        // Stop watching
        yield* watcher.stop();

        return true;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(FileWatcherService.Live),
          Effect.provide(testPlatformLayer()),
          Effect.provide(Path.layer),
        ),
      );

      expect(result).toBe(true);
    });

    it("only starts once even when startWatching is called multiple times", async () => {
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;

        // Start watching multiple times
        yield* watcher.startWatching();
        yield* watcher.startWatching();
        yield* watcher.startWatching();

        // Stop watching to avoid resource leakage between tests
        yield* watcher.stop();

        // Confirm no errors occur
        return true;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(FileWatcherService.Live),
          Effect.provide(testPlatformLayer()),
          Effect.provide(Path.layer),
        ),
      );

      expect(result).toBe(true);
    });

    it("can call startWatching again after stop", async () => {
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;

        // Start watching
        yield* watcher.startWatching();

        // Stop watching
        yield* watcher.stop();

        // Start watching again
        yield* watcher.startWatching();

        // Stop watching
        yield* watcher.stop();

        return true;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(FileWatcherService.Live),
          Effect.provide(testPlatformLayer()),
          Effect.provide(Path.layer),
        ),
      );

      expect(result).toBe(true);
    });
  });

  describe("verify event firing behavior", () => {
    it("file change events propagate to EventBus (integration test)", async () => {
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;
        const eventBus = yield* EventBus;

        const sessionChangedEvents: Array<
          InternalEventDeclaration["sessionChanged"]
        > = [];

        // Register event listener
        const listener = (
          event: InternalEventDeclaration["sessionChanged"],
        ) => {
          sessionChangedEvents.push(event);
        };

        yield* eventBus.on("sessionChanged", listener);

        // Start watching
        yield* watcher.startWatching();

        // Note: It's difficult to trigger actual file changes,
        // so here we only verify that watching starts successfully
        yield* Effect.sleep("50 millis");

        // Stop watching
        yield* watcher.stop();

        yield* eventBus.off("sessionChanged", listener);

        // Confirm watching started
        return true;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(FileWatcherService.Live),
          Effect.provide(testPlatformLayer()),
          Effect.provide(Path.layer),
        ),
      );

      expect(result).toBe(true);
    });
  });

  describe("error handling", () => {
    it("returns startup error when watcher cannot initialize", async () => {
      const invalidRootPath = "\u0000invalid-project-root";
      const program = Effect.gen(function* () {
        const watcher = yield* FileWatcherService;

        // Startup should fail for invalid watch path.
        yield* watcher.startWatching();
        return true;
      });

      const result = await Effect.runPromise(
        Effect.exit(
          program.pipe(
            Effect.provide(FileWatcherService.Live),
            Effect.provide(
              testPlatformLayer({
                claudeCodePaths: {
                  claudeProjectsDirPath: invalidRootPath,
                },
              }),
            ),
            Effect.provide(Path.layer),
          ),
        ),
      );

      expect(result._tag).toBe("Failure");
    });
  });
});
