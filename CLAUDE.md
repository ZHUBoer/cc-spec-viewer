# CLAUDE.md

## Critical Rules (Read First)

**Communication**:
- Always communicate with users in Chinese-simplified
- Code, comments, and commit messages should be in Chinese-simplified
- This document is in Chinese-simplified for context efficiency

**NEVER**:
- Use `as` type casting in ANY context including test code (explain the problem to the user instead)
- Use raw `fetch` or bypass TanStack Query for API calls
- Run `pnpm dev` or `pnpm start` (dev servers)
- Use `node:fs`, `node:path`, etc. directly (use Effect-TS equivalents)

**ALWAYS**:
- Use Effect-TS for all backend side effects
- Use Hono RPC + TanStack Query for all API calls
- Follow TDD: write tests first, then implement
- Run `pnpm typecheck` and `pnpm fix` before committing

## Environment Variables

**Core Configuration**:
- `PORT` - Server port (default: 3000)
- `HOSTNAME` - Listen hostname (default: localhost)
- `CCV_PASSWORD` - Authentication password (optional)
- `CCV_CC_EXECUTABLE_PATH` - Claude Code binary path (auto-detected if omitted)
- `CCV_GLOBAL_CLAUDE_DIR` - Claude directory (default: ~/.claude)

**API Configuration** (required for creating new sessions):
- `ANTHROPIC_API_KEY` - Anthropic API key (required)
- `ANTHROPIC_AUTH_TOKEN` - Custom proxy auth token (optional)
- `ANTHROPIC_BASE_URL` - Custom API endpoint (optional)

**Docker Deployment**:
See `docker-compose.yml` for volume mounts and environment setup.

## Project Overview

SpecForge 是一个完整的 Spec Coding 工具链，包含两个核心部分：

1. **Web 客户端**：全功能的 Claude Code 会话查看器和交互界面
2. **项目模板系统**：OpenSpec 1.0 兼容的规范驱动开发模板（`template-to-project/`）

**双重身份**：
- 作为 **CLI 工具**：`npx @ctrip/spec-forge` 启动 Web 服务器
- 作为 **项目模板**：新项目初始化时，复制 `template-to-project/` 到用户项目根目录

**Core Architecture**:
- Frontend: Vite + TanStack Router + React 19 + TanStack Query
- Backend: Hono (standalone server) + Effect-TS (all business logic)
- Data: Direct JSONL reads with strict Zod validation
- Real-time: Server-Sent Events (SSE) for live updates
- OpenSpec: 规范管理、状态推断、工作流集成

## Development Workflow

### Quality Checks

```bash
# Type checking (mandatory before commits)
pnpm typecheck

# Auto-fix linting and formatting (Biome)
pnpm fix
```

After `pnpm fix`, manually address any remaining issues.

### Testing

```bash
# Run all unit tests
pnpm test

# Run single test file
pnpm test <file-path>
# Example: pnpm test src/server/core/session/session.test.ts

# Watch mode for development
pnpm test:watch

# E2E tests (full suite)
pnpm e2e

# E2E - start test server only
pnpm e2e:start-server

# E2E - capture visual snapshots
pnpm e2e:capture-snapshots
```

**TDD Workflow**: Write tests → Run tests → Implement → Verify → Quality checks

### Building and Publishing

```bash
# Build for production (frontend + backend)
pnpm build

# Build frontend only (Vite)
pnpm build:frontend

# Build backend only (esbuild)
pnpm build:backend

# Start production server
pnpm start
```

**Build Output**:
- `dist/main.js` - Backend entry (bundled with esbuild)
- `dist/static/` - Frontend assets (built with Vite)
- `dist/template-to-project/` - Copied project template

### Internationalization (i18n)

```bash
# Extract translatable strings
pnpm lingui:extract

# Compile translations for runtime
pnpm lingui:compile
```

**Tech Stack**: @lingui/react with JSON format

## Key Directory Patterns

- `src/server/hono/route.ts` - Hono API routes definition (all routes defined here)
- `src/server/core/` - Effect-TS business logic (domain modules: session, project, git, etc.)
  - `agent-session/` - Claude Code agent session management
  - `claude-code/` - Claude Code process control and IPC
  - `events/` - Server-Sent Events infrastructure
  - `file-system/` - File I/O operations (Effect wrapper)
  - `git/` - Git operations (status, diff, commit, push)
  - `openspec/` - OpenSpec parsing and state inference
  - `project/` - Project discovery and management
  - `scheduler/` - Background task scheduling
  - `search/` - Full-text search (MiniSearch)
  - `session/` - JSONL session log parsing
- `src/lib/conversation-schema/` - Zod schemas for JSONL validation
- `src/testing/layers/` - Reusable Effect test layers (`testPlatformLayer` is the foundation)
- `src/routes/` - TanStack Router routes
- `template-to-project/` - **Project initialization template**
  - `.claude/agents/` - Custom Claude Code agents
  - `.claude/skills/` - Custom skills (design-generation, task-planning, etc.)
  - `openspec/schemas/` - OpenSpec schema definitions (specforge-enhanced)
  - `openspec/schemas/*/templates/` - Document templates (proposal.md, design.md, tasks.md)
  - `profiles/` - Configuration profiles (.mcp.template.json)

