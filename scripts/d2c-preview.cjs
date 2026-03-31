const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const args = process.argv.slice(2);
const projectRootFlagIndex = args.indexOf("--project-root");
const projectRoot =
  projectRootFlagIndex >= 0 ? args[projectRootFlagIndex + 1] : undefined;

if (!projectRoot) {
  console.error("[D2CPreview] 缺少 --project-root 参数");
  process.exit(1);
}

const logPath =
  process.env.D2C_PREVIEW_LOG_PATH || path.join(os.tmpdir(), "d2c-preview.log");
const sanitizeForFilename = (value) =>
  String(value).replace(/[^a-zA-Z0-9._-]+/g, "_");
const statusPath =
  process.env.D2C_PREVIEW_STATUS_PATH ||
  path.join(
    os.tmpdir(),
    `specforge-d2c-preview-${sanitizeForFilename(projectRoot)}.json`,
  );
const appendLog = (message) => {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
  } catch {
    // 忽略日志写入失败
  }
};

appendLog(`start projectRoot=${projectRoot}`);
console.log(`[D2CPreview] 预览脚本启动, projectRoot=${projectRoot}`);
console.log(`[D2CPreview] 日志文件: ${logPath}`);
console.log(`[D2CPreview] 状态文件: ${statusPath}`);

const updateStatus = (step, message) => {
  try {
    fs.writeFileSync(
      statusPath,
      JSON.stringify(
        {
          step,
          message,
          updatedAt: new Date().toISOString(),
          projectRoot,
          previewRoot,
        },
        null,
        2,
      ),
    );
  } catch {
    // 忽略状态写入失败
  }
};

process.on("exit", (code) => {
  appendLog(`exit code=${code}`);
});

process.on("uncaughtException", (error) => {
  const message = formatUnknownError(error);
  appendLog(`uncaughtException ${message}`);
  console.error(`[D2CPreview] 未捕获异常: ${message}`);
  updateStatus("failed", `未捕获异常: ${message}`);
});

process.on("unhandledRejection", (reason) => {
  const message = formatUnknownError(reason);
  appendLog(`unhandledRejection ${message}`);
  console.error(`[D2CPreview] 未处理拒绝: ${message}`);
  updateStatus("failed", `未处理拒绝: ${message}`);
});

const previewRoot = path.join(projectRoot, "..", "nfes-preview");
const resolveTemplateRoot = () => {
  const baseDir = path.resolve(__dirname, "..");
  const distPath = path.join(
    baseDir,
    "dist",
    "template-to-project",
    "preview",
    "nfes-preview",
  );
  if (fs.existsSync(distPath)) {
    return distPath;
  }
  return path.join(baseDir, "template-to-project", "preview", "nfes-preview");
};

const requiredNodeMajor = 20;
const requiredNodeMinor = 11;
const isWindows = process.platform === "win32";
const FALLBACK_GIT_REPO =
  "http://git.dev.sh.ctripcorp.com/ticket/nfes-preview.git";
const GIT_CLONE_TIMEOUT_MS = 30_000;
const INVALID_BACKUP_KEEP_COUNT = 3;

const formatUnknownError = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "unknown error";
  }
};

const getNodeBinary = () =>
  process.env.D2C_PREVIEW_NODE_BIN || process.execPath;

const getNpmBinary = (nodeBin) => {
  if (process.env.D2C_PREVIEW_NPM_BIN) {
    return process.env.D2C_PREVIEW_NPM_BIN;
  }
  const binDir = path.dirname(nodeBin);
  return isWindows ? path.join(binDir, "npm.cmd") : path.join(binDir, "npm");
};

const isCommandTimeoutError = (error) =>
  error instanceof Error && error.name === "CommandTimeoutError";

