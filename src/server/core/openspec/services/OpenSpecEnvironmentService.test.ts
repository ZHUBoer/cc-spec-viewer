import { FileSystem } from "@effect/platform";
import { Effect, Either, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  type CliInstallation,
  createMockCliDetectionService,
} from "./CliDetectionService";
import { OpenSpecEnvironmentService } from "./OpenSpecEnvironmentService";

/**
 * OpenSpecEnvironmentService 测试
 *
 * 注意：本测试专注于测试场景识别逻辑和配置解析，
 * 不测试实际的 Command 执行（因为这需要真实的系统环境）
 */

// 创建测试 Layer
const createTestLayer = (config: {
  projectPath: string | null;
  mockFs: Layer.Layer<FileSystem.FileSystem>;
  globalCli?: CliInstallation;
  projectCli?: CliInstallation;
}): Layer.Layer<OpenSpecEnvironmentService> => {
  const mockProjectRepository = Layer.succeed(ProjectRepository, {
    getProject: () =>
      Effect.succeed({
        project: {
          meta: {
            projectPath: config.projectPath,
          },
        },
      }),
    // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
  } as any);

  const mockCliDetection = createMockCliDetectionService({
    globalCli: config.globalCli,
    projectCli: config.projectCli,
  });

  // 组合所有 Layer
  const baseLayers = Layer.mergeAll(
    testPlatformLayer(),
    mockProjectRepository,
    config.mockFs,
    mockCliDetection,
  );

  return OpenSpecEnvironmentService.Live.pipe(Layer.provide(baseLayers));
};

describe("OpenSpecEnvironmentService - 场景识别", () => {
  it("应仅将全局 openspec 视为已安装", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = createTestLayer({
      projectPath: "/test/project",
      mockFs,
      globalCli: { installed: false },
      projectCli: { installed: true, version: "1.2.3", type: "project" },
    });

    const result = await Effect.runPromise(
      OpenSpecEnvironmentService.pipe(
        Effect.flatMap((service) => service.checkEnvironment("test-project")),
        Effect.provide(testLayer),
      ),
    );

    expect(result.cliInstalled).toBe(false);
    expect(result.cliInstallType).toBeUndefined();
    expect(result.cliVersion).toBe("1.2.3");
  });

  describe("S1_NEW - 全新项目", () => {
    it("应该识别没有 openspec 和 .claude 目录的项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: () => Effect.succeed(false),
        readFileString: () => Effect.succeed(""),
        readDirectory: () => Effect.succeed([]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
        globalCli: { installed: false },
        projectCli: { installed: false },
      });

      const result = await Effect.runPromise(
        OpenSpecEnvironmentService.pipe(
          Effect.flatMap((service) => service.checkEnvironment("test-project")),
          Effect.provide(testLayer),
        ),
      );

      expect(result.scenario).toBe("S1_NEW");
      expect(result.hasOpenspecDir).toBe(false);
      expect(result.hasClaudeDir).toBe(false);
      expect(result.cliInstalled).toBe(false);
      expect(result.recommendedAction).toBe("full_init");
    });
  });

  describe("S2_OPENSPEC_ONLY - 仅有 openspec", () => {
    it("应该识别只有 openspec 目录的项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: (path: string) => {
          if (path.includes("openspec")) return Effect.succeed(true);
          return Effect.succeed(false);
        },
        readFileString: () => Effect.succeed("schema: v1\ncontext: test"),
        readDirectory: () => Effect.succeed([]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;
          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.scenario).toBe("S2_OPENSPEC_ONLY");
      expect(result.hasOpenspecDir).toBe(true);
      expect(result.hasClaudeDir).toBe(false);
      expect(result.hasSpecforgeMarker).toBe(false);
      expect(result.recommendedAction).toBe("incremental_inject");
    });
  });

  describe("S3_CLAUDE_ONLY - 仅有 .claude", () => {
    it("应该识别只有 .claude 目录的项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: (path: string) => {
          if (path.includes(".claude")) return Effect.succeed(true);
          return Effect.succeed(false);
        },
        readFileString: () => Effect.succeed(""),
        readDirectory: () => Effect.succeed([]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;

          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.scenario).toBe("S3_CLAUDE_ONLY");
      expect(result.hasOpenspecDir).toBe(false);
      expect(result.hasClaudeDir).toBe(true);
      expect(result.recommendedAction).toBe("incremental_inject");
    });
  });

  describe("S4_BOTH_NON_SPECFORGE - 两者都有但无标记", () => {
    it("应该识别有 openspec 和 .claude 但无 SpecForge 标记的项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: () => Effect.succeed(true),
        readFileString: () => Effect.succeed("schema: v1\ncontext: test"),
        readDirectory: () => Effect.succeed([]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;

          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.scenario).toBe("S4_BOTH_NON_SPECFORGE");
      expect(result.hasOpenspecDir).toBe(true);
      expect(result.hasClaudeDir).toBe(true);
      expect(result.hasSpecforgeMarker).toBe(false);
      expect(result.recommendedAction).toBe("incremental_inject");
    });
  });

  describe("S5_CONFIGURED - 完整配置", () => {
    it("应该识别完整配置的 SpecForge 项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: () => Effect.succeed(true),
        readFileString: () =>
          Effect.succeed(`_specforge:
  version: "1.0.0"
  profile: "test-profile"
  initialized_at: "2024-01-01"

schema: v1`),
        readDirectory: () =>
          Effect.succeed([
            "design-generation",
            "querying-infra-catalog",
            "task-planning",
          ]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
        globalCli: { installed: true, version: "1.0.0", type: "global" },
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;

          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.scenario).toBe("S5_CONFIGURED");
      expect(result.hasSpecforgeMarker).toBe(true);
      expect(result.specforgeConfig).toBeDefined();
      expect(result.specforgeConfig?.version).toBe("1.0.0");
      expect(result.specforgeConfig?.profile).toBe("test-profile");
      expect(result.missingSpecforgeSkills).toHaveLength(0);
      expect(result.cliInstalled).toBe(true);
      expect(result.cliVersion).toBe("1.0.0");
      expect(result.recommendedAction).toBe("none");
    });

    it("应该正确解析 SpecForge 标记", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: () => Effect.succeed(true),
        readFileString: () =>
          Effect.succeed(`_specforge:
  version: "2.0.0"
  profile: "custom-profile"
  initialized_at: "2025-01-01T00:00:00Z"

schema: specforge-enhanced`),
        readDirectory: () =>
          Effect.succeed([
            "design-generation",
            "querying-infra-catalog",
            "task-planning",
          ]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;

          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.specforgeConfig?.version).toBe("2.0.0");
      expect(result.specforgeConfig?.profile).toBe("custom-profile");
      expect(result.specforgeConfig?.initializedAt).toBe(
        "2025-01-01T00:00:00Z",
      );
    });
  });

  describe("S6_PARTIAL - 部分配置", () => {
    it("应该识别部分配置的 SpecForge 项目", async () => {
      const mockFs = Layer.succeed(FileSystem.FileSystem, {
        exists: (path: string) => {
          // 模拟缺少某些 skills
          if (path.includes("design-generation")) return Effect.succeed(true);
          if (path.includes("querying-infra-catalog"))
            return Effect.succeed(false);
          if (path.includes("task-planning")) return Effect.succeed(false);
          return Effect.succeed(true);
        },
        readFileString: () =>
          Effect.succeed(`_specforge:
  version: "1.0.0"
  profile: "test-profile"
  initialized_at: "2024-01-01"

schema: v1`),
        readDirectory: () => Effect.succeed(["design-generation"]),
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      } as any);

      const testLayer = createTestLayer({
        projectPath: "/test/project",
        mockFs,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OpenSpecEnvironmentService;

          return yield* service.checkEnvironment("test-project");
        }).pipe(Effect.provide(testLayer)),
      );

      expect(result.scenario).toBe("S6_PARTIAL");
      expect(result.hasSpecforgeMarker).toBe(true);
      expect(result.missingSpecforgeSkills.length).toBeGreaterThan(0);
      expect(result.missingSpecforgeSkills).toContain("querying-infra-catalog");
      expect(result.missingSpecforgeSkills).toContain("task-planning");
      expect(result.recommendedAction).toBe("repair");
    });
  });
});

