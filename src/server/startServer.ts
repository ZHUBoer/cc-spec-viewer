import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NodeContext } from "@effect/platform-node";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Effect, Layer } from "effect";
import { AgentSessionLayer } from "./core/agent-session";
import { AgentSessionController } from "./core/agent-session/presentation/AgentSessionController";
import { ClaudeCodeController } from "./core/claude-code/presentation/ClaudeCodeController";
import { ClaudeCodePermissionController } from "./core/claude-code/presentation/ClaudeCodePermissionController";
import { ClaudeCodeSessionProcessController } from "./core/claude-code/presentation/ClaudeCodeSessionProcessController";
import { ClaudeCodeLifeCycleService } from "./core/claude-code/services/ClaudeCodeLifeCycleService";
import { ClaudeCodePermissionService } from "./core/claude-code/services/ClaudeCodePermissionService";
import { ClaudeCodeService } from "./core/claude-code/services/ClaudeCodeService";
import { ClaudeCodeSessionProcessService } from "./core/claude-code/services/ClaudeCodeSessionProcessService";
import { SSEController } from "./core/events/presentation/SSEController";
import { FileWatcherService } from "./core/events/services/fileWatcher";
import { FeatureFlagController } from "./core/feature-flag/presentation/FeatureFlagController";
import { FileSystemController } from "./core/file-system/presentation/FileSystemController";
import { GitController } from "./core/git/presentation/GitController";
import { GitService } from "./core/git/services/GitService";
import { OpenSpecController } from "./core/openspec/presentation/OpenSpecController";
import { CliDetectionServiceLive } from "./core/openspec/services/CliDetectionService";
import { OpenSpecEnvironmentService } from "./core/openspec/services/OpenSpecEnvironmentService";
import { OpenSpecService } from "./core/openspec/services/OpenSpecService";
import { ProfileConfigService } from "./core/openspec/services/ProfileConfigService";
import { SkillManagerService } from "./core/openspec/services/SkillManagerService";
import { TemplateInjectionService } from "./core/openspec/services/TemplateInjectionService";
import { TemplateProcessor } from "./core/openspec/services/TemplateProcessor";
import type { CliOptions } from "./core/platform/services/CcvOptionsService";
import { ProjectRepository } from "./core/project/infrastructure/ProjectRepository";
import { ProjectController } from "./core/project/presentation/ProjectController";
import { ProjectMetaService } from "./core/project/services/ProjectMetaService";
import { RateLimitAutoScheduleService } from "./core/rate-limit/services/RateLimitAutoScheduleService";
import { SchedulerConfigBaseDir } from "./core/scheduler/config";
import { SchedulerService } from "./core/scheduler/domain/Scheduler";
import { SchedulerController } from "./core/scheduler/presentation/SchedulerController";
import { SearchController } from "./core/search/presentation/SearchController";
import { SearchService } from "./core/search/services/SearchService";
import { SessionRepository } from "./core/session/infrastructure/SessionRepository";
import { VirtualConversationDatabase } from "./core/session/infrastructure/VirtualConversationDatabase";
import { SessionController } from "./core/session/presentation/SessionController";
import { SessionMetaService } from "./core/session/services/SessionMetaService";
import { TasksController } from "./core/tasks/presentation/TasksController";
import { TasksService } from "./core/tasks/services/TasksService";
import { honoApp } from "./hono/app";
import { InitializeService } from "./hono/initialize";
import { AuthMiddleware } from "./hono/middleware/auth.middleware";
import { routes } from "./hono/route";
import { platformLayer } from "./lib/effect/layers";

export const startServer = async (options: CliOptions) => {
  // biome-ignore lint/style/noProcessEnv: allow only here
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    const staticPath = resolve(import.meta.dirname, "static");
    console.log("Serving static files from ", staticPath);

    honoApp.use(
      "/assets/*",
      serveStatic({
        root: staticPath,
      }),
    );

    honoApp.use("*", async (c, next) => {
      if (c.req.path.startsWith("/api")) {
        return next();
      }

      const html = await readFile(resolve(staticPath, "index.html"), "utf-8");
      return c.html(html);
    });
  }

  const program = routes(honoApp, options)
    // Pipe to container in shallow dependency order
    .pipe(Effect.provide(MainLayer));

  await Effect.runPromise(program);

  const port = isDevelopment
    ? // biome-ignore lint/style/noProcessEnv: allow only here
      (process.env.DEV_BE_PORT ?? "3401")
    : // biome-ignore lint/style/noProcessEnv: allow only here
      (options.port ?? process.env.PORT ?? "3000");

  // biome-ignore lint/style/noProcessEnv: allow only here
  const hostname = options.hostname ?? process.env.HOSTNAME ?? "localhost";

  serve(
    {
      fetch: honoApp.fetch,
      port: parseInt(port, 10),
      hostname,
    },
    (info) => {
      console.log(`Server is running on http://${hostname}:${info.port}`);
    },
  );
};

const PlatformLayer = Layer.mergeAll(platformLayer, NodeContext.layer);

const InfraBasics = Layer.mergeAll(
  VirtualConversationDatabase.Live,
  ProjectMetaService.Live,
  SessionMetaService.Live,
);

const InfraRepos = Layer.mergeAll(
  ProjectRepository.Live,
  SessionRepository.Live,
).pipe(Layer.provideMerge(InfraBasics));

const InfraLayer = AgentSessionLayer.pipe(Layer.provideMerge(InfraRepos));

const DomainBase = Layer.mergeAll(
  ClaudeCodePermissionService.Live,
  ClaudeCodeSessionProcessService.Live,
  ClaudeCodeService.Live,
  GitService.Live,
  SchedulerService.Live,
  SchedulerConfigBaseDir.Live,
  SearchService.Live,
  SearchService.Live,
  TasksService.Live,
  OpenSpecService.Live,
);

// OpenSpec 环境检测和注入服务层（有依赖顺序要求）
// 注意：OpenSpecEnvironmentService 依赖 CliDetectionService
// CliDetectionService 会在 DomainLayer 级别提供
const OpenSpecEnvBase = Layer.mergeAll(
  OpenSpecEnvironmentService.Live,
  ProfileConfigService.Live,
  TemplateProcessor.Live,
  SkillManagerService.Live,
);

const OpenSpecEnvLayer = TemplateInjectionService.Live.pipe(
  Layer.provideMerge(OpenSpecEnvBase),
);

const DomainLayer = ClaudeCodeLifeCycleService.Live.pipe(
  Layer.provideMerge(DomainBase),
  Layer.provideMerge(OpenSpecEnvLayer),
  Layer.provideMerge(CliDetectionServiceLive),
);

const AppServices = Layer.mergeAll(
  FileWatcherService.Live,
  RateLimitAutoScheduleService.Live,
  AuthMiddleware.Live,
);

const ApplicationLayer = InitializeService.Live.pipe(
  Layer.provideMerge(AppServices),
);

const PresentationLayer = Layer.mergeAll(
  ProjectController.Live,
  SessionController.Live,
  AgentSessionController.Live,
  GitController.Live,
  ClaudeCodeController.Live,
  ClaudeCodeSessionProcessController.Live,
  ClaudeCodePermissionController.Live,
  FileSystemController.Live,
  SSEController.Live,
  SchedulerController.Live,
  FeatureFlagController.Live,
  SearchController.Live,
  TasksController.Live,
  OpenSpecController.Live,
);

const MainLayer = PresentationLayer.pipe(
  Layer.provideMerge(ApplicationLayer),
  Layer.provideMerge(DomainLayer),
  Layer.provideMerge(InfraLayer),
  Layer.provideMerge(PlatformLayer),
);
