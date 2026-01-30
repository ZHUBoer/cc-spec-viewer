import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, List, MessageSquarePlus } from "lucide-react";
import { type FC, useMemo } from "react";
import { toast } from "sonner";

import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Button } from "@/components/ui/button";

import { specDashboardService } from "../SpecDashboardService";
import { ReviewBlock, type ReviewStatus } from "./ReviewBlock";

interface DesignReviewViewProps {
  projectId: string;
  changeId: string;
  content: string;
  onApprove?: () => void;
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
  onApprove,
  onRefine,
  readonly = false,
}) => {
  const queryClient = useQueryClient();

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
  const { parts, questionBlockIds, allConfirmed } = useMemo(() => {
    const partsArray: {
      type: "text" | "block";
      content: string | React.ReactNode;
      id?: string;
      blockContent?: string;
    }[] = [];
    const qIds: string[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let allBlocksConfirmed = true;

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

      // Check status for Global Approve
      const isConfirmed = blockContent.includes("✅");
      // If neither confirmed nor seemingly addressed (simple heuristic), block global approve
      if (!isConfirmed && !blockContent.includes("已修改") && !readonly) {
        allBlocksConfirmed = false;
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
      allConfirmed: allBlocksConfirmed,
    };
  }, [content, readonly]);

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
        // Only confirm if not already confirmed
        if (!blockContent.includes("✅")) {
          const timestamp = new Date().toLocaleString();
          const newBlock = `${blockContent}\n\n✅ 确认无误 (${timestamp})`;
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

  return (
    <div className="flex h-full bg-background animate-in fade-in duration-300 relative">
      {/* ToC Sidebar */}
      <div className="hidden lg:block w-64 border-r border-border overflow-y-auto p-4 bg-muted/5">
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
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="p-6 max-w-4xl mx-auto space-y-4 pb-24">
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
            if (blockContent.includes("✅")) {
              status = "confirmed";
            } else if (blockContent.match(/\[x\]/i)) {
              status = "pending"; // Checkboxes interaction kept pending until explicit confirm
            } else if (blockContent && !blockContent.includes("(待确认")) {
              // If content changed but no confirm tag
              status = "commented";
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
                    const newBlock = cleanContent
                      ? `${cleanContent}\n\n✅ 逻辑已确认 (${timestamp})`
                      : `✅ 逻辑已确认 (${timestamp})`;

                    handleUpdateContent(id, newBlock);
                  }}
                  onUpdate={(newContent) => {
                    handleUpdateContent(id, newContent);
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
        <div className="absolute bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-border bg-background/80 backdrop-blur-sm z-10 transition-all">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Review Status
              </span>
              <span
                className={`text-sm font-bold ${
                  allConfirmed ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {allConfirmed ? "Ready to Complete" : "Pending Confirmations"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRefine}>
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Discuss
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                disabled={!allConfirmed}
                className={
                  allConfirmed
                    ? "bg-green-600 hover:bg-green-700"
                    : "opacity-50 cursor-not-allowed"
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
