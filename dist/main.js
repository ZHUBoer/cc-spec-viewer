#!/usr/bin/env node

// src/server/main.ts
import { Command as Command9 } from "commander";
import { Effect as Effect72 } from "effect";

// package.json
var package_default = {
  name: "@ctrip/spec-forge",
  version: "3.2.47",
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
    "verify:static-assets": "node ./scripts/verify-static-assets.mjs",
    lint: "run-s 'lint:*'",
    "lint:biome-format": "biome format .",
    "lint:biome-lint": "biome check .",
    "check:template-version": "node ./scripts/check-template-version-bump.mjs",
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
    "@anthropic-ai/claude-agent-sdk": "0.2.81",
    "@anthropic-ai/claude-code": "2.1.81",
    "@anthropic-ai/sdk": "0.80.0",
    "@ctrip/feishu2md-node": "^0.9.0",
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
    chokidar: "^5.0.0",
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
    sucrase: "^3.35.1",
    "tailwind-merge": "3.4.0",
    ulid: "3.0.2",
    yaml: "^2.8.2",
    zod: "4.3.6",
    typescript: "5.9.3"
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
import { FileSystem as FileSystem33, Path as Path36 } from "@effect/platform";
import { NodeContext as NodeContext3 } from "@effect/platform-node";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Effect as Effect71, Layer as Layer56 } from "effect";

// src/server/core/agent-session/index.ts
import { Layer as Layer3 } from "effect";

// src/server/core/agent-session/infrastructure/AgentSessionRepository.ts
import { FileSystem, Path } from "@effect/platform";
import { Context, Effect as Effect2, Layer } from "effect";

// src/lib/conversation-schema/index.ts
import { z as z18 } from "zod";

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
  stop_reason: z6.string().nullable().optional(),
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

// src/lib/conversation-schema/entry/LastPromptEntrySchema.ts
import { z as z10 } from "zod";
var LastPromptEntrySchema = z10.object({
  type: z10.literal("last-prompt"),
  lastPrompt: z10.string(),
  sessionId: z10.string()
});

// src/lib/conversation-schema/entry/ProgressEntrySchema.ts
import { z as z11 } from "zod";
var ProgressEntrySchema = BaseEntrySchema.extend({
  // discriminator
  type: z11.literal("progress"),
  // required
  data: z11.record(z11.string(), z11.any()),
  toolUseID: z11.string().optional(),
  parentToolUseID: z11.string().optional()
});

// src/lib/conversation-schema/entry/QueueOperationEntrySchema.ts
import { z as z13 } from "zod";

// src/lib/conversation-schema/content/DocumentContentSchema.ts
import { z as z12 } from "zod";
var DocumentContentSchema = z12.object({
  type: z12.literal("document"),
  source: z12.union([
    z12.object({
      media_type: z12.literal("text/plain"),
      type: z12.literal("text"),
      data: z12.string()
    }),
    z12.object({
      media_type: z12.enum(["application/pdf"]),
      type: z12.literal("base64"),
      data: z12.string()
    })
  ])
});

// src/lib/conversation-schema/entry/QueueOperationEntrySchema.ts
var QueueOperationContentSchema = z13.union([
  z13.string(),
  TextContentSchema,
  ToolResultContentSchema,
  ImageContentSchema,
  DocumentContentSchema
]);
var QueueOperationEntrySchema = z13.union([
  z13.object({
    type: z13.literal("queue-operation"),
    operation: z13.literal("enqueue"),
    content: z13.union([
      z13.string(),
      z13.array(z13.union([z13.string(), QueueOperationContentSchema]))
    ]),
    sessionId: z13.string(),
    timestamp: z13.iso.datetime()
  }),
  z13.object({
    type: z13.literal("queue-operation"),
    operation: z13.literal("dequeue"),
    sessionId: z13.string(),
    timestamp: z13.iso.datetime()
  }),
  z13.object({
    type: z13.literal("queue-operation"),
    operation: z13.literal("remove"),
    sessionId: z13.string(),
    timestamp: z13.iso.datetime()
  }),
  z13.object({
    type: z13.literal("queue-operation"),
    operation: z13.literal("popAll"),
    sessionId: z13.string(),
    timestamp: z13.iso.datetime(),
    content: z13.string().optional()
  })
]);

// src/lib/conversation-schema/entry/SummaryEntrySchema.ts
import { z as z14 } from "zod";
var SummaryEntrySchema = z14.object({
  type: z14.literal("summary"),
  summary: z14.string(),
  leafUuid: z14.string().uuid()
});

// src/lib/conversation-schema/entry/SystemEntrySchema.ts
import { z as z15 } from "zod";
var HookInfoSchema = z15.object({
  command: z15.string()
});
var SystemEntryWithContentSchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  content: z15.string(),
  toolUseID: z15.string(),
  level: z15.enum(["info"]),
  subtype: z15.undefined().optional()
});
var StopHookSummaryEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("stop_hook_summary"),
  toolUseID: z15.string(),
  level: z15.enum(["info", "suggestion"]),
  slug: z15.string().optional(),
  hookCount: z15.number(),
  hookInfos: z15.array(HookInfoSchema),
  hookErrors: z15.array(z15.unknown()),
  preventedContinuation: z15.boolean(),
  stopReason: z15.string(),
  hasOutput: z15.boolean()
});
var LocalCommandEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("local_command"),
  content: z15.string(),
  level: z15.enum(["info"])
});
var TurnDurationEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("turn_duration"),
  durationMs: z15.number(),
  slug: z15.string().optional()
});
var CompactBoundaryEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("compact_boundary"),
  content: z15.string(),
  level: z15.enum(["info"]),
  slug: z15.string().optional(),
  logicalParentUuid: z15.string().optional(),
  compactMetadata: z15.object({
    trigger: z15.string(),
    preTokens: z15.number()
  }).optional()
});
var ApiErrorEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("api_error"),
  level: z15.enum(["error", "warning", "info"]),
  error: z15.object({
    status: z15.number().optional(),
    headers: z15.record(z15.string(), z15.unknown()).optional(),
    requestID: z15.string().nullable().optional(),
    error: z15.object({
      type: z15.string(),
      error: z15.object({
        type: z15.string(),
        message: z15.string()
      }).optional(),
      message: z15.string().optional()
    }).optional()
  }),
  retryInMs: z15.number().optional(),
  retryAttempt: z15.number().optional(),
  maxRetries: z15.number().optional()
});
var MicrocompactBoundaryEntrySchema = BaseEntrySchema.extend({
  type: z15.literal("system"),
  subtype: z15.literal("microcompact_boundary"),
  content: z15.string(),
  level: z15.enum(["info"]),
  slug: z15.string().optional(),
  microcompactMetadata: z15.object({
    trigger: z15.string(),
    preTokens: z15.number(),
    tokensSaved: z15.number(),
    compactedToolIds: z15.array(z15.string()),
    clearedAttachmentUUIDs: z15.array(z15.string())
  }).optional()
});
var SystemEntrySchema = z15.union([
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
import { z as z17 } from "zod";

// src/lib/conversation-schema/message/UserMessageSchema.ts
import { z as z16 } from "zod";
var UserMessageContentSchema = z16.union([
  z16.string(),
  TextContentSchema,
  ToolResultContentSchema,
  ImageContentSchema,
  DocumentContentSchema
]);
var UserMessageSchema = z16.object({
  role: z16.literal("user"),
  content: z16.union([
    z16.string(),
    z16.array(z16.union([z16.string(), UserMessageContentSchema]))
  ])
});

// src/lib/conversation-schema/entry/UserEntrySchema.ts
var UserEntrySchema = BaseEntrySchema.extend({
  // discriminator
  type: z17.literal("user"),
  // required
  message: UserMessageSchema
});

// src/lib/conversation-schema/index.ts
var ConversationSchema = z18.union([
  UserEntrySchema,
  AssistantEntrySchema,
  SummaryEntrySchema,
  SystemEntrySchema,
  FileHistorySnapshotEntrySchema,
  QueueOperationEntrySchema,
  ProgressEntrySchema,
  LastPromptEntrySchema
]);

// src/server/core/claude-code/functions/parseJsonl.ts
var isRecord = (value) => typeof value === "object" && value !== null;
var toOptionalString = (value) => typeof value === "string" ? value : void 0;
var toOptionalNullableString = (value) => typeof value === "string" || value === null ? value : void 0;
var toOptionalNumber = (value) => typeof value === "number" ? value : void 0;
var toOptionalRecord = (value) => isRecord(value) ? value : void 0;
var extractNormalizedApiError = (rawError) => {
  const errorRecord = toOptionalRecord(rawError);
  const nestedErrorRaw = errorRecord?.error;
  const nestedErrorRecord = toOptionalRecord(nestedErrorRaw);
  const nestedError = nestedErrorRecord && typeof nestedErrorRecord.type === "string" && typeof nestedErrorRecord.message === "string" ? {
    type: nestedErrorRecord.type,
    message: nestedErrorRecord.message
  } : void 0;
  return {
    status: toOptionalNumber(errorRecord?.status),
    headers: toOptionalRecord(errorRecord?.headers),
    requestID: toOptionalNullableString(errorRecord?.requestID),
    error: {
      type: toOptionalString(errorRecord?.type) ?? "api_error",
      message: toOptionalString(errorRecord?.message),
      error: nestedError
    }
  };
};
var isAssistantApiErrorLike = (value) => {
  if (!isRecord(value)) {
    return false;
  }
  const message = value.message;
  const error = isRecord(message) ? message.error : void 0;
  return value.type === "assistant" && isRecord(message) && message.type === "error" && isRecord(error) && error.type === "api_error" && typeof value.isSidechain === "boolean" && value.userType === "external" && typeof value.cwd === "string" && typeof value.sessionId === "string" && typeof value.version === "string" && typeof value.uuid === "string" && typeof value.timestamp === "string" && (typeof value.parentUuid === "string" || value.parentUuid === null);
};
var normalizeAssistantApiErrorToSystem = (entry) => ({
  ...(() => {
    const normalizedError = extractNormalizedApiError(entry.message.error);
    return {
      error: {
        ...normalizedError.status !== void 0 ? { status: normalizedError.status } : {},
        ...normalizedError.headers !== void 0 ? { headers: normalizedError.headers } : {},
        ...normalizedError.requestID !== void 0 ? { requestID: normalizedError.requestID } : {},
        error: normalizedError.error
      }
    };
  })(),
  type: "system",
  subtype: "api_error",
  level: "error",
  isSidechain: entry.isSidechain,
  userType: entry.userType,
  cwd: entry.cwd,
  sessionId: entry.sessionId,
  version: entry.version,
  uuid: entry.uuid,
  timestamp: entry.timestamp,
  parentUuid: entry.parentUuid,
  ...entry.gitBranch !== void 0 ? { gitBranch: entry.gitBranch } : {}
});
var parseJsonl = (content) => {
  const lines = content.trim().split("\n").map((line) => line.trim()).filter((line) => line !== "");
  return lines.map((line, index) => {
    let raw;
    try {
      raw = JSON.parse(line);
    } catch {
      const errorData = {
        type: "x-error",
        line,
        lineNumber: index + 1
      };
      return errorData;
    }
    const normalized = isAssistantApiErrorLike(raw) ? normalizeAssistantApiErrorToSystem(raw) : raw;
    const parsed = ConversationSchema.safeParse(normalized);
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
import path from "node:path";
var encodeProjectId = (fullPath) => {
  return Buffer.from(fullPath, "utf-8").toString("base64url");
};
var decodeProjectId = (id) => {
  return Buffer.from(id, "base64url").toString("utf-8");
};
var encodeProjectIdFromSessionFilePath = (sessionFilePath) => {
  return encodeProjectId(path.dirname(sessionFilePath));
};

// src/server/core/agent-session/infrastructure/AgentSessionRepository.ts
var LayerImpl = Effect2.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path5 = yield* Path.Path;
  const getAgentSessionByAgentId = (projectId, agentId, sessionId) => Effect2.gen(function* () {
    const projectPath = decodeProjectId(projectId);
    if (sessionId) {
      const newPath = path5.resolve(
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
    const agentFilePath = path5.resolve(projectPath, `agent-${agentId}.jsonl`);
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
import { FileSystem as FileSystem9, Path as Path11 } from "@effect/platform";
import { Cause, Context as Context13, Effect as Effect19, Layer as Layer15 } from "effect";

// src/server/core/platform/services/ApplicationContext.ts
import { Path as Path2 } from "@effect/platform";
import { Effect as Effect5, Context as EffectContext, Layer as Layer5 } from "effect";

// src/server/lib/config/resolveHomeDirFromEnv.ts
import path2 from "node:path";
var resolveHomeDirFromEnv = () => {
  const homeDir = process.env.HOME?.trim();
  if (homeDir) {
    return homeDir;
  }
  const userProfile = process.env.USERPROFILE?.trim();
  if (userProfile) {
    return userProfile;
  }
  const homeDrive = process.env.HOMEDRIVE?.trim();
  const homePath = process.env.HOMEPATH?.trim();
  if (homeDrive && homePath) {
    return path2.join(homeDrive, homePath);
  }
  throw new Error(
    "Unable to resolve home directory from HOME, USERPROFILE, or HOMEDRIVE/HOMEPATH"
  );
};

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
  const path5 = yield* Path2.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const claudeCodePaths = Effect5.gen(function* () {
    const globalClaudeDirectoryPath = yield* ccvOptionsService.getCcvOptions("claudeDir").pipe(
      Effect5.map(
        (envVar) => envVar === void 0 ? path5.resolve(resolveHomeDirFromEnv(), ".claude") : path5.resolve(envVar)
      )
    );
    const paths = {
      globalClaudeDirectoryPath,
      claudeCommandsDirPath: path5.resolve(
        globalClaudeDirectoryPath,
        "commands"
      ),
      claudeSkillsDirPath: path5.resolve(globalClaudeDirectoryPath, "skills"),
      claudeProjectsDirPath: path5.resolve(
        globalClaudeDirectoryPath,
        "projects"
      )
    };
    return paths;
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
import { z as z20 } from "zod";

// src/server/lib/storage/FileCacheStorage/index.ts
import { Context as Context5, Effect as Effect7, Layer as Layer7, Ref as Ref2, Runtime } from "effect";

// src/server/lib/storage/FileCacheStorage/PersistentService.ts
import { FileSystem as FileSystem2, Path as Path3 } from "@effect/platform";
import { Context as Context4, Effect as Effect6, Layer as Layer6 } from "effect";
import { z as z19 } from "zod";

// src/server/lib/config/paths.ts
import path3 from "node:path";
var claudeCodeViewerCacheDirPath = path3.join(
  resolveHomeDirFromEnv(),
  ".spec-forge-viewer",
  "cache"
);

// src/server/lib/storage/FileCacheStorage/PersistentService.ts
var saveSchema = z19.array(z19.tuple([z19.string(), z19.unknown()]));
var LayerImpl5 = Effect6.gen(function* () {
  const path5 = yield* Path3.Path;
  const getCacheFilePath = (key) => path5.resolve(claudeCodeViewerCacheDirPath, `${key}.json`);
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

// src/server/core/project/functions/projectPathHint.ts
var PROJECT_PATH_HINT_FILENAME = ".specforge-project-path";

// src/server/core/project/services/ProjectMetaService.ts
var ProjectPathSchema = z20.string().nullable();
var LayerImpl6 = Effect8.gen(function* () {
  const fs = yield* FileSystem3.FileSystem;
  const path5 = yield* Path4.Path;
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
      if (conversation === void 0 || conversation.type === "summary" || conversation.type === "x-error" || conversation.type === "file-history-snapshot" || conversation.type === "queue-operation" || conversation.type === "last-prompt") {
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
    if (cached !== void 0 && cached.projectPath !== null) {
      return cached;
    }
    const claudeProjectPath = decodeProjectId(projectId);
    const projectPathHintFilePath = path5.join(
      claudeProjectPath,
      PROJECT_PATH_HINT_FILENAME
    );
    const dirents = yield* fs.readDirectory(claudeProjectPath);
    const fileEntries = yield* Effect8.all(
      dirents.filter((name) => name.endsWith(".jsonl")).map(
        (name) => Effect8.gen(function* () {
          const fullPath = path5.resolve(claudeProjectPath, name);
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
    const hintedPath = yield* readProjectPathHint(projectPathHintFilePath);
    if (hintedPath !== null) {
      projectPath = hintedPath;
    } else {
      const repairResult = yield* repairProjectPathBySessionFiles({
        projectId,
        persistHint: true,
        files
      });
      if (repairResult.success) {
        projectPath = repairResult.projectPath;
      }
    }
    const projectMeta = {
      projectName: projectPath ? path5.basename(projectPath) : null,
      projectPath,
      sessionCount: files.length,
      isWorkspace: false
    };
    if (projectPath !== null) {
      const settingsPath = path5.join(projectPath, ".claude", "settings.json");
      const isWs = yield* Effect8.gen(function* () {
        const exists = yield* fs.exists(settingsPath);
        if (!exists) return false;
        const content = yield* fs.readFileString(settingsPath);
        const parsed = yield* Effect8.try({
          try: () => JSON.parse(content),
          catch: () => new Error("Invalid JSON in settings.json")
        });
        const dirs = parsed?.permissions?.additionalDirectories;
        return Array.isArray(dirs) && dirs.length > 0;
      }).pipe(Effect8.catchAll(() => Effect8.succeed(false)));
      projectMeta.isWorkspace = isWs;
    }
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
  const readProjectPathHint = (hintFilePath) => Effect8.gen(function* () {
    if (!(yield* fs.exists(hintFilePath))) {
      return null;
    }
    const hintedPath = (yield* fs.readFileString(hintFilePath)).trim();
    if (hintedPath.length === 0) {
      return null;
    }
    if (!(yield* fs.exists(hintedPath))) {
      return null;
    }
    return hintedPath;
  });
  const repairProjectPathBySessionFiles = (options) => Effect8.gen(function* () {
    const claudeProjectPath = decodeProjectId(options.projectId);
    const projectPathHintFilePath = path5.join(
      claudeProjectPath,
      PROJECT_PATH_HINT_FILENAME
    );
    const fileList = options.files ?? (yield* Effect8.gen(function* () {
      const dirents = yield* fs.readDirectory(claudeProjectPath);
      const entries = yield* Effect8.all(
        dirents.filter((name) => name.endsWith(".jsonl")).map(
          (name) => Effect8.gen(function* () {
            const fullPath = path5.resolve(claudeProjectPath, name);
            const stat = yield* fs.stat(fullPath);
            return {
              fullPath,
              mtime: Option.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date(0))
            };
          })
        ),
        { concurrency: "unbounded" }
      );
      return entries.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
    }));
    const candidates = /* @__PURE__ */ new Set();
    for (const file of fileList) {
      const extracted = yield* extractProjectPathFromJsonl(file.fullPath);
      if (extracted !== null) {
        candidates.add(extracted);
      }
    }
    const candidateList = [...candidates];
    if (candidateList.length !== 1) {
      return {
        success: false,
        reason: candidateList.length === 0 ? "no_project_path_found" : "ambiguous_project_paths",
        candidates: candidateList
      };
    }
    const candidatePath = candidateList[0];
    if (candidatePath === void 0 || !(yield* fs.exists(candidatePath))) {
      return {
        success: false,
        reason: "candidate_path_not_exists",
        candidates: candidateList
      };
    }
    if (options.persistHint) {
      yield* fs.writeFileString(projectPathHintFilePath, candidatePath).pipe(Effect8.catchAll(() => Effect8.void));
    }
    yield* invalidateProject(options.projectId);
    return {
      success: true,
      projectPath: candidatePath
    };
  });
  const repairProjectPath = (projectId) => Effect8.gen(function* () {
    const claudeProjectPath = decodeProjectId(projectId);
    const projectPathHintFilePath = path5.join(
      claudeProjectPath,
      PROJECT_PATH_HINT_FILENAME
    );
    const hintedPath = yield* readProjectPathHint(projectPathHintFilePath);
    if (hintedPath !== null) {
      return { success: true, projectPath: hintedPath };
    }
    return yield* repairProjectPathBySessionFiles({
      projectId,
      persistHint: true
    });
  });
  return {
    getProjectMeta,
    invalidateProject,
    repairProjectPath
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
  const path5 = yield* Path5.Path;
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
        const fullPath = path5.resolve(
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
  const normalizedBaseDir = baseDir.replace(/[\\/]+$/, "");
  const relativePath = filePath.startsWith(normalizedBaseDir) ? filePath.slice(normalizedBaseDir.length + 1) : filePath;
  return relativePath.replace(/\.md$/, "").replace(/[\\/]/g, ":");
};
var scanCommandFilesWithMetadata = (dirPath) => Effect10.gen(function* () {
  const fs = yield* FileSystem5.FileSystem;
  const path5 = yield* Path6.Path;
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
        const itemPath = path5.join(currentPath, item);
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
  const path5 = yield* Path6.Path;
  const scanDirectory = (currentPath, relativePath) => Effect10.gen(function* () {
    const exists = yield* fs.exists(currentPath);
    if (!exists) {
      return [];
    }
    const skillFilePath = path5.join(currentPath, "SKILL.md");
    const skillFileExists = yield* fs.exists(skillFilePath);
    const skills = [];
    if (skillFileExists) {
      const skillName = relativePath.replace(/[\\/]/g, ":");
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
        const itemPath = path5.join(currentPath, item);
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
import { z as z21 } from "zod";
var versionRegex = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;
var versionSchema = z21.object({
  major: z21.string().transform((value) => Number.parseInt(value, 10)),
  minor: z21.string().transform((value) => Number.parseInt(value, 10)),
  patch: z21.string().transform((value) => Number.parseInt(value, 10))
}).refine(
  (data) => [data.major, data.minor, data.patch].every((value) => !Number.isNaN(value))
);
var fromCLIString = (versionOutput) => {
  for (const line of versionOutput.split(/\r?\n/)) {
    const groups = line.trim().match(versionRegex)?.groups;
    if (groups === void 0) continue;
    const parsed = versionSchema.safeParse(groups);
    if (parsed.success) return parsed.data;
  }
  return null;
};
var versionText = (version) => `${version.major}.${version.minor}.${version.patch}`;
var equals = (a, b) => a.major === b.major && a.minor === b.minor && a.patch === b.patch;
var greaterThan = (a, b) => a.major > b.major || a.major === b.major && (a.minor > b.minor || a.minor === b.minor && a.patch > b.patch);
var greaterThanOrEqual = (a, b) => equals(a, b) || greaterThan(a, b);

// src/server/core/claude-code/services/AdaModelService.ts
import { Command, Path as Path7 } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Context as Context8, Data, Effect as Effect11, Either, Layer as Layer10 } from "effect";
var ANSI_ESCAPE_REGEXP = (
  // biome-ignore lint/suspicious/noControlCharactersInRegex: used for terminal output cleanup
  /\u001b\[[0-9;?]*[ -/]*[@-~]/g
);
var ANSI_OSC_REGEXP = (
  // biome-ignore lint/suspicious/noControlCharactersInRegex: used for terminal output cleanup
  /\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g
);
var toCleanText = (raw) => raw.replace(ANSI_OSC_REGEXP, "").replace(ANSI_ESCAPE_REGEXP, "").replace(/\r/g, "\n").replaceAll("\b", "").replaceAll("\0", "");
var normalizeLabel = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();
var extractCurrentModelFromHeader = (output) => {
  const lines = output.split("\n").map((line) => line.trimEnd());
  const value = lines.flatMap((line) => {
    const zhMatch = line.match(/当前模型[:：]\s*(.+?)\s*$/);
    if (zhMatch?.[1]) {
      return [zhMatch[1].trim()];
    }
    const enMatch = line.match(/current model[:：]\s*(.+?)\s*$/i);
    if (enMatch?.[1]) {
      return [enMatch[1].trim()];
    }
    return [];
  }).at(-1);
  return value ?? null;
};
var isUnsupportedModeOutput = (output) => /当前为自定义 API Key 模式，不支持切换模型|不支持切换模型|not support.*switch model|does not support.*switch model/i.test(
  output
);
var unsupportedModeListResult = (output) => ({
  models: [],
  currentIndex: null,
  currentLabel: extractCurrentModelFromHeader(output),
  switchSupported: false,
  unsupportedReason: "CUSTOM_API_KEY_MODE"
});
var resolveAdaExecutable = () => Effect11.gen(function* () {
  if (process.platform !== "win32") {
    return "ada";
  }
  const path5 = yield* Path7.Path;
  const outputResult = yield* Effect11.either(
    Command.string(
      Command.make("where", "ada").pipe(Command.runInShell(true))
    )
  ).pipe(Effect11.provide(NodeContext.layer));
  if (Either.isRight(outputResult)) {
    const isAdaExecutableName = (value) => {
      const baseName = path5.basename(value).toLowerCase();
      if (baseName.startsWith("claude")) {
        return false;
      }
      return baseName === "ada" || baseName.startsWith("ada.");
    };
    const candidates = outputResult.right.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    const adaCandidates = candidates.filter(isAdaExecutableName);
    const byPriority = (value) => {
      const lower = value.toLowerCase();
      if (lower.endsWith(".exe")) return 4;
      if (lower.endsWith(".cmd")) return 3;
      if (lower.endsWith(".ps1")) return 2;
      if (lower.endsWith(".bat")) return 1;
      return 0;
    };
    const sorted = adaCandidates.toSorted((a, b) => {
      const aPriority = byPriority(a);
      const bPriority = byPriority(b);
      if (aPriority < bPriority) return 1;
      if (aPriority > bPriority) return -1;
      return 0;
    });
    const best = sorted.at(0);
    if (best) {
      return best;
    }
  }
  return "ada.cmd";
});
var formatUnknownError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
var parseAdaModelOutput = (rawOutput) => {
  const output = toCleanText(rawOutput);
  const lines = output.split("\n").map((line) => line.trimEnd());
  const currentModelFromHeader = extractCurrentModelFromHeader(output);
  const parseModelLine = (line) => {
    const modelMatch = line.match(/^\s*(?:>\s*)?(\d+)\.\s*(.+?)\s*$/) ?? line.match(/(?:^|\s)(\d+)\.\s+(.+?)\s*$/);
    if (!modelMatch?.[1] || !modelMatch[2]) {
      return null;
    }
    const index = Number.parseInt(modelMatch[1], 10);
    const rawLabel = modelMatch[2];
    const isCurrent = /\[当前\]|\[current\]/i.test(rawLabel);
    const label = rawLabel.replace(/\s*\[(?:当前|current)\]\s*/gi, "").trim();
    if (Number.isNaN(index) || label.length === 0) {
      return null;
    }
    return {
      index,
      label,
      isCurrent
    };
  };
  let parsedModels = lines.flatMap((line) => {
    const model = parseModelLine(line);
    return model ? [model] : [];
  });
  if (parsedModels.length === 0) {
    const candidateChunks = output.split(/(?=\s(?:>\s*)?\d+\.\s)/g).map((chunk) => chunk.trim()).filter((chunk) => /^\s*(?:>\s*)?\d+\.\s+/.test(chunk));
    parsedModels = candidateChunks.flatMap((chunk) => {
      const model = parseModelLine(chunk);
      return model ? [model] : [];
    });
  }
  const modelByIndex = /* @__PURE__ */ new Map();
  for (const model of parsedModels) {
    modelByIndex.set(model.index, model);
  }
  const models = Array.from(modelByIndex.values()).sort(
    (left, right) => left.index - right.index
  );
  let modelsWithCurrent = models;
  if (!models.some((model) => model.isCurrent) && currentModelFromHeader) {
    const normalizedHeader = normalizeLabel(currentModelFromHeader);
    const exact = models.find(
      (model) => normalizeLabel(model.label) === normalizedHeader
    );
    const inParens = models.find(
      (model) => normalizeLabel(model.label).includes(`(${normalizedHeader})`)
    );
    const includes = models.find(
      (model) => normalizeLabel(model.label).includes(normalizedHeader)
    );
    const matched = exact ?? inParens ?? includes;
    if (matched) {
      modelsWithCurrent = models.map((model) => ({
        ...model,
        isCurrent: model.index === matched.index
      }));
    }
  }
  const currentByMarker = modelsWithCurrent.find((model) => model.isCurrent);
  const currentIndex = currentByMarker?.index ?? null;
  const currentLabel = currentByMarker?.label ?? null;
  return {
    models: modelsWithCurrent,
    currentIndex,
    currentLabel,
    switchSupported: true,
    unsupportedReason: null
  };
};
var AdaModelParseError = class extends Data.TaggedError("AdaModelParseError") {
};
var AdaModelCommandError = class extends Data.TaggedError("AdaModelCommandError") {
};
var AdaModelTimeoutError = class extends Data.TaggedError("AdaModelTimeoutError") {
};
var AdaModelTargetNotFoundError = class extends Data.TaggedError(
  "AdaModelTargetNotFoundError"
) {
};
var AdaModelCurrentUnknownError = class extends Data.TaggedError(
  "AdaModelCurrentUnknownError"
) {
};
var AdaModelUnsupportedModeError = class extends Data.TaggedError(
  "AdaModelUnsupportedModeError"
) {
};
var parseModelsOrFail = (output) => Effect11.gen(function* () {
  if (isUnsupportedModeOutput(toCleanText(output))) {
    return unsupportedModeListResult(toCleanText(output));
  }
  const parsed = parseAdaModelOutput(output);
  if (parsed.models.length === 0) {
    return yield* Effect11.fail(
      new AdaModelParseError({
        message: "unable to parse model list from ada model output",
        output
      })
    );
  }
  return parsed;
});
var runAdaModelWithInput = (options) => Effect11.gen(function* () {
  const command = Command.make(options.executable, "model").pipe(
    Command.feed(options.input),
    Command.env({
      // biome-ignore lint/style/noProcessEnv: inherited env required by ada auth/runtime
      ...process.env,
      NO_COLOR: "1"
    })
  );
  const output = yield* Command.string(command).pipe(
    Effect11.timeoutFail({
      duration: options.timeoutMs,
      onTimeout: () => new AdaModelTimeoutError({
        message: `ada model timed out after ${options.timeoutMs}ms`,
        output: ""
      })
    }),
    Effect11.mapError((error) => {
      if (error instanceof AdaModelTimeoutError) {
        return error;
      }
      return new AdaModelCommandError({
        message: "failed to execute ada model",
        output: formatUnknownError(error)
      });
    }),
    Effect11.provide(NodeContext.layer)
  );
  return {
    code: 0,
    output
  };
});
var LiveLayerImpl = Effect11.gen(function* () {
  const adaExecutable = yield* resolveAdaExecutable();
  const listCacheTtlMs = 1e4;
  let cachedList = null;
  let currentLock = Promise.resolve();
  const runExclusive = (task) => Effect11.promise(async () => {
    const previous = currentLock;
    let release;
    currentLock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await task();
    } finally {
      release?.();
    }
  });
  const listModelsInternal = () => Effect11.gen(function* () {
    const result = yield* runAdaModelWithInput({
      input: "\n",
      timeoutMs: 8e3,
      executable: adaExecutable
    });
    if (result.code !== 0) {
      return yield* Effect11.fail(
        new AdaModelCommandError({
          message: `ada model list failed with code ${result.code}`,
          output: result.output
        })
      );
    }
    return yield* parseModelsOrFail(result.output);
  });
  const readCachedList = () => {
    if (cachedList === null) {
      return null;
    }
    if (Date.now() - cachedList.at > listCacheTtlMs) {
      cachedList = null;
      return null;
    }
    return cachedList.value;
  };
  const writeCachedList = (value) => {
    cachedList = {
      value,
      at: Date.now()
    };
  };
  const listModels = () => runExclusive(async () => {
    const cached = readCachedList();
    if (cached !== null) {
      return cached;
    }
    const latest = await Effect11.runPromise(listModelsInternal());
    writeCachedList(latest);
    return latest;
  });
  const switchModel = (targetIndex) => runExclusive(async () => {
    const initial = readCachedList() ?? await Effect11.runPromise(listModelsInternal());
    if (!initial.switchSupported) {
      throw new AdaModelUnsupportedModeError({
        message: "ada model switch is not supported in current mode",
        output: JSON.stringify(initial)
      });
    }
    const target = initial.models.find(
      (model) => model.index === targetIndex
    );
    const targetLabel = target?.label ?? null;
    if (!target) {
      throw new AdaModelTargetNotFoundError({
        targetIndex,
        output: JSON.stringify(initial)
      });
    }
    const isTargetSelected = (latest2) => {
      const current = latest2.models.find((model) => model.isCurrent);
      if (!current) {
        return false;
      }
      if (targetLabel !== null) {
        return normalizeLabel(current.label) === normalizeLabel(targetLabel);
      }
      return current.index === targetIndex;
    };
    const readLatestWithRetry = async () => {
      let latest2 = await Effect11.runPromise(listModelsInternal());
      for (let attempt = 0; !isTargetSelected(latest2) && attempt < 2; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 120));
        latest2 = await Effect11.runPromise(listModelsInternal());
      }
      return latest2;
    };
    const switchResult = await Effect11.runPromise(
      runAdaModelWithInput({
        input: `${targetIndex}
`,
        timeoutMs: 1e4,
        executable: adaExecutable
      })
    );
    if (switchResult.code !== 0) {
      throw new AdaModelCommandError({
        message: `ada model switch failed with code ${switchResult.code}`,
        output: switchResult.output
      });
    }
    if (/输入无效|invalid input/i.test(switchResult.output)) {
      throw new AdaModelCommandError({
        message: "ada model rejected target index input",
        output: switchResult.output
      });
    }
    const latest = await readLatestWithRetry();
    writeCachedList(latest);
    const switchedTo = latest.models.find((model) => model.isCurrent);
    if (!switchedTo) {
      throw new AdaModelCurrentUnknownError({
        message: "cannot determine current model after switching",
        output: JSON.stringify(latest)
      });
    }
    const switchedByLabel = targetLabel !== null && normalizeLabel(switchedTo.label) === normalizeLabel(targetLabel);
    if (!switchedByLabel && switchedTo.index !== targetIndex) {
      throw new AdaModelCommandError({
        message: `ada model switched to unexpected target: expected ${targetIndex}/${targetLabel ?? "unknown"}, got ${switchedTo.index}/${switchedTo.label}`,
        output: JSON.stringify(latest)
      });
    }
    return {
      switchedTo: {
        index: switchedTo.index,
        label: switchedTo.label
      },
      ...latest
    };
  });
  return {
    listModels,
    switchModel
  };
});
var AdaModelService = class extends Context8.Tag("AdaModelService")() {
  static {
    this.Live = Layer10.effect(this, LiveLayerImpl);
  }
};

// src/server/core/claude-code/services/ClaudeCodeService.ts
import { FileSystem as FileSystem8, Path as Path10 } from "@effect/platform";
import { Context as Context10, Data as Data3, Effect as Effect15, Layer as Layer12 } from "effect";

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
import { Command as Command2, FileSystem as FileSystem7, Path as Path9 } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Data as Data2, Effect as Effect14 } from "effect";
import { uniq } from "es-toolkit";

// src/server/core/platform/services/UserConfigService.ts
import { Context as Context9, Effect as Effect12, Layer as Layer11, Ref as Ref4 } from "effect";

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
var LayerImpl8 = Effect12.gen(function* () {
  const configRef = yield* Ref4.make({
    hideNoUserMessageSession: true,
    unifySameTitleSession: false,
    enterKeyBehavior: "shift-enter-send",
    claudeCodeExecutablePath: void 0,
    permissionMode: "default",
    locale: DEFAULT_LOCALE,
    theme: "system",
    searchHotkey: "command-k",
    autoScheduleContinueOnRateLimit: false
  });
  const setUserConfig = (newConfig) => Effect12.gen(function* () {
    yield* Ref4.update(configRef, () => newConfig);
  });
  const getUserConfig = () => Effect12.gen(function* () {
    const config = yield* Ref4.get(configRef);
    return config;
  });
  return {
    getUserConfig,
    setUserConfig
  };
});
var UserConfigService = class extends Context9.Tag("UserConfigService")() {
  static {
    this.Live = Layer11.effect(this, LayerImpl8);
  }
};

// src/server/core/claude-code/functions/readClaudeSettingsEnv.ts
import { FileSystem as FileSystem6, Path as Path8 } from "@effect/platform";
import { Effect as Effect13 } from "effect";
import { z as z22 } from "zod";
var ClaudeSettingsSchema = z22.object({
  env: z22.record(z22.string(), z22.coerce.string()).optional()
});
var readClaudeSettingsEnv = Effect13.gen(function* () {
  const fs = yield* FileSystem6.FileSystem;
  const path5 = yield* Path8.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const claudeDir = yield* ccvOptionsService.getCcvOptions("claudeDir").pipe(
    Effect13.map(
      (envVar) => envVar === void 0 ? path5.resolve(resolveHomeDirFromEnv(), ".claude") : path5.resolve(envVar)
    )
  );
  const settingsPath = path5.join(claudeDir, "settings.json");
  return yield* fs.readFileString(settingsPath).pipe(
    Effect13.flatMap(
      (content) => Effect13.try(() => {
        const parsed = ClaudeSettingsSchema.parse(JSON.parse(content));
        return parsed.env ?? {};
      })
    ),
    Effect13.catchAll(() => Effect13.succeed({}))
  );
});

// src/server/core/claude-code/models/ClaudeCode.ts
var npxCacheRegExp = /_npx[/\\].*node_modules[\\/]\.bin/;
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var localNodeModulesBinRegExp = new RegExp(
  `${escapeRegExp(process.cwd().replace(/\\/g, "/"))}/node_modules/\\.bin`
);
var windowsExecutableExtensions = [
  ".exe",
  ".cmd",
  ".ps1",
  ".js",
  ".mjs",
  ".cjs"
];
var isWindowsSpawnable = (filePath) => {
  if (process.platform !== "win32") return true;
  const lower = filePath.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".exe") || lower.endsWith(".ps1");
};
var isWindowsShimPath = (filePath) => {
  if (process.platform !== "win32") return false;
  const lower = filePath.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".ps1");
};
var getWindowsExtensionPriority = (filePath) => {
  if (process.platform !== "win32") return 0;
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".exe")) return 3;
  if (lower.endsWith(".cmd")) return 2;
  if (lower.endsWith(".ps1")) return 1;
  return 0;
};
var claudeCodePathPriority = (path5) => {
  const normalizedPath = path5.replace(/\\/g, "/");
  if (npxCacheRegExp.test(normalizedPath)) {
    return 0;
  }
  if (localNodeModulesBinRegExp.test(normalizedPath)) {
    return 1;
  }
  return 2;
};
var listClaudePathsFromPath = Effect14.gen(function* () {
  const commands = process.platform === "win32" ? [
    ["where", "claude"],
    ["where", "claude.cmd"],
    ["where", "claude.exe"],
    ["where", "claude.ps1"]
  ] : [["which", "-a", "claude"]];
  const pathLists = yield* Effect14.forEach(
    commands,
    ([command, ...args]) => Command2.string(
      Command2.make(command, ...args).pipe(Command2.runInShell(true))
    ).pipe(
      Effect14.map(
        (output) => output.split("\n").map((line) => line.trim()).filter((line) => line !== "")
      ),
      Effect14.catchAll(() => Effect14.succeed([]))
    )
  );
  return uniq(pathLists.flat()).filter(isWindowsSpawnable).toSorted((a, b) => {
    const aPriority = claudeCodePathPriority(a);
    const bPriority = claudeCodePathPriority(b);
    if (aPriority < bPriority) {
      return 1;
    }
    if (aPriority > bPriority) {
      return -1;
    }
    if (process.platform === "win32") {
      const aExtPriority = getWindowsExtensionPriority(a);
      const bExtPriority = getWindowsExtensionPriority(b);
      if (aExtPriority < bExtPriority) {
        return 1;
      }
      if (aExtPriority > bExtPriority) {
        return -1;
      }
    }
    return 0;
  });
});
var ClaudeCodePathNotFoundError = class extends Data2.TaggedError(
  "ClaudeCodePathNotFoundError"
) {
};
var ClaudeCodeAgentSdkNotSupportedError = class extends Data2.TaggedError(
  "ClaudeCodeAgentSdkNotSupportedError"
) {
};
var ClaudeCodeShimParseError = class extends Data2.TaggedError(
  "ClaudeCodeShimParseError"
) {
};
var resolveWindowsExecutableCandidates = (resolvedPath) => {
  return windowsExecutableExtensions.map((ext) => `${resolvedPath}${ext}`);
};
var parseWindowsShimJsEntry = (content) => {
  const patterns = [
    /"%~dp0\\?([^"]+?\.(?:mjs|cjs|js))"/i,
    /%~dp0\\?([^\s"'`]+?\.(?:mjs|cjs|js))/i,
    /["']?\$PSScriptRoot\\([^"'`]+?\.(?:mjs|cjs|js))["']?/i,
    /node(?:\.exe)?\s+["']?([^"'`]+?\.(?:mjs|cjs|js))["']?/i
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(content);
    if (match?.[1] !== void 0) {
      return match[1];
    }
  }
  return void 0;
};
var resolveJsEntryFromShim = (shimPath, pathModule) => Effect14.gen(function* () {
  const fs = yield* FileSystem7.FileSystem;
  const content = yield* fs.readFileString(shimPath);
  const entry = parseWindowsShimJsEntry(content);
  if (entry === void 0) {
    const shimDir2 = pathModule.dirname(shimPath);
    const normalizedShimDir = shimDir2.replace(/\\/g, "/");
    if (!normalizedShimDir.includes("/node_modules/.bin")) {
      return void 0;
    }
    const nodeModulesDir = pathModule.resolve(shimDir2, "..");
    const packageDir = pathModule.join(
      nodeModulesDir,
      "@anthropic-ai",
      "claude-code"
    );
    const fallbackCandidates = [
      pathModule.join(packageDir, "cli.js"),
      pathModule.join(packageDir, "cli.mjs"),
      pathModule.join(packageDir, "cli.cjs"),
      pathModule.join(packageDir, "dist", "cli.js"),
      pathModule.join(packageDir, "dist", "cli.mjs"),
      pathModule.join(packageDir, "dist", "cli.cjs")
    ];
    return yield* resolveFirstExistingPath(fallbackCandidates);
  }
  const shimDir = pathModule.dirname(shimPath);
  const jsEntry = pathModule.resolve(shimDir, entry);
  const exists = yield* fs.exists(jsEntry);
  return exists ? jsEntry : void 0;
}).pipe(
  Effect14.provide(NodeFileSystem.layer),
  Effect14.catchAll(() => Effect14.succeed(void 0))
);
var resolveFirstExistingPath = (candidates) => Effect14.gen(function* () {
  const fs = yield* FileSystem7.FileSystem;
  for (const candidate of candidates) {
    if (yield* fs.exists(candidate)) {
      return candidate;
    }
  }
  return void 0;
}).pipe(
  Effect14.provide(NodeFileSystem.layer),
  Effect14.catchAll(() => Effect14.succeed(void 0))
);
var resolveClaudeCodePath = Effect14.gen(function* () {
  const path5 = yield* Path9.Path;
  const ccvOptionsService = yield* CcvOptionsService;
  const userConfigService = yield* UserConfigService;
  let resolvedPath;
  const specifiedExecutablePath = yield* ccvOptionsService.getCcvOptions("executable");
  const userConfig = yield* userConfigService.getUserConfig();
  const userExecutablePathRaw = userConfig.claudeCodeExecutablePath;
  const userExecutablePath = typeof userExecutablePathRaw === "string" && userExecutablePathRaw.trim().length > 0 ? userExecutablePathRaw.trim() : void 0;
  const configuredExecutablePath = specifiedExecutablePath ?? userExecutablePath;
  if (configuredExecutablePath !== void 0) {
    const resolvedSpecifiedPath = path5.resolve(configuredExecutablePath);
    if (process.platform === "win32") {
      const extension = path5.extname(resolvedSpecifiedPath);
      if (extension.length > 0) {
        const exists = yield* resolveFirstExistingPath([resolvedSpecifiedPath]);
        if (exists === void 0) {
          return yield* Effect14.fail(
            new ClaudeCodePathNotFoundError({
              message: `Claude Code CLI not found at ${resolvedSpecifiedPath}`
            })
          );
        }
        resolvedPath = exists;
      } else {
        const candidates = resolveWindowsExecutableCandidates(
          resolvedSpecifiedPath
        );
        const existing = yield* resolveFirstExistingPath(candidates);
        if (existing === void 0) {
          return yield* Effect14.fail(
            new ClaudeCodePathNotFoundError({
              message: `Claude Code CLI not found for ${resolvedSpecifiedPath}. Tried: ${candidates.join(
                ", "
              )}`
            })
          );
        }
        resolvedPath = existing;
      }
    } else {
      resolvedPath = resolvedSpecifiedPath;
    }
  } else {
    const claudePaths = yield* listClaudePathsFromPath.pipe(
      Effect14.catchAll(() => Effect14.succeed([]))
    );
    const firstPath = claudePaths.at(0);
    if (firstPath === void 0) {
      return yield* Effect14.fail(
        new ClaudeCodePathNotFoundError({
          message: "Claude Code CLI not found in any location"
        })
      );
    }
    resolvedPath = firstPath;
  }
  if (isWindowsShimPath(resolvedPath)) {
    const jsEntry = yield* resolveJsEntryFromShim(resolvedPath, path5);
    if (jsEntry === void 0) {
      return yield* Effect14.fail(
        new ClaudeCodeShimParseError({
          message: "Windows \u4E0B\u68C0\u6D4B\u5230 Claude Code shim\uFF0C\u4F46\u65E0\u6CD5\u89E3\u6790 JS \u5165\u53E3\u3002\u8BF7\u6539\u7528 claude.exe \u6216\u5C06 CCV_CC_EXECUTABLE_PATH \u6307\u5411 cli.js\u3002",
          shimPath: resolvedPath
        })
      );
    }
    console.log(
      `[SpecForge] Windows shim workaround: \u89E3\u6790 ${resolvedPath} \u2192 ${jsEntry}`
    );
    return jsEntry;
  }
  return resolvedPath;
});
var Config = Effect14.gen(function* () {
  const claudeCodeExecutablePath = yield* resolveClaudeCodePath;
  const settingsEnv = yield* readClaudeSettingsEnv;
  const mergedEnv = { ...settingsEnv, ...process.env };
  const claudeCodeVersion = fromCLIString(
    yield* Command2.string(
      Command2.make(claudeCodeExecutablePath, "--version").pipe(
        Command2.env(mergedEnv),
        Command2.runInShell(true)
      )
    )
  );
  return {
    claudeCodeExecutablePath,
    claudeCodeVersion
  };
});
var getMcpListOutput = (projectCwd) => Effect14.gen(function* () {
  const path5 = yield* Path9.Path;
  const { claudeCodeExecutablePath } = yield* Config;
  const command = Command2.make(claudeCodeExecutablePath, "mcp", "list").pipe(
    Command2.workingDirectory(path5.resolve(projectCwd))
  );
  const output = yield* Command2.string(
    command.pipe(Command2.runInShell(true))
  );
  return output;
});
var getAvailableFeatures = (claudeCodeVersion) => ({
  canUseTool: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 82
  }) : true,
  uuidOnSDKMessage: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 86
  }) : true,
  agentSdk: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 1,
    minor: 0,
    patch: 125
    // ClaudeCodeAgentSDK is available since v1.0.125
  }) : true,
  sidechainSeparation: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 0,
    patch: 28
    // Sidechain conversations stored in agent-*.jsonl since v2.0.28
  }) : true,
  runSkillsDirectly: claudeCodeVersion !== null ? greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 1,
    patch: 0
  }) || greaterThanOrEqual(claudeCodeVersion, {
    major: 2,
    minor: 0,
    patch: 77
  }) : true
});
var query2 = (prompt, options) => {
  const { canUseTool, permissionMode, hooks, ...baseOptions } = options;
  return Effect14.gen(function* () {
    const { claudeCodeExecutablePath, claudeCodeVersion } = yield* Config;
    const availableFeatures = getAvailableFeatures(claudeCodeVersion);
    const versionText2 = claudeCodeVersion ? versionText(claudeCodeVersion) : "unknown";
    console.log(
      `[SpecForge] Claude Code query: path=${claudeCodeExecutablePath}, version=${versionText2}, features=${JSON.stringify(availableFeatures)}`
    );
    const queryOptions = {
      ...baseOptions,
      pathToClaudeCodeExecutable: claudeCodeExecutablePath,
      disallowedTools: [],
      ...availableFeatures.canUseTool ? { canUseTool, permissionMode } : {
        permissionMode: "bypassPermissions"
      },
      // 捕获 Claude Code CLI 的 stderr 输出用于诊断
      // 仅当 CLI 开启 debug 模式时（通过 DEBUG_CLAUDE_AGENT_SDK=1）才会有实际输出
      stderr: (data) => {
        console.log(`[SpecForge:claude-code:stderr] ${data.trimEnd()}`);
      }
    };
    if (!availableFeatures.agentSdk) {
      return yield* Effect14.fail(
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
        ...queryOptions
      }
    });
  });
};

// src/server/core/claude-code/services/ClaudeCodeService.ts
var ProjectPathNotFoundError = class extends Data3.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var McpConfigSaveError = class extends Data3.TaggedError("McpConfigSaveError") {
};
var LayerImpl9 = Effect15.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const getClaudeCodeMeta = () => Effect15.gen(function* () {
    const config = yield* Config;
    return config;
  });
  const getAvailableFeatures2 = () => Effect15.gen(function* () {
    const config = yield* Config;
    const features = getAvailableFeatures(
      config.claudeCodeVersion
    );
    return features;
  });
  const getMcpList = (projectId) => Effect15.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect15.fail(new ProjectPathNotFoundError({ projectId }));
    }
    const output = yield* getMcpListOutput(
      project.meta.projectPath
    );
    return parseMcpListOutput(output);
  });
  const MCP_CONFIG_FILE = ".mcp.json";
  const getMcpConfig = (projectId) => Effect15.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect15.fail(new ProjectPathNotFoundError({ projectId }));
    }
    const path5 = yield* Path10.Path;
    const fs = yield* FileSystem8.FileSystem;
    const configPath = path5.join(project.meta.projectPath, MCP_CONFIG_FILE);
    const exists = yield* fs.exists(configPath);
    if (!exists) {
      return {
        content: JSON.stringify({ mcpServers: {} }, null, 2),
        configPath
      };
    }
    const content = yield* fs.readFileString(configPath);
    return { content, configPath };
  });
  const saveMcpConfig = (projectId, content) => Effect15.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect15.fail(new ProjectPathNotFoundError({ projectId }));
    }
    const path5 = yield* Path10.Path;
    const fs = yield* FileSystem8.FileSystem;
    const configPath = path5.join(project.meta.projectPath, MCP_CONFIG_FILE);
    try {
      JSON.parse(content);
    } catch {
      return yield* Effect15.fail(
        new McpConfigSaveError({
          projectId,
          configPath,
          reason: "\u65E0\u6548\u7684 JSON \u683C\u5F0F"
        })
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
    getAvailableFeatures: getAvailableFeatures2
  };
});
var ClaudeCodeService = class extends Context10.Tag("ClaudeCodeService")() {
  static {
    this.Live = Layer12.effect(this, LayerImpl9);
  }
};

// src/server/core/claude-code/services/ClaudeCodeSessionProcessService.ts
import { Context as Context12, Data as Data4, Effect as Effect18, Layer as Layer14, Ref as Ref5 } from "effect";

// src/server/core/events/services/EventBus.ts
import { Context as Context11, Effect as Effect16, Layer as Layer13 } from "effect";
var layerImpl = Effect16.gen(function* () {
  const listenersMap = /* @__PURE__ */ new Map();
  const getListeners = (event) => {
    if (!listenersMap.has(event)) {
      listenersMap.set(event, /* @__PURE__ */ new Set());
    }
    return listenersMap.get(event);
  };
  const emit = (event, data) => Effect16.gen(function* () {
    const listeners = getListeners(event);
    const results = yield* Effect16.tryPromise({
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
      Effect16.catchAll(() => {
        return Effect16.succeed([]);
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
  const on = (event, listener) => Effect16.sync(() => {
    const listeners = getListeners(event);
    listeners.add(listener);
  });
  const off = (event, listener) => Effect16.sync(() => {
    const listeners = getListeners(event);
    listeners.delete(listener);
  });
  return {
    emit,
    on,
    off
  };
});
var EventBus = class extends Context11.Tag("EventBus")() {
  static {
    this.Live = Layer13.effect(this, layerImpl);
  }
};

// src/server/core/claude-code/models/CCSessionProcess.ts
import { Effect as Effect17 } from "effect";
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
  return Effect17.gen(function* () {
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
var SessionProcessNotFoundError = class extends Data4.TaggedError(
  "SessionProcessNotFoundError"
) {
};
var SessionProcessNotPausedError = class extends Data4.TaggedError(
  "SessionProcessNotPausedError"
) {
};
var SessionProcessAlreadyAliveError = class extends Data4.TaggedError(
  "SessionProcessAlreadyAliveError"
) {
};
var IllegalStateChangeError = class extends Data4.TaggedError(
  "IllegalStateChangeError"
) {
};
var TaskNotFoundError = class extends Data4.TaggedError("TaskNotFoundError") {
};
var LayerImpl10 = Effect18.gen(function* () {
  const processesRef = yield* Ref5.make([]);
  const eventBus = yield* EventBus;
  const startSessionProcess = (options) => {
    const { sessionDef, taskDef } = options;
    return Effect18.gen(function* () {
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
      yield* Ref5.update(processesRef, (processes) => [
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
    return Effect18.gen(function* () {
      const process2 = yield* getSessionProcess(sessionProcessId);
      if (process2.type !== "paused") {
        return yield* Effect18.fail(
          new SessionProcessNotPausedError({
            sessionProcessId
          })
        );
      }
      const [firstAliveTask] = getAliveTasks(process2);
      if (firstAliveTask !== void 0) {
        return yield* Effect18.fail(
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
      yield* Ref5.update(processesRef, (processes) => {
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
    return Effect18.gen(function* () {
      const processes = yield* Ref5.get(processesRef);
      const result = processes.find(
        (p) => p.def.sessionProcessId === sessionProcessId
      );
      if (result === void 0) {
        return yield* Effect18.fail(
          new SessionProcessNotFoundError({ sessionProcessId })
        );
      }
      return result;
    });
  };
  const getSessionProcesses = () => {
    return Effect18.gen(function* () {
      const processes = yield* Ref5.get(processesRef);
      return processes;
    });
  };
  const getTask = (taskId) => {
    return Effect18.gen(function* () {
      const processes = yield* Ref5.get(processesRef);
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
        return yield* Effect18.fail(new TaskNotFoundError({ taskId }));
      }
      return result;
    });
  };
  const dangerouslyChangeProcessState = (options) => {
    const { sessionProcessId, nextState } = options;
    return Effect18.gen(function* () {
      const processes = yield* Ref5.get(processesRef);
      const targetProcess = processes.find(
        (p) => p.def.sessionProcessId === sessionProcessId
      );
      const currentStatus = targetProcess?.type;
      const updatedProcesses = processes.map(
        (p) => p.def.sessionProcessId === sessionProcessId ? nextState : p
      );
      yield* Ref5.set(processesRef, updatedProcesses);
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
  const isTaskStateWithStatus = (task, status) => task.status === status;
  const changeTaskState = (options) => {
    const { sessionProcessId, taskId, nextTask } = options;
    return Effect18.gen(function* () {
      const { task } = yield* getTask(taskId);
      yield* Ref5.update(processesRef, (processes) => {
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
      if (!isTaskStateWithStatus(updated.task, nextTask.status)) {
        throw new Error(
          `Unexpected task status after update: expected ${nextTask.status}, got ${updated.task.status}`
        );
      }
      return updated.task;
    });
  };
  const toNotInitializedState = (options) => {
    const { sessionProcessId, rawUserMessage } = options;
    return Effect18.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "pending") {
        return yield* Effect18.fail(
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
    return Effect18.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "not_initialized") {
        return yield* Effect18.fail(
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
    return Effect18.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "initialized") {
        return yield* Effect18.fail(
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
    return Effect18.gen(function* () {
      const currentProcess = yield* getSessionProcess(sessionProcessId);
      if (currentProcess.type !== "file_created") {
        return yield* Effect18.fail(
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
    return Effect18.gen(function* () {
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
var ClaudeCodeSessionProcessService = class extends Context12.Tag(
  "ClaudeCodeSessionProcessService"
)() {
  static {
    this.Live = Layer14.effect(this, LayerImpl10);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeController.ts
var LayerImpl11 = Effect19.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeService = yield* ClaudeCodeService;
  const adaModelService = yield* AdaModelService;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const context = yield* ApplicationContext;
  yield* FileSystem9.FileSystem;
  const path5 = yield* Path11.Path;
  const isDevelopment = process.env.NODE_ENV === "development";
  const causePayload = (cause) => isDevelopment ? { cause: Cause.pretty(cause) } : {};
  const isAdaCliMissingCause = (cause) => {
    const prettyCause = Cause.pretty(cause).toLowerCase();
    return prettyCause.includes("spawn ada enoent") || prettyCause.includes("failed to execute ada model");
  };
  const getClaudeCommands = (options) => Effect19.gen(function* () {
    const { projectId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    const features = yield* claudeCodeService.getAvailableFeatures();
    const globalCommands = yield* scanCommandFilesWithMetadata(
      (yield* context.claudeCodePaths).claudeCommandsDirPath
    );
    const projectCommands = project.meta.projectPath === null ? [] : yield* scanCommandFilesWithMetadata(
      path5.resolve(project.meta.projectPath, ".claude", "commands")
    );
    const globalSkills = features.runSkillsDirectly ? yield* scanSkillFilesWithMetadata(
      (yield* context.claudeCodePaths).claudeSkillsDirPath
    ) : [];
    const projectSkills = features.runSkillsDirectly && project.meta.projectPath !== null ? yield* scanSkillFilesWithMetadata(
      path5.resolve(project.meta.projectPath, ".claude", "skills")
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
  const getMcpListRoute = (options) => Effect19.gen(function* () {
    const { projectId } = options;
    const servers = yield* claudeCodeService.getMcpList(projectId);
    return {
      response: { servers },
      status: 200
    };
  });
  const getMcpConfigRoute = (options) => Effect19.gen(function* () {
    const { projectId } = options;
    const { content, configPath } = yield* claudeCodeService.getMcpConfig(projectId);
    return {
      response: { content, configPath },
      status: 200
    };
  });
  const saveMcpConfigRoute = (options) => Effect19.gen(function* () {
    const { projectId, content } = options;
    const { configPath } = yield* claudeCodeService.saveMcpConfig(
      projectId,
      content
    );
    return {
      response: { configPath, success: true },
      status: 200
    };
  });
  const getClaudeCodeMeta = () => Effect19.gen(function* () {
    const config = yield* claudeCodeService.getClaudeCodeMeta();
    return {
      response: {
        executablePath: config.claudeCodeExecutablePath,
        version: config.claudeCodeVersion ? versionText(config.claudeCodeVersion) : null
      },
      status: 200
    };
  });
  const getAvailableFeatures2 = () => Effect19.gen(function* () {
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
  const getAdaModels = () => Effect19.gen(function* () {
    const result = yield* adaModelService.listModels().pipe(
      Effect19.catchAllCause(
        (cause) => Effect19.succeed(
          isAdaCliMissingCause(cause) ? {
            models: [],
            currentIndex: null,
            currentLabel: null,
            switchSupported: false,
            unsupportedReason: null,
            error: "Ada CLI is not installed",
            code: "MODEL_SWITCH_ADA_CLI_MISSING",
            ...causePayload(cause)
          } : {
            models: [],
            currentIndex: null,
            currentLabel: null,
            switchSupported: true,
            unsupportedReason: null,
            error: "Failed to read ada model output",
            ...causePayload(cause)
          }
        )
      )
    );
    return {
      response: result,
      status: 200
    };
  });
  const switchAdaModel = (options) => Effect19.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    const hasRunningProcess = processes.some(
      (process2) => process2.type !== "paused" && process2.type !== "completed"
    );
    if (hasRunningProcess) {
      return {
        response: {
          error: "Model switch is blocked while session process is running"
        },
        status: 409
      };
    }
    const result = yield* adaModelService.switchModel(options.targetIndex).pipe(
      Effect19.catchAllCause(
        (cause) => Effect19.succeed(
          Cause.pretty(cause).includes("AdaModelUnsupportedModeError") ? {
            error: "Model switch is available only in team mode (unsupported in custom API key mode)",
            code: "MODEL_SWITCH_UNSUPPORTED_MODE"
          } : {
            error: "Failed to switch model via ada model",
            ...causePayload(cause)
          }
        )
      )
    );
    if ("code" in result && result.code === "MODEL_SWITCH_UNSUPPORTED_MODE") {
      return {
        response: result,
        status: 422
      };
    }
    if ("error" in result) {
      return {
        response: result,
        status: 502
      };
    }
    return {
      response: result,
      status: 200
    };
  });
  return {
    getClaudeCommands,
    getMcpListRoute,
    getMcpConfigRoute,
    saveMcpConfigRoute,
    getClaudeCodeMeta,
    getAvailableFeatures: getAvailableFeatures2,
    getAdaModels,
    switchAdaModel
  };
});
var ClaudeCodeController = class extends Context13.Tag("ClaudeCodeController")() {
  static {
    this.Live = Layer15.effect(this, LayerImpl11);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodePermissionController.ts
import { Context as Context15, Effect as Effect21, Layer as Layer17 } from "effect";

// src/server/core/claude-code/services/ClaudeCodePermissionService.ts
import { Context as Context14, Effect as Effect20, Layer as Layer16, Ref as Ref6 } from "effect";
import { ulid } from "ulid";
var LayerImpl12 = Effect20.gen(function* () {
  const pendingPermissionRequestsRef = yield* Ref6.make(/* @__PURE__ */ new Map());
  const permissionResponsesRef = yield* Ref6.make(/* @__PURE__ */ new Map());
  const eventBus = yield* EventBus;
  const waitPermissionResponse = (request, options) => Effect20.gen(function* () {
    const requestId = request.id;
    const waitEffect = Effect20.gen(function* () {
      yield* Ref6.update(pendingPermissionRequestsRef, (requests) => {
        requests.set(requestId, request);
        return requests;
      });
      yield* eventBus.emit("permissionRequested", {
        permissionRequest: request
      });
      let passedMs = 0;
      let response = null;
      while (passedMs < options.timeoutMs) {
        const responses = yield* Ref6.get(permissionResponsesRef);
        response = responses.get(requestId) ?? null;
        if (response !== null) {
          yield* Ref6.update(permissionResponsesRef, (responsesMap) => {
            responsesMap.delete(requestId);
            return responsesMap;
          });
          break;
        }
        yield* Effect20.sleep(1e3);
        passedMs += 1e3;
      }
      return response;
    });
    return yield* waitEffect.pipe(
      // Ensure no stale pending request remains after allow/deny/timeout.
      Effect20.ensuring(
        Ref6.update(pendingPermissionRequestsRef, (requests) => {
          requests.delete(requestId);
          return requests;
        })
      )
    );
  });
  const createCanUseToolRelatedOptions = (options) => {
    const { taskId, sessionProcessId, userConfig, sessionId } = options;
    return Effect20.gen(function* () {
      const claudeCodeConfig = yield* Config;
      if (!getAvailableFeatures(claudeCodeConfig.claudeCodeVersion).canUseTool) {
        return {
          permissionMode: "bypassPermissions"
        };
      }
      const canUseTool = async (toolName, toolInput, options2) => {
        if (toolName !== "AskUserQuestion" && userConfig.permissionMode !== "default") {
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
          sessionProcessId,
          sessionId,
          toolName,
          toolInput,
          toolUseId: options2.toolUseID,
          timestamp: Date.now()
        };
        const response = await Effect20.runPromise(
          waitPermissionResponse(permissionRequest, {
            // AskUserQuestion 需要用户阅读并手动回答，使用 30 分钟超时
            // 其他工具权限请求使用 60 秒超时
            timeoutMs: toolName === "AskUserQuestion" ? 30 * 60 * 1e3 : 6e4
          })
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
  const respondToPermissionRequest = (response) => Effect20.gen(function* () {
    yield* Ref6.update(permissionResponsesRef, (responses) => {
      responses.set(response.permissionRequestId, response);
      return responses;
    });
    yield* Ref6.update(pendingPermissionRequestsRef, (requests) => {
      requests.delete(response.permissionRequestId);
      return requests;
    });
  });
  const getPendingPermissionRequests = (options) => Effect20.gen(function* () {
    const requests = yield* Ref6.get(pendingPermissionRequestsRef);
    const allRequests = Array.from(requests.values());
    const filtered = allRequests.filter((request) => {
      if (options?.sessionId && request.sessionId !== options.sessionId) {
        return false;
      }
      if (options?.taskId && request.taskId !== options.taskId) {
        return false;
      }
      if (options?.sessionProcessId && request.sessionProcessId !== options.sessionProcessId) {
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
    getPendingPermissionRequests
  };
});
var ClaudeCodePermissionService = class extends Context14.Tag(
  "ClaudeCodePermissionService"
)() {
  static {
    this.Live = Layer16.effect(this, LayerImpl12);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodePermissionController.ts
var LayerImpl13 = Effect21.gen(function* () {
  const claudeCodePermissionService = yield* ClaudeCodePermissionService;
  const permissionResponse = (options) => Effect21.sync(() => {
    const { permissionResponse: permissionResponse2 } = options;
    Effect21.runFork(
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
  const pendingPermissionRequests = (options) => Effect21.gen(function* () {
    const requests = yield* claudeCodePermissionService.getPendingPermissionRequests(
      options
    );
    return {
      status: 200,
      response: {
        requests
      }
    };
  });
  return {
    permissionResponse,
    pendingPermissionRequests
  };
});
var ClaudeCodePermissionController = class extends Context15.Tag(
  "ClaudeCodePermissionController"
)() {
  static {
    this.Live = Layer17.effect(this, LayerImpl13);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeSessionProcessController.ts
import { Context as Context21, Effect as Effect28, Layer as Layer23 } from "effect";

// src/server/core/claude-code/services/ClaudeCodeLifeCycleService.ts
import { Context as Context20, Effect as Effect27, Layer as Layer22, Runtime as Runtime2 } from "effect";
import { ulid as ulid2 } from "ulid";

// src/lib/controllablePromise.ts
var controllablePromise = () => {
  let status = "pending";
  let promiseResolve = () => {
    throw new Error("Illegal state: Promise not created");
  };
  let promiseReject = () => {
    throw new Error("Illegal state: Promise not created");
  };
  let isInitialized = false;
  const promise = new Promise((resolve, reject) => {
    promiseResolve = (value) => {
      status = "resolved";
      resolve(value);
    };
    promiseReject = (reason) => {
      status = "rejected";
      reject(reason);
    };
    isInitialized = true;
  });
  if (!isInitialized) {
    throw new Error("Illegal state: Promise not created");
  }
  return {
    promise,
    resolve: promiseResolve,
    reject: promiseReject,
    get status() {
      return status;
    },
    set status(nextStatus) {
      status = nextStatus;
    }
  };
};

// src/server/core/claude-code/functions/parseUserMessage.ts
import { z as z23 } from "zod";
var regExp = /<(?<tag>[^>]+)>(?<content>[\s\S]*?)<\/\k<tag>>/g;
var matchSchema = z23.object({
  tag: z23.string(),
  content: z23.string()
});
var parsedUserMessageSchema = z23.union([
  z23.object({
    kind: z23.literal("command"),
    commandName: z23.string(),
    commandArgs: z23.string().optional(),
    commandMessage: z23.string().optional()
  }),
  z23.object({
    kind: z23.literal("local-command"),
    stdout: z23.string()
  }),
  z23.object({
    kind: z23.literal("text"),
    content: z23.string()
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

// src/lib/session-display.ts
var ignoredCommands = /* @__PURE__ */ new Set([
  "/clear",
  "/login",
  "/logout",
  "/exit",
  "/mcp",
  "/memory"
]);
var ignoredExactTexts = /* @__PURE__ */ new Set([
  "Caveat: The messages below were generated by the user while running local commands. DO NOT respond to these messages or otherwise consider them in your response unless the user explicitly asks you to.",
  "Warmup"
]);
var SESSION_TITLE_MAX_LENGTH = 40;
var normalizeTitleText = (text) => {
  const firstNonEmptyLine = text.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length > 0) ?? "";
  const normalized = firstNonEmptyLine.replace(/\s+/g, " ").trim();
  if (normalized.length <= SESSION_TITLE_MAX_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, SESSION_TITLE_MAX_LENGTH).trimEnd()}...`;
};
var extractFirstUserText = (conversation) => {
  if (conversation.type !== "user" || conversation.isSidechain === true) {
    return null;
  }
  const content = conversation.message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return null;
  }
  const firstContent = content.at(0);
  if (typeof firstContent === "string") {
    return firstContent;
  }
  if (firstContent && firstContent.type === "text" && typeof firstContent.text === "string") {
    return firstContent.text;
  }
  return null;
};
var toDisplayMessage = (rawText) => {
  if (ignoredExactTexts.has(rawText)) {
    return null;
  }
  const parsed = parseUserMessage(rawText);
  if (parsed.kind === "local-command") {
    return null;
  }
  if (parsed.kind === "command" && ignoredCommands.has(parsed.commandName)) {
    return null;
  }
  return parsed;
};
var firstUserMessageToTitle = (firstCommand) => {
  switch (firstCommand.kind) {
    case "command":
      if (firstCommand.commandArgs === void 0) {
        return normalizeTitleText(firstCommand.commandName);
      }
      return normalizeTitleText(
        `${firstCommand.commandName} ${firstCommand.commandArgs}`
      );
    case "local-command":
      return normalizeTitleText(firstCommand.stdout);
    case "text":
      return normalizeTitleText(firstCommand.content);
    default:
      firstCommand;
      throw new Error("Invalid first command");
  }
};
var getSessionTitleFromConversations = (conversations) => {
  for (const conversation of conversations) {
    const firstUserText = extractFirstUserText(conversation);
    if (firstUserText === null) {
      continue;
    }
    const parsed = toDisplayMessage(firstUserText);
    if (parsed === null) {
      continue;
    }
    return firstUserMessageToTitle(parsed);
  }
  return null;
};
var countVisibleSessionMessagesFromConversations = (conversations) => {
  return conversations.filter((conversation) => {
    if (conversation.type === "x-error") {
      return true;
    }
    if (conversation.type === "progress") {
      return false;
    }
    const isHiddenSidechain = conversation.type !== "summary" && conversation.type !== "file-history-snapshot" && conversation.type !== "queue-operation" && conversation.isSidechain === true;
    if (isHiddenSidechain) {
      return false;
    }
    if (conversation.type !== "user") {
      return true;
    }
    const content = conversation.message?.content;
    if (!Array.isArray(content)) {
      return true;
    }
    return content.some(
      (item) => typeof item === "string" || item.type !== "tool_result"
    );
  }).length;
};
var buildSessionDisplayMeta = (options) => {
  return {
    title: options.firstUserMessage !== null ? firstUserMessageToTitle(options.firstUserMessage) : options.sessionId,
    visibleMessageCount: options.visibleMessageCount
  };
};
var deriveSessionDisplayMetaFromConversations = (sessionId, conversations) => {
  return {
    title: getSessionTitleFromConversations(conversations) ?? sessionId,
    visibleMessageCount: countVisibleSessionMessagesFromConversations(conversations)
  };
};
var mergeSessionDisplayMetaWithVirtualConversations = (options) => {
  if (options.virtualConversations.length === 0) {
    return buildSessionDisplayMeta({
      sessionId: options.sessionId,
      firstUserMessage: options.firstUserMessage,
      visibleMessageCount: options.visibleMessageCount
    });
  }
  return {
    title: options.firstUserMessage !== null ? firstUserMessageToTitle(options.firstUserMessage) : getSessionTitleFromConversations(options.virtualConversations) ?? options.sessionId,
    visibleMessageCount: options.visibleMessageCount + countVisibleSessionMessagesFromConversations(
      options.virtualConversations
    )
  };
};

// src/server/core/session/constants/pricing.ts
var MODEL_PRICING = {
  "claude-sonnet-4.5": {
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
  }
};
var DEFAULT_MODEL_PRICING = MODEL_PRICING["claude-sonnet-4.5"];

// src/server/core/session/functions/calculateSessionCost.ts
function normalizeModelName(modelName) {
  const normalized = modelName.toLowerCase();
  if (normalized.includes("sonnet-4-5") || normalized.includes("sonnet-4.5") || normalized.includes("sonnet-4")) {
    return "claude-sonnet-4.5";
  }
  if (normalized.includes("haiku-4-5") || normalized.includes("haiku-4.5") || normalized.includes("haiku-4")) {
    return "claude-haiku-4.5";
  }
  return "claude-sonnet-4.5";
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

// src/server/core/session/functions/extractFirstUserText.ts
var extractFirstUserText2 = (conversation) => {
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
var extractFirstUserMessage = (conversation) => {
  if (conversation.type !== "user") {
    return void 0;
  }
  if (conversation.isSidechain === true) {
    return void 0;
  }
  const firstUserText = extractFirstUserText2(conversation);
  if (firstUserText === null) {
    return void 0;
  }
  const command = toDisplayMessage(firstUserText);
  if (command === null) {
    return void 0;
  }
  return command;
};

// src/server/core/session/functions/getVisibleSessionMeta.ts
var countVisibleConversations = (conversations) => {
  return countVisibleSessionMessagesFromConversations(conversations);
};
var getFirstVisibleUserMessage = (conversations) => {
  for (const conversation of conversations) {
    const firstUserMessage = extractFirstUserMessage(conversation);
    if (firstUserMessage !== void 0) {
      return firstUserMessage;
    }
  }
  return null;
};
var getLastConversationTimestamp = (conversations) => {
  let lastTimestamp = null;
  for (const conversation of conversations) {
    if (!("timestamp" in conversation) || typeof conversation.timestamp !== "string") {
      continue;
    }
    const timestamp = new Date(conversation.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
      continue;
    }
    if (lastTimestamp === null || timestamp > lastTimestamp) {
      lastTimestamp = timestamp;
    }
  }
  return lastTimestamp;
};
var aggregateVirtualTokenUsage = (conversations) => {
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreationTokens = 0;
  let totalCacheReadTokens = 0;
  let totalInputTokensUsd = 0;
  let totalOutputTokensUsd = 0;
  let totalCacheCreationUsd = 0;
  let totalCacheReadUsd = 0;
  let lastModelName = null;
  for (const conversation of conversations) {
    if (conversation.type !== "assistant") {
      continue;
    }
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
  return {
    modelName: lastModelName,
    cost: {
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
    }
  };
};
var mergeSessionMetaWithVirtualConversations = (meta, virtualConversations) => {
  if (virtualConversations.length === 0) {
    return meta;
  }
  const virtualStats = aggregateVirtualTokenUsage(virtualConversations);
  return {
    ...meta,
    messageCount: meta.messageCount + countVisibleConversations(virtualConversations),
    firstUserMessage: meta.firstUserMessage ?? getFirstVisibleUserMessage(virtualConversations),
    modelName: meta.modelName ?? virtualStats.modelName,
    cost: {
      totalUsd: meta.cost.totalUsd + virtualStats.cost.totalUsd,
      breakdown: {
        inputTokensUsd: meta.cost.breakdown.inputTokensUsd + virtualStats.cost.breakdown.inputTokensUsd,
        outputTokensUsd: meta.cost.breakdown.outputTokensUsd + virtualStats.cost.breakdown.outputTokensUsd,
        cacheCreationUsd: meta.cost.breakdown.cacheCreationUsd + virtualStats.cost.breakdown.cacheCreationUsd,
        cacheReadUsd: meta.cost.breakdown.cacheReadUsd + virtualStats.cost.breakdown.cacheReadUsd
      },
      tokenUsage: {
        inputTokens: meta.cost.tokenUsage.inputTokens + virtualStats.cost.tokenUsage.inputTokens,
        outputTokens: meta.cost.tokenUsage.outputTokens + virtualStats.cost.tokenUsage.outputTokens,
        cacheCreationTokens: meta.cost.tokenUsage.cacheCreationTokens + virtualStats.cost.tokenUsage.cacheCreationTokens,
        cacheReadTokens: meta.cost.tokenUsage.cacheReadTokens + virtualStats.cost.tokenUsage.cacheReadTokens
      }
    },
    isCostPending: true
  };
};

// src/server/core/session/infrastructure/SessionRepository.ts
import { FileSystem as FileSystem12, Path as Path14 } from "@effect/platform";
import { Context as Context19, Effect as Effect26, Layer as Layer21, Option as Option3 } from "effect";

// src/server/core/session/functions/id.ts
import path4 from "node:path";
var encodeSessionId = (jsonlFilePath) => {
  const fileName = path4.basename(jsonlFilePath);
  return fileName.endsWith(".jsonl") ? fileName.slice(0, -".jsonl".length) : fileName;
};
var decodeSessionId = (projectId, sessionId) => {
  const projectPath = decodeProjectId(projectId);
  return path4.join(projectPath, `${sessionId}.jsonl`);
};

// src/server/core/session/functions/isRegularSessionFile.ts
var isRegularSessionFile = (filename) => filename.endsWith(".jsonl") && !filename.startsWith("agent-");

// src/server/core/session/infrastructure/VirtualConversationDatabase.ts
import { Context as Context16, Effect as Effect22, Layer as Layer18, Ref as Ref7 } from "effect";
var VirtualConversationDatabase = class extends Context16.Tag(
  "VirtualConversationDatabase"
)() {
  static {
    this.Live = Layer18.effect(
      this,
      Effect22.gen(function* () {
        const storageRef = yield* Ref7.make([]);
        const getProjectVirtualConversations = (projectId) => Effect22.gen(function* () {
          const conversations = yield* Ref7.get(storageRef);
          return conversations.filter(
            (conversation) => conversation.projectId === projectId
          );
        });
        const getSessionVirtualConversation = (sessionId) => Effect22.gen(function* () {
          const conversations = yield* Ref7.get(storageRef);
          return conversations.find(
            (conversation) => conversation.sessionId === sessionId
          ) ?? null;
        });
        const createVirtualConversation2 = (projectId, sessionId, createConversations) => Effect22.gen(function* () {
          yield* Ref7.update(storageRef, (conversations) => {
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
        const deleteVirtualConversations = (sessionId) => Effect22.gen(function* () {
          yield* Ref7.update(storageRef, (conversations) => {
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

// src/server/core/session/services/SessionLiveDisplayService.ts
import { Context as Context17, Effect as Effect23, Layer as Layer19, Ref as Ref8 } from "effect";
var isSessionLiveDisplayCaughtUp = (options) => {
  if (options.meta.firstUserMessage === null) {
    return false;
  }
  const persistedDisplayMeta = buildSessionDisplayMeta({
    sessionId: options.liveDisplay.sessionId,
    firstUserMessage: options.meta.firstUserMessage,
    visibleMessageCount: options.meta.messageCount
  });
  return persistedDisplayMeta.title === options.liveDisplay.displayMeta.title && options.meta.messageCount >= options.liveDisplay.displayMeta.visibleMessageCount;
};
var SessionLiveDisplayService = class extends Context17.Tag(
  "SessionLiveDisplayService"
)() {
  static {
    this.Live = Layer19.effect(
      this,
      Effect23.gen(function* () {
        const storageRef = yield* Ref8.make([]);
        const getProjectSessionLiveDisplays = (projectId) => Effect23.gen(function* () {
          const displays = yield* Ref8.get(storageRef);
          return displays.filter((display) => display.projectId === projectId);
        });
        const getSessionLiveDisplay = (sessionId) => Effect23.gen(function* () {
          const displays = yield* Ref8.get(storageRef);
          return displays.find((display) => display.sessionId === sessionId) ?? null;
        });
        const upsertSessionLiveDisplay = (display) => Effect23.gen(function* () {
          const nextDisplay = {
            ...display,
            updatedAt: display.updatedAt ?? /* @__PURE__ */ new Date()
          };
          yield* Ref8.update(storageRef, (displays) => {
            const remainingDisplays = displays.filter(
              (item) => item.sessionId !== display.sessionId
            );
            return [...remainingDisplays, nextDisplay];
          });
        });
        const deleteSessionLiveDisplay = (sessionId) => Effect23.gen(function* () {
          yield* Ref8.update(
            storageRef,
            (displays) => displays.filter((display) => display.sessionId !== sessionId)
          );
        });
        return {
          getProjectSessionLiveDisplays,
          getSessionLiveDisplay,
          upsertSessionLiveDisplay,
          deleteSessionLiveDisplay
        };
      })
    );
  }
};

// src/server/core/session/services/SessionMetaService.ts
import { FileSystem as FileSystem11, Path as Path13 } from "@effect/platform";
import { Context as Context18, Effect as Effect25, Layer as Layer20, Ref as Ref9 } from "effect";

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
  let lastModelName = "claude-sonnet-4.5";
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
import { FileSystem as FileSystem10, Path as Path12 } from "@effect/platform";
import { Effect as Effect24 } from "effect";
var getAgentSessionFilesForSession = (projectPath, sessionId) => Effect24.gen(function* () {
  const fs = yield* FileSystem10.FileSystem;
  const path5 = yield* Path12.Path;
  const isValidAgentFile = (filePath, expectedSessionId) => Effect24.gen(function* () {
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
  }).pipe(Effect24.catchAll(() => Effect24.succeed(false)));
  const matchingFilePaths = [];
  const rootEntries = yield* fs.readDirectory(projectPath);
  const rootAgentFiles = rootEntries.filter(
    (filename) => filename.startsWith("agent-") && filename.endsWith(".jsonl")
  );
  for (const agentFile of rootAgentFiles) {
    const filePath = path5.join(projectPath, agentFile);
    if (yield* isValidAgentFile(filePath, sessionId)) {
      matchingFilePaths.push(filePath);
    }
  }
  const subagentsDir = path5.join(projectPath, sessionId, "subagents");
  const subagentsDirExists = yield* fs.exists(subagentsDir);
  if (subagentsDirExists) {
    const subagentEntries = yield* fs.readDirectory(subagentsDir).pipe(
      Effect24.catchAll(() => Effect24.succeed([]))
      // Handle permission or other errors gracefully
    );
    const subagentFiles = subagentEntries.filter(
      (filename) => filename.startsWith("agent-") && filename.endsWith(".jsonl")
    );
    for (const agentFile of subagentFiles) {
      const filePath = path5.join(subagentsDir, agentFile);
      if (yield* isValidAgentFile(filePath, void 0)) {
        matchingFilePaths.push(filePath);
      }
    }
  }
  return matchingFilePaths;
});

// src/server/core/session/services/SessionMetaService.ts
var parsedUserMessageOrNullSchema = parsedUserMessageSchema.nullable();
var SessionMetaService = class extends Context18.Tag("SessionMetaService")() {
  static {
    this.Live = Layer20.effect(
      this,
      Effect25.gen(function* () {
        const fs = yield* FileSystem11.FileSystem;
        const path5 = yield* Path13.Path;
        const firstUserMessageCache = yield* FileCacheStorage();
        const sessionMetaCacheRef = yield* Ref9.make(
          /* @__PURE__ */ new Map()
        );
        const getFirstUserMessage = (jsonlFilePath, lines) => Effect25.gen(function* () {
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
        const getSessionMeta = (projectId, sessionId) => Effect25.gen(function* () {
          const metaCache = yield* Ref9.get(sessionMetaCacheRef);
          const cached = metaCache.get(sessionId);
          if (cached !== void 0) {
            return cached;
          }
          const sessionPath = decodeSessionId(projectId, sessionId);
          const content = yield* fs.readFileString(sessionPath);
          const lines = content.split("\n").filter((line) => line.trim().length > 0);
          const conversations = parseJsonl(content);
          const firstUserMessage = yield* getFirstUserMessage(
            sessionPath,
            lines
          );
          const projectPath = path5.dirname(sessionPath);
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
            Effect25.provide(Layer20.succeed(FileSystem11.FileSystem, fs)),
            Effect25.provide(Layer20.succeed(Path13.Path, path5))
          ) : [];
          const agentContents = [];
          for (const agentPath of agentFilePaths) {
            const agentContent = yield* fs.readFileString(agentPath).pipe(Effect25.catchAll(() => Effect25.succeed("")));
            if (agentContent !== "") {
              agentContents.push(agentContent);
            }
          }
          const fileContents = [content, ...agentContents];
          const { totalCost, modelName } = aggregateTokenUsageAndCost(fileContents);
          const sessionMeta = {
            messageCount: countVisibleConversations(conversations),
            firstUserMessage,
            cost: {
              totalUsd: totalCost.totalUsd,
              breakdown: totalCost.breakdown,
              tokenUsage: totalCost.tokenUsage
            },
            modelName,
            isCostPending: false
          };
          yield* Ref9.update(sessionMetaCacheRef, (cache) => {
            cache.set(sessionId, sessionMeta);
            return cache;
          });
          return sessionMeta;
        });
        const invalidateSession = (_projectId, sessionId) => Effect25.gen(function* () {
          yield* Ref9.update(sessionMetaCacheRef, (cache) => {
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
      Layer20.provide(
        makeFileCacheStorageLayer(
          "first-user-message-cache",
          parsedUserMessageOrNullSchema
        )
      ),
      Layer20.provide(PersistentService.Live)
    );
  }
};

// src/server/core/session/infrastructure/SessionRepository.ts
var LayerImpl14 = Effect26.gen(function* () {
  const fs = yield* FileSystem12.FileSystem;
  const path5 = yield* Path14.Path;
  const sessionMetaService = yield* SessionMetaService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const sessionLiveDisplayService = yield* SessionLiveDisplayService;
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
    modelName: null,
    isCostPending: false
  });
  const createDisplayMetaFromMeta = (options) => {
    return mergeSessionDisplayMetaWithVirtualConversations({
      sessionId: options.sessionId,
      firstUserMessage: options.meta.firstUserMessage,
      visibleMessageCount: options.meta.messageCount,
      virtualConversations: options.virtualConversations ?? []
    });
  };
  const mergeSessionMetaWithLiveDisplay = (meta, liveDisplay) => {
    if (liveDisplay === null || isSessionLiveDisplayCaughtUp({
      meta,
      liveDisplay
    })) {
      return meta;
    }
    return {
      ...meta,
      messageCount: Math.max(
        meta.messageCount,
        liveDisplay.displayMeta.visibleMessageCount
      ),
      firstUserMessage: meta.firstUserMessage ?? liveDisplay.firstUserMessage,
      isCostPending: true
    };
  };
  const resolveDisplayMeta = (options) => {
    const baseDisplayMeta = createDisplayMetaFromMeta({
      sessionId: options.sessionId,
      meta: options.meta,
      virtualConversations: options.virtualConversations
    });
    if (options.liveDisplay === null || isSessionLiveDisplayCaughtUp({
      meta: options.meta,
      liveDisplay: options.liveDisplay
    })) {
      return baseDisplayMeta;
    }
    return options.liveDisplay.displayMeta;
  };
  const getLatestDate = (baseDate, candidates) => {
    return candidates.reduce((latest, current) => {
      if (current === null || current <= latest) {
        return latest;
      }
      return current;
    }, baseDate);
  };
  const getUserText = (conversation) => {
    if (conversation.type !== "user") {
      return null;
    }
    const content = conversation.message.content;
    if (typeof content === "string") {
      return content;
    }
    if (!Array.isArray(content)) {
      return null;
    }
    const parts = [];
    for (const item of content) {
      if (typeof item === "string") {
        parts.push(item);
        continue;
      }
      if (item.type === "text" && typeof item.text === "string") {
        parts.push(item.text);
      }
    }
    if (parts.length === 0) {
      return null;
    }
    return parts.join("");
  };
  const normalizeUserTextForDedup = (text) => {
    const parsed = parseUserMessage(text);
    if (parsed.kind === "command") {
      return parsed.commandName;
    }
    if (parsed.kind === "local-command") {
      return parsed.stdout;
    }
    return parsed.content;
  };
  const filterVirtualConversations = (conversations, virtualConversations, windowMs) => {
    if (virtualConversations.length === 0 || conversations.length === 0) {
      return virtualConversations;
    }
    const diskUserMessages = conversations.flatMap((conversation) => {
      if (conversation.type !== "user") {
        return [];
      }
      const text = getUserText(conversation);
      if (text === null) {
        return [];
      }
      const timestamp = new Date(conversation.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return [];
      }
      return [{ text, timestamp }];
    });
    if (diskUserMessages.length === 0) {
      return virtualConversations;
    }
    return virtualConversations.filter((conversation) => {
      if (conversation.type !== "user") {
        return true;
      }
      if (!conversation.uuid.startsWith("vc__")) {
        return true;
      }
      const text = getUserText(conversation);
      if (text === null) {
        return true;
      }
      const timestamp = new Date(conversation.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return true;
      }
      const isDuplicate = diskUserMessages.some((disk) => {
        const normalizedDisk = normalizeUserTextForDedup(disk.text);
        const normalizedVirtual = normalizeUserTextForDedup(text);
        if (normalizedDisk !== normalizedVirtual) {
          return false;
        }
        const diff = Math.abs(disk.timestamp.getTime() - timestamp.getTime());
        return diff <= windowMs;
      });
      return !isDuplicate;
    });
  };
  const getDisplayConversations = (conversations, virtualConversations) => {
    const mergedConversations = [...conversations, ...virtualConversations];
    const conversationMap = new Map(
      mergedConversations.flatMap((conversation, index) => {
        if (conversation.type === "user" || conversation.type === "assistant" || conversation.type === "system") {
          return [[conversation.uuid, { index }]];
        }
        return [];
      })
    );
    const isBroken = mergedConversations.some((conversation, index) => {
      if (conversation.type !== "summary") {
        return false;
      }
      const leafMessage = conversationMap.get(conversation.leafUuid);
      if (leafMessage === void 0) {
        return false;
      }
      return index < leafMessage.index;
    });
    return isBroken ? conversations : mergedConversations;
  };
  const getSession = (projectId, sessionId) => Effect26.gen(function* () {
    const sessionPath = decodeSessionId(projectId, sessionId);
    const virtualConversation = yield* virtualConversationDatabase.getSessionVirtualConversation(
      sessionId
    );
    const liveDisplay = yield* sessionLiveDisplayService.getSessionLiveDisplay(sessionId);
    const exists = yield* fs.exists(sessionPath);
    const sessionDetail = yield* exists ? Effect26.gen(function* () {
      const content = yield* fs.readFileString(sessionPath);
      const allLines = content.split("\n").filter((line) => line.trim());
      const conversations = parseJsonl(allLines.join("\n"));
      const virtualConversations = virtualConversation === null ? [] : filterVirtualConversations(
        conversations,
        virtualConversation.conversations,
        5e3
      );
      const stat = yield* fs.stat(sessionPath);
      const meta = yield* sessionMetaService.getSessionMeta(projectId, sessionId).pipe(
        Effect26.catchAll((error) => {
          console.error(
            `[SessionRepository] Failed to get meta for session ${sessionId}:`,
            error
          );
          return Effect26.succeed(createDefaultSessionMeta());
        })
      );
      const mergedMeta = virtualConversation !== null ? mergeSessionMetaWithVirtualConversations(
        meta,
        virtualConversations
      ) : meta;
      const visibleMeta = mergeSessionMetaWithLiveDisplay(
        mergedMeta,
        liveDisplay
      );
      const displayConversations = getDisplayConversations(
        conversations,
        virtualConversations
      );
      const sessionDetail2 = {
        id: sessionId,
        jsonlFilePath: sessionPath,
        displayMeta: resolveDisplayMeta({
          sessionId,
          meta: mergedMeta,
          liveDisplay
        }),
        meta: visibleMeta,
        conversations: displayConversations,
        lastModifiedAt: Option3.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date())
      };
      return sessionDetail2;
    }) : (() => {
      if (virtualConversation === null) {
        return Effect26.succeed(null);
      }
      const lastConversation = virtualConversation.conversations.filter(
        (conversation) => conversation.type === "user" || conversation.type === "assistant" || conversation.type === "system"
      ).at(-1);
      const virtualStats = aggregateVirtualTokenUsage(
        virtualConversation.conversations
      );
      const virtualSession = {
        id: sessionId,
        jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
        displayMeta: deriveSessionDisplayMetaFromConversations(
          sessionId,
          virtualConversation.conversations
        ),
        meta: {
          messageCount: countVisibleConversations(
            virtualConversation.conversations
          ),
          firstUserMessage: getFirstVisibleUserMessage(
            virtualConversation.conversations
          ),
          cost: virtualStats.cost,
          modelName: virtualStats.modelName,
          isCostPending: true
        },
        conversations: virtualConversation.conversations,
        lastModifiedAt: lastConversation !== void 0 ? new Date(lastConversation.timestamp) : /* @__PURE__ */ new Date()
      };
      return Effect26.succeed(virtualSession);
    })();
    return {
      session: sessionDetail
    };
  });
  const buildPersistedSessionListItem = (options) => Effect26.gen(function* () {
    const meta = yield* sessionMetaService.getSessionMeta(options.projectId, options.item.id).pipe(
      Effect26.catchAll((error) => {
        console.error(
          `[SessionRepository] Failed to get meta for session ${options.item.id}:`,
          error
        );
        return Effect26.succeed(createDefaultSessionMeta());
      })
    );
    const mergedMeta = mergeSessionMetaWithVirtualConversations(
      meta,
      options.virtualConversationsForSession
    );
    const visibleMeta = mergeSessionMetaWithLiveDisplay(
      mergedMeta,
      options.liveDisplay
    );
    const displayMeta = resolveDisplayMeta({
      sessionId: options.item.id,
      meta: mergedMeta,
      liveDisplay: options.liveDisplay
    });
    const virtualLastTimestamp = getLastConversationTimestamp(
      options.virtualConversationsForSession
    );
    return {
      ...options.item,
      displayMeta,
      lastModifiedAt: getLatestDate(options.item.lastModifiedAt, [
        virtualLastTimestamp,
        options.liveDisplay?.updatedAt ?? null
      ]),
      meta: visibleMeta
    };
  });
  const getSessions = (projectId, options) => Effect26.gen(function* () {
    const { maxCount = 20, cursor } = options ?? {};
    const claudeProjectPath = decodeProjectId(projectId);
    const dirExists = yield* fs.exists(claudeProjectPath);
    if (!dirExists) {
      console.warn(`Project directory not found at ${claudeProjectPath}`);
      return { sessions: [] };
    }
    const dirents = yield* Effect26.tryPromise({
      try: () => fs.readDirectory(claudeProjectPath).pipe(Effect26.runPromise),
      catch: (error) => {
        console.warn(
          `Failed to read sessions for project ${projectId}:`,
          error
        );
        return new Error("Failed to read directory");
      }
    }).pipe(Effect26.catchAll(() => Effect26.succeed([])));
    const sessionEffects = dirents.filter(isRegularSessionFile).map(
      (entry) => Effect26.gen(function* () {
        const fullPath = path5.resolve(claudeProjectPath, entry);
        const sessionId = encodeSessionId(fullPath);
        const stat = yield* Effect26.tryPromise(
          () => fs.stat(fullPath).pipe(Effect26.runPromise)
        ).pipe(Effect26.catchAll(() => Effect26.succeed(null)));
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
    const sessionsWithNulls = yield* Effect26.all(sessionEffects, {
      concurrency: 10
    });
    const sessions = sessionsWithNulls.filter((s) => s !== null).sort(
      (a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime()
    );
    const sessionMap = new Map(
      sessions.map((session) => [session.id, session])
    );
    const virtualConversations = yield* virtualConversationDatabase.getProjectVirtualConversations(
      projectId
    );
    const virtualConversationMap = new Map(
      virtualConversations.map(
        (item) => [item.sessionId, item.conversations]
      )
    );
    const liveDisplays = yield* sessionLiveDisplayService.getProjectSessionLiveDisplays(
      projectId
    );
    const liveDisplayMap = new Map(
      liveDisplays.map((item) => [item.sessionId, item])
    );
    const index = cursor !== void 0 ? sessions.findIndex((session) => session.id === cursor) : -1;
    if (index !== -1) {
      const sessionsToReturn2 = sessions.slice(
        index + 1,
        Math.min(index + 1 + maxCount, sessions.length)
      );
      const sessionsWithMeta2 = yield* Effect26.all(
        sessionsToReturn2.map(
          (item) => buildPersistedSessionListItem({
            projectId,
            item,
            virtualConversationsForSession: virtualConversationMap.get(item.id) ?? [],
            liveDisplay: liveDisplayMap.get(item.id) ?? null
          })
        ),
        { concurrency: 10 }
      );
      return {
        sessions: sessionsWithMeta2
      };
    }
    const virtualSessions = virtualConversations.filter(({ sessionId }) => !sessionMap.has(sessionId)).map(({ sessionId, conversations }) => {
      const firstUserMessage = getFirstVisibleUserMessage(conversations);
      const last = getLastConversationTimestamp(conversations);
      const virtualStats = aggregateVirtualTokenUsage(conversations);
      return {
        id: sessionId,
        jsonlFilePath: `${decodeProjectId(projectId)}/${sessionId}.jsonl`,
        lastModifiedAt: last ?? /* @__PURE__ */ new Date(),
        displayMeta: buildSessionDisplayMeta({
          sessionId,
          firstUserMessage,
          visibleMessageCount: countVisibleConversations(conversations)
        }),
        meta: {
          messageCount: countVisibleConversations(conversations),
          firstUserMessage,
          cost: virtualStats.cost,
          modelName: virtualStats.modelName,
          isCostPending: true
        }
      };
    }).sort((a, b) => {
      return b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime();
    });
    const sessionsToReturn = sessions.slice(
      0,
      Math.min(maxCount, sessions.length)
    );
    const sessionsWithMeta = yield* Effect26.all(
      sessionsToReturn.map(
        (item) => buildPersistedSessionListItem({
          projectId,
          item,
          virtualConversationsForSession: virtualConversationMap.get(item.id) ?? [],
          liveDisplay: liveDisplayMap.get(item.id) ?? null
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
var SessionRepository = class extends Context19.Tag("SessionRepository")() {
  static {
    this.Live = Layer21.effect(this, LayerImpl14);
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

// src/server/core/claude-code/services/ClaudeCodeLifeCycleService.ts
var LayerImpl15 = Effect27.gen(function* () {
  const eventBusService = yield* EventBus;
  const sessionRepository = yield* SessionRepository;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const virtualConversationDatabase = yield* VirtualConversationDatabase;
  const sessionLiveDisplayService = yield* SessionLiveDisplayService;
  const permissionService = yield* ClaudeCodePermissionService;
  const runtime = yield* Effect27.runtime();
  const snapshotLiveDisplay = (options) => Effect27.gen(function* () {
    const sessionSnapshot = yield* sessionRepository.getSession(
      options.projectId,
      options.sessionId
    );
    if (sessionSnapshot.session !== null) {
      return {
        projectId: options.projectId,
        sessionId: options.sessionId,
        displayMeta: sessionSnapshot.session.displayMeta,
        firstUserMessage: sessionSnapshot.session.meta.firstUserMessage
      };
    }
    const virtualConversation = yield* virtualConversationDatabase.getSessionVirtualConversation(
      options.sessionId
    );
    if (virtualConversation === null) {
      return null;
    }
    const firstUserMessage = getFirstVisibleUserMessage(
      virtualConversation.conversations
    );
    return {
      projectId: options.projectId,
      sessionId: options.sessionId,
      displayMeta: buildSessionDisplayMeta({
        sessionId: options.sessionId,
        firstUserMessage,
        visibleMessageCount: countVisibleConversations(virtualConversation.conversations) + 1
      }),
      firstUserMessage
    };
  });
  const continueTask = (options) => {
    const { sessionProcessId, baseSessionId, input } = options;
    return Effect27.gen(function* () {
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
    return Effect27.gen(function* () {
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
          Effect27.runFork(
            sessionProcessService.toNotInitializedState({
              sessionProcessId: sessionProcess.def.sessionProcessId,
              rawUserMessage: input2.text
            })
          );
        }
      });
      const handleMessage = (message) => Effect27.gen(function* () {
        const processState = yield* sessionProcessService.getSessionProcess(
          sessionProcess.def.sessionProcessId
        );
        if (processState.type === "completed") {
          return "break";
        }
        if (processState.type === "paused") {
          return yield* Effect27.die(
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
          yield* eventBusService.emit("initializationProgress", {
            message: "\u4F1A\u8BDD\u8FDE\u63A5\u5EFA\u7ACB\u6210\u529F",
            stage: "success"
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
          const sessionSnapshot = yield* snapshotLiveDisplay({
            projectId: processState.def.projectId,
            sessionId: message.session_id
          });
          if (sessionSnapshot !== null) {
            yield* sessionLiveDisplayService.upsertSessionLiveDisplay({
              projectId: processState.def.projectId,
              sessionId: message.session_id,
              displayMeta: sessionSnapshot.displayMeta,
              firstUserMessage: sessionSnapshot.firstUserMessage
            });
          }
          yield* virtualConversationDatabase.deleteVirtualConversations(
            message.session_id
          );
          yield* eventBusService.emit("virtualConversationUpdated", {
            projectId: processState.def.projectId,
            sessionId: message.session_id
          });
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
            Effect27.gen(function* () {
              yield* eventBusService.emit("initializationProgress", {
                message: "\u6B63\u5728\u521D\u59CB\u5316\u4F1A\u8BDD\u73AF\u5883...",
                stage: "loading"
              });
              const permissionOptions = yield* permissionService.createCanUseToolRelatedOptions({
                taskId: task.def.taskId,
                sessionProcessId: sessionProcess.def.sessionProcessId,
                userConfig,
                sessionId: task.def.baseSessionId
              });
              const settingsEnv = yield* readClaudeSettingsEnv;
              const normalizedEnv = { ...settingsEnv, ...process.env };
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
          Effect27.runFork(
            eventBusService.emit("initializationProgress", {
              message: "\u6B63\u5728\u5EFA\u7ACB MCP server \u8FDE\u63A5...",
              stage: "loading"
            })
          );
          setNextMessage(input);
          for await (const message of messageIter) {
            if (message.type === "assistant" && "message" in message && message.message?.content) {
              const content = message.message.content;
              const toolNames = (Array.isArray(content) ? content : []).filter((block) => block.type === "tool_use").map((t) => t.name);
              if (toolNames.length > 0) {
                console.log(`[SpecForge:tool-use] ${toolNames.join(", ")}`);
              }
            }
            if (sessionProcess.def.abortController.signal.aborted) {
              break;
            }
            const result = await Runtime2.runPromise(runtime)(
              handleMessage(message)
            ).catch((error) => {
              if (sessionProcess.def.abortController.signal.aborted) {
                return "continue";
              }
              Effect27.runFork(
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
          await Effect27.runPromise(
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
        Effect27.runFork(
          Effect27.gen(function* () {
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
        yieldSessionInitialized: () => Effect27.promise(() => sessionInitializedPromise.promise),
        yieldSessionFileCreated: () => Effect27.promise(() => sessionFileCreatedPromise.promise)
      };
    });
  };
  const getPublicSessionProcesses = () => Effect27.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    return processes.filter((process2) => isPublic(process2));
  });
  const abortTask = (sessionProcessId) => Effect27.gen(function* () {
    const currentProcess = yield* sessionProcessService.getSessionProcess(sessionProcessId);
    if (currentProcess.type === "completed") {
      return;
    }
    currentProcess.def.abortController.abort();
    yield* Effect27.sleep("100 millis");
    const latestProcess = yield* sessionProcessService.getSessionProcess(sessionProcessId);
    if (latestProcess.type !== "completed") {
      yield* sessionProcessService.toCompletedState({
        sessionProcessId: currentProcess.def.sessionProcessId,
        error: new Error("Task aborted")
      });
    }
  });
  const abortAllTasks = () => Effect27.gen(function* () {
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
var ClaudeCodeLifeCycleService = class extends Context20.Tag(
  "ClaudeCodeLifeCycleService"
)() {
  static {
    this.Live = Layer22.effect(this, LayerImpl15);
  }
};

// src/server/core/claude-code/presentation/ClaudeCodeSessionProcessController.ts
var LayerImpl16 = Effect28.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const userConfigService = yield* UserConfigService;
  const getSessionProcesses = () => Effect28.gen(function* () {
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
  const createSessionProcess = (options) => Effect28.gen(function* () {
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
  const continueSessionProcess = (options) => Effect28.gen(function* () {
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
  const abortSessionProcess = (options) => Effect28.gen(function* () {
    const { projectId, sessionProcessId } = options;
    const publicSessionProcesses = yield* claudeCodeLifeCycleService.getPublicSessionProcesses();
    const targetProcess = publicSessionProcesses.find(
      (process2) => process2.def.projectId === projectId && process2.def.sessionProcessId === sessionProcessId
    );
    if (targetProcess === void 0) {
      return {
        response: { error: "Session process not found" },
        status: 404
      };
    }
    yield* claudeCodeLifeCycleService.abortTask(sessionProcessId);
    return {
      response: { message: "Task aborted" },
      status: 200
    };
  });
  return {
    getSessionProcesses,
    createSessionProcess,
    continueSessionProcess,
    abortSessionProcess
  };
});
var ClaudeCodeSessionProcessController = class extends Context21.Tag(
  "ClaudeCodeSessionProcessController"
)() {
  static {
    this.Live = Layer23.effect(this, LayerImpl16);
  }
};

// src/server/core/d2c/presentation/D2CPreviewController.ts
import { Context as Context23, Effect as Effect31, Layer as Layer25 } from "effect";

// src/server/core/d2c/services/D2CPreviewService.ts
import { Command as Command3, CommandExecutor, FileSystem as FileSystem13, Path as Path16 } from "@effect/platform";
import { Context as Context22, Data as Data5, Duration, Effect as Effect30, Layer as Layer24 } from "effect";

// src/server/core/d2c/services/d2cPreviewArtifacts.ts
var listArtifactsFromEntries = (options) => options.entries.filter((entry) => entry.isDir && entry.hasTsx && entry.hasScss).map((entry) => ({
  id: entry.name,
  title: entry.name,
  description: entry.description
})).sort((a, b) => a.title.localeCompare(b.title));

// src/server/core/d2c/services/d2cPreviewCorehash.ts
import { createHash } from "node:crypto";
import * as ts from "typescript";
var serializeCorehashMap = (corehashMap) => JSON.stringify(corehashMap, null, 2);
var isDataCorehashAttribute = (attr) => {
  if (!ts.isJsxAttribute(attr)) return false;
  const name = attr.name;
  return ts.isIdentifier(name) && name.text === "data-corehash";
};
var readExistingCorehash = (attrs) => {
  for (const attr of attrs.properties) {
    if (!isDataCorehashAttribute(attr)) continue;
    if (!ts.isJsxAttribute(attr)) continue;
    const initializer = attr.initializer;
    if (!initializer || !ts.isStringLiteral(initializer)) continue;
    return initializer.text;
  }
  return void 0;
};
var createCorehash = (seed, index) => {
  const hash = createHash("sha1");
  hash.update(`${seed}#${index}`);
  return hash.digest("hex").slice(0, 8);
};
var buildCorehashInjection = (params) => {
  const sourceFile = ts.createSourceFile(
    params.filename,
    params.sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const corehashMap = /* @__PURE__ */ new Map();
  let seedIndex = 0;
  const buildInfo = (node, _corehash) => {
    const startPos = node.getStart(sourceFile);
    const endPos = node.getEnd();
    const startLine = sourceFile.getLineAndCharacterOfPosition(startPos).line + 1;
    const endLine = sourceFile.getLineAndCharacterOfPosition(endPos).line + 1;
    const nodeCode = node.getText(sourceFile);
    return {
      filename: params.filename,
      fileDir: params.fileDir,
      line: startLine,
      endLine,
      nodeCode,
      nodeStartLine: startLine,
      nodeEndLine: endLine
    };
  };
  const registerCorehash = (node, corehash) => {
    if (!corehashMap.has(corehash)) {
      corehashMap.set(corehash, buildInfo(node, corehash));
      return corehash;
    }
    seedIndex += 1;
    const fallback = createCorehash(`${corehash}#${node.pos}`, seedIndex);
    if (!corehashMap.has(fallback)) {
      corehashMap.set(fallback, buildInfo(node, fallback));
      return fallback;
    }
    seedIndex += 1;
    const secondFallback = createCorehash(`${corehash}#${node.end}`, seedIndex);
    corehashMap.set(secondFallback, buildInfo(node, secondFallback));
    return secondFallback;
  };
  const addCorehashAttribute = (attrs, corehash) => {
    if (readExistingCorehash(attrs)) return attrs;
    const newAttr = ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("data-corehash"),
      ts.factory.createStringLiteral(corehash)
    );
    return ts.factory.createJsxAttributes([...attrs.properties, newAttr]);
  };
  const visit = (context) => {
    const visitor = (node) => {
      if (ts.isJsxElement(node)) {
        const attrs = node.openingElement.attributes;
        const existing = readExistingCorehash(attrs);
        const seed = `${params.fileDir}:${node.pos}:${node.end}`;
        const corehash = registerCorehash(
          node,
          existing ?? createCorehash(seed, seedIndex)
        );
        const nextAttrs = addCorehashAttribute(attrs, corehash);
        const updatedNode = nextAttrs !== attrs ? ts.factory.updateJsxElement(
          node,
          ts.factory.updateJsxOpeningElement(
            node.openingElement,
            node.openingElement.tagName,
            node.openingElement.typeArguments,
            nextAttrs
          ),
          node.children,
          node.closingElement
        ) : node;
        return ts.visitEachChild(updatedNode, visitor, context);
      }
      if (ts.isJsxSelfClosingElement(node)) {
        const attrs = node.attributes;
        const existing = readExistingCorehash(attrs);
        const seed = `${params.fileDir}:${node.pos}:${node.end}`;
        const corehash = registerCorehash(
          node,
          existing ?? createCorehash(seed, seedIndex)
        );
        const nextAttrs = addCorehashAttribute(attrs, corehash);
        if (nextAttrs !== attrs) {
          return ts.factory.updateJsxSelfClosingElement(
            node,
            node.tagName,
            node.typeArguments,
            nextAttrs
          );
        }
        return node;
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return (node) => ts.visitNode(node, visitor);
  };
  const result = ts.transform(sourceFile, [visit]);
  const transformed = result.transformed[0];
  result.dispose();
  if (!transformed || !ts.isSourceFile(transformed)) {
    return {
      injectedCode: params.sourceText,
      corehashMap: {}
    };
  }
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const injectedCode = printer.printFile(transformed);
  const corehashMapRecord = {};
  for (const [key, value] of corehashMap.entries()) {
    corehashMapRecord[key] = JSON.stringify(value);
  }
  return {
    injectedCode,
    corehashMap: corehashMapRecord
  };
};

// src/server/core/d2c/services/d2cPreviewPaths.ts
import { Path as Path15 } from "@effect/platform";
import { Effect as Effect29 } from "effect";
var resolvePreviewRoot = (projectPath) => Effect29.gen(function* () {
  const path5 = yield* Path15.Path;
  return path5.join(projectPath, "..", "nfes-preview");
});
var resolveD2CDir = (projectPath, changeId) => Effect29.gen(function* () {
  const path5 = yield* Path15.Path;
  return path5.join(projectPath, "openspec", "changes", changeId, "d2c");
});
var resolvePreviewTargetDir = (previewRoot) => Effect29.gen(function* () {
  const path5 = yield* Path15.Path;
  return path5.join(previewRoot, "app", "demo", "components");
});
var resolvePreviewEntryFile = (previewRoot) => Effect29.gen(function* () {
  const path5 = yield* Path15.Path;
  return path5.join(previewRoot, "app", "demo", "components", "index.tsx");
});

// src/server/core/d2c/services/d2cPreviewTsxCompat.ts
import * as ts2 from "typescript";
var XTARO_ZX_PACKAGE = "@ctrip/xtaro-zx";
var XTARO_ZX_H5_PACKAGE = "@ctrip/xtaro-zx-h5";
var hasUseClientDirective = (sourceFile) => {
  for (const statement of sourceFile.statements) {
    if (!ts2.isExpressionStatement(statement)) {
      return false;
    }
    if (!ts2.isStringLiteral(statement.expression)) {
      return false;
    }
    if (statement.expression.text === "use client") {
      return true;
    }
  }
  return false;
};
var resolveRewrittenSpecifier = (moduleSpecifier) => {
  if (!moduleSpecifier) return void 0;
  if (!ts2.isStringLiteral(moduleSpecifier)) return void 0;
  if (moduleSpecifier.text !== XTARO_ZX_PACKAGE) return void 0;
  return ts2.factory.createStringLiteral(XTARO_ZX_H5_PACKAGE);
};
var rewriteTsxImportsAndExports = (sourceText) => {
  const sourceFile = ts2.createSourceFile(
    "index.tsx",
    sourceText,
    ts2.ScriptTarget.Latest,
    true,
    ts2.ScriptKind.TSX
  );
  let hasRewrite = false;
  const visit = (context) => {
    const visitor = (node) => {
      if (ts2.isImportDeclaration(node)) {
        const nextSpecifier = resolveRewrittenSpecifier(node.moduleSpecifier);
        if (!nextSpecifier) {
          return node;
        }
        hasRewrite = true;
        return ts2.factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          nextSpecifier,
          node.attributes
        );
      }
      if (ts2.isExportDeclaration(node)) {
        const nextSpecifier = resolveRewrittenSpecifier(node.moduleSpecifier);
        if (!nextSpecifier) {
          return node;
        }
        hasRewrite = true;
        return ts2.factory.updateExportDeclaration(
          node,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          nextSpecifier,
          node.attributes
        );
      }
      return ts2.visitEachChild(node, visitor, context);
    };
    return (node) => ts2.visitNode(node, visitor);
  };
  const result = ts2.transform(sourceFile, [visit]);
  const transformed = result.transformed[0];
  result.dispose();
  if (!hasRewrite || !transformed || !ts2.isSourceFile(transformed)) {
    return sourceText;
  }
  const printer = ts2.createPrinter({ newLine: ts2.NewLineKind.LineFeed });
  return printer.printFile(transformed);
};
var applyPreviewTsxCompat = (sourceText) => {
  const sourceFile = ts2.createSourceFile(
    "index.tsx",
    sourceText,
    ts2.ScriptTarget.Latest,
    true,
    ts2.ScriptKind.TSX
  );
  const rewrittenSource = rewriteTsxImportsAndExports(sourceText);
  if (hasUseClientDirective(sourceFile)) {
    return rewrittenSource;
  }
  return `"use client";
${rewrittenSource}`;
};

// src/server/core/d2c/services/d2cPreviewUrl.ts
var PREVIEW_URL_DEFAULT = "http://localhost:8123/demo";
var resolvePreviewUrl = (env) => env.NFES_PREVIEW_URL || env.XTARO_PREVIEW_URL || PREVIEW_URL_DEFAULT;

// src/server/core/d2c/services/D2CPreviewService.ts
var ProjectPathNotFoundError2 = class extends Data5.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var PreviewWorkerScriptNotFoundError = class extends Data5.TaggedError(
  "PreviewWorkerScriptNotFoundError"
) {
};
var PREVIEW_URL = (
  // biome-ignore lint/style/noProcessEnv: 允许通过环境变量覆盖预览服务地址
  resolvePreviewUrl(process.env)
);
var formatUnknownError2 = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "unknown error";
  }
};
var COREHASH_MAP_FILENAME = "corehash-map.json";
var LEGACY_COREHASH_FILENAME = "webCoreBuildData.json";
var LayerImpl17 = Effect30.gen(function* () {
  const fs = yield* FileSystem13.FileSystem;
  const path5 = yield* Path16.Path;
  const projectRepository = yield* ProjectRepository;
  yield* CommandExecutor.CommandExecutor;
  const getProjectPath = (projectId) => Effect30.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    const projectPath = project.meta.projectPath;
    if (projectPath === null) {
      return yield* Effect30.fail(new ProjectPathNotFoundError2({ projectId }));
    }
    return projectPath;
  });
  const isPreviewProjectValid = (projectPath) => Effect30.gen(function* () {
    const previewRoot = yield* resolvePreviewRoot(projectPath);
    const requiredEntries = ["package.json", "app", "scripts"];
    for (const entry of requiredEntries) {
      const exists = yield* fs.exists(path5.join(previewRoot, entry));
      if (!exists) {
        return false;
      }
    }
    return true;
  });
  const resolveStatusPath = (projectPath) => Effect30.gen(function* () {
    const sanitize = (value) => value.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const tempDir = (
      // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
      process.env.TMPDIR || // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
      process.env.TEMP || // biome-ignore lint/style/noProcessEnv: 仅用于读取临时目录环境变量
      process.env.TMP || "/tmp"
    );
    const path6 = yield* Path16.Path;
    return path6.join(
      tempDir,
      `specforge-d2c-preview-${sanitize(projectPath)}.json`
    );
  });
  const parseProgress = (raw) => {
    if (typeof raw !== "object" || raw === null) return void 0;
    if (!("step" in raw)) return void 0;
    const stepValue = raw.step;
    if (typeof stepValue !== "string") return void 0;
    const messageValue = "message" in raw && typeof raw.message === "string" ? raw.message : void 0;
    const updatedAtValue = "updatedAt" in raw && typeof raw.updatedAt === "string" ? raw.updatedAt : void 0;
    return {
      step: stepValue,
      message: messageValue,
      updatedAt: updatedAtValue
    };
  };
  const resolveRepoRoot = () => Effect30.gen(function* () {
    const startDir = import.meta.dirname;
    const maxDepth = 8;
    let current = startDir;
    for (let depth = 0; depth < maxDepth; depth += 1) {
      const pkgPath = path5.join(current, "package.json");
      const exists = yield* fs.exists(pkgPath);
      if (exists) {
        return current;
      }
      const parent = path5.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
    return process.cwd();
  });
  const resolveWorkerScript = (repoRoot) => Effect30.gen(function* () {
    const cjsPath = path5.join(
      repoRoot,
      "scripts",
      "start-d2c-preview-worker.cjs"
    );
    const jsPath = path5.join(
      repoRoot,
      "scripts",
      "start-d2c-preview-worker.js"
    );
    const cjsExists = yield* fs.exists(cjsPath);
    if (cjsExists) return cjsPath;
    const jsExists = yield* fs.exists(jsPath);
    if (jsExists) return jsPath;
    return yield* Effect30.fail(
      new PreviewWorkerScriptNotFoundError({
        repoRoot,
        candidates: [cjsPath, jsPath]
      })
    );
  });
  const checkStatus = () => Effect30.gen(function* () {
    const fetchEffect = Effect30.tryPromise({
      try: () => fetch(PREVIEW_URL, { method: "GET", redirect: "manual" }),
      catch: (error) => new Error(formatUnknownError2(error))
    });
    const result = yield* Effect30.either(
      Effect30.timeout(fetchEffect, Duration.seconds(2))
    );
    if (result._tag === "Right") {
      return { previewUrl: PREVIEW_URL, isRunning: true };
    }
    return { previewUrl: PREVIEW_URL, isRunning: false };
  });
  const checkPreviewProject = (projectId) => Effect30.gen(function* () {
    const projectPath = yield* getProjectPath(projectId);
    const previewRoot = yield* resolvePreviewRoot(projectPath);
    const valid = yield* isPreviewProjectValid(projectPath);
    const statusPath = yield* resolveStatusPath(projectPath);
    const statusExists = yield* fs.exists(statusPath);
    let progress;
    if (statusExists) {
      const raw = yield* fs.readFileString(statusPath);
      try {
        const parsed = JSON.parse(raw);
        progress = parseProgress(parsed);
      } catch {
        progress = void 0;
      }
    }
    return { valid, previewRoot, progress };
  });
  const readProgress = (projectPath) => Effect30.gen(function* () {
    const statusPath = yield* resolveStatusPath(projectPath);
    const statusExists = yield* fs.exists(statusPath);
    if (!statusExists) return void 0;
    const raw = yield* fs.readFileString(statusPath);
    try {
      const parsed = JSON.parse(raw);
      return parseProgress(parsed);
    } catch {
      return void 0;
    }
  });
  const startPreviewWorker = (projectPath) => Effect30.gen(function* () {
    const repoRoot = yield* resolveRepoRoot();
    const workerScript = yield* resolveWorkerScript(repoRoot);
    const command = Command3.make(
      "node",
      workerScript,
      "--project-root",
      projectPath
    ).pipe(Command3.runInShell(true));
    const result = yield* Effect30.either(
      Command3.string(command).pipe(Effect30.timeout(Duration.seconds(10)))
    );
    if (result._tag === "Left") {
      console.error(
        "[D2CPreviewService] \u9884\u89C8 Worker \u542F\u52A8\u5931\u8D25\uFF0C\u8BE6\u7EC6\u9519\u8BEF:",
        result.left
      );
      return yield* Effect30.fail(result.left);
    }
    const output = typeof result.right === "string" ? result.right.trim() : "";
    if (output.length > 0) {
      console.log(`[D2CPreviewService] \u9884\u89C8 Worker \u8F93\u51FA:
${output}`);
    }
  });
  const ensureRunning = (projectId) => Effect30.gen(function* () {
    const projectPath = yield* getProjectPath(projectId);
    const status = yield* checkStatus();
    const isValid = yield* isPreviewProjectValid(projectPath);
    const progress = yield* readProgress(projectPath);
    if (progress?.step === "copying" || progress?.step === "installing") {
      return {
        success: true,
        message: "\u9884\u89C8\u5DE5\u7A0B\u6B63\u5728\u521D\u59CB\u5316\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85",
        previewUrl: PREVIEW_URL,
        isRunning: false,
        starting: true
      };
    }
    if (progress?.step === "starting") {
      return {
        success: true,
        message: "\u9884\u89C8\u670D\u52A1\u6B63\u5728\u542F\u52A8\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85",
        previewUrl: PREVIEW_URL,
        isRunning: false,
        starting: true
      };
    }
    if (status.isRunning && isValid) {
      return {
        success: true,
        message: "\u9884\u89C8\u670D\u52A1\u5DF2\u5728\u8FD0\u884C",
        previewUrl: status.previewUrl,
        isRunning: true
      };
    }
    const workerResult = yield* Effect30.either(
      startPreviewWorker(projectPath)
    );
    if (workerResult._tag === "Left") {
      const errorDetail = formatUnknownError2(workerResult.left);
      console.error(
        "[D2CPreviewService] ensureRunning: \u9884\u89C8\u670D\u52A1\u542F\u52A8\u5931\u8D25:",
        errorDetail
      );
      return {
        success: false,
        message: `\u9884\u89C8\u670D\u52A1\u542F\u52A8\u5931\u8D25: ${errorDetail}`,
        previewUrl: PREVIEW_URL,
        isRunning: false
      };
    }
    return {
      success: true,
      message: status.isRunning ? "\u9884\u89C8\u5DE5\u7A0B\u6821\u9A8C\u5931\u8D25\uFF0C\u6B63\u5728\u91CD\u65B0\u521D\u59CB\u5316" : "\u9884\u89C8\u670D\u52A1\u6B63\u5728\u542F\u52A8\u4E2D",
      previewUrl: PREVIEW_URL,
      isRunning: false,
      starting: true
    };
  });
  const listArtifacts = (projectId, changeId) => Effect30.gen(function* () {
    const projectPath = yield* getProjectPath(projectId);
    const d2cDir = yield* resolveD2CDir(projectPath, changeId);
    const d2cExists = yield* fs.exists(d2cDir);
    if (!d2cExists) {
      return [];
    }
    const entries = yield* fs.readDirectory(d2cDir);
    const entryChecks = [];
    for (const entry of entries) {
      const entryPath = path5.join(d2cDir, entry);
      const stat = yield* fs.stat(entryPath);
      const isDir = stat.type === "Directory";
      const tsxPath = path5.join(entryPath, "index.tsx");
      const scssPath = path5.join(entryPath, "index.module.scss");
      const tsxExists = isDir ? yield* fs.exists(tsxPath) : false;
      const scssExists = isDir ? yield* fs.exists(scssPath) : false;
      entryChecks.push({
        name: entry,
        isDir,
        hasTsx: tsxExists,
        hasScss: scssExists
      });
    }
    return listArtifactsFromEntries({
      entries: entryChecks
    });
  });
  const syncPreviewFiles = (projectId, changeId, artifactId) => Effect30.gen(function* () {
    const projectPath = yield* getProjectPath(projectId);
    const previewValid = yield* isPreviewProjectValid(projectPath);
    if (!previewValid) {
      return {
        success: false,
        message: "\u9884\u89C8\u5DE5\u7A0B\u5C1A\u672A\u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u8BF7\u5148\u542F\u52A8\u9884\u89C8\u670D\u52A1",
        targetDir: "\u672A\u521D\u59CB\u5316"
      };
    }
    const previewRoot = yield* resolvePreviewRoot(projectPath);
    const sourceDir = yield* resolveD2CDir(projectPath, changeId);
    const targetDir = yield* resolvePreviewTargetDir(previewRoot);
    if (artifactId.includes("..") || artifactId.includes("/") || artifactId.includes("\\")) {
      return {
        success: false,
        message: "\u4EA7\u7269\u76EE\u5F55\u540D\u975E\u6CD5",
        targetDir
      };
    }
    const sourceBase = path5.join(sourceDir, artifactId);
    const sourceTsxPath = path5.join(sourceBase, "index.tsx");
    const sourceScssPath = path5.join(sourceBase, "index.module.scss");
    const tsxExists = yield* fs.exists(sourceTsxPath);
    const scssExists = yield* fs.exists(sourceScssPath);
    if (!tsxExists || !scssExists) {
      const missing = [
        !tsxExists ? "index.tsx" : void 0,
        !scssExists ? "index.module.scss" : void 0
      ].filter((item) => item !== void 0).join(", ");
      return {
        success: false,
        message: `\u6E90\u4EE3\u7801\u6587\u4EF6\u4E0D\u5B58\u5728(\u7F3A\u5C11: ${missing}), sourceDir: ${sourceBase}`,
        targetDir
      };
    }
    yield* fs.makeDirectory(targetDir, { recursive: true });
    const tsxContent = yield* fs.readFileString(sourceTsxPath);
    const scssContent = yield* fs.readFileString(sourceScssPath);
    const compatibleTsxContent = applyPreviewTsxCompat(tsxContent);
    const relativeSourcePath = path5.relative(projectPath, sourceTsxPath);
    const filename = path5.basename(sourceTsxPath);
    const injectionResult = yield* Effect30.either(
      Effect30.try({
        try: () => buildCorehashInjection({
          sourceText: compatibleTsxContent,
          fileDir: relativeSourcePath,
          filename
        }),
        catch: (error) => new Error(`\u6838\u5FC3\u54C8\u5E0C\u6CE8\u5165\u5931\u8D25: ${formatUnknownError2(error)}`)
      })
    );
    if (injectionResult._tag === "Left") {
      return {
        success: false,
        message: injectionResult.left.message,
        targetDir
      };
    }
    yield* fs.writeFileString(
      path5.join(targetDir, "index.tsx"),
      injectionResult.right.injectedCode
    );
    yield* fs.writeFileString(
      path5.join(targetDir, "index.module.scss"),
      scssContent
    );
    const corehashPayload = serializeCorehashMap(
      injectionResult.right.corehashMap
    );
    yield* fs.writeFileString(
      path5.join(targetDir, COREHASH_MAP_FILENAME),
      corehashPayload
    );
    const legacyDir = path5.join(previewRoot, ".next");
    yield* fs.makeDirectory(legacyDir, { recursive: true });
    yield* fs.writeFileString(
      path5.join(legacyDir, LEGACY_COREHASH_FILENAME),
      corehashPayload
    );
    return {
      success: true,
      message: "\u4EE3\u7801\u5DF2\u540C\u6B65\u5230\u9884\u89C8\u5DE5\u7A0B",
      targetDir
    };
  });
  const triggerRebuild = (projectId) => Effect30.gen(function* () {
    const projectPath = yield* getProjectPath(projectId);
    const previewRoot = yield* resolvePreviewRoot(projectPath);
    const entryFile = yield* resolvePreviewEntryFile(previewRoot);
    const exists = yield* fs.exists(entryFile);
    if (!exists) {
      return {
        success: false,
        message: "\u672A\u627E\u5230\u53EF\u89E6\u53D1\u7F16\u8BD1\u7684\u5165\u53E3\u6587\u4EF6"
      };
    }
    const content = yield* fs.readFileString(entryFile);
    yield* fs.writeFileString(entryFile, content);
    return {
      success: true,
      message: "\u5DF2\u89E6\u53D1\u91CD\u65B0\u7F16\u8BD1",
      touchedFile: entryFile
    };
  });
  return {
    checkStatus,
    checkPreviewProject,
    ensureRunning,
    listArtifacts,
    syncPreviewFiles,
    triggerRebuild
  };
});
var D2CPreviewService = class extends Context22.Tag("D2CPreviewService")() {
  static {
    this.Live = Layer24.effect(this, LayerImpl17);
  }
};

// src/server/core/d2c/presentation/D2CPreviewController.ts
var catchAsServerError = (errorMessage) => Effect31.catchAll((error) => {
  console.error(`${errorMessage}:`, error);
  return Effect31.succeed({
    response: { error: errorMessage },
    status: 500
  });
});
var LayerImpl18 = Effect31.gen(function* () {
  const previewService = yield* D2CPreviewService;
  const previewRoute = (options) => Effect31.gen(function* () {
    const { projectId, action, changeId, artifactId } = options;
    if (action === "list") {
      if (!changeId) {
        return {
          response: { success: false, error: "\u7F3A\u5C11 changeId" },
          status: 400
        };
      }
      const result = yield* previewService.listArtifacts(projectId, changeId);
      return {
        response: { success: true, data: result },
        status: 200
      };
    }
    if (action === "check-status") {
      const result = yield* previewService.checkStatus();
      return {
        response: { success: true, data: result },
        status: 200
      };
    }
    if (action === "check-project") {
      const result = yield* previewService.checkPreviewProject(projectId);
      return {
        response: { success: true, data: result },
        status: 200
      };
    }
    if (action === "ensure-running") {
      const result = yield* previewService.ensureRunning(projectId);
      return {
        response: result.success ? { success: true, data: result } : { success: false, error: result.message, data: result },
        status: result.success ? 200 : 500
      };
    }
    if (action === "sync") {
      if (!changeId) {
        return {
          response: { success: false, error: "\u7F3A\u5C11 changeId" },
          status: 400
        };
      }
      if (!artifactId) {
        return {
          response: { success: false, error: "\u7F3A\u5C11 artifactId" },
          status: 400
        };
      }
      const result = yield* previewService.syncPreviewFiles(
        projectId,
        changeId,
        artifactId
      );
      return {
        response: { success: result.success, data: result },
        status: result.success ? 200 : 400
      };
    }
    if (action === "trigger-rebuild") {
      const result = yield* previewService.triggerRebuild(projectId);
      return {
        response: { success: result.success, data: result },
        status: result.success ? 200 : 400
      };
    }
    return {
      response: { success: false, error: "\u4E0D\u652F\u6301\u7684\u9884\u89C8\u64CD\u4F5C" },
      status: 400
    };
  }).pipe(catchAsServerError("Failed to handle D2C preview action"));
  return { previewRoute };
});
var D2CPreviewController = class extends Context23.Tag("D2CPreviewController")() {
  static {
    this.Live = Layer25.effect(this, LayerImpl18);
  }
};

// src/server/core/events/presentation/SSEController.ts
import { Context as Context25, Effect as Effect33, Layer as Layer27 } from "effect";

// src/server/core/events/functions/adaptInternalEventToSSE.ts
var adaptInternalEventToSSE = (rawStream, options) => {
  const { timeout = 60 * 1e3, cleanUp } = options ?? {};
  const abortController = new AbortController();
  let connectionResolve;
  const connectionPromise = new Promise((resolve) => {
    connectionResolve = resolve;
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
import { Context as Context24, Effect as Effect32, Layer as Layer26 } from "effect";
import { ulid as ulid3 } from "ulid";
var TypeSafeSSE = class extends Context24.Tag("TypeSafeSSE")() {
  static {
    this.make = (stream) => Layer26.succeed(this, {
      writeSSE: (event, data) => Effect32.tryPromise({
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
var LayerImpl19 = Effect33.gen(function* () {
  const eventBus = yield* EventBus;
  const handleSSE = (rawStream) => Effect33.gen(function* () {
    const typeSafeSSE = yield* TypeSafeSSE;
    yield* typeSafeSSE.writeSSE("connect", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const onHeartbeat = () => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("heartbeat", {
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      );
    };
    const onSessionListChanged = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("sessionListChanged", {
          projectId: event.projectId
        })
      );
    };
    const onSessionChanged = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("sessionChanged", {
          projectId: event.projectId,
          sessionId: event.sessionId
        })
      );
    };
    const onAgentSessionChanged = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("agentSessionChanged", {
          projectId: event.projectId,
          agentSessionId: event.agentSessionId
        })
      );
    };
    const onSessionProcessChanged = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("sessionProcessChanged", {
          processes: event.processes
        })
      );
    };
    const onPermissionRequested = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("permissionRequested", {
          permissionRequest: event.permissionRequest
        })
      );
    };
    const onVirtualConversationUpdated = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("virtualConversationUpdated", {
          projectId: event.projectId,
          sessionId: event.sessionId
        })
      );
    };
    const onInitializationProgress = (event) => {
      Effect33.runFork(
        typeSafeSSE.writeSSE("initializationProgress", {
          message: event.message,
          stage: event.stage
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
    yield* eventBus.on("initializationProgress", onInitializationProgress);
    const { connectionPromise } = adaptInternalEventToSSE(rawStream, {
      timeout: 5 * 60 * 1e3,
      cleanUp: async () => {
        await Effect33.runPromise(
          Effect33.gen(function* () {
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
            yield* eventBus.off(
              "initializationProgress",
              onInitializationProgress
            );
          })
        );
      }
    });
    yield* Effect33.promise(() => connectionPromise);
  });
  return {
    handleSSE
  };
});
var SSEController = class extends Context25.Tag("SSEController")() {
  static {
    this.Live = Layer27.effect(this, LayerImpl19);
  }
};

// src/server/core/events/services/fileWatcher.ts
import { Path as Path17 } from "@effect/platform";
import chokidar from "chokidar";
import { Context as Context26, Effect as Effect34, Layer as Layer28, Ref as Ref10 } from "effect";

// src/server/core/events/functions/parseSessionFilePath.ts
import z24 from "zod";
var pathSeparator = String.raw`[/\\]`;
var sessionFileRegExp = new RegExp(
  `(?<projectId>.+)${pathSeparator}(?<sessionId>[^/\\\\]+)\\.jsonl$`
);
var agentFileRegExp = new RegExp(
  `(?<projectId>.+)${pathSeparator}agent-(?<agentSessionId>[^/\\\\]+)\\.jsonl$`
);
var sessionFileGroupSchema = z24.object({
  projectId: z24.string().min(1),
  sessionId: z24.string().min(1)
});
var agentFileGroupSchema = z24.object({
  projectId: z24.string().min(1),
  agentSessionId: z24.string().min(1)
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
var FileWatcherService = class extends Context26.Tag("FileWatcherService")() {
  static {
    this.Live = Layer28.effect(
      this,
      Effect34.gen(function* () {
        const path5 = yield* Path17.Path;
        const eventBus = yield* EventBus;
        const context = yield* ApplicationContext;
        const isWatchingRef = yield* Ref10.make(false);
        const watcherRef = yield* Ref10.make(null);
        const debounceTimersRef = yield* Ref10.make(/* @__PURE__ */ new Map());
        const clearDebounceTimer = (key) => Effect34.gen(function* () {
          const timers = yield* Ref10.get(debounceTimersRef);
          const timer = timers.get(key);
          if (!timer) {
            return;
          }
          clearTimeout(timer);
          timers.delete(key);
          yield* Ref10.set(debounceTimersRef, timers);
        });
        const emitChangeEvents = (debounceKey, projectId, fileType, fileId) => Effect34.gen(function* () {
          const timers = yield* Ref10.get(debounceTimersRef);
          const existingTimer = timers.get(debounceKey);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }
          const timer = setTimeout(() => {
            if (fileType === "agent") {
              Effect34.runFork(
                eventBus.emit("agentSessionChanged", {
                  projectId,
                  agentSessionId: fileId
                })
              );
            } else {
              Effect34.runFork(
                eventBus.emit("sessionChanged", {
                  projectId,
                  sessionId: fileId
                })
              );
              Effect34.runFork(
                eventBus.emit("sessionListChanged", {
                  projectId
                })
              );
            }
            Effect34.runFork(clearDebounceTimer(debounceKey));
          }, 100);
          timers.set(debounceKey, timer);
          yield* Ref10.set(debounceTimersRef, timers);
        });
        const startWatching = () => Effect34.gen(function* () {
          const isWatching = yield* Ref10.get(isWatchingRef);
          if (isWatching) {
            return;
          }
          const claudeCodePaths = yield* context.claudeCodePaths;
          const rootPath = claudeCodePaths.claudeProjectsDirPath;
          const watchPattern = path5.join(rootPath, "*", "*.jsonl");
          const isTestEnv = process.env.NODE_ENV === "test";
          const watcher = chokidar.watch(watchPattern, {
            persistent: false,
            ignoreInitial: true,
            usePolling: isTestEnv,
            interval: 100,
            awaitWriteFinish: {
              stabilityThreshold: 80,
              pollInterval: 20
            }
          });
          watcher.on("all", (_eventName, changedPath) => {
            Effect34.runFork(
              Effect34.gen(function* () {
                const relativePath = path5.relative(rootPath, changedPath);
                if (relativePath.length === 0 || relativePath.startsWith("..") || path5.isAbsolute(relativePath)) {
                  return;
                }
                const fileMatch = parseSessionFilePath(relativePath);
                if (!fileMatch) {
                  return;
                }
                const fullPath = path5.join(rootPath, relativePath);
                const encodedProjectId = encodeProjectIdFromSessionFilePath(fullPath);
                if (fileMatch.type === "agent") {
                  const key2 = `${encodedProjectId}/agent-${fileMatch.agentSessionId}`;
                  yield* emitChangeEvents(
                    key2,
                    encodedProjectId,
                    "agent",
                    fileMatch.agentSessionId
                  );
                  return;
                }
                const key = `${encodedProjectId}/${fileMatch.sessionId}`;
                yield* emitChangeEvents(
                  key,
                  encodedProjectId,
                  "session",
                  fileMatch.sessionId
                );
              })
            );
          });
          const readyOrError = Effect34.async((resume) => {
            let started = false;
            let settled = false;
            const onReady = () => {
              started = true;
              if (settled) {
                return;
              }
              settled = true;
              resume(Effect34.void);
            };
            const onError = (error) => {
              const message = error instanceof Error ? error.message : String(error);
              if (started || settled) {
                console.error(
                  "[FileWatcherService] watcher runtime error:",
                  message
                );
                return;
              }
              settled = true;
              resume(
                Effect34.fail(
                  new Error(`Failed to start file watching: ${message}`)
                )
              );
            };
            watcher.once("ready", onReady);
            watcher.on("error", onError);
          });
          const startResult = yield* readyOrError.pipe(
            Effect34.tap(() => Ref10.set(isWatchingRef, true)),
            Effect34.tap(() => Ref10.set(watcherRef, watcher)),
            Effect34.catchAll(
              (error) => Effect34.gen(function* () {
                yield* Effect34.promise(() => watcher.close());
                yield* Ref10.set(watcherRef, null);
                yield* Ref10.set(isWatchingRef, false);
                return yield* Effect34.fail(error);
              })
            )
          );
          return startResult;
        });
        const stop = () => Effect34.gen(function* () {
          const timers = yield* Ref10.get(debounceTimersRef);
          for (const timer of timers.values()) {
            clearTimeout(timer);
          }
          yield* Ref10.set(debounceTimersRef, /* @__PURE__ */ new Map());
          const watcher = yield* Ref10.get(watcherRef);
          if (watcher) {
            yield* Effect34.promise(() => watcher.close());
            yield* Ref10.set(watcherRef, null);
          }
          yield* Ref10.set(isWatchingRef, false);
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
import { Context as Context27, Effect as Effect35, Layer as Layer29 } from "effect";
var LayerImpl20 = Effect35.gen(function* () {
  const claudeCodeService = yield* ClaudeCodeService;
  const getFlags = () => Effect35.gen(function* () {
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
var FeatureFlagController = class extends Context27.Tag("FeatureFlagController")() {
  static {
    this.Live = Layer29.effect(this, LayerImpl20);
  }
};

// src/server/core/feishu/FeishuController.ts
import Client from "@ctrip/feishu2md-node";
import { Context as Context28, Effect as Effect36, Layer as Layer30 } from "effect";
var FEISHU_APP_ID = "cli_a8d81270b979900d";
var FEISHU_APP_SECRET = "4W2ZDr8taY92knsqwnZrvKb2TPQQHuoZ";
var client = new Client({
  appId: FEISHU_APP_ID,
  appSecret: FEISHU_APP_SECRET
});
var removeImageMarkers = (markdown) => {
  return markdown.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
};
var make = Effect36.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const downloadDoc = (options) => Effect36.gen(function* () {
    yield* projectRepository.getProject(options.projectId);
    const rawMarkdown = yield* Effect36.tryPromise({
      try: () => client.getDocMdContent(options.larkDoc),
      catch: (error) => new Error(
        `Failed to get Feishu document content: ${error instanceof Error ? error.message : String(error)}`
      )
    });
    const markdown = removeImageMarkers(rawMarkdown);
    const response = {
      status: 200,
      response: { markdown }
    };
    return response;
  }).pipe(
    Effect36.catchAll(
      (error) => Effect36.succeed({
        status: 500,
        response: {
          error: error instanceof Error ? error.message : "Unknown error occurred"
        }
      })
    )
  );
  return { downloadDoc };
});
var FeishuController = class extends Context28.Tag("FeishuController")() {
  static {
    this.Live = Layer30.effect(this, make);
  }
};

// src/server/core/file-system/presentation/FileSystemController.ts
import { Context as Context29, Effect as Effect39, Layer as Layer31 } from "effect";

// src/server/core/file-system/functions/getDirectoryListing.ts
import { FileSystem as FileSystem14, Path as Path18 } from "@effect/platform";
import { Effect as Effect37 } from "effect";
var getDirectoryListing = (rootPath, basePath = "/", showHidden = false) => Effect37.gen(function* () {
  const fs = yield* FileSystem14.FileSystem;
  const path5 = yield* Path18.Path;
  const normalizedBasePath = basePath === "/" ? "" : basePath.startsWith("/") || basePath.startsWith("\\") ? basePath.slice(1) : basePath;
  const targetPath = path5.resolve(rootPath, normalizedBasePath);
  const resolvedRootPath = path5.resolve(rootPath);
  const relativeToRoot = path5.relative(resolvedRootPath, targetPath);
  const targetEscapesRoot = relativeToRoot !== "" && (relativeToRoot === ".." || relativeToRoot.startsWith(`..${path5.sep}`) || relativeToRoot.startsWith("../") || relativeToRoot.startsWith("..\\") || /^[A-Za-z]:[\\/]/.test(relativeToRoot) || relativeToRoot.startsWith("/") || relativeToRoot.startsWith("\\"));
  if (targetEscapesRoot) {
    return yield* Effect37.fail(
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
      const parentPath = path5.dirname(normalizedBasePath);
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
      const direntPath = path5.join(targetPath, dirent);
      const stat = yield* fs.stat(direntPath);
      const entryPath = normalizedBasePath ? path5.join(normalizedBasePath, dirent) : dirent;
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
import { FileSystem as FileSystem15, Path as Path19 } from "@effect/platform";
import { Effect as Effect38 } from "effect";
var getFileCompletion = (projectPath, basePath = "/") => Effect38.gen(function* () {
  const fs = yield* FileSystem15.FileSystem;
  const path5 = yield* Path19.Path;
  const normalizedBasePath = basePath.startsWith("/") || basePath.startsWith("\\") ? basePath.slice(1) : basePath;
  const targetPath = path5.resolve(projectPath, normalizedBasePath);
  const resolvedProjectPath = path5.resolve(projectPath);
  const relativeToProject = path5.relative(resolvedProjectPath, targetPath);
  const targetEscapesProject = relativeToProject !== "" && (relativeToProject === ".." || relativeToProject.startsWith(`..${path5.sep}`) || relativeToProject.startsWith("../") || relativeToProject.startsWith("..\\") || /^[A-Za-z]:[\\/]/.test(relativeToProject) || relativeToProject.startsWith("/") || relativeToProject.startsWith("\\"));
  if (targetEscapesProject) {
    return yield* Effect38.fail(
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
      const direntPath = path5.join(targetPath, dirent);
      const stat = yield* fs.stat(direntPath);
      const entryPath = normalizedBasePath ? path5.join(normalizedBasePath, dirent) : dirent;
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
var LayerImpl21 = Effect39.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const getFileCompletionRoute = (options) => Effect39.gen(function* () {
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
      Effect39.catchAll((error) => {
        console.error("File completion error:", error);
        return Effect39.succeed({
          entries: [],
          basePath: basePath.startsWith("/") || basePath.startsWith("\\") ? basePath.slice(1) : basePath,
          projectPath
        });
      })
    );
    return {
      response: result,
      status: 200
    };
  });
  const getDirectoryListingRoute = (options) => Effect39.gen(function* () {
    const { currentPath, showHidden = false } = options;
    const rootPath = "/";
    const home = process.env.HOME;
    const userProfile = process.env.USERPROFILE;
    const defaultPath = home || userProfile || rootPath;
    const targetPath = currentPath ?? defaultPath;
    const windowsDriveMatch = /^[A-Za-z]:[\\/]/.exec(targetPath);
    const effectiveRootPath = windowsDriveMatch ? `${windowsDriveMatch[0].slice(0, 2)}\\` : rootPath;
    const relativePath = targetPath.startsWith(effectiveRootPath) ? targetPath.slice(effectiveRootPath.length) : targetPath;
    const result = yield* getDirectoryListing(
      effectiveRootPath,
      relativePath,
      showHidden
    ).pipe(
      Effect39.catchAll((error) => {
        console.error("Directory listing error:", error);
        return Effect39.succeed({
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
var FileSystemController = class extends Context29.Tag("FileSystemController")() {
  static {
    this.Live = Layer31.effect(this, LayerImpl21);
  }
};

// src/server/core/git/presentation/GitController.ts
import { Context as Context32, Effect as Effect44, Either as Either4, Layer as Layer34 } from "effect";

// src/server/core/git/functions/getDiff.ts
import { FileSystem as FileSystem17, Path as Path21 } from "@effect/platform";
import { Effect as Effect41 } from "effect";
import parseGitDiff from "parse-git-diff";

// src/server/core/git/functions/utils.ts
import { Command as Command4, FileSystem as FileSystem16, Path as Path20 } from "@effect/platform";
import { Data as Data6, Effect as Effect40, Either as Either2 } from "effect";
var GitCommandError = class extends Data6.TaggedError("GitCommandError") {
};
function hasStderr(error) {
  return typeof error === "object" && error !== null && ("stderr" in error || "message" in error);
}
var executeGitCommand = (args, cwd) => Effect40.gen(function* () {
  const fs = yield* FileSystem16.FileSystem;
  const path5 = yield* Path20.Path;
  const absoluteCwd = path5.resolve(cwd);
  const dirExists = yield* fs.exists(absoluteCwd);
  if (!dirExists) {
    return yield* Effect40.fail(
      new GitCommandError({
        code: "NOT_A_REPOSITORY",
        message: `Directory does not exist: ${cwd}`,
        command: `git ${args.join(" ")}`
      })
    );
  }
  const command = Command4.make("git", ...args).pipe(
    Command4.workingDirectory(absoluteCwd)
  );
  const result = yield* Effect40.either(Command4.string(command));
  if (Either2.isLeft(result)) {
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
    return yield* Effect40.fail(
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
var getUntrackedFiles = (cwd) => Effect41.gen(function* () {
  const statusData = yield* executeGitCommand(
    ["status", "--untracked-files=all", "--short"],
    cwd
  );
  const untrackedFiles = parseLines(statusData).map((line) => stripAnsiColors(line)).filter((line) => line.startsWith("??")).map((line) => line.slice(3));
  return untrackedFiles;
});
var createUntrackedFileDiff = (cwd, filePath) => Effect41.gen(function* () {
  const fs = yield* FileSystem17.FileSystem;
  const path5 = yield* Path21.Path;
  const fullPath = path5.resolve(cwd, filePath);
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
  Effect41.catchAll((error) => {
    console.warn(`Failed to read untracked file ${filePath}:`, error);
    return Effect41.succeed(null);
  })
);
var getDiff = (cwd, fromRefText, toRefText) => Effect41.gen(function* () {
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
      Effect41.catchAll(() => Effect41.succeed([]))
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
  Effect41.catchAll((error) => {
    const errorMessage = error instanceof Error ? error.message : "message" in error ? String(error.message) : "Unknown error";
    return Effect41.succeed({
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: `Failed to parse diff: ${errorMessage}`
      }
    });
  })
);

// src/server/core/git/services/GitService.ts
import { Command as Command5, FileSystem as FileSystem18, Path as Path22 } from "@effect/platform";
import { Context as Context31, Data as Data7, Duration as Duration2, Effect as Effect43, Either as Either3, Layer as Layer33 } from "effect";

// src/server/core/platform/services/EnvService.ts
import { Context as Context30, Effect as Effect42, Layer as Layer32, Ref as Ref11 } from "effect";

// src/server/core/platform/schema.ts
import { z as z25 } from "zod";
var envSchema = z25.object({
  // Frameworks
  NODE_ENV: z25.enum(["development", "production", "test"]).optional().default("development"),
  NEXT_PHASE: z25.string().optional(),
  PATH: z25.string().optional(),
  // Anthropic API Configuration
  // Standard Anthropic SDK expects ANTHROPIC_API_KEY
  ANTHROPIC_API_KEY: z25.string().optional(),
  // Some custom proxy services use ANTHROPIC_AUTH_TOKEN instead
  ANTHROPIC_AUTH_TOKEN: z25.string().optional(),
  // Custom API endpoint (e.g., for proxy services or custom deployments)
  ANTHROPIC_BASE_URL: z25.string().optional()
});

// src/server/core/platform/services/EnvService.ts
var LayerImpl22 = Effect42.gen(function* () {
  const envRef = yield* Ref11.make(void 0);
  const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(parsed.error);
      throw new Error(`Invalid environment variables: ${parsed.error.message}`);
    }
    return parsed.data;
  };
  const getEnv = (key) => {
    return Effect42.gen(function* () {
      yield* Ref11.update(envRef, (existingEnv) => {
        if (existingEnv === void 0) {
          return parseEnv();
        }
        return existingEnv;
      });
      const env = yield* Ref11.get(envRef);
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
var EnvService = class extends Context30.Tag("EnvService")() {
  static {
    this.Live = Layer32.effect(this, LayerImpl22);
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
var NotARepositoryError = class extends Data7.TaggedError("NotARepositoryError") {
};
var GitCommandError2 = class extends Data7.TaggedError("GitCommandError") {
};
var DetachedHeadError = class extends Data7.TaggedError("DetachedHeadError") {
};
var LayerImpl23 = Effect43.gen(function* () {
  const fs = yield* FileSystem18.FileSystem;
  const path5 = yield* Path22.Path;
  const envService = yield* EnvService;
  const execGitCommand = (args, cwd) => Effect43.gen(function* () {
    const absoluteCwd = path5.resolve(cwd);
    if (!(yield* fs.exists(absoluteCwd))) {
      return yield* Effect43.fail(
        new NotARepositoryError({ cwd: absoluteCwd })
      );
    }
    const command = Command5.make("git", ...args).pipe(
      Command5.workingDirectory(absoluteCwd),
      Command5.env({
        PATH: yield* envService.getEnv("PATH")
      })
    );
    const result = yield* Effect43.either(Command5.string(command));
    if (Either3.isLeft(result)) {
      return yield* Effect43.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: `git ${args.join(" ")}`
        })
      );
    }
    return result.right;
  });
  const getBranches = (cwd) => Effect43.gen(function* () {
    const result = yield* execGitCommand(["branch", "-vv", "--all"], cwd);
    return parseGitBranchesOutput(result);
  });
  const getCurrentBranch = (cwd) => Effect43.gen(function* () {
    const currentBranch = yield* execGitCommand(
      ["branch", "--show-current"],
      cwd
    ).pipe(Effect43.map((result) => result.trim()));
    if (currentBranch === "") {
      return yield* Effect43.fail(new DetachedHeadError({ cwd }));
    }
    return currentBranch;
  });
  const branchExists = (cwd, branchName) => Effect43.gen(function* () {
    const result = yield* Effect43.either(
      execGitCommand(["branch", "--exists", branchName], cwd)
    );
    if (Either3.isLeft(result)) {
      return false;
    }
    return true;
  });
  const getCommits = (cwd) => Effect43.gen(function* () {
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
  const stageFiles = (cwd, files) => Effect43.gen(function* () {
    if (files.length === 0) {
      return yield* Effect43.fail(
        new GitCommandError2({
          cwd,
          command: "git add (no files)"
        })
      );
    }
    const result = yield* execGitCommand(["add", ...files], cwd);
    return result;
  });
  const commit = (cwd, message) => Effect43.gen(function* () {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return yield* Effect43.fail(
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
  const push = (cwd) => Effect43.gen(function* () {
    const branch = yield* getCurrentBranch(cwd);
    const absoluteCwd = path5.resolve(cwd);
    const command = Command5.make("git", "push", "origin", "HEAD").pipe(
      Command5.workingDirectory(absoluteCwd),
      Command5.env({
        PATH: yield* envService.getEnv("PATH")
      })
    );
    const exitCodeResult = yield* Effect43.either(
      Command5.exitCode(command).pipe(Effect43.timeout(Duration2.seconds(60)))
    );
    if (Either3.isLeft(exitCodeResult)) {
      console.log("[GitService.push] Command failed or timeout");
      return yield* Effect43.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: "git push origin HEAD (timeout after 60s)"
        })
      );
    }
    const exitCode = exitCodeResult.right;
    console.log("[GitService.push] Exit code:", exitCode);
    if (exitCode !== 0) {
      const stderrLines = yield* Command5.lines(
        Command5.make("git", "push", "origin", "HEAD").pipe(
          Command5.workingDirectory(absoluteCwd),
          Command5.env({
            PATH: yield* envService.getEnv("PATH")
          }),
          Command5.stderr("inherit")
        )
      ).pipe(Effect43.orElse(() => Effect43.succeed([])));
      const stderr = Array.from(stderrLines).join("\n");
      console.log("[GitService.push] Failed with stderr:", stderr);
      return yield* Effect43.fail(
        new GitCommandError2({
          cwd: absoluteCwd,
          command: `git push origin HEAD - ${stderr}`
        })
      );
    }
    console.log("[GitService.push] Push succeeded");
    return { branch, output: "success" };
  });
  const getBranchHash = (cwd, branchName) => Effect43.gen(function* () {
    const result = yield* execGitCommand(["rev-parse", branchName], cwd).pipe(
      Effect43.map((output) => output.trim().split("\n")[0] ?? null)
    );
    return result;
  });
  const getBranchNamesByCommitHash = (cwd, hash) => Effect43.gen(function* () {
    const result = yield* execGitCommand(
      ["branch", "--contains", hash, "--format=%(refname:short)"],
      cwd
    );
    return result.split("\n").map((line) => line.trim()).filter((line) => line !== "");
  });
  const compareCommitHash = (cwd, targetHash, compareHash) => Effect43.gen(function* () {
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
  const getCommitsWithParent = (cwd, options) => Effect43.gen(function* () {
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
  const findBaseBranch = (cwd, targetBranch) => Effect43.gen(function* () {
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
  const getCommitsBetweenBranches = (cwd, baseBranch, targetBranch) => Effect43.gen(function* () {
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
var GitService = class extends Context31.Tag("GitService")() {
  static {
    this.Live = Layer33.effect(this, LayerImpl23);
  }
};

// src/server/core/git/presentation/GitController.ts
var LayerImpl24 = Effect44.gen(function* () {
  const gitService = yield* GitService;
  const projectRepository = yield* ProjectRepository;
  const getGitDiff = (options) => Effect44.gen(function* () {
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
  const commitFiles = (options) => Effect44.gen(function* () {
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
    const stageResult = yield* Effect44.either(
      gitService.stageFiles(projectPath, files)
    );
    if (Either4.isLeft(stageResult)) {
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
    const commitResult = yield* Effect44.either(
      gitService.commit(projectPath, message)
    );
    if (Either4.isLeft(commitResult)) {
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
  const pushCommits = (options) => Effect44.gen(function* () {
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
    const pushResult = yield* Effect44.either(gitService.push(projectPath));
    if (Either4.isLeft(pushResult)) {
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
  const commitAndPush = (options) => Effect44.gen(function* () {
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
  const getCurrentRevisions = (options) => Effect44.gen(function* () {
    const { projectId } = options;
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        response: { error: "Project path not found" },
        status: 400
      };
    }
    const projectPath = project.meta.projectPath;
    const currentBranchResult = yield* Effect44.either(
      gitService.getCurrentBranch(projectPath)
    );
    if (Either4.isLeft(currentBranchResult)) {
      return {
        response: {
          success: false
        },
        status: 200
      };
    }
    const currentBranch = currentBranchResult.right;
    const baseBranchResult = yield* Effect44.either(
      gitService.findBaseBranch(projectPath, currentBranch)
    );
    const allBranchesResult = yield* Effect44.either(
      gitService.getBranches(projectPath)
    );
    if (Either4.isLeft(allBranchesResult)) {
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
    if (Either4.isRight(baseBranchResult) && baseBranchResult.right !== null) {
      const baseBranchName = baseBranchResult.right.branch;
      baseBranchDetails = allBranches.find(
        (branch) => branch.name === baseBranchName
      );
    }
    let commits = [];
    if (Either4.isRight(baseBranchResult) && baseBranchResult.right !== null) {
      const baseBranchHash = baseBranchResult.right.hash;
      const commitsResult = yield* Effect44.either(
        gitService.getCommitsBetweenBranches(
          projectPath,
          baseBranchHash,
          "HEAD"
        )
      );
      if (Either4.isRight(commitsResult)) {
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
var GitController = class extends Context32.Tag("GitController")() {
  static {
    this.Live = Layer34.effect(this, LayerImpl24);
  }
};

// src/server/core/openspec/presentation/OpenSpecController.ts
import { Context as Context40, Effect as Effect52, Layer as Layer42 } from "effect";

// src/server/core/openspec/services/OpenSpecEnvironmentService.ts
import { Command as Command7, FileSystem as FileSystem20, Path as Path24 } from "@effect/platform";
import { Context as Context34, Data as Data8, Duration as Duration4, Effect as Effect46, Either as Either6, Layer as Layer36 } from "effect";

// src/server/core/openspec/services/CliDetectionService.ts
import { Command as Command6, CommandExecutor as CommandExecutor2, FileSystem as FileSystem19, Path as Path23 } from "@effect/platform";
import { Context as Context33, Duration as Duration3, Effect as Effect45, Either as Either5, Layer as Layer35 } from "effect";
var CliDetectionService = class extends Context33.Tag("CliDetectionService")() {
};
var CliDetectionServiceLive = Layer35.effect(
  CliDetectionService,
  Effect45.gen(function* () {
    const fs = yield* FileSystem19.FileSystem;
    const path5 = yield* Path23.Path;
    const commandExecutor = yield* CommandExecutor2.CommandExecutor;
    const commandExecutorLayer = Layer35.succeed(
      CommandExecutor2.CommandExecutor,
      commandExecutor
    );
    return {
      /**
       * 检查全局 CLI 安装状态
       * 先检查全局 openspec，再检查 npx 可用性
       */
      checkGlobalCli: () => Effect45.gen(function* () {
        const openspecExecutable = process.platform === "win32" ? "openspec.cmd" : "openspec";
        const npxExecutable = process.platform === "win32" ? "npx.cmd" : "npx";
        const globalCommand = Command6.make(openspecExecutable, "--version");
        const globalResult = yield* Effect45.either(
          Command6.string(globalCommand.pipe(Command6.runInShell(true))).pipe(
            Effect45.timeout(Duration3.seconds(5))
          )
        );
        if (Either5.isRight(globalResult)) {
          return {
            installed: true,
            version: String(globalResult.right).trim(),
            type: "global"
          };
        }
        const npxCommand = Command6.make(
          npxExecutable,
          "--no-install",
          "openspec",
          "--version"
        );
        const npxResult = yield* Effect45.either(
          Command6.string(npxCommand.pipe(Command6.runInShell(true))).pipe(
            Effect45.timeout(Duration3.seconds(2))
          )
        );
        if (Either5.isRight(npxResult)) {
          return {
            installed: false,
            version: String(npxResult.right).trim(),
            type: "npx"
          };
        }
        return { installed: false };
      }).pipe(
        Effect45.provide(commandExecutorLayer),
        Effect45.catchAll(() => Effect45.succeed({ installed: false }))
      ),
      /**
       * 检查项目本地 CLI 安装状态
       */
      checkProjectCli: (projectPath) => Effect45.gen(function* () {
        const nodeModulesBinDir = path5.join(
          projectPath,
          "node_modules",
          ".bin"
        );
        const candidateCliNames = process.platform === "win32" ? ["openspec.cmd", "openspec.exe", "openspec.ps1", "openspec"] : ["openspec"];
        const candidatePaths = candidateCliNames.map(
          (name) => path5.join(nodeModulesBinDir, name)
        );
        const checks = yield* Effect45.forEach(
          candidatePaths,
          (candidatePath) => fs.exists(candidatePath).pipe(Effect45.map((exists) => ({ candidatePath, exists })))
        );
        const existingCliPath = checks.find(
          (item) => item.exists
        )?.candidatePath;
        if (existingCliPath === void 0) {
          return { installed: false };
        }
        const command = Command6.make(existingCliPath, "--version");
        const result = yield* Effect45.either(
          Command6.string(command.pipe(Command6.runInShell(true))).pipe(
            Effect45.timeout(Duration3.seconds(5))
          )
        );
        if (Either5.isRight(result)) {
          return {
            installed: true,
            version: String(result.right).trim(),
            type: "project",
            cliPath: existingCliPath
          };
        }
        return { installed: false };
      }).pipe(
        Effect45.provide(commandExecutorLayer),
        Effect45.catchAll(() => Effect45.succeed({ installed: false }))
      )
    };
  })
);

// src/server/core/openspec/services/specforgeMarker.ts
var SPECFORGE_MARKER_BLOCK_PATTERN = /_specforge:\s*\r?\n([\s\S]*?)(?=\r?\n[a-zA-Z_][\w-]*:\s*|\r?\n$|$)/;
var SPECFORGE_MARKER_BLOCK_REPLACE_PATTERN = /_specforge:\s*\r?\n[\s\S]*?(?=\r?\n[a-zA-Z_][\w-]*:\s*|\r?\n$|$)/;
var extractSpecforgeMarkerBlock = (content) => {
  const matched = content.match(SPECFORGE_MARKER_BLOCK_PATTERN);
  return matched?.[1];
};

// src/server/core/openspec/services/OpenSpecEnvironmentService.ts
var ProjectPathNotFoundError3 = class extends Data8.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var SPECFORGE_REQUIRED_SKILLS = [
  "task-planning"
];
var SPECFORGE_MANAGED_SKILLS = [
  "task-planning",
  "gitnexus",
  "d2c-baseline",
  "d2c-stitching",
  "spec-process",
  "design-process"
];
var SPECFORGE_MANAGED_AGENTS = [
  "format-compliance-agent.md",
  "quality-gate-agent.md"
];
var OPENSPEC_PINNED_VERSION = "1.2.0";
var DEFAULT_TEMPLATE_VERSION = "1.0.0";
var NPM_EXECUTABLE = process.platform === "win32" ? "npm.cmd" : "npm";
var NPX_EXECUTABLE = process.platform === "win32" ? "npx.cmd" : "npx";
var OPENSPEC_EXECUTABLE = process.platform === "win32" ? "openspec.cmd" : "openspec";
var isRecord2 = (value) => typeof value === "object" && value !== null;
var readStringField = (value, field) => {
  const target = value[field];
  if (typeof target !== "string") {
    return void 0;
  }
  const trimmed = target.trim();
  return trimmed.length > 0 ? trimmed : void 0;
};
var formatUnknownError3 = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
var joinPathForPlatform = (platform, ...parts) => {
  const separator = platform === "win32" ? "\\" : "/";
  const sanitizedParts = parts.map(
    (part, index) => index === 0 ? part.replace(/[\\/]+$/g, "") : part.replace(/^[\\/]+|[\\/]+$/g, "")
  ).filter((part) => part.length > 0);
  return sanitizedParts.join(separator);
};
var resolveOpenSpecConfigHome = (options) => {
  const env = options?.env ?? process.env;
  const platform = options?.platform ?? process.platform;
  const xdgConfigHome = env.XDG_CONFIG_HOME?.trim();
  if (xdgConfigHome) return xdgConfigHome;
  if (platform === "win32") {
    const appData = env.APPDATA?.trim();
    if (appData) return appData;
    const userProfile = env.USERPROFILE?.trim();
    if (userProfile) {
      return joinPathForPlatform(platform, userProfile, "AppData", "Roaming");
    }
  }
  const homeDir = env.HOME?.trim();
  if (homeDir) {
    return joinPathForPlatform(platform, homeDir, ".config");
  }
  return void 0;
};
var OPENSPEC_ALL_WORKFLOWS = [
  "propose",
  "explore",
  "new",
  "continue",
  "apply",
  "ff",
  "sync",
  "archive",
  "bulk-archive",
  "verify",
  "onboard"
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
var LayerImpl25 = Effect46.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem20.FileSystem;
  const path5 = yield* Path24.Path;
  const cliDetection = yield* CliDetectionService;
  const ensureSpecforgeGlobalOpenspecConfig = () => Effect46.gen(function* () {
    const configHome = resolveOpenSpecConfigHome();
    if (!configHome) {
      return {
        success: false,
        error: "\u65E0\u6CD5\u5B9A\u4F4D\u7528\u6237\u914D\u7F6E\u76EE\u5F55\uFF08XDG_CONFIG_HOME/APPDATA/USERPROFILE/HOME \u5747\u4E3A\u7A7A\uFF09"
      };
    }
    const configDir = path5.join(configHome, "openspec");
    const configPath = path5.join(configDir, "config.json");
    const desiredConfig = {
      profile: "custom",
      delivery: "both",
      workflows: [...OPENSPEC_ALL_WORKFLOWS]
    };
    const dirExists = yield* fs.exists(configDir);
    if (!dirExists) {
      yield* fs.makeDirectory(configDir, { recursive: true });
    }
    let mergedConfig = desiredConfig;
    const fileExists = yield* fs.exists(configPath);
    if (fileExists) {
      const existingRaw = yield* fs.readFileString(configPath);
      try {
        const parsed = JSON.parse(existingRaw);
        if (isRecord2(parsed)) {
          mergedConfig = {
            ...parsed,
            ...desiredConfig
          };
        }
      } catch {
        mergedConfig = desiredConfig;
      }
    }
    yield* fs.writeFileString(
      configPath,
      `${JSON.stringify(mergedConfig, null, 2)}
`
    );
    return {
      success: true,
      error: void 0
    };
  });
  const getTemplateBasePath = Effect46.gen(function* () {
    const distPath = path5.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path5.join(process.cwd(), "template-to-project");
  });
  const getLatestTemplateVersion = Effect46.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const manifestPath = path5.join(templateBasePath, "template-manifest.json");
    const exists = yield* fs.exists(manifestPath);
    if (!exists) return DEFAULT_TEMPLATE_VERSION;
    const raw = yield* fs.readFileString(manifestPath);
    try {
      const parsed = JSON.parse(raw);
      if (isRecord2(parsed)) {
        return readStringField(parsed, "template_version") ?? DEFAULT_TEMPLATE_VERSION;
      }
      return DEFAULT_TEMPLATE_VERSION;
    } catch {
      return DEFAULT_TEMPLATE_VERSION;
    }
  });
  const parseSpecforgeMarker = (content) => {
    const block = extractSpecforgeMarkerBlock(content);
    if (!block) return void 0;
    const profileMatch = block.match(
      /^\s*profile:\s*["']?([^"'\r\n]+)["']?\s*$/m
    );
    const initializedAtMatch = block.match(
      /^\s*initialized_at:\s*["']?([^"'\r\n]+)["']?\s*$/m
    );
    const templateVersionMatch = block.match(
      /^\s*template_version:\s*["']?([^"'\r\n]+)["']?\s*$/m
    );
    if (!profileMatch?.[1] || !initializedAtMatch?.[1]) return void 0;
    return {
      profile: profileMatch[1].trim(),
      initializedAt: initializedAtMatch[1].trim(),
      templateVersion: templateVersionMatch?.[1] ? templateVersionMatch[1].trim() : void 0
    };
  };
  const parseOpenspecConfigInfo = (content) => {
    const schemaMatch = content.match(/^schema:\s*["']?([^"'\r\n]+)["']?\s*$/m);
    return {
      hasMarker: content.includes("_specforge:"),
      specforgeConfig: parseSpecforgeMarker(content),
      schema: schemaMatch?.[1] ? schemaMatch[1].trim() : void 0
    };
  };
  const hasSpecforgeMarker = (projectPath) => Effect46.gen(function* () {
    const configPath = path5.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (!exists) return false;
    const content = yield* fs.readFileString(configPath);
    return content.includes("_specforge:");
  });
  const getSpecforgeConfig = (projectPath) => Effect46.gen(function* () {
    const configPath = path5.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (!exists) return void 0;
    const content = yield* fs.readFileString(configPath);
    return parseSpecforgeMarker(content);
  });
  const getOpenspecSchema = (projectPath) => Effect46.gen(function* () {
    const configPath = path5.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    if (!exists) return void 0;
    const content = yield* fs.readFileString(configPath);
    return parseOpenspecConfigInfo(content).schema;
  });
  const getMissingSkills = (projectPath) => Effect46.gen(function* () {
    const skillsDir = path5.join(projectPath, ".claude", "skills");
    const missing = [];
    for (const skill of SPECFORGE_MANAGED_SKILLS) {
      const skillPath = path5.join(skillsDir, skill);
      const exists = yield* fs.exists(skillPath);
      if (!exists) {
        missing.push(skill);
      }
    }
    return missing;
  });
  const getMissingAgents = (projectPath) => Effect46.gen(function* () {
    const agentsDir = path5.join(projectPath, ".claude", "agents");
    const missing = [];
    for (const agentFile of SPECFORGE_MANAGED_AGENTS) {
      const filePath = path5.join(agentsDir, agentFile);
      const exists = yield* fs.exists(filePath);
      if (!exists) {
        missing.push(agentFile);
      }
    }
    return missing;
  });
  const getMissingManagedFiles = (projectPath) => Effect46.gen(function* () {
    const missing = [];
    const base = path5.join(
      projectPath,
      "openspec",
      "schemas",
      "specforge-enhanced"
    );
    for (const file of [
      "schema.yaml",
      "templates/design.md",
      "templates/spec.md",
      "templates/tasks.md"
    ]) {
      const exists = yield* fs.exists(path5.join(base, file));
      if (!exists) {
        missing.push(`openspec/schemas/specforge-enhanced/${file}`);
      }
    }
    return missing;
  });
  const validateConfig = (hasOpenspecDir, hasClaudeDir, hasMarker, specforgeConfig, schema, missingSkills) => {
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
    if (hasMarker && schema !== "specforge-enhanced") {
      errors.push(
        `openspec/config.yaml \u7684 schema \u5FC5\u987B\u662F specforge-enhanced\uFF08\u5F53\u524D: ${schema ?? "\u672A\u8BBE\u7F6E"}\uFF09`
      );
    }
    if (missingSkills.length > 0) {
      errors.push(`\u7F3A\u5C11\u5FC5\u9700\u7684 skills: ${missingSkills.join(", ")}`);
    }
    return errors;
  };
  const getMissingMcpServers = (_projectPath) => Effect46.succeed([]);
  const identifyScenario = (hasOpenspec, hasClaude, hasMarker, missingSkills, missingAgents, missingManagedFiles) => {
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
      const isComplete = missingSkills.length === 0 && missingAgents.length === 0 && missingManagedFiles.length === 0;
      return isComplete ? "S5_CONFIGURED" : "S6_PARTIAL";
    }
    return "S1_NEW";
  };
  const checkEnvironment = (projectId) => Effect46.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      const globalCli2 = yield* cliDetection.checkGlobalCli();
      return {
        cliInstalled: globalCli2.installed,
        cliVersion: globalCli2.version ?? null,
        cliInstallType: globalCli2.installed ? globalCli2.type : void 0,
        scenario: "S1_NEW",
        scenarioDescription: "\u65E0\u6CD5\u4ECE Claude \u4F1A\u8BDD\u4E2D\u89E3\u6790\u9879\u76EE\u8DEF\u5F84\uFF0C\u8BF7\u5148\u5728\u76EE\u6807\u9879\u76EE\u76EE\u5F55\u53D1\u8D77\u4E00\u6B21 Claude \u4F1A\u8BDD",
        hasOpenspecDir: false,
        hasClaudeDir: false,
        hasSpecforgeMarker: false,
        specforgeConfig: null,
        templateUpgradeAvailable: false,
        isConfigCorrupted: true,
        configErrors: [
          "\u65E0\u6CD5\u89E3\u6790\u9879\u76EE\u8DEF\u5F84\uFF08projectPath \u4E3A\u7A7A\uFF09\u3002\u8BF7\u5148\u5728\u76EE\u6807\u9879\u76EE\u76EE\u5F55\u53D1\u8D77\u4E00\u6B21 Claude \u4F1A\u8BDD\u540E\u91CD\u8BD5\u3002"
        ],
        missingSpecforgeSkills: [...SPECFORGE_REQUIRED_SKILLS],
        missingSpecforgeAgents: [],
        missingManagedFiles: [],
        missingMcpServers: [],
        recommendedAction: "none"
      };
    }
    const projectPath = project.meta.projectPath;
    const [globalCli, projectCli] = yield* Effect46.all(
      [
        cliDetection.checkGlobalCli(),
        cliDetection.checkProjectCli(projectPath)
      ],
      { concurrency: "unbounded" }
    );
    const cliInstalled = globalCli.installed;
    const cliVersion = globalCli.version ?? projectCli.version ?? null;
    const cliInstallType = globalCli.installed ? globalCli.type : void 0;
    const openspecDir = path5.join(projectPath, "openspec");
    const claudeDir = path5.join(projectPath, ".claude");
    const hasOpenspecDir = yield* fs.exists(openspecDir);
    const hasClaudeDir = yield* fs.exists(claudeDir);
    const hasMarker = hasOpenspecDir ? yield* hasSpecforgeMarker(projectPath) : false;
    const specforgeConfig = hasMarker ? yield* getSpecforgeConfig(projectPath) : void 0;
    const openspecSchema = hasOpenspecDir ? yield* getOpenspecSchema(projectPath) : void 0;
    const missingSpecforgeSkills = hasClaudeDir ? yield* getMissingSkills(projectPath) : [...SPECFORGE_MANAGED_SKILLS];
    const missingSpecforgeAgents = hasClaudeDir ? yield* getMissingAgents(projectPath) : [...SPECFORGE_MANAGED_AGENTS];
    const missingManagedFiles = yield* getMissingManagedFiles(projectPath);
    const missingMcpServers = yield* getMissingMcpServers(projectPath);
    const configErrors = validateConfig(
      hasOpenspecDir,
      hasClaudeDir,
      hasMarker,
      specforgeConfig,
      openspecSchema,
      missingSpecforgeSkills
    );
    const isConfigCorrupted = configErrors.length > 0;
    const latestTemplateVersion = yield* getLatestTemplateVersion;
    const templateUpgradeAvailable = hasMarker && !!specforgeConfig && !isConfigCorrupted && (specforgeConfig.templateVersion === void 0 || specforgeConfig.templateVersion !== latestTemplateVersion);
    const scenario = identifyScenario(
      hasOpenspecDir,
      hasClaudeDir,
      hasMarker,
      missingSpecforgeSkills,
      missingSpecforgeAgents,
      missingManagedFiles
    );
    const normalizedScenario = scenario === "S5_CONFIGURED" && isConfigCorrupted ? "S6_PARTIAL" : scenario;
    const status = {
      // CLI 状态
      cliInstalled,
      cliVersion,
      cliInstallType,
      // 场景识别
      scenario: normalizedScenario,
      scenarioDescription: SCENARIO_DESCRIPTIONS[normalizedScenario],
      // 目录状态
      hasOpenspecDir,
      hasClaudeDir,
      hasSpecforgeMarker: hasMarker,
      specforgeConfig: specforgeConfig ?? null,
      // 确保字段存在（null 而不是 undefined）
      templateUpgradeAvailable,
      // 配置验证
      isConfigCorrupted,
      configErrors,
      // 缺失项分析
      missingSpecforgeSkills,
      missingSpecforgeAgents,
      missingManagedFiles,
      missingMcpServers,
      // 推荐操作
      recommendedAction: SCENARIO_ACTIONS[normalizedScenario]
    };
    return status;
  });
  const installCliGlobal = (options = {}) => Effect46.gen(function* () {
    const installCommand = Command7.make(
      NPM_EXECUTABLE,
      "install",
      "-g",
      `@fission-ai/openspec@${OPENSPEC_PINNED_VERSION}`
    );
    const installResult = yield* Effect46.either(
      Command7.string(installCommand.pipe(Command7.runInShell(true))).pipe(
        Effect46.timeout(Duration4.seconds(120))
      )
    );
    if (Either6.isLeft(installResult)) {
      return {
        success: false,
        error: `\u5B89\u88C5\u5931\u8D25: ${formatUnknownError3(installResult.left)}`,
        initialized: false
      };
    }
    if (options.initialize && options.projectPath) {
      const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
      if (!configSetupResult.success) {
        return {
          success: false,
          error: `\u5199\u5165 OpenSpec \u5168\u5C40\u914D\u7F6E\u5931\u8D25: ${configSetupResult.error}`,
          initialized: false
        };
      }
      const initCommand = Command7.make(
        OPENSPEC_EXECUTABLE,
        "init",
        "--tools",
        "claude",
        "--force"
      );
      const initCommandWithCwd = Command7.workingDirectory(
        initCommand,
        options.projectPath
      );
      const initResult = yield* Effect46.either(
        Command7.string(
          initCommandWithCwd.pipe(Command7.runInShell(true))
        ).pipe(Effect46.timeout(Duration4.seconds(60)))
      );
      if (Either6.isLeft(initResult)) {
        return {
          success: false,
          error: `\u521D\u59CB\u5316\u5931\u8D25: ${formatUnknownError3(initResult.left)}`,
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
  const installCliProject = (projectId, options = {}) => Effect46.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect46.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const installCommand = Command7.make(
      NPM_EXECUTABLE,
      "install",
      "--save-dev",
      `@fission-ai/openspec@${OPENSPEC_PINNED_VERSION}`
    );
    const installCommandWithCwd = Command7.workingDirectory(
      installCommand,
      projectPath
    );
    const installResult = yield* Effect46.either(
      Command7.string(
        installCommandWithCwd.pipe(Command7.runInShell(true))
      ).pipe(Effect46.timeout(Duration4.seconds(120)))
    );
    if (Either6.isLeft(installResult)) {
      return {
        success: false,
        error: `\u5B89\u88C5\u5931\u8D25: ${formatUnknownError3(installResult.left)}`,
        initialized: false
      };
    }
    if (options.initialize) {
      const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
      if (!configSetupResult.success) {
        return {
          success: false,
          error: `\u5199\u5165 OpenSpec \u5168\u5C40\u914D\u7F6E\u5931\u8D25: ${configSetupResult.error}`,
          initialized: false
        };
      }
      const initCommand = Command7.make(
        NPX_EXECUTABLE,
        "openspec",
        "init",
        "--tools",
        "claude",
        "--force"
      );
      const initCommandWithCwd = Command7.workingDirectory(
        initCommand,
        projectPath
      );
      const initResult = yield* Effect46.either(
        Command7.string(
          initCommandWithCwd.pipe(Command7.runInShell(true))
        ).pipe(Effect46.timeout(Duration4.seconds(60)))
      );
      if (Either6.isLeft(initResult)) {
        return {
          success: false,
          error: `\u521D\u59CB\u5316\u5931\u8D25: ${formatUnknownError3(initResult.left)}`,
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
  const initializeOpenspec = (projectId) => Effect46.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect46.fail(new ProjectPathNotFoundError3({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const configSetupResult = yield* ensureSpecforgeGlobalOpenspecConfig();
    if (!configSetupResult.success) {
      return {
        success: false,
        error: `\u5199\u5165 OpenSpec \u5168\u5C40\u914D\u7F6E\u5931\u8D25: ${configSetupResult.error}`,
        method: null
      };
    }
    const globalCommand = Command7.make(
      OPENSPEC_EXECUTABLE,
      "init",
      "--tools",
      "claude",
      "--force"
    );
    const globalCommandWithCwd = Command7.workingDirectory(
      globalCommand,
      projectPath
    );
    const globalResult = yield* Effect46.either(
      Command7.string(
        globalCommandWithCwd.pipe(Command7.runInShell(true))
      ).pipe(Effect46.timeout(Duration4.seconds(60)))
    );
    if (Either6.isRight(globalResult)) {
      return {
        success: true,
        error: void 0,
        method: "global"
      };
    }
    const npxCommand = Command7.make(
      NPX_EXECUTABLE,
      "openspec",
      "init",
      "--tools",
      "claude",
      "--force"
    );
    const npxCommandWithCwd = Command7.workingDirectory(
      npxCommand,
      projectPath
    );
    const npxResult = yield* Effect46.either(
      Command7.string(npxCommandWithCwd.pipe(Command7.runInShell(true))).pipe(
        Effect46.timeout(Duration4.seconds(120))
      )
    );
    if (Either6.isRight(npxResult)) {
      return {
        success: true,
        error: void 0,
        method: "npx"
      };
    }
    return {
      success: false,
      error: `\u521D\u59CB\u5316\u5931\u8D25: ${formatUnknownError3(npxResult.left)}`,
      method: null
    };
  });
  const installGitNexusGlobal = () => Effect46.gen(function* () {
    const installCommand = Command7.make(
      NPM_EXECUTABLE,
      "install",
      "-g",
      "gitnexus@latest"
    );
    const installResult = yield* Effect46.either(
      Command7.string(installCommand.pipe(Command7.runInShell(true))).pipe(
        Effect46.timeout(Duration4.seconds(120))
      )
    );
    if (Either6.isLeft(installResult)) {
      return {
        success: false,
        error: `GitNexus \u5B89\u88C5\u5931\u8D25: ${formatUnknownError3(installResult.left)}`
      };
    }
    return { success: true, error: void 0 };
  });
  const runGitNexusAnalyze = (projectId) => Effect46.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return {
        success: false,
        error: "gitnexus analyze \u8DF3\u8FC7: \u65E0\u6CD5\u89E3\u6790\u9879\u76EE\u8DEF\u5F84"
      };
    }
    const projectPath = project.meta.projectPath;
    const gitnexusExecutable = process.platform === "win32" ? "gitnexus.cmd" : "gitnexus";
    const analyzeCommand = Command7.make(gitnexusExecutable, "analyze");
    const analyzeCommandWithCwd = Command7.workingDirectory(
      analyzeCommand,
      projectPath
    );
    const analyzeResult = yield* Effect46.either(
      Command7.string(
        analyzeCommandWithCwd.pipe(Command7.runInShell(true))
      ).pipe(Effect46.timeout(Duration4.seconds(120)))
    );
    if (Either6.isLeft(analyzeResult)) {
      return {
        success: false,
        error: `gitnexus analyze \u6267\u884C\u5931\u8D25: ${formatUnknownError3(analyzeResult.left)}`
      };
    }
    return { success: true, error: void 0 };
  });
  return {
    checkEnvironment,
    installCliGlobal,
    installCliProject,
    initializeOpenspec,
    installGitNexusGlobal,
    runGitNexusAnalyze
  };
});
var OpenSpecEnvironmentService = class extends Context34.Tag(
  "OpenSpecEnvironmentService"
)() {
  static {
    this.Live = Layer36.effect(this, LayerImpl25);
  }
};

// src/server/core/openspec/services/OpenSpecService.ts
import { FileSystem as FileSystem21, Path as Path25 } from "@effect/platform";
import { Context as Context35, Data as Data9, Effect as Effect47, Layer as Layer37, Option as Option4 } from "effect";

// src/lib/openspec/d2c.ts
var matchCommentValue = (content, key) => {
  const pattern = new RegExp(`<!--\\s*${key}:\\s*([\\s\\S]*?)\\s*-->`);
  const match = content.match(pattern);
  return match?.[1]?.trim();
};
var parseBoolean = (value) => {
  if (!value) {
    return false;
  }
  return value.trim().toLowerCase() === "true";
};
var normalizeTargetScope = (value) => {
  if (value === "page" || value === "module" || value === "component") {
    return value;
  }
  return "unknown";
};
var normalizeChangeKind = (value) => {
  if (value === "new" || value === "modify") {
    return value;
  }
  return "unknown";
};
var normalizeReviewStatus = (value) => {
  if (value === "passed" || value === "failed") {
    return value;
  }
  return "unknown";
};
var isRecord3 = (value) => typeof value === "object" && value !== null;
var readOptionalString = (value, field) => {
  const target = value[field];
  return typeof target === "string" && target.trim().length > 0 ? target.trim() : void 0;
};
var readStringArray = (value, field) => {
  const target = value[field];
  if (!Array.isArray(target)) {
    return [];
  }
  return target.filter((item) => typeof item === "string");
};
var toMaterial = (value, defaultScope) => {
  if (!isRecord3(value)) {
    return void 0;
  }
  const link = readOptionalString(value, "link");
  if (!link) {
    return void 0;
  }
  const normalizedScope = normalizeTargetScope(
    readOptionalString(value, "scope")
  );
  const artifactId = readOptionalString(value, "artifactId");
  return {
    link,
    description: readOptionalString(value, "description"),
    scope: normalizedScope === "unknown" ? defaultScope : normalizedScope,
    artifactId
  };
};
var readMaterialArray = (value, defaultScope) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const material = toMaterial(item, defaultScope);
    return material ? [material] : [];
  });
};
var parseProposalMaterials = (rawValue, defaultScope) => {
  if (!rawValue) {
    return [];
  }
  try {
    const parsed = JSON.parse(rawValue);
    return readMaterialArray(parsed, defaultScope);
  } catch {
    return [];
  }
};
var buildLegacyMaterial = (link, defaultScope) => {
  if (!link) {
    return [];
  }
  return [
    {
      link,
      scope: defaultScope
    }
  ];
};
var pickPreferredMaterials = (primary, fallback) => {
  if (primary.length > 0) {
    return primary;
  }
  return fallback;
};
var materialKey = (material) => `${material.link}::${material.scope}::${material.description ?? ""}`;
var mergeMaterialArtifactIds = (primary, fallback) => {
  if (primary.length === 0) {
    return fallback;
  }
  if (fallback.length === 0) {
    return primary;
  }
  const artifactMap = /* @__PURE__ */ new Map();
  for (const material of fallback) {
    if (material.artifactId) {
      artifactMap.set(materialKey(material), material.artifactId);
    }
  }
  return primary.map((material, index) => {
    if (material.artifactId) {
      return material;
    }
    const fallbackMaterial = fallback[index];
    if (fallbackMaterial?.artifactId && fallbackMaterial.link === material.link && fallbackMaterial.scope === material.scope && (fallbackMaterial.description ?? "") === (material.description ?? "")) {
      return { ...material, artifactId: fallbackMaterial.artifactId };
    }
    const artifactId = artifactMap.get(materialKey(material));
    if (!artifactId) {
      return material;
    }
    return { ...material, artifactId };
  });
};
var extractD2CInfoFromSpec = (specContent) => {
  if (!specContent) {
    return void 0;
  }
  const enabled = parseBoolean(matchCommentValue(specContent, "D2C_ENABLED"));
  const targetScope = normalizeTargetScope(
    matchCommentValue(specContent, "D2C_TARGET_SCOPE")
  );
  const changeKind = normalizeChangeKind(
    matchCommentValue(specContent, "D2C_CHANGE_KIND")
  );
  const materials = pickPreferredMaterials(
    parseProposalMaterials(
      matchCommentValue(specContent, "D2C_MATERIALS_JSON"),
      targetScope
    ),
    buildLegacyMaterial(
      matchCommentValue(specContent, "D2C_FIGMA_URL"),
      targetScope
    )
  );
  const baselineFrozen = parseBoolean(
    matchCommentValue(specContent, "D2C_BASELINE_FROZEN")
  );
  const baselineFrozenAt = matchCommentValue(
    specContent,
    "D2C_BASELINE_FROZEN_AT"
  );
  const reviewOverride = parseBoolean(
    matchCommentValue(specContent, "D2C_REVIEW_OVERRIDE")
  );
  const reviewOverrideAt = matchCommentValue(
    specContent,
    "D2C_REVIEW_OVERRIDE_AT"
  );
  const reviewOverrideReason = matchCommentValue(
    specContent,
    "D2C_REVIEW_OVERRIDE_REASON"
  );
  if (!enabled && materials.length === 0 && !baselineFrozen && !reviewOverride) {
    return void 0;
  }
  return {
    enabled,
    changeKind,
    materials,
    targetScope: targetScope !== "unknown" ? targetScope : materials[0]?.scope ?? "unknown",
    baselineFrozen,
    baselineFrozenAt,
    reviewOverride,
    reviewOverrideAt,
    reviewOverrideReason,
    reviewStatus: "unknown",
    canEnterDesign: false,
    effectiveCanEnterDesign: reviewOverride,
    reviewSummary: void 0,
    generatedAt: void 0,
    generator: void 0,
    previewPath: void 0,
    reviewPath: void 0,
    entryFiles: [],
    hasManifest: false,
    hasGeneratedFiles: false,
    generatedFiles: [],
    previewFiles: []
  };
};
var parseD2CManifest = (manifestContent) => {
  if (!manifestContent) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(manifestContent);
    if (!isRecord3(parsed)) {
      return void 0;
    }
    const targetScope = normalizeTargetScope(
      readOptionalString(parsed, "targetScope")
    );
    const materials = pickPreferredMaterials(
      readMaterialArray(parsed.materials, targetScope),
      buildLegacyMaterial(readOptionalString(parsed, "figmaUrl"), targetScope)
    );
    return {
      enabled: Boolean(parsed.enabled),
      changeKind: normalizeChangeKind(readOptionalString(parsed, "changeKind")),
      materials,
      reviewStatus: normalizeReviewStatus(
        readOptionalString(parsed, "reviewStatus")
      ),
      canEnterDesign: Boolean(parsed.canEnterDesign),
      reviewSummary: readOptionalString(parsed, "reviewSummary"),
      generator: readOptionalString(parsed, "generator"),
      generatedAt: readOptionalString(parsed, "generatedAt"),
      baselineFrozenAt: readOptionalString(parsed, "baselineFrozenAt"),
      entryFiles: readStringArray(parsed, "entryFiles"),
      sourceHash: readOptionalString(parsed, "sourceHash"),
      previewPath: readOptionalString(parsed, "previewPath"),
      reviewPath: readOptionalString(parsed, "reviewPath")
    };
  } catch {
    return void 0;
  }
};
var mergeD2CInfo = (options) => {
  const specInfo = options.specInfo ?? options.proposalInfo;
  const { manifest } = options;
  if (!specInfo && !manifest) {
    return void 0;
  }
  const generatedFiles = options.generatedFiles ?? [];
  const previewFiles = options.previewFiles ?? [];
  const materials = mergeMaterialArtifactIds(
    specInfo?.materials ?? [],
    manifest?.materials ?? []
  );
  const specScope = specInfo?.targetScope;
  return {
    enabled: specInfo?.enabled ?? manifest?.enabled ?? false,
    changeKind: specInfo?.changeKind ?? manifest?.changeKind ?? "unknown",
    materials,
    targetScope: specScope && specScope !== "unknown" ? specScope : materials[0]?.scope ?? "unknown",
    baselineFrozen: specInfo?.baselineFrozen ?? false,
    baselineFrozenAt: specInfo?.baselineFrozenAt ?? manifest?.baselineFrozenAt,
    reviewOverride: specInfo?.reviewOverride ?? false,
    reviewOverrideAt: specInfo?.reviewOverrideAt,
    reviewOverrideReason: specInfo?.reviewOverrideReason,
    reviewStatus: manifest?.reviewStatus ?? "unknown",
    canEnterDesign: manifest?.canEnterDesign ?? false,
    effectiveCanEnterDesign: (manifest?.canEnterDesign ?? false) || (specInfo?.reviewOverride ?? false),
    reviewSummary: manifest?.reviewSummary,
    generatedAt: manifest?.generatedAt,
    generator: manifest?.generator,
    previewPath: manifest?.previewPath,
    reviewPath: manifest?.reviewPath,
    entryFiles: manifest?.entryFiles ?? [],
    hasManifest: manifest !== void 0,
    hasGeneratedFiles: generatedFiles.length > 0,
    generatedFiles,
    previewFiles
  };
};

// src/server/core/openspec/services/OpenSpecService.ts
var ProjectPathNotFoundError4 = class extends Data9.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var OpenSpecDirectoryNotFoundError = class extends Data9.TaggedError(
  "OpenSpecDirectoryNotFoundError"
) {
};
var LayerImpl26 = Effect47.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem21.FileSystem;
  const path5 = yield* Path25.Path;
  const readPrimarySpecContent = (dirPath) => Effect47.gen(function* () {
    const specPath = path5.join(dirPath, "spec.md");
    const proposalPath = path5.join(dirPath, "proposal.md");
    const specContent = (yield* fs.exists(specPath)) ? yield* fs.readFileString(specPath) : void 0;
    const proposalContent = (yield* fs.exists(proposalPath)) ? yield* fs.readFileString(proposalPath) : void 0;
    return {
      specContent,
      proposalContent,
      primaryContent: specContent ?? proposalContent
    };
  });
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
  const getChanges = (projectId) => Effect47.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect47.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    const changesDir = path5.join(
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
      const entryPath = path5.join(changesDir, entry);
      const stat = yield* fs.stat(entryPath);
      if (stat.type === "Directory") {
        let description = "";
        const { primaryContent } = yield* readPrimarySpecContent(entryPath);
        if (primaryContent) {
          const lines = primaryContent.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("![")) {
              description = trimmed;
              break;
            }
          }
        }
        const d2c = extractD2CInfoFromSpec(primaryContent);
        const designPath = path5.join(entryPath, "design.md");
        const architecturePath = path5.join(entryPath, "architecture.md");
        let designContent;
        if (yield* fs.exists(architecturePath)) {
          designContent = yield* fs.readFileString(architecturePath);
        } else if (yield* fs.exists(designPath)) {
          designContent = yield* fs.readFileString(designPath);
        }
        const tasksPath = path5.join(entryPath, "tasks.md");
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
          description,
          d2c
        });
      }
    }
    return changes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
  const getArchivedChanges = (projectId) => Effect47.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect47.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    const archiveDir = path5.join(
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
      const entryPath = path5.join(archiveDir, entry);
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
  const getChangeDetails = (projectId, changeId) => Effect47.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect47.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    let changeDir = path5.join(
      project.meta.projectPath,
      "openspec",
      "changes",
      changeId
    );
    let exists = yield* fs.exists(changeDir);
    if (!exists) {
      const archiveDir = path5.join(
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
      return yield* Effect47.fail(
        new OpenSpecDirectoryNotFoundError({
          path: changeDir,
          message: `Change directory not found: ${changeId}`
        })
      );
    }
    const stat = yield* fs.stat(changeDir);
    const isArchived = /[\\/]archive[\\/]/.test(changeDir);
    const { specContent, proposalContent, primaryContent } = yield* readPrimarySpecContent(changeDir);
    let description = "";
    if (primaryContent) {
      const lines = primaryContent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("![")) {
          description = trimmed;
          break;
        }
      }
    }
    const architecturePath = path5.join(changeDir, "architecture.md");
    const designPath = path5.join(changeDir, "design.md");
    let designContent;
    if (yield* fs.exists(architecturePath)) {
      designContent = yield* fs.readFileString(architecturePath);
    } else if (yield* fs.exists(designPath)) {
      designContent = yield* fs.readFileString(designPath);
    }
    const tasksPath = path5.join(changeDir, "tasks.md");
    const tasksExists = yield* fs.exists(tasksPath);
    const tasksContent = tasksExists ? yield* fs.readFileString(tasksPath) : void 0;
    const testsPath = path5.join(changeDir, "tests.md");
    const testsContent = (yield* fs.exists(testsPath)) ? yield* fs.readFileString(testsPath) : void 0;
    const rootSpecsPath = path5.join(changeDir, "specs.md");
    const specsContent = (yield* fs.exists(rootSpecsPath)) ? yield* fs.readFileString(rootSpecsPath) : void 0;
    const specsDir = path5.join(changeDir, "specs");
    let specFiles = [];
    const getFilesRecursively = (dir) => Effect47.gen(function* () {
      if (!(yield* fs.exists(dir))) return [];
      const entries = yield* fs.readDirectory(dir);
      let results = [];
      for (const entry of entries) {
        const entryPath = path5.join(dir, entry);
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
      specFiles = yield* Effect47.all(
        filePaths.map(
          (filePath) => Effect47.gen(function* () {
            const content = yield* fs.readFileString(filePath);
            const relativeName = path5.relative(specsDir, filePath);
            return { name: relativeName, content };
          })
        ),
        { concurrency: "unbounded" }
      );
    }
    const d2cDir = path5.join(changeDir, "d2c");
    const d2cManifestPath = path5.join(d2cDir, "manifest.json");
    const readArtifactFiles = () => Effect47.gen(function* () {
      if (!(yield* fs.exists(d2cDir))) {
        return [];
      }
      const entries = yield* fs.readDirectory(d2cDir);
      const result = [];
      for (const entry of entries) {
        const entryPath = path5.join(d2cDir, entry);
        const stat2 = yield* fs.stat(entryPath);
        if (stat2.type !== "Directory") {
          continue;
        }
        const tsxPath = path5.join(entryPath, "index.tsx");
        const scssPath = path5.join(entryPath, "index.module.scss");
        const tsxExists = yield* fs.exists(tsxPath);
        const scssExists = yield* fs.exists(scssPath);
        if (!tsxExists || !scssExists) {
          continue;
        }
        const tsxContent = yield* fs.readFileString(tsxPath);
        const scssContent = yield* fs.readFileString(scssPath);
        result.push({
          name: path5.relative(d2cDir, tsxPath),
          content: tsxContent
        });
        result.push({
          name: path5.relative(d2cDir, scssPath),
          content: scssContent
        });
      }
      return result;
    });
    const specD2C = extractD2CInfoFromSpec(specContent ?? proposalContent);
    const d2cManifest = parseD2CManifest(
      (yield* fs.exists(d2cManifestPath)) ? yield* fs.readFileString(d2cManifestPath) : void 0
    );
    const generatedFiles = yield* readArtifactFiles();
    const previewFiles = [];
    const d2c = mergeD2CInfo({
      specInfo: specD2C,
      manifest: d2cManifest,
      generatedFiles,
      previewFiles
    });
    const details = {
      name: changeId,
      status: isArchived ? "archived" : inferStatus(designContent, tasksContent),
      updatedAt: Option4.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date()).toISOString(),
      description,
      specContent,
      proposalContent,
      designContent,
      tasksContent,
      testsContent,
      specsContent,
      specFiles,
      d2c
    };
    return details;
  });
  const updateChangeFile = (projectId, changeId, fileName, content) => Effect47.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect47.fail(new ProjectPathNotFoundError4({ projectId }));
    }
    const allowedFiles = [
      "design.md",
      "spec.md",
      "proposal.md",
      "tasks.md",
      "tests.md",
      "specs.md"
    ];
    const isSpecsFile = fileName.startsWith("specs/") && !fileName.includes("..");
    if (!allowedFiles.includes(fileName) && !isSpecsFile) {
      return yield* Effect47.fail(
        new Error(`Invalid file name for update: ${fileName}`)
      );
    }
    let changeDir = path5.join(
      project.meta.projectPath,
      "openspec",
      "changes",
      changeId
    );
    let exists = yield* fs.exists(changeDir);
    if (!exists) {
      const archiveDir = path5.join(
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
      return yield* Effect47.fail(
        new OpenSpecDirectoryNotFoundError({
          path: changeDir,
          message: `Change directory not found: ${changeId}`
        })
      );
    }
    const specPath = path5.join(changeDir, "spec.md");
    const proposalPath = path5.join(changeDir, "proposal.md");
    const normalizedFileName = fileName === "proposal.md" ? "spec.md" : fileName;
    const writeLegacyProposalFile = normalizedFileName === "spec.md" && !(yield* fs.exists(specPath)) && (yield* fs.exists(proposalPath));
    const targetFileName = writeLegacyProposalFile ? "proposal.md" : normalizedFileName;
    const filePath = path5.join(changeDir, targetFileName);
    yield* fs.writeFileString(filePath, content);
  });
  return {
    getChanges,
    getArchivedChanges,
    getChangeDetails,
    updateChangeFile
  };
});
var OpenSpecService = class extends Context35.Tag("OpenSpecService")() {
  static {
    this.Live = Layer37.effect(this, LayerImpl26);
  }
};

// src/server/core/openspec/services/ProfileConfigService.ts
import { FileSystem as FileSystem22, Path as Path26 } from "@effect/platform";
import { Context as Context36, Data as Data10, Effect as Effect48, Layer as Layer38 } from "effect";
import { z as z26 } from "zod";
var ProjectPathNotFoundError5 = class extends Data10.TaggedError(
  "ProjectPathNotFoundError"
) {
};
var ProfileNotFoundError = class extends Data10.TaggedError("ProfileNotFoundError") {
};
var McpServerConfigSchema = z26.object({
  type: z26.enum(["http", "sse", "stdio"]),
  url: z26.string().optional(),
  command: z26.string().optional(),
  args: z26.array(z26.string()).optional()
});
var McpToolDefinitionSchema = z26.object({
  description: z26.string(),
  tools: z26.array(z26.string())
});
var ProfileInfraCatalogSchema = z26.object({
  mcp_server_providers: z26.record(z26.string(), McpServerConfigSchema),
  mcp_tool_definitions: z26.object({
    overview: McpToolDefinitionSchema,
    search: McpToolDefinitionSchema,
    specifications: McpToolDefinitionSchema
  }),
  develop_skills: z26.object({
    description: z26.string(),
    gitUrl: z26.string().optional(),
    skills: z26.array(z26.string())
  }).optional(),
  code_examples: z26.object({
    examples: z26.array(
      z26.object({
        name: z26.string(),
        description: z26.string().optional(),
        paths: z26.array(z26.string())
      })
    )
  }).optional()
});
var ProfileSchema = z26.object({
  displayName: z26.string(),
  custom_variables: z26.record(z26.string(), z26.string()).optional(),
  infra_catalog: ProfileInfraCatalogSchema
});
function isValidProfile(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("displayName" in value) || typeof value.displayName !== "string") {
    return false;
  }
  if (!("infra_catalog" in value)) {
    return false;
  }
  const infraCatalog = value.infra_catalog;
  return typeof infraCatalog === "object" && infraCatalog !== null;
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
var hasInfraCatalogToolsConfigured = (infraCatalog) => {
  const defs = infraCatalog.mcp_tool_definitions;
  const allTools = [
    ...defs.overview?.tools ?? [],
    ...defs.search?.tools ?? [],
    ...defs.specifications?.tools ?? []
  ];
  return allTools.some((tool) => tool.trim().length > 0);
};
var LayerImpl27 = Effect48.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem22.FileSystem;
  const path5 = yield* Path26.Path;
  const getTemplateBasePath = Effect48.gen(function* () {
    const distPath = path5.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path5.join(process.cwd(), "template-to-project");
  });
  const loadBuiltInProfiles = Effect48.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const profilesDir = path5.join(templateBasePath, "profiles");
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
      const filePath = path5.join(profilesDir, file);
      const content = yield* fs.readFileString(filePath);
      const id = file.replace(".json", "");
      try {
        const parsed = JSON.parse(content);
        const result = ProfileSchema.safeParse(parsed);
        if (result.success) {
          profiles.push({
            id,
            displayName: result.data.displayName,
            infra_catalog: result.data.infra_catalog,
            custom_variables: result.data.custom_variables
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
  const getProjectProfileConfig = (projectId) => Effect48.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect48.fail(new ProjectPathNotFoundError5({ projectId }));
    }
    const profileDir = path5.join(project.meta.projectPath, "specforge");
    const profilePath = path5.join(profileDir, "specforge.profile.json");
    let exists = yield* fs.exists(profilePath);
    if (!exists) {
      const rootProfilePath = path5.join(
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
  const saveProjectProfileConfig = (projectId, profile) => Effect48.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect48.fail(new ProjectPathNotFoundError5({ projectId }));
    }
    const profileDir = path5.join(project.meta.projectPath, "specforge");
    const profilePath = path5.join(profileDir, "specforge.profile.json");
    const dirExists = yield* fs.exists(profileDir);
    if (!dirExists) {
      yield* fs.makeDirectory(profileDir);
    }
    yield* fs.writeFileString(profilePath, JSON.stringify(profile, null, 2));
  });
  const generateTemplateVariables = (profile, projectPath, installedDevelopSkills) => Effect48.gen(function* () {
    const fs2 = yield* FileSystem22.FileSystem;
    const path6 = yield* Path26.Path;
    const { infra_catalog, custom_variables } = profile;
    const queryingInfraEnabled = hasInfraCatalogToolsConfigured(infra_catalog);
    const variables = {
      PROJECT_ROOT: projectPath,
      VERSION: "1.0.0",
      INFRA_CATALOG_TOOL_IDS_APPEND: "",
      INFRA_CATALOG_OVERVIEW_TOOLS_MD: "\uFF08\u672A\u914D\u7F6E\uFF09",
      INFRA_CATALOG_SEARCH_TOOLS_MD: "\uFF08\u672A\u914D\u7F6E\uFF09",
      INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD: "\uFF08\u672A\u914D\u7F6E\uFF09",
      INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD: "",
      DEVELOP_SKILLS_APPEND: "",
      DEVELOP_SKILLS_NAMES: "",
      DEVELOP_SKILLS_USAGE_MD: "- \u5F53\u524D\u672A\u914D\u7F6E\u989D\u5916 develop skills\uFF1B\u8BF7\u4F18\u5148\u53C2\u8003\u9879\u76EE\u5185\u89C4\u8303\u6587\u6863\u4E0E\u73B0\u6709\u4EE3\u7801\u5B9E\u8DF5\u3002",
      DEVELOP_SKILLS_RULE_LINE: "MUST \u9075\u5FAA\u9879\u76EE\u73B0\u6709\u5F00\u53D1\u89C4\u8303\uFF1B\u82E5\u65E0\u73B0\u6210\u89C4\u8303\uFF0C\u9075\u5FAA\u901A\u7528\u5DE5\u7A0B\u6700\u4F73\u5B9E\u8DF5\u5E76\u4FDD\u6301\u4E0E\u73B0\u6709\u4EE3\u7801\u98CE\u683C\u4E00\u81F4\u3002",
      DEVELOP_SKILLS_TASK_INSTRUCTION: "\u67E5\u8BE2\u5E76\u786E\u8BA4\u672C\u9879\u76EE\u7684\u5F00\u53D1\u89C4\u8303\uFF08\u4F18\u5148\u4F7F\u7528\u5DF2\u6709\u89C4\u8303\u6587\u6863\u6216\u4EE3\u7801\u5E93\u6700\u4F73\u5B9E\u8DF5\uFF09\uFF0C\u4F5C\u4E3A\u540E\u7EED\u5B9E\u73B0\u7684\u6743\u5A01\u53C2\u8003\u3002",
      DEVELOP_SKILLS_APPLY_ITEM: "- \u9879\u76EE\u5F00\u53D1\u89C4\u8303\uFF08\u5982\u5DF2\u914D\u7F6E develop skills\uFF0C\u4F18\u5148\u4F7F\u7528\u5BF9\u5E94 skills\uFF09: \u5F00\u53D1\u89C4\u8303/\u5F00\u53D1\u7ECF\u9A8C",
      QUERYING_INFRA_RULE_LINE: "SHOULD \u901A\u8FC7\u53EF\u9A8C\u8BC1\u4E8B\u5B9E\u83B7\u53D6\u57FA\u5EFA\u80FD\u529B\u4FE1\u606F\uFF1B\u82E5\u672A\u914D\u7F6E\u4E13\u7528\u67E5\u8BE2\u80FD\u529B\uFF0C\u4F18\u5148\u4F7F\u7528\u4EE3\u7801\u5E93\u4E0E\u9879\u76EE\u6587\u6863\u4F5C\u4E3A\u4E8B\u5B9E\u6765\u6E90\u3002",
      QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION: "\u68B3\u7406\u5F53\u524D\u9879\u76EE\u7684\u6574\u4F53\u6280\u672F\u6808\u548C\u76F8\u5173\u80FD\u529B\u8303\u56F4\uFF1B\u5EFA\u7ACB\u6280\u672F\u8BA4\u77E5\uFF0C\u4E3A\u540E\u7EED\u67E5\u8BE2\u6253\u57FA\u7840\uFF08\u4F18\u5148\u4F7F\u7528\u4EE3\u7801\u5E93\u4E0E\u9879\u76EE\u6587\u6863\uFF09",
      QUERYING_INFRA_SEARCH_TASK_DESCRIPTION: "\u3010\u6267\u884C\u6307\u4EE4\u3011(1)\u67E5\u8BE2\u57FA\u5EFA\u80FD\u529B\uFF1A\u901A\u8FC7\u4EE3\u7801\u5E93\u68C0\u7D22\u3001\u9879\u76EE\u6587\u6863\u548C\u73B0\u6709\u5B9E\u73B0\u68B3\u7406 D-1-1 \u548C D-1-3 \u4E2D\u53EF\u80FD\u6620\u5C04\u7684\u7EC4\u4EF6/API\uFF1B(2)\u591A\u7AEF\u652F\u6301\u68C0\u6D4B\uFF1A\u4ECE spec.md\u300C\u591A\u7AEF\u652F\u6301\u8BF4\u660E\u300D\u7AE0\u8282\u63D0\u53D6\u7AEF\u652F\u6301\u8981\u6C42\uFF08APP/\u5C0F\u7A0B\u5E8F/H5\uFF09\uFF0C\u5BF9\u6BD4\u57FA\u5EFA\u80FD\u529B\u7684\u7AEF\u652F\u6301\u60C5\u51B5\uFF0C\u82E5\u57FA\u5EFA\u7EC4\u4EF6/API \u4E0D\u652F\u6301\u67D0\u4E2A\u5FC5\u9700\u7684\u7AEF\uFF0C\u6807\u8BB0\u4E3A'\u7AEF\u80FD\u529B\u4E0D\u517C\u5BB9'\u5E76\u751F\u6210\u{1F534}\u4E34\u754C\u95EE\u9898\uFF1B(3)\u6E90\u7801\u9A8C\u8BC1\uFF1A\u9488\u5BF9\u67E5\u8BE2\u5230\u7684\u57FA\u5EFA\u80FD\u529B\uFF0C\u4F7F\u7528 Read \u5DE5\u5177\u8BFB\u53D6\u76F8\u5173\u6E90\u7801\u9A8C\u8BC1\u5B9E\u9645\u4F7F\u7528\u60C5\u51B5\uFF1B(4)\u5BF9\u6BD4\u5206\u6790\uFF1A\u5BF9\u6BD4\u5DF2\u6709\u4E8B\u5B9E\u4F9D\u636E\u4E0E\u6E90\u7801\u5B9E\u73B0\uFF0C\u82E5\u4E0D\u4E00\u81F4\uFF0C\u53C2\u8003 D-1-2 \u7684\u5F00\u53D1\u89C4\u8303\u6216 D-1-4 \u7684\u6700\u4F73\u5B9E\u8DF5\uFF1B(5)\u6B67\u4E49\u6807\u8BB0\uFF1A\u82E5\u4ECD\u6709\u6B67\u4E49\u6216\u7AEF\u80FD\u529B\u4E0D\u5339\u914D\uFF0C\u6807\u8BB0\u4E3A\u5F85\u7528\u6237\u786E\u8BA4",
      QUERYING_INFRA_FACT_CHECK_SOURCE: "\u57FA\u5EFA\u7EC4\u4EF6\uFF08\u901A\u8FC7\u4EE3\u7801\u5E93/\u6587\u6863\u9A8C\u8BC1\uFF09",
      QUERYING_INFRA_APPLY_ITEM: "- \u82E5\u672A\u914D\u7F6E\u7EC4\u4EF6/API \u89C4\u683C\u67E5\u8BE2\u80FD\u529B\uFF0C\u8BF7\u57FA\u4E8E\u4EE3\u7801\u5E93\u4E0E\u5B98\u65B9\u6587\u6863\u6838\u5BF9\u89C4\u683C",
      QUERYING_INFRA_QUALITY_USAGE_LINE: "- **\u5BA1\u67E5\u5185\u90E8\u7EC4\u4EF6/API \u4F7F\u7528** \u2192 \u82E5\u672A\u914D\u7F6E\u4E13\u7528\u67E5\u8BE2\u80FD\u529B\uFF0C\u8BF7\u901A\u8FC7\u4EE3\u7801\u5E93\u4E0E\u6587\u6863\u6838\u5BF9\u89C4\u683C\uFF0C\u7EDD\u4E0D\u731C\u6D4B",
      CODE_EXAMPLES_MD: ""
    };
    if (queryingInfraEnabled) {
      variables.QUERYING_INFRA_RULE_LINE = "MUST \u4F7F\u7528 querying-infra-catalog skill \u6765\u83B7\u53D6\u57FA\u5EFA\u77E5\u8BC6";
      variables.QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION = "\u4F7F\u7528 querying-infra-catalog skill \u7684 overview \u529F\u80FD\uFF1B\u4E86\u89E3\u5F53\u524D\u9879\u76EE\u7684\u6574\u4F53\u6280\u672F\u6808\u548C\u76F8\u5173\u80FD\u529B\u8303\u56F4\uFF1B\u5EFA\u7ACB\u6280\u672F\u8BA4\u77E5\uFF0C\u4E3A\u540E\u7EED\u67E5\u8BE2\u6253\u57FA\u7840";
      variables.QUERYING_INFRA_SEARCH_TASK_DESCRIPTION = "\u3010\u6267\u884C\u6307\u4EE4\u3011(1)\u67E5\u8BE2\u57FA\u5EFA\u80FD\u529B\uFF1A\u4F7F\u7528 querying-infra-catalog skill \u7684 search \u548C specifications \u529F\u80FD\u67E5\u8BE2 D-1-1 \u548C D-1-3 \u4E2D\u53EF\u80FD\u6620\u5C04\u7684\u7EC4\u4EF6/API\uFF1B(2)\u591A\u7AEF\u652F\u6301\u68C0\u6D4B\uFF1A\u4ECE spec.md\u300C\u591A\u7AEF\u652F\u6301\u8BF4\u660E\u300D\u7AE0\u8282\u63D0\u53D6\u7AEF\u652F\u6301\u8981\u6C42\uFF08APP/\u5C0F\u7A0B\u5E8F/H5\uFF09\uFF0C\u5BF9\u6BD4\u57FA\u5EFA\u80FD\u529B\u7684\u7AEF\u652F\u6301\u60C5\u51B5\uFF0C\u82E5\u57FA\u5EFA\u7EC4\u4EF6/API \u4E0D\u652F\u6301\u67D0\u4E2A\u5FC5\u9700\u7684\u7AEF\uFF0C\u6807\u8BB0\u4E3A'\u7AEF\u80FD\u529B\u4E0D\u517C\u5BB9'\u5E76\u751F\u6210\u{1F534}\u4E34\u754C\u95EE\u9898\uFF1B(3)\u6E90\u7801\u9A8C\u8BC1\uFF1A\u9488\u5BF9\u67E5\u8BE2\u5230\u7684\u57FA\u5EFA\u80FD\u529B\uFF0C\u4F7F\u7528 Read \u5DE5\u5177\u8BFB\u53D6\u76F8\u5173\u6E90\u7801\u9A8C\u8BC1\u5B9E\u9645\u4F7F\u7528\u60C5\u51B5\uFF1B(4)\u5BF9\u6BD4\u5206\u6790\uFF1A\u5BF9\u6BD4 MCP \u67E5\u8BE2\u7ED3\u679C\u4E0E\u6E90\u7801\u5B9E\u73B0\uFF0C\u82E5\u4E0D\u4E00\u81F4\uFF0C\u53C2\u8003 D-1-2 \u7684\u5F00\u53D1\u89C4\u8303\u6216 D-1-4 \u7684\u6700\u4F73\u5B9E\u8DF5\uFF1B(5)\u6B67\u4E49\u6807\u8BB0\uFF1A\u82E5\u4ECD\u6709\u6B67\u4E49\u6216\u7AEF\u80FD\u529B\u4E0D\u5339\u914D\uFF0C\u6807\u8BB0\u4E3A\u5F85\u7528\u6237\u786E\u8BA4";
      variables.QUERYING_INFRA_FACT_CHECK_SOURCE = "\u57FA\u5EFA\u7EC4\u4EF6\uFF08\u8C03\u7528 querying-infra-catalog skill\uFF09";
      variables.QUERYING_INFRA_APPLY_ITEM = "- querying-infra-catalog skill: \u67E5\u8BE2\u7EC4\u4EF6/API \u89C4\u683C";
      variables.QUERYING_INFRA_QUALITY_USAGE_LINE = "- **\u5BA1\u67E5\u5185\u90E8\u7EC4\u4EF6/API \u4F7F\u7528** \u2192 \u4F7F\u7528 `querying-infra-catalog` Skill \u67E5\u8BE2 spec\uFF0C**\u7EDD\u4E0D\u731C\u6D4B**";
    }
    const allToolIds = [];
    const { mcp_tool_definitions } = infra_catalog;
    if (mcp_tool_definitions) {
      const { overview, search, specifications } = mcp_tool_definitions;
      if (overview?.tools) allToolIds.push(...overview.tools);
      if (search?.tools) allToolIds.push(...search.tools);
      if (specifications?.tools) allToolIds.push(...specifications.tools);
      variables.INFRA_CATALOG_TOOL_IDS_APPEND = allToolIds.length > 0 ? `, ${allToolIds.join(", ")}` : "";
      const formatToolsMd = (tools) => tools.map((t) => `\`${t}\``).join(", ");
      variables.INFRA_CATALOG_OVERVIEW_TOOLS_MD = overview?.tools && overview.tools.length > 0 ? formatToolsMd(overview.tools) : "\uFF08\u672A\u914D\u7F6E\uFF09";
      variables.INFRA_CATALOG_SEARCH_TOOLS_MD = search?.tools && search.tools.length > 0 ? formatToolsMd(search.tools) : "\uFF08\u672A\u914D\u7F6E\uFF09";
      variables.INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD = specifications?.tools && specifications.tools.length > 0 ? formatToolsMd(specifications.tools) : "\uFF08\u672A\u914D\u7F6E\uFF09";
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
      variables.DEVELOP_SKILLS_RULE_LINE = `MUST \u4F7F\u7528 ${skillNames.join(", ")} skill \u4E2D\u7684\u5F00\u53D1\u7ECF\u9A8C/\u89C4\u8303\u3002`;
      variables.DEVELOP_SKILLS_TASK_INSTRUCTION = `MUST \u8C03\u7528 ${skillNames.join(", ")} skill\uFF1B\u83B7\u53D6\u4E1A\u52A1\u7EBF\u7684\u6807\u51C6\u5F00\u53D1\u89C4\u8303\uFF1B\u4F5C\u4E3A\u540E\u7EED\u5B9E\u73B0\u7684\u6743\u5A01\u53C2\u8003`;
      variables.DEVELOP_SKILLS_APPLY_ITEM = `- ${skillNames.join(", ")} skill: \u5F00\u53D1\u89C4\u8303/\u5F00\u53D1\u7ECF\u9A8C`;
    } else if (infra_catalog.develop_skills) {
      const skillsDir = path6.join(projectPath, ".claude", "skills");
      const skillsDirExists = yield* fs2.exists(skillsDir);
      if (skillsDirExists) {
        const skillLines = [];
        const detectedNames = [];
        const scanSkillsDir = Effect48.gen(function* () {
          const items = yield* fs2.readDirectory(skillsDir);
          for (const item of items) {
            if (item.startsWith(".")) continue;
            if (item.startsWith("openspec-")) continue;
            const itemPath = path6.join(skillsDir, item);
            const stat = yield* fs2.stat(itemPath);
            if (stat.type === "Directory") {
              const skillFilePath = path6.join(itemPath, "SKILL.md");
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
          Effect48.catchAll(() => Effect48.succeed(void 0))
        );
        variables.DEVELOP_SKILLS_APPEND = detectedNames.length > 0 ? `, ${detectedNames.join(", ")}` : "";
        variables.DEVELOP_SKILLS_NAMES = detectedNames.length > 0 ? detectedNames.join(", ") : "";
        variables.DEVELOP_SKILLS_USAGE_MD = skillLines.length > 0 ? skillLines.join("\n") : "- \u5F53\u524D\u672A\u914D\u7F6E\u989D\u5916 develop skills\uFF1B\u8BF7\u4F18\u5148\u53C2\u8003\u9879\u76EE\u5185\u89C4\u8303\u6587\u6863\u4E0E\u73B0\u6709\u4EE3\u7801\u5B9E\u8DF5\u3002";
        if (detectedNames.length > 0) {
          const skillNamesText = detectedNames.join(", ");
          variables.DEVELOP_SKILLS_RULE_LINE = `MUST \u4F7F\u7528 ${skillNamesText} skill \u4E2D\u7684\u5F00\u53D1\u7ECF\u9A8C/\u89C4\u8303\u3002`;
          variables.DEVELOP_SKILLS_TASK_INSTRUCTION = `MUST \u8C03\u7528 ${skillNamesText} skill\uFF1B\u83B7\u53D6\u4E1A\u52A1\u7EBF\u7684\u6807\u51C6\u5F00\u53D1\u89C4\u8303\uFF1B\u4F5C\u4E3A\u540E\u7EED\u5B9E\u73B0\u7684\u6743\u5A01\u53C2\u8003`;
          variables.DEVELOP_SKILLS_APPLY_ITEM = `- ${skillNamesText} skill: \u5F00\u53D1\u89C4\u8303/\u5F00\u53D1\u7ECF\u9A8C`;
        }
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
      if (!def) continue;
      const effectiveTools = def.tools.map((t) => t.trim()).filter((t) => t.length > 0);
      if (effectiveTools.length === 0) continue;
      const toolsStr = effectiveTools.map((t) => `\`${t}\``).join(", ");
      lines.push(`| ${name} | ${def.description} | ${toolsStr} |`);
    }
    return lines.length > 2 ? lines.join("\n") : "";
  };
  const getBuiltInProfile = (profileId) => Effect48.gen(function* () {
    const result = yield* loadBuiltInProfiles;
    const profile = result.profiles.find((p) => p.id === profileId);
    if (!profile) {
      return yield* Effect48.fail(new ProfileNotFoundError({ profileId }));
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
var ProfileConfigService = class extends Context36.Tag("ProfileConfigService")() {
  static {
    this.Live = Layer38.effect(this, LayerImpl27);
  }
};

// src/server/core/openspec/services/TemplateInjectionService.ts
import { FileSystem as FileSystem25, Path as Path29 } from "@effect/platform";
import { Context as Context39, Data as Data13, Effect as Effect51, Layer as Layer41 } from "effect";
import YAML from "yaml";

// src/server/core/openspec/services/SkillManagerService.ts
import { Command as Command8, FileSystem as FileSystem23, Path as Path27 } from "@effect/platform";
import { Context as Context37, Data as Data11, Duration as Duration5, Effect as Effect49, Either as Either7, Layer as Layer39, Option as Option5 } from "effect";
var SkillInstallError = class extends Data11.TaggedError("SkillInstallError") {
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
var LayerImpl28 = Effect49.gen(function* () {
  const fs = yield* FileSystem23.FileSystem;
  const path5 = yield* Path27.Path;
  const classifyGitError = (errorText) => {
    const text = errorText.toLowerCase();
    if (text.includes("authentication failed") || text.includes("permission denied") || text.includes("not authorized")) {
      return "auth";
    }
    if (text.includes("repository not found") || text.includes("not found")) {
      return "not_found";
    }
    if (text.includes("could not resolve host") || text.includes("failed to connect") || text.includes("connection timed out") || text.includes("network is unreachable") || text.includes("connection reset")) {
      return "network";
    }
    return "unknown";
  };
  const cloneRepoWithRetry = (gitUrl, tempDir, options = {}) => Effect49.gen(function* () {
    const attempts = options.attempts ?? 3;
    const backoffMs = options.backoffMs ?? 1e3;
    let lastError = "";
    for (let i = 0; i < attempts; i++) {
      const cloneCommand = Command8.make(
        "git",
        "clone",
        "--depth",
        "1",
        gitUrl,
        tempDir
      );
      const cloneResult = yield* Effect49.either(
        Command8.string(cloneCommand).pipe(
          Effect49.timeout(Duration5.seconds(120))
        )
      );
      if (Either7.isRight(cloneResult)) {
        return { success: true, errorText: "" };
      }
      lastError = String(cloneResult.left);
      const category = classifyGitError(lastError);
      const isTransient = category === "network";
      if (!isTransient || i === attempts - 1) {
        break;
      }
      const waitMs = backoffMs * 2 ** i;
      yield* Effect49.sleep(Duration5.millis(waitMs));
    }
    return { success: false, errorText: lastError };
  });
  const findSkillMd = (dirPath) => Effect49.gen(function* () {
    const exactPath = path5.join(dirPath, "SKILL.md");
    if (yield* fs.exists(exactPath)) {
      return exactPath;
    }
    const files = yield* fs.readDirectory(dirPath).pipe(Effect49.catchAll(() => Effect49.succeed([])));
    const found = files.find((f) => f.toLowerCase() === "skill.md");
    if (found) {
      return path5.join(dirPath, found);
    }
    return null;
  });
  const findSkillDirsByName = (repoRoot, skillName) => Effect49.gen(function* () {
    const matches = [];
    const queue = [repoRoot];
    while (queue.length > 0) {
      const currentDir = queue.shift();
      if (!currentDir) continue;
      const entries = yield* fs.readDirectory(currentDir).pipe(Effect49.catchAll(() => Effect49.succeed([])));
      for (const entry of entries) {
        if (entry.startsWith(".")) continue;
        const entryPath = path5.join(currentDir, entry);
        const statResult = yield* fs.stat(entryPath).pipe(Effect49.option);
        if (Option5.isNone(statResult)) continue;
        if (statResult.value.type !== "Directory") continue;
        if (entry === skillName) {
          const skillMdPath = yield* findSkillMd(entryPath);
          if (skillMdPath) {
            matches.push(entryPath);
          }
        }
        queue.push(entryPath);
      }
    }
    return matches;
  });
  const installSingleSkill = (sourcePath, skillName, skillsDir) => Effect49.gen(function* () {
    if (!(yield* fs.exists(sourcePath))) {
      return null;
    }
    const skillMdPath = yield* findSkillMd(sourcePath);
    if (!skillMdPath) {
      return null;
    }
    const targetPath = path5.join(skillsDir, skillName);
    yield* fs.makeDirectory(targetPath, { recursive: true });
    yield* copyDirectory(sourcePath, targetPath);
    const installedSkillMd = yield* findSkillMd(targetPath);
    if (!installedSkillMd) {
      return { name: skillName, description: "\u6682\u65E0\u63CF\u8FF0" };
    }
    const content = yield* fs.readFileString(installedSkillMd).pipe(Effect49.catchAll(() => Effect49.succeed("")));
    const { description } = parseSkillFrontmatter2(content);
    return {
      name: skillName,
      description: description ?? "\u6682\u65E0\u63CF\u8FF0"
    };
  }).pipe(Effect49.catchAll(() => Effect49.succeed(null)));
  const copyDirectory = (src, dest) => Effect49.gen(function* () {
    yield* fs.makeDirectory(dest, { recursive: true });
    const entries = yield* fs.readDirectory(src);
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const srcPath = path5.join(src, entry);
      const destPath = path5.join(dest, entry);
      const stat = yield* fs.stat(srcPath);
      if (stat.type === "Directory") {
        yield* copyDirectory(srcPath, destPath);
      } else {
        const content = yield* fs.readFile(srcPath);
        yield* fs.writeFile(destPath, content);
      }
    }
  });
  const installSkillsFromGit = (projectPath, gitUrl, skillsList) => Effect49.gen(function* () {
    if (!gitUrl || !Array.isArray(skillsList) || skillsList.length === 0) {
      return [];
    }
    const skillsDir = path5.join(projectPath, ".claude", "skills");
    const tempDir = yield* fs.makeTempDirectory({
      prefix: "specforge-skills-"
    });
    const installEffect = Effect49.gen(function* () {
      const cloneResult = yield* cloneRepoWithRetry(gitUrl, tempDir, {
        attempts: 3,
        backoffMs: 1e3
      });
      if (!cloneResult.success) {
        console.error(
          `[SkillManager] Git clone \u5931\u8D25: ${gitUrl}`,
          cloneResult.errorText
        );
        return [];
      }
      yield* fs.makeDirectory(skillsDir, { recursive: true });
      const installedSkills = [];
      for (const skillPath of skillsList) {
        if (skillPath.endsWith("/*")) {
          const parentDir = skillPath.slice(0, -2);
          const fullParentPath = path5.join(tempDir, parentDir);
          if (yield* fs.exists(fullParentPath)) {
            const children = yield* fs.readDirectory(fullParentPath);
            for (const child of children) {
              const childPath = path5.join(fullParentPath, child);
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
          const requestedPath = skillPath.trim();
          const skillName = path5.basename(requestedPath);
          let sourcePath = path5.join(tempDir, requestedPath);
          if (!(yield* fs.exists(sourcePath)) && !requestedPath.includes("/")) {
            const matchedDirs = yield* findSkillDirsByName(
              tempDir,
              skillName
            );
            if (matchedDirs.length === 1 && matchedDirs[0]) {
              sourcePath = matchedDirs[0];
            }
          }
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
      Effect49.ensuring(
        fs.remove(tempDir, { recursive: true }).pipe(Effect49.catchAll(() => Effect49.succeed(void 0)))
      ),
      // 全局兜底：任何未预期的错误都返回空数组
      Effect49.catchAll((error) => {
        console.error(
          `[SkillManager] Skill \u5B89\u88C5\u5931\u8D25:`,
          error instanceof Error ? error.message : String(error)
        );
        return Effect49.succeed([]);
      })
    );
  });
  const preflightSkillsFromGit = (gitUrl, skillsList) => Effect49.gen(function* () {
    if (!gitUrl || !Array.isArray(skillsList) || skillsList.length === 0) {
      return {
        ok: false,
        category: "invalid_path",
        message: "develop_skills \u914D\u7F6E\u4E0D\u5B8C\u6574\uFF1A\u7F3A\u5C11 gitUrl \u6216 skills\u3002"
      };
    }
    const tempDir = yield* fs.makeTempDirectory({
      prefix: "specforge-skills-preflight-"
    });
    return yield* Effect49.gen(function* () {
      const cloneResult = yield* cloneRepoWithRetry(gitUrl, tempDir, {
        attempts: 3,
        backoffMs: 1e3
      });
      if (!cloneResult.success) {
        const category = classifyGitError(cloneResult.errorText);
        return {
          ok: false,
          category,
          message: `Git \u4ED3\u5E93\u4E0D\u53EF\u7528: ${cloneResult.errorText}`
        };
      }
      const missingSkills = [];
      for (const configuredPath of skillsList) {
        const skillPath = configuredPath.trim();
        if (!skillPath) continue;
        if (skillPath.endsWith("/*")) {
          const parentDir = skillPath.slice(0, -2);
          const fullParentPath = path5.join(tempDir, parentDir);
          if (!(yield* fs.exists(fullParentPath))) {
            missingSkills.push(skillPath);
            continue;
          }
          const children = yield* fs.readDirectory(fullParentPath);
          let hasAnySkill = false;
          for (const child of children) {
            const childPath = path5.join(fullParentPath, child);
            const statResult = yield* fs.stat(childPath).pipe(Effect49.option);
            if (Option5.isNone(statResult)) continue;
            if (statResult.value.type !== "Directory") continue;
            const skillMdPath = yield* findSkillMd(childPath);
            if (skillMdPath) {
              hasAnySkill = true;
              break;
            }
          }
          if (!hasAnySkill) {
            missingSkills.push(skillPath);
          }
        } else {
          let sourcePath = path5.join(tempDir, skillPath);
          let exists = yield* fs.exists(sourcePath);
          if (!exists && !skillPath.includes("/")) {
            const skillName = path5.basename(skillPath);
            const matchedDirs = yield* findSkillDirsByName(
              tempDir,
              skillName
            );
            if (matchedDirs.length === 1 && matchedDirs[0]) {
              sourcePath = matchedDirs[0];
              exists = true;
            } else if (matchedDirs.length > 1) {
              missingSkills.push(
                `${skillPath}\uFF08\u5339\u914D\u5230\u591A\u4E2A\u76EE\u5F55\uFF0C\u8BF7\u6539\u4E3A\u4ED3\u5E93\u76F8\u5BF9\u8DEF\u5F84\uFF09`
              );
              continue;
            }
          }
          if (!exists) {
            missingSkills.push(skillPath);
            continue;
          }
          const skillMdPath = yield* findSkillMd(sourcePath);
          if (!skillMdPath) {
            missingSkills.push(skillPath);
          }
        }
      }
      if (missingSkills.length > 0) {
        return {
          ok: false,
          category: "invalid_path",
          message: "\u90E8\u5206 skill \u8DEF\u5F84\u4E0D\u5B58\u5728\u6216\u7F3A\u5C11 SKILL.md\u3002",
          missingSkills
        };
      }
      return { ok: true, category: "none" };
    }).pipe(
      Effect49.ensuring(
        fs.remove(tempDir, { recursive: true }).pipe(Effect49.catchAll(() => Effect49.succeed(void 0)))
      )
    );
  });
  return {
    installSkillsFromGit,
    preflightSkillsFromGit
  };
});
var SkillManagerService = class extends Context37.Tag("SkillManagerService")() {
  static {
    this.Live = Layer39.effect(this, LayerImpl28);
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
import { FileSystem as FileSystem24, Path as Path28 } from "@effect/platform";
import { Context as Context38, Data as Data12, Effect as Effect50, Layer as Layer40 } from "effect";
var TemplateProcessingError = class extends Data12.TaggedError(
  "TemplateProcessingError"
) {
};
var LayerImpl29 = Effect50.gen(function* () {
  const fs = yield* FileSystem24.FileSystem;
  const path5 = yield* Path28.Path;
  const replaceVariables = (content, variables) => {
    let processed = content;
    for (const [key, value] of Object.entries(variables)) {
      if (value !== void 0) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        processed = processed.replace(regex, value);
      }
    }
    processed = processed.replace(/\{\{[A-Z0-9_]+\}\}/g, "");
    return processed;
  };
  const processTemplate = (content, variables, options = {}) => Effect50.gen(function* () {
    let processed = replaceVariables(content, variables);
    if (options.resolveReferences && options.basePath) {
      const lines = processed.split("\n");
      const resolvedLines = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("@") && trimmed.endsWith(".md")) {
          const refPath = trimmed.slice(1);
          const fullRefPath = path5.resolve(
            path5.dirname(options.basePath),
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
  const processTemplateFile = (templatePath, targetPath, variables, options = {}) => Effect50.gen(function* () {
    const exists = yield* fs.exists(templatePath);
    if (!exists) {
      return yield* Effect50.fail(
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
    const targetDir = path5.dirname(targetPath);
    const dirExists = yield* fs.exists(targetDir);
    if (!dirExists) {
      yield* fs.makeDirectory(targetDir, { recursive: true });
    }
    yield* fs.writeFileString(targetPath, processed);
  });
  const getAllFilesInDir = (dir, basePath) => Effect50.gen(function* () {
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
        const entryPath = path5.join(currentDir, entry);
        const stat = yield* fs.stat(entryPath);
        if (stat.type === "Directory") {
          dirsToProcess.push(entryPath);
        } else {
          const relativePath = path5.relative(basePath, entryPath);
          results.push(relativePath);
        }
      }
    }
    return results;
  });
  const processTemplateDirectory = (templateDir, targetDir, variables, options = {}) => Effect50.gen(function* () {
    const created = [];
    const skipped = [];
    const errors = [];
    const files = yield* getAllFilesInDir(templateDir, templateDir);
    for (const relativePath of files) {
      if (options.filter && !options.filter(relativePath)) {
        continue;
      }
      const templatePath = path5.join(templateDir, relativePath);
      const targetPath = path5.join(targetDir, relativePath);
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
        Effect50.map(() => ({ success: true })),
        Effect50.catchAll(
          (error) => Effect50.succeed({
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
var TemplateProcessor = class extends Context38.Tag("TemplateProcessor")() {
  static {
    this.Live = Layer40.effect(this, LayerImpl29);
  }
};

// src/server/core/openspec/services/TemplateInjectionService.ts
var ProjectPathNotFoundError6 = class extends Data13.TaggedError(
  "ProjectPathNotFoundError"
) {
};
function isYamlConfig(value) {
  return typeof value === "object" && value !== null;
}
var isRecord4 = (value) => typeof value === "object" && value !== null;
var readStringField2 = (value, field) => {
  const target = value[field];
  if (typeof target !== "string") {
    return void 0;
  }
  const trimmed = target.trim();
  return trimmed.length > 0 ? trimmed : void 0;
};
var SPECFORGE_MANAGED_SKILLS2 = [
  "task-planning",
  "gitnexus",
  "d2c-baseline",
  "d2c-stitching",
  "spec-process",
  "design-process"
];
var QUERYING_INFRA_SKILL = "querying-infra-catalog";
var SPECFORGE_MANAGED_AGENTS2 = [
  "format-compliance-agent.md",
  "quality-gate-agent.md"
];
var DEPRECATED_SKILLS = [
  "design-generation",
  "ast-grep",
  "gitnexus-exploring"
];
var ALL_HISTORICALLY_MANAGED_SKILLS = [
  ...SPECFORGE_MANAGED_SKILLS2,
  QUERYING_INFRA_SKILL,
  ...DEPRECATED_SKILLS
];
var DEFAULT_TEMPLATE_VERSION2 = "1.0.5";
var LayerImpl30 = Effect51.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const fs = yield* FileSystem25.FileSystem;
  const path5 = yield* Path29.Path;
  const templateProcessor = yield* TemplateProcessor;
  const profileConfigService = yield* ProfileConfigService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const skillManagerService = yield* SkillManagerService;
  const eventBus = yield* EventBus;
  const shouldEnableQueryingInfraSkill = (profile) => {
    const defs = profile.infra_catalog.mcp_tool_definitions;
    const allTools = [
      ...defs.overview?.tools ?? [],
      ...defs.search?.tools ?? [],
      ...defs.specifications?.tools ?? []
    ];
    return allTools.some((tool) => tool.trim().length > 0);
  };
  const parseSkillFrontmatter3 = (content) => {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const emptyResult = {
      name: null,
      description: null
    };
    if (!frontmatterMatch?.[1]) {
      return emptyResult;
    }
    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
    const descriptionMatch = frontmatter.match(
      /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m
    );
    return {
      name: nameMatch?.[1]?.trim() ?? null,
      description: descriptionMatch?.[1]?.trim() ?? null
    };
  };
  const parseMcpToolId = (toolId) => {
    const parts = toolId.split("__");
    if (parts.length < 3 || parts[0] !== "mcp") return null;
    const server = parts[1]?.trim();
    const toolName = parts.slice(2).join("__").trim();
    if (!server || !toolName) return null;
    return { server };
  };
  const validateMcpToolConsistency = (profile) => Effect51.gen(function* () {
    const providers = profile.infra_catalog.mcp_server_providers || {};
    const providerNames = Object.keys(providers).map((n) => n.trim());
    const defs = profile.infra_catalog.mcp_tool_definitions;
    const allTools = [
      ...defs.overview?.tools ?? [],
      ...defs.search?.tools ?? [],
      ...defs.specifications?.tools ?? []
    ].map((t) => t.trim()).filter((t) => t.length > 0);
    const issues = [];
    if (providerNames.length > 0 && allTools.length === 0) {
      issues.push(
        "\u68C0\u6D4B\u5230\u5DF2\u914D\u7F6E mcp_server_providers\uFF0C\u4F46 mcp_tool_definitions \u4E3A\u7A7A\u3002\u8BF7\u81F3\u5C11\u4E3A overview/search/specifications \u914D\u7F6E\u4E00\u4E2A tool\uFF0C\u6216\u5220\u9664\u65E0\u6548\u7684 MCP server \u914D\u7F6E\u3002"
      );
    }
    const builtInServers = yield* loadBuiltInMcpServers;
    const knownServers = /* @__PURE__ */ new Set([
      ...providerNames,
      ...Object.keys(builtInServers).map((n) => n.trim())
    ]);
    const invalidToolIds = [];
    const unknownServerRefs = /* @__PURE__ */ new Set();
    for (const tool of allTools) {
      const parsed = parseMcpToolId(tool);
      if (!parsed) {
        invalidToolIds.push(tool);
        continue;
      }
      if (!knownServers.has(parsed.server)) {
        unknownServerRefs.add(parsed.server);
      }
    }
    if (invalidToolIds.length > 0) {
      issues.push(
        `\u4EE5\u4E0B tool id \u683C\u5F0F\u65E0\u6548\uFF08\u9700\u4E3A mcp__<server>__<tool>\uFF09: ${invalidToolIds.join(", ")}`
      );
    }
    if (unknownServerRefs.size > 0) {
      issues.push(
        `\u4EE5\u4E0B tool \u5F15\u7528\u4E86\u672A\u914D\u7F6E\u7684 mcp server: ${Array.from(unknownServerRefs).join(", ")}`
      );
    }
    return issues;
  });
  const resolveLocalDevelopSkills = (projectPath, requestedSkills) => Effect51.gen(function* () {
    const result = { resolved: [], missing: [] };
    const skillsDir = path5.join(projectPath, ".claude", "skills");
    const hasSkillsDir = yield* fs.exists(skillsDir);
    if (!hasSkillsDir) {
      return {
        resolved: [],
        missing: requestedSkills.map((s) => s.trim()).filter((s) => s.length > 0)
      };
    }
    for (const raw of requestedSkills) {
      const requested = raw.trim();
      if (!requested) continue;
      const basename = path5.basename(requested);
      const candidates = Array.from(/* @__PURE__ */ new Set([requested, basename]));
      let found = null;
      for (const candidate of candidates) {
        if (!candidate) continue;
        const skillMdPath = path5.join(skillsDir, candidate, "SKILL.md");
        const exists = yield* fs.exists(skillMdPath);
        if (!exists) continue;
        const content = yield* fs.readFileString(skillMdPath).pipe(Effect51.catchAll(() => Effect51.succeed("")));
        const { name, description } = parseSkillFrontmatter3(content);
        found = {
          name: name ?? candidate,
          description: description ?? "\u5F00\u53D1\u6280\u80FD"
        };
        break;
      }
      if (found) {
        result.resolved.push(found);
      } else {
        result.missing.push(requested);
      }
    }
    return result;
  });
  const getManagedSkills = (includeQueryingInfra) => {
    return includeQueryingInfra ? [...SPECFORGE_MANAGED_SKILLS2, QUERYING_INFRA_SKILL] : [...SPECFORGE_MANAGED_SKILLS2];
  };
  const removeDisabledManagedSkills = (projectPath, options) => Effect51.gen(function* () {
    const removed = [];
    const skillsDir = path5.join(projectPath, ".claude", "skills");
    const hasSkillsDir = yield* fs.exists(skillsDir);
    if (!hasSkillsDir) return removed;
    if (!options.includeQueryingInfraSkill) {
      const queryingSkillDir = path5.join(skillsDir, QUERYING_INFRA_SKILL);
      const exists = yield* fs.exists(queryingSkillDir);
      if (exists) {
        yield* fs.remove(queryingSkillDir, { recursive: true }).pipe(Effect51.catchAll(() => Effect51.succeed(void 0)));
        removed.push(`.claude/skills/${QUERYING_INFRA_SKILL}`);
      }
    }
    return removed;
  });
  const reconcileManagedSkills = (projectPath, activeManagedSkills) => Effect51.gen(function* () {
    const removed = [];
    const skillsDir = path5.join(projectPath, ".claude", "skills");
    const hasSkillsDir = yield* fs.exists(skillsDir);
    if (!hasSkillsDir) return removed;
    const activeSet = new Set(activeManagedSkills);
    for (const name of ALL_HISTORICALLY_MANAGED_SKILLS) {
      if (activeSet.has(name)) continue;
      const dir = path5.join(skillsDir, name);
      const exists = yield* fs.exists(dir);
      if (exists) {
        yield* fs.remove(dir, { recursive: true }).pipe(Effect51.catchAll(() => Effect51.succeed(void 0)));
        removed.push(`.claude/skills/${name}`);
      }
    }
    return removed;
  });
  const getTemplateBasePath = Effect51.gen(function* () {
    const distPath = path5.join(import.meta.dirname, "template-to-project");
    if (yield* fs.exists(distPath)) {
      return distPath;
    }
    return path5.join(process.cwd(), "template-to-project");
  });
  const getTemplateVersion = Effect51.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const manifestPath = path5.join(templateBasePath, "template-manifest.json");
    const exists = yield* fs.exists(manifestPath);
    if (!exists) return DEFAULT_TEMPLATE_VERSION2;
    const raw = yield* fs.readFileString(manifestPath).pipe(Effect51.catchAll(() => Effect51.succeed("")));
    if (!raw) return DEFAULT_TEMPLATE_VERSION2;
    try {
      const parsed = JSON.parse(raw);
      if (isRecord4(parsed)) {
        return readStringField2(parsed, "template_version") ?? DEFAULT_TEMPLATE_VERSION2;
      }
      return DEFAULT_TEMPLATE_VERSION2;
    } catch {
      return DEFAULT_TEMPLATE_VERSION2;
    }
  });
  const reconcileManagedAgents = (projectPath) => Effect51.gen(function* () {
    const removed = [];
    const agentsDir = path5.join(projectPath, ".claude", "agents");
    const hasAgentsDir = yield* fs.exists(agentsDir);
    if (!hasAgentsDir) return removed;
    const templateBasePath = yield* getTemplateBasePath;
    const agentsTemplateDir = path5.join(
      templateBasePath,
      ".claude",
      "agents"
    );
    const templateExists = yield* fs.exists(agentsTemplateDir);
    if (!templateExists) return removed;
    for (const agentFile of SPECFORGE_MANAGED_AGENTS2) {
      const inProject = yield* fs.exists(path5.join(agentsDir, agentFile));
      if (!inProject) continue;
      const inTemplate = yield* fs.exists(
        path5.join(agentsTemplateDir, agentFile)
      );
      if (!inTemplate) {
        yield* fs.remove(path5.join(agentsDir, agentFile)).pipe(Effect51.catchAll(() => Effect51.succeed(void 0)));
        removed.push(`.claude/agents/${agentFile}`);
      }
    }
    return removed;
  });
  const reconcileManagedOpenspecFiles = (projectPath) => Effect51.gen(function* () {
    const removed = [];
    const relBase = path5.join("openspec", "schemas", "specforge-enhanced");
    const targetDir = path5.join(projectPath, relBase);
    const hasTargetDir = yield* fs.exists(targetDir);
    if (!hasTargetDir) return removed;
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path5.join(templateBasePath, relBase);
    const collectFiles = (dir, baseDir) => Effect51.gen(function* () {
      const entries = yield* fs.readDirectory(dir).pipe(Effect51.catchAll(() => Effect51.succeed([])));
      const results = [];
      for (const name of entries) {
        if (name.startsWith(".") || name.includes(".DS_Store")) continue;
        const fullPath = path5.join(dir, name);
        const rel = path5.relative(baseDir, fullPath);
        const stat = yield* fs.stat(fullPath).pipe(Effect51.catchAll(() => Effect51.succeed(null)));
        if (stat?.type === "File") {
          results.push(rel);
        } else if (stat?.type === "Directory") {
          const subFiles = yield* collectFiles(fullPath, baseDir);
          results.push(...subFiles);
        }
      }
      return results;
    });
    const hasTemplateDir = yield* fs.exists(templateDir);
    if (!hasTemplateDir) return removed;
    const templateFiles = yield* collectFiles(templateDir, templateDir);
    const templateFileSet = new Set(templateFiles);
    const projectFiles = yield* collectFiles(targetDir, targetDir);
    for (const relFile of projectFiles) {
      if (!templateFileSet.has(relFile)) {
        yield* fs.remove(path5.join(targetDir, relFile)).pipe(Effect51.catchAll(() => Effect51.succeed(void 0)));
        removed.push(`${relBase}/${relFile}`);
      }
    }
    return removed;
  });
  const generateSpecforgeMarker = (profile, templateVersion) => {
    return `_specforge:
  profile: "${profile}"
  template_version: "${templateVersion}"
  initialized_at: "${(/* @__PURE__ */ new Date()).toISOString()}"

`;
  };
  const injectSpecforgeMarker = (projectPath, profileName) => Effect51.gen(function* () {
    const configPath = path5.join(projectPath, "openspec", "config.yaml");
    const exists = yield* fs.exists(configPath);
    const templateVersion = yield* getTemplateVersion;
    if (exists) {
      let content = yield* fs.readFileString(configPath);
      if (content.includes("_specforge:")) {
        content = content.replace(
          SPECFORGE_MARKER_BLOCK_REPLACE_PATTERN,
          generateSpecforgeMarker(profileName, templateVersion)
        );
      } else {
        content = generateSpecforgeMarker(profileName, templateVersion) + content;
      }
      yield* fs.writeFileString(configPath, content);
    }
  });
  const injectOpenspecDir = (projectPath, variables, options) => Effect51.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path5.join(templateBasePath, "openspec");
    const targetDir = path5.join(projectPath, "openspec");
    const result = {
      created: [],
      skipped: [],
      errors: []
    };
    if (options.scenario === "S2_OPENSPEC_ONLY" || options.scenario === "S4_BOTH_NON_SPECFORGE" || options.scenario === "S5_CONFIGURED" || options.scenario === "S6_PARTIAL") {
      const schemasTemplateDir = path5.join(templateDir, "schemas");
      const schemasTargetDir = path5.join(targetDir, "schemas");
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
        result.skipped.push(
          ...schemasResult.skipped.map((f) => `openspec/schemas/${f}`)
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
  const injectClaudeDir = (projectPath, variables, options) => Effect51.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path5.join(templateBasePath, ".claude");
    const targetDir = path5.join(projectPath, ".claude");
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
    const skillsTemplateDir = path5.join(templateDir, "skills");
    const skillsTargetDir = path5.join(targetDir, "skills");
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
            const skillName = relativePath.split(/[\\/]/)[0];
            if (!skillName) return false;
            if (relativePath.includes(".DS_Store")) return false;
            return getManagedSkills(
              options.includeQueryingInfraSkill
            ).includes(skillName);
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
    const agentsTemplateDir = path5.join(templateDir, "agents");
    const agentsTargetDir = path5.join(targetDir, "agents");
    const agentsTemplateExists = yield* fs.exists(agentsTemplateDir);
    if (agentsTemplateExists) {
      const agentsResult = yield* templateProcessor.processTemplateDirectory(
        agentsTemplateDir,
        agentsTargetDir,
        variables,
        {
          skipExisting: false,
          // SpecForge agents 可覆盖更新
          filter: (relativePath) => SPECFORGE_MANAGED_AGENTS2.some((f) => relativePath === f)
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
  const loadBuiltInMcpServers = Effect51.gen(function* () {
    const templateBasePath = yield* getTemplateBasePath;
    const templatePath = path5.join(
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
      if (!isRecord4(parsed)) {
        return {};
      }
      const mcpServers = parsed.mcpServers;
      if (!isRecord4(mcpServers)) {
        return {};
      }
      return mcpServers;
    } catch {
      return {};
    }
  });
  const mergeMcpConfig = (projectPath, profile) => Effect51.gen(function* () {
    const mcpPath = path5.join(projectPath, ".mcp.json");
    const exists = yield* fs.exists(mcpPath);
    let existingConfig = { mcpServers: {} };
    if (exists) {
      try {
        const content = yield* fs.readFileString(mcpPath);
        const parsed = JSON.parse(content);
        if (isRecord4(parsed) && isRecord4(parsed.mcpServers)) {
          existingConfig = {
            mcpServers: parsed.mcpServers
          };
        }
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
  const mergeConfigYaml = (projectPath, variables) => Effect51.gen(function* () {
    const userConfigPath = path5.join(projectPath, "openspec", "config.yaml");
    const templateBasePath = yield* getTemplateBasePath;
    const templateConfigPath = path5.join(
      templateBasePath,
      "openspec",
      "config.yaml"
    );
    const userConfigExists = yield* fs.exists(userConfigPath);
    if (!userConfigExists) {
      return yield* Effect51.fail(
        new Error("\u7528\u6237\u7684 config.yaml \u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u5408\u5E76")
      );
    }
    const userConfigContent = yield* fs.readFileString(userConfigPath);
    const userConfigParsed = YAML.parse(userConfigContent);
    if (!isYamlConfig(userConfigParsed)) {
      return yield* Effect51.fail(new Error("\u7528\u6237\u7684 config.yaml \u683C\u5F0F\u65E0\u6548"));
    }
    const userConfig = userConfigParsed;
    const templateConfigExists = yield* fs.exists(templateConfigPath);
    if (!templateConfigExists) {
      return yield* Effect51.fail(
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
      return yield* Effect51.fail(new Error("\u6A21\u677F\u7684 config.yaml \u683C\u5F0F\u65E0\u6548"));
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
    const mergedYaml = YAML.stringify(mergedConfig, { lineWidth: 0 });
    yield* fs.writeFileString(userConfigPath, mergedYaml);
  });
  const injectOpenspecEnhancements = (projectPath, variables) => Effect51.gen(function* () {
    const result = {
      created: [],
      updated: [],
      errors: []
    };
    const templateBasePath = yield* getTemplateBasePath;
    const schemasTemplateDir = path5.join(
      templateBasePath,
      "openspec",
      "schemas"
    );
    const schemasTargetDir = path5.join(projectPath, "openspec", "schemas");
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
  const injectClaudeEnhancements = (projectPath, variables, options) => Effect51.gen(function* () {
    const result = {
      created: [],
      skipped: [],
      errors: []
    };
    const templateBasePath = yield* getTemplateBasePath;
    const templateDir = path5.join(templateBasePath, ".claude");
    const targetDir = path5.join(projectPath, ".claude");
    const skillsTemplateDir = path5.join(templateDir, "skills");
    const skillsTargetDir = path5.join(targetDir, "skills");
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
              const skillName = relativePath.split(/[\\/]/)[0];
              if (!skillName) return false;
              return getManagedSkills(
                options.includeQueryingInfraSkill
              ).includes(skillName);
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
    const agentsTemplateDir = path5.join(templateDir, "agents");
    const agentsTargetDir = path5.join(targetDir, "agents");
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
            filter: (relativePath) => SPECFORGE_MANAGED_AGENTS2.some((f) => relativePath === f)
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
  const injectTemplates = (projectId, options) => Effect51.gen(function* () {
    const { project } = yield* projectRepository.getProject(projectId);
    if (project.meta.projectPath === null) {
      return yield* Effect51.fail(new ProjectPathNotFoundError6({ projectId }));
    }
    const projectPath = project.meta.projectPath;
    const { scenario, profile, force } = options;
    const includeQueryingInfraSkill = shouldEnableQueryingInfraSkill(profile);
    const developSkillsConfig = profile.infra_catalog.develop_skills;
    let preResolvedLocalDevelopSkills = [];
    const result = {
      success: true,
      created: [],
      skipped: [],
      updated: [],
      removed: [],
      errors: [],
      warnings: []
    };
    const mcpConsistencyIssues = yield* validateMcpToolConsistency(profile);
    if (mcpConsistencyIssues.length > 0) {
      result.success = false;
      result.errors.push(
        ...mcpConsistencyIssues.map((issue) => ({
          file: "profile-config",
          error: issue
        }))
      );
      return result;
    }
    if (developSkillsConfig && developSkillsConfig.skills.length > 0) {
      if (developSkillsConfig.gitUrl) {
        const preflight = yield* skillManagerService.preflightSkillsFromGit(
          developSkillsConfig.gitUrl,
          developSkillsConfig.skills
        );
        if (!preflight.ok) {
          const missingText = preflight.missingSkills && preflight.missingSkills.length > 0 ? `
\u7F3A\u5931\u8DEF\u5F84: ${preflight.missingSkills.join(", ")}` : "";
          result.success = false;
          result.errors.push({
            file: "develop-skills-preflight",
            error: `develop_skills \u9884\u68C0\u5931\u8D25\uFF08${preflight.category}\uFF09\u3002${preflight.message ? `
\u539F\u56E0: ${preflight.message}` : ""}` + missingText + "\n\u5EFA\u8BAE: 1) \u4FEE\u6B63 gitUrl/\u8DEF\u5F84\u540E\u91CD\u8BD5\uFF08skills \u652F\u6301\u540D\u79F0\u6216\u4ED3\u5E93\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u4F8B\u5982 zx-fe-skills/zx-h5-develop-experience\uFF09 2) \u6216\u5C06 skills \u624B\u52A8\u653E\u5165 .claude/skills/<name>/SKILL.md \u5E76\u79FB\u9664 gitUrl \u4F7F\u7528\u672C\u5730\u6A21\u5F0F\u3002"
          });
          return result;
        }
      } else {
        const localResolve = yield* resolveLocalDevelopSkills(
          projectPath,
          developSkillsConfig.skills
        );
        if (localResolve.missing.length > 0) {
          result.success = false;
          result.errors.push({
            file: "develop-skills-preflight",
            error: `develop_skills \u672C\u5730\u9884\u68C0\u5931\u8D25\uFF0C\u4EE5\u4E0B skills \u672A\u627E\u5230: ${localResolve.missing.join(", ")}\u3002
\u8BF7\u8865\u5145 gitUrl \u4EE5\u81EA\u52A8\u5B89\u88C5\uFF0C\u6216\u5148\u5C06\u5BF9\u5E94 skills \u653E\u5165 .claude/skills/<name>/SKILL.md \u540E\u91CD\u8BD5\u3002`
          });
          return result;
        }
        preResolvedLocalDevelopSkills = localResolve.resolved;
      }
    }
    const envStatus = yield* environmentService.checkEnvironment(projectId);
    if (!envStatus.cliInstalled || envStatus.cliInstallType === "npx") {
      console.log(
        envStatus.cliInstallType === "npx" ? "[SpecForge] OpenSpec CLI \u4EC5\u901A\u8FC7 npx \u53EF\u7528\uFF0C\u6B63\u5728\u5168\u5C40\u5B89\u88C5\u4EE5\u786E\u4FDD\u7A33\u5B9A\u6027..." : "[SpecForge] OpenSpec CLI \u672A\u5B89\u88C5\uFF0C\u6B63\u5728\u81EA\u52A8\u5B89\u88C5 @fission-ai/openspec@1.2.0..."
      );
      const globalInstallResult = yield* environmentService.installCliGlobal({
        initialize: false
      });
      if (!globalInstallResult.success) {
        console.warn(
          `[SpecForge] \u5168\u5C40\u5B89\u88C5\u5931\u8D25\uFF0C\u5C1D\u8BD5\u9879\u76EE\u5185\u5B89\u88C5\u3002\u539F\u56E0: ${globalInstallResult.error ?? "\u672A\u77E5\u9519\u8BEF"}`
        );
        const projectInstallResult = yield* environmentService.installCliProject(projectId, {
          initialize: false
        });
        if (!projectInstallResult.success) {
          result.success = false;
          result.errors.push({
            file: "openspec-cli-install",
            error: `\u81EA\u52A8\u5B89\u88C5 OpenSpec CLI \u5931\u8D25\u3002\u5168\u5C40\u5B89\u88C5\u9519\u8BEF: ${globalInstallResult.error ?? "\u672A\u77E5\u9519\u8BEF"}\uFF1B\u9879\u76EE\u5185\u5B89\u88C5\u9519\u8BEF: ${projectInstallResult.error ?? "\u672A\u77E5\u9519\u8BEF"}\u3002\u8BF7\u624B\u52A8\u6267\u884C npm install -g @fission-ai/openspec@1.2.0 \u6216 npm install --save-dev @fission-ai/openspec@1.2.0`
          });
          return result;
        }
        console.log("[SpecForge] OpenSpec CLI \u9879\u76EE\u5185\u5B89\u88C5\u6210\u529F");
      } else {
        console.log("[SpecForge] OpenSpec CLI \u5B89\u88C5\u6210\u529F");
      }
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
      const configCreatedCheck = yield* fs.exists(
        path5.join(projectPath, "openspec", "config.yaml")
      );
      if (!configCreatedCheck) {
        result.success = false;
        result.errors.push({
          file: "openspec-init-verify",
          error: "openspec init \u62A5\u544A\u6210\u529F\u4F46 config.yaml \u672A\u521B\u5EFA\u3002\u8FD9\u53EF\u80FD\u662F\u56E0\u4E3A openspec CLI \u672A\u6B63\u786E\u5B89\u88C5\u3002\u8BF7\u5C1D\u8BD5\u624B\u52A8\u6267\u884C: npm install -g @fission-ai/openspec@1.2.0"
        });
        return result;
      }
    } catch (error) {
      result.success = false;
      result.errors.push({
        file: "openspec-init",
        error: `\u6267\u884C openspec init \u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`
      });
      return result;
    }
    try {
      console.log("[SpecForge] \u6B63\u5728\u5168\u5C40\u5B89\u88C5 GitNexus CLI...");
      yield* eventBus.emit("initializationProgress", {
        message: "\u6B63\u5728\u5168\u5C40\u5B89\u88C5 GitNexus CLI...",
        stage: "loading"
      });
      const gitNexusInstallResult = yield* environmentService.installGitNexusGlobal();
      if (gitNexusInstallResult.success) {
        console.log("[SpecForge] GitNexus CLI \u5B89\u88C5\u6210\u529F\uFF0C\u6B63\u5728\u5EFA\u7ACB\u4ED3\u5E93\u7D22\u5F15...");
        yield* eventBus.emit("initializationProgress", {
          message: "GitNexus CLI \u5B89\u88C5\u6210\u529F\uFF0C\u6B63\u5728\u5EFA\u7ACB\u4ED3\u5E93\u7D22\u5F15...",
          stage: "loading"
        });
        const gitNexusAnalyzeResult = yield* environmentService.runGitNexusAnalyze(projectId);
        if (gitNexusAnalyzeResult.success) {
          console.log("[SpecForge] GitNexus \u4ED3\u5E93\u7D22\u5F15\u5EFA\u7ACB\u6210\u529F");
          yield* eventBus.emit("initializationProgress", {
            message: "GitNexus \u4ED3\u5E93\u7D22\u5F15\u5EFA\u7ACB\u6210\u529F",
            stage: "loading"
          });
        } else {
          console.warn(
            `[SpecForge] GitNexus \u4ED3\u5E93\u7D22\u5F15\u5EFA\u7ACB\u5931\u8D25: ${gitNexusAnalyzeResult.error}`
          );
          result.warnings.push({
            file: "gitnexus-analyze",
            message: gitNexusAnalyzeResult.error ?? "gitnexus analyze \u6267\u884C\u5931\u8D25"
          });
        }
      } else {
        console.warn(
          `[SpecForge] GitNexus CLI \u5B89\u88C5\u5931\u8D25: ${gitNexusInstallResult.error}`
        );
        result.warnings.push({
          file: "gitnexus-install",
          message: gitNexusInstallResult.error ?? "npm install -g gitnexus@latest \u6267\u884C\u5931\u8D25"
        });
      }
    } catch (error) {
      console.warn(
        "[SpecForge] GitNexus \u5B89\u88C5/\u7D22\u5F15\u8FC7\u7A0B\u51FA\u73B0\u5F02\u5E38:",
        error instanceof Error ? error.message : String(error)
      );
      result.warnings.push({
        file: "gitnexus",
        message: `GitNexus \u5B89\u88C5/\u7D22\u5F15\u5F02\u5E38: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    let installedDevelopSkills = [];
    if (developSkillsConfig && developSkillsConfig.skills.length > 0) {
      if (developSkillsConfig.gitUrl) {
        console.log(
          `[SpecForge] \u6B63\u5728\u4ECE ${developSkillsConfig.gitUrl} \u5B89\u88C5 Skills...`
        );
        installedDevelopSkills = yield* skillManagerService.installSkillsFromGit(
          projectPath,
          developSkillsConfig.gitUrl,
          developSkillsConfig.skills
        );
        const hasWildcardPath = developSkillsConfig.skills.some(
          (skillPath) => skillPath.trim().endsWith("/*")
        );
        const installedNames = new Set(
          installedDevelopSkills.map((s) => s.name.trim())
        );
        const expectedNames = hasWildcardPath ? [] : developSkillsConfig.skills.map((skillPath) => path5.basename(skillPath.trim())).filter((name) => name.length > 0);
        const missingSkills = expectedNames.filter(
          (expected) => !installedNames.has(expected)
        );
        if (installedDevelopSkills.length > 0 && missingSkills.length === 0) {
          result.created.push(
            ...installedDevelopSkills.map(
              (s) => `.claude/skills/${s.name} (from git)`
            )
          );
          console.log(
            `[SpecForge] \u6210\u529F\u5B89\u88C5 ${installedDevelopSkills.length} \u4E2A Skills: ${installedDevelopSkills.map((s) => s.name).join(", ")}`
          );
        } else {
          const missingText = missingSkills.length > 0 ? `
  4. \u672A\u5B89\u88C5\u5230\u7684 skills: ${missingSkills.join(", ")}` : "";
          result.success = false;
          result.errors.push({
            file: "develop-skills",
            error: `\u4ECE Git \u4ED3\u5E93\u5B89\u88C5 develop_skills \u5931\u8D25\u6216\u4E0D\u5B8C\u6574\u3002\u8BF7\u68C0\u67E5\uFF1A
  1. Git URL \u662F\u5426\u53EF\u8BBF\u95EE: ${developSkillsConfig.gitUrl}
  2. skills \u8DEF\u5F84\u662F\u5426\u6B63\u786E: ${developSkillsConfig.skills.join(", ")}
  3. \u4ED3\u5E93\u4E2D\u5BF9\u5E94\u76EE\u5F55\u662F\u5426\u5305\u542B SKILL.md \u6587\u4EF6` + missingText
          });
          return result;
        }
      } else {
        installedDevelopSkills = preResolvedLocalDevelopSkills;
      }
    }
    const variables = yield* profileConfigService.generateTemplateVariables(
      profile,
      projectPath,
      installedDevelopSkills
    );
    try {
      const configPath = path5.join(projectPath, "openspec", "config.yaml");
      const originConfigPath = path5.join(
        projectPath,
        "openspec",
        "config.origin.yaml"
      );
      const configExists = yield* fs.exists(configPath);
      if (configExists) {
        const originalContent = yield* fs.readFileString(configPath);
        const originExists = yield* fs.exists(originConfigPath);
        const backupHeader = `# ============================================================================
# OpenSpec \u6807\u51C6\u914D\u7F6E\u5907\u4EFD\u6587\u4EF6
# ============================================================================
#
# \u8FD9\u662F\u7531 SpecForge \u5728\u6267\u884C\u521D\u59CB\u5316/\u91CD\u521D\u59CB\u5316\u524D\u81EA\u52A8\u521B\u5EFA\u7684\u5907\u4EFD\u6587\u4EF6
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
        if (originExists) {
          result.updated.push(
            "openspec/config.origin.yaml (backup refreshed)"
          );
        } else {
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
        if (scenario === "S2_OPENSPEC_ONLY" || scenario === "S4_BOTH_NON_SPECFORGE" || scenario === "S6_PARTIAL" && options.isConfigCorrupted === true) {
          try {
            yield* mergeConfigYaml(projectPath, variables);
            result.updated.push("openspec/config.yaml");
          } catch (mergeError) {
            if (scenario === "S6_PARTIAL" && options.isConfigCorrupted === true) {
              try {
                const templateBasePath = yield* getTemplateBasePath;
                const templateConfigPath = path5.join(
                  templateBasePath,
                  "openspec",
                  "config.yaml"
                );
                let templateContent = yield* fs.readFileString(templateConfigPath);
                for (const [key, value] of Object.entries(variables)) {
                  if (value !== void 0) {
                    templateContent = templateContent.replaceAll(
                      `{{${key}}}`,
                      value
                    );
                  }
                }
                const configPath = path5.join(
                  projectPath,
                  "openspec",
                  "config.yaml"
                );
                yield* fs.writeFileString(configPath, templateContent);
                result.updated.push(
                  "openspec/config.yaml (rebuilt from template)"
                );
              } catch (rebuildError) {
                result.errors.push({
                  file: "openspec-config",
                  error: `config.yaml \u91CD\u5EFA\u5931\u8D25: ${rebuildError instanceof Error ? rebuildError.message : String(rebuildError)}`
                });
              }
            } else {
              result.errors.push({
                file: "openspec-config",
                error: mergeError instanceof Error ? mergeError.message : String(mergeError)
              });
            }
          }
        }
      }
      if (scenario === "S1_NEW") {
        const claudeResult = yield* injectClaudeEnhancements(
          projectPath,
          variables,
          { includeQueryingInfraSkill }
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
          includeQueryingInfraSkill
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
      const removedManagedSkills = yield* removeDisabledManagedSkills(
        projectPath,
        { includeQueryingInfraSkill }
      );
      if (removedManagedSkills.length > 0) {
        result.updated.push(
          ...removedManagedSkills.map((s) => `${s} (removed by profile)`)
        );
      }
      if (force) {
        const activeManagedSkills = getManagedSkills(
          includeQueryingInfraSkill
        );
        const reconciledSkills = yield* reconcileManagedSkills(
          projectPath,
          activeManagedSkills
        );
        const reconciledAgents = yield* reconcileManagedAgents(projectPath);
        const reconciledOpenspec = yield* reconcileManagedOpenspecFiles(projectPath);
        result.removed.push(
          ...reconciledSkills,
          ...reconciledAgents,
          ...reconciledOpenspec
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
var TemplateInjectionService = class extends Context39.Tag(
  "TemplateInjectionService"
)() {
  static {
    this.Live = Layer41.effect(this, LayerImpl30);
  }
};

// src/server/core/openspec/presentation/OpenSpecController.ts
var catchAsServerError2 = (errorMessage) => Effect52.catchAll((error) => {
  console.error(`${errorMessage}:`, error);
  return Effect52.succeed({
    response: { error: errorMessage },
    status: 500
  });
});
var LayerImpl31 = Effect52.gen(function* () {
  const openSpecService = yield* OpenSpecService;
  const environmentService = yield* OpenSpecEnvironmentService;
  const profileConfigService = yield* ProfileConfigService;
  const templateInjectionService = yield* TemplateInjectionService;
  const projectRepository = yield* ProjectRepository;
  const getChangesRoute = (options) => Effect52.gen(function* () {
    const changes = yield* openSpecService.getChanges(options.projectId);
    return {
      response: changes,
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to list OpenSpec changes"));
  const getChangeDetailsRoute = (options) => Effect52.gen(function* () {
    const details = yield* openSpecService.getChangeDetails(
      options.projectId,
      options.changeId
    );
    return {
      response: details,
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to get change details"));
  const getArchivedChangesRoute = (options) => Effect52.gen(function* () {
    const changes = yield* openSpecService.getArchivedChanges(
      options.projectId
    );
    return {
      response: changes,
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to list OpenSpec archived changes"));
  const updateFileRoute = (options) => Effect52.gen(function* () {
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
  }).pipe(catchAsServerError2("Failed to update file"));
  const getEnvironmentRoute = (options) => Effect52.gen(function* () {
    const status = yield* environmentService.checkEnvironment(
      options.projectId
    );
    return {
      response: status,
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to check environment"));
  const getProfilesRoute = (_options) => Effect52.gen(function* () {
    const result = yield* Effect52.either(
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
  const initializeRoute = (options) => Effect52.gen(function* () {
    const { projectId, scenario, profile, force, isConfigCorrupted } = options;
    const result = yield* templateInjectionService.injectTemplates(
      projectId,
      {
        scenario,
        profile,
        skipUserFiles: true,
        force,
        isConfigCorrupted
      }
    );
    return {
      response: result,
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to initialize SpecForge"));
  const installCliGlobalRoute = (options) => Effect52.gen(function* () {
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
  }).pipe(catchAsServerError2("Failed to install CLI"));
  const installCliProjectRoute = (options) => Effect52.gen(function* () {
    const { projectId, initialize } = options;
    const result = yield* environmentService.installCliProject(projectId, {
      initialize
    });
    return {
      response: result,
      status: result.success ? 200 : 500
    };
  }).pipe(catchAsServerError2("Failed to install CLI"));
  const runOpenspecInitRoute = (options) => Effect52.gen(function* () {
    const result = yield* environmentService.initializeOpenspec(
      options.projectId
    );
    return {
      response: result,
      status: result.success ? 200 : 500
    };
  }).pipe(catchAsServerError2("Failed to run openspec init"));
  const getProjectProfileRoute = (options) => Effect52.gen(function* () {
    const config = yield* profileConfigService.getProjectProfileConfig(
      options.projectId
    );
    return {
      response: { profile: config ?? null },
      status: 200
    };
  }).pipe(catchAsServerError2("Failed to get project profile config"));
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
var OpenSpecController = class extends Context40.Tag("OpenSpecController")() {
  static {
    this.Live = Layer42.effect(this, LayerImpl31);
  }
};

// src/server/core/project/presentation/ProjectController.ts
import { FileSystem as FileSystem26, Path as Path31 } from "@effect/platform";
import { Context as Context41, Effect as Effect54, Layer as Layer43 } from "effect";

// src/server/core/claude-code/functions/computeClaudeProjectFilePath.ts
import { Path as Path30 } from "@effect/platform";
import { Effect as Effect53 } from "effect";

// src/server/core/project/functions/normalizeClaudeProjectPath.ts
var normalizeClaudeProjectPath = (projectPath) => projectPath.replace(/[\\/]+$/, "").replace(/[\\/:_]/g, "-");

// src/server/core/claude-code/functions/computeClaudeProjectFilePath.ts
var computeClaudeProjectFilePath = (options) => Effect53.gen(function* () {
  const path5 = yield* Path30.Path;
  const { projectPath, claudeProjectsDirPath } = options;
  const normalizedProjectPath = normalizeClaudeProjectPath(projectPath);
  return path5.join(claudeProjectsDirPath, normalizedProjectPath);
});

// src/server/core/project/presentation/ProjectController.ts
var LayerImpl32 = Effect54.gen(function* () {
  const projectRepository = yield* ProjectRepository;
  const projectMetaService = yield* ProjectMetaService;
  const claudeCodeLifeCycleService = yield* ClaudeCodeLifeCycleService;
  const userConfigService = yield* UserConfigService;
  const sessionRepository = yield* SessionRepository;
  const context = yield* ApplicationContext;
  const fileSystem = yield* FileSystem26.FileSystem;
  const path5 = yield* Path31.Path;
  const getProjects = () => Effect54.gen(function* () {
    const { projects } = yield* projectRepository.getProjects();
    return {
      status: 200,
      response: { projects }
    };
  });
  const getProject = (options) => Effect54.gen(function* () {
    const { projectId, cursor } = options;
    const userConfig = yield* userConfigService.getUserConfig();
    const { project } = yield* projectRepository.getProject(projectId);
    const { sessions } = yield* sessionRepository.getSessions(projectId, {
      maxCount: Number.MAX_SAFE_INTEGER
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
        const title = session.displayMeta.title;
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
    const pageSize = 20;
    const startIndex = cursor === void 0 ? 0 : filteredSessions.findIndex((session) => session.id === cursor) + 1;
    const pagedSessions = startIndex <= 0 ? filteredSessions.slice(0, pageSize) : filteredSessions.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex <= 0 ? filteredSessions.length > pageSize : startIndex + pageSize < filteredSessions.length;
    return {
      status: 200,
      response: {
        project,
        sessions: pagedSessions,
        totalSessions: filteredSessions.length,
        nextCursor: hasMore ? pagedSessions.at(-1)?.id : void 0
      }
    };
  });
  const getProjectLatestSession = (options) => Effect54.gen(function* () {
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
  const createProject = (options) => Effect54.gen(function* () {
    const { projectPath } = options;
    const claudeProjectFilePath = yield* computeClaudeProjectFilePath({
      projectPath,
      claudeProjectsDirPath: (yield* context.claudeCodePaths).claudeProjectsDirPath
    });
    const projectPathHintFilePath = path5.join(
      claudeProjectFilePath,
      PROJECT_PATH_HINT_FILENAME
    );
    const projectId = encodeProjectId(claudeProjectFilePath);
    const userConfig = yield* userConfigService.getUserConfig();
    yield* fileSystem.makeDirectory(claudeProjectFilePath, { recursive: true }).pipe(Effect54.catchAll(() => Effect54.void));
    yield* fileSystem.writeFileString(projectPathHintFilePath, projectPath).pipe(Effect54.catchAll(() => Effect54.void));
    const claudeMdPath = path5.join(projectPath, "CLAUDE.md");
    const claudeMdExists = yield* fileSystem.exists(claudeMdPath);
    yield* claudeCodeLifeCycleService.startTask({
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
    return {
      status: 201,
      response: {
        projectId
      }
    };
  });
  const createWorkspace = (options) => Effect54.gen(function* () {
    const { parentPath, workspaceName, additionalDirectories } = options;
    const parentExists = yield* fileSystem.exists(parentPath);
    if (!parentExists) {
      return {
        status: 400,
        response: { error: "Parent directory not found" }
      };
    }
    const workspacePath = path5.join(parentPath, workspaceName);
    yield* fileSystem.makeDirectory(workspacePath, { recursive: true });
    const claudeDirPath = path5.join(workspacePath, ".claude");
    yield* fileSystem.makeDirectory(claudeDirPath, { recursive: true }).pipe(Effect54.catchAll(() => Effect54.void));
    const settingsPath = path5.join(claudeDirPath, "settings.json");
    const existingSettings = yield* fileSystem.readFileString(settingsPath).pipe(
      Effect54.flatMap(
        (content) => Effect54.try({
          try: () => JSON.parse(content),
          catch: () => new Error("Invalid JSON")
        })
      ),
      Effect54.catchAll(() => Effect54.succeed({}))
    );
    const mergedSettings = {
      ...existingSettings,
      permissions: {
        ...existingSettings.permissions ?? {},
        additionalDirectories
      }
    };
    const settingsContent = JSON.stringify(mergedSettings, null, 2);
    yield* fileSystem.writeFileString(settingsPath, settingsContent);
    const claudeProjectFilePath = yield* computeClaudeProjectFilePath({
      projectPath: workspacePath,
      claudeProjectsDirPath: (yield* context.claudeCodePaths).claudeProjectsDirPath
    });
    const projectPathHintFilePath = path5.join(
      claudeProjectFilePath,
      PROJECT_PATH_HINT_FILENAME
    );
    const projectId = encodeProjectId(claudeProjectFilePath);
    const userConfig = yield* userConfigService.getUserConfig();
    yield* fileSystem.makeDirectory(claudeProjectFilePath, { recursive: true }).pipe(Effect54.catchAll(() => Effect54.void));
    yield* fileSystem.writeFileString(projectPathHintFilePath, workspacePath).pipe(Effect54.catchAll(() => Effect54.void));
    const dirList = additionalDirectories.map((dir, i) => `${i + 1}. ${dir}`).join("\n");
    const analyzeCommands = additionalDirectories.map((dir) => `cd "${dir}" && npx gitnexus analyze`).join("\n");
    yield* claudeCodeLifeCycleService.startTask({
      baseSession: {
        cwd: workspacePath,
        projectId,
        sessionId: void 0
      },
      userConfig,
      input: {
        text: `\u8FD9\u662F\u4E00\u4E2A\u5DE5\u4F5C\u533A\u76EE\u5F55\uFF0C\u8DEF\u5F84\u4E3A\uFF1A${workspacePath}

\u5173\u8054\u7684\u9879\u76EE\u76EE\u5F55\u5982\u4E0B\uFF1A
${dirList}

\u8BF7\u6309\u7167\u4EE5\u4E0B\u6B65\u9AA4\u6267\u884C\uFF1A

1. \u5728\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u521B\u5EFA CLAUDE.md \u6587\u4EF6\u4F5C\u4E3A memory file
2. \u5BF9\u6BCF\u4E2A\u5173\u8054\u9879\u76EE\u76EE\u5F55\u6267\u884C gitnexus \u5206\u6790\uFF1A
${analyzeCommands}
3. \u5C06\u4EE5\u4E0B\u5185\u5BB9\u6574\u5408\u5199\u5165 CLAUDE.md\uFF1A
   - \u5DE5\u4F5C\u533A\u6982\u8FF0\uFF08\u8DEF\u5F84\u3001\u7528\u9014\u8BF4\u660E\uFF09
   - \u5404\u5173\u8054\u9879\u76EE\u7684\u7B80\u8981\u8BF4\u660E\uFF08\u57FA\u4E8E gitnexus \u5206\u6790\u7ED3\u679C\uFF09
   - \u9879\u76EE\u95F4\u7684\u5173\u8054\u5173\u7CFB\uFF08\u5982\u679C\u80FD\u8BC6\u522B\u51FA\u6765\uFF09

\u6CE8\u610F\uFF1ACLAUDE.md \u4F1A\u4F5C\u4E3A\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u8BB0\u5FC6\u6587\u4EF6\uFF0C\u540E\u7EED\u6240\u6709\u4F1A\u8BDD\u90FD\u4F1A\u8BFB\u53D6\u5B83\uFF0C\u8BF7\u786E\u4FDD\u5185\u5BB9\u6E05\u6670\u3001\u7ED3\u6784\u5316\u3002`
      }
    });
    return {
      status: 201,
      response: {
        projectId
      }
    };
  });
  const repairProjectPath = (options) => Effect54.gen(function* () {
    const result = yield* projectMetaService.repairProjectPath(
      options.projectId
    );
    return {
      status: result.success ? 200 : 409,
      response: result
    };
  });
  return {
    getProjects,
    getProject,
    getProjectLatestSession,
    createProject,
    createWorkspace,
    repairProjectPath
  };
});
var ProjectController = class extends Context41.Tag("ProjectController")() {
  static {
    this.Live = Layer43.effect(this, LayerImpl32);
  }
};

// src/server/core/rate-limit/services/RateLimitAutoScheduleService.ts
import { FileSystem as FileSystem29, Path as Path33 } from "@effect/platform";
import { Context as Context44, Effect as Effect59, Layer as Layer46, Ref as Ref13 } from "effect";

// src/server/core/scheduler/config.ts
import { FileSystem as FileSystem27, Path as Path32 } from "@effect/platform";
import { Context as Context42, Data as Data14, Effect as Effect55, Layer as Layer44 } from "effect";

// src/server/core/scheduler/schema.ts
import { z as z27 } from "zod";
var concurrencyPolicySchema = z27.enum(["skip", "run"]);
var cronScheduleSchema = z27.object({
  type: z27.literal("cron"),
  expression: z27.string(),
  concurrencyPolicy: concurrencyPolicySchema
});
var reservedScheduleSchema = z27.object({
  type: z27.literal("reserved"),
  reservedExecutionTime: z27.iso.datetime()
});
var scheduleSchema = z27.discriminatedUnion("type", [
  cronScheduleSchema,
  reservedScheduleSchema
]);
var messageConfigSchema = z27.object({
  content: z27.string(),
  projectId: z27.string(),
  baseSessionId: z27.string().nullable()
});
var jobStatusSchema = z27.enum(["success", "failed"]);
var schedulerJobSchema = z27.object({
  id: z27.string(),
  name: z27.string(),
  schedule: scheduleSchema,
  message: messageConfigSchema,
  enabled: z27.boolean(),
  createdAt: z27.string().datetime(),
  lastRunAt: z27.string().datetime().nullable(),
  lastRunStatus: jobStatusSchema.nullable()
});
var schedulerConfigSchema = z27.object({
  jobs: z27.array(schedulerJobSchema)
});
var newSchedulerJobSchema = schedulerJobSchema.omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
  lastRunStatus: true
}).extend({
  enabled: z27.boolean().default(true)
});
var updateSchedulerJobSchema = schedulerJobSchema.partial().pick({
  name: true,
  schedule: true,
  message: true,
  enabled: true
});

// src/server/core/scheduler/config.ts
var ConfigFileNotFoundError = class extends Data14.TaggedError(
  "ConfigFileNotFoundError"
) {
};
var ConfigParseError = class extends Data14.TaggedError("ConfigParseError") {
};
var CONFIG_DIR = "scheduler";
var CONFIG_FILE = "schedules.json";
var SchedulerConfigBaseDir = class extends Context42.Tag(
  "SchedulerConfigBaseDir"
)() {
  static {
    this.Live = Layer44.effect(
      this,
      Effect55.gen(function* () {
        const path5 = yield* Path32.Path;
        return path5.join(resolveHomeDirFromEnv(), ".spec-forge-viewer");
      })
    );
  }
};
var getConfigPath = Effect55.gen(function* () {
  const path5 = yield* Path32.Path;
  const baseDir = yield* SchedulerConfigBaseDir;
  return path5.join(baseDir, CONFIG_DIR, CONFIG_FILE);
});
var readConfig = Effect55.gen(function* () {
  const fs = yield* FileSystem27.FileSystem;
  const configPath = yield* getConfigPath;
  const exists = yield* fs.exists(configPath);
  if (!exists) {
    return yield* Effect55.fail(
      new ConfigFileNotFoundError({ path: configPath })
    );
  }
  const content = yield* fs.readFileString(configPath);
  const jsonResult = yield* Effect55.try({
    try: () => JSON.parse(content),
    catch: (error) => new ConfigParseError({
      path: configPath,
      cause: error
    })
  });
  const parsed = schedulerConfigSchema.safeParse(jsonResult);
  if (!parsed.success) {
    return yield* Effect55.fail(
      new ConfigParseError({
        path: configPath,
        cause: parsed.error
      })
    );
  }
  return parsed.data;
});
var writeConfig = (config) => Effect55.gen(function* () {
  const fs = yield* FileSystem27.FileSystem;
  const path5 = yield* Path32.Path;
  const configPath = yield* getConfigPath;
  const configDir = path5.dirname(configPath);
  yield* fs.makeDirectory(configDir, { recursive: true });
  const content = JSON.stringify(config, null, 2);
  yield* fs.writeFileString(configPath, content);
});
var initializeConfig = Effect55.gen(function* () {
  const result = yield* readConfig.pipe(
    Effect55.catchTags({
      ConfigFileNotFoundError: () => Effect55.gen(function* () {
        const initialConfig = { jobs: [] };
        yield* writeConfig(initialConfig);
        return initialConfig;
      }),
      ConfigParseError: () => Effect55.gen(function* () {
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
  Context as Context43,
  Cron,
  Data as Data15,
  Duration as Duration6,
  Effect as Effect57,
  Fiber,
  Layer as Layer45,
  Ref as Ref12,
  Schedule
} from "effect";
import { ulid as ulid4 } from "ulid";

// src/server/core/scheduler/domain/Job.ts
import { Effect as Effect56 } from "effect";
var executeJob = (job) => Effect56.gen(function* () {
  const lifeCycleService = yield* ClaudeCodeLifeCycleService;
  const projectRepository = yield* ProjectRepository;
  const userConfigService = yield* UserConfigService;
  const { message } = job;
  const { project } = yield* projectRepository.getProject(message.projectId);
  const userConfig = yield* userConfigService.getUserConfig();
  if (project.meta.projectPath === null) {
    return yield* Effect56.fail(
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
var SchedulerJobNotFoundError = class extends Data15.TaggedError(
  "SchedulerJobNotFoundError"
) {
};
var InvalidCronExpressionError = class extends Data15.TaggedError(
  "InvalidCronExpressionError"
) {
};
var LayerImpl33 = Effect57.gen(function* () {
  const fibersRef = yield* Ref12.make(/* @__PURE__ */ new Map());
  const runningJobsRef = yield* Ref12.make(/* @__PURE__ */ new Set());
  const startJob = (job) => Effect57.gen(function* () {
    const now = /* @__PURE__ */ new Date();
    if (job.schedule.type === "cron") {
      const cronResult = Cron.parse(job.schedule.expression);
      if (cronResult._tag === "Left") {
        return yield* Effect57.fail(
          new InvalidCronExpressionError({
            expression: job.schedule.expression,
            cause: cronResult.left
          })
        );
      }
      const cronSchedule = Schedule.cron(cronResult.right);
      const fiber = yield* Effect57.gen(function* () {
        const nextTime = Cron.next(cronResult.right, /* @__PURE__ */ new Date());
        const nextDelay = Math.max(0, nextTime.getTime() - Date.now());
        yield* Effect57.sleep(Duration6.millis(nextDelay));
        yield* Effect57.repeat(runJobWithConcurrencyControl(job), cronSchedule);
      }).pipe(Effect57.forkDaemon);
      yield* Ref12.update(
        fibersRef,
        (fibers) => new Map(fibers).set(job.id, fiber)
      );
    } else if (job.schedule.type === "reserved") {
      if (job.lastRunStatus !== null) {
        return;
      }
      const delay = calculateReservedDelay(job, now);
      const delayDuration = Duration6.millis(delay);
      const fiber = yield* Effect57.delay(
        runJobWithConcurrencyControl(job),
        delayDuration
      ).pipe(Effect57.forkDaemon);
      yield* Ref12.update(
        fibersRef,
        (fibers) => new Map(fibers).set(job.id, fiber)
      );
    }
  });
  const runJobWithConcurrencyControl = (job) => Effect57.gen(function* () {
    if (job.schedule.type === "cron" && job.schedule.concurrencyPolicy === "skip") {
      const runningJobs = yield* Ref12.get(runningJobsRef);
      if (runningJobs.has(job.id)) {
        return;
      }
    }
    yield* Ref12.update(runningJobsRef, (jobs) => new Set(jobs).add(job.id));
    if (job.schedule.type === "reserved") {
      const result2 = yield* executeJob(job).pipe(
        Effect57.matchEffect({
          onSuccess: () => Effect57.void,
          onFailure: () => Effect57.void
        })
      );
      yield* Ref12.update(runningJobsRef, (jobs) => {
        const newJobs = new Set(jobs);
        newJobs.delete(job.id);
        return newJobs;
      });
      yield* deleteJobFromConfig(job.id).pipe(
        Effect57.catchAll((error) => {
          console.error(
            `[Scheduler] Failed to delete reserved job ${job.id}:`,
            error
          );
          return Effect57.void;
        })
      );
      return result2;
    }
    const result = yield* executeJob(job).pipe(
      Effect57.matchEffect({
        onSuccess: () => updateJobStatus(job.id, "success", (/* @__PURE__ */ new Date()).toISOString()),
        onFailure: () => updateJobStatus(job.id, "failed", (/* @__PURE__ */ new Date()).toISOString())
      })
    );
    yield* Ref12.update(runningJobsRef, (jobs) => {
      const newJobs = new Set(jobs);
      newJobs.delete(job.id);
      return newJobs;
    });
    return result;
  });
  const updateJobStatus = (jobId, status, runAt) => Effect57.gen(function* () {
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
  const stopJob = (jobId) => Effect57.gen(function* () {
    const fibers = yield* Ref12.get(fibersRef);
    const fiber = fibers.get(jobId);
    if (fiber !== void 0) {
      yield* Fiber.interrupt(fiber);
      yield* Ref12.update(fibersRef, (fibers2) => {
        const newFibers = new Map(fibers2);
        newFibers.delete(jobId);
        return newFibers;
      });
    }
  });
  const startScheduler = Effect57.gen(function* () {
    yield* initializeConfig;
    const config = yield* readConfig;
    for (const job of config.jobs) {
      if (job.enabled) {
        yield* startJob(job);
      }
    }
  });
  const stopScheduler = Effect57.gen(function* () {
    const fibers = yield* Ref12.get(fibersRef);
    for (const fiber of fibers.values()) {
      yield* Fiber.interrupt(fiber);
    }
    yield* Ref12.set(fibersRef, /* @__PURE__ */ new Map());
  });
  const getJobs = () => Effect57.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect57.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] })))
      })
    );
    return config.jobs;
  });
  const addJob = (newJob) => Effect57.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect57.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] })))
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
  const updateJob = (jobId, updates) => Effect57.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect57.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect57.fail(new SchedulerJobNotFoundError({ jobId }));
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
  const deleteJobFromConfig = (jobId) => Effect57.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect57.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect57.fail(new SchedulerJobNotFoundError({ jobId }));
    }
    const updatedConfig = {
      jobs: config.jobs.filter((j) => j.id !== jobId)
    };
    yield* writeConfig(updatedConfig);
  });
  const deleteJob = (jobId) => Effect57.gen(function* () {
    const config = yield* readConfig.pipe(
      Effect57.catchTags({
        ConfigFileNotFoundError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] }))),
        ConfigParseError: () => initializeConfig.pipe(Effect57.map(() => ({ jobs: [] })))
      })
    );
    const job = config.jobs.find((j) => j.id === jobId);
    if (job === void 0) {
      return yield* Effect57.fail(new SchedulerJobNotFoundError({ jobId }));
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
var SchedulerService = class extends Context43.Tag("SchedulerService")() {
  static {
    this.Live = Layer45.effect(this, LayerImpl33);
  }
};

// src/server/core/rate-limit/schema.ts
import { z as z28 } from "zod";
var RateLimitEntrySchema = z28.object({
  type: z28.literal("assistant"),
  error: z28.literal("rate_limit"),
  isApiErrorMessage: z28.literal(true),
  sessionId: z28.string(),
  message: z28.object({
    content: z28.array(
      z28.object({
        type: z28.literal("text"),
        text: z28.string()
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
import { FileSystem as FileSystem28 } from "@effect/platform";
import { Effect as Effect58 } from "effect";
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
var readLastLine = (filePath) => Effect58.gen(function* () {
  const fs = yield* FileSystem28.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return extractLastNonEmptyLine(content);
});

// src/server/core/rate-limit/services/RateLimitAutoScheduleService.ts
var LayerImpl34 = Effect59.gen(function* () {
  const eventBus = yield* EventBus;
  const userConfigService = yield* UserConfigService;
  const sessionProcessService = yield* ClaudeCodeSessionProcessService;
  const schedulerService = yield* SchedulerService;
  const fs = yield* FileSystem29.FileSystem;
  const pathService = yield* Path33.Path;
  const schedulerConfigBaseDir = yield* SchedulerConfigBaseDir;
  const projectRepository = yield* ProjectRepository;
  const lifeCycleService = yield* ClaudeCodeLifeCycleService;
  const listenerRef = yield* Ref13.make(null);
  const getSessionProcessProjectId = (sessionId) => Effect59.gen(function* () {
    const processes = yield* sessionProcessService.getSessionProcesses();
    const liveProcess = processes.find(
      (process2) => process2.sessionId === sessionId && (process2.type === "initialized" || process2.type === "file_created" || process2.type === "paused")
    );
    return liveProcess?.def.projectId;
  });
  const hasExistingReservedJobForSession = (sessionId) => Effect59.gen(function* () {
    const jobs = yield* schedulerService.getJobs().pipe(Effect59.catchAll(() => Effect59.succeed([])));
    return jobs.some(
      (job) => job.schedule.type === "reserved" && job.message.baseSessionId === sessionId && job.lastRunStatus === null
      // Not yet executed
    );
  });
  const handleSessionChanged = (event) => Effect59.gen(function* () {
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
      Effect59.catchAll(() => Effect59.succeed(""))
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
      Effect59.catchAll((error) => {
        console.error(
          `[RateLimitAutoScheduleService] Failed to add job for session ${sessionId}:`,
          error
        );
        return Effect59.void;
      })
    );
    console.log(
      `[RateLimitAutoScheduleService] Scheduled continue task for session ${sessionId} at ${resetTime}`
    );
  });
  const runtimeLayer = Layer46.mergeAll(
    Layer46.succeed(FileSystem29.FileSystem, fs),
    Layer46.succeed(Path33.Path, pathService),
    Layer46.succeed(SchedulerConfigBaseDir, schedulerConfigBaseDir),
    Layer46.succeed(ProjectRepository, projectRepository),
    Layer46.succeed(UserConfigService, userConfigService),
    Layer46.succeed(ClaudeCodeLifeCycleService, lifeCycleService)
  );
  const start = () => Effect59.gen(function* () {
    const existingListener = yield* Ref13.get(listenerRef);
    if (existingListener !== null) {
      return;
    }
    const listener = (event) => {
      Effect59.runFork(
        handleSessionChanged(event).pipe(Effect59.provide(runtimeLayer))
      );
    };
    yield* Ref13.set(listenerRef, listener);
    yield* eventBus.on("sessionChanged", listener);
    console.log("[RateLimitAutoScheduleService] Started");
  });
  const stop = () => Effect59.gen(function* () {
    const listener = yield* Ref13.get(listenerRef);
    if (listener !== null) {
      yield* eventBus.off("sessionChanged", listener);
      yield* Ref13.set(listenerRef, null);
    }
    console.log("[RateLimitAutoScheduleService] Stopped");
  });
  return {
    start,
    stop
  };
});
var RateLimitAutoScheduleService = class extends Context44.Tag(
  "RateLimitAutoScheduleService"
)() {
  static {
    this.Live = Layer46.effect(this, LayerImpl34);
  }
};

// src/server/core/scheduler/presentation/SchedulerController.ts
import { Context as Context45, Effect as Effect60, Layer as Layer47 } from "effect";
var LayerImpl35 = Effect60.gen(function* () {
  const schedulerService = yield* SchedulerService;
  const getJobs = () => Effect60.gen(function* () {
    const jobs = yield* schedulerService.getJobs();
    return {
      response: jobs,
      status: 200
    };
  });
  const addJob = (options) => Effect60.gen(function* () {
    const { job } = options;
    const result = yield* schedulerService.addJob(job);
    return {
      response: result,
      status: 201
    };
  });
  const updateJob = (options) => Effect60.gen(function* () {
    const { id, job } = options;
    const result = yield* schedulerService.updateJob(id, job).pipe(
      Effect60.catchTag(
        "SchedulerJobNotFoundError",
        () => Effect60.succeed(null)
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
  const deleteJob = (options) => Effect60.gen(function* () {
    const { id } = options;
    const result = yield* schedulerService.deleteJob(id).pipe(
      Effect60.catchTag(
        "SchedulerJobNotFoundError",
        () => Effect60.succeed(false)
      ),
      Effect60.map(() => true)
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
var SchedulerController = class extends Context45.Tag("SchedulerController")() {
  static {
    this.Live = Layer47.effect(this, LayerImpl35);
  }
};

// src/server/core/search/presentation/SearchController.ts
import { Context as Context47, Effect as Effect62, Layer as Layer49 } from "effect";

// src/server/core/search/services/SearchService.ts
import { FileSystem as FileSystem30, Path as Path34 } from "@effect/platform";
import { Context as Context46, Effect as Effect61, Layer as Layer48, Ref as Ref14 } from "effect";
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
var LayerImpl36 = Effect61.gen(function* () {
  const fs = yield* FileSystem30.FileSystem;
  const path5 = yield* Path34.Path;
  const context = yield* ApplicationContext;
  const indexCacheRef = yield* Ref14.make(null);
  const buildIndex = () => Effect61.gen(function* () {
    const { claudeProjectsDirPath } = yield* context.claudeCodePaths;
    const dirExists = yield* fs.exists(claudeProjectsDirPath);
    if (!dirExists) {
      return { index: createMiniSearchIndex(), documents: /* @__PURE__ */ new Map() };
    }
    const projectEntries = yield* fs.readDirectory(claudeProjectsDirPath);
    const miniSearch = createMiniSearchIndex();
    const documentEffects = projectEntries.map(
      (projectEntry) => Effect61.gen(function* () {
        const projectPath = path5.resolve(claudeProjectsDirPath, projectEntry);
        const stat = yield* fs.stat(projectPath).pipe(Effect61.catchAll(() => Effect61.succeed(null)));
        if (stat?.type !== "Directory") {
          return [];
        }
        const projectId = encodeProjectId(projectPath);
        const projectName = path5.basename(projectPath);
        const sessionEntries = yield* fs.readDirectory(projectPath).pipe(Effect61.catchAll(() => Effect61.succeed([])));
        const sessionFiles = sessionEntries.filter(isRegularSessionFile);
        const sessionDocuments = yield* Effect61.all(
          sessionFiles.map(
            (sessionFile) => Effect61.gen(function* () {
              const sessionPath = path5.resolve(projectPath, sessionFile);
              const sessionId = encodeSessionId(sessionPath);
              const content = yield* fs.readFileString(sessionPath).pipe(Effect61.catchAll(() => Effect61.succeed("")));
              if (!content) return [];
              const conversations = parseJsonl(content);
              const documents = [];
              for (let i = 0; i < conversations.length; i++) {
                const conversation = conversations[i];
                if (conversation === void 0) continue;
                if (conversation.type !== "user" && conversation.type !== "assistant") {
                  continue;
                }
                if (conversation.isSidechain === true) {
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
                  conversationUuid: conversation.uuid,
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
    const allDocuments = yield* Effect61.all(documentEffects, {
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
  const getIndex = () => Effect61.gen(function* () {
    const cached = yield* Ref14.get(indexCacheRef);
    const now = Date.now();
    if (cached && now - cached.builtAt < INDEX_TTL_MS) {
      return { index: cached.index, documents: cached.documents };
    }
    const { index, documents } = yield* buildIndex();
    yield* Ref14.set(indexCacheRef, { index, documents, builtAt: now });
    return { index, documents };
  });
  const search = (query3, limit = 20, projectId) => Effect61.gen(function* () {
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
        conversationUuid: doc.conversationUuid,
        type: doc.type,
        snippet,
        timestamp: doc.timestamp,
        score
      });
    }
    return { results };
  });
  const invalidateIndex = () => Ref14.set(indexCacheRef, null);
  return {
    search,
    invalidateIndex
  };
});
var SearchService = class extends Context46.Tag("SearchService")() {
  static {
    this.Live = Layer48.effect(this, LayerImpl36);
  }
};

// src/server/core/search/presentation/SearchController.ts
var LayerImpl37 = Effect62.gen(function* () {
  const searchService = yield* SearchService;
  const search = (options) => Effect62.gen(function* () {
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
var SearchController = class extends Context47.Tag("SearchController")() {
  static {
    this.Live = Layer49.effect(this, LayerImpl37);
  }
};

// src/server/core/session/presentation/SessionController.ts
import { FileSystem as FileSystem31 } from "@effect/platform";
import { Context as Context48, Effect as Effect64, Layer as Layer50 } from "effect";

// src/server/core/session/services/ExportService.ts
import { Effect as Effect63 } from "effect";
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
var formatNumber = (value) => value.toLocaleString("en-US");
var collectExportHeaderStats = (conversations) => {
  const modelCounts = /* @__PURE__ */ new Map();
  let inputTokens = 0;
  let outputTokens = 0;
  let assistantCount = 0;
  let assistantWithUsageCount = 0;
  for (const conv of conversations) {
    if (conv.type !== "assistant") continue;
    assistantCount += 1;
    const modelName = conv.message.model.trim();
    if (modelName.length > 0) {
      modelCounts.set(modelName, (modelCounts.get(modelName) ?? 0) + 1);
    }
    const usage = conv.message.usage;
    assistantWithUsageCount += 1;
    inputTokens += usage.input_tokens;
    outputTokens += usage.output_tokens;
  }
  const modelsUsed = modelCounts.size > 0 ? Array.from(modelCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  }).map(([model, count]) => `${model} (${count})`).join(", ") : "N/A";
  const projectPath = conversations.find(
    (conv) => "cwd" in conv && typeof conv.cwd === "string" && conv.cwd.trim().length > 0
  )?.cwd ?? null;
  const branch = conversations.find(
    (conv) => "gitBranch" in conv && typeof conv.gitBranch === "string" && conv.gitBranch.trim().length > 0
  )?.gitBranch ?? null;
  return {
    projectPath,
    branch,
    modelsUsed,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    tokenCoverage: `${assistantWithUsageCount}/${assistantCount} assistant responses`
  };
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
var isSubagentTool = (toolName) => toolName === "Task" || toolName === "Agent";
var hasAgentId = (toolUseResult) => {
  return typeof toolUseResult === "object" && toolUseResult !== null && "agentId" in toolUseResult && typeof toolUseResult.agentId === "string";
};
var buildSidechainData = (conversations) => {
  const sidechainConversations = conversations.filter(
    (conv) => conv.type !== "summary" && conv.type !== "file-history-snapshot" && conv.type !== "queue-operation" && conv.type !== "progress" && conv.type !== "last-prompt" && conv.isSidechain === true
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
    if (conv.type === "summary" || conv.type === "file-history-snapshot" || conv.type === "queue-operation" || conv.type === "progress" || conv.type === "last-prompt") {
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
        if (isSubagentTool(msg.name)) {
          return renderTaskTool(
            msg.id,
            msg.name,
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
var renderTaskTool = (toolId, toolName, input, toolResult, sidechainData, toolResultMap) => {
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
        <span class="task-tool-name">${escapeHtml(toolName)}${hasSidechain ? ` (${sidechainConversations.length} steps)` : ""}</span>
        <span class="task-prompt-preview">${escapeHtml(truncatedPrompt)}</span>
        <svg class="icon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="task-tool-content collapsible-content">
        <div class="task-tool-id"><strong>${escapeHtml(toolName)} ID:</strong> <code>${escapeHtml(toolId)}</code></div>
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
      if (isSubagentTool(msg.name)) {
        return renderTaskTool(
          msg.id,
          msg.name,
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
      if (isSubagentTool(msg.name)) {
        return renderTaskTool(
          msg.id,
          msg.name,
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
var generateSessionHtml = (session, projectId, agentSessionRepo) => Effect63.gen(function* () {
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
    if (conv.type !== "summary" && conv.type !== "file-history-snapshot" && conv.type !== "queue-operation" && conv.type !== "progress" && conv.type !== "last-prompt" && conv.isSidechain === true && conv.agentId !== void 0) {
      existingAgentIds.add(conv.agentId);
    }
  }
  const missingAgentIds = Array.from(agentIds).filter(
    (id) => !existingAgentIds.has(id)
  );
  const loadedConversations = [];
  if (missingAgentIds.length > 0) {
    const loadedSessions = yield* Effect63.all(
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
  const headerStats = collectExportHeaderStats(allConversations);
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
      <div><strong>Project Path:</strong> ${escapeHtml(headerStats.projectPath ?? "N/A")}</div>
      <div><strong>Branch:</strong> ${escapeHtml(headerStats.branch ?? "N/A")}</div>
      <div><strong>Models Used:</strong> ${escapeHtml(headerStats.modelsUsed)}</div>
      <div><strong>Input Tokens:</strong> ${formatNumber(headerStats.inputTokens)}</div>
      <div><strong>Output Tokens:</strong> ${formatNumber(headerStats.outputTokens)}</div>
      <div><strong>Total Tokens:</strong> ${formatNumber(headerStats.totalTokens)}</div>
      <div><strong>Token Data Coverage:</strong> ${escapeHtml(headerStats.tokenCoverage)}</div>
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
var LayerImpl38 = Effect64.gen(function* () {
  const sessionRepository = yield* SessionRepository;
  const agentSessionRepository = yield* AgentSessionRepository;
  const fs = yield* FileSystem31.FileSystem;
  const eventBus = yield* EventBus;
  const searchService = yield* SearchService;
  const getSession = (options) => Effect64.gen(function* () {
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
  const exportSessionHtml = (options) => Effect64.gen(function* () {
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
  const deleteSession = (options) => Effect64.gen(function* () {
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
      Effect64.map(() => ({ success: true, error: null })),
      Effect64.catchAll(
        (error) => Effect64.succeed({
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
    yield* searchService.invalidateIndex();
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
var SessionController = class extends Context48.Tag("SessionController")() {
  static {
    this.Live = Layer50.effect(this, LayerImpl38);
  }
};

// src/server/core/tasks/presentation/TasksController.ts
import { Context as Context50, Effect as Effect66, Layer as Layer52 } from "effect";

// src/server/core/tasks/services/TasksService.ts
import { FileSystem as FileSystem32, Path as Path35 } from "@effect/platform";
import { Context as Context49, Effect as Effect65, Layer as Layer51, Option as Option6 } from "effect";

// src/server/core/tasks/schema.ts
import { z as z29 } from "zod";
var TaskStatusSchema = z29.enum([
  "pending",
  "in_progress",
  "completed",
  "failed"
]);
var TaskSchema = z29.object({
  id: z29.string(),
  subject: z29.string(),
  description: z29.string().optional(),
  status: TaskStatusSchema,
  owner: z29.string().optional(),
  blocks: z29.array(z29.string()).optional(),
  blockedBy: z29.array(z29.string()).optional(),
  metadata: z29.record(z29.string(), z29.any()).optional(),
  activeForm: z29.string().optional()
});
var TaskCreateSchema = z29.object({
  subject: z29.string(),
  description: z29.string().optional(),
  activeForm: z29.string().optional(),
  metadata: z29.record(z29.string(), z29.any()).optional()
});
var TaskUpdateSchema = z29.object({
  taskId: z29.string(),
  status: TaskStatusSchema.optional(),
  subject: z29.string().optional(),
  description: z29.string().optional(),
  activeForm: z29.string().optional(),
  owner: z29.string().optional(),
  addBlockedBy: z29.array(z29.string()).optional(),
  addBlocks: z29.array(z29.string()).optional(),
  metadata: z29.record(z29.string(), z29.any()).optional()
});

// src/server/core/tasks/services/TasksService.ts
var TASKS_DIR_NAME = "tasks";
var PROJECTS_DIR_NAME = "projects";
var CLAUDE_DIR_NAME = ".claude";
var TasksService = class extends Context49.Tag("TasksService")() {
  static {
    this.Live = Layer51.effect(
      this,
      Effect65.gen(function* () {
        const fs = yield* FileSystem32.FileSystem;
        const path5 = yield* Path35.Path;
        const getClaudeDir = () => Effect65.succeed(path5.join(resolveHomeDirFromEnv(), CLAUDE_DIR_NAME));
        const normalizeProjectPath = (projectPath) => {
          return normalizeClaudeProjectPath(projectPath);
        };
        const resolveProjectUuid = (projectPath, specificSessionId) => Effect65.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          if (specificSessionId) {
            const sessionTasksDir = path5.join(
              claudeDir,
              TASKS_DIR_NAME,
              specificSessionId
            );
            if (yield* fs.exists(sessionTasksDir)) {
              return Option6.some(specificSessionId);
            }
            return Option6.none();
          }
          const isMetadataPath = projectPath.includes(
            path5.join(CLAUDE_DIR_NAME, PROJECTS_DIR_NAME)
          ) && projectPath.split(path5.sep).pop()?.startsWith("-");
          let projectMetaDir;
          if (isMetadataPath && (yield* fs.exists(projectPath))) {
            projectMetaDir = projectPath;
          } else {
            const identifier = normalizeProjectPath(projectPath);
            projectMetaDir = path5.join(
              claudeDir,
              PROJECTS_DIR_NAME,
              identifier
            );
          }
          const exists = yield* fs.exists(projectMetaDir);
          if (!exists) {
            return Option6.none();
          }
          const files = yield* fs.readDirectory(projectMetaDir);
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
          const candidates = files.filter((f) => uuidPattern.test(f));
          if (candidates.length === 0) {
            return Option6.none();
          }
          const candidateInfo = yield* Effect65.all(
            candidates.map(
              (file) => Effect65.gen(function* () {
                const fullPath = path5.join(projectMetaDir, file);
                const stat = yield* fs.stat(fullPath);
                const match = file.match(uuidPattern);
                const uuid = match ? match[0] : file;
                const tasksPath = path5.join(claudeDir, TASKS_DIR_NAME, uuid);
                const hasTasks = yield* fs.exists(tasksPath);
                return {
                  file,
                  uuid,
                  mtime: Option6.getOrElse(stat.mtime, () => /* @__PURE__ */ new Date(0)),
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
            return Option6.none();
          }
          return Option6.some(best.uuid);
        });
        const resolveProjectUuidOrFail = (projectPath, specificSessionId) => Effect65.gen(function* () {
          const uuidOption = yield* resolveProjectUuid(
            projectPath,
            specificSessionId
          );
          if (Option6.isNone(uuidOption)) {
            if (specificSessionId) {
              return yield* Effect65.fail(
                new Error(
                  `Requested session ${specificSessionId} has no tasks directory`
                )
              );
            }
            const claudeDir = yield* getClaudeDir();
            const identifier = normalizeProjectPath(projectPath);
            const projectMetaDir = path5.join(
              claudeDir,
              PROJECTS_DIR_NAME,
              identifier
            );
            return yield* Effect65.fail(
              new Error(
                `Project metadata directory not found or no UUID: ${projectMetaDir}`
              )
            );
          }
          return uuidOption.value;
        });
        const getTasksDir = (projectPath, specificSessionId) => Effect65.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          const uuidOption = yield* resolveProjectUuid(
            projectPath,
            specificSessionId
          );
          return Option6.map(
            uuidOption,
            (uuid) => path5.join(claudeDir, TASKS_DIR_NAME, uuid)
          );
        });
        const getTasksDirOrFail = (projectPath, specificSessionId) => Effect65.gen(function* () {
          const claudeDir = yield* getClaudeDir();
          const uuid = yield* resolveProjectUuidOrFail(
            projectPath,
            specificSessionId
          );
          return path5.join(claudeDir, TASKS_DIR_NAME, uuid);
        });
        const listTasks = (projectPath, specificSessionId) => Effect65.gen(function* () {
          if (!specificSessionId) {
            return [];
          }
          const tasksDirOption = yield* getTasksDir(
            projectPath,
            specificSessionId
          );
          if (Option6.isNone(tasksDirOption)) {
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
            const content = yield* fs.readFileString(path5.join(tasksDir, file));
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
        const getTask = (projectPath, taskId, specificSessionId) => Effect65.gen(function* () {
          const tasksDir = yield* getTasksDirOrFail(
            projectPath,
            specificSessionId
          );
          const taskFile = path5.join(tasksDir, `${taskId}.json`);
          const exists = yield* fs.exists(taskFile);
          if (!exists) {
            return yield* Effect65.fail(new Error(`Task ${taskId} not found`));
          }
          const content = yield* fs.readFileString(taskFile);
          const task = JSON.parse(content);
          return yield* Effect65.try(() => TaskSchema.parse(task));
        });
        const createTask = (projectPath, taskDef, specificSessionId) => Effect65.gen(function* () {
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
          const filePath = path5.join(tasksDir, `${newId}.json`);
          yield* fs.writeFileString(filePath, JSON.stringify(newTask, null, 2));
          return newTask;
        });
        const updateTask = (projectPath, update, specificSessionId) => Effect65.gen(function* () {
          const tasksDir = yield* getTasksDirOrFail(
            projectPath,
            specificSessionId
          );
          const filePath = path5.join(tasksDir, `${update.taskId}.json`);
          const exists = yield* fs.exists(filePath);
          if (!exists) {
            return yield* Effect65.fail(
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
var make2 = Effect66.gen(function* () {
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
var TasksController = class extends Context50.Tag("TasksController")() {
  static {
    this.Live = Layer52.effect(this, make2);
  }
};

// src/server/hono/app.ts
import { Hono } from "hono";
var honoApp = new Hono();

// src/server/hono/initialize.ts
import { Context as Context51, Effect as Effect67, Layer as Layer53, Ref as Ref15, Schedule as Schedule2 } from "effect";
var InitializeService = class extends Context51.Tag("InitializeService")() {
  static {
    this.Live = Layer53.effect(
      this,
      Effect67.gen(function* () {
        const eventBus = yield* EventBus;
        const fileWatcher = yield* FileWatcherService;
        const projectRepository = yield* ProjectRepository;
        const sessionRepository = yield* SessionRepository;
        const projectMetaService = yield* ProjectMetaService;
        const sessionMetaService = yield* SessionMetaService;
        const virtualConversationDatabase = yield* VirtualConversationDatabase;
        const sessionLiveDisplayService = yield* SessionLiveDisplayService;
        const rateLimitAutoScheduleService = yield* RateLimitAutoScheduleService;
        const searchService = yield* SearchService;
        const listenersRef = yield* Ref15.make({});
        const startInitialization = () => {
          return Effect67.gen(function* () {
            yield* fileWatcher.startWatching();
            yield* rateLimitAutoScheduleService.start();
            const daemon = Effect67.repeat(
              eventBus.emit("heartbeat", {}),
              Schedule2.fixed("10 seconds")
            );
            console.log("start heartbeat");
            yield* Effect67.forkDaemon(daemon);
            console.log("after starting heartbeat fork");
            const onSessionChanged = (event) => {
              Effect67.runSync(
                projectMetaService.invalidateProject(event.projectId)
              );
              Effect67.runSync(
                sessionMetaService.invalidateSession(
                  event.projectId,
                  event.sessionId
                )
              );
              Effect67.runSync(searchService.invalidateIndex());
              Effect67.runFork(
                Effect67.gen(function* () {
                  const liveDisplay = yield* sessionLiveDisplayService.getSessionLiveDisplay(
                    event.sessionId
                  );
                  if (liveDisplay === null) {
                    return;
                  }
                  const refreshedMeta = yield* sessionMetaService.getSessionMeta(event.projectId, event.sessionId).pipe(Effect67.catchAll(() => Effect67.succeed(null)));
                  if (refreshedMeta !== null && isSessionLiveDisplayCaughtUp({
                    meta: refreshedMeta,
                    liveDisplay
                  })) {
                    yield* sessionLiveDisplayService.deleteSessionLiveDisplay(
                      event.sessionId
                    );
                  }
                })
              );
            };
            const onSessionListChanged = () => {
              Effect67.runSync(searchService.invalidateIndex());
            };
            const onSessionProcessChanged = (event) => {
              if (event.changed.type === "completed" && event.changed.sessionId !== void 0) {
                Effect67.runFork(
                  virtualConversationDatabase.deleteVirtualConversations(
                    event.changed.sessionId
                  )
                );
                return;
              }
            };
            yield* Ref15.set(listenersRef, {
              sessionChanged: onSessionChanged,
              sessionListChanged: onSessionListChanged,
              sessionProcessChanged: onSessionProcessChanged
            });
            yield* eventBus.on("sessionChanged", onSessionChanged);
            yield* eventBus.on("sessionListChanged", onSessionListChanged);
            yield* eventBus.on("sessionProcessChanged", onSessionProcessChanged);
            yield* Effect67.gen(function* () {
              console.log("Initializing projects cache");
              const { projects } = yield* projectRepository.getProjects();
              console.log(`${projects.length} projects cache initialized`);
              console.log("Initializing sessions cache");
              const results = yield* Effect67.all(
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
              Effect67.catchAll(() => Effect67.void),
              Effect67.withSpan("initialize-cache")
            );
          }).pipe(Effect67.withSpan("start-initialization"));
        };
        const stopCleanup = () => Effect67.gen(function* () {
          const listeners = yield* Ref15.get(listenersRef);
          if (listeners.sessionChanged) {
            yield* eventBus.off("sessionChanged", listeners.sessionChanged);
          }
          if (listeners.sessionListChanged) {
            yield* eventBus.off(
              "sessionListChanged",
              listeners.sessionListChanged
            );
          }
          if (listeners.sessionProcessChanged) {
            yield* eventBus.off(
              "sessionProcessChanged",
              listeners.sessionProcessChanged
            );
          }
          yield* Ref15.set(listenersRef, {});
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
import { Context as Context52, Effect as Effect68, Layer as Layer54 } from "effect";
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
var LayerImpl39 = Effect68.gen(function* () {
  const ccvOptionsService = yield* CcvOptionsService;
  return Effect68.gen(function* () {
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
var AuthMiddleware = class extends Context52.Tag("AuthMiddleware")() {
  static {
    this.Live = Layer54.effect(this, LayerImpl39);
  }
};

// src/server/hono/route.ts
import { zValidator } from "@hono/zod-validator";
import { Effect as Effect70, Runtime as Runtime3 } from "effect";
import { deleteCookie, getCookie as getCookie3, setCookie as setCookie2 } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import prexit from "prexit";
import { z as z34 } from "zod";

// src/server/core/claude-code/schema.ts
import { z as z30 } from "zod";
var mediaTypeSchema = z30.enum([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp"
]);
var imageBlockSchema = z30.object({
  type: z30.literal("image"),
  source: z30.object({
    type: z30.literal("base64"),
    media_type: mediaTypeSchema,
    data: z30.string()
  })
});
var documentBlockSchema = z30.object({
  type: z30.literal("document"),
  source: z30.union([
    z30.object({
      type: z30.literal("text"),
      media_type: z30.enum(["text/plain"]),
      data: z30.string()
    }),
    z30.object({
      type: z30.literal("base64"),
      media_type: z30.enum(["application/pdf"]),
      data: z30.string()
    })
  ])
});
var userMessageInputSchema = z30.object({
  text: z30.string().min(1),
  images: z30.array(imageBlockSchema).optional(),
  documents: z30.array(documentBlockSchema).optional()
});

// src/server/core/git/schema.ts
import { z as z31 } from "zod";
var CommitRequestSchema = z31.object({
  projectId: z31.string().min(1),
  files: z31.array(z31.string().min(1)).min(1),
  message: z31.string().trim().min(1)
});
var PushRequestSchema = z31.object({
  projectId: z31.string().min(1)
});
var CommitResultSuccessSchema = z31.object({
  success: z31.literal(true),
  commitSha: z31.string().length(40),
  filesCommitted: z31.number().int().positive(),
  message: z31.string()
});
var CommitResultErrorSchema = z31.object({
  success: z31.literal(false),
  error: z31.string(),
  errorCode: z31.enum([
    "EMPTY_MESSAGE",
    "NO_FILES",
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "HOOK_FAILED",
    "GIT_COMMAND_ERROR"
  ]),
  details: z31.string().optional()
});
var CommitResultSchema = z31.discriminatedUnion("success", [
  CommitResultSuccessSchema,
  CommitResultErrorSchema
]);
var PushResultSuccessSchema = z31.object({
  success: z31.literal(true),
  remote: z31.string(),
  branch: z31.string(),
  objectsPushed: z31.number().int().optional()
});
var PushResultErrorSchema = z31.object({
  success: z31.literal(false),
  error: z31.string(),
  errorCode: z31.enum([
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "NO_UPSTREAM",
    "NON_FAST_FORWARD",
    "AUTH_FAILED",
    "NETWORK_ERROR",
    "TIMEOUT",
    "GIT_COMMAND_ERROR"
  ]),
  details: z31.string().optional()
});
var PushResultSchema = z31.discriminatedUnion("success", [
  PushResultSuccessSchema,
  PushResultErrorSchema
]);
var CommitAndPushResultSuccessSchema = z31.object({
  success: z31.literal(true),
  commitSha: z31.string().length(40),
  filesCommitted: z31.number().int().positive(),
  message: z31.string(),
  remote: z31.string(),
  branch: z31.string()
});
var CommitAndPushResultErrorSchema = z31.object({
  success: z31.literal(false),
  commitSucceeded: z31.boolean(),
  commitSha: z31.string().length(40).optional(),
  error: z31.string(),
  errorCode: z31.enum([
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
  details: z31.string().optional()
});
var CommitAndPushResultSchema = z31.discriminatedUnion("success", [
  CommitAndPushResultSuccessSchema,
  CommitAndPushResultErrorSchema
]);

// src/server/lib/config/config.ts
import z33 from "zod";

// src/lib/i18n/schema.ts
import z32 from "zod";
var localeSchema = z32.enum(["en", "zh_CN"]);

// src/server/lib/config/config.ts
var userConfigSchema = z33.object({
  hideNoUserMessageSession: z33.boolean().optional().default(true),
  unifySameTitleSession: z33.boolean().optional().default(false),
  enterKeyBehavior: z33.enum(["shift-enter-send", "enter-send", "command-enter-send"]).optional().default("shift-enter-send"),
  claudeCodeExecutablePath: z33.string().optional(),
  permissionMode: z33.enum(["acceptEdits", "bypassPermissions", "default", "plan"]).optional().default("default"),
  locale: localeSchema.optional().default("en"),
  theme: z33.enum(["light", "dark", "system"]).optional().default("system"),
  searchHotkey: z33.enum(["ctrl-k", "command-k"]).optional().default("command-k"),
  autoScheduleContinueOnRateLimit: z33.boolean().optional().default(false)
});
var defaultUserConfig = userConfigSchema.parse({});

// src/server/lib/effect/toEffectResponse.ts
import { Effect as Effect69 } from "effect";
var effectToResponse = async (ctx, effect) => {
  const result = await Effect69.runPromise(effect);
  const toResponse = (status, response) => ctx.json(response, status);
  return toResponse(result.status, result.response);
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
var routes = (app, options) => Effect70.gen(function* () {
  const ccvOptionsService = yield* CcvOptionsService;
  yield* ccvOptionsService.loadCliOptions(options);
  const envService = yield* EnvService;
  const userConfigService = yield* UserConfigService;
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
  const feishuController = yield* FeishuController;
  const d2cPreviewController = yield* D2CPreviewController;
  const authMiddlewareService = yield* AuthMiddleware;
  const { authMiddleware, validSessionToken, authEnabled, anthPassword } = yield* authMiddlewareService;
  const runtime = yield* Effect70.runtime();
  if ((yield* envService.getEnv("NEXT_PHASE")) !== "phase-production-build") {
    yield* initializeService.startInitialization();
    prexit(async () => {
      await Runtime3.runPromise(runtime)(initializeService.stopCleanup());
    });
  }
  return app.use(configMiddleware).use(authMiddleware).use(async (c, next) => {
    await Effect70.runPromise(
      userConfigService.setUserConfig({
        ...c.get("userConfig")
      })
    );
    await next();
  }).post(
    "/api/auth/login",
    zValidator("json", z34.object({ password: z34.string() })),
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
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/archive", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getArchivedChangesRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/d2c/preview",
    zValidator(
      "json",
      z34.object({
        action: z34.enum([
          "list",
          "check-status",
          "check-project",
          "ensure-running",
          "sync",
          "trigger-rebuild"
        ]),
        changeId: z34.string().optional(),
        artifactId: z34.string().optional()
      })
    ),
    async (c) => {
      const { action, changeId, artifactId } = c.req.valid("json");
      const response = await effectToResponse(
        c,
        d2cPreviewController.previewRoute({
          projectId: c.req.param("projectId"),
          action,
          changeId,
          artifactId
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/changes/:changeId/file",
    zValidator(
      "json",
      z34.object({
        fileName: z34.string(),
        content: z34.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.updateFileRoute({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/openspec/environment", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getEnvironmentRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/profile-config", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getProjectProfileRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/openspec/profiles", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.getProfilesRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).post(
    "/api/projects/:projectId/openspec/initialize",
    zValidator(
      "json",
      z34.object({
        scenario: z34.enum([
          "S1_NEW",
          "S2_OPENSPEC_ONLY",
          "S3_CLAUDE_ONLY",
          "S4_BOTH_NON_SPECFORGE",
          "S5_CONFIGURED",
          "S6_PARTIAL"
        ]),
        force: z34.boolean().optional(),
        isConfigCorrupted: z34.boolean().optional(),
        profile: z34.object({
          displayName: z34.string(),
          infra_catalog: z34.object({
            mcp_server_providers: z34.record(
              z34.string(),
              z34.object({
                type: z34.enum(["http", "sse", "stdio"]),
                url: z34.string().optional(),
                command: z34.string().optional(),
                args: z34.array(z34.string()).optional()
              })
            ),
            mcp_tool_definitions: z34.object({
              overview: z34.object({
                description: z34.string(),
                tools: z34.array(z34.string())
              }),
              search: z34.object({
                description: z34.string(),
                tools: z34.array(z34.string())
              }),
              specifications: z34.object({
                description: z34.string(),
                tools: z34.array(z34.string())
              })
            }),
            skills: z34.array(z34.string()).optional(),
            develop_skills: z34.object({
              description: z34.string(),
              gitUrl: z34.string().optional(),
              skills: z34.array(z34.string())
            }).optional(),
            code_examples: z34.object({
              examples: z34.array(
                z34.object({
                  name: z34.string(),
                  description: z34.string().optional(),
                  paths: z34.array(z34.string())
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
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/install-cli/global",
    zValidator(
      "json",
      z34.object({
        initialize: z34.boolean().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.installCliGlobalRoute({
          projectId: c.req.param("projectId"),
          initialize: c.req.valid("json").initialize
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects/:projectId/openspec/install-cli/project",
    zValidator(
      "json",
      z34.object({
        initialize: z34.boolean().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        openSpecController.installCliProjectRoute({
          projectId: c.req.param("projectId"),
          initialize: c.req.valid("json").initialize
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post("/api/projects/:projectId/openspec/run-init", async (c) => {
    const response = await effectToResponse(
      c,
      openSpecController.runOpenspecInitRoute({
        projectId: c.req.param("projectId")
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).post(
    "/api/feishu/download",
    zValidator(
      "json",
      z34.object({
        projectId: z34.string(),
        larkDoc: z34.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        feishuController.downloadDoc(c.req.valid("json")).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/config", async (c) => {
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
    zValidator("query", z34.object({ cursor: z34.string().optional() })),
    async (c) => {
      const response = await effectToResponse(
        c,
        projectController.getProject({
          ...c.req.param(),
          ...c.req.valid("query")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/projects",
    zValidator(
      "json",
      z34.object({
        projectPath: z34.string().min(1, "Project path is required")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        projectController.createProject({
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/workspaces",
    zValidator(
      "json",
      z34.object({
        parentPath: z34.string().min(1, "Parent path is required"),
        workspaceName: z34.string().min(1, "Workspace name is required").regex(
          /^[^\\/:*?"<>|]+$/,
          "Workspace name contains invalid characters"
        ).refine(
          (name) => !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(name),
          "Workspace name is a reserved system name"
        ),
        additionalDirectories: z34.array(z34.string())
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        projectController.createWorkspace({
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post("/api/projects/:projectId/repair-path", async (c) => {
    const response = await effectToResponse(
      c,
      projectController.repairProjectPath({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/latest-session", async (c) => {
    const response = await effectToResponse(
      c,
      projectController.getProjectLatestSession({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/sessions/:sessionId", async (c) => {
    const response = await effectToResponse(
      c,
      sessionController.getSession({ ...c.req.param() }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/sessions/:sessionId/export",
    async (c) => {
      const response = await effectToResponse(
        c,
        sessionController.exportSessionHtml({ ...c.req.param() }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).delete("/api/projects/:projectId/sessions/:sessionId", async (c) => {
    const response = await effectToResponse(
      c,
      sessionController.deleteSession({ ...c.req.param() }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/agent-sessions/:agentId",
    zValidator("query", z34.object({ sessionId: z34.string().optional() })),
    async (c) => {
      const { projectId, agentId } = c.req.param();
      const { sessionId } = c.req.valid("query");
      const response = await effectToResponse(
        c,
        agentSessionController.getAgentSession({
          projectId,
          agentId,
          sessionId
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/git/current-revisions", async (c) => {
    const response = await effectToResponse(
      c,
      gitController.getCurrentRevisions({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).post(
    "/api/projects/:projectId/git/diff",
    zValidator(
      "json",
      z34.object({
        fromRef: z34.string().min(1, "fromRef is required"),
        toRef: z34.string().min(1, "toRef is required")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        gitController.getGitDiff({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/projects/:projectId/claude-commands", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getClaudeCommands({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/mcp/list", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getMcpListRoute({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/projects/:projectId/mcp/config", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getMcpConfigRoute({
        ...c.req.param()
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).put(
    "/api/projects/:projectId/mcp/config",
    zValidator(
      "json",
      z34.object({
        content: z34.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeController.saveMcpConfigRoute({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/cc/meta", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getClaudeCodeMeta().pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/cc/features", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getAvailableFeatures().pipe(Effect70.provide(runtime))
    );
    return response;
  }).get("/api/cc/models", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeController.getAdaModels().pipe(Effect70.provide(runtime))
    );
    return response;
  }).post(
    "/api/cc/models/switch",
    zValidator(
      "json",
      z34.object({
        targetIndex: z34.number().int().nonnegative()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeController.switchAdaModel(c.req.valid("json")).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/cc/session-processes", async (c) => {
    const response = await effectToResponse(
      c,
      claudeCodeSessionProcessController.getSessionProcesses()
    );
    return response;
  }).post(
    "/api/cc/session-processes",
    zValidator(
      "json",
      z34.object({
        projectId: z34.string(),
        input: userMessageInputSchema,
        baseSessionId: z34.string().optional()
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
      z34.object({
        projectId: z34.string(),
        input: userMessageInputSchema,
        baseSessionId: z34.string()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeSessionProcessController.continueSessionProcess({
          ...c.req.param(),
          ...c.req.valid("json")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).post(
    "/api/cc/session-processes/:sessionProcessId/abort",
    zValidator("json", z34.object({ projectId: z34.string() })),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodeSessionProcessController.abortSessionProcess({
          ...c.req.param(),
          ...c.req.valid("json")
        })
      );
      return response;
    }
  ).get(
    "/api/cc/permission-requests/pending",
    zValidator(
      "query",
      z34.object({
        sessionId: z34.string().optional(),
        taskId: z34.string().optional(),
        sessionProcessId: z34.string().optional()
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        claudeCodePermissionController.pendingPermissionRequests(
          c.req.valid("query")
        )
      );
      return response;
    }
  ).post(
    "/api/cc/permission-response",
    zValidator(
      "json",
      z34.object({
        permissionRequestId: z34.string(),
        decision: z34.enum(["allow", "deny"]),
        updatedInput: z34.record(z34.string(), z34.unknown()).optional()
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
          sseController.handleSSE(rawStream).pipe(Effect70.provide(TypeSafeSSE.make(rawStream)))
        );
      },
      async (err) => {
        console.error("Streaming error:", err);
      }
    );
  }).get("/api/scheduler/jobs", async (c) => {
    const response = await effectToResponse(
      c,
      schedulerController.getJobs().pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
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
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).delete("/api/scheduler/jobs/:id", async (c) => {
    const response = await effectToResponse(
      c,
      schedulerController.deleteJob({
        id: c.req.param("id")
      }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get(
    "/api/fs/file-completion",
    zValidator(
      "query",
      z34.object({
        projectId: z34.string(),
        basePath: z34.string().optional().default("/api/")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        fileSystemController.getFileCompletionRoute({
          ...c.req.valid("query")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get(
    "/api/fs/directory-browser",
    zValidator(
      "query",
      z34.object({
        currentPath: z34.string().optional(),
        showHidden: z34.string().optional().transform((val) => val === "true")
      })
    ),
    async (c) => {
      const response = await effectToResponse(
        c,
        fileSystemController.getDirectoryListingRoute({
          ...c.req.valid("query")
        }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get(
    "/api/search",
    zValidator(
      "query",
      z34.object({
        q: z34.string().min(2),
        limit: z34.string().optional().transform((val) => val ? parseInt(val, 10) : void 0),
        projectId: z34.string().optional()
      })
    ),
    async (c) => {
      const { q, limit, projectId } = c.req.valid("query");
      const response = await effectToResponse(
        c,
        searchController.search({ query: q, limit, projectId }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  ).get("/api/flags", async (c) => {
    const response = await effectToResponse(
      c,
      featureFlagController.getFlags().pipe(Effect70.provide(runtime))
    );
    return response;
  }).get(
    "/api/tasks",
    zValidator(
      "query",
      z34.object({
        projectId: z34.string(),
        sessionId: z34.string().optional()
      })
    ),
    async (c) => {
      const { projectId, sessionId } = c.req.valid("query");
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        tasksController.listTasks(projectPath, sessionId).pipe(
          Effect70.map((tasks) => ({
            status: 200,
            response: tasks
          })),
          Effect70.provide(runtime)
        )
      );
      return response;
    }
  ).post(
    "/api/tasks",
    zValidator(
      "query",
      z34.object({
        projectId: z34.string(),
        sessionId: z34.string().optional()
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
          Effect70.map((task) => ({
            status: 200,
            response: task
          })),
          Effect70.provide(runtime)
        )
      );
      return response;
    }
  ).patch(
    "/api/tasks/:id",
    zValidator(
      "query",
      z34.object({
        projectId: z34.string(),
        sessionId: z34.string().optional()
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
          Effect70.map((task) => ({
            status: 200,
            response: task
          })),
          Effect70.provide(runtime)
        )
      );
      return response;
    }
  ).get("/api/projects/:projectId/openspec/changes", async (c) => {
    const { projectId } = c.req.param();
    const projectPath = decodeProjectId(projectId);
    const response = await effectToResponse(
      c,
      openSpecController.getChangesRoute({ projectId: projectPath }).pipe(Effect70.provide(runtime))
    );
    return response;
  }).get(
    "/api/projects/:projectId/openspec/changes/:changeId",
    async (c) => {
      const { projectId, changeId } = c.req.param();
      const projectPath = decodeProjectId(projectId);
      const response = await effectToResponse(
        c,
        openSpecController.getChangeDetailsRoute({ projectId: projectPath, changeId }).pipe(Effect70.provide(runtime))
      );
      return response;
    }
  );
});

// src/server/lib/effect/layers.ts
import { NodeContext as NodeContext2 } from "@effect/platform-node";
import { Layer as Layer55 } from "effect";
var platformLayer = Layer55.mergeAll(
  ApplicationContext.Live,
  UserConfigService.Live,
  EventBus.Live,
  EnvService.Live,
  CcvOptionsService.Live
).pipe(
  Layer55.provide(EnvService.Live),
  Layer55.provide(CcvOptionsService.Live),
  Layer55.provide(NodeContext2.layer)
);

// src/server/startServer.ts
var startServer = async (options) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  if (!isDevelopment) {
    const { staticPath, indexHtmlPath } = await Effect71.runPromise(
      Effect71.gen(function* () {
        const path5 = yield* Path36.Path;
        const resolvedStaticPath = path5.resolve(import.meta.dirname, "static");
        return {
          staticPath: resolvedStaticPath,
          indexHtmlPath: path5.resolve(resolvedStaticPath, "index.html")
        };
      }).pipe(Effect71.provide(PlatformLayer))
    );
    console.log("Serving static files from ", staticPath);
    const readIndexHtml = () => Effect71.runPromise(
      Effect71.gen(function* () {
        const fs = yield* FileSystem33.FileSystem;
        return yield* fs.readFileString(indexHtmlPath);
      }).pipe(Effect71.provide(PlatformLayer))
    );
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
      const html = await readIndexHtml();
      return c.html(html);
    });
  }
  const program2 = routes(honoApp, options).pipe(Effect71.provide(MainLayer));
  await Effect71.runPromise(program2);
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
var PlatformLayer = Layer56.mergeAll(platformLayer, NodeContext3.layer);
var InfraBasics = Layer56.mergeAll(
  VirtualConversationDatabase.Live,
  SessionLiveDisplayService.Live,
  ProjectMetaService.Live,
  SessionMetaService.Live
);
var InfraRepos = Layer56.mergeAll(
  ProjectRepository.Live,
  SessionRepository.Live
).pipe(Layer56.provideMerge(InfraBasics));
var InfraLayer = AgentSessionLayer.pipe(Layer56.provideMerge(InfraRepos));
var DomainBase = Layer56.mergeAll(
  AdaModelService.Live,
  ClaudeCodePermissionService.Live,
  ClaudeCodeSessionProcessService.Live,
  ClaudeCodeService.Live,
  D2CPreviewService.Live,
  GitService.Live,
  SchedulerService.Live,
  SchedulerConfigBaseDir.Live,
  SearchService.Live,
  TasksService.Live,
  OpenSpecService.Live
);
var OpenSpecEnvBase = Layer56.mergeAll(
  OpenSpecEnvironmentService.Live,
  ProfileConfigService.Live,
  TemplateProcessor.Live,
  SkillManagerService.Live
);
var OpenSpecEnvLayer = TemplateInjectionService.Live.pipe(
  Layer56.provideMerge(OpenSpecEnvBase)
);
var DomainLayer = ClaudeCodeLifeCycleService.Live.pipe(
  Layer56.provideMerge(DomainBase),
  Layer56.provideMerge(OpenSpecEnvLayer),
  Layer56.provideMerge(CliDetectionServiceLive)
);
var AppServices = Layer56.mergeAll(
  FileWatcherService.Live,
  RateLimitAutoScheduleService.Live,
  AuthMiddleware.Live
);
var ApplicationLayer = InitializeService.Live.pipe(
  Layer56.provideMerge(AppServices)
);
var PresentationLayer = Layer56.mergeAll(
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
  FeishuController.Live,
  D2CPreviewController.Live
);
var MainLayer = PresentationLayer.pipe(
  Layer56.provideMerge(ApplicationLayer),
  Layer56.provideMerge(DomainLayer),
  Layer56.provideMerge(InfraLayer),
  Layer56.provideMerge(PlatformLayer)
);

// src/server/main.ts
var program = new Command9();
program.name(package_default.name).version(package_default.version).description(package_default.description);
program.option("-p, --port <port>", "port to listen on").option("-h, --hostname <hostname>", "hostname to listen on").option("-P, --password <password>", "password to authenticate").option("-e, --executable <executable>", "path to claude code executable").option("--claude-dir <claude-dir>", "path to claude directory").action(async (options) => {
  await Effect72.runPromise(checkDeprecatedEnvs);
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
