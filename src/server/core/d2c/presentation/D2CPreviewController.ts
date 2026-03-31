import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { D2CPreviewService } from "../services/D2CPreviewService";

const catchAsServerError = (errorMessage: string) =>
  Effect.catchAll((error: unknown) => {
    console.error(`${errorMessage}:`, error);
    return Effect.succeed({
      response: { error: errorMessage },
      status: 500,
    } satisfies ControllerResponse);
  });

export type D2CPreviewAction =
  | "list"
  | "check-status"
  | "check-project"
  | "ensure-running"
  | "sync"
  | "trigger-rebuild";

const LayerImpl = Effect.gen(function* () {
  const previewService = yield* D2CPreviewService;

  const previewRoute = (options: {
    projectId: string;
    action: D2CPreviewAction;
    changeId?: string;
    artifactId?: string;
  }) =>
    Effect.gen(function* () {
      const { projectId, action, changeId, artifactId } = options;

      if (action === "list") {
        if (!changeId) {
          return {
            response: { success: false, error: "缺少 changeId" },
            status: 400,
          } satisfies ControllerResponse;
        }
        const result = yield* previewService.listArtifacts(projectId, changeId);
        return {
          response: { success: true, data: result },
          status: 200,
        } satisfies ControllerResponse;
      }

      if (action === "check-status") {
        const result = yield* previewService.checkStatus();
        return {
          response: { success: true, data: result },
          status: 200,
        } satisfies ControllerResponse;
      }

      if (action === "check-project") {
        const result = yield* previewService.checkPreviewProject(projectId);
        return {
          response: { success: true, data: result },
          status: 200,
        } satisfies ControllerResponse;
      }

      if (action === "ensure-running") {
        const result = yield* previewService.ensureRunning(projectId);
        return {
          response: result.success
            ? { success: true, data: result }
            : { success: false, error: result.message, data: result },
          status: result.success ? 200 : 500,
        } satisfies ControllerResponse;
      }

      if (action === "sync") {
        if (!changeId) {
          return {
            response: { success: false, error: "缺少 changeId" },
            status: 400,
          } satisfies ControllerResponse;
        }
        if (!artifactId) {
          return {
            response: { success: false, error: "缺少 artifactId" },
            status: 400,
          } satisfies ControllerResponse;
        }
        const result = yield* previewService.syncPreviewFiles(
          projectId,
          changeId,
          artifactId,
        );
        return {
          response: { success: result.success, data: result },
          status: result.success ? 200 : 400,
        } satisfies ControllerResponse;
      }

      if (action === "trigger-rebuild") {
        const result = yield* previewService.triggerRebuild(projectId);
        return {
          response: { success: result.success, data: result },
          status: result.success ? 200 : 400,
        } satisfies ControllerResponse;
      }

      return {
        response: { success: false, error: "不支持的预览操作" },
        status: 400,
      } satisfies ControllerResponse;
    }).pipe(catchAsServerError("Failed to handle D2C preview action"));

  return { previewRoute };
});

export class D2CPreviewController extends Context.Tag("D2CPreviewController")<
  D2CPreviewController,
  InferEffect<typeof LayerImpl>
>() {
  static Live = Layer.effect(this, LayerImpl);
}
