import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import {
  useContinueSessionProcessMutation,
  useCreateSessionProcessMutation,
} from "@/app/projects/[projectId]/components/chatForm";
import { useSessionProcess } from "@/app/projects/[projectId]/sessions/[sessionId]/hooks/useSessionProcess";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { honoClient } from "@/lib/api/client";
import type { OpenSpecChange } from "../SpecDashboardService";
import { specDashboardService } from "../SpecDashboardService";
import { D2CCheckpointActionBar } from "./D2CCheckpointActionBar";
import { D2CCheckpointStepper } from "./D2CCheckpointStepper";
import type { D2CCheckpointActionBarState } from "./d2cCheckpointWorkflow";
import {
  buildD2CSummaryItems,
  extractMarkdownToc,
  generateMarkdownHeadingId,
  getD2CCheckpointActionState,
  getD2CStatusBadgeText,
  getD2CStepperState,
  getSpecD2CFooterMode,
  parseReviewBlocks,
  parseTasksProgress,
} from "./document-utils";
import { ReviewDocumentBody } from "./ReviewDocumentBody";
import { SpecDocumentWorkbench } from "./SpecDocumentWorkbench";
import { StageEmptyState } from "./StageEmptyState";
import { StageIntroBanner } from "./StageIntroBanner";

interface StageDocumentViewProps {
  projectId: string;
  changeId: string;
  stage: "spec" | "design" | "tasks" | "specs" | "tests";
  change: OpenSpecChange;
  d2cPrimaryState: D2CCheckpointActionBarState | null;
  canUndoFreeze: boolean;
  isApprovingReviewOverride: boolean;
  isFreezingD2C: boolean;
  isGeneratingD2C: boolean;
  isUndoingFreezeBaseline: boolean;
  onApproveReviewOverride: (reason: string) => Promise<boolean>;
  onContinueToDesign: () => void;
  onFreezeBaseline: () => void;
  onGenerate: () => void;
  onRefreshReview: () => void;
  onRequestReview: () => void;
  onRequestReviewFollowup: () => void;
  onUndoFreezeBaseline: () => void;
  onSwitchStage?: (stage: string) => void;
}

const getSpecPathPrefix = (status: string) => {
  return status === "archived" ? "changes/archive" : "changes";
};

const stripSpecD2CSection = (content: string) => {
  return content
    .replace(
      /\n## D2C 配置(?:（可选）)?[\s\S]*?(?=\n---\n\n## |\n## |\n<!-- (?:SPEC|PROPOSAL)_FINAL_CONFIRMATION:|$)/,
      "\n",
    )
    .trim();
};

