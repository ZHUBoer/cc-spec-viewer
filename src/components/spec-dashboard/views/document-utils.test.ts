import { describe, expect, it } from "vitest";
import {
  buildD2CSummaryItems,
  extractMarkdownToc,
  generateMarkdownHeadingId,
  getD2CCheckpointActionState,
  getD2CStatusBadgeText,
  getD2CStepperState,
  getD2CStepRequirements,
  getSpecD2CFooterMode,
  parseReviewBlocks,
  parseTasksProgress,
} from "./document-utils";

describe("document-utils", () => {
  it("extractMarkdownToc 只提取指定层级的标题", () => {
    const toc = extractMarkdownToc(
      [
        "# 一级标题",
        "正文",
        "## 二级标题",
        "### 三级标题",
        "#### 四级标题",
      ].join("\n"),
    );

    expect(toc).toEqual([
      { id: "一级标题", text: "一级标题", level: 1 },
      { id: "二级标题", text: "二级标题", level: 2 },
      { id: "三级标题", text: "三级标题", level: 3 },
    ]);
  });

  it("generateMarkdownHeadingId 会统一中文和英文标题锚点", () => {
    expect(generateMarkdownHeadingId("Plan 摘要")).toBe("plan-摘要");
    expect(generateMarkdownHeadingId("design - 权益过期感知提醒")).toBe(
      "design---权益过期感知提醒",
    );
  });

  it("parseReviewBlocks 会分离 review block 并识别待确认问题", () => {
    const content = [
      "# 标题",
      "普通内容",
      "<!-- USER_INPUT_START:question-1 -->",
      "",
      "- [ ] 需要确认的事项",
      "",
      "<!-- USER_INPUT_END:question-1 -->",
      "结尾",
    ].join("\n");

    const result = parseReviewBlocks(content);

    expect(result.parts).toHaveLength(3);
    expect(result.questionBlockIds).toEqual(["question-1"]);
    expect(result.parts[1]).toMatchObject({
      type: "block",
      id: "question-1",
    });
  });

  it("parseTasksProgress 会统计任务完成度", () => {
    const progress = parseTasksProgress(
      ["- [x] 已完成", "- [ ] 待完成", "- [x] 已完成 2"].join("\n"),
    );

    expect(progress).toEqual({
      completed: 2,
      total: 3,
      percent: 67,
    });
  });

  it("getSpecD2CFooterMode 会区分默认、checkpoint 和 design-ready 状态", () => {
    expect(
      getSpecD2CFooterMode({
        isSpec: true,
        hasD2CGuard: false,
        isSpecConfirmed: false,
        isD2CFrozen: false,
        canEnterDesign: false,
      }),
    ).toBe("default");

    expect(
      getSpecD2CFooterMode({
        isSpec: true,
        hasD2CGuard: true,
        isSpecConfirmed: true,
        isD2CFrozen: false,
        canEnterDesign: false,
      }),
    ).toBe("checkpoint");

    expect(
      getSpecD2CFooterMode({
        isSpec: true,
        hasD2CGuard: true,
        isSpecConfirmed: true,
        isD2CFrozen: true,
        canEnterDesign: true,
      }),
    ).toBe("design-ready");
  });

  it("getSpecD2CFooterMode 会在 review 未通过时保持 checkpoint", () => {
    expect(
      getSpecD2CFooterMode({
        isSpec: true,
        hasD2CGuard: true,
        isSpecConfirmed: true,
        isD2CFrozen: true,
        canEnterDesign: false,
      }),
    ).toBe("checkpoint");
  });

  it("getD2CStatusBadgeText 会返回准确的 D2C 状态文案", () => {
    expect(
      getD2CStatusBadgeText({
        isSpecConfirmed: false,
        isD2CFrozen: false,
        canEnterDesign: false,
      }),
    ).toBe("待确认 Spec");

    expect(
      getD2CStatusBadgeText({
        isSpecConfirmed: true,
        isD2CFrozen: false,
        canEnterDesign: false,
      }),
    ).toBe("已进入 D2C checkpoint");

    expect(
      getD2CStatusBadgeText({
        isSpecConfirmed: true,
        isD2CFrozen: true,
        canEnterDesign: true,
      }),
    ).toBe("UI 基线已确认");
  });

  it("getD2CStatusBadgeText 会在 review 未通过时提示重新生成", () => {
    expect(
      getD2CStatusBadgeText({
        isSpecConfirmed: true,
        isD2CFrozen: true,
        canEnterDesign: false,
      }),
    ).toBe("审查未通过，待处理");
  });

  it("getD2CCheckpointActionState 会在 UI 基线确认后禁用再次生成", () => {
    expect(
      getD2CCheckpointActionState({
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        isD2CFrozen: true,
        hasReviewResult: true,
        canEnterDesign: true,
        isGeneratingD2C: false,
        isFreezingD2C: false,
      }),
    ).toEqual({
      canGenerate: false,
      canPreview: true,
      canFreeze: false,
    });
  });

  it("getD2CStepRequirements 会标记 review 未通过", () => {
    expect(
      getD2CStepRequirements({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        isD2CFrozen: true,
        hasReviewResult: true,
        canEnterDesign: false,
      }),
    ).toEqual({
      missingSpecConfirmation: false,
      missingMaterials: false,
      missingGeneratedFiles: false,
      missingBaselineConfirmation: false,
      missingReviewResult: false,
      reviewNotPassed: true,
    });
  });

  it("buildD2CSummaryItems 会把 D2C 信息整理成列表展示结构", () => {
    expect(
      buildD2CSummaryItems({
        enabled: true,
        changeKind: "modify",
        materials: [
          {
            link: "https://www.figma.com/file/demo?node-id=1-2",
            description: "活动首屏",
            scope: "page",
            artifactId: "activity-hero",
          },
          {
            link: "https://www.figma.com/file/demo?node-id=3-4",
            description: "购买浮层",
            scope: "component",
            artifactId: "purchase-modal",
          },
        ],
        targetScope: "page",
        baselineFrozen: false,
        baselineFrozenAt: undefined,
        reviewOverride: false,
        reviewOverrideAt: undefined,
        reviewOverrideReason: undefined,
        reviewStatus: "passed",
        canEnterDesign: true,
        effectiveCanEnterDesign: true,
        generatedAt: undefined,
        generator: undefined,
        previewPath: undefined,
        reviewSummary: undefined,
        entryFiles: [
          "activity-hero/index.tsx",
          "activity-hero/index.module.scss",
        ],
        hasManifest: true,
        hasGeneratedFiles: true,
        generatedFiles: [],
        previewFiles: [],
      }),
    ).toEqual([
      {
        key: "changeKind",
        label: "变更类型",
        values: ["modify"],
        valueTone: "default",
      },
      {
        key: "materials",
        label: "设计材料",
        values: [
          "1. [page] 活动首屏 - https://www.figma.com/file/demo?node-id=1-2",
          "2. [component] 购买浮层 - https://www.figma.com/file/demo?node-id=3-4",
        ],
        valueTone: "code",
      },
      {
        key: "targetScope",
        label: "目标范围",
        values: ["page"],
        valueTone: "default",
      },
      {
        key: "generatedAt",
        label: "生成时间",
        values: ["Spec 确认后生成"],
        valueTone: "code",
      },
      {
        key: "reviewStatus",
        label: "D2C 审查",
        values: ["passed"],
        valueTone: "default",
      },
      {
        key: "entryFiles",
        label: "入口文件",
        values: ["activity-hero/index.tsx", "activity-hero/index.module.scss"],
        valueTone: "code",
      },
    ]);
  });

  it("getD2CStepperState 使用 confirm-spec 作为首步骤 key", () => {
    const result = getD2CStepperState({
      isSpecConfirmed: false,
      hasD2CMaterials: true,
      hasGeneratedFiles: false,
      isD2CFrozen: false,
      hasReviewResult: false,
      canEnterDesign: false,
    });

    expect(result[0]?.key).toBe("confirm-spec");
  });

  it("buildD2CSummaryItems 会标记人工放行状态", () => {
    const result = buildD2CSummaryItems({
      enabled: true,
      changeKind: "modify",
      materials: [],
      targetScope: "page",
      baselineFrozen: false,
      baselineFrozenAt: undefined,
      reviewOverride: true,
      reviewOverrideAt: "2026-03-06T00:00:00.000Z",
      reviewOverrideReason: "已人工确认风险",
      reviewStatus: "failed",
      canEnterDesign: false,
      effectiveCanEnterDesign: true,
      generatedAt: undefined,
      generator: undefined,
      previewPath: undefined,
      reviewSummary: "缺少异常态设计稿",
      entryFiles: [],
      hasManifest: true,
      hasGeneratedFiles: true,
      generatedFiles: [],
      previewFiles: [],
    });

    expect(result.find((item) => item.key === "reviewStatus")?.values).toEqual([
      "failed（人工放行） - 缺少异常态设计稿",
    ]);
  });
});
