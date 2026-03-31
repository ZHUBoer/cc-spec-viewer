import type { FC } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import { cn } from "@/lib/utils";

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
    <div className={cn("h-full overflow-y-auto bg-background", className)}>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="max-w-none">
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
