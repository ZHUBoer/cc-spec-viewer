import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  GitCompare,
  ListTodo,
  Loader2,
  PenTool,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import {
  type OpenSpecChange,
  specDashboardService,
} from "./SpecDashboardService";
import { StatusBadge } from "./StatusBadge";
import { D2CPreviewPanel } from "./views/D2CPreviewPanel";
import {
  canUndoD2CBaselineFreeze,
  resolveD2CCheckpointActionBarState,
} from "./views/d2cCheckpointWorkflow";
import { StageDocumentView } from "./views/StageDocumentView";
import { useD2CCheckpointActions } from "./views/useD2CCheckpointActions";

// Context payload passed from Sidebar
export interface SpecPanelContext {
  projectId: string;
  changeId: string;
  targetStage?: "spec" | "proposal" | "design" | "tasks";
  openedAt?: number;
}

interface SpecContextPanelProps {
  context: unknown;
}

type Stage = "spec" | "d2c-preview" | "specs" | "design" | "tasks" | "tests";

/** 根据 change 内容的生成状态，确定应展示的默认标签页 */
function determineDefaultStage(change: OpenSpecChange): Stage {
  if (change.tasksContent) return "tasks";
  if (change.designContent) return "design";
  return "spec";
}

export const SpecContextPanel: FC<SpecContextPanelProps> = ({ context }) => {
  const [activeStage, setActiveStage] = useState<Stage>("spec");
  const prevChangeIdRef = useRef<string | null>(null);
  const prevOpenRequestKeyRef = useRef<string | null>(null);

  // Safe cast and validation
  const ctx = context as SpecPanelContext;
  const isValidContext =
    ctx &&
    typeof ctx.projectId === "string" &&
    typeof ctx.changeId === "string";
  const targetStage: "spec" | "design" | "tasks" | null = (() => {
    switch (ctx?.targetStage) {
      case "spec":
      case "proposal":
        return "spec"; // compat
      case "design":
      case "tasks":
        return ctx.targetStage;
      default:
        return null;
    }
  })();
  const openRequestKey =
    targetStage !== null && typeof ctx?.openedAt === "number"
      ? `${ctx.projectId}:${ctx.changeId}:${targetStage}:${ctx.openedAt}`
      : null;

  const {
    data: change,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["openspec", "change", ctx?.projectId, ctx?.changeId],
    queryFn: async () => {
      if (!isValidContext) return null;
      return specDashboardService.getChangeDetails(ctx.projectId, ctx.changeId);
    },
    enabled: isValidContext,
    // 在 implementing 状态时每 2 秒刷新一次
    refetchInterval: (query) =>
      query.state.data?.status === "implementing" ? 2000 : false,
    // 保留之前的数据，避免在刷新时显示错误页面
    placeholderData: (previousData) => previousData,
  });

  const showD2CPreviewTab =
    change?.d2c?.enabled && change?.d2c?.hasGeneratedFiles;
  const specReviewContent =
    change?.specContent ?? change?.proposalContent ?? "";
  const isSpecConfirmed =
    specReviewContent.includes("<!-- SPEC_FINAL_CONFIRMATION: true -->") ||
    specReviewContent.includes("<!-- PROPOSAL_FINAL_CONFIRMATION: true -->");
  const hasD2CMaterials = (change?.d2c?.materials.length ?? 0) > 0;
  const hasD2CReviewResult =
    change?.d2c?.reviewStatus !== undefined &&
    change.d2c.reviewStatus !== "unknown";
  const {
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
  } = useD2CCheckpointActions({
    change: change ?? {
      name: "",
      status: "draft",
      updatedAt: "",
    },
    changeId: ctx.changeId,
    onGeneratedArtifactsReady: () => {
      setActiveStage("d2c-preview");
    },
    projectId: ctx.projectId,
  });
  const resolvedD2CPrimaryState = change?.d2c?.enabled
    ? resolveD2CCheckpointActionBarState({
        isSpecConfirmed,
        hasD2CMaterials,
        hasGeneratedFiles: Boolean(change.d2c.hasGeneratedFiles),
        hasReviewResult: hasD2CReviewResult,
        canEnterDesign: Boolean(change.d2c.canEnterDesign),
        effectiveCanEnterDesign: Boolean(change.d2c.effectiveCanEnterDesign),
        isD2CFrozen: Boolean(change.d2c.baselineFrozen),
        isGeneratingD2C,
        isFreezingD2C,
        isContinuingToDesign,
        reviewRequestState,
        reviewSummary: change.d2c.reviewSummary,
      })
    : null;
  const canUndoFreeze =
    change?.d2c?.enabled === true
      ? canUndoD2CBaselineFreeze({
          isD2CFrozen: Boolean(change.d2c.baselineFrozen),
          status: change.status,
          designContent: change.designContent,
        })
      : false;

  // Effect: 当 changeId 变化（包括首次加载）时，自动选择合适的默认标签页；
  // 同时处理当前标签无效的回退逻辑
  useEffect(() => {
    if (!change) return;

    // 同一 change 上重复点击卡片时，也应按 artifact 切换到目标阶段
    if (
      openRequestKey !== null &&
      targetStage !== null &&
      prevOpenRequestKeyRef.current !== openRequestKey
    ) {
      prevOpenRequestKeyRef.current = openRequestKey;
      setActiveStage(targetStage);
      prevChangeIdRef.current = ctx.changeId;
      return;
    }

    // 当 changeId 变化时，自动选择合适的标签
    // 需确认 change 数据确实对应当前 changeId，避免 placeholderData 带来的竞态
    if (
      prevChangeIdRef.current !== ctx.changeId &&
      change.name === ctx.changeId
    ) {
      prevChangeIdRef.current = ctx.changeId;
      setActiveStage(determineDefaultStage(change));
      return;
    }

    // 原有逻辑：当前标签无效时回退
    const hasSpecs = !!(
      change.specsContent ||
      (change.specFiles && change.specFiles.length > 0)
    );
    const hasTests = !!change.testsContent;

    if (activeStage === "specs" && !hasSpecs) {
      setActiveStage(determineDefaultStage(change));
    } else if (activeStage === "tests" && !hasTests) {
      setActiveStage(determineDefaultStage(change));
    } else if (activeStage === "d2c-preview" && !showD2CPreviewTab) {
      setActiveStage(determineDefaultStage(change));
    }
  }, [
    change,
    activeStage,
    ctx.changeId,
    openRequestKey,
    targetStage,
    showD2CPreviewTab,
  ]);

  if (!isValidContext) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No spec context selected</p>
      </div>
    );
  }

  // 只在初始加载时显示 loading
  if (isLoading && !change) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading context...</p>
      </div>
    );
  }

  // 只在初始加载失败且没有缓存数据时显示错误
  // 由于使用了 placeholderData，即使查询失败 change 也可能保留之前的值
  // 所以只有当 change 为 null/undefined 且（有错误或不在加载中）时才显示错误
  if (!change && (error || (!isLoading && !isFetching))) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load context</p>
        {error && (
          <p className="text-sm mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </p>
        )}
      </div>
    );
  }

  // 如果有错误但之前有数据，继续显示之前的数据（后台刷新失败不影响显示）
  // change 此时应该存在（因为上面已经检查过）
  if (!change) {
    // 如果 change 仍然为 null，返回一个占位符（不应该到达这里，但为了类型安全）
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No data available</p>
      </div>
    );
  }

  const handleSwitchStage = (stage: string) => {
    setActiveStage(stage as Stage);
  };

  const renderContent = () => {
    if (activeStage === "d2c-preview") {
      return (
        <D2CPreviewPanel
          projectId={ctx.projectId}
          changeId={ctx.changeId}
          d2cPrimaryState={resolvedD2CPrimaryState}
          canUndoFreeze={canUndoFreeze}
          isApprovingReviewOverride={isApprovingReviewOverride}
          onContinueToDesign={handleContinueToDesign}
          onFreezeBaseline={handleFreezeD2CBaseline}
          onGenerate={handleTriggerD2CGeneration}
          onApproveReviewOverride={handleApproveReviewOverride}
          onRefreshReview={handleRefreshD2CReviewStatus}
          onRequestReview={handleRequestD2CReview}
          onRequestReviewFollowup={handleRequestReviewFollowup}
          onUndoFreezeBaseline={handleUndoFreezeD2CBaseline}
          isUndoingFreezeBaseline={isUndoingFreezeD2C}
        />
      );
    }

    switch (activeStage) {
      case "spec":
      case "specs":
      case "design":
      case "tasks":
      case "tests":
        return (
          <StageDocumentView
            projectId={ctx.projectId}
            changeId={ctx.changeId}
            stage={activeStage}
            change={change}
            d2cPrimaryState={resolvedD2CPrimaryState}
            canUndoFreeze={canUndoFreeze}
            isApprovingReviewOverride={isApprovingReviewOverride}
            isFreezingD2C={isFreezingD2C}
            isGeneratingD2C={isGeneratingD2C}
            isUndoingFreezeBaseline={isUndoingFreezeD2C}
            onApproveReviewOverride={handleApproveReviewOverride}
            onContinueToDesign={handleContinueToDesign}
            onFreezeBaseline={handleFreezeD2CBaseline}
            onGenerate={handleTriggerD2CGeneration}
            onRefreshReview={handleRefreshD2CReviewStatus}
            onRequestReview={handleRequestD2CReview}
            onRequestReviewFollowup={handleRequestReviewFollowup}
            onUndoFreezeBaseline={handleUndoFreezeD2CBaseline}
            onSwitchStage={handleSwitchStage}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Stage Navigation */}
      <div className="flex flex-col border-b border-border bg-muted/20">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{change.name}</h3>
            <span className="text-[10px] text-muted-foreground tracking-wider font-medium">
              {activeStage}
            </span>
          </div>
          <div className="flex-shrink-0 pr-10">
            <StatusBadge status={change.status} />
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="flex px-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "spec", icon: FileText, label: "Spec" },
            ...(showD2CPreviewTab
              ? [
                  {
                    id: "d2c-preview" as const,
                    icon: Eye,
                    label: "预览",
                  },
                ]
              : []),
            { id: "specs", icon: GitCompare, label: "Specs" },
            { id: "design", icon: PenTool, label: "Design" },
            { id: "tasks", icon: ListTodo, label: "Tasks" },
            { id: "tests", icon: CheckCircle2, label: "Tests" },
          ]
            .filter((stage) => {
              if (stage.id === "specs") {
                return !!(
                  change.specsContent ||
                  (change.specFiles && change.specFiles.length > 0)
                );
              }
              if (stage.id === "tests") {
                return !!change.testsContent;
              }
              return true;
            })
            .map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setActiveStage(stage.id as Stage);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-primary text-primary bg-muted/30"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {stage.label}
                </button>
              );
            })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {renderContent()}
      </div>
    </div>
  );
};
