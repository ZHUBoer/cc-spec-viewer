import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingNewChangeDraft,
  loadPendingNewChangeDraft,
  savePendingNewChangeDraft,
} from "./pendingNewChangeDraft";

describe("pendingNewChangeDraft", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
      dispatchEvent: () => true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("会保存并读取待发送草稿", () => {
    savePendingNewChangeDraft("project-a", {
      id: "draft-1",
      text: "/opsx:new test",
    });

    expect(loadPendingNewChangeDraft("project-a")).toEqual({
      id: "draft-1",
      text: "/opsx:new test",
    });
  });

  it("会清理待发送草稿", () => {
    savePendingNewChangeDraft("project-b", {
      id: "draft-2",
      text: "/opsx:new test2",
    });

    clearPendingNewChangeDraft("project-b");

    expect(loadPendingNewChangeDraft("project-b")).toBeNull();
  });
});
