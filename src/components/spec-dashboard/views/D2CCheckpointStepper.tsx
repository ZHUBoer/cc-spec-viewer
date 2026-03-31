import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { D2CStepperStep } from "./document-utils";

interface D2CCheckpointStepperProps {
  steps: D2CStepperStep[];
  hasD2CMaterials: boolean;
  isGeneratingD2C: boolean;
  isFreezingD2C: boolean;
  canGenerate: boolean;
  canPreview: boolean;
  canFreeze: boolean;
  isBaselineFrozen: boolean;
  onGenerateClick: () => void;
  onPreviewToggle: () => void;
  onFreezeClick: () => void;
}

const ONBOARDING_KEY = "d2c-checkpoint-onboarded";

const stepIcons: Record<D2CStepperStep["key"], typeof CheckCircle2> = {
  "confirm-spec": CheckCircle2,
  generate: Sparkles,
  review: Eye,
  freeze: Lock,
};

const stepTooltips: Record<D2CStepperStep["key"], string> = {
  "confirm-spec": "确认 Spec 的内容无误后才能进入后续步骤",
  generate: "AI 会根据 Figma 设计稿链接生成页面代码",
  review: "基于当前静态 UI 生成结构化审查结论，判断是否可进入 Design",
  freeze: "确认 UI 基线后才能继续进入 Design 阶段",
};

const statusColors: Record<D2CStepperStep["status"], string> = {
  completed:
    "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-600",
  active:
    "border-primary bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary",
  pending:
    "border-muted-foreground/30 bg-muted/20 text-muted-foreground dark:bg-muted/10",
  error:
    "border-destructive bg-destructive/5 text-destructive dark:bg-destructive/10 dark:text-destructive",
};

const connectorColors: Record<D2CStepperStep["status"], string> = {
  completed: "bg-emerald-400 dark:bg-emerald-600",
  active: "bg-primary/40",
  pending: "bg-muted-foreground/20",
  error: "bg-destructive/30",
};

export const D2CCheckpointStepper: FC<D2CCheckpointStepperProps> = ({
  steps,
  hasD2CMaterials,
  isGeneratingD2C,
  isFreezingD2C,
  canGenerate,
  canPreview,
  canFreeze,
  isBaselineFrozen,
  onGenerateClick,
  onPreviewToggle,
  onFreezeClick,
}) => {
  const [showTooltips, setShowTooltips] = useState(false);

  useEffect(() => {
    try {
      const onboarded = localStorage.getItem(ONBOARDING_KEY);
      if (onboarded !== "true") {
        setShowTooltips(true);
        localStorage.setItem(ONBOARDING_KEY, "true");
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismissTooltips = useCallback(() => {
    setShowTooltips(false);
  }, []);

  const renderStepAction = (step: D2CStepperStep) => {
    if (step.key === "generate" && step.status === "active") {
      return (
        <div className="mt-3 flex flex-col gap-2">
          {!hasD2CMaterials ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>缺少设计输入</AlertTitle>
              <AlertDescription>
                请先在 Spec 的 D2C
                配置区补充设计材料。每条材料都需要链接、关键说明和目标范围。
              </AlertDescription>
            </Alert>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer gap-1.5 bg-background/90"
            onClick={onGenerateClick}
            disabled={!canGenerate}
          >
            {isGeneratingD2C ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isGeneratingD2C ? "正在发送生成指令" : "生成静态 UI"}
          </Button>
        </div>
      );
    }

    if (step.key === "generate" && step.status === "error") {
      return (
        <div className="mt-3 flex flex-col gap-2">
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>D2C 审查未通过</AlertTitle>
            <AlertDescription>
              {step.description ??
                "请先补充缺失材料或交互说明，再继续处理当前审查结果。"}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer gap-1.5 bg-background/90"
            onClick={onPreviewToggle}
            disabled={!canPreview}
          >
            <Eye className="h-3.5 w-3.5" />
            进入 Preview 继续处理
          </Button>
        </div>
      );
    }

    if (step.key === "review" && step.status === "active") {
      return (
        <div className="mt-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer gap-1.5 bg-background/90"
            onClick={onPreviewToggle}
            disabled={!canPreview}
          >
            <Eye className="h-3.5 w-3.5" />
            进入 Preview 查看并完成审查
          </Button>
          <p className="text-xs text-muted-foreground">
            先查看当前静态 UI，再通过底部操作完成 D2C 审查。
          </p>
        </div>
      );
    }

    if (step.key === "freeze" && step.status === "active") {
      return (
        <div className="mt-3">
          <Button
            size="sm"
            className="w-fit cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={onFreezeClick}
            disabled={!canFreeze}
          >
            {isFreezingD2C ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {isBaselineFrozen
              ? "UI 基线已确认"
              : isFreezingD2C
                ? "正在确认 UI 基线"
                : "进入 Preview 确认 UI 基线"}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="space-y-0"
      onClick={showTooltips ? dismissTooltips : undefined}
      onKeyDown={showTooltips ? dismissTooltips : undefined}
    >
      {steps.map((step, index) => {
        const Icon = stepIcons[step.key];
        const isLast = index === steps.length - 1;
        const isExpandable =
          step.status === "active" || step.status === "error";

        const stepContent = (
          <div className="flex gap-3">
            {/* Icon column with connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  statusColors[step.status],
                )}
              >
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 rounded-full transition-colors",
                    connectorColors[step.status],
                  )}
                  style={{ minHeight: 16 }}
                />
              ) : null}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.status === "completed" &&
                      "text-emerald-700 dark:text-emerald-300",
                    step.status === "active" && "text-foreground",
                    step.status === "pending" && "text-muted-foreground",
                    step.status === "error" &&
                      "text-destructive dark:text-destructive",
                  )}
                >
                  {step.label}
                </span>
                {step.status === "completed" ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    已完成
                  </span>
                ) : null}
              </div>

              {step.description &&
              step.status !== "active" &&
              step.status !== "error" ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.description}
                </p>
              ) : null}

              {isExpandable ? renderStepAction(step) : null}
            </div>
          </div>
        );

        if (
          showTooltips &&
          (step.status === "active" || step.status === "pending")
        ) {
          return (
            <Tooltip key={step.key} defaultOpen={step.status === "active"}>
              <TooltipTrigger asChild>
                <div>{stepContent}</div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                {stepTooltips[step.key]}
              </TooltipContent>
            </Tooltip>
          );
        }

        return <div key={step.key}>{stepContent}</div>;
      })}
    </div>
  );
};
