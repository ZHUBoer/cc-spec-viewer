import { FileSystem, Path } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import type { InferEffect } from "../../../lib/effect/types";
import { ProjectRepository } from "../../project/infrastructure/ProjectRepository";
import { parseMcpListOutput } from "../functions/parseMcpListOutput";
import * as ClaudeCode from "../models/ClaudeCode";

class ProjectPathNotFoundError extends Data.TaggedError(
  "ProjectPathNotFoundError",
)<{
  projectId: string;
}> {}

class McpConfigSaveError extends Data.TaggedError("McpConfigSaveError")<{
  projectId: string;
  configPath: string;
  reason: string;
}> {}

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;

  const getClaudeCodeMeta = () =>
    Effect.gen(function* () {
      const config = yield* ClaudeCode.Config;
      return config;
    });

  const getAvailableFeatures = () =>
    Effect.gen(function* () {
      const config = yield* ClaudeCode.Config;
      const features = ClaudeCode.getAvailableFeatures(
        config.claudeCodeVersion,
      );
      return features;
    });

  const getMcpList = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const output = yield* ClaudeCode.getMcpListOutput(
        project.meta.projectPath,
      );
      return parseMcpListOutput(output);
    });

  const MCP_CONFIG_FILE = ".mcp.json";

  const getMcpConfig = (projectId: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const configPath = path.join(project.meta.projectPath, MCP_CONFIG_FILE);

      const exists = yield* fs.exists(configPath);
      if (!exists) {
        // 如果配置文件不存在，返回空的默认配置
        return {
          content: JSON.stringify({ mcpServers: {} }, null, 2),
          configPath,
        };
      }

      const content = yield* fs.readFileString(configPath);
      return { content, configPath };
    });

  const saveMcpConfig = (projectId: string, content: string) =>
    Effect.gen(function* () {
      const { project } = yield* projectRepository.getProject(projectId);
      if (project.meta.projectPath === null) {
        return yield* Effect.fail(new ProjectPathNotFoundError({ projectId }));
      }

      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const configPath = path.join(project.meta.projectPath, MCP_CONFIG_FILE);

      // 验证 JSON 格式
      try {
        JSON.parse(content);
      } catch {
        return yield* Effect.fail(
          new McpConfigSaveError({
            projectId,
            configPath,
            reason: "无效的 JSON 格式",
          }),
        );
      }

      yield* fs.writeFileString(configPath, content);
      return { configPath };
    });

  return {
    getClaudeCodeMeta,
    getMcpList,
    getMcpConfig,
    saveMcpConfig,
    getAvailableFeatures,
  };
});

export type IClaudeCodeService = InferEffect<typeof LayerImpl>;

export class ClaudeCodeService extends Context.Tag("ClaudeCodeService")<
  ClaudeCodeService,
  IClaudeCodeService
>() {
  static Live = Layer.effect(this, LayerImpl);
}
