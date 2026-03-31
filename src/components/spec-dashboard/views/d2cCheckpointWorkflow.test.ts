import { describe, expect, it } from "vitest";
import {
  canUndoD2CBaselineFreeze,
  resolveD2CCheckpointActionBarState,
  shouldAutoSwitchToD2CPreview,
} from "./d2cCheckpointWorkflow";

describe("d2cCheckpointWorkflow", () => {
  it("在未生成静态 UI 时返回生成动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: false,
        hasReviewResult: false,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "idle",
      }),
    ).toMatchObject({
      mode: "ready-generate",
      primaryAction: "generate",
      primaryLabel: "生成静态 UI",
      primaryDisabled: false,
    });
  });

  it("在审查未通过时返回补充说明动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: true,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "idle",
        reviewSummary: "缺少失败态与出口说明",
      }),
    ).toMatchObject({
      mode: "review-failed",
      primaryAction: "request-followup",
      primaryLabel: "补充材料/说明",
      primaryDisabled: false,
    });
  });

  it("在补充说明请求已发送后返回刷新状态动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: true,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "waiting-followup",
      }),
    ).toMatchObject({
      mode: "review-followup-waiting",
      primaryAction: "refresh-review",
      primaryLabel: "刷新审查状态",
      primaryDisabled: false,
    });
  });

  it("在人工放行后返回确认 UI 基线动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: true,
        canEnterDesign: false,
        effectiveCanEnterDesign: true,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "idle",
      }),
    ).toMatchObject({
      mode: "ready-freeze",
      primaryAction: "freeze",
      primaryLabel: "确认 UI 基线",
      primaryDisabled: false,
    });
  });

  it("在 UI 基线已确认后返回继续进入 Design 动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: true,
        canEnterDesign: true,
        effectiveCanEnterDesign: true,
        isD2CFrozen: true,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "idle",
      }),
    ).toMatchObject({
      mode: "design-ready",
      primaryAction: "continue-design",
      primaryLabel: "继续进入 Design",
      primaryDisabled: false,
    });
  });

  it("在缺少结构化审查结果时返回完成 D2C 审查动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: false,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "idle",
      }),
    ).toMatchObject({
      mode: "generated-await-review",
      primaryAction: "request-review",
      primaryLabel: "完成 D2C 审查",
      primaryDisabled: false,
    });
  });

  it("请求 D2C 审查后返回等待刷新状态", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: false,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "waiting-result",
      }),
    ).toMatchObject({
      mode: "review-waiting",
      primaryAction: "refresh-review",
      primaryLabel: "刷新审查状态",
      primaryDisabled: false,
    });
  });

  it("审查结果超时未写回时保持刷新主动作", () => {
    expect(
      resolveD2CCheckpointActionBarState({
        isSpecConfirmed: true,
        hasD2CMaterials: true,
        hasGeneratedFiles: true,
        hasReviewResult: false,
        canEnterDesign: false,
        effectiveCanEnterDesign: false,
        isD2CFrozen: false,
        isGeneratingD2C: false,
        isFreezingD2C: false,
        isContinuingToDesign: false,
        reviewRequestState: "stale",
      }),
    ).toMatchObject({
      mode: "review-stale",
      primaryAction: "refresh-review",
      primaryLabel: "刷新审查状态",
      primaryDisabled: false,
    });
  });

  it("仅在仍停留在 checkpoint 且未进入 design 时允许撤销 UI 基线确认", () => {
    expect(
      canUndoD2CBaselineFreeze({
        isD2CFrozen: true,
        status: "draft",
      }),
    ).toBe(true);

    expect(
      canUndoD2CBaselineFreeze({
        isD2CFrozen: true,
        status: "designing",
      }),
    ).toBe(false);

    expect(
      canUndoD2CBaselineFreeze({
        isD2CFrozen: true,
        status: "draft",
        designContent: "# design",
      }),
    ).toBe(false);
  });

  it("只在等待产物且产物已生成时自动切换到 Preview", () => {
    expect(
      shouldAutoSwitchToD2CPreview({
        awaitingArtifacts: true,
        hasGeneratedFiles: true,
      }),
    ).toBe(true);

    expect(
      shouldAutoSwitchToD2CPreview({
        awaitingArtifacts: true,
        hasGeneratedFiles: false,
      }),
    ).toBe(false);

    expect(
      shouldAutoSwitchToD2CPreview({
        awaitingArtifacts: false,
        hasGeneratedFiles: true,
      }),
    ).toBe(false);
  });
});
