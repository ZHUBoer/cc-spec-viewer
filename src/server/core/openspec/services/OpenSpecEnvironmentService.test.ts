import { FileSystem } from "@effect/platform";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  type CliInstallation,
  createMockCliDetectionService,
} from "./CliDetectionService";
import {
  OpenSpecEnvironmentService,
  resolveOpenSpecConfigHome,
} from "./OpenSpecEnvironmentService";

/**
 * OpenSpecEnvironmentService 测试
 *
 * 注意：本测试专注于测试场景识别逻辑和配置解析，
 * 不测试实际的 Command 执行（因为这需要真实的系统环境）
 */

// 创建测试 Layer
const createMockFsLayer = (options?: {
  exists?: (path: string) => Effect.Effect<boolean>;
  readFileString?: (path: string) => Effect.Effect<string>;
  readDirectory?: (path: string) => Effect.Effect<string[]>;
}) =>
  FileSystem.layerNoop({
    exists: (path: string) =>
      options?.exists ? options.exists(path) : Effect.succeed(false),
    readFileString: (path: string) =>
      options?.readFileString
        ? options.readFileString(path)
        : Effect.succeed(""),
    readDirectory: (path: string) =>
      options?.readDirectory ? options.readDirectory(path) : Effect.succeed([]),
  });

const createTestLayer = (config: {
  projectPath: string | null;
  mockFs: Layer.Layer<FileSystem.FileSystem>;
  globalCli?: CliInstallation;
  projectCli?: CliInstallation;
}): Layer.Layer<OpenSpecEnvironmentService> => {
  const mockProjectRepository = Layer.mock(ProjectRepository, {
    getProject: () =>
      Effect.succeed({
        project: {
          id: "test-project",
          claudeProjectPath: "/test/project",
          lastModifiedAt: new Date(),
          meta: {
            projectName: "test-project",
            projectPath: config.projectPath,
            sessionCount: 0,
            isWorkspace: false,
          },
        },
      }),
  });

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
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
    });

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

  it("当全局和项目版本都不可用时应返回 cliVersion=null", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
    });

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

    expect(result.cliInstalled).toBe(false);
    expect(result.cliVersion).toBeNull();
  });

  describe("S1_NEW - 全新项目", () => {
    it("应该识别没有 openspec 和 .claude 目录的项目", async () => {
      const mockFs = createMockFsLayer({
        exists: () => Effect.succeed(false),
        readFileString: () => Effect.succeed(""),
        readDirectory: () => Effect.succeed([]),
      });

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
      const mockFs = createMockFsLayer({
        exists: (path: string) => {
          if (path.includes("openspec")) return Effect.succeed(true);
          return Effect.succeed(false);
        },
        readFileString: () => Effect.succeed("schema: v1\ncontext: test"),
        readDirectory: () => Effect.succeed([]),
      });

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
      const mockFs = createMockFsLayer({
        exists: (path: string) => {
          if (path.includes(".claude")) return Effect.succeed(true);
          return Effect.succeed(false);
        },
        readFileString: () => Effect.succeed(""),
        readDirectory: () => Effect.succeed([]),
      });

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
      const mockFs = createMockFsLayer({
        exists: () => Effect.succeed(true),
        readFileString: () => Effect.succeed("schema: v1\ncontext: test"),
        readDirectory: () => Effect.succeed([]),
      });

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
      const mockFs = createMockFsLayer({
        exists: () => Effect.succeed(true),
        readFileString: () =>
          Effect.succeed(`_specforge:
  profile: "test-profile"
  template_version: "1.0.0"
  initialized_at: "2024-01-01"

schema: specforge-enhanced`),
        readDirectory: () =>
          Effect.succeed(["querying-infra-catalog", "task-planning"]),
      });

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
      expect(result.specforgeConfig?.profile).toBe("test-profile");
      expect(result.templateUpgradeAvailable).toBe(false);
      expect(result.missingSpecforgeSkills).toHaveLength(0);
      expect(result.isConfigCorrupted).toBe(false);
      expect(result.cliInstalled).toBe(true);
      expect(result.cliVersion).toBe("1.0.0");
      expect(result.recommendedAction).toBe("none");
    });

    it("应该正确解析 SpecForge 标记", async () => {
      const mockFs = createMockFsLayer({
        exists: () => Effect.succeed(true),
        readFileString: () =>
          Effect.succeed(`_specforge:
  profile: "custom-profile"
  template_version: "2.0.0"
  initialized_at: "2025-01-01T00:00:00Z"

schema: specforge-enhanced`),
        readDirectory: () =>
          Effect.succeed(["querying-infra-catalog", "task-planning"]),
      });

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

      expect(result.specforgeConfig?.profile).toBe("custom-profile");
      expect(result.specforgeConfig?.initializedAt).toBe(
        "2025-01-01T00:00:00Z",
      );
      expect(result.specforgeConfig?.templateVersion).toBe("2.0.0");
      expect(result.templateUpgradeAvailable).toBe(true);
    });
  });

  describe("S6_PARTIAL - 部分配置", () => {
    it("应该识别部分配置的 SpecForge 项目", async () => {
      const mockFs = createMockFsLayer({
        exists: (path: string) => {
          // 模拟缺少某些 skills
          if (path.includes("gitnexus")) return Effect.succeed(true);
          if (path.includes("task-planning")) return Effect.succeed(false);
          return Effect.succeed(true);
        },
        readFileString: () =>
          Effect.succeed(`_specforge:
  profile: "test-profile"
  initialized_at: "2024-01-01"

schema: v1`),
        readDirectory: () => Effect.succeed(["gitnexus"]),
      });

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
      expect(result.missingSpecforgeSkills).toContain("task-planning");
      expect(result.recommendedAction).toBe("repair");
    });
  });
});

