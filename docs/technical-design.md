# SpecForge 技术设计文档

## 概述

SpecForge 是一个基于 Claude Code 和 OpenSpec CLI 的 Spec Coding 实践框架，通过 Skill 编排、Schema 驱动的工作流和上下文管理，将软件需求从提出到实施的全过程结构化为可控、可追溯的阶段性产物。

本文档从 Agent 编排专家和系统架构专家的视角，阐述 SpecForge 的设计理念、技术架构和实践思路。

---

## 设计理念

### 1. 阶段化驱动，产物为锚点

传统的 AI 辅助编程往往是"一次性对话"模式：用户提出需求，AI 直接生成代码。这种模式在简单任务中有效，但面对复杂需求时存在以下问题：

- **需求理解偏差** — AI 可能误解用户意图，生成的代码与预期不符
- **缺乏中间产物** — 没有需求分析、技术方案等中间文档，难以追溯决策过程
- **难以迭代调整** — 一旦生成代码，修改成本高，用户只能重新描述需求

SpecForge 的核心理念是**将需求到实施的过程拆解为明确的阶段，每个阶段产出可评审的文档产物**：

```
需求输入 → Spec（需求分析） → Design（技术方案） → Tasks（任务拆解） → Implementation（代码实施）
```

每个阶段的产物都是下一阶段的输入，形成**阶段锚点**。用户可以在任何阶段暂停、评审、修改，确保方向正确后再推进。

### 2. 主动式问答，前置决策收集

在生成阶段产物之前，AI 不应该"猜测"用户的意图，而应该**主动提问**，将关键决策点前置到对话阶段。

SpecForge 通过 `AskUserQuestion` 工具实现交互式问答：

- AI 在生成 Spec/Design 前，先通过问答卡片向用户确认关键细节
- 用户通过点选、自定义输入等方式回答问题
- AI 基于用户的回答生成产物，避免信息不充分导致的偏差

这种模式将**决策权交还给用户**，AI 作为执行者而非决策者。

### 3. Schema 驱动的工作流

SpecForge 通过 Schema 定义工作流的阶段和产物依赖关系。不同的项目可以使用不同的 Schema：

- **spec-driven** — 标准的 Spec → Design → Tasks 流程
- **specforge-enhanced** — 增强版流程，包含格式合规审查、Mermaid 图表验证等
- **自定义 Schema** — 团队可以根据实际需求定义自己的工作流

Schema 定义了：
- 每个阶段需要产出的 Artifact（如 spec.md、design.md）
- Artifact 之间的依赖关系（如 Design 依赖 Spec）
- 每个 Artifact 的模板和验证规则

### 4. Skill 指导行为，而非独立 Agent

SpecForge 不是通过定义多个独立的 Agent 来实现阶段分离，而是**通过 Skill 来指导同一个 Claude Code Agent 在不同阶段的行为**：

- **openspec-new-change** — 指导 Agent 创建新 Change 并启动 Spec 生成
- **openspec-continue-change** — 指导 Agent 推进到下一阶段（Spec → Design → Tasks）
- **openspec-apply-change** — 指导 Agent 实施 Tasks 中的任务
- **schema.yaml design artifact** — 通过 specforge-enhanced schema 定义的 design artifact 指令驱动技术设计文档生成

Skill 是可复用的行为模式，通过 `.claude/skills/` 目录下的 Markdown 文件定义。

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     SpecForge Web                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   前端 UI    │  │  后端服务   │  │  Claude Code CLI    │ │
│  │  (React)    │◄─┤   (Hono)    │◄─┤  (Agent Runtime)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      项目目录           │
        │  ┌─────────────────────────────────┐  │
        │  │  .claude/                       │  │
        │  │    ├── skills/                 │  │
        │  │    ├── agents/                │  │
        │  │    ├── commands/              │  │
        │  │    └── worktrees/             │  │
        │  └─────────────────────────────────┘  │
        │  ┌─────────────────────────────────┐  │
        │  │  openspec/                      │  │
        │  │    ├── config.yaml             │  │
        │  │    ├── schemas/                │  │
        │  │    └── changes/                │  │
        │  │         ├── change-001/        │  │
        │  │         │     ├── spec.md  │  │
        │  │         │     ├── design.md    │  │
        │  │         │     └── tasks.md     │  │
        │  │         └── archive/           │  │
        │  └─────────────────────────────────┘  │
        └───────────────────────────────────────┘
