import { Trans } from "@lingui/react";
import { Check, HelpCircle } from "lucide-react";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  answers?: Record<string, string>; // question -> answer text (from toolUseResult)
  toolResult?: string; // tool_result 确认消息
}

export const AskUserQuestionCard: FC<AskUserQuestionCardProps> = ({
  input,
  answers,
  toolResult,
}) => {
  return (
    <div className="space-y-4">
      {input.questions.map((q, idx) => {
        const userAnswer = answers?.[q.question];
        // 答案处理：多选用逗号分隔，单选保持原样
        const answerLabels = userAnswer
          ? q.multiSelect
            ? userAnswer.split(", ").map((a) => a.trim())
            : [userAnswer]
          : [];

        return (
          <Card
            key={`${q.header}-${idx}`}
            className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20 p-4"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <Badge
                  variant="outline"
                  className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                >
                  {q.header}
                </Badge>
                {q.multiSelect && (
                  <Badge
                    variant="secondary"
                    className="text-xs text-muted-foreground"
                  >
                    <Trans id="assistant.tool.ask_user_question.multi_select" />
                  </Badge>
                )}
              </div>

              {/* Question */}
              <div className="text-sm font-medium text-foreground">
                {q.question}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = answerLabels.includes(option.label);

                  return (
                    <div
                      key={`${option.label}-${optIdx}`}
                      className={`rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? "border-purple-500 bg-purple-100/50 dark:border-purple-500 dark:bg-purple-900/30"
                          : "border-purple-200 bg-white dark:border-purple-800 dark:bg-purple-950/10"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isSelected && (
                          <Check className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium ${
                              isSelected
                                ? "text-purple-700 dark:text-purple-300"
                                : "text-foreground"
                            }`}
                          >
                            {option.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User Answer Summary */}
              {userAnswer && (
                <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                  <div className="text-xs font-medium text-muted-foreground">
                    <Trans id="assistant.tool.ask_user_question.user_selected" />
                    :
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-1">
                    {userAnswer}
                  </div>

                  {/* 如果包含自由文本（不在选项中的答案） */}
                  {answerLabels.some(
                    (label) => !q.options.some((opt) => opt.label === label),
                  ) && (
                    <div className="text-xs text-muted-foreground italic mt-1">
                      <Trans id="assistant.tool.ask_user_question.custom_answer" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Tool Result 确认消息 */}
      {toolResult && (
        <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/10 rounded p-2 border border-purple-200 dark:border-purple-800">
          {toolResult}
        </div>
      )}
    </div>
  );
};
