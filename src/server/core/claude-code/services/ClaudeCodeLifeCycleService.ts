import type {
  SDKMessage,
  SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import type { FileSystem, Path } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer, Runtime } from "effect";
import { ulid } from "ulid";
import { controllablePromise } from "../../../../lib/controllablePromise";
import { buildSessionDisplayMeta } from "../../../../lib/session-display";
import type { UserConfig } from "../../../lib/config/config";
import type { InferEffect } from "../../../lib/effect/types";
import { EventBus } from "../../events/services/EventBus";
import type { CcvOptionsService } from "../../platform/services/CcvOptionsService";
import type { EnvService } from "../../platform/services/EnvService";
import type { UserConfigService } from "../../platform/services/UserConfigService";
import {
  countVisibleConversations,
  getFirstVisibleUserMessage,
} from "../../session/functions/getVisibleSessionMeta";
import { SessionRepository } from "../../session/infrastructure/SessionRepository";
import { VirtualConversationDatabase } from "../../session/infrastructure/VirtualConversationDatabase";
import { SessionLiveDisplayService } from "../../session/services/SessionLiveDisplayService";
import type { SessionMetaService } from "../../session/services/SessionMetaService";
import {
  createMessageGenerator,
  type UserMessageInput,
} from "../functions/createMessageGenerator";
import { readClaudeSettingsEnv } from "../functions/readClaudeSettingsEnv";
import * as CCSessionProcess from "../models/CCSessionProcess";
import * as ClaudeCode from "../models/ClaudeCode";
import { ClaudeCodePermissionService } from "./ClaudeCodePermissionService";
import { ClaudeCodeSessionProcessService } from "./ClaudeCodeSessionProcessService";

export type MessageGenerator = () => AsyncGenerator<
  SDKUserMessage,
  void,
  unknown
>;

