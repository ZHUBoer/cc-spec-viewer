import { Trans, useLingui } from "@lingui/react";
import { useNavigate } from "@tanstack/react-router";
import { type FC, useEffect, useState } from "react";
import { useConfigCheck } from "../../../../../../../components/spec-dashboard/hooks/useConfigCheck";
import {
  clearPendingNewChangeDraft,
  loadPendingNewChangeDraft,
  type PendingNewChangeDraft,
  pendingNewChangeDraftEvent,
} from "../../../../../../../components/spec-dashboard/pendingNewChangeDraft";
import { useConfig } from "../../../../../../hooks/useConfig";
import {
  ChatInput,
  type MessageInput,
  useCreateSessionProcessMutation,
} from "../../../../components/chatForm";
import {
  FeishuResolverDialogs,
  useFeishuResolver,
} from "../../../../components/chatForm/feishu";
import { ensureStartNewChatConfigured } from "./startNewChatUtils";

export const StartNewChat: FC<{ projectId: string }> = ({ projectId }) => {
  const { i18n } = useLingui();
  const navigate = useNavigate();
  const createSessionProcess = useCreateSessionProcessMutation(projectId);
  const { config } = useConfig();
  const { isConfigured, handleGoToInit } = useConfigCheck(projectId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuedMessage, setQueuedMessage] =
    useState<PendingNewChangeDraft | null>(null);
  const { beforeSubmit, dialogState, dialogActions, isProcessing } =
    useFeishuResolver(projectId);

  useEffect(() => {
    setQueuedMessage(loadPendingNewChangeDraft(projectId));

    const handlePendingDraftEvent = (event: CustomEvent) => {
      if (event.detail?.projectId !== projectId) {
        return;
      }
      const detailDraft = event.detail?.draft;
      if (
        typeof detailDraft !== "object" ||
        detailDraft === null ||
        typeof detailDraft.id !== "string" ||
        typeof detailDraft.text !== "string"
      ) {
        return;
      }
      setQueuedMessage({
        id: detailDraft.id,
        text: detailDraft.text,
      });
    };

    window.addEventListener(
      pendingNewChangeDraftEvent,
      handlePendingDraftEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        pendingNewChangeDraftEvent,
        handlePendingDraftEvent as EventListener,
      );
    };
  }, [projectId]);

  const handleSubmit = async (input: MessageInput) => {
    if (
      !ensureStartNewChatConfigured({
        isConfigured,
        handleGoToInit,
      })
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createSessionProcess.mutateAsync({ input });
      clearPendingNewChangeDraft(projectId);
      setQueuedMessage(null);
    } catch {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = () => {
    const behavior = config?.enterKeyBehavior;
    if (behavior === "enter-send") {
      return i18n._({
        id: "chat.placeholder.continue.enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Enter to send)",
      });
    }
    if (behavior === "command-enter-send") {
      return i18n._({
        id: "chat.placeholder.continue.command_enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Command+Enter to send)",
      });
    }
    return i18n._({
      id: "chat.placeholder.continue.shift_enter",
      message:
        "Type your message... (Start with / for commands, @ for files, Shift+Enter to send)",
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-3">
      <ChatInput
        projectId={projectId}
        onSubmit={handleSubmit}
        isPending={
          createSessionProcess.isPending || isSubmitting || isProcessing
        }
        error={createSessionProcess.error}
        placeholder={getPlaceholder()}
        buttonText={<Trans id="chat.button.start" />}
        containerClassName=""
        buttonSize="default"
        enableScheduledSend={true}
        onBeforeSubmit={beforeSubmit}
        queuedMessage={queuedMessage}
        onQueuedMessageHandled={(id, result) => {
          if (result !== "success") {
            return;
          }
          clearPendingNewChangeDraft(projectId);
          setQueuedMessage((current) => (current?.id === id ? null : current));
        }}
        onModelSwitched={() => {
          navigate({
            to: "/projects/$projectId/session",
            params: { projectId },
            search: (prev) => {
              const { sessionId: _removed, ...rest } = prev;
              return rest;
            },
          });
        }}
      />
      <FeishuResolverDialogs state={dialogState} actions={dialogActions} />
    </div>
  );
};
