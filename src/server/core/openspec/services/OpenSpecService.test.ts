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
  it("应该推断 draft 状态（只有 spec）", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/spec.md":
          "# Spec\n\nThis is a spec.",
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
    expect(result[0]?.d2c).toBeUndefined();
  });

  it("应该在列表中识别 proposal 里的 D2C 标记", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": `# Proposal

<!-- D2C_ENABLED: true -->
<!-- D2C_CHANGE_KIND: modify -->
<!-- D2C_TARGET_SCOPE: page -->
<!-- D2C_MATERIALS_JSON: [{"link":"https://figma.com/design/demo-1","description":"活动首屏","scope":"page"},{"link":"https://figma.com/design/demo-2","description":"权益浮层","scope":"component"}] -->
<!-- D2C_BASELINE_FROZEN: false -->`,
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

    expect(result[0]?.d2c?.enabled).toBe(true);
    expect(result[0]?.d2c?.changeKind).toBe("modify");
    expect(result[0]?.d2c?.materials).toHaveLength(2);
  });

  it("应该在 spec 和 proposal 同时存在时优先读取 spec", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/spec.md":
          "# Spec\n\nSpec first.",
        "/test/project/openspec/changes/change1/proposal.md":
          "# Proposal\n\nProposal fallback.",
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

    expect(result[0]?.description).toBe("Spec first.");
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
  it("应该返回 change 详情中的 D2C 信息", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/proposal.md": `# Proposal

<!-- D2C_ENABLED: true -->
<!-- D2C_CHANGE_KIND: modify -->
<!-- D2C_TARGET_SCOPE: component -->
<!-- D2C_MATERIALS_JSON: [{"link":"https://figma.com/design/demo-1","description":"活动首屏","scope":"page"},{"link":"https://figma.com/design/demo-2","description":"权益浮层","scope":"component"}] -->
<!-- D2C_BASELINE_FROZEN: true -->
<!-- D2C_BASELINE_FROZEN_AT: 2026-03-06T00:00:00.000Z -->`,
        "/test/project/openspec/changes/change1/d2c/manifest.json": `{
          "enabled": true,
          "changeKind": "modify",
          "materials": [
            {
              "link": "https://figma.com/design/demo-1",
              "description": "活动首屏",
              "scope": "page",
              "artifactId": "activity-hero"
            },
            {
              "link": "https://figma.com/design/demo-2",
              "description": "权益浮层",
              "scope": "component",
              "artifactId": "benefit-modal"
            }
          ],
          "reviewStatus": "passed",
          "canEnterDesign": true,
          "reviewSummary": "视觉与交互闭环通过",
          "generator": "design-to-code-zx",
          "generatedAt": "2026-03-06T01:00:00.000Z",
          "entryFiles": ["activity-hero/index.tsx", "activity-hero/index.module.scss"],
          "reviewPath": "review.md"
        }`,
        "/test/project/openspec/changes/change1/d2c/activity-hero/index.tsx":
          "export const Demo = () => null;",
        "/test/project/openspec/changes/change1/d2c/activity-hero/index.module.scss":
          ".root { color: red; }",
      },
      {
        "/test/project/openspec/changes/change1": ["d2c"],
        "/test/project/openspec/changes/change1/d2c": [
          "manifest.json",
          "activity-hero",
        ],
        "/test/project/openspec/changes/change1/d2c/activity-hero": [
          "index.tsx",
          "index.module.scss",
        ],
      },
      {
        "/test/project/openspec/changes/change1": {
          type: "Directory",
          mtime: new Date(),
        },
        "/test/project/openspec/changes/change1/d2c": {
          type: "Directory",
          mtime: new Date(),
        },
        "/test/project/openspec/changes/change1/d2c/activity-hero": {
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
      // @ts-expect-error test layer 已提供依赖
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        return yield* service.getChangeDetails("test-project", "change1");
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(result.d2c?.enabled).toBe(true);
    expect(result.d2c?.baselineFrozen).toBe(true);
    expect(result.d2c?.changeKind).toBe("modify");
    expect(result.d2c?.materials).toHaveLength(2);
    expect(result.d2c?.reviewStatus).toBe("passed");
    expect(result.d2c?.canEnterDesign).toBe(true);
    expect(result.d2c?.generator).toBe("design-to-code-zx");
    expect(result.d2c?.generatedFiles).toHaveLength(2);
    expect(result.d2c?.previewFiles).toHaveLength(0);
  });

  it("应该获取 Change 详情并优先返回 specContent", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/spec.md": "# Spec\n\nTest spec",
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
    expect(result.specContent).toContain("Test spec");
    expect(result.proposalContent).toContain("Test proposal");
    expect(result.designContent).toContain("Test design");
    expect(result.tasksContent).toContain("Task 1");
  });

  it("应该在缺失 spec.md 时回退读取 proposal.md", async () => {
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

    expect(result.specContent).toBeUndefined();
    expect(result.proposalContent).toBeDefined();
    expect(result.designContent).toBeUndefined();
    expect(result.tasksContent).toBeUndefined();
  });

  it("应该在 spec.md 中兼容历史 PROPOSAL_FINAL_CONFIRMATION 标记", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const mockFs = createMockFileSystem(
      {
        "/test/project/openspec/changes/change1/spec.md": `# Spec

<!-- PROPOSAL_FINAL_CONFIRMATION: true -->`,
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
      // @ts-expect-error test layer 已提供依赖
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        return yield* service.getChangeDetails("test-project", "change1");
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(result.specContent).toContain("PROPOSAL_FINAL_CONFIRMATION");
  });
});

describe("OpenSpecService - 文件写入", () => {
  it("应该将 proposal.md 写入归一化到 spec.md", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const writes: Record<string, string> = {};
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: (path: string) =>
        Effect.succeed(path === "/test/project/openspec/changes/change1"),
      readFileString: (_path: string) => Effect.fail(new Error("unused")),
      writeFileString: (path: string, content: string) => {
        writes[path] = content;
        return Effect.succeed(undefined);
      },
      readDirectory: (_path: string) => Effect.succeed([]),
      stat: (_path: string) =>
        Effect.succeed({
          type: "Directory",
          mtime: Option.some(new Date()),
        }),
      // biome-ignore lint/suspicious/noExplicitAny: Mock implementation for testing
    } as any);

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        yield* service.updateChangeFile(
          "test-project",
          "change1",
          "proposal.md",
          "# Spec\n\nNormalized write",
        );
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(writes["/test/project/openspec/changes/change1/spec.md"]).toContain(
      "Normalized write",
    );
    expect(writes["/test/project/openspec/changes/change1/proposal.md"]).toBe(
      undefined,
    );
  });

  it("应该在仅存在 proposal.md 的历史 change 中继续写回 proposal.md", async () => {
    const mockProjectRepo = createMockProjectRepository();
    const writes: Record<string, string> = {};
    const existingPaths = new Set([
      "/test/project/openspec/changes/change1",
      "/test/project/openspec/changes/change1/proposal.md",
    ]);
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: (path: string) => Effect.succeed(existingPaths.has(path)),
      readFileString: (_path: string) => Effect.fail(new Error("unused")),
      writeFileString: (path: string, content: string) => {
        writes[path] = content;
        return Effect.succeed(undefined);
      },
      readDirectory: (_path: string) => Effect.succeed([]),
      stat: (_path: string) =>
        Effect.succeed({
          type: "Directory",
          mtime: Option.some(new Date()),
        }),
      // biome-ignore lint/suspicious/noExplicitAny: Mock implementation for testing
    } as any);

    const testLayer = OpenSpecService.Live.pipe(
      Layer.provide(
        Layer.mergeAll(testPlatformLayer(), mockProjectRepo, mockFs),
      ),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecService;
        yield* service.updateChangeFile(
          "test-project",
          "change1",
          "spec.md",
          "# Proposal\n\nLegacy write",
        );
      }).pipe(Effect.provide(testLayer), Effect.provide(Path.layer)),
    );

    expect(
      writes["/test/project/openspec/changes/change1/proposal.md"],
    ).toContain("Legacy write");
    expect(writes["/test/project/openspec/changes/change1/spec.md"]).toBe(
      undefined,
    );
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
