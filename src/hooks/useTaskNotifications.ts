import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  notificationSettingsAtom,
  soundNotificationsEnabledAtom,
} from "@/lib/atoms/notifications";
import { playNotificationSound } from "@/lib/notifications";
import type { ExtendedConversation } from "@/server/core/types";
import {
  advanceTaskNotificationState,
  createInitialTaskNotificationState,
  getTaskCompletionContentKey,
} from "./taskNotificationState";

/**
 * Hook to handle task completion notifications.
 * 当前打开的会话优先等待内容真正出现在前端后再提示。
 */
export const useTaskNotifications = (options: {
  isRunningTask: boolean;
  conversations: ReadonlyArray<ExtendedConversation>;
}) => {
  const settings = useAtomValue(notificationSettingsAtom);
  const soundEnabled = useAtomValue(soundNotificationsEnabledAtom);
  const stateRef = useRef(createInitialTaskNotificationState());
  const latestCompletionKey = getTaskCompletionContentKey(
    options.conversations,
  );

  useEffect(() => {
    const notifyCompletion = () => {
      toast.success("Task completed");

      if (soundEnabled) {
        playNotificationSound(settings.soundType);
      }
    };

    const decision = advanceTaskNotificationState(stateRef.current, {
      isRunningTask: options.isRunningTask,
      latestCompletionKey,
    });

    stateRef.current = decision.nextState;

    if (decision.shouldNotify) {
      notifyCompletion();
    }
  }, [
    options.isRunningTask,
    latestCompletionKey,
    soundEnabled,
    settings.soundType,
  ]);
};
