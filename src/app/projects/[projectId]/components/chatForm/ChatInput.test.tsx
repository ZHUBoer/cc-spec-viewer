import { describe, expect, it, vi } from "vitest";
import type { ChatInputProps } from "./ChatInput";
import { getNextHandledQueuedMessageId } from "./chatInputQueuedMessage";

describe("ChatInput Props", () => {
  it("should have correct type definition for enableScheduledSend", () => {
    const props: ChatInputProps = {
      projectId: "test-project",
      onSubmit: async () => {},
      isPending: false,
      placeholder: "Type your message...",
      buttonText: "Send",
      enableScheduledSend: true,
      baseSessionId: null,
    };

    expect(props.enableScheduledSend).toBe(true);
    expect(props.baseSessionId).toBe(null);
  });

  it("should allow enableScheduledSend to be undefined", () => {
    const props: ChatInputProps = {
      projectId: "test-project",
      onSubmit: async () => {},
      isPending: false,
      placeholder: "Type your message...",
      buttonText: "Send",
    };

    expect(props.enableScheduledSend).toBeUndefined();
  });

  it("should allow baseSessionId to be a string", () => {
    const props: ChatInputProps = {
      projectId: "test-project",
      onSubmit: async () => {},
      isPending: false,
      placeholder: "Type your message...",
      buttonText: "Send",
      baseSessionId: "session-123",
    };

    expect(props.baseSessionId).toBe("session-123");
  });

  it("should allow onModelSwitched callback", () => {
    const onModelSwitched = vi.fn();
    const props: ChatInputProps = {
      projectId: "test-project",
      onSubmit: async () => {},
      isPending: false,
      placeholder: "Type your message...",
      buttonText: "Send",
      onModelSwitched,
    };

    expect(props.onModelSwitched).toBe(onModelSwitched);
  });

  it("should validate datetime format parsing logic", () => {
    const scheduledTime = "2025-10-26T15:30";
    const match = scheduledTime.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );

    expect(match).not.toBeNull();

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hours = Number(match[4]);
      const minutes = Number(match[5]);

      expect(year).toBe(2025);
      expect(month).toBe(10);
      expect(day).toBe(26);
      expect(hours).toBe(15);
      expect(minutes).toBe(30);

      const localDate = new Date(year, month - 1, day, hours, minutes);
      expect(localDate.getFullYear()).toBe(2025);
      expect(localDate.getMonth()).toBe(9); // 0-indexed
      expect(localDate.getDate()).toBe(26);
      expect(localDate.getHours()).toBe(15);
      expect(localDate.getMinutes()).toBe(30);
    }
  });

  it("should handle invalid datetime format", () => {
    const invalidTime = "invalid-datetime";
    const match = invalidTime.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );

    expect(match).toBeNull();
  });

  it("should generate default scheduled time with correct format", () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const formatted = now.toISOString().slice(0, 16);

    // Verify format is correct (YYYY-MM-DDTHH:mm)
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

    // Verify the format can be parsed back
    const parsed = new Date(formatted);
    expect(parsed).toBeInstanceOf(Date);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });

  it("queued message 发送成功后会保留 handled id", () => {
    expect(getNextHandledQueuedMessageId("draft-1", "draft-1", "success")).toBe(
      "draft-1",
    );
  });

  it("queued message 发送失败后会清空 handled id，允许后续重试", () => {
    expect(
      getNextHandledQueuedMessageId("draft-1", "draft-1", "failed"),
    ).toBeNull();
    expect(
      getNextHandledQueuedMessageId("draft-1", "draft-1", "aborted"),
    ).toBeNull();
  });

  it("queued message 回调不会误清空其他消息的 handled id", () => {
    expect(getNextHandledQueuedMessageId("draft-2", "draft-1", "failed")).toBe(
      "draft-2",
    );
  });
});
