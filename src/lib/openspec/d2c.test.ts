import { describe, expect, it } from "vitest";
import {
  buildD2CPreviewDocument,
  extractD2CInfoFromProposal,
  extractD2CInfoFromSpec,
  mergeD2CInfo,
  parseD2CManifest,
} from "./d2c";

describe("d2c utils", () => {
  it("应该从 spec 注释中解析多材料 D2C 配置", () => {
    const spec = `# spec

<!-- D2C_ENABLED: true -->
<!-- D2C_CHANGE_KIND: modify -->
<!-- D2C_TARGET_SCOPE: module -->
	<!-- D2C_MATERIALS_JSON: [{"link":"https://figma.com/design/demo-1","description":"首屏活动卡","scope":"page"},{"link":"https://figma.com/design/demo-2","description":"购买弹窗","scope":"component"}] -->
	<!-- D2C_BASELINE_FROZEN: true -->
	<!-- D2C_BASELINE_FROZEN_AT: 2026-03-06T00:00:00.000Z -->
	<!-- D2C_REVIEW_OVERRIDE: true -->
	<!-- D2C_REVIEW_OVERRIDE_AT: 2026-03-06T01:00:00.000Z -->
	<!-- D2C_REVIEW_OVERRIDE_REASON: 缺失边界态已人工确认 -->`;

    const result = extractD2CInfoFromSpec(spec);

    expect(result).toBeDefined();
    expect(result?.enabled).toBe(true);
    expect(result?.changeKind).toBe("modify");
    expect(result?.targetScope).toBe("module");
    expect(result?.materials).toEqual([
      {
        link: "https://figma.com/design/demo-1",
        description: "首屏活动卡",
        scope: "page",
      },
      {
        link: "https://figma.com/design/demo-2",
        description: "购买弹窗",
        scope: "component",
      },
    ]);
    expect(result?.baselineFrozen).toBe(true);
    expect(result?.baselineFrozenAt).toBe("2026-03-06T00:00:00.000Z");
    expect(result?.reviewOverride).toBe(true);
    expect(result?.reviewOverrideAt).toBe("2026-03-06T01:00:00.000Z");
    expect(result?.reviewOverrideReason).toBe("缺失边界态已人工确认");
    expect(result?.effectiveCanEnterDesign).toBe(true);
  });

  it("应该合并 manifest 与静态产物信息", () => {
    const specInfo = extractD2CInfoFromSpec(
      [
        "<!-- D2C_ENABLED: true -->",
        "<!-- D2C_CHANGE_KIND: new -->",
        '<!-- D2C_MATERIALS_JSON: [{"link":"https://figma.com/design/demo","description":"活动页","scope":"page"}] -->',
        "<!-- D2C_TARGET_SCOPE: page -->",
      ].join("\n"),
    );
    const manifest = parseD2CManifest(`{
      "enabled": true,
      "changeKind": "new",
      "materials": [
        {
          "link": "https://figma.com/design/demo",
          "description": "活动页",
          "scope": "page",
          "artifactId": "activity-hero"
        }
      ],
      "reviewStatus": "passed",
      "canEnterDesign": true,
      "generator": "design-to-code-zx",
      "generatedAt": "2026-03-06T00:00:00.000Z",
      "entryFiles": ["activity-hero/index.tsx"]
    }`);

    const merged = mergeD2CInfo({
      specInfo,
      manifest,
      generatedFiles: [
        { name: "activity-hero/index.tsx", content: "export {}" },
      ],
    });

    expect(merged?.enabled).toBe(true);
    expect(merged?.changeKind).toBe("new");
    expect(merged?.materials).toEqual([
      {
        link: "https://figma.com/design/demo",
        description: "活动页",
        scope: "page",
        artifactId: "activity-hero",
      },
    ]);
    expect(merged?.reviewStatus).toBe("passed");
    expect(merged?.canEnterDesign).toBe(true);
    expect(merged?.effectiveCanEnterDesign).toBe(true);
    expect(merged?.generator).toBe("design-to-code-zx");
    expect(merged?.hasGeneratedFiles).toBe(true);
    expect(merged?.entryFiles).toEqual(["activity-hero/index.tsx"]);
  });

  it("应该兼容旧的 proposal 解析入口", () => {
    const result = extractD2CInfoFromProposal("<!-- D2C_ENABLED: true -->");

    expect(result?.enabled).toBe(true);
  });

  it("应该解析 manifest 中结构化的 review 结果", () => {
    const manifest = parseD2CManifest(`{
      "enabled": true,
      "changeKind": "modify",
      "materials": [
        {
          "link": "https://figma.com/design/demo",
          "description": "活动页",
          "scope": "page",
          "artifactId": "activity-hero"
        }
      ],
      "reviewStatus": "failed",
      "canEnterDesign": false,
      "reviewSummary": "购买浮层缺少失败态反馈",
      "reviewPath": "review.md",
      "entryFiles": []
    }`);

    expect(manifest?.reviewStatus).toBe("failed");
    expect(manifest?.canEnterDesign).toBe(false);
    expect(manifest?.reviewSummary).toBe("购买浮层缺少失败态反馈");
    expect(manifest?.reviewPath).toBe("review.md");
  });

  it("应该构建 Browser 预览文档", () => {
    const html = buildD2CPreviewDocument("change-demo", {
      enabled: true,
      changeKind: "new",
      materials: [
        {
          link: "https://figma.com/design/demo",
          description: "活动页",
          scope: "component",
          artifactId: "activity-hero",
        },
      ],
      targetScope: "component",
      baselineFrozen: false,
      baselineFrozenAt: undefined,
      reviewOverride: false,
      reviewOverrideAt: undefined,
      reviewOverrideReason: undefined,
      reviewStatus: "unknown",
      canEnterDesign: false,
      effectiveCanEnterDesign: false,
      reviewSummary: undefined,
      entryFiles: ["activity-hero/index.tsx"],
      hasManifest: true,
      hasGeneratedFiles: true,
      generatedFiles: [
        { name: "activity-hero/index.tsx", content: "export {}" },
      ],
      previewFiles: [],
    });

    expect(html).toContain("change-demo 的静态产物");
    expect(html).toContain("activity-hero/index.tsx");
    expect(html).toContain("活动页");
  });

  it("应该在审查失败但人工放行时计算有效进入状态", () => {
    const specInfo = extractD2CInfoFromSpec(
      [
        "<!-- D2C_ENABLED: true -->",
        "<!-- D2C_REVIEW_OVERRIDE: true -->",
        "<!-- D2C_REVIEW_OVERRIDE_AT: 2026-03-06T02:00:00.000Z -->",
        "<!-- D2C_REVIEW_OVERRIDE_REASON: 用户确认先进入 design -->",
      ].join("\n"),
    );
    const manifest = parseD2CManifest(`{
	      "enabled": true,
	      "changeKind": "modify",
	      "materials": [],
	      "reviewStatus": "failed",
	      "canEnterDesign": false,
	      "reviewSummary": "缺少异常态设计稿",
	      "entryFiles": []
	    }`);

    const merged = mergeD2CInfo({ specInfo, manifest });

    expect(merged?.reviewStatus).toBe("failed");
    expect(merged?.canEnterDesign).toBe(false);
    expect(merged?.reviewOverride).toBe(true);
    expect(merged?.effectiveCanEnterDesign).toBe(true);
  });
});
