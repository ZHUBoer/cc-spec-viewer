import Client from "@ctrip/feishu2md-node";
import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../lib/effect/toEffectResponse";
import { ProjectRepository } from "../project/infrastructure/ProjectRepository";

const FEISHU_APP_ID = "cli_a8d81270b979900d";
const FEISHU_APP_SECRET = "4W2ZDr8taY92knsqwnZrvKb2TPQQHuoZ";

const client = new Client({
  appId: FEISHU_APP_ID,
  appSecret: FEISHU_APP_SECRET,
});

/**
 * 删除 markdown 中的所有图片标记
 * 匹配格式: ![alt text](url) 或 ![](url)
 */
const removeImageMarkers = (markdown: string): string => {
  // 匹配所有 markdown 图片标记并删除
  return markdown.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
};

const make = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;

  const downloadDoc = (options: { projectId: string; larkDoc: string }) =>
    Effect.gen(function* () {
      yield* projectRepository.getProject(options.projectId);

      const rawMarkdown = yield* Effect.tryPromise({
        try: () => client.getDocMdContent(options.larkDoc),
        catch: (error) =>
          new Error(
            `Failed to get Feishu document content: ${error instanceof Error ? error.message : String(error)}`,
          ),
      });

      // 删除所有图片标记，防止 Claude Code 尝试读取图片文件
      const markdown = removeImageMarkers(rawMarkdown);

      const response = {
        status: 200,
        response: { markdown },
      } satisfies ControllerResponse;
      return response;
    }).pipe(
      Effect.catchAll((error) =>
        Effect.succeed({
          status: 500,
          response: {
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        } satisfies ControllerResponse),
      ),
    );

  return { downloadDoc };
});

export class FeishuController extends Context.Tag("FeishuController")<
  FeishuController,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(this, make);
}