export const StageDocumentView: FC<StageDocumentViewProps> = ({
  projectId,
  changeId,
  stage,
  change,
  d2cPrimaryState,
  canUndoFreeze,
  isApprovingReviewOverride,
  isFreezingD2C,
  isGeneratingD2C,
  isUndoingFreezeBaseline,
  onApproveReviewOverride,
  onContinueToDesign,
  onFreezeBaseline,
  onGenerate,
  onRefreshReview,
  onRequestReview,
  onRequestReviewFollowup,
  onUndoFreezeBaseline,
  onSwitchStage,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { getSessionProcess } = useSessionProcess();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyMode, setCopyMode] = useState(false);
  const [d2cActionDialog, setD2CActionDialog] = useState<
    "spec-confirm" | "generate" | null
  >(null);
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

  const isSpec = stage === "spec";
  const isDesign = stage === "design";
  const isTasks = stage === "tasks";
  const isSpecs = stage === "specs";
  const isTests = stage === "tests";
  const isReviewStage = isSpec || isDesign;
  const readonly = change.status === "archived";

  const reviewContent = isSpec
    ? (change.specContent ?? change.proposalContent ?? "")
    : isDesign
      ? (change.designContent ?? "")
      : "";
  const displayReviewContent =
    isSpec && change.d2c?.enabled
      ? stripSpecD2CSection(reviewContent)
      : reviewContent;
  const tasksContent = change.tasksContent ?? "";
  const specsContent = change.specsContent;
  const specFiles = change.specFiles ?? [];
  const testsContent = change.testsContent;
  const hasReviewContent = reviewContent.trim().length > 0;
  const hasTasksContent = tasksContent.trim().length > 0;
  const hasSpecsContent = Boolean(specsContent) || specFiles.length > 0;
  const hasTestsContent = (testsContent?.trim().length ?? 0) > 0;
  const isStageEmpty = isReviewStage
    ? !hasReviewContent
    : isTasks
      ? !hasTasksContent
      : isSpecs
        ? !hasSpecsContent
        : !hasTestsContent;

  const sidebarToc = useMemo(() => {
    if (isStageEmpty) {
      return [];
    }

    if (isSpec || isDesign) {
      return extractMarkdownToc(displayReviewContent);
    }

    if (isTasks) {
      return extractMarkdownToc(tasksContent);
    }

    if (isTests) {
      return extractMarkdownToc(testsContent ?? "");
    }

    const rootToc = specsContent
      ? extractMarkdownToc(specsContent).map((item) => ({
          ...item,
          level: item.level + 1,
        }))
      : [];

    const fileToc = specFiles.map((file) => ({
      id: `spec-file-${generateMarkdownHeadingId(file.name)}`,
      text: file.name,
      level: 1,
    }));

    if (specsContent) {
      return [
        {
          id: "specs-root-file",
          text: "specs.md",
          level: 1,
        },
        ...rootToc,
        ...fileToc,
      ];
    }

    return fileToc;
  }, [
    isDesign,
    isSpec,
    isTasks,
    isTests,
    displayReviewContent,
    specFiles,
    specsContent,
    tasksContent,
    testsContent,
    isStageEmpty,
  ]);

  const { parts, questionBlockIds } = useMemo(
    () => parseReviewBlocks(displayReviewContent),
    [displayReviewContent],
  );
  const taskProgress = useMemo(
    () => parseTasksProgress(tasksContent),
    [tasksContent],
  );
  const tasksConfirmed = tasksContent.includes(
    "<!-- TASKS_CONFIRMED: true -->",
  );
  const isCompleted = change.status === "completed";
  const isImplementing = change.status === "implementing";
  const isPlanning = change.status === "task-planning";
  const d2cInfo = change.d2c;
  const hasD2CGuard = Boolean(d2cInfo?.enabled);
  const hasD2CMaterials = (d2cInfo?.materials.length ?? 0) > 0;
  const isD2CFrozen = Boolean(d2cInfo?.baselineFrozen);
  const d2cArtifactStatus = useMemo(() => {
    if (!d2cInfo || d2cInfo.materials.length === 0) {
      return {
        hasCompleteArtifacts: false,
        missingArtifactIds: 0,
        incompleteArtifacts: 0,
      };
    }

    const fileSet = new Set(d2cInfo.generatedFiles.map((file) => file.name));
    let missingArtifactIds = 0;
    let incompleteArtifacts = 0;

    for (const material of d2cInfo.materials) {
      const artifactId = material.artifactId?.trim();
      if (!artifactId) {
        missingArtifactIds += 1;
        continue;
      }
      const tsxPath = `${artifactId}/index.tsx`;
      const scssPath = `${artifactId}/index.module.scss`;
      if (!fileSet.has(tsxPath) || !fileSet.has(scssPath)) {
        incompleteArtifacts += 1;
      }
    }

    return {
      hasCompleteArtifacts:
        missingArtifactIds === 0 &&
        incompleteArtifacts === 0 &&
        d2cInfo.materials.length > 0,
      missingArtifactIds,
      incompleteArtifacts,
    };
  }, [d2cInfo]);
  const hasGeneratedD2CFiles = d2cArtifactStatus.hasCompleteArtifacts;
  const hasD2CReviewResult =
    d2cInfo?.reviewStatus !== undefined && d2cInfo.reviewStatus !== "unknown";
  const canEnterDesign = Boolean(d2cInfo?.canEnterDesign);
  const effectiveCanEnterDesign = Boolean(d2cInfo?.effectiveCanEnterDesign);
  const reviewOverride = Boolean(d2cInfo?.reviewOverride);
  const specReviewContent = change.specContent ?? change.proposalContent ?? "";
  const isSpecConfirmed = Boolean(
    specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
      specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->"),
  );
  const d2cProgressItems = d2cInfo?.enabled
    ? [
        {
          label: "材料",
          value: hasD2CMaterials ? "已齐全" : "待补充",
        },
        {
          label: "生成",
          value: hasGeneratedD2CFiles ? "已完成" : "未生成",
        },
        {
          label: "审查",
          value: hasD2CReviewResult
            ? canEnterDesign
              ? "通过"
              : reviewOverride
                ? "人工放行"
                : "未通过"
            : "未生成",
        },
        {
          label: "基线",
          value: isD2CFrozen ? "已确认" : "未确认",
        },
        {
          label: "设计",
          value: effectiveCanEnterDesign && isD2CFrozen ? "可进入" : "不可进入",
        },
      ]
    : [];
  const d2cBlockingReasons = useMemo(() => {
    if (!hasD2CGuard) return [];
    const reasons: string[] = [];
    if (!isSpecConfirmed) reasons.push("未确认 Spec");
    if (!hasD2CMaterials) reasons.push("未补齐 D2C 设计材料");
    if (!hasGeneratedD2CFiles) reasons.push("未生成静态 UI 产物");
    if (d2cArtifactStatus.missingArtifactIds > 0) {
      reasons.push("D2C 材料缺少 artifactId");
    }
    if (d2cArtifactStatus.incompleteArtifacts > 0) {
      reasons.push("D2C 产物未完整匹配材料");
    }
    if (!hasD2CReviewResult) {
      reasons.push("未生成结构化审查结论");
    } else if (!effectiveCanEnterDesign) {
      reasons.push("D2C 审查未通过");
    }
    if (!isD2CFrozen) reasons.push("未确认 UI 基线");
    return reasons;
  }, [
    effectiveCanEnterDesign,
    hasD2CGuard,
    hasD2CMaterials,
    hasD2CReviewResult,
    hasGeneratedD2CFiles,
    isD2CFrozen,
    isSpecConfirmed,
    d2cArtifactStatus.incompleteArtifacts,
    d2cArtifactStatus.missingArtifactIds,
  ]);
  const d2cBlockingReasonsText =
    d2cBlockingReasons.length > 0
      ? d2cBlockingReasons.join("；")
      : "尚未满足 D2C 门禁条件";
  const specD2CFooterMode = getSpecD2CFooterMode({
    isSpec,
    hasD2CGuard,
    isSpecConfirmed,
    isD2CFrozen,
    canEnterDesign: effectiveCanEnterDesign,
  });
  const d2cStatusBadgeText = getD2CStatusBadgeText({
    isSpecConfirmed,
    isD2CFrozen,
    canEnterDesign: effectiveCanEnterDesign,
  });
  const d2cCheckpointActionState = getD2CCheckpointActionState({
    hasD2CMaterials,
    hasGeneratedFiles: hasGeneratedD2CFiles,
    isD2CFrozen,
    hasReviewResult: hasD2CReviewResult,
    canEnterDesign: effectiveCanEnterDesign,
    isGeneratingD2C,
    isFreezingD2C,
  });
  const d2cSummaryItems = useMemo(
    () => (d2cInfo ? buildD2CSummaryItems(d2cInfo) : []),
    [d2cInfo],
  );
  const d2cStepperSteps = useMemo(
    () =>
      getD2CStepperState({
        isSpecConfirmed,
        hasD2CMaterials,
        hasGeneratedFiles: hasGeneratedD2CFiles,
        isD2CFrozen,
        hasReviewResult: hasD2CReviewResult,
        canEnterDesign: effectiveCanEnterDesign,
        reviewSummary: d2cInfo?.reviewSummary,
      }),
    [
      isSpecConfirmed,
      hasD2CMaterials,
      hasGeneratedD2CFiles,
      isD2CFrozen,
      hasD2CReviewResult,
      effectiveCanEnterDesign,
      d2cInfo?.reviewSummary,
    ],
  );
  const fileName = isSpec ? "spec.md" : "design.md";
  const confirmTag = isSpec
    ? "<!-- SPEC_FINAL_CONFIRMATION: true -->"
    : "<!-- DESIGN_FINAL_CONFIRMATION: true -->";
  const specPathPrefix = getSpecPathPrefix(change.status);

  const refreshChange = async () => {
    try {
      await queryClient.refetchQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });
    } catch (refetchError) {
      console.warn("Failed to refetch change details:", refetchError);
      queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });
    }
  };

  const buildApplyInput = () => {
    if (!d2cInfo?.enabled) {
      return `/opsx:apply ${changeId}`;
    }

    return `/opsx:apply ${changeId}

补充实施红线：
- 当前 change 已启用 D2C，静态 UI 基线已冻结。
- D2C 仅提供视觉与交互基线；最终工程实现以 design.md 为真源。
- 允许把 mockData 替换为真实数据流、把 xShowToast 替换为真实业务处理、按需扩展 Props 契约。
- 若 design.md 明确要求为跨端正确性或组件库正确性替换实现载体，可以替换错误组件实现，但不得脱离 design 擅自推翻 UI 基线。
- 业务逻辑来源以 spec.md 和 design.md 为准。`;
  };

  const handleUpdateReviewBlock = async (
    id: string,
    newBlockContent: string,
  ) => {
    try {
      const currentRegex = new RegExp(
        `<!-- USER_INPUT_START:${id} -->([\\s\\S]*?)<!-- USER_INPUT_END:${id} -->`,
      );
      const currentMatch = currentRegex.exec(reviewContent);

      if (!currentMatch) {
        toast.error("Block not found. Please refresh.");
        return;
      }

      const newFileContent = reviewContent.replace(
        currentMatch[0],
        `<!-- USER_INPUT_START:${id} -->\n\n${newBlockContent}\n\n<!-- USER_INPUT_END:${id} -->`,
      );

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        fileName,
        newFileContent,
      );

      await refreshChange();
      toast.success(`${isSpec ? "Spec" : "Design"} updated`);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Update failed");
    }
  };

  const handleUnifiedConfirm = async () => {
    let newFullContent = reviewContent;
    let updateCount = 0;

    for (const questionId of questionBlockIds) {
      const regex = new RegExp(
        `<!-- USER_INPUT_START:${questionId} -->([\\s\\S]*?)<!-- USER_INPUT_END:${questionId} -->`,
      );
      const match = regex.exec(newFullContent);

      if (!match?.[0] || !match[1]) {
        continue;
      }

      const blockContent = match[1].trim();

      if (
        blockContent.includes("<!-- STATUS: CONFIRMED -->") ||
        blockContent.includes("✅")
      ) {
        continue;
      }

      const timestamp = new Date().toLocaleString();
      const newBlock = `${blockContent}\n\n✅ 确认无误 (${timestamp})\n<!-- STATUS: CONFIRMED -->`;
      const replacement = `<!-- USER_INPUT_START:${questionId} -->\n\n${newBlock}\n\n<!-- USER_INPUT_END:${questionId} -->`;
      newFullContent = newFullContent.replace(match[0], replacement);
      updateCount++;
    }

    if (updateCount === 0) {
      toast.info("All questions are already confirmed");
      return;
    }

    try {
      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        fileName,
        newFullContent,
      );
      await refreshChange();
      toast.success(`Confirmed ${updateCount} items`);
    } catch (error) {
      console.error("Batch confirm failed", error);
      toast.error("Failed to batch confirm");
    }
  };

  const handleRegenerateReview = async () => {
    if (isRegenerating || isConfirming) {
      return;
    }

    try {
      setIsRegenerating(true);
      const fileLabel = isSpec ? "spec.md" : "design.md";
      const message = `我已经在 change "${changeId}" 的 ${fileLabel} 中添加了一些意见和修改建议。必须仔细阅读我的意见，理解我的意图，然后重新生成 ${fileLabel}。重点关注标记为 "**用户意见**" 的部分，确保新的内容充分考虑了这些反馈。直接修改 ${fileLabel} 文件，不要创建新的文件。`;

      if (currentSessionId) {
        if (
          currentSessionProcess?.status === "running" &&
          currentSessionProcess.id
        ) {
          await continueSessionProcess.mutateAsync({
            input: { text: message },
            sessionProcessId: currentSessionProcess.id,
          });
          toast.success("提示词已发送到当前会话");
        } else {
          await createSessionProcess.mutateAsync({
            input: { text: message },
            baseSessionId: currentSessionId,
          });
          toast.success("提示词已发送，会话已启动");
        }
      } else {
        await navigator.clipboard.writeText(message);
        toast.success(
          "提示词已复制！请前往左侧【会话列表】，选择刚才的会话，粘贴并发送。",
          {
            duration: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("发送失败，请重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConfirmReview = async () => {
    if (isRegenerating || isConfirming) {
      return;
    }

    try {
      setIsConfirming(true);
      const timeTagPrefix = "<!-- CONFIRMED_AT: ";
      let updatedContent = reviewContent;

      if (updatedContent.includes(confirmTag)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${confirmTag}\\s*`, "g"),
          "",
        );
      }
      if (updatedContent.includes(timeTagPrefix)) {
        updatedContent = updatedContent.replace(
          /<!-- CONFIRMED_AT: .*? -->\s*/g,
          "",
        );
      }

      updatedContent =
        updatedContent.trim() +
        "\n\n" +
        confirmTag +
        "\n" +
        timeTagPrefix +
        new Date().toISOString() +
        " -->";

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        fileName,
        updatedContent,
      );

      if (isSpec) {
        if (hasD2CGuard) {
          if (!hasD2CMaterials) {
            toast.warning(
              "Spec 已确认。当前 change 已启用 D2C，但还缺少设计材料，已阻塞 design。",
            );
          } else {
            toast.success(
              "Spec 已确认。当前 change 已进入 D2C checkpoint，请先生成静态 UI 并确认 UI 基线。",
            );
          }
        } else {
          await createSessionProcess.mutateAsync({
            input: { text: `/opsx:continue ${changeId}` },
          });
          toast.success("Spec 已确认！已创建新会话生成 design。");
        }
      } else if (currentSessionId) {
        if (
          currentSessionProcess?.status === "running" &&
          currentSessionProcess.id
        ) {
          await continueSessionProcess.mutateAsync({
            input: { text: `/opsx:continue ${changeId}` },
            sessionProcessId: currentSessionProcess.id,
          });
          toast.success("design 已确认！提示词已发送到当前会话。");
        } else {
          await createSessionProcess.mutateAsync({
            input: { text: `/opsx:continue ${changeId}` },
            baseSessionId: currentSessionId,
          });
          toast.success("design 已确认！提示词已发送，会话已启动。");
        }
      } else {
        await navigator.clipboard.writeText(`/opsx:continue ${changeId}`);
        toast.success(
          `${isSpec ? "Spec" : "design"} 已确认！提示词已复制。请前往左侧【会话列表】，选择刚才的会话，粘贴并发送以继续。`,
          {
            duration: 6000,
          },
        );
      }

      await refreshChange();
    } catch (error) {
      console.error("Failed to confirm", error);
      toast.error("确认失败");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmAndCopy = async () => {
    try {
      setIsProcessing(true);
      setCopyMode(true);
      const confirmationTag = "<!-- TASKS_CONFIRMED: true -->";
      const timeTagPrefix = "<!-- CONFIRMED_AT: ";
      let updatedContent = tasksContent;

      if (updatedContent.includes(confirmationTag)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${confirmationTag}\\s*`, "g"),
          "",
        );
      }
      if (updatedContent.includes(timeTagPrefix)) {
        updatedContent = updatedContent.replace(
          /<!-- CONFIRMED_AT: .*? -->\s*/g,
          "",
        );
      }

      updatedContent =
        updatedContent.trim() +
        "\n\n" +
        confirmationTag +
        "\n" +
        timeTagPrefix +
        new Date().toISOString() +
        " -->";

      try {
        await specDashboardService.updateChangeFile(
          projectId,
          changeId,
          "tasks.md",
          updatedContent,
        );
      } catch (writeError) {
        console.error("Failed to write tasks confirmation", writeError);
        toast.error("写入确认标记失败，请重试");
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });

      try {
        await navigator.clipboard.writeText(buildApplyInput());
        toast.success(
          "任务已确认，提示词已复制！请前往你的编辑器粘贴并执行。",
          { duration: 5000 },
        );
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard", clipboardError);
        toast.error("确认已写入，但复制提示词失败，请手动复制");
      }
    } catch (error) {
      console.error("Failed to confirm tasks", error);
      toast.error("操作失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateTasks = async () => {
    try {
      setIsProcessing(true);
      const message = `我已经查看了 change "${changeId}" 的 tasks.md 任务规划，你需要根据我的意见来修改任务列表：\n（请在此处补充具体的修改意见，例如：细分某个任务、添加测试步骤等）。\n\n直接修改 tasks.md 文件，不要创建新的文件。`;

      await navigator.clipboard.writeText(message);
      toast.success(
        "提示词已复制！请前往左侧【会话列表】，选择刚才的会话，粘贴并补充意见。",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
      toast.error("复制失败，请手动复制");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndExecute = async () => {
    try {
      setIsProcessing(true);
      setCopyMode(false);
      const confirmationTag = "<!-- TASKS_CONFIRMED: true -->";
      const timeTagPrefix = "<!-- CONFIRMED_AT: ";
      let updatedContent = tasksContent;

      if (updatedContent.includes(confirmationTag)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${confirmationTag}\\s*`, "g"),
          "",
        );
      }
      if (updatedContent.includes(timeTagPrefix)) {
        updatedContent = updatedContent.replace(
          /<!-- CONFIRMED_AT: .*? -->\s*/g,
          "",
        );
      }

      updatedContent =
        updatedContent.trim() +
        "\n\n" +
        confirmationTag +
        "\n" +
        timeTagPrefix +
        new Date().toISOString() +
        " -->";

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "tasks.md",
        updatedContent,
      );

      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });

      toast.success("任务规划已确认");
      toast.info("正在启动实施 Agent...");

      const createResponse = await honoClient.api.cc["session-processes"].$post(
        {
          json: {
            projectId,
            input: { text: buildApplyInput() },
          },
        },
      );

      const createData = await createResponse.json();

      if ("error" in createData) {
        throw new Error(createData.error);
      }

      toast.success("实施流程已启动，即将跳转...");

      navigate({
        to: "/projects/$projectId/session",
        params: { projectId },
        search: { sessionId: createData.sessionProcess.sessionId },
      });
    } catch (error) {
      console.error("Failed to confirm and start", error);
      toast.error("启动实施失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTopPanel = () => {
    const d2cConfigCollapsible = isSpecConfirmed && d2cInfo?.enabled;
    const d2cConfigSummaryLine = d2cInfo?.enabled
      ? `D2C: ${d2cInfo.changeKind} · ${d2cInfo.materials.length} 个材料 · ${d2cStatusBadgeText}`
      : "";

    const d2cConfigPanel = d2cInfo?.enabled ? (
      <Card className="rounded-3xl border-border/70 p-5 shadow-sm">
        {d2cConfigCollapsible ? (
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="group flex w-full items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium">
                  {d2cConfigSummaryLine}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 flex flex-col gap-5">
                <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
                  {d2cProgressItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/15">
                  <dl className="divide-y divide-border/60">
                    {d2cSummaryItems.map((item) => (
                      <div
                        key={item.key}
                        className="grid gap-2 px-4 py-3.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5"
                      >
                        <dt className="pt-0.5 text-xs font-medium tracking-[0.02em] text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="min-w-0">
                          {item.values.length === 1 ? (
                            <div
                              className={
                                item.valueTone === "code"
                                  ? "break-all text-sm leading-6 text-foreground"
                                  : "text-sm leading-6 text-foreground"
                              }
                            >
                              {item.values[0]}
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {item.values.map((value) => (
                                <li
                                  key={value}
                                  className="break-all text-sm leading-6 text-foreground"
                                >
                                  {value}
                                </li>
                              ))}
                            </ul>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {isDesign && d2cInfo.baselineFrozen ? (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>UI 基线与实现载体约束</AlertTitle>
                    <AlertDescription>
                      以 design.md 为最终工程实现真源。若 design
                      明确要求替换错误组件实现，可重定稿正确组件库或跨端组件；禁止脱离
                      design 擅自推翻 UI 基线或重做布局骨架。
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <h4 className="flex items-center gap-3 text-base font-semibold tracking-[-0.01em]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  D2C 静态基线
                </h4>
                <p className="text-sm leading-6 text-muted-foreground">
                  当前 change 已启用 design-to-code-zx。Spec 阶段只声明 D2C
                  输入。
                </p>
              </div>
              <div className="w-fit rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium">
                {d2cStatusBadgeText}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
              {d2cProgressItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/15">
              <dl className="divide-y divide-border/60">
                {d2cSummaryItems.map((item) => (
                  <div
                    key={item.key}
                    className="grid gap-2 px-4 py-3.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5"
                  >
                    <dt className="pt-0.5 text-xs font-medium tracking-[0.02em] text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="min-w-0">
                      {item.values.length === 1 ? (
                        <div
                          className={
                            item.valueTone === "code"
                              ? "break-all text-sm leading-6 text-foreground"
                              : "text-sm leading-6 text-foreground"
                          }
                        >
                          {item.values[0]}
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {item.values.map((value) => (
                            <li
                              key={value}
                              className="break-all text-sm leading-6 text-foreground"
                            >
                              {value}
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </Card>
    ) : null;

    const d2cCheckpointPanel =
      isSpec && !readonly && d2cInfo?.enabled && isSpecConfirmed ? (
        <Card className="rounded-3xl border-emerald-200 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <h4 className="flex items-center gap-3 text-base font-semibold tracking-[-0.01em] text-emerald-800 dark:text-emerald-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                </span>
                D2C Checkpoint
              </h4>
              <p className="text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
                Spec 已确认。按以下步骤完成 D2C 基线验证。
              </p>
            </div>

            <D2CCheckpointStepper
              steps={d2cStepperSteps}
              hasD2CMaterials={hasD2CMaterials}
              isGeneratingD2C={isGeneratingD2C}
              isFreezingD2C={isFreezingD2C}
              canGenerate={d2cCheckpointActionState.canGenerate}
              canPreview={d2cCheckpointActionState.canPreview}
              canFreeze={d2cCheckpointActionState.canFreeze}
              isBaselineFrozen={isD2CFrozen}
              onGenerateClick={() => setD2CActionDialog("generate")}
              onPreviewToggle={() => onSwitchStage?.("d2c-preview")}
              onFreezeClick={() => onSwitchStage?.("d2c-preview")}
            />
          </div>
        </Card>
      ) : null;

    if (isStageEmpty) {
      if (
        stage === "design" &&
        hasD2CGuard &&
        (!isSpecConfirmed ||
          !hasD2CMaterials ||
          !isD2CFrozen ||
          !hasD2CReviewResult ||
          !effectiveCanEnterDesign)
      ) {
        return (
          <>
            <StageIntroBanner stage="design" />
            {d2cConfigPanel}
            <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Design 生成已被 D2C 门禁阻塞</AlertTitle>
              <AlertDescription>
                当前 change 已启用 D2C，暂不可进入 design。阻塞原因：
                {d2cBlockingReasonsText}
              </AlertDescription>
            </Alert>
          </>
        );
      }

      return (
        <>
          {d2cConfigPanel}
          {d2cCheckpointPanel}
        </>
      );
    }

    if (isTasks) {
      return (
        <>
          <StageIntroBanner stage="tasks" />
          {d2cConfigPanel}
          {isImplementing || isCompleted ? (
            <Card className="rounded-2xl border-border/70 p-4 shadow-sm">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                实施进度
              </h4>
              <Progress value={taskProgress.percent} className="mb-2 h-2" />
              <p className="text-sm text-muted-foreground">
                {taskProgress.completed} / {taskProgress.total} 任务已完成
              </p>

              {isCompleted ? (
                <Alert
                  variant="default"
                  className="mt-3 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">
                    所有任务已完成！
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-500">
                    实施阶段完成，可以进行验收或归档。
                  </AlertDescription>
                </Alert>
              ) : null}
            </Card>
          ) : null}
        </>
      );
    }

    if (isSpec || isDesign) {
      return (
        <>
          <StageIntroBanner stage={stage} />
          {d2cConfigPanel}
          {d2cCheckpointPanel}
        </>
      );
    }

    if (isSpecs) {
      return <StageIntroBanner stage="specs" />;
    }

    return <StageIntroBanner stage="tests" />;
  };

  const renderBody = () => {
    if (isStageEmpty) {
      if (
        stage === "design" &&
        hasD2CGuard &&
        (!isSpecConfirmed ||
          !hasD2CMaterials ||
          !isD2CFrozen ||
          !hasD2CReviewResult ||
          !effectiveCanEnterDesign)
      ) {
        return (
          <StageEmptyState
            stage="design"
            title="Design 暂不可生成"
            description={`当前 change 已启用 D2C，但门禁尚未满足。阻塞原因：${d2cBlockingReasonsText}`}
            hint="请先回到 Spec 页，依次补齐门禁步骤，随后再继续生成 design。"
          />
        );
      }
      return <StageEmptyState stage={stage} />;
    }

    if (isReviewStage) {
      return (
        <ReviewDocumentBody
          parts={parts}
          questionBlockIds={questionBlockIds}
          readonly={readonly}
          onConfirmBlock={(id, blockContent) => {
            const timestamp = new Date().toLocaleString();
            const cleanContent = blockContent
              .replace(/\(待确认：请审查上方内容\)/g, "")
              .trim();
            const newBlock = cleanContent
              ? `${cleanContent}\n\n✅ 逻辑已确认 (${timestamp})\n<!-- STATUS: CONFIRMED -->`
              : `✅ 逻辑已确认 (${timestamp})\n<!-- STATUS: CONFIRMED -->`;

            handleUpdateReviewBlock(id, newBlock);
          }}
          onUpdateBlock={(id, newContent) => {
            handleUpdateReviewBlock(id, newContent);
          }}
          onAddComment={(id, blockContent, comment) => {
            const cleanContent = blockContent
              .replace(/\(待确认：请审查上方内容\)/g, "")
              .trim();
            const newBlock = cleanContent
              ? `${cleanContent}\n\n**用户意见**：${comment}`
              : `**用户意见**：${comment}`;

            handleUpdateReviewBlock(id, newBlock);
          }}
          onUnifiedConfirm={handleUnifiedConfirm}
        />
      );
    }

    if (isTasks) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <MarkdownContent content={tasksContent} />
        </div>
      );
    }

    if (isSpecs) {
      return (
        <div className="space-y-6">
          {specsContent ? (
            <div id="specs-root-file" className="scroll-mt-20">
              <Collapsible
                defaultOpen={true}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
              >
                <CollapsibleTrigger className="group flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/30">
                  <h4 className="flex items-center gap-2 break-all font-mono text-sm font-semibold">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    {specPathPrefix}/{changeId}/specs.md
                  </h4>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-0">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownContent content={specsContent} />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : null}

          {specFiles.length > 0 ? (
            <div className="space-y-3">
              {specsContent ? (
                <h4 className="ml-1 text-sm font-medium text-muted-foreground">
                  Detailed Specs
                </h4>
              ) : null}
              {specFiles.map((file) => {
                const fileId = `spec-file-${generateMarkdownHeadingId(file.name)}`;

                return (
                  <div key={file.name} id={fileId} className="scroll-mt-20">
                    <Collapsible
                      defaultOpen={false}
                      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
                    >
                      <CollapsibleTrigger className="group flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/30">
                        <ChevronRight className="mr-3 h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        <span className="truncate font-mono text-xs text-secondary-foreground">
                          {specPathPrefix}/{changeId}/specs/{file.name}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t border-border/60 bg-background">
                        <div className="overflow-x-auto p-4 text-xs">
                          <MarkdownContent
                            content={`\`\`\`markdown\n${file.content}\n\`\`\``}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <MarkdownContent content={testsContent ?? ""} />
      </div>
    );
  };

  const renderFooter = () => {
    if (isStageEmpty) {
      return null;
    }

    if (isReviewStage) {
      if (specD2CFooterMode === "checkpoint") {
        if (isSpec && !readonly) {
          if (!hasGeneratedD2CFiles) {
            return d2cPrimaryState ? (
              <D2CCheckpointActionBar
                primaryState={d2cPrimaryState}
                onGenerate={() => {
                  setD2CActionDialog("generate");
                }}
                onFreezeBaseline={onFreezeBaseline}
                onContinueToDesign={onContinueToDesign}
                onRequestReview={onRequestReview}
                onRequestReviewFollowup={onRequestReviewFollowup}
                onRefreshReview={onRefreshReview}
                onApproveReviewOverride={onApproveReviewOverride}
                isApprovingReviewOverride={isApprovingReviewOverride}
                onUndoFreezeBaseline={
                  canUndoFreeze ? () => onUndoFreezeBaseline() : undefined
                }
                isUndoingFreezeBaseline={isUndoingFreezeBaseline}
              />
            ) : null;
          }

          return (
            <>
              <div className="mb-3 flex items-center gap-2">
                <h4 className="font-semibold text-base">
                  继续在 Preview 完成 D2C checkpoint
                </h4>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onSwitchStage?.("d2c-preview");
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  进入 Preview 继续处理
                </Button>
                {effectiveCanEnterDesign && isD2CFrozen ? (
                  <Button
                    className="flex-1 cursor-pointer"
                    variant="outline"
                    onClick={() => {
                      onContinueToDesign();
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    继续进入 Design
                  </Button>
                ) : null}
              </div>
              <div className="mt-3 flex items-start gap-1 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <span>
                  Preview 是 D2C checkpoint
                  的主操作区。请在那里完成审查、补充说明、人工放行或 UI
                  基线确认。
                </span>
              </div>
            </>
          );
        }

        return d2cPrimaryState ? (
          <D2CCheckpointActionBar
            primaryState={d2cPrimaryState}
            onGenerate={() => {
              setD2CActionDialog("generate");
            }}
            onFreezeBaseline={onFreezeBaseline}
            onContinueToDesign={onContinueToDesign}
            onRequestReview={onRequestReview}
            onRequestReviewFollowup={onRequestReviewFollowup}
            onRefreshReview={onRefreshReview}
            onApproveReviewOverride={onApproveReviewOverride}
            isApprovingReviewOverride={isApprovingReviewOverride}
            onUndoFreezeBaseline={
              canUndoFreeze ? () => onUndoFreezeBaseline() : undefined
            }
            isUndoingFreezeBaseline={isUndoingFreezeBaseline}
            secondaryAction={
              d2cPrimaryState.mode !== "design-ready" && hasGeneratedD2CFiles
                ? {
                    label: "预览 D2C 产物",
                    onClick: () => {
                      onSwitchStage?.("d2c-preview");
                    },
                  }
                : undefined
            }
          />
        ) : null;
      }

      return !readonly && hasReviewContent ? (
        <>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="font-semibold text-base">
              若完成{isSpec ? " Spec " : " Design "}评审，请选择下一步
            </h4>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 cursor-pointer"
              variant="outline"
              onClick={handleRegenerateReview}
              disabled={isRegenerating || isConfirming}
            >
              {isRegenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              重新生成{isSpec ? " Spec" : " Design"}
            </Button>

            <Button
              className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (isSpec && hasD2CGuard && !isSpecConfirmed) {
                  setD2CActionDialog("spec-confirm");
                  return;
                }
                void handleConfirmReview();
              }}
              disabled={isRegenerating || isConfirming}
            >
              {isConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {isSpec
                ? hasD2CGuard && !isSpecConfirmed
                  ? "确认 Spec，进入 D2C checkpoint"
                  : "确认 Spec 并生成 design"
                : "设计无误，生成任务"}
            </Button>
          </div>

          <div className="mt-3 flex items-start gap-1 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>
              {isSpec && hasD2CGuard
                ? "确认 Spec 后不会直接进入 design，而是进入 D2C checkpoint。此时只检查视觉完整与交互闭环，不分析技术实现。"
                : isSpec
                  ? "确认后将使用指令创建新的独立会话来生成 design。如需修改spec，建议切换到生成当前 spec 的会话，保持 spec 阶段的上下文连续。"
                  : "点击按钮后将直接创建新的后续会话，继续推进下一阶段。"}
            </span>
          </div>
        </>
      ) : null;
    }

    if (
      !isTasks ||
      readonly ||
      (!isPlanning && !isImplementing && !isCompleted)
    ) {
      return null;
    }

    return (
      <>
        {isPlanning && !tasksConfirmed ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <h4 className="font-semibold text-base">任务规划评审</h4>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 cursor-pointer"
                variant="outline"
                onClick={handleRegenerateTasks}
                disabled={isProcessing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isProcessing ? "处理中..." : "重新生成任务"}
              </Button>

              <Button
                className="flex-1 cursor-pointer"
                variant="outline"
                onClick={handleConfirmAndCopy}
                disabled={isProcessing}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isProcessing && copyMode
                  ? "处理中..."
                  : "确认计划，复制提示词"}
              </Button>

              <Button
                className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700"
                onClick={handleConfirmAndExecute}
                disabled={isProcessing}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isProcessing && !copyMode
                  ? "请求中..."
                  : "确认并在 Claude Code 实施"}
              </Button>
            </div>
            <div className="mt-3 flex items-start gap-1 text-xs text-muted-foreground">
              <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span>
                "复制提示词"将确认任务并复制实施指令到剪贴板，可在 Cursor
                等外部编辑器中粘贴执行。"在 Claude Code
                实施"将自动创建新会话并启动实施 Agent。
              </span>
            </div>
          </>
        ) : null}

        {isPlanning && tasksConfirmed && !copyMode ? (
          <div className="py-2 text-center">
            <span className="flex items-center justify-center gap-2 font-medium text-primary">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              任务已确认，正在启动实施流程...
            </span>
          </div>
        ) : null}

        {isImplementing ? (
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-medium">实施进行中</p>
              <p className="text-xs text-muted-foreground">
                执行任务时，请保持页面开启。
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmAndExecute}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              重试实施
            </Button>
          </div>
        ) : null}

        {isCompleted ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex-1">
              <p className="flex items-center gap-2 font-medium text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                实施已完成
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: "/projects" });
              }}
              className="cursor-pointer"
            >
              查看项目列表
            </Button>

            <Button
              className="cursor-pointer bg-gray-600 hover:bg-gray-700"
              onClick={async () => {
                try {
                  const response = await honoClient.api.cc[
                    "session-processes"
                  ].$post({
                    json: {
                      projectId,
                      input: { text: `/opsx:archive ${changeId}` },
                    },
                  });

                  const data = await response.json();

                  if ("error" in data) {
                    throw new Error(data.error);
                  }

                  toast.success("正在归档...");

                  navigate({
                    to: "/projects/$projectId/session",
                    params: { projectId },
                    search: { sessionId: data.sessionProcess.sessionId },
                  });
                } catch (error) {
                  console.error("Failed to archive", error);
                  toast.error("归档失败");
                }
              }}
            >
              归档此 Change
            </Button>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <>
      <Dialog
        open={d2cActionDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setD2CActionDialog(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {d2cActionDialog === "spec-confirm"
                ? "确认 Spec，进入 D2C checkpoint"
                : "生成 D2C 静态 UI"}
            </DialogTitle>
            <DialogDescription>
              {d2cActionDialog === "spec-confirm"
                ? "这一步不会直接生成 design。系统会先把当前 change 推进到 D2C checkpoint，接下来需要生成静态 UI、完成预览并确认 UI 基线。"
                : "将向当前会话发送指令，让大模型读取 spec 中的 D2C 配置并生成静态 UI 产物。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setD2CActionDialog(null);
              }}
              disabled={isConfirming || isGeneratingD2C || isFreezingD2C}
            >
              取消
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                if (d2cActionDialog === "spec-confirm") {
                  void handleConfirmReview();
                  setD2CActionDialog(null);
                  return;
                }
                if (d2cActionDialog === "generate") {
                  void onGenerate();
                  setD2CActionDialog(null);
                  return;
                }
              }}
              disabled={isConfirming || isGeneratingD2C || isFreezingD2C}
            >
              {isConfirming || isGeneratingD2C || isFreezingD2C ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SpecDocumentWorkbench
        stage={stage}
        title={changeId}
        sidebarToc={sidebarToc}
        contentKey={stage}
        topPanel={renderTopPanel()}
        footer={renderFooter()}
      >
        {renderBody()}
      </SpecDocumentWorkbench>
    </>
  );
};