```

### 核心组件

#### 1. SpecForge Web（前端 + 后端）

**技术栈**：
- 前端：React 19 + TanStack Router + TanStack Query + Jotai
- 后端：Hono + Effect + @anthropic-ai/claude-code
- 构建：Vite + esbuild

**职责**：
- 提供可视化的项目管理和会话交互界面
- 管理 Claude Code 会话的生命周期
- 展示 Spec Dashboard（Changes 列表、产物预览）
- 提供 D2C 预览和元素选中功能

#### 2. OpenSpec CLI

**职责**：
- 管理 Change 的生命周期（new、status、continue、apply、archive）
- 提供 Schema 驱动的工作流引擎
- 生成 Artifact 的指令和模板
- 验证 Artifact 的完整性和依赖关系

**核心命令**：
```bash
openspec new change <name>              # 创建新 Change
openspec status --change <name>         # 查看 Change 状态
openspec instructions <artifact-id>     # 获取 Artifact 生成指令
openspec list                           # 列出所有 Changes
```

#### 3. Skill 定义（.claude/skills/）

Skill 以 Markdown 文件形式定义，包含：

- **Frontmatter** — Skill 元信息（名称、描述、兼容性）
- **Workflow** — 详细的执行步骤
- **Guardrails** — 约束条件和注意事项

#### 4. Profile 配置（openspec/config.yaml）

Profile 配置定义了项目的基建能力和工作流规则：

```yaml
_specforge:
  profile: "ctrip-prd-to-code-xtaro-zx"
  template_version: "1.0.7"

schema: specforge-enhanced

context: |
  格式合规审查 (IMPORTANT):
  - 调用时机：仅在阶段四文档生成完成后调用
  - 每个 artifact 在阶段四生成完成后，MUST 使用 Agent 工具启动 format-compliance-agent

rules:
  spec:
    - MUST 每个阶段执行前先 TaskList 做防漏建守卫
    - MUST 任务状态更新与实际执行保持一致
    ……
```

#### 5. Change 管理（openspec/changes/）

每个 Change 对应一个独立的目录，包含该 Change 的所有阶段产物：

```
openspec/changes/student-douyin-vouchers-page/
├── .openspec.yaml    # Change 元信息
├── spec.md       # Spec 文档
├── design.md         # Design 文档
├── tasks.md          # Tasks 列表
└── d2c/              # D2C 产物（如果启用）
    ├── page-home/
    │   ├── index.tsx
    │   └── index.module.scss
    └── component-header/
        ├── index.tsx
        └── index.module.scss
```

---

## Skill 编排实践

### 1. Skill 封装原则

Skill 是可复用的行为模式，通过 `.claude/skills/` 目录下的 Markdown 文件定义。

**设计原则**：

- **单一职责** — 每个 Skill 只做一件事，如 `openspec-new-change` 只负责创建新 Change
- **明确输入输出** — 在文档中声明所需输入和输出格式
- **可测试** — 提供清晰的步骤和约束条件，便于验证 Skill 行为

**调用方式**：

用户通过斜杠命令触发 Skill：
```bash
/opsx:new          # 触发 openspec-new-change
/opsx:continue     # 触发 openspec-continue-change
/opsx:apply        # 触发 openspec-apply-change
```

### 2. 阶段推进机制

当用户执行 `/opsx:continue` 时，系统的工作流程：

1. **Skill 加载** — Claude Code 加载 `openspec-continue-change` Skill
2. **状态查询** — Skill 指导 Agent 调用 `openspec status --change <name>` 查询当前状态
3. **获取指令** — 根据状态，调用 `openspec instructions <artifact-id>` 获取下一个 Artifact 的生成指令
4. **生成产物** — Agent 根据指令和模板生成对应的 Artifact（如 design.md）
5. **更新状态** — 产物生成后，OpenSpec CLI 自动更新状态

整个过程中，**只有一个 Claude Code Agent**，通过不同的 Skill 指导它在不同阶段的行为。

### 3. Subagent 的使用场景

在 SpecForge 中，Subagent 主要用于**阶段产物的格式合规审查**：

**示例场景**：Spec 生成后的格式验证

```yaml
# 在 openspec/config.yaml 中定义
context: |
  格式合规审查 (IMPORTANT):
  - 调用时机：仅在阶段四文档生成完成后调用
  - 每个 artifact 在阶段四生成完成后，MUST 使用 Agent 工具启动 format-compliance-agent
