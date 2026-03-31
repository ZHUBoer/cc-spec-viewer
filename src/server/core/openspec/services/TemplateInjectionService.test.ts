import { FileSystem } from "@effect/platform";
import { SystemError } from "@effect/platform/Error";
import { NodeContext } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  type EnvironmentStatus,
  OpenSpecEnvironmentService,
  type ScenarioType,
} from "./OpenSpecEnvironmentService";
import { type Profile, ProfileConfigService } from "./ProfileConfigService";
import { SkillManagerService } from "./SkillManagerService";
import { TemplateInjectionService } from "./TemplateInjectionService";
import { TemplateProcessor } from "./TemplateProcessor";

const createTestDependencies = (
  files: Map<string, string>,
  options: {
    installSkillsFromGitResult?: Array<{ name: string; description: string }>;
    preflightSkillsFromGitResult?: {
      ok: boolean;
      category:
        | "none"
        | "network"
        | "auth"
        | "not_found"
        | "invalid_path"
        | "unknown";
      message?: string;
      missingSkills?: string[];
    };
    environmentStatus?: {
      cliInstalled: boolean;
      cliInstallType?: "global" | "project" | "npx";
      scenario?: string;
    };
    installCliGlobalResult?: {
      success: boolean;
      initialized?: boolean;
      error?: string;
    };
    installCliProjectResult?: {
      success: boolean;
      initialized?: boolean;
      error?: string;
    };
    /** 覆盖 exists 对 template 路径的默认 true 行为（优先级高于默认规则） */
    templateExistsOverride?: (path: string) => boolean | undefined;
    /** 追踪 processTemplateDirectory 的调用来源路径，返回 undefined 时使用默认空结果 */
    processTemplateDirectoryOverride?: (
      from: string,
    ) => { created: string[]; skipped: string[]; errors: string[] } | undefined;
  } = {},
) => {
  type PreflightMockResult =
    | { ok: true; category: "none" }
    | {
        ok: false;
        category:
          | "none"
          | "network"
          | "auth"
          | "not_found"
          | "invalid_path"
          | "unknown";
        message: string;
      }
    | {
        ok: false;
        category: "invalid_path";
        message: string;
        missingSkills: string[];
      };

  const requestedScenario = options.environmentStatus?.scenario;
  const mockScenario: ScenarioType =
    requestedScenario === "S1_NEW" ||
    requestedScenario === "S2_OPENSPEC_ONLY" ||
    requestedScenario === "S3_CLAUDE_ONLY" ||
    requestedScenario === "S4_BOTH_NON_SPECFORGE" ||
    requestedScenario === "S5_CONFIGURED" ||
    requestedScenario === "S6_PARTIAL"
      ? requestedScenario
      : "S2_OPENSPEC_ONLY";
  const baseEnvironmentStatus: EnvironmentStatus = {
    cliInstalled: options.environmentStatus?.cliInstalled ?? true,
    cliVersion: "1.2.0",
    cliInstallType: options.environmentStatus?.cliInstallType ?? "global",
    scenario: mockScenario,
    scenarioDescription: "mocked status",
    hasOpenspecDir: true,
    hasClaudeDir: true,
    hasSpecforgeMarker: true,
    specforgeConfig: {
      profile: "mock-profile",
      initializedAt: "2024-01-01T00:00:00.000Z",
      templateVersion: "1.0.0",
    },
    templateUpgradeAvailable: false,
    isConfigCorrupted: false,
    configErrors: [],
    missingSpecforgeSkills: [],
    missingSpecforgeAgents: [],
    missingManagedFiles: [],
    missingMcpServers: [],
    recommendedAction: "none",
  };

  const mockFs = FileSystem.layerNoop({
    exists: (path: string) => {
      if (options.templateExistsOverride) {
        const override = options.templateExistsOverride(path);
        if (override !== undefined) return Effect.succeed(override);
      }
      if (
        path.endsWith("/template-to-project") ||
        path.includes("/template-to-project/")
      ) {
        return Effect.succeed(true);
      }
      return Effect.succeed(files.has(path));
    },
    readFileString: (path: string) => {
      let content = files.get(path);
      if (content === undefined) {
        if (path.endsWith("/template-to-project/openspec/config.yaml")) {
          content = files.get("/template-to-project/openspec/config.yaml");
        } else if (
          path.endsWith("/template-to-project/profiles/.mcp.template.json")
        ) {
          content = files.get(
            "/template-to-project/profiles/.mcp.template.json",
          );
        }
      }
      return content !== undefined
        ? Effect.succeed(content)
        : Effect.fail(
            new SystemError({
              method: "readFileString",
              reason: "NotFound",
              module: "FileSystem",
              cause: undefined,
            }),
          );
    },
    writeFileString: (path: string, content: string) => {
      files.set(path, content);
      return Effect.succeed(undefined);
    },
    readDirectory: (_path: string) => Effect.succeed([]),
    makeDirectory: () => Effect.succeed(undefined),
    rename: () => Effect.succeed(undefined),
  });

  const mockProjectRepository = Layer.mock(ProjectRepository, {
    getProject: () =>
      Effect.succeed({
        project: {
          id: "test-project",
          claudeProjectPath: "/test/project",
          lastModifiedAt: new Date(),
          meta: {
            projectName: "test-project",
            projectPath: "/test/project",
            sessionCount: 0,
            isWorkspace: false,
          },
        },
      }),
  });

  const mockTemplateProcessor = Layer.mock(TemplateProcessor, {
    replaceVariables: (content: string) => content,
    processTemplate: (content: string) => Effect.succeed(content),
    processTemplateFile: () => Effect.succeed(undefined),
    processTemplateDirectory: (from: string) => {
      if (options.processTemplateDirectoryOverride) {
        const override = options.processTemplateDirectoryOverride(from);
        if (override !== undefined) return Effect.succeed(override);
      }
      return Effect.succeed({ created: [], skipped: [], errors: [] });
    },
  });

  const mockProfileConfigService = Layer.mock(ProfileConfigService, {
    generateTemplateVariables: () =>
      Effect.succeed({
        QUERYING_INFRA_RULE_LINE: "",
        DEVELOP_SKILLS_RULE_LINE: "",
      }),
    saveProjectProfileConfig: () => Effect.succeed(undefined),
    getAvailableProfiles: () => Effect.succeed({ profiles: [], warnings: [] }),
    getProjectProfileConfig: () => Effect.succeed(undefined),
    getBuiltInProfile: () => Effect.die("not implemented"),
  });

  const mockEnvironmentService = Layer.mock(OpenSpecEnvironmentService, {
    checkEnvironment: () => Effect.succeed(baseEnvironmentStatus),
    initializeOpenspec: () =>
      Effect.succeed({
        success: true,
        error: undefined,
        method: "global",
      }),
    installCliGlobal: () => {
      type CliInstallResult =
        | { success: false; error: string; initialized: false }
        | { success: true; error: undefined; initialized: boolean };
      const result = options.installCliGlobalResult ?? {
        success: true,
        initialized: false,
      };
      if (!result.success) {
        const failureResult: CliInstallResult = {
          success: false,
          error: result.error ?? "mock global install error",
          initialized: false,
        };
        return Effect.succeed(failureResult);
      }
      const successResult: CliInstallResult = {
        success: true,
        error: undefined,
        initialized: result.initialized ?? false,
      };
      return Effect.succeed(successResult);
    },
    installCliProject: () => {
      const result = options.installCliProjectResult ?? {
        success: true,
        initialized: false,
      };
      if (!result.success) {
        return Effect.succeed({
          success: false,
          error: result.error ?? "mock project install error",
          initialized: false,
        });
      }
      return Effect.succeed({
        success: true,
        error: undefined,
        initialized: result.initialized ?? false,
      });
    },
  });

  const mockSkillManagerService = Layer.mock(SkillManagerService, {
    installSkillsFromGit: () =>
      Effect.succeed(options.installSkillsFromGitResult ?? []),
    preflightSkillsFromGit: () => {
      const result = options.preflightSkillsFromGitResult;
      if (result) {
        if (result.ok) {
          const okResult: PreflightMockResult = { ok: true, category: "none" };
          return Effect.succeed(okResult);
        }
        if (result.category === "invalid_path" && result.missingSkills) {
          const invalidPathResult: PreflightMockResult = {
            ok: false,
            category: "invalid_path",
            message: result.message ?? "invalid path",
            missingSkills: result.missingSkills,
          };
          return Effect.succeed(invalidPathResult);
        }
        const failedResult: PreflightMockResult = {
          ok: false,
          category: result.category,
          message: result.message ?? "preflight failed",
        };
        return Effect.succeed(failedResult);
      }
      const defaultResult: PreflightMockResult = {
        ok: true,
        category: "none",
      };
      return Effect.succeed(defaultResult);
    },
  });

  return Layer.mergeAll(
    testPlatformLayer(),
    NodeContext.layer,
    mockFs,
    mockProjectRepository,
    mockTemplateProcessor,
    mockProfileConfigService,
    mockEnvironmentService,
    mockSkillManagerService,
  );
};

