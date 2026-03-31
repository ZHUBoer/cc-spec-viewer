import { describe, expect, it } from "vitest";
import type { PublicSessionProcess } from "@/types/session-process";
import {
  applySessionProcessesSnapshot,
  createEmptySessionProcessesState,
  getSessionProcessBySessionId,
  removeSessionProcessStateById,
  replaceSessionProcessesState,
  upsertSessionProcessState,
} from "./sessionProcessesState";

const createProcess = (
  overrides?: Partial<PublicSessionProcess>,
): PublicSessionProcess => ({
  id: "process-1",
  projectId: "project-1",
  sessionId: "session-1",
  status: "running",
  ...overrides,
});

describe("sessionProcessesState", () => {
  it("会按 sessionId 去重并优先保留 running 状态", () => {
    const state = replaceSessionProcessesState(
      createEmptySessionProcessesState(),
      [
        createProcess({ id: "paused-process", status: "paused" }),
        createProcess({ id: "running-process", status: "running" }),
      ],
      100,
    );

    expect(state.processes).toEqual([
      createProcess({ id: "running-process", status: "running" }),
    ]);
  });

  it("会丢弃早于当前水位的旧轮询快照", () => {
    const currentState = upsertSessionProcessState(
      createEmptySessionProcessesState(),
      createProcess({ id: "new-process", status: "running" }),
      200,
    );

    const nextState = applySessionProcessesSnapshot(currentState, {
      processes: [createProcess({ id: "old-process", status: "paused" })],
      requestedAt: 150,
    });

    expect(nextState).toEqual(currentState);
  });

  it("继续会话时会用新进程替换同 sessionId 的旧状态", () => {
    const currentState = replaceSessionProcessesState(
      createEmptySessionProcessesState(),
      [createProcess({ id: "paused-process", status: "paused" })],
      100,
    );

    const nextState = upsertSessionProcessState(
      currentState,
      createProcess({ id: "running-process", status: "running" }),
      200,
    );

    expect(nextState.processes).toEqual([
      createProcess({ id: "running-process", status: "running" }),
    ]);
  });

  it("中止后会按 id 从稳定状态里移除会话进程", () => {
    const currentState = replaceSessionProcessesState(
      createEmptySessionProcessesState(),
      [
        createProcess({ id: "process-1", sessionId: "session-1" }),
        createProcess({ id: "process-2", sessionId: "session-2" }),
      ],
      100,
    );

    const nextState = removeSessionProcessStateById(
      currentState,
      "process-1",
      200,
    );

    expect(nextState.processes).toEqual([
      createProcess({ id: "process-2", sessionId: "session-2" }),
    ]);
  });

  it("读取当前会话进程时会返回归一化后的结果", () => {
    const state = replaceSessionProcessesState(
      createEmptySessionProcessesState(),
      [createProcess({ id: "process-1", sessionId: "session-1" })],
      100,
    );

    expect(getSessionProcessBySessionId(state.processes, "session-1")).toEqual(
      createProcess({ id: "process-1", sessionId: "session-1" }),
    );
    expect(
      getSessionProcessBySessionId(state.processes, "session-missing"),
    ).toBeUndefined();
  });
});
