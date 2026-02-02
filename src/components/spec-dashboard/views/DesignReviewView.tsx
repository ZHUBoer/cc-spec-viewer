import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, List, RefreshCw } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";

import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { honoClient } from "@/lib/api/client";

import { specDashboardService } from "../SpecDashboardService";
import { ReviewBlock, type ReviewStatus } from "./ReviewBlock";

interface DesignReviewViewProps {
  projectId: string;
  changeId: string;
  content: string;
  onRefine?: () => void;
  readonly?: boolean;
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
  onRefine,
  readonly = false,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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
  const { parts, questionBlockIds, blockStats } = useMemo(() => {
    const partsArray: {
      type: "text" | "block";
      content: string | React.ReactNode;
      id?: string;
      blockContent?: string;
    }[] = [];
    const qIds: string[] = [];

    // 统计块状态
    const stats = {
      total: 0,
      pending: 0,
      commented: 0,
      confirmed: 0,
      withOpinion: 0,
    };

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

      stats.total++;

      // Detect if this is a "Question/Decision" block
      const isQuestion =
        /\[\s*\]|\[x\]/i.test(blockContent) ||
        blockContent.includes("待决策问题");
      if (isQuestion) {
        qIds.push(id);
      }

      // Check status for statistics
      const isConfirmed =
        blockContent.includes("<!-- STATUS: CONFIRMED -->") ||
        blockContent.includes("✅");

      // 判断是否是用户添加了意见或修改：
      // 1. 包含用户意见标记
      // 2. 或者内容不为空，且不是占位符文本
      const hasOpinionMark = blockContent.includes("**用户意见**");
      if (hasOpinionMark) {
        stats.withOpinion++;
      }

      const hasUserContent =
        hasOpinionMark ||
        (blockContent.trim() &&
          !blockContent.includes("(待确认：请审查上方内容)") &&
          !blockContent.includes("(待确认)") &&
          blockContent.replace(/\s+/g, "") !== ""); // 不是纯空白

      if (isConfirmed) {
        stats.confirmed++;
      } else if (hasUserContent) {
        stats.commented++;
      } else {
        stats.pending++;
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
      blockStats: stats,
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
        "design.md",
        newFileContent,
      );

      // Optimistic update handled by refetch currently
      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });
      toast.success("Design updated");
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
          "design.md",
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

  // 重新生成设计
  const handleRegenerateDesign = async () => {
    try {
      setIsProcessing(true);
      const message = `我已经在 design.md 中添加了一些意见和修改建议。请仔细阅读我的评论，理解我的意图，然后重新生成 design.md。

重点关注标记为 "**用户意见**" 的部分，确保新的设计充分考虑了这些反馈。`;

      const response = await honoClient.api.cc["session-processes"].$post({
        json: {
          projectId,
          input: { text: message },
        },
      });

      const data = await response.json();

      if ("error" in data) {
        throw new Error(data.error);
      }

      toast.success("正在重新生成设计文档...");

      // 导航到会话页面
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId,
        },
        search: {
          sessionId: data.sessionProcess.sessionId,
        },
      });
    } catch (error) {
      console.error("Failed to regenerate design", error);
      toast.error("重新生成设计失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // 确认设计并生成任务
  const handleConfirmDesignAndGenerateTasks = async () => {
    try {
      setIsProcessing(true);

      // 1. 添加最终确认标记
      const updatedContent =
        content +
        "\n\n<!-- DESIGN_FINAL_CONFIRMATION: true -->" +
        "\n<!-- CONFIRMED_AT: " +
        new Date().toISOString() +
        " -->";

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "design.md",
        updatedContent,
      );

      // 2. 生成任务列表
      const message = `设计已确认。请根据 design.md 生成详细的实现任务列表（tasks.md）。`;

      const response = await honoClient.api.cc["session-processes"].$post({
        json: {
          projectId,
          input: { text: message },
        },
      });

      const data = await response.json();

      if ("error" in data) {
        throw new Error(data.error);
      }

      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });

      toast.success("设计已确认，正在生成任务列表...");

      // 导航到会话页面
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId,
        },
        search: {
          sessionId: data.sessionProcess.sessionId,
        },
      });
    } catch (error) {
      console.error("Failed to confirm design", error);
      toast.error("确认设计失败");
    } finally {
      setIsProcessing(false);
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
              className="block text-sm py-1 px-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground truncate transition-colors"
              style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
              title={item.text}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0 relative mb-42">
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          {/* Header */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Design Review Mode
            </h4>
            <p className="text-sm text-foreground/80">
              请确认每一项内容。待决策问题请统一确认。所有段落确认后方可完成评审。
            </p>
          </div>

          {/* Progress Statistics */}
          {blockStats.total > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-3">评审进度</h4>
              <div className="flex gap-6 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">待处理：</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-500">
                    {blockStats.pending}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">已添加意见：</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-500">
                    {blockStats.commented}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">已确认：</span>
                  <span className="font-semibold text-green-600 dark:text-green-500">
                    {blockStats.confirmed}
                  </span>
                </div>
              </div>
              <Progress
                value={
                  ((blockStats.confirmed + blockStats.commented) /
                    blockStats.total) *
                  100
                }
                className="h-2"
              />
            </Card>
          )}

          {parts.map((part, idx) => {
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
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        确认所有问题方案
                      </Button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Global Actions */}
      {!readonly && (
        <>
          {/* Completed state: show decision point */}
          <div className="absolute bottom-0 left-48 right-0 p-4 border-t border-border bg-background shadow-lg z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h4 className="font-semibold text-base">
                  设计评审完成 - 请选择下一步
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Option 1: Regenerate Design (Always available now) */}
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleRegenerateDesign}
                  disabled={isProcessing}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isProcessing ? "处理中..." : "🔄 重新生成设计"}
                </Button>

                {/* Option 2: Confirm Design and Generate Tasks */}
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmDesignAndGenerateTasks}
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isProcessing ? "处理中..." : "✅ 设计无误，生成任务"}
                </Button>
              </div>

              {/* Hint */}
              <div className="mt-3 text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  design.md 是与 Claude
                  对齐认知的关键环节。如有疑问或需调整，建议选择"重新生成设计"进行迭代。
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