const defaultProfile: Profile = {
  displayName: "Default",
  infra_catalog: {
    mcp_server_providers: {},
    mcp_tool_definitions: {
      overview: { description: "", tools: [] },
      search: { description: "", tools: [] },
      specifications: { description: "", tools: [] },
    },
  },
};

describe("TemplateInjectionService - schema merge in S2/S4", () => {
  it("全局安装失败时应回退项目内安装（Windows 兼容）", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: {
        cliInstalled: false,
      },
      installCliGlobalResult: {
        success: false,
        error: "EACCES",
      },
      installCliProjectResult: {
        success: true,
      },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile: defaultProfile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
  });

  it("S2_OPENSPEC_ONLY 场景应强制将 schema 合并为 specforge-enhanced", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files);

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile: defaultProfile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    expect(result.updated).toContain("openspec/config.yaml");

    const mergedConfigContent = files.get("/test/project/openspec/config.yaml");
    expect(mergedConfigContent).toBeDefined();
    const parsed = YAML.parse(mergedConfigContent ?? "");
    expect(parsed.schema).toBe("specforge-enhanced");
  });

  it("mergeConfigYaml 应保持 context 为可读块样式并避免长行自动折行", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        `schema: specforge-enhanced
context: |
  格式合规审查 (IMPORTANT):
  - 调用时机：仅在阶段四文档生成完成后调用，阶段二、阶段三的迭代过程中不调用（文档仍在变化中）
  - 每个 artifact（proposal/design/tasks）在阶段四生成完成后，MUST 使用 Agent 工具启动 format-compliance-agent 进行格式合规审查
rules: {}
`,
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files);

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile: defaultProfile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);

    const mergedConfigContent = files.get("/test/project/openspec/config.yaml");
    expect(mergedConfigContent).toBeDefined();
    expect(mergedConfigContent).toContain("context: |");
    expect(mergedConfigContent).toContain(
      "MUST 使用 Agent 工具启动 format-compliance-agent 进行格式合规审查",
    );
  });

  it("仅配置 mcp_server 但未配置 tool 时应返回配置错误", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files);

    const profile: Profile = {
      displayName: "Custom",
      infra_catalog: {
        mcp_server_providers: {
          custom_server: {
            type: "http",
            url: "http://example.com/mcp",
          },
        },
        mcp_tool_definitions: {
          overview: { description: "", tools: [] },
          search: { description: "", tools: [] },
          specifications: { description: "", tools: [] },
        },
      },
    };

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.file === "profile-config")).toBe(true);
    expect(
      result.errors.some((e) => e.error.includes("mcp_server_providers")),
    ).toBe(true);
  });

  it("develop_skills 仅配置名称且本地不存在时应返回错误", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files);

    const profile: Profile = {
      displayName: "Custom",
      infra_catalog: {
        mcp_server_providers: {},
        mcp_tool_definitions: {
          overview: { description: "", tools: [] },
          search: { description: "", tools: [] },
          specifications: { description: "", tools: [] },
        },
        develop_skills: {
          description: "dev skills",
          skills: ["missing-skill"],
        },
      },
    };

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(false);
    expect(
      result.errors.some((e) => e.file === "develop-skills-preflight"),
    ).toBe(true);
    expect(result.errors.some((e) => e.error.includes("本地预检失败"))).toBe(
      true,
    );
  });

  it("develop_skills 配置 gitUrl 但安装结果缺失时应返回错误", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      installSkillsFromGitResult: [],
    });

    const profile: Profile = {
      displayName: "Custom",
      infra_catalog: {
        mcp_server_providers: {},
        mcp_tool_definitions: {
          overview: { description: "", tools: [] },
          search: { description: "", tools: [] },
          specifications: { description: "", tools: [] },
        },
        develop_skills: {
          description: "dev skills",
          gitUrl: "http://example.com/repo.git",
          skills: ["zx-h5-develop-experience"],
        },
      },
    };

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.file === "develop-skills")).toBe(true);
    expect(
      result.errors.some((e) =>
        e.error.includes("安装 develop_skills 失败或不完整"),
      ),
    ).toBe(true);
  });

  it("develop_skills 预检失败时应在初始化前阻断", async () => {
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: spec-driven\ncontext: user\nrules: {}\n",
      ],
      [
        "/template-to-project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: template\nrules: {}\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      preflightSkillsFromGitResult: {
        ok: false,
        category: "network",
        message: "connection timed out",
      },
    });

    const profile: Profile = {
      displayName: "Custom",
      infra_catalog: {
        mcp_server_providers: {},
        mcp_tool_definitions: {
          overview: { description: "", tools: [] },
          search: { description: "", tools: [] },
          specifications: { description: "", tools: [] },
        },
        develop_skills: {
          description: "dev skills",
          gitUrl: "http://example.com/repo.git",
          skills: ["zx-h5-develop-experience"],
        },
      },
    };

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S2_OPENSPEC_ONLY",
            profile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(false);
    expect(
      result.errors.some((e) => e.file === "develop-skills-preflight"),
    ).toBe(true);
    expect(result.created).not.toContain(
      "openspec/config.yaml (by openspec init)",
    );
  });
});