const parseNodeVersion = (versionText) => {
  const match = /v?(\d+)\.(\d+)\.(\d+)/.exec(versionText);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const ensureNodeVersion = async () => {
  const nodeBin = getNodeBinary();
  let versionOutput = "";

  if (nodeBin === process.execPath) {
    versionOutput = process.version;
  } else {
    versionOutput = await new Promise((resolve, reject) => {
      const child = spawn(nodeBin, ["--version"], {
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
      });
      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      child.stderr.on("data", (data) => {
        output += data.toString();
      });
      child.on("close", (code) => {
        if (code === 0) resolve(output.trim());
        else reject(new Error(`node --version 退出码 ${code}`));
      });
      child.on("error", (error) => reject(error));
    });
  }

  console.log(`[D2CPreview] 检测 Node 版本: ${versionOutput}`);
  appendLog(`node version=${versionOutput}`);
  updateStatus("copying", "准备创建预览工程");

  const parsed = parseNodeVersion(String(versionOutput));
  if (!parsed) {
    appendLog(`node version parse failed: ${versionOutput}`);
    updateStatus("failed", `无法解析 Node 版本: ${versionOutput}`);
    throw new Error(`无法解析 Node 版本: ${versionOutput}`);
  }
  if (
    parsed.major !== requiredNodeMajor ||
    parsed.minor !== requiredNodeMinor
  ) {
    const message = `预览工程要求 Node ${requiredNodeMajor}.${requiredNodeMinor}.x，当前为 ${parsed.major}.${parsed.minor}.${parsed.patch}`;
    appendLog(`node version mismatch: ${message}`);
    updateStatus("failed", message);
    throw new Error(message);
  }
  return { nodeBin, npmBin: getNpmBinary(nodeBin) };
};

const runCommand = (cmd, cmdArgs, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} 退出码 ${code}`));
      }
    });

    child.on("error", (error) => reject(error));
  });

const runCommandWithLog = (cmd, cmdArgs, options = {}) =>
  new Promise((resolve, reject) => {
    const { logPath: cmdLogPath, timeoutMs, ...spawnOptions } = options;
    const logStream = cmdLogPath
      ? fs.createWriteStream(cmdLogPath, { flags: "a" })
      : null;
    const child = spawn(cmd, cmdArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      ...spawnOptions,
    });
    let settled = false;
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (logStream) {
        logStream.end();
      }
    };

    const writeLog = (data) => {
      if (settled) return;
      if (logStream) {
        logStream.write(data);
      }
    };

    child.stdout.on("data", (data) => writeLog(data));
    child.stderr.on("data", (data) => writeLog(data));

    if (typeof timeoutMs === "number" && timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        if (settled) return;
        const timeoutError = new Error(`${cmd} 超时（${timeoutMs}ms）`);
        timeoutError.name = "CommandTimeoutError";
        settled = true;
        cleanup();
        try {
          child.kill("SIGTERM");
        } catch {
          // 忽略终止失败
        }
        setTimeout(() => {
          try {
            child.kill("SIGKILL");
          } catch {
            // 忽略强制终止失败
          }
        }, 1000);
        reject(timeoutError);
      }, timeoutMs);
    }

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} 退出码 ${code}`));
      }
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    });
  });

const isValidPreviewProject = () => {
  const requiredEntries = ["package.json", "app", "scripts"];
  return requiredEntries.every((entry) =>
    fs.existsSync(path.join(previewRoot, entry)),
  );
};

const pruneInvalidPreviewBackups = () => {
  const parentDir = path.dirname(previewRoot);
  const previewBaseName = path.basename(previewRoot);
  const backupPrefix = `${previewBaseName}.invalid-`;
  if (!fs.existsSync(parentDir)) {
    return;
  }
  const backupEntries = fs
    .readdirSync(parentDir)
    .filter((name) => name.startsWith(backupPrefix))
    .sort((a, b) => b.localeCompare(a));
  const staleBackups = backupEntries.slice(INVALID_BACKUP_KEEP_COUNT);
  for (const staleName of staleBackups) {
    const stalePath = path.join(parentDir, staleName);
    try {
      fs.rmSync(stalePath, { recursive: true, force: true });
      appendLog(`pruned stale invalid backup: ${stalePath}`);
    } catch (error) {
      appendLog(
        `failed to prune stale invalid backup ${stalePath}: ${formatUnknownError(error)}`,
      );
    }
  }
};

