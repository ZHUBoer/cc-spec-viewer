# 自定义变量注入功能使用指南

## 概述

SpecForge 现在支持在 Profile 配置中定义自定义变量，这些变量会在模板注入时自动替换到 agent 和 skill 文件中。

## 功能特性

- ✅ 在 Profile JSON 中定义任意键值对变量
- ✅ 变量自动注入到所有模板文件
- ✅ 支持覆盖预定义变量
- ✅ 完整的类型安全（Zod Schema 验证）
- ✅ 向后兼容（custom_variables 字段可选）

## 快速开始

### 1. 在 Profile 中定义自定义变量

在 `template-to-project/profiles/your-profile.json` 中添加 `custom_variables` 字段：

```json
{
  "displayName": "我的自定义 Profile",
  "description": "包含业务相关的自定义配置",
  "custom_variables": {
    "COMPANY_NAME": "Ctrip",
    "PROJECT_TYPE": "H5 Web Application",
    "API_BASE_URL": "https://api.example.com",
    "BUSINESS_DOMAIN": "旅游电商"
  },
  "infra_catalog": {
    "mcp_server_providers": { ... },
    "mcp_tool_definitions": { ... }
  }
}
```

### 2. 在模板中使用变量

在模板文件（如 `.claude/agents/*.md`）中使用 `{{变量名}}` 语法：

```markdown
---
name: my-agent
description: {{COMPANY_NAME}} 的 {{PROJECT_TYPE}} 开发助手
---

# {{COMPANY_NAME}} 开发规范

项目类型：{{PROJECT_TYPE}}
业务领域：{{BUSINESS_DOMAIN}}
API 基础 URL：{{API_BASE_URL}}
```

### 3. 执行注入

在 SpecForge Web UI 中：
1. 选择包含 custom_variables 的 Profile
2. 点击"初始化"按钮
3. 变量会自动替换到生成的文件中

## 预定义变量

以下变量由系统自动生成，你也可以通过 custom_variables 覆盖它们：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PROJECT_ROOT` | 项目路径 | 项目根目录绝对路径 |
| `VERSION` | "1.0.0" | SpecForge 版本号 |
| `INFRA_CATALOG_TOOL_IDS_APPEND` | (自动生成) | MCP 工具 ID 追加片段 |
| `INFRA_CATALOG_OVERVIEW_TOOLS_MD` | (自动生成) | Overview 工具列表 (Markdown) |
| `INFRA_CATALOG_SEARCH_TOOLS_MD` | (自动生成) | Search 工具列表 (Markdown) |
| `INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD` | (自动生成) | Specifications 工具列表 (Markdown) |
| `INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD` | (自动生成) | 工具定义表格 (Markdown) |
| `DEVELOP_SKILLS_APPEND` | (自动生成) | Skills 追加片段 |
| `DEVELOP_SKILLS_USAGE_MD` | (自动生成) | Skills 使用说明 (Markdown) |
| `CODE_EXAMPLES_MD` | (自动生成) | 代码示例文档 (Markdown) |

## 变量优先级

```
自定义变量 (custom_variables) > infra_catalog 衍生变量 > 基础变量
```

如果 custom_variables 中定义了与预定义变量同名的键，custom_variables 的值会覆盖预定义值。

## 示例 Profile

完整示例见：`template-to-project/profiles/example-custom-variables.json`

```json
{
  "displayName": "自定义变量示例 Profile",
  "description": "展示如何使用 custom_variables",
  "custom_variables": {
    "COMPANY_NAME": "Ctrip",
    "PROJECT_TYPE": "H5 Web Application",
    "API_BASE_URL": "https://api.example.com",
    "BUSINESS_DOMAIN": "旅游电商"
  },
  "infra_catalog": { ... }
}
```

## 变量命名规范

建议遵循以下规范：

- ✅ 使用全大写字母 + 下划线（如 `MY_CUSTOM_VAR`）
- ✅ 语义化命名（如 `API_BASE_URL` 而不是 `URL1`）
- ✅ 避免与预定义变量冲突（除非有意覆盖）
- ❌ 避免使用特殊字符或空格

## 注意事项

1. **类型限制**：所有变量值必须是字符串（Zod Schema 强制验证）
2. **大小写敏感**：`{{VAR}}` 和 `{{var}}` 是不同的变量
3. **未定义变量**：如果模板中使用了未定义的变量，该变量占位符会原样保留（不会被替换）
4. **JSON 格式**：确保 Profile JSON 格式正确，否则加载会失败

## 技术实现

### 后端

- **ProfileConfigService.ts**: 处理 custom_variables 的解析和合并
- **TemplateProcessor.ts**: 执行变量替换（`{{VAR}}` → 实际值）
- **Zod Schema**: 验证 custom_variables 格式

### 前端

- **OpenSpecSetupPanel.tsx**: UI 选择 Profile
- **SpecDashboardService.ts**: API 调用和数据验证

## 故障排查

### 变量没有被替换

1. 检查 Profile JSON 中是否正确定义了 custom_variables
2. 确认变量名拼写正确（大小写敏感）
3. 确认模板文件使用了 `{{VAR_NAME}}` 语法
4. 检查浏览器控制台是否有错误信息

### Profile 加载失败

1. 验证 JSON 格式是否正确（使用 JSON 验证器）
2. 确认 custom_variables 的值都是字符串类型
3. 查看 Web UI 中的警告信息

### 类型错误

如果遇到 TypeScript 类型错误：
```bash
pnpm typecheck  # 检查类型错误
pnpm fix        # 修复格式问题
```

## 扩展和自定义

### 添加新的预定义变量

1. 在 `TemplateVariables` 接口添加字段
2. 在 `generateTemplateVariables` 方法中实现生成逻辑
3. 在模板文件中使用 `{{NEW_VAR}}`

### 创建自定义 Profile

复制 `example-custom-variables.json` 并修改：
- 修改 `displayName` 和 `description`
- 在 `custom_variables` 中添加你的变量
- 配置 `infra_catalog` 以匹配你的基建能力

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/server/core/openspec/services/ProfileConfigService.ts` | Profile 配置管理 |
| `src/server/core/openspec/services/TemplateProcessor.ts` | 模板处理引擎 |
| `template-to-project/profiles/example-custom-variables.json` | 示例 Profile |
| `template-to-project/.claude/agents/quality-gate-agent.md` | 使用变量的模板示例 |

## 版本历史

- **v3.2.26+**: 添加 custom_variables 支持
  - 在 Profile Schema 中添加 `custom_variables` 字段
  - 在 `generateTemplateVariables` 中合并自定义变量
  - 更新模板文件使用变量占位符
