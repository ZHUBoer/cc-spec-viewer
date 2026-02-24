import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitCompare,
  ListTodo,
  Loader2,
  PenTool,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  type OpenSpecChange,
  specDashboardService,
} from "./SpecDashboardService";
import { StatusBadge } from "./StatusBadge";
import { DesignReviewView } from "./views/DesignReviewView";
import { SpecContentView } from "./views/SpecContentView";
import { TasksView } from "./views/TasksView";

// Context payload passed from Sidebar
export interface SpecPanelContext {
  projectId: string;
  changeId: string;
}

interface SpecContextPanelProps {
  context: unknown;
}

type Stage = "proposal" | "specs" | "design" | "tasks" | "tests";

/** 根据 change 内容的生成状态，确定应展示的默认标签页 */
function determineDefaultStage(change: OpenSpecChange): Stage {
  if (change.tasksContent) return "tasks";
  if (change.designContent) return "design";
  return "proposal";
}

export const SpecContextPanel: FC<SpecContextPanelProps> = ({ context }) => {
  const [activeStage, setActiveStage] = useState<Stage>("proposal");
  const prevChangeIdRef = useRef<string | null>(null);

  // Safe cast and validation
  const ctx = context as SpecPanelContext;
  const isValidContext =
    ctx &&
    typeof ctx.projectId === "string" &&
    typeof ctx.changeId === "string";

  const {
    data: change,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["openspec", "change", ctx?.projectId, ctx?.changeId],
    queryFn: async () => {
      if (!isValidContext) return null;
      return specDashboardService.getChangeDetails(ctx.projectId, ctx.changeId);
    },
    enabled: isValidContext,
    // 在 implementing 状态时每 2 秒刷新一次
    refetchInterval: (query) =>
      query.state.data?.status === "implementing" ? 2000 : false,
    // 保留之前的数据，避免在刷新时显示错误页面
    placeholderData: (previousData) => previousData,
  });

  // Effect: 当 changeId 变化（包括首次加载）时，自动选择合适的默认标签页；
  // 同时处理当前标签无效的回退逻辑
  useEffect(() => {
    if (!change) return;

    // 当 changeId 变化时，自动选择合适的标签
    // 需确认 change 数据确实对应当前 changeId，避免 placeholderData 带来的竞态
    if (
      prevChangeIdRef.current !== ctx.changeId &&
      change.name === ctx.changeId
    ) {
      prevChangeIdRef.current = ctx.changeId;
      setActiveStage(determineDefaultStage(change));
      return;
    }

    // 原有逻辑：当前标签无效时回退
    const hasSpecs = !!(
      change.specsContent ||
      (change.specFiles && change.specFiles.length > 0)
    );
    const hasTests = !!change.testsContent;

    if (activeStage === "specs" && !hasSpecs) {
      setActiveStage(determineDefaultStage(change));
    } else if (activeStage === "tests" && !hasTests) {
      setActiveStage(determineDefaultStage(change));
    }
  }, [change, activeStage, ctx.changeId]);

  if (!isValidContext) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No spec context selected</p>
      </div>
    );
  }

  // 只在初始加载时显示 loading
  if (isLoading && !change) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading context...</p>
      </div>
    );
  }

  // 只在初始加载失败且没有缓存数据时显示错误
  // 由于使用了 placeholderData，即使查询失败 change 也可能保留之前的值
  // 所以只有当 change 为 null/undefined 且（有错误或不在加载中）时才显示错误
  if (!change && (error || (!isLoading && !isFetching))) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load context</p>
        {error && (
          <p className="text-sm mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </p>
        )}
      </div>
    );
  }

  // 如果有错误但之前有数据，继续显示之前的数据（后台刷新失败不影响显示）
  // change 此时应该存在（因为上面已经检查过）
  if (!change) {
    // 如果 change 仍然为 null，返回一个占位符（不应该到达这里，但为了类型安全）
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No data available</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeStage) {
      case "proposal":
        return (
          <DesignReviewView
            projectId={ctx.projectId}
            changeId={ctx.changeId}
            content={change.proposalContent || ""}
            readonly={change.status === "archived"}
            mode="proposal"
          />
        );
      case "specs":
        return (
          <div className="flex-1 overflow-y-auto min-h-0 bg-muted/5 p-4">
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Root specs.md content */}
              {change.specsContent && (
                <Collapsible
                  defaultOpen={true}
                  className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group text-left">
                    <h4 className="text-sm font-semibold flex items-center gap-2 font-mono break-all">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      {change.status === "archived"
                        ? "changes/archive"
                        : "changes"}
                      /{change.name}/specs.md
                    </h4>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 pt-0">
                      <MarkdownContent content={change.specsContent} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Individual Spec Files */}
              {change.specFiles && change.specFiles.length > 0 ? (
                <div className="space-y-3">
                  {change.specsContent && (
                    <h4 className="text-sm font-medium text-muted-foreground ml-1">
                      Detailed Specs
                    </h4>
                  )}
                  {change.specFiles.map(
                    (file: { name: string; content: string }) => (
                      <Collapsible
                        key={file.name}
                        defaultOpen={false}
                        className="border border-border/60 rounded-lg bg-card shadow-sm overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center w-full px-4 py-3 text-sm font-medium bg-muted/30 hover:bg-muted/50 transition-colors group text-left">
                          <ChevronRight className="w-4 h-4 mr-3 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                          <span className="font-mono text-xs text-secondary-foreground truncate">
                            {change.status === "archived"
                              ? "changes/archive"
                              : "changes"}
                            /{change.name}/specs/{file.name}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t border-border/60 bg-background">
                          <div className="p-4 text-xs overflow-x-auto">
                            <MarkdownContent
                              content={`\`\`\`markdown\n${file.content}\n\`\`\``}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ),
                  )}
                </div>
              ) : !change.specsContent ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <p>No spec files found</p>
                </div>
              ) : null}
            </div>
          </div>
        );
      case "design":
        return (
          <DesignReviewView
            projectId={ctx.projectId}
            changeId={ctx.changeId}
            content={change.designContent || ""}
            readonly={change.status === "archived"}
          />
        );
      case "tasks":
        return (
          <TasksView
            projectId={ctx.projectId}
            changeId={ctx.changeId}
            content={change.tasksContent || "*No tasks content*"}
            status={change.status}
          />
        );
      case "tests":
        return (
          <SpecContentView
            content={change.testsContent}
            emptyMessage="No tests content available"
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Stage Navigation */}
      <div className="flex flex-col border-b border-border bg-muted/20">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{change.name}</h3>
            <span className="text-[10px] text-muted-foreground tracking-wider font-medium">
              {activeStage}
            </span>
          </div>
          <div className="flex-shrink-0 pr-10">
            <StatusBadge status={change.status} />
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="flex px-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "proposal", icon: FileText, label: "Proposal" },
            { id: "specs", icon: GitCompare, label: "Specs" },
            { id: "design", icon: PenTool, label: "Design" },
            { id: "tasks", icon: ListTodo, label: "Tasks" },
            { id: "tests", icon: CheckCircle2, label: "Tests" },
          ]
            .filter((stage) => {
              if (stage.id === "specs") {
                return !!(
                  change.specsContent ||
                  (change.specFiles && change.specFiles.length > 0)
                );
              }
              if (stage.id === "tests") {
                return !!change.testsContent;
              }
              return true;
            })
            .map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setActiveStage(stage.id as Stage);
                    refetch();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {stage.label}
                </button>
              );
            })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-scroll min-h-0 relative">
        {renderContent()}
      </div>
    </div>
  );
};
