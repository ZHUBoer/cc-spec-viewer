import { describe, expect, test } from "vitest";
import {
  clampZoomPercent,
  computeFitZoomPercent,
  resolveEffectiveZoomPercent,
} from "./d2cPreviewZoom";

describe("d2cPreviewZoom", () => {
  test("clampZoomPercent 应限制在 50~200", () => {
    expect(clampZoomPercent(30)).toBe(50);
    expect(clampZoomPercent(260)).toBe(200);
    expect(clampZoomPercent(124.6)).toBe(125);
  });

  test("computeFitZoomPercent 应根据容器宽度计算适配值", () => {
    expect(computeFitZoomPercent(750, 375)).toBe(200);
    expect(computeFitZoomPercent(310, 375)).toBe(83);
    expect(computeFitZoomPercent(0, 375)).toBe(100);
  });

  test("resolveEffectiveZoomPercent 自动模式优先使用 fit 值", () => {
    expect(
      resolveEffectiveZoomPercent({
        autoAdjustZoom: true,
        fitZoomPercent: 62,
        manualZoomPercent: 125,
      }),
    ).toBe(62);
  });

  test("resolveEffectiveZoomPercent 手动模式使用手动值", () => {
    expect(
      resolveEffectiveZoomPercent({
        autoAdjustZoom: false,
        fitZoomPercent: 62,
        manualZoomPercent: 150,
      }),
    ).toBe(150);
  });
});
