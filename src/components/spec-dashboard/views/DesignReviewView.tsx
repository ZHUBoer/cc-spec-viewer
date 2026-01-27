import { CheckCircle2, MessageSquarePlus } from "lucide-react";
import type { FC } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Button } from "@/components/ui/button";

interface DesignReviewViewProps {
  content: string;
  onApprove?: () => void;
  onRefine?: () => void;
  readonly?: boolean;
}

export const DesignReviewView: FC<DesignReviewViewProps> = ({
  content,
  onApprove,
  onRefine,
  readonly = false,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 bg-background p-6">
        <div className="max-w-3xl mx-auto">
          {/* Context Header */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Design Review Required
            </h4>
            <p className="text-sm text-foreground/80">
              请查看下面的技术设计。任务生成需要您的批准才能继续。
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownContent content={content} />
          </div>
        </div>
      </div>

      {!readonly && (
        <div className="p-4 border-t border-border bg-muted/10 sticky bottom-0">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            <Button variant="outline" size="sm" onClick={onRefine}>
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Discuss / Refine
            </Button>
            <Button size="sm" onClick={onApprove}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Design
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
