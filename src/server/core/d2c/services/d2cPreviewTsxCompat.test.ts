import { describe, expect, test } from "vitest";
import { applyPreviewTsxCompat } from "./d2cPreviewTsxCompat";

describe("applyPreviewTsxCompat", () => {
  test("缺失 use client 时自动补齐", () => {
    const source = `import { XView } from "@ctrip/xtaro-zx";\n\nexport default function Demo() {\n  return <XView />;\n}\n`;

    const result = applyPreviewTsxCompat(source);

    expect(result.startsWith('"use client";')).toBe(true);
  });

  test("已有 use client 时不重复插入", () => {
    const source = `"use client";\nimport { XView } from "@ctrip/xtaro-zx";\n`;

    const result = applyPreviewTsxCompat(source);
    const matches = result.match(/"use client";/g) ?? [];

    expect(matches).toHaveLength(1);
  });

  test("仅替换 import/export 的模块路径", () => {
    const source = `import { XView } from "@ctrip/xtaro-zx";\nexport { Foo } from "@ctrip/xtaro-zx";\nconst keep = "@ctrip/xtaro-zx";\n`;

    const result = applyPreviewTsxCompat(source);

    expect(result).toContain('from "@ctrip/xtaro-zx-h5"');
    expect(result).toContain('const keep = "@ctrip/xtaro-zx";');
    expect(result).not.toContain('const keep = "@ctrip/xtaro-zx-h5";');
  });
});
