---
name: design-generation
description: 基于 Fact-Based and MCP-First + Contract-First 原则生成和评审技术设计文档。适用于：(1) 在 proposal 基础上，严格使用 skills 和 MCP 获取事实来源，生成设计文档，(2) 生成系统建议，验证并消化用户意见重新生成设计文档，(3) 多轮 Q&A 迭代直到设计文档最终确认完成。
---

# 技术设计文档生成与评审 (Design Generation & Review)

## ⚠️ 使用说明 (IMPORTANT!)

**如果你正在使用 `specforge-enhanced` schema:**
- 本 skill 的逻辑已**完全整合**到 `openspec/schemas/specforge-enhanced/schema.yaml` 中
- 执行时**请遵循 schema.yaml 的详细指令**（D-1-1 ~ D-6-3 共19个任务）
- **请勿直接调用本 skill**，schema.yaml 会自动应用这些原则
- 本文档作为**方法论参考**，帮助理解设计原理和核心概念

**如果你不使用 `specforge-enhanced` schema:**
- 可以直接调用本 skill 进行设计生成和评审
- 本文档定义了高层次的工作流（D-1/D-2/D-3，R-1~R-5）
- 适用于自定义工作流或其他 OpenSpec schema

---

基于 Fact-Based and MCP-First + Contract-First 原则，生成严谨的技术设计文档并进行多轮评审。

## 核心原则 (CRITICAL!)

1. **Fact-Based and MCP-First**: 每一个字段、组件引用必须有 proposal 原文、MCP 查询结果或现有代码作为依据。**严禁幻觉**。
2. **Contract-First (BLOCKING)**: 涉及的每一个后端接口，**必须**先调用契约查询工具。未获取契约禁止生成设计。
3. **Zero Hallucination**: 查不到就标记 MISSING，严禁为了"看起来完整"而编造。
4. **Priority Waterfall**: 字段推导严格遵循 L1 Explicit > L2 Pattern > L3 Ambiguous。
5. **Structural Separation**: 模版仅提供骨架。严禁将模版中的占位符文本（如"[功能名称]"、"方案A"）直接保留在最终产物中。

## 快速参考

| 阶段 | 任务 | 核心步骤 | 参考文档 |
|:---|:---|:---|:---|
| **推导** | 字段来源 | L1/L2/L3 Priority Waterfall | [field-inference.md](references/field-inference.md) |

---

## 设计生成流程 (CRITICAL!)

### D-1: 事实收集 (Fact Collection)

#### Step 1: proposal 解析与需求逻辑提取

1. **需求逻辑提取（输出到文档）**
   - 数据流转图：绘制完整流程（入口 → 步骤 → 条件分支 → 出口）
   - 业务规则表：触发条件 → 处理逻辑 → 边界条件
   - 异常处理表：异常类型 → 处理策略 → 用户提示

2. **内部检查（不写入文档）**
   - 评估闭环性（入口/流程/出口/边界条件）
   - 若有缺口 → 在 D-2 生成待决策问题

#### Step 2: 基建能力查询

> 必须使用 `querying-infra-catalog` skill 进行查询。

1. **MUST 调用 overview 工具建立全景认知**
   - 了解所有可用组件/API 的类别、边界、限制
   - **禁止**未调用 overview 就直接使用 search

2. **基建能力发现与精查 (IMPORTANT)**

   ```
   State A: Hit (命中)
   ├─ Condition: overview 返回明确的组件/API 名称
   ├─ Action: MUST 调用 specifications 获取详细规格
   └─ Result: 记录组件名 + 标记 🔧 L2

   State B: Miss (未命中/模糊)
   ├─ Condition: overview 仅提到泛化能力
   ├─ Action: 尝试 search 一次
   └─ Result: 若仍无 → 标记需自定义实现或生成问题
   ```

#### Step 3: 后端接口契约查询 (BLOCKING)

> 🚨 **强制规则**: proposal 中每提及一个后端接口，**必须**调用 `mcp__contract-doc__get_contract_doc`。
> **未调用 = 禁止生成「外部依赖与接口」章节。**

