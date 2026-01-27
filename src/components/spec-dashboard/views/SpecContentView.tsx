import type { FC } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";

interface SpecContentViewProps {
  content?: string;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SpecContentView: FC<SpecContentViewProps> = ({
  content,
  emptyMessage = "No content available",
  className = "",
  children,
}) => {
  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <div className="flex-1 overflow-y-auto min-h-0 bg-background p-6">
        <div className="max-w-3xl mx-auto">
          {content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownContent content={content} />
            </div>
          ) : (
            children || (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <p>{emptyMessage}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
