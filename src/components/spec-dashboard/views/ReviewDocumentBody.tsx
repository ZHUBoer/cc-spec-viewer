import { CheckCircle2 } from "lucide-react";
import type { FC } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Button } from "@/components/ui/button";
import type { ReviewPart } from "./document-utils";
import { ReviewBlock, type ReviewStatus } from "./ReviewBlock";

interface ReviewDocumentBodyProps {
  parts: ReviewPart[];
  questionBlockIds: string[];
  readonly?: boolean;
  onConfirmBlock: (id: string, currentContent: string) => void;
  onUpdateBlock: (id: string, nextContent: string) => void;
  onAddComment: (id: string, currentContent: string, comment: string) => void;
  onUnifiedConfirm: () => void;
}

const inferReviewStatus = (blockContent: string): ReviewStatus => {
  if (
    blockContent.includes("<!-- STATUS: CONFIRMED -->") ||
    blockContent.includes("✅")
  ) {
    return "confirmed";
  }

  if (
    blockContent.includes("**用户意见**") ||
    (blockContent.trim() &&
      !blockContent.includes("(待确认：请审查上方内容)") &&
      !blockContent.includes("(待确认)") &&
      blockContent.replace(/\s+/g, "") !== "")
  ) {
    return "commented";
  }

  return "pending";
};

export const ReviewDocumentBody: FC<ReviewDocumentBodyProps> = ({
  parts,
  questionBlockIds,
  readonly = false,
  onConfirmBlock,
  onUpdateBlock,
  onAddComment,
  onUnifiedConfirm,
}) => {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          const textKey = `text-${index}-${part.content.length}`;

          return (
            <div
              key={textKey}
              className="prose prose-sm max-w-none dark:prose-invert"
            >
              <MarkdownContent content={part.content} />
            </div>
          );
        }

        const blockStatus = inferReviewStatus(part.blockContent);
        const isQuestion = questionBlockIds.includes(part.id);
        const isLastQuestion =
          questionBlockIds.length > 0 &&
          questionBlockIds[questionBlockIds.length - 1] === part.id;

        return (
          <div key={part.id}>
            <ReviewBlock
              id={part.id}
              initialStatus={blockStatus}
              initialContent={part.blockContent}
              isReadOnly={readonly}
              hideConfirm={isQuestion}
              onConfirm={() => onConfirmBlock(part.id, part.blockContent)}
              onUpdate={(newContent) => onUpdateBlock(part.id, newContent)}
              onAddComment={(comment) =>
                onAddComment(part.id, part.blockContent, comment)
              }
            />
            {isQuestion && isLastQuestion ? (
              <div className="my-6 flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <p className="text-sm font-medium">所有问题决策完毕？</p>
                    <p className="text-xs text-muted-foreground">
                      确认后将锁定上述问题方案
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onUnifiedConfirm}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  确认所有问题方案
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};
