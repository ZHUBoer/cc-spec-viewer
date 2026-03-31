import { describe, expect, it } from "vitest";
import { renderNewChangePrompt } from "./newChangePromptTemplate";

describe("newChangePromptTemplate", () => {
  it("会渲染需求正文与 D2C 配置", () => {
    const prompt = renderNewChangePrompt({
      requirement:
        "需要新增会员权益提醒的飞书文档链接：https://trip.larkenterprise.com/docx/demo",
      enableD2C: true,
      d2cMaterials: [
        {
          link: "https://figma.example.com/node/1",
          description: "权益卡片区域，关注默认态与空态。",
          targetScope: "page",
        },
      ],
    });

    expect(prompt.startsWith("/opsx:new ")).toBe(true);
    expect(prompt).toContain("会员权益提醒");
    expect(prompt).toContain("是否启用 D2C：是");
    expect(prompt).toContain("权益卡片区域");
  });

  it("在未启用 D2C 时不渲染材料列表", () => {
    const prompt = renderNewChangePrompt({
      requirement: "需要优化后端缓存逻辑",
      enableD2C: false,
      d2cMaterials: [],
    });

    expect(prompt).toContain("是否启用 D2C：否");
    expect(prompt).not.toContain("链接：");
    expect(prompt).not.toContain("设计材料");
  });

  it("在英文环境下只渲染英文文案", () => {
    const prompt = renderNewChangePrompt(
      {
        requirement: "Add reminder UI",
        enableD2C: true,
        d2cMaterials: [
          {
            link: "https://figma.example.com/node/1",
            description: "Reminder card area",
            targetScope: "component",
          },
        ],
      },
      "en",
    );

    expect(prompt).toContain("D2C Enabled: Yes");
    expect(prompt).toContain("D2C Materials");
    expect(prompt).not.toContain("是否启用 D2C");
  });
});