## Coding Standards

### Backend: Effect-TS

**Prioritize Pure Functions**:
- Extract logic into pure, testable functions whenever possible
- Pure functions are easier to test, reason about, and maintain
- Only use Effect-TS when side effects or state management is required

**Use Effect-TS for Side Effects and State**:
- Mandatory for I/O operations, async code, and stateful logic
- Avoid class-based implementations or mutable variables for state
- Use Effect-TS's functional patterns for state management
- Reference: https://effect.website/llms.txt

**Testing with Layers**:
```typescript
import { expect, test } from "vitest"
import { Effect } from "effect"
import { testPlatformLayer } from "@/testing/layers"
import { yourEffect } from "./your-module"

test("example", async () => {
  const result = await Effect.runPromise(
    yourEffect.pipe(Effect.provide(testPlatformLayer))
  )
  expect(result).toBe(expectedValue)
})
```

**Avoid Node.js Built-ins**:
- Use `FileSystem.FileSystem` instead of `node:fs`
- Use `Path.Path` instead of `node:path`
- Use `Command.string` instead of `child_process`

This enables dependency injection and proper testing.

**Type Safety - NO `as` Casting**:
- `as` casting is **strictly prohibited**
- If types seem unsolvable without `as`, explain the problem to the user and ask for guidance
- Valid alternatives: type guards, assertion functions, Zod schema validation

### Frontend: API Access

**Hono RPC + TanStack Query Only**:
```typescript
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

const { data } = useQuery({
  queryKey: ["example"],
  queryFn: () => api.endpoint.$get().then(res => res.json())
})
```

Raw `fetch` and direct requests are prohibited.

### Tech Standards

- **Linter/Formatter**: Biome (not ESLint/Prettier)
- **Type Config**: `@tsconfig/strictest`
- **Path Alias**: `@/*` maps to `./src/*`

## Architecture Details

### SSE (Server-Sent Events)

**When to Use SSE**:
- Delivering session log updates to frontend
- Notifying clients of background process state changes
- **Never** for request-response patterns (use Hono RPC instead)

**Implementation**:
- Server: `/api/sse` endpoint with type-safe events (`TypeSafeSSE`)
- Client: `useServerEventListener` hook for subscriptions

### Data Layer

- **Single Source of Truth**: `~/.claude/projects/*.jsonl`
- **Cache**: `~/.spec-forge-viewer/` (invalidated via SSE when source changes)
- **Validation**: Strict Zod schemas ensure every field is captured

### Session Process Management

Claude Code processes remain alive in the background (unless aborted), allowing session continuation without changing session-id.

### OpenSpec Integration

**Automatic State Inference**:
- Change state is inferred from file contents (not metadata)
- Detects task completion (`- [x]` in tasks.md)
- Recognizes confirmation markers (`<!-- TASKS_CONFIRMED: true -->`)
- Identifies design finalization (`<!-- DESIGN_FINAL_CONFIRMATION: true -->`)

**Workflow States**:
```
draft → designing → design-confirmed → task-planning → implementing → completed → archived
```

**Schema System**:
- Default schema: `specforge-enhanced` (defined in `template-to-project/openspec/schemas/`)
- Each schema provides templates (proposal.md, design.md, tasks.md)
- Custom validation rules per artifact type
- Format compliance enforcement via agents

**Directory Structure**:
```
openspec/
├── changes/           # Active changes (工作区)
│   └── <change-id>/
│       ├── proposal.md
│       ├── design.md
│       └── tasks.md
├── archive/           # Completed changes
└── specs/            # Truth source (当前系统规范)
```

## Development Tips

1. **Session Logs**: Examine `~/.claude/projects/` JSONL files to understand data structures
2. **Mock Data**: `mock-global-claude-dir/` contains E2E test mocks (useful reference for schema examples)
3. **Effect-TS Help**: https://effect.website/llms.txt

## Template System (template-to-project/)

**Purpose**: Provides a complete Spec Coding setup that gets copied to new projects

**Key Components**:
- **Claude Code Agents**: `format-compliance-agent`, `quality-gate-agent` (in `.claude/agents/`)
- **Custom Skills**: `design-generation`, `task-planning`, `querying-infra-catalog` (in `.claude/skills/`)
- **OpenSpec Configuration**: Schema definitions, templates, validation rules
- **Profile Templates**: MCP server configs, environment templates

**Usage in Development**:
- When modifying templates, update both `template-to-project/` (source) and `dist/template-to-project/` (will be rebuilt)
- Template changes affect new project initialization, not existing projects
- Test template changes with `pnpm build` → `pnpm start` → create new project in UI

**Design Generation Workflow** (via `design-generation` skill):
1. **Phase 1**: Fact collection (MCP queries, contract fetching)
2. **Phase 2**: Q&A with user (technical questions, architecture decisions)
3. **Phase 3**: Flow diagram confirmation (Mermaid-validated)
4. **Phase 4**: Document generation (pure solution, no pending questions)

Each phase uses TaskCreate/TaskUpdate for progress tracking.