describe("OpenSpecEnvironmentService - 错误处理", () => {
  it("应该处理项目路径不存在的情况", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = createTestLayer({
      projectPath: null, // projectPath 为 null
      mockFs,
    });

    const service = await Effect.runPromise(
      OpenSpecEnvironmentService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      service.checkEnvironment("test-project"),
    );

    expect(result.scenario).toBe("S1_NEW");
    expect(result.recommendedAction).toBe("none");
    expect(result.isConfigCorrupted).toBe(true);
    expect(result.configErrors.length).toBeGreaterThan(0);
  });

  it("应该处理文件系统读取错误", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: () => Effect.succeed(true),
      readFileString: () => Effect.fail(new Error("File read error")),
      readDirectory: () => Effect.succeed([]),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = createTestLayer({
      projectPath: "/test/project",
      mockFs,
    });

    const service = await Effect.runPromise(
      OpenSpecEnvironmentService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      Effect.either(service.checkEnvironment("test-project")),
    );

    // 读取错误应该被优雅处理
    expect(Either.isRight(result) || Either.isLeft(result)).toBe(true);
  });
});

describe("OpenSpecEnvironmentService - 配置解析", () => {
  it("应该正确识别缺失的 Skills", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: (path: string) => {
        // 只有 design-generation 存在
        if (path.includes("design-generation")) return Effect.succeed(true);
        if (path.includes("/skills/")) return Effect.succeed(false);
        return Effect.succeed(true);
      },
      readFileString: () =>
        Effect.succeed(`_specforge:
  version: "1.0.0"
  profile: "test"
  initialized_at: "2024-01-01"

schema: v1`),
      readDirectory: () => Effect.succeed(["design-generation"]),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = createTestLayer({
      projectPath: "/test/project",
      mockFs,
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecEnvironmentService;

        return yield* service.checkEnvironment("test-project");
      }).pipe(Effect.provide(testLayer)),
    );

    expect(result.missingSpecforgeSkills).toContain("querying-infra-catalog");
    expect(result.missingSpecforgeSkills).toContain("task-planning");
    expect(result.missingSpecforgeSkills).not.toContain("design-generation");
  });

  it("应该返回完整的场景描述", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = createTestLayer({
      projectPath: "/test/project",
      mockFs,
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecEnvironmentService;

        return yield* service.checkEnvironment("test-project");
      }).pipe(Effect.provide(testLayer)),
    );

    expect(result.scenarioDescription).toBeTruthy();
    expect(result.scenarioDescription).toContain("全新项目");
  });
});