1. **查询契约**
   - 从 proposal 中提取所有 `serviceCode`（纯数字）和 `operationName`
   - 对每个接口调用契约查询
   - 完整记录入参表和返回值表

2. **契约理解 (Strict Priority Logic)**
   - 严格引用 [field-inference.md](references/field-inference.md) 的 Priority Waterfall 进行判定
   - **禁止任何"权重计算"**，直接套用 L1/L2/L3

3. **更新外部依赖章节**
   - ✅ L1: proposal 明确
   - 🔧 L2: 模式匹配（添加默认假设）
   - ⚠️ L3: 歧义/未知（生成问题）

#### Step 4: 代码库探索

> 使用 `ast-grep` skill 进行探索。

1. **内部探索（不写入文档）**
   - 探索目录结构，理解各目录职责
   - 分析现有文件，理解命名规范

2. **输出到文档**
   - 影响范围表（文件路径 + 操作类型 + 变更说明）
   - 共享资源与风险点

### D-2: 差距分析 (Gap Analysis)

对比 proposal 需求与 D-1 事实，生成设计问题。

#### 降噪策略

1. **L2 静默原则**: 🔧 L2 字段不生成问题，用户无异议即确认
2. **功能聚类**: 禁止碎片化提问，按功能块合并
3. **嵌入对应章节**: 大多数问题嵌入需求逻辑/外部依赖/代码变更范围的用户确认区

#### 优先级定义

| 优先级 | 场景 | 示例 |
|:---|:---|:---|
| 🔴 临界 | serviceCode 缺失、核心能力不存在 | "请提供订单接口的 serviceCode" |
| 🟡 重要 | L3 字段来源不明、必需参数缺失 | "userId 从何处获取？" |
| 🟢 参考 | UI 细节、可选优化 | "是否需要 Loading 动画？" |

### D-3: 文档构建 (Document Build)

严格按照 design.md 的模板结构填充 design.md：

1. **标题与当前状态**: 替换功能名称，初始化 Round 1 / ⏳ 待用户审查
2. **需求逻辑**: 流程图 + 业务规则表 + 异常处理表
3. **外部依赖**: 后端接口（含完整入参/返回值表）+ 基建组件
4. **代码变更范围**: 影响范围表 + 共享资源与风险点
5. **待决策问题**: 仅当存在跨章节问题时生成
6. **验收标准**: 通用标准 + 模式特定标准

---

## 设计评审流程 (Design Review)

### R-1: 读取文件状态

1. 读取当前需求的 design.md
2. 解析「📊 当前状态」：当前轮次、状态
3. 解析各章节的用户确认区
4. 识别本轮新增/修改的用户输入

### R-2: MCP 验证与契约理解

**MUST**: 对用户意见中的关键决策，重新查询并**理解** MCP。

#### 契约文档理解

若用户意见了后端接口参数（serviceCode/operationName）：
1. 调用 `mcp__contract-doc__get_contract_doc` 获取契约
2. 严格引用 [field-inference.md](references/field-inference.md) 进行判定
3. **记录或生成新问题**:
   - ✅ L1/L2: 更新「外部依赖与接口」章节
   - ⚠️ L3: 若发现新的置信度低字段，**必须**追加问题

#### 基建能力验证

若用户确认使用某基建组件/API：
1. 调用 `specifications` 获取详细规格
2. 检查必需参数是否齐备、能力是否覆盖需求
   - **Params Check**: 必需参数是否齐备？(Missing → 🟡 追加问题)
   - **Capability Check**: 组件能力是否覆盖需求？
     - **Match**: ✅ 记录使用方式
     - **Partial w/ Limits**: 🟡 追加问题确认 workaround
     - **Conflict**: ❌ 标记冲突，建议自定义
3. 更新「外部依赖与接口」章节

### 用户补充需求验证

- 扫描各 `USER_INPUT` 区的补充内容
- 若有新增需求，查询相关基建能力和接口
- 执行与 design 阶段相同的理解流程

