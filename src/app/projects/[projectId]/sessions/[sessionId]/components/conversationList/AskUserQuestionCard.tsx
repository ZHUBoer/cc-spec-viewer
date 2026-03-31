import { Trans } from "@lingui/react";
import { Check, Minus } from "lucide-react";
import type { FC } from "react";
import { ASK_USER_QUESTION_SKIPPED } from "@/components/AskUserQuestionInteractive";

interface QuestionOption {
  label: string;
  description: string;
}

interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

interface AskUserQuestionInput {
  questions: Question[];
}

export interface AskUserQuestionCardProps {
  input: AskUserQuestionInput;
  answers?: Record<string, string>;
  toolResult?: string;
  waitingForResponse?: boolean;
}

export const AskUserQuestionCard: FC<AskUserQuestionCardProps> = ({
  input,
  answers,
  toolResult: _toolResult,
  waitingForResponse = false,
}) => {
  return (
    <div className="space-y-0">
      {input.questions.map((q, idx) => {
        const userAnswer = answers?.[q.question];
        const isSkipped = userAnswer === ASK_USER_QUESTION_SKIPPED;
        const isAnswered = !!userAnswer && !isSkipped;
        const isLast = idx === input.questions.length - 1;

        return (
          <div
            key={`${q.header}-${idx}`}
            className={`flex items-start gap-2 py-1.5 ${
              !isLast ? "border-b border-emphasis-line" : ""
            }`}
          >
            {/* 状态图标 */}
            {isAnswered ? (
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-1" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 mt-1" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{q.question}</div>
              {isAnswered ? (
                <div className="mt-0.5 text-sm font-medium text-primary">
                  {userAnswer}
                  {/* 自定义答案标记：将答案按 ", " 拆分后检查每项是否均为预设选项 */}
                  {(() => {
                    const optionLabels = new Set(
                      q.options.map((opt) => opt.label),
                    );
                    const answeredLabels = userAnswer.split(", ");
                    const hasCustomLabel = answeredLabels.some(
                      (label) => !optionLabels.has(label),
                    );
                    return hasCustomLabel ? (
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal italic">
                        <Trans id="assistant.tool.ask_user_question.custom_answer" />
                      </span>
                    ) : null;
                  })()}
                </div>
              ) : isSkipped ? (
                <div className="text-xs text-muted-foreground/60 italic mt-0.5">
                  <Trans id="assistant.tool.ask_user_question.skipped" />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground/60 italic mt-0.5">
                  {waitingForResponse ? (
                    <Trans id="assistant.tool.ask_user_question.waiting" />
                  ) : (
                    <Trans id="assistant.tool.ask_user_question.unanswered" />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* toolResult 是系统级反馈，不展示给用户 */}
    </div>
  );
};
