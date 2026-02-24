import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getDirectoryListing } from "./getDirectoryListing";

describe("getDirectoryListing", () => {
  let testDir: string;

  // 创建测试用的 layer
  const testLayer = Layer.mergeAll(NodeContext.layer);

  beforeEach(async () => {
    // 使用 Effect-TS 创建测试目录
    testDir = await Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        // 使用临时目录
        const tmpDir = "/tmp";
        const testDirName = `test-dir-${Date.now()}`;
        const dir = path.join(tmpDir, testDirName);

        yield* fs.makeDirectory(dir, { recursive: true });
        return dir;
      }).pipe(Effect.provide(testLayer)),
    );
  });

  afterEach(async () => {
    // 使用 Effect-TS 删除测试目录
    await Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(testDir, { recursive: true });
      }).pipe(
        Effect.provide(testLayer),
        Effect.catchAll(() => Effect.succeed(undefined)),
      ),
    );
  });

  test("should list directories and files", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "subdir1"));
        yield* fs.makeDirectory(path.join(testDir, "subdir2"));
        yield* fs.writeFileString(path.join(testDir, "file1.txt"), "content1");
        yield* fs.writeFileString(path.join(testDir, "file2.txt"), "content2");
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir).pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toHaveLength(4);
    expect(result.entries).toEqual([
      { name: "subdir1", type: "directory", path: "subdir1" },
      { name: "subdir2", type: "directory", path: "subdir2" },
      { name: "file1.txt", type: "file", path: "file1.txt" },
      { name: "file2.txt", type: "file", path: "file2.txt" },
    ]);
    expect(result.basePath).toBe("/");
    expect(result.currentPath).toBe(testDir);
  });

  test("should navigate to subdirectory", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "parent"));
        yield* fs.makeDirectory(path.join(testDir, "parent", "child"));
        yield* fs.writeFileString(
          path.join(testDir, "parent", "file.txt"),
          "content",
        );
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir, "parent").pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toHaveLength(3);
    expect(result.entries).toEqual([
      { name: "..", type: "directory", path: "" },
      { name: "child", type: "directory", path: "parent/child" },
      { name: "file.txt", type: "file", path: "parent/file.txt" },
    ]);
    expect(result.basePath).toBe("parent");
  });

  test("should skip hidden files and directories", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, ".hidden-dir"));
        yield* fs.writeFileString(
          path.join(testDir, ".hidden-file"),
          "content",
        );
        yield* fs.makeDirectory(path.join(testDir, "visible-dir"));
        yield* fs.writeFileString(
          path.join(testDir, "visible-file.txt"),
          "content",
        );
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir).pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toHaveLength(2);
    expect(result.entries.some((e) => e.name.startsWith("."))).toBe(false);
  });

  test("should sort directories before files alphabetically", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "z-dir"));
        yield* fs.makeDirectory(path.join(testDir, "a-dir"));
        yield* fs.writeFileString(path.join(testDir, "z-file.txt"), "content");
        yield* fs.writeFileString(path.join(testDir, "a-file.txt"), "content");
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir).pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toEqual([
      { name: "a-dir", type: "directory", path: "a-dir" },
      { name: "z-dir", type: "directory", path: "z-dir" },
      { name: "a-file.txt", type: "file", path: "a-file.txt" },
      { name: "z-file.txt", type: "file", path: "z-file.txt" },
    ]);
  });

  test("should return empty entries for non-existent directory", async () => {
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(path.join(testDir, "non-existent")).pipe(
        Effect.provide(testLayer),
      ),
    );

    expect(result.entries).toEqual([]);
    expect(result.basePath).toBe("/");
  });

  test("should prevent directory traversal", async () => {
    await expect(
      Effect.runPromise(
        getDirectoryListing(testDir, "../../../etc").pipe(
          Effect.provide(testLayer),
        ),
      ),
    ).rejects.toThrow("Invalid path: outside root directory");
  });

  test("should allow normal directory names that start with dots", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "..foo"));
        yield* fs.writeFileString(path.join(testDir, "..foo", "a.txt"), "ok");
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir, "..foo").pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toEqual([
      { name: "..", type: "directory", path: "" },
      { name: "a.txt", type: "file", path: "..foo/a.txt" },
    ]);
  });

  test("should handle basePath with leading slash", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "subdir"));
        yield* fs.writeFileString(
          path.join(testDir, "subdir", "file.txt"),
          "content",
        );
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir, "/subdir").pipe(Effect.provide(testLayer)),
    );

    expect(result.entries).toHaveLength(2);
    expect(result.entries).toEqual([
      { name: "..", type: "directory", path: "" },
      { name: "file.txt", type: "file", path: "subdir/file.txt" },
    ]);
    expect(result.basePath).toBe("subdir");
  });

  test("should include parent directory entry when not at root", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "parent"));
        yield* fs.makeDirectory(path.join(testDir, "parent", "child"));
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir, "parent").pipe(Effect.provide(testLayer)),
    );

    const parentEntry = result.entries.find((e) => e.name === "..");
    expect(parentEntry).toEqual({
      name: "..",
      type: "directory",
      path: "",
    });
  });

  test("should not include parent directory entry at root", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "subdir"));
      }).pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      getDirectoryListing(testDir).pipe(Effect.provide(testLayer)),
    );

    const parentEntry = result.entries.find((e) => e.name === "..");
    expect(parentEntry).toBeUndefined();
  });

  test("should use absolute paths in currentPath for navigation", async () => {
    const fs = await Effect.runPromise(
      FileSystem.FileSystem.pipe(Effect.provide(testLayer)),
    );
    const path = await Effect.runPromise(
      Path.Path.pipe(Effect.provide(testLayer)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* fs.makeDirectory(path.join(testDir, "level1"));
        yield* fs.makeDirectory(path.join(testDir, "level1", "level2"));
      }).pipe(Effect.provide(testLayer)),
    );

    const rootResult = await Effect.runPromise(
      getDirectoryListing(testDir).pipe(Effect.provide(testLayer)),
    );
    expect(rootResult.currentPath).toBe(testDir);

    const level1Entry = rootResult.entries.find((e) => e.name === "level1");
    expect(level1Entry).toBeDefined();

    const level1Result = await Effect.runPromise(
      getDirectoryListing(testDir, level1Entry?.path).pipe(
        Effect.provide(testLayer),
      ),
    );
    expect(level1Result.currentPath).toBe(path.join(testDir, "level1"));

    const level2Entry = level1Result.entries.find((e) => e.name === "level2");
    expect(level2Entry).toBeDefined();

    const level2Result = await Effect.runPromise(
      getDirectoryListing(testDir, level2Entry?.path).pipe(
        Effect.provide(testLayer),
      ),
    );
    expect(level2Result.currentPath).toBe(
      path.join(testDir, "level1", "level2"),
    );
  });
});
