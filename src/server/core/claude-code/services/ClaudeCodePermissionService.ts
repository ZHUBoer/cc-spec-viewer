import type { CanUseTool } from "@anthropic-ai/claude-agent-sdk";
import { Context, Effect, Layer, Ref } from "effect";
import { ulid } from "ulid";
import type {
  PermissionRequest,
  PermissionResponse,
} from "../../../../types/permissions";
import type { UserConfig } from "../../../lib/config/config";
import type { InferEffect } from "../../../lib/effect/types";
import { EventBus } from "../../events/services/EventBus";
import * as ClaudeCode from "../models/ClaudeCode";

const LayerImpl = Effect.gen(function* () {
  const pendingPermissionRequestsRef = yield* Ref.make<
    Map<string, PermissionRequest>
  >(new Map());
  const permissionResponsesRef = yield* Ref.make<
    Map<string, PermissionResponse>
  >(new Map());
  const eventBus = yield* EventBus;

  const waitPermissionResponse = (
    request: PermissionRequest,
    options: { timeoutMs: number },
  ) =>
    Effect.gen(function* () {
      const requestId = request.id;

      const waitEffect = Effect.gen(function* () {
        yield* Ref.update(pendingPermissionRequestsRef, (requests) => {
          requests.set(requestId, request);
          return requests;
        });

        yield* eventBus.emit("permissionRequested", {
          permissionRequest: request,
        });

        let passedMs = 0;
        let response: PermissionResponse | null = null;
        while (passedMs < options.timeoutMs) {
          const responses = yield* Ref.get(permissionResponsesRef);
          response = responses.get(requestId) ?? null;
          if (response !== null) {
            // Consume response immediately to avoid response cache accumulation.
            yield* Ref.update(permissionResponsesRef, (responsesMap) => {
              responsesMap.delete(requestId);
              return responsesMap;
            });
            break;
          }

          yield* Effect.sleep(1000);
          passedMs += 1000;
        }

        return response;
      });

      return yield* waitEffect.pipe(
        // Ensure no stale pending request remains after allow/deny/timeout.
        Effect.ensuring(
          Ref.update(pendingPermissionRequestsRef, (requests) => {
            requests.delete(requestId);
            return requests;
          }),
        ),
      );
    });

  const createCanUseToolRelatedOptions = (options: {
    taskId: string;
    sessionProcessId: string;
    userConfig: UserConfig;
    sessionId?: string;
  }) => {
    const { taskId, sessionProcessId, userConfig, sessionId } = options;

    return Effect.gen(function* () {
      const claudeCodeConfig = yield* ClaudeCode.Config;

      if (
        !ClaudeCode.getAvailableFeatures(claudeCodeConfig.claudeCodeVersion)
          .canUseTool
      ) {
        return {
          permissionMode: "bypassPermissions",
        } as const;
      }

      const canUseTool: CanUseTool = async (toolName, toolInput, options) => {
        // AskUserQuestion always requires user interaction via the Web UI dialog,
        // regardless of the configured permission mode.
        if (
          toolName !== "AskUserQuestion" &&
          userConfig.permissionMode !== "default"
        ) {
          // Convert Claude Code permission modes to canUseTool behaviors
          if (
            userConfig.permissionMode === "bypassPermissions" ||
            userConfig.permissionMode === "acceptEdits"
          ) {
            return {
              behavior: "allow" as const,
              updatedInput: toolInput,
            };
          } else {
            // plan mode should deny actual tool execution
            return {
              behavior: "deny" as const,
              message: "Tool execution is disabled in plan mode",
            };
          }
        }

        const permissionRequest: PermissionRequest = {
          id: ulid(),
          taskId,
          sessionProcessId,
          sessionId,
          toolName,
          toolInput,
          toolUseId: options.toolUseID,
          timestamp: Date.now(),
        };

        const response = await Effect.runPromise(
          waitPermissionResponse(permissionRequest, {
            // AskUserQuestion 需要用户阅读并手动回答，使用 30 分钟超时
            // 其他工具权限请求使用 60 秒超时
            timeoutMs: toolName === "AskUserQuestion" ? 30 * 60 * 1000 : 60000,
          }),
        );

        if (response === null) {
          return {
            behavior: "deny" as const,
            message: "Permission request timed out",
          };
        }

        if (response.decision === "allow") {
          return {
            behavior: "allow" as const,
            updatedInput: response.updatedInput ?? toolInput,
          };
        } else {
          return {
            behavior: "deny" as const,
            message: "Permission denied by user",
          };
        }
      };

      return {
        canUseTool,
        permissionMode: userConfig.permissionMode,
      } as const;
    });
  };

  const respondToPermissionRequest = (
    response: PermissionResponse,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Ref.update(permissionResponsesRef, (responses) => {
        responses.set(response.permissionRequestId, response);
        return responses;
      });

      yield* Ref.update(pendingPermissionRequestsRef, (requests) => {
        requests.delete(response.permissionRequestId);
        return requests;
      });
    });

  const getPendingPermissionRequests = (options?: {
    sessionId?: string;
    taskId?: string;
    sessionProcessId?: string;
  }): Effect.Effect<PermissionRequest[]> =>
    Effect.gen(function* () {
      const requests = yield* Ref.get(pendingPermissionRequestsRef);
      const allRequests = Array.from(requests.values());

      const filtered = allRequests.filter((request) => {
        if (options?.sessionId && request.sessionId !== options.sessionId) {
          return false;
        }
        if (options?.taskId && request.taskId !== options.taskId) {
          return false;
        }
        if (
          options?.sessionProcessId &&
          request.sessionProcessId !== options.sessionProcessId
        ) {
          return false;
        }
        return true;
      });

      filtered.sort((a, b) => a.timestamp - b.timestamp);
      return filtered;
    });

  return {
    createCanUseToolRelatedOptions,
    respondToPermissionRequest,
    getPendingPermissionRequests,
  };
});

export type IClaudeCodePermissionService = InferEffect<typeof LayerImpl>;

export class ClaudeCodePermissionService extends Context.Tag(
  "ClaudeCodePermissionService",
)<ClaudeCodePermissionService, IClaudeCodePermissionService>() {
  static Live = Layer.effect(this, LayerImpl);
}
