import fs from "node:fs";
import path from "node:path";
import "@ctrip/xtaro-h5/common/taror.css";
import { CoffeebeanScript } from "@ctrip/function-nfes-helper";

// 读取元素选择器工具代码
let elementSelectorScript = "";
try {
  const scriptPath = path.join(process.cwd(), "utils/elementSelector.js");
  if (fs.existsSync(scriptPath)) {
    elementSelectorScript = fs.readFileSync(scriptPath, "utf-8");
  }
} catch (error) {
  console.error("[Layout] 读取 elementSelector.js 失败:", error);
}

// 读取 webCoreBuildData（corehash 映射数据）
let webCoreBuildData = {};
try {
  const candidates = [
    path.join(process.cwd(), "app/demo/components/corehash-map.json"),
    path.join(process.cwd(), ".next/webCoreBuildData.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const fileContent = fs.readFileSync(candidate, "utf-8");
      webCoreBuildData = JSON.parse(fileContent);
      break;
    }
  }
} catch (error) {
  console.error("[Layout] 读取 webCoreBuildData 失败:", error);
}

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <CoffeebeanScript />
      </head>
      <body suppressHydrationWarning>
        {children}
        {webCoreBuildData && Object.keys(webCoreBuildData).length > 0 && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__WebCoreAssistant__ = ${JSON.stringify(webCoreBuildData)}`,
            }}
          />
        )}
        {elementSelectorScript && (
          <script
            dangerouslySetInnerHTML={{
              __html: elementSelectorScript,
            }}
          />
        )}
      </body>
    </html>
  );
}
