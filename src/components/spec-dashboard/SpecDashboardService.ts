import { hc } from "hono/client";
import type { z } from "zod";
import type { OpenSpecChangeDetails } from "@/server/core/openspec/services/OpenSpecService";
import type { RouteType } from "@/server/hono/route";
import {
  type BuiltInProfileSchema,
  EnvironmentStatusSchema,
  InjectionResultSchema,
  InstallResultSchema,
  OpenSpecChangeSchema,
  OpenspecInitResultSchema,
  ProfileLoadResultSchema,
  ProjectProfileConfigSchema,
} from "./schemas";

const client = hc<RouteType>("/");

// 类型导出
export type BuiltInProfile = z.infer<typeof BuiltInProfileSchema>;
export type EnvironmentStatus = z.infer<typeof EnvironmentStatusSchema>;
export type InjectionResult = z.infer<typeof InjectionResultSchema>;
export type ProfileLoadWarning = z.infer<
  typeof ProfileLoadResultSchema
>["warnings"][number];
export type ProfileLoadResult = z.infer<typeof ProfileLoadResultSchema>;

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
  specContent?: string;
  proposalContent?: string;
  // Details
  designContent?: string;
  tasksContent?: string;
  testsContent?: string;
  specsContent?: string;
  specFiles?: { name: string; content: string }[];
  d2c?: OpenSpecChangeDetails["d2c"];
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
    // 使用 Zod 验证
    return OpenSpecChangeSchema.parse(data);
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
    // 使用 Zod 验证
    return EnvironmentStatusSchema.parse(data);
  },

  /**
   * 获取可用的 Profile 列表
   */
  getProfiles: async (projectId: string): Promise<ProfileLoadResult> => {
    const res = await client.api.projects[":projectId"].openspec.profiles.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error(`加载 Profile 失败: HTTP ${res.status}`);
    }
    const data = await res.json();

    // 检查是否有错误响应
    if ("error" in data) {
      const errorMsg = typeof data.error === "string" ? data.error : "未知错误";
      const details =
        "details" in data && typeof data.details === "string"
          ? ` - ${data.details}`
          : "";
      throw new Error(`${errorMsg}${details}`);
    }

    // 使用 Zod 验证返回的数据结构
    return ProfileLoadResultSchema.parse(data);
  },

  /**
   * 获取当前项目已保存的 Profile 配置
   */
  getProjectProfileConfig: async (
    projectId: string,
  ): Promise<ProjectProfileConfig | null> => {
    const res = await client.api.projects[":projectId"].openspec[
      "profile-config"
    ].$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to get project profile config");
    }
    const data = await res.json();
    if ("error" in data) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error),
      );
    }
    if (!("profile" in data) || data.profile === null) {
      return null;
    }
    return ProjectProfileConfigSchema.parse(data.profile);
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
    // 使用 Zod 验证
    return InjectionResultSchema.parse(data);
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
    // 使用 Zod 验证
    return InstallResultSchema.parse(data);
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
    // 使用 Zod 验证
    return InstallResultSchema.parse(data);
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
    // 使用 Zod 验证
    return OpenspecInitResultSchema.parse(data);
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

export interface InitializeOptions {
  scenario: ScenarioType;
  force?: boolean;
  profile: {
    displayName: string;
    custom_variables?: Record<string, string>;
    infra_catalog: z.infer<typeof BuiltInProfileSchema>["infra_catalog"];
  };
}

export type ProjectProfileConfig = z.infer<typeof ProjectProfileConfigSchema>;
export type InstallResult = z.infer<typeof InstallResultSchema>;
export type OpenspecInitResult = z.infer<typeof OpenspecInitResultSchema>;
