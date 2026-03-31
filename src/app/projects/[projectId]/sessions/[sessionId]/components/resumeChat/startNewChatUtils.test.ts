import { describe, expect, it, vi } from "vitest";
import { ensureStartNewChatConfigured } from "./startNewChatUtils";

describe("startNewChatUtils", () => {
  it("未配置时会触发初始化流程并中止提交", () => {
    const handleGoToInit = vi.fn();

    expect(
      ensureStartNewChatConfigured({
        isConfigured: false,
        handleGoToInit,
      }),
    ).toBe(false);

    expect(handleGoToInit).toHaveBeenCalledTimes(1);
  });

  it("已配置时允许继续提交", () => {
    const handleGoToInit = vi.fn();

    expect(
      ensureStartNewChatConfigured({
        isConfigured: true,
        handleGoToInit,
      }),
    ).toBe(true);

    expect(handleGoToInit).not.toHaveBeenCalled();
  });
});
