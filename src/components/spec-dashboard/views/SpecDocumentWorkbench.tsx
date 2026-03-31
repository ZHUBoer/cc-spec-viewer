import { List, X } from "lucide-react";
import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TocItem } from "./document-utils";

interface SpecDocumentWorkbenchProps {
  stage: "spec" | "design" | "tasks" | "specs" | "tests";
  title: string;
  sidebarToc?: TocItem[];
  topPanel?: ReactNode;
  footer?: ReactNode;
  contentKey?: string;
  children: ReactNode;
}

const scrollToHeading = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export const SpecDocumentWorkbench: FC<SpecDocumentWorkbenchProps> = ({
  stage,
  title,
  sidebarToc = [],
  topPanel,
  footer,
  contentKey,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState(
    sidebarToc[0]?.id ?? "",
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    setActiveHeadingId(sidebarToc[0]?.id ?? "");
  }, [sidebarToc]);

  useEffect(() => {
    if (sidebarToc.length === 0 || contentRef.current === null) {
      return;
    }

    const rootElement = contentRef.current;
    const headingElements = sidebarToc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headingElements.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          );

        const firstEntry = visibleEntries[0];

        if (firstEntry?.target.id) {
          setActiveHeadingId(firstEntry.target.id);
        }
      },
      {
        root: rootElement,
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const element of headingElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sidebarToc]);

  const tocLabel = useMemo(() => {
    const stageLabel =
      stage === "spec"
        ? "Spec"
        : stage === "design"
          ? "Design"
          : stage === "tasks"
            ? "Tasks"
            : stage === "specs"
              ? "Specs"
              : "Tests";
    return `${title} ${stageLabel} 目录`;
  }, [stage, title]);

  return (
    <div
      className={cn(
        "grid h-full min-h-0 bg-background",
        sidebarToc.length > 0
          ? "lg:grid-cols-[12rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_auto]"
          : "grid-cols-1 grid-rows-[minmax(0,1fr)_auto]",
      )}
    >
      {sidebarToc.length > 0 ? (
        <aside className="hidden min-h-0 overflow-y-auto border-r border-border bg-background lg:row-span-2 lg:block">
          <div className="p-3">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <List className="h-4 w-4 text-primary" />
              目录
            </div>
            <nav className="space-y-1" aria-label={tocLabel}>
              {sidebarToc.map((item) => (
                <button
                  key={item.id + item.text}
                  type="button"
                  title={item.text}
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    "block w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer",
                    activeHeadingId === item.id
                      ? "bg-muted/40 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={{ paddingLeft: `${0.5 + (item.level - 1) * 0.75}rem` }}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      ) : null}

      <div
        className={cn(
          "notranslate min-h-0 overflow-y-auto",
          sidebarToc.length > 0 && "lg:col-start-2",
        )}
        translate="no"
        ref={contentRef}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-6 pb-24 lg:px-8">
          {sidebarToc.length > 0 ? (
            <div className="lg:hidden">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => setMobileTocOpen((open) => !open)}
              >
                {mobileTocOpen ? (
                  <X className="mr-2 h-4 w-4" />
                ) : (
                  <List className="mr-2 h-4 w-4" />
                )}
                {mobileTocOpen ? "收起目录" : "查看目录"}
              </Button>
              {mobileTocOpen ? (
                <div className="mt-3 rounded-xl border border-border bg-card p-3">
                  <nav className="space-y-1" aria-label={tocLabel}>
                    {sidebarToc.map((item) => (
                      <button
                        key={item.id + item.text}
                        type="button"
                        title={item.text}
                        onClick={() => {
                          scrollToHeading(item.id);
                          setMobileTocOpen(false);
                        }}
                        className={cn(
                          "block w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer",
                          activeHeadingId === item.id
                            ? "bg-muted/40 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        style={{
                          paddingLeft: `${0.5 + (item.level - 1) * 0.75}rem`,
                        }}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              ) : null}
            </div>
          ) : null}
          {topPanel ? (
            <div
              key={`${contentKey ?? stage}-top`}
              className="flex flex-col gap-5"
            >
              {topPanel}
            </div>
          ) : null}
          <div key={`${contentKey ?? stage}-body`}>{children}</div>
        </div>
      </div>

      {footer ? (
        <div
          className={cn(
            "notranslate border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm",
            sidebarToc.length > 0 && "lg:col-start-2",
          )}
          translate="no"
        >
          <div
            key={`${contentKey ?? stage}-footer`}
            className="mx-auto max-w-4xl"
          >
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
};
