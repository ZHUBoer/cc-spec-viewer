import { FileSystem, Path } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import type { ControllerResponse } from "../../../lib/effect/toEffectResponse";
import type { InferEffect } from "../../../lib/effect/types";
import { computeClaudeProjectFilePath } from "../../claude-code/functions/computeClaudeProjectFilePath";
import { ClaudeCodeLifeCycleService } from "../../claude-code/services/ClaudeCodeLifeCycleService";
import { ApplicationContext } from "../../platform/services/ApplicationContext";
import { UserConfigService } from "../../platform/services/UserConfigService";
import { SessionRepository } from "../../session/infrastructure/SessionRepository";
import { encodeProjectId } from "../functions/id";
import { PROJECT_PATH_HINT_FILENAME } from "../functions/projectPathHint";
import { ProjectRepository } from "../infrastructure/ProjectRepository";
import { ProjectMetaService } from "../services/ProjectMetaService";

const LayerImpl = Effect.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const projectMetaService = yield* ProjectMetaService;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const userConfigService = yield* UserConfigService;
  const sessionRepository = yield* SessionRepository;
  const context = yield* ApplicationContext;
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const getProjects = () =>
    Effect.gen(function* () {
      const { projects } = yield* projectRepository.getProjects();
      return {
        status: 200,
        response: { projects },
      } as const satisfies ControllerResponse;
    });

  const getProject = (options: { projectId: string; cursor?: string }) =>
    Effect.gen(function* () {
      const { projectId, cursor } = options;

      const userConfig = yield* userConfigService.getUserConfig();

      const { project } = yield* projectRepository.getProject(projectId);
      const { sessions } = yield* sessionRepository.getSessions(projectId, {
        maxCount: Number.MAX_SAFE_INTEGER,
      });

      let filteredSessions = sessions;

      // Filter sessions based on hideNoUserMessageSession setting
      if (userConfig.hideNoUserMessageSession) {
        filteredSessions = filteredSessions.filter((session) => {
          return session.meta.firstUserMessage !== null;
        });
      }

      // Unify sessions with same title if unifySameTitleSession is enabled
      if (userConfig.unifySameTitleSession) {
        const sessionMap = new Map<string, (typeof filteredSessions)[0]>();

        for (const session of filteredSessions) {
          const title = session.displayMeta.title;

          const existingSession = sessionMap.get(title);
          if (existingSession) {
            // Keep the session with the latest modification date
            if (session.lastModifiedAt && existingSession.lastModifiedAt) {
              if (session.lastModifiedAt > existingSession.lastModifiedAt) {
                sessionMap.set(title, session);
              }
            } else if (
              session.lastModifiedAt &&
              !existingSession.lastModifiedAt
            ) {
              sessionMap.set(title, session);
            }
            // If no modification dates, keep the existing one
          } else {
            sessionMap.set(title, session);
          }
        }

        filteredSessions = Array.from(sessionMap.values());
      }

      const pageSize = 20;
      const startIndex =
        cursor === undefined
          ? 0
          : filteredSessions.findIndex((session) => session.id === cursor) + 1;
      const pagedSessions =
        startIndex <= 0
          ? filteredSessions.slice(0, pageSize)
          : filteredSessions.slice(startIndex, startIndex + pageSize);
      const hasMore =
        startIndex <= 0
          ? filteredSessions.length > pageSize
          : startIndex + pageSize < filteredSessions.length;

      return {
        status: 200,
        response: {
          project,
          sessions: pagedSessions,
          totalSessions: filteredSessions.length,
          nextCursor: hasMore ? pagedSessions.at(-1)?.id : undefined,
        },
      } as const satisfies ControllerResponse;
    });

  const getProjectLatestSession = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const { projectId } = options;
      const { sessions } = yield* sessionRepository.getSessions(projectId, {
        maxCount: 1,
      });

      return {
        status: 200,
        response: {
          latestSession: sessions[0] ?? null,
        },
      } as const satisfies ControllerResponse;
    });

  const createProject = (options: { projectPath: string }) =>
    Effect.gen(function* () {
      const { projectPath } = options;

      // No project validation needed - startTask will create a new project
      // if it doesn't exist when running /init command
      const claudeProjectFilePath = yield* computeClaudeProjectFilePath({
        projectPath,
        claudeProjectsDirPath: (yield* context.claudeCodePaths)
          .claudeProjectsDirPath,
      });
      const projectPathHintFilePath = path.join(
        claudeProjectFilePath,
        PROJECT_PATH_HINT_FILENAME,
      );
      const projectId = encodeProjectId(claudeProjectFilePath);
      const userConfig = yield* userConfigService.getUserConfig();

      // Persist original project path early so metadata does not depend on
      // the first conversation payload being fully written.
      yield* fileSystem
        .makeDirectory(claudeProjectFilePath, { recursive: true })
        .pipe(Effect.catchAll(() => Effect.void));
      yield* fileSystem
        .writeFileString(projectPathHintFilePath, projectPath)
        .pipe(Effect.catchAll(() => Effect.void));

      // Check if CLAUDE.md exists in the project directory
      const claudeMdPath = path.join(projectPath, "CLAUDE.md");
      const claudeMdExists = yield* fileSystem.exists(claudeMdPath);

      yield* claudeCodeLifeCycleService.startTask({
        baseSession: {
          cwd: projectPath,
          projectId,
          sessionId: undefined,
        },
        userConfig,
        input: {
          text: claudeMdExists ? "describe this project" : "/init",
        },
      });

      return {
        status: 201,
        response: {
          projectId,
        },
      } as const satisfies ControllerResponse;
    });

  const createWorkspace = (options: {
    parentPath: string;
    workspaceName: string;
    additionalDirectories: string[];
  }) =>
    Effect.gen(function* () {
      const { parentPath, workspaceName, additionalDirectories } = options;

      const parentExists = yield* fileSystem.exists(parentPath);
      if (!parentExists) {
        return {
          status: 400,
          response: { error: "Parent directory not found" },
        } as const satisfies ControllerResponse;
      }

      const workspacePath = path.join(parentPath, workspaceName);
      yield* fileSystem.makeDirectory(workspacePath, { recursive: true });

      const claudeDirPath = path.join(workspacePath, ".claude");
      yield* fileSystem
        .makeDirectory(claudeDirPath, { recursive: true })
        .pipe(Effect.catchAll(() => Effect.void));

      const settingsPath = path.join(claudeDirPath, "settings.json");
      const existingSettings = yield* fileSystem
        .readFileString(settingsPath)
        .pipe(
          Effect.flatMap((content) =>
            Effect.try({
              try: () => JSON.parse(content) as Record<string, unknown>,
              catch: () => new Error("Invalid JSON"),
            }),
          ),
          Effect.catchAll(() => Effect.succeed({} as Record<string, unknown>)),
        );
      const mergedSettings = {
        ...existingSettings,
        permissions: {
          ...((existingSettings.permissions as Record<string, unknown>) ?? {}),
          additionalDirectories,
        },
      };
      const settingsContent = JSON.stringify(mergedSettings, null, 2);
      yield* fileSystem.writeFileString(settingsPath, settingsContent);

      const claudeProjectFilePath = yield* computeClaudeProjectFilePath({
        projectPath: workspacePath,
        claudeProjectsDirPath: (yield* context.claudeCodePaths)
          .claudeProjectsDirPath,
      });
      const projectPathHintFilePath = path.join(
        claudeProjectFilePath,
        PROJECT_PATH_HINT_FILENAME,
      );
      const projectId = encodeProjectId(claudeProjectFilePath);
      const userConfig = yield* userConfigService.getUserConfig();

      yield* fileSystem
        .makeDirectory(claudeProjectFilePath, { recursive: true })
        .pipe(Effect.catchAll(() => Effect.void));
      yield* fileSystem
        .writeFileString(projectPathHintFilePath, workspacePath)
        .pipe(Effect.catchAll(() => Effect.void));

      const dirList = additionalDirectories
        .map((dir, i) => `${i + 1}. ${dir}`)
        .join("\n");
      const analyzeCommands = additionalDirectories
        .map((dir) => `cd "${dir}" && npx gitnexus analyze`)
        .join("\n");

      yield* claudeCodeLifeCycleService.startTask({
        baseSession: {
          cwd: workspacePath,
          projectId,
          sessionId: undefined,
        },
        userConfig,
        input: {
          text: `这是一个工作区目录，路径为：${workspacePath}

关联的项目目录如下：
${dirList}

请按照以下步骤执行：

1. 在工作区根目录创建 CLAUDE.md 文件作为 memory file
2. 对每个关联项目目录执行 gitnexus 分析：
${analyzeCommands}
3. 将以下内容整合写入 CLAUDE.md：
   - 工作区概述（路径、用途说明）
   - 各关联项目的简要说明（基于 gitnexus 分析结果）
   - 项目间的关联关系（如果能识别出来）

注意：CLAUDE.md 会作为当前工作区的记忆文件，后续所有会话都会读取它，请确保内容清晰、结构化。`,
        },
      });

      return {
        status: 201,
        response: {
          projectId,
        },
      } as const satisfies ControllerResponse;
    });

  const repairProjectPath = (options: { projectId: string }) =>
    Effect.gen(function* () {
      const result = yield* projectMetaService.repairProjectPath(
        options.projectId,
      );
      return {
        status: result.success ? 200 : 409,
        response: result,
      } as const satisfies ControllerResponse;
    });

  return {
    getProjects,
    getProject,
    getProjectLatestSession,
    createProject,
    createWorkspace,
    repairProjectPath,
  };
});

export type IProjectController = InferEffect<typeof LayerImpl>;
export class ProjectController extends Context.Tag("ProjectController")<
  ProjectController,
  IProjectController
>() {
  static Live = Layer.effect(this, LayerImpl);
}