### R-3: 生成系统建议

在 `<!-- SYSTEM_SUGGESTION_START:Qx -->` 区域写入建议。
**消化/评审阶段可融入用户意见生成新的 design.md** `<!-- USER_INPUT_START:Qx -->` 区间内的用户意见。

| 验证结果 | 建议内容 | 示例 |
|:---|:---|:---|
| ✅ 合理 | 实现思路 | `推荐使用 Context API` |
| ⚠️ 不完整 | 缺失项列表 | `需补充：缓存策略` |
| ❌ 冲突 | 冲突说明+替代方案 | `建议改用 sessionStorage` |

### R-4: 检查完成度

#### 完成条件（全部满足）

1. **3 个核心章节已确认**: 需求逻辑、外部依赖、代码变更范围，用户均已确认。
2. **待决策问题已解决**: 所有 🔴/🟡 问题已解决（🟢 可跳过）
3. **外部依赖齐备**: 无 ❌ MISSING 标记，⚠️ L3 有用户意见

### R-4.5: 消化内容（仅完成时执行）

> **目标**: 将用户确认固化，清理临时区块。

1. **业务逻辑**: 若用户在 `BUSINESS_LOGIC` 区有修改 → 更新章节内容 → 用户区留下 `（已确认）`
2. **外部依赖**: 若用户在 `DEPENDENCIES` 区有修改 → 更新章节 → 🔧 L2 升级为 ✅
3. **代码变更范围**: 若用户在 `IMPACT` 区有修改 → 更新章节
4. **待决策问题**: 已解决的问题 → 融入对应章节 → 删除问题区块

### R-5: 更新状态

更新 `📊 当前状态`：
- 轮次: Round N+1
- 状态: ⏳ 待用户审查 | ✅ 设计完成 | 🚀 已确认

追加「🔍 审查历史」记录。

---

## 多轮迭代示例 (CRITICAL!)

```
Round 1 (生成):
├─ 生成初始 design.md
├─ 包含 5 个待决策问题
└─ 状态: ⏳ 待用户审查

Round 2 (评审):
├─ 用户意见了 Q1, Q2, Q3
├─ 验证通过 Q1, Q2
├─ Q3 需补充（追加问题 Q3.1）
└─ 状态: ⏳ 待用户审查

Round 3 (评审):
├─ 用户意见了 Q3.1, Q4, Q5
├─ 全部验证通过
├─ 执行 R-4.5 消化
└─ 状态: ✅ 设计完成，待确认进入任务规划

Round 4 (确认):
├─ 用户输入 "确认"
└─ 状态: 🚀 已确认，进入任务规划
```

---

## 技术栈规范参考 (IMPORTANT)

在生成设计问题和系统建议时，必须使用 {{DEVELOP_SKILLS_NAMES}} skill 中的开发规范和经验。
{{DEVELOP_SKILLS_USAGE_MD}}

---

## 与 OpenSpec 工作流的集成

在 OpenSpec 体系中使用此 skill 时：

1. **生成阶段**：执行 D-1 ~ D-3 流程，生成初始 design.md
2. **迭代阶段**：用户通过 `/opsx:continue` 触发评审，执行 R-1 ~ R-5 流程
3. **完成条件**：所有核心章节确认 + 待决策问题解决 → 可进入 tasks 阶段

**IMPORTANT**：在 design.md 已经生成，但 tasks.md 未生成的时候，每次 `/opsx:continue` 调用对应一轮评审，AI 应在该轮完成验证和建议生成后返回，等待用户下一次输入。

{{CODE_EXAMPLES_MD}}

## 何时使用此 Skill

- 分析 proposal 生成技术设计文档
- 验证用户对设计问题的答复
- 进行多轮 Q&A 迭代直到设计完成
- 将设计决策固化为最终文档

## 何时跳过此 Skill

- 简单的代码修复，无需 design.md
- 用户明确要求"快速原型"或"跳过设计"
- 纯文档编写（非技术设计）