```

**工作流程**：

1. 主 Agent 生成 spec.md
2. 主 Agent 调用 Agent 工具，启动 `format-compliance-agent` Subagent
3. Subagent 读取模板文件和生成的文档，对比结构
4. Subagent 修复结构偏差（如章节顺序、必需章节缺失）
5. Subagent 完成后返回结果给主 Agent

**注意**：Subagent 不用于并行生成多个产物，而是用于质量保证和验证。

### 4. 上下文管理策略

**问题**：随着项目复杂度增加，上下文会快速膨胀，导致：
- Token 消耗增加
- AI 决策质量下降（信息过载）
- 响应速度变慢

**解决方案**：通过 OpenSpec CLI 的指令系统实现按需注入

```bash
# openspec instructions 命令返回的 JSON 结构
{
  "context": "项目背景（约束条件，不写入文档）",
  "rules": "Artifact 特定规则（约束条件，不写入文档）",
  "template": "文档结构模板",
  "instruction": "Schema 特定指导",
  "outputPath": "输出路径",
  "dependencies": ["spec.md", "specs/*/spec.md"]  // 需要读取的依赖文件
}
```

**分层注入策略**：

| 阶段 | 注入内容 | 排除内容 |
|------|---------|---------|
| Spec | Profile、需求描述、代码示例 | 技术实现细节、历史代码 |
| Design | Profile、Spec、dependencies 中的文件 | 具体代码文件（除非在 dependencies 中） |
| Tasks | Profile、Spec、Design | MCP 文档（已在前序阶段使用） |
| Implementation | Profile、Tasks、相关代码文件 | Spec、Design（已固化为 Tasks） |

---

## D2C 流程设计

D2C（Design to Code）是 SpecForge 的特色功能，将 Figma 设计稿转化为代码，并提供可视化预览和局部调整能力。

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    SpecForge Web                         │
│  ┌──────────────┐         ┌──────────────────────────┐ │
│  │  D2C Panel   │◄────────┤  Preview Server (Vite)   │ │
│  │  (React)     │  iframe │  (localhost:5174)        │ │
│  └──────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  D2C 产物目录                  │
        │  openspec/changes/            │
        │    change-001/d2c/            │
        │      ├── page-home/           │
        │      │     ├── index.tsx      │
        │      │     └── index.module.scss │
        │      └── component-header/    │
        │            ├── index.tsx      │
        │            └── index.module.scss │
        └───────────────────────────────┘
```

### 关键技术点

#### 1. 元素选中与代码定位

**挑战**：用户在预览中点击一个 UI 元素，如何精确定位到对应的代码？

**解决方案**：注入元素选择器脚本

```javascript
// 注入到预览 iframe 的脚本
document.addEventListener('click', (e) => {
  if (!window.__D2C_SELECTOR_MODE__) return;

  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  const selector = generateSelector(target); // 生成唯一选择器
  const boundingRect = target.getBoundingClientRect();

  // 发送给父窗口
  window.parent.postMessage({
    type: 'element-selected',
    selector,
    boundingRect,
    innerHTML: target.innerHTML,
    className: target.className
  }, '*');
});
```

**代码定位逻辑**：

1. 前端收到 `element-selected` 消息
2. 将选择器信息发送给后端
3. 后端调用 Claude Code，传递选择器和用户的调整指令
4. AI 通过 Grep 工具在 D2C 产物目录中搜索匹配的代码
5. 修改对应文件，仅限当前产物目录

#### 2. 暂存指令与批量提交

**设计目标**：允许用户一次性提交多处调整，减少 AI 调用次数

**实现方式**：

```typescript
// 前端状态管理
const [stagedInstructions, setStagedInstructions] = useState<Instruction[]>([]);

// 暂存指令
const stageInstruction = (instruction: Instruction) => {
  setStagedInstructions(prev => [...prev, instruction]);
};

// 批量提交
const submitStaged = async () => {
  const prompt = `
