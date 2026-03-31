# 模板变量分层模型（Template Variable Model）

## 目标

避免“空配置时变量替换后语义损坏”的问题，确保模板在以下场景都可执行：

1. 用户未配置任何 profile 扩展能力
2. profile 字段存在但内容为空（如 `tools: []`、`skills: []`）
3. 用户仅配置了部分能力（不完整配置）

---

## 三类变量（必须分层）

### 1. 结构变量（Structural）

**定义**：用于拼接列表、frontmatter、参数片段。  
**允许为空**，但模板必须对空值安全。

示例：

- `INFRA_CATALOG_TOOL_IDS_APPEND`
- `DEVELOP_SKILLS_APPEND`

设计规则：

- 仅用于“可选追加位”（如 `tools: Read{{...}}`）
- 变量值内部自行处理前导逗号、空格
- 不要把结构变量放进“必须执行”的语义句

---

### 2. 行为变量（Behavioral）

**定义**：驱动 agent 行为的规则语句/任务指令。  
**绝对不能是空字符串**，必须始终是完整句子。

示例：

- `DEVELOP_SKILLS_RULE_LINE`
- `DEVELOP_SKILLS_TASK_INSTRUCTION`
- `DEVELOP_SKILLS_APPLY_ITEM`

设计规则：

- 变量必须是“完整可执行句”，不是词组或名称片段
- 必须提供 default fallback（无配置时仍可执行）
- 有配置时再替换为更强约束版本

---

### 3. 展示变量（Display）

**定义**：用于文档说明、工具列表、人可读提示。  
**不应为空白**，空配置时应给“未配置”或替代说明。

示例：

- `INFRA_CATALOG_OVERVIEW_TOOLS_MD`
- `INFRA_CATALOG_SEARCH_TOOLS_MD`
- `INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD`
- `DEVELOP_SKILLS_USAGE_MD`

设计规则：

- 空配置下使用 `（未配置）` 或一句明确说明
- 不能让最终文档出现“空列表项”或语义断裂

---

## 当前建议的默认值策略

### develop skills 为空时

- `DEVELOP_SKILLS_APPEND = ""`
- `DEVELOP_SKILLS_NAMES = ""`（仅兼容旧逻辑，不应在模板新语句中使用）
- `DEVELOP_SKILLS_RULE_LINE = "MUST 遵循项目现有开发规范；若无现成规范，遵循通用工程最佳实践并保持与现有代码风格一致。"`
- `DEVELOP_SKILLS_TASK_INSTRUCTION = "查询并确认本项目的开发规范（优先使用已有规范文档或代码库最佳实践），作为后续实现的权威参考。"`
- `DEVELOP_SKILLS_APPLY_ITEM = "- 项目开发规范（如已配置 develop skills，优先使用对应 skills）: 开发规范/开发经验"`
- `DEVELOP_SKILLS_USAGE_MD = "- 当前未配置额外 develop skills；请优先参考项目内规范文档与现有代码实践。"`

### infra 工具为空时

- `INFRA_CATALOG_TOOL_IDS_APPEND = ""`
- `INFRA_CATALOG_OVERVIEW_TOOLS_MD = "（未配置）"`
- `INFRA_CATALOG_SEARCH_TOOLS_MD = "（未配置）"`
- `INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD = "（未配置）"`

### querying-infra-catalog 能力开关

判定条件：

- 当 `mcp_tool_definitions.overview/search/specifications` 三组 tools 全为空时，视为 **未启用 querying 能力**
- 只要任意一组存在非空 tool id，视为 **启用 querying 能力**

未启用时（必须降级）：

- 不注入 `.claude/skills/querying-infra-catalog`
- 模板中不得出现 “MUST 使用 querying-infra-catalog skill …” 的硬约束
- 使用 fallback 行为变量替换为“代码库/文档取证”路径：
  - `QUERYING_INFRA_RULE_LINE`
  - `QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION`
  - `QUERYING_INFRA_SEARCH_TASK_DESCRIPTION`
  - `QUERYING_INFRA_FACT_CHECK_SOURCE`
  - `QUERYING_INFRA_APPLY_ITEM`
  - `QUERYING_INFRA_QUALITY_USAGE_LINE`

启用时（恢复强约束）：

- 注入 `.claude/skills/querying-infra-catalog`
- 上述变量切换为 querying 技能导向文案（可要求 MUST 调用）

---

## 反例（禁止）

以下写法会在空配置下产生坏文案：

- `MUST 使用 {{DEVELOP_SKILLS_NAMES}} skill ...`
- `- {{SOME_NAMES}} skill: ...`

原因：`SOME_NAMES` 为空时会变成语义残缺句。

另一个常见反例：

- 在模板中直接写死 `querying-infra-catalog` 相关 MUST 语句，而不走能力开关变量

原因：当 querying 能力未启用时，文档会要求调用一个不存在的 skill，导致执行混乱。

---

## 推荐模板写法（能力开关）

配置/规则类模板中，使用行为变量占位而不是写死 skill 名：

```yaml
rules:
  design:
    - {{QUERYING_INFRA_RULE_LINE}}
```

schema 指令中使用条件语义变量：

```yaml
- Description: "{{QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION}}"
- Description: "{{QUERYING_INFRA_SEARCH_TASK_DESCRIPTION}}"
```

agent 使用说明中使用条件语义变量：

```md
{{QUERYING_INFRA_QUALITY_USAGE_LINE}}
```

---

## 模板开发检查清单

新增变量时，必须通过以下检查：

1. 该变量属于结构/行为/展示哪一类？
2. 如果为空，模板渲染后句子是否仍然完整？
3. 是否需要 fallback？fallback 是否可执行？
4. 是否会在 frontmatter 或 markdown 列表中留下无效空行？
5. 是否与 `TemplateProcessor` 的“未定义变量清理”行为一致？

---

## 迁移建议

1. 保留 `DEVELOP_SKILLS_NAMES` 仅用于兼容，禁止新增引用。
2. 新模板优先使用行为变量（完整语义句）。
3. UI 导出的 profile 配置可为空，但后端必须兜底生成可执行变量。
