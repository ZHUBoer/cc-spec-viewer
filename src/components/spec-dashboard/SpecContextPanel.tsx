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
import { type FC, useState } from "react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { specDashboardService } from "./SpecDashboardService";
import { DesignReviewView } from "./views/DesignReviewView";
import { SpecContentView } from "./views/SpecContentView";

// Context payload passed from Sidebar
export interface SpecPanelContext {
  projectId: string;
  changeId: string;
}

interface SpecContextPanelProps {
  context: unknown;
}

type Stage = "proposal" | "specs" | "design" | "tasks" | "tests";

export const SpecContextPanel: FC<SpecContextPanelProps> = ({ context }) => {
  const [activeStage, setActiveStage] = useState<Stage>("design"); // Default to design as per UX focus

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
  } = useQuery({
    queryKey: ["openspec", "change", ctx?.projectId, ctx?.changeId],
    queryFn: async () => {
      if (!isValidContext) return null;
      return specDashboardService.getChangeDetails(ctx.projectId, ctx.changeId);
    },
    enabled: isValidContext,
  });

  if (!isValidContext) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No spec context selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading context...</p>
      </div>
    );
  }

  if (error || !change) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load context</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeStage) {
      case "proposal":
        return (
          <SpecContentView
            content={change.proposalContent}
            emptyMessage="No proposal content available"
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
                          <div className="p-4 text-xs max-h-[60vh] overflow-y-auto overflow-x-auto">
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
            content={change.designContent || "*No design content*"}
            readonly={change.status === "archived"}
          />
        );
      case "tasks":
        return (
          <SpecContentView
            content={change.tasksContent}
            emptyMessage="No tasks content available"
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
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-sm truncate">{change.name}</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {change.status} • {activeStage}
            </span>
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
          ].map((stage) => {
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
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
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {renderContent()}
      </div>
    </div>
  );
};
