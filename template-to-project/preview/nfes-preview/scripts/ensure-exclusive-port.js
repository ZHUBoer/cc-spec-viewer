#!/usr/bin/env node

const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function readPortFromPackageJson() {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkgText = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(pkgText);
  const port = pkg && pkg.config && pkg.config.port;
  return Number.isInteger(port) ? port : 8123;
}

function ensureLsofExists() {
  const result = spawnSync("lsof", ["-v"], { stdio: "ignore" });
  if (result.error) {
    console.error("错误：未找到 lsof，无法检测端口占用。");
    process.exit(1);
  }
}

function findListeningPids(port) {
  try {
    const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!output) return [];
    return [
      ...new Set(
        output
          .split(/\s+/)
          .map((pid) => Number(pid))
          .filter(Number.isInteger),
      ),
    ];
  } catch (error) {
    return [];
  }
}

function killPids(pids) {
  const killed = [];
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
      killed.push(pid);
    } catch (error) {
      console.error(`错误：结束进程失败 PID=${pid}，${error.message}`);
      process.exit(1);
    }
  }
  return killed;
}

function main() {
  ensureLsofExists();
  const port = readPortFromPackageJson();
  const pids = findListeningPids(port);

  if (pids.length === 0) {
    console.log(`端口 ${port} 空闲，无需清理。`);
    return;
  }

  console.log(`检测到端口 ${port} 被占用，准备结束进程：${pids.join(", ")}`);
  const killed = killPids(pids);
  console.log(`已结束端口 ${port} 占用进程：${killed.join(", ")}`);
}

main();
