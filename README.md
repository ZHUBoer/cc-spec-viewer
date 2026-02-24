# SpecForge


SpecForge 是一套完整的工具链，将 **Spec Coding（规范驱动开发）** 理念落地为可操作的工作流。它集成了规范管理、实时预览、版本控制的现代化开发环境，让 AI 辅助开发变得可预测和高效。

## 核心理念

在 AI 辅助开发的时代，如何确保 AI 编码助手准确理解需求并生成可预测的代码？

**Spec Coding** 的答案是：**在编写任何代码之前，先让人类和 AI 就要构建的内容达成一致**。通过轻量级的规范层，确保需求在实现之前就被明确定义和验证。

SpecForge 通过提供完整的 Web 客户端和可视化工作流，让这一理念变得易于实践。

## 核心特性

### 规范驱动工作流

- **完整的状态管理**：从草稿 → 设计 → 任务规划 → 实施 → 完成 → 归档的完整生命周期
- **Spec Dashboard**：可视化展示所有变更（Changes）及其状态
- **OpenSpec 兼容**：完全兼容 OpenSpec 1.0 的目录结构和 schema 系统

### Workspace 工作面板

统一的可调整面板，支持三种工作模式：

- **Spec 模式**：规范管理和查看，支持内容编辑、状态可视化、实时同步
- **Browser 模式**：嵌入式浏览器，实时预览 Web 应用和验证功能
- **Diff 模式**：Git 变更对比和审查，直接提交和推送代码

### Claude Code 全功能客户端

- **会话管理**：浏览历史会话、搜索对话、启动新会话、恢复会话
- **实时交互**：支持文件上传、命令补全、工具权限控制
- **进程控制**：Keep-Alive 进程管理，支持无缝继续会话
- **全文搜索**：`⌘K` / `Ctrl+K` 快速搜索所有项目和会话
- **Git 集成**：内置 Diff 查看器，直接执行提交和推送操作

### 用户友好

- **主题切换**：深色/浅色模式，跟随系统设置
- **移动端适配**：响应式设计，支持平板和手机访问
- **远程开发**：支持服务器部署，通过浏览器访问
- **零数据丢失**：严格的 Zod Schema 验证，确保所有会话数据完整保存

## 快速开始

### 本地运行

使用 npx 直接运行（无需安装）：

```bash
npx @ctrip/spec-forge@latest --port 3400
```

或全局安装后使用：

```bash
npm install -g @ctrip/spec-forge
spec-forge-viewer --port 3400
```

服务启动后，在浏览器中打开 `http://localhost:3400`

### Docker 部署

构建镜像：

```bash
docker build -t spec-forge-viewer .
```

运行容器：

```bash
docker run --rm -p 3400:3400 \
  -e PORT=3400 \
  -e CCV_PASSWORD=your-password \
  -e ANTHROPIC_API_KEY=your-api-key \
  spec-forge-viewer
```

或使用 Docker Compose：

```bash
docker compose up --build
```

## 配置说明

### 命令行选项

```bash
spec-forge-viewer [options]

选项:
  -p, --port <port>                端口号 (默认: 3000)
  -h, --hostname <hostname>        监听的主机名 (默认: localhost)
  -P, --password <password>        认证密码
  -e, --executable <executable>    Claude Code 可执行文件路径
  --claude-dir <claude-dir>        Claude 目录路径 (默认: ~/.claude)
```

### 环境变量

| 环境变量 | 说明 | 必需 |
| --- | --- | --- |
| `PORT` | 端口号 | 否 (默认: 3000) |
| `HOSTNAME` | 监听主机名 | 否 (默认: localhost) |
| `CCV_PASSWORD` | 认证密码 | 否 |
| `CCV_CC_EXECUTABLE_PATH` | Claude Code 路径 | 否 (自动检测) |
| `CCV_GLOBAL_CLAUDE_DIR` | Claude 目录路径 | 否 (默认: ~/.claude) |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | 是* |
| `ANTHROPIC_AUTH_TOKEN` | 自定义代理认证令牌 | 否 |
| `ANTHROPIC_BASE_URL` | 自定义 API 端点 | 否 |

\* 创建新会话时必需

### 用户设置

可在应用侧边栏中配置：

| 设置项 | 默认值 | 说明 |
| --- | --- | --- |
| 隐藏无用户消息的会话 | 开启 | 隐藏系统自动创建的会话 |
| 合并相同标题的会话 | 关闭 | 只显示最新的恢复会话 |
| 遇到速率限制自动调度继续 | 关闭 | 自动在速率限制解除后继续会话 |
| 发送消息快捷键 | Shift+Enter | 选择发送消息的组合键 |
| 搜索快捷键 | Command+K | 打开搜索对话框的快捷键 |
| 权限模式 | 询问权限 | 工具调用的审批逻辑 |
| 主题 | 跟随系统 | 深色/浅色模式切换 |
| 通知音效 | 无 | 会话完成时的声音提醒 |