const LayerImpl = Effect.gen(function* () {
  const eventBusService = yield* EventBus;
  const sessionRepository = yield* SessionRepository;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const sessionLiveDisplayService = yield* SessionLiveDisplayService;
  const permissionService = yield* ClaudeCodePermissionService;

  const runtime = yield* Effect.runtime<
    | FileSystem.FileSystem
    | Path.Path
    | CommandExecutor
    | VirtualConversationDatabase
    | SessionLiveDisplayService
    | SessionMetaService
    | ClaudeCodePermissionService
    | EnvService
    | CcvOptionsService
    | UserConfigService
  >();

  const snapshotLiveDisplay = (options: {
    projectId: string;
    sessionId: string;
  }) =>
    Effect.gen(function* () {
      const sessionSnapshot = yield* sessionRepository.getSession(
        options.projectId,
        options.sessionId,
      );

      if (sessionSnapshot.session !== null) {
        return {
          projectId: options.projectId,
          sessionId: options.sessionId,
          displayMeta: sessionSnapshot.session.displayMeta,
          firstUserMessage: sessionSnapshot.session.meta.firstUserMessage,
        };
      }

      const virtualConversation =
        yield* virtualConversationDatabase.getSessionVirtualConversation(
          options.sessionId,
        );

      if (virtualConversation === null) {
        return null;
      }

      const firstUserMessage = getFirstVisibleUserMessage(
        virtualConversation.conversations,
      );

      return {
        projectId: options.projectId,
        sessionId: options.sessionId,
        displayMeta: buildSessionDisplayMeta({
          sessionId: options.sessionId,
          firstUserMessage,
          visibleMessageCount:
            countVisibleConversations(virtualConversation.conversations) + 1,
        }),
        firstUserMessage,
      };
    });

  const continueTask = (options: {
    sessionProcessId: string;
    baseSessionId: string;
    input: UserMessageInput;
  }) => {
    const { sessionProcessId, baseSessionId, input } = options;

    return Effect.gen(function* () {
      const { sessionProcess, task } =
        yield* sessionProcessService.continueSessionProcess({
          sessionProcessId,
          taskDef: {
            type: "continue",
            sessionId: baseSessionId,
            baseSessionId: baseSessionId,
            taskId: ulid(),
          },
        });

      const virtualConversation =
        yield* CCSessionProcess.createVirtualConversation(sessionProcess, {
          sessionId: baseSessionId,
          userMessage: input.text,
        });

      yield* virtualConversationDatabase.createVirtualConversation(
        sessionProcess.def.projectId,
        baseSessionId,
        [virtualConversation],
      );

      // Notify frontend that user message was added to virtual conversation
      // This allows immediate display of the user's message before Claude responds
      yield* eventBusService.emit("virtualConversationUpdated", {
        projectId: sessionProcess.def.projectId,
        sessionId: baseSessionId,
      });

      sessionProcess.def.setNextMessage(input);
      return {
        sessionProcess,
        task,
      };
    });
  };

  const startTask = (options: {
    userConfig: UserConfig;
    baseSession: {
      cwd: string;
      projectId: string;
      sessionId?: string;
    };
    input: UserMessageInput;
  }) => {
    const { baseSession, input, userConfig } = options;

    return Effect.gen(function* () {
      const {
        generateMessages,
        setNextMessage,
        setHooks: setMessageGeneratorHooks,
      } = createMessageGenerator();

      const { sessionProcess, task } =
        yield* sessionProcessService.startSessionProcess({
          sessionDef: {
            projectId: baseSession.projectId,
            cwd: baseSession.cwd,
            abortController: new AbortController(),
            setNextMessage,
            sessionProcessId: ulid(),
          },
          taskDef:
            baseSession.sessionId === undefined
              ? {
                  type: "new",
                  taskId: ulid(),
                }
              : {
                  type: "resume",
                  taskId: ulid(),
                  sessionId: undefined,
                  baseSessionId: baseSession.sessionId,
                },
        });

      const sessionInitializedPromise = controllablePromise<{
        sessionId: string;
      }>();
      const sessionFileCreatedPromise = controllablePromise<{
        sessionId: string;
      }>();

      setMessageGeneratorHooks({
        onNewUserMessageResolved: async (input) => {
          Effect.runFork(
            sessionProcessService.toNotInitializedState({
              sessionProcessId: sessionProcess.def.sessionProcessId,
              rawUserMessage: input.text,
            }),
          );
        },
      });

      const handleMessage = (message: SDKMessage) =>
        Effect.gen(function* () {
          const processState = yield* sessionProcessService.getSessionProcess(
            sessionProcess.def.sessionProcessId,
          );

          if (processState.type === "completed") {
            return "break" as const;
          }

          if (processState.type === "paused") {
            // rule: paused is assumed to be updated to not_initialized
            return yield* Effect.die(
              new Error("Illegal state: paused is not expected"),
            );
          }

          if (
            message.type === "system" &&
            message.subtype === "init" &&
            processState.type === "not_initialized"
          ) {
            yield* sessionProcessService.toInitializedState({
              sessionProcessId: processState.def.sessionProcessId,
              initContext: {
                initMessage: message,
              },
            });

            // Virtual Conversation Creation
            const virtualConversation =
              yield* CCSessionProcess.createVirtualConversation(processState, {
                sessionId: message.session_id,
                userMessage: processState.rawUserMessage,
              });

            if (processState.currentTask.def.type === "new") {
              // Simply append to the end
              yield* virtualConversationDatabase.createVirtualConversation(
                baseSession.projectId,
                message.session_id,
                [virtualConversation],
              );
            } else if (processState.currentTask.def.type === "resume") {
              const existingSession = yield* sessionRepository.getSession(
                processState.def.projectId,
                processState.currentTask.def.baseSessionId,
              );

              const copiedConversations =
                existingSession.session === null
                  ? []
                  : existingSession.session.conversations;

              yield* virtualConversationDatabase.createVirtualConversation(
                processState.def.projectId,
                message.session_id,
                [...copiedConversations, virtualConversation],
              );
            } else {
              // do nothing
            }

            sessionInitializedPromise.resolve({
              sessionId: message.session_id,
            });

            yield* eventBusService.emit("sessionListChanged", {
              projectId: processState.def.projectId,
            });

            yield* eventBusService.emit("sessionChanged", {
              projectId: processState.def.projectId,
              sessionId: message.session_id,
            });

            yield* eventBusService.emit("initializationProgress", {
              message: "会话连接建立成功",
              stage: "success",
            });

            return "continue" as const;
          }

          if (
            message.type === "assistant" &&
            processState.type === "initialized"
          ) {
            yield* sessionProcessService.toFileCreatedState({
              sessionProcessId: processState.def.sessionProcessId,
            });

            sessionFileCreatedPromise.resolve({
              sessionId: message.session_id,
            });

            const sessionSnapshot = yield* snapshotLiveDisplay({
              projectId: processState.def.projectId,
              sessionId: message.session_id,
            });

            if (sessionSnapshot !== null) {
              yield* sessionLiveDisplayService.upsertSessionLiveDisplay({
                projectId: processState.def.projectId,
                sessionId: message.session_id,
                displayMeta: sessionSnapshot.displayMeta,
                firstUserMessage: sessionSnapshot.firstUserMessage,
              });
            }

            yield* virtualConversationDatabase.deleteVirtualConversations(
              message.session_id,
            );

            // Notify frontend that new assistant message is available
            // This triggers before file watcher debounce, reducing perceived latency
            yield* eventBusService.emit("virtualConversationUpdated", {
              projectId: processState.def.projectId,
              sessionId: message.session_id,
            });
          }

          if (
            message.type === "result" &&
            processState.type === "file_created"
          ) {
            yield* sessionProcessService.toPausedState({
              sessionProcessId: processState.def.sessionProcessId,
              resultMessage: message,
            });

            yield* eventBusService.emit("sessionChanged", {
              projectId: processState.def.projectId,
              sessionId: message.session_id,
            });

            return "continue" as const;
          }

          return "continue" as const;
        });

      const handleSessionProcessDaemon = async () => {
        try {
          const messageIter = await Runtime.runPromise(runtime)(
            Effect.gen(function* () {
              yield* eventBusService.emit("initializationProgress", {
                message: "正在初始化会话环境...",
                stage: "loading",
              });

              const permissionOptions =
                yield* permissionService.createCanUseToolRelatedOptions({
                  taskId: task.def.taskId,
                  sessionProcessId: sessionProcess.def.sessionProcessId,
                  userConfig,
                  sessionId: task.def.baseSessionId,
                });

              // Normalize environment variables for Claude Code SDK
              // 优先级：process.env > ~/.claude/settings.json env
              // Windows 用户习惯把 ANTHROPIC_AUTH_TOKEN 等写在 settings.json 的 env 字段里
              const settingsEnv = yield* readClaudeSettingsEnv;
              // biome-ignore lint/style/noProcessEnv: Claude Code SDK requires full env for MCP server configs
              const normalizedEnv = { ...settingsEnv, ...process.env };
              if (
                !normalizedEnv.ANTHROPIC_API_KEY &&
                normalizedEnv.ANTHROPIC_AUTH_TOKEN
              ) {
                normalizedEnv.ANTHROPIC_API_KEY =
                  normalizedEnv.ANTHROPIC_AUTH_TOKEN;
                console.log(
                  "[SpecForge] Using ANTHROPIC_AUTH_TOKEN as ANTHROPIC_API_KEY for custom proxy service",
                );
              }

              // Log authentication configuration for debugging
              const hasApiKey = !!normalizedEnv.ANTHROPIC_API_KEY;
              const baseUrl = normalizedEnv.ANTHROPIC_BASE_URL;
              console.log(
                `[SpecForge] Claude Code SDK authentication: ${hasApiKey ? "API key configured" : "No API key"}, Base URL: ${baseUrl || "default"}`,
              );

              return yield* ClaudeCode.query(generateMessages(), {
                resume: task.def.baseSessionId,
                cwd: sessionProcess.def.cwd,
                abortController: sessionProcess.def.abortController,
                env: normalizedEnv,
                ...permissionOptions,
              });
            }),
          );

          Effect.runFork(
            eventBusService.emit("initializationProgress", {
              message: "正在建立 MCP server 连接...",
              stage: "loading",
            }),
          );

          setNextMessage(input);

          for await (const message of messageIter) {
            // 诊断日志：追踪工具调用名称（用于排查 todowrite vs tasklist 问题）
            if (
              message.type === "assistant" &&
              "message" in message &&
              message.message?.content
            ) {
              const content = message.message.content;
              const toolNames = (Array.isArray(content) ? content : [])
                .filter((block) => block.type === "tool_use")
                .map((t) => (t as { name: string }).name);
              if (toolNames.length > 0) {
                console.log(`[SpecForge:tool-use] ${toolNames.join(", ")}`);
              }
            }

            // Check abort signal before processing message
            if (sessionProcess.def.abortController.signal.aborted) {
              break;
            }

            const result = await Runtime.runPromise(runtime)(
              handleMessage(message),
            ).catch((error) => {
              // If abort signal is triggered, don't mark as failed - abort is handled by abortTask
              if (sessionProcess.def.abortController.signal.aborted) {
                return "continue" as const;
              }

              // If the iter itself hasn't crashed, we want to continue, so swallow the error
              Effect.runFork(
                sessionProcessService.changeTaskState({
                  sessionProcessId: sessionProcess.def.sessionProcessId,
                  taskId: task.def.taskId,
                  nextTask: {
                    status: "failed",
                    def: task.def,
                    error: error,
                  },
                }),
              );

              if (sessionInitializedPromise.status === "pending") {
                sessionInitializedPromise.reject(error);
              }

              if (sessionFileCreatedPromise.status === "pending") {
                sessionFileCreatedPromise.reject(error);
              }

              return "continue" as const;
            });

            if (result === "break") {
              break;
            }
          }
        } catch (error) {
          // If abort signal is triggered, don't mark as failed - abort is handled by abortTask
          if (sessionProcess.def.abortController.signal.aborted) {
            return;
          }

          if (sessionInitializedPromise.status === "pending") {
            sessionInitializedPromise.reject(error);
          }

          if (sessionFileCreatedPromise.status === "pending") {
            sessionFileCreatedPromise.reject(error);
          }

          await Effect.runPromise(
            sessionProcessService.changeTaskState({
              sessionProcessId: sessionProcess.def.sessionProcessId,
              taskId: task.def.taskId,
              nextTask: {
                status: "failed",
                def: task.def,
                error: error,
              },
            }),
          );
        }
      };

      const daemonPromise = handleSessionProcessDaemon()
        .catch((error) => {
          console.error("Error occur in task daemon process", error);
          if (sessionInitializedPromise.status === "pending") {
            sessionInitializedPromise.reject(error);
          }
          if (sessionFileCreatedPromise.status === "pending") {
            sessionFileCreatedPromise.reject(error);
          }
          // throw error; // Prevent crash on abort
        })
        .finally(() => {
          Effect.runFork(
            Effect.gen(function* () {
              const currentProcess =
                yield* sessionProcessService.getSessionProcess(
                  sessionProcess.def.sessionProcessId,
                );

              yield* sessionProcessService.toCompletedState({
                sessionProcessId: currentProcess.def.sessionProcessId,
              });
            }),
          );
        });

      return {
        sessionProcess,
        task,
        daemonPromise,
        awaitSessionInitialized: async () =>
          await sessionInitializedPromise.promise,
        awaitSessionFileCreated: async () =>
          await sessionFileCreatedPromise.promise,
        yieldSessionInitialized: () =>
          Effect.promise(() => sessionInitializedPromise.promise),
        yieldSessionFileCreated: () =>
          Effect.promise(() => sessionFileCreatedPromise.promise),
      };
    });
  };

  const getPublicSessionProcesses = () =>
    Effect.gen(function* () {
      const processes = yield* sessionProcessService.getSessionProcesses();
      return processes.filter((process) => CCSessionProcess.isPublic(process));
    });

  const abortTask = (sessionProcessId: string): Effect.Effect<void, Error> =>
    Effect.gen(function* () {
      const currentProcess =
        yield* sessionProcessService.getSessionProcess(sessionProcessId);

      // If already completed, nothing to abort
      if (currentProcess.type === "completed") {
        return;
      }

      currentProcess.def.abortController.abort();

      // Wait briefly to let the daemon's loop detect the abort signal
      yield* Effect.sleep("100 millis");

      // Re-check state to avoid conflict with daemon's finally block
      const latestProcess =
        yield* sessionProcessService.getSessionProcess(sessionProcessId);

      if (latestProcess.type !== "completed") {
        yield* sessionProcessService.toCompletedState({
          sessionProcessId: currentProcess.def.sessionProcessId,
          error: new Error("Task aborted"),
        });
      }
    });

  const abortAllTasks = () =>
    Effect.gen(function* () {
      const processes = yield* sessionProcessService.getSessionProcesses();

      for (const process of processes) {
        yield* sessionProcessService.toCompletedState({
          sessionProcessId: process.def.sessionProcessId,
          error: new Error("Task aborted"),
        });
      }
    });

  return {
    continueTask,
    startTask,
    abortTask,
    abortAllTasks,
    getPublicSessionProcesses,
  };
});

export type IClaudeCodeLifeCycleService = InferEffect<typeof LayerImpl>;

export class ClaudeCodeLifeCycleService extends Context.Tag(
  "ClaudeCodeLifeCycleService",
)<ClaudeCodeLifeCycleService, IClaudeCodeLifeCycleService>() {
  static Live = Layer.effect(this, LayerImpl);
}
