const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const projectRootFlagIndex = args.indexOf("--project-root");
const projectRoot =
  projectRootFlagIndex >= 0 ? args[projectRootFlagIndex + 1] : undefined;

if (!projectRoot) {
  console.error("[D2CPreviewWorker] 缺少 --project-root 参数");
  process.exit(1);
}

const previewScript = path.join(__dirname, "d2c-preview.cjs");
const requiredNodeVersion = "20.11.1";
const previewRoot = path.join(projectRoot, "..", "nfes-preview");
const sanitizeForFilename = (value) =>
  String(value).replace(/[^a-zA-Z0-9._-]+/g, "_");
const tempDir =
  process.env.TMPDIR || process.env.TEMP || process.env.TMP || "/tmp";
const statusPath = path.join(
  tempDir,
  `specforge-d2c-preview-${sanitizeForFilename(projectRoot)}.json`,
);

const quote = (value) => `'${String(value).replace(/'/g, "'\\''")}'`;
const isWindows = process.platform === "win32";
const nvmDir =
  process.env.NVM_DIR ||
  path.join(process.env.HOME || process.env.USERPROFILE || "", ".nvm");
const nvmScript = path.join(nvmDir, "nvm.sh");
const nvmNodeBin = path.join(
  nvmDir,
  "versions",
  "node",
  `v${requiredNodeVersion}`,
  "bin",
  "node",
);
const nvmNpmBin = path.join(
  nvmDir,
  "versions",
  "node",
  `v${requiredNodeVersion}`,
  "bin",
  "npm",
);

const buildNvmCommand = () => {
  if (isWindows) return null;
  if (!nvmDir || !nvmScript) return null;
  return `source ${quote(nvmScript)} && nvm use ${requiredNodeVersion} >/dev/null`;
};

const buildCommand = () => {
  if (process.env.D2C_PREVIEW_NODE_BIN) {
    return {
      cmd: process.env.D2C_PREVIEW_NODE_BIN,
      args: [previewScript, "--project-root", projectRoot],
      shell: false,
      env: {
        ...process.env,
        D2C_PREVIEW_LOG_PATH: "/tmp/d2c-preview.log",
        D2C_PREVIEW_STATUS_PATH: statusPath,
      },
    };
  }

  if (!isWindows && fs.existsSync(nvmNodeBin)) {
    return {
      cmd: nvmNodeBin,
      args: [previewScript, "--project-root", projectRoot],
      shell: false,
      env: {
        ...process.env,
        D2C_PREVIEW_NODE_BIN: nvmNodeBin,
        D2C_PREVIEW_NPM_BIN: fs.existsSync(nvmNpmBin) ? nvmNpmBin : undefined,
        D2C_PREVIEW_LOG_PATH: "/tmp/d2c-preview.log",
        D2C_PREVIEW_STATUS_PATH: statusPath,
      },
    };
  }

  const nvmCommand = buildNvmCommand();
  if (nvmCommand) {
    const bashCommand = `${nvmCommand} && node ${quote(previewScript)} --project-root ${quote(projectRoot)}`;
    return {
      cmd: "bash",
      args: ["-lc", bashCommand],
      shell: false,
      env: {
        ...process.env,
        D2C_PREVIEW_LOG_PATH: "/tmp/d2c-preview.log",
        D2C_PREVIEW_STATUS_PATH: statusPath,
      },
    };
  }

  return {
    cmd: "node",
    args: [previewScript, "--project-root", projectRoot],
    shell: false,
    env: {
      ...process.env,
      D2C_PREVIEW_LOG_PATH: "/tmp/d2c-preview.log",
      D2C_PREVIEW_STATUS_PATH: statusPath,
    },
  };
};

const launch = buildCommand();

if (!fs.existsSync(previewScript)) {
  console.error(`[D2CPreviewWorker] 预览脚本不存在: ${previewScript}`);
  process.exit(1);
}

if (launch.cmd !== "node" && !launch.cmd.includes("bash")) {
  if (!fs.existsSync(launch.cmd)) {
    console.error(`[D2CPreviewWorker] Node 可执行文件不存在: ${launch.cmd}`);
    process.exit(1);
  }
}

console.log(
  `[D2CPreviewWorker] 启动预览工程进程, projectRoot=${projectRoot}, script=${previewScript}, mode=${launch.cmd}, args=${launch.args.join(" ")}`,
);

// 将子进程的 stdout/stderr 重定向到日志文件而非 pipe，
// 避免 Worker 退出后 pipe 断开导致子进程 EPIPE 崩溃
const workerLogPath = path.join(tempDir, "specforge-d2c-preview-worker.log");
const outFd = fs.openSync(workerLogPath, "a");

const child = spawn(launch.cmd, launch.args, {
  stdio: ["ignore", outFd, outFd],
  detached: true,
  shell: launch.shell,
  env: launch.env || process.env,
});

child.on("error", (error) => {
  console.error(
    "[D2CPreviewWorker] 预览进程启动失败:",
    error instanceof Error ? error.message : String(error),
  );
});

child.unref();

setTimeout(() => {
  const exists = fs.existsSync(previewRoot);
  if (!exists) {
    console.error(`[D2CPreviewWorker] 预览工程目录未创建: ${previewRoot}`);
    process.exit(1);
  }
  console.log(`[D2CPreviewWorker] 预览工程目录已创建: ${previewRoot}`);
  console.log(`[D2CPreviewWorker] 子进程日志: ${workerLogPath}`);
  process.exit(0);
}, 2000);
