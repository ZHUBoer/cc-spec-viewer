import { Effect } from "effect";
import type { Context, Input } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { HonoContext } from "../../hono/app";

export type ControllerResponse = {
  status: ContentfulStatusCode;
  response: object;
};

declare const dummyCtx: Context<HonoContext, string, Input>;
const dummyJson = <S extends ContentfulStatusCode, T extends object>(
  s: S,
  t: T,
) => dummyCtx.json(t, s);
type ResponseType<
  S extends ContentfulStatusCode,
  T extends object,
> = ReturnType<typeof dummyJson<S, T>>;

type InferResponse<CR extends ControllerResponse> = ResponseType<
  CR["status"],
  CR["response"]
>;

export const effectToResponse = async <
  const P extends string,
  const I extends Input,
  const CR extends ControllerResponse,
  const E,
>(
  ctx: Context<HonoContext, P, I>,
  effect: Effect.Effect<CR, E, never>,
): Promise<InferResponse<CR>> => {
  const result = await Effect.runPromise(effect);
  const toResponse = <S extends ContentfulStatusCode, T extends object>(
    status: S,
    response: T,
  ) => ctx.json(response, status);
  return toResponse(result.status, result.response);
};
