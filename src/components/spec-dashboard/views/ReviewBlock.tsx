import {
  CheckCircle2,
  Edit2,
  MessageSquare,
  MessageSquarePlus,
  Undo2,
} from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ReviewStatus = "pending" | "confirmed" | "commented";

interface ReviewBlockProps {
  id: string;
  initialStatus: ReviewStatus;
  initialContent: string;
  onConfirm: () => void;
  onUpdate: (content: string) => void;
  onAddComment: (comment: string) => void; // 新增：添加评论回调
  isReadOnly?: boolean;
  hideConfirm?: boolean;
}

export const ReviewBlock: FC<ReviewBlockProps> = ({
  // id, (unused)
  initialStatus,
  initialContent,
  onConfirm,
  onUpdate,
  onAddComment,
  isReadOnly = false,
  hideConfirm = false,
}) => {
  // Utility to strip confirmation tag
  const cleanContent = (text: string) => {
    return text
      .replace(/<!-- STATUS: CONFIRMED -->/g, "")
      .replace(/(^|\n+)✅ (逻辑已确认|确认无误).*/g, "")
      .trim();
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false); // 新增：添加评论模式
  const [comment, setComment] = useState(() => cleanContent(initialContent));
  const [userComment, setUserComment] = useState(""); // 新增：用户评论

  // Status derived from content analysis in parent, passed down
  const status = initialStatus;

  // Sync comment with initialContent (cleaned) if it changes externally
  // This ensures that if the block is updated (e.g. by Checkbox or Confirm),
  // the 'Edit' view gets the latest content without the 'Confirmed' tag.
  if (!isEditing && cleanContent(initialContent) !== comment) {
    setComment(cleanContent(initialContent));
  }

  const handleSave = () => {
    onUpdate(comment);
    setIsEditing(false);
  };

  const handleSubmitComment = () => {
    if (!userComment.trim()) return;
    onAddComment(userComment.trim());
    setUserComment("");
    setIsAddingComment(false);
  };

  const handleCheckboxChange = (lineIndex: number, checked: boolean) => {
    // Operate on the raw content, but we know checkboxes are part of the 'real' content
    const baseContent = cleanContent(initialContent);
    const lines = baseContent.split("\n");
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    if (line === undefined) return;

    if (checked) {
      lines[lineIndex] = line.replace(/\[ \]/, "[x]");
    } else {
      lines[lineIndex] = line.replace(/\[x\]/i, "[ ]");
    }
    onUpdate(lines.join("\n"));
  };

  const renderContentWithCheckboxes = (text: string) => {
    // Only render the clean content
    return cleanContent(text)
      .split("\n")
      .map((line, index) => {
        const key = `${index}-${line.substring(0, 10)}`;

        // Check for unchecked box
        if (line.match(/^(\s*[-*]?\s*)\[ \]/)) {
          return (
            <div key={key} className="flex items-start gap-2 py-1">
              <Checkbox
                id={`cb-${index}`}
                checked={false}
                onCheckedChange={(c) =>
                  handleCheckboxChange(index, c as boolean)
                }
                disabled={isReadOnly}
              />
              <label
                htmlFor={`cb-${index}`}
                className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1 whitespace-pre-wrap"
              >
                {line.replace(/^(\s*[-*]?\s*)\[ \]/, "$1").trim()}
              </label>
            </div>
          );
        }
        // Check for checked box
        if (line.match(/^(\s*[-*]?\s*)\[x\]/i)) {
          return (
            <div key={key} className="flex items-start gap-2 py-1">
              <Checkbox
                id={`cb-${index}`}
                checked={true}
                onCheckedChange={(c) =>
                  handleCheckboxChange(index, c as boolean)
                }
                disabled={isReadOnly}
              />
              <label
                htmlFor={`cb-${index}`}
                className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1 whitespace-pre-wrap text-muted-foreground line-through decoration-muted-foreground/50"
              >
                {line.replace(/^(\s*[-*]?\s*)\[x\]/i, "$1").trim()}
              </label>
            </div>
          );
        }
        // Normal line
        return (
          <div key={key} className="whitespace-pre-wrap min-h-[1.25rem]">
            {line}
          </div>
        );
      });
  };

  if (status === "confirmed") {
    // Strip the confirmation tag from display since we have the header
    const displayContent = cleanContent(initialContent);

    return (
      <div className="my-4 p-4 border-l-4 border-green-500 bg-green-500/5 rounded-r-lg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>已确认</span>
            </div>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Revert to pending/commented state by updating content without the tag
                  // Using the stripped content as the new content
                  onUpdate(displayContent);
                }}
                className="text-muted-foreground hover:text-foreground h-8 cursor-pointer"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                撤销
              </Button>
            )}
          </div>
          <div className="text-sm text-foreground/90 pl-1">
            {renderContentWithCheckboxes(displayContent)}
          </div>
        </div>
      </div>
    );
  }

  // Commented or Pending (treated similarly for content display, just different border color)
  // If hiding confirm, we just show content + edit button.

  const isPending = status === "pending";
  const borderClass = isPending
    ? "border-yellow-500 bg-yellow-500/5"
    : "border-blue-500 bg-blue-500/5";

  if (!isEditing) {
    return (
      <div
        className={cn(
          "my-4 p-4 border-l-4 rounded-r-lg transition-colors",
          borderClass,
        )}
      >
        <div className="flex flex-col gap-3">
          {/* Header / Status Line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium opacity-80">
              {isPending ? (
                <span className="text-yellow-700 dark:text-yellow-500 flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4" /> 待确认
                </span>
              ) : (
                <span className="text-blue-700 dark:text-blue-500 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 已修改/评论
                </span>
              )}
            </div>

            {!isReadOnly && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  补充 / 修改
                </Button>
                {!hideConfirm && (
                  <Button
                    size="sm"
                    onClick={onConfirm}
                    className="h-8 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    确认无误
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-sm text-foreground/90 pl-1">
            {renderContentWithCheckboxes(initialContent)}
          </div>

          {/* Comment Input */}
          {isAddingComment && (
            <div className="mt-3 space-y-2 pt-3 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                添加你的意见或建议：
              </div>
              <Textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="描述你对这部分设计的意见或修改建议..."
                className="min-h-[100px] bg-background text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingComment(false);
                    setUserComment("");
                  }}
                  className="cursor-pointer"
                >
                  取消
                </Button>
                <Button
                  className="cursor-pointer"
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!userComment.trim()}
                >
                  提交意见
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editing State
  return (
    <div
      className={cn(
        "my-4 p-4 border-l-4 rounded-r-lg transition-colors",
        borderClass,
      )}
    >
      <div className="space-y-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="请输入内容..."
          className="min-h-[120px] bg-background font-mono text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setComment(initialContent);
            }}
          >
            取消
          </Button>
          <Button className="cursor-pointer" size="sm" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};