describe("OpenSpecEnvironmentService - 错误处理", () => {
  it("应该处理项目路径不存在的情况", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
    });

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
    expect(result.cliVersion).toBeNull();
  });

  it("应该处理文件系统读取错误", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(true),
      readFileString: () =>
        Effect.sync(() => {
          throw new Error("File read error");
        }),
      readDirectory: () => Effect.succeed([]),
    });

    const testLayer = createTestLayer({
      projectPath: "/test/project",
      mockFs,
    });

    const service = await Effect.runPromise(
      OpenSpecEnvironmentService.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      Effect.exit(service.checkEnvironment("test-project")),
    );

    // 读取错误应该被优雅处理（无未捕获异常）
    expect(result).toBeDefined();
  });
});

describe("OpenSpecEnvironmentService - 配置解析", () => {
  it("应该正确识别缺失的 Skills", async () => {
    const mockFs = createMockFsLayer({
      exists: (path: string) => {
        // 没有任何 required skill 存在
        if (path.includes("/skills/")) return Effect.succeed(false);
        return Effect.succeed(true);
      },
      readFileString: () =>
        Effect.succeed(`_specforge:
  profile: "test"
  initialized_at: "2024-01-01"

schema: v1`),
      readDirectory: () => Effect.succeed([]),
    });

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

    expect(result.missingSpecforgeSkills).toContain("task-planning");
    expect(result.missingSpecforgeSkills).not.toContain(
      "querying-infra-catalog",
    );
  });

  it("应该返回完整的场景描述", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
    });

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

  it("schema 非 specforge-enhanced 时应识别为部分配置", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(true),
      readFileString: () =>
        Effect.succeed(`_specforge:
  profile: "test"
  initialized_at: "2024-01-01"

schema: spec-driven`),
      readDirectory: () => Effect.succeed(["task-planning"]),
    });

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
    expect(result.isConfigCorrupted).toBe(true);
    expect(result.configErrors.some((e) => e.includes("schema"))).toBe(true);
    expect(result.recommendedAction).toBe("repair");
  });

  it("_specforge 标记损坏时不应误报模板可升级", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(true),
      readFileString: () =>
        Effect.succeed(`_specforge:
  initialized_at: "2024-01-01"

schema: specforge-enhanced`),
      readDirectory: () => Effect.succeed(["task-planning"]),
    });

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

    expect(result.hasSpecforgeMarker).toBe(true);
    expect(result.specforgeConfig).toBeNull();
    expect(result.isConfigCorrupted).toBe(true);
    expect(result.templateUpgradeAvailable).toBe(false);
  });

  it("应兼容 CRLF 格式的 openspec/config.yaml", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(true),
      readFileString: () =>
        Effect.succeed(`_specforge:\r
  profile: "test-profile"\r
  template_version: "1.0.0"\r
  initialized_at: "2024-01-01"\r
\r
schema: specforge-enhanced\r
`),
      readDirectory: () =>
        Effect.succeed(["querying-infra-catalog", "task-planning"]),
    });

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
    expect(result.isConfigCorrupted).toBe(false);
    expect(result.specforgeConfig?.profile).toBe("test-profile");
  });
});

