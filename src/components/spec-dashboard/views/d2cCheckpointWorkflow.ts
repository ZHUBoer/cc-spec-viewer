export type D2CReviewRequestState =
  | "idle"
  | "waiting-result"
  | "stale"
  | "waiting-followup"
  | "followup-stale";

export interface D2CCheckpointActionBarState {
  description: string;
  mode:
    | "waiting-spec"
    | "waiting-materials"
    | "ready-generate"
    | "generated-await-review"
    | "review-waiting"
    | "review-stale"
    | "review-failed"
    | "review-followup-waiting"
    | "review-followup-stale"
    | "ready-freeze"
    | "design-ready";
  primaryAction:
    | "generate"
    | "request-review"
    | "refresh-review"
    | "request-followup"
    | "freeze"
    | "continue-design";
  primaryLabel: string;
  primaryDisabled: boolean;
  title: string;
}

interface ResolveD2CCheckpointActionBarOptions {
  canEnterDesign: boolean;
  effectiveCanEnterDesign: boolean;
  hasD2CMaterials: boolean;
  hasGeneratedFiles: boolean;
  hasReviewResult: boolean;
  isD2CFrozen: boolean;
  isGeneratingD2C: boolean;
  isFreezingD2C: boolean;
  isContinuingToDesign: boolean;
  isSpecConfirmed: boolean;
  reviewRequestState: D2CReviewRequestState;
  reviewSummary?: string;
}

export const resolveD2CCheckpointActionBarState = ({
  canEnterDesign,
  effectiveCanEnterDesign,
  hasD2CMaterials,
  hasGeneratedFiles,
  hasReviewResult,
  isD2CFrozen,
  isGeneratingD2C,
  isFreezingD2C,
  isContinuingToDesign,
  isSpecConfirmed,
  reviewRequestState,
  reviewSummary,
}: ResolveD2CCheckpointActionBarOptions): D2CCheckpointActionBarState => {
  if (!isSpecConfirmed) {
    return {
      mode: "waiting-spec",
      title: "请先确认 Spec",
      description: "Spec 确认后才会进入 D2C checkpoint 并开始后续基线验证。",
      primaryAction: "generate",
      primaryLabel: "先确认 Spec",
      primaryDisabled: true,
    };
  }

  if (!hasD2CMaterials) {
    return {
      mode: "waiting-materials",
      title: "先补齐 D2C 设计材料",
      description:
        "每条材料都需要链接、说明和目标范围，补齐后才能生成静态 UI。",
      primaryAction: "generate",
      primaryLabel: "生成静态 UI",
      primaryDisabled: true,
    };
  }

  if (!hasGeneratedFiles) {
    return {
      mode: "ready-generate",
      title: "生成静态 UI",
      description:
        "生成完成后会自动切到 Preview，继续查看静态 UI 并完成后续审查。",
      primaryAction: "generate",
      primaryLabel: isGeneratingD2C ? "正在发送生成指令" : "生成静态 UI",
      primaryDisabled: isGeneratingD2C || isFreezingD2C || isContinuingToDesign,
    };
  }

  if (!hasReviewResult) {
    if (reviewRequestState === "waiting-result") {
      return {
        mode: "review-waiting",
        title: "等待 D2C 审查结果",
        description:
          "审查指令已发送。请先在对应会话中完成回复，再返回这里刷新审查状态。",
        primaryAction: "refresh-review",
        primaryLabel: "刷新审查状态",
        primaryDisabled: false,
      };
    }

    if (reviewRequestState === "stale") {
      return {
        mode: "review-stale",
        title: "尚未收到 D2C 审查结果",
        description:
          "还没有检测到结构化审查结论。你可以刷新状态，或再次请求 AI 补写审查结果。",
        primaryAction: "refresh-review",
        primaryLabel: "刷新审查状态",
        primaryDisabled: false,
      };
    }

    return {
      mode: "generated-await-review",
      title: "完成 D2C 审查",
      description:
        "当前静态 UI 已生成，但还没有 D2C 审查结论。请先完成 D2C 审查，生成是否可进入 Design 的结论。",
      primaryAction: "request-review",
      primaryLabel: "完成 D2C 审查",
      primaryDisabled: isGeneratingD2C || isFreezingD2C || isContinuingToDesign,
    };
  }

  if (!canEnterDesign && !effectiveCanEnterDesign) {
    if (reviewRequestState === "waiting-followup") {
      return {
        mode: "review-followup-waiting",
        title: "等待补充说明结果",
        description:
          "补充说明提示词已发送。请在对应会话中补充材料或回答问题，再返回这里刷新状态。",
        primaryAction: "refresh-review",
        primaryLabel: "刷新审查状态",
        primaryDisabled: false,
      };
    }

    if (reviewRequestState === "followup-stale") {
      return {
        mode: "review-followup-stale",
        title: "仍需补充 D2C 材料或说明",
        description:
          "还没有看到新的可用审查结论。可以继续请求 AI 列出缺失材料，或在确认风险后人工放行。",
        primaryAction: "refresh-review",
        primaryLabel: "刷新审查状态",
        primaryDisabled: false,
      };
    }

    return {
      mode: "review-failed",
      title: "D2C 审查未通过",
      description:
        reviewSummary && reviewSummary.trim().length > 0
          ? `当前审查未通过：${reviewSummary}`
          : "当前 D2C 审查未通过。请先补充缺失的视觉材料或交互说明，再决定是否人工放行。",
      primaryAction: "request-followup",
      primaryLabel: "补充材料/说明",
      primaryDisabled: isGeneratingD2C || isFreezingD2C || isContinuingToDesign,
    };
  }

  if (!effectiveCanEnterDesign) {
    return {
      mode: "generated-await-review",
      title: "等待可进入 Design 的结论",
      description: "当前还没有满足进入 Design 的条件，请先完成审查或人工放行。",
      primaryAction: "refresh-review",
      primaryLabel: "刷新审查状态",
      primaryDisabled: false,
    };
  }

  if (!isD2CFrozen) {
    return {
      mode: "ready-freeze",
      title: "确认 UI 基线",
      description: "Preview 确认无误后，直接确认 UI 基线并进入下一步。",
      primaryAction: "freeze",
      primaryLabel: isFreezingD2C ? "正在确认 UI 基线" : "确认 UI 基线",
      primaryDisabled: isGeneratingD2C || isFreezingD2C || isContinuingToDesign,
    };
  }

  return {
    mode: "design-ready",
    title: "继续进入 Design",
    description: "当前 UI 基线已确认，可以直接继续生成 Design。",
    primaryAction: "continue-design",
    primaryLabel: isContinuingToDesign ? "正在进入 Design" : "继续进入 Design",
    primaryDisabled: isGeneratingD2C || isFreezingD2C || isContinuingToDesign,
  };
};

export const shouldAutoSwitchToD2CPreview = ({
  awaitingArtifacts,
  hasGeneratedFiles,
}: {
  awaitingArtifacts: boolean;
  hasGeneratedFiles: boolean;
}): boolean => awaitingArtifacts && hasGeneratedFiles;

export const canUndoD2CBaselineFreeze = ({
  designContent,
  isD2CFrozen,
  status,
}: {
  designContent?: string;
  isD2CFrozen: boolean;
  status:
    | "draft"
    | "designing"
    | "design-confirmed"
    | "task-planning"
    | "implementing"
    | "completed"
    | "archived";
}): boolean => {
  if (!isD2CFrozen) {
    return false;
  }

  if (typeof designContent === "string" && designContent.trim().length > 0) {
    return false;
  }

  return status === "draft";
};
