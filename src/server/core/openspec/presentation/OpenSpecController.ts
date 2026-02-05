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

const LayerImpl = Effect.gen(function* () {
  const openSpecService = yield* OpenSpecService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const profileConfigService = yield* ProfileConfigService;
  const templateInjectionService = yield* TemplateInjectionService;
  const projectRepository = yield* ProjectRepository;

  const getChangesRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;

      try {
        const changes = yield* openSpecService.getChanges(projectId);
        return {
          response: changes,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec getChanges error:", error);
        // Handle Tagged Errors specifically if needed, for now generic 500
        return {
          response: { error: "Failed to list OpenSpec changes" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  const getChangeDetailsRoute = (options: {
    projectId: string;
    changeId: string;
  }) =>
    Effect.gen(function* () {
      const { projectId, changeId } = options;

      try {
        const details = yield* openSpecService.getChangeDetails(
          projectId,
          changeId,
        );
        return {
          response: details,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec getChangeDetails error:", error);
        return {
          response: { error: "Failed to get change details" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  const getArchivedChangesRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;

      try {
        const changes = yield* openSpecService.getArchivedChanges(projectId);
        return {
          response: changes,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec getArchivedChanges error:", error);
        return {
          response: { error: "Failed to list OpenSpec archived changes" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  const updateFileRoute = (options: {
    projectId: string;
    changeId: string;
    fileName: string;
    content: string;
  }) =>
    Effect.gen(function* () {
      const { projectId, changeId, fileName, content } = options;

      try {
        yield* openSpecService.updateChangeFile(
          projectId,
          changeId,
          fileName,
          content,
        );
        return {
          response: { success: true },
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec updateFile error:", error);
        return {
          response: { error: "Failed to update file" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  // ============================================================================
  // 新增: 环境检测相关 API
  // ============================================================================

  /**
   * 获取项目环境状态
   * GET /api/projects/:projectId/openspec/environment
   */
  const getEnvironmentRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;

      try {
        const status = yield* environmentService.checkEnvironment(projectId);
        return {
          response: status,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec getEnvironment error:", error);
        return {
          response: { error: "Failed to check environment" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  /**
   * 获取可用的 Profile 列表
   * GET /api/projects/:projectId/openspec/profiles
   */
  const getProfilesRoute = (_options: { projectId: string }) =>
    Effect.gen(function* () {
      try {
        const profiles = yield* profileConfigService.getAvailableProfiles();
        return {
          response: profiles,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec getProfiles error:", error);
        return {
          response: { error: "Failed to get profiles" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  /**
   * 执行 SpecForge 初始化/注入
   * POST /api/projects/:projectId/openspec/initialize
   */
  const initializeRoute = (options: {
    projectId: string;
    scenario: ScenarioType;
    profile: Profile;
  }) =>
    Effect.gen(function* () {
      const { projectId, scenario, profile } = options;

      try {
        const result = yield* templateInjectionService.injectTemplates(
          projectId,
          {
            scenario,
            profile,
            skipUserFiles: true,
          },
        );
        return {
          response: result,
          status: 200,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec initialize error:", error);
        return {
          response: { error: "Failed to initialize SpecForge" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

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

      try {
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
      } catch (error) {
        console.error("OpenSpec installCliGlobal error:", error);
        return {
          response: { error: "Failed to install CLI" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

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

      try {
        const result = yield* environmentService.installCliProject(projectId, {
          initialize,
        });
        return {
          response: result,
          status: result.success ? 200 : 500,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec installCliProject error:", error);
        return {
          response: { error: "Failed to install CLI" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  /**
   * 执行 openspec init 命令
   * POST /api/projects/:projectId/openspec/run-init
   */
  const runOpenspecInitRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;

      try {
        const result = yield* environmentService.initializeOpenspec(projectId);
        return {
          response: result,
          status: result.success ? 200 : 500,
        } as const satisfies ControllerResponse;
      } catch (error) {
        console.error("OpenSpec runOpenspecInit error:", error);
        return {
          response: { error: "Failed to run openspec init" },
          status: 500,
        } as const satisfies ControllerResponse;
      }
    });

  return {
    getChangesRoute,
    getArchivedChangesRoute,
    getChangeDetailsRoute,
    updateFileRoute,
    // 新增 API
    getEnvironmentRoute,
    getProfilesRoute,
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
