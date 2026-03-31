import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MarkdownContent } from "./MarkdownContent";

vi.mock("../../components/ui/Mermaid", () => ({
  Mermaid: () => <div>Mermaid</div>,
}));

vi.mock("./MarkdownLink", () => ({
  MarkdownLink: ({
    href,
    children,
  }: {
    href?: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("./SpecNotificationCard", () => ({
  SpecNotificationCard: () => <div>SpecNotificationCard</div>,
}));

describe("MarkdownContent", () => {
  it("根容器保持可收缩宽度，避免长文本把外层会话区撑宽", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent content="https://example.com/very/long/path" />,
    );

    expect(markup).toContain("w-full min-w-0 max-w-full");
  });

  it("普通段落保留源码换行，避免目录树被压平成单行", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        content={`最终产物（6 个文件）

d2c/
├── manifest.json (39行)
├── review.md (106行)
├── student-douyin-landing-page/
│   ├── index.tsx (127行)
│   └── index.module.scss (342行)
└── purchase-record-modal/
    ├── index.tsx (88行)
    └── index.module.scss (216行)`}
      />,
    );

    expect(markup).toContain("whitespace-pre-wrap");
    expect(markup).toContain(
      "d2c/\n├── manifest.json (39行)\n├── review.md (106行)",
    );
  });

  it("正文与目录树混排时保持段落结构和换行样式", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        content={`所有产物如下：

d2c/
├── manifest.json (39行)
└── review.md (106行)

所有产物与 Figma 设计稿一致。`}
      />,
    );

    expect(markup).toContain(">所有产物如下：</p>");
    expect(markup).toContain("whitespace-pre-wrap");
    expect(markup).toContain("所有产物与 Figma 设计稿一致。");
  });

  it("fenced code block 保持现有代码块渲染", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        content={`\`\`\`text
d2c/
├── manifest.json (39行)
└── review.md (106行)
\`\`\``}
      />,
    );

    expect(markup).toContain("border border-border");
  });

  it("无语言标记的 fenced code block 仍按代码块渲染", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        content={`\`\`\`
d2c/
├── manifest.json (39行)
└── review.md (106行)
\`\`\``}
      />,
    );

    expect(markup).toContain("<pre");
    expect(markup).toContain("font-mono text-foreground whitespace-pre");
    expect(markup).not.toContain(
      "bg-muted/70 px-2 py-1 rounded-md text-sm font-mono",
    );
  });

  it("标准 Markdown 表格保持表格渲染", () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        content={`| 文件 | 问题 | 修正 |
| :--- | :--- | :--- |
| \`index.module.scss\` | \`.voucherBg\` 缺少 \`background: url(...)\` 背景图 | 已补全背景图 URL |
| \`index.tsx\` | \`badgeIcon\` 图片 URL 过期 | 已更新为新 URL |`}
      />,
    );

    expect(markup).toContain("<table");
    expect(markup).toContain("<thead");
  });
});
