---
name: task-planning
description: 将实施方案转化为支持并行调度的任务计划。具备资源边界分析、writes 冲突检测、范围依赖生成能力。
---

# 任务规划 (Task Planning)

将 `design.md` 转换为执行（`tasks.md`）。

## Quick Reference（必读）

- **结构**：扁平任务列表（每个 Task 代表一个可交付的原子步骤）
- **ID**：必须是**正整数**；禁止字符串或浮点数
- **依赖**：必须是 DAG（无环）；Task 只能依赖其他 Task
- **粒度**：以**认知范畴 (Cognitive Scope)** 为准，单一心理模型 = 一个任务 (Goldilocks Zone)

## 核心原则 (Core Principles)

### 1. 严格忠实 (!Critical)

- **1:1 映射**: 任务内容**必须**直接映射设计文档中的术语和逻辑。
- **禁止项**:
  - ❌ 禁止架构优化 (Architecture Optimization)。
  - ❌ 禁止命名优化 (Naming Optimization)。
  - ❌ 禁止自作聪明的"改进设计" (Clever Improvements)。
  - ❌ 创建任何独立的说明文档（COMPLETION.md、IMPLEMENTATION.md、README.md 等）。
  - ❌ 为“可能的未来需求”预留代码或抽象层。
  - ❌ 重构或优化任务范围之外的代码。
  - ❌ 为非 tdd 模式添加测试。只有 tdd 模式下才被允许写测试。（MUST）
  
- **权限**: 当前阶段**没有修改设计的权限**。

### 2. INVEST 原则 (!Critical)

每个任务必须符合：

- **Independent**: 尽可能独立，$DAG$ 依赖清晰。
- **Small**: 小于等于一个"认知单元" (Single Mental Model)。
- **Testable**: 必须有明确验收标准 (DoD)。

## 指令 (Instructions)

### 1. 核心解构策略 (The "Ultrathink" Engine)

#### A. 接口与架构先行 (Interface & Schema First) - Parallelism Unlocker
在实现任何逻辑之前，必须先识别并安排"结构定义任务" (Structure Definition Tasks)。这些是从瓶颈解锁大规模并行的关键。
- **行动**: 创建明确的任务来生成 API 规范 (OpenAPI/Swagger)、数据库 Schema、共享类型定义 (TypeScript Interfaces) 和 组件设计 Tokens。
- **规则**: 实现任务（前端/后端）**必须**依赖这些结构定义任务，而不是相互依赖。

#### B. 基于"上下文闭环"的职责分配 (Context-Closed Responsibility Assignment)
核心原则：**一个任务不仅仅是一组指令，更是一个独立的"思维容器" (Context Container)**。为了避免 "Context Spillover" 和 "Split Brain"，需遵循以下拆分策略：

- **垂直切片 (Vertical Slicing) - 针对组件与特性**: 
  - **组件 (UI)**: 组件的 UI 结构、样式 (CSS) 和 逻辑 (JS) 必须在一个任务中完成。
  - **特性 (Backend)**: Service + Controller + Test 属于一个功能闭环，**千万不要拆分**。
  - **Context-Closed**: 开发者拥有完整的上下文（Props 定义、UI 规范、交互逻辑）。
  - **禁止**: 禁止将一个组件的 HTML、CSS、JS 拆分为三个依赖任务（避免上下文中断导致的 Agent理解错误）。

- **动静分离 (Dynamic/Static Separation) - 针对架构**:
  - **静态/独立部分 (Static/Independent)**:
    - **定义**: 不依赖具体需求流程，只依赖规范。做完即走，无状态依赖。
    - **例子**: 基础 UI 组件 (Button)、纯工具类 (DateUtils)、TypeScript 接口契约、API Schema。
    - **策略**: **原子化 + 并行** (Atomic + Parallel)。基于"单一认知模型"拆分，不强求颗粒度大小，分配给 Agent 独立执行。
  - **动态/集成部分 (Dynamic/Integration)**:
    - **定义**: 将静态积木搭建成房子的过程。
    - **例子**: 页面集成、复杂需求流程编排、状态管理、路由跳转。
    - **策略**: **大任务 + 串行**。必须保留为"大任务"，容忍 Agent 累一点，也要确保它拥有完整的上下文。

#### C. 任务颗粒度 (The Goldilocks Zone) - 基于认知范畴
放弃"时间盒"，转向"认知盒"。任务大小取决于所需的**认知上下文 (Cognitive Context)**。
- **Too Small**: 只有指令没有价值交付（如：纯粹的改名、加日志、移动文件）。-> **拒绝/合并**
- **Too Large**: 需要同时维持多个**互不相关**的心理模型（如：同时做"支付网关"和"头像上传"）。-> **拒绝/拆分**
- **Just Right**: **完整的、原子的价值单元**。
  - 即使代码量大（如复杂的状态机），只要属于**单一心理模型**，就不应拆分。
  - 例子："实现用户列表（含排序、过滤、分页）" -> ✅ (单一完整的 ListView 模型)。

### 3. 自我修正

在输出前，必须自检：

1.  **完整性**: 是否完整覆盖设计文档？
2.  **契约依赖检查**: 所有的实现任务任务是否都依赖了对应的"结构定义任务"？
3.  **DAG 检查**: 依赖是否无环？
4.  **设计检查**: 是否有"私自优化"？-> **如有，立即还原为设计原样**。
5.  **颗粒度检查**: 任务是否符合"认知范畴" (Cognitive Scope)？确保没有为了凑时间而拆散单一心理模型。

## 何时跳过此 Skill

- 需求尚未稳定（仍在和用户讨论）。

## 输出产物

- `tasks.md`
