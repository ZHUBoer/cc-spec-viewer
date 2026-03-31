import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const specTemplatePath =
  "/Users/temptrip/Downloads/coding/spec-forge/template-to-project/openspec/schemas/specforge-enhanced/templates/spec.md";

describe("spec 模板", () => {
  it("使用需求摘要与需求清单结构", () => {
    const content = readFileSync(specTemplatePath, "utf-8");

    expect(content).toContain("## 需求摘要");
    expect(content).toContain("## D2C 配置");
    expect(content).toContain("## 需求清单");
    expect(content).toContain("### 需求项 1：");
    expect(content).toContain("**用户故事**");
    expect(content).toContain("#### 验收标准");
    expect(content).toContain("<!-- D2C_MATERIALS_JSON: [] -->");
    expect(content).toContain("<!-- D2C_CHANGE_KIND: new -->");
  });

  it("移除了旧的需求概述、功能表格和需求修改建议", () => {
    const content = readFileSync(specTemplatePath, "utf-8");

    expect(content).not.toContain("## 计划摘要");
    expect(content).not.toContain("## 需求概述");
    expect(content).not.toContain("## 功能逻辑详述");
    expect(content).not.toContain("## 需求修改建议");
    expect(content).not.toContain("| 功能点 | 说明 | 端支持 | 优先级 |");
    expect(content).not.toContain("<!-- D2C_FIGMA_URL: -->");
    expect(content).not.toContain("## 需求清单（Requirements）");
    expect(content).not.toContain("### Requirement 1：");
    expect(content).not.toContain("**User Story**");
    expect(content).not.toContain("#### Acceptance Criteria");
  });
});
