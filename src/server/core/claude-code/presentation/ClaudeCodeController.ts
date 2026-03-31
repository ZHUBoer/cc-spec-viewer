import { FileSystem, Path } from "@effect/platform";
import { Cause, Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { ApplicationContext } from "../../platform/services/ApplicationContext";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import {
  type CommandInfo,
  scanCommandFilesWithMetadata,
  scanSkillFilesWithMetadata,
} from "../functions/scanCommandFiles";
import * as ClaudeCodeVersion from "../models/ClaudeCodeVersion";
import { AdaModelService } from "../services/AdaModelService";
import { ClaudeCodeService } from "../services/ClaudeCodeService";
import { ClaudeCodeSessionProcessService } from "../services/ClaudeCodeSessionProcessService";

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeService = yield* ClaudeCodeService;
  const adaModelService = yield* AdaModelService;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const context = yield* ApplicationContext;
  // FileSystem and Path are required by scanCommandFilesRecursively
  yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  // biome-ignore lint/style/noProcessEnv: dev-only diagnostics toggle for local debugging
  const isDevelopment = process.env.NODE_ENV === "development";
  const causePayload = (cause: Cause.Cause<unknown>) =>
    isDevelopment ? { cause: Cause.pretty(cause) } : {};
  const isAdaCliMissingCause = (cause: Cause.Cause<unknown>) => {
    const prettyCause = Cause.pretty(cause).toLowerCase();
    return (
      prettyCause.includes("spawn ada enoent") ||
      prettyCause.includes("failed to execute ada model")
    );
  };

  const getClaudeCommands = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;

      const { project } = yield* projectRepository.getProject(projectId);
      const features = yield* claudeCodeService.getAvailableFeatures();

      const globalCommands: CommandInfo[] = yield* scanCommandFilesWithMetadata(
        (yield* context.claudeCodePaths).claudeCommandsDirPath,
      );

      const projectCommands: CommandInfo[] =
        project.meta.projectPath === null
          ? []
          : yield* scanCommandFilesWithMetadata(
              path.resolve(project.meta.projectPath, ".claude", "commands"),
            );

      const globalSkills: CommandInfo[] = features.runSkillsDirectly
        ? yield* scanSkillFilesWithMetadata(
            (yield* context.claudeCodePaths).claudeSkillsDirPath,
          )
        : [];

      const projectSkills: CommandInfo[] =
        features.runSkillsDirectly && project.meta.projectPath !== null
          ? yield* scanSkillFilesWithMetadata(
              path.resolve(project.meta.projectPath, ".claude", "skills"),
            )
          : [];

      const defaultCommands: CommandInfo[] = [
        {
          name: "init",
          description: "Initialize Claude Code in current project",
          argumentHint: null,
        },
        {
          name: "compact",
          description: "Compact conversation history",
          argumentHint: null,
        },
        {
          name: "security-review",
          description: "Review code for security issues",
          argumentHint: null,
        },
        {
          name: "review",
          description: "Review code changes",
          argumentHint: null,
        },
      ];

      // Helper to extract command names for backward compatibility
      const toNames = (commands: CommandInfo[]) => commands.map((c) => c.name);

      return {
        response: {
          // New format: CommandInfo[] with metadata
          globalCommands,
          projectCommands,
          globalSkills,
          projectSkills,
          defaultCommands,
          // Legacy format: string[] for backward compatibility
          globalCommandsLegacy: toNames(globalCommands),
          projectCommandsLegacy: toNames(projectCommands),
          globalSkillsLegacy: toNames(globalSkills),
          projectSkillsLegacy: toNames(projectSkills),
          defaultCommandsLegacy: toNames(defaultCommands),
        },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getMcpListRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;
      const servers = yield* claudeCodeService.getMcpList(projectId);
      return {
        response: { servers },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getMcpConfigRoute = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;
      const { content, configPath } =
        yield* claudeCodeService.getMcpConfig(projectId);
      return {
        response: { content, configPath },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const saveMcpConfigRoute = (options: {
    projectId: string;
    content: string;
  }) =>
    Effect.gen(function* () {
      const { projectId, content } = options;
      const { configPath } = yield* claudeCodeService.saveMcpConfig(
        projectId,
        content,
      );
      return {
        response: { configPath, success: true },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getClaudeCodeMeta = () =>
    Effect.gen(function* () {
      const config = yield* claudeCodeService.getClaudeCodeMeta();
      return {
        response: {
          executablePath: config.claudeCodeExecutablePath,
          version: config.claudeCodeVersion
            ? ClaudeCodeVersion.versionText(config.claudeCodeVersion)
            : null,
        },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getAvailableFeatures = () =>
    Effect.gen(function* () {
      const features = yield* claudeCodeService.getAvailableFeatures();
      const featuresList = Object.entries(features).flatMap(([key, value]) => {
        return [
          {
            name: key as keyof typeof features,
            enabled: value,
          },
        ];
      });

      return {
        response: { features: featuresList },
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const getAdaModels = () =>
    Effect.gen(function* () {
      const result = yield* adaModelService.listModels().pipe(
        Effect.catchAllCause((cause) =>
          Effect.succeed(
            isAdaCliMissingCause(cause)
              ? {
                  models: [],
                  currentIndex: null,
                  currentLabel: null,
                  switchSupported: false,
                  unsupportedReason: null,
                  error: "Ada CLI is not installed",
                  code: "MODEL_SWITCH_ADA_CLI_MISSING" as const,
                  ...causePayload(cause),
                }
              : {
                  models: [],
                  currentIndex: null,
                  currentLabel: null,
                  switchSupported: true,
                  unsupportedReason: null,
                  error: "Failed to read ada model output",
                  ...causePayload(cause),
                },
          ),
        ),
      );
      return {
        response: result,
        status: 200,
      } as const satisfies ControllerResponse;
    });

  const switchAdaModel = (options: { targetIndex: number }) =>
    Effect.gen(function* () {
      const processes = yield* sessionProcessService.getSessionProcesses();
      const hasRunningProcess = processes.some(
        (process) => process.type !== "paused" && process.type !== "completed",
      );

      if (hasRunningProcess) {
        return {
          response: {
            error: "Model switch is blocked while session process is running",
          },
          status: 409 as const,
        } as const satisfies ControllerResponse;
      }

      const result = yield* adaModelService
        .switchModel(options.targetIndex)
        .pipe(
          Effect.catchAllCause((cause) =>
            Effect.succeed(
              Cause.pretty(cause).includes("AdaModelUnsupportedModeError")
                ? {
                    error:
                      "Model switch is available only in team mode (unsupported in custom API key mode)",
                    code: "MODEL_SWITCH_UNSUPPORTED_MODE",
                  }
                : {
                    error: "Failed to switch model via ada model",
                    ...causePayload(cause),
                  },
            ),
          ),
        );

      if ("code" in result && result.code === "MODEL_SWITCH_UNSUPPORTED_MODE") {
        return {
          response: result,
          status: 422 as const,
        } as const satisfies ControllerResponse;
      }

      if ("error" in result) {
        return {
          response: result,
          status: 502 as const,
        } as const satisfies ControllerResponse;
      }

      return {
        response: result,
        status: 200 as const,
      } as const satisfies ControllerResponse;
    });

  return {
    getClaudeCommands,
    getMcpListRoute,
    getMcpConfigRoute,
    saveMcpConfigRoute,
    getClaudeCodeMeta,
    getAvailableFeatures,
    getAdaModels,
    switchAdaModel,
  };
});

export type IClaudeCodeController = InferEffect<typeof LayerImpl>;
export class ClaudeCodeController extends Context.Tag("ClaudeCodeController")<
  ClaudeCodeController,
  IClaudeCodeController
>() {
  static Live = Layer.effect(this, LayerImpl);
}
