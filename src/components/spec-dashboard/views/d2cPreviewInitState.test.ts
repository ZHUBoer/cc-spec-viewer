import { describe, expect, it } from "vitest";
import {
  resolveInitDismissButtonLabel,
  resolvePreviewInitBannerState,
} from "./d2cPreviewInitState";

describe("d2cPreviewInitState", () => {
  it("初始化运行中时次按钮文案切换为后台继续", () => {
    expect(resolveInitDismissButtonLabel(true)).toBe("后台继续");
    expect(resolveInitDismissButtonLabel(false)).toBe("暂不初始化");
  });

  it("初始化进行中且用户关闭弹窗后显示后台继续提示", () => {
    expect(
      resolvePreviewInitBannerState({
        hasDismissedInitDialog: true,
        initCompleted: false,
        initDialogOpen: false,
        isInitRunning: true,
        previewUrl: null,
      }),
    ).toEqual({
      tone: "running",
      title: "预览工程初始化中",
      description:
        "初始化任务仍在后台继续。你可以稍后查看进度，完成后会自动进入预览。",
      actionLabel: "查看进度",
    });
  });

  it("初始化失败且弹窗已关闭时显示失败提示", () => {
    expect(
      resolvePreviewInitBannerState({
        hasDismissedInitDialog: true,
        initCompleted: false,
        initDialogOpen: false,
        initProgressStep: "failed",
        isInitRunning: false,
        previewUrl: null,
      }),
    ).toEqual({
      tone: "failed",
      title: "预览工程初始化失败",
      description:
        "后台初始化未完成。你可以重新打开进度弹窗查看失败信息或再次重试。",
      actionLabel: "查看进度",
    });
  });

  it("弹窗打开、初始化完成或未手动关闭时不显示顶部提示", () => {
    expect(
      resolvePreviewInitBannerState({
        hasDismissedInitDialog: true,
        initCompleted: false,
        initDialogOpen: true,
        isInitRunning: true,
        previewUrl: null,
      }),
    ).toBeNull();

    expect(
      resolvePreviewInitBannerState({
        hasDismissedInitDialog: true,
        initCompleted: true,
        initDialogOpen: false,
        isInitRunning: false,
        previewUrl: "http://localhost:8123/demo",
      }),
    ).toBeNull();

    expect(
      resolvePreviewInitBannerState({
        hasDismissedInitDialog: false,
        initCompleted: false,
        initDialogOpen: false,
        isInitRunning: true,
        previewUrl: null,
      }),
    ).toBeNull();
  });
});
