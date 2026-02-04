# 一键安装

Claude Code 的工具 ID 是 claude,以下是一条命令完成安装和初始化的方式:  
 一键安装命令 全局安装 + 初始化(在当前目录) npm install -g openspec && openspec init --tools claude
全局安装 + 在指定项目目录初始化
npm install -g openspec && cd /path/to/your/project && openspec init --tools claude
说明

1. --tools 参数支持非交互式配置:


    - --tools claude - 仅配置 Claude Code
    - --tools all - 配置所有支持的工具
    - --tools claude,cursor - 配置多个工具(逗号分隔)

2. 工具 ID 来自 src/core/config.ts:24:
   { name: 'Claude Code', value: 'claude', skillsDir: '.claude' }
3. 使用 --tools 参数后,会跳过交互式选择,直接使用指定的工具进行初始化
   额外选项
   如果需要在初始化时自动清理旧文件(无需确认),可以添加 --force 参数:
   npm install -g openspec && openspec init --tools claude --force
   这样用户就可以用一条命令完成全部安装,无需交互式选择 IDE 了。

# profile配置写入

📐 架构概览

Profile 配置文件 (JSON)  
 ↓  
 InfraCatalogManager (解析 + 生成模板变量)  
 ↓
TemplateProcessor (变量替换 + @引用解析)
↓
目标文件 (Agents/Skills/Config)
↓
外部集成 (MCP 服务器/.mcp.json)

---

1️⃣ 配置文件结构（数据源）

位置: templates/profiles/ctrip-prd-to-code-xtaro-zx.json

{
"type": "prd-to-code",
"profile": "ctrip-prd-to-code-xtaro-zx",
"infra_catalog": {
"mcp_server_providers": {
"xtaro-zx-library": {
"url": "http://...",
"type": "http"
}
},
"mcp_tool_definitions": {
"overview": {
"description": "业务基建/框架全景认知能力",
"tools": ["mcp__xtaro-zx-library__xtaro-getting-started"]
},
"search": {
"description": "探索与发现能力",
"tools": ["mcp__xtaro-zx-library__xtaro-zx-search"]
},
"specifications": {
"description": "精准规格查阅能力",
"tools": ["mcp__xtaro-zx-library__xtaro-zx-components-info"]
}
},
"develop_skills": {
"description": "开发过程中 agent 需要的开发经验",
"gitUrl": "http://git.dev.sh.ctripcorp.com/...",
"skills": ["zx-fe-skills/*"]
},
"code_examples": {
"description": "仓库代码最佳实践示例",
"examples": [
{
"name": "最佳实践页面",
"paths": ["app/demo"]
}
]
}
}
}

---

2️⃣ 核心模块解析

ProfileManager - 配置文件加载器

路径: lib/installer/profile-manager.js

class ProfileManager {
async loadProfilePreset(profileName) {
const profilePath = path.join(
this.templateDir,
"profiles",
`${profileName}.json`
);
return await fs.readJson(profilePath);
}

    async setupSpecforgeConfig(profile, validateFn, extractFn) {
      const preset = await this.loadProfilePreset(profile);

      // 写入到 .specforge/config.json
      await fs.writeFile(
        targetPath,
        JSON.stringify(preset, null, 2)
      );

      // 验证并提取 infra catalog
      validateFn(preset);
      await extractFn(preset);
    }

}

---

InfraCatalogManager - 配置解析与模板变量生成

路径: lib/installer/infra-catalog-manager.js

核心功能 1：解析工具定义

normalizeInfraCatalogToolDefinitions(toolDefinitions) {
const groupNames = ["overview", "search", "specifications"];
const groups = {};

    // 按分组整理工具
    for (const name of groupNames) {
      groups[name] = {
        description: def.description,
        tools: this.normalizeToolIds(def.tools)
      };
    }

    // 收集所有工具 ID（用于权限白名单）
    const allToolIds = this.normalizeToolIds(allToolIdsRaw);

    return { groups, allToolIds };

}

核心功能 2：生成模板变量

