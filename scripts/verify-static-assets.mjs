import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const staticDir = path.join(rootDir, "dist", "static");
const indexPath = path.join(staticDir, "index.html");

const fail = (message) => {
  console.error(`[静态资源校验失败] ${message}`);
  process.exit(1);
};

const readIndexHtml = async () => {
  try {
    return await fs.readFile(indexPath, "utf8");
  } catch (_error) {
    fail(`无法读取 ${indexPath}`);
  }
};

const extractAssets = (html) => {
  const assets = new Set();
  const regex = /(?:src|href)="(\/assets\/[^"]+)"/g;
  let match = regex.exec(html);
  while (match !== null) {
    assets.add(match[1]);
    match = regex.exec(html);
  }
  return Array.from(assets);
};

const verifyAssets = async (assetPaths) => {
  if (assetPaths.length === 0) {
    fail("index.html 未找到任何 /assets/ 引用");
  }

  const missing = [];
  const empty = [];

  for (const assetPath of assetPaths) {
    const normalized = assetPath.startsWith("/")
      ? assetPath.slice(1)
      : assetPath;
    const fullPath = path.join(staticDir, normalized);
    try {
      const stats = await fs.stat(fullPath);
      if (stats.size === 0) {
        empty.push(assetPath);
      }
    } catch (_error) {
      missing.push(assetPath);
    }
  }

  if (missing.length > 0 || empty.length > 0) {
    if (missing.length > 0) {
      console.error("缺失的资源:");
      for (const assetPath of missing) {
        console.error(`- ${assetPath}`);
      }
    }
    if (empty.length > 0) {
      console.error("空文件资源:");
      for (const assetPath of empty) {
        console.error(`- ${assetPath}`);
      }
    }
    fail("index.html 与 dist/static/assets 不一致");
  }
};

const main = async () => {
  const html = await readIndexHtml();
  const assets = extractAssets(html);
  await verifyAssets(assets);
  console.log("静态资源校验通过");
};

main();
