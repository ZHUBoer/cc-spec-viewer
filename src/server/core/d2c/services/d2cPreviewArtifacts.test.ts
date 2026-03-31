import { describe, expect, test } from "vitest";
import { listArtifactsFromEntries } from "./d2cPreviewArtifacts";

describe("listArtifactsFromEntries", () => {
  test("只保留含 index.tsx 与 index.module.scss 的子目录", () => {
    const result = listArtifactsFromEntries({
      entries: [
        { name: "a", isDir: true, hasTsx: true, hasScss: true },
        { name: "b", isDir: true, hasTsx: true, hasScss: false },
        { name: "c", isDir: false, hasTsx: true, hasScss: true },
      ],
    });

    expect(result).toEqual([{ id: "a", title: "a" }]);
  });

  test("按名称排序", () => {
    const result = listArtifactsFromEntries({
      entries: [
        { name: "b", isDir: true, hasTsx: true, hasScss: true },
        { name: "a", isDir: true, hasTsx: true, hasScss: true },
      ],
    });

    expect(result).toEqual([
      { id: "a", title: "a" },
      { id: "b", title: "b" },
    ]);
  });
});
