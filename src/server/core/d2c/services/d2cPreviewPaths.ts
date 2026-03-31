import { Path } from "@effect/platform";
import { Effect } from "effect";

export const resolvePreviewRoot = (projectPath: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    return path.join(projectPath, "..", "nfes-preview");
  });

export const resolveD2CDir = (projectPath: string, changeId: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    return path.join(projectPath, "openspec", "changes", changeId, "d2c");
  });

export const resolvePreviewTargetDir = (previewRoot: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    return path.join(previewRoot, "app", "demo", "components");
  });

export const resolvePreviewEntryFile = (previewRoot: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    return path.join(previewRoot, "app", "demo", "components", "index.tsx");
  });
