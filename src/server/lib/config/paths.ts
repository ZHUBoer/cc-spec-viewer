import path from "node:path";
import { resolveHomeDirFromEnv } from "./resolveHomeDirFromEnv";

export const claudeCodeViewerCacheDirPath = path.join(
  resolveHomeDirFromEnv(),
  ".spec-forge-viewer",
  "cache",
);
