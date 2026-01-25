import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { OpenSpecService } from "../services/OpenSpecService";

const LayerImpl = Effect.gen(function* () {
  const openSpecService = yield* OpenSpecService;

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

  return {
    getChangesRoute,
    getChangeDetailsRoute,
  };
});

export type IOpenSpecController = InferEffect<typeof LayerImpl>;
export class OpenSpecController extends Context.Tag("OpenSpecController")<
  OpenSpecController,
  IOpenSpecController
>() {
  static Live = Layer.effect(this, LayerImpl);
}
