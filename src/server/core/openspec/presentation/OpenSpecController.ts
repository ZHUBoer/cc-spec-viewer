import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import type { ScenarioType } from "../services/OpenSpecEnvironmentService";
import { OpenSpecEnvironmentService } from "../services/OpenSpecEnvironmentService";
import { OpenSpecService } from "../services/OpenSpecService";
import {
  type Profile,
  ProfileConfigService,
} from "../services/ProfileConfigService";
import { TemplateInjectionService } from "../services/TemplateInjectionService";

/**
 * 通用 Effect 错误兜底，将未处理的 Effect 失败转为 500 响应。
 * 使用 Effect.catchAll 而非 try/catch，确保 Effect 错误通道的失败被正确捕获。
 */
const catchAsServerError = (errorMessage: string) =>
  Effect.catchAll((error: unknown) => {
    console.error(`${errorMessage}:`, error);
    return Effect.succeed({
      response: { error: errorMessage },
      status: 500,
    } as const satisfies ControllerResponse);
  });

const LayerImpl = Effect.gen(function* () {
  const openSpecService = yield* OpenSpecService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const profileConfigService = yield* ProfileConfigService;
  const templateInjectionService = yield* TemplateInjectionService;
  const projectRepository = yield* ProjectRepository;

  const getChangesRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const changes = yield* openSpecService.getChanges(options.projectId);
      return {
        response: changes,
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to list OpenSpec changes"));

  const getChangeDetailsRoute = (options: {
    projectId: string;
    changeId: string;
  }) =>
    Effect.gen(function* () {
      const details = yield* openSpecService.getChangeDetails(
        options.projectId,
        options.changeId,
      );
      return {
        response: details,
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to get change details"));

  const getArchivedChangesRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const changes = yield* openSpecService.getArchivedChanges(
        options.projectId,
      );
      return {
        response: changes,
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to list OpenSpec archived changes"));

  const updateFileRoute = (options: {
    projectId: string;
    changeId: string;
    fileName: string;
    content: string;
  }) =>
    Effect.gen(function* () {
      yield* openSpecService.updateChangeFile(
        options.projectId,
        options.changeId,
        options.fileName,
        options.content,
      );
      return {
        response: { success: true },
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to update file"));

  // ============================================================================
  // 环境检测相关 API
  // ============================================================================

  /**
   * 获取项目环境状态
   * GET /api/projects/:projectId/openspec/environment
   */
  const getEnvironmentRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const status = yield* environmentService.checkEnvironment(
        options.projectId,
      );
      return {
        response: status,
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to check environment"));

  /**
   * 获取可用的 Profile 列表
   * GET /api/projects/:projectId/openspec/profiles
   */
  const getProfilesRoute = (_options: { projectId: string }) =>
    Effect.gen(function* () {
      const result = yield* Effect.either(
        profileConfigService.getAvailableProfiles(),
      );

      if (result._tag === "Left") {
        const error = result.left;
        return {
          response: {
            error: "Failed to get profiles",
            details: String(error),
            type: error._tag || "UnknownError",
          },
          status: 500,
        } as const satisfies ControllerResponse;
      }

      // 成功情况：返回 profiles 和 warnings
      const { profiles, warnings } = result.right;
      return {
        response: { profiles, warnings },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  /**
   * 执行 SpecForge 初始化/注入
   * POST /api/projects/:projectId/openspec/initialize
   */
  const initializeRoute = (options: {
    projectId: string;
    scenario: ScenarioType;
    profile: Profile;
    force?: boolean;
  }) =>
    Effect.gen(function* () {
      const { projectId, scenario, profile, force } = options;
      const result = yield* templateInjectionService.injectTemplates(
        projectId,
        {
          scenario,
          profile,
          skipUserFiles: true,
          force,
        },
      );
      return {
        response: result,
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to initialize SpecForge"));

  /**
   * 安装 OpenSpec CLI（全局）
   * POST /api/projects/:projectId/openspec/install-cli/global
   */
  const installCliGlobalRoute = (options: {
    projectId: string;
    initialize?: boolean;
  }) =>
    Effect.gen(function* () {
      const { projectId, initialize } = options;
      // 获取项目路径用于初始化
      let projectPath: string | undefined;
      if (initialize) {
        const { project } = yield* projectRepository.getProject(projectId);
        projectPath = project.meta.projectPath ?? undefined;
      }

      const result = yield* environmentService.installCliGlobal({
        initialize,
        projectPath,
      });
      return {
        response: result,
        status: result.success ? 200 : 500,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to install CLI"));

  /**
   * 安装 OpenSpec CLI（项目依赖）
   * POST /api/projects/:projectId/openspec/install-cli/project
   */
  const installCliProjectRoute = (options: {
    projectId: string;
    initialize?: boolean;
  }) =>
    Effect.gen(function* () {
      const { projectId, initialize } = options;
      const result = yield* environmentService.installCliProject(projectId, {
        initialize,
      });
      return {
        response: result,
        status: result.success ? 200 : 500,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to install CLI"));

  /**
   * 执行 openspec init 命令
   * POST /api/projects/:projectId/openspec/run-init
   */
  const runOpenspecInitRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const result = yield* environmentService.initializeOpenspec(
        options.projectId,
      );
      return {
        response: result,
        status: result.success ? 200 : 500,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to run openspec init"));

  /**
   * 获取当前项目已保存的 Profile 配置
   * GET /api/projects/:projectId/openspec/profile-config
   */
  const getProjectProfileRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const config = yield* profileConfigService.getProjectProfileConfig(
        options.projectId,
      );
      return {
        response: { profile: config ?? null },
        status: 200,
      } as const satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to get project profile config"));

  return {
    getChangesRoute,
    getArchivedChangesRoute,
    getChangeDetailsRoute,
    updateFileRoute,
    getEnvironmentRoute,
    getProfilesRoute,
    getProjectProfileRoute,
    initializeRoute,
    installCliGlobalRoute,
    installCliProjectRoute,
    runOpenspecInitRoute,
  };
});

export type IOpenSpecController = InferEffect<typeof LayerImpl>;
export class OpenSpecController extends Context.Tag("OpenSpecController")<
  OpenSpecController,
  IOpenSpecController
>() {
  static Live = Layer.effect(this, LayerImpl);
}
