import { describe, expect, it } from "vitest";
import type { PermissionRequest } from "../types/permissions";
import {
  EMPTY_POLL_CLEAR_THRESHOLD,
  getLatestPendingRequest,
  shouldAcceptPermissionEvent,
} from "./permissionRequestState";

const createRequest = (
  id: string,
  overrides?: Partial<PermissionRequest>,
): PermissionRequest => ({
  id,
  taskId: "task-1",
  sessionProcessId: "process-1",
  toolName: "AskUserQuestion",
  toolInput: {},
  timestamp: 1,
  ...overrides,
});

describe("permissionRequestState", () => {
  it("accepts only matching sessionProcessId events", () => {
    expect(
      shouldAcceptPermissionEvent({
        sessionProcessId: "process-1",
        request: createRequest("req-1", { sessionProcessId: "process-1" }),
      }),
    ).toBe(true);
    expect(
      shouldAcceptPermissionEvent({
        sessionProcessId: "process-1",
        request: createRequest("req-2", { sessionProcessId: "process-2" }),
      }),
    ).toBe(false);
    expect(
      shouldAcceptPermissionEvent({
        sessionProcessId: undefined,
        request: createRequest("req-3"),
      }),
    ).toBe(false);
  });

  it("returns latest request for current sessionProcessId", () => {
    const result = getLatestPendingRequest({
      sessionProcessId: "process-1",
      requests: [
        createRequest("req-1", {
          sessionProcessId: "process-1",
          timestamp: 1,
        }),
        createRequest("req-2", {
          sessionProcessId: "process-2",
          timestamp: 2,
        }),
        createRequest("req-3", {
          sessionProcessId: "process-1",
          timestamp: 3,
        }),
      ],
    });

    expect(result?.id).toBe("req-3");
  });

  it("returns null when sessionProcessId is missing", () => {
    const result = getLatestPendingRequest({
      sessionProcessId: undefined,
      requests: [createRequest("req-1")],
    });
    expect(result).toBeNull();
  });

  it("keeps clear threshold constant at 2 polls", () => {
    expect(EMPTY_POLL_CLEAR_THRESHOLD).toBe(2);
  });
});
