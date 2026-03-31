---
name: d2c-baseline
description: 基于 spec.md（兼容 proposal.md）中的 D2C 配置，在 Spec 确认后调用 design-to-code-zx MCP 生成静态 UI 基线产物，并检查视觉与交互闭环。这是 Spec 确认后、进入 design 前的**强制门禁**——前端/全栈 change 未经此技能禁止进入 design 阶段。适用于前端/全栈 change 的 D2C checkpoint。
---

# D2C 静态基线生成

## 目标

在不引入业务逻辑的前提下，将 Figma section / node link 转换为可审阅的静态 UI 产物，并收口到当前 change 的 `d2c/` 目录中。

## 输入来源

- `spec.md`（兼容历史 `proposal.md`）中的 D2C 注释配置：
  - `D2C_ENABLED`
  - `D2C_TARGET_SCOPE`
  - `D2C_CHANGE_KIND`
  - `D2C_MATERIALS_JSON`
- 当前 change 目录

## 执行规则

1. 优先读取当前 change 的 `spec.md`；若不存在，则兼容读取历史 `proposal.md`。
2. 若 `D2C_ENABLED != true`，停止执行并提示当前 change 未启用 D2C。
3. 若 Spec 尚未确认，停止执行并提示先确认 Spec。
4. 若缺少 `D2C_MATERIALS_JSON` 或材料列表为空，停止执行并提示补充 Figma section / node link 与关键说明。
5. 解析 `D2C_MATERIALS_JSON`，每条材料至少包含：
   - `link`：Figma section / node link
   - `description`：本次实现范围的关键自然语言说明
   - `scope`：页面 / 模块 / 组件
6. 按材料顺序调用 `design-to-code-zx` MCP，输入 Figma section / node link 与关键说明，获取静态 UI 代码。
6.1. 为每条材料生成稳定的 `artifact-id`，并在 `manifest.json` 的 materials 中写入 `artifactId`。
     - 默认命名规则：按材料顺序生成 `d2c产物01`、`d2c产物02`……（两位数不足补 0）。
     - 若有更语义化的命名，也可替换默认命名，但必须保持稳定且可读。
7. D2C 产物仅作为视觉与交互基线；禁止把当前生成代码视为最终组件实现真源。
8. 仅输出静态 UI，禁止添加业务逻辑、接口调用、状态管理。
9. 产物必须写入：
   - `openspec/changes/<change-id>/d2c/manifest.json`
   - `openspec/changes/<change-id>/d2c/<artifact-id>/index.tsx`
   - `openspec/changes/<change-id>/d2c/<artifact-id>/index.module.scss`
   - `openspec/changes/<change-id>/d2c/review.md`
   - 每条材料都必须对应一个 `<artifact-id>` 目录；`artifact-id` 必须稳定且可读。

10. **闭环检查**：基于 proposal 的业务逻辑流程图执行闭环检查：
    - `D2C_CHANGE_KIND = new`：检查静态 UI 自身的入口、状态切换、反馈与出口是否闭环
    - `D2C_CHANGE_KIND = modify`：按以下步骤分析改动范围与现有交互链路：
      - 10.M1：使用 Glob 定位 `D2C_TARGET_SCOPE` 指定的现有实现文件（如页面组件、模块目录）
      - 10.M2：读取定位到的文件，提取现有交互链路（入口节点 → 用户操作 → 状态变更 → 反馈/出口）
      - 10.M3：对比 D2C 产物中的节点与现有链路，逐一标注每个节点的状态：保留 / 替换 / 新增 / 缺失
      - 10.M4：对"缺失"节点评估影响——若影响已有闭环路径，升级为阻塞缺口（🔴）；否则为可接受缺口（🟡）

    10.1. **结构化覆盖度检查（BLOCKING）**：
       - 读取 `proposal.md` 中的"需求清单（Requirements）"，提取每个 requirement 的 Acceptance Criteria
       - 按以下维度逐条检查 D2C 产物（每条材料对应的 `index.tsx`）是否有对应 UI 表达：
         - **主路径（Happy Path）**：每个 requirement 的核心操作流程是否有入口 → 操作 → 反馈的完整节点
         - **错误/异常态**：每个涉及网络请求或用户操作的场景，是否有错误提示 UI
         - **空态（Empty State）**：列表/数据类场景，是否有无数据时的展示节点
         - **加载态（Loading/Skeleton）**：涉及异步数据的场景，是否有加载中状态
         - **多步骤流程**：多步骤场景，每一步是否都有对应的 UI 节点
         - **场景完整性**：`D2C_CHANGE_KIND=modify` 时，改动涉及的现有交互链路是否完整覆盖

    10.2. **缺口分级与用户确认（BLOCKING）**：
       - **🔴 阻塞缺口**：主路径中有 requirement 完全没有 UI 入口，或多步骤流程缺少关键步骤节点
         - MUST 调用 `AskUserQuestion` 向用户确认，同时在 `review.md` 记录缺口清单
         - 禁止在有阻塞缺口时设置 `reviewStatus=passed`
       - **🟡 可接受缺口**：错误态/空态/加载态缺失，但主路径完整
         - MUST 调用 `AskUserQuestion` 向用户确认
         - 选项构造：`[{label: "标注为 known gap，继续", description: "缺失场景在 design 阶段补充说明"}, {label: "需要补充 Figma 材料", description: "提供对应场景的 Figma section/node link"}]`
         - 用户确认 known gap 后可设置 `reviewStatus=passed`，并在 `reviewSummary` 中列明 known gap 列表

