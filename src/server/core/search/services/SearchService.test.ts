import { FileSystem } from "@effect/platform";
import { Effect, Layer, Option } from "effect";
import { describe, expect, it } from "vitest";
import { testFileSystemLayer } from "../../../../testing/layers/testFileSystemLayer";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { SearchService } from "./SearchService";

describe("SearchService", () => {
  const createLayer = () => {
    const claudeProjectsDirPath = "/mock/.claude/projects";
    const projectDirName = "project-a";
    const sessionFileName = "session-1.jsonl";
    const projectDirPath = `${claudeProjectsDirPath}/${projectDirName}`;
    const sessionFilePath = `${projectDirPath}/${sessionFileName}`;

    const fileSystemLayer = testFileSystemLayer({
      exists: (path) => Effect.succeed(path === claudeProjectsDirPath),
      readDirectory: (path) => {
        if (path === claudeProjectsDirPath) {
          return Effect.succeed([projectDirName]);
        }
        if (path === projectDirPath) {
          return Effect.succeed([sessionFileName]);
        }
        return Effect.succeed([]);
      },
      stat: (path) => {
        if (path === projectDirPath) {
          return Effect.succeed({
            type: "Directory",
            mtime: Option.some(new Date("2025-01-01T00:00:00.000Z")),
            atime: Option.none(),
            birthtime: Option.none(),
            dev: 0,
            ino: Option.none(),
            mode: 0o755,
            nlink: Option.none(),
            uid: Option.none(),
            gid: Option.none(),
            rdev: Option.none(),
            size: FileSystem.Size(0n),
            blksize: Option.none(),
            blocks: Option.none(),
          });
        }
        return Effect.succeed({
          type: "File",
          mtime: Option.some(new Date("2025-01-01T00:00:00.000Z")),
          atime: Option.none(),
          birthtime: Option.none(),
          dev: 0,
          ino: Option.none(),
          mode: 0o644,
          nlink: Option.none(),
          uid: Option.none(),
          gid: Option.none(),
          rdev: Option.none(),
          size: FileSystem.Size(0n),
          blksize: Option.none(),
          blocks: Option.none(),
        });
      },
      readFileString: (path) => {
        if (path !== sessionFilePath) {
          return Effect.succeed("");
        }

        const sidechainUser = {
          type: "user",
          uuid: "9f13fe2b-0e59-4ca2-b047-06fd100845fa",
          timestamp: "2025-01-01T00:00:00.000Z",
          message: { role: "user", content: "zzsidechainonly123" },
          isSidechain: true,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        };
        const mainUser = {
          type: "user",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2025-01-01T00:00:01.000Z",
          message: { role: "user", content: "zzmainonly456" },
          isSidechain: false,
          userType: "external",
          cwd: "/test",
          sessionId: "session-1",
          version: "1.0.0",
          parentUuid: null,
        };

        return Effect.succeed(
          [sidechainUser, mainUser]
            .map((entry) => JSON.stringify(entry))
            .join("\n"),
        );
      },
    });

    return Layer.mergeAll(
      fileSystemLayer,
      testPlatformLayer({
        claudeCodePaths: {
          claudeProjectsDirPath,
        },
      }),
    );
  };

  it("excludes sidechain messages from search results", async () => {
    const program = Effect.gen(function* () {
      const service = yield* SearchService;
      return yield* service.search("zzsidechainonly123", 20);
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(SearchService.Live),
        Effect.provide(createLayer()),
      ),
    );

    expect(result.results).toHaveLength(0);
  });

  it("returns conversationUuid for stable client-side focusing", async () => {
    const program = Effect.gen(function* () {
      const service = yield* SearchService;
      return yield* service.search("zzmainonly456", 20);
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(SearchService.Live),
        Effect.provide(createLayer()),
      ),
    );

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.conversationUuid).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });
});
