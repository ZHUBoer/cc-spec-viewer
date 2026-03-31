import { describe, expect, it } from "vitest";
import {
  createEmptyD2CMaterial,
  hasDraftValidationErrors,
  validateNewChangeDraft,
} from "./newChangeDraft";
import { renderNewChangePrompt } from "./newChangePromptTemplate";

describe("newChangeDraft helpers", () => {
  it("在未填写需求时返回校验错误", () => {
    const validation = validateNewChangeDraft({
      requirement: "   ",
      enableD2C: false,
      d2cMaterials: [],
    });

    expect(validation.requirement).toContain("请填写需求内容");
    expect(hasDraftValidationErrors(validation)).toBe(true);
  });

  it("在启用 D2C 但缺少材料时返回校验错误", () => {
    const validation = validateNewChangeDraft({
      requirement: "需要新增权益过期提醒",
      enableD2C: true,
      d2cMaterials: [],
    });

    expect(validation.d2cMaterials).toContain("至少需要一条设计材料");
    expect(hasDraftValidationErrors(validation)).toBe(true);
  });

  it("在 D2C 材料缺少链接或说明时返回逐项错误", () => {
    const validation = validateNewChangeDraft({
      requirement: "需要新增权益过期提醒",
      enableD2C: true,
      d2cMaterials: [
        {
          ...createEmptyD2CMaterial(),
          link: "https://figma.example.com/section/abc",
        },
      ],
    });

    expect(validation.materialErrors[0]?.description).toContain("关键说明");
    expect(hasDraftValidationErrors(validation)).toBe(true);
  });

  it("会把需求和多条 D2C 材料拼成发送消息", () => {
    const message = renderNewChangePrompt({
      requirement: "飞书文档链接：https://trip.larkenterprise.com/docx/test",
      enableD2C: true,
      d2cMaterials: [
        {
          link: "https://figma.example.com/node/1",
          description: "新增权益卡片区，关注默认态和空态。",
          targetScope: "page",
        },
        {
          link: "https://figma.example.com/node/2",
          description: "详情弹层，关注领取反馈和关闭路径。",
          targetScope: "component",
        },
      ],
    });

    expect(message.startsWith("/opsx:new ")).toBe(true);
    expect(message).toContain("飞书文档链接");
    expect(message).toContain("新增权益卡片区");
    expect(message).toContain("详情弹层");
    expect(message).toContain("design-to-code-zx MCP");
  });

  it("在未启用 D2C 时不会渲染材料区块", () => {
    const message = renderNewChangePrompt({
      requirement: "新增后端接口容错",
      enableD2C: false,
      d2cMaterials: [],
    });

    expect(message).toContain("是否启用 D2C：否");
    expect(message).not.toContain("设计材料");
  });
});
