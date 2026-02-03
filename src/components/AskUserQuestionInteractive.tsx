import { Trans } from "@lingui/react";
import { Check, HelpCircle } from "lucide-react";
import { type FC, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export interface AskUserQuestionInteractiveProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export const AskUserQuestionInteractive: FC<
  AskUserQuestionInteractiveProps
> = ({ questions, onSubmit, isSubmitting = false }) => {
  // 状态：每个问题的答案（question -> 选中的 labels）
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});

  // 自由文本输入状态
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

  const handleOptionClick = (
    question: string,
    label: string,
    multiSelect: boolean,
  ) => {
    setSelectedAnswers((prev) => {
      const current = prev[question] || [];

      if (multiSelect) {
        // 多选：切换选中状态
        if (current.includes(label)) {
          return { ...prev, [question]: current.filter((l) => l !== label) };
        }
        return { ...prev, [question]: [...current, label] };
      }
      // 单选：直接设置
      return { ...prev, [question]: [label] };
    });
  };

  const handleCustomTextChange = (question: string, text: string) => {
    setCustomTexts((prev) => ({ ...prev, [question]: text }));
  };

  const handleSubmit = () => {
    // 构建 answers: Record<string, string>
    const answers: Record<string, string> = {};

    for (const q of questions) {
      const selected = selectedAnswers[q.question] || [];
      const customText = customTexts[q.question];

      // 优先使用选中的选项，如果有自定义文本则使用自定义
      if (customText?.trim()) {
        answers[q.question] = customText.trim();
      } else if (selected.length > 0) {
        answers[q.question] = selected.join(", ");
      }
      // 如果都没有，不添加到 answers（允许跳过问题）
    }

    onSubmit(answers);
  };

  // 检查是否所有问题都已回答
  const allAnswered = questions.every((q) => {
    const selected = selectedAnswers[q.question] || [];
    const customText = customTexts[q.question];
    return selected.length > 0 || customText?.trim();
  });

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const selected = selectedAnswers[q.question] || [];
        const customText = customTexts[q.question] || "";

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

              {/* Hint */}
              <div className="text-xs text-muted-foreground">
                {q.multiSelect ? (
                  <Trans id="assistant.tool.ask_user_question.hint_multi" />
                ) : (
                  <Trans id="assistant.tool.ask_user_question.hint_single" />
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = selected.includes(option.label);

                  return (
                    <button
                      type="button"
                      key={`${option.label}-${optIdx}`}
                      onClick={() =>
                        handleOptionClick(
                          q.question,
                          option.label,
                          q.multiSelect,
                        )
                      }
                      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-500 bg-purple-100 dark:border-purple-500 dark:bg-purple-900/50 shadow-sm"
                          : "border-purple-200 bg-white dark:border-purple-800 dark:bg-purple-950/10 hover:border-purple-400 hover:shadow-sm"
                      }`}
                      disabled={isSubmitting}
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
                    </button>
                  );
                })}

                {/* Other (自定义输入) */}
                <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/10 p-3">
                  <Label
                    htmlFor={`custom-${q.header}-${idx}`}
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    <Trans id="assistant.tool.ask_user_question.other_option" />
                  </Label>
                  <Input
                    id={`custom-${q.header}-${idx}`}
                    type="text"
                    value={customText}
                    onChange={(e) =>
                      handleCustomTextChange(q.question, e.target.value)
                    }
                    placeholder={String(
                      <Trans id="assistant.tool.ask_user_question.other_placeholder" />,
                    )}
                    className="text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 cursor-pointer"
        >
          {isSubmitting ? (
            <Trans id="assistant.tool.ask_user_question.submitting" />
          ) : (
            <Trans id="assistant.tool.ask_user_question.submit" />
          )}
        </Button>
      </div>
    </div>
  );
};
