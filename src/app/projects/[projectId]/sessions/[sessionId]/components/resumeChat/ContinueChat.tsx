import { Trans, useLingui } from "@lingui/react";
import { useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { useConfigCheck } from "../../../../../../../components/spec-dashboard/hooks/useConfigCheck";
import { useConfig } from "../../../../../../hooks/useConfig";
import {
  ChatInput,
  type MessageInput,
  useContinueSessionProcessMutation,
} from "../../../../components/chatForm";
import {
  FeishuResolverDialogs,
  useFeishuResolver,
} from "../../../../components/chatForm/feishu";

export const ContinueChat: FC<{
  projectId: string;
  sessionId: string;
  sessionProcessId: string;
  sessionProcessStatus?: "running" | "paused";
}> = ({ projectId, sessionId, sessionProcessId, sessionProcessStatus }) => {
  const { i18n } = useLingui();
  const navigate = useNavigate();
  const continueSessionProcess = useContinueSessionProcessMutation(
    projectId,
    sessionId,
  );
  const { config } = useConfig();
  const { isConfigured, handleGoToInit } = useConfigCheck(projectId);
  const { beforeSubmit, dialogState, dialogActions, isProcessing } =
    useFeishuResolver(projectId);

  const handleSubmit = async (input: MessageInput) => {
    // 检查是否已配置
    if (isConfigured === false) {
      handleGoToInit();
      return;
    }

    await continueSessionProcess.mutateAsync({ input, sessionProcessId });
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

  const isRunning = sessionProcessStatus === "running";

  const handleModelSwitched = () => {
    navigate({
      to: "/projects/$projectId/session",
      params: { projectId },
      search: (prev) => {
        const { sessionId: _removed, ...rest } = prev;
        return rest;
      },
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-3">
      <ChatInput
        projectId={projectId}
        onSubmit={handleSubmit}
        isPending={continueSessionProcess.isPending || isProcessing}
        error={continueSessionProcess.error}
        placeholder={getPlaceholder()}
        buttonText={<Trans id="chat.send" />}
        containerClassName=""
        buttonSize="default"
        enableScheduledSend={!isRunning}
        baseSessionId={sessionId}
        disabled={isRunning}
        onBeforeSubmit={beforeSubmit}
        onModelSwitched={handleModelSwitched}
        requireConfirmModelSwitch={true}
      />
      <FeishuResolverDialogs state={dialogState} actions={dialogActions} />
    </div>
  );
};
