export interface PreviewInitBannerState {
  actionLabel: string;
  description: string;
  title: string;
  tone: "failed" | "running";
}

interface ResolvePreviewInitBannerOptions {
  hasDismissedInitDialog: boolean;
  initCompleted: boolean;
  initDialogOpen: boolean;
  initProgressStep?: string;
  isInitRunning: boolean;
  previewUrl: string | null;
}

export const resolveInitDismissButtonLabel = (
  isInitRunning: boolean,
): string => (isInitRunning ? "后台继续" : "暂不初始化");

export const resolvePreviewInitBannerState = ({
  hasDismissedInitDialog,
  initCompleted,
  initDialogOpen,
  initProgressStep,
  isInitRunning,
  previewUrl,
}: ResolvePreviewInitBannerOptions): PreviewInitBannerState | null => {
  if (initDialogOpen || !hasDismissedInitDialog || initCompleted) {
    return null;
  }

  if (isInitRunning) {
    return {
      tone: "running",
      title: "预览工程初始化中",
      description:
        "初始化任务仍在后台继续。你可以稍后查看进度，完成后会自动进入预览。",
      actionLabel: "查看进度",
    };
  }

  if (initProgressStep === "failed" && previewUrl === null) {
    return {
      tone: "failed",
      title: "预览工程初始化失败",
      description:
        "后台初始化未完成。你可以重新打开进度弹窗查看失败信息或再次重试。",
      actionLabel: "查看进度",
    };
  }

  return null;
};