## Spec Coding 工作流

### 目录结构

```
openspec/
├── changes/                    # 变更目录
│   ├── add-authentication/     # 单个变更
│   │   ├── proposal.md         # 需求说明（为什么做、做什么）
│   │   ├── architecture.md     # 技术方案和架构决策
│   │   ├── tasks.md           # 实现清单（checkbox 格式）
│   │   ├── tests.md           # 测试计划
│   │   └── specs/             # Delta specs
│   └── archive/               # 已归档的变更
└── specs/                     # 真理源（当前系统规范）
```

### 工作流状态

```
draft (草稿)
  ↓
designing (设计中)
  ↓
design-confirmed (设计确认)
  ↓
task-planning (任务规划)
  ↓
implementing (实施中)
  ↓
completed (已完成)
  ↓
archived (已归档)
```

SpecForge 通过文件内容自动推断变更状态：

- 检查 `tasks.md` 中的任务完成情况（`- [x]`）
- 识别确认标记（`<!-- TASKS_CONFIRMED: true -->`）
- 识别设计最终确认（`<!-- DESIGN_FINAL_CONFIRMATION: true -->`）

### 典型工作流

1. **创建 Proposal**：在 Spec Dashboard 中创建新变更，描述需求
2. **设计方案**：AI 生成 `architecture.md`，在 Workspace 中审阅
3. **规划任务**：AI 生成 `tasks.md`，确认实现清单
4. **逐个实现**：AI 按任务列表实现功能
5. **实时预览**：在 Browser 面板中预览应用效果
6. **审查变更**：在 Diff 面板中查看所有文件变更
7. **提交代码**：直接在 Web 界面提交和推送到 Git
8. **归档变更**：完成后归档到 `archive/` 目录

## 技术架构

### 前端技术栈

- **React 19** - 现代 UI 框架
- **Vite** - 快速构建工具
- **TanStack Router** - 类型安全的路由
- **TanStack Query** - 服务器状态管理
- **Biome** - 代码质量工具
- **@lingui/react** - 国际化方案

### 后端技术栈

- **Hono** - 轻量高性能 Web 框架
- **Effect-TS** - 函数式副作用管理
- **Zod** - Schema 验证
- **Node 22** - 运行时

### 核心设计

**端到端类型安全**：
```typescript
// Hono RPC 提供全链路类型推断
export type RouteType = typeof app
const response = await honoClient.api.projects[":projectId"].$get({
  param: { projectId }
})
```

**实时同步**：
```typescript
// Server-Sent Events (SSE) 推送更新
useServerEventListener("sessionChanged", ({ projectId, sessionId }) => {
  queryClient.invalidateQueries({
    queryKey: ["session", projectId, sessionId]
  })
})
```

**零信息丢失**：
- 23 个 Zod Schema 覆盖所有 JSONL 字段
- 任何不符合 Schema 的数据触发验证错误
- 随 Claude Code 版本演进持续完善

**Effect-TS 分层架构**：
```typescript
MainLayer = PresentationLayer
  .pipe(Layer.provide(ApplicationLayer))
  .pipe(Layer.provide(DomainLayer))
  .pipe(Layer.provide(InfraLayer))
  .pipe(Layer.provide(PlatformLayer))
```

## 系统要求

- **Node.js**：20.19.0 或更高版本
- **操作系统**：macOS、Linux 或 Windows（需确保 `claude` 可执行文件在 PATH 中，或通过 `--executable` / `CCV_CC_EXECUTABLE_PATH` 指定）
- **Claude Code**：v1.0.50 或更高版本
  - 工具权限审批功能需要 v1.0.82 或更高版本

## 数据源

SpecForge 直接读取 Claude Code 的会话日志：

- **位置**：`~/.claude/projects/<project>/<session-id>.jsonl`
- **格式**：JSONL 格式的会话记录
- **自动发现**：自动检测新项目和会话

## 开发指南

详见 [docs/dev.md](docs/dev.md)

核心命令：

```bash
# 类型检查（提交前必须）
pnpm typecheck

# 自动修复代码风格
pnpm fix

# 运行单元测试
pnpm test

# E2E 测试
pnpm e2e
```

## 许可证

MIT License

## 参考资源

- **OpenSpec 官网**：https://openspec.dev
- **Effect-TS 文档**：https://effect.website
- **Hono 文档**：https://hono.dev
- **TanStack Query 文档**：https://tanstack.com/query

---

*最后更新：2026-02-06*