applyInfraCatalogTemplateVariables() {
// 1. 全量工具 ID（用于 agent frontmatter 的 tools: 追加）
this.config.INFRA_CATALOG_TOOL_IDS_APPEND =
toolIds.length > 0 ? `, ${toolIds.join(", ")}` : "";

    // 2. 分组描述（用于 Skill 文档）
    this.config.INFRA_CATALOG_OVERVIEW_DESC = groups.overview.description;
    this.config.INFRA_CATALOG_SEARCH_DESC = groups.search.description;
    this.config.INFRA_CATALOG_SPECIFICATIONS_DESC =
      groups.specifications.description;

    // 3. 分组工具列表（Markdown 格式）
    this.config.INFRA_CATALOG_OVERVIEW_TOOLS_MD =
      this.formatInfraCatalogToolsMd(groups.overview.tools);

    // 4. 工具定义表格（完整 Markdown 表格）
    this.config.INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD =
      this.buildInfraCatalogToolDefinitionsTableMd(groups);

}

核心功能 3：动态安装 Skills

async installAndApplyDevelopSkills(infraCatalog) {
const devSkillsConfig = infraCatalog?.develop_skills || {};
const skillManager = new SkillManager(this.projectDir);

    // 从 Git 拉取并安装 Skills
    const installedSkills = await skillManager.installSkills(
      devSkillsConfig.gitUrl,
      devSkillsConfig.skills
    );

    // 生成 frontmatter 追加片段
    this.config.DEVELOP_SKILLS_APPEND =
      names.length > 0 ? `, ${names.join(", ")}` : "";

    // 生成 Skill 使用说明（Markdown）
    this.config.DEVELOP_SKILLS_USAGE_MD = lines.join("\n");

}

核心功能 4：代码示例注入

applyCodeExamplesTemplateVariables(infraCatalog) {
const examples = infraCatalog?.code_examples?.examples || [];

    const lines = [];
    lines.push("### 代码最佳实践参考");

    for (const example of examples) {
      lines.push(`#### ${example.name}`);
      lines.push(`> ${example.description}`);

      for (const p of example.paths) {
        lines.push(`- \`${p}\``);
      }
    }

    this.config.CODE_EXAMPLES_MD = lines.join("\n");

}

---

TemplateProcessor - 模板处理引擎

路径: lib/installer/template-processor.js

功能 1：变量替换

processTemplate(content, variables) {
let processed = content;

    // 替换自定义变量（如 {{INFRA_CATALOG_TOOL_IDS_APPEND}}）
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      processed = processed.replace(regex, variables[key]);
    });

    // 替换通用变量
    processed = processed.replace(/{{PROJECT_ROOT}}/g, this.projectDir);
    processed = processed.replace(/{{VERSION}}/g, this.config.version);

    return processed;

}

功能 2：@引用解析（递归内联）

async resolveAgentReferences(content, basePath, visited = new Set()) {
const lines = content.split("\n");
const resolvedLines = [];

    for (const line of lines) {
      // 匹配 @../../.specforge/rules/AGENT-RULES-IMPL.md
      if (line.trim().startsWith("@") && line.trim().endsWith(".md")) {
        const refPath = line.slice(1);
        const fullRefPath = path.resolve(path.dirname(basePath), refPath);

        if (await fs.pathExists(fullRefPath)) {
          let refContent = await fs.readFile(fullRefPath, "utf8");

          // ⚠️ 关键：引用内容也需要处理模板变量！
          refContent = this.processTemplate(refContent, this.config);

          // 递归处理嵌套引用
          refContent = await this.resolveAgentReferences(
            refContent,
            fullRefPath,
            new Set(visited)
          );

          resolvedLines.push(refContent);
        }
      } else {
        resolvedLines.push(line);
      }
    }

    return resolvedLines.join("\n");

}

---

SettingsConfigurator - MCP 配置注入

路径: lib/installer/settings-configurator.js

功能 1：增量合并 .mcp.json

