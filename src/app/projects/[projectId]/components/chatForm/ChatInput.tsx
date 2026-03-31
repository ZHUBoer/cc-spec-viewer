import { Trans, useLingui } from "@lingui/react";
import {
  AlertCircleIcon,
  LoaderIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import {
  type FC,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Textarea } from "../../../../../components/ui/textarea";
import { useCreateSchedulerJob } from "../../../../../hooks/useScheduler";
import type {
  DocumentBlockParam,
  ImageBlockParam,
} from "../../../../../server/core/claude-code/schema";
import { useConfig } from "../../../../hooks/useConfig";
import type { CommandCompletionRef } from "./CommandCompletion";
import { getNextHandledQueuedMessageId } from "./chatInputQueuedMessage";
import { isInCompletionContext } from "./completionUtils";
import type { FileCompletionRef } from "./FileCompletion";
import { processFile } from "./fileUtils";
import { InlineCompletion } from "./InlineCompletion";
import { ModelSwitchBar } from "./ModelSwitchBar";

export interface MessageInput {
  text: string;
  images?: ImageBlockParam[];
  documents?: DocumentBlockParam[];
}

export interface ChatInputProps {
  projectId: string;
  onSubmit: (input: MessageInput) => Promise<void>;
  isPending: boolean;
  error?: Error | null;
  placeholder: string;
  buttonText: React.ReactNode;
  minHeight?: string;
  containerClassName?: string;
  disabled?: boolean;
  buttonSize?: "sm" | "default" | "lg";
  enableScheduledSend?: boolean;
  baseSessionId?: string | null;
  /**
   * 消息预处理器（middleware），在发送前拦截并处理消息内容。
   * - 返回 string：使用处理后的消息继续发送
   * - 返回 null：中止发送，保留输入内容
   */
  onBeforeSubmit?: (message: string) => Promise<string | null>;
  onModelSwitched?: () => void;
  requireConfirmModelSwitch?: boolean;
  queuedMessage?: {
    id: string;
    text: string;
  } | null;
  onQueuedMessageHandled?: (
    id: string,
    result: "success" | "aborted" | "failed",
  ) => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  projectId,
  onSubmit,
  isPending,
  error,
  placeholder,
  buttonText,
  minHeight: minHeightProp = "min-h-[64px]",
  containerClassName = "",
  disabled = false,
  buttonSize = "lg",
  enableScheduledSend = false,
  baseSessionId = null,
  onBeforeSubmit,
  onModelSwitched,
  requireConfirmModelSwitch = false,
  queuedMessage = null,
  onQueuedMessageHandled,
}) => {
  // Parse minHeight prop to get pixel value (default to 48px for 1.5 lines)
  // Supports both "200px" and Tailwind format like "min-h-[200px]"
  const parseMinHeight = (value: string): number => {
    // Try to extract pixel value using regex (handles both formats)
    const match = value.match(/(\d+)px/);
    if (match?.[1]) {
      const parsed = parseInt(match[1], 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    // Fallback to default
    return 48;
  };
  const minHeightValue = parseMinHeight(minHeightProp);
  const { i18n } = useLingui();
  const [message, setMessage] = useState("");
  // 暂时隐藏模型切换入口（ada-cli 不稳定）
  const showModelSwitch = false;
  const [attachedFiles, setAttachedFiles] = useState<
    Array<{ file: File; id: string }>
  >([]);
  const [cursorPosition, setCursorPosition] = useState<{
    relative: { top: number; left: number };
    absolute: { top: number; left: number };
  }>({ relative: { top: 0, left: 0 }, absolute: { top: 0, left: 0 } });
  const [sendMode, setSendMode] = useState<"immediate" | "scheduled">(
    "immediate",
  );
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandCompletionRef = useRef<CommandCompletionRef>(null);
  const fileCompletionRef = useRef<FileCompletionRef>(null);
  const helpId = useId();
  const { config } = useConfig();
  const createSchedulerJob = useCreateSchedulerJob();
  const handledQueuedMessageIdRef = useRef<string | null>(null);

  // Auto-resize textarea based on content
  // biome-ignore lint/correctness/useExhaustiveDependencies: message is intentionally included to trigger resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set height to scrollHeight, but respect min/max constraints
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // Maximum height in pixels (approx 5 lines)
    textarea.style.height = `${Math.max(minHeightValue, Math.min(scrollHeight, maxHeight))}px`;
  }, [message, minHeightValue]);

  // Set initial height to 1 line on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // Set initial height to minHeight value
    textarea.style.height = `${minHeightValue}px`;
  }, [minHeightValue]);

  const handleSubmit = useCallback(
    async (
      messageOverride?: string,
    ): Promise<"success" | "aborted" | "failed"> => {
      const rawMessage = messageOverride ?? message;
      if (
        (!rawMessage.trim() && attachedFiles.length === 0) ||
        isPending ||
        disabled ||
        isModelSwitching
      ) {
        return "aborted";
      }

      // 消息预处理器：在发送前拦截并处理消息（如飞书链接解析等）
      let processedMessage = rawMessage;
      if (onBeforeSubmit) {
        const result = await onBeforeSubmit(rawMessage);
        if (result === null) {
          // 预处理器返回 null 表示中止发送，保留输入内容
          return "aborted";
        }
        processedMessage = result;
      }

      const images: ImageBlockParam[] = [];
      const documents: DocumentBlockParam[] = [];

      for (const { file } of attachedFiles) {
        const result = await processFile(file);

        if (result === null) {
          continue;
        }

        if (result.type === "text") {
          documents.push({
            type: "document",
            source: {
              type: "text",
              media_type: "text/plain",
              data: result.content,
            },
          });
        } else if (result.type === "image") {
          images.push(result.block);
        } else if (result.type === "document") {
          documents.push(result.block);
        }
      }

      if (enableScheduledSend && sendMode === "scheduled") {
        // Create a scheduler job for scheduled send
        const match = scheduledTime.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
        );
        if (!match) {
          throw new Error("Invalid datetime format");
        }
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const hours = Number(match[4]);
        const minutes = Number(match[5]);
        const localDate = new Date(year, month - 1, day, hours, minutes);

        try {
          await createSchedulerJob.mutateAsync({
            name: `Scheduled message at ${scheduledTime}`,
            schedule: {
              type: "reserved",
              reservedExecutionTime: localDate.toISOString(),
            },
            message: {
              content: processedMessage,
              projectId,
              baseSessionId,
            },
            enabled: true,
          });

          toast.success(
            i18n._({
              id: "chat.scheduled_send.success",
              message: "Message scheduled successfully",
            }),
            {
              description: i18n._({
                id: "chat.scheduled_send.success_description",
                message: "You can view and manage it in the Scheduler tab",
              }),
            },
          );

          setMessage("");
          setAttachedFiles([]);
          return "success";
        } catch (error) {
          toast.error(
            i18n._({
              id: "chat.scheduled_send.failed",
              message: "Failed to schedule message",
            }),
            {
              description: error instanceof Error ? error.message : undefined,
            },
          );
          return "failed";
        }
      } else {
        // Immediate send
        try {
          await onSubmit({
            text: processedMessage,
            images: images.length > 0 ? images : undefined,
            documents: documents.length > 0 ? documents : undefined,
          });

          setMessage("");
          setAttachedFiles([]);
          return "success";
        } catch {
          return "failed";
        }
      }
    },
    [
      attachedFiles,
      baseSessionId,
      createSchedulerJob,
      disabled,
      enableScheduledSend,
      i18n,
      isModelSwitching,
      isPending,
      message,
      onBeforeSubmit,
      onSubmit,
      projectId,
      scheduledTime,
      sendMode,
    ],
  );

  useEffect(() => {
    if (!queuedMessage) {
      return;
    }
    if (handledQueuedMessageIdRef.current === queuedMessage.id) {
      return;
    }
    if (isPending || disabled || isModelSwitching) {
      return;
    }
    handledQueuedMessageIdRef.current = queuedMessage.id;
    setMessage(queuedMessage.text);
    void handleSubmit(queuedMessage.text).then((result) => {
      handledQueuedMessageIdRef.current = getNextHandledQueuedMessageId(
        handledQueuedMessageIdRef.current,
        queuedMessage.id,
        result,
      );
      onQueuedMessageHandled?.(queuedMessage.id, result);
    });
  }, [
    disabled,
    handleSubmit,
    isModelSwitching,
    isPending,
    onQueuedMessageHandled,
    queuedMessage,
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (fileCompletionRef.current?.handleKeyDown(e)) {
      return;
    }

    if (commandCompletionRef.current?.handleKeyDown(e)) {
      return;
    }

    // IME 转换中不发送
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      const enterKeyBehavior = config?.enterKeyBehavior;

      if (enterKeyBehavior === "enter-send" && !e.shiftKey && !e.metaKey) {
        // Enter: Send mode
        e.preventDefault();
        handleSubmit();
      } else if (
        enterKeyBehavior === "shift-enter-send" &&
        e.shiftKey &&
        !e.metaKey
      ) {
        // Shift+Enter: Send mode (default)
        e.preventDefault();
        handleSubmit();
      } else if (
        enterKeyBehavior === "command-enter-send" &&
        e.metaKey &&
        !e.shiftKey
      ) {
        // Command+Enter: Send mode (Mac)
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const getCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (textarea === null || container === null) return undefined;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const textAfterCursor = textarea.value.substring(cursorPos);

    const pre = document.createTextNode(textBeforeCursor);
    const post = document.createTextNode(textAfterCursor);
    const caret = document.createElement("span");
    caret.innerHTML = "&nbsp;";

    const mirrored = document.createElement("div");

    mirrored.innerHTML = "";
    mirrored.append(pre, caret, post);

    const textareaStyles = window.getComputedStyle(textarea);
    for (const property of [
      "border",
      "boxSizing",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "padding",
      "textDecoration",
      "textIndent",
      "textTransform",
      "whiteSpace",
      "wordSpacing",
      "wordWrap",
    ] as const) {
      mirrored.style[property] = textareaStyles[property];
    }

    mirrored.style.visibility = "hidden";
    container.prepend(mirrored);

    const caretRect = caret.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (mirrored.parentNode === container) {
      container.removeChild(mirrored);
    }

    return {
      relative: {
        top: caretRect.top - containerRect.top - textarea.scrollTop,
        left: caretRect.left - containerRect.left - textarea.scrollLeft,
      },
      absolute: {
        top: caretRect.top - textarea.scrollTop,
        left: caretRect.left - textarea.scrollLeft,
      },
    };
  }, []);

  const handleCommandSelect = (command: string) => {
    setMessage(command);
    textareaRef.current?.focus();
  };

  const handleFilePathSelect = (filePath: string) => {
    setMessage(filePath);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    const handleSendMessageEvent = (e: Event) => {
      const event = e as CustomEvent;
      if (
        event.detail?.projectId === projectId &&
        typeof event.detail?.message === "string"
      ) {
        if (isPending || disabled || isModelSwitching) return;
        void handleSubmit(event.detail.message);
      }
    };

    window.addEventListener("specforge:send-message", handleSendMessageEvent);

    return () => {
      window.removeEventListener(
        "specforge:send-message",
        handleSendMessageEvent,
      );
    };
  }, [projectId, isPending, disabled, isModelSwitching, handleSubmit]);

  return (
    <div className={containerClassName}>
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 dark:text-red-400 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">
            <Trans id="chat.error.send_failed" />
          </span>
        </div>
      )}

      <div className="relative group">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,box-shadow,background-color] duration-300 ring-0 group-focus-within:border-primary/30 group-focus-within:ring-1 group-focus-within:ring-primary/12">
          <div className="relative" ref={containerRef}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                if (
                  e.target.value.endsWith("@") ||
                  e.target.value.endsWith("/")
                ) {
                  const position = getCursorPosition();
                  if (position) {
                    setCursorPosition(position);
                  }
                }

                setMessage(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-5 py-4 text-base transition-all duration-200 placeholder:text-muted-foreground/50 overflow-y-auto leading-relaxed antialiased font-normal ${!message ? "select-none" : ""}`}
              style={{
                minHeight: `${minHeightValue}px`,
              }}
              disabled={isPending || disabled || isModelSwitching}
              aria-label={i18n._("Message input with completion support")}
              aria-describedby={helpId}
              aria-expanded={isInCompletionContext(message)}
              aria-haspopup="listbox"
              role="combobox"
              aria-autocomplete="list"
            />
          </div>

          {attachedFiles.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-1 flex flex-wrap gap-2 border-t border-border/50 bg-background px-5 py-3 duration-200">
              {attachedFiles.map(({ file, id }) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground/80 transition-all duration-200 hover:border-primary/20 hover:text-foreground"
                >
                  <span className="truncate max-w-[200px] font-medium">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors bg-transparent rounded-full p-0.5 hover:bg-muted cursor-pointer"
                    disabled={isPending}
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-border/50 bg-background px-5 py-3">
            {enableScheduledSend && sendMode === "scheduled" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 animate-in fade-in duration-200">
                <Label htmlFor="send-mode-mobile" className="text-xs sr-only">
                  <Trans id="chat.send_mode.label" />
                </Label>
                <Select
                  value={sendMode}
                  onValueChange={(value: "immediate" | "scheduled") =>
                    setSendMode(value)
                  }
                  disabled={isPending || disabled}
                >
                  <SelectTrigger
                    id="send-mode-mobile"
                    className="h-8 w-full border-border/60 bg-background sm:w-[140px] text-xs focus:ring-primary/20"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">
                      <Trans id="chat.send_mode.immediate" />
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <Trans id="chat.send_mode.scheduled" />
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1.5 flex-1">
                  <Label htmlFor="scheduled-time" className="text-xs sr-only">
                    <Trans id="chat.send_mode.scheduled_time" />
                  </Label>
                  <Input
                    id="scheduled-time"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isPending || disabled || isModelSwitching}
                    className="h-8 w-full border-border/60 bg-background sm:w-[180px] text-xs focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-muted-foreground/70">
                {showModelSwitch && (
                  <ModelSwitchBar
                    disabled={isPending || disabled}
                    requireConfirm={requireConfirmModelSwitch}
                    onSwitched={onModelSwitched}
                    onSwitchingChange={setIsModelSwitching}
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || disabled || isModelSwitching}
                  className="gap-2 px-2 hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 h-8 rounded-lg cursor-pointer"
                >
                  <PaperclipIcon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">
                    <Trans id="chat.attach_file" />
                  </span>
                </Button>
                {message.length > 0 && (
                  <span
                    className="text-[10px] font-medium bg-muted/50 px-2 py-0.5 rounded-full border border-border/30 transition-all duration-200"
                    id={helpId}
                  >
                    {message.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {enableScheduledSend && sendMode === "immediate" && (
                  <div className="hidden sm:flex items-center gap-2">
                    <Label
                      htmlFor="send-mode-desktop"
                      className="text-xs sr-only"
                    >
                      <Trans id="chat.send_mode.label" />
                    </Label>
                    <Select
                      value={sendMode}
                      onValueChange={(value: "immediate" | "scheduled") =>
                        setSendMode(value)
                      }
                      disabled={isPending || disabled || isModelSwitching}
                    >
                      <SelectTrigger
                        id="send-mode-desktop"
                        className="h-9 w-auto min-w-[120px] max-w-[140px] border-border/60 bg-background text-xs font-medium transition-all duration-200 hover:border-primary/20 hover:bg-muted/25 focus:ring-1 focus:ring-primary/20"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          <Trans id="chat.send_mode.immediate" />
                        </SelectItem>
                        <SelectItem value="scheduled">
                          <Trans id="chat.send_mode.scheduled" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {enableScheduledSend && sendMode === "immediate" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSendMode("scheduled")}
                    disabled={isPending || disabled || isModelSwitching}
                    className="sm:hidden gap-1.5 h-9 cursor-pointer"
                  >
                    <span className="text-xs font-medium">
                      <Trans id="chat.send_mode.scheduled" />
                    </span>
                  </Button>
                )}

                <Button
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={
                    (!message.trim() && attachedFiles.length === 0) ||
                    isPending ||
                    disabled ||
                    isModelSwitching
                  }
                  size={buttonSize}
                  className="h-9 cursor-pointer gap-2 border border-primary/80 bg-primary px-4 transition-all duration-200 hover:border-primary hover:bg-primary/92 active:scale-[0.99] sm:px-6"
                >
                  {isPending ? (
                    <>
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline font-medium">
                        <Trans id="chat.status.processing" />
                      </span>
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline font-medium">
                        {buttonText}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <InlineCompletion
          projectId={projectId}
          message={message}
          commandCompletionRef={commandCompletionRef}
          fileCompletionRef={fileCompletionRef}
          handleCommandSelect={handleCommandSelect}
          handleFileSelect={handleFilePathSelect}
          cursorPosition={cursorPosition}
        />
      </div>
    </div>
  );
};
