import { describe, expect, it } from "vitest";
import type { PublicSessionProcess } from "@/types/session-process";
import {
  isSessionProcessAbortable,
  removeSessionProcessById,
} from "./sessionProcessUi";

const createSessionProcess = (
  overrides?: Partial<PublicSessionProcess>,
): PublicSessionProcess => ({
  id: "process-1",
  projectId: "project-1",
  sessionId: "session-1",
  status: "running",
  ...overrides,
});

describe("sessionProcessUi", () => {
  it("运行中和暂停中的会话进程都允许显示中止操作", () => {
    expect(isSessionProcessAbortable(createSessionProcess())).toBe(true);
    expect(
      isSessionProcessAbortable(createSessionProcess({ status: "paused" })),
    ).toBe(true);
    expect(isSessionProcessAbortable(undefined)).toBe(false);
  });

  it("中止成功后会立即移除本地会话进程", () => {
    const processes = [
      createSessionProcess(),
      createSessionProcess({
        id: "process-2",
        sessionId: "session-2",
      }),
    ];

    expect(removeSessionProcessById(processes, "process-1")).toEqual([
      createSessionProcess({
        id: "process-2",
        sessionId: "session-2",
      }),
    ]);
  });
});
