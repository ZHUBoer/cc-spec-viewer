import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const d2cBaselineSkillPath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/.claude/skills/d2c-baseline/SKILL.md";
const d2cStitchingSkillPath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/.claude/skills/d2c-stitching/SKILL.md";
const qualityGateAgentPath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/.claude/agents/quality-gate-agent.md";
const formatComplianceAgentPath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/.claude/agents/format-compliance-agent.md";
const schemaPath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/openspec/schemas/specforge-enhanced/schema.yaml";
const designTemplatePath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/openspec/schemas/specforge-enhanced/templates/design.md";
const tasksTemplatePath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/openspec/schemas/specforge-enhanced/templates/tasks.md";

describe("D2C 模板文档", () => {
  it("d2c-baseline 支持多材料输入并生成 review 产物", () => {
    const content = readFileSync(d2cBaselineSkillPath, "utf-8");

    expect(content).toContain("D2C_MATERIALS_JSON");
    expect(content).toContain("description");
    expect(content).toContain("review.md");
    expect(content).toContain("D2C_CHANGE_KIND");
    expect(content).toContain("reviewStatus");
    expect(content).toContain("canEnterDesign");
    expect(content).not.toContain("若缺少 `D2C_FIGMA_URL`");
  });

  it("d2c-stitching 以 design 为实现真源并允许实现载体修正", () => {
    const content = readFileSync(d2cStitchingSkillPath, "utf-8");

    expect(content).toContain("`design.md` 是最终工程实现真源");
    expect(content).toContain("实现载体修正");
    expect(content).toContain(
      "将不正确的 D2C 组件替换为正确组件库 / 跨端组件 / 业务组件",
    );
    expect(content).not.toContain("只做逻辑缝合，不改冻结后的 DOM 结构");
  });

  it("quality-gate-agent 补充了 D2C 质量门禁", () => {
    const content = readFileSync(qualityGateAgentPath, "utf-8");

    expect(content).toContain("Step 1.5：D2C 场景识别");
    expect(content).toContain("Step 3：D2C 质量门禁");
    expect(content).toContain("实现载体正确性");
    expect(content).toContain("UI 基线保持");
  });

  it("schema 在启用 D2C 时要求 review 产物通过后才能进入 design", () => {
    const content = readFileSync(schemaPath, "utf-8");

    expect(content).toContain("仅当 `D2C_ENABLED: true` 时");
    expect(content).toContain("`reviewStatus=passed`");
    expect(content).toContain("`canEnterDesign=true`");
    expect(content).toContain("review.md");
    expect(content).toContain("人工审查记录");
  });

  it("format-compliance-agent 条件化校验 D2C 专属结构", () => {
    const content = readFileSync(formatComplianceAgentPath, "utf-8");

    expect(content).toContain("仅当 `D2C_ENABLED: true` 时");
    expect(content).toContain("`D2C_MATERIALS_JSON`");
    expect(content).toContain("`UI 基线与实现载体约束`");
  });

  it("proposal schema 强制未决问题先通过 AskUserQuestion 收口，且不再输出需求修改建议", () => {
    const content = readFileSync(schemaPath, "utf-8");

    expect(content).toContain("MUST 禁止进入阶段三与阶段四");
    expect(content).toContain("MUST 回到阶段二调用 AskUserQuestion 收口");
    expect(content).not.toContain("需求修改建议（用户可补充）");
  });

  it("format-compliance-agent 必须校验最终文件中的 Mermaid 代码块", () => {
    const content = readFileSync(formatComplianceAgentPath, "utf-8");

    expect(content).toContain(
      "必须直接从目标文档最终内容中提取该唯一 Mermaid 代码块",
    );
    expect(content).toContain("严禁使用中间修复版本、记忆中的流程图文本");
    expect(content).toContain("未转义嵌套引号");
    expect(content).toContain(
      "proposal/design 的 Mermaid 最终门禁不得以“跳过自动校验”判定 PASS",
    );
  });

  it("design 模板与 schema 不再允许未决技术问题留在最终文档", () => {
    const designTemplate = readFileSync(designTemplatePath, "utf-8");
    const schema = readFileSync(schemaPath, "utf-8");
    const formatAgent = readFileSync(formatComplianceAgentPath, "utf-8");

    expect(designTemplate).not.toContain("## 待确认事项（实施前）");
    expect(schema).toContain("若仍存在任何未解决技术问题");
    expect(schema).toContain("MUST 立即停止并回到阶段二调用 AskUserQuestion");
    expect(schema).not.toContain("待确认事项（实施前，阻塞/非阻塞明确标识）");
    expect(formatAgent).toContain("`design.md` 包含 `待确认事项`");
  });

  it("tasks 阶段不应承载待决策或待确认问题", () => {
    const schema = readFileSync(schemaPath, "utf-8");
    const tasksTemplate = readFileSync(tasksTemplatePath, "utf-8");
    const formatAgent = readFileSync(formatComplianceAgentPath, "utf-8");

    expect(schema).toContain(
      "tasks.md 不得承载待决策问题、待确认事项或建议用户确认",
    );
    expect(tasksTemplate).not.toContain("待确认事项");
    expect(formatAgent).toContain("`tasks.md` 包含 `待确认事项`");
  });

  it("tasks 模板不应把 D2C 任务硬编码进所有需求路径", () => {
    const content = readFileSync(tasksTemplatePath, "utf-8");

    expect(content).not.toContain(
      "- [ ] 2.0 [FEAT] 完成 UI 基线映射与实现载体修正",
    );
    expect(content).not.toContain("- **Depends On**: 1.1, 2.0");
    expect(content).toContain("若启用 D2C，可新增“实现载体修正”类任务");
  });
});