describe("TemplateInjectionService - 对账清理行为", () => {
  it("force 重初始化时应清理废弃 skill 并记录到 result.removed", async () => {
    const files = new Map<string, string>([
      // openspec init 防御性校验需要此文件存在
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      // 项目中存在废弃 skill 目录
      ["/test/project/.claude/skills", ""],
      ["/test/project/.claude/skills/design-generation", ""],
      ["/test/project/.claude/skills/ast-grep", ""],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S5_CONFIGURED" },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S5_CONFIGURED",
            profile: defaultProfile,
            force: true,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    expect(result.removed).toContain(".claude/skills/design-generation");
    expect(result.removed).toContain(".claude/skills/ast-grep");
  });

  it("force 重初始化时应清理不在活跃清单中的历史 skill", async () => {
    const files = new Map<string, string>([
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      // gitnexus 是当前活跃托管 skill（命名空间目录），不应被清理
      ["/test/project/.claude/skills", ""],
      ["/test/project/.claude/skills/gitnexus", ""],
      // gitnexus-exploring 是已废弃的历史 skill 目录，应被清理
      ["/test/project/.claude/skills/gitnexus-exploring", ""],
      // querying-infra-catalog 当前 profile 不开启，属于历史托管，应被清理
      ["/test/project/.claude/skills/querying-infra-catalog", ""],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S5_CONFIGURED" },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S5_CONFIGURED",
            profile: defaultProfile, // 无 MCP tools，所以 querying-infra-catalog 不在活跃清单
            force: true,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    // querying-infra-catalog 应被清理（不在无 MCP 配置的活跃清单中）
    expect(result.removed).toContain(".claude/skills/querying-infra-catalog");
    // gitnexus-exploring 是废弃 skill，应被清理
    expect(result.removed).toContain(".claude/skills/gitnexus-exploring");
    // gitnexus（新的命名空间目录）不应被清理（仍在活跃清单中）
    expect(result.removed).not.toContain(".claude/skills/gitnexus");
  });

  it("非 force 初始化时不应执行对账清理", async () => {
    const files = new Map<string, string>([
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      ["/test/project/.claude/skills", ""],
      ["/test/project/.claude/skills/design-generation", ""],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S3_CLAUDE_ONLY" },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S3_CLAUDE_ONLY",
            profile: defaultProfile,
            // 不传 force，默认 false
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    expect(result.removed).toHaveLength(0);
  });

  it("模板子目录不存在时不应清理任何项目 agent 或 openspec 文件", async () => {
    // 模拟打包/部署异常：template-to-project 本身存在，但 .claude/agents
    // 和 specforge-enhanced 子目录不存在，保守跳过，不误删项目文件
    const files = new Map<string, string>([
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      ["/test/project/.claude/agents/format-compliance-agent.md", "# agent"],
      ["/test/project/.claude/agents/quality-gate-agent.md", "# agent"],
      [
        "/test/project/openspec/schemas/specforge-enhanced/schema.yaml",
        "name: specforge-enhanced\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S5_CONFIGURED" },
      templateExistsOverride: (p: string) => {
        // 模拟模板的 .claude/agents 和 specforge-enhanced 子目录不存在
        if (p.includes("/template-to-project/.claude/agents")) return false;
        if (p.includes("/template-to-project/openspec/schemas/specforge"))
          return false;
        return undefined; // 其他路径走默认逻辑
      },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S5_CONFIGURED",
            profile: defaultProfile,
            force: true,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    // 模板子目录不存在时（保守跳过），不应清理项目中的文件
    expect(result.removed).not.toContain(
      ".claude/agents/format-compliance-agent.md",
    );
    expect(result.removed).not.toContain(
      ".claude/agents/quality-gate-agent.md",
    );
    expect(result.removed).not.toContain(
      "openspec/schemas/specforge-enhanced/schema.yaml",
    );
  });
});

describe("TemplateInjectionService - S5 完整流程与 agents 覆盖行为", () => {
  it("S5 非 force 场景应走完整注入流程，写入 specforge marker", async () => {
    const files = new Map<string, string>([
      // config.yaml 存在但没有 _specforge 标记
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S5_CONFIGURED" },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S5_CONFIGURED",
            profile: defaultProfile,
            // 不传 force，默认 false
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    // 完整注入流程会调用 injectSpecforgeMarker 更新 config.yaml
    // 如果是 early return，config.yaml 不会被修改
    const configContent = files.get("/test/project/openspec/config.yaml");
    expect(configContent).toContain("_specforge:");
  });

  it("非 force 场景下 agents 目录已存在时也应注入（与 skills 保持一致）", async () => {
    const calledFromPaths: string[] = [];
    const files = new Map<string, string>([
      ["/test/project/.claude/agents", ""], // agents 目录已存在
      ["/test/project/openspec/config.yaml", "schema: specforge-enhanced\n"],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S3_CLAUDE_ONLY" },
      processTemplateDirectoryOverride: (from) => {
        calledFromPaths.push(from);
        return undefined; // 继续使用默认空结果
      },
    });

    const result = await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S3_CLAUDE_ONLY",
            profile: defaultProfile,
            // 不传 force，默认 false
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(result.success).toBe(true);
    // 无论 agents 目录是否已存在，processTemplateDirectory 都应被以 agents 路径调用
    expect(calledFromPaths.some((p) => p.includes("/agents"))).toBe(true);
  });

  it("S5 场景 injectOpenspecDir 只调用 schemas 分支，不完整覆盖 openspec 目录", async () => {
    let reachedFullOpenspecInjection = false;
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: 用户定制内容\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S5_CONFIGURED" },
      processTemplateDirectoryOverride: (from) => {
        // 完整注入分支：from 以 template-to-project/openspec 结尾（不含 /schemas）
        if (
          from.endsWith("/template-to-project/openspec") ||
          from.endsWith("template-to-project\\openspec")
        ) {
          reachedFullOpenspecInjection = true;
        }
        return undefined;
      },
    });

    await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S5_CONFIGURED",
            profile: defaultProfile,
            force: true,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    // S5 走 schemas-only 分支：完整 openspec 目录不应被作为 from 传入
    expect(reachedFullOpenspecInjection).toBe(false);
  });

  it("S6 场景 injectOpenspecDir 只调用 schemas 分支，不完整覆盖 openspec 目录", async () => {
    let reachedFullOpenspecInjection = false;
    const files = new Map<string, string>([
      [
        "/test/project/openspec/config.yaml",
        "schema: specforge-enhanced\ncontext: 用户定制内容\n",
      ],
      ["/template-to-project/profiles/.mcp.template.json", '{"mcpServers":{}}'],
    ]);
    const dependencies = createTestDependencies(files, {
      environmentStatus: { cliInstalled: true, scenario: "S6_PARTIAL" },
      processTemplateDirectoryOverride: (from) => {
        if (
          from.endsWith("/template-to-project/openspec") ||
          from.endsWith("template-to-project\\openspec")
        ) {
          reachedFullOpenspecInjection = true;
        }
        return undefined;
      },
    });

    await Effect.runPromise(
      TemplateInjectionService.pipe(
        Effect.flatMap((service) =>
          service.injectTemplates("test-project", {
            scenario: "S6_PARTIAL",
            profile: defaultProfile,
          }),
        ),
        Effect.provide(TemplateInjectionService.Live),
        Effect.provide(dependencies),
      ),
    );

    expect(reachedFullOpenspecInjection).toBe(false);
  });
});