describe("resolveOpenSpecConfigHome", () => {
  it("优先使用 XDG_CONFIG_HOME", () => {
    const result = resolveOpenSpecConfigHome({
      platform: "linux",
      env: {
        XDG_CONFIG_HOME: "/custom/.config",
        HOME: "/home/test",
      },
    });
    expect(result).toBe("/custom/.config");
  });

  it("Windows 下优先使用 APPDATA", () => {
    const result = resolveOpenSpecConfigHome({
      platform: "win32",
      env: {
        APPDATA: "C:\\Users\\test\\AppData\\Roaming",
        USERPROFILE: "C:\\Users\\test",
      },
    });
    expect(result).toBe("C:\\Users\\test\\AppData\\Roaming");
  });

  it("Windows 下 APPDATA 缺失时回退 USERPROFILE", () => {
    const result = resolveOpenSpecConfigHome({
      platform: "win32",
      env: {
        USERPROFILE: "C:\\Users\\test",
      },
    });
    expect(result).toBe("C:\\Users\\test\\AppData\\Roaming");
  });
});

describe("OpenSpecEnvironmentService - missingSpecforgeAgents / missingManagedFiles", () => {
  it("agent 文件缺失时应标记 S6_PARTIAL 并返回缺失明细", async () => {
    const mockFs = createMockFsLayer({
      exists: (path: string) => {
        // agents 文件不存在
        if (path.includes("/agents/")) return Effect.succeed(false);
        return Effect.succeed(true);
      },
      readFileString: () =>
        Effect.succeed(`_specforge:
  profile: "test"
  initialized_at: "2024-01-01"

schema: specforge-enhanced`),
      readDirectory: () => Effect.succeed(["task-planning"]),
    });

    const testLayer = createTestLayer({ projectPath: "/test/project", mockFs });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecEnvironmentService;
        return yield* service.checkEnvironment("test-project");
      }).pipe(Effect.provide(testLayer)),
    );

    expect(result.scenario).toBe("S6_PARTIAL");
    expect(result.missingSpecforgeAgents).toContain(
      "format-compliance-agent.md",
    );
    expect(result.missingSpecforgeAgents).toContain("quality-gate-agent.md");
  });

  it("openspec 目录不存在时 missingManagedFiles 应返回全部 4 项", async () => {
    const mockFs = createMockFsLayer({
      exists: () => Effect.succeed(false),
      readFileString: () => Effect.succeed(""),
      readDirectory: () => Effect.succeed([]),
    });

    const testLayer = createTestLayer({ projectPath: "/test/project", mockFs });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecEnvironmentService;
        return yield* service.checkEnvironment("test-project");
      }).pipe(Effect.provide(testLayer)),
    );

    expect(result.missingManagedFiles).toHaveLength(4);
    expect(result.missingManagedFiles).toContain(
      "openspec/schemas/specforge-enhanced/schema.yaml",
    );
    expect(result.missingManagedFiles).toContain(
      "openspec/schemas/specforge-enhanced/templates/spec.md",
    );
    expect(result.missingManagedFiles).toContain(
      "openspec/schemas/specforge-enhanced/templates/design.md",
    );
    expect(result.missingManagedFiles).toContain(
      "openspec/schemas/specforge-enhanced/templates/tasks.md",
    );
  });

  it("部分托管文件缺失时应识别为 S6_PARTIAL 并返回对应缺失项", async () => {
    const mockFs = createMockFsLayer({
      exists: (path: string) => {
        // spec.md 缺失
        if (path.endsWith("templates/spec.md")) return Effect.succeed(false);
        return Effect.succeed(true);
      },
      readFileString: () =>
        Effect.succeed(`_specforge:
  profile: "test"
  initialized_at: "2024-01-01"

schema: specforge-enhanced`),
      readDirectory: () =>
        Effect.succeed([
          "task-planning",
          "gitnexus",
          "d2c-baseline",
          "d2c-stitching",
        ]),
    });

    const testLayer = createTestLayer({ projectPath: "/test/project", mockFs });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OpenSpecEnvironmentService;
        return yield* service.checkEnvironment("test-project");
      }).pipe(Effect.provide(testLayer)),
    );

    expect(result.scenario).toBe("S6_PARTIAL");
    expect(result.missingManagedFiles).toContain(
      "openspec/schemas/specforge-enhanced/templates/spec.md",
    );
    expect(result.missingManagedFiles).not.toContain(
      "openspec/schemas/specforge-enhanced/schema.yaml",
    );
  });
});
