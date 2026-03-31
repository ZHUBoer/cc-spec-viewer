import { Trans, useLingui } from "@lingui/react";
import { ArrowRight, ChevronLeft, ChevronRight, Edit2, X } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

export const ASK_USER_QUESTION_SKIPPED = "__skipped__";

export const AskUserQuestionInteractive: FC<
  AskUserQuestionInteractiveProps
> = ({ questions, onSubmit, isSubmitting = false }) => {
  const { i18n } = useLingui();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [isCustomInputOpen, setIsCustomInputOpen] = useState<
    Record<string, boolean>
  >({});
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const total = questions.length;

  const stateRef = useRef({ selectedAnswers, customTexts, skippedQuestions });
  useEffect(() => {
    stateRef.current = { selectedAnswers, customTexts, skippedQuestions };
  }, [selectedAnswers, customTexts, skippedQuestions]);

  useEffect(() => {
    setFocusedIndex(0);
  }, []);

  const toggleCustomInput = (open: boolean) => {
    if (!currentQuestion) return;
    setIsCustomInputOpen((prev) => ({
      ...prev,
      [currentQuestion.question]: open,
    }));
  };

  const isCustomOpen =
    (currentQuestion && isCustomInputOpen[currentQuestion.question]) || false;

  const buildAnswersFromRef = (overrides?: {
    skipped?: Record<string, boolean>;
  }) => {
    const {
      selectedAnswers: sa,
      customTexts: ct,
      skippedQuestions: sq,
    } = stateRef.current;
    const activeSq = overrides?.skipped || sq;
    const answers: Record<string, string> = {};
    for (const q of questions) {
      const selected = sa[q.question] || [];
      const customText = ct[q.question];
      if (activeSq[q.question]) {
        answers[q.question] = ASK_USER_QUESTION_SKIPPED;
      } else if (customText?.trim()) {
        answers[q.question] = customText.trim();
      } else if (selected.length > 0) {
        answers[q.question] = selected.join(", ");
      }
    }
    return answers;
  };

  const advanceOrSubmit = (overrides?: {
    skipped?: Record<string, boolean>;
  }) => {
    if (isLastQuestion) {
      onSubmit(buildAnswersFromRef(overrides));
    } else {
      setCurrentIndex((prev) => prev + 1);
      setFocusedIndex(0);
    }
  };

  const handleOptionClick = (
    question: string,
    label: string,
    multiSelect: boolean,
  ) => {
    setSkippedQuestions((prev) => ({ ...prev, [question]: false }));
    setSelectedAnswers((prev) => {
      const current = prev[question] || [];
      if (multiSelect) {
        if (current.includes(label)) {
          return { ...prev, [question]: current.filter((l) => l !== label) };
        }
        return { ...prev, [question]: [...current, label] };
      }
      return { ...prev, [question]: [label] };
    });

    if (!multiSelect) {
      // 视觉反馈的小延迟
      setTimeout(() => {
        advanceOrSubmit();
      }, 150);
    }
  };

  const handleCustomTextChange = (question: string, text: string) => {
    setSkippedQuestions((prev) => ({ ...prev, [question]: false }));
    setCustomTexts((prev) => ({ ...prev, [question]: text }));
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    const newSkipped = {
      ...skippedQuestions,
      [currentQuestion.question]: true,
    };
    setSkippedQuestions(newSkipped);
    advanceOrSubmit({ skipped: newSkipped });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || !currentQuestion) return;

      const activeTag = document.activeElement?.tagName;
      const isInputFocused = activeTag === "INPUT" || activeTag === "TEXTAREA";
      const isWithinComponent = containerRef.current?.contains(
        document.activeElement,
      );

      // 如果焦点在其他输入框（比如全局聊天框），不进行键盘劫持
      if (isInputFocused && !isWithinComponent) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, currentQuestion.options.length),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (isInputFocused && isWithinComponent) {
          return; // 由 Input 的 onKeyDown 自己处理
        }
        e.preventDefault();
        if (focusedIndex === currentQuestion.options.length) {
          if (!isCustomOpen) {
            toggleCustomInput(true);
          } else {
            advanceOrSubmit();
          }
        } else {
          const opt = currentQuestion.options[focusedIndex];
          if (opt) {
            handleOptionClick(
              currentQuestion.question,
              opt.label,
              currentQuestion.multiSelect,
            );
          }
        }
      } else if (e.key === "Escape") {
        if (isCustomOpen) {
          e.preventDefault();
          toggleCustomInput(false);
        } else if (!isInputFocused) {
          e.preventDefault();
          handleSkip();
        }
      } else if (/^[1-9]$/.test(e.key) && !isInputFocused) {
        const num = parseInt(e.key, 10);
        if (num <= currentQuestion.options.length) {
          e.preventDefault();
          const opt = currentQuestion.options[num - 1];
          if (opt) {
            handleOptionClick(
              currentQuestion.question,
              opt.label,
              currentQuestion.multiSelect,
            );
            setFocusedIndex(num - 1);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSubmitting,
    currentQuestion,
    focusedIndex,
    isCustomOpen,
    // biome-ignore lint/correctness/useExhaustiveDependencies: Intended behavior
    advanceOrSubmit,
    // biome-ignore lint/correctness/useExhaustiveDependencies: Intended behavior
    handleOptionClick,
    // biome-ignore lint/correctness/useExhaustiveDependencies: Intended behavior
    handleSkip,
    // biome-ignore lint/correctness/useExhaustiveDependencies: Intended behavior
    toggleCustomInput,
  ]);

  if (!currentQuestion) return null;

  const currentSelected = selectedAnswers[currentQuestion.question] || [];
  const currentCustomText = customTexts[currentQuestion.question] || "";
  const currentHasAnswer =
    currentSelected.length > 0 || !!currentCustomText.trim();

  return (
    <div
      ref={containerRef}
      className="space-y-4 rounded-xl border border-border bg-card p-5 transition-all text-card-foreground"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-lg leading-tight break-words flex-1">
          {currentQuestion.header || currentQuestion.question}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={() => setCurrentIndex((c) => c - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium px-1 tabular-nums">
            {currentIndex + 1} of {total}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            disabled={currentIndex === total - 1 || isSubmitting}
            onClick={() => setCurrentIndex((c) => c + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer text-muted-foreground hover:text-destructive"
            disabled={isSubmitting}
            onClick={() => handleSkip()}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {currentQuestion.header &&
        currentQuestion.header !== currentQuestion.question && (
          <p className="text-sm text-muted-foreground">
            {currentQuestion.question}
          </p>
        )}

      <div className="space-y-2 focus:outline-none" tabIndex={-1}>
        {currentQuestion.options.map((option, optIdx) => {
          const isSelected = currentSelected.includes(option.label);
          const isFocused = focusedIndex === optIdx;

          return (
            <button
              key={`${option.label}-${optIdx}`}
              type="button"
              onClick={() =>
                handleOptionClick(
                  currentQuestion.question,
                  option.label,
                  currentQuestion.multiSelect,
                )
              }
              onMouseEnter={() => setFocusedIndex(optIdx)}
              disabled={isSubmitting}
              className={`w-full text-left p-3 rounded-lg transition-all group flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? "border-primary/20 bg-muted/35 text-primary"
                  : isFocused
                    ? "bg-muted/80 text-foreground border border-transparent"
                    : "bg-transparent hover:bg-muted/50 text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 text-xs font-medium mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-primary/12 text-primary dark:bg-primary/18 dark:text-primary"
                      : isFocused
                        ? "bg-background text-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {optIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium break-words">
                    {option.label}
                  </div>
                  {option.description && (
                    <div
                      className={`text-xs mt-1 break-words opacity-80 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`flex-shrink-0 transition-opacity ${
                  isSelected || isFocused
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              >
                <ArrowRight
                  className={`w-4 h-4 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
            </button>
          );
        })}

        <div
          className={`w-full p-3 rounded-lg transition-colors text-left flex flex-col gap-2 ${
            isCustomOpen
              ? "bg-muted/50 border border-transparent"
              : focusedIndex === currentQuestion.options.length
                ? "bg-muted/80 cursor-pointer border border-transparent text-foreground"
                : "hover:bg-muted/50 cursor-pointer text-muted-foreground hover:text-foreground border border-transparent"
          }`}
          onClick={() => {
            if (!isCustomOpen && !isSubmitting) {
              toggleCustomInput(true);
              setFocusedIndex(currentQuestion.options.length);
            }
          }}
          onKeyDown={() => {}}
          onMouseEnter={() => setFocusedIndex(currentQuestion.options.length)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 text-xs font-medium transition-colors ${
                focusedIndex === currentQuestion.options.length && !isCustomOpen
                  ? "bg-background text-foreground"
                  : "bg-transparent text-muted-foreground"
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium">
              <Trans
                id="assistant.tool.ask_user_question.other_option"
                message="Something else"
              />
            </span>
          </div>

          {isCustomOpen && (
            <div
              className="pl-9 pr-2 pb-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Textarea
                autoFocus
                value={currentCustomText}
                onChange={(e) =>
                  handleCustomTextChange(
                    currentQuestion.question,
                    e.target.value,
                  )
                }
                onKeyDown={(e) => {
                  // Cmd+Enter (macOS) 或 Ctrl+Enter (其他平台) 提交
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (currentCustomText.trim()) {
                      advanceOrSubmit();
                    }
                  }
                }}
                placeholder={i18n._({
                  id: "assistant.tool.ask_user_question.placeholder",
                  message: "Enter custom answer...",
                })}
                className="min-h-[80px] resize-y border-muted-foreground/30 bg-background text-sm focus-visible:ring-primary/40"
                disabled={isSubmitting}
              />
              <div className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between px-1">
                <span>
                  {navigator.platform.toLowerCase().includes("mac")
                    ? i18n._({
                        id: "assistant.tool.ask_user_question.submit_hint_mac",
                        message: "Press Cmd+Enter to submit",
                      })
                    : i18n._({
                        id: "assistant.tool.ask_user_question.submit_hint_other",
                        message: "Press Ctrl+Enter to submit",
                      })}
                </span>
                <button
                  type="button"
                  className="hover:text-foreground underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCustomInput(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/50">
        <div className="text-[11px] text-muted-foreground/80 hidden sm:flex items-center gap-2">
          <span>
            <span className="font-mono bg-muted/80 text-foreground/70 px-1 py-[1px] rounded">
              ↑
            </span>{" "}
            <span className="font-mono bg-muted/80 text-foreground/70 px-1 py-[1px] rounded">
              ↓
            </span>{" "}
            to navigate
          </span>
          <span>·</span>
          <span>
            <span className="font-mono bg-muted/80 text-foreground/70 px-1 py-[1px] rounded">
              ↵
            </span>{" "}
            to select
          </span>
          <span>·</span>
          <span>
            <span className="font-mono bg-muted/80 text-foreground/70 px-1.5 py-[1px] rounded">
              Esc
            </span>{" "}
            to skip
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSkip()}
            disabled={isSubmitting}
            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Trans id="assistant.tool.ask_user_question.skip" message="Skip" />
          </Button>
          {(currentQuestion.multiSelect || isCustomOpen) && (
            <Button
              size="sm"
              onClick={() => advanceOrSubmit()}
              disabled={(!currentHasAnswer && !isCustomOpen) || isSubmitting}
              className="h-8 cursor-pointer border border-primary/80 bg-primary text-xs text-primary-foreground hover:bg-primary/92"
            >
              {isSubmitting ? (
                <Trans
                  id="assistant.tool.ask_user_question.submitting"
                  message="Submitting..."
                />
              ) : isLastQuestion ? (
                <Trans
                  id="assistant.tool.ask_user_question.submit"
                  message="Submit"
                />
              ) : (
                <Trans
                  id="assistant.tool.ask_user_question.next"
                  message="Next"
                />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
