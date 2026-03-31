import { transform } from "sucrase";
import type { D2CArtifactFile } from "@/lib/openspec/d2c";
import { buildElementSelectorScript } from "./d2c-element-selector";

/**
 * 将多行 import 合并为单行，使后续逐行处理能正确匹配完整语句。
 *
 * 例如：
 * ```
 * import {
 *   useState,
 *   useEffect,
 * } from 'react';
 * ```
 * → `import { useState, useEffect, } from 'react';`
 */
const mergeMultiLineImports = (code: string): string => {
  const importRe =
    /^import\s+(?:\{[\s\S]*?\}|[\s\S]*?)\s+from\s+['"][^'"]+['"]\s*;?/gm;
  return code.replace(importRe, (m) => m.replace(/\n\s*/g, " "));
};

/**
 * 预处理 TSX 源码中的 import 语句，使其适配 iframe 内的 ESM 环境。
 *
 * - react / react-dom 由 importmap 提供，跳过 import 语句
 * - .module.scss / .module.css → 替换为 CSS Modules mock
 * - .scss / .css（非 module）→ 忽略（CSS 已作为 <style> 注入）
 * - 其他未知 import → 注释掉并输出 console.warn
 */
const preprocessImports = (code: string): string => {
  const merged = mergeMultiLineImports(code);
  const lines = merged.split("\n");
  const processed: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^import\s+.*from\s+['"]react['"]/.test(trimmed)) {
      continue;
    }
    if (/^import\s+.*from\s+['"]react-dom/.test(trimmed)) {
      continue;
    }

    const cssModuleMatch = trimmed.match(
      /^import\s+(\w+)\s+from\s+['"].*\.module\.(scss|css)['"]/,
    );
    if (cssModuleMatch) {
      processed.push(
        `const ${cssModuleMatch[1]} = new Proxy({}, { get: (_, key) => typeof key === 'symbol' ? '' : String(key) });`,
      );
      continue;
    }

    if (/^import\s+['"].*\.(scss|css)['"]/.test(trimmed)) {
      continue;
    }

    if (/^import\s/.test(trimmed)) {
      processed.push(
        `/* [d2c-preview] unsupported import: ${trimmed} */ console.warn('[d2c-preview] skipped import:', ${JSON.stringify(trimmed)});`,
      );
      continue;
    }

    processed.push(line);
  }

  return processed.join("\n");
};

/**
 * 简化 SCSS 为可直接使用的 CSS。
 *
 * 处理策略：
 * - 展开单层 & 嵌套（覆盖最常见的 `.parent { &__child {} }` 模式）
 * - 保留 CSS 变量、移除 SCSS 变量声明和引用
 * - 移除 @use / @import 语句
 *
 * 对于 D2C 工具生成的简单 SCSS 足够；复杂嵌套的边界情况会被 graceful 跳过。
 */
const simplifyScss = (scss: string): string => {
  let css = scss;
  css = css.replace(/@use\s+['"][^'"]*['"]\s*;?\s*/g, "");
  css = css.replace(/@import\s+['"][^'"]*['"]\s*;?\s*/g, "");

  css = css.replace(/\$[\w-]+\s*:\s*[^;]+;?\s*/g, "");
  css = css.replace(/[^;{}]*\$[\w-]+[^;{}]*;\s*/g, "");

  css = expandOneLevel(css);

  return css;
};

/**
 * 展开一层 & 嵌套 —— 将 `.parent { &__child { ... } }` 变为 `.parent__child { ... }`
 */
const expandOneLevel = (css: string): string => {
  const result: string[] = [];
  const ruleRegex = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

  let lastIndex = 0;
  let match = ruleRegex.exec(css);
  while (match !== null) {
    const selector = (match[1] ?? "").trim();
    const body = match[2] ?? "";
    result.push(css.slice(lastIndex, match.index));

    const innerRuleRegex = /&([\w-]*)(\s*)\{([^{}]*)\}/g;
    let cleanBody = body;

    let innerMatch = innerRuleRegex.exec(body);
    while (innerMatch !== null) {
      const childSuffix = innerMatch[1] ?? "";
      const childBody = innerMatch[3] ?? "";
      result.push(`${selector}${childSuffix} { ${childBody.trim()} }\n`);
      cleanBody = cleanBody.replace(innerMatch[0], "");
      innerMatch = innerRuleRegex.exec(body);
    }

    const remaining = cleanBody.trim();
    if (remaining.length > 0) {
      result.push(`${selector} { ${remaining} }\n`);
    }

    lastIndex = match.index + match[0].length;
    match = ruleRegex.exec(css);
  }

  result.push(css.slice(lastIndex));
  return result.join("");
};

/**
 * 使用 Sucrase 将预处理后的 TSX 转换为浏览器可执行的 JS。
 */
const compileTsx = (preprocessedCode: string): string => {
  const { code } = transform(preprocessedCode, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "classic",
    production: true,
  });
  return code;
};

/**
 * 从 generatedFiles 中提取主组件入口名（默认 export）。
 *
 * 支持的模式：
 * - `export default function Foo`
 * - `export default class Foo`
 * - `export default Foo`
 * - `export default memo(Foo)` / `export default forwardRef(...)`
 * - const Foo = ... 随后 `export default Foo` 或 `export { Foo as default }`
 */
const extractDefaultExportName = (code: string): string | undefined => {
  const funcOrClass = code.match(
    /export\s+default\s+(?:function|class)\s+(\w+)/,
  );
  if (funcOrClass?.[1]) return funcOrClass[1];

  const wrappedExport = code.match(
    /export\s+default\s+(?:memo|forwardRef|React\.memo|React\.forwardRef)\s*\(\s*(\w+)/,
  );
  if (wrappedExport?.[1]) return wrappedExport[1];

  const directExport = code.match(/export\s+default\s+(\w+)\s*;/);
  if (directExport?.[1]) return directExport[1];

  const namedDefault = code.match(
    /export\s*\{[^}]*\b(\w+)\s+as\s+default\b[^}]*\}/,
  );
  if (namedDefault?.[1]) return namedDefault[1];

  const constExport = code.match(
    /const\s+(\w+)\s*(?::\s*[\w.<>,\s|]+)?\s*=\s*(?:\([^)]*\)|[^=])*=>\s*[({]/,
  );
  if (constExport?.[1]) {
    if (
      new RegExp(`export\\s+default\\s+${constExport[1]}\\b`).test(code) ||
      new RegExp(`export\\s*\\{[^}]*\\b${constExport[1]}\\b`).test(code)
    ) {
      return constExport[1];
    }
  }

  return undefined;
};

export {
  mergeMultiLineImports,
  preprocessImports,
  simplifyScss,
  extractDefaultExportName,
};

export interface D2CPreviewBuildResult {
  html: string;
  error?: string;
}

/**
 * 将 D2C 产物文件（TSX + SCSS）编译为可在 iframe 中渲染的完整 HTML 文档。
 */
export const buildD2CPreviewHtml = (
  generatedFiles: D2CArtifactFile[],
): D2CPreviewBuildResult => {
  const tsxFile = generatedFiles.find(
    (f) => f.name.endsWith(".tsx") || f.name.endsWith(".jsx"),
  );
  if (!tsxFile) {
    return {
      html: "",
      error: "未找到 TSX/JSX 入口文件",
    };
  }

  const styleFiles = generatedFiles.filter(
    (f) => f.name.endsWith(".scss") || f.name.endsWith(".css"),
  );

  let cssContent = "";
  for (const file of styleFiles) {
    try {
      cssContent += `/* ${file.name} */\n${simplifyScss(file.content)}\n`;
    } catch {
      cssContent += `/* [d2c-preview] failed to process ${file.name} */\n`;
    }
  }

  let compiledJs: string;
  try {
    const preprocessed = preprocessImports(tsxFile.content);
    compiledJs = compileTsx(preprocessed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      html: "",
      error: `TSX 编译失败: ${msg}`,
    };
  }

  const componentName = extractDefaultExportName(tsxFile.content) ?? "App";

  compiledJs = compiledJs
    .replace(
      /export\s+default\s+(?:function\s+)?(\w+)/,
      "/* default export: $1 */",
    )
    .replace(/export\s*\{[^}]*\}\s*;?/g, "/* named exports removed */");

  const selectorScript = buildElementSelectorScript();

  const escapeForScript = (s: string) =>
    s.replaceAll("</script", "<\\/script").replaceAll("</Script", "<\\/Script");
  const escapeForStyle = (s: string) =>
    s.replaceAll("</style", "<\\/style").replaceAll("</Style", "<\\/Style");

  const safeJs = escapeForScript(compiledJs);
  const safeCss = escapeForStyle(cssContent);
  const safeSelector = escapeForScript(selectorScript);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19",
    "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime",
    "react-dom": "https://esm.sh/react-dom@19",
    "react-dom/client": "https://esm.sh/react-dom@19/client"
  }
}
</script>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, 'PingFang SC', sans-serif; }
${safeCss}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';

${safeJs}

try {
  var _root = createRoot(document.getElementById('root'));
  _root.render(React.createElement(${componentName}));
} catch (err) {
  document.getElementById('root').innerHTML =
    '<div style="padding:24px;color:#dc2626;font-family:monospace;white-space:pre-wrap">渲染失败: ' +
    (err.message || err) + '</div>';
  console.error('[d2c-preview] render error', err);
}
</script>
<script>${safeSelector}</script>
</body>
</html>`;

  return { html };
};