11. 当前阶段只检查视觉完整、交互闭环、场景闭环；禁止分析技术实现、后端接口、契约与固定值。
12. `review.md` 只承担人工审查记录，不作为脚本门禁真源；脚本门禁必须以 `manifest.json` 中的结构化 review 字段为准。
13. `review.md` 至少记录：
    - 本次使用的材料列表与关键说明
    - `change_kind`
    - 闭环检查范围
    - 闭环结论：通过 / 不通过
    - 是否允许进入 design
    - 若为 `modify`，引用了哪些现有文件辅助判断（步骤 10.M1~10.M3 的分析结果）

## 产物格式约束（Live Preview 兼容性）

生成的每份 `<artifact-id>/index.tsx` 必须满足以下约束，以确保 SpecForge live preview 可正确渲染：

1. **入口必须是标准命名导出**：`export default function ComponentName` 或 `const ComponentName = ...; export default ComponentName`
2. **import 语句必须为单行**：禁止跨行 `import { \n ... \n } from '...'` 格式（若格式化工具自动拆行，需在产物中合并为单行）
6. **禁止在 TSX 中包含 `</script` 字面字符串**（会导致 HTML 标签截断）

## manifest 约定

`manifest.json` 最少包含：

```json
{
  "enabled": true,
  "changeKind": "new",
  "materials": [
    {
      "link": "https://figma.com/design/...section-link",
      "description": "活动页首屏与购买入口",
      "scope": "page",
      "artifactId": "activity-hero"
    }
  ],
  "reviewStatus": "passed",
  "canEnterDesign": true,
  "reviewSummary": "视觉与交互闭环通过，可进入 design",
  "generator": "design-to-code-zx",
  "generatedAt": "2026-03-06T00:00:00.000Z",
  "entryFiles": ["activity-hero/index.tsx", "activity-hero/index.module.scss"],
  "sourceHash": "可选",
  "reviewPath": "review.md"
}
```

> `entryFiles` 必须包含所有材料的入口文件（每个 `<artifact-id>/index.tsx` 与 `index.module.scss`）。

## 输出要求

- 只汇报：
  - 是否生成成功
  - 产物目录
  - 入口文件
  - 材料数量与关键说明摘要
  - 视觉与交互闭环检查结论
  - manifest 中写入的 `reviewStatus`、`canEnterDesign`、`reviewSummary`
  - 是否可进行 UI 基线确认
- 不推进到 design 阶段
- **不替用户自动确认 UI 基线**：执行完毕后不自动写入 `D2C_BASELINE_FROZEN=true`；必须等待用户在界面中点击底部“确认 UI 基线”按钮后，再将 `spec.md`（兼容历史 `proposal.md`）中的对应注释字段更新为 `D2C_BASELINE_FROZEN=true`，并同时写入 `D2C_BASELINE_FROZEN_AT=<ISO8601 时间戳>`。这两个字段将被 `d2c-stitching` 技能读取作为触发前置条件。
- **回复话术约束**：当审查通过、UI 基线可确认时，必须提示用户“请点击底部‘确认 UI 基线’按钮”，不要要求用户再输入“确认冻结基线”等口令。
- **审查失败时的回复约束**：若审查未通过，不要默认要求用户“重新生成静态 UI”。必须明确说明失败原因，并列出需要补充的视觉材料、交互闭环说明或 UI 基线决策问题，引导用户回到会话中继续补充信息。
- **人工放行约束**：若用户决定在风险可接受的前提下继续，人工放行由系统在 `spec.md` 中写入 `D2C_REVIEW_OVERRIDE` 相关注释完成；你不得擅自把 `manifest.json.reviewStatus` 从 `failed` 改成 `passed` 来伪造通过。

## 字段写入契约（跨技能协作）

| 字段 | 写入时机 | 读取方 |
|---|---|---|
| `D2C_BASELINE_FROZEN=true` | 用户点击界面中的“确认 UI 基线”按钮后，由 Claude 更新 `spec.md`（兼容历史 `proposal.md`） | `d2c-stitching`（触发前必须为 true） |
| `D2C_BASELINE_FROZEN_AT=<ISO8601>` | 与 `D2C_BASELINE_FROZEN` 同步写入 `spec.md`（兼容历史 `proposal.md`） | 前端状态展示、审计追溯 |
| `D2C_REVIEW_OVERRIDE=true` | 审查失败且用户明确承担风险时，由系统写入 `spec.md`（兼容历史 `proposal.md`） | 前端门禁判断、`d2c-stitching` 风险识别 |
| `manifest.json.canEnterDesign` | 本技能执行完毕写入 | design 阶段（门禁校验） |
