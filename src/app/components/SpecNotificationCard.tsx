import { CheckCircle2, ChevronRight, FileText, Loader2 } from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { specDashboardService } from "@/components/spec-dashboard/SpecDashboardService";
import { useWorkspacePanel } from "@/hooks/useWorkspacePanel";

export interface SpecNotificationProps {
  artifact: "spec" | "proposal" | "design" | "tasks";
  title: string;
  description: string;
  projectId?: string;
  changeId?: string;
}

export const SpecNotificationCard: FC<SpecNotificationProps> = ({
  artifact,
  changeId,
  title,
  description,
}) => {
  const { openSpec, specContext } = useWorkspacePanel();
  const [isOpening, setIsOpening] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const openedFeedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openedFeedbackTimerRef.current !== null) {
        window.clearTimeout(openedFeedbackTimerRef.current);
      }
    };
  }, []);

  // 从当前 URL 解析 projectId
  // 格式: /projects/{projectId}/session
  const getProjectIdFromUrl = (): string | null => {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const projectIdIdx = pathSegments.indexOf("projects");

    if (projectIdIdx !== -1) {
      const projectId = pathSegments[projectIdIdx + 1];
      if (projectId) return projectId;
    }

    return null;
  };

  const isValidSpecContext = (
    context: unknown,
  ): context is { projectId: string; changeId: string } => {
    if (context === null || typeof context !== "object") return false;
    const ctx = Object(context);
    return (
      typeof ctx.projectId === "string" &&
      ctx.projectId.length > 0 &&
      typeof ctx.changeId === "string" &&
      ctx.changeId.length > 0
    );
  };

  const artifactLabel = useMemo(() => {
    const labels: Record<SpecNotificationProps["artifact"], string> = {
      spec: "需求 Spec",
      proposal: "需求 Spec",
      design: "技术设计",
      tasks: "任务规划",
    };
    return labels[artifact];
  }, [artifact]);

  const ctaLabel = useMemo(() => {
    const labels: Record<SpecNotificationProps["artifact"], string> = {
      spec: "立即查看 Spec",
      proposal: "立即查看 Spec",
      design: "立即查看 Design",
      tasks: "立即查看 Tasks",
    };
    return labels[artifact];
  }, [artifact]);

  const showOpenedFeedback = () => {
    setJustOpened(true);
    if (openedFeedbackTimerRef.current !== null) {
      window.clearTimeout(openedFeedbackTimerRef.current);
    }
    openedFeedbackTimerRef.current = window.setTimeout(() => {
      setJustOpened(false);
      openedFeedbackTimerRef.current = null;
    }, 1800);
  };

  const openSpecPanel = (context: {
    projectId: string;
    changeId: string;
    targetStage: "spec" | "design" | "tasks";
    openedAt: number;
  }) => {
    openSpec(context);
    showOpenedFeedback();
    toast.success(`${artifactLabel}已打开`, {
      description: "已在右侧工作台打开对应文档",
      duration: 1800,
    });
  };

  const handleClick = async () => {
    if (isOpening) return;

    try {
      setIsOpening(true);
      const openedAt = Date.now();

      const projectId = getProjectIdFromUrl();
      if (!projectId) {
        toast.error("无法打开 Spec Panel", {
          description: "未识别到当前项目，请在项目会话页面中使用",
          duration: 3000,
        });
        return;
      }

      // 有明确 changeId 时优先精准打开
      if (changeId && changeId.trim().length > 0) {
        try {
          await specDashboardService.getChangeDetails(projectId, changeId);
        } catch {
          toast.error("无法打开 Spec Panel", {
            description: `change "${changeId}" 不存在或不可访问`,
            duration: 3000,
          });
          return;
        }

        openSpecPanel({
          projectId,
          changeId,
          targetStage: artifact === "proposal" ? "spec" : artifact,
          openedAt,
        });
        return;
      }

      // 复用当前已选中的 spec context（仅当其属于当前 project）
      if (
        isValidSpecContext(specContext) &&
        specContext.projectId === projectId
      ) {
        openSpecPanel({
          ...specContext,
          targetStage: artifact === "proposal" ? "spec" : artifact,
          openedAt,
        });
        return;
      }

      // 获取当前项目可用 change，默认打开最近更新的一项
      const changes = await specDashboardService.getChanges(projectId);
      const latestChange =
        changes.length > 0
          ? [...changes].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )[0]
          : null;

      if (!latestChange) {
        toast.error("无法打开 Spec Panel", {
          description: "当前项目没有可用的 change",
          duration: 3000,
        });
        return;
      }

      openSpecPanel({
        projectId,
        changeId: latestChange.name,
        targetStage: artifact === "proposal" ? "spec" : artifact,
        openedAt,
      });
    } catch (error) {
      console.error("[spec-notification] Failed to open spec panel:", error);
      toast.error("无法打开 Spec Panel", {
        description: "读取项目变更失败，请稍后重试",
        duration: 3000,
      });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isOpening}
      aria-busy={isOpening}
      aria-label={`${artifactLabel}通知卡片，${isOpening ? "正在打开" : ctaLabel}`}
      translate="no"
      className={`
        notranslate group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 animate-in fade-in-50 slide-in-from-top-0.5
        ${
          isOpening
            ? "cursor-not-allowed border-primary/20 bg-brand-soft/60 opacity-85"
            : "cursor-pointer border-primary/30 bg-brand-soft hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_10px_30px_-18px_var(--primary)]"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background
      `}
      onClick={handleClick}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-primary/70"
      />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex h-5 items-center rounded-full border border-primary/25 bg-background/70 px-2 text-[11px] font-medium text-primary">
              新产物
            </span>
            <span className="text-xs font-medium tracking-wide text-primary/95">
              {artifactLabel}
            </span>
          </div>
          <div className="mb-1 text-sm font-semibold text-foreground">
            {title}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="inline-flex h-6 items-center text-xs text-muted-foreground">
          {justOpened ? (
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已在右侧打开
            </span>
          ) : (
            "点击后自动跳转到对应阶段"
          )}
        </span>
        <span className="inline-flex h-9 min-w-[132px] items-center justify-center gap-1 rounded-md border border-primary/80 bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors group-hover:bg-primary/95">
          {isOpening ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              正在打开...
            </>
          ) : (
            <>
              {ctaLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </span>
      </div>
    </button>
  );
};
