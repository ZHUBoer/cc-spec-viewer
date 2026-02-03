import { Trans, useLingui } from "@lingui/react";
import { type FC, useState } from "react";
import { useConfig } from "../../../../../../hooks/useConfig";
import {
  ChatInput,
  type MessageInput,
  useCreateSessionProcessMutation,
} from "../../../../components/chatForm";

export const StartNewChat: FC<{ projectId: string }> = ({ projectId }) => {
  const { i18n } = useLingui();
  const createSessionProcess = useCreateSessionProcessMutation(projectId);
  const { config } = useConfig();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (input: MessageInput) => {
    setIsSubmitting(true);
    try {
      await createSessionProcess.mutateAsync({ input });
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
        isPending={createSessionProcess.isPending || isSubmitting}
        error={createSessionProcess.error}
        placeholder={getPlaceholder()}
        buttonText={<Trans id="chat.button.start" />}
        containerClassName=""
        buttonSize="default"
        enableScheduledSend={true}
      />
    </div>
  );
};
