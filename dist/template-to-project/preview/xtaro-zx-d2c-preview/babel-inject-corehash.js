const generate = require("@babel/generator").default;
const { createHash } = require("crypto");
const nodePath = require("node:path");
const fs = require("node:fs");

const projectPath = nodePath.resolve(process.cwd());

// 初始化 webCoreBuildData
if (!process.webCoreBuildData) {
  process.webCoreBuildData = {};
}

// 设置环境变量
if (!process.env.nodeMode) {
  process.env.nodeMode = "Comp";
}

// 写入文件的路径
const webCoreBuildDataPath = nodePath.join(
  projectPath,
  ".next",
  "webCoreBuildData.json",
);

// 确保 .next 目录存在
const nextDir = nodePath.dirname(webCoreBuildDataPath);
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// 防抖写入文件的函数
let writeTimer = null;
function writeWebCoreBuildDataToFile(immediate = false) {
  // 如果立即写入，清除定时器并直接写入
  if (immediate) {
    if (writeTimer) {
      clearTimeout(writeTimer);
      writeTimer = null;
    }
    try {
      fs.writeFileSync(
        webCoreBuildDataPath,
        JSON.stringify(process.webCoreBuildData, null, 2),
        "utf-8",
      );
      // console.log(`[Babel Plugin] 已写入 webCoreBuildData 到文件: ${webCoreBuildDataPath}, 键数量: ${Object.keys(process.webCoreBuildData).length}`);
    } catch (error) {
      console.error("[Babel Plugin] 写入 webCoreBuildData 文件失败:", error);
    }
    return;
  }

  // 清除之前的定时器
  if (writeTimer) {
    clearTimeout(writeTimer);
  }

  // 延迟写入，避免频繁写入文件
  writeTimer = setTimeout(() => {
    try {
      fs.writeFileSync(
        webCoreBuildDataPath,
        JSON.stringify(process.webCoreBuildData, null, 2),
        "utf-8",
      );
      // console.log(`[Babel Plugin] 已写入 webCoreBuildData 到文件: ${webCoreBuildDataPath}, 键数量: ${Object.keys(process.webCoreBuildData).length}`);
    } catch (error) {
      console.error("[Babel Plugin] 写入 webCoreBuildData 文件失败:", error);
    }
    writeTimer = null;
  }, 100); // 100ms 防抖
}

// 在进程退出时确保写入文件
process.on("exit", () => {
  writeWebCoreBuildDataToFile(true);
});

// 监听 SIGINT 和 SIGTERM 信号，确保在构建中断时也能写入
process.on("SIGINT", () => {
  writeWebCoreBuildDataToFile(true);
  process.exit(0);
});

process.on("SIGTERM", () => {
  writeWebCoreBuildDataToFile(true);
  process.exit(0);
});

function generateContentHash(content) {
  const hash = createHash("sha1");
  hash.update(content);
  return hash.digest("hex").substring(0, 8);
}

module.exports = (babel) => {
  const { types: t } = babel;

  return {
    name: "inject-corehash",
    visitor: {
      JSXOpeningElement(path, state) {
        // 获取当前文件路径
        const filename = state.filename || state.file?.opts?.filename;
        if (!filename) {
          return;
        }

        const fileDir = filename;
        const filenameOnly = nodePath.basename(filename);
        const relativePath = nodePath.relative(projectPath, filename);

        // 排除 node_modules
        if (
          fileDir.indexOf("/node_modules/") >= 0 ||
          fileDir.indexOf("\\node_modules\\") >= 0
        ) {
          return;
        }

        // 排除 _document.jsx 文件（避免 JSON 解析错误）
        if (
          filenameOnly === "_document.jsx" ||
          filenameOnly === "_document.tsx"
        ) {
          return;
        }

        // 检查是否启用 Comp 模式
        const nodeMode = state.opts?.nodeMode || process.env.nodeMode;
        if (nodeMode !== "Comp") {
          return;
        }

        // 检查是否有 attributes
        if (!path.node.attributes) {
          return;
        }

        // 查找父级函数
        const functionParent = path.findParent(
          (p) =>
            p.isClassMethod() ||
            p.isFunctionDeclaration() ||
            p.isFunctionExpression() ||
            p.isArrowFunctionExpression(),
        );

        if (!functionParent) {
          return;
        }

        const functionCode = generate(functionParent.node).code;
        const start = functionParent.node.loc?.start;
        const nodeLoc = path.node.loc;

        if (!start || !nodeLoc) {
          return;
        }

        // 尝试获取完整的 JSX 元素（包括子节点和闭合标签）
        // path.node 是 JSXOpeningElement，path.parentPath 应该是 JSXElement 的 Path
        let fullNodeCode = "";
        let endLine = nodeLoc.end.line;
        let nodeStartLine = nodeLoc.start.line;
        let nodeEndLine = nodeLoc.end.line;

        // 检查父节点路径是否是完整的 JSXElement
        const parentPath = path.parentPath;
        if (
          parentPath &&
          typeof parentPath.isJSXElement === "function" &&
          parentPath.isJSXElement()
        ) {
          // 使用完整的 JSXElement 生成代码
          fullNodeCode = generate(parentPath.node).code;
          // 使用完整元素的结束位置
          if (parentPath.node.loc?.end) {
            endLine = parentPath.node.loc.end.line;
            nodeEndLine = parentPath.node.loc.end.line;
            nodeStartLine = parentPath.node.loc.start.line;
          }
        } else {
          // 回退到只使用开始标签
          fullNodeCode = generate(path.node).code;
        }

        // 生成 hash
        const temphash = generateContentHash(
          `${filenameOnly};@;${functionCode};@;${start.line};@;${start.column}`,
        );

        if (!temphash) {
          return;
        }

        // 存储到 process.webCoreBuildData
        const dataToStore = {
          filename: filenameOnly,
          fileDir: relativePath,
          line: nodeStartLine,
          nodeCode: fullNodeCode,
          endLine: endLine,
          nodeStartLine: nodeStartLine,
          nodeEndLine: nodeEndLine,
        };

        process.webCoreBuildData[temphash] = JSON.stringify(dataToStore);

        // 同步写入文件（使用防抖优化）
        writeWebCoreBuildDataToFile();

        // Debug日志：记录数据写入（减少日志频率）
        const currentKeyCount = Object.keys(process.webCoreBuildData).length;
        if (currentKeyCount % 20 === 0 || currentKeyCount <= 5) {
          // console.log(`[Babel Plugin] 已收集 ${currentKeyCount} 个 corehash`);
        }

        // 检查是否已经存在 data-corehash 属性，避免重复添加
        const hasAttribute = path.node.attributes.some(
          (attr) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === "data-corehash",
        );

        if (!hasAttribute) {
          path.node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("data-corehash"),
              t.stringLiteral(temphash),
            ),
          );
        }
      },
    },
  };
};
