import { type FC, useMemo } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import { extractMarkdownToc } from "./document-utils";
import { SpecDocumentWorkbench } from "./SpecDocumentWorkbench";
import { StageIntroBanner } from "./StageIntroBanner";

interface TestsViewProps {
  changeId: string;
  content?: string;
}

export const TestsView: FC<TestsViewProps> = ({ changeId, content }) => {
  const toc = useMemo(() => extractMarkdownToc(content ?? ""), [content]);

  return (
    <SpecDocumentWorkbench
      stage="tests"
      title={changeId}
      sidebarToc={toc}
      topPanel={<StageIntroBanner stage="tests" />}
    >
      {content && content.trim().length > 0 ? (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <MarkdownContent content={content} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center text-sm italic text-muted-foreground">
          No tests content available
        </div>
      )}
    </SpecDocumentWorkbench>
  );
};