async configureMcpServers() {
const infraServers = this.infraCatalog?.mcpServers || {};
const targetPath = path.join(this.projectDir, ".mcp.json");

    // 读取现有配置（或创建新配置）
    let existingConfig = await fs.readJson(targetPath) || {};
    existingConfig.mcpServers = existingConfig.mcpServers || {};

    // 增量补齐缺失的服务器
    for (const [name, config] of Object.entries(infraServers)) {
      if (!existingConfig.mcpServers[name]) {
        existingConfig.mcpServers[name] = config;
      }
    }

    await fs.writeFile(
      targetPath,
      JSON.stringify(existingConfig, null, 2)
    );

}

功能 2：补齐 settings.json 权限白名单

async ensureSettingsAllowlist() {
const settingsPath = path.join(this.collectiveDir, "settings.json");
const settings = await fs.readJson(settingsPath);

    settings.permissions = settings.permissions || {};
    const allow = settings.permissions.allow || [];

    // 补齐 infra_catalog 工具 ID
    for (const toolId of this.infraCatalog.toolIds) {
      if (!allow.includes(toolId)) {
        allow.push(toolId);
      }
    }

    settings.permissions.allow = allow;
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

}

---

SkillManager - 动态 Skill 安装

路径: lib/skill-manager.js

async installSkills(gitUrl, skillsList) {
const tempDir = path.join(os.tmpdir(), "specforge-skills-" + Date.now());

    // 1. 克隆 Git 仓库
    execSync(`git clone --depth 1 ${gitUrl} ${tempDir}`);

    // 2. 遍历配置的 Skill 路径（支持通配符 zx-fe-skills/*）
    for (const skillPath of skillsList) {
      if (skillPath.endsWith("/*")) {
        // 处理通配符：安装目录下所有 Skill
        const parentDir = skillPath.slice(0, -2);
        const children = await fs.readdir(parentDir);

        for (const child of children) {
          await this.installSingleSkill(sourcePath, skillName);
        }
      } else {
        // 安装单个 Skill
        await this.installSingleSkill(sourcePath, skillName);
      }
    }

    return installedSkills; // 返回 [{name, description}]

}

---

3️⃣ 模板文件使用示例

Agent 模板 (templates/.claude/agents/implementation-agent.md)

---

name: implementation-agent
tools: LS, Read, Write, Bash{{INFRA_CATALOG_TOOL_IDS_APPEND}}
skills: code-inspector, querying-infra-catalog{{DEVELOP_SKILLS_APPEND}}

---

## Skills 使用

- **使用内部组件/API 前** → 使用 `querying-infra-catalog` Skill 查询
  {{DEVELOP_SKILLS_USAGE_MD}}

{{CODE_EXAMPLES_MD}}

---

@../../.specforge/rules/AGENT-RULES-IMPL.md

安装后生成：

---

tools: LS, Read, Write, Bash, mcp**xtaro-zx-library**xtaro-getting-started, mcp**xtaro-zx-library**xtaro-zx-search
skills: code-inspector, querying-infra-catalog, zx-h5-develop-experience

---

## Skills 使用

- **开发经验/知识**：`zx-h5-develop-experience` skill, 提供智行公共前端开发流程规范

### 代码最佳实践参考

#### 最佳实践页面

> 展示项目中一个标准页面的开发规范

**参考路径**:

- `app/demo`

---

Skill 模板 (templates/.claude/skills/querying-infra-catalog/SKILL.md)

## 当前项目已安装的分组工具

{{INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD}}

## 对象调用式（推荐范式）

- **overview tools**：{{INFRA_CATALOG_OVERVIEW_TOOLS_MD}}
- **search tools**：{{INFRA_CATALOG_SEARCH_TOOLS_MD}}
- **specifications tools**：{{INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD}}

安装后生成：

## 当前项目已安装的分组工具

| 分组           | 说明                      | tools                                             |
| -------------- | ------------------------- | ------------------------------------------------- |
| overview       | 业务基建/框架全景认知能力 | `mcp__xtaro-zx-library__xtaro-getting-started`    |
| search         | 探索与发现能力            | `mcp__xtaro-zx-library__xtaro-zx-search`          |
| specifications | 精准规格查阅能力          | `mcp__xtaro-zx-library__xtaro-zx-components-info` |

