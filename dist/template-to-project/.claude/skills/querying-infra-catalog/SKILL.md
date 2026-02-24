---
name: querying-infra-catalog
description: 查询业务线内部“组件库/端能力事实源”的组件和 API。适用于：(1) 实现 UI 组件，(2) 调用内部端 API，(3) 需要精确的 props/参数规范，(4) 开始集成内部能力，(5) 解决导入/参数错误。
---

# 查询组件/端能力事实源（按分组工具）

通过 MCP 查询“组件库/端能力事实源”以获取精确规范。

> [!NOTE]
> 本 Skill 是**MCP-First 规则**的实操指南。

## 快速参考

| 需求 | 分组 | 说明 |
|------|------|------|
| 建立基建边界/限制/核心规范 | `overview` | 适合开始任务前建立全景认知 |
| 不确定名称/能力时探索 | `search` | 通过自然语言检索拿到候选信息 |
| 需要精确规格（属性/参数/行为/约束） | `specifications` | 对已明确的目标做精查 |

## 当前项目已安装的分组工具（IMPORTANT）

{{INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD}}

## 智能调用策略 (CRITICAL!)

> **⚠️ 调用顺序规则 (MANDATORY)**:
> 1. **MUST 第一步**: 调用 `overview` 工具建立全景认知 — 了解所有可用能力类别、边界限制、核心规范
> 2. **第二步（智能选择）**:
>    - **若 overview 已明确组件/API 名称** → 直接调用 `specifications` 获取精确规格
>    - **若需要进一步探索** → 使用 `search` 工具查找 → 再调用 `specifications`
> 3. **禁止**: 跳过 overview 直接使用 search 或 specifications
>
> **原则**: 优先使用高信息密度的 `specifications`（结构化规格），仅在不确定目标时才使用 `search`（RAG 探索）。

## 关键原则

**务必先查询。切勿依赖记忆或猜测。**

组件与 API 的 props/参数会随版本变化；实施前务必查 MCP 拿到真实定义。

## 对象调用式（推荐范式）

> 目标：不依赖“固定工具名”，而是按分组选择 tool id。**同一分组可能存在多个 tools**，调用前务必先确认你选的是哪个 tool。

- **overview tools**：{{INFRA_CATALOG_OVERVIEW_TOOLS_MD}}
- **search tools**：{{INFRA_CATALOG_SEARCH_TOOLS_MD}}
- **specifications tools**：{{INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD}}

```javascript
// 先从对应分组的 tools 列表里复制一个 tool id，替换下方占位符：

// 1) overview：建立边界/限制/规范（参数以 tool schema 为准；若无必填参数可直接调用）
<OVERVIEW_TOOL_ID>({
  // ...按 schema 填写（如有）
});

// 2) search：不确定名称/能力时探索（常见字段示例：question；以 schema 为准）
<SEARCH_TOOL_ID>({
  // question: "如何实现登录功能"
});

// 3) specifications：已确定目标后精查规格（常见字段示例：names；以 schema 为准）
<SPECIFICATIONS_TOOL_ID>({
  // names: ["Button", "Input", "Modal"]
});
```

## 工作流程

1. **确定需求**：从任务中提取所需的组件/API/能力点
2. **选择分组**：`overview` / `search` / `specifications`
3. **选择 tool**：从该分组的 tools 列表中复制一个 tool id
4. **按 schema 调用**：Claude Code 会展示 tool 的 schema/description，按其约束组织参数
5. **实施**：严格按返回的规格实现
6. **取证**：把涉及的外部边界写入 `HANDOFF_DATA.interfaces[]`

> 注意：如果某分组显示为“未配置”，说明该项目未安装对应能力。**仅当当前任务必须依赖该分组工具获取事实源，且没有可复核替代证据**时，才需要阻塞并要求重新运行 `npx @ctrip/spec-forge init` + 重启 Claude Code；否则可基于现有代码/文档继续，但不得猜测新的 props/参数/行为。

## 错误处理

**如果 MCP 查询失败或无结果**：

1. 检查组件/API 名称拼写（区分大小写）
2. 用 `search` 分组尝试更广泛的自然语言搜索
3. 检查 `.mcp.json` 是否包含对应 server，且 `.claude/settings.json` 已放行对应 tool
4. 兜底：查看业务线文档/组件库官方文档
