#!/usr/bin/env node

// src/server/main.ts
import { Command as Command7 } from "commander";
import { Effect as Effect65 } from "effect";

// package.json
var package_default = {
  name: "@ctrip/spec-forge",
  version: "3.2.30",
  description: "A full-featured web-based Claude Code client that provides complete interactive functionality for managing Claude Code projects.",
  type: "module",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://git.dev.sh.ctripcorp.com/ticket/spec-forge.git"
  },
  homepage: "https://git.dev.sh.ctripcorp.com/ticket/spec-forge",
  files: [
    "dist"
  ],
  engines: {
    node: ">=20.11.0"
  },
  bin: {
    "spec-forge-viewer": "./dist/main.js"
  },
  scripts: {
    dev: "run-p 'dev:*'",
    "dev:frontend": "vite",
    "dev:backend": "NODE_ENV=development tsx watch src/server/main.ts",
    start: "node dist/main.js",
    build: "./scripts/build.sh",
    "build:frontend": "vite build",
    "build:backend": "esbuild src/server/main.ts --format=esm --bundle --packages=external --sourcemap --platform=node --outfile=dist/main.js",
    lint: "run-s 'lint:*'",
    "lint:biome-format": "biome format .",
    "lint:biome-lint": "biome check .",
    fix: "run-s 'fix:*'",
    "fix:biome-format": "biome format --write .",
    "fix:biome-lint": "biome check --write --unsafe .",
    typecheck: "tsc --noEmit",
    test: "vitest --run",
    "test:watch": "vitest",
    e2e: "./scripts/e2e/exec_e2e.sh",
    "e2e:start-server": "./scripts/e2e/start_server.sh",
    "e2e:capture-snapshots": "./scripts/e2e/capture_snapshots.sh",
    "lingui:extract": "lingui extract --clean && node ./scripts/lingui-sort.js",
    "lingui:compile": "lingui compile --typescript"
  },
  dependencies: {
    "@anthropic-ai/claude-agent-sdk": "0.2.20",
    "@anthropic-ai/claude-code": "2.1.29",
    "@anthropic-ai/sdk": "0.71.2",
    "@effect/cluster": "0.56.1",
    "@effect/experimental": "0.58.0",
    "@effect/platform": "0.94.2",
    "@effect/platform-node": "0.104.1",
    "@effect/rpc": "0.73.0",
    "@effect/sql": "0.49.0",
    "@effect/workflow": "0.16.0",
    "@hono/node-server": "1.19.9",
    "@hono/zod-validator": "0.7.6",
    "@lingui/core": "5.9.0",
    "@lingui/react": "5.9.0",
    "@radix-ui/react-avatar": "1.1.11",
    "@radix-ui/react-checkbox": "1.3.3",
    "@radix-ui/react-collapsible": "1.1.12",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-hover-card": "1.1.15",
    "@radix-ui/react-popover": "1.1.15",
    "@radix-ui/react-select": "2.2.6",
    "@radix-ui/react-slot": "1.2.4",
    "@radix-ui/react-tabs": "1.1.13",
    "@radix-ui/react-tooltip": "1.2.8",
    "@radix-ui/react-visually-hidden": "^1.2.4",
    "@tailwindcss/vite": "4.1.18",
    "@tanstack/react-devtools": "0.9.2",
    "@tanstack/react-query": "5.90.20",
    "@tanstack/react-router": "1.156.0",
    "@tanstack/react-router-devtools": "1.156.0",
    "class-variance-authority": "0.7.1",
    clsx: "2.1.1",
    commander: "^14.0.2",
    "date-fns": "4.1.0",
    effect: "3.19.15",
    "es-toolkit": "1.44.0",
    hono: "4.11.5",
    jotai: "2.16.2",
    "lucide-react": "0.563.0",
    mermaid: "^11.12.2",
    minisearch: "7.2.0",
    "parse-git-diff": "0.0.19",
    prexit: "2.3.0",
    react: "19.2.3",
    "react-dom": "19.2.3",
    "react-error-boundary": "6.1.0",
    "react-markdown": "10.1.0",
    "react-syntax-highlighter": "16.1.0",
    "react-zoom-pan-pinch": "^3.7.0",
    "remark-gfm": "4.0.1",
    sonner: "2.0.7",
    "tailwind-merge": "3.4.0",
    ulid: "3.0.2",
    yaml: "^2.8.2",
    zod: "4.3.6"
  },
  devDependencies: {
    "@biomejs/biome": "2.3.12",
    "@effect/language-service": "0.72.0",
    "@lingui/cli": "5.9.0",
    "@lingui/conf": "5.9.0",
    "@lingui/format-json": "5.9.0",
    "@lingui/loader": "5.9.0",
    "@lingui/vite-plugin": "5.9.0",
    "@tailwindcss/postcss": "4.1.18",
    "@tanstack/router-plugin": "1.156.0",
    "@tsconfig/strictest": "2.0.8",
    "@types/node": "25.0.10",
    "@types/react": "19.2.9",
    "@types/react-dom": "19.2.3",
    "@types/react-syntax-highlighter": "15.5.13",
    "@vitejs/plugin-react-swc": "4.2.2",
    dotenv: "17.2.3",
    esbuild: "0.27.2",
    lefthook: "2.0.15",
    "npm-run-all2": "8.0.4",
    playwright: "1.58.0",
    "release-it": "19.2.4",
    "release-it-pnpm": "4.6.6",
    tailwindcss: "4.1.18",
    tsx: "4.21.0",
    "tw-animate-css": "1.4.0",
    typescript: "5.9.3",
    vite: "7.3.1",
    vitest: "4.0.18"
  },
  packageManager: "pnpm@10.28.1+sha512.7d7dbbca9e99447b7c3bf7a73286afaaf6be99251eb9498baefa7d406892f67b879adb3a1d7e687fc4ccc1a388c7175fbaae567a26ab44d1067b54fcb0d6a316"
};

// src/server/core/platform/services/DeprecatedEnvDetector.ts
import { Console, Effect } from "effect";
var DEPRECATED_ENVS = {
  // Removed in PR #101
  CLAUDE_CODE_VIEWER_AUTH_PASSWORD: {
    type: "removed",
    newEnv: "CCV_PASSWORD",
    cliOption: "--password"
  },
  CLAUDE_CODE_VIEWER_CC_EXECUTABLE_PATH: {
    type: "removed",
    newEnv: "CCV_CC_EXECUTABLE_PATH",
    cliOption: "--executable"
  }
};
var getOptionalEnv = (key) => {
  return process.env[key] ?? void 0;
};
var detectDeprecatedEnvs = () => {
  const warnings = [];
  for (const [envKey, config] of Object.entries(DEPRECATED_ENVS)) {
    const value = getOptionalEnv(envKey);
    if (value !== void 0) {
      if (config.type === "removed") {
        warnings.push({
          type: "removed",
          envKey,
          message: `Environment variable ${envKey} has been removed.`,
          suggestion: config.newEnv ? `Please use ${config.newEnv} environment variable or ${config.cliOption} CLI option instead.` : `Please use ${config.cliOption} CLI option instead.`
        });
      } else {
        warnings.push({
          type: "deprecated",
          envKey,
          message: `Environment variable ${envKey} is deprecated and will be removed in a future release.`,
          suggestion: config.newEnv ? `Please migrate to ${config.newEnv} environment variable or ${config.cliOption} CLI option.` : `Please use ${config.cliOption} CLI option instead.`
        });
      }
    }
  }
  return warnings;
};
var formatWarning = (warning) => {
  const prefix = warning.type === "removed" ? "\u274C REMOVED" : "\u26A0\uFE0F  DEPRECATED";
  return `${prefix}: ${warning.message}
   \u2192 ${warning.suggestion}`;
};
var checkDeprecatedEnvs = Effect.gen(function* () {
  const warnings = detectDeprecatedEnvs();
  if (warnings.length === 0) {
    return;
  }
  const hasRemovedEnvs = warnings.some((warning) => warning.type === "removed");
  yield* Console.log("");
  yield* Console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  yield* Console.log("  Migration Guide");
  yield* Console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  yield* Console.log("");
  for (const warning of warnings) {
    yield* Console.log(formatWarning(warning));
    yield* Console.log("");
  }
  yield* Console.log("For more details, see:");
  yield* Console.log(
    "  https://git.dev.sh.ctripcorp.com/ticket/spec-forge#configuration"
  );
  yield* Console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  yield* Console.log("");
  if (hasRemovedEnvs) {
    yield* Effect.fail(
      new Error(
        "Cannot start server: removed environment variables detected. Please update your configuration."
      )
    );
  }
});

// src/server/startServer.ts
import { readFile } from "node:fs/promises";
import { resolve as resolve3 } from "node:path";
import { NodeContext as NodeContext2 } from "@effect/platform-node";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Effect as Effect64, Layer as Layer51 } from "effect";

// src/server/core/agent-session/index.ts
import { Layer as Layer3 } from "effect";

// src/server/core/agent-session/infrastructure/AgentSessionRepository.ts
import { FileSystem, Path } from "@effect/platform";
import { Context, Effect as Effect2, Layer } from "effect";

// src/lib/conversation-schema/index.ts
import { z as z17 } from "zod";

// src/lib/conversation-schema/entry/AssistantEntrySchema.ts
import { z as z8 } from "zod";

// src/lib/conversation-schema/message/AssistantMessageSchema.ts
import { z as z6 } from "zod";

// src/lib/conversation-schema/content/TextContentSchema.ts
import { z } from "zod";
var TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string()
});

// src/lib/conversation-schema/content/ThinkingContentSchema.ts
import { z as z2 } from "zod";
var ThinkingContentSchema = z2.object({
  type: z2.literal("thinking"),
  thinking: z2.string(),
  signature: z2.string().optional()
});

// src/lib/conversation-schema/content/ToolResultContentSchema.ts
import { z as z4 } from "zod";

// src/lib/conversation-schema/content/ImageContentSchema.ts
import { z as z3 } from "zod";
var ImageContentSchema = z3.object({
  type: z3.literal("image"),
  source: z3.object({
    type: z3.literal("base64"),
    data: z3.string(),
    media_type: z3.enum(["image/png", "image/jpeg", "image/gif", "image/webp"])
  })
});

// src/lib/conversation-schema/content/ToolResultContentSchema.ts
var ToolResultContentSchema = z4.object({
  type: z4.literal("tool_result"),
  tool_use_id: z4.string(),
  content: z4.union([
    z4.string(),
    z4.array(z4.union([TextContentSchema, ImageContentSchema]))
  ]),
  is_error: z4.boolean().optional()
});

// src/lib/conversation-schema/content/ToolUseContentSchema.ts
import { z as z5 } from "zod";
var ToolUseContentSchema = z5.object({
  type: z5.literal("tool_use"),
  id: z5.string(),
  name: z5.string(),
  input: z5.record(z5.string(), z5.unknown())
});

// src/lib/conversation-schema/message/AssistantMessageSchema.ts
var AssistantMessageContentSchema = z6.union([
  ThinkingContentSchema,
  TextContentSchema,
  ToolUseContentSchema,
  ToolResultContentSchema
]);
var AssistantMessageSchema = z6.object({
  id: z6.string(),
  container: z6.null().optional(),
  type: z6.literal("message"),
  role: z6.literal("assistant"),
  model: z6.string(),
  content: z6.array(AssistantMessageContentSchema),
  stop_reason: z6.string().nullable(),
  stop_sequence: z6.string().nullable().optional(),
  usage: z6.object({
    input_tokens: z6.number(),
    cache_creation_input_tokens: z6.number().optional(),
    cache_read_input_tokens: z6.number().optional(),
    cache_creation: z6.object({
      ephemeral_5m_input_tokens: z6.number(),
      ephemeral_1h_input_tokens: z6.number()
    }).optional(),
    output_tokens: z6.number(),
    service_tier: z6.string().nullable().optional(),
    server_tool_use: z6.object({
      web_search_requests: z6.number()
    }).optional()
  })
});

// src/lib/conversation-schema/entry/BaseEntrySchema.ts
import { z as z7 } from "zod";
var BaseEntrySchema = z7.object({
  // required
  isSidechain: z7.boolean(),
  userType: z7.enum(["external"]),
  cwd: z7.string(),
  sessionId: z7.string(),
  version: z7.string(),
  uuid: z7.uuid(),
  timestamp: z7.string(),
  // nullable
  parentUuid: z7.uuid().nullable(),
  // optional
  isMeta: z7.boolean().optional(),
  toolUseResult: z7.unknown().optional(),
  // Since each tool's schema varies greatly and may not be used, we use unknown
  gitBranch: z7.string().optional(),
  isCompactSummary: z7.boolean().optional(),
  agentId: z7.string().optional()
});

// src/lib/conversation-schema/entry/AssistantEntrySchema.ts
var AssistantEntrySchema = BaseEntrySchema.extend({
  // discriminator
  type: z8.literal("assistant"),
  // required
  message: AssistantMessageSchema,
  // optional
  requestId: z8.string().optional(),
  isApiErrorMessage: z8.boolean().optional()
});

// src/lib/conversation-schema/entry/FileHIstorySnapshotEntrySchema.ts
import { z as z9 } from "zod";
var FileHistorySnapshotEntrySchema = z9.object({
  // discriminator
  type: z9.literal("file-history-snapshot"),
  // required
  messageId: z9.string(),
  snapshot: z9.object({
    messageId: z9.string(),
    trackedFileBackups: z9.record(z9.string(), z9.unknown()),
    timestamp: z9.string()
  }),
  isSnapshotUpdate: z9.boolean()
});

// src/lib/conversation-schema/entry/ProgressEntrySchema.ts
import { z as z10 } from "zod";
var ProgressEntrySchema = BaseEntrySchema.extend({
  // discriminator
  type: z10.literal("progress"),
  // required
  data: z10.record(z10.string(), z10.any()),
  toolUseID: z10.string().optional(),
  parentToolUseID: z10.string().optional()
});

// src/lib/conversation-schema/entry/QueueOperationEntrySchema.ts
import { z as z12 } from "zod";

// src/lib/conversation-schema/content/DocumentContentSchema.ts
import { z as z11 } from "zod";
var DocumentContentSchema = z11.object({
  type: z11.literal("document"),
  source: z11.union([
    z11.object({
      media_type: z11.literal("text/plain"),
      type: z11.literal("text"),
      data: z11.string()
    }),
    z11.object({
      media_type: z11.enum(["application/pdf"]),
      type: z11.literal("base64"),
      data: z11.string()
    })
  ])
});

// src/lib/conversation-schema/entry/QueueOperationEntrySchema.ts
var QueueOperationContentSchema = z12.union([
  z12.string(),
  TextContentSchema,
  ToolResultContentSchema,
  ImageContentSchema,
  DocumentContentSchema
]);
var QueueOperationEntrySchema = z12.union([
  z12.object({
    type: z12.literal("queue-operation"),
    operation: z12.literal("enqueue"),
    content: z12.union([
      z12.string(),
      z12.array(z12.union([z12.string(), QueueOperationContentSchema]))
    ]),
    sessionId: z12.string(),
    timestamp: z12.iso.datetime()
  }),
  z12.object({
    type: z12.literal("queue-operation"),
    operation: z12.literal("dequeue"),
    sessionId: z12.string(),
    timestamp: z12.iso.datetime()
  }),
  z12.object({
    type: z12.literal("queue-operation"),
    operation: z12.literal("remove"),
    sessionId: z12.string(),
    timestamp: z12.iso.datetime()
  }),
  z12.object({
    type: z12.literal("queue-operation"),
    operation: z12.literal("popAll"),
    sessionId: z12.string(),
    timestamp: z12.iso.datetime(),
    content: z12.string().optional()
  })
]);

// src/lib/conversation-schema/entry/SummaryEntrySchema.ts
import { z as z13 } from "zod";
var SummaryEntrySchema = z13.object({
  type: z13.literal("summary"),
  summary: z13.string(),
  leafUuid: z13.string().uuid()
});

// src/lib/conversation-schema/entry/SystemEntrySchema.ts
import { z as z14 } from "zod";
var HookInfoSchema = z14.object({
  command: z14.string()
});
var SystemEntryWithContentSchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  content: z14.string(),
  toolUseID: z14.string(),
  level: z14.enum(["info"]),
  subtype: z14.undefined().optional()
});
var StopHookSummaryEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("stop_hook_summary"),
  toolUseID: z14.string(),
  level: z14.enum(["info", "suggestion"]),
  slug: z14.string().optional(),
  hookCount: z14.number(),
  hookInfos: z14.array(HookInfoSchema),
  hookErrors: z14.array(z14.unknown()),
  preventedContinuation: z14.boolean(),
  stopReason: z14.string(),
  hasOutput: z14.boolean()
});
var LocalCommandEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("local_command"),
  content: z14.string(),
  level: z14.enum(["info"])
});
var TurnDurationEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("turn_duration"),
  durationMs: z14.number(),
  slug: z14.string().optional()
});
var CompactBoundaryEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("compact_boundary"),
  content: z14.string(),
  level: z14.enum(["info"]),
  slug: z14.string().optional(),
  logicalParentUuid: z14.string().optional(),
  compactMetadata: z14.object({
    trigger: z14.string(),
    preTokens: z14.number()
  }).optional()
});
var ApiErrorEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("api_error"),
  level: z14.enum(["error", "warning", "info"]),
  error: z14.object({
    status: z14.number().optional(),
    headers: z14.record(z14.string(), z14.unknown()).optional(),
    requestID: z14.string().nullable().optional(),
    error: z14.object({
      type: z14.string(),
      error: z14.object({
        type: z14.string(),
        message: z14.string()
      }).optional(),
      message: z14.string().optional()
    }).optional()
  }),
  retryInMs: z14.number().optional(),
  retryAttempt: z14.number().optional(),
  maxRetries: z14.number().optional()
});
var MicrocompactBoundaryEntrySchema = BaseEntrySchema.extend({
  type: z14.literal("system"),
  subtype: z14.literal("microcompact_boundary"),
  content: z14.string(),
  level: z14.enum(["info"]),
  slug: z14.string().optional(),
  microcompactMetadata: z14.object({
    trigger: z14.string(),
    preTokens: z14.number(),
    tokensSaved: z14.number(),
    compactedToolIds: z14.array(z14.string()),
    clearedAttachmentUUIDs: z14.array(z14.string())
  }).optional()
});
var SystemEntrySchema = z14.union([
  StopHookSummaryEntrySchema,
  LocalCommandEntrySchema,
  TurnDurationEntrySchema,
  CompactBoundaryEntrySchema,
  MicrocompactBoundaryEntrySchema,
  ApiErrorEntrySchema,
  SystemEntryWithContentSchema
  // Must be last (catch-all for undefined subtype)
]);

// src/lib/conversation-schema/entry/UserEntrySchema.ts
import { z as z16 } from "zod";

// src/lib/conversation-schema/message/UserMessageSchema.ts
import { z as z15 } from "zod";
var UserMessageContentSchema = z15.union([
  z15.string(),
  TextContentSchema,
  ToolResultContentSchema,
  ImageContentSchema,
  DocumentContentSchema
]);
var UserMessageSchema = z15.object({
  role: z15.literal("user"),
  content: z15.union([
    z15.string(),
    z15.array(z15.union([z15.string(), UserMessageContentSchema]))
  ])
});

// src/lib/conversation-schema/entry/UserEntrySchema.ts
var UserEntrySchema = BaseEntrySchema.extend({
  // discriminator
  type: z16.literal("user"),
  // required
  message: UserMessageSchema
});

// src/lib/conversation-schema/index.ts
var ConversationSchema = z17.union([
  UserEntrySchema,
  AssistantEntrySchema,
  SummaryEntrySchema,
  SystemEntrySchema,
  FileHistorySnapshotEntrySchema,
  QueueOperationEntrySchema,
  ProgressEntrySchema
]);

// src/server/core/claude-code/functions/parseJsonl.ts
var parseJsonl = (content) => {
  const lines = content.trim().split("\n").filter((line) => line.trim() !== "");
  return lines.map((line, index) => {
    const parsed = ConversationSchema.safeParse(JSON.parse(line));
    if (!parsed.success) {
      const errorData = {
        type: "x-error",
        line,
        lineNumber: index + 1
      };
      return errorData;
    }
    return parsed.data;
  });
};

// src/server/core/project/functions/id.ts
import { dirname } from "node:path";
var encodeProjectId = (fullPath) => {
  return Buffer.from(fullPath).toString("base64url");
};
var decodeProjectId = (id) => {
  return Buffer.from(id, "base64url").toString("utf-8");
};
var encodeProjectIdFromSessionFilePath = (sessionFilePath) => {
  return encodeProjectId(dirname(sessionFilePath));
};

// src/server/core/agent-session/infrastructure/AgentSessionRepository.ts
var LayerImpl = Effect2.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const getAgentSessionByAgentId = (projectId, agentId, sessionId) => Effect2.gen(function* () {
    const projectPath = decodeProjectId(projectId);
    if (sessionId) {
      const newPath = path.resolve(
        projectPath,
        sessionId,
        "subagents",
        `agent-${agentId}.jsonl`
      );
      if (yield* fs.exists(newPath)) {
        const content2 = yield* fs.readFileString(newPath);
        return parseJsonl(content2);
      }
    }
    const agentFilePath = path.resolve(projectPath, `agent-${agentId}.jsonl`);
    const exists = yield* fs.exists(agentFilePath);
    if (!exists) {
      return null;
    }
    const content = yield* fs.readFileString(agentFilePath);
    const conversations = parseJsonl(content);
    return conversations;
  });
  return {
    getAgentSessionByAgentId
  };
});
var AgentSessionRepository = class extends Context.Tag(
  "AgentSessionRepository"
)() {
  static {
    this.Live = Layer.effect(this, LayerImpl);
  }
};

// src/server/core/agent-session/presentation/AgentSessionController.ts
import { Context as Context2, Effect as Effect3, Layer as Layer2 } from "effect";
var LayerImpl2 = Effect3.gen(function* () {
  const repository = yield* AgentSessionRepository;
  const getAgentSession = (params) => Effect3.gen(function* () {
    const { projectId, agentId, sessionId } = params;
    const conversations = yield* repository.getAgentSessionByAgentId(
      projectId,
      agentId,
      sessionId
    );
    if (conversations === null) {
      return {
        status: 200,
        response: {
          agentSessionId: null,
          conversations: []
        }
      };
    }
    return {
      status: 200,
      response: {
        agentSessionId: agentId,
        conversations
      }
    };
  });
  return {
    getAgentSession
  };
});
var AgentSessionController = class extends Context2.Tag(
  "AgentSessionController"
)() {
  static {
    this.Live = Layer2.effect(this, LayerImpl2);
  }
};

// src/server/core/agent-session/index.ts
var AgentSessionLayer = Layer3.mergeAll(AgentSessionRepository.Live);

// src/server/core/claude-code/presentation/ClaudeCodeController.ts
import { FileSystem as FileSystem6, Path as Path8 } from "@effect/platform";
import { Context as Context9, Effect as Effect13, Layer as Layer11 } from "effect";

// src/server/core/platform/services/ApplicationContext.ts
import { homedir } from "node:os";
import { Path as Path2 } from "@effect/platform";
import { Effect as Effect5, Context as EffectContext, Layer as Layer5 } from "effect";

// src/server/core/platform/services/CcvOptionsService.ts
import { Context as Context3, Effect as Effect4, Layer as Layer4, Ref } from "effect";
var getOptionalEnv2 = (key) => {
  return process.env[key] ?? void 0;
};
var LayerImpl3 = Effect4.gen(function* () {
  const ccvOptionsRef = yield* Ref.make(void 0);
  const loadCliOptions = (cliOptions) => {
    return Effect4.gen(function* () {
      yield* Ref.update(ccvOptionsRef, () => {
        return {
          port: Number.parseInt(
            cliOptions.port ?? getOptionalEnv2("PORT") ?? "3000",
            10
          ),
          hostname: cliOptions.hostname ?? getOptionalEnv2("HOSTNAME") ?? "localhost",
          password: cliOptions.password ?? getOptionalEnv2("CCV_PASSWORD") ?? void 0,
          executable: cliOptions.executable ?? getOptionalEnv2("CCV_CC_EXECUTABLE_PATH") ?? void 0,
          claudeDir: cliOptions.claudeDir ?? getOptionalEnv2("CCV_GLOBAL_CLAUDE_DIR")
        };
      });
    });
  };
  const getCcvOptions = (key) => {
    return Effect4.gen(function* () {
      const ccvOptions = yield* Ref.get(ccvOptionsRef);
      if (ccvOptions === void 0) {
        throw new Error("Unexpected error: CCV options are not loaded");
      }
      return ccvOptions[key];
    });
  };
  return {
    loadCliOptions,
    getCcvOptions
  };
});
var CcvOptionsService = class extends Context3.Tag("CcvOptionsService")() {
  static {
    this.Live = Layer4.effect(this, LayerImpl3);
  }
};

// src/server/core/platform/services/ApplicationContext.ts
var LayerImpl4 = Effect5.gen(function* () {
  const path = yield* Path2.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const claudeCodePaths = Effect5.gen(function* () {
    const globalClaudeDirectoryPath = yield* ccvOptionsService.getCcvOptions("claudeDir").pipe(
      Effect5.map(
        (envVar) => envVar === void 0 ? path.resolve(homedir(), ".claude") : path.resolve(envVar)
      )
    );
    return {
      globalClaudeDirectoryPath,
      claudeCommandsDirPath: path.resolve(
        globalClaudeDirectoryPath,
        "commands"
      ),
      claudeSkillsDirPath: path.resolve(globalClaudeDirectoryPath, "skills"),
      claudeProjectsDirPath: path.resolve(
        globalClaudeDirectoryPath,
        "projects"
      )
    };
  });
  return {
    claudeCodePaths
  };
});
var ApplicationContext = class extends EffectContext.Tag("ApplicationContext")() {
  static {
    this.Live = Layer5.effect(this, LayerImpl4);
  }
};

// src/server/core/project/infrastructure/ProjectRepository.ts
import { FileSystem as FileSystem4, Path as Path5 } from "@effect/platform";
import { Context as Context7, Effect as Effect9, Layer as Layer9, Option as Option2 } from "effect";

// src/server/core/project/services/ProjectMetaService.ts
import { FileSystem as FileSystem3, Path as Path4 } from "@effect/platform";
import { Context as Context6, Effect as Effect8, Layer as Layer8, Option, Ref as Ref3 } from "effect";
import { z as z19 } from "zod";

// src/server/lib/storage/FileCacheStorage/index.ts
import { Context as Context5, Effect as Effect7, Layer as Layer7, Ref as Ref2, Runtime } from "effect";

// src/server/lib/storage/FileCacheStorage/PersistentService.ts
import { FileSystem as FileSystem2, Path as Path3 } from "@effect/platform";
import { Context as Context4, Effect as Effect6, Layer as Layer6 } from "effect";
import { z as z18 } from "zod";

// src/server/lib/config/paths.ts
import { homedir as homedir2 } from "node:os";
import { resolve } from "node:path";
var claudeCodeViewerCacheDirPath = resolve(
  homedir2(),
  ".spec-forge-viewer",
  "cache"
);

// src/server/lib/storage/FileCacheStorage/PersistentService.ts
var saveSchema = z18.array(z18.tuple([z18.string(), z18.unknown()]));
var LayerImpl5 = Effect6.gen(function* () {
  const path = yield* Path3.Path;
  const getCacheFilePath = (key) => path.resolve(claudeCodeViewerCacheDirPath, `${key}.json`);
  const load = (key) => {
    const cacheFilePath = getCacheFilePath(key);
    return Effect6.gen(function* () {
      const fs = yield* FileSystem2.FileSystem;
      if (!(yield* fs.exists(claudeCodeViewerCacheDirPath))) {
        yield* fs.makeDirectory(claudeCodeViewerCacheDirPath, {
          recursive: true
        });
      }
      if (!(yield* fs.exists(cacheFilePath))) {
        yield* fs.writeFileString(cacheFilePath, "[]");
      } else {
        const content = yield* fs.readFileString(cacheFilePath);
        const parsed = (() => {
          try {
            return saveSchema.parse(JSON.parse(content));
          } catch (error) {
            console.error(`Cache file parse error: ${error}`);
            return void 0;
          }
        })();
        if (parsed === void 0 || parsed.length === 0) {
          console.error(`Cache file removed: ${cacheFilePath}`);
          yield* fs.writeFileString(cacheFilePath, "[]");
        } else {
          return parsed;
        }
      }
      return [];
    });
  };
  const save = (key, entries) => {
    const cacheFilePath = getCacheFilePath(key);
    return Effect6.gen(function* () {
      const fs = yield* FileSystem2.FileSystem;
      yield* fs.writeFileString(cacheFilePath, JSON.stringify(entries));
    });
  };
  return {
    load,
    save
  };
});
var PersistentService = class extends Context4.Tag("PersistentService")() {
  static {
    this.Live = Layer6.effect(this, LayerImpl5);
  }
};

// src/server/lib/storage/FileCacheStorage/index.ts
var FileCacheStorage = () => Context5.GenericTag("FileCacheStorage");
var makeFileCacheStorageLayer = (storageKey, schema) => Layer7.effect(
  FileCacheStorage(),
  Effect7.gen(function* () {
    const persistentService = yield* PersistentService;
    const runtime = yield* Effect7.runtime();
    const storageRef = yield* Effect7.gen(function* () {
      const persistedData = yield* persistentService.load(storageKey);
      const initialMap = /* @__PURE__ */ new Map();
      for (const [key, value] of persistedData) {
        const parsed = schema.safeParse(value);
        if (parsed.success) {
          initialMap.set(key, parsed.data);
        }
      }
      return yield* Ref2.make(initialMap);
    });
    const syncToFile = (entries) => {
      Runtime.runFork(runtime)(persistentService.save(storageKey, entries));
    };
    return {
      get: (key) => Effect7.gen(function* () {
        const storage = yield* Ref2.get(storageRef);
        return storage.get(key);
      }),
      set: (key, value) => Effect7.gen(function* () {
        const before = yield* Ref2.get(storageRef);
        const beforeString = JSON.stringify(Array.from(before.entries()));
        yield* Ref2.update(storageRef, (map) => {
          map.set(key, value);
          return map;
        });
        const after = yield* Ref2.get(storageRef);
        const afterString = JSON.stringify(Array.from(after.entries()));
        if (beforeString !== afterString) {
          syncToFile(Array.from(after.entries()));
        }
      }),
      invalidate: (key) => Effect7.gen(function* () {
        const before = yield* Ref2.get(storageRef);
        if (!before.has(key)) {
          return;
        }
        yield* Ref2.update(storageRef, (map) => {
          map.delete(key);
          return map;
        });
        const after = yield* Ref2.get(storageRef);
        syncToFile(Array.from(after.entries()));
      }),
      getAll: () => Effect7.gen(function* () {
        const storage = yield* Ref2.get(storageRef);
        return new Map(storage);
      })
    };
  })
);

// src/server/core/project/services/ProjectMetaService.ts
var ProjectPathSchema = z19.string().nullable();
var LayerImpl6 = Effect8.gen(function* () {
  const fs = yield* FileSystem3.FileSystem;
  const path = yield* Path4.Path;
  const projectPathCache = yield* FileCacheStorage();
  const projectMetaCacheRef = yield* Ref3.make(/* @__PURE__ */ new Map());
  const extractProjectPathFromJsonl = (filePath) => Effect8.gen(function* () {
    const cached = yield* projectPathCache.get(filePath);
    if (cached !== void 0) {
      return cached;
    }
    const content = yield* fs.readFileString(filePath);
    const lines = content.split("\n");
    let cwd = null;
    for (const line of lines) {
      const conversation = parseJsonl(line).at(0);
      if (conversation === void 0 || conversation.type === "summary" || conversation.type === "x-error" || conversation.type === "file-history-snapshot" || conversation.type === "queue-operation") {
        continue;
      }
      cwd = conversation.cwd;
      break;
    }
    if (cwd !== null) {
      yield* projectPathCache.set(filePath, cwd);
    }
    return cwd;
  });
  const getProjectMeta = (projectId) => Effect8.gen(function* () {
    const metaCache = yield* Ref3.get(projectMetaCacheRef);
    const cached = metaCache.get(projectId);
    if (cached !== void 0) {
      return cached;
    }
    const claudeProjectPath = decodeProjectId(projectId);
    const dirents = yield* fs.readDirectory(claudeProjectPath);
    const fileEntries = yield* Effect8.all(
      dirents.filter((name) => name.endsWith(".jsonl")).map(
        (name) => Effect8.gen(function* () {
          const fullPath = path.resolve(claudeProjectPath, name);
          const stat = yield* fs.stat(fullPath);
          const mtime = Option.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date(0));
          return {
            fullPath,
            mtime
          };
        })
      ),
      { concurrency: "unbounded" }
    );
    const files = fileEntries.sort((a, b) => {
      return a.mtime.getTime() - b.mtime.getTime();
    });
    let projectPath = null;
    for (const file of files) {
      projectPath = yield* extractProjectPathFromJsonl(file.fullPath);
      if (projectPath === null) {
        continue;
      }
      break;
    }
    const projectMeta = {
      projectName: projectPath ? path.basename(projectPath) : null,
      projectPath,
      sessionCount: files.length
    };
    yield* Ref3.update(projectMetaCacheRef, (cache) => {
      cache.set(projectId, projectMeta);
      return cache;
    });
    return projectMeta;
  });
  const invalidateProject = (projectId) => Effect8.gen(function* () {
    yield* Ref3.update(projectMetaCacheRef, (cache) => {
      cache.delete(projectId);
      return cache;
    });
  });
  return {
    getProjectMeta,
    invalidateProject
  };
});
var ProjectMetaService = class extends Context6.Tag("ProjectMetaService")() {
  static {
    this.Live = Layer8.effect(this, LayerImpl6).pipe(
      Layer8.provide(
        makeFileCacheStorageLayer("project-path-cache", ProjectPathSchema)
      ),
      Layer8.provide(PersistentService.Live)
    );
  }
};

// src/server/core/project/infrastructure/ProjectRepository.ts
var LayerImpl7 = Effect9.gen(function* () {
  const fs = yield* FileSystem4.FileSystem;
  const path = yield* Path5.Path;
  const projectMetaService = yield* ProjectMetaService;
  const context = yield* ApplicationContext;
  const getProject = (projectId) => Effect9.gen(function* () {
    const fullPath = decodeProjectId(projectId);
    const exists = yield* fs.exists(fullPath);
    if (!exists) {
      return yield* Effect9.fail(new Error("Project not found"));
    }
    const stat = yield* fs.stat(fullPath);
    const meta = yield* projectMetaService.getProjectMeta(projectId);
    return {
      project: {
        id: projectId,
        claudeProjectPath: fullPath,
        lastModifiedAt: Option2.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date()),
        meta
      }
    };
  });
  const getProjects = () => Effect9.gen(function* () {
    const dirExists = yield* fs.exists(
      (yield* context.claudeCodePaths).claudeProjectsDirPath
    );
    if (!dirExists) {
      console.warn(
        `Claude projects directory not found at ${(yield* context.claudeCodePaths).claudeProjectsDirPath}`
      );
      return { projects: [] };
    }
    const entries = yield* fs.readDirectory(
      (yield* context.claudeCodePaths).claudeProjectsDirPath
    );
    const projectEffects = entries.map(
      (entry) => Effect9.gen(function* () {
        const fullPath = path.resolve(
          (yield* context.claudeCodePaths).claudeProjectsDirPath,
          entry
        );
        const stat = yield* Effect9.tryPromise(
          () => fs.stat(fullPath).pipe(Effect9.runPromise)
        ).pipe(Effect9.catchAll(() => Effect9.succeed(null)));
        if (!stat || stat.type !== "Directory") {
          return null;
        }
        const id = encodeProjectId(fullPath);
        const meta = yield* projectMetaService.getProjectMeta(id);
        return {
          id,
          claudeProjectPath: fullPath,
          lastModifiedAt: Option2.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date()),
          meta
        };
      })
    );
    const projectsWithNulls = yield* Effect9.all(projectEffects, {
      concurrency: "unbounded"
    });
    const projects = projectsWithNulls.filter(
      (p) => p !== null
    );
    const sortedProjects = projects.sort((a, b) => {
      return (b.lastModifiedAt ? b.lastModifiedAt.getTime() : 0) - (a.lastModifiedAt ? a.lastModifiedAt.getTime() : 0);
    });
    return { projects: sortedProjects };
  });
  return {
    getProject,
    getProjects
  };
});
var ProjectRepository = class extends Context7.Tag("ProjectRepository")() {
  static {
    this.Live = Layer9.effect(this, LayerImpl7);
  }
};

// src/server/core/claude-code/functions/scanCommandFiles.ts
import { FileSystem as FileSystem5, Path as Path6 } from "@effect/platform";
import { Effect as Effect10 } from "effect";
var parseCommandFrontmatter = (content) => {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch?.[1]) {
    return { description: null, argumentHint: null };
  }
  const frontmatter = frontmatterMatch[1];
  const descriptionMatch = frontmatter.match(
    /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m
  );
  const description = descriptionMatch?.[1]?.trim() ?? null;
  const argumentHintMatch = frontmatter.match(
    /^argument-hint:\s*['"]?([^'"\n]+)['"]?\s*$/m
  );
  const argumentHint = argumentHintMatch?.[1]?.trim() ?? null;
  return { description, argumentHint };
};
var pathToCommandName = (filePath, baseDir) => {
  const normalizedBaseDir = baseDir.endsWith("/") ? baseDir.slice(0, -1) : baseDir;
  const relativePath = filePath.startsWith(normalizedBaseDir) ? filePath.slice(normalizedBaseDir.length + 1) : filePath;
  return relativePath.replace(/\.md$/, "").replace(/\//g, ":");
};
var scanCommandFilesWithMetadata = (dirPath) => Effect10.gen(function* () {
  const fs = yield* FileSystem5.FileSystem;
  const path = yield* Path6.Path;
  const scanDirectory = (currentPath) => Effect10.gen(function* () {
    const exists = yield* fs.exists(currentPath);
    if (!exists) {
      return [];
    }
    const items = yield* fs.readDirectory(currentPath);
    const results = yield* Effect10.forEach(
      items,
      (item) => Effect10.gen(function* () {
        if (item.startsWith(".")) {
          return [];
        }
        const itemPath = path.join(currentPath, item);
        const info = yield* fs.stat(itemPath);
        if (info.type === "Directory") {
          return yield* scanDirectory(itemPath);
        }
        if (info.type === "File" && item.endsWith(".md")) {
          const content = yield* fs.readFileString(itemPath);
          const { description, argumentHint } = parseCommandFrontmatter(content);
          const name = pathToCommandName(itemPath, dirPath);
          return [{ name, description, argumentHint }];
        }
        return [];
      }),
      { concurrency: "unbounded" }
    );
    return results.flat();
  });
  return yield* scanDirectory(dirPath).pipe(
    Effect10.match({
      onSuccess: (items) => items,
      onFailure: () => []
    })
  );
});
var scanSkillFilesWithMetadata = (dirPath) => Effect10.gen(function* () {
  const fs = yield* FileSystem5.FileSystem;
  const path = yield* Path6.Path;
  const scanDirectory = (currentPath, relativePath) => Effect10.gen(function* () {
    const exists = yield* fs.exists(currentPath);
    if (!exists) {
      return [];
    }
    const skillFilePath = path.join(currentPath, "SKILL.md");
    const skillFileExists = yield* fs.exists(skillFilePath);
    const skills = [];
    if (skillFileExists) {
      const skillName = relativePath.replace(/\//g, ":");
      if (skillName) {
        const content = yield* fs.readFileString(skillFilePath);
        const { description, argumentHint } = parseCommandFrontmatter(content);
        skills.push({ name: skillName, description, argumentHint });
      }
    }
    const items = yield* fs.readDirectory(currentPath);
    const results = yield* Effect10.forEach(
      items,
      (item) => Effect10.gen(function* () {
        if (item.startsWith(".")) {
          return [];
        }
        const itemPath = path.join(currentPath, item);
        const info = yield* fs.stat(itemPath);
        if (info.type === "Directory") {
          const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
          return yield* scanDirectory(itemPath, newRelativePath);
        }
        return [];
      }),
      { concurrency: "unbounded" }
    );
    return [...skills, ...results.flat()];
  });
  return yield* scanDirectory(dirPath, "").pipe(
    Effect10.match({
      onSuccess: (items) => items,
      onFailure: () => []
    })
  );
});

// src/server/core/claude-code/models/ClaudeCodeVersion.ts
import { z as z20 } from "zod";
var versionRegex = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;
var versionSchema = z20.object({
  major: z20.string().transform((value) => Number.parseInt(value, 10)),
  minor: z20.string().transform((value) => Number.parseInt(value, 10)),
  patch: z20.string().transform((value) => Number.parseInt(value, 10))
}).refine(
  (data) => [data.major, data.minor, data.patch].every((value) => !Number.isNaN(value))
);
var fromCLIString = (versionOutput) => {
  const groups = versionOutput.trim().match(versionRegex)?.groups;
  if (groups === void 0) {
    return null;
  }
  const parsed = versionSchema.safeParse(groups);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
};
var versionText = (version) => `${version.major}.${version.minor}.${version.patch}`;
var equals = (a, b) => a.major === b.major && a.minor === b.minor && a.patch === b.patch;
var greaterThan = (a, b) => a.major > b.major || a.major === b.major && (a.minor > b.minor || a.minor === b.minor && a.patch > b.patch);
var greaterThanOrEqual = (a, b) => equals(a, b) || greaterThan(a, b);

// src/server/core/claude-code/services/ClaudeCodeService.ts
import { Context as Context8, Data as Data2, Effect as Effect12, Layer as Layer10 } from "effect";

// src/server/core/claude-code/functions/parseMcpListOutput.ts
var parseMcpListOutput = (output) => {
  const servers = [];
  const lines = output.trim().split("\n");
  for (const line of lines) {
    if (line.includes("Checking MCP server health") || line.trim() === "") {
      continue;
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const name = line.substring(0, colonIndex).trim();
      const rest = line.substring(colonIndex + 1).trim();
      let status = "unknown";
      if (rest.includes("\u2713") || rest.toLowerCase().includes("connected")) {
        status = "connected";
      } else if (rest.includes("\u2717") || rest.toLowerCase().includes("failed")) {
        status = "failed";
      }
      const command = rest.replace(/\s*-\s*[✓✗].*$/, "").trim();
      if (name && command) {
        servers.push({ name, command, status });
      }
    }
  }
  return servers;
};

// src/server/core/claude-code/models/ClaudeCode.ts
import * as agentSdk from "@anthropic-ai/claude-agent-sdk";
import { Command, Path as Path7 } from "@effect/platform";
import { Data, Effect as Effect11 } from "effect";
import { uniq } from "es-toolkit";
var npxCacheRegExp = /_npx[/\\].*node_modules[\\/]\.bin/;
var localNodeModulesBinRegExp = new RegExp(
  `${process.cwd()}/node_modules/.bin`
);
var claudeCodePathPriority = (path) => {
  if (npxCacheRegExp.test(path)) {
    return 0;
  }
  if (localNodeModulesBinRegExp.test(path)) {
    return 1;
  }
  return 2;
};
var ClaudeCodePathNotFoundError = class extends Data.TaggedError(
  "ClaudeCodePathNotFoundError"
) {
};
var ClaudeCodeAgentSdkNotSupportedError = class extends Data.TaggedError(
  "ClaudeCodeAgentSdkNotSupportedError"
) {
};
var resolveClaudeCodePath = Effect11.gen(function* () {
  const path = yield* Path7.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const specifiedExecutablePath = yield* ccvOptionsService.getCcvOptions("executable");
  if (specifiedExecutablePath !== void 0) {
    return path.resolve(specifiedExecutablePath);
  }
  const claudePaths = yield* Command.string(
    Command.make("which", "-a", "claude").pipe(Command.runInShell(true))
  ).pipe(
    Effect11.map(
      (output) => output.split("\n").map((line) => line.trim()).filter((line) => line !== "") ?? []
    ),
    Effect11.map(
      (paths) => uniq(paths).toSorted((a, b) => {
        const aPriority = claudeCodePathPriority(a);
        const bPriority = claudeCodePathPriority(b);
        if (aPriority < bPriority) {
          return 1;
        }
        if (aPriority > bPriority) {
          return -1;
        }
        return 0;
      })
    ),
    Effect11.catchAll(() => Effect11.succeed([]))
  );
  const resolvedClaudePath = claudePaths.at(0);
  if (resolvedClaudePath === void 0) {
    return yield* Effect11.fail(
      new ClaudeCodePathNotFoundError({
        message: "Claude Code CLI not found in any location"
      })
    );
  }
  return resolvedClaudePath;
});
var Config = Effect11.gen(function* () {
  const claudeCodeExecutablePath = yield* resolveClaudeCodePath;
  const claudeCodeVersion = fromCLIString(
    yield* Command.string(Command.make(claudeCodeExecutablePath, "--version"))
  );
  return {
    claudeCodeExecutablePath,
    claudeCodeVersion
  };
});
var getMcpListOutput = (projectCwd) => Effect11.gen(function* () {
  const { claudeCodeExecutablePath } = yield* Config;
  const command = Command.make(
    "cd",
    projectCwd,
    "&&",
    claudeCodeExecutablePath,
    "mcp",
    "list"
  );
  const output = yield* Command.string(
    command.pipe(Command.runInShell(true))
  );
  return output;
});
var getAvailableFeatures = (claudeCodeVersion) => ({
  canUseTool: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 82
  }) : false,
  uuidOnSDKMessage: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 86
  }) : false,
  agentSdk: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 125
    // ClaudeCodeAgentSDK is available since v1.0.125
  }) : false,
  sidechainSeparation: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 0,
    patch: 28
    // Sidechain conversations stored in agent-*.jsonl since v2.0.28
  }) : false,
  runSkillsDirectly: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 1,
    patch: 0
  }) || greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 0,
    patch: 77
  }) : false
});
var query2 = (prompt, options) => {
  const { canUseTool, permissionMode, hooks, ...baseOptions } = options;
  return Effect11.gen(function* () {
    const { claudeCodeExecutablePath, claudeCodeVersion } = yield* Config;
    const availableFeatures = getAvailableFeatures(claudeCodeVersion);
    const options2 = {
      ...baseOptions,
      pathToClaudeCodeExecutable: claudeCodeExecutablePath,
      ...baseOptions,
      disallowedTools: ["AskUserQuestion"],
      // Cannot answer from web interface instead of CLI
      ...availableFeatures.canUseTool ? { canUseTool, permissionMode } : {
        permissionMode: "bypassPermissions"
      }
    };
    if (!availableFeatures.agentSdk) {
      return yield* Effect11.fail(
        new ClaudeCodeAgentSdkNotSupportedError({
          message: "Agent SDK is not supported in this version of Claude Code"
        })
      );
    }
    return agentSdk.query({
      prompt,
      options: {
        systemPrompt: { type: "preset", preset: "claude_code" },
        settingSources: ["user", "project", "local"],
        ...options2
      }
    });
  });
};

// src/server/core/claude-code/services/ClaudeCodeService.ts
var ProjectPathNotFoundError = class extends Data2.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var LayerImpl8 = Effect12.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const getClaudeCodeMeta = () => Effect12.gen(function* () {
    const config = yield* Config;
    return config;
  });
  const getAvailableFeatures2 = () => Effect12.gen(function* () {
    const config = yield* Config;
    const features = getAvailableFeatures(
      config.claudeCodeVersion
    );
    return features;
  });
  const getMcpList = (projectId) => Effect12.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect12.fail(new ProjectPathNotFoundError({ projectId }));
    }
    const output = yield* getMcpListOutput(
      project.meta.projectPath
    );
    return parseMcpListOutput(output);
  });
  return {
    getClaudeCodeMeta,
    getMcpList,
    getAvailableFeatures: getAvailableFeatures2
  };
});
var ClaudeCodeService = class extends Context8.Tag("ClaudeCodeService")() {
  static {
    this.Live = Layer10.effect(this, LayerImpl8);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeController.ts
var LayerImpl9 = Effect13.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeService = yield* ClaudeCodeService;
  const context = yield* ApplicationContext;
  yield* FileSystem6.FileSystem;
  const path = yield* Path8.Path;
  const getClaudeCommands = (options) => Effect13.gen(function* () {
    const { projectId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    const features = yield* claudeCodeService.getAvailableFeatures();
    const globalCommands = yield* scanCommandFilesWithMetadata(
      (yield* context.claudeCodePaths).claudeCommandsDirPath
    );
    const projectCommands = project.meta.projectPath === null ? [] : yield* scanCommandFilesWithMetadata(
      path.resolve(project.meta.projectPath, ".claude", "commands")
    );
    const globalSkills = features.runSkillsDirectly ? yield* scanSkillFilesWithMetadata(
      (yield* context.claudeCodePaths).claudeSkillsDirPath
    ) : [];
    const projectSkills = features.runSkillsDirectly && project.meta.projectPath !== null ? yield* scanSkillFilesWithMetadata(
      path.resolve(project.meta.projectPath, ".claude", "skills")
    ) : [];
    const defaultCommands = [
      {
        name: "init",
        description: "Initialize Claude Code in current project",
        argumentHint: null
      },
      {
        name: "compact",
        description: "Compact conversation history",
        argumentHint: null
      },
      {
        name: "security-review",
        description: "Review code for security issues",
        argumentHint: null
      },
      {
        name: "review",
        description: "Review code changes",
        argumentHint: null
      }
    ];
    const toNames = (commands) => commands.map((c) => c.name);
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
        defaultCommandsLegacy: toNames(defaultCommands)
      },
      status: 200
    };
  });
  const getMcpListRoute = (options) => Effect13.gen(function* () {
    const { projectId } = options;
    const servers = yield* claudeCodeService.getMcpList(projectId);
    return {
      response: { servers },
      status: 200
    };
  });
  const getClaudeCodeMeta = () => Effect13.gen(function* () {
    const config = yield* claudeCodeService.getClaudeCodeMeta();
    return {
      response: {
        executablePath: config.claudeCodeExecutablePath,
        version: config.claudeCodeVersion ? versionText(config.claudeCodeVersion) : null
      },
      status: 200
    };
  });
  const getAvailableFeatures2 = () => Effect13.gen(function* () {
    const features = yield* claudeCodeService.getAvailableFeatures();
    const featuresList = Object.entries(features).flatMap(([key, value]) => {
      return [
        {
          name: key,
          enabled: value
        }
      ];
    });
    return {
      response: { features: featuresList },
      status: 200
    };
  });
  return {
    getClaudeCommands,
    getMcpListRoute,
    getClaudeCodeMeta,
    getAvailableFeatures: getAvailableFeatures2
  };
});
var ClaudeCodeController = class extends Context9.Tag("ClaudeCodeController")() {
  static {
    this.Live = Layer11.effect(this, LayerImpl9);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodePermissionController.ts
import { Context as Context12, Effect as Effect16, Layer as Layer14 } from "effect";

// src/server/core/claude-code/services/ClaudeCodePermissionService.ts
import { Context as Context11, Effect as Effect15, Layer as Layer13, Ref as Ref4 } from "effect";
import { ulid } from "ulid";

// src/server/core/events/services/EventBus.ts
import { Context as Context10, Effect as Effect14, Layer as Layer12 } from "effect";
var layerImpl = Effect14.gen(function* () {
  const listenersMap = /* @__PURE__ */ new Map();
  const getListeners = (event) => {
    if (!listenersMap.has(event)) {
      listenersMap.set(event, /* @__PURE__ */ new Set());
    }
    return listenersMap.get(event);
  };
  const emit = (event, data) => Effect14.gen(function* () {
    const listeners = getListeners(event);
    const results = yield* Effect14.tryPromise({
      try: () => Promise.allSettled(
        Array.from(listeners).map(async (listener) => {
          await listener(data);
        })
      ),
      catch: (error) => {
        console.error(
          `[EventBus] Failed to execute listeners for event "${String(event)}":`,
          error
        );
        return new Error(String(error));
      }
    }).pipe(
      Effect14.catchAll(() => {
        return Effect14.succeed([]);
      })
    );
    const failures = results.filter(
      (result) => result.status === "rejected"
    );
    if (failures.length > 0) {
      console.error(
        `[EventBus] ${failures.length} listener(s) failed for event "${String(event)}":`,
        failures.map((f) => f.reason)
      );
    }
  });
  const on = (event, listener) => Effect14.sync(() => {
    const listeners = getListeners(event);
    listeners.add(listener);
  });
  const off = (event, listener) => Effect14.sync(() => {
    const listeners = getListeners(event);
    listeners.delete(listener);
  });
  return {
    emit,
    on,
    off
  };
});
var EventBus = class extends Context10.Tag("EventBus")() {
  static {
    this.Live = Layer12.effect(this, layerImpl);
  }
};

// src/server/core/claude-code/services/ClaudeCodePermissionService.ts
var LayerImpl10 = Effect15.gen(function* () {
  const pendingPermissionRequestsRef = yield* Ref4.make(/* @__PURE__ */ new Map());
  const permissionResponsesRef = yield* Ref4.make(/* @__PURE__ */ new Map());
  const eventBus = yield* EventBus;
  const waitPermissionResponse = (request, options) => Effect15.gen(function* () {
    yield* Ref4.update(pendingPermissionRequestsRef, (requests) => {
      requests.set(request.id, request);
      return requests;
    });
    yield* eventBus.emit("permissionRequested", {
      permissionRequest: request
    });
    let passedMs = 0;
    let response = null;
    while (passedMs < options.timeoutMs) {
      const responses = yield* Ref4.get(permissionResponsesRef);
      response = responses.get(request.id) ?? null;
      if (response !== null) {
        break;
      }
      yield* Effect15.sleep(1e3);
      passedMs += 1e3;
    }
    return response;
  });
  const createCanUseToolRelatedOptions = (options) => {
    const { taskId, userConfig, sessionId } = options;
    return Effect15.gen(function* () {
      const claudeCodeConfig = yield* Config;
      if (!getAvailableFeatures(claudeCodeConfig.claudeCodeVersion).canUseTool) {
        return {
          permissionMode: "bypassPermissions"
        };
      }
      const canUseTool = async (toolName, toolInput, _options) => {
        if (userConfig.permissionMode !== "default") {
          if (userConfig.permissionMode === "bypassPermissions" || userConfig.permissionMode === "acceptEdits") {
            return {
              behavior: "allow",
              updatedInput: toolInput
            };
          } else {
            return {
              behavior: "deny",
              message: "Tool execution is disabled in plan mode"
            };
          }
        }
        const permissionRequest = {
          id: ulid(),
          taskId,
          sessionId,
          toolName,
          toolInput,
          timestamp: Date.now()
        };
        const response = await Effect15.runPromise(
          waitPermissionResponse(permissionRequest, { timeoutMs: 6e4 })
        );
        if (response === null) {
          return {
            behavior: "deny",
            message: "Permission request timed out"
          };
        }
        if (response.decision === "allow") {
          return {
            behavior: "allow",
            updatedInput: response.updatedInput ?? toolInput
          };
        } else {
          return {
            behavior: "deny",
            message: "Permission denied by user"
          };
        }
      };
      return {
        canUseTool,
        permissionMode: userConfig.permissionMode
      };
    });
  };
  const respondToPermissionRequest = (response) => Effect15.gen(function* () {
    yield* Ref4.update(permissionResponsesRef, (responses) => {
      responses.set(response.permissionRequestId, response);
      return responses;
    });
    yield* Ref4.update(pendingPermissionRequestsRef, (requests) => {
      requests.delete(response.permissionRequestId);
      return requests;
    });
  });
  return {
    createCanUseToolRelatedOptions,
    respondToPermissionRequest
  };
});
var ClaudeCodePermissionService = class extends Context11.Tag(
  "ClaudeCodePermissionService"
)() {
  static {
    this.Live = Layer13.effect(this, LayerImpl10);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodePermissionController.ts
var LayerImpl11 = Effect16.gen(function* () {
  const claudeCodePermissionService = yield* ClaudeCodePermissionService;
  const permissionResponse = (options) => Effect16.sync(() => {
    const { permissionResponse: permissionResponse2 } = options;
    Effect16.runFork(
      claudeCodePermissionService.respondToPermissionRequest(
        permissionResponse2
      )
    );
    return {
      status: 200,
      response: {
        message: "Permission response received"
      }
    };
  });
  return {
    permissionResponse
  };
});
var ClaudeCodePermissionController = class extends Context12.Tag(
  "ClaudeCodePermissionController"
)() {
  static {
    this.Live = Layer14.effect(this, LayerImpl11);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeSessionProcessController.ts
import { Context as Context19, Effect as Effect25, Layer as Layer21 } from "effect";

// src/server/core/platform/services/UserConfigService.ts
import { Context as Context13, Effect as Effect17, Layer as Layer15, Ref as Ref5 } from "effect";

// src/lib/i18n/localeDetection.ts
var DEFAULT_LOCALE = "en";
var normalizeTag = (tag) => {
  if (!tag) {
    return void 0;
  }
  const normalized = tag.trim().toLowerCase().replaceAll("_", "-");
  if (normalized.length === 0 || normalized === "*") {
    return void 0;
  }
  if (normalized.startsWith("zh")) {
    return "zh_CN";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  return void 0;
};
var detectLocaleFromAcceptLanguage = (header) => {
  if (!header) {
    return void 0;
  }
  const preferences = header.split(",").map((part, index) => {
    const [rawTag, ...params] = part.trim().split(";");
    const qParam = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    const quality = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    return {
      tag: rawTag,
      quality: Number.isNaN(quality) ? 1 : quality,
      index
    };
  }).filter((item) => Boolean(item.tag)).sort((a, b) => {
    if (b.quality !== a.quality) {
      return b.quality - a.quality;
    }
    return a.index - b.index;
  });
  for (const preference of preferences) {
    const locale = normalizeTag(preference.tag);
    if (locale) {
      return locale;
    }
  }
  return void 0;
};

// src/server/core/platform/services/UserConfigService.ts
var LayerImpl12 = Effect17.gen(function* () {
  const configRef = yield* Ref5.make({
    hideNoUserMessageSession: true,
    unifySameTitleSession: false,
    enterKeyBehavior: "shift-enter-send",
    permissionMode: "default",
    locale: DEFAULT_LOCALE,
    theme: "system",
    searchHotkey: "command-k",
    autoScheduleContinueOnRateLimit: false
  });
  const setUserConfig = (newConfig) => Effect17.gen(function* () {
    yield* Ref5.update(configRef, () => newConfig);
  });
  const getUserConfig = () => Effect17.gen(function* () {
    const config = yield* Ref5.get(configRef);
    return config;
  });
  return {
    getUserConfig,
    setUserConfig
  };
});
var UserConfigService = class extends Context13.Tag("UserConfigService")() {
  static {
    this.Live = Layer15.effect(this, LayerImpl12);
  }
};

// src/server/core/claude-code/services/ClaudeCodeLifeCycleService.ts
import { Context as Context18, Effect as Effect24, Layer as Layer20, Runtime as Runtime2 } from "effect";
import { ulid as ulid2 } from "ulid";

// src/lib/controllablePromise.ts
var controllablePromise = () => {
  let promiseResolve;
  let promiseReject;
  const promiseRef = {
    status: "pending"
  };
  const promise = new Promise((resolve4, reject) => {
    promiseResolve = (value) => {
      promiseRef.status = "resolved";
      resolve4(value);
    };
    promiseReject = (reason) => {
      promiseRef.status = "rejected";
      reject(reason);
    };
  });
  if (!promiseResolve || !promiseReject) {
    throw new Error("Illegal state: Promise not created");
  }
  promiseRef.promise = promise;
  promiseRef.resolve = promiseResolve;
  promiseRef.reject = promiseReject;
  return promiseRef;
};

// src/server/core/session/infrastructure/SessionRepository.ts
import { FileSystem as FileSystem9, Path as Path11 } from "@effect/platform";
import { Context as Context16, Effect as Effect21, Layer as Layer18, Option as Option3 } from "effect";

// src/server/core/claude-code/functions/parseUserMessage.ts
import { z as z21 } from "zod";
var regExp = /<(?<tag>[^>]+)>(?<content>[\s\S]*?)<\/\k<tag>>/g;
var matchSchema = z21.object({
  tag: z21.string(),
  content: z21.string()
});
var parsedUserMessageSchema = z21.union([
  z21.object({
    kind: z21.literal("command"),
    commandName: z21.string(),
    commandArgs: z21.string().optional(),
    commandMessage: z21.string().optional()
  }),
  z21.object({
    kind: z21.literal("local-command"),
    stdout: z21.string()
  }),
  z21.object({
    kind: z21.literal("text"),
    content: z21.string()
  })
]);
var parseUserMessage = (content) => {
  const matches = Array.from(content.matchAll(regExp)).map((match) => matchSchema.safeParse(match.groups)).filter((result) => result.success).map((result) => result.data);
  if (matches.length === 0) {
    return {
      kind: "text",
      content
    };
  }
  const commandName = matches.find(
    (match) => match.tag === "command-name"
  )?.content;
  const commandArgs = matches.find(
    (match) => match.tag === "command-args"
  )?.content;
  const commandMessage = matches.find(
    (match) => match.tag === "command-message"
  )?.content;
  const localCommandStdout = matches.find(
    (match) => match.tag === "local-command-stdout"
  )?.content;
  switch (true) {
    case commandName !== void 0:
      return {
        kind: "command",
        commandName,
        commandArgs,
        commandMessage
      };
    case localCommandStdout !== void 0:
      return {
        kind: "local-command",
        stdout: localCommandStdout
      };
    default:
      return {
        kind: "text",
        content
      };
  }
};

// src/server/core/session/functions/id.ts
import { basename, extname, resolve as resolve2 } from "node:path";
var encodeSessionId = (jsonlFilePath) => {
  return basename(jsonlFilePath, extname(jsonlFilePath));
};
var decodeSessionId = (projectId, sessionId) => {
  const projectPath = decodeProjectId(projectId);
  return resolve2(projectPath, `${sessionId}.jsonl`);
};

// src/server/core/session/functions/isRegularSessionFile.ts
var isRegularSessionFile = (filename) => filename.endsWith(".jsonl") && !filename.startsWith("agent-");

// src/server/core/session/infrastructure/VirtualConversationDatabase.ts
import { Context as Context14, Effect as Effect18, Layer as Layer16, Ref as Ref6 } from "effect";
var VirtualConversationDatabase = class extends Context14.Tag(
  "VirtualConversationDatabase"
)() {
  static {
    this.Live = Layer16.effect(
      this,
      Effect18.gen(function* () {
        const storageRef = yield* Ref6.make([]);
        const getProjectVirtualConversations = (projectId) => Effect18.gen(function* () {
          const conversations = yield* Ref6.get(storageRef);
          return conversations.filter(
            (conversation) => conversation.projectId === projectId
          );
        });
        const getSessionVirtualConversation = (sessionId) => Effect18.gen(function* () {
          const conversations = yield* Ref6.get(storageRef);
          return conversations.find(
            (conversation) => conversation.sessionId === sessionId
          ) ?? null;
        });
        const createVirtualConversation2 = (projectId, sessionId, createConversations) => Effect18.gen(function* () {
          yield* Ref6.update(storageRef, (conversations) => {
            const existingIndex = conversations.findIndex(
              (record) => record.projectId === projectId && record.sessionId === sessionId
            );
            if (existingIndex === -1) {
              return [
                ...conversations,
                {
                  projectId,
                  sessionId,
                  conversations: [...createConversations]
                }
              ];
            }
            return conversations.map(
              (record, index) => index === existingIndex ? {
                ...record,
                conversations: [
                  ...record.conversations,
                  ...createConversations
                ]
              } : record
            );
          });
        });
        const deleteVirtualConversations = (sessionId) => Effect18.gen(function* () {
          yield* Ref6.update(storageRef, (conversations) => {
            return conversations.filter((c) => c.sessionId !== sessionId);
          });
        });
        return {
          getProjectVirtualConversations,
          getSessionVirtualConversation,
          createVirtualConversation: createVirtualConversation2,
          deleteVirtualConversations
        };
      })
    );
  }
};

// src/server/core/session/services/SessionMetaService.ts
import { FileSystem as FileSystem8, Path as Path10 } from "@effect/platform";
import { Context as Context15, Effect as Effect20, Layer as Layer17, Ref as Ref7 } from "effect";

// src/server/core/session/constants/pricing.ts
var MODEL_PRICING = {
  "claude-opus-4.5": {
    input: 5,
    output: 25,
    cache_creation: 6.25,
    cache_read: 0.5
  },
  "claude-opus-4.1": {
    input: 15,
    output: 75,
    cache_creation: 18.75,
    cache_read: 1.5
  },
  "claude-sonnet-4.5": {
    input: 3,
    output: 15,
    cache_creation: 3.75,
    cache_read: 0.3
  },
  "claude-3.5-sonnet": {
    input: 3,
    output: 15,
    cache_creation: 3.75,
    cache_read: 0.3
  },
  "claude-haiku-4.5": {
    input: 1,
    output: 5,
    cache_creation: 1.25,
    cache_read: 0.1
  },
  "claude-3-opus": {
    input: 15,
    output: 75,
    cache_creation: 18.75,
    cache_read: 1.5
  },
  "claude-3-haiku": {
    input: 0.25,
    output: 1.25,
    cache_creation: 0.3,
    cache_read: 0.03
  }
};
var DEFAULT_MODEL_PRICING = MODEL_PRICING["claude-3.5-sonnet"];

// src/server/core/session/functions/calculateSessionCost.ts
function normalizeModelName(modelName) {
  const normalized = modelName.toLowerCase();
  if (normalized.includes("opus-4-5") || normalized.includes("opus-4.5")) {
    return "claude-opus-4.5";
  }
  if (normalized.includes("opus-4-1") || normalized.includes("opus-4.1")) {
    return "claude-opus-4.1";
  }
  if (normalized.includes("sonnet-4-5") || normalized.includes("sonnet-4.5")) {
    return "claude-sonnet-4.5";
  }
  if (normalized.includes("haiku-4-5") || normalized.includes("haiku-4.5")) {
    return "claude-haiku-4.5";
  }
  if (normalized.includes("sonnet-4") || normalized.includes("3-5-sonnet") || normalized.includes("3.5-sonnet")) {
    return "claude-3.5-sonnet";
  }
  if (normalized.includes("3-opus") || normalized.includes("opus-20")) {
    return "claude-3-opus";
  }
  if (normalized.includes("3-haiku") || normalized.includes("haiku-20")) {
    return "claude-3-haiku";
  }
  return "claude-3.5-sonnet";
}
function getModelPricing(modelName) {
  const normalized = normalizeModelName(modelName);
  return MODEL_PRICING[normalized] ?? DEFAULT_MODEL_PRICING;
}
function calculateTokenCost(usage, modelName) {
  const pricing = getModelPricing(modelName);
  const inputMTok = usage.input_tokens / 1e6;
  const outputMTok = usage.output_tokens / 1e6;
  const cacheCreationMTok = (usage.cache_creation_input_tokens ?? 0) / 1e6;
  const cacheReadMTok = (usage.cache_read_input_tokens ?? 0) / 1e6;
  const inputTokensUsd = inputMTok * pricing.input;
  const outputTokensUsd = outputMTok * pricing.output;
  const cacheCreationUsd = cacheCreationMTok * pricing.cache_creation;
  const cacheReadUsd = cacheReadMTok * pricing.cache_read;
  const totalUsd = inputTokensUsd + outputTokensUsd + cacheCreationUsd + cacheReadUsd;
  return {
    totalUsd,
    breakdown: {
      inputTokensUsd,
      outputTokensUsd,
      cacheCreationUsd,
      cacheReadUsd
    },
    tokenUsage: {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0
    }
  };
}

// src/server/core/session/functions/aggregateTokenUsageAndCost.ts
var aggregateTokenUsageAndCost = (fileContents) => {
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreationTokens = 0;
  let totalCacheReadTokens = 0;
  let totalInputTokensUsd = 0;
  let totalOutputTokensUsd = 0;
  let totalCacheCreationUsd = 0;
  let totalCacheReadUsd = 0;
  let lastModelName = "claude-3.5-sonnet";
  for (const content of fileContents) {
    const conversations = parseJsonl(content);
    for (const conversation of conversations) {
      if (conversation.type === "assistant") {
        const usage = conversation.message.usage;
        const modelName = conversation.message.model;
        const messageCost = calculateTokenCost(
          {
            input_tokens: usage.input_tokens,
            output_tokens: usage.output_tokens,
            cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
            cache_read_input_tokens: usage.cache_read_input_tokens ?? 0
          },
          modelName
        );
        totalInputTokens += usage.input_tokens;
        totalOutputTokens += usage.output_tokens;
        totalCacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
        totalCacheReadTokens += usage.cache_read_input_tokens ?? 0;
        totalInputTokensUsd += messageCost.breakdown.inputTokensUsd;
        totalOutputTokensUsd += messageCost.breakdown.outputTokensUsd;
        totalCacheCreationUsd += messageCost.breakdown.cacheCreationUsd;
        totalCacheReadUsd += messageCost.breakdown.cacheReadUsd;
        lastModelName = modelName;
      }
    }
  }
  const totalCost = {
    totalUsd: totalInputTokensUsd + totalOutputTokensUsd + totalCacheCreationUsd + totalCacheReadUsd,
    breakdown: {
      inputTokensUsd: totalInputTokensUsd,
      outputTokensUsd: totalOutputTokensUsd,
      cacheCreationUsd: totalCacheCreationUsd,
      cacheReadUsd: totalCacheReadUsd
    },
    tokenUsage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      cacheCreationTokens: totalCacheCreationTokens,
      cacheReadTokens: totalCacheReadTokens
    }
  };
  const aggregatedUsage = {
    input_tokens: totalInputTokens,
    output_tokens: totalOutputTokens,
    cache_creation_input_tokens: totalCacheCreationTokens,
    cache_read_input_tokens: totalCacheReadTokens
  };
  return {
    totalUsage: aggregatedUsage,
    totalCost,
    modelName: lastModelName
  };
};

// src/server/core/session/functions/getAgentSessionFilesForSession.ts
import { FileSystem as FileSystem7, Path as Path9 } from "@effect/platform";
import { Effect as Effect19 } from "effect";
var getAgentSessionFilesForSession = (projectPath, sessionId) => Effect19.gen(function* () {
  const fs = yield* FileSystem7.FileSystem;
  const path = yield* Path9.Path;
  const isValidAgentFile = (filePath, expectedSessionId) => Effect19.gen(function* () {
    const content = yield* fs.readFileString(filePath);
    const firstLine = content.split("\n")[0];
    if (!firstLine || firstLine.trim() === "") {
      return false;
    }
    try {
      const firstLineData = JSON.parse(firstLine);
      if (typeof firstLineData !== "object" || firstLineData === null) {
        return false;
      }
      if (expectedSessionId !== void 0) {
        return "sessionId" in firstLineData && firstLineData.sessionId === expectedSessionId;
      }
      return "sessionId" in firstLineData;
    } catch {
      return false;
    }
  }).pipe(Effect19.catchAll(() => Effect19.succeed(false)));
  const matchingFilePaths = [];
  const rootEntries = yield* fs.readDirectory(projectPath);
  const rootAgentFiles = rootEntries.filter(
    (filename) => filename.startsWith("agent-") && filename.endsWith(".jsonl")
  );
  for (const agentFile of rootAgentFiles) {
    const filePath = path.join(projectPath, agentFile);
    if (yield* isValidAgentFile(filePath, sessionId)) {
      matchingFilePaths.push(filePath);
    }
  }
  const subagentsDir = path.join(projectPath, sessionId, "subagents");
  const subagentsDirExists = yield* fs.exists(subagentsDir);
  if (subagentsDirExists) {
    const subagentEntries = yield* fs.readDirectory(subagentsDir).pipe(
      Effect19.catchAll(() => Effect19.succeed([]))
      // Handle permission or other errors gracefully
    );
    const subagentFiles = subagentEntries.filter(
      (filename) => filename.startsWith("agent-") && filename.endsWith(".jsonl")
    );
    for (const agentFile of subagentFiles) {
      const filePath = path.join(subagentsDir, agentFile);
      if (yield* isValidAgentFile(filePath, void 0)) {
        matchingFilePaths.push(filePath);
      }
    }
  }
  return matchingFilePaths;
});

// src/server/core/session/functions/extractFirstUserText.ts
var extractFirstUserText = (conversation) => {
  if (conversation.type !== "user") {
    return null;
  }
  const firstUserText = typeof conversation.message.content === "string" ? conversation.message.content : (() => {
    const firstContent = conversation.message.content.at(0);
    if (firstContent === void 0) return null;
    if (typeof firstContent === "string") return firstContent;
    if (firstContent.type === "text") return firstContent.text;
    return null;
  })();
  return firstUserText;
};

// src/server/core/session/functions/isValidFirstMessage.ts
var ignoreCommands = [
  "/clear",
  "/login",
  "/logout",
  "/exit",
  "/mcp",
  "/memory"
];
var extractFirstUserMessage = (conversation) => {
  if (conversation.type !== "user") {
    return void 0;
  }
  if (conversation.isSidechain === true) {
    return void 0;
  }
  const firstUserText = extractFirstUserText(conversation);
  if (firstUserText === null) {
    return void 0;
  }
  if (firstUserText === "Caveat: The messages below were generated by the user while running local commands. DO NOT respond to these messages or otherwise consider them in your response unless the user explicitly asks you to.") {
    return void 0;
  }
  if (firstUserText === "Warmup") {
    return void 0;
  }
  const command = parseUserMessage(firstUserText);
  if (command.kind === "local-command") {
    return void 0;
  }
  if (command.kind === "command" && ignoreCommands.includes(command.commandName)) {
    return void 0;
  }
  return command;
};

// src/server/core/session/services/SessionMetaService.ts
var parsedUserMessageOrNullSchema = parsedUserMessageSchema.nullable();
var SessionMetaService = class extends Context15.Tag("SessionMetaService")() {
  static {
    this.Live = Layer17.effect(
      this,
      Effect20.gen(function* () {
        const fs = yield* FileSystem8.FileSystem;
        const path = yield* Path10.Path;
        const firstUserMessageCache = yield* FileCacheStorage();
        const sessionMetaCacheRef = yield* Ref7.make(
          /* @__PURE__ */ new Map()
        );
        const getFirstUserMessage = (jsonlFilePath, lines) => Effect20.gen(function* () {
          const cached = yield* firstUserMessageCache.get(jsonlFilePath);
          if (cached !== void 0) {
            return cached;
          }
          let firstUserMessage = null;
          for (const line of lines) {
            const conversation = parseJsonl(line).at(0);
            if (conversation === void 0) {
              continue;
            }
            const maybeFirstUserMessage = extractFirstUserMessage(conversation);
            if (maybeFirstUserMessage === void 0) {
              continue;
            }
            firstUserMessage = maybeFirstUserMessage;
            break;
          }
          if (firstUserMessage !== null) {
            yield* firstUserMessageCache.set(jsonlFilePath, firstUserMessage);
          }
          return firstUserMessage;
        });
        const getSessionMeta = (projectId, sessionId) => Effect20.gen(function* () {
          const metaCache = yield* Ref7.get(sessionMetaCacheRef);
          const cached = metaCache.get(sessionId);
          if (cached !== void 0) {
            return cached;
          }
          const sessionPath = decodeSessionId(projectId, sessionId);
          const content = yield* fs.readFileString(sessionPath);
          const lines = content.split("\n");
          const firstUserMessage = yield* getFirstUserMessage(
            sessionPath,
            lines
          );
          const projectPath = path.dirname(sessionPath);
          const firstLine = lines[0];
          let actualSessionId;
          if (firstLine && firstLine.trim() !== "") {
            try {
              const firstLineData = JSON.parse(firstLine);
              if (typeof firstLineData === "object" && firstLineData !== null && "sessionId" in firstLineData && typeof firstLineData.sessionId === "string") {
                actualSessionId = firstLineData.sessionId;
              }
            } catch {
            }
          }
          const agentFilePaths = actualSessionId !== void 0 ? yield* getAgentSessionFilesForSession(
            projectPath,
            actualSessionId
          ).pipe(
            Effect20.provide(Layer17.succeed(FileSystem8.FileSystem, fs)),
            Effect20.provide(Layer17.succeed(Path10.Path, path))
          ) : [];
          const agentContents = [];
          for (const agentPath of agentFilePaths) {
            const agentContent = yield* fs.readFileString(agentPath).pipe(Effect20.catchAll(() => Effect20.succeed("")));
            if (agentContent !== "") {
              agentContents.push(agentContent);
            }
          }
          const fileContents = [content, ...agentContents];
          const { totalCost, modelName } = aggregateTokenUsageAndCost(fileContents);
          const sessionMeta = {
            messageCount: lines.length,
            firstUserMessage,
            cost: {
              totalUsd: totalCost.totalUsd,
              breakdown: totalCost.breakdown,
              tokenUsage: totalCost.tokenUsage
            },
            modelName
          };
          yield* Ref7.update(sessionMetaCacheRef, (cache) => {
            cache.set(sessionId, sessionMeta);
            return cache;
          });
          return sessionMeta;
        });
        const invalidateSession = (_projectId, sessionId) => Effect20.gen(function* () {
          yield* Ref7.update(sessionMetaCacheRef, (cache) => {
            cache.delete(sessionId);
            return cache;
          });
        });
        return {
          getSessionMeta,
          invalidateSession
        };
      })
    ).pipe(
      Layer17.provide(
        makeFileCacheStorageLayer(
          "first-user-message-cache",
          parsedUserMessageOrNullSchema
        )
      ),
      Layer17.provide(PersistentService.Live)
    );
  }
};

// src/server/core/session/infrastructure/SessionRepository.ts
var LayerImpl13 = Effect21.gen(function* () {
  const fs = yield* FileSystem9.FileSystem;
  const path = yield* Path11.Path;
  const sessionMetaService = yield* SessionMetaService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const createDefaultSessionMeta = () => ({
    messageCount: 0,
    firstUserMessage: null,
    cost: {
      totalUsd: 0,
      breakdown: {
        inputTokensUsd: 0,
        outputTokensUsd: 0,
        cacheCreationUsd: 0,
        cacheReadUsd: 0
      },
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0
      }
    },
    modelName: null
  });
  const getSession = (projectId, sessionId) => Effect21.gen(function* () {
    const sessionPath = decodeSessionId(projectId, sessionId);
    const virtualConversation = yield* virtualConversationDatabase.getSessionVirtualConversation(
      sessionId
    );
    const exists = yield* fs.exists(sessionPath);
    const sessionDetail = yield* exists ? Effect21.gen(function* () {
      const content = yield* fs.readFileString(sessionPath);
      const allLines = content.split("\n").filter((line) => line.trim());
      const conversations = parseJsonl(allLines.join("\n"));
      const stat = yield* fs.stat(sessionPath);
      const meta = yield* sessionMetaService.getSessionMeta(projectId, sessionId).pipe(
        Effect21.catchAll((error) => {
          console.error(
            `[SessionRepository] Failed to get meta for session ${sessionId}:`,
            error
          );
          return Effect21.succeed(createDefaultSessionMeta());
        })
      );
      const mergedConversations = [
        ...conversations,
        ...virtualConversation !== null ? virtualConversation.conversations : []
      ];
      const conversationMap = new Map(
        mergedConversations.flatMap((c, index) => {
          if (c.type === "user" || c.type === "assistant" || c.type === "system") {
            return [[c.uuid, { conversation: c, index }]];
          } else {
            return [];
          }
        })
      );
      const isBroken = mergedConversations.some((item, index) => {
        if (item.type !== "summary") return false;
        const leftMessage = conversationMap.get(item.leafUuid);
        if (leftMessage === void 0) return false;
        return index < leftMessage.index;
      });
      const sessionDetail2 = {
        id: sessionId,
        jsonlFilePath: sessionPath,
        meta,
        conversations: isBroken ? conversations : mergedConversations,
        lastModifiedAt: Option3.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date())
      };
      return sessionDetail2;
    }) : (() => {
      if (virtualConversation === null) {
        return Effect21.succeed(null);
      }
      const lastConversation = virtualConversation.conversations.filter(
        (conversation) => conversation.type === "user" || conversation.type === "assistant" || conversation.type === "system"
      ).at(-1);
      const virtualSession = {
        id: sessionId,
        jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
        meta: {
          messageCount: 0,
          firstUserMessage: null,
          cost: {
            totalUsd: 0,
            breakdown: {
              inputTokensUsd: 0,
              outputTokensUsd: 0,
              cacheCreationUsd: 0,
              cacheReadUsd: 0
            },
            tokenUsage: {
              inputTokens: 0,
              outputTokens: 0,
              cacheCreationTokens: 0,
              cacheReadTokens: 0
            }
          },
          modelName: null
        },
        conversations: virtualConversation.conversations,
        lastModifiedAt: lastConversation !== void 0 ? new Date(lastConversation.timestamp) : /* @__PURE__ */ new Date()
      };
      return Effect21.succeed(virtualSession);
    })();
    return {
      session: sessionDetail
    };
  });
  const getSessions = (projectId, options) => Effect21.gen(function* () {
    const { maxCount = 20, cursor } = options ?? {};
    const claudeProjectPath = decodeProjectId(projectId);
    const dirExists = yield* fs.exists(claudeProjectPath);
    if (!dirExists) {
      console.warn(`Project directory not found at ${claudeProjectPath}`);
      return { sessions: [] };
    }
    const dirents = yield* Effect21.tryPromise({
      try: () => fs.readDirectory(claudeProjectPath).pipe(Effect21.runPromise),
      catch: (error) => {
        console.warn(
          `Failed to read sessions for project ${projectId}:`,
          error
        );
        return new Error("Failed to read directory");
      }
    }).pipe(Effect21.catchAll(() => Effect21.succeed([])));
    const sessionEffects = dirents.filter(isRegularSessionFile).map(
      (entry) => Effect21.gen(function* () {
        const fullPath = path.resolve(claudeProjectPath, entry);
        const sessionId = encodeSessionId(fullPath);
        const stat = yield* Effect21.tryPromise(
          () => fs.stat(fullPath).pipe(Effect21.runPromise)
        ).pipe(Effect21.catchAll(() => Effect21.succeed(null)));
        if (!stat) {
          return null;
        }
        return {
          id: sessionId,
          jsonlFilePath: fullPath,
          lastModifiedAt: Option3.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date())
        };
      })
    );
    const sessionsWithNulls = yield* Effect21.all(sessionEffects, {
      concurrency: 10
    });
    const sessions = sessionsWithNulls.filter((s) => s !== null).sort(
      (a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime()
    );
    const sessionMap = new Map(
      sessions.map((session) => [session.id, session])
    );
    const index = cursor !== void 0 ? sessions.findIndex((session) => session.id === cursor) : -1;
    if (index !== -1) {
      const sessionsToReturn2 = sessions.slice(
        index + 1,
        Math.min(index + 1 + maxCount, sessions.length)
      );
      const sessionsWithMeta2 = yield* Effect21.all(
        sessionsToReturn2.map(
          (item) => Effect21.gen(function* () {
            const meta = yield* sessionMetaService.getSessionMeta(projectId, item.id).pipe(
              Effect21.catchAll((error) => {
                console.error(
                  `[SessionRepository] Failed to get meta for session ${item.id}:`,
                  error
                );
                return Effect21.succeed(createDefaultSessionMeta());
              })
            );
            return {
              ...item,
              meta
            };
          })
        ),
        { concurrency: 10 }
      );
      return {
        sessions: sessionsWithMeta2
      };
    }
    const virtualConversations = yield* virtualConversationDatabase.getProjectVirtualConversations(
      projectId
    );
    const virtualSessions = virtualConversations.filter(({ sessionId }) => !sessionMap.has(sessionId)).map(({ sessionId, conversations }) => {
      const first = conversations.filter((conversation) => conversation.type === "user").at(0);
      const last = conversations.filter(
        (conversation) => conversation.type === "user" || conversation.type === "assistant" || conversation.type === "system"
      ).at(-1);
      const firstUserText = first !== void 0 ? typeof first.message.content === "string" ? first.message.content : (() => {
        const firstContent = first.message.content.at(0);
        if (firstContent === void 0) return null;
        if (typeof firstContent === "string") return firstContent;
        if (firstContent.type === "text") return firstContent.text;
        return null;
      })() : null;
      return {
        id: sessionId,
        jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
        lastModifiedAt: last !== void 0 ? new Date(last.timestamp) : /* @__PURE__ */ new Date(),
        meta: {
          messageCount: conversations.length,
          firstUserMessage: firstUserText ? parseUserMessage(firstUserText) : null,
          cost: {
            totalUsd: 0,
            breakdown: {
              inputTokensUsd: 0,
              outputTokensUsd: 0,
              cacheCreationUsd: 0,
              cacheReadUsd: 0
            },
            tokenUsage: {
              inputTokens: 0,
              outputTokens: 0,
              cacheCreationTokens: 0,
              cacheReadTokens: 0
            }
          },
          modelName: null
        }
      };
    }).sort((a, b) => {
      return b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime();
    });
    const sessionsToReturn = sessions.slice(
      0,
      Math.min(maxCount, sessions.length)
    );
    const sessionsWithMeta = yield* Effect21.all(
      sessionsToReturn.map(
        (item) => Effect21.gen(function* () {
          const meta = yield* sessionMetaService.getSessionMeta(projectId, item.id).pipe(
            Effect21.catchAll((error) => {
              console.error(
                `[SessionRepository] Failed to get meta for session ${item.id}:`,
                error
              );
              return Effect21.succeed(createDefaultSessionMeta());
            })
          );
          return {
            ...item,
            meta
          };
        })
      ),
      { concurrency: 10 }
    );
    return {
      sessions: [...virtualSessions, ...sessionsWithMeta]
    };
  });
  return {
    getSession,
    getSessions
  };
});
var SessionRepository = class extends Context16.Tag("SessionRepository")() {
  static {
    this.Live = Layer18.effect(this, LayerImpl13);
  }
};

// src/server/core/claude-code/functions/createMessageGenerator.ts
var createMessageGenerator = () => {
  let sendMessagePromise = controllablePromise();
  let registeredHooks = {
    onNextMessageSet: [],
    onNewUserMessageResolved: []
  };
  const createMessage = (input) => {
    const { images = [], documents = [] } = input;
    if (images.length === 0 && documents.length === 0) {
      return {
        type: "user",
        message: {
          role: "user",
          content: input.text
        },
        parent_tool_use_id: null
      };
    }
    return {
      type: "user",
      message: {
        role: "user",
        content: [
          {
            type: "text",
            text: input.text
          },
          ...images,
          ...documents
        ]
      }
    };
  };
  async function* generateMessages() {
    sendMessagePromise = controllablePromise();
    while (true) {
      const message = await sendMessagePromise.promise;
      sendMessagePromise = controllablePromise();
      void Promise.allSettled(
        registeredHooks.onNewUserMessageResolved.map((hook) => hook(message))
      );
      yield createMessage(message);
    }
  }
  const setNextMessage = (input) => {
    sendMessagePromise.resolve(input);
    void Promise.allSettled(
      registeredHooks.onNextMessageSet.map((hook) => hook(input))
    );
  };
  const setHooks = (hooks) => {
    registeredHooks = {
      onNextMessageSet: [
        ...hooks?.onNextMessageSet ? [hooks.onNextMessageSet] : [],
        ...registeredHooks.onNextMessageSet
      ],
      onNewUserMessageResolved: [
        ...hooks?.onNewUserMessageResolved ? [hooks.onNewUserMessageResolved] : [],
        ...registeredHooks.onNewUserMessageResolved
      ]
    };
  };
  return {
    generateMessages,
    setNextMessage,
    setHooks
  };
};

// src/server/core/claude-code/models/CCSessionProcess.ts
import { Effect as Effect22 } from "effect";
var isPublic = (process2) => {
  return process2.type === "initialized" || process2.type === "file_created" || process2.type === "paused";
};
var getAliveTasks = (process2) => {
  return process2.tasks.filter(
    (task) => task.status === "pending" || task.status === "running"
  );
};
var createVirtualConversation = (process2, ctx) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  return Effect22.gen(function* () {
    const config = yield* Config;
    const virtualConversation = {
      type: "user",
      message: {
        role: "user",
        content: ctx.userMessage
      },
      isSidechain: false,
      userType: "external",
      cwd: process2.def.cwd,
      sessionId: ctx.sessionId,
      version: config.claudeCodeVersion ? versionText(config.claudeCodeVersion) : "unknown",
      uuid: `vc__${ctx.sessionId}__${timestamp}`,
      timestamp,
      parentUuid: null
    };
    return virtualConversation;
  });
};

// src/server/core/claude-code/services/ClaudeCodeSessionProcessService.ts
import { Context as Context17, Data as Data3, Effect as Effect23, Layer as Layer19, Ref as Ref8 } from "effect";
var SessionProcessNotFoundError = class extends Data3.TaggedError(
  "SessionProcessNotFoundError"
) {
};
var SessionProcessNotPausedError = class extends Data3.TaggedError(
  "SessionProcessNotPausedError"
) {
};
var SessionProcessAlreadyAliveError = class extends Data3.TaggedError(
  "SessionProcessAlreadyAliveError"
) {
};
var IllegalStateChangeError = class extends Data3.TaggedError(
  "IllegalStateChangeError"
) {
};
var TaskNotFoundError = class extends Data3.TaggedError("TaskNotFoundError") {
};
var LayerImpl14 = Effect23.gen(function* () {
  const processesRef = yield* Ref8.make([]);
  const eventBus = yield* EventBus;
  const startSessionProcess = (options) => {
    const { sessionDef, taskDef } = options;
    return Effect23.gen(function* () {
      const task = {
        def: taskDef,
        status: "pending"
      };
      const newProcess = {
        def: sessionDef,
        type: "pending",
        tasks: [task],
        currentTask: task
      };
      yield* Ref8.update(processesRef, (processes) => [
        ...processes,
        newProcess
      ]);
      return {
        sessionProcess: newProcess,
        task
      };
    });
  };
  const continueSessionProcess = (options) => {
    const { sessionProcessId } = options;
    return Effect23.gen(function* () {
      const process2 = yield* getSessionProcess(sessionProcessId);
      if (process2.type !== "paused") {
        return yield* Effect23.fail(
          new SessionProcessNotPausedError({
            sessionProcessId
          })
        );
      }
      const [firstAliveTask] = getAliveTasks(process2);
      if (firstAliveTask !== void 0) {
        return yield* Effect23.fail(
          new SessionProcessAlreadyAliveError({
            sessionProcessId,
            aliveTaskId: firstAliveTask.def.taskId,
            aliveTaskSessionId: firstAliveTask.def.sessionId ?? firstAliveTask.sessionId
          })
        );
      }
      const newTask = {
        def: options.taskDef,
        status: "pending"
      };
      const newProcess = {
        def: process2.def,
        type: "pending",
        tasks: [...process2.tasks, newTask],
        currentTask: newTask
      };
      yield* Ref8.update(processesRef, (processes) => {
        return processes.map(
          (p) => p.def.sessionProcessId === sessionProcessId ? newProcess : p
        );
      });
      return {
        sessionProcess: newProcess,
        task: newTask
      };
    });
  };
  const getSessionProcess = (sessionProcessId) => {
    return Effect23.gen(function* () {
      const processes = yield* Ref8.get(processesRef);
      const result = processes.find(
        (p) => p.def.sessionProcessId === sessionProcessId
      );
      if (result === void 0) {
        return yield* Effect23.fail(
          new SessionProcessNotFoundError({ sessionProcessId })
        );
      }
      return result;
    });
  };
  const getSessionProcesses = () => {
    return Effect23.gen(function* () {
      const processes = yield* Ref8.get(processesRef);
      return processes;
    });
  };
  const getTask = (taskId) => {
    return Effect23.gen(function* () {
      const processes = yield* Ref8.get(processesRef);
      const result = processes.flatMap((p) => {
        const found = p.tasks.find((t) => t.def.taskId === taskId);
        if (found === void 0) {
          return [];
        }
        return [
          {
            sessionProcess: p,
            task: found
          }
        ];
      }).at(0);
      if (result === void 0) {
        return yield* Effect23.fail(new TaskNotFoundError({ taskId }));
      }
      return result;
    });
  };
  const dangerouslyChangeProcessState = (options) => {
    const { sessionProcessId, nextState } = options;
    return Effect23.gen(function* () {
      const processes = yield* Ref8.get(processesRef);
      const targetProcess = processes.find(
        (p) => p.def.sessionProcessId === sessionProcessId
      );
      const currentStatus = targetProcess?.type;
      const updatedProcesses = processes.map(
        (p) => p.def.sessionProcessId === sessionProcessId ? nextState : p
      );
      yield* Ref8.set(processesRef, updatedProcesses);
      if (currentStatus !== nextState.type) {
        yield* eventBus.emit("sessionProcessChanged", {
          processes: updatedProcesses.filter(isPublic).map((process2) => ({
            id: process2.def.sessionProcessId,
            projectId: process2.def.projectId,
            sessionId: process2.sessionId,
            status: process2.type === "paused" ? "paused" : "running"
          })),
          changed: nextState
        });
      }
      console.log(
        `sessionProcessStateChanged(${sessionProcessId}): ${targetProcess?.type} -> ${nextState.type}`
      );
      return nextState;
    });
  };
  const changeTaskState = (options) => {
    const { sessionProcessId, taskId, nextTask } = options;
    return Effect23.gen(function* () {
      const { task } = yield* getTask(taskId);
      yield* Ref8.update(processesRef, (processes) => {
        return processes.map(
          (p) => p.def.sessionProcessId === sessionProcessId ? {
            ...p,
            tasks: p.tasks.map(
              (t) => t.def.taskId === task.def.taskId ? { ...nextTask } : t
            )
          } : p
        );
      });
      const updated = yield* getTask(taskId);
      if (updated === void 0) {
        throw new Error("Unreachable: updatedProcess is undefined");
      }
      return updated.task;
    });
  };
  const toNotInitializedState = (options) => {
    const { sessionProcessId, rawUserMessage } = options;
    return Effect23.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "pending") {
        return yield* Effect23.fail(
          new IllegalStateChangeError({
            from: currentProcess.type,
            to: "not_initialized"
          })
        );
      }
      const newTask = yield* changeTaskState({
        sessionProcessId,
        taskId: currentProcess.currentTask.def.taskId,
        nextTask: {
          status: "running",
          def: currentProcess.currentTask.def
        }
      });
      const newProcess = yield* dangerouslyChangeProcessState({
        sessionProcessId,
        nextState: {
          type: "not_initialized",
          def: currentProcess.def,
          tasks: currentProcess.tasks,
          currentTask: newTask,
          rawUserMessage
        }
      });
      return {
        sessionProcess: newProcess,
        task: newTask
      };
    });
  };
  const toInitializedState = (options) => {
    const { sessionProcessId, initContext } = options;
    return Effect23.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "not_initialized") {
        return yield* Effect23.fail(
          new IllegalStateChangeError({
            from: currentProcess.type,
            to: "initialized"
          })
        );
      }
      const newProcess = yield* dangerouslyChangeProcessState({
        sessionProcessId,
        nextState: {
          type: "initialized",
          def: currentProcess.def,
          tasks: currentProcess.tasks,
          currentTask: currentProcess.currentTask,
          sessionId: initContext.initMessage.session_id,
          rawUserMessage: currentProcess.rawUserMessage,
          initContext
        }
      });
      return {
        sessionProcess: newProcess
      };
    });
  };
  const toFileCreatedState = (options) => {
    const { sessionProcessId } = options;
    return Effect23.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "initialized") {
        return yield* Effect23.fail(
          new IllegalStateChangeError({
            from: currentProcess.type,
            to: "file_created"
          })
        );
      }
      const newProcess = yield* dangerouslyChangeProcessState({
        sessionProcessId,
        nextState: {
          type: "file_created",
          def: currentProcess.def,
          tasks: currentProcess.tasks,
          currentTask: currentProcess.currentTask,
          sessionId: currentProcess.sessionId,
          rawUserMessage: currentProcess.rawUserMessage,
          initContext: currentProcess.initContext
        }
      });
      return {
        sessionProcess: newProcess
      };
    });
  };
  const toPausedState = (options) => {
    const { sessionProcessId, resultMessage } = options;
    return Effect23.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "file_created") {
        return yield* Effect23.fail(
          new IllegalStateChangeError({
            from: currentProcess.type,
            to: "paused"
          })
        );
      }
      const newTask = yield* changeTaskState({
        sessionProcessId,
        taskId: currentProcess.currentTask.def.taskId,
        nextTask: {
          status: "completed",
          def: currentProcess.currentTask.def,
          sessionId: resultMessage.session_id
        }
      });
      const newProcess = yield* dangerouslyChangeProcessState({
        sessionProcessId,
        nextState: {
          type: "paused",
          def: currentProcess.def,
          tasks: currentProcess.tasks.map(
            (t) => t.def.taskId === newTask.def.taskId ? newTask : t
          ),
          sessionId: currentProcess.sessionId
        }
      });
      return {
        sessionProcess: newProcess
      };
    });
  };
  const toCompletedState = (options) => {
    const { sessionProcessId, error } = options;
    return Effect23.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      const currentTask = currentProcess.type === "not_initialized" || currentProcess.type === "initialized" || currentProcess.type === "file_created" ? currentProcess.currentTask : void 0;
      const newTask = currentTask !== void 0 ? error !== void 0 ? {
        status: "failed",
        def: currentTask.def,
        error
      } : {
        status: "completed",
        def: currentTask.def,
        sessionId: currentProcess.sessionId
      } : void 0;
      if (newTask !== void 0) {
        yield* changeTaskState({
          sessionProcessId,
          taskId: newTask.def.taskId,
          nextTask: newTask
        });
      }
      const newProcess = yield* dangerouslyChangeProcessState({
        sessionProcessId,
        nextState: {
          type: "completed",
          def: currentProcess.def,
          tasks: newTask !== void 0 ? currentProcess.tasks.map(
            (t) => t.def.taskId === newTask.def.taskId ? newTask : t
          ) : currentProcess.tasks,
          sessionId: currentProcess.sessionId
        }
      });
      return {
        sessionProcess: newProcess,
        task: newTask
      };
    });
  };
  return {
    // session
    startSessionProcess,
    continueSessionProcess,
    toNotInitializedState,
    toInitializedState,
    toFileCreatedState,
    toPausedState,
    toCompletedState,
    dangerouslyChangeProcessState,
    getSessionProcesses,
    getSessionProcess,
    // task
    getTask,
    changeTaskState
  };
});
var ClaudeCodeSessionProcessService = class extends Context17.Tag(
  "ClaudeCodeSessionProcessService"
)() {
  static {
    this.Live = Layer19.effect(this, LayerImpl14);
  }
};

// src/server/core/claude-code/services/ClaudeCodeLifeCycleService.ts
var LayerImpl15 = Effect24.gen(function* () {
  const eventBusService = yield* EventBus;
  const sessionRepository = yield* SessionRepository;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const permissionService = yield* ClaudeCodePermissionService;
  const runtime = yield* Effect24.runtime();
  const continueTask = (options) => {
    const { sessionProcessId, baseSessionId, input } = options;
    return Effect24.gen(function* () {
      const { sessionProcess, task } = yield* sessionProcessService.continueSessionProcess({
        sessionProcessId,
        taskDef: {
          type: "continue",
          sessionId: baseSessionId,
          baseSessionId,
          taskId: ulid2()
        }
      });
      const virtualConversation = yield* createVirtualConversation(sessionProcess, {
        sessionId: baseSessionId,
        userMessage: input.text
      });
      yield* virtualConversationDatabase.createVirtualConversation(
        sessionProcess.def.projectId,
        baseSessionId,
        [virtualConversation]
      );
      yield* eventBusService.emit("virtualConversationUpdated", {
        projectId: sessionProcess.def.projectId,
        sessionId: baseSessionId
      });
      sessionProcess.def.setNextMessage(input);
      return {
        sessionProcess,
        task
      };
    });
  };
  const startTask = (options) => {
    const { baseSession, input, userConfig } = options;
    return Effect24.gen(function* () {
      const {
        generateMessages,
        setNextMessage,
        setHooks: setMessageGeneratorHooks
      } = createMessageGenerator();
      const { sessionProcess, task } = yield* sessionProcessService.startSessionProcess({
        sessionDef: {
          projectId: baseSession.projectId,
          cwd: baseSession.cwd,
          abortController: new AbortController(),
          setNextMessage,
          sessionProcessId: ulid2()
        },
        taskDef: baseSession.sessionId === void 0 ? {
          type: "new",
          taskId: ulid2()
        } : {
          type: "resume",
          taskId: ulid2(),
          sessionId: void 0,
          baseSessionId: baseSession.sessionId
        }
      });
      const sessionInitializedPromise = controllablePromise();
      const sessionFileCreatedPromise = controllablePromise();
      setMessageGeneratorHooks({
        onNewUserMessageResolved: async (input2) => {
          Effect24.runFork(
            sessionProcessService.toNotInitializedState({
              sessionProcessId: sessionProcess.def.sessionProcessId,
              rawUserMessage: input2.text
            })
          );
        }
      });
      const handleMessage = (message) => Effect24.gen(function* () {
        const processState = yield* sessionProcessService.getSessionProcess(
          sessionProcess.def.sessionProcessId
        );
        if (processState.type === "completed") {
          return "break";
        }
        if (processState.type === "paused") {
          return yield* Effect24.die(
            new Error("Illegal state: paused is not expected")
          );
        }
        if (message.type === "system" && message.subtype === "init" && processState.type === "not_initialized") {
          yield* sessionProcessService.toInitializedState({
            sessionProcessId: processState.def.sessionProcessId,
            initContext: {
              initMessage: message
            }
          });
          const virtualConversation = yield* createVirtualConversation(processState, {
            sessionId: message.session_id,
            userMessage: processState.rawUserMessage
          });
          if (processState.currentTask.def.type === "new") {
            yield* virtualConversationDatabase.createVirtualConversation(
              baseSession.projectId,
              message.session_id,
              [virtualConversation]
            );
          } else if (processState.currentTask.def.type === "resume") {
            const existingSession = yield* sessionRepository.getSession(
              processState.def.projectId,
              processState.currentTask.def.baseSessionId
            );
            const copiedConversations = existingSession.session === null ? [] : existingSession.session.conversations;
            yield* virtualConversationDatabase.createVirtualConversation(
              processState.def.projectId,
              message.session_id,
              [...copiedConversations, virtualConversation]
            );
          } else {
          }
          sessionInitializedPromise.resolve({
            sessionId: message.session_id
          });
          yield* eventBusService.emit("sessionListChanged", {
            projectId: processState.def.projectId
          });
          yield* eventBusService.emit("sessionChanged", {
            projectId: processState.def.projectId,
            sessionId: message.session_id
          });
          return "continue";
        }
        if (message.type === "assistant" && processState.type === "initialized") {
          yield* sessionProcessService.toFileCreatedState({
            sessionProcessId: processState.def.sessionProcessId
          });
          sessionFileCreatedPromise.resolve({
            sessionId: message.session_id
          });
          yield* eventBusService.emit("virtualConversationUpdated", {
            projectId: processState.def.projectId,
            sessionId: message.session_id
          });
          yield* virtualConversationDatabase.deleteVirtualConversations(
            message.session_id
          );
        }
        if (message.type === "result" && processState.type === "file_created") {
          yield* sessionProcessService.toPausedState({
            sessionProcessId: processState.def.sessionProcessId,
            resultMessage: message
          });
          yield* eventBusService.emit("sessionChanged", {
            projectId: processState.def.projectId,
            sessionId: message.session_id
          });
          return "continue";
        }
        return "continue";
      });
      const handleSessionProcessDaemon = async () => {
        try {
          const messageIter = await Runtime2.runPromise(runtime)(
            Effect24.gen(function* () {
              const permissionOptions = yield* permissionService.createCanUseToolRelatedOptions({
                taskId: task.def.taskId,
                userConfig,
                sessionId: task.def.baseSessionId
              });
              const normalizedEnv = { ...process.env };
              if (!normalizedEnv.ANTHROPIC_API_KEY && normalizedEnv.ANTHROPIC_AUTH_TOKEN) {
                normalizedEnv.ANTHROPIC_API_KEY = normalizedEnv.ANTHROPIC_AUTH_TOKEN;
                console.log(
                  "[SpecForge] Using ANTHROPIC_AUTH_TOKEN as ANTHROPIC_API_KEY for custom proxy service"
                );
              }
              const hasApiKey = !!normalizedEnv.ANTHROPIC_API_KEY;
              const baseUrl = normalizedEnv.ANTHROPIC_BASE_URL;
              console.log(
                `[SpecForge] Claude Code SDK authentication: ${hasApiKey ? "API key configured" : "No API key"}, Base URL: ${baseUrl || "default"}`
              );
              return yield* query2(generateMessages(), {
                resume: task.def.baseSessionId,
                cwd: sessionProcess.def.cwd,
                abortController: sessionProcess.def.abortController,
                env: normalizedEnv,
                ...permissionOptions
              });
            })
          );
          setNextMessage(input);
          for await (const message of messageIter) {
            if (sessionProcess.def.abortController.signal.aborted) {
              break;
            }
            const result = await Runtime2.runPromise(runtime)(
              handleMessage(message)
            ).catch((error) => {
              if (sessionProcess.def.abortController.signal.aborted) {
                return "continue";
              }
              Effect24.runFork(
                sessionProcessService.changeTaskState({
                  sessionProcessId: sessionProcess.def.sessionProcessId,
                  taskId: task.def.taskId,
                  nextTask: {
                    status: "failed",
                    def: task.def,
                    error
                  }
                })
              );
              if (sessionInitializedPromise.status === "pending") {
                sessionInitializedPromise.reject(error);
              }
              if (sessionFileCreatedPromise.status === "pending") {
                sessionFileCreatedPromise.reject(error);
              }
              return "continue";
            });
            if (result === "break") {
              break;
            } else {
            }
          }
        } catch (error) {
          if (sessionProcess.def.abortController.signal.aborted) {
            return;
          }
          if (sessionInitializedPromise.status === "pending") {
            sessionInitializedPromise.reject(error);
          }
          if (sessionFileCreatedPromise.status === "pending") {
            sessionFileCreatedPromise.reject(error);
          }
          await Effect24.runPromise(
            sessionProcessService.changeTaskState({
              sessionProcessId: sessionProcess.def.sessionProcessId,
              taskId: task.def.taskId,
              nextTask: {
                status: "failed",
                def: task.def,
                error
              }
            })
          );
        }
      };
      const daemonPromise = handleSessionProcessDaemon().catch((error) => {
        console.error("Error occur in task daemon process", error);
        if (sessionInitializedPromise.status === "pending") {
          sessionInitializedPromise.reject(error);
        }
        if (sessionFileCreatedPromise.status === "pending") {
          sessionFileCreatedPromise.reject(error);
        }
      }).finally(() => {
        Effect24.runFork(
          Effect24.gen(function* () {
            const currentProcess = yield* sessionProcessService.getSessionProcess(
              sessionProcess.def.sessionProcessId
            );
            yield* sessionProcessService.toCompletedState({
              sessionProcessId: currentProcess.def.sessionProcessId
            });
          })
        );
      });
      return {
        sessionProcess,
        task,
        daemonPromise,
        awaitSessionInitialized: async () => await sessionInitializedPromise.promise,
        awaitSessionFileCreated: async () => await sessionFileCreatedPromise.promise,
        yieldSessionInitialized: () => Effect24.promise(() => sessionInitializedPromise.promise),
        yieldSessionFileCreated: () => Effect24.promise(() => sessionFileCreatedPromise.promise)
      };
    });
  };
  const getPublicSessionProcesses = () => Effect24.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    return processes.filter((process2) => isPublic(process2));
  });
  const abortTask = (sessionProcessId) => Effect24.gen(function* () {
    const currentProcess = yield* sessionProcessService.getSessionProcess(sessionProcessId);
    if (currentProcess.type === "completed") {
      return;
    }
    currentProcess.def.abortController.abort();
    yield* Effect24.sleep("100 millis");
    const latestProcess = yield* sessionProcessService.getSessionProcess(sessionProcessId);
    if (latestProcess.type !== "completed") {
      yield* sessionProcessService.toCompletedState({
        sessionProcessId: currentProcess.def.sessionProcessId,
        error: new Error("Task aborted")
      });
    }
  });
  const abortAllTasks = () => Effect24.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    for (const process2 of processes) {
      yield* sessionProcessService.toCompletedState({
        sessionProcessId: process2.def.sessionProcessId,
        error: new Error("Task aborted")
      });
    }
  });
  return {
    continueTask,
    startTask,
    abortTask,
    abortAllTasks,
    getPublicSessionProcesses
  };
});
var ClaudeCodeLifeCycleService = class extends Context18.Tag(
  "ClaudeCodeLifeCycleService"
)() {
  static {
    this.Live = Layer20.effect(this, LayerImpl15);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeSessionProcessController.ts
var LayerImpl16 = Effect25.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const userConfigService = yield* UserConfigService;
  const getSessionProcesses = () => Effect25.gen(function* () {
    const publicSessionProcesses = yield* claudeCodeLifeCycleService.getPublicSessionProcesses();
    return {
      response: {
        processes: publicSessionProcesses.map(
          (p) => ({
            id: p.def.sessionProcessId,
            projectId: p.def.projectId,
            sessionId: p.sessionId,
            status: p.type === "paused" ? "paused" : "running"
          })
        )
      },
      status: 200
    };
  });
  const createSessionProcess = (options) => Effect25.gen(function* () {
    const { projectId, input, baseSessionId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    const userConfig = yield* userConfigService.getUserConfig();
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const result = yield* claudeCodeLifeCycleService.startTask({
      baseSession: {
        cwd: project.meta.projectPath,
        projectId,
        sessionId: baseSessionId
      },
      userConfig,
      input
    });
    const { sessionId } = yield* result.yieldSessionInitialized();
    return {
      status: 201,
      response: {
        sessionProcess: {
          id: result.sessionProcess.def.sessionProcessId,
          projectId,
          sessionId
        }
      }
    };
  });
  const continueSessionProcess = (options) => Effect25.gen(function* () {
    const { projectId, input, baseSessionId, sessionProcessId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const result = yield* claudeCodeLifeCycleService.continueTask({
      sessionProcessId,
      input,
      baseSessionId
    });
    return {
      response: {
        sessionProcess: {
          id: result.sessionProcess.def.sessionProcessId,
          projectId: result.sessionProcess.def.projectId,
          sessionId: baseSessionId
        }
      },
      status: 200
    };
  });
  return {
    getSessionProcesses,
    createSessionProcess,
    continueSessionProcess
  };
});
var ClaudeCodeSessionProcessController = class extends Context19.Tag(
  "ClaudeCodeSessionProcessController"
)() {
  static {
    this.Live = Layer21.effect(this, LayerImpl16);
  }
};

// src/server/core/events/presentation/SSEController.ts
import { Context as Context21, Effect as Effect27, Layer as Layer23 } from "effect";

// src/server/core/events/functions/adaptInternalEventToSSE.ts
var adaptInternalEventToSSE = (rawStream, options) => {
  const { timeout = 60 * 1e3, cleanUp } = options ?? {};
  const abortController = new AbortController();
  let connectionResolve;
  const connectionPromise = new Promise((resolve4) => {
    connectionResolve = resolve4;
  });
  const closeConnection = () => {
    connectionResolve?.();
    abortController.abort();
    cleanUp?.();
  };
  rawStream.onAbort(() => {
    closeConnection();
  });
  setTimeout(() => {
    closeConnection();
  }, timeout);
  return {
    connectionPromise
  };
};

// src/server/core/events/functions/typeSafeSSE.ts
import { Context as Context20, Effect as Effect26, Layer as Layer22 } from "effect";
import { ulid as ulid3 } from "ulid";
var TypeSafeSSE = class extends Context20.Tag("TypeSafeSSE")() {
  static {
    this.make = (stream) => Layer22.succeed(this, {
      writeSSE: (event, data) => Effect26.tryPromise({
        try: async () => {
          const id = ulid3();
          await stream.writeSSE({
            event,
            id,
            data: JSON.stringify({
              kind: event,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              ...data
            })
          });
        },
        catch: (error) => {
          if (error instanceof Error) {
            return error;
          }
          return new Error(String(error));
        }
      })
    });
  }
};

// src/server/core/events/presentation/SSEController.ts
var LayerImpl17 = Effect27.gen(function* () {
  const eventBus = yield* EventBus;
  const handleSSE = (rawStream) => Effect27.gen(function* () {
    const typeSafeSSE = yield* TypeSafeSSE;
    yield* typeSafeSSE.writeSSE("connect", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const onHeartbeat = () => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("heartbeat", {
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      );
    };
    const onSessionListChanged = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("sessionListChanged", {
          projectId: event.projectId
        })
      );
    };
    const onSessionChanged = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("sessionChanged", {
          projectId: event.projectId,
          sessionId: event.sessionId
        })
      );
    };
    const onAgentSessionChanged = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("agentSessionChanged", {
          projectId: event.projectId,
          agentSessionId: event.agentSessionId
        })
      );
    };
    const onSessionProcessChanged = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("sessionProcessChanged", {
          processes: event.processes
        })
      );
    };
    const onPermissionRequested = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("permissionRequested", {
          permissionRequest: event.permissionRequest
        })
      );
    };
    const onVirtualConversationUpdated = (event) => {
      Effect27.runFork(
        typeSafeSSE.writeSSE("virtualConversationUpdated", {
          projectId: event.projectId,
          sessionId: event.sessionId
        })
      );
    };
    yield* eventBus.on("sessionListChanged", onSessionListChanged);
    yield* eventBus.on("sessionChanged", onSessionChanged);
    yield* eventBus.on("agentSessionChanged", onAgentSessionChanged);
    yield* eventBus.on("sessionProcessChanged", onSessionProcessChanged);
    yield* eventBus.on("heartbeat", onHeartbeat);
    yield* eventBus.on("permissionRequested", onPermissionRequested);
    yield* eventBus.on(
      "virtualConversationUpdated",
      onVirtualConversationUpdated
    );
    const { connectionPromise } = adaptInternalEventToSSE(rawStream, {
      timeout: 5 * 60 * 1e3,
      cleanUp: async () => {
        await Effect27.runPromise(
          Effect27.gen(function* () {
            yield* eventBus.off("sessionListChanged", onSessionListChanged);
            yield* eventBus.off("sessionChanged", onSessionChanged);
            yield* eventBus.off("agentSessionChanged", onAgentSessionChanged);
            yield* eventBus.off(
              "sessionProcessChanged",
              onSessionProcessChanged
            );
            yield* eventBus.off("heartbeat", onHeartbeat);
            yield* eventBus.off("permissionRequested", onPermissionRequested);
            yield* eventBus.off(
              "virtualConversationUpdated",
              onVirtualConversationUpdated
            );
          })
        );
      }
    });
    yield* Effect27.promise(() => connectionPromise);
  });
  return {
    handleSSE
  };
});
var SSEController = class extends Context21.Tag("SSEController")() {
  static {
    this.Live = Layer23.effect(this, LayerImpl17);
  }
};

// src/server/core/events/services/fileWatcher.ts
import { watch } from "node:fs";
import { Path as Path12 } from "@effect/platform";
import { Context as Context22, Effect as Effect28, Layer as Layer24, Ref as Ref9 } from "effect";

// src/server/core/events/functions/parseSessionFilePath.ts
import z22 from "zod";
var sessionFileRegExp = /(?<projectId>.*?)\/(?<sessionId>.*?)\.jsonl$/;
var agentFileRegExp = /(?<projectId>.*?)\/agent-(?<agentSessionId>.*?)\.jsonl$/;
var sessionFileGroupSchema = z22.object({
  projectId: z22.string(),
  sessionId: z22.string()
});
var agentFileGroupSchema = z22.object({
  projectId: z22.string(),
  agentSessionId: z22.string()
});
var parseSessionFilePath = (filePath) => {
  const agentMatch = filePath.match(agentFileRegExp);
  const agentGroups = agentFileGroupSchema.safeParse(agentMatch?.groups);
  if (agentGroups.success) {
    return {
      type: "agent",
      projectId: agentGroups.data.projectId,
      agentSessionId: agentGroups.data.agentSessionId
    };
  }
  const sessionMatch = filePath.match(sessionFileRegExp);
  const sessionGroups = sessionFileGroupSchema.safeParse(sessionMatch?.groups);
  if (sessionGroups.success) {
    return {
      type: "session",
      projectId: sessionGroups.data.projectId,
      sessionId: sessionGroups.data.sessionId
    };
  }
  return null;
};

// src/server/core/events/services/fileWatcher.ts
var FileWatcherService = class extends Context22.Tag("FileWatcherService")() {
  static {
    this.Live = Layer24.effect(
      this,
      Effect28.gen(function* () {
        const path = yield* Path12.Path;
        const eventBus = yield* EventBus;
        const context = yield* ApplicationContext;
        const isWatchingRef = yield* Ref9.make(false);
        const watcherRef = yield* Ref9.make(null);
        const projectWatchersRef = yield* Ref9.make(
          /* @__PURE__ */ new Map()
        );
        const debounceTimersRef = yield* Ref9.make(/* @__PURE__ */ new Map());
        const startWatching = () => Effect28.gen(function* () {
          const isWatching = yield* Ref9.get(isWatchingRef);
          if (isWatching) return;
          const claudeCodePaths = yield* context.claudeCodePaths;
          yield* Ref9.set(isWatchingRef, true);
          yield* Effect28.tryPromise({
            try: async () => {
              console.log(
                "Starting file watcher on:",
                claudeCodePaths.claudeProjectsDirPath
              );
              const watcher = watch(
                claudeCodePaths.claudeProjectsDirPath,
                { persistent: false, recursive: true },
                (_eventType, filename) => {
                  if (!filename) return;
                  const fileMatch = parseSessionFilePath(filename);
                  if (fileMatch === null) return;
                  const fullPath = path.join(
                    claudeCodePaths.claudeProjectsDirPath,
                    filename
                  );
                  const encodedProjectId = encodeProjectIdFromSessionFilePath(fullPath);
                  const debounceKey = fileMatch.type === "agent" ? `${encodedProjectId}/agent-${fileMatch.agentSessionId}` : `${encodedProjectId}/${fileMatch.sessionId}`;
                  Effect28.runPromise(
                    Effect28.gen(function* () {
                      const timers = yield* Ref9.get(debounceTimersRef);
                      const existingTimer = timers.get(debounceKey);
                      if (existingTimer) {
                        clearTimeout(existingTimer);
                      }
                      const newTimer = setTimeout(() => {
                        if (fileMatch.type === "agent") {
                          Effect28.runFork(
                            eventBus.emit("agentSessionChanged", {
                              projectId: encodedProjectId,
                              agentSessionId: fileMatch.agentSessionId
                            })
                          );
                        } else {
                          Effect28.runFork(
                            eventBus.emit("sessionChanged", {
                              projectId: encodedProjectId,
                              sessionId: fileMatch.sessionId
                            })
                          );
                          Effect28.runFork(
                            eventBus.emit("sessionListChanged", {
                              projectId: encodedProjectId
                            })
                          );
                        }
                        Effect28.runPromise(
                          Effect28.gen(function* () {
                            const currentTimers = yield* Ref9.get(debounceTimersRef);
                            currentTimers.delete(debounceKey);
                            yield* Ref9.set(debounceTimersRef, currentTimers);
                          })
                        );
                      }, 100);
                      timers.set(debounceKey, newTimer);
                      yield* Ref9.set(debounceTimersRef, timers);
                    })
                  );
                }
              );
              await Effect28.runPromise(Ref9.set(watcherRef, watcher));
              console.log("File watcher initialization completed");
            },
            catch: (error) => {
              console.error("Failed to start file watching:", error);
              return new Error(
                `Failed to start file watching: ${String(error)}`
              );
            }
          }).pipe(
            // 即使发生错误也继续执行
            Effect28.catchAll(() => Effect28.void)
          );
        });
        const stop = () => Effect28.gen(function* () {
          const timers = yield* Ref9.get(debounceTimersRef);
          for (const [, timer] of timers) {
            clearTimeout(timer);
          }
          yield* Ref9.set(debounceTimersRef, /* @__PURE__ */ new Map());
          const watcher = yield* Ref9.get(watcherRef);
          if (watcher) {
            yield* Effect28.sync(() => watcher.close());
            yield* Ref9.set(watcherRef, null);
          }
          const projectWatchers = yield* Ref9.get(projectWatchersRef);
          for (const [, projectWatcher] of projectWatchers) {
            yield* Effect28.sync(() => projectWatcher.close());
          }
          yield* Ref9.set(projectWatchersRef, /* @__PURE__ */ new Map());
          yield* Ref9.set(isWatchingRef, false);
        });
        return {
          startWatching,
          stop
        };
      })
    );
  }
};

// src/server/core/feature-flag/presentation/FeatureFlagController.ts
import { Context as Context23, Effect as Effect29, Layer as Layer25 } from "effect";
var LayerImpl18 = Effect29.gen(function* () {
  const claudeCodeService = yield* ClaudeCodeService;
  const getFlags = () => Effect29.gen(function* () {
    const claudeCodeFeatures = yield* claudeCodeService.getAvailableFeatures();
    return {
      response: {
        flags: [
          {
            name: "tool-approval",
            enabled: claudeCodeFeatures.canUseTool
          },
          {
            name: "agent-sdk",
            enabled: claudeCodeFeatures.agentSdk
          },
          {
            name: "sidechain-separation",
            enabled: claudeCodeFeatures.sidechainSeparation
          },
          {
            name: "uuid-on-sdk-message",
            enabled: claudeCodeFeatures.uuidOnSDKMessage
          },
          {
            name: "run-skills-directly",
            enabled: claudeCodeFeatures.runSkillsDirectly
          }
        ]
      },
      status: 200
    };
  });
  return {
    getFlags
  };
});
var FeatureFlagController = class extends Context23.Tag("FeatureFlagController")() {
  static {
    this.Live = Layer25.effect(this, LayerImpl18);
  }
};

// src/server/core/file-system/presentation/FileSystemController.ts
import { Context as Context24, Effect as Effect32, Layer as Layer26 } from "effect";

// src/server/core/file-system/functions/getDirectoryListing.ts
import { FileSystem as FileSystem10, Path as Path13 } from "@effect/platform";
import { Effect as Effect30 } from "effect";
var getDirectoryListing = (rootPath, basePath = "/", showHidden = false) => Effect30.gen(function* () {
  const fs = yield* FileSystem10.FileSystem;
  const path = yield* Path13.Path;
  const normalizedBasePath = basePath === "/" ? "" : basePath.startsWith("/") ? basePath.slice(1) : basePath;
  const targetPath = path.resolve(rootPath, normalizedBasePath);
  const resolvedRootPath = path.resolve(rootPath);
  if (!targetPath.startsWith(resolvedRootPath)) {
    return yield* Effect30.fail(
      new Error("Invalid path: outside root directory")
    );
  }
  const exists = yield* fs.exists(targetPath);
  if (!exists) {
    return {
      entries: [],
      basePath: "/",
      currentPath: rootPath
    };
  }
  try {
    const dirents = yield* fs.readDirectory(targetPath);
    const entries = [];
    if (normalizedBasePath !== "") {
      const parentPath = path.dirname(normalizedBasePath);
      entries.push({
        name: "..",
        type: "directory",
        path: parentPath === "." ? "" : parentPath
      });
    }
    for (const dirent of dirents) {
      if (!showHidden && dirent.startsWith(".")) {
        continue;
      }
      const direntPath = path.join(targetPath, dirent);
      const stat = yield* fs.stat(direntPath);
      const entryPath = normalizedBasePath ? path.join(normalizedBasePath, dirent) : dirent;
      if (stat.type === "Directory") {
        entries.push({
          name: dirent,
          type: "directory",
          path: entryPath
        });
      } else if (stat.type === "File") {
        entries.push({
          name: dirent,
          type: "file",
          path: entryPath
        });
      }
    }
    entries.sort((a, b) => {
      if (a.name === "..") return -1;
      if (b.name === "..") return 1;
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    return {
      entries,
      basePath: normalizedBasePath || "/",
      currentPath: targetPath
    };
  } catch (error) {
    console.error("Error reading directory:", error);
    return {
      entries: [],
      basePath: normalizedBasePath || "/",
      currentPath: targetPath
    };
  }
});

// src/server/core/file-system/functions/getFileCompletion.ts
import { FileSystem as FileSystem11, Path as Path14 } from "@effect/platform";
import { Effect as Effect31 } from "effect";
var getFileCompletion = (projectPath, basePath = "/") => Effect31.gen(function* () {
  const fs = yield* FileSystem11.FileSystem;
  const path = yield* Path14.Path;
  const normalizedBasePath = basePath.startsWith("/") ? basePath.slice(1) : basePath;
  const targetPath = path.resolve(projectPath, normalizedBasePath);
  const resolvedProjectPath = path.resolve(projectPath);
  if (!targetPath.startsWith(resolvedProjectPath)) {
    return yield* Effect31.fail(
      new Error("Invalid path: outside project directory")
    );
  }
  const exists = yield* fs.exists(targetPath);
  if (!exists) {
    return {
      entries: [],
      basePath: normalizedBasePath,
      projectPath
    };
  }
  try {
    const dirents = yield* fs.readDirectory(targetPath);
    const entries = [];
    for (const dirent of dirents) {
      if (dirent.startsWith(".")) {
        continue;
      }
      const direntPath = path.join(targetPath, dirent);
      const stat = yield* fs.stat(direntPath);
      const entryPath = normalizedBasePath ? path.join(normalizedBasePath, dirent) : dirent;
      if (stat.type === "Directory") {
        entries.push({
          name: dirent,
          type: "directory",
          path: entryPath
        });
      } else if (stat.type === "File") {
        entries.push({
          name: dirent,
          type: "file",
          path: entryPath
        });
      }
    }
    entries.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    return {
      entries,
      basePath: normalizedBasePath,
      projectPath
    };
  } catch (error) {
    console.error("Error reading directory:", error);
    return {
      entries: [],
      basePath: normalizedBasePath,
      projectPath
    };
  }
});

// src/server/core/file-system/presentation/FileSystemController.ts
var LayerImpl19 = Effect32.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const getFileCompletionRoute = (options) => Effect32.gen(function* () {
    const { projectId, basePath } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    const result = yield* getFileCompletion(projectPath, basePath).pipe(
      Effect32.catchAll((error) => {
        console.error("File completion error:", error);
        return Effect32.succeed({
          entries: [],
          basePath: basePath.startsWith("/") ? basePath.slice(1) : basePath,
          projectPath
        });
      })
    );
    return {
      response: result,
      status: 200
    };
  });
  const getDirectoryListingRoute = (options) => Effect32.gen(function* () {
    const { currentPath, showHidden = false } = options;
    const rootPath = "/";
    const home = process.env.HOME;
    const userProfile = process.env.USERPROFILE;
    const defaultPath = home || userProfile || rootPath;
    const targetPath = currentPath ?? defaultPath;
    const relativePath = targetPath.startsWith(rootPath) ? targetPath.slice(rootPath.length) : targetPath;
    const result = yield* getDirectoryListing(
      rootPath,
      relativePath,
      showHidden
    ).pipe(
      Effect32.catchAll((error) => {
        console.error("Directory listing error:", error);
        return Effect32.succeed({
          entries: [],
          basePath: "/",
          currentPath: rootPath
        });
      })
    );
    return {
      response: result,
      status: 200
    };
  });
  return {
    getFileCompletionRoute,
    getDirectoryListingRoute
  };
});
var FileSystemController = class extends Context24.Tag("FileSystemController")() {
  static {
    this.Live = Layer26.effect(this, LayerImpl19);
  }
};

// src/server/core/git/presentation/GitController.ts
import { Context as Context27, Effect as Effect37, Either as Either3, Layer as Layer29 } from "effect";

// src/server/core/git/functions/getDiff.ts
import { FileSystem as FileSystem13, Path as Path16 } from "@effect/platform";
import { Effect as Effect34 } from "effect";
import parseGitDiff from "parse-git-diff";

// src/server/core/git/functions/utils.ts
import { Command as Command2, FileSystem as FileSystem12, Path as Path15 } from "@effect/platform";
import { Data as Data4, Effect as Effect33, Either } from "effect";
var GitCommandError = class extends Data4.TaggedError("GitCommandError") {
};
function hasStderr(error) {
  return typeof error === "object" && error !== null && ("stderr" in error || "message" in error);
}
var executeGitCommand = (args, cwd) => Effect33.gen(function* () {
  const fs = yield* FileSystem12.FileSystem;
  const path = yield* Path15.Path;
  const absoluteCwd = path.resolve(cwd);
  const dirExists = yield* fs.exists(absoluteCwd);
  if (!dirExists) {
    return yield* Effect33.fail(
      new GitCommandError({
        code: "NOT_A_REPOSITORY",
        message: `Directory does not exist: ${cwd}`,
        command: `git ${args.join(" ")}`
      })
    );
  }
  const command = Command2.make("git", ...args).pipe(
    Command2.workingDirectory(absoluteCwd)
  );
  const result = yield* Effect33.either(Command2.string(command));
  if (Either.isLeft(result)) {
    const error = result.left;
    let errorCode = "COMMAND_FAILED";
    let errorMessage = "Unknown git command error";
    let stderr;
    if (hasStderr(error)) {
      const stderrContent = String(error.stderr || "");
      stderr = stderrContent;
      if (stderrContent.includes("not a git repository")) {
        errorCode = "NOT_A_REPOSITORY";
        errorMessage = "Not a git repository";
      } else if (stderrContent.includes("unknown revision")) {
        errorCode = "BRANCH_NOT_FOUND";
        errorMessage = "Branch or commit not found";
      } else if ("message" in error) {
        errorMessage = String(error.message);
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return yield* Effect33.fail(
      new GitCommandError({
        code: errorCode,
        message: errorMessage,
        command: `git ${args.join(" ")}`,
        stderr
      })
    );
  }
  return result.right;
});
function stripAnsiColors(text) {
  return text.replace(/\x1B\[[0-9;]*m/g, "");
}
function parseLines(output) {
  return output.trim().split("\n").filter((line) => line.trim() !== "");
}

// src/server/core/git/functions/getDiff.ts
function convertToGitDiffFile(fileChange, fileStats) {
  let filePath;
  let status;
  let oldPath;
  switch (fileChange.type) {
    case "AddedFile":
      filePath = fileChange.path;
      status = "added";
      break;
    case "DeletedFile":
      filePath = fileChange.path;
      status = "deleted";
      break;
    case "RenamedFile":
      filePath = fileChange.pathAfter;
      oldPath = fileChange.pathBefore;
      status = "renamed";
      break;
    case "ChangedFile":
      filePath = fileChange.path;
      status = "modified";
      break;
    default:
      filePath = "";
      status = "modified";
  }
  const stats = fileStats.get(filePath) || fileStats.get(oldPath || "") || { additions: 0, deletions: 0 };
  return {
    filePath,
    status,
    additions: stats.additions,
    deletions: stats.deletions,
    oldPath
  };
}
function convertToGitDiffHunk(chunk) {
  if (chunk.type !== "Chunk") {
    return {
      oldStart: 0,
      oldCount: 0,
      newStart: 0,
      newCount: 0,
      header: "",
      lines: []
    };
  }
  const lines = [];
  for (const change of chunk.changes) {
    let line;
    switch (change.type) {
      case "AddedLine":
        line = {
          type: "added",
          content: change.content,
          newLineNumber: change.lineAfter
        };
        break;
      case "DeletedLine":
        line = {
          type: "deleted",
          content: change.content,
          oldLineNumber: change.lineBefore
        };
        break;
      case "UnchangedLine":
        line = {
          type: "context",
          content: change.content,
          oldLineNumber: change.lineBefore,
          newLineNumber: change.lineAfter
        };
        break;
      case "MessageLine":
        line = {
          type: "context",
          content: change.content
        };
        break;
      default:
        line = {
          type: "context",
          content: ""
        };
    }
    lines.push(line);
  }
  return {
    oldStart: chunk.fromFileRange.start,
    oldCount: chunk.fromFileRange.lines,
    newStart: chunk.toFileRange.start,
    newCount: chunk.toFileRange.lines,
    header: `@@ -${chunk.fromFileRange.start},${chunk.fromFileRange.lines} +${chunk.toFileRange.start},${chunk.toFileRange.lines} @@${chunk.context ? ` ${chunk.context}` : ""}`,
    lines
  };
}
var extractRef = (refText) => {
  const [group, ref] = refText.split(":");
  if (group === void 0 || ref === void 0) {
    if (refText === "HEAD") {
      return "HEAD";
    }
    if (refText === "working") {
      return void 0;
    }
    throw new Error(`Invalid ref text: ${refText}`);
  }
  return ref;
};
var getUntrackedFiles = (cwd) => Effect34.gen(function* () {
  const statusData = yield* executeGitCommand(
    ["status", "--untracked-files=all", "--short"],
    cwd
  );
  const untrackedFiles = parseLines(statusData).map((line) => stripAnsiColors(line)).filter((line) => line.startsWith("??")).map((line) => line.slice(3));
  return untrackedFiles;
});
var createUntrackedFileDiff = (cwd, filePath) => Effect34.gen(function* () {
  const fs = yield* FileSystem13.FileSystem;
  const path = yield* Path16.Path;
  const fullPath = path.resolve(cwd, filePath);
  const content = yield* fs.readFileString(fullPath);
  const lines = content.split("\n");
  const diffLines = lines.map((line, index) => ({
    type: "added",
    content: line,
    newLineNumber: index + 1
  }));
  const file = {
    filePath,
    status: "added",
    additions: lines.length,
    deletions: 0
  };
  const hunk = {
    oldStart: 0,
    oldCount: 0,
    newStart: 1,
    newCount: lines.length,
    header: `@@ -0,0 +1,${lines.length} @@`,
    lines: diffLines
  };
  return {
    file,
    hunks: [hunk]
  };
}).pipe(
  Effect34.catchAll((error) => {
    console.warn(`Failed to read untracked file ${filePath}:`, error);
    return Effect34.succeed(null);
  })
);
var getDiff = (cwd, fromRefText, toRefText) => Effect34.gen(function* () {
  const fromRef = extractRef(fromRefText);
  const toRef = extractRef(toRefText);
  if (fromRef === toRef) {
    return {
      success: true,
      data: {
        diffs: [],
        files: [],
        summary: {
          totalFiles: 0,
          totalAdditions: 0,
          totalDeletions: 0
        }
      }
    };
  }
  if (fromRef === void 0) {
    throw new Error(`Invalid fromRef: ${fromRefText}`);
  }
  const commandArgs = toRef === void 0 ? [fromRef] : [fromRef, toRef];
  const numstatData = yield* executeGitCommand(
    ["diff", "--numstat", ...commandArgs],
    cwd
  );
  const diffData = yield* executeGitCommand(
    ["diff", "--unified=5", ...commandArgs],
    cwd
  );
  const fileStats = /* @__PURE__ */ new Map();
  const numstatLines = parseLines(numstatData);
  for (const line of numstatLines) {
    const parts = line.split("	");
    if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
      const additions = parts[0] === "-" ? 0 : Number.parseInt(parts[0], 10);
      const deletions = parts[1] === "-" ? 0 : Number.parseInt(parts[1], 10);
      const filePath = parts[2];
      fileStats.set(filePath, { additions, deletions });
    }
  }
  const parsedDiff = parseGitDiff(diffData);
  const files = [];
  const diffs = [];
  let totalAdditions = 0;
  let totalDeletions = 0;
  for (const fileChange of parsedDiff.files) {
    const file = convertToGitDiffFile(fileChange, fileStats);
    files.push(file);
    const hunks = [];
    for (const chunk of fileChange.chunks) {
      const hunk = convertToGitDiffHunk(chunk);
      hunks.push(hunk);
    }
    diffs.push({
      file,
      hunks
    });
    totalAdditions += file.additions;
    totalDeletions += file.deletions;
  }
  if (toRef === void 0) {
    const untrackedFiles = yield* getUntrackedFiles(cwd).pipe(
      Effect34.catchAll(() => Effect34.succeed([]))
    );
    for (const untrackedFile of untrackedFiles) {
      const untrackedDiff = yield* createUntrackedFileDiff(
        cwd,
        untrackedFile
      );
      if (untrackedDiff) {
        files.push(untrackedDiff.file);
        diffs.push(untrackedDiff);
        totalAdditions += untrackedDiff.file.additions;
      }
    }
  }
  return {
    success: true,
    data: {
      files,
      diffs,
      summary: {
        totalFiles: files.length,
        totalAdditions,
        totalDeletions
      }
    }
  };
}).pipe(
  Effect34.catchAll((error) => {
    const errorMessage = error instanceof Error ? error.message : "message" in error ? String(error.message) : "Unknown error";
    return Effect34.succeed({
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: `Failed to parse diff: ${errorMessage}`
      }
    });
  })
);

// src/server/core/git/services/GitService.ts
import { Command as Command3, FileSystem as FileSystem14, Path as Path17 } from "@effect/platform";
import { Context as Context26, Data as Data5, Duration, Effect as Effect36, Either as Either2, Layer as Layer28 } from "effect";

// src/server/core/platform/services/EnvService.ts
import { Context as Context25, Effect as Effect35, Layer as Layer27, Ref as Ref10 } from "effect";

// src/server/core/platform/schema.ts
import { z as z23 } from "zod";
var envSchema = z23.object({
  // Frameworks
  NODE_ENV: z23.enum(["development", "production", "test"]).optional().default("development"),
  NEXT_PHASE: z23.string().optional(),
  PATH: z23.string().optional(),
  // Anthropic API Configuration
  // Standard Anthropic SDK expects ANTHROPIC_API_KEY
  ANTHROPIC_API_KEY: z23.string().optional(),
  // Some custom proxy services use ANTHROPIC_AUTH_TOKEN instead
  ANTHROPIC_AUTH_TOKEN: z23.string().optional(),
  // Custom API endpoint (e.g., for proxy services or custom deployments)
  ANTHROPIC_BASE_URL: z23.string().optional()
});

// src/server/core/platform/services/EnvService.ts
var LayerImpl20 = Effect35.gen(function* () {
  const envRef = yield* Ref10.make(void 0);
  const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(parsed.error);
      throw new Error(`Invalid environment variables: ${parsed.error.message}`);
    }
    return parsed.data;
  };
  const getEnv = (key) => {
    return Effect35.gen(function* () {
      yield* Ref10.update(envRef, (existingEnv) => {
        if (existingEnv === void 0) {
          return parseEnv();
        }
        return existingEnv;
      });
      const env = yield* Ref10.get(envRef);
      if (env === void 0) {
        throw new Error(
          "Unexpected error: Environment variables are not loaded"
        );
      }
      return env[key];
    });
  };
  return {
    getEnv
  };
});
var EnvService = class extends Context25.Tag("EnvService")() {
  static {
    this.Live = Layer27.effect(this, LayerImpl20);
  }
};

// src/server/core/git/functions/parseGitBranchesOutput.ts
var parseGitBranchesOutput = (output) => {
  const lines = parseLines(output);
  const branches = [];
  const seenBranches = /* @__PURE__ */ new Set();
  for (const line of lines) {
    const match = line.match(
      /^(\*?\s*)([^\s]+)\s+([a-f0-9]+)(?:\s+\[([^\]]+)\])?\s*(.*)/
    );
    if (!match) continue;
    const [, prefix, name, commit, tracking] = match;
    if (!prefix || !name || !commit) continue;
    const current = prefix.includes("*");
    const cleanName = name.replace("remotes/origin/", "");
    if (name.startsWith("remotes/origin/") && seenBranches.has(cleanName)) {
      continue;
    }
    let remote;
    let ahead;
    let behind;
    if (tracking) {
      const remoteMatch = tracking.match(/^([^:]+)/);
      if (remoteMatch?.[1]) {
        remote = remoteMatch[1];
      }
      const aheadMatch = tracking.match(/ahead (\d+)/);
      const behindMatch = tracking.match(/behind (\d+)/);
      if (aheadMatch?.[1]) ahead = parseInt(aheadMatch[1], 10);
      if (behindMatch?.[1]) behind = parseInt(behindMatch[1], 10);
    }
    branches.push({
      name: cleanName,
      current,
      remote,
      commit,
      ahead,
      behind
    });
    seenBranches.add(cleanName);
  }
  return {
    success: true,
    data: branches
  };
};

// src/server/core/git/functions/parseGitCommitsOutput.ts
var parseGitCommitsOutput = (output) => {
  const lines = parseLines(output);
  const commits = [];
  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length < 4) continue;
    const [sha, message, author, date] = parts;
    if (!sha || !message || !author || !date) continue;
    commits.push({
      sha: sha.trim(),
      message: message.trim(),
      author: author.trim(),
      date: date.trim()
    });
  }
  return {
    success: true,
    data: commits
  };
};

// src/server/core/git/services/GitService.ts
var NotARepositoryError = class extends Data5.TaggedError("NotARepositoryError") {
};
var GitCommandError2 = class extends Data5.TaggedError("GitCommandError") {
};
var DetachedHeadError = class extends Data5.TaggedError("DetachedHeadError") {
};
var LayerImpl21 = Effect36.gen(function* () {
  const fs = yield* FileSystem14.FileSystem;
  const path = yield* Path17.Path;
  const envService = yield* EnvService;
  const execGitCommand = (args, cwd) => Effect36.gen(function* () {
    const absoluteCwd = path.resolve(cwd);
    if (!(yield* fs.exists(absoluteCwd))) {
      return yield* Effect36.fail(
        new NotARepositoryError({ cwd: absoluteCwd })
      );
    }
    const command = Command3.make("git", ...args).pipe(
      Command3.workingDirectory(absoluteCwd),
      Command3.env({
        PATH: yield* envService.getEnv("PATH")
      })
    );
    const result = yield* Effect36.either(Command3.string(command));
    if (Either2.isLeft(result)) {
      return yield* Effect36.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: `git ${args.join(" ")}`
        })
      );
    }
    return result.right;
  });
  const getBranches = (cwd) => Effect36.gen(function* () {
    const result = yield* execGitCommand(["branch", "-vv", "--all"], cwd);
    return parseGitBranchesOutput(result);
  });
  const getCurrentBranch = (cwd) => Effect36.gen(function* () {
    const currentBranch = yield* execGitCommand(
      ["branch", "--show-current"],
      cwd
    ).pipe(Effect36.map((result) => result.trim()));
    if (currentBranch === "") {
      return yield* Effect36.fail(new DetachedHeadError({ cwd }));
    }
    return currentBranch;
  });
  const branchExists = (cwd, branchName) => Effect36.gen(function* () {
    const result = yield* Effect36.either(
      execGitCommand(["branch", "--exists", branchName], cwd)
    );
    if (Either2.isLeft(result)) {
      return false;
    }
    return true;
  });
  const getCommits = (cwd) => Effect36.gen(function* () {
    const result = yield* execGitCommand(
      [
        "log",
        "--oneline",
        "-n",
        "20",
        "--format=%H|%s|%an|%ad",
        "--date=iso"
      ],
      cwd
    );
    return parseGitCommitsOutput(result);
  });
  const stageFiles = (cwd, files) => Effect36.gen(function* () {
    if (files.length === 0) {
      return yield* Effect36.fail(
        new GitCommandError2({
          cwd,
          command: "git add (no files)"
        })
      );
    }
    const result = yield* execGitCommand(["add", ...files], cwd);
    return result;
  });
  const commit = (cwd, message) => Effect36.gen(function* () {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return yield* Effect36.fail(
        new GitCommandError2({
          cwd,
          command: "git commit (empty message)"
        })
      );
    }
    console.log(
      "[GitService.commit] Committing with message:",
      trimmedMessage,
      "in",
      cwd
    );
    const result = yield* execGitCommand(
      ["commit", "-m", trimmedMessage],
      cwd
    );
    console.log("[GitService.commit] Commit result:", result);
    const shaMatch = result.match(/\[.+\s+([a-f0-9]+)\]/);
    console.log("[GitService.commit] SHA match:", shaMatch);
    if (shaMatch?.[1]) {
      console.log(
        "[GitService.commit] Returning SHA from match:",
        shaMatch[1]
      );
      return shaMatch[1];
    }
    console.log(
      "[GitService.commit] No SHA match, falling back to rev-parse HEAD"
    );
    const sha = yield* execGitCommand(["rev-parse", "HEAD"], cwd);
    console.log(
      "[GitService.commit] Returning SHA from rev-parse:",
      sha.trim()
    );
    return sha.trim();
  });
  const push = (cwd) => Effect36.gen(function* () {
    const branch = yield* getCurrentBranch(cwd);
    const absoluteCwd = path.resolve(cwd);
    const command = Command3.make("git", "push", "origin", "HEAD").pipe(
      Command3.workingDirectory(absoluteCwd),
      Command3.env({
        PATH: yield* envService.getEnv("PATH")
      })
    );
    const exitCodeResult = yield* Effect36.either(
      Command3.exitCode(command).pipe(Effect36.timeout(Duration.seconds(60)))
    );
    if (Either2.isLeft(exitCodeResult)) {
      console.log("[GitService.push] Command failed or timeout");
      return yield* Effect36.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: "git push origin HEAD (timeout after 60s)"
        })
      );
    }
    const exitCode = exitCodeResult.right;
    console.log("[GitService.push] Exit code:", exitCode);
    if (exitCode !== 0) {
      const stderrLines = yield* Command3.lines(
        Command3.make("git", "push", "origin", "HEAD").pipe(
          Command3.workingDirectory(absoluteCwd),
          Command3.env({
            PATH: yield* envService.getEnv("PATH")
          }),
          Command3.stderr("inherit")
        )
      ).pipe(Effect36.orElse(() => Effect36.succeed([])));
      const stderr = Array.from(stderrLines).join("\n");
      console.log("[GitService.push] Failed with stderr:", stderr);
      return yield* Effect36.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: `git push origin HEAD - ${stderr}`
        })
      );
    }
    console.log("[GitService.push] Push succeeded");
    return { branch, output: "success" };
  });
  const getBranchHash = (cwd, branchName) => Effect36.gen(function* () {
    const result = yield* execGitCommand(["rev-parse", branchName], cwd).pipe(
      Effect36.map((output) => output.trim().split("\n")[0] ?? null)
    );
    return result;
  });
  const getBranchNamesByCommitHash = (cwd, hash) => Effect36.gen(function* () {
    const result = yield* execGitCommand(
      ["branch", "--contains", hash, "--format=%(refname:short)"],
      cwd
    );
    return result.split("\n").map((line) => line.trim()).filter((line) => line !== "");
  });
  const compareCommitHash = (cwd, targetHash, compareHash) => Effect36.gen(function* () {
    const aheadResult = yield* execGitCommand(
      ["rev-list", `${targetHash}..${compareHash}`],
      cwd
    );
    const aheadCounts = aheadResult.split("\n").map((line) => line.trim()).filter((line) => line !== "").length;
    const behindResult = yield* execGitCommand(
      ["rev-list", `${compareHash}..${targetHash}`],
      cwd
    );
    const behindCounts = behindResult.split("\n").map((line) => line.trim()).filter((line) => line !== "").length;
    if (aheadCounts === 0 && behindCounts === 0) {
      return "un-related";
    }
    if (aheadCounts > 0) {
      return "ahead";
    }
    if (behindCounts > 0) {
      return "behind";
    }
    return "un-related";
  });
  const getCommitsWithParent = (cwd, options) => Effect36.gen(function* () {
    const { offset, limit } = options;
    const result = yield* execGitCommand(
      [
        "log",
        "-n",
        String(limit),
        "--skip",
        String(offset),
        "--graph",
        "--pretty=format:%h %p"
      ],
      cwd
    );
    const lines = result.split("\n").map((line) => line.trim()).filter((line) => line !== "");
    const commits = [];
    for (const line of lines) {
      const match = /^\* (?<current>.+) (?<parent>.+)$/.exec(line);
      if (match?.groups?.current && match.groups.parent) {
        commits.push({
          current: match.groups.current,
          parent: match.groups.parent
        });
      }
    }
    return commits;
  });
  const findBaseBranch = (cwd, targetBranch) => Effect36.gen(function* () {
    let offset = 0;
    const limit = 20;
    while (offset < 100) {
      const commits = yield* getCommitsWithParent(cwd, { offset, limit });
      for (const commit2 of commits) {
        const branchNames = yield* getBranchNamesByCommitHash(
          cwd,
          commit2.current
        );
        if (!branchNames.includes(targetBranch)) {
          continue;
        }
        const otherBranchNames = branchNames.filter(
          (branchName) => branchName !== targetBranch
        );
        if (otherBranchNames.length === 0) {
          continue;
        }
        for (const branchName of otherBranchNames) {
          const comparison = yield* compareCommitHash(
            cwd,
            targetBranch,
            branchName
          );
          if (comparison === "behind") {
            return { branch: branchName, hash: commit2.current };
          }
        }
      }
      offset += limit;
    }
    return null;
  });
  const getCommitsBetweenBranches = (cwd, baseBranch, targetBranch) => Effect36.gen(function* () {
    const result = yield* execGitCommand(
      [
        "log",
        `${baseBranch}..${targetBranch}`,
        "--format=%H|%s|%an|%ad",
        "--date=iso"
      ],
      cwd
    );
    return parseGitCommitsOutput(result);
  });
  return {
    getBranches,
    getCurrentBranch,
    branchExists,
    getCommits,
    stageFiles,
    commit,
    push,
    getBranchHash,
    getBranchNamesByCommitHash,
    compareCommitHash,
    getCommitsWithParent,
    findBaseBranch,
    getCommitsBetweenBranches
  };
});
var GitService = class extends Context26.Tag("GitService")() {
  static {
    this.Live = Layer28.effect(this, LayerImpl21);
  }
};

// src/server/core/git/presentation/GitController.ts
var LayerImpl22 = Effect37.gen(function* () {
  const gitService = yield* GitService;
  const projectRepository = yield* ProjectRepository;
  const getGitDiff = (options) => Effect37.gen(function* () {
    const { projectId, fromRef, toRef } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    const result = yield* getDiff(projectPath, fromRef, toRef);
    return {
      response: result,
      status: 200
    };
  });
  const commitFiles = (options) => Effect37.gen(function* () {
    const { projectId, files, message } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      console.log("[GitController.commitFiles] Project path is null");
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    console.log("[GitController.commitFiles] Project path:", projectPath);
    console.log("[GitController.commitFiles] Staging files...");
    const stageResult = yield* Effect37.either(
      gitService.stageFiles(projectPath, files)
    );
    if (Either3.isLeft(stageResult)) {
      console.log(
        "[GitController.commitFiles] Stage failed:",
        stageResult.left
      );
      return {
        response: {
          success: false,
          error: "Failed to stage files",
          errorCode: "GIT_COMMAND_ERROR",
          details: stageResult.left.message
        },
        status: 200
      };
    }
    console.log("[GitController.commitFiles] Stage succeeded");
    console.log("[GitController.commitFiles] Committing...");
    const commitResult = yield* Effect37.either(
      gitService.commit(projectPath, message)
    );
    if (Either3.isLeft(commitResult)) {
      console.log(
        "[GitController.commitFiles] Commit failed:",
        commitResult.left
      );
      const error = commitResult.left;
      const errorMessage = "_tag" in error && error._tag === "GitCommandError" ? error.command : "message" in error ? String(error.message) : "Unknown error";
      const isHookFailure = errorMessage.includes("hook");
      return {
        response: {
          success: false,
          error: isHookFailure ? "Pre-commit hook failed" : "Commit failed",
          errorCode: isHookFailure ? "HOOK_FAILED" : "GIT_COMMAND_ERROR",
          details: errorMessage
        },
        status: 200
      };
    }
    console.log(
      "[GitController.commitFiles] Commit succeeded, SHA:",
      commitResult.right
    );
    return {
      response: {
        success: true,
        commitSha: commitResult.right,
        filesCommitted: files.length,
        message
      },
      status: 200
    };
  });
  const pushCommits = (options) => Effect37.gen(function* () {
    const { projectId } = options;
    console.log("[GitController.pushCommits] Request:", { projectId });
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      console.log("[GitController.pushCommits] Project path is null");
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    console.log("[GitController.pushCommits] Project path:", projectPath);
    console.log("[GitController.pushCommits] Pushing...");
    const pushResult = yield* Effect37.either(gitService.push(projectPath));
    if (Either3.isLeft(pushResult)) {
      console.log(
        "[GitController.pushCommits] Push failed:",
        pushResult.left
      );
      const error = pushResult.left;
      const errorMessage = "_tag" in error && error._tag === "GitCommandError" ? error.command : "message" in error ? String(error.message) : "Unknown error";
      const errorCode = parsePushError(errorMessage);
      return {
        response: {
          success: false,
          error: getPushErrorMessage(errorCode),
          errorCode,
          details: errorMessage
        },
        status: 200
      };
    }
    console.log("[GitController.pushCommits] Push succeeded");
    return {
      response: {
        success: true,
        remote: "origin",
        branch: pushResult.right.branch
      },
      status: 200
    };
  });
  const commitAndPush = (options) => Effect37.gen(function* () {
    const { projectId, files, message } = options;
    console.log("[GitController.commitAndPush] Request:", {
      projectId,
      files,
      message
    });
    const commitResult = yield* commitFiles({ projectId, files, message });
    if (commitResult.status !== 200 || !commitResult.response.success) {
      console.log(
        "[GitController.commitAndPush] Commit failed:",
        commitResult
      );
      return commitResult;
    }
    const commitSha = commitResult.response.commitSha;
    console.log(
      "[GitController.commitAndPush] Commit succeeded, SHA:",
      commitSha
    );
    const pushResult = yield* pushCommits({ projectId });
    if (pushResult.status !== 200 || !pushResult.response.success) {
      console.log(
        "[GitController.commitAndPush] Push failed, partial failure:",
        pushResult
      );
      return {
        response: {
          success: false,
          commitSucceeded: true,
          commitSha,
          error: pushResult.response.error,
          errorCode: pushResult.response.errorCode,
          details: pushResult.response.details
        },
        status: 200
      };
    }
    console.log("[GitController.commitAndPush] Both operations succeeded");
    return {
      response: {
        success: true,
        commitSha,
        filesCommitted: files.length,
        message,
        remote: pushResult.response.remote,
        branch: pushResult.response.branch
      },
      status: 200
    };
  });
  const getCurrentRevisions = (options) => Effect37.gen(function* () {
    const { projectId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    const currentBranchResult = yield* Effect37.either(
      gitService.getCurrentBranch(projectPath)
    );
    if (Either3.isLeft(currentBranchResult)) {
      return {
        response: {
          success: false
        },
        status: 200
      };
    }
    const currentBranch = currentBranchResult.right;
    const baseBranchResult = yield* Effect37.either(
      gitService.findBaseBranch(projectPath, currentBranch)
    );
    const allBranchesResult = yield* Effect37.either(
      gitService.getBranches(projectPath)
    );
    if (Either3.isLeft(allBranchesResult)) {
      return {
        response: {
          success: false
        },
        status: 200
      };
    }
    const allBranches = allBranchesResult.right.data;
    const currentBranchDetails = allBranches.find(
      (branch) => branch.name === currentBranch
    );
    let baseBranchDetails;
    if (Either3.isRight(baseBranchResult) && baseBranchResult.right !== null) {
      const baseBranchName = baseBranchResult.right.branch;
      baseBranchDetails = allBranches.find(
        (branch) => branch.name === baseBranchName
      );
    }
    let commits = [];
    if (Either3.isRight(baseBranchResult) && baseBranchResult.right !== null) {
      const baseBranchHash = baseBranchResult.right.hash;
      const commitsResult = yield* Effect37.either(
        gitService.getCommitsBetweenBranches(
          projectPath,
          baseBranchHash,
          "HEAD"
        )
      );
      if (Either3.isRight(commitsResult)) {
        commits = commitsResult.right.data;
      }
    }
    return {
      response: {
        success: true,
        data: {
          baseBranch: baseBranchDetails ?? null,
          currentBranch: currentBranchDetails ?? null,
          head: currentBranchDetails?.commit ?? null,
          commits
        }
      },
      status: 200
    };
  });
  return {
    getGitDiff,
    commitFiles,
    pushCommits,
    commitAndPush,
    getCurrentRevisions
  };
});
function parsePushError(stderr) {
  if (stderr.includes("no upstream") || stderr.includes("has no upstream")) {
    return "NO_UPSTREAM";
  }
  if (stderr.includes("non-fast-forward") || stderr.includes("failed to push some refs")) {
    return "NON_FAST_FORWARD";
  }
  if (stderr.includes("Authentication failed") || stderr.includes("Permission denied")) {
    return "AUTH_FAILED";
  }
  if (stderr.includes("Could not resolve host")) {
    return "NETWORK_ERROR";
  }
  if (stderr.includes("timeout") || stderr.includes("timed out")) {
    return "TIMEOUT";
  }
  return "GIT_COMMAND_ERROR";
}
function getPushErrorMessage(code) {
  const messages = {
    NO_UPSTREAM: "Branch has no upstream. Run: git push --set-upstream origin <branch>",
    NON_FAST_FORWARD: "Remote has diverged. Pull changes first before pushing.",
    AUTH_FAILED: "Authentication failed. Check your SSH keys or HTTPS credentials.",
    NETWORK_ERROR: "Network error. Check your internet connection.",
    TIMEOUT: "Push operation timed out after 60 seconds. Retry or check network.",
    GIT_COMMAND_ERROR: "Git command failed. Check details.",
    PROJECT_NOT_FOUND: "Project not found.",
    NOT_A_REPOSITORY: "Not a git repository."
  };
  return messages[code];
}
var GitController = class extends Context27.Tag("GitController")() {
  static {
    this.Live = Layer29.effect(this, LayerImpl22);
  }
};

// src/server/core/openspec/presentation/OpenSpecController.ts
import { Context as Context35, Effect as Effect45, Layer as Layer37 } from "effect";

// src/server/core/openspec/services/OpenSpecEnvironmentService.ts
import { Command as Command5, FileSystem as FileSystem16, Path as Path19 } from "@effect/platform";
import { Context as Context29, Data as Data6, Duration as Duration3, Effect as Effect39, Either as Either5, Layer as Layer31 } from "effect";

// src/server/core/openspec/services/CliDetectionService.ts
import { Command as Command4, CommandExecutor, FileSystem as FileSystem15, Path as Path18 } from "@effect/platform";
import { Context as Context28, Duration as Duration2, Effect as Effect38, Either as Either4, Layer as Layer30 } from "effect";
var CliDetectionService = class extends Context28.Tag("CliDetectionService")() {
};
var CliDetectionServiceLive = Layer30.effect(
  CliDetectionService,
  Effect38.gen(function* () {
    const fs = yield* FileSystem15.FileSystem;
    const path = yield* Path18.Path;
    const commandExecutor = yield* CommandExecutor.CommandExecutor;
    const commandExecutorLayer = Layer30.succeed(
      CommandExecutor.CommandExecutor,
      commandExecutor
    );
    return {
      /**
       * 检查全局 CLI 安装状态
       * 先检查全局 openspec，再检查 npx 可用性
       */
      checkGlobalCli: () => Effect38.gen(function* () {
        const globalCommand = Command4.make("openspec", "--version");
        const globalResult = yield* Effect38.either(
          Command4.string(globalCommand).pipe(
            Effect38.timeout(Duration2.seconds(5))
          )
        );
        if (Either4.isRight(globalResult)) {
          return {
            installed: true,
            version: String(globalResult.right).trim(),
            type: "global"
          };
        }
        const npxCommand = Command4.make("npx", "openspec", "--version");
        const npxResult = yield* Effect38.either(
          Command4.string(npxCommand).pipe(
            Effect38.timeout(Duration2.seconds(10))
          )
        );
        if (Either4.isRight(npxResult)) {
          return {
            installed: true,
            version: String(npxResult.right).trim(),
            type: "npx"
          };
        }
        return { installed: false };
      }).pipe(
        Effect38.provide(commandExecutorLayer),
        Effect38.catchAll(() => Effect38.succeed({ installed: false }))
      ),
      /**
       * 检查项目本地 CLI 安装状态
       */
      checkProjectCli: (projectPath) => Effect38.gen(function* () {
        const nodeModulesBinPath = path.join(
          projectPath,
          "node_modules",
          ".bin",
          "openspec"
        );
        const exists = yield* fs.exists(nodeModulesBinPath);
        if (!exists) {
          return { installed: false };
        }
        const command = Command4.make(nodeModulesBinPath, "--version");
        const result = yield* Effect38.either(
          Command4.string(command).pipe(Effect38.timeout(Duration2.seconds(5)))
        );
        if (Either4.isRight(result)) {
          return {
            installed: true,
            version: String(result.right).trim(),
            type: "project",
            cliPath: nodeModulesBinPath
          };
        }
        return { installed: false };
      }).pipe(
        Effect38.provide(commandExecutorLayer),
        Effect38.catchAll(() => Effect38.succeed({ installed: false }))
      )
    };
  })
);

// src/server/core/openspec/services/OpenSpecEnvironmentService.ts
var ProjectPathNotFoundError2 = class extends Data6.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var SPECFORGE_REQUIRED_SKILLS = [
  "design-generation",
  "querying-infra-catalog",
  "task-planning"
];
var SCENARIO_DESCRIPTIONS = {
  S1_NEW: "\u5168\u65B0\u9879\u76EE\uFF0C\u9700\u8981\u5B8C\u6574\u521D\u59CB\u5316 SpecForge \u914D\u7F6E",
  S2_OPENSPEC_ONLY: "\u5DF2\u6709 openspec \u76EE\u5F55\uFF0C\u9700\u8981\u589E\u91CF\u6CE8\u5165 .claude \u914D\u7F6E",
  S3_CLAUDE_ONLY: "\u5DF2\u6709 .claude \u76EE\u5F55\uFF0C\u9700\u8981\u589E\u91CF\u6CE8\u5165 openspec \u914D\u7F6E\u548C skills",
  S4_BOTH_NON_SPECFORGE: "\u5DF2\u6709 openspec \u548C .claude \u76EE\u5F55\uFF0C\u9700\u8981\u6CE8\u5165 SpecForge skills",
  S5_CONFIGURED: "SpecForge \u914D\u7F6E\u5B8C\u6574\uFF0C\u53EF\u6B63\u5E38\u4F7F\u7528",
  S6_PARTIAL: "SpecForge \u914D\u7F6E\u4E0D\u5B8C\u6574\uFF0C\u9700\u8981\u4FEE\u590D\u7F3A\u5931\u90E8\u5206"
};
var SCENARIO_ACTIONS = {
  S1_NEW: "full_init",
  S2_OPENSPEC_ONLY: "incremental_inject",
  S3_CLAUDE_ONLY: "incremental_inject",
  S4_BOTH_NON_SPECFORGE: "incremental_inject",
  S5_CONFIGURED: "none",
  S6_PARTIAL: "repair"
};
var LayerImpl23 = Effect39.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem16.FileSystem;
  const path = yield* Path19.Path;
  const cliDetection = yield* CliDetectionService;
  const parseSpecforgeMarker = (content) => {
    const markerMatch = content.match(
      /_specforge:\s*\n\s*version:\s*["']?([^"'\n]+)["']?\s*\n\s*profile:\s*["']?([^"'\n]+)["']?\s*\n\s*initialized_at:\s*["']?([^"'\n]+)["']?/
    );
    if (markerMatch?.[1] && markerMatch[2] && markerMatch[3]) {
      return {
        version: markerMatch[1],
        profile: markerMatch[2],
        initializedAt: markerMatch[3]
      };
    }
    return void 0;
  };
  const hasSpecforgeMarker = (projectPath) => Effect39.gen(function* () {
    const configPath = path.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (!exists) return false;
    const content = yield* fs.readFileString(configPath);
    return content.includes("_specforge:");
  });
  const getSpecforgeConfig = (projectPath) => Effect39.gen(function* () {
    const configPath = path.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (!exists) return void 0;
    const content = yield* fs.readFileString(configPath);
    return parseSpecforgeMarker(content);
  });
  const getMissingSkills = (projectPath) => Effect39.gen(function* () {
    const skillsDir = path.join(projectPath, ".claude", "skills");
    const missing = [];
    for (const skill of SPECFORGE_REQUIRED_SKILLS) {
      const skillPath = path.join(skillsDir, skill);
      const exists = yield* fs.exists(skillPath);
      if (!exists) {
        missing.push(skill);
      }
    }
    return missing;
  });
  const validateConfig = (hasOpenspecDir, hasClaudeDir, hasMarker, specforgeConfig, missingSkills) => {
    const errors = [];
    if (!hasOpenspecDir) {
      errors.push("\u7F3A\u5C11 openspec \u76EE\u5F55");
    }
    if (!hasClaudeDir) {
      errors.push("\u7F3A\u5C11 .claude \u76EE\u5F55");
    }
    if (hasOpenspecDir && !hasMarker) {
      errors.push("openspec/config.yaml \u4E2D\u7F3A\u5C11 _specforge \u6807\u8BB0");
    }
    if (hasMarker && !specforgeConfig) {
      errors.push("_specforge \u6807\u8BB0\u5B58\u5728\u4F46\u89E3\u6790\u5931\u8D25\uFF08\u914D\u7F6E\u683C\u5F0F\u635F\u574F\uFF09");
    }
    if (missingSkills.length > 0) {
      errors.push(`\u7F3A\u5C11\u5FC5\u9700\u7684 skills: ${missingSkills.join(", ")}`);
    }
    return errors;
  };
  const getMissingMcpServers = (_projectPath) => Effect39.succeed([]);
  const identifyScenario = (hasOpenspec, hasClaude, hasMarker, missingSkills) => {
    if (!hasOpenspec && !hasClaude) {
      return "S1_NEW";
    }
    if (hasOpenspec && !hasClaude && !hasMarker) {
      return "S2_OPENSPEC_ONLY";
    }
    if (!hasOpenspec && hasClaude) {
      return "S3_CLAUDE_ONLY";
    }
    if (hasOpenspec && hasClaude && !hasMarker) {
      return "S4_BOTH_NON_SPECFORGE";
    }
    if (hasOpenspec && hasClaude && hasMarker) {
      const isComplete = missingSkills.length === 0;
      return isComplete ? "S5_CONFIGURED" : "S6_PARTIAL";
    }
    return "S1_NEW";
  };
  const checkEnvironment = (projectId) => Effect39.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect39.fail(new ProjectPathNotFoundError2({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const globalCli = yield* cliDetection.checkGlobalCli();
    const projectCli = yield* cliDetection.checkProjectCli(projectPath);
    const cliInstalled = globalCli.installed || projectCli.installed;
    const cliVersion = globalCli.version ?? projectCli.version;
    const cliInstallType = projectCli.installed ? "project" : globalCli.installed ? globalCli.type : void 0;
    const openspecDir = path.join(projectPath, "openspec");
    const claudeDir = path.join(projectPath, ".claude");
    const hasOpenspecDir = yield* fs.exists(openspecDir);
    const hasClaudeDir = yield* fs.exists(claudeDir);
    const hasMarker = hasOpenspecDir ? yield* hasSpecforgeMarker(projectPath) : false;
    const specforgeConfig = hasMarker ? yield* getSpecforgeConfig(projectPath) : void 0;
    const missingSpecforgeSkills = hasClaudeDir ? yield* getMissingSkills(projectPath) : [...SPECFORGE_REQUIRED_SKILLS];
    const missingMcpServers = yield* getMissingMcpServers(projectPath);
    const configErrors = validateConfig(
      hasOpenspecDir,
      hasClaudeDir,
      hasMarker,
      specforgeConfig,
      missingSpecforgeSkills
    );
    const isConfigCorrupted = configErrors.length > 0;
    const scenario = identifyScenario(
      hasOpenspecDir,
      hasClaudeDir,
      hasMarker,
      missingSpecforgeSkills
    );
    const status = {
      // CLI 状态
      cliInstalled,
      cliVersion,
      cliInstallType,
      // 场景识别
      scenario,
      scenarioDescription: SCENARIO_DESCRIPTIONS[scenario],
      // 目录状态
      hasOpenspecDir,
      hasClaudeDir,
      hasSpecforgeMarker: hasMarker,
      specforgeConfig: specforgeConfig ?? null,
      // 确保字段存在（null 而不是 undefined）
      // 配置验证
      isConfigCorrupted,
      configErrors,
      // 缺失项分析
      missingSpecforgeSkills,
      missingMcpServers,
      // 推荐操作
      recommendedAction: SCENARIO_ACTIONS[scenario]
    };
    return status;
  });
  const installCliGlobal = (options = {}) => Effect39.gen(function* () {
    const installCommand = Command5.make(
      "npm",
      "install",
      "-g",
      "@fission-ai/openspec@latest"
    );
    const installResult = yield* Effect39.either(
      Command5.string(installCommand).pipe(
        Effect39.timeout(Duration3.seconds(120))
      )
    );
    if (Either5.isLeft(installResult)) {
      return {
        success: false,
        error: `\u5B89\u88C5\u5931\u8D25: ${String(installResult.left)}`,
        initialized: false
      };
    }
    if (options.initialize && options.projectPath) {
      const initCommand = Command5.make(
        "openspec",
        "init",
        "--tools",
        "claude",
        "--force"
      );
      const initCommandWithCwd = Command5.workingDirectory(
        initCommand,
        options.projectPath
      );
      const initResult = yield* Effect39.either(
        Command5.string(initCommandWithCwd).pipe(
          Effect39.timeout(Duration3.seconds(60))
        )
      );
      if (Either5.isLeft(initResult)) {
        return {
          success: false,
          error: `\u521D\u59CB\u5316\u5931\u8D25: ${String(initResult.left)}`,
          initialized: false
        };
      }
    }
    return {
      success: true,
      error: void 0,
      initialized: options.initialize ?? false
    };
  });
  const installCliProject = (projectId, options = {}) => Effect39.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect39.fail(new ProjectPathNotFoundError2({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const installCommand = Command5.make(
      "npm",
      "install",
      "--save-dev",
      "@fission-ai/openspec@latest"
    );
    const installCommandWithCwd = Command5.workingDirectory(
      installCommand,
      projectPath
    );
    const installResult = yield* Effect39.either(
      Command5.string(installCommandWithCwd).pipe(
        Effect39.timeout(Duration3.seconds(120))
      )
    );
    if (Either5.isLeft(installResult)) {
      return {
        success: false,
        error: `\u5B89\u88C5\u5931\u8D25: ${String(installResult.left)}`,
        initialized: false
      };
    }
    if (options.initialize) {
      const initCommand = Command5.make(
        "npx",
        "openspec",
        "init",
        "--tools",
        "claude",
        "--force"
      );
      const initCommandWithCwd = Command5.workingDirectory(
        initCommand,
        projectPath
      );
      const initResult = yield* Effect39.either(
        Command5.string(initCommandWithCwd).pipe(
          Effect39.timeout(Duration3.seconds(60))
        )
      );
      if (Either5.isLeft(initResult)) {
        return {
          success: false,
          error: `\u521D\u59CB\u5316\u5931\u8D25: ${String(initResult.left)}`,
          initialized: false
        };
      }
    }
    return {
      success: true,
      error: void 0,
      initialized: options.initialize ?? false
    };
  });
  const initializeOpenspec = (projectId) => Effect39.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect39.fail(new ProjectPathNotFoundError2({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const globalCommand = Command5.make(
      "openspec",
      "init",
      "--tools",
      "claude",
      "--force"
    );
    const globalCommandWithCwd = Command5.workingDirectory(
      globalCommand,
      projectPath
    );
    const globalResult = yield* Effect39.either(
      Command5.string(globalCommandWithCwd).pipe(
        Effect39.timeout(Duration3.seconds(60))
      )
    );
    if (Either5.isRight(globalResult)) {
      return {
        success: true,
        error: void 0,
        method: "global"
      };
    }
    const npxCommand = Command5.make(
      "npx",
      "openspec",
      "init",
      "--tools",
      "claude",
      "--force"
    );
    const npxCommandWithCwd = Command5.workingDirectory(
      npxCommand,
      projectPath
    );
    const npxResult = yield* Effect39.either(
      Command5.string(npxCommandWithCwd).pipe(
        Effect39.timeout(Duration3.seconds(120))
      )
    );
    if (Either5.isRight(npxResult)) {
      return {
        success: true,
        error: void 0,
        method: "npx"
      };
    }
    return {
      success: false,
      error: `\u521D\u59CB\u5316\u5931\u8D25: ${String(npxResult.left)}`,
      method: null
    };
  });
  return {
    checkEnvironment,
    installCliGlobal,
    installCliProject,
    initializeOpenspec
  };
});
var OpenSpecEnvironmentService = class extends Context29.Tag(
  "OpenSpecEnvironmentService"
)() {
  static {
    this.Live = Layer31.effect(this, LayerImpl23);
  }
};

// src/server/core/openspec/services/OpenSpecService.ts
import { FileSystem as FileSystem17, Path as Path20 } from "@effect/platform";
import { Context as Context30, Data as Data7, Effect as Effect40, Layer as Layer32, Option as Option4 } from "effect";
var ProjectPathNotFoundError3 = class extends Data7.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var OpenSpecDirectoryNotFoundError = class extends Data7.TaggedError(
  "OpenSpecDirectoryNotFoundError"
) {
};
var LayerImpl24 = Effect40.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem17.FileSystem;
  const path = yield* Path20.Path;
  const checkAllTasksCompleted = (tasksContent) => {
    const checkboxes = tasksContent.match(/- \[(x| )\]/g);
    if (!checkboxes || checkboxes.length === 0) {
      return false;
    }
    return checkboxes.every((cb) => cb.includes("x"));
  };
  const inferStatus = (designContent, tasksContent) => {
    if (tasksContent) {
      const tasksConfirmed = tasksContent.includes(
        "<!-- TASKS_CONFIRMED: true -->"
      );
      const allTasksComplete = checkAllTasksCompleted(tasksContent);
      if (allTasksComplete) {
        return "completed";
      }
      if (tasksConfirmed) {
        return "implementing";
      }
      return "task-planning";
    }
    if (designContent) {
      const designFinalConfirmed = designContent.includes(
        "<!-- DESIGN_FINAL_CONFIRMATION: true -->"
      );
      if (designFinalConfirmed) {
        return "design-confirmed";
      }
      return "designing";
    }
    return "draft";
  };
  const getChanges = (projectId) => Effect40.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect40.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    const changesDir = path.join(
      project.meta.projectPath,
      "openspec",
      "changes"
    );
    const exists = yield* fs.exists(changesDir);
    if (!exists) {
      return [];
    }
    const entries = yield* fs.readDirectory(changesDir);
    const changes = [];
    for (const entry of entries) {
      if (entry === "archive") continue;
      const entryPath = path.join(changesDir, entry);
      const stat = yield* fs.stat(entryPath);
      if (stat.type === "Directory") {
        let description = "";
        const proposalPath = path.join(entryPath, "proposal.md");
        if (yield* fs.exists(proposalPath)) {
          const content = yield* fs.readFileString(proposalPath);
          const lines = content.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("![")) {
              description = trimmed;
              break;
            }
          }
        }
        const designPath = path.join(entryPath, "design.md");
        const architecturePath = path.join(entryPath, "architecture.md");
        let designContent;
        if (yield* fs.exists(architecturePath)) {
          designContent = yield* fs.readFileString(architecturePath);
        } else if (yield* fs.exists(designPath)) {
          designContent = yield* fs.readFileString(designPath);
        }
        const tasksPath = path.join(entryPath, "tasks.md");
        let tasksContent;
        if (yield* fs.exists(tasksPath)) {
          tasksContent = yield* fs.readFileString(tasksPath);
        }
        changes.push({
          name: entry,
          status: inferStatus(designContent, tasksContent),
          updatedAt: Option4.getOrElse(
            stat.mtime,
            () => /* @__PURE__ */ new Date()
          ).toISOString(),
          description
        });
      }
    }
    return changes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
  const getArchivedChanges = (projectId) => Effect40.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect40.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    const archiveDir = path.join(
      project.meta.projectPath,
      "openspec",
      "changes",
      "archive"
    );
    const exists = yield* fs.exists(archiveDir);
    if (!exists) {
      return [];
    }
    const entries = yield* fs.readDirectory(archiveDir);
    const changes = [];
    for (const entry of entries) {
      const entryPath = path.join(archiveDir, entry);
      const stat = yield* fs.stat(entryPath);
      if (stat.type === "Directory") {
        changes.push({
          name: entry,
          status: "archived",
          updatedAt: Option4.getOrElse(
            stat.mtime,
            () => /* @__PURE__ */ new Date()
          ).toISOString(),
          description: ""
          // Placeholder
        });
      }
    }
    return changes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
  const getChangeDetails = (projectId, changeId) => Effect40.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect40.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    let changeDir = path.join(
      project.meta.projectPath,
      "openspec",
      "changes",
      changeId
    );
    let exists = yield* fs.exists(changeDir);
    if (!exists) {
      const archiveDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        "archive",
        changeId
      );
      if (yield* fs.exists(archiveDir)) {
        changeDir = archiveDir;
        exists = true;
      }
    }
    if (!exists) {
      return yield* Effect40.fail(
        new OpenSpecDirectoryNotFoundError({
          path: changeDir,
          message: `Change directory not found: ${changeId}`
        })
      );
    }
    const stat = yield* fs.stat(changeDir);
    const isArchived = changeDir.includes("/archive/");
    const proposalPath = path.join(changeDir, "proposal.md");
    const proposalContent = (yield* fs.exists(proposalPath)) ? yield* fs.readFileString(proposalPath) : void 0;
    let description = "";
    if (proposalContent) {
      const lines = proposalContent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("![")) {
          description = trimmed;
          break;
        }
      }
    }
    const architecturePath = path.join(changeDir, "architecture.md");
    const designPath = path.join(changeDir, "design.md");
    let designContent;
    if (yield* fs.exists(architecturePath)) {
      designContent = yield* fs.readFileString(architecturePath);
    } else if (yield* fs.exists(designPath)) {
      designContent = yield* fs.readFileString(designPath);
    }
    const tasksPath = path.join(changeDir, "tasks.md");
    const tasksExists = yield* fs.exists(tasksPath);
    const tasksContent = tasksExists ? yield* fs.readFileString(tasksPath) : void 0;
    const testsPath = path.join(changeDir, "tests.md");
    const testsContent = (yield* fs.exists(testsPath)) ? yield* fs.readFileString(testsPath) : void 0;
    const rootSpecsPath = path.join(changeDir, "specs.md");
    const specsContent = (yield* fs.exists(rootSpecsPath)) ? yield* fs.readFileString(rootSpecsPath) : void 0;
    const specsDir = path.join(changeDir, "specs");
    let specFiles = [];
    const getFilesRecursively = (dir) => Effect40.gen(function* () {
      if (!(yield* fs.exists(dir))) return [];
      const entries = yield* fs.readDirectory(dir);
      let results = [];
      for (const entry of entries) {
        const entryPath = path.join(dir, entry);
        if (entry.startsWith(".")) continue;
        const stat2 = yield* fs.stat(entryPath);
        if (stat2.type === "Directory") {
          const subFiles = yield* getFilesRecursively(entryPath);
          results = [...results, ...subFiles];
        } else {
          results.push(entryPath);
        }
      }
      return results;
    });
    if (yield* fs.exists(specsDir)) {
      const filePaths = yield* getFilesRecursively(specsDir);
      specFiles = yield* Effect40.all(
        filePaths.map(
          (filePath) => Effect40.gen(function* () {
            const content = yield* fs.readFileString(filePath);
            const relativeName = path.relative(specsDir, filePath);
            return { name: relativeName, content };
          })
        ),
        { concurrency: "unbounded" }
      );
    }
    return {
      name: changeId,
      status: isArchived ? "archived" : inferStatus(designContent, tasksContent),
      updatedAt: Option4.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date()).toISOString(),
      description,
      proposalContent,
      designContent,
      tasksContent,
      testsContent,
      specsContent,
      specFiles
    };
  });
  const updateChangeFile = (projectId, changeId, fileName, content) => Effect40.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect40.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    const allowedFiles = [
      "design.md",
      "proposal.md",
      "tasks.md",
      "tests.md",
      "specs.md"
    ];
    const isSpecsFile = fileName.startsWith("specs/") && !fileName.includes("..");
    if (!allowedFiles.includes(fileName) && !isSpecsFile) {
      return yield* Effect40.fail(
        new Error(`Invalid file name for update: ${fileName}`)
      );
    }
    let changeDir = path.join(
      project.meta.projectPath,
      "openspec",
      "changes",
      changeId
    );
    let exists = yield* fs.exists(changeDir);
    if (!exists) {
      const archiveDir = path.join(
        project.meta.projectPath,
        "openspec",
        "changes",
        "archive",
        changeId
      );
      if (yield* fs.exists(archiveDir)) {
        changeDir = archiveDir;
        exists = true;
      }
    }
    if (!exists) {
      return yield* Effect40.fail(
        new OpenSpecDirectoryNotFoundError({
          path: changeDir,
          message: `Change directory not found: ${changeId}`
        })
      );
    }
    const filePath = path.join(changeDir, fileName);
    yield* fs.writeFileString(filePath, content);
  });
  return {
    getChanges,
    getArchivedChanges,
    getChangeDetails,
    updateChangeFile
  };
});
var OpenSpecService = class extends Context30.Tag("OpenSpecService")() {
  static {
    this.Live = Layer32.effect(this, LayerImpl24);
  }
};

// src/server/core/openspec/services/ProfileConfigService.ts
import { FileSystem as FileSystem18, Path as Path21 } from "@effect/platform";
import { Context as Context31, Data as Data8, Effect as Effect41, Layer as Layer33 } from "effect";
import { z as z24 } from "zod";
var ProjectPathNotFoundError4 = class extends Data8.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var ProfileNotFoundError = class extends Data8.TaggedError("ProfileNotFoundError") {
};
var McpServerConfigSchema = z24.object({
  type: z24.enum(["http", "sse", "stdio"]),
  url: z24.string().optional(),
  command: z24.string().optional(),
  args: z24.array(z24.string()).optional()
});
var McpToolDefinitionSchema = z24.object({
  description: z24.string(),
  tools: z24.array(z24.string())
});
var ProfileInfraCatalogSchema = z24.object({
  mcp_server_providers: z24.record(z24.string(), McpServerConfigSchema),
  mcp_tool_definitions: z24.object({
    overview: McpToolDefinitionSchema,
    search: McpToolDefinitionSchema,
    specifications: McpToolDefinitionSchema
  }),
  develop_skills: z24.object({
    description: z24.string(),
    gitUrl: z24.string().optional(),
    skills: z24.array(z24.string())
  }).optional(),
  code_examples: z24.object({
    examples: z24.array(
      z24.object({
        name: z24.string(),
        description: z24.string().optional(),
        paths: z24.array(z24.string())
      })
    )
  }).optional()
});
var ProfileSchema = z24.object({
  displayName: z24.string(),
  custom_variables: z24.record(z24.string(), z24.string()).optional(),
  infra_catalog: ProfileInfraCatalogSchema
});
function isValidProfile(value) {
  if (typeof value !== "object" || value === null) return false;
  const obj = value;
  return typeof obj.displayName === "string" && typeof obj.infra_catalog === "object" && obj.infra_catalog !== null;
}
function parseSkillFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch?.[1]) {
    return { name: null, description: null };
  }
  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
  const name = nameMatch?.[1]?.trim() ?? null;
  const descriptionMatch = frontmatter.match(
    /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m
  );
  const description = descriptionMatch?.[1]?.trim() ?? null;
  return { name, description };
}
var LayerImpl25 = Effect41.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem18.FileSystem;
  const path = yield* Path21.Path;
  const getTemplateBasePath = Effect41.gen(function* () {
    const distPath = path.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path.join(process.cwd(), "template-to-project");
  });
  const loadBuiltInProfiles = Effect41.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const profilesDir = path.join(templateBasePath, "profiles");
    const exists = yield* fs.exists(profilesDir);
    if (!exists) {
      return {
        profiles: [],
        warnings: [
          {
            file: "profiles/",
            reason: "Profile \u76EE\u5F55\u4E0D\u5B58\u5728"
          }
        ]
      };
    }
    const files = yield* fs.readDirectory(profilesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const profiles = [];
    const warnings = [];
    for (const file of jsonFiles) {
      const filePath = path.join(profilesDir, file);
      const content = yield* fs.readFileString(filePath);
      const id = file.replace(".json", "");
      try {
        const parsed = JSON.parse(content);
        const result = ProfileSchema.safeParse(parsed);
        if (result.success) {
          profiles.push({
            id,
            displayName: result.data.displayName,
            infra_catalog: result.data.infra_catalog
          });
        } else {
          const firstError = result.error.issues[0];
          if (firstError) {
            const errorPath = firstError.path.join(".");
            warnings.push({
              file,
              reason: `Schema \u9A8C\u8BC1\u5931\u8D25: ${errorPath} - ${firstError.message}`
            });
          } else {
            warnings.push({
              file,
              reason: "Schema \u9A8C\u8BC1\u5931\u8D25\uFF1A\u672A\u77E5\u9519\u8BEF"
            });
          }
        }
      } catch (error) {
        warnings.push({
          file,
          reason: `JSON \u89E3\u6790\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    return { profiles, warnings };
  });
  const getAvailableProfiles = () => loadBuiltInProfiles;
  const getProjectProfileConfig = (projectId) => Effect41.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect41.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    const profileDir = path.join(project.meta.projectPath, "specforge");
    const profilePath = path.join(profileDir, "specforge.profile.json");
    let exists = yield* fs.exists(profilePath);
    if (!exists) {
      const rootProfilePath = path.join(
        project.meta.projectPath,
        "specforge.profile.json"
      );
      const rootExists = yield* fs.exists(rootProfilePath);
      if (rootExists) {
        const dirExists = yield* fs.exists(profileDir);
        if (!dirExists) {
          yield* fs.makeDirectory(profileDir);
        }
        yield* fs.rename(rootProfilePath, profilePath);
        exists = true;
      }
    }
    if (!exists) {
      return void 0;
    }
    const content = yield* fs.readFileString(profilePath);
    try {
      const parsed = JSON.parse(content);
      if (isValidProfile(parsed)) {
        return parsed;
      }
      return void 0;
    } catch {
      return void 0;
    }
  });
  const saveProjectProfileConfig = (projectId, profile) => Effect41.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect41.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    const profileDir = path.join(project.meta.projectPath, "specforge");
    const profilePath = path.join(profileDir, "specforge.profile.json");
    const dirExists = yield* fs.exists(profileDir);
    if (!dirExists) {
      yield* fs.makeDirectory(profileDir);
    }
    yield* fs.writeFileString(profilePath, JSON.stringify(profile, null, 2));
  });
  const generateTemplateVariables = (profile, projectPath, installedDevelopSkills) => Effect41.gen(function* () {
    const fs2 = yield* FileSystem18.FileSystem;
    const path2 = yield* Path21.Path;
    const { infra_catalog, custom_variables } = profile;
    const variables = {
      PROJECT_ROOT: projectPath,
      VERSION: "1.0.0",
      INFRA_CATALOG_TOOL_IDS_APPEND: "",
      INFRA_CATALOG_OVERVIEW_TOOLS_MD: "",
      INFRA_CATALOG_SEARCH_TOOLS_MD: "",
      INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD: "",
      INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD: "",
      DEVELOP_SKILLS_APPEND: "",
      DEVELOP_SKILLS_NAMES: "",
      DEVELOP_SKILLS_USAGE_MD: "",
      CODE_EXAMPLES_MD: ""
    };
    const allToolIds = [];
    const { mcp_tool_definitions } = infra_catalog;
    if (mcp_tool_definitions) {
      const { overview, search, specifications } = mcp_tool_definitions;
      if (overview?.tools) allToolIds.push(...overview.tools);
      if (search?.tools) allToolIds.push(...search.tools);
      if (specifications?.tools) allToolIds.push(...specifications.tools);
      variables.INFRA_CATALOG_TOOL_IDS_APPEND = allToolIds.length > 0 ? `, ${allToolIds.join(", ")}` : "";
      const formatToolsMd = (tools) => tools.map((t) => `\`${t}\``).join(", ");
      variables.INFRA_CATALOG_OVERVIEW_TOOLS_MD = overview?.tools ? formatToolsMd(overview.tools) : "";
      variables.INFRA_CATALOG_SEARCH_TOOLS_MD = search?.tools ? formatToolsMd(search.tools) : "";
      variables.INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD = specifications?.tools ? formatToolsMd(specifications.tools) : "";
      variables.INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD = generateToolDefinitionsTable(mcp_tool_definitions);
    }
    const effectiveSkills = installedDevelopSkills ?? [];
    if (effectiveSkills.length > 0) {
      const skillNames = effectiveSkills.map((s) => s.name);
      variables.DEVELOP_SKILLS_APPEND = skillNames.length > 0 ? `, ${skillNames.join(", ")}` : "";
      variables.DEVELOP_SKILLS_NAMES = skillNames.length > 0 ? skillNames.join(", ") : "";
      const skillLines = effectiveSkills.map(
        (s) => `- **${s.name}**: ${s.description}`
      );
      variables.DEVELOP_SKILLS_USAGE_MD = skillLines.join("\n");
    } else if (infra_catalog.develop_skills) {
      const skillsDir = path2.join(projectPath, ".claude", "skills");
      const skillsDirExists = yield* fs2.exists(skillsDir);
      if (skillsDirExists) {
        const skillLines = [];
        const detectedNames = [];
        const scanSkillsDir = Effect41.gen(function* () {
          const items = yield* fs2.readDirectory(skillsDir);
          for (const item of items) {
            if (item.startsWith(".")) continue;
            if (item.startsWith("openspec-")) continue;
            const itemPath = path2.join(skillsDir, item);
            const stat = yield* fs2.stat(itemPath);
            if (stat.type === "Directory") {
              const skillFilePath = path2.join(itemPath, "SKILL.md");
              const skillFileExists = yield* fs2.exists(skillFilePath);
              if (skillFileExists) {
                const content = yield* fs2.readFileString(skillFilePath);
                const { name, description } = parseSkillFrontmatter(content);
                if (name) {
                  detectedNames.push(name);
                  const desc = description || "\u5F00\u53D1\u6280\u80FD";
                  skillLines.push(`- **${name}**: ${desc}`);
                }
              }
            }
          }
        });
        yield* scanSkillsDir.pipe(
          Effect41.catchAll(() => Effect41.succeed(void 0))
        );
        variables.DEVELOP_SKILLS_APPEND = detectedNames.length > 0 ? `, ${detectedNames.join(", ")}` : "";
        variables.DEVELOP_SKILLS_NAMES = detectedNames.length > 0 ? detectedNames.join(", ") : "";
        variables.DEVELOP_SKILLS_USAGE_MD = skillLines.join("\n");
      }
    }
    if (infra_catalog.code_examples?.examples) {
      const lines = ["### \u4EE3\u7801\u6700\u4F73\u5B9E\u8DF5\u53C2\u8003", ""];
      for (const example of infra_catalog.code_examples.examples) {
        lines.push(`#### ${example.name}`);
        if (example.description) {
          lines.push(`> ${example.description}`);
        }
        lines.push("**\u53C2\u8003\u8DEF\u5F84**:");
        for (const p of example.paths) {
          lines.push(`- \`${p}\``);
        }
        lines.push("");
      }
      variables.CODE_EXAMPLES_MD = lines.join("\n");
    }
    if (custom_variables) {
      Object.assign(variables, custom_variables);
    }
    return variables;
  });
  const generateToolDefinitionsTable = (definitions) => {
    const lines = ["| \u5206\u7EC4 | \u8BF4\u660E | tools |", "| --- | --- | --- |"];
    const groups = [
      { name: "overview", def: definitions.overview },
      { name: "search", def: definitions.search },
      { name: "specifications", def: definitions.specifications }
    ];
    for (const { name, def } of groups) {
      if (def) {
        const toolsStr = def.tools.map((t) => `\`${t}\``).join(", ");
        lines.push(`| ${name} | ${def.description} | ${toolsStr} |`);
      }
    }
    return lines.join("\n");
  };
  const getBuiltInProfile = (profileId) => Effect41.gen(function* () {
    const result = yield* loadBuiltInProfiles;
    const profile = result.profiles.find((p) => p.id === profileId);
    if (!profile) {
      return yield* Effect41.fail(new ProfileNotFoundError({ profileId }));
    }
    return profile;
  });
  return {
    getAvailableProfiles,
    getProjectProfileConfig,
    saveProjectProfileConfig,
    generateTemplateVariables,
    getBuiltInProfile
  };
});
var ProfileConfigService = class extends Context31.Tag("ProfileConfigService")() {
  static {
    this.Live = Layer33.effect(this, LayerImpl25);
  }
};

// src/server/core/openspec/services/TemplateInjectionService.ts
import { FileSystem as FileSystem21, Path as Path24 } from "@effect/platform";
import { Context as Context34, Data as Data11, Effect as Effect44, Layer as Layer36 } from "effect";
import YAML from "yaml";

// src/server/core/openspec/services/SkillManagerService.ts
import { Command as Command6, FileSystem as FileSystem19, Path as Path22 } from "@effect/platform";
import { Context as Context32, Data as Data9, Duration as Duration4, Effect as Effect42, Either as Either6, Layer as Layer34 } from "effect";
var SkillInstallError = class extends Data9.TaggedError("SkillInstallError") {
};
function parseSkillFrontmatter2(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch?.[1]) {
    return { name: null, description: null };
  }
  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
  const name = nameMatch?.[1]?.trim() ?? null;
  const descriptionMatch = frontmatter.match(
    /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m
  );
  const description = descriptionMatch?.[1]?.trim() ?? null;
  return { name, description };
}
function deduplicateSkills(skills) {
  const seen = /* @__PURE__ */ new Set();
  const unique = [];
  for (const skill of skills) {
    if (!seen.has(skill.name)) {
      seen.add(skill.name);
      unique.push(skill);
    }
  }
  return unique;
}
var LayerImpl26 = Effect42.gen(function* () {
  const fs = yield* FileSystem19.FileSystem;
  const path = yield* Path22.Path;
  const findSkillMd = (dirPath) => Effect42.gen(function* () {
    const exactPath = path.join(dirPath, "SKILL.md");
    if (yield* fs.exists(exactPath)) {
      return exactPath;
    }
    const files = yield* fs.readDirectory(dirPath).pipe(Effect42.catchAll(() => Effect42.succeed([])));
    const found = files.find((f) => f.toLowerCase() === "skill.md");
    if (found) {
      return path.join(dirPath, found);
    }
    return null;
  });
  const installSingleSkill = (sourcePath, skillName, skillsDir) => Effect42.gen(function* () {
    if (!(yield* fs.exists(sourcePath))) {
      return null;
    }
    const skillMdPath = yield* findSkillMd(sourcePath);
    if (!skillMdPath) {
      return null;
    }
    const targetPath = path.join(skillsDir, skillName);
    yield* fs.makeDirectory(targetPath, { recursive: true });
    yield* copyDirectory(sourcePath, targetPath);
    const installedSkillMd = yield* findSkillMd(targetPath);
    if (!installedSkillMd) {
      return { name: skillName, description: "\u6682\u65E0\u63CF\u8FF0" };
    }
    const content = yield* fs.readFileString(installedSkillMd).pipe(Effect42.catchAll(() => Effect42.succeed("")));
    const { description } = parseSkillFrontmatter2(content);
    return {
      name: skillName,
      description: description ?? "\u6682\u65E0\u63CF\u8FF0"
    };
  }).pipe(Effect42.catchAll(() => Effect42.succeed(null)));
  const copyDirectory = (src, dest) => Effect42.gen(function* () {
    yield* fs.makeDirectory(dest, { recursive: true });
    const entries = yield* fs.readDirectory(src);
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      const stat = yield* fs.stat(srcPath);
      if (stat.type === "Directory") {
        yield* copyDirectory(srcPath, destPath);
      } else {
        const content = yield* fs.readFile(srcPath);
        yield* fs.writeFile(destPath, content);
      }
    }
  });
  const installSkillsFromGit = (projectPath, gitUrl, skillsList) => Effect42.gen(function* () {
    if (!gitUrl || !Array.isArray(skillsList) || skillsList.length === 0) {
      return [];
    }
    const skillsDir = path.join(projectPath, ".claude", "skills");
    const tempDir = yield* fs.makeTempDirectory({
      prefix: "specforge-skills-"
    });
    const installEffect = Effect42.gen(function* () {
      const cloneCommand = Command6.make(
        "git",
        "clone",
        "--depth",
        "1",
        gitUrl,
        tempDir
      );
      const cloneResult = yield* Effect42.either(
        Command6.string(cloneCommand).pipe(
          Effect42.timeout(Duration4.seconds(120))
        )
      );
      if (Either6.isLeft(cloneResult)) {
        console.error(
          `[SkillManager] Git clone \u5931\u8D25: ${gitUrl}`,
          String(cloneResult.left)
        );
        return [];
      }
      yield* fs.makeDirectory(skillsDir, { recursive: true });
      const installedSkills = [];
      for (const skillPath of skillsList) {
        if (skillPath.endsWith("/*")) {
          const parentDir = skillPath.slice(0, -2);
          const fullParentPath = path.join(tempDir, parentDir);
          if (yield* fs.exists(fullParentPath)) {
            const children = yield* fs.readDirectory(fullParentPath);
            for (const child of children) {
              const childPath = path.join(fullParentPath, child);
              const stat = yield* fs.stat(childPath);
              if (stat.type === "Directory") {
                const result = yield* installSingleSkill(
                  childPath,
                  child,
                  skillsDir
                );
                installedSkills.push(result);
              }
            }
          } else {
            console.warn(`[SkillManager] \u672A\u627E\u5230 Skill \u7236\u76EE\u5F55: ${parentDir}`);
          }
        } else {
          const skillName = path.basename(skillPath);
          const sourcePath = path.join(tempDir, skillPath);
          const result = yield* installSingleSkill(
            sourcePath,
            skillName,
            skillsDir
          );
          installedSkills.push(result);
        }
      }
      const validSkills = installedSkills.filter(
        (s) => s !== null
      );
      return deduplicateSkills(validSkills);
    });
    return yield* installEffect.pipe(
      Effect42.ensuring(
        fs.remove(tempDir, { recursive: true }).pipe(Effect42.catchAll(() => Effect42.succeed(void 0)))
      ),
      // 全局兜底：任何未预期的错误都返回空数组
      Effect42.catchAll((error) => {
        console.error(
          `[SkillManager] Skill \u5B89\u88C5\u5931\u8D25:`,
          error instanceof Error ? error.message : String(error)
        );
        return Effect42.succeed([]);
      })
    );
  });
  return {
    installSkillsFromGit
  };
});
var SkillManagerService = class extends Context32.Tag("SkillManagerService")() {
  static {
    this.Live = Layer34.effect(this, LayerImpl26);
  }
  static {
    /**
     * 纯函数：解析 SKILL.md frontmatter
     * 导出供测试和外部使用
     */
    this.parseSkillFrontmatter = parseSkillFrontmatter2;
  }
  static {
    /**
     * 纯函数：按 name 去重
     * 导出供测试和外部使用
     */
    this.deduplicateSkills = deduplicateSkills;
  }
};

// src/server/core/openspec/services/TemplateProcessor.ts
import { FileSystem as FileSystem20, Path as Path23 } from "@effect/platform";
import { Context as Context33, Data as Data10, Effect as Effect43, Layer as Layer35 } from "effect";
var TemplateProcessingError = class extends Data10.TaggedError(
  "TemplateProcessingError"
) {
};
var LayerImpl27 = Effect43.gen(function* () {
  const fs = yield* FileSystem20.FileSystem;
  const path = yield* Path23.Path;
  const replaceVariables = (content, variables) => {
    let processed = content;
    for (const [key, value] of Object.entries(variables)) {
      if (value !== void 0) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        processed = processed.replace(regex, value);
      }
    }
    return processed;
  };
  const processTemplate = (content, variables, options = {}) => Effect43.gen(function* () {
    let processed = replaceVariables(content, variables);
    if (options.resolveReferences && options.basePath) {
      const lines = processed.split("\n");
      const resolvedLines = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("@") && trimmed.endsWith(".md")) {
          const refPath = trimmed.slice(1);
          const fullRefPath = path.resolve(
            path.dirname(options.basePath),
            refPath
          );
          const exists = yield* fs.exists(fullRefPath);
          if (exists) {
            let refContent = yield* fs.readFileString(fullRefPath);
            refContent = replaceVariables(refContent, variables);
            resolvedLines.push(refContent);
          } else {
            resolvedLines.push(
              `<!-- Warning: Referenced file not found: ${refPath} -->`
            );
          }
        } else {
          resolvedLines.push(line);
        }
      }
      processed = resolvedLines.join("\n");
    }
    return processed;
  });
  const processTemplateFile = (templatePath, targetPath, variables, options = {}) => Effect43.gen(function* () {
    const exists = yield* fs.exists(templatePath);
    if (!exists) {
      return yield* Effect43.fail(
        new TemplateProcessingError({
          message: `Template file not found: ${templatePath}`,
          file: templatePath
        })
      );
    }
    const content = yield* fs.readFileString(templatePath);
    const processed = yield* processTemplate(content, variables, {
      ...options,
      basePath: templatePath
    });
    const targetDir = path.dirname(targetPath);
    const dirExists = yield* fs.exists(targetDir);
    if (!dirExists) {
      yield* fs.makeDirectory(targetDir, { recursive: true });
    }
    yield* fs.writeFileString(targetPath, processed);
  });
  const getAllFilesInDir = (dir, basePath) => Effect43.gen(function* () {
    const results = [];
    const dirsToProcess = [dir];
    while (dirsToProcess.length > 0) {
      const currentDir = dirsToProcess.pop();
      if (!currentDir) continue;
      const exists = yield* fs.exists(currentDir);
      if (!exists) continue;
      const entries = yield* fs.readDirectory(currentDir);
      for (const entry of entries) {
        if (entry.startsWith(".")) continue;
        const entryPath = path.join(currentDir, entry);
        const stat = yield* fs.stat(entryPath);
        if (stat.type === "Directory") {
          dirsToProcess.push(entryPath);
        } else {
          const relativePath = path.relative(basePath, entryPath);
          results.push(relativePath);
        }
      }
    }
    return results;
  });
  const processTemplateDirectory = (templateDir, targetDir, variables, options = {}) => Effect43.gen(function* () {
    const created = [];
    const skipped = [];
    const errors = [];
    const files = yield* getAllFilesInDir(templateDir, templateDir);
    for (const relativePath of files) {
      if (options.filter && !options.filter(relativePath)) {
        continue;
      }
      const templatePath = path.join(templateDir, relativePath);
      const targetPath = path.join(targetDir, relativePath);
      const targetExists = yield* fs.exists(targetPath);
      if (targetExists && options.skipExisting) {
        skipped.push(relativePath);
        continue;
      }
      const result = yield* processTemplateFile(
        templatePath,
        targetPath,
        variables,
        { resolveReferences: true }
      ).pipe(
        Effect43.map(() => ({ success: true })),
        Effect43.catchAll(
          (error) => Effect43.succeed({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        )
      );
      if (result.success) {
        created.push(relativePath);
      } else {
        errors.push(`${relativePath}: ${result.error}`);
      }
    }
    return { created, skipped, errors };
  });
  return {
    replaceVariables,
    processTemplate,
    processTemplateFile,
    processTemplateDirectory
  };
});
var TemplateProcessor = class extends Context33.Tag("TemplateProcessor")() {
  static {
    this.Live = Layer35.effect(this, LayerImpl27);
  }
};

// src/server/core/openspec/services/TemplateInjectionService.ts
var ProjectPathNotFoundError5 = class extends Data11.TaggedError(
  "ProjectPathNotFoundError"
) {
};
function isYamlConfig(value) {
  return typeof value === "object" && value !== null;
}
var SPECFORGE_MANAGED_SKILLS = [
  "design-generation",
  "querying-infra-catalog",
  "task-planning",
  "ast-grep"
];
var LayerImpl28 = Effect44.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem21.FileSystem;
  const path = yield* Path24.Path;
  const templateProcessor = yield* TemplateProcessor;
  const profileConfigService = yield* ProfileConfigService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const skillManagerService = yield* SkillManagerService;
  const getTemplateBasePath = Effect44.gen(function* () {
    const distPath = path.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path.join(process.cwd(), "template-to-project");
  });
  const generateSpecforgeMarker = (profile) => {
    return `_specforge:
  version: "1.0.0"
  profile: "${profile}"
  initialized_at: "${(/* @__PURE__ */ new Date()).toISOString()}"

`;
  };
  const injectSpecforgeMarker = (projectPath, profileName) => Effect44.gen(function* () {
    const configPath = path.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (exists) {
      let content = yield* fs.readFileString(configPath);
      if (content.includes("_specforge:")) {
        content = content.replace(
          /_specforge:[\s\S]*?(?=\n[a-zA-Z]|\n$|$)/,
          generateSpecforgeMarker(profileName)
        );
      } else {
        content = generateSpecforgeMarker(profileName) + content;
      }
      yield* fs.writeFileString(configPath, content);
    }
  });
  const injectOpenspecDir = (projectPath, variables, options) => Effect44.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path.join(templateBasePath, "openspec");
    const targetDir = path.join(projectPath, "openspec");
    const result = {
      created: [],
      skipped: [],
      errors: []
    };
    if (options.scenario === "S2_OPENSPEC_ONLY" || options.scenario === "S4_BOTH_NON_SPECFORGE") {
      const schemasTemplateDir = path.join(templateDir, "schemas");
      const schemasTargetDir = path.join(targetDir, "schemas");
      const schemasExists = yield* fs.exists(schemasTemplateDir);
      if (schemasExists) {
        const schemasResult = yield* templateProcessor.processTemplateDirectory(
          schemasTemplateDir,
          schemasTargetDir,
          variables,
          {
            skipExisting: false,
            // SpecForge schemas 可覆盖更新
            filter: (relativePath) => relativePath.startsWith("specforge-enhanced/")
          }
        );
        result.created.push(
          ...schemasResult.created.map((f) => `openspec/schemas/${f}`)
        );
        result.errors.push(...schemasResult.errors);
      }
      return result;
    }
    const templateExists = yield* fs.exists(templateDir);
    if (!templateExists) {
      result.errors.push("Template directory not found: openspec");
      return result;
    }
    const processResult = yield* templateProcessor.processTemplateDirectory(
      templateDir,
      targetDir,
      variables,
      {
        skipExisting: false,
        filter: (relativePath) => {
          return !relativePath.includes(".DS_Store");
        }
      }
    );
    result.created.push(...processResult.created.map((f) => `openspec/${f}`));
    result.skipped.push(...processResult.skipped.map((f) => `openspec/${f}`));
    result.errors.push(...processResult.errors);
    return result;
  });
  const injectClaudeDir = (projectPath, variables, options) => Effect44.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path.join(templateBasePath, ".claude");
    const targetDir = path.join(projectPath, ".claude");
    const result = {
      created: [],
      skipped: [],
      errors: []
    };
    const templateExists = yield* fs.exists(templateDir);
    if (!templateExists) {
      result.errors.push("Template directory not found: .claude");
      return result;
    }
    const isIncrementalScenario = options.scenario === "S3_CLAUDE_ONLY" || options.scenario === "S4_BOTH_NON_SPECFORGE";
    const skillsTemplateDir = path.join(templateDir, "skills");
    const skillsTargetDir = path.join(targetDir, "skills");
    const skillsTemplateExists = yield* fs.exists(skillsTemplateDir);
    if (skillsTemplateExists) {
      const skillsResult = yield* templateProcessor.processTemplateDirectory(
        skillsTemplateDir,
        skillsTargetDir,
        variables,
        {
          skipExisting: false,
          // SpecForge skills 可覆盖更新
          filter: (relativePath) => {
            const skillName = relativePath.split("/")[0];
            if (!skillName) return false;
            if (isIncrementalScenario) {
              return SPECFORGE_MANAGED_SKILLS.includes(skillName);
            }
            return !relativePath.includes(".DS_Store");
          }
        }
      );
      result.created.push(
        ...skillsResult.created.map((f) => `.claude/skills/${f}`)
      );
      result.skipped.push(
        ...skillsResult.skipped.map((f) => `.claude/skills/${f}`)
      );
      result.errors.push(...skillsResult.errors);
    }
    const agentsTemplateDir = path.join(templateDir, "agents");
    const agentsTargetDir = path.join(targetDir, "agents");
    const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
    const agentsTargetExists = yield* fs.exists(agentsTargetDir);
    if (agentsTemplateExists && !agentsTargetExists) {
      const agentsResult = yield* templateProcessor.processTemplateDirectory(
        agentsTemplateDir,
        agentsTargetDir,
        variables,
        {
          skipExisting: false,
          // SpecForge agents 可覆盖更新
          filter: (relativePath) => !relativePath.includes(".DS_Store")
        }
      );
      result.created.push(
        ...agentsResult.created.map((f) => `.claude/agents/${f}`)
      );
      result.skipped.push(
        ...agentsResult.skipped.map((f) => `.claude/agents/${f}`)
      );
      result.errors.push(...agentsResult.errors);
    }
    return result;
  });
  const loadBuiltInMcpServers = Effect44.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templatePath = path.join(
      templateBasePath,
      "profiles",
      ".mcp.template.json"
    );
    const exists = yield* fs.exists(templatePath);
    if (!exists) {
      return {};
    }
    try {
      const content = yield* fs.readFileString(templatePath);
      const parsed = JSON.parse(content);
      return parsed.mcpServers ?? {};
    } catch {
      return {};
    }
  });
  const mergeMcpConfig = (projectPath, profile) => Effect44.gen(function* () {
    const mcpPath = path.join(projectPath, ".mcp.json");
    const exists = yield* fs.exists(mcpPath);
    let existingConfig = { mcpServers: {} };
    if (exists) {
      try {
        const content = yield* fs.readFileString(mcpPath);
        existingConfig = JSON.parse(content);
        existingConfig.mcpServers = existingConfig.mcpServers || {};
      } catch {
      }
    }
    const builtInServers = yield* loadBuiltInMcpServers;
    for (const [name, config] of Object.entries(builtInServers)) {
      existingConfig.mcpServers[name] = config;
    }
    const profileServers = profile.infra_catalog.mcp_server_providers || {};
    for (const [name, config] of Object.entries(profileServers)) {
      existingConfig.mcpServers[name] = config;
    }
    yield* fs.writeFileString(
      mcpPath,
      JSON.stringify(existingConfig, null, 2)
    );
    const totalServers = Object.keys(existingConfig.mcpServers).length;
    return {
      addedCount: Object.keys(builtInServers).length + Object.keys(profileServers).length,
      totalServers
    };
  });
  const mergeConfigYaml = (projectPath, variables) => Effect44.gen(function* () {
    const userConfigPath = path.join(projectPath, "openspec", "config.yaml");
    const templateBasePath = yield* getTemplateBasePath;
    const templateConfigPath = path.join(
      templateBasePath,
      "openspec",
      "config.yaml"
    );
    const userConfigExists = yield* fs.exists(userConfigPath);
    if (!userConfigExists) {
      return yield* Effect44.fail(
        new Error("\u7528\u6237\u7684 config.yaml \u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u5408\u5E76")
      );
    }
    const userConfigContent = yield* fs.readFileString(userConfigPath);
    const userConfigParsed = YAML.parse(userConfigContent);
    if (!isYamlConfig(userConfigParsed)) {
      return yield* Effect44.fail(new Error("\u7528\u6237\u7684 config.yaml \u683C\u5F0F\u65E0\u6548"));
    }
    const userConfig = userConfigParsed;
    const templateConfigExists = yield* fs.exists(templateConfigPath);
    if (!templateConfigExists) {
      return yield* Effect44.fail(
        new Error("\u6A21\u677F\u7684 config.yaml \u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u5408\u5E76")
      );
    }
    let templateConfigContent = yield* fs.readFileString(templateConfigPath);
    for (const [key, value] of Object.entries(variables)) {
      if (value !== void 0) {
        templateConfigContent = templateConfigContent.replaceAll(
          `{{${key}}}`,
          value
        );
      }
    }
    const templateConfigParsed = YAML.parse(templateConfigContent);
    if (!isYamlConfig(templateConfigParsed)) {
      return yield* Effect44.fail(new Error("\u6A21\u677F\u7684 config.yaml \u683C\u5F0F\u65E0\u6548"));
    }
    const templateConfig = templateConfigParsed;
    const mergedConfig = { ...userConfig };
    mergedConfig.schema = templateConfig.schema || "specforge-enhanced";
    if (templateConfig.context) {
      if (userConfig.context) {
        mergedConfig.context = `${userConfig.context}

# SpecForge \u589E\u5F3A\u914D\u7F6E
${templateConfig.context}`;
      } else {
        mergedConfig.context = templateConfig.context;
      }
    }
    if (templateConfig.rules) {
      mergedConfig.rules = mergedConfig.rules || {};
      for (const [artifactType, templateRules] of Object.entries(
        templateConfig.rules
      )) {
        if (Array.isArray(templateRules)) {
          const existingRules = mergedConfig.rules?.[artifactType];
          if (Array.isArray(existingRules)) {
            mergedConfig.rules[artifactType] = [
              ...existingRules,
              ...templateRules
            ];
          } else {
            mergedConfig.rules[artifactType] = templateRules;
          }
        } else if (typeof templateRules === "object" && templateRules !== null) {
          const existingRules = mergedConfig.rules?.[artifactType];
          if (typeof existingRules === "object" && existingRules !== null && !Array.isArray(existingRules)) {
            mergedConfig.rules[artifactType] = {
              ...templateRules,
              ...existingRules
            };
          } else {
            mergedConfig.rules[artifactType] = templateRules;
          }
        }
      }
    }
    const mergedYaml = YAML.stringify(mergedConfig);
    yield* fs.writeFileString(userConfigPath, mergedYaml);
  });
  const injectOpenspecEnhancements = (projectPath, variables) => Effect44.gen(function* () {
    const result = {
      created: [],
      updated: [],
      errors: []
    };
    const templateBasePath = yield* getTemplateBasePath;
    const schemasTemplateDir = path.join(
      templateBasePath,
      "openspec",
      "schemas"
    );
    const schemasTargetDir = path.join(projectPath, "openspec", "schemas");
    const schemasExists = yield* fs.exists(schemasTemplateDir);
    if (schemasExists) {
      try {
        const schemasResult = yield* templateProcessor.processTemplateDirectory(
          schemasTemplateDir,
          schemasTargetDir,
          variables,
          {
            skipExisting: false,
            // SpecForge schemas 可覆盖更新
            filter: (relativePath) => relativePath.startsWith("specforge-enhanced/")
          }
        );
        result.created.push(
          ...schemasResult.created.map((f) => `openspec/schemas/${f}`)
        );
        result.errors.push(...schemasResult.errors);
      } catch (error) {
        result.errors.push(
          `\u590D\u5236 schemas \u76EE\u5F55\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    try {
      yield* mergeConfigYaml(projectPath, variables);
      result.updated.push("openspec/config.yaml");
    } catch (error) {
      result.errors.push(
        `\u5408\u5E76 config.yaml \u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    return result;
  });
  const injectClaudeEnhancements = (projectPath, variables) => Effect44.gen(function* () {
    const result = {
      created: [],
      skipped: [],
      errors: []
    };
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path.join(templateBasePath, ".claude");
    const targetDir = path.join(projectPath, ".claude");
    const skillsTemplateDir = path.join(templateDir, "skills");
    const skillsTargetDir = path.join(targetDir, "skills");
    const skillsTemplateExists = yield* fs.exists(skillsTemplateDir);
    if (skillsTemplateExists) {
      try {
        const skillsResult = yield* templateProcessor.processTemplateDirectory(
          skillsTemplateDir,
          skillsTargetDir,
          variables,
          {
            skipExisting: false,
            // SpecForge skills 可覆盖更新
            filter: (relativePath) => {
              const skillName = relativePath.split("/")[0];
              if (!skillName) return false;
              return SPECFORGE_MANAGED_SKILLS.includes(skillName);
            }
          }
        );
        result.created.push(
          ...skillsResult.created.map((f) => `.claude/skills/${f}`)
        );
        result.skipped.push(
          ...skillsResult.skipped.map((f) => `.claude/skills/${f}`)
        );
        result.errors.push(...skillsResult.errors);
      } catch (error) {
        result.errors.push(
          `\u590D\u5236 skills \u76EE\u5F55\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    const agentsTemplateDir = path.join(templateDir, "agents");
    const agentsTargetDir = path.join(targetDir, "agents");
    const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
    if (agentsTemplateExists) {
      try {
        const agentsResult = yield* templateProcessor.processTemplateDirectory(
          agentsTemplateDir,
          agentsTargetDir,
          variables,
          {
            skipExisting: false,
            // SpecForge agents 可覆盖更新
            filter: (relativePath) => !relativePath.includes(".DS_Store")
          }
        );
        result.created.push(
          ...agentsResult.created.map((f) => `.claude/agents/${f}`)
        );
        result.skipped.push(
          ...agentsResult.skipped.map((f) => `.claude/agents/${f}`)
        );
        result.errors.push(...agentsResult.errors);
      } catch (error) {
        result.errors.push(
          `\u590D\u5236 agents \u76EE\u5F55\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    return result;
  });
  const injectTemplates = (projectId, options) => Effect44.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect44.fail(new ProjectPathNotFoundError5({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const { scenario, profile, force } = options;
    const result = {
      success: true,
      created: [],
      skipped: [],
      updated: [],
      errors: [],
      warnings: []
    };
    if (scenario === "S5_CONFIGURED" && !force) {
      return result;
    }
    const envStatus = yield* environmentService.checkEnvironment(projectId);
    if (!envStatus.cliInstalled) {
      console.log(
        "[SpecForge] OpenSpec CLI \u672A\u5B89\u88C5\uFF0C\u6B63\u5728\u81EA\u52A8\u5B89\u88C5 @fission-ai/openspec@latest..."
      );
      const installResult = yield* environmentService.installCliGlobal({
        initialize: false
      });
      if (!installResult.success) {
        result.success = false;
        result.errors.push({
          file: "openspec-cli-install",
          error: `\u81EA\u52A8\u5B89\u88C5 OpenSpec CLI \u5931\u8D25: ${installResult.error ?? "\u672A\u77E5\u9519\u8BEF"}\u3002\u8BF7\u624B\u52A8\u6267\u884C npm install -g @fission-ai/openspec@latest`
        });
        return result;
      }
      console.log("[SpecForge] OpenSpec CLI \u5B89\u88C5\u6210\u529F");
    }
    try {
      const initResult = yield* environmentService.initializeOpenspec(projectId);
      if (!initResult.success) {
        result.success = false;
        result.errors.push({
          file: "openspec-init",
          error: initResult.error || "\u6267\u884C openspec init \u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u9879\u76EE\u914D\u7F6E\u3002"
        });
        return result;
      }
      result.created.push(
        "openspec/config.yaml (by openspec init)",
        "openspec/specs/ (by openspec init)",
        "openspec/changes/ (by openspec init)",
        ".claude/skills/openspec-* (by openspec init)"
      );
    } catch (error) {
      result.success = false;
      result.errors.push({
        file: "openspec-init",
        error: `\u6267\u884C openspec init \u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`
      });
      return result;
    }
    const developSkillsConfig = profile.infra_catalog.develop_skills;
    let installedDevelopSkills = [];
    if (developSkillsConfig?.gitUrl && developSkillsConfig.skills.length > 0) {
      console.log(
        `[SpecForge] \u6B63\u5728\u4ECE ${developSkillsConfig.gitUrl} \u5B89\u88C5 Skills...`
      );
      installedDevelopSkills = yield* skillManagerService.installSkillsFromGit(
        projectPath,
        developSkillsConfig.gitUrl,
        developSkillsConfig.skills
      );
      if (installedDevelopSkills.length > 0) {
        result.created.push(
          ...installedDevelopSkills.map(
            (s) => `.claude/skills/${s.name} (from git)`
          )
        );
        console.log(
          `[SpecForge] \u6210\u529F\u5B89\u88C5 ${installedDevelopSkills.length} \u4E2A Skills: ${installedDevelopSkills.map((s) => s.name).join(", ")}`
        );
      } else {
        result.warnings.push({
          file: "develop-skills",
          message: `\u4ECE Git \u4ED3\u5E93\u5B89\u88C5 develop_skills \u5931\u8D25\u3002\u8BF7\u68C0\u67E5\uFF1A
  1. Git URL \u662F\u5426\u53EF\u8BBF\u95EE: ${developSkillsConfig.gitUrl}
  2. skills \u8DEF\u5F84\u662F\u5426\u6B63\u786E: ${developSkillsConfig.skills.join(", ")}
  3. \u4ED3\u5E93\u4E2D\u5BF9\u5E94\u76EE\u5F55\u662F\u5426\u5305\u542B SKILL.md \u6587\u4EF6`
        });
      }
    }
    const variables = yield* profileConfigService.generateTemplateVariables(
      profile,
      projectPath,
      installedDevelopSkills
    );
    try {
      const configPath = path.join(projectPath, "openspec", "config.yaml");
      const originConfigPath = path.join(
        projectPath,
        "openspec",
        "config.origin.yaml"
      );
      const configExists = yield* fs.exists(configPath);
      if (configExists) {
        const originalContent = yield* fs.readFileString(configPath);
        if (!originalContent.includes("_specforge:")) {
          const backupHeader = `# ============================================================================
# OpenSpec \u6807\u51C6\u914D\u7F6E\u5907\u4EFD\u6587\u4EF6
# ============================================================================
#
# \u8FD9\u662F\u7531 SpecForge \u5728\u6267\u884C openspec init \u540E\u81EA\u52A8\u521B\u5EFA\u7684\u5907\u4EFD\u6587\u4EF6
#
# \u7528\u9014\uFF1A
#   - \u5BF9\u6BD4\u67E5\u770B OpenSpec \u539F\u59CB\u914D\u7F6E\u548C SpecForge \u7684\u589E\u5F3A\u4FEE\u6539
#   - \u4E86\u89E3 SpecForge \u5728\u6807\u51C6\u914D\u7F6E\u57FA\u7840\u4E0A\u505A\u4E86\u54EA\u4E9B\u8C03\u6574
#   - \u5982\u9700\u56DE\u9000\u5230\u6807\u51C6\u914D\u7F6E\uFF0C\u53EF\u4EE5\u5C06\u6B64\u6587\u4EF6\u5185\u5BB9\u590D\u5236\u5230 config.yaml
#
# \u521B\u5EFA\u65F6\u95F4\uFF1A${(/* @__PURE__ */ new Date()).toISOString()}
# \u573A\u666F\uFF1A${scenario}
#
# ============================================================================

`;
          const backupContent = backupHeader + originalContent;
          yield* fs.writeFileString(originConfigPath, backupContent);
          result.created.push(
            "openspec/config.origin.yaml (backup of original config)"
          );
        }
      }
    } catch (error) {
      console.warn(
        "\u5907\u4EFD config.yaml \u5931\u8D25:",
        error instanceof Error ? error.message : String(error)
      );
    }
    try {
      if (scenario === "S1_NEW") {
        const enhancementResult = yield* injectOpenspecEnhancements(
          projectPath,
          variables
        );
        result.created.push(...enhancementResult.created);
        result.updated.push(...enhancementResult.updated);
        result.errors.push(
          ...enhancementResult.errors.map((e) => ({
            file: "openspec-enhancements",
            error: e
          }))
        );
      } else {
        const openspecResult = yield* injectOpenspecDir(
          projectPath,
          variables,
          { scenario }
        );
        result.created.push(...openspecResult.created);
        result.skipped.push(...openspecResult.skipped);
        result.errors.push(
          ...openspecResult.errors.map((e) => ({
            file: "openspec",
            error: e
          }))
        );
      }
      if (scenario === "S1_NEW") {
        const claudeResult = yield* injectClaudeEnhancements(
          projectPath,
          variables
        );
        result.created.push(...claudeResult.created);
        result.skipped.push(...claudeResult.skipped);
        result.errors.push(
          ...claudeResult.errors.map((e) => ({
            file: ".claude-enhancements",
            error: e
          }))
        );
      } else {
        const claudeResult = yield* injectClaudeDir(projectPath, variables, {
          scenario
        });
        result.created.push(...claudeResult.created);
        result.skipped.push(...claudeResult.skipped);
        result.errors.push(
          ...claudeResult.errors.map((e) => ({
            file: ".claude",
            error: e
          }))
        );
      }
      yield* injectSpecforgeMarker(projectPath, profile.displayName);
      yield* mergeMcpConfig(projectPath, profile);
      yield* profileConfigService.saveProjectProfileConfig(
        projectId,
        profile
      );
      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push({
        file: "unknown",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return result;
  });
  return {
    injectTemplates,
    mergeMcpConfig,
    mergeConfigYaml,
    injectOpenspecEnhancements,
    injectClaudeEnhancements,
    injectSpecforgeMarker
  };
});
var TemplateInjectionService = class extends Context34.Tag(
  "TemplateInjectionService"
)() {
  static {
    this.Live = Layer36.effect(this, LayerImpl28);
  }
};

// src/server/core/openspec/presentation/OpenSpecController.ts
var catchAsServerError = (errorMessage) => Effect45.catchAll((error) => {
  console.error(`${errorMessage}:`, error);
  return Effect45.succeed({
    response: { error: errorMessage },
    status: 500
  });
});
var LayerImpl29 = Effect45.gen(function* () {
  const openSpecService = yield* OpenSpecService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const profileConfigService = yield* ProfileConfigService;
  const templateInjectionService = yield* TemplateInjectionService;
  const projectRepository = yield* ProjectRepository;
  const getChangesRoute = (options) => Effect45.gen(function* () {
    const changes = yield* openSpecService.getChanges(options.projectId);
    return {
      response: changes,
      status: 200
    };
  }).pipe(catchAsServerError("Failed to list OpenSpec changes"));
  const getChangeDetailsRoute = (options) => Effect45.gen(function* () {
    const details = yield* openSpecService.getChangeDetails(
      options.projectId,
      options.changeId
    );
    return {
      response: details,
      status: 200
    };
  }).pipe(catchAsServerError("Failed to get change details"));
  const getArchivedChangesRoute = (options) => Effect45.gen(function* () {
    const changes = yield* openSpecService.getArchivedChanges(
      options.projectId
    );
    return {
      response: changes,
      status: 200
    };
  }).pipe(catchAsServerError("Failed to list OpenSpec archived changes"));
  const updateFileRoute = (options) => Effect45.gen(function* () {
    yield* openSpecService.updateChangeFile(
      options.projectId,
      options.changeId,
      options.fileName,
      options.content
    );
    return {
      response: { success: true },
      status: 200
    };
  }).pipe(catchAsServerError("Failed to update file"));
  const getEnvironmentRoute = (options) => Effect45.gen(function* () {
    const status = yield* environmentService.checkEnvironment(
      options.projectId
    );
    return {
      response: status,
      status: 200
    };
  }).pipe(catchAsServerError("Failed to check environment"));
  const getProfilesRoute = (_options) => Effect45.gen(function* () {
    const result = yield* Effect45.either(
      profileConfigService.getAvailableProfiles()
    );
    if (result._tag === "Left") {
      const error = result.left;
      return {
        response: {
          error: "Failed to get profiles",
          details: String(error),
          type: error._tag || "UnknownError"
        },
        status: 500
      };
    }
    const { profiles, warnings } = result.right;
    return {
      response: { profiles, warnings },
      status: 200
    };
  });
  const initializeRoute = (options) => Effect45.gen(function* () {
    const { projectId, scenario, profile, force } = options;
    const result = yield* templateInjectionService.injectTemplates(
      projectId,
      {
        scenario,
        profile,
        skipUserFiles: true,
        force
      }
    );
    return {
      response: result,
      status: 200
    };
  }).pipe(catchAsServerError("Failed to initialize SpecForge"));
  const installCliGlobalRoute = (options) => Effect45.gen(function* () {
    const { projectId, initialize } = options;
    let projectPath;
    if (initialize) {
      const { project } = yield* projectRepository.getProject(projectId);
      projectPath = project.meta.projectPath ?? void 0;
    }
    const result = yield* environmentService.installCliGlobal({
      initialize,
      projectPath
    });
    return {
      response: result,
      status: result.success ? 200 : 500
    };
  }).pipe(catchAsServerError("Failed to install CLI"));
  const installCliProjectRoute = (options) => Effect45.gen(function* () {
    const { projectId, initialize } = options;
    const result = yield* environmentService.installCliProject(projectId, {
      initialize
    });
    return {
      response: result,
      status: result.success ? 200 : 500
    };
  }).pipe(catchAsServerError("Failed to install CLI"));
  const runOpenspecInitRoute = (options) => Effect45.gen(function* () {
    const result = yield* environmentService.initializeOpenspec(
      options.projectId
    );
    return {
      response: result,
      status: result.success ? 200 : 500
    };
  }).pipe(catchAsServerError("Failed to run openspec init"));
  const getProjectProfileRoute = (options) => Effect45.gen(function* () {
    const config = yield* profileConfigService.getProjectProfileConfig(
      options.projectId
    );
    return {
      response: { profile: config ?? null },
      status: 200
    };
  }).pipe(catchAsServerError("Failed to get project profile config"));
  return {
    getChangesRoute,
    getArchivedChangesRoute,
    getChangeDetailsRoute,
    updateFileRoute,
    getEnvironmentRoute,
    getProfilesRoute,
    getProjectProfileRoute,
    initializeRoute,
    installCliGlobalRoute,
    installCliProjectRoute,
    runOpenspecInitRoute
  };
});
var OpenSpecController = class extends Context35.Tag("OpenSpecController")() {
  static {
    this.Live = Layer37.effect(this, LayerImpl29);
  }
};

// src/server/core/project/presentation/ProjectController.ts
import { FileSystem as FileSystem22, Path as Path26 } from "@effect/platform";
import { Context as Context36, Effect as Effect47, Layer as Layer38 } from "effect";

// src/server/core/claude-code/functions/computeClaudeProjectFilePath.ts
import { Path as Path25 } from "@effect/platform";
import { Effect as Effect46 } from "effect";
var computeClaudeProjectFilePath = (options) => Effect46.gen(function* () {
  const path = yield* Path25.Path;
  const { projectPath, claudeProjectsDirPath } = options;
  return path.join(
    claudeProjectsDirPath,
    projectPath.replace(/\/$/, "").replace(/[/_]/g, "-")
  );
});

// src/server/core/project/presentation/ProjectController.ts
var LayerImpl30 = Effect47.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const userConfigService = yield* UserConfigService;
  const sessionRepository = yield* SessionRepository;
  const context = yield* ApplicationContext;
  const fileSystem = yield* FileSystem22.FileSystem;
  const path = yield* Path26.Path;
  const getProjects = () => Effect47.gen(function* () {
    const { projects } = yield* projectRepository.getProjects();
    return {
      status: 200,
      response: { projects }
    };
  });
  const getProject = (options) => Effect47.gen(function* () {
    const { projectId, cursor } = options;
    const userConfig = yield* userConfigService.getUserConfig();
    const { project } = yield* projectRepository.getProject(projectId);
    const { sessions } = yield* sessionRepository.getSessions(projectId, {
      cursor
    });
    let filteredSessions = sessions;
    if (userConfig.hideNoUserMessageSession) {
      filteredSessions = filteredSessions.filter((session) => {
        return session.meta.firstUserMessage !== null;
      });
    }
    if (userConfig.unifySameTitleSession) {
      const sessionMap = /* @__PURE__ */ new Map();
      for (const session of filteredSessions) {
        const title = session.meta.firstUserMessage !== null ? (() => {
          const cmd = session.meta.firstUserMessage;
          switch (cmd.kind) {
            case "command":
              return cmd.commandArgs === void 0 ? cmd.commandName : `${cmd.commandName} ${cmd.commandArgs}`;
            case "local-command":
              return cmd.stdout;
            case "text":
              return cmd.content;
            default:
              return session.id;
          }
        })() : session.id;
        const existingSession = sessionMap.get(title);
        if (existingSession) {
          if (session.lastModifiedAt && existingSession.lastModifiedAt) {
            if (session.lastModifiedAt > existingSession.lastModifiedAt) {
              sessionMap.set(title, session);
            }
          } else if (session.lastModifiedAt && !existingSession.lastModifiedAt) {
            sessionMap.set(title, session);
          }
        } else {
          sessionMap.set(title, session);
        }
      }
      filteredSessions = Array.from(sessionMap.values());
    }
    const hasMore = sessions.length >= 20;
    return {
      status: 200,
      response: {
        project,
        sessions: filteredSessions,
        nextCursor: hasMore ? sessions.at(-1)?.id : void 0
      }
    };
  });
  const getProjectLatestSession = (options) => Effect47.gen(function* () {
    const { projectId } = options;
    const { sessions } = yield* sessionRepository.getSessions(projectId, {
      maxCount: 1
    });
    return {
      status: 200,
      response: {
        latestSession: sessions[0] ?? null
      }
    };
  });
  const createProject = (options) => Effect47.gen(function* () {
    const { projectPath } = options;
    const claudeProjectFilePath = yield* computeClaudeProjectFilePath({
      projectPath,
      claudeProjectsDirPath: (yield* context.claudeCodePaths).claudeProjectsDirPath
    });
    const projectId = encodeProjectId(claudeProjectFilePath);
    const userConfig = yield* userConfigService.getUserConfig();
    const claudeMdPath = path.join(projectPath, "CLAUDE.md");
    const claudeMdExists = yield* fileSystem.exists(claudeMdPath);
    const result = yield* claudeCodeLifeCycleService.startTask({
      baseSession: {
        cwd: projectPath,
        projectId,
        sessionId: void 0
      },
      userConfig,
      input: {
        text: claudeMdExists ? "describe this project" : "/init"
      }
    });
    const { sessionId } = yield* result.yieldSessionFileCreated();
    return {
      status: 201,
      response: {
        projectId,
        sessionId
      }
    };
  });
  return {
    getProjects,
    getProject,
    getProjectLatestSession,
    createProject
  };
});
var ProjectController = class extends Context36.Tag("ProjectController")() {
  static {
    this.Live = Layer38.effect(this, LayerImpl30);
  }
};

// src/server/core/rate-limit/services/RateLimitAutoScheduleService.ts
import { FileSystem as FileSystem25, Path as Path28 } from "@effect/platform";
import { Context as Context39, Effect as Effect52, Layer as Layer41, Ref as Ref12 } from "effect";

// src/server/core/scheduler/config.ts
import { homedir as homedir3 } from "node:os";
import { FileSystem as FileSystem23, Path as Path27 } from "@effect/platform";
import { Context as Context37, Data as Data12, Effect as Effect48, Layer as Layer39 } from "effect";

// src/server/core/scheduler/schema.ts
import { z as z25 } from "zod";
var concurrencyPolicySchema = z25.enum(["skip", "run"]);
var cronScheduleSchema = z25.object({
  type: z25.literal("cron"),
  expression: z25.string(),
  concurrencyPolicy: concurrencyPolicySchema
});
var reservedScheduleSchema = z25.object({
  type: z25.literal("reserved"),
  reservedExecutionTime: z25.iso.datetime()
});
var scheduleSchema = z25.discriminatedUnion("type", [
  cronScheduleSchema,
  reservedScheduleSchema
]);
var messageConfigSchema = z25.object({
  content: z25.string(),
  projectId: z25.string(),
  baseSessionId: z25.string().nullable()
});
var jobStatusSchema = z25.enum(["success", "failed"]);
var schedulerJobSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  schedule: scheduleSchema,
  message: messageConfigSchema,
  enabled: z25.boolean(),
  createdAt: z25.string().datetime(),
  lastRunAt: z25.string().datetime().nullable(),
  lastRunStatus: jobStatusSchema.nullable()
});
var schedulerConfigSchema = z25.object({
  jobs: z25.array(schedulerJobSchema)
});
var newSchedulerJobSchema = schedulerJobSchema.omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
  lastRunStatus: true
}).extend({
  enabled: z25.boolean().default(true)
});
var updateSchedulerJobSchema = schedulerJobSchema.partial().pick({
  name: true,
  schedule: true,
  message: true,
  enabled: true
});

// src/server/core/scheduler/config.ts
var ConfigFileNotFoundError = class extends Data12.TaggedError(
  "ConfigFileNotFoundError"
) {
};
var ConfigParseError = class extends Data12.TaggedError("ConfigParseError") {
};
var CONFIG_DIR = "scheduler";
var CONFIG_FILE = "schedules.json";
var SchedulerConfigBaseDir = class extends Context37.Tag(
  "SchedulerConfigBaseDir"
)() {
  static {
    this.Live = Layer39.succeed(this, `${homedir3()}/.spec-forge-viewer`);
  }
};
var getConfigPath = Effect48.gen(function* () {
  const path = yield* Path27.Path;
  const baseDir = yield* SchedulerConfigBaseDir;
  return path.join(baseDir, CONFIG_DIR, CONFIG_FILE);
});
var readConfig = Effect48.gen(function* () {
  const fs = yield* FileSystem23.FileSystem;
  const configPath = yield* getConfigPath;
  const exists = yield* fs.exists(configPath);
  if (!exists) {
    return yield* Effect48.fail(
      new ConfigFileNotFoundError({ path: configPath })
    );
  }
  const content = yield* fs.readFileString(configPath);
  const jsonResult = yield* Effect48.try({
    try: () => JSON.parse(content),
    catch: (error) => new ConfigParseError({
      path: configPath,
      cause: error
    })
  });
  const parsed = schedulerConfigSchema.safeParse(jsonResult);
  if (!parsed.success) {
    return yield* Effect48.fail(
      new ConfigParseError({
        path: configPath,
        cause: parsed.error
      })
    );
  }
  return parsed.data;
});
var writeConfig = (config) => Effect48.gen(function* () {
  const fs = yield* FileSystem23.FileSystem;
  const path = yield* Path27.Path;
  const configPath = yield* getConfigPath;
  const configDir = path.dirname(configPath);
  yield* fs.makeDirectory(configDir, { recursive: true });
  const content = JSON.stringify(config, null, 2);
  yield* fs.writeFileString(configPath, content);
});
var initializeConfig = Effect48.gen(function* () {
  const result = yield* readConfig.pipe(
    Effect48.catchTags({
      ConfigFileNotFoundError: () => Effect48.gen(function* () {
        const initialConfig = { jobs: [] };
        yield* writeConfig(initialConfig);
        return initialConfig;
      }),
      ConfigParseError: () => Effect48.gen(function* () {
        const initialConfig = { jobs: [] };
        yield* writeConfig(initialConfig);
        return initialConfig;
      })
    })
  );
  return result;
});

// src/server/core/scheduler/domain/Scheduler.ts
import {
  Context as Context38,
  Cron,
  Data as Data13,
  Duration as Duration5,
  Effect as Effect50,
  Fiber,
  Layer as Layer40,
  Ref as Ref11,
  Schedule
} from "effect";
import { ulid as ulid4 } from "ulid";

// src/server/core/scheduler/domain/Job.ts
import { Effect as Effect49 } from "effect";
var executeJob = (job) => Effect49.gen(function* () {
  const lifeCycleService = yield* ClaudeCodeLifeCycleService;
  const projectRepository = yield* ProjectRepository;
  const userConfigService = yield* UserConfigService;
  const { message } = job;
  const { project } = yield* projectRepository.getProject(message.projectId);
  const userConfig = yield* userConfigService.getUserConfig();
  if (project.meta.projectPath === null) {
    return yield* Effect49.fail(
      new Error(`Project path not found for projectId: ${message.projectId}`)
    );
  }
  yield* lifeCycleService.startTask({
    baseSession: {
      cwd: project.meta.projectPath,
      projectId: message.projectId,
      sessionId: message.baseSessionId ?? void 0
    },
    userConfig,
    input: {
      text: message.content
    }
  });
});
var calculateReservedDelay = (job, now) => {
  if (job.schedule.type !== "reserved") {
    throw new Error("Job schedule type must be reserved");
  }
  const scheduledTime = new Date(job.schedule.reservedExecutionTime);
  const delay = scheduledTime.getTime() - now.getTime();
  return Math.max(0, delay);
};

// src/server/core/scheduler/domain/Scheduler.ts
var SchedulerJobNotFoundError = class extends Data13.TaggedError(
  "SchedulerJobNotFoundError"
) {
};
var InvalidCronExpressionError = class extends Data13.TaggedError(
  "InvalidCronExpressionError"
) {
};
var LayerImpl31 = Effect50.gen(function* () {
  const fibersRef = yield* Ref11.make(/* @__PURE__ */ new Map());
  const runningJobsRef = yield* Ref11.make(/* @__PURE__ */ new Set());
  const startJob = (job) => Effect50.gen(function* () {
    const now = /* @__PURE__ */ new Date();
    if (job.schedule.type === "cron") {
      const cronResult = Cron.parse(job.schedule.expression);
      if (cronResult._tag === "Left") {
        return yield* Effect50.fail(
          new InvalidCronExpressionError({
            expression: job.schedule.expression,
            cause: cronResult.left
          })
        );
      }
      const cronSchedule = Schedule.cron(cronResult.right);
      const fiber = yield* Effect50.gen(function* () {
        const nextTime = Cron.next(cronResult.right, /* @__PURE__ */ new Date());
        const nextDelay = Math.max(0, nextTime.getTime() - Date.now());
        yield* Effect50.sleep(Duration5.millis(nextDelay));
        yield* Effect50.repeat(runJobWithConcurrencyControl(job), cronSchedule);
      }).pipe(Effect50.forkDaemon);
      yield* Ref11.update(
        fibersRef,
        (fibers) => new Map(fibers).set(job.id, fiber)
      );
    } else if (job.schedule.type === "reserved") {
      if (job.lastRunStatus !== null) {
        return;
      }
      const delay = calculateReservedDelay(job, now);
      const delayDuration = Duration5.millis(delay);
      const fiber = yield* Effect50.delay(
        runJobWithConcurrencyControl(job),
        delayDuration
      ).pipe(Effect50.forkDaemon);
      yield* Ref11.update(
        fibersRef,
        (fibers) => new Map(fibers).set(job.id, fiber)
      );
    }
  });
  const runJobWithConcurrencyControl = (job) => Effect50.gen(function* () {
    if (job.schedule.type === "cron" && job.schedule.concurrencyPolicy === "skip") {
      const runningJobs = yield* Ref11.get(runningJobsRef);
      if (runningJobs.has(job.id)) {
        return;
      }
    }
    yield* Ref11.update(runningJobsRef, (jobs) => new Set(jobs).add(job.id));
    if (job.schedule.type === "reserved") {
      const result2 = yield* executeJob(job).pipe(
        Effect50.matchEffect({
          onSuccess: () => Effect50.void,
          onFailure: () => Effect50.void
        })
      );
      yield* Ref11.update(runningJobsRef, (jobs) => {
        const newJobs = new Set(jobs);
        newJobs.delete(job.id);
        return newJobs;
      });
      yield* deleteJobFromConfig(job.id).pipe(
        Effect50.catchAll((error) => {
          console.error(
            `[Scheduler] Failed to delete reserved job ${job.id}:`,
            error
          );
          return Effect50.void;
        })
      );
      return result2;
    }
    const result = yield* executeJob(job).pipe(
      Effect50.matchEffect({
        onSuccess: () => updateJobStatus(job.id, "success", (/* @__PURE__ */ new Date()).toISOString()),
        onFailure: () => updateJobStatus(job.id, "failed", (/* @__PURE__ */ new Date()).toISOString())
      })
    );
    yield* Ref11.update(runningJobsRef, (jobs) => {
      const newJobs = new Set(jobs);
      newJobs.delete(job.id);
      return newJobs;
    });
    return result;
  });
  const updateJobStatus = (jobId, status, runAt) => Effect50.gen(function* () {
    const config = yield* readConfig;
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return;
    }
    const updatedJob = {
      ...job,
      lastRunAt: runAt,
      lastRunStatus: status
    };
    const updatedConfig = {
      jobs: config.jobs.map((j) => j.id === jobId ? updatedJob : j)
    };
    yield* writeConfig(updatedConfig);
  });
  const stopJob = (jobId) => Effect50.gen(function* () {
    const fibers = yield* Ref11.get(fibersRef);
    const fiber = fibers.get(jobId);
    if (fiber !== void 0) {
      yield* Fiber.interrupt(fiber);
      yield* Ref11.update(fibersRef, (fibers2) => {
        const newFibers = new Map(fibers2);
        newFibers.delete(jobId);
        return newFibers;
      });
    }
  });
  const startScheduler = Effect50.gen(function* () {
    yield* initializeConfig;
    const config = yield* readConfig;
    for (const job of config.jobs) {
      if (job.enabled) {
        yield* startJob(job);
      }
    }
  });
  const stopScheduler = Effect50.gen(function* () {
    const fibers = yield* Ref11.get(fibersRef);
    for (const fiber of fibers.values()) {
      yield* Fiber.interrupt(fiber);
    }
    yield* Ref11.set(fibersRef, /* @__PURE__ */ new Map());
  });
  const getJobs = () => Effect50.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect50.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] })))
      })
    );
    return config.jobs;
  });
  const addJob = (newJob) => Effect50.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect50.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] })))
      })
    );
    const job = {
      ...newJob,
      id: ulid4(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastRunAt: null,
      lastRunStatus: null
    };
    const updatedConfig = {
      jobs: [...config.jobs, job]
    };
    yield* writeConfig(updatedConfig);
    if (job.enabled) {
      yield* startJob(job);
    }
    return job;
  });
  const updateJob = (jobId, updates) => Effect50.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect50.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect50.fail(new SchedulerJobNotFoundError({ jobId }));
    }
    yield* stopJob(jobId);
    const updatedJob = {
      ...job,
      ...updates
    };
    const updatedConfig = {
      jobs: config.jobs.map((j) => j.id === jobId ? updatedJob : j)
    };
    yield* writeConfig(updatedConfig);
    if (updatedJob.enabled) {
      yield* startJob(updatedJob);
    }
    return updatedJob;
  });
  const deleteJobFromConfig = (jobId) => Effect50.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect50.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect50.fail(new SchedulerJobNotFoundError({ jobId }));
    }
    const updatedConfig = {
      jobs: config.jobs.filter((j) => j.id !== jobId)
    };
    yield* writeConfig(updatedConfig);
  });
  const deleteJob = (jobId) => Effect50.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect50.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect50.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect50.fail(new SchedulerJobNotFoundError({ jobId }));
    }
    yield* stopJob(jobId);
    yield* deleteJobFromConfig(jobId);
  });
  return {
    startScheduler,
    stopScheduler,
    getJobs,
    addJob,
    updateJob,
    deleteJob
  };
});
var SchedulerService = class extends Context38.Tag("SchedulerService")() {
  static {
    this.Live = Layer40.effect(this, LayerImpl31);
  }
};

// src/server/core/rate-limit/schema.ts
import { z as z26 } from "zod";
var RateLimitEntrySchema = z26.object({
  type: z26.literal("assistant"),
  error: z26.literal("rate_limit"),
  isApiErrorMessage: z26.literal(true),
  sessionId: z26.string(),
  message: z26.object({
    content: z26.array(
      z26.object({
        type: z26.literal("text"),
        text: z26.string()
      })
    )
  })
});

// src/server/core/rate-limit/functions/detectRateLimitFromLastLine.ts
var detectRateLimitFromLastLine = (jsonLine) => {
  const trimmed = jsonLine.trim();
  if (trimmed === "") {
    return { detected: false };
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { detected: false };
  }
  const validation = RateLimitEntrySchema.safeParse(parsed);
  if (!validation.success) {
    return { detected: false };
  }
  const entry = validation.data;
  const firstTextContent = entry.message.content[0];
  if (!firstTextContent) {
    return { detected: false };
  }
  return {
    detected: true,
    sessionId: entry.sessionId,
    resetTimeText: firstTextContent.text
  };
};

// src/server/core/rate-limit/functions/parseRateLimitResetTime.ts
var parseRateLimitResetTime = (resetTimeText) => {
  const pattern = /resets\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\s*\(([^)]+)\)/i;
  const match = pattern.exec(resetTimeText);
  if (!match) {
    return getFallbackTime();
  }
  const hoursStr = match[1];
  const minutesStr = match[2];
  const meridiem = match[3];
  const timezone = match[4];
  if (hoursStr === void 0 || meridiem === void 0 || timezone === void 0) {
    return getFallbackTime();
  }
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = minutesStr !== void 0 ? Number.parseInt(minutesStr, 10) : 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return getFallbackTime();
  }
  const hours24 = convertTo24Hour(hours, meridiem.toLowerCase());
  const resetDate = createDateInTimezone(hours24, minutes, timezone);
  if (resetDate === null) {
    return getFallbackTime();
  }
  resetDate.setMinutes(resetDate.getMinutes() + 1);
  return resetDate.toISOString();
};
var convertTo24Hour = (hours, meridiem) => {
  const isPM = meridiem === "pm";
  if (hours === 12) {
    return isPM ? 12 : 0;
  }
  return isPM ? hours + 12 : hours;
};
var getTimezoneOffsetMinutes = (timezone, date) => {
  const utcFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const utcParts = utcFormatter.formatToParts(date);
  const tzParts = tzFormatter.formatToParts(date);
  const extractDateTime = (parts) => ({
    day: Number.parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10),
    hour: Number.parseInt(
      parts.find((p) => p.type === "hour")?.value ?? "0",
      10
    ),
    minute: Number.parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0",
      10
    )
  });
  const utc = extractDateTime(utcParts);
  const tz = extractDateTime(tzParts);
  let dayDiff = tz.day - utc.day;
  if (dayDiff > 15) dayDiff -= 31;
  if (dayDiff < -15) dayDiff += 31;
  const offsetMinutes = dayDiff * 24 * 60 + (tz.hour - utc.hour) * 60 + (tz.minute - utc.minute);
  return offsetMinutes;
};
var createDateInTimezone = (hours, minutes, timezone) => {
  const now = /* @__PURE__ */ new Date();
  try {
    const testFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone
    });
    testFormatter.format(now);
    const offsetMinutes = getTimezoneOffsetMinutes(timezone, now);
    const tzFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = tzFormatter.formatToParts(now);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) {
      return null;
    }
    const totalTargetMinutes = hours * 60 + minutes;
    const totalUtcMinutes = totalTargetMinutes - offsetMinutes;
    const baseDate = /* @__PURE__ */ new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    const resetDate = new Date(
      baseDate.getTime() + totalUtcMinutes * 60 * 1e3
    );
    if (resetDate.getTime() <= now.getTime()) {
      resetDate.setTime(resetDate.getTime() + 24 * 60 * 60 * 1e3);
    }
    return resetDate;
  } catch {
    return null;
  }
};
var getFallbackTime = () => {
  const fallback = /* @__PURE__ */ new Date();
  fallback.setMinutes(fallback.getMinutes() + 30);
  return fallback.toISOString();
};

// src/server/core/rate-limit/functions/readLastLine.ts
import { FileSystem as FileSystem24 } from "@effect/platform";
import { Effect as Effect51 } from "effect";
var extractLastNonEmptyLine = (content) => {
  const lines = content.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line !== void 0 && line.trim() !== "") {
      return line;
    }
  }
  return "";
};
var readLastLine = (filePath) => Effect51.gen(function* () {
  const fs = yield* FileSystem24.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return extractLastNonEmptyLine(content);
});

// src/server/core/rate-limit/services/RateLimitAutoScheduleService.ts
var LayerImpl32 = Effect52.gen(function* () {
  const eventBus = yield* EventBus;
  const userConfigService = yield* UserConfigService;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const schedulerService = yield* SchedulerService;
  const fs = yield* FileSystem25.FileSystem;
  const pathService = yield* Path28.Path;
  const schedulerConfigBaseDir = yield* SchedulerConfigBaseDir;
  const projectRepository = yield* ProjectRepository;
  const lifeCycleService = yield* ClaudeCodeLifeCycleService;
  const listenerRef = yield* Ref12.make(null);
  const getSessionProcessProjectId = (sessionId) => Effect52.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    const liveProcess = processes.find(
      (process2) => process2.sessionId === sessionId && (process2.type === "initialized" || process2.type === "file_created" || process2.type === "paused")
    );
    return liveProcess?.def.projectId;
  });
  const hasExistingReservedJobForSession = (sessionId) => Effect52.gen(function* () {
    const jobs = yield* schedulerService.getJobs().pipe(Effect52.catchAll(() => Effect52.succeed([])));
    return jobs.some(
      (job) => job.schedule.type === "reserved" && job.message.baseSessionId === sessionId && job.lastRunStatus === null
      // Not yet executed
    );
  });
  const handleSessionChanged = (event) => Effect52.gen(function* () {
    const { projectId, sessionId } = event;
    const config = yield* userConfigService.getUserConfig();
    if (!config.autoScheduleContinueOnRateLimit) {
      return;
    }
    const processProjectId = yield* getSessionProcessProjectId(sessionId);
    if (processProjectId === void 0) {
      return;
    }
    const hasExistingJob = yield* hasExistingReservedJobForSession(sessionId);
    if (hasExistingJob) {
      return;
    }
    const projectPath = decodeProjectId(projectId);
    const sessionFilePath = pathService.join(
      projectPath,
      `${sessionId}.jsonl`
    );
    const lastLine = yield* readLastLine(sessionFilePath).pipe(
      Effect52.catchAll(() => Effect52.succeed(""))
    );
    if (lastLine === "") {
      return;
    }
    const detection = detectRateLimitFromLastLine(lastLine);
    if (!detection.detected) {
      return;
    }
    const resetTime = parseRateLimitResetTime(detection.resetTimeText);
    yield* schedulerService.addJob({
      name: `Rate limit auto-continue: ${sessionId.slice(0, 8)}...`,
      schedule: {
        type: "reserved",
        reservedExecutionTime: resetTime
      },
      message: {
        content: "continue",
        projectId: processProjectId,
        baseSessionId: sessionId
      },
      enabled: true
    }).pipe(
      Effect52.catchAll((error) => {
        console.error(
          `[RateLimitAutoScheduleService] Failed to add job for session ${sessionId}:`,
          error
        );
        return Effect52.void;
      })
    );
    console.log(
      `[RateLimitAutoScheduleService] Scheduled continue task for session ${sessionId} at ${resetTime}`
    );
  });
  const runtimeLayer = Layer41.mergeAll(
    Layer41.succeed(FileSystem25.FileSystem, fs),
    Layer41.succeed(Path28.Path, pathService),
    Layer41.succeed(SchedulerConfigBaseDir, schedulerConfigBaseDir),
    Layer41.succeed(ProjectRepository, projectRepository),
    Layer41.succeed(UserConfigService, userConfigService),
    Layer41.succeed(ClaudeCodeLifeCycleService, lifeCycleService)
  );
  const start = () => Effect52.gen(function* () {
    const existingListener = yield* Ref12.get(listenerRef);
    if (existingListener !== null) {
      return;
    }
    const listener = (event) => {
      Effect52.runFork(
        handleSessionChanged(event).pipe(Effect52.provide(runtimeLayer))
      );
    };
    yield* Ref12.set(listenerRef, listener);
    yield* eventBus.on("sessionChanged", listener);
    console.log("[RateLimitAutoScheduleService] Started");
  });
  const stop = () => Effect52.gen(function* () {
    const listener = yield* Ref12.get(listenerRef);
    if (listener !== null) {
      yield* eventBus.off("sessionChanged", listener);
      yield* Ref12.set(listenerRef, null);
    }
    console.log("[RateLimitAutoScheduleService] Stopped");
  });
  return {
    start,
    stop
  };
});
var RateLimitAutoScheduleService = class extends Context39.Tag(
  "RateLimitAutoScheduleService"
)() {
  static {
    this.Live = Layer41.effect(this, LayerImpl32);
  }
};

// src/server/core/scheduler/presentation/SchedulerController.ts
import { Context as Context40, Effect as Effect53, Layer as Layer42 } from "effect";
var LayerImpl33 = Effect53.gen(function* () {
  const schedulerService = yield* SchedulerService;
  const getJobs = () => Effect53.gen(function* () {
    const jobs = yield* schedulerService.getJobs();
    return {
      response: jobs,
      status: 200
    };
  });
  const addJob = (options) => Effect53.gen(function* () {
    const { job } = options;
    const result = yield* schedulerService.addJob(job);
    return {
      response: result,
      status: 201
    };
  });
  const updateJob = (options) => Effect53.gen(function* () {
    const { id, job } = options;
    const result = yield* schedulerService.updateJob(id, job).pipe(
      Effect53.catchTag(
        "SchedulerJobNotFoundError",
        () => Effect53.succeed(null)
      )
    );
    if (result === null) {
      return {
        response: { error: "Job not found" },
        status: 404
      };
    }
    return {
      response: result,
      status: 200
    };
  });
  const deleteJob = (options) => Effect53.gen(function* () {
    const { id } = options;
    const result = yield* schedulerService.deleteJob(id).pipe(
      Effect53.catchTag(
        "SchedulerJobNotFoundError",
        () => Effect53.succeed(false)
      ),
      Effect53.map(() => true)
    );
    if (!result) {
      return {
        response: { error: "Job not found" },
        status: 404
      };
    }
    return {
      response: { success: true },
      status: 200
    };
  });
  return {
    getJobs,
    addJob,
    updateJob,
    deleteJob
  };
});
var SchedulerController = class extends Context40.Tag("SchedulerController")() {
  static {
    this.Live = Layer42.effect(this, LayerImpl33);
  }
};

// src/server/core/search/presentation/SearchController.ts
import { Context as Context42, Effect as Effect55, Layer as Layer44 } from "effect";

// src/server/core/search/services/SearchService.ts
import { FileSystem as FileSystem26, Path as Path29 } from "@effect/platform";
import { Context as Context41, Effect as Effect54, Layer as Layer43, Ref as Ref13 } from "effect";
import MiniSearch from "minisearch";

// src/server/core/search/functions/extractSearchableText.ts
var extractSearchableText = (conversation) => {
  if (conversation.type === "x-error") {
    return null;
  }
  if (conversation.type === "user") {
    return extractUserText(conversation);
  }
  if (conversation.type === "assistant") {
    return extractAssistantText(conversation);
  }
  return null;
};
var extractUserText = (entry) => {
  const content = entry.message.content;
  if (typeof content === "string") {
    return content;
  }
  return content.map((item) => {
    if (typeof item === "string") return item;
    if ("text" in item && typeof item.text === "string") return item.text;
    return "";
  }).filter(Boolean).join(" ");
};
var extractAssistantText = (entry) => {
  return entry.message.content.filter((item) => {
    return item.type === "text" && "text" in item;
  }).map((item) => item.text).join(" ");
};

// src/server/core/search/services/SearchService.ts
var INDEX_TTL_MS = 6e4;
var MAX_TEXT_LENGTH = 2e3;
var MAX_ASSISTANT_TEXT_LENGTH = 500;
var createMiniSearchIndex = () => new MiniSearch({
  fields: ["text"],
  storeFields: ["id"],
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
    boost: { text: 1 }
  }
});
var LayerImpl34 = Effect54.gen(function* () {
  const fs = yield* FileSystem26.FileSystem;
  const path = yield* Path29.Path;
  const context = yield* ApplicationContext;
  const indexCacheRef = yield* Ref13.make(null);
  const buildIndex = () => Effect54.gen(function* () {
    const { claudeProjectsDirPath } = yield* context.claudeCodePaths;
    const dirExists = yield* fs.exists(claudeProjectsDirPath);
    if (!dirExists) {
      return { index: createMiniSearchIndex(), documents: /* @__PURE__ */ new Map() };
    }
    const projectEntries = yield* fs.readDirectory(claudeProjectsDirPath);
    const miniSearch = createMiniSearchIndex();
    const documentEffects = projectEntries.map(
      (projectEntry) => Effect54.gen(function* () {
        const projectPath = path.resolve(claudeProjectsDirPath, projectEntry);
        const stat = yield* fs.stat(projectPath).pipe(Effect54.catchAll(() => Effect54.succeed(null)));
        if (stat?.type !== "Directory") {
          return [];
        }
        const projectId = encodeProjectId(projectPath);
        const projectName = path.basename(projectPath);
        const sessionEntries = yield* fs.readDirectory(projectPath).pipe(Effect54.catchAll(() => Effect54.succeed([])));
        const sessionFiles = sessionEntries.filter(isRegularSessionFile);
        const sessionDocuments = yield* Effect54.all(
          sessionFiles.map(
            (sessionFile) => Effect54.gen(function* () {
              const sessionPath = path.resolve(projectPath, sessionFile);
              const sessionId = encodeSessionId(sessionPath);
              const content = yield* fs.readFileString(sessionPath).pipe(Effect54.catchAll(() => Effect54.succeed("")));
              if (!content) return [];
              const conversations = parseJsonl(content);
              const documents = [];
              for (let i = 0; i < conversations.length; i++) {
                const conversation = conversations[i];
                if (conversation === void 0) continue;
                if (conversation.type !== "user" && conversation.type !== "assistant") {
                  continue;
                }
                let text = extractSearchableText(conversation);
                if (!text || text.length < 3) continue;
                const maxLen = conversation.type === "user" ? MAX_TEXT_LENGTH : MAX_ASSISTANT_TEXT_LENGTH;
                if (text.length > maxLen) {
                  text = text.slice(0, maxLen);
                }
                documents.push({
                  id: `${sessionId}:${i}`,
                  projectId,
                  projectName,
                  sessionId,
                  conversationIndex: i,
                  type: conversation.type,
                  text,
                  timestamp: "timestamp" in conversation ? conversation.timestamp : ""
                });
              }
              return documents;
            })
          ),
          { concurrency: 20 }
        );
        return sessionDocuments.flat();
      })
    );
    const allDocuments = yield* Effect54.all(documentEffects, {
      concurrency: 10
    });
    const flatDocuments = allDocuments.flat();
    miniSearch.addAll(flatDocuments);
    const documentsMap = /* @__PURE__ */ new Map();
    for (const doc of flatDocuments) {
      documentsMap.set(doc.id, doc);
    }
    return { index: miniSearch, documents: documentsMap };
  });
  const getIndex = () => Effect54.gen(function* () {
    const cached = yield* Ref13.get(indexCacheRef);
    const now = Date.now();
    if (cached && now - cached.builtAt < INDEX_TTL_MS) {
      return { index: cached.index, documents: cached.documents };
    }
    const { index, documents } = yield* buildIndex();
    yield* Ref13.set(indexCacheRef, { index, documents, builtAt: now });
    return { index, documents };
  });
  const search = (query3, limit = 20, projectId) => Effect54.gen(function* () {
    const { claudeProjectsDirPath } = yield* context.claudeCodePaths;
    const dirExists = yield* fs.exists(claudeProjectsDirPath);
    if (!dirExists) {
      return { results: [] };
    }
    const { index: miniSearch, documents } = yield* getIndex();
    const searchResults = miniSearch.search(query3).slice(0, limit * 2);
    const results = [];
    for (const result of searchResults) {
      if (results.length >= limit) break;
      const doc = documents.get(String(result.id));
      if (!doc) continue;
      if (projectId && doc.projectId !== projectId) continue;
      const score = doc.type === "user" ? result.score * 1.2 : result.score;
      const snippetLength = 150;
      const text = doc.text;
      const queryLower = query3.toLowerCase();
      const textLower = text.toLowerCase();
      const matchIndex = textLower.indexOf(queryLower);
      let snippet;
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(text.length, start + snippetLength);
        snippet = (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
      } else {
        snippet = text.slice(0, snippetLength) + (text.length > snippetLength ? "..." : "");
      }
      results.push({
        projectId: doc.projectId,
        projectName: doc.projectName,
        sessionId: doc.sessionId,
        conversationIndex: doc.conversationIndex,
        type: doc.type,
        snippet,
        timestamp: doc.timestamp,
        score
      });
    }
    return { results };
  });
  const invalidateIndex = () => Ref13.set(indexCacheRef, null);
  return {
    search,
    invalidateIndex
  };
});
var SearchService = class extends Context41.Tag("SearchService")() {
  static {
    this.Live = Layer43.effect(this, LayerImpl34);
  }
};

// src/server/core/search/presentation/SearchController.ts
var LayerImpl35 = Effect55.gen(function* () {
  const searchService = yield* SearchService;
  const search = (options) => Effect55.gen(function* () {
    const { query: query3, limit, projectId } = options;
    if (query3.trim().length < 2) {
      return {
        status: 400,
        response: {
          error: "Query must contain at least 2 non-whitespace characters"
        }
      };
    }
    const { results } = yield* searchService.search(
      query3.trim(),
      limit,
      projectId
    );
    return {
      status: 200,
      response: { results }
    };
  });
  return {
    search
  };
});
var SearchController = class extends Context42.Tag("SearchController")() {
  static {
    this.Live = Layer44.effect(this, LayerImpl35);
  }
};

// src/server/core/session/presentation/SessionController.ts
import { FileSystem as FileSystem27 } from "@effect/platform";
import { Context as Context43, Effect as Effect57, Layer as Layer45 } from "effect";

// src/server/core/session/services/ExportService.ts
import { Effect as Effect56 } from "effect";
var escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
};
var formatJsonWithNewlines = (obj) => {
  const jsonString = JSON.stringify(obj, null, 2);
  return jsonString.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\r/g, "\r");
};
var formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};
var renderMarkdown = (content) => {
  const codeBlocks = [];
  let processedContent = content.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`
    <div class="code-block">
      ${lang ? `<div class="code-header"><span class="code-lang">${escapeHtml(lang.toUpperCase())}</span></div>` : ""}
      <pre><code class="language-${escapeHtml(lang || "text")}">${escapeHtml(code.trim())}</code></pre>
    </div>
  `);
      return placeholder;
    }
  );
  processedContent = processedContent.replace(
    /(?:^\|.+\|$\n?)+/gm,
    (tableBlock) => {
      const rows = tableBlock.trim().split("\n");
      if (rows.length < 2) return escapeHtml(tableBlock);
      const headerRow = rows[0];
      const separatorRow = rows[1];
      if (!headerRow || !separatorRow || !/^\|[\s\-:|]+\|$/.test(separatorRow)) {
        return escapeHtml(tableBlock);
      }
      const parseRow = (row) => row.split("|").slice(1, -1).map((cell) => cell.trim());
      const headerCells = parseRow(headerRow);
      const dataRows = rows.slice(2);
      let tableHtml = '<table class="markdown-table"><thead><tr>';
      for (const cell of headerCells) {
        tableHtml += `<th>${escapeHtml(cell)}</th>`;
      }
      tableHtml += "</tr></thead><tbody>";
      for (const row of dataRows) {
        const cells = parseRow(row);
        tableHtml += "<tr>";
        for (const cell of cells) {
          tableHtml += `<td>${escapeHtml(cell)}</td>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</tbody></table>";
      return tableHtml;
    }
  );
  processedContent = processedContent.split(
    /(<table class="markdown-table">[\s\S]*?<\/table>|__CODE_BLOCK_\d+__)/
  ).map((part) => {
    if (part.startsWith('<table class="markdown-table">') || /^__CODE_BLOCK_\d+__$/.test(part)) {
      return part;
    }
    return escapeHtml(part);
  }).join("");
  processedContent = processedContent.replace(
    /(?:^&gt; .+$\n?)+/gm,
    (quoteBlock) => {
      const lines = quoteBlock.split("\n").filter((l) => l.trim()).map((l) => l.replace(/^&gt; /, "")).join("<br>");
      return `<blockquote class="markdown-blockquote">${lines}</blockquote>`;
    }
  );
  processedContent = processedContent.replace(
    /^(\*{3,}|-{3,}|_{3,})$/gm,
    '<hr class="markdown-hr">'
  );
  processedContent = processedContent.replace(
    /(?:^- \[([ xX])\] .+$\n?)+/gm,
    (listBlock) => {
      const items = listBlock.trim().split("\n").map((line) => {
        const match = line.match(/^- \[([ xX])\] (.+)$/);
        if (match?.[1] !== void 0 && match[2] !== void 0) {
          const checked = match[1].toLowerCase() === "x";
          return `<li class="task-item"><input type="checkbox" class="task-checkbox" ${checked ? "checked" : ""} disabled>${match[2]}</li>`;
        }
        return "";
      }).join("");
      return `<ul class="markdown-task-list">${items}</ul>`;
    }
  );
  processedContent = processedContent.replace(
    /(?:^[-*+] .+$\n?)+/gm,
    (listBlock) => {
      const items = listBlock.trim().split("\n").map((line) => {
        const match = line.match(/^[-*+] (.+)$/);
        return match ? `<li>${match[1]}</li>` : "";
      }).join("");
      return `<ul class="markdown-ul">${items}</ul>`;
    }
  );
  processedContent = processedContent.replace(
    /(?:^\d+\. .+$\n?)+/gm,
    (listBlock) => {
      const items = listBlock.trim().split("\n").map((line) => {
        const match = line.match(/^\d+\. (.+)$/);
        return match ? `<li>${match[1]}</li>` : "";
      }).join("");
      return `<ol class="markdown-ol">${items}</ol>`;
    }
  );
  processedContent = processedContent.replace(
    /~~(.+?)~~/g,
    '<del class="markdown-del">$1</del>'
  );
  processedContent = processedContent.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  );
  processedContent = processedContent.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );
  processedContent = processedContent.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    "<em>$1</em>"
  );
  processedContent = processedContent.replace(
    /^### (.+)$/gm,
    '<h3 class="markdown-h3">$1</h3>'
  );
  processedContent = processedContent.replace(
    /^## (.+)$/gm,
    '<h2 class="markdown-h2">$1</h2>'
  );
  processedContent = processedContent.replace(
    /^# (.+)$/gm,
    '<h1 class="markdown-h1">$1</h1>'
  );
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  const blockElements = [
    "<h1",
    "<h2",
    "<h3",
    "<div",
    "<pre",
    "<table",
    "<ul",
    "<ol",
    "<blockquote",
    "<hr",
    "__CODE_BLOCK_"
  ];
  processedContent = processedContent.split("\n\n").map((para) => {
    const trimmed = para.trim();
    if (trimmed === "") return "";
    if (blockElements.some((tag) => trimmed.startsWith(tag))) {
      return para;
    }
    return `<p class="markdown-p">${para.replace(/\n/g, "<br>")}</p>`;
  }).filter((p) => p !== "").join("\n");
  for (let i = 0; i < codeBlocks.length; i++) {
    const codeBlock = codeBlocks[i];
    if (codeBlock !== void 0) {
      processedContent = processedContent.replace(
        `__CODE_BLOCK_${i}__`,
        codeBlock
      );
    }
  }
  return processedContent;
};
var renderUserEntry = (entry) => {
  const contentArray = Array.isArray(entry.message.content) ? entry.message.content : [entry.message.content];
  const contentHtml = contentArray.map((msg) => {
    if (typeof msg === "string") {
      return `<div class="markdown-content">${renderMarkdown(msg)}</div>`;
    }
    if (msg.type === "text") {
      return `<div class="markdown-content">${renderMarkdown(msg.text)}</div>`;
    }
    if (msg.type === "image") {
      return `<img src="data:${msg.source.media_type};base64,${msg.source.data}" alt="User uploaded image" class="message-image" />`;
    }
    if (msg.type === "document") {
      return `<div class="document-content"><strong>Document:</strong> ${escapeHtml(msg.source.media_type)}</div>`;
    }
    if (msg.type === "tool_result") {
      return "";
    }
    return "";
  }).join("");
  if (!contentHtml.trim()) {
    return "";
  }
  return `
    <div class="conversation-entry user-entry">
      <div class="entry-header">
        <span class="entry-role">User</span>
        <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
      </div>
      <div class="entry-content">
        ${contentHtml}
      </div>
    </div>
  `;
};
var renderToolResultContent = (result) => {
  const isError = result.is_error === true;
  const errorClass = isError ? " tool-result-error" : "";
  let contentHtml;
  if (typeof result.content === "string") {
    contentHtml = `<pre class="tool-result-text">${escapeHtml(result.content)}</pre>`;
  } else {
    contentHtml = result.content.map((item) => {
      if (item.type === "text") {
        return `<pre class="tool-result-text">${escapeHtml(item.text)}</pre>`;
      }
      if (item.type === "image") {
        return `<img src="data:${item.source.media_type};base64,${item.source.data}" alt="Tool result image" class="tool-result-image" />`;
      }
      return "";
    }).join("");
  }
  return `
    <div class="tool-result-block${errorClass}">
      <div class="tool-result-header">
        <svg class="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${isError ? '<path d="M18 6L6 18M6 6l12 12"/>' : '<path d="M20 6L9 17l-5-5"/>'}
        </svg>
        <span class="tool-result-label">${isError ? "Error" : "Result"}</span>
      </div>
      <div class="tool-result-content">
        ${contentHtml}
      </div>
    </div>
  `;
};
var hasAgentId = (toolUseResult) => {
  return typeof toolUseResult === "object" && toolUseResult !== null && "agentId" in toolUseResult && typeof toolUseResult.agentId === "string";
};
var buildSidechainData = (conversations) => {
  const sidechainConversations = conversations.filter(
    (conv) => conv.type !== "summary" && conv.type !== "file-history-snapshot" && conv.type !== "queue-operation" && conv.type !== "progress" && conv.isSidechain === true
  );
  const uuidMap = new Map(
    sidechainConversations.map((conv) => [conv.uuid, conv])
  );
  const getRootConversation = (conv) => {
    if (conv.parentUuid === null) {
      return conv;
    }
    const parent = uuidMap.get(conv.parentUuid);
    if (parent === void 0) {
      return conv;
    }
    return getRootConversation(parent);
  };
  const groupsByRootUuid = /* @__PURE__ */ new Map();
  for (const conv of sidechainConversations) {
    const root = getRootConversation(conv);
    const existing = groupsByRootUuid.get(root.uuid);
    if (existing) {
      existing.push(conv);
    } else {
      groupsByRootUuid.set(root.uuid, [conv]);
    }
  }
  for (const [, convs] of groupsByRootUuid) {
    convs.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  const promptToRoot = /* @__PURE__ */ new Map();
  for (const conv of sidechainConversations) {
    if (conv.type === "user" && conv.parentUuid === null && typeof conv.message.content === "string") {
      promptToRoot.set(conv.message.content, conv);
    }
  }
  const agentIdToRoot = /* @__PURE__ */ new Map();
  for (const conv of sidechainConversations) {
    if (conv.parentUuid === null && conv.agentId !== void 0) {
      agentIdToRoot.set(conv.agentId, conv);
    }
  }
  const toolUseIdToAgentId = /* @__PURE__ */ new Map();
  for (const conv of conversations) {
    if (conv.type === "summary" || conv.type === "file-history-snapshot" || conv.type === "queue-operation" || conv.type === "progress") {
      continue;
    }
    if (conv.type !== "user") continue;
    const messageContent = conv.message.content;
    if (typeof messageContent === "string") continue;
    for (const content of messageContent) {
      if (typeof content === "string") continue;
      if (content.type === "tool_result") {
        const toolUseResult = conv.toolUseResult;
        if (hasAgentId(toolUseResult)) {
          toolUseIdToAgentId.set(content.tool_use_id, toolUseResult.agentId);
        }
      }
    }
  }
  return { groupsByRootUuid, promptToRoot, agentIdToRoot, toolUseIdToAgentId };
};
var renderSidechainEntry = (entry, toolResultMap, sidechainData) => {
  if (entry.type === "user") {
    const contentArray = Array.isArray(entry.message.content) ? entry.message.content : [entry.message.content];
    const contentHtml = contentArray.map((msg) => {
      if (typeof msg === "string") {
        return `<div class="markdown-content">${renderMarkdown(msg)}</div>`;
      }
      if (msg.type === "text") {
        return `<div class="markdown-content">${renderMarkdown(msg.text)}</div>`;
      }
      if (msg.type === "tool_result") {
        return "";
      }
      return "";
    }).join("");
    if (!contentHtml.trim()) return "";
    return `
      <div class="sidechain-entry sidechain-user-entry">
        <div class="sidechain-entry-header">
          <span class="sidechain-role">User</span>
          <span class="sidechain-timestamp">${formatTimestamp(entry.timestamp)}</span>
        </div>
        <div class="sidechain-entry-content">${contentHtml}</div>
      </div>
    `;
  }
  if (entry.type === "assistant") {
    const contentHtml = entry.message.content.map((msg) => {
      if (msg.type === "text") {
        return `<div class="markdown-content">${renderMarkdown(msg.text)}</div>`;
      }
      if (msg.type === "thinking") {
        const charCount = msg.thinking.length;
        return `
            <div class="thinking-block collapsible collapsed">
              <div class="thinking-header collapsible-trigger">
                <svg class="icon-lightbulb" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v1m0 18v1m9-10h1M2 12H1m17.66-7.66l.71.71M3.63 20.37l.71.71m0-14.14l-.71.71m17.02 12.73l-.71.71M12 7a5 5 0 0 1 5 5 5 5 0 0 1-1.47 3.53c-.6.6-.94 1.42-.94 2.27V18a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-.2c0-.85-.34-1.67-.94-2.27A5 5 0 0 1 7 12a5 5 0 0 1 5-5Z"/>
                </svg>
                <span class="thinking-title">Thinking</span>
                <span class="expand-hint">(${charCount} chars)</span>
                <svg class="icon-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="thinking-content collapsible-content">
                <pre class="thinking-text">${escapeHtml(msg.thinking)}</pre>
              </div>
            </div>
          `;
      }
      if (msg.type === "tool_use") {
        const toolResult = toolResultMap.get(msg.id);
        if (msg.name === "Task") {
          return renderTaskTool(
            msg.id,
            msg.input,
            toolResult,
            sidechainData,
            toolResultMap
          );
        }
        const inputKeys = Object.keys(msg.input).length;
        const toolResultHtml = toolResult ? renderToolResultContent(toolResult) : "";
        return `
            <div class="tool-use-block collapsible collapsed">
              <div class="tool-use-header collapsible-trigger">
                <svg class="icon-wrench" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <span class="tool-name">${escapeHtml(msg.name)}</span>
                <span class="expand-hint">(${inputKeys} params)</span>
                <svg class="icon-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="tool-use-content collapsible-content">
                <div class="tool-id"><strong>Tool ID:</strong> <code>${escapeHtml(msg.id)}</code></div>
                <div class="tool-input">
                  <strong>Input:</strong>
                  <pre class="json-input">${escapeHtml(formatJsonWithNewlines(msg.input))}</pre>
                </div>
                ${toolResultHtml}
              </div>
            </div>
          `;
      }
      return "";
    }).join("");
    return `
      <div class="sidechain-entry sidechain-assistant-entry">
        <div class="sidechain-entry-header">
          <span class="sidechain-role">Subagent</span>
          <span class="sidechain-timestamp">${formatTimestamp(entry.timestamp)}</span>
        </div>
        <div class="sidechain-entry-content">${contentHtml}</div>
      </div>
    `;
  }
  if (entry.type === "system") {
    const content = "content" in entry && typeof entry.content === "string" ? entry.content : "System message";
    return `
      <div class="sidechain-entry sidechain-system-entry">
        <div class="sidechain-entry-header">
          <span class="sidechain-role">System</span>
          <span class="sidechain-timestamp">${formatTimestamp(entry.timestamp)}</span>
        </div>
        <div class="sidechain-entry-content">
          <div class="system-message">${escapeHtml(content)}</div>
        </div>
      </div>
    `;
  }
  return "";
};
var renderTaskTool = (toolId, input, toolResult, sidechainData, toolResultMap) => {
  const prompt = typeof input.prompt === "string" ? input.prompt : "";
  const truncatedPrompt = prompt.length > 200 ? `${prompt.slice(0, 200)}...` : prompt;
  let sidechainConversations = [];
  const agentId = sidechainData.toolUseIdToAgentId.get(toolId);
  if (agentId) {
    const rootByAgentId = sidechainData.agentIdToRoot.get(agentId);
    if (rootByAgentId) {
      const convs = sidechainData.groupsByRootUuid.get(rootByAgentId.uuid);
      if (convs) {
        sidechainConversations = convs;
      }
    }
  }
  if (sidechainConversations.length === 0) {
    const rootConversation = sidechainData.promptToRoot.get(prompt);
    if (rootConversation) {
      const convs = sidechainData.groupsByRootUuid.get(rootConversation.uuid);
      if (convs) {
        sidechainConversations = convs;
      }
    }
  }
  const hasSidechain = sidechainConversations.length > 0;
  const sidechainHtml = hasSidechain ? `
      <div class="sidechain-container collapsible">
        <div class="sidechain-header collapsible-trigger">
          <svg class="icon-layers" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          <span>Subagent Work Log (${sidechainConversations.length} entries)</span>
          <svg class="icon-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="sidechain-content collapsible-content">
          ${sidechainConversations.map(
    (conv) => renderSidechainEntry(conv, toolResultMap, sidechainData)
  ).filter((html) => html !== "").join("\n")}
        </div>
      </div>
    ` : "";
  return `
    <div class="task-tool-block collapsible">
      <div class="task-tool-header collapsible-trigger">
        <svg class="icon-task" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span class="task-tool-name">Task${hasSidechain ? ` (${sidechainConversations.length} steps)` : ""}</span>
        <span class="task-prompt-preview">${escapeHtml(truncatedPrompt)}</span>
        <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="task-tool-content collapsible-content">
        <div class="task-tool-id"><strong>Task ID:</strong> <code>${escapeHtml(toolId)}</code></div>
        <div class="task-prompt">
          <strong>Prompt:</strong>
          <div class="task-prompt-text">${renderMarkdown(prompt)}</div>
        </div>
        ${toolResult ? renderToolResultContent(toolResult) : ""}
        ${sidechainHtml}
      </div>
    </div>
  `;
};
var renderAssistantEntry = (entry, toolResultMap, sidechainData) => {
  const contentHtml = entry.message.content.map((msg) => {
    if (msg.type === "text") {
      return `<div class="markdown-content">${renderMarkdown(msg.text)}</div>`;
    }
    if (msg.type === "thinking") {
      const charCount = msg.thinking.length;
      return `
          <div class="thinking-block collapsible">
            <div class="thinking-header collapsible-trigger">
              <svg class="icon-lightbulb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v1m0 18v1m9-10h1M2 12H1m17.66-7.66l.71.71M3.63 20.37l.71.71m0-14.14l-.71.71m17.02 12.73l-.71.71M12 7a5 5 0 0 1 5 5 5 5 0 0 1-1.47 3.53c-.6.6-.94 1.42-.94 2.27V18a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-.2c0-.85-.34-1.67-.94-2.27A5 5 0 0 1 7 12a5 5 0 0 1 5-5Z"/>
              </svg>
              <span class="thinking-title">Thinking</span>
              <span class="expand-hint">(${charCount} characters \xB7 click to collapse)</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="thinking-content collapsible-content">
              <pre class="thinking-text">${escapeHtml(msg.thinking)}</pre>
            </div>
          </div>
        `;
    }
    if (msg.type === "tool_use") {
      const toolResult = toolResultMap.get(msg.id);
      if (msg.name === "Task") {
        return renderTaskTool(
          msg.id,
          msg.input,
          toolResult,
          sidechainData,
          toolResultMap
        );
      }
      const inputKeys = Object.keys(msg.input).length;
      const toolResultHtml = toolResult ? renderToolResultContent(toolResult) : "";
      return `
          <div class="tool-use-block collapsible">
            <div class="tool-use-header collapsible-trigger">
              <svg class="icon-wrench" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <span class="tool-name">${escapeHtml(msg.name)}</span>
              <span class="expand-hint">(${inputKeys} parameter${inputKeys !== 1 ? "s" : ""} \xB7 click to collapse)</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="tool-use-content collapsible-content">
              <div class="tool-id"><strong>Tool ID:</strong> <code>${escapeHtml(msg.id)}</code></div>
              <div class="tool-input">
                <strong>Input Parameters:</strong>
                <pre class="json-input">${escapeHtml(formatJsonWithNewlines(msg.input))}</pre>
              </div>
              ${toolResultHtml}
            </div>
          </div>
        `;
    }
    return "";
  }).join("");
  return `
    <div class="conversation-entry assistant-entry">
      <div class="entry-header">
        <span class="entry-role">Assistant</span>
        <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
      </div>
      <div class="entry-content">
        ${contentHtml}
      </div>
    </div>
  `;
};
var getSystemEntryContent = (entry) => {
  if ("content" in entry && typeof entry.content === "string") {
    return entry.content;
  }
  if ("subtype" in entry && entry.subtype === "stop_hook_summary") {
    const hookNames = entry.hookInfos.map((h) => h.command).join(", ");
    return `Stop hook executed: ${hookNames}`;
  }
  return "System message";
};
var renderSystemEntry = (entry) => {
  const content = getSystemEntryContent(entry);
  return `
    <div class="conversation-entry system-entry">
      <div class="entry-header">
        <span class="entry-role">System</span>
        <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
      </div>
      <div class="entry-content">
        <div class="system-message">${escapeHtml(content)}</div>
      </div>
    </div>
  `;
};
var groupConsecutiveAssistantMessages = (conversations) => {
  const grouped = [];
  let currentGroup = [];
  for (const conv of conversations) {
    if (conv.type === "assistant") {
      currentGroup.push(conv);
    } else if (conv.type === "user" || conv.type === "system") {
      if (currentGroup.length > 0) {
        grouped.push({
          type: currentGroup.length > 1 ? "grouped" : "single",
          entries: currentGroup
        });
        currentGroup = [];
      }
      grouped.push({ type: "single", entries: [conv] });
    }
  }
  if (currentGroup.length > 0) {
    grouped.push({
      type: currentGroup.length > 1 ? "grouped" : "single",
      entries: currentGroup
    });
  }
  return grouped;
};
var renderGroupedAssistantEntries = (entries, toolResultMap, sidechainData) => {
  const allContent = entries.flatMap((entry) => entry.message.content);
  const firstEntry = entries[0];
  if (!firstEntry) {
    return "";
  }
  const contentHtml = allContent.map((msg) => {
    if (msg.type === "text") {
      return `<div class="markdown-content">${renderMarkdown(msg.text)}</div>`;
    }
    if (msg.type === "thinking") {
      const charCount = msg.thinking.length;
      return `
          <div class="thinking-block collapsible">
            <div class="thinking-header collapsible-trigger">
              <svg class="icon-lightbulb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v1m0 18v1m9-10h1M2 12H1m17.66-7.66l.71.71M3.63 20.37l.71.71m0-14.14l-.71.71m17.02 12.73l-.71.71M12 7a5 5 0 0 1 5 5 5 5 0 0 1-1.47 3.53c-.6.6-.94 1.42-.94 2.27V18a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-.2c0-.85-.34-1.67-.94-2.27A5 5 0 0 1 7 12a5 5 0 0 1 5-5Z"/>
              </svg>
              <span class="thinking-title">Thinking</span>
              <span class="expand-hint">(${charCount} characters \xB7 click to collapse)</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="thinking-content collapsible-content">
              <pre class="thinking-text">${escapeHtml(msg.thinking)}</pre>
            </div>
          </div>
        `;
    }
    if (msg.type === "tool_use") {
      const toolResult = toolResultMap.get(msg.id);
      if (msg.name === "Task") {
        return renderTaskTool(
          msg.id,
          msg.input,
          toolResult,
          sidechainData,
          toolResultMap
        );
      }
      const inputKeys = Object.keys(msg.input).length;
      const toolResultHtml = toolResult ? renderToolResultContent(toolResult) : "";
      return `
          <div class="tool-use-block collapsible">
            <div class="tool-use-header collapsible-trigger">
              <svg class="icon-wrench" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <span class="tool-name">${escapeHtml(msg.name)}</span>
              <span class="expand-hint">(${inputKeys} parameter${inputKeys !== 1 ? "s" : ""} \xB7 click to collapse)</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="tool-use-content collapsible-content">
              <div class="tool-id"><strong>Tool ID:</strong> <code>${escapeHtml(msg.id)}</code></div>
              <div class="tool-input">
                <strong>Input Parameters:</strong>
                <pre class="json-input">${escapeHtml(formatJsonWithNewlines(msg.input))}</pre>
              </div>
              ${toolResultHtml}
            </div>
          </div>
        `;
    }
    return "";
  }).join("");
  return `
    <div class="conversation-entry assistant-entry">
      <div class="entry-header">
        <span class="entry-role">Assistant</span>
        <span class="entry-timestamp">${formatTimestamp(firstEntry.timestamp)}</span>
      </div>
      <div class="entry-content">
        ${contentHtml}
      </div>
    </div>
  `;
};
var generateSessionHtml = (session, projectId, agentSessionRepo) => Effect56.gen(function* () {
  const agentIds = /* @__PURE__ */ new Set();
  for (const conv of session.conversations) {
    if (conv.type !== "user" || typeof conv.message.content === "string") {
      continue;
    }
    for (const content of conv.message.content) {
      if (typeof content === "string") continue;
      if (content.type === "tool_result") {
        const toolUseResult = conv.toolUseResult;
        if (hasAgentId(toolUseResult)) {
          agentIds.add(toolUseResult.agentId);
        }
      }
    }
  }
  const existingAgentIds = /* @__PURE__ */ new Set();
  for (const conv of session.conversations) {
    if (conv.type === "x-error") continue;
    if (conv.type !== "summary" && conv.type !== "file-history-snapshot" && conv.type !== "queue-operation" && conv.type !== "progress" && conv.isSidechain === true && conv.agentId !== void 0) {
      existingAgentIds.add(conv.agentId);
    }
  }
  const missingAgentIds = Array.from(agentIds).filter(
    (id) => !existingAgentIds.has(id)
  );
  const loadedConversations = [];
  if (missingAgentIds.length > 0) {
    const loadedSessions = yield* Effect56.all(
      missingAgentIds.map(
        (agentId) => agentSessionRepo.getAgentSessionByAgentId(
          projectId,
          agentId,
          session.id
        )
      ),
      { concurrency: 5 }
    );
    for (const sess of loadedSessions) {
      if (sess) {
        const validConvs = sess.filter(
          (c) => c.type === "user" || c.type === "assistant" || c.type === "system"
        );
        loadedConversations.push(
          ...validConvs.map((c) => ({
            ...c,
            isSidechain: true
            // Ensure they are marked as sidechain
          }))
        );
      }
    }
  }
  const allConversations = [
    ...session.conversations.filter(
      (conv) => conv.type !== "x-error"
    ),
    ...loadedConversations
  ];
  const sidechainData = buildSidechainData(allConversations);
  const toolResultMap = /* @__PURE__ */ new Map();
  for (const conv of allConversations) {
    if (conv.type === "summary" || conv.type === "file-history-snapshot" || conv.type === "queue-operation" || conv.type === "progress") {
      continue;
    }
    if (conv.type !== "user") continue;
    const content = conv.message.content;
    if (typeof content === "string") continue;
    for (const msg of content) {
      if (typeof msg === "string") continue;
      if (msg.type === "tool_result") {
        toolResultMap.set(msg.tool_use_id, msg);
      }
    }
  }
  const grouped = groupConsecutiveAssistantMessages(session.conversations);
  const conversationsHtml = grouped.map((group) => {
    if (group.type === "grouped") {
      return renderGroupedAssistantEntries(
        group.entries,
        toolResultMap,
        sidechainData
      );
    }
    const conv = group.entries[0];
    if (!conv) {
      return "";
    }
    if (conv.type === "user") {
      return renderUserEntry(conv);
    }
    if (conv.type === "assistant") {
      return renderAssistantEntry(conv, toolResultMap, sidechainData);
    }
    if (conv.type === "system") {
      return renderSystemEntry(conv);
    }
    return "";
  }).filter((html2) => html2 !== "").join("\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Session - ${escapeHtml(session.id)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;
      --muted: 0 0% 96.1%;
      --muted-foreground: 0 0% 45.1%;
      --border: 0 0% 89.8%;
      --primary: 0 0% 9%;
      --blue-50: 214 100% 97%;
      --blue-200: 213 97% 87%;
      --blue-600: 217 91% 60%;
      --blue-800: 217 91% 35%;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: hsl(var(--foreground));
      background: hsl(var(--background));
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 1px solid hsl(var(--border));
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .header .metadata {
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }

    .conversation-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .conversation-entry {
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-bottom: 1px solid;
    }

    .entry-timestamp {
      color: hsl(var(--muted-foreground));
      font-size: 0.75rem;
    }

    .entry-content {
      padding: 1.5rem;
    }

    /* User entry styles */
    .user-entry {
      background: hsl(var(--muted) / 0.3);
      border: 1px solid hsl(var(--border));
    }

    .user-entry .entry-header {
      background: hsl(var(--muted) / 0.5);
      border-bottom-color: hsl(var(--border));
    }

    /* Assistant entry styles */
    .assistant-entry {
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
    }

    .assistant-entry .entry-header {
      background: hsl(var(--muted) / 0.3);
      border-bottom-color: hsl(var(--border));
    }

    /* System entry styles */
    .system-entry {
      background: hsl(var(--muted) / 0.2);
      border: 1px dashed hsl(var(--border));
    }

    .system-entry .entry-header {
      background: hsl(var(--muted) / 0.4);
      border-bottom-color: hsl(var(--border));
    }

    .system-message {
      font-family: monospace;
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
    }

    /* Markdown styles */
    .markdown-content {
      width: 100%;
      margin: 1rem 0.25rem;
    }

    .markdown-h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      margin-top: 2rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid hsl(var(--border));
    }

    .markdown-h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      margin-top: 2rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid hsl(var(--border) / 0.5);
    }

    .markdown-h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      margin-top: 1.5rem;
    }

    .markdown-p {
      margin-bottom: 1rem;
      line-height: 1.75;
      word-break: break-word;
    }

    .inline-code {
      background: hsl(var(--muted) / 0.7);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-family: monospace;
      border: 1px solid hsl(var(--border));
    }

    .code-block {
      position: relative;
      margin: 1.5rem 0;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: hsl(var(--muted) / 0.3);
      padding: 0.5rem 1rem;
      border-bottom: 1px solid hsl(var(--border));
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      border: 1px solid hsl(var(--border));
      border-bottom: none;
    }

    .code-lang {
      font-size: 0.75rem;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .code-block pre {
      margin: 0;
      padding: 1rem;
      background: hsl(var(--muted) / 0.2);
      border: 1px solid hsl(var(--border));
      border-top: none;
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      overflow-x: auto;
    }

    .code-block code {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Thinking block styles */
    .thinking-block {
      background: hsl(var(--muted) / 0.5);
      border: 2px dashed hsl(var(--border));
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    .thinking-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      background: hsl(var(--muted) / 0.3);
      transition: background 0.2s;
    }

    .thinking-header:hover {
      background: hsl(var(--muted) / 0.5);
    }

    .icon-lightbulb {
      color: hsl(var(--muted-foreground));
      flex-shrink: 0;
    }

    .thinking-title {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .expand-hint {
      font-size: 0.75rem;
      color: hsl(var(--muted-foreground));
      font-weight: normal;
      margin-left: 0.5rem;
    }

    .collapsible:not(.collapsed) .expand-hint {
      display: none;
    }

    .icon-chevron {
      margin-left: auto;
      color: hsl(var(--muted-foreground));
      transition: transform 0.2s;
    }

    .collapsible.collapsed .icon-chevron {
      transform: rotate(-90deg);
    }

    .thinking-content {
      padding: 0.5rem 1rem;
    }

    .collapsible-content {
      overflow: hidden;
      transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
    }

    .collapsible.collapsed .collapsible-content {
      max-height: 0;
      opacity: 0;
    }

    .thinking-text {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Tool use block styles */
    .tool-use-block {
      border: 1px solid hsl(var(--blue-200));
      background: hsl(var(--blue-50) / 0.5);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    .tool-use-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      background: hsl(var(--blue-50) / 0.3);
      transition: background 0.2s;
    }

    .tool-use-header:hover {
      background: hsl(var(--blue-50) / 0.6);
    }

    .icon-wrench {
      color: hsl(var(--blue-600));
      flex-shrink: 0;
    }

    .tool-name {
      font-size: 0.875rem;
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tool-use-content {
      padding: 0.75rem 1rem;
      border-top: 1px solid hsl(var(--blue-200));
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tool-id {
      font-size: 0.75rem;
    }

    .tool-id code {
      background: hsl(var(--background) / 0.5);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid hsl(var(--blue-200));
      font-family: monospace;
      font-size: 0.75rem;
    }

    .tool-input {
      font-size: 0.75rem;
    }

    .json-input {
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: 0.375rem;
      padding: 0.75rem;
      margin-top: 0.5rem;
      overflow-x: auto;
      font-family: monospace;
      font-size: 0.75rem;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: break-word;
    }

    .message-image {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    strong {
      font-weight: 600;
    }

    em {
      font-style: italic;
    }

    a {
      color: hsl(var(--primary));
      text-decoration: underline;
      text-decoration-color: hsl(var(--primary) / 0.3);
      text-underline-offset: 4px;
      transition: text-decoration-color 0.2s;
    }

    a:hover {
      text-decoration-color: hsl(var(--primary) / 0.6);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .toggle-all-button {
      padding: 0.5rem 1rem;
      background: hsl(var(--primary));
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .toggle-all-button:hover {
      opacity: 0.9;
    }

    .toggle-all-button:active {
      opacity: 0.8;
    }

    .footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid hsl(var(--border));
      text-align: center;
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }

    /* Enhanced Markdown Styles */
    .markdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.875rem;
    }

    .markdown-table th,
    .markdown-table td {
      border: 1px solid hsl(var(--border));
      padding: 0.5rem 0.75rem;
      text-align: left;
    }

    .markdown-table th {
      background: hsl(var(--muted) / 0.5);
      font-weight: 600;
    }

    .markdown-table tr:nth-child(even) {
      background: hsl(var(--muted) / 0.2);
    }

    .markdown-blockquote {
      border-left: 4px solid hsl(var(--blue-600));
      padding: 0.75rem 1rem;
      margin: 1rem 0;
      background: hsl(var(--muted) / 0.3);
      color: hsl(var(--muted-foreground));
      font-style: italic;
    }

    .markdown-ul,
    .markdown-ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .markdown-ul li,
    .markdown-ol li {
      margin-bottom: 0.25rem;
      line-height: 1.6;
    }

    .markdown-task-list {
      list-style: none;
      padding-left: 0;
      margin: 1rem 0;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .task-checkbox {
      margin-top: 0.25rem;
      width: 1rem;
      height: 1rem;
      accent-color: hsl(var(--blue-600));
    }

    .markdown-hr {
      border: none;
      border-top: 2px solid hsl(var(--border));
      margin: 2rem 0;
    }

    .markdown-del {
      text-decoration: line-through;
      color: hsl(var(--muted-foreground));
    }

    /* Tool Result Styles */
    .tool-result-block {
      margin-top: 0.75rem;
      border: 1px solid hsl(var(--border));
      border-radius: 0.375rem;
      overflow: scroll;
    }

    .tool-result-error {
      border-color: hsl(0 84% 60%);
    }

    .tool-result-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: hsl(var(--muted) / 0.3);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tool-result-error .tool-result-header {
      background: hsl(0 84% 60% / 0.1);
      color: hsl(0 84% 40%);
    }

    .icon-check {
      flex-shrink: 0;
      color: hsl(142 76% 36%);
    }

    .tool-result-error .icon-check {
      color: hsl(0 84% 60%);
    }

    .tool-result-label {
      font-weight: 500;
    }

    .tool-result-content {
      padding: 0.75rem;
      background: hsl(var(--background));
    }

    .tool-result-text {
      font-family: monospace;
      font-size: 0.75rem;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: break-word;
      margin: 0;
    }

    .tool-result-image {
      max-width: 100%;
      height: auto;
      border-radius: 0.25rem;
    }

    /* Task Tool Styles */
    .task-tool-block {
      border: 1px solid hsl(142 76% 36% / 0.3);
      background: hsl(142 76% 36% / 0.05);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    .task-tool-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      background: hsl(142 76% 36% / 0.1);
      transition: background 0.2s;
    }

    .task-tool-header:hover {
      background: hsl(142 76% 36% / 0.15);
    }

    .icon-task {
      color: hsl(142 76% 36%);
      flex-shrink: 0;
    }

    .task-tool-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: hsl(142 76% 30%);
    }

    .task-prompt-preview {
      flex: 1;
      font-size: 0.75rem;
      color: hsl(var(--muted-foreground));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .task-tool-content {
      padding: 0.75rem 1rem;
      border-top: 1px solid hsl(142 76% 36% / 0.2);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .task-tool-id {
      font-size: 0.75rem;
    }

    .task-tool-id code {
      background: hsl(var(--background) / 0.5);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid hsl(142 76% 36% / 0.2);
      font-family: monospace;
      font-size: 0.75rem;
    }

    .task-prompt {
      font-size: 0.875rem;
    }

    .task-prompt-text {
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: 0.375rem;
      padding: 0.75rem;
      margin-top: 0.5rem;
    }

    /* Sidechain / Subagent Styles */
    .sidechain-container {
      margin-top: 1rem;
      border: 1px solid hsl(217 91% 60% / 0.3);
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .sidechain-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: hsl(217 91% 60% / 0.1);
      color: hsl(217 91% 40%);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
    }

    .sidechain-header:hover {
      background: hsl(217 91% 60% / 0.15);
    }

    .icon-layers {
      flex-shrink: 0;
    }

    .sidechain-content {
      padding: 0.75rem;
      background: hsl(217 91% 60% / 0.02);
      border-top: 1px solid hsl(217 91% 60% / 0.2);
    }

    .sidechain-entry {
      margin-left: 1rem;
      padding: 0.5rem 0.75rem;
      border-left: 2px solid hsl(217 91% 60% / 0.3);
      margin-bottom: 0.5rem;
    }

    .sidechain-entry:last-child {
      margin-bottom: 0;
    }

    .sidechain-entry-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
    }

    .sidechain-role {
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }

    .sidechain-user-entry .sidechain-role {
      background: hsl(var(--muted));
      color: hsl(var(--foreground));
    }

    .sidechain-assistant-entry .sidechain-role {
      background: hsl(217 91% 60% / 0.1);
      color: hsl(217 91% 40%);
    }

    .sidechain-system-entry .sidechain-role {
      background: hsl(var(--muted) / 0.5);
      color: hsl(var(--muted-foreground));
    }

    .sidechain-timestamp {
      color: hsl(var(--muted-foreground));
    }

    .sidechain-entry-content {
      font-size: 0.875rem;
    }

    .sidechain-entry .thinking-block,
    .sidechain-entry .tool-use-block {
      margin: 0.5rem 0;
      font-size: 0.8rem;
    }

    .sidechain-entry .thinking-header,
    .sidechain-entry .tool-use-header {
      padding: 0.375rem 0.5rem;
    }

    .sidechain-entry .thinking-content,
    .sidechain-entry .tool-use-content {
      padding: 0.5rem;
    }

    /* Optimize content display */
    .entry-content > *:first-child {
      margin-top: 0;
    }

    .entry-content > *:last-child {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <h1>Claude Code Session Export</h1>
      <button id="toggle-all-btn" class="toggle-all-button">Collapse All</button>
    </div>
    <div class="metadata">
      <div><strong>Session ID:</strong> ${escapeHtml(session.id)}</div>
      <div><strong>Project ID:</strong> ${escapeHtml(projectId)}</div>
      <div><strong>Exported:</strong> ${formatTimestamp(Date.now())}</div>
      <div><strong>Total Conversations:</strong> ${session.conversations.length}</div>
    </div>
  </div>

  <div class="conversation-list">
    ${conversationsHtml}
  </div>

  <div class="footer">
    <p>Exported from SpecForge Viewer</p>
  </div>

  <script>
    // Add click handlers for collapsible blocks
    document.addEventListener('DOMContentLoaded', function() {
      const triggers = document.querySelectorAll('.collapsible-trigger');
      const toggleAllBtn = document.getElementById('toggle-all-btn');
      let allExpanded = true; // Start as expanded since blocks are expanded by default

      // Individual collapsible click handlers
      triggers.forEach(function(trigger) {
        trigger.addEventListener('click', function() {
          const collapsible = this.closest('.collapsible');
          if (collapsible) {
            collapsible.classList.toggle('collapsed');
          }
        });
      });

      // Toggle all button
      if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', function() {
          const collapsibles = document.querySelectorAll('.collapsible');

          if (allExpanded) {
            // Collapse all
            collapsibles.forEach(function(collapsible) {
              collapsible.classList.add('collapsed');
            });
            toggleAllBtn.textContent = 'Expand All';
            allExpanded = false;
          } else {
            // Expand all
            collapsibles.forEach(function(collapsible) {
              collapsible.classList.remove('collapsed');
            });
            toggleAllBtn.textContent = 'Collapse All';
            allExpanded = true;
          }
        });
      }
    });
  </script>
</body>
</html>`;
  return html;
});

// src/server/core/session/presentation/SessionController.ts
var LayerImpl36 = Effect57.gen(function* () {
  const sessionRepository = yield* SessionRepository;
  const agentSessionRepository = yield* AgentSessionRepository;
  const fs = yield* FileSystem27.FileSystem;
  const eventBus = yield* EventBus;
  const getSession = (options) => Effect57.gen(function* () {
    const { projectId, sessionId } = options;
    const { session } = yield* sessionRepository.getSession(
      projectId,
      sessionId
    );
    return {
      status: 200,
      response: { session }
    };
  });
  const exportSessionHtml = (options) => Effect57.gen(function* () {
    const { projectId, sessionId } = options;
    const { session } = yield* sessionRepository.getSession(
      projectId,
      sessionId
    );
    if (session === null) {
      return {
        status: 404,
        response: { error: "Session not found" }
      };
    }
    const html = yield* generateSessionHtml(
      session,
      projectId,
      agentSessionRepository
    );
    return {
      status: 200,
      response: { html }
    };
  });
  const deleteSession = (options) => Effect57.gen(function* () {
    const { projectId, sessionId } = options;
    const sessionPath = decodeSessionId(projectId, sessionId);
    const exists = yield* fs.exists(sessionPath);
    if (!exists) {
      return {
        status: 404,
        response: { error: "Session not found" }
      };
    }
    const deleteResult = yield* fs.remove(sessionPath).pipe(
      Effect57.map(() => ({ success: true, error: null })),
      Effect57.catchAll(
        (error) => Effect57.succeed({
          success: false,
          error: `Failed to delete session: ${error.message}`
        })
      )
    );
    if (!deleteResult.success) {
      return {
        status: 500,
        response: { error: deleteResult.error }
      };
    }
    yield* eventBus.emit("sessionListChanged", { projectId });
    return {
      status: 200,
      response: { success: true }
    };
  });
  return {
    getSession,
    exportSessionHtml,
    deleteSession
  };
});
var SessionController = class extends Context43.Tag("SessionController")() {
  static {
    this.Live = Layer45.effect(this, LayerImpl36);
  }
};

// src/server/core/tasks/presentation/TasksController.ts
import { Context as Context45, Effect as Effect59, Layer as Layer47 } from "effect";

// src/server/core/tasks/services/TasksService.ts
import { homedir as homedir4 } from "node:os";
import { join } from "node:path";
import { FileSystem as FileSystem28, Path as Path30 } from "@effect/platform";
import { Context as Context44, Effect as Effect58, Layer as Layer46, Option as Option5 } from "effect";

// src/server/core/tasks/schema.ts
import { z as z27 } from "zod";
var TaskStatusSchema = z27.enum([
  "pending",
  "in_progress",
  "completed",
  "failed"
]);
var TaskSchema = z27.object({
  id: z27.string(),
  subject: z27.string(),
  description: z27.string().optional(),
  status: TaskStatusSchema,
  owner: z27.string().optional(),
  blocks: z27.array(z27.string()).optional(),
  blockedBy: z27.array(z27.string()).optional(),
  metadata: z27.record(z27.string(), z27.any()).optional(),
  activeForm: z27.string().optional()
});
var TaskCreateSchema = z27.object({
  subject: z27.string(),
  description: z27.string().optional(),
  activeForm: z27.string().optional(),
  metadata: z27.record(z27.string(), z27.any()).optional()
});
var TaskUpdateSchema = z27.object({
  taskId: z27.string(),
  status: TaskStatusSchema.optional(),
  subject: z27.string().optional(),
  description: z27.string().optional(),
  activeForm: z27.string().optional(),
  owner: z27.string().optional(),
  addBlockedBy: z27.array(z27.string()).optional(),
  addBlocks: z27.array(z27.string()).optional(),
  metadata: z27.record(z27.string(), z27.any()).optional()
});

// src/server/core/tasks/services/TasksService.ts
var TASKS_DIR_NAME = "tasks";
var PROJECTS_DIR_NAME = "projects";
var CLAUDE_DIR_NAME = ".claude";
var TasksService = class extends Context44.Tag("TasksService")() {
  static {
    this.Live = Layer46.effect(
      this,
      Effect58.gen(function* () {
        const fs = yield* FileSystem28.FileSystem;
        const path = yield* Path30.Path;
        const getClaudeDir = () => Effect58.succeed(join(homedir4(), CLAUDE_DIR_NAME));
        const normalizeProjectPath = (projectPath) => {
          const normalized = projectPath.replaceAll(path.sep, "-");
          return normalized.startsWith("-") ? normalized : `-${normalized}`;
        };
        const resolveProjectUuid = (projectPath, specificSessionId) => Effect58.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          if (specificSessionId) {
            const sessionTasksDir = path.join(
              claudeDir,
              TASKS_DIR_NAME,
              specificSessionId
            );
            if (yield* fs.exists(sessionTasksDir)) {
              return Option5.some(specificSessionId);
            }
            return Option5.none();
          }
          const isMetadataPath = projectPath.includes(join(CLAUDE_DIR_NAME, PROJECTS_DIR_NAME)) && projectPath.split(path.sep).pop()?.startsWith("-");
          let projectMetaDir;
          if (isMetadataPath && (yield* fs.exists(projectPath))) {
            projectMetaDir = projectPath;
          } else {
            const identifier = normalizeProjectPath(projectPath);
            projectMetaDir = path.join(
              claudeDir,
              PROJECTS_DIR_NAME,
              identifier
            );
          }
          const exists = yield* fs.exists(projectMetaDir);
          if (!exists) {
            return Option5.none();
          }
          const files = yield* fs.readDirectory(projectMetaDir);
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
          const candidates = files.filter((f) => uuidPattern.test(f));
          if (candidates.length === 0) {
            return Option5.none();
          }
          const candidateInfo = yield* Effect58.all(
            candidates.map(
              (file) => Effect58.gen(function* () {
                const fullPath = path.join(projectMetaDir, file);
                const stat = yield* fs.stat(fullPath);
                const match = file.match(uuidPattern);
                const uuid = match ? match[0] : file;
                const tasksPath = path.join(claudeDir, TASKS_DIR_NAME, uuid);
                const hasTasks = yield* fs.exists(tasksPath);
                return {
                  file,
                  uuid,
                  mtime: Option5.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date(0)),
                  hasTasks
                };
              })
            ),
            { concurrency: "unbounded" }
          );
          const sorted = candidateInfo.sort((a, b) => {
            if (a.hasTasks && !b.hasTasks) return -1;
            if (!a.hasTasks && b.hasTasks) return 1;
            return b.mtime.getTime() - a.mtime.getTime();
          });
          const best = sorted[0];
          if (!best) {
            return Option5.none();
          }
          return Option5.some(best.uuid);
        });
        const resolveProjectUuidOrFail = (projectPath, specificSessionId) => Effect58.gen(function* () {
          const uuidOption = yield* resolveProjectUuid(
            projectPath,
            specificSessionId
          );
          if (Option5.isNone(uuidOption)) {
            if (specificSessionId) {
              return yield* Effect58.fail(
                new Error(
                  `Requested session ${specificSessionId} has no tasks directory`
                )
              );
            }
            const claudeDir = yield* getClaudeDir();
            const identifier = normalizeProjectPath(projectPath);
            const projectMetaDir = path.join(
              claudeDir,
              PROJECTS_DIR_NAME,
              identifier
            );
            return yield* Effect58.fail(
              new Error(
                `Project metadata directory not found or no UUID: ${projectMetaDir}`
              )
            );
          }
          return uuidOption.value;
        });
        const getTasksDir = (projectPath, specificSessionId) => Effect58.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          const uuidOption = yield* resolveProjectUuid(
            projectPath,
            specificSessionId
          );
          return Option5.map(
            uuidOption,
            (uuid) => path.join(claudeDir, TASKS_DIR_NAME, uuid)
          );
        });
        const getTasksDirOrFail = (projectPath, specificSessionId) => Effect58.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          const uuid = yield* resolveProjectUuidOrFail(
            projectPath,
            specificSessionId
          );
          return path.join(claudeDir, TASKS_DIR_NAME, uuid);
        });
        const listTasks = (projectPath, specificSessionId) => Effect58.gen(function* () {
          if (!specificSessionId) {
            return [];
          }
          const tasksDirOption = yield* getTasksDir(
            projectPath,
            specificSessionId
          );
          if (Option5.isNone(tasksDirOption)) {
            return [];
          }
          const tasksDir = tasksDirOption.value;
          const exists = yield* fs.exists(tasksDir);
          if (!exists) {
            return [];
          }
          const files = yield* fs.readDirectory(tasksDir);
          const tasks = [];
          for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const content = yield* fs.readFileString(path.join(tasksDir, file));
            try {
              const task = JSON.parse(content);
              const parsed = TaskSchema.safeParse(task);
              if (parsed.success) {
                tasks.push(parsed.data);
              } else {
                console.warn(`Invalid task file ${file}:`, parsed.error);
                const fallbackTask = {
                  id: typeof task === "object" && task !== null && "id" in task && typeof task.id === "string" ? task.id : file.replace(".json", ""),
                  subject: typeof task === "object" && task !== null && "subject" in task && typeof task.subject === "string" ? task.subject : typeof task === "object" && task !== null && "title" in task && typeof task.title === "string" ? task.title : "Invalid Task Schema",
                  description: `Validation Error: ${JSON.stringify(parsed.error.format())}. Raw: ${JSON.stringify(task)}`,
                  status: typeof task === "object" && task !== null && "status" in task && typeof task.status === "string" && (task.status === "pending" || task.status === "in_progress" || task.status === "completed" || task.status === "failed") ? task.status : "failed",
                  blocks: [],
                  blockedBy: []
                };
                tasks.push(fallbackTask);
              }
            } catch (e) {
              console.error(`Failed to parse task file ${file}`, e);
              const fallbackTask = {
                id: file.replace(".json", ""),
                subject: "Corrupted Task File",
                description: String(e),
                status: "failed",
                blocks: [],
                blockedBy: []
              };
              tasks.push(fallbackTask);
            }
          }
          return tasks.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
        });
        const getTask = (projectPath, taskId, specificSessionId) => Effect58.gen(function* () {
          const tasksDir = yield* getTasksDirOrFail(
            projectPath,
            specificSessionId
          );
          const taskFile = path.join(tasksDir, `${taskId}.json`);
          const exists = yield* fs.exists(taskFile);
          if (!exists) {
            return yield* Effect58.fail(new Error(`Task ${taskId} not found`));
          }
          const content = yield* fs.readFileString(taskFile);
          const task = JSON.parse(content);
          return yield* Effect58.try(() => TaskSchema.parse(task));
        });
        const createTask = (projectPath, taskDef, specificSessionId) => Effect58.gen(function* () {
          const tasksDir = yield* getTasksDirOrFail(
            projectPath,
            specificSessionId
          );
          const dirExists = yield* fs.exists(tasksDir);
          if (!dirExists) {
            yield* fs.makeDirectory(tasksDir, { recursive: true });
          }
          const files = yield* fs.readDirectory(tasksDir);
          let maxId = 0;
          for (const file of files) {
            if (file.endsWith(".json")) {
              const idPart = file.replace(".json", "");
              const idNum = parseInt(idPart, 10);
              if (!Number.isNaN(idNum) && idNum > maxId) {
                maxId = idNum;
              }
            }
          }
          const newId = (maxId + 1).toString();
          const newTask = {
            id: newId,
            status: "pending",
            blocks: [],
            blockedBy: [],
            ...taskDef
          };
          const filePath = path.join(tasksDir, `${newId}.json`);
          yield* fs.writeFileString(filePath, JSON.stringify(newTask, null, 2));
          return newTask;
        });
        const updateTask = (projectPath, update, specificSessionId) => Effect58.gen(function* () {
          const tasksDir = yield* getTasksDirOrFail(
            projectPath,
            specificSessionId
          );
          const filePath = path.join(tasksDir, `${update.taskId}.json`);
          const exists = yield* fs.exists(filePath);
          if (!exists) {
            return yield* Effect58.fail(
              new Error(`Task ${update.taskId} not found`)
            );
          }
          const content = yield* fs.readFileString(filePath);
          const currentTask = TaskSchema.parse(JSON.parse(content));
          const updatedTask = {
            ...currentTask,
            // User cannot update status via Viewer, it is managed by Claude Agent
            status: currentTask.status,
            subject: update.subject ?? currentTask.subject,
            description: update.description ?? currentTask.description,
            activeForm: update.activeForm ?? currentTask.activeForm,
            owner: update.owner ?? currentTask.owner,
            blockedBy: update.addBlockedBy ? [...currentTask.blockedBy || [], ...update.addBlockedBy] : currentTask.blockedBy,
            blocks: update.addBlocks ? [...currentTask.blocks || [], ...update.addBlocks] : currentTask.blocks,
            metadata: update.metadata ? { ...currentTask.metadata, ...update.metadata } : currentTask.metadata
          };
          if (updatedTask.metadata) {
            for (const key in updatedTask.metadata) {
              if (updatedTask.metadata[key] === null) {
                delete updatedTask.metadata[key];
              }
            }
          }
          yield* fs.writeFileString(
            filePath,
            JSON.stringify(updatedTask, null, 2)
          );
          return updatedTask;
        });
        return {
          listTasks,
          getTask,
          createTask,
          updateTask
        };
      })
    );
  }
};

// src/server/core/tasks/presentation/TasksController.ts
var make = Effect59.gen(function* () {
  const service = yield* TasksService;
  const listTasks = (projectPath, specificSessionId) => service.listTasks(projectPath, specificSessionId);
  const createTask = (projectPath, task, specificSessionId) => service.createTask(projectPath, task, specificSessionId);
  const updateTask = (projectPath, task, specificSessionId) => service.updateTask(projectPath, task, specificSessionId);
  return {
    listTasks,
    createTask,
    updateTask
  };
});
var TasksController = class extends Context45.Tag("TasksController")() {
  static {
    this.Live = Layer47.effect(this, make);
  }
};

// src/server/hono/app.ts
import { Hono } from "hono";
var honoApp = new Hono();

// src/server/hono/initialize.ts
import { Context as Context46, Effect as Effect60, Layer as Layer48, Ref as Ref14, Schedule as Schedule2 } from "effect";
var InitializeService = class extends Context46.Tag("InitializeService")() {
  static {
    this.Live = Layer48.effect(
      this,
      Effect60.gen(function* () {
        const eventBus = yield* EventBus;
        const fileWatcher = yield* FileWatcherService;
        const projectRepository = yield* ProjectRepository;
        const sessionRepository = yield* SessionRepository;
        const projectMetaService = yield* ProjectMetaService;
        const sessionMetaService = yield* SessionMetaService;
        const virtualConversationDatabase = yield* VirtualConversationDatabase;
        const rateLimitAutoScheduleService = yield* RateLimitAutoScheduleService;
        const listenersRef = yield* Ref14.make({});
        const startInitialization = () => {
          return Effect60.gen(function* () {
            yield* fileWatcher.startWatching();
            yield* rateLimitAutoScheduleService.start();
            const daemon = Effect60.repeat(
              eventBus.emit("heartbeat", {}),
              Schedule2.fixed("10 seconds")
            );
            console.log("start heartbeat");
            yield* Effect60.forkDaemon(daemon);
            console.log("after starting heartbeat fork");
            const onSessionChanged = (event) => {
              Effect60.runFork(
                projectMetaService.invalidateProject(event.projectId)
              );
              Effect60.runFork(
                sessionMetaService.invalidateSession(
                  event.projectId,
                  event.sessionId
                )
              );
            };
            const onSessionProcessChanged = (event) => {
              if ((event.changed.type === "completed" || event.changed.type === "paused") && event.changed.sessionId !== void 0) {
                Effect60.runFork(
                  virtualConversationDatabase.deleteVirtualConversations(
                    event.changed.sessionId
                  )
                );
                return;
              }
            };
            yield* Ref14.set(listenersRef, {
              sessionChanged: onSessionChanged,
              sessionProcessChanged: onSessionProcessChanged
            });
            yield* eventBus.on("sessionChanged", onSessionChanged);
            yield* eventBus.on("sessionProcessChanged", onSessionProcessChanged);
            yield* Effect60.gen(function* () {
              console.log("Initializing projects cache");
              const { projects } = yield* projectRepository.getProjects();
              console.log(`${projects.length} projects cache initialized`);
              console.log("Initializing sessions cache");
              const results = yield* Effect60.all(
                projects.map(
                  (project) => sessionRepository.getSessions(project.id)
                ),
                { concurrency: "unbounded" }
              );
              const totalSessions = results.reduce(
                (s, { sessions }) => s + sessions.length,
                0
              );
              console.log(`${totalSessions} sessions cache initialized`);
            }).pipe(
              Effect60.catchAll(() => Effect60.void),
              Effect60.withSpan("initialize-cache")
            );
          }).pipe(Effect60.withSpan("start-initialization"));
        };
        const stopCleanup = () => Effect60.gen(function* () {
          const listeners = yield* Ref14.get(listenersRef);
          if (listeners.sessionChanged) {
            yield* eventBus.off("sessionChanged", listeners.sessionChanged);
          }
          if (listeners.sessionProcessChanged) {
            yield* eventBus.off(
              "sessionProcessChanged",
              listeners.sessionProcessChanged
            );
          }
          yield* Ref14.set(listenersRef, {});
          yield* rateLimitAutoScheduleService.stop();
          yield* fileWatcher.stop();
        });
        return {
          startInitialization,
          stopCleanup
        };
      })
    );
  }
};

// src/server/hono/middleware/auth.middleware.ts
import { Context as Context47, Effect as Effect61, Layer as Layer49 } from "effect";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
var generateSessionToken = (password) => {
  if (!password) return "";
  return Buffer.from(`ccv-session:${password}`).toString("base64");
};
var PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/check",
  "/api/auth/logout",
  "/api/config",
  // Allow config access for theme/locale loading
  "/api/version"
];
var LayerImpl37 = Effect61.gen(function* () {
  const ccvOptionsService = yield* CcvOptionsService;
  return Effect61.gen(function* () {
    const anthPassword = yield* ccvOptionsService.getCcvOptions("password");
    const authEnabled = anthPassword !== void 0;
    const validSessionToken = generateSessionToken(anthPassword);
    const authMiddleware = createMiddleware(async (c, next) => {
      if (PUBLIC_API_ROUTES.includes(c.req.path)) {
        return next();
      }
      if (!c.req.path.startsWith("/api")) {
        return next();
      }
      if (!authEnabled) {
        return next();
      }
      const sessionToken = getCookie(c, "ccv-session");
      if (!sessionToken || sessionToken !== validSessionToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      await next();
    });
    return {
      authEnabled,
      anthPassword,
      validSessionToken,
      authMiddleware
    };
  });
});
var AuthMiddleware = class extends Context47.Tag("AuthMiddleware")() {
  static {
    this.Live = Layer49.effect(this, LayerImpl37);
  }
};

// src/server/hono/route.ts
import { zValidator } from "@hono/zod-validator";
import { Effect as Effect63, Runtime as Runtime3 } from "effect";
import { deleteCookie, getCookie as getCookie3, setCookie as setCookie2 } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import prexit from "prexit";
import { z as z32 } from "zod";

// src/server/core/claude-code/schema.ts
import { z as z28 } from "zod";
var mediaTypeSchema = z28.enum([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp"
]);
var imageBlockSchema = z28.object({
  type: z28.literal("image"),
  source: z28.object({
    type: z28.literal("base64"),
    media_type: mediaTypeSchema,
    data: z28.string()
  })
});
var documentBlockSchema = z28.object({
  type: z28.literal("document"),
  source: z28.union([
    z28.object({
      type: z28.literal("text"),
      media_type: z28.enum(["text/plain"]),
      data: z28.string()
    }),
    z28.object({
      type: z28.literal("base64"),
      media_type: z28.enum(["application/pdf"]),
      data: z28.string()
    })
  ])
});
var userMessageInputSchema = z28.object({
  text: z28.string().min(1),
  images: z28.array(imageBlockSchema).optional(),
  documents: z28.array(documentBlockSchema).optional()
});

// src/server/core/git/schema.ts
import { z as z29 } from "zod";
var CommitRequestSchema = z29.object({
  projectId: z29.string().min(1),
  files: z29.array(z29.string().min(1)).min(1),
  message: z29.string().trim().min(1)
});
var PushRequestSchema = z29.object({
  projectId: z29.string().min(1)
});
var CommitResultSuccessSchema = z29.object({
  success: z29.literal(true),
  commitSha: z29.string().length(40),
  filesCommitted: z29.number().int().positive(),
  message: z29.string()
});
var CommitResultErrorSchema = z29.object({
  success: z29.literal(false),
  error: z29.string(),
  errorCode: z29.enum([
    "EMPTY_MESSAGE",
    "NO_FILES",
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "HOOK_FAILED",
    "GIT_COMMAND_ERROR"
  ]),
  details: z29.string().optional()
});
var CommitResultSchema = z29.discriminatedUnion("success", [
  CommitResultSuccessSchema,
  CommitResultErrorSchema
]);
var PushResultSuccessSchema = z29.object({
  success: z29.literal(true),
  remote: z29.string(),
  branch: z29.string(),
  objectsPushed: z29.number().int().optional()
});
var PushResultErrorSchema = z29.object({
  success: z29.literal(false),
  error: z29.string(),
  errorCode: z29.enum([
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "NO_UPSTREAM",
    "NON_FAST_FORWARD",
    "AUTH_FAILED",
    "NETWORK_ERROR",
    "TIMEOUT",
    "GIT_COMMAND_ERROR"
  ]),
  details: z29.string().optional()
});
var PushResultSchema = z29.discriminatedUnion("success", [
  PushResultSuccessSchema,
  PushResultErrorSchema
]);
var CommitAndPushResultSuccessSchema = z29.object({
  success: z29.literal(true),
  commitSha: z29.string().length(40),
  filesCommitted: z29.number().int().positive(),
  message: z29.string(),
  remote: z29.string(),
  branch: z29.string()
});
var CommitAndPushResultErrorSchema = z29.object({
  success: z29.literal(false),
  commitSucceeded: z29.boolean(),
  commitSha: z29.string().length(40).optional(),
  error: z29.string(),
  errorCode: z29.enum([
    "EMPTY_MESSAGE",
    "NO_FILES",
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "HOOK_FAILED",
    "GIT_COMMAND_ERROR",
    "NO_UPSTREAM",
    "NON_FAST_FORWARD",
    "AUTH_FAILED",
    "NETWORK_ERROR",
    "TIMEOUT"
  ]),
  details: z29.string().optional()
});
var CommitAndPushResultSchema = z29.discriminatedUnion("success", [
  CommitAndPushResultSuccessSchema,
  CommitAndPushResultErrorSchema
]);

// src/server/lib/config/config.ts
import z31 from "zod";

// src/lib/i18n/schema.ts
import z30 from "zod";
var localeSchema = z30.enum(["en", "zh_CN"]);

// src/server/lib/config/config.ts
var userConfigSchema = z31.object({
  hideNoUserMessageSession: z31.boolean().optional().default(true),
  unifySameTitleSession: z31.boolean().optional().default(false),
  enterKeyBehavior: z31.enum(["shift-enter-send", "enter-send", "command-enter-send"]).optional().default("shift-enter-send"),
  permissionMode: z31.enum(["acceptEdits", "bypassPermissions", "default", "plan"]).optional().default("default"),
  locale: localeSchema.optional().default("en"),
  theme: z31.enum(["light", "dark", "system"]).optional().default("system"),
  searchHotkey: z31.enum(["ctrl-k", "command-k"]).optional().default("command-k"),
  autoScheduleContinueOnRateLimit: z31.boolean().optional().default(false)
});
var defaultUserConfig = userConfigSchema.parse({});

// src/server/lib/effect/toEffectResponse.ts
import { Effect as Effect62 } from "effect";
var effectToResponse = async (ctx, effect) => {
  const result = await Effect62.runPromise(effect);
  const result2 = ctx.json(result.response, result.status);
  return result2;
};

// src/server/hono/middleware/config.middleware.ts
import { getCookie as getCookie2, setCookie } from "hono/cookie";
import { createMiddleware as createMiddleware2 } from "hono/factory";

// src/server/lib/config/parseUserConfig.ts
var parseUserConfig = (configJson) => {
  const parsed = (() => {
    try {
      return userConfigSchema.parse(JSON.parse(configJson ?? "{}"));
    } catch {
      return userConfigSchema.parse({});
    }
  })();
  return parsed;
};

// src/server/hono/middleware/config.middleware.ts
var configMiddleware = createMiddleware2(
  async (c, next) => {
    const cookie = getCookie2(c, "ccv-config");
    const parsed = parseUserConfig(cookie);
    if (cookie === void 0) {
      const preferredLocale = detectLocaleFromAcceptLanguage(c.req.header("accept-language")) ?? DEFAULT_LOCALE;
      setCookie(
        c,
        "ccv-config",
        JSON.stringify({
          ...defaultUserConfig,
          locale: preferredLocale
        })
      );
    }
    c.set("userConfig", parsed);
    await next();
  }
);

// src/server/hono/route.ts
var routes = (app, options) => Effect63.gen(function* () {
  const ccvOptionsService = yield* CcvOptionsService;
  yield* ccvOptionsService.loadCliOptions(options);
  const envService = yield* EnvService;
  const userConfigService = yield* UserConfigService;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const initializeService = yield* InitializeService;
  const projectController = yield* ProjectController;
  const sessionController = yield* SessionController;
  const agentSessionController = yield* AgentSessionController;
  const gitController = yield* GitController;
  const claudeCodeSessionProcessController = yield* ClaudeCodeSessionProcessController;
  const claudeCodePermissionController = yield* ClaudeCodePermissionController;
  const sseController = yield* SSEController;
  const fileSystemController = yield* FileSystemController;
  const claudeCodeController = yield* ClaudeCodeController;
  const schedulerController = yield* SchedulerController;
  const featureFlagController = yield* FeatureFlagController;
  const searchController = yield* SearchController;
  const tasksController = yield* TasksController;
  const openSpecController = yield* OpenSpecController;
  const authMiddlewareService = yield* AuthMiddleware;
  const { authMiddleware, validSessionToken, authEnabled, anthPassword } = yield* authMiddlewareService;
  const runtime = yield* Effect63.runtime();
  if ((yield* envService.getEnv("NEXT_PHASE")) !== "phase-production-build") {
    yield* initializeService.startInitialization();
    prexit(async () => {
      await Runtime3.runPromise(runtime)(initializeService.stopCleanup());
    });
  }
  return app.use(configMiddleware).use(authMiddleware).use(async (c, next) => {
    await Effect63.runPromise(
      userConfigService.setUserConfig({
        ...c.get("userConfig")
      })
    );
    await next();
  }).post(
    "/api/auth/login",
    zValidator("json", z32.object({ password: z32.string() })),
    async (c) => {
      const { password } = c.req.valid("json");
      if (!authEnabled) {
        return c.json(
          {
            error: "Authentication not configured. Set CLAUDE_CODE_VIEWER_AUTH_PASSWORD environment variable."
          },
          500
        );
      }
      if (password !== anthPassword) {
        return c.json({ error: "Invalid password" }, 401);
      }
      setCookie2(c, "ccv-session", validSessionToken, {
        httpOnly: true,
        secure: false,
        // Set to true in production with HTTPS
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
        // 7 days
      });
      return c.json({ success: true });
    }
  ).post("/api/auth/logout", async (c) => {
    deleteCookie(c, "ccv-session", { path: "/" });
    return c.json({ success: true });
  }).get("/api/auth/check", async (c) => {
    const sessionToken = getCookie3(c, "ccv-session");
    const isAuthenticated = authEnabled ? sessionToken === validSessionToken : true;
    return c.json({ authenticated: isAuthenticated, authEnabled });
  }).get("/api/projects/:projectId/openspec/changes", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getChangesRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/archive", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getArchivedChangesRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/openspec/changes/:changeId",
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.getChangeDetailsRoute({
          projectId: c.req.param("projectId"),
          changeId: c.req.param("changeId")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/changes/:changeId/file",
    zValidator(
      "json",
      z32.object({
        fileName: z32.string(),
        content: z32.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.updateFileRoute({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/openspec/environment", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getEnvironmentRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/profile-config", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getProjectProfileRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/profiles", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getProfilesRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).post(
    "/api/projects/:projectId/openspec/initialize",
    zValidator(
      "json",
      z32.object({
        scenario: z32.enum([
          "S1_NEW",
          "S2_OPENSPEC_ONLY",
          "S3_CLAUDE_ONLY",
          "S4_BOTH_NON_SPECFORGE",
          "S5_CONFIGURED",
          "S6_PARTIAL"
        ]),
        force: z32.boolean().optional(),
        profile: z32.object({
          displayName: z32.string(),
          infra_catalog: z32.object({
            mcp_server_providers: z32.record(
              z32.string(),
              z32.object({
                type: z32.enum(["http", "sse", "stdio"]),
                url: z32.string().optional(),
                command: z32.string().optional(),
                args: z32.array(z32.string()).optional()
              })
            ),
            mcp_tool_definitions: z32.object({
              overview: z32.object({
                description: z32.string(),
                tools: z32.array(z32.string())
              }),
              search: z32.object({
                description: z32.string(),
                tools: z32.array(z32.string())
              }),
              specifications: z32.object({
                description: z32.string(),
                tools: z32.array(z32.string())
              })
            }),
            skills: z32.array(z32.string()).optional(),
            develop_skills: z32.object({
              description: z32.string(),
              gitUrl: z32.string().optional(),
              skills: z32.array(z32.string())
            }).optional(),
            code_examples: z32.object({
              examples: z32.array(
                z32.object({
                  name: z32.string(),
                  description: z32.string().optional(),
                  paths: z32.array(z32.string())
                })
              )
            }).optional()
          })
        })
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.initializeRoute({
          projectId: c.req.param("projectId"),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/install-cli/global",
    zValidator(
      "json",
      z32.object({
        initialize: z32.boolean().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.installCliGlobalRoute({
          projectId: c.req.param("projectId"),
          initialize: c.req.valid("json").initialize
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/install-cli/project",
    zValidator(
      "json",
      z32.object({
        initialize: z32.boolean().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.installCliProjectRoute({
          projectId: c.req.param("projectId"),
          initialize: c.req.valid("json").initialize
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post("/api/projects/:projectId/openspec/run-init", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.runOpenspecInitRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/config", async (c) => {
    return c.json({
      config: c.get("userConfig")
    });
  }).put("/api/config", zValidator("json", userConfigSchema), async (c) => {
    const { ...config } = c.req.valid("json");
    setCookie2(c, "ccv-config", JSON.stringify(config));
    return c.json({
      config
    });
  }).get("/api/version", async (c) => {
    return c.json({
      version: package_default.version
    });
  }).get("/api/projects", async (c) => {
    const response = await effectToResponse(
      c,
      projectController.getProjects()
    );
    return response;
  }).get(
    "/api/projects/:projectId",
    zValidator("query", z32.object({ cursor: z32.string().optional() })),
    async (c) => {
      const response = await effectToResponse(
        c,
        projectController.getProject({
          ...c.req.param(),
          ...c.req.valid("query")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects",
    zValidator(
      "json",
      z32.object({
        projectPath: z32.string().min(1, "Project path is required")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        projectController.createProject({
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/latest-session", async (c) => {
    const response = await effectToResponse(
      c,
      projectController.getProjectLatestSession({
        ...c.req.param()
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/sessions/:sessionId", async (c) => {
    const response = await effectToResponse(
      c,
      sessionController.getSession({ ...c.req.param() }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/sessions/:sessionId/export",
    async (c) => {
      const response = await effectToResponse(
        c,
        sessionController.exportSessionHtml({ ...c.req.param() }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).delete("/api/projects/:projectId/sessions/:sessionId", async (c) => {
    const response = await effectToResponse(
      c,
      sessionController.deleteSession({ ...c.req.param() }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/agent-sessions/:agentId",
    zValidator("query", z32.object({ sessionId: z32.string().optional() })),
    async (c) => {
      const { projectId, agentId } = c.req.param();
      const { sessionId } = c.req.valid("query");
      const response = await effectToResponse(
        c,
        agentSessionController.getAgentSession({
          projectId,
          agentId,
          sessionId
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/git/current-revisions", async (c) => {
    const response = await effectToResponse(
      c,
      gitController.getCurrentRevisions({
        ...c.req.param()
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).post(
    "/api/projects/:projectId/git/diff",
    zValidator(
      "json",
      z32.object({
        fromRef: z32.string().min(1, "fromRef is required"),
        toRef: z32.string().min(1, "toRef is required")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        gitController.getGitDiff({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/git/commit",
    zValidator("json", CommitRequestSchema),
    async (c) => {
      const response = await effectToResponse(
        c,
        gitController.commitFiles({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/git/push",
    zValidator("json", PushRequestSchema),
    async (c) => {
      const response = await effectToResponse(
        c,
        gitController.pushCommits({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/git/commit-and-push",
    zValidator("json", CommitRequestSchema),
    async (c) => {
      const response = await effectToResponse(
        c,
        gitController.commitAndPush({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/claude-commands", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getClaudeCommands({
        ...c.req.param()
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/mcp/list", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getMcpListRoute({
        ...c.req.param()
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/cc/meta", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getClaudeCodeMeta().pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/cc/features", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getAvailableFeatures().pipe(Effect63.provide(runtime))
    );
    return response;
  }).get("/api/cc/session-processes", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeSessionProcessController.getSessionProcesses()
    );
    return response;
  }).post(
    "/api/cc/session-processes",
    zValidator(
      "json",
      z32.object({
        projectId: z32.string(),
        input: userMessageInputSchema,
        baseSessionId: z32.string().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeSessionProcessController.createSessionProcess(
          c.req.valid("json")
        )
      );
      return response;
    }
  ).post(
    "/api/cc/session-processes/:sessionProcessId/continue",
    zValidator(
      "json",
      z32.object({
        projectId: z32.string(),
        input: userMessageInputSchema,
        baseSessionId: z32.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeSessionProcessController.continueSessionProcess({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/cc/session-processes/:sessionProcessId/abort",
    zValidator("json", z32.object({ projectId: z32.string() })),
    async (c) => {
      const { sessionProcessId } = c.req.param();
      await Runtime3.runPromise(runtime)(
        claudeCodeLifeCycleService.abortTask(sessionProcessId)
      );
      return c.json({ message: "Task aborted" });
    }
  ).post(
    "/api/cc/permission-response",
    zValidator(
      "json",
      z32.object({
        permissionRequestId: z32.string(),
        decision: z32.enum(["allow", "deny"])
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodePermissionController.permissionResponse({
          permissionResponse: c.req.valid("json")
        })
      );
      return response;
    }
  ).get("/api/sse", async (c) => {
    return streamSSE(
      c,
      async (rawStream) => {
        await Runtime3.runPromise(runtime)(
          sseController.handleSSE(rawStream).pipe(Effect63.provide(TypeSafeSSE.make(rawStream)))
        );
      },
      async (err) => {
        console.error("Streaming error:", err);
      }
    );
  }).get("/api/scheduler/jobs", async (c) => {
    const response = await effectToResponse(
      c,
      schedulerController.getJobs().pipe(Effect63.provide(runtime))
    );
    return response;
  }).post(
    "/api/scheduler/jobs",
    zValidator("json", newSchedulerJobSchema),
    async (c) => {
      const response = await effectToResponse(
        c,
        schedulerController.addJob({
          job: c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).patch(
    "/api/scheduler/jobs/:id",
    zValidator("json", updateSchedulerJobSchema),
    async (c) => {
      const response = await effectToResponse(
        c,
        schedulerController.updateJob({
          id: c.req.param("id"),
          job: c.req.valid("json")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).delete("/api/scheduler/jobs/:id", async (c) => {
    const response = await effectToResponse(
      c,
      schedulerController.deleteJob({
        id: c.req.param("id")
      }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/fs/file-completion",
    zValidator(
      "query",
      z32.object({
        projectId: z32.string(),
        basePath: z32.string().optional().default("/api/")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        fileSystemController.getFileCompletionRoute({
          ...c.req.valid("query")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get(
    "/api/fs/directory-browser",
    zValidator(
      "query",
      z32.object({
        currentPath: z32.string().optional(),
        showHidden: z32.string().optional().transform((val) => val === "true")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        fileSystemController.getDirectoryListingRoute({
          ...c.req.valid("query")
        }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get(
    "/api/search",
    zValidator(
      "query",
      z32.object({
        q: z32.string().min(2),
        limit: z32.string().optional().transform((val) => val ? parseInt(val, 10) : void 0),
        projectId: z32.string().optional()
      })
    ),
    async (c) => {
      const { q, limit, projectId } = c.req.valid("query");
      const response = await effectToResponse(
        c,
        searchController.search({ query: q, limit, projectId }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  ).get("/api/flags", async (c) => {
    const response = await effectToResponse(
      c,
      featureFlagController.getFlags().pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/tasks",
    zValidator(
      "query",
      z32.object({
        projectId: z32.string(),
        sessionId: z32.string().optional()
      })
    ),
    async (c) => {
      const { projectId, sessionId } = c.req.valid("query");
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        tasksController.listTasks(projectPath, sessionId).pipe(
          Effect63.map((tasks) => ({
            status: 200,
            response: tasks
          })),
          Effect63.provide(runtime)
        )
      );
      return response;
    }
  ).post(
    "/api/tasks",
    zValidator(
      "query",
      z32.object({
        projectId: z32.string(),
        sessionId: z32.string().optional()
      })
    ),
    zValidator("json", TaskCreateSchema),
    async (c) => {
      const { projectId, sessionId } = c.req.valid("query");
      const body = c.req.valid("json");
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        tasksController.createTask(projectPath, body, sessionId).pipe(
          Effect63.map((task) => ({
            status: 200,
            response: task
          })),
          Effect63.provide(runtime)
        )
      );
      return response;
    }
  ).patch(
    "/api/tasks/:id",
    zValidator(
      "query",
      z32.object({
        projectId: z32.string(),
        sessionId: z32.string().optional()
      })
    ),
    zValidator("json", TaskUpdateSchema.omit({ taskId: true })),
    async (c) => {
      const { id } = c.req.param();
      const { projectId, sessionId } = c.req.valid("query");
      const body = c.req.valid("json");
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        tasksController.updateTask(projectPath, { ...body, taskId: id }, sessionId).pipe(
          Effect63.map((task) => ({
            status: 200,
            response: task
          })),
          Effect63.provide(runtime)
        )
      );
      return response;
    }
  ).get("/api/projects/:projectId/openspec/changes", async (c) => {
    const { projectId } = c.req.param();
    const projectPath = decodeProjectId(projectId);
    const response = await effectToResponse(
      c,
      openSpecController.getChangesRoute({ projectId: projectPath }).pipe(Effect63.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/openspec/changes/:changeId",
    async (c) => {
      const { projectId, changeId } = c.req.param();
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        openSpecController.getChangeDetailsRoute({ projectId: projectPath, changeId }).pipe(Effect63.provide(runtime))
      );
      return response;
    }
  );
});

// src/server/lib/effect/layers.ts
import { NodeContext } from "@effect/platform-node";
import { Layer as Layer50 } from "effect";
var platformLayer = Layer50.mergeAll(
  ApplicationContext.Live,
  UserConfigService.Live,
  EventBus.Live,
  EnvService.Live,
  CcvOptionsService.Live
).pipe(
  Layer50.provide(EnvService.Live),
  Layer50.provide(CcvOptionsService.Live),
  Layer50.provide(NodeContext.layer)
);

// src/server/startServer.ts
var startServer = async (options) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  if (!isDevelopment) {
    const staticPath = resolve3(import.meta.dirname, "static");
    console.log("Serving static files from ", staticPath);
    honoApp.use(
      "/assets/*",
      serveStatic({
        root: staticPath
      })
    );
    honoApp.use("*", async (c, next) => {
      if (c.req.path.startsWith("/api")) {
        return next();
      }
      const html = await readFile(resolve3(staticPath, "index.html"), "utf-8");
      return c.html(html);
    });
  }
  const program2 = routes(honoApp, options).pipe(Effect64.provide(MainLayer));
  await Effect64.runPromise(program2);
  const port = isDevelopment ? (
    // biome-ignore lint/style/noProcessEnv: allow only here
    process.env.DEV_BE_PORT ?? "3401"
  ) : (
    // biome-ignore lint/style/noProcessEnv: allow only here
    options.port ?? process.env.PORT ?? "3000"
  );
  const hostname = options.hostname ?? process.env.HOSTNAME ?? "localhost";
  serve(
    {
      fetch: honoApp.fetch,
      port: parseInt(port, 10),
      hostname
    },
    (info) => {
      console.log(`Server is running on http://${hostname}:${info.port}`);
    }
  );
};
var PlatformLayer = Layer51.mergeAll(platformLayer, NodeContext2.layer);
var InfraBasics = Layer51.mergeAll(
  VirtualConversationDatabase.Live,
  ProjectMetaService.Live,
  SessionMetaService.Live
);
var InfraRepos = Layer51.mergeAll(
  ProjectRepository.Live,
  SessionRepository.Live
).pipe(Layer51.provideMerge(InfraBasics));
var InfraLayer = AgentSessionLayer.pipe(Layer51.provideMerge(InfraRepos));
var DomainBase = Layer51.mergeAll(
  ClaudeCodePermissionService.Live,
  ClaudeCodeSessionProcessService.Live,
  ClaudeCodeService.Live,
  GitService.Live,
  SchedulerService.Live,
  SchedulerConfigBaseDir.Live,
  SearchService.Live,
  SearchService.Live,
  TasksService.Live,
  OpenSpecService.Live
);
var OpenSpecEnvBase = Layer51.mergeAll(
  OpenSpecEnvironmentService.Live,
  ProfileConfigService.Live,
  TemplateProcessor.Live,
  SkillManagerService.Live
);
var OpenSpecEnvLayer = TemplateInjectionService.Live.pipe(
  Layer51.provideMerge(OpenSpecEnvBase)
);
var DomainLayer = ClaudeCodeLifeCycleService.Live.pipe(
  Layer51.provideMerge(DomainBase),
  Layer51.provideMerge(OpenSpecEnvLayer),
  Layer51.provideMerge(CliDetectionServiceLive)
);
var AppServices = Layer51.mergeAll(
  FileWatcherService.Live,
  RateLimitAutoScheduleService.Live,
  AuthMiddleware.Live
);
var ApplicationLayer = InitializeService.Live.pipe(
  Layer51.provideMerge(AppServices)
);
var PresentationLayer = Layer51.mergeAll(
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
  OpenSpecController.Live
);
var MainLayer = PresentationLayer.pipe(
  Layer51.provideMerge(ApplicationLayer),
  Layer51.provideMerge(DomainLayer),
  Layer51.provideMerge(InfraLayer),
  Layer51.provideMerge(PlatformLayer)
);

// src/server/main.ts
var program = new Command7();
program.name(package_default.name).version(package_default.version).description(package_default.description);
program.option("-p, --port <port>", "port to listen on").option("-h, --hostname <hostname>", "hostname to listen on").option("-P, --password <password>", "password to authenticate").option("-e, --executable <executable>", "path to claude code executable").option("--claude-dir <claude-dir>", "path to claude directory").action(async (options) => {
  await Effect65.runPromise(checkDeprecatedEnvs);
  await startServer(options);
});
var main = async () => {
  program.parse(process.argv);
};
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
//# sourceMappingURL=main.js.map