## 对象调用式（推荐范式）

- **overview tools**：`mcp__xtaro-zx-library__xtaro-getting-started`
- **search tools**：`mcp__xtaro-zx-library__xtaro-zx-search`
- **specifications tools**：`mcp__xtaro-zx-library__xtaro-zx-components-info`

---

4️⃣ 完整安装流程（主入口）

位置: lib/installer.js (CollectiveInstaller)

async install() {
// 1. 加载 Profile 配置
this.specforgeConfig = await this.profileManager.setupSpecforgeConfig(
this.profile,
(config) => this.infraCatalogManager.validateInfraCatalogConfig(config),
(config) => this.infraCatalogManager.extractInfraCatalogFromConfig(config)
);

    // 2. 安装 Agent 文件（带模板处理和 @引用解析）
    await this.installAgents();

    // 3. 安装 Skill 文件
    await this.installSkills();

    // 4. 配置 settings.json（补齐权限白名单）
    await this.settingsConfigurator.configureSettings();

    // 5. 配置 .mcp.json（增量合并 MCP 服务器）
    await this.settingsConfigurator.configureMcpServers();

    // 6. 外部集成（TaskMaster/日志/.gitignore）
    await this.externalIntegrations.setupTaskMaster();
    await this.externalIntegrations.updateGitignore();

}

---

5️⃣ 关键设计原则

✅ 增量合并策略

- .mcp.json：只追加缺失的 MCP 服务器，不覆盖现有配置
- settings.json：只补齐权限白名单，保留用户自定义配置
- package.json：只注入必要脚本，不破坏现有结构

✅ 模板变量命名规范

// 追加片段（用于 frontmatter）
INFRA_CATALOG_TOOL_IDS_APPEND = ", tool1, tool2"
DEVELOP_SKILLS_APPEND = ", skill1, skill2"

// Markdown 格式（用于文档）
INFRA_CATALOG_OVERVIEW_TOOLS_MD = "`tool1`, `tool2`"
INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD = "| 分组 | 说明 | tools |\n..."
CODE_EXAMPLES_MD = "### 代码最佳实践参考\n..."

✅ @引用解析

- 支持相对路径：@../../.specforge/rules/AGENT-RULES-IMPL.md
- 支持嵌套引用：引用文件内部可以再次使用 @引用
- 关键：引用内容必须同步处理模板变量，否则会导致占位符残留

✅ 验证机制

validateInfraCatalogConfig(config) {
// 1. 检查 mcp_server_providers 是否存在
// 2. 检查 mcp_tool_definitions 的三个分组
// 3. 交叉验证：每个 tool ID 的 serverName 必须在 providers 中存在
// 4. 抛出友好的错误提示
}

---

6️⃣ 复用建议

如果你要在另一个系统中实现类似机制，需要：

1. 定义配置结构：参考 infra_catalog 的分层设计
2. 模块化拆分：ProfileManager / InfraCatalogManager / TemplateProcessor
3. 模板变量生成：根据配置生成多种格式的变量（追加片段/Markdown/JSON）
4. 增量合并逻辑：确保升级时不覆盖用户数据
5. 验证与错误提示：提供清晰的配置错误定位

---

📊 数据流图

[Profile JSON]
↓ load
[InfraCatalogManager.extractInfraCatalogFromConfig]
↓ generate
[config.INFRA_CATALOG_*模板变量]
↓ inject
[TemplateProcessor.processTemplate]
↓ replace {{变量}}
[Agent/Skill 模板文件]
↓ resolve @引用
[最终安装到 .claude/]
↓ merge
[.mcp.json / settings.json 增量更新]

---

这套机制的核心价值在于：

1. 配置驱动：通过 Profile JSON 即可适配不同业务线的基建能力
2. 模板分离：Agent/Skill 模板与具体配置解耦
3. 增量安全：升级时保留用户数据，只更新框架管理的部分
4. 可扩展性：新增 MCP 工具/Skill 只需修改 Profile 配置
