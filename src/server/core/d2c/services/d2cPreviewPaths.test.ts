import { Path } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import {
  resolveD2CDir,
  resolvePreviewEntryFile,
  resolvePreviewRoot,
  resolvePreviewTargetDir,
} from "./d2cPreviewPaths";

describe("d2cPreviewPaths", () => {
  test("基于项目路径解析预览工程根目录", async () => {
    const projectPath = "/Users/demo/projects/spec-forge";
    const previewRoot = await Effect.runPromise(
      resolvePreviewRoot(projectPath).pipe(Effect.provide(Path.layer)),
    );
    expect(previewRoot).toBe("/Users/demo/projects/nfes-preview");
  });

  test("D2C 目录路径正确", async () => {
    const projectPath = "/work/app";
    const changeId = "change-1";
    const d2cDir = await Effect.runPromise(
      resolveD2CDir(projectPath, changeId).pipe(Effect.provide(Path.layer)),
    );
    expect(d2cDir).toBe("/work/app/openspec/changes/change-1/d2c");
  });

  test("预览工程组件目录正确", async () => {
    const previewRoot = "/work/nfes-preview";
    const targetDir = await Effect.runPromise(
      resolvePreviewTargetDir(previewRoot).pipe(Effect.provide(Path.layer)),
    );
    expect(targetDir).toBe("/work/nfes-preview/app/demo/components");
  });

  test("预览工程入口文件正确", async () => {
    const previewRoot = "/work/nfes-preview";
    const entryFile = await Effect.runPromise(
      resolvePreviewEntryFile(previewRoot).pipe(Effect.provide(Path.layer)),
    );
    expect(entryFile).toBe("/work/nfes-preview/app/demo/components/index.tsx");
  });
});
