import { FileSystem } from "@effect/platform";
import { Effect, Option } from "effect";
import { testFileSystemLayer } from "../../../../testing/layers/testFileSystemLayer";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { ProjectMetaService } from "../services/ProjectMetaService";

describe("ProjectMetaService", () => {
  describe("getProjectMeta", () => {
    it("prefers persisted project path hint when available", async () => {
      const claudeProjectPath = "/test/project";
      const projectId = Buffer.from(claudeProjectPath).toString("base64url");
      const hintPath = `${claudeProjectPath}/.specforge-project-path`;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        return yield* storage.getProjectMeta(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => Effect.succeed(["session1.jsonl"]),
              readFileString: (filePath: string) => {
                if (filePath === hintPath) {
                  return Effect.succeed("/Users/me/real-project");
                }
                return Effect.succeed('{"type":"summary","text":"summary"}');
              },
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) =>
                Effect.succeed(
                  filePath === hintPath ||
                    filePath === "/Users/me/real-project",
                ),
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.projectPath).toBe("/Users/me/real-project");
      expect(result.projectName).toBe("real-project");
    });

    it("returns cached metadata", async () => {
      let readDirectoryCalls = 0;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        const projectId = Buffer.from("/test/project").toString("base64url");

        // First call
        const result1 = yield* storage.getProjectMeta(projectId);

        // Second call (retrieved from cache)
        const result2 = yield* storage.getProjectMeta(projectId);

        return { result1, result2, readDirectoryCalls };
      });

      const { result1, result2 } = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => {
                readDirectoryCalls++;
                return Effect.succeed(["session1.jsonl"]);
              },
              readFileString: () =>
                Effect.succeed(
                  '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/app","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                ),
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) =>
                Effect.succeed(
                  filePath !== "/test/project/.specforge-project-path",
                ),
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      // Both results are the same
      expect(result1).toEqual(result2);

      // readDirectory is called only once (cache is working)
      expect(readDirectoryCalls).toBe(1);
    });

    it("returns null if project path is not found", async () => {
      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        const projectId = Buffer.from("/test/project").toString("base64url");
        return yield* storage.getProjectMeta(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => Effect.succeed(["session1.jsonl"]),
              readFileString: () =>
                Effect.succeed('{"type":"summary","text":"summary"}'),
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) =>
                Effect.succeed(
                  filePath !== "/test/project/.specforge-project-path",
                ),
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.projectName).toBeNull();
      expect(result.projectPath).toBeNull();
      expect(result.sessionCount).toBe(1);
    });

    it("ignores stale project path hint and falls back to session-derived path", async () => {
      const claudeProjectPath = "/test/project";
      const projectId = Buffer.from(claudeProjectPath).toString("base64url");
      const hintPath = `${claudeProjectPath}/.specforge-project-path`;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        return yield* storage.getProjectMeta(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => Effect.succeed(["session1.jsonl"]),
              readFileString: (filePath: string) => {
                if (filePath === hintPath) {
                  return Effect.succeed("/stale/path");
                }
                return Effect.succeed(
                  '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/app","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                );
              },
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) => {
                if (filePath === hintPath) return Effect.succeed(true);
                if (filePath === "/stale/path") return Effect.succeed(false);
                if (filePath === "/workspace/app") return Effect.succeed(true);
                return Effect.succeed(true);
              },
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.projectPath).toBe("/workspace/app");
      expect(result.projectName).toBe("app");
    });

    it("retries metadata extraction when cached path is null", async () => {
      let readHintRound = 0;
      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        const projectId = Buffer.from("/test/project").toString("base64url");
        const first = yield* storage.getProjectMeta(projectId);
        const second = yield* storage.getProjectMeta(projectId);
        return { first, second };
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => Effect.succeed(["session1.jsonl"]),
              readFileString: (filePath: string) => {
                if (filePath === "/test/project/.specforge-project-path") {
                  readHintRound += 1;
                  return Effect.succeed(
                    readHintRound >= 2 ? "/workspace/recovered" : "",
                  );
                }
                return Effect.succeed('{"type":"summary","text":"summary"}');
              },
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) => {
                if (filePath === "/test/project/.specforge-project-path") {
                  return Effect.succeed(true);
                }
                if (filePath === "/workspace/recovered") {
                  return Effect.succeed(true);
                }
                return Effect.succeed(true);
              },
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.first.projectPath).toBeNull();
      expect(result.second.projectPath).toBe("/workspace/recovered");
      expect(result.second.projectName).toBe("recovered");
    });
  });

  describe("invalidateProject", () => {
    it("can invalidate project cache", async () => {
      let readDirectoryCalls = 0;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        const projectId = Buffer.from("/test/project").toString("base64url");

        // First call
        yield* storage.getProjectMeta(projectId);

        // Invalidate cache
        yield* storage.invalidateProject(projectId);

        // Second call (re-read from file)
        yield* storage.getProjectMeta(projectId);
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => {
                readDirectoryCalls++;
                return Effect.succeed(["session1.jsonl"]);
              },
              readFileString: () =>
                Effect.succeed(
                  '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/app","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                ),
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: () => Effect.succeed(true),
              makeDirectory: () => Effect.void,
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      // readDirectory is called twice (cache was invalidated)
      expect(readDirectoryCalls).toBe(2);
    });
  });

  describe("repairProjectPath", () => {
    it("repairs path when exactly one valid cwd candidate exists", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const hintPath = "/test/project/.specforge-project-path";
      let writtenHint: string | null = null;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        return yield* storage.repairProjectPath(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () => Effect.succeed(["session1.jsonl"]),
              readFileString: (filePath: string) => {
                if (filePath === hintPath) {
                  return Effect.succeed("");
                }
                return Effect.succeed(
                  '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/app","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                );
              },
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) => {
                if (filePath === hintPath) return Effect.succeed(false);
                if (filePath === "/workspace/app") return Effect.succeed(true);
                return Effect.succeed(true);
              },
              makeDirectory: () => Effect.void,
              writeFileString: (filePath: string, content: string) => {
                if (filePath === hintPath) {
                  writtenHint = content;
                }
                return Effect.void;
              },
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result).toEqual({
        success: true,
        projectPath: "/workspace/app",
      });
      expect(writtenHint).toBe("/workspace/app");
    });

    it("does not repair when cwd candidates are ambiguous", async () => {
      const projectId = Buffer.from("/test/project").toString("base64url");
      const hintPath = "/test/project/.specforge-project-path";
      let wroteHint = false;

      const program = Effect.gen(function* () {
        const storage = yield* ProjectMetaService;
        return yield* storage.repairProjectPath(projectId);
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(ProjectMetaService.Live),
          Effect.provide(
            testFileSystemLayer({
              readDirectory: () =>
                Effect.succeed(["session1.jsonl", "session2.jsonl"]),
              readFileString: (filePath: string) => {
                if (filePath === hintPath) {
                  return Effect.succeed("");
                }
                if (filePath.endsWith("session1.jsonl")) {
                  return Effect.succeed(
                    '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/a","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                  );
                }
                return Effect.succeed(
                  '{"parentUuid":null,"isSidechain":false,"userType":"external","cwd":"/workspace/b","sessionId":"abc123","version":"2.1.5","type":"system","subtype":"turn_duration","durationMs":1,"timestamp":"2026-01-09T11:57:15.634Z","uuid":"c6a15d05-e435-4588-aff3-37e173f0b8a9"}',
                );
              },
              stat: () =>
                Effect.succeed({
                  type: "File",
                  mtime: Option.some(new Date("2024-01-01")),
                  atime: Option.none(),
                  birthtime: Option.none(),
                  dev: 0,
                  ino: Option.none(),
                  mode: 0,
                  nlink: Option.none(),
                  uid: Option.none(),
                  gid: Option.none(),
                  rdev: Option.none(),
                  size: FileSystem.Size(0n),
                  blksize: Option.none(),
                  blocks: Option.none(),
                }),
              exists: (filePath: string) => {
                if (filePath === hintPath) return Effect.succeed(false);
                if (
                  filePath === "/workspace/a" ||
                  filePath === "/workspace/b"
                ) {
                  return Effect.succeed(true);
                }
                return Effect.succeed(true);
              },
              makeDirectory: () => Effect.void,
              writeFileString: (filePath: string) => {
                if (filePath === hintPath) {
                  wroteHint = true;
                }
                return Effect.void;
              },
            }),
          ),
          Effect.provide(testPlatformLayer()),
        ),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("ambiguous_project_paths");
      }
      expect(wroteHint).toBe(false);
    });
  });
});