请根据以下暂存的调整指令，批量修改 D2C 产物：

${stagedInstructions.map((inst, i) => `
${i + 1}. 元素：${inst.selector}
   调整：${inst.instruction}
`).join('\n')}

注意：仅修改对应产物目录内的文件，不要影响其他产物。
  `;

  await claudeCode.sendMessage(prompt);
  setStagedInstructions([]);
};
```

#### 3. 预览工程初始化

**挑战**：首次使用 D2C 时，需要创建预览工程、安装依赖、启动服务，耗时较长

**解决方案**：模板工程 + 增量初始化

```
template-to-project/preview/xtaro-zx-d2c-preview/
├── package.json          # 预定义依赖
├── vite.config.ts        # Vite 配置
├── src/
│   ├── main.tsx          # 入口文件
│   └── router.tsx        # 动态路由
└── nfes/
    └── utils/
        └── elementSelector.js  # 元素选择器脚本
```

**初始化流程**：

1. 检测 `template-to-project/preview/xtaro-zx-d2c-preview/` 是否存在
2. 如果不存在，从模板复制到项目目录
3. 执行 `npm install`（仅首次）
4. 启动 `npm run dev`
5. 等待服务就绪（轮询 `http://localhost:5174`）

---

## 实践思路

### 1. 渐进式采用

SpecForge 不要求用户一次性采用完整流程，可以渐进式引入：

| 阶段 | 使用方式 | 适用场景 |
|------|---------|---------|
| 入门 | 仅使用 Spec | 需求不明确，需要 AI 帮助梳理 |
| 进阶 | Spec + Design | 复杂需求，需要技术方案评审 |
| 完整 | Spec + Design + Tasks + Implementation | 大型项目，需要全流程管控 |
| 增强 | 启用 D2C | 前端需求，需要可视化预览 |

### 2. 团队协作

SpecForge 的阶段产物（Spec、Design、Tasks）是天然的协作锚点：

- **需求评审** — 产品经理评审 Spec
- **技术评审** — 技术负责人评审 Design
- **任务分配** — 团队成员认领 Tasks 中的任务

**实现方式**：

- 将 `openspec/changes/` 目录纳入 Git 版本控制
- 通过 Pull Request 进行评审
- 在 Tasks 中使用 `@username` 标记任务负责人

### 3. 持续优化

SpecForge 的 Skill 定义和 Schema 配置都是可定制的，团队可以根据实际情况持续优化：

- **调整 Skill 行为** — 修改 `.claude/skills/` 下的 Skill 文件
- **扩展 MCP 工具** — 在 `openspec/config.yaml` 中配置团队内部的知识库、API 文档
- **自定义 Schema** — 在 `openspec/schemas/` 中定义团队专属的工作流

**示例**：自定义 Skill

```markdown
---
name: microfrontend-setup
description: 初始化微前端子应用
---

# Task

为项目初始化微前端子应用，包括：

1. 创建子应用目录结构
2. 配置 Webpack Module Federation
3. 注册到主应用的路由表
4. 生成示例页面

# Workflow

1. 读取主应用的 `micro-apps.json` 配置
2. 创建子应用目录 `apps/{{app_name}}/`
3. 生成 `webpack.config.js`，配置 Module Federation
4. 更新主应用的 `micro-apps.json`，添加新子应用
5. 生成示例页面 `apps/{{app_name}}/src/pages/Home.tsx`
```

---

## 总结

SpecForge 通过以下设计实现了高质量的 Spec Coding 实践：

1. **阶段化驱动** — 将需求到实施拆解为明确阶段，每个阶段产出可评审的文档产物
2. **主动式问答** — 通过 AskUserQuestion 前置决策收集，避免 AI 猜测用户意图
3. **Schema 驱动** — 通过 Schema 定义工作流，支持不同项目的定制化需求
4. **Skill 指导行为** — 通过 Skill 指导同一个 Agent 在不同阶段的行为，而非定义多个独立 Agent
5. **OpenSpec CLI 集成** — 通过 OpenSpec CLI 管理 Change 生命周期和 Artifact 依赖
6. **D2C 增强** — 提供可视化预览和局部调整能力，提升前端开发效率

这套设计不仅适用于 SpecForge，也可以作为其他 AI 辅助开发工具的参考架构。
