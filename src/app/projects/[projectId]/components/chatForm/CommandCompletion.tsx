import { useLingui } from "@lingui/react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, TerminalIcon } from "lucide-react";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../../../../../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "../../../../../components/ui/collapsible";
import { claudeCommandsQuery } from "../../../../../lib/api/queries";
import { cn } from "../../../../../lib/utils";

type CommandInfo = {
  name: string;
  description: string | null;
  argumentHint: string | null;
};

type CommandCompletionProps = {
  projectId: string;
  inputValue: string;
  onCommandSelect: (command: string) => void;
  className?: string;
};

export type CommandCompletionRef = {
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
};

export const CommandCompletion = forwardRef<
  CommandCompletionRef,
  CommandCompletionProps
>(({ projectId, inputValue, onCommandSelect, className }, ref) => {
  const { i18n } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 检查是否与现有命令重复
  const { data: commandData } = useQuery({
    queryKey: claudeCommandsQuery(projectId).queryKey,
    queryFn: claudeCommandsQuery(projectId).queryFn,
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });

  // 记忆化的命令过滤
  const { shouldShowCompletion, filteredCommands } = useMemo(() => {
    const allCommands: CommandInfo[] = [
      ...(commandData?.defaultCommands || []),
      ...(commandData?.globalCommands || []),
      ...(commandData?.projectCommands || []),
      ...(commandData?.globalSkills || []),
      ...(commandData?.projectSkills || []),
    ];

    const shouldShow = inputValue.startsWith("/");
    const searchTerm = shouldShow ? inputValue.slice(1).toLowerCase() : "";

    const filtered = shouldShow
      ? allCommands.filter(
          (cmd) =>
            cmd.name.toLowerCase().includes(searchTerm) ||
            cmd.description?.toLowerCase().includes(searchTerm),
        )
      : [];

    return { shouldShowCompletion: shouldShow, filteredCommands: filtered };
  }, [commandData, inputValue]);

  // 显示状态的推导（删除useEffect）
  const shouldBeOpen = shouldShowCompletion && filteredCommands.length > 0;

  // 状态变更时的重置处理
  if (isOpen !== shouldBeOpen) {
    setIsOpen(shouldBeOpen);
    setSelectedIndex(-1);
  }

  // 记忆化的命令选择处理
  const handleCommandSelect = useCallback(
    (command: CommandInfo) => {
      // Append argumentHint as placeholder if exists
      const hint = command.argumentHint ? ` ${command.argumentHint}` : "";
      onCommandSelect(`/${command.name}${hint} `);
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onCommandSelect],
  );

  // 滚动处理
  const scrollToSelected = useCallback((index: number) => {
    if (index >= 0 && listRef.current) {
      // 直接搜索按钮元素
      const buttons = listRef.current.querySelectorAll('button[role="option"]');
      const selectedButton = buttons[index] as HTMLElement;
      if (selectedButton) {
        selectedButton.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, []);

  // 记忆化的键盘导航处理
  const handleKeyboardNavigation = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!isOpen || filteredCommands.length === 0) return false;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev < filteredCommands.length - 1 ? prev + 1 : 0;
            // 在下一帧执行滚动
            requestAnimationFrame(() => scrollToSelected(newIndex));
            return newIndex;
          });
          return true;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : filteredCommands.length - 1;
            // 在下一帧执行滚动
            requestAnimationFrame(() => scrollToSelected(newIndex));
            return newIndex;
          });
          return true;
        case "Enter":
        case "Tab":
          if (selectedIndex >= 0 && selectedIndex < filteredCommands.length) {
            e.preventDefault();
            const selectedCommand = filteredCommands[selectedIndex];
            if (selectedCommand) {
              handleCommandSelect(selectedCommand);
            }
            return true;
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          return true;
      }
      return false;
    },
    [
      isOpen,
      filteredCommands.length,
      selectedIndex,
      handleCommandSelect,
      scrollToSelected,
      filteredCommands,
    ],
  );

  // 使用useEffect设置外部点击处理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 使用useImperativeHandle公开键盘处理器
  useImperativeHandle(
    ref,
    () => ({
      handleKeyDown: handleKeyboardNavigation,
    }),
    [handleKeyboardNavigation],
  );

  if (!shouldShowCompletion || filteredCommands.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div
            ref={listRef}
            className="absolute z-50 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-[0_16px_40px_-28px_rgba(17,32,47,0.35)]"
            style={{ height: "15rem" }}
            role="listbox"
            aria-label={i18n._("Available commands")}
          >
            <div className="h-full overflow-y-auto">
              {filteredCommands.length > 0 && (
                <div className="p-1.5">
                  <div
                    className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 mb-1 flex items-center gap-2"
                    role="presentation"
                  >
                    <TerminalIcon className="w-3.5 h-3.5" />
                    Available Commands / Skills ({filteredCommands.length})
                  </div>
                  {filteredCommands.map((command, index) => (
                    <Button
                      key={command.name}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-mono text-sm h-auto min-h-9 px-3 py-2 min-w-0 transition-colors duration-150 cursor-pointer",
                        index === selectedIndex
                          ? "border border-primary/20 bg-muted/30 text-foreground"
                          : "hover:bg-accent/50",
                      )}
                      onClick={() => handleCommandSelect(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      role="option"
                      aria-selected={index === selectedIndex}
                      aria-label={`Command: /${command.name}`}
                      title={command.description || `/${command.name}`}
                    >
                      <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="text-muted-foreground flex-shrink-0">
                            /
                          </span>
                          <span className="font-medium truncate">
                            {command.name}
                          </span>
                          {command.argumentHint && (
                            <span className="text-muted-foreground/60 text-xs truncate">
                              {command.argumentHint}
                            </span>
                          )}
                        </div>
                        {command.description && (
                          <span className="text-muted-foreground/70 text-xs pl-0 truncate w-full">
                            {command.description}
                          </span>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <CheckIcon className="w-3.5 h-3.5 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
