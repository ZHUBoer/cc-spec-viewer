import { describe, expect, test } from "vitest";
import { resolvePreviewUrl } from "./d2cPreviewUrl";

describe("resolvePreviewUrl", () => {
  test("优先使用 NFES_PREVIEW_URL", () => {
    const previewUrl = resolvePreviewUrl({
      NFES_PREVIEW_URL: "http://localhost:9000/demo",
      XTARO_PREVIEW_URL: "http://localhost:8000/demo",
    });

    expect(previewUrl).toBe("http://localhost:9000/demo");
  });

  test("NFES_PREVIEW_URL 缺失时回退到 XTARO_PREVIEW_URL", () => {
    const previewUrl = resolvePreviewUrl({
      XTARO_PREVIEW_URL: "http://localhost:8000/demo",
    });

    expect(previewUrl).toBe("http://localhost:8000/demo");
  });

  test("环境变量均缺失时使用 8123 默认地址", () => {
    const previewUrl = resolvePreviewUrl({});

    expect(previewUrl).toBe("http://localhost:8123/demo");
  });
});
