import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MarkdownLink } from "./MarkdownLink";

vi.mock("../../hooks/useWorkspacePanel", () => ({
  useWorkspacePanel: () => ({
    activeMode: "none",
    panelWidth: 50,
    browserUrl: null,
    openBrowser: vi.fn(),
    closeBrowser: vi.fn(),
    reloadBrowser: vi.fn(),
    specContext: null,
    openSpec: vi.fn(),
    closeSpec: vi.fn(),
    closePanel: vi.fn(),
  }),
}));

describe("MarkdownLink", () => {
  it("为超长链接提供可收缩和断行样式，避免撑破消息气泡", () => {
    const markup = renderToStaticMarkup(
      <MarkdownLink href="https://example.com/very/long/path">
        https://example.com/very/long/path
      </MarkdownLink>,
    );

    expect(markup).toContain("inline-flex max-w-full min-w-0 items-center");
    expect(markup).toContain("min-w-0 break-all");
  });
});
