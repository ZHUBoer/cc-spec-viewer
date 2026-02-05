import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, List, RefreshCw } from "lucide-react";
import { type FC, useMemo, useRef } from "react";
import { toast } from "sonner";

import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Button } from "@/components/ui/button";

import { specDashboardService } from "../SpecDashboardService";
import { ReviewBlock, type ReviewStatus } from "./ReviewBlock";

interface DesignReviewViewProps {
  projectId: string;
  changeId: string;
  content: string;
  onRefine?: () => void;
  readonly?: boolean;
  mode?: "design" | "proposal";
}

interface ToCItem {
  id: string;
  text: string;
  level: number;
}

// Utility to generate IDs (must match MarkdownContent)
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
};

// Regex to match USER_INPUT blocks
// Captures: 1. ID, 2. Content inside
const BLOCK_REGEX =
  /<!-- USER_INPUT_START:(.*?) -->([\s\S]*?)<!-- USER_INPUT_END:\1 -->/g;

export const DesignReviewView: FC<DesignReviewViewProps> = ({
  projectId,
  changeId,
  content,
  readonly = false,
  mode = "design",
}) => {
  const queryClient = useQueryClient();
  const isProcessingRef = useRef(false);

  const isProposal = mode === "proposal";
  const fileName = isProposal ? "proposal.md" : "design.md";
  const confirmTag = isProposal
    ? "<!-- PROPOSAL_FINAL_CONFIRMATION: true -->"
    : "<!-- DESIGN_FINAL_CONFIRMATION: true -->";

  // Extract ToC
  const toc = useMemo(() => {
    const lines = content.split("\n");
    const items: ToCItem[] = [];
    // Regex for markdown headers #, ##, ### (Limit to depth 3)
    const headerRegex = /^(#{1,3})\s+(.+)$/;

    lines.forEach((line) => {
      const match = line.match(headerRegex);
      if (match?.[1] && match[2]) {
        items.push({
          level: match[1].length,
          text: match[2].trim(),
          id: generateId(match[2].trim()),
        });
      }
    });
    return items;
  }, [content]);

  // Parse content and detect question blocks
  const { parts, questionBlockIds } = useMemo(() => {
    const partsArray: {
      type: "text" | "block";
      content: string | React.ReactNode;
      id?: string;
      blockContent?: string;
    }[] = [];
    const qIds: string[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    BLOCK_REGEX.lastIndex = 0;

    // biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
    while ((match = BLOCK_REGEX.exec(content)) !== null) {
      if (match.index > lastIndex) {
        partsArray.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }

      const id = match[1] || "";
      const blockContent = match[2]?.trim() || "";

      if (!id) continue;

      // Detect if this is a "Question/Decision" block
      const isQuestion =
        /\[\s*\]|\[x\]/i.test(blockContent) ||
        blockContent.includes("待决策问题");
      if (isQuestion) {
        qIds.push(id);
      }

      partsArray.push({
        type: "block",
        id,
        blockContent,
        content: match[0],
      });

      lastIndex = BLOCK_REGEX.lastIndex;
    }

    if (lastIndex < content.length) {
      partsArray.push({ type: "text", content: content.substring(lastIndex) });
    }

    return {
      parts: partsArray,
      questionBlockIds: qIds,
    };
  }, [content]);

  const handleUpdateContent = async (id: string, newBlockContent: string) => {
    try {
      // Re-find block in current fresh content
      const currentRegex = new RegExp(
        `<!-- USER_INPUT_START:${id} -->([\\s\\S]*?)<!-- USER_INPUT_END:${id} -->`,
      );
      const currentMatch = currentRegex.exec(content);

      if (!currentMatch) {
        console.error("Block not found during update");
        toast.error("Block not found. Please refresh.");
        return;
      }

      const newFileContent = content.replace(
        currentMatch[0],
        `<!-- USER_INPUT_START:${id} -->\n\n${newBlockContent}\n\n<!-- USER_INPUT_END:${id} -->`,
      );

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        fileName,
        newFileContent,
      );

      // Optimistic update handled by refetch currently
      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });
      toast.success(`${isProposal ? "Proposal" : "Design"} updated`);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Update failed");
    }
  };

  const handleUnifiedConfirm = async () => {
    // Confirm all unconfirmed question blocks
    let newFullContent = content;
    let updateCount = 0;

    for (const qId of questionBlockIds) {
      const regex = new RegExp(
        `<!-- USER_INPUT_START:${qId} -->([\\s\\S]*?)<!-- USER_INPUT_END:${qId} -->`,
      );
      const match = regex.exec(newFullContent);
      if (match?.[0] && match[2]) {
        const blockContent = match[2].trim();
        // Only confirm if not already confirmed (Check metadata OR legacy)
        if (
          !blockContent.includes("<!-- STATUS: CONFIRMED -->") &&
          !blockContent.includes("✅")
        ) {
          const timestamp = new Date().toLocaleString();
          // Append metadata tag
          const newBlock = `${blockContent}\n\n✅ 确认无误 (${timestamp})\n<!-- STATUS: CONFIRMED -->`;
          const replacement = `<!-- USER_INPUT_START:${qId} -->\n\n${newBlock}\n\n<!-- USER_INPUT_END:${qId} -->`;
          newFullContent = newFullContent.replace(match[0], replacement);
          updateCount++;
        }
      }
    }

    if (updateCount > 0) {
      try {
        await specDashboardService.updateChangeFile(
          projectId,
          changeId,
          fileName,
          newFullContent,
        );
        await queryClient.invalidateQueries({
          queryKey: ["openspec", "change", projectId, changeId],
        });
        toast.success(`Confirmed ${updateCount} items`);
      } catch (e) {
        console.error("Batch confirm failed", e);
        toast.error("Failed to batch confirm");
      }
    } else {
      toast.info("All questions are already confirmed");
    }
  };

  // 重新生成
  const handleRegenerate = async () => {
    if (isProcessingRef.current) return;
    try {
      isProcessingRef.current = true;
      const fileLabel = isProposal ? "proposal.md" : "design.md";
      const message = `我已经在 ${fileLabel} 中添加了一些意见和修改建议。必须仔细阅读我的意见，理解我的意图，然后重新生成 ${fileLabel}。重点关注标记为 "**用户意见**" 的部分，确保新的内容充分考虑了这些反馈。直接修改 ${fileLabel} 文件，不要创建新的文件。`;

      await navigator.clipboard.writeText(message);
      toast.success(
        "提示词已复制！请前往左侧【会话列表】，选择刚才的会话，粘贴并发送。",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
      toast.error("复制失败，请手动复制");
    } finally {
      isProcessingRef.current = false;
    }
  };

  // 确认并生成下一步
  const handleConfirm = async () => {
    if (isProcessingRef.current) return;
    try {
      isProcessingRef.current = true;

      // 1. 添加或更新最终确认标记
      const timeTagPrefix = "<!-- CONFIRMED_AT: ";

      let updatedContent = content;

      // 移除旧的确认标记（如果有）
      if (updatedContent.includes(confirmTag)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${confirmTag}\\s*`, "g"),
          "",
        );
      }
      if (updatedContent.includes(timeTagPrefix)) {
        updatedContent = updatedContent.replace(
          /<!-- CONFIRMED_AT: .*? -->\s*/g,
          "",
        );
      }

      // 追加新的标记
      updatedContent =
        updatedContent.trim() +
        "\n\n" +
        confirmTag +
        "\n" +
        timeTagPrefix +
        new Date().toISOString() +
        " -->";

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        fileName,
        updatedContent,
      );

      // 2. 复制提示词
      let message = "";
      if (isProposal) {
        message = `Proposal 已确认。按照 artifact 的构建要求，根据 proposal.md 生成 design.md。`;
      } else {
        message = `设计已确认。按照 artifact 的构建要求，根据 design.md 生成 tasks.md。`;
      }

      await navigator.clipboard.writeText(message);

      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });

      toast.success(
        `${isProposal ? "Proposal" : "设计"}已确认！提示词已复制。请前往左侧【会话列表】，选择刚才的会话，粘贴并发送以继续。`,
        {
          duration: 6000,
        },
      );
    } catch (error) {
      console.error("Failed to confirm", error);
      toast.error("确认失败");
    } finally {
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="flex h-full bg-background animate-in fade-in duration-300 relative">
      {/* ToC Sidebar */}
      <div className="hidden lg:block w-48 border-r border-border overflow-y-auto p-2 bg-muted/5">
        <div className="font-semibold mb-4 flex items-center gap-2 text-primary">
          <List className="w-4 h-4" /> 目录
        </div>
        <nav className="space-y-1">
          {toc.map((item) => (
            <a
              key={item.id + item.text}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="block text-sm py-1 px-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground truncate transition-colors cursor-pointer"
              style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
              title={item.text}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0 relative mb-40">
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          {/* Header */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {isProposal ? "Proposal Review Mode" : "Design Review Mode"}
            </h4>
            <p className="text-sm text-foreground/80">
              请确认每一项内容。待决策问题请统一确认。所有段落确认后方可完成评审。
            </p>
          </div>

          {!content || content.trim() === "" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground italic">
              <MarkdownContent
                content={`*No ${isProposal ? "proposal" : "design"} content*`}
              />
            </div>
          ) : (
            parts.map((part, idx) => {
              if (part.type === "text") {
                // Create a relatively stable key using index and partial content hash/length
                const textKey = `text-${idx}-${(part.content as string).length}`;
                return (
                  <div
                    key={textKey}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  >
                    <MarkdownContent content={part.content as string} />
                  </div>
                );
              }

              // Interactive Block
              // Ensure ID is defined, otherwise fallback (should not happen due to previous logic)
              const id = part.id || `unknown-${idx}`;
              const blockContent = part.blockContent as string;

              // Status inference logic
              let status: ReviewStatus = "pending";
              if (
                blockContent.includes("<!-- STATUS: CONFIRMED -->") ||
                blockContent.includes("✅")
              ) {
                status = "confirmed";
              } else if (
                blockContent.includes("**用户意见**") ||
                (blockContent.trim() &&
                  !blockContent.includes("(待确认：请审查上方内容)") &&
                  !blockContent.includes("(待确认)") &&
                  blockContent.replace(/\s+/g, "") !== "")
              ) {
                // 用户已添加内容或意见
                status = "commented";
              } else if (blockContent.match(/\[x\]/i)) {
                // 复选框勾选也算作用户交互，但仍是 pending 直到显式确认
                status = "pending";
              }

              const isQuestion = questionBlockIds.includes(id);

              return (
                <div key={id}>
                  <ReviewBlock
                    id={id}
                    initialStatus={status}
                    initialContent={blockContent}
                    isReadOnly={readonly}
                    hideConfirm={isQuestion}
                    onConfirm={() => {
                      const timestamp = new Date().toLocaleString();
                      // Strip the placeholder text if present
                      const cleanContent = blockContent
                        .replace(/\(待确认：请审查上方内容\)/g, "")
                        .trim();

                      // If content becomes empty after strip, we just have the tag.
                      // If there was user content, we keep it.
                      // Append metadata tag
                      const newBlock = cleanContent
                        ? `${cleanContent}\n\n✅ 逻辑已确认 (${timestamp})\n<!-- STATUS: CONFIRMED -->`
                        : `✅ 逻辑已确认 (${timestamp})\n<!-- STATUS: CONFIRMED -->`;

                      handleUpdateContent(id, newBlock);
                    }}
                    onUpdate={(newContent) => {
                      handleUpdateContent(id, newContent);
                    }}
                    onAddComment={(comment) => {
                      // 在块内容后追加用户意见
                      const cleanContent = blockContent
                        .replace(/\(待确认：请审查上方内容\)/g, "")
                        .trim();
                      const newBlock = cleanContent
                        ? `${cleanContent}\n\n**用户意见**：${comment}`
                        : `**用户意见**：${comment}`;
                      handleUpdateContent(id, newBlock);
                    }}
                  />
                  {/* Insert Unified Confirm Button after the LAST question block */}
                  {isQuestion &&
                    questionBlockIds.length > 0 &&
                    questionBlockIds[questionBlockIds.length - 1] === id && (
                      <div className="my-6 p-4 border border-dashed border-primary/30 rounded-lg bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <div>
                            <p className="text-sm font-medium">
                              所有问题决策完毕？
                            </p>
                            <p className="text-xs text-muted-foreground">
                              确认后将锁定上述问题方案
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleUnifiedConfirm}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          确认所有问题方案
                        </Button>
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Global Actions */}
      {!readonly && content && content.trim().length > 0 && (
        <>
          {/* Completed state: show decision point */}
          <div className="absolute bottom-0 left-48 right-0 p-4 border-t border-border bg-background shadow-lg z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-3 flex items-center gap-2">
                <h4 className="font-semibold text-base">
                  若完成{isProposal ? " Proposal " : " Design "}
                  评审，请选择下一步
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Option 1: Regenerate (Always available now) */}
                <Button
                  className="flex-1 cursor-pointer"
                  variant="outline"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成{isProposal ? " Proposal" : " Design"}
                </Button>

                {/* Option 2: Confirm and Generate Next Step */}
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={handleConfirm}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isProposal
                    ? "确认 proposal 并生成 design"
                    : "设计无误，生成任务"}
                </Button>
              </div>

              {/* Hint */}
              <div className="mt-3 text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  为保证上下文连续性，点击按钮后将<b>复制提示词</b>
                  ，请在左侧列表选择<b>原会话</b>继续对话。
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
