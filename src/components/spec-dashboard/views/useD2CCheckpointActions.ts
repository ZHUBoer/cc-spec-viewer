import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useContinueSessionProcessMutation,
  useCreateSessionProcessMutation,
} from "@/app/projects/[projectId]/components/chatForm";
import { useSessionProcess } from "@/app/projects/[projectId]/sessions/[sessionId]/hooks/useSessionProcess";
import type { OpenSpecChange } from "../SpecDashboardService";
import { specDashboardService } from "../SpecDashboardService";
import {
  type D2CReviewRequestState,
  shouldAutoSwitchToD2CPreview,
} from "./d2cCheckpointWorkflow";

const REVIEW_POLL_INTERVAL_MS = 3000;
const REVIEW_STALE_AFTER_MS = 20000;

const upsertCommentTag = (
  content: string,
  key: string,
  value: string,
): string => {
  const pattern = new RegExp(`<!--\\s*${key}:\\s*[\\s\\S]*?-->`, "g");
  const nextTag = `<!-- ${key}: ${value} -->`;
  if (pattern.test(content)) {
    return content.replace(pattern, nextTag);
  }
  return `${content.trim()}\n${nextTag}`;
};

const clearD2CReviewOverrideTags = (content: string): string => {
  let updatedContent = content;
  updatedContent = upsertCommentTag(
    updatedContent,
    "D2C_REVIEW_OVERRIDE",
    "false",
  );
  updatedContent = upsertCommentTag(
    updatedContent,
    "D2C_REVIEW_OVERRIDE_AT",
    "",
  );
  updatedContent = upsertCommentTag(
    updatedContent,
    "D2C_REVIEW_OVERRIDE_REASON",
    "",
  );
  return updatedContent;
};

interface UseD2CCheckpointActionsOptions {
  change: OpenSpecChange;
  changeId: string;
  onGeneratedArtifactsReady?: () => void;
  projectId: string;
}

