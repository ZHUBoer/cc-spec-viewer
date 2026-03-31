#!/usr/bin/env node

import { execSync } from "node:child_process";

const MANIFEST_PATH = "template-to-project/template-manifest.json";
const TEMPLATE_ROOT = "template-to-project/";

const run = (cmd) =>
  execSync(cmd, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();

const canRun = (cmd) => {
  try {
    run(cmd);
    return true;
  } catch {
    return false;
  }
};

const getDiffRange = () => {
  // biome-ignore lint/style/noProcessEnv: CI 中通过 GITHUB_BASE_REF 提供基线分支信息
  const baseRef = process.env.GITHUB_BASE_REF;

  if (baseRef) {
    try {
      run(`git fetch --no-tags --depth=1 origin ${baseRef}`);
      return `origin/${baseRef}...HEAD`;
    } catch {
      // fallthrough to local range fallback
    }
  }

  if (canRun("git rev-parse --verify HEAD~1")) {
    return "HEAD~1..HEAD";
  }

  return null;
};

const range = getDiffRange();
if (!range) {
  console.log(
    "[template-version-check] Skip: unable to resolve diff base (single-commit history).",
  );
  process.exit(0);
}

const changedFilesOutput = run(`git diff --name-only ${range}`);
const changedFiles = changedFilesOutput
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);

const templateChanged = changedFiles.some(
  (file) => file.startsWith(TEMPLATE_ROOT) && file !== MANIFEST_PATH,
);
const manifestChanged = changedFiles.includes(MANIFEST_PATH);

if (templateChanged && !manifestChanged) {
  console.error(
    `[template-version-check] Detected changes under "${TEMPLATE_ROOT}" without updating "${MANIFEST_PATH}".`,
  );
  console.error(
    "[template-version-check] Please bump template_version in template-manifest.json.",
  );
  process.exit(1);
}

console.log("[template-version-check] OK");
