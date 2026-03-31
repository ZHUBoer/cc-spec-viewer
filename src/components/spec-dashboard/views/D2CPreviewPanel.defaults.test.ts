import { describe, expect, test } from "vitest";
import { D2C_PREVIEW_DEFAULTS } from "./d2cPreviewDefaults";

describe("D2CPreviewPanel defaults", () => {
  test("默认使用 375px、100% 且关闭自动适配", () => {
    expect(D2C_PREVIEW_DEFAULTS.previewWidth).toBe(375);
    expect(D2C_PREVIEW_DEFAULTS.manualZoomPercent).toBe(100);
    expect(D2C_PREVIEW_DEFAULTS.autoAdjustZoom).toBe(false);
  });
});