export const useD2CCheckpointActions = ({
  change,
  changeId,
  onGeneratedArtifactsReady,
  projectId,
}: UseD2CCheckpointActionsOptions) => {
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false });
  const { getSessionProcess } = useSessionProcess();
  const [isGeneratingD2C, setIsGeneratingD2C] = useState(false);
  const [isFreezingD2C, setIsFreezingD2C] = useState(false);
  const [isUndoingFreezeD2C, setIsUndoingFreezeD2C] = useState(false);
  const [isContinuingToDesign, setIsContinuingToDesign] = useState(false);
  const [isApprovingReviewOverride, setIsApprovingReviewOverride] =
    useState(false);
  const [awaitingD2CArtifacts, setAwaitingD2CArtifacts] = useState(false);
  const [reviewRequestState, setReviewRequestState] =
    useState<D2CReviewRequestState>("idle");
  const [lastReviewRequestAt, setLastReviewRequestAt] = useState<number | null>(
    null,
  );
  const [reviewRequestBaselineUpdatedAt, setReviewRequestBaselineUpdatedAt] =
    useState<string | null>(null);

  const currentSessionId =
    typeof search === "object" &&
    search !== null &&
    "sessionId" in search &&
    typeof search.sessionId === "string"
      ? search.sessionId
      : undefined;

  const currentSessionProcess = currentSessionId
    ? getSessionProcess(currentSessionId)
    : undefined;

  const createSessionProcess = useCreateSessionProcessMutation(projectId);
  const continueSessionProcess = useContinueSessionProcessMutation(
    projectId,
    currentSessionId ?? "",
  );

  const invalidateChangeQuery = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["openspec", "change", projectId, changeId],
    });
  }, [changeId, projectId, queryClient]);

  const sendPromptToSession = async (
    message: string,
    successMessage: string,
    clipboardMessage = "提示词已复制，请回到对应会话粘贴发送。",
  ) => {
    if (currentSessionId) {
      if (
        currentSessionProcess?.status === "running" &&
        currentSessionProcess.id
      ) {
        await continueSessionProcess.mutateAsync({
          input: { text: message },
          sessionProcessId: currentSessionProcess.id,
        });
      } else {
        await createSessionProcess.mutateAsync({
          input: { text: message },
          baseSessionId: currentSessionId,
        });
      }
      toast.success(successMessage);
      return;
    }

    await navigator.clipboard.writeText(message);
    toast.success(clipboardMessage, {
      duration: 5000,
    });
  };

  useEffect(() => {
    if (
      !shouldAutoSwitchToD2CPreview({
        awaitingArtifacts: awaitingD2CArtifacts,
        hasGeneratedFiles: Boolean(change.d2c?.hasGeneratedFiles),
      })
    ) {
      return;
    }

    setAwaitingD2CArtifacts(false);
    onGeneratedArtifactsReady?.();
  }, [
    awaitingD2CArtifacts,
    change.d2c?.hasGeneratedFiles,
    onGeneratedArtifactsReady,
  ]);

  useEffect(() => {
    if (!awaitingD2CArtifacts || change.d2c?.hasGeneratedFiles) {
      return;
    }

    const timer = setInterval(() => {
      void invalidateChangeQuery();
    }, REVIEW_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [
    awaitingD2CArtifacts,
    change.d2c?.hasGeneratedFiles,
    invalidateChangeQuery,
  ]);

  useEffect(() => {
    const reviewStatus = change.d2c?.reviewStatus ?? "unknown";

    if (reviewStatus === "unknown") {
      if (
        reviewRequestState !== "waiting-result" &&
        reviewRequestState !== "stale"
      ) {
        return;
      }
    } else if (
      reviewStatus === "failed" &&
      reviewRequestState !== "waiting-followup" &&
      reviewRequestState !== "followup-stale"
    ) {
      return;
    } else if (
      reviewStatus === "passed" ||
      (reviewStatus === "failed" && reviewRequestState === "waiting-result")
    ) {
      setReviewRequestState("idle");
      setLastReviewRequestAt(null);
      setReviewRequestBaselineUpdatedAt(null);
      return;
    }

    if (
      reviewStatus === "failed" &&
      (reviewRequestState === "waiting-followup" ||
        reviewRequestState === "followup-stale") &&
      reviewRequestBaselineUpdatedAt !== null &&
      change.updatedAt !== reviewRequestBaselineUpdatedAt
    ) {
      setReviewRequestState("idle");
      setLastReviewRequestAt(null);
      setReviewRequestBaselineUpdatedAt(null);
      return;
    }

    if (lastReviewRequestAt === null) {
      return;
    }

    const elapsed = Date.now() - lastReviewRequestAt;
    if (elapsed >= REVIEW_STALE_AFTER_MS) {
      setReviewRequestState((currentState) => {
        if (currentState === "waiting-result") {
          return "stale";
        }
        if (currentState === "waiting-followup") {
          return "followup-stale";
        }
        return currentState;
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setReviewRequestState((currentState) => {
        if (currentState === "waiting-result") {
          return "stale";
        }
        if (currentState === "waiting-followup") {
          return "followup-stale";
        }
        return currentState;
      });
    }, REVIEW_STALE_AFTER_MS - elapsed);

    return () => window.clearTimeout(timer);
  }, [
    change.d2c?.reviewStatus,
    change.updatedAt,
    lastReviewRequestAt,
    reviewRequestBaselineUpdatedAt,
    reviewRequestState,
  ]);

  useEffect(() => {
    if (
      reviewRequestState !== "waiting-result" &&
      reviewRequestState !== "waiting-followup"
    ) {
      return;
    }

    const timer = setInterval(() => {
      void invalidateChangeQuery();
    }, REVIEW_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [reviewRequestState, invalidateChangeQuery]);

  const handleTriggerD2CGeneration = async () => {
    const d2cInfo = change.d2c;
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const isSpecConfirmed =
      specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
      specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->");

    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return;
    }
    if (!isSpecConfirmed) {
      toast.error("请先确认 Spec，再进入 D2C 检查点");
      return;
    }
    if ((d2cInfo.materials.length ?? 0) === 0) {
      toast.error("Spec 中还没有填写 D2C 设计材料");
      return;
    }

    const message = `/opsx:continue ${changeId}

请读取当前 change 的 spec.md 中 D2C 配置，使用 d2c-baseline skill 调用 design-to-code-zx MCP：
1. 以 spec 中的 D2C 配置注释为准，读取 \`D2C_CHANGE_KIND\` 与 \`D2C_MATERIALS_JSON\`，按材料顺序处理，不要退回单个 figmaUrl 模式。
2. 每条材料都要保留 \`link\`、\`description\`、\`scope\` 语义，输入边界是对应的 section / node link，而不是整页链接。
3. 当前 Spec 已确认，本阶段是 D2C checkpoint，不进入 technical design。
4. 产物必须收口到 openspec/changes/${changeId}/d2c/：
   - manifest.json
   - <artifact-id>/index.tsx
   - <artifact-id>/index.module.scss
   - review.md
5. 每份 D2C 材料必须生成一个对应的 <artifact-id> 目录，artifact-id 需稳定且可读。
6. manifest.json 需记录 enabled、changeKind、materials、generator、generatedAt、entryFiles、sourceHash、reviewPath，并为每条材料写入 artifactId。
   - 同时写入结构化审查字段：reviewStatus（passed / failed）、canEnterDesign（true / false）、reviewSummary（简洁中文结论）。
7. 基于 spec 的业务逻辑流程图检查 UI 基线是否满足“视觉完整、交互闭环、场景闭环”：
   - \`changeKind = new\`：检查静态 UI 自身的入口、状态切换、反馈和出口是否闭环。
   - \`changeKind = modify\`：结合现有仓库代码分析改动部分与现有交互链路是否闭环。
8. 不分析技术实现、后端接口、数据流、状态管理、契约或固定值。
9. 完成后仅汇报产物路径、闭环检查结论和是否可确认 UI 基线，不要推进到 design。
10. 若 UI 基线已可确认，请明确提示用户点击界面底部“确认 UI 基线”按钮；不要要求用户再输入“确认冻结基线”等口令。`;

    try {
      setIsGeneratingD2C(true);
      let updatedContent = clearD2CReviewOverrideTags(specReviewContent);
      updatedContent = upsertCommentTag(updatedContent, "D2C_ENABLED", "true");
      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "spec.md",
        `${updatedContent.trim()}\n`,
      );
      await sendPromptToSession(message, "已发送 D2C 生成指令");
      setAwaitingD2CArtifacts(true);
      setReviewRequestState("idle");
      setLastReviewRequestAt(null);
    } catch (error) {
      console.error("Failed to trigger D2C generation", error);
      toast.error("发送 D2C 生成指令失败");
    } finally {
      setIsGeneratingD2C(false);
    }
  };

  const handleFreezeD2CBaseline = async () => {
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const isSpecConfirmed =
      specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
      specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->");
    const d2cInfo = change.d2c;
    const hasD2CReviewResult =
      d2cInfo?.reviewStatus !== undefined && d2cInfo.reviewStatus !== "unknown";

    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return;
    }
    if (!isSpecConfirmed) {
      toast.error("请先确认 Spec，再确认 UI 基线");
      return;
    }
    if (!hasD2CReviewResult) {
      toast.error("当前还没有结构化的 D2C 审查结果，请先完成 D2C 审查");
      return;
    }
    if (!d2cInfo.effectiveCanEnterDesign) {
      toast.error("当前 D2C 审查未通过，请先补充材料或人工放行");
      return;
    }

    try {
      setIsFreezingD2C(true);
      let updatedContent = specReviewContent;
      updatedContent = upsertCommentTag(updatedContent, "D2C_ENABLED", "true");
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_BASELINE_FROZEN",
        "true",
      );
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_BASELINE_FROZEN_AT",
        new Date().toISOString(),
      );

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "spec.md",
        `${updatedContent.trim()}\n`,
      );
      await invalidateChangeQuery();
      toast.success("UI 基线已确认，请继续进入 Design 阶段。");
    } catch (error) {
      console.error("Failed to freeze D2C baseline", error);
      toast.error("冻结 UI 基线失败");
    } finally {
      setIsFreezingD2C(false);
    }
  };

  const handleRequestD2CReview = async () => {
    const d2cInfo = change.d2c;
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const isSpecConfirmed =
      specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
      specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->");

    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return;
    }
    if (!isSpecConfirmed) {
      toast.error("请先确认 Spec，再完成 D2C 审查");
      return;
    }
    if (!d2cInfo.hasGeneratedFiles) {
      toast.error("当前还没有静态 UI 产物，请先生成静态 UI");
      return;
    }
    if (d2cInfo.reviewStatus !== "unknown") {
      toast.info("当前已经有 D2C 审查结果");
      return;
    }

    const message = `/opsx:continue ${changeId}

请基于当前 change 已生成的 D2C 静态产物，完成 D2C 审查并补齐结构化审查结果：
1. 读取 openspec/changes/${changeId}/d2c/ 目录下现有的 manifest.json、review.md、各 artifact 的 index.tsx 与 index.module.scss。
2. 结合 spec.md 中的业务逻辑流程图与 D2C 材料说明，检查当前静态 UI 是否满足视觉完整、交互闭环、场景覆盖。
3. 仅补写或更新 manifest.json 中的结构化字段：
   - reviewStatus（passed / failed）
   - canEnterDesign（true / false）
   - reviewSummary（简洁中文结论）
4. 如有必要，可同步补充 review.md 的人工审查记录，但不要重新生成 index.tsx / index.module.scss，除非产物缺失到无法审查。
5. 不要自动写入 D2C_BASELINE_FROZEN=true，不要推进到 design 阶段。
6. 输出时仅汇报审查结论、reviewStatus、canEnterDesign、reviewSummary。
7. 若审查通过且当前 UI 基线可确认，请明确提示用户点击界面底部“确认 UI 基线”按钮；不要要求用户再输入“确认冻结基线”等口令。`;

    try {
      await sendPromptToSession(message, "已发送 D2C 审查指令");
      setReviewRequestState("waiting-result");
      setLastReviewRequestAt(Date.now());
      setReviewRequestBaselineUpdatedAt(change.updatedAt);
    } catch (error) {
      console.error("Failed to request D2C review", error);
      toast.error("发送 D2C 审查指令失败");
    }
  };

  const handleRequestReviewFollowup = async () => {
    const d2cInfo = change.d2c;
    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return;
    }
    if (d2cInfo.reviewStatus !== "failed") {
      toast.error("当前并非审查失败状态");
      return;
    }

    const message = `/opsx:continue ${changeId}

当前这个 change 的 D2C 审查未通过。请不要重新生成静态 UI，也不要自动推进到 design。请完成以下动作：
1. 基于现有 spec.md、openspec/changes/${changeId}/d2c/manifest.json、review.md、各 artifact 的 index.tsx 与 index.module.scss，明确说明这次为什么不能通过审查。
2. 把问题归类成用户可以补充的信息清单，例如：
   - 缺少哪些视觉材料或 Figma section / node link
   - 缺少哪些交互流程、状态变化、反馈、入口、出口说明
   - 哪些 UI 基线问题需要用户明确拍板
3. 直接用清晰中文向用户说明：
   - 当前不能通过审查的原因
   - 需要补充的材料或需要回答的问题
   - 如果用户决定承担风险，也可以在界面中选择“强制通过审查”
4. 不要自动修改 manifest.json 为 passed，不要自动写入 D2C_BASELINE_FROZEN=true，不要推进到 design。`;

    try {
      await sendPromptToSession(
        message,
        "已发送补充说明提示词",
        "提示词已复制，请回到对应会话发送，让 AI 说明失败原因并追问缺失信息。",
      );
      setReviewRequestState("waiting-followup");
      setLastReviewRequestAt(Date.now());
      setReviewRequestBaselineUpdatedAt(change.updatedAt);
    } catch (error) {
      console.error("Failed to request review followup", error);
      toast.error("发送补充说明提示词失败");
    }
  };

  const handleRefreshD2CReviewStatus = async () => {
    await invalidateChangeQuery();
    toast.success("已刷新 D2C 审查状态。");
  };

  const handleApproveReviewOverride = async (reason: string) => {
    const trimmedReason = reason.trim();
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const d2cInfo = change.d2c;

    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return false;
    }
    if (d2cInfo.reviewStatus !== "failed") {
      toast.error("只有在审查未通过时才允许人工放行");
      return false;
    }
    if (trimmedReason.length === 0) {
      toast.error("请填写强制通过审查的原因");
      return false;
    }

    try {
      setIsApprovingReviewOverride(true);
      let updatedContent = specReviewContent;
      updatedContent = upsertCommentTag(updatedContent, "D2C_ENABLED", "true");
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_REVIEW_OVERRIDE",
        "true",
      );
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_REVIEW_OVERRIDE_AT",
        new Date().toISOString(),
      );
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_REVIEW_OVERRIDE_REASON",
        trimmedReason,
      );

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "spec.md",
        `${updatedContent.trim()}\n`,
      );
      await invalidateChangeQuery();
      setReviewRequestState("idle");
      setLastReviewRequestAt(null);
      setReviewRequestBaselineUpdatedAt(null);
      toast.success("已记录人工放行。你现在可以继续确认 UI 基线。");
      return true;
    } catch (error) {
      console.error("Failed to approve D2C review override", error);
      toast.error("强制通过审查失败");
      return false;
    } finally {
      setIsApprovingReviewOverride(false);
    }
  };

  const handleContinueToDesign = async () => {
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const isSpecConfirmed =
      specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
      specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->");
    const d2cInfo = change.d2c;

    if (
      !d2cInfo?.enabled ||
      !isSpecConfirmed ||
      !d2cInfo.baselineFrozen ||
      !d2cInfo.effectiveCanEnterDesign
    ) {
      toast.error("当前还不能进入 Design 阶段");
      return;
    }

    try {
      setIsContinuingToDesign(true);
      await createSessionProcess.mutateAsync({
        input: { text: `/opsx:continue ${changeId}` },
      });
      toast.success("已创建新会话生成 Design。");
    } catch (error) {
      console.error("Failed to continue to design", error);
      toast.error("进入 Design 失败，请重试");
    } finally {
      setIsContinuingToDesign(false);
    }
  };

  const handleUndoFreezeD2CBaseline = async () => {
    const specReviewContent =
      change.specContent ?? change.proposalContent ?? "";
    const d2cInfo = change.d2c;
    const hasDesignContent = (change.designContent?.trim().length ?? 0) > 0;

    if (!d2cInfo?.enabled) {
      toast.error("当前 change 未启用 D2C");
      return;
    }
    if (!d2cInfo.baselineFrozen) {
      toast.error("当前 UI 基线尚未确认");
      return;
    }
    if (hasDesignContent || change.status !== "draft") {
      toast.error("当前流程已进入 Design 或后续阶段，不能撤销 UI 基线确认");
      return;
    }

    try {
      setIsUndoingFreezeD2C(true);
      let updatedContent = specReviewContent;
      updatedContent = upsertCommentTag(updatedContent, "D2C_ENABLED", "true");
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_BASELINE_FROZEN",
        "false",
      );
      updatedContent = upsertCommentTag(
        updatedContent,
        "D2C_BASELINE_FROZEN_AT",
        "",
      );

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "spec.md",
        `${updatedContent.trim()}\n`,
      );
      await invalidateChangeQuery();
      toast.success("已撤销 UI 基线确认，可以继续回到 Preview 调整。");
    } catch (error) {
      console.error("Failed to undo D2C baseline freeze", error);
      toast.error("撤销 UI 基线确认失败");
    } finally {
      setIsUndoingFreezeD2C(false);
    }
  };

  return {
    handleApproveReviewOverride,
    handleContinueToDesign,
    handleFreezeD2CBaseline,
    handleRefreshD2CReviewStatus,
    handleRequestD2CReview,
    handleRequestReviewFollowup,
    handleTriggerD2CGeneration,
    handleUndoFreezeD2CBaseline,
    isApprovingReviewOverride,
    isContinuingToDesign,
    isFreezingD2C,
    isGeneratingD2C,
    isUndoingFreezeD2C,
    reviewRequestState,
  };
};
