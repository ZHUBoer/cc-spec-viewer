import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("渲染纯 pre/code 结构，不依赖第三方高亮组件", () => {
    const markup = renderToStaticMarkup(
      <CodeBlock language="ts" code={`const answer = 42;\n`} />,
    );

    expect(markup).toContain("<pre");
    expect(markup).toContain("<code");
    expect(markup).toContain("const answer = 42;");
    expect(markup).not.toContain("<span style=");
  });
});
