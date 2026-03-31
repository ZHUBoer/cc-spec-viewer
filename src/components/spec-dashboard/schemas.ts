import { z } from "zod";

const D2CArtifactFileSchema = z.object({
  name: z.string(),
  content: z.string(),
});

const D2CMaterialSchema = z.object({
  link: z.string(),
  description: z.string().optional(),
  scope: z.enum(["page", "module", "component", "unknown"]),
  artifactId: z.string().optional(),
});

const D2CInfoSchema = z.object({
  enabled: z.boolean(),
  changeKind: z.enum(["new", "modify", "unknown"]),
  materials: z.array(D2CMaterialSchema),
  targetScope: z.enum(["page", "module", "component", "unknown"]),
  baselineFrozen: z.boolean(),
  baselineFrozenAt: z.string().optional(),
  reviewOverride: z.boolean(),
  reviewOverrideAt: z.string().optional(),
  reviewOverrideReason: z.string().optional(),
  reviewStatus: z.enum(["passed", "failed", "unknown"]),
  canEnterDesign: z.boolean(),
  effectiveCanEnterDesign: z.boolean(),
  reviewSummary: z.string().optional(),
  generatedAt: z.string().optional(),
  generator: z.string().optional(),
  previewPath: z.string().optional(),
  reviewPath: z.string().optional(),
  entryFiles: z.array(z.string()),
  hasManifest: z.boolean(),
  hasGeneratedFiles: z.boolean(),
  generatedFiles: z.array(D2CArtifactFileSchema),
  previewFiles: z.array(D2CArtifactFileSchema),
});

/**
 * OpenSpecChange Schema
 */
export const OpenSpecChangeSchema = z.object({
  name: z.string(),
  status: z.enum([
    "draft",
    "designing",
    "design-confirmed",
    "task-planning",
    "implementing",
    "completed",
    "archived",
  ]),
  description: z.string().optional(),
  updatedAt: z.string(),
  specContent: z.string().optional(),
  proposalContent: z.string().optional(),
  designContent: z.string().optional(),
  tasksContent: z.string().optional(),
  testsContent: z.string().optional(),
  specsContent: z.string().optional(),
  specFiles: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
  d2c: D2CInfoSchema.optional(),
});

/**
 * EnvironmentStatus Schema
 */
export const EnvironmentStatusSchema = z.object({
  cliInstalled: z.boolean(),
  // 兼容历史/异常响应缺失 cliVersion 的情况，统一归一化为 null
  cliVersion: z.string().nullable().optional().default(null),
  cliInstallType: z.enum(["global", "project", "npx"]).nullish(),
  scenario: z.enum([
    "S1_NEW",
    "S2_OPENSPEC_ONLY",
    "S3_CLAUDE_ONLY",
    "S4_BOTH_NON_SPECFORGE",
    "S5_CONFIGURED",
    "S6_PARTIAL",
  ]),
  scenarioDescription: z.string(),
  hasOpenspecDir: z.boolean(),
  hasClaudeDir: z.boolean(),
  hasSpecforgeMarker: z.boolean(),
  specforgeConfig: z
    .object({
      profile: z.string(),
      initializedAt: z.string(),
      templateVersion: z.string().optional(),
    })
    .nullish(), // 允许 null、undefined 或字段缺失
  templateUpgradeAvailable: z.boolean().default(false),
  isConfigCorrupted: z.boolean(), // 配置是否损坏
  configErrors: z.array(z.string()), // 配置错误列表
  missingSpecforgeSkills: z.array(z.string()),
  missingSpecforgeAgents: z.array(z.string()).default([]),
  missingManagedFiles: z.array(z.string()).default([]),
  missingMcpServers: z.array(z.string()),
  recommendedAction: z.enum([
    "full_init",
    "incremental_inject",
    "reconfigure",
    "repair",
    "none",
  ]),
});

/**
 * McpServerConfig Schema
 */
export const McpServerConfigSchema = z.object({
  type: z.enum(["http", "sse", "stdio"]),
  url: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
});

/**
 * ProfileInfraCatalog Schema
 */
export const ProfileInfraCatalogSchema = z.object({
  mcp_server_providers: z.record(z.string(), McpServerConfigSchema),
  mcp_tool_definitions: z.object({
    overview: z.object({
      description: z.string(),
      tools: z.array(z.string()),
    }),
    search: z.object({
      description: z.string(),
      tools: z.array(z.string()),
    }),
    specifications: z.object({
      description: z.string(),
      tools: z.array(z.string()),
    }),
  }),
  skills: z.array(z.string()).optional(),
  develop_skills: z
    .object({
      description: z.string(),
      gitUrl: z.string().optional(),
      skills: z.array(z.string()),
    })
    .optional(),
  code_examples: z
    .object({
      examples: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          paths: z.array(z.string()),
        }),
      ),
    })
    .optional(),
});

/**
 * BuiltInProfile Schema
 */
export const BuiltInProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  custom_variables: z.record(z.string(), z.string()).optional(),
  infra_catalog: ProfileInfraCatalogSchema,
});

/**
 * ProjectProfileConfig Schema（项目已保存的 Profile 配置）
 */
export const ProjectProfileConfigSchema = z.object({
  displayName: z.string(),
  custom_variables: z.record(z.string(), z.string()).optional(),
  infra_catalog: ProfileInfraCatalogSchema,
});

/**
 * ProfileLoadWarning Schema
 */
export const ProfileLoadWarningSchema = z.object({
  file: z.string(),
  reason: z.string(),
});

/**
 * ProfileLoadResult Schema
 */
export const ProfileLoadResultSchema = z.object({
  profiles: z.array(BuiltInProfileSchema),
  warnings: z.array(ProfileLoadWarningSchema),
});

/**
 * InjectionResult Schema
 */
export const InjectionResultSchema = z.object({
  success: z.boolean(),
  created: z.array(z.string()),
  skipped: z.array(z.string()),
  updated: z.array(z.string()),
  removed: z.array(z.string()).default([]),
  errors: z.array(
    z.object({
      file: z.string(),
      error: z.string(),
    }),
  ),
  warnings: z
    .array(
      z.object({
        file: z.string(),
        message: z.string(),
      }),
    )
    .default([]),
});

/**
 * InstallResult Schema
 */
export const InstallResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  initialized: z.boolean().optional(),
});

/**
 * OpenspecInitResult Schema
 */
export const OpenspecInitResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  method: z.enum(["global", "npx"]).nullable().optional(),
});
