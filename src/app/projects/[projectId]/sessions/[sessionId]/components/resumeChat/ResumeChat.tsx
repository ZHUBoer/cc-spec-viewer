import { Trans, useLingui } from "@lingui/react";
import { useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { useConfigCheck } from "../../../../../../../components/spec-dashboard/hooks/useConfigCheck";
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

export const ResumeChat: FC<{
  projectId: string;
  sessionId: string;
}> = ({ projectId, sessionId }) => {
  const { i18n } = useLingui();
  const navigate = useNavigate();
  const createSessionProcess = useCreateSessionProcessMutation(projectId);
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

    await createSessionProcess.mutateAsync({
      input,
      baseSessionId: sessionId,
    });
  };

  const getPlaceholder = () => {
    const behavior = config?.enterKeyBehavior;
    if (behavior === "enter-send") {
      return i18n._({
        id: "chat.placeholder.resume.enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Enter to send)",
      });
    }
    if (behavior === "command-enter-send") {
      return i18n._({
        id: "chat.placeholder.resume.command_enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Command+Enter to send)",
      });
    }
    return i18n._({
      id: "chat.placeholder.resume.shift_enter",
      message:
        "Type your message... (Start with / for commands, @ for files, Shift+Enter to send)",
    });
  };

  const buttonText = <Trans id="chat.resume" />;

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
        isPending={createSessionProcess.isPending || isProcessing}
        error={createSessionProcess.error}
        placeholder={getPlaceholder()}
        buttonText={buttonText}
        containerClassName=""
        buttonSize="default"
        enableScheduledSend={true}
        baseSessionId={sessionId}
        onBeforeSubmit={beforeSubmit}
        onModelSwitched={handleModelSwitched}
        requireConfirmModelSwitch={true}
      />
      <FeishuResolverDialogs state={dialogState} actions={dialogActions} />
    </div>
  );
};
