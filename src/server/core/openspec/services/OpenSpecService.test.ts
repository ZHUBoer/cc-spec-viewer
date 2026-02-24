import { FileSystem, Path } from "@effect/platform";
import { Effect, Either, Layer, Option } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import { OpenSpecService } from "./OpenSpecService";

/**
 * OpenSpecService 测试
 *
 * 测试范围：
 * - Changes 列表获取
 * - Change 详情获取
 * - 状态推断逻辑
 */

// 创建 mock ProjectRepository
const createMockProjectRepository = (
  projectPath: string | null = "/test/project",
) => {
  return Layer.succeed(ProjectRepository, {
    getProject: () =>
      Effect.succeed({
        project: {
          meta: {
            projectPath,
          },
        },
      }),
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation for testing
  } as any);
};

// 创建 mock FileSystem
const createMockFileSystem = (
  files: Record<string, string> = {},
  directories: Record<string, string[]> = {},
  fileStats: Record<string, { type: "File" | "Directory"; mtime?: Date }> = {},
) => {
  return Layer.succeed(FileSystem.FileSystem, {
    exists: (path: string) =>
      Effect.succeed(path in files || path in directories),
    readFileString: (path: string) => {
      if (path in files) {
        return Effect.succeed(files[path]);
      }
      return Effect.fail(new Error(`File not found: ${path}`));
    },
    writeFileString: () => Effect.succeed(undefined),
    readDirectory: (path: string) => {
      if (path in directories) {
        return Effect.succeed(directories[path]);
      }
      return Effect.succeed([]);
    },
    stat: (path: string) => {
      if (path in fileStats) {
        const stat = fileStats[path];
        if (stat) {
          return Effect.succeed({
            type: stat.type,
            mtime: Option.some(stat.mtime || new Date("2024-01-01")),
            // biome-ignore lint/suspicious/noExplicitAny: Simplified mock for stat result
          } as any);
        }
      }
      return Effect.succeed({
        type: "File",
        mtime: Option.some(new Date()),
        // biome-ignore lint/suspicious/noExplicitAny: Simplified mock for stat result
      } as any);
    },
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation for testing
  } as any);
};

describe("OpenSpecService - Changes 列表", () => {
  it("应该获取所有 changes", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {},
      {
        "/test/project/openspec/changes": ["change1", "change2", "archive"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date("2024-01-02"),
        },
        "/test/project/openspec/changes/change2": {
          type: "Directory",
          mtime: new Date("2024-01-01"),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2); // archive 应该被跳过
    expect(result[0]?.name).toBe("change1"); // 按时间倒序
  });

  it("应该处理空的 changes 目录", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {},
      {
        "/test/project/openspec/changes": [],
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result).toEqual([]);
  });

  it("应该处理 changes 目录不存在", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(); // 空文件系统

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result).toEqual([]);
  });
});

describe("OpenSpecService - 状态推断", () => {
  it("应该推断 draft 状态（只有 proposal）", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md":
          "# Proposal\n\nThis is a proposal.",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("draft");
  });

  it("应该推断 designing 状态（有 design 但未确认）", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
        "/test/project/openspec/changes/change1/design.md":
          "# Design\n\nThis is a design.",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("designing");
  });

  it("应该推断 design-confirmed 状态", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
        "/test/project/openspec/changes/change1/design.md":
          "# Design\n\n<!-- DESIGN_FINAL_CONFIRMATION: true -->",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("design-confirmed");
  });

  it("应该推断 task-planning 状态", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
        "/test/project/openspec/changes/change1/design.md": "# Design",
        "/test/project/openspec/changes/change1/tasks.md":
          "# Tasks\n\n- [ ] Task 1",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("task-planning");
  });

  it("应该推断 implementing 状态", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
        "/test/project/openspec/changes/change1/design.md": "# Design",
        "/test/project/openspec/changes/change1/tasks.md":
          "# Tasks\n\n<!-- TASKS_CONFIRMED: true -->\n- [ ] Task 1",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("implementing");
  });

  it("应该推断 completed 状态", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
        "/test/project/openspec/changes/change1/design.md": "# Design",
        "/test/project/openspec/changes/change1/tasks.md":
          "# Tasks\n\n<!-- TASKS_CONFIRMED: true -->\n- [x] Task 1\n- [x] Task 2",
      },
      {
        "/test/project/openspec/changes": ["change1"],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(service.getChanges("test-project"));

    expect(result[0]?.status).toBe("completed");
  });
});

describe("OpenSpecService - Change 详情", () => {
  it.skip("应该获取 Change 详情", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md":
          "# Proposal\n\nTest proposal",
        "/test/project/openspec/changes/change1/design.md":
          "# Design\n\nTest design",
        "/test/project/openspec/changes/change1/tasks.md":
          "# Tasks\n\n- [ ] Task 1",
      },
      {
        "/test/project/openspec/changes/change1": [],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - FileSystem dependency is provided through closure in LayerImpl but TypeScript cannot infer this
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        return yield* service.getChangeDetails("test-project", "change1");
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(result.name).toBe("change1");
    expect(result.proposalContent).toContain("Test proposal");
    expect(result.designContent).toContain("Test design");
    expect(result.tasksContent).toContain("Task 1");
  });

  it.skip("应该处理缺失的文件", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": "# Proposal",
      },
      {
        "/test/project/openspec/changes/change1": [],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
      },
    );

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - FileSystem dependency is provided through closure in LayerImpl but TypeScript cannot infer this
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        return yield* service.getChangeDetails("test-project", "change1");
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(result.proposalContent).toBeDefined();
    expect(result.designContent).toBeUndefined();
    expect(result.tasksContent).toBeUndefined();
  });
});

describe("OpenSpecService - 错误处理", () => {
  it("应该处理项目路径不存在", async () => {
    const mockProjectRepo = createMockProjectRepository(null);
    const mockFs = createMockFileSystem();

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    const service = await Effect.runPromise(
      OpenSpecService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      Effect.either(service.getChanges("test-project")),
    );

    expect(Either.isLeft(result)).toBe(true);
  });
});