const backupInvalidPreviewProject = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${previewRoot}.invalid-${timestamp}`;
  appendLog(`backup invalid preview project: ${previewRoot}`);
  updateStatus("copying", "检测到无效预览工程，准备备份后重建");
  try {
    fs.renameSync(previewRoot, backupPath);
    console.log(`[D2CPreview] 已备份无效预览工程: ${backupPath}`);
    appendLog(`invalid preview project backed up: ${backupPath}`);
    updateStatus("copying", "无效预览工程已备份，继续重建");
    pruneInvalidPreviewBackups();
  } catch (renameError) {
    const renameMessage = formatUnknownError(renameError);
    console.warn(
      `[D2CPreview] 备份无效预览工程失败，改为删除重建: ${renameMessage}`,
    );
    appendLog(`backup invalid preview failed: ${renameMessage}`);
    try {
      fs.rmSync(previewRoot, { recursive: true, force: true });
      appendLog("invalid preview project removed after backup failure");
      updateStatus("copying", "无效预览工程备份失败，已删除并继续重建");
    } catch (removeError) {
      const removeMessage = formatUnknownError(removeError);
      appendLog(`remove invalid preview failed: ${removeMessage}`);
      updateStatus("failed", `无效预览工程处理失败: ${removeMessage}`);
      throw new Error(
        `无效预览工程处理失败，备份错误: ${renameMessage}，删除错误: ${removeMessage}`,
      );
    }
  }
};

const cloneFromGit = async () => {
  console.log(`[D2CPreview] 从远程仓库克隆预览工程: ${FALLBACK_GIT_REPO}`);
  appendLog(`git clone ${FALLBACK_GIT_REPO} -> ${previewRoot}`);
  updateStatus("copying", "从远程仓库克隆预览工程");

  const parentDir = path.dirname(previewRoot);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // 如果之前复制残留了不完整的目录，先清理
  if (fs.existsSync(previewRoot)) {
    backupInvalidPreviewProject();
  }

  const cloneLogPath = path.join(os.tmpdir(), "d2c-preview-clone.log");
  try {
    await runCommandWithLog(
      "git",
      ["clone", "--depth", "1", FALLBACK_GIT_REPO, previewRoot],
      { logPath: cloneLogPath, timeoutMs: GIT_CLONE_TIMEOUT_MS },
    );
  } catch (error) {
    let message = formatUnknownError(error);
    if (isCommandTimeoutError(error)) {
      message = `git clone 超时（${GIT_CLONE_TIMEOUT_MS / 1000}秒），请检查网络后重试`;
    }
    appendLog(`git clone failed ${message}`);
    updateStatus("failed", message);
    console.error(`[D2CPreview] git clone 失败: ${message}`);
    console.error(`[D2CPreview] 克隆日志: ${cloneLogPath}`);
    throw new Error(message);
  }

  if (!fs.existsSync(previewRoot)) {
    appendLog(`git clone done but missing previewRoot: ${previewRoot}`);
    updateStatus("failed", `git clone 完成但目标目录不存在: ${previewRoot}`);
    throw new Error(`git clone 完成但目标目录不存在: ${previewRoot}`);
  }

  const gitDir = path.join(previewRoot, ".git");
  if (fs.existsSync(gitDir)) {
    try {
      fs.rmSync(gitDir, { recursive: true, force: true });
      appendLog("removed cloned .git to align init behavior");
    } catch (error) {
      const message = formatUnknownError(error);
      appendLog(`remove cloned .git failed: ${message}`);
      updateStatus("failed", `清理克隆仓库 Git 元数据失败: ${message}`);
      throw new Error(`清理克隆仓库 Git 元数据失败: ${message}`);
    }
  }

  const clonedEntries = fs.readdirSync(previewRoot);
  console.log(
    `[D2CPreview] 远程仓库克隆完成 (entries: ${clonedEntries.length})`,
  );
  appendLog(`git clone done entries=${clonedEntries.length}`);
  updateStatus("copying", "远程仓库克隆成功，继续初始化");
};

const ensurePreviewProject = async (npmBin) => {
  // ── 已存在且合法 → 直接跳到 npm install ──
  if (fs.existsSync(previewRoot) && isValidPreviewProject()) {
    console.log("[D2CPreview] 预览工程已存在且合法，跳过复制");
    appendLog("preview project exists and valid, skip copy");
    updateStatus("copying", "预览工程已存在，跳过复制");
  } else {
    // ── 存在但无效 → 备份 ──
    if (fs.existsSync(previewRoot) && !isValidPreviewProject()) {
      backupInvalidPreviewProject();
    }

    // ── 步骤 A：尝试本地模板复制 ──
    let templateCopySucceeded = false;
    if (!fs.existsSync(previewRoot)) {
      const templateRoot = resolveTemplateRoot();
      const templateExists = fs.existsSync(templateRoot);

      if (templateExists) {
        try {
          const templateEntries = fs.readdirSync(templateRoot);
          console.log(
            `[D2CPreview] 使用模板路径: ${templateRoot} (entries: ${templateEntries.length})`,
          );
          console.log(`[D2CPreview] 目标预览路径: ${previewRoot}`);
          appendLog(`template=${templateRoot} previewRoot=${previewRoot}`);
          updateStatus("copying", "复制预览工程模板");

          const parentDir = path.dirname(previewRoot);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          console.log(`[D2CPreview] 复制预览工程模板: ${previewRoot}`);
          appendLog(`copy template -> ${previewRoot}`);
          fs.cpSync(templateRoot, previewRoot, {
            recursive: true,
            filter: (src) => {
              const rel = path.relative(templateRoot, src);
              if (!rel) return true;
              if (rel === ".git" || rel.startsWith(`.git${path.sep}`))
                return false;
              if (
                rel === "node_modules" ||
                rel.startsWith(`node_modules${path.sep}`)
              ) {
                return false;
              }
              return true;
            },
          });
          const copiedEntries = fs.readdirSync(previewRoot);
          console.log(
            `[D2CPreview] 模板复制完成 (entries: ${copiedEntries.length})`,
          );
          appendLog(`template copied entries=${copiedEntries.length}`);
          templateCopySucceeded = isValidPreviewProject();
          if (templateCopySucceeded) {
            updateStatus("copying", "本地模板复制成功，继续初始化");
          }
        } catch (copyError) {
          const message = formatUnknownError(copyError);
          console.warn(`[D2CPreview] 本地模板复制失败: ${message}`);
          appendLog(`template copy failed: ${message}`);
          templateCopySucceeded = false;
        }
      } else {
        console.warn(`[D2CPreview] 本地模板不存在: ${templateRoot}`);
        appendLog(`template not found: ${templateRoot}`);
      }
    }

    // ── 步骤 B：本地模板失败 → 兜底 git clone ──
    if (!templateCopySucceeded && !isValidPreviewProject()) {
      console.log("[D2CPreview] 本地模板方式未成功，启用 git clone 兜底");
      appendLog("fallback to git clone");
      await cloneFromGit();
    }

    // ── 最终校验 ──
    if (!isValidPreviewProject()) {
      const entries = fs.existsSync(previewRoot)
        ? fs.readdirSync(previewRoot)
        : [];
      appendLog(
        `preview project validation failed entries=${entries.join(",")}`,
      );
      updateStatus(
        "failed",
        `预览工程校验失败，当前目录仅包含: ${entries.join(", ")}`,
      );
      throw new Error(
        `预览工程校验失败，当前目录仅包含: ${entries.join(", ")}`,
      );
    }
  }

  // ── npm install（不变） ──
  const nodeModulesPath = path.join(previewRoot, "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    const installLogPath = path.join(previewRoot, "preview-install.log");
    console.log(`[D2CPreview] 安装预览工程依赖... (npm: ${npmBin})`);
    updateStatus("installing", "安装预览工程依赖");
    appendLog(`npm install start npm=${npmBin}`);
    console.log(`[D2CPreview] 安装日志写入: ${installLogPath}`);
    try {
      await runCommandWithLog(
        npmBin,
        ["install", "--no-fund", "--no-audit", "--verbose"],
        {
          cwd: previewRoot,
          logPath: installLogPath,
          env: {
            ...process.env,
            npm_config_loglevel: "verbose",
            npm_config_progress: "false",
          },
        },
      );
    } catch (error) {
      const message = formatUnknownError(error);
      appendLog(`npm install failed ${message}`);
      updateStatus("failed", `依赖安装失败: ${message}`);
      console.error(`[D2CPreview] npm install 失败: ${message}`);
      console.error(`[D2CPreview] 请查看安装日志: ${installLogPath}`);
      throw error;
    }
    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error("预览工程依赖安装未生成 node_modules");
    }
    console.log("[D2CPreview] 依赖安装完成");
    appendLog("npm install done");
  } else {
    console.log("[D2CPreview] 依赖已存在，跳过安装");
    appendLog("node_modules exists, skip install");
  }
};

const ensureGitRepo = async () => {
  const gitDir = path.join(previewRoot, ".git");
  if (fs.existsSync(gitDir)) {
    return;
  }
  console.log("[D2CPreview] 初始化预览工程 Git 仓库...");
  appendLog("git init preview project");
  try {
    await runCommand("git", ["init"], { cwd: previewRoot });
    console.log("[D2CPreview] Git 仓库初始化完成");
  } catch (error) {
    console.warn(`[D2CPreview] Git 初始化失败: ${formatUnknownError(error)}`);
  }
};

const STARTUP_TIMEOUT_MS = 120_000; // 2 分钟超时

const startPreviewServer = (npmBin, nodeBin) => {
  appendLog("starting preview server");
  updateStatus("starting", "启动预览服务");
  const nodeBinDir = nodeBin ? path.dirname(nodeBin) : null;
  const mergedPath = nodeBinDir
    ? `${nodeBinDir}${path.delimiter}${process.env.PATH || ""}`
    : process.env.PATH;

  const serverLogPath = path.join(previewRoot, "preview-server.log");
  const serverLogStream = fs.createWriteStream(serverLogPath, { flags: "a" });

  const child = spawn(npmBin, ["run", "dev"], {
    cwd: previewRoot,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: {
      ...process.env,
      PORT: undefined,
      PATH: mergedPath,
    },
  });

  let readyFound = false;

  const checkReady = (text) => {
    if (readyFound) return;
    if (/Nfes Ready on http:\/\/localhost:\d+/i.test(text)) {
      readyFound = true;
      appendLog("preview server ready");
      updateStatus("done", "预览服务已启动");
    }
  };

  child.stdout.on("data", (data) => {
    serverLogStream.write(data);
    checkReady(data.toString());
  });

  child.stderr.on("data", (data) => {
    serverLogStream.write(data);
    checkReady(data.toString());
  });

  child.on("error", (error) => {
    const message = formatUnknownError(error);
    appendLog(`preview server error: ${message}`);
    updateStatus("failed", `预览服务启动失败: ${message}`);
    serverLogStream.end();
  });

  child.on("close", (code) => {
    serverLogStream.end();
    appendLog(`preview server exited code=${code}`);
    if (!readyFound) {
      updateStatus("failed", `预览服务退出，退出码: ${code}`);
    }
    // dev:h5 退出意味着预览服务不再运行，父进程也应退出
    process.exit(code || 0);
  });

  // 超时：如果 2 分钟内未检测到 ready，标记失败但不杀进程（可能只是慢）
  setTimeout(() => {
    if (!readyFound) {
      appendLog("preview server startup timeout");
      updateStatus(
        "failed",
        `预览服务启动超时（${STARTUP_TIMEOUT_MS / 1000}秒）`,
      );
    }
  }, STARTUP_TIMEOUT_MS);

  // 返回子进程引用，父进程需要保持存活以维持子进程
  return child;
};

const main = async () => {
  try {
    const { nodeBin, npmBin } = await ensureNodeVersion();
    await ensurePreviewProject(npmBin);
    await ensureGitRepo();
    // 启动预览服务后，父进程保持存活以维持 dev:h5 子进程的生命周期。
    // 进程会在 dev:h5 的 close 事件中退出。
    startPreviewServer(npmBin, nodeBin);
  } catch (error) {
    const message = formatUnknownError(error);
    appendLog(`startup failed ${message}`);
    console.error(`[D2CPreview] 启动失败: ${message}`);
    updateStatus("failed", `启动失败: ${message}`);
    process.exit(1);
  }
};

main();
