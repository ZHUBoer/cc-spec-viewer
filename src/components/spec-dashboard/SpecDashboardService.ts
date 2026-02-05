import { hc } from "hono/client";
import type { RouteType } from "@/server/hono/route";

const client = hc<RouteType>("/");

export interface OpenSpecChange {
  name: string;
  status:
    | "draft"
    | "designing"
    | "design-confirmed"
    | "task-planning"
    | "implementing"
    | "completed"
    | "archived";
  description?: string;
  updatedAt: string;
  proposalContent?: string;
  // Details
  designContent?: string;
  tasksContent?: string;
  testsContent?: string;
  specsContent?: string;
  specFiles?: { name: string; content: string }[];
}

export const specDashboardService = {
  getChanges: async (projectId: string): Promise<OpenSpecChange[]> => {
    const res = await client.api.projects[":projectId"].openspec.changes.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch changes");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    return data;
  },

  getArchivedChanges: async (projectId: string): Promise<OpenSpecChange[]> => {
    const res = await client.api.projects[":projectId"].openspec.archive.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch archived changes");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    return data;
  },

  getChangeDetails: async (
    projectId: string,
    changeId: string,
  ): Promise<OpenSpecChange> => {
    const res = await client.api.projects[":projectId"].openspec.changes[
      ":changeId"
    ].$get({
      param: { projectId, changeId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch change details");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    // Backend now returns full details including status and content
    return data as OpenSpecChange;
  },

  updateChangeFile: async (
    projectId: string,
    changeId: string,
    fileName: string,
    content: string,
  ): Promise<void> => {
    const res = await client.api.projects[":projectId"].openspec.changes[
      ":changeId"
    ].file.$post({
      param: { projectId, changeId },
      json: { fileName, content },
    });

    if (!res.ok) {
      throw new Error("Failed to update file");
    }
  },

  // ============================================================================
  // OpenSpec 环境检测和初始化 API
  // ============================================================================

  /**
   * 获取项目环境状态
   */
  getEnvironment: async (projectId: string): Promise<EnvironmentStatus> => {
    const res = await client.api.projects[
      ":projectId"
    ].openspec.environment.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to check environment");
    }
    const data = await res.json();
    if ("error" in data) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error),
      );
    }
    return data as EnvironmentStatus;
  },

  /**
   * 获取可用的 Profile 列表
   */
  getProfiles: async (projectId: string): Promise<BuiltInProfile[]> => {
    const res = await client.api.projects[":projectId"].openspec.profiles.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to get profiles");
    }
    const data = await res.json();
    if ("error" in data) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error),
      );
    }
    return data as BuiltInProfile[];
  },

  /**
   * 执行 SpecForge 初始化
   */
  initialize: async (
    projectId: string,
    options: InitializeOptions,
  ): Promise<InjectionResult> => {
    const res = await client.api.projects[
      ":projectId"
    ].openspec.initialize.$post({
      param: { projectId },
      json: options,
    });
    if (!res.ok) {
      throw new Error("Failed to initialize SpecForge");
    }
    const data = await res.json();
    if ("error" in data) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error),
      );
    }
    return data as InjectionResult;
  },

  /**
   * 全局安装 OpenSpec CLI
   * @param initialize 是否同时执行 openspec init
   */
  installCliGlobal: async (
    projectId: string,
    initialize = true,
  ): Promise<InstallResult> => {
    const res = await client.api.projects[":projectId"].openspec[
      "install-cli"
    ].global.$post({
      param: { projectId },
      json: { initialize },
    });
    if (!res.ok) {
      throw new Error("Failed to install CLI globally");
    }
    const data = await res.json();
    if ("error" in data && typeof data.error === "string") {
      throw new Error(data.error);
    }
    return data as InstallResult;
  },

  /**
   * 项目级安装 OpenSpec CLI
   * @param initialize 是否同时执行 openspec init
   */
  installCliProject: async (
    projectId: string,
    initialize = true,
  ): Promise<InstallResult> => {
    const res = await client.api.projects[":projectId"].openspec[
      "install-cli"
    ].project.$post({
      param: { projectId },
      json: { initialize },
    });
    if (!res.ok) {
      throw new Error("Failed to install CLI in project");
    }
    const data = await res.json();
    if ("error" in data && typeof data.error === "string") {
      throw new Error(data.error);
    }
    return data as InstallResult;
  },

  /**
   * 执行 openspec init 命令
   * 适用于已安装 CLI 的情况
   */
  runOpenspecInit: async (projectId: string): Promise<OpenspecInitResult> => {
    const res = await client.api.projects[":projectId"].openspec[
      "run-init"
    ].$post({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to run openspec init");
    }
    const data = await res.json();
    if ("error" in data && typeof data.error === "string") {
      throw new Error(data.error);
    }
    return data as OpenspecInitResult;
  },
};

// ============================================================================
// Types for Environment Detection
// ============================================================================

export type ScenarioType =
  | "S1_NEW"
  | "S2_OPENSPEC_ONLY"
  | "S3_CLAUDE_ONLY"
  | "S4_BOTH_NON_SPECFORGE"
  | "S5_CONFIGURED"
  | "S6_PARTIAL";

export type RecommendedAction =
  | "full_init"
  | "incremental_inject"
  | "reconfigure"
  | "repair"
  | "none";

export interface EnvironmentStatus {
  cliInstalled: boolean;
  cliVersion: string | null;
  cliInstallType: "global" | "project" | "npx" | null;
  scenario: ScenarioType;
  scenarioDescription: string;
  hasOpenspecDir: boolean;
  hasClaudeDir: boolean;
  hasSpecforgeMarker: boolean;
  specforgeConfig: {
    version: string;
    profile: string;
    initializedAt: string;
  } | null;
  missingSpecforgeSkills: string[];
  missingMcpServers: string[];
  recommendedAction: RecommendedAction;
}

export interface McpServerConfig {
  type: "http" | "sse" | "stdio";
  url?: string;
  command?: string;
  args?: string[];
}

export interface ProfileInfraCatalog {
  mcp_server_providers: Record<string, McpServerConfig>;
  mcp_tool_definitions: {
    overview: { description: string; tools: string[] };
    search: { description: string; tools: string[] };
    specifications: { description: string; tools: string[] };
  };
  skills?: string[];
  develop_skills?: {
    description: string;
    skills: string[];
  };
  code_examples?: {
    examples: Array<{
      name: string;
      description?: string;
      paths: string[];
    }>;
  };
}

export interface BuiltInProfile {
  id: string;
  displayName: string;
  description: string;
  infra_catalog: ProfileInfraCatalog;
}

export interface InitializeOptions {
  scenario: ScenarioType;
  profile: {
    displayName: string;
    description: string;
    infra_catalog: ProfileInfraCatalog;
  };
}

export interface InjectionResult {
  success: boolean;
  created: string[];
  skipped: string[];
  updated: string[];
  errors: Array<{ file: string; error: string }>;
}

export interface InstallResult {
  success: boolean;
  error?: string;
  initialized?: boolean;
}

export interface OpenspecInitResult {
  success: boolean;
  error?: string;
  method?: "global" | "npx" | null;
}
