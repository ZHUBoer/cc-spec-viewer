import { describe, expect, test } from "vitest";
import {
  buildD2CPreviewHtml,
  extractDefaultExportName,
  mergeMultiLineImports,
  preprocessImports,
  simplifyScss,
} from "./d2c-preview-utils";

describe("mergeMultiLineImports", () => {
  test("合并多行 import 为单行", () => {
    const input = `import {
  useState,
  useEffect,
} from 'react';`;
    const result = mergeMultiLineImports(input);
    expect(result).toContain("from 'react'");
    expect(result.split("\n")).toHaveLength(1);
  });

  test("保留已是单行的 import", () => {
    const input = "import React from 'react';";
    expect(mergeMultiLineImports(input)).toBe(input);
  });

  test("保留非 import 的多行代码", () => {
    const input = `const x = {
  a: 1,
  b: 2,
};`;
    expect(mergeMultiLineImports(input)).toBe(input);
  });
});

describe("preprocessImports", () => {
  test("移除 react import", () => {
    const result = preprocessImports("import React from 'react';");
    expect(result.trim()).toBe("");
  });

  test("移除 react-dom import", () => {
    const result = preprocessImports(
      "import { createRoot } from 'react-dom/client';",
    );
    expect(result.trim()).toBe("");
  });

  test("CSS Module import 替换为 Proxy", () => {
    const result = preprocessImports(
      "import styles from './index.module.scss';",
    );
    expect(result).toContain("const styles = new Proxy");
    expect(result).toContain("typeof key === 'symbol'");
  });

  test("普通 CSS import 被移除", () => {
    const result = preprocessImports("import './global.css';");
    expect(result.trim()).toBe("");
  });

  test("未知 import 被注释并添加 console.warn", () => {
    const result = preprocessImports("import lodash from 'lodash';");
    expect(result).toContain("[d2c-preview] unsupported import");
    expect(result).toContain("console.warn");
  });

  test("非 import 代码保持不变", () => {
    const code = "const App = () => <div>Hello</div>;";
    expect(preprocessImports(code)).toBe(code);
  });

  test("处理多行 react import", () => {
    const input = `import {
  useState,
  useEffect,
} from 'react';
const App = () => <div />;`;
    const result = preprocessImports(input);
    expect(result).not.toContain("useState");
    expect(result).toContain("const App");
  });
});

describe("simplifyScss", () => {
  test("移除 @use 语句", () => {
    const result = simplifyScss("@use 'variables';\n.foo { color: red; }");
    expect(result).not.toContain("@use");
    expect(result).toContain("color: red");
  });

  test("移除 @import 语句", () => {
    const result = simplifyScss("@import 'mixins';\n.foo { color: red; }");
    expect(result).not.toContain("@import");
  });

  test("移除 SCSS 变量声明", () => {
    const result = simplifyScss("$primary: #333;\n.foo { color: red; }");
    expect(result).not.toContain("$primary");
    expect(result).toContain("color: red");
  });

  test("移除包含 SCSS 变量引用的声明行", () => {
    const result = simplifyScss(".foo { width: $sidebar-width; }");
    expect(result).not.toContain("$sidebar-width");
  });

  test("展开单层 & 嵌套", () => {
    const input = ".parent { &__child { color: blue; } }";
    const result = simplifyScss(input);
    expect(result).toContain(".parent__child");
    expect(result).toContain("color: blue");
  });
});

describe("extractDefaultExportName", () => {
  test("匹配 export default function Foo", () => {
    expect(
      extractDefaultExportName("export default function HomePage() {}"),
    ).toBe("HomePage");
  });

  test("匹配 export default class Foo", () => {
    expect(
      extractDefaultExportName("export default class MyComponent {}"),
    ).toBe("MyComponent");
  });

  test("匹配 export default Foo;", () => {
    expect(
      extractDefaultExportName(
        "const Foo = () => <div />;\nexport default Foo;",
      ),
    ).toBe("Foo");
  });

  test("匹配 export default memo(Foo)", () => {
    expect(
      extractDefaultExportName(
        "const Foo = () => <div />;\nexport default memo(Foo);",
      ),
    ).toBe("Foo");
  });

  test("匹配 export default React.memo(Foo)", () => {
    expect(
      extractDefaultExportName(
        "const Foo = () => <div />;\nexport default React.memo(Foo);",
      ),
    ).toBe("Foo");
  });

  test("匹配 export default forwardRef(Foo)", () => {
    expect(
      extractDefaultExportName(
        "const Foo = () => <div />;\nexport default forwardRef(Foo);",
      ),
    ).toBe("Foo");
  });

  test("匹配 export { Foo as default }", () => {
    expect(
      extractDefaultExportName(
        "const Foo = () => <div />;\nexport { Foo as default };",
      ),
    ).toBe("Foo");
  });

  test("无匹配返回 undefined", () => {
    expect(extractDefaultExportName("const x = 1;")).toBeUndefined();
  });
});

describe("buildD2CPreviewHtml", () => {
  test("无 TSX 文件时返回错误", () => {
    const result = buildD2CPreviewHtml([]);
    expect(result.html).toBe("");
    expect(result.error).toContain("TSX/JSX");
  });

  test("基本 TSX 编译成功", () => {
    const result = buildD2CPreviewHtml([
      {
        name: "index.tsx",
        content: "export default function App() { return <div>Hello</div>; }",
      },
    ]);
    expect(result.html).toContain("<!doctype html>");
    expect(result.html).toContain("App");
    expect(result.html).toContain("esm.sh/react@19");
    expect(result.error).toBeUndefined();
  });

  test("包含 SCSS 文件时 CSS 被内联", () => {
    const result = buildD2CPreviewHtml([
      {
        name: "index.tsx",
        content: "export default function App() { return <div>Hello</div>; }",
      },
      {
        name: "index.module.scss",
        content: ".container { padding: 16px; }",
      },
    ]);
    expect(result.html).toContain("padding: 16px");
  });

  test("用户代码中的 </script 被转义", () => {
    const result = buildD2CPreviewHtml([
      {
        name: "index.tsx",
        content: `export default function App() { const s = "<\\/script>"; return <div>{s}</div>; }`,
      },
    ]);
    expect(result.html).toBeDefined();
    expect(result.error).toBeUndefined();

    const moduleScriptMatch = result.html.match(
      /<script type="module">([\s\S]*?)<\/script>/,
    );
    expect(moduleScriptMatch).toBeTruthy();
    const scriptContent = moduleScriptMatch?.[1] ?? "";
    expect(scriptContent).not.toContain("</script");
  });

  test("语法错误的 TSX 返回编译失败", () => {
    const result = buildD2CPreviewHtml([
      {
        name: "index.tsx",
        content: "export default {{invalid}}",
      },
    ]);
    expect(result.html).toBe("");
    expect(result.error).toContain("TSX 编译失败");
  });

  test(".less 文件不参与编译", () => {
    const result = buildD2CPreviewHtml([
      {
        name: "index.tsx",
        content: "export default function App() { return <div>Hello</div>; }",
      },
      {
        name: "style.less",
        content: ".box { .inner { color: red; } }",
      },
    ]);
    expect(result.html).not.toContain(".box");
  });
});
