import { createContext, useContext } from "react";

export type PendingAskUserQuestionContextValue = {
  pendingRequestId: string | null;
  pendingToolUseId: string | null;
  onAnswersSubmit: ((answers: Record<string, string>) => Promise<void>) | null;
};

export const PendingAskUserQuestionContext =
  createContext<PendingAskUserQuestionContextValue>({
    pendingRequestId: null,
    pendingToolUseId: null,
    onAnswersSubmit: null,
  });

export const usePendingAskUserQuestion = () =>
  useContext(PendingAskUserQuestionContext);
