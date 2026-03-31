# CLAUDE.md

## Critical Rules (Read First)

**Communication**:
- Always communicate with users in Chinese-simplified
- Code, comments, and commit messages should be in Chinese-simplified
- 本文档以中文简体为主，允许必要英文术语（命令、库名、类型名）

**NEVER**:
- Use `as` type casting in ANY context including test code (explain the problem to the user instead)
- Use raw `fetch` or bypass TanStack Query for API calls
- Run `pnpm dev` or `pnpm start` (dev servers)
- Use `node:fs`, `node:path`, etc. directly in production runtime code (use Effect-TS equivalents)
- Fallback to `"."` when resolving home directory in runtime config/cache paths
- Use `String(error)` directly for command/runtime errors that may contain structured error objects

**ALWAYS**:
- Use Effect-TS for all backend side effects
- Use Hono RPC + TanStack Query for all API calls
- Follow TDD: write tests first, then implement
- Run `pnpm typecheck` and `pnpm fix` before committing
- Prioritize high-risk runtime fixes first (behavior/cross-platform/error semantics) before low-risk style cleanups

## 高风险优先策略（必须执行）

### 高风险定义

符合任一项即视为高风险，需优先修复：
- 运行时行为可能改变或中断（服务启动、核心请求链路、SSE、会话状态流转）
- 跨平台兼容性（Windows/Linux/macOS 命令名、路径分隔符、文件监听）
- 错误处理语义（超时误判、错误信息丢失、异常被静默吞掉）
- 不安全类型断言导致的运行时潜在崩溃（尤其 `as any`/`as unknown as`）

### 执行顺序

1. 先修高风险，再修中低风险
2. 每次只改一个高风险点（small batch）
3. 每次改动后至少执行：定向测试 + `pnpm typecheck`
4. 一批高风险完成后执行：`pnpm fix && pnpm typecheck && pnpm test`

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

### 提交前验收（DoD）

```bash
# 1) 格式与静态检查
pnpm fix

# 2) 类型检查
pnpm typecheck

# 3) 全量单测
pnpm test

# 4) 高风险断言扫描（运行时 + 前端关键路径）
rg -n "as unknown as|as any|return .* as [A-Z]" src -g '*.ts' -g '*.tsx'

# 5) 运行时代码 node:* 扫描（测试文件可单独评估）
rg -n "from \"node:|from 'node:" src/server src/lib -g '*.ts' -g '!*.test.ts'
```

### Commit Message 规范

- 提交信息必须使用两行结构，不允许只写单行摘要
- 第一行格式固定为：`type(scope): 摘要`
- 第二行格式固定为：`- 实现要点`
- `type` 使用 Conventional Commits 风格，例如：`feat`、`fix`、`refactor`、`docs`、`test`、`chore`
- `scope` 必须指向明确模块，避免空泛词；可使用单个 scope，也可使用逗号分隔的复合 scope，例如：`spec-dashboard`、`conversation`、`spec-dashboard,conversation`
- `摘要` 要简洁描述结果，不写过程性废话
- `实现要点` 要概括本次提交最关键的实现或修复点，使用中文简体

示例：

```text
fix(spec-dashboard): 修复空态布局挤入目录列的问题
- 空态时切换为单列工作台布局，并统一阶段空态展示
```

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
  - `.claude/skills/` - Custom skills (task-planning, gitnexus-exploring, d2c-baseline, etc.)
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

**命令执行与错误处理（强约束）**:
- 命令超时必须显式区分（如 `Effect.timeoutFail`），不能靠字符串匹配判断超时
- 错误消息必须保留可读信息，禁止直接 `String(error)` 作为唯一错误文本
- 启动阶段关键错误不得静默吞掉；可恢复错误需记录日志并明确降级语义

建议统一错误序列化辅助函数：
```typescript
const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}
```

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
- Scope: strict for production runtime files; test files are evaluated separately unless explicitly required

This enables dependency injection and proper testing.

**跨平台路径与主目录（强约束）**:
- 路径拼接统一走 `Path.Path` / `path.join`，禁止字符串硬拼分隔符
- 命令可执行名必须处理平台差异（如 Windows `*.cmd`）
- 主目录解析统一走共享 helper（如 `resolveHomeDirFromEnv`）
- 当 HOME 相关环境变量缺失时必须显式失败或给出可观测错误，禁止回退 `"."`

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

**响应解析（强约束）**:
- Hono RPC 返回值必须在客户端做基本结构守卫
- 业务失败（`success: false`）与“无 success 标记错误”需区分处理，避免误判

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
- **Custom Skills**: `task-planning`, `gitnexus-exploring`, `querying-infra-catalog`, `d2c-baseline`, `d2c-stitching` (in `.claude/skills/`)
- **OpenSpec Configuration**: Schema definitions, templates, validation rules
- **Profile Templates**: MCP server configs, environment templates

**Usage in Development**:
- When modifying templates, update both `template-to-project/` (source) and `dist/template-to-project/` (will be rebuilt)
- Template changes affect new project initialization, not existing projects
- Test template changes with `pnpm build` → `pnpm start` → create new project in UI

**Design Workflow** (via `specforge-enhanced` schema):
- Design artifact generation is driven by `schema.yaml` design artifact instructions
- Schema defines phases: fact collection → Q&A → flow diagram → document generation

Each phase uses TaskCreate/TaskUpdate for progress tracking.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **spec-forge** (3168 symbols, 7626 relationships, 234 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/spec-forge/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/spec-forge/context` | Codebase overview, check index freshness |
| `gitnexus://repo/spec-forge/clusters` | All functional areas |
| `gitnexus://repo/spec-forge/processes` | All execution flows |
| `gitnexus://repo/spec-forge/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
