import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  MessageSquareWarning,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { D2CCheckpointActionBarState } from "./d2cCheckpointWorkflow";

interface D2CCheckpointActionBarProps {
  className?: string;
  onApproveReviewOverride: (reason: string) => Promise<boolean>;
  onContinueToDesign: () => void;
  onFreezeBaseline: () => void;
  onGenerate: () => void;
  onRefreshReview: () => void;
  onRequestReview: () => void;
  onRequestReviewFollowup: () => void;
  onUndoFreezeBaseline?: () => void;
  isApprovingReviewOverride?: boolean;
  isUndoingFreezeBaseline?: boolean;
  primaryState: D2CCheckpointActionBarState;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
}

const resolvePrimaryIcon = (
  primaryAction: D2CCheckpointActionBarState["primaryAction"],
) => {
  if (primaryAction === "request-review") {
    return CheckCircle2;
  }
  if (primaryAction === "continue-design") {
    return CheckCircle2;
  }
  if (primaryAction === "freeze") {
    return CheckCircle2;
  }
  if (primaryAction === "refresh-review") {
    return RefreshCw;
  }
  if (primaryAction === "request-followup") {
    return MessageSquareWarning;
  }
  return Sparkles;
};

export const D2CCheckpointActionBar: FC<D2CCheckpointActionBarProps> = ({
  className,
  onApproveReviewOverride,
  onContinueToDesign,
  onFreezeBaseline,
  onGenerate,
  onRefreshReview,
  onRequestReview,
  onRequestReviewFollowup,
  onUndoFreezeBaseline,
  isApprovingReviewOverride = false,
  isUndoingFreezeBaseline = false,
  primaryState,
  secondaryAction,
}) => {
  const PrimaryIcon = resolvePrimaryIcon(primaryState.primaryAction);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const isBusyLabel =
    primaryState.primaryLabel.includes("正在") ||
    primaryState.primaryLabel.includes("发送");
  const canUndoFreeze =
    typeof onUndoFreezeBaseline === "function" &&
    primaryState.mode === "design-ready";

  const resolvedSecondaryAction = useMemo(() => {
    if (canUndoFreeze) {
      return {
        icon: Lock,
        label: isUndoingFreezeBaseline
          ? "正在撤销 UI 基线确认"
          : "撤销 UI 基线确认",
        onClick: onUndoFreezeBaseline,
        disabled: isUndoingFreezeBaseline,
        variant: "outline" as const,
      };
    }

    if (primaryState.mode === "review-failed") {
      return {
        icon: Lock,
        label: isApprovingReviewOverride ? "正在记录人工放行" : "强制通过审查",
        onClick: () => setOverrideDialogOpen(true),
        disabled: isApprovingReviewOverride,
        variant: "outline" as const,
      };
    }

    if (primaryState.mode === "review-stale") {
      return {
        icon: RefreshCw,
        label: "再次请求 D2C 审查",
        onClick: onRequestReview,
        disabled: false,
        variant: "outline" as const,
      };
    }

    if (
      primaryState.mode === "review-followup-waiting" ||
      primaryState.mode === "review-followup-stale"
    ) {
      return {
        icon: MessageSquareWarning,
        label: "再次请求补充说明",
        onClick: onRequestReviewFollowup,
        disabled: false,
        variant: "outline" as const,
      };
    }

    if (secondaryAction) {
      return {
        icon: Eye,
        label: secondaryAction.label,
        onClick: secondaryAction.onClick,
        disabled: false,
        variant: secondaryAction.variant ?? ("outline" as const),
      };
    }

    return null;
  }, [
    canUndoFreeze,
    isApprovingReviewOverride,
    isUndoingFreezeBaseline,
    onRequestReview,
    onRequestReviewFollowup,
    onUndoFreezeBaseline,
    primaryState.mode,
    secondaryAction,
  ]);
  const SecondaryIcon = resolvedSecondaryAction?.icon;

  return (
    <>
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-base">{primaryState.title}</h4>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {resolvedSecondaryAction ? (
            <Button
              type="button"
              variant={resolvedSecondaryAction.variant}
              className="flex-1 cursor-pointer"
              onClick={resolvedSecondaryAction.onClick}
              disabled={resolvedSecondaryAction.disabled}
            >
              {SecondaryIcon ? (
                <SecondaryIcon className="mr-2 h-4 w-4" />
              ) : null}
              {resolvedSecondaryAction.label}
            </Button>
          ) : null}

          <Button
            type="button"
            className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700"
            onClick={() => {
              if (primaryState.primaryAction === "continue-design") {
                onContinueToDesign();
                return;
              }
              if (primaryState.primaryAction === "freeze") {
                setConfirmDialogOpen(true);
                return;
              }
              if (primaryState.primaryAction === "request-review") {
                onRequestReview();
                return;
              }
              if (primaryState.primaryAction === "refresh-review") {
                onRefreshReview();
                return;
              }
              if (primaryState.primaryAction === "request-followup") {
                onRequestReviewFollowup();
                return;
              }
              onGenerate();
            }}
            disabled={primaryState.primaryDisabled}
          >
            {isBusyLabel ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PrimaryIcon className="mr-2 h-4 w-4" />
            )}
            {primaryState.primaryLabel}
          </Button>
        </div>

        <div className="flex items-start gap-1 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span>
            {primaryState.primaryDisabled
              ? `当前步骤尚未满足执行条件。${primaryState.description}`
              : primaryState.description}
          </span>
        </div>
      </div>
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>确认 UI 基线</DialogTitle>
            <DialogDescription>
              这会将当前静态 UI 标记为已确认基线，并写入 `spec.md`。在进入
              Design 之前，你仍可以撤销这次确认。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                onFreezeBaseline();
                setConfirmDialogOpen(false);
              }}
            >
              确认 UI 基线
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>强制通过审查</DialogTitle>
            <DialogDescription>
              当前 D2C
              审查未通过。只有在你确认风险可接受时，才应人工放行并继续确认 UI
              基线。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={overrideReason}
            onChange={(event) => setOverrideReason(event.target.value)}
            placeholder="请简要说明为什么仍决定接受当前 UI 基线，例如：缺失边界态已和业务确认，design 阶段补齐。"
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOverrideDialogOpen(false);
                setOverrideReason("");
              }}
            >
              取消
            </Button>
            <Button
              onClick={async () => {
                const success = await onApproveReviewOverride(overrideReason);
                if (!success) {
                  return;
                }
                setOverrideDialogOpen(false);
                setOverrideReason("");
              }}
              disabled={
                isApprovingReviewOverride || overrideReason.trim().length === 0
              }
            >
              {isApprovingReviewOverride ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              记录并继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
