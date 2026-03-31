import { describe, expect, it } from "vitest";
import { getSessionDetailRefetchInterval } from "./sessionRefreshPolicy";

describe("sessionRefreshPolicy", () => {
  it("运行中会话保留 1 秒兜底轮询", () => {
    expect(
      getSessionDetailRefetchInterval({
        isSseConnected: true,
        sessionProcessStatus: "running",
      }),
    ).toBe(1000);
  });

  it("暂停中的会话保留 1 秒兜底轮询，覆盖最终落盘延迟窗口", () => {
    expect(
      getSessionDetailRefetchInterval({
        isSseConnected: true,
        sessionProcessStatus: "paused",
      }),
    ).toBe(1000);
  });

  it("SSE 断开时对普通会话保留 3 秒轮询", () => {
    expect(
      getSessionDetailRefetchInterval({
        isSseConnected: false,
        sessionProcessStatus: undefined,
      }),
    ).toBe(3000);
  });

  it("SSE 正常且无活跃进程时关闭详情轮询", () => {
    expect(
      getSessionDetailRefetchInterval({
        isSseConnected: true,
        sessionProcessStatus: undefined,
      }),
    ).toBe(false);
  });
});
