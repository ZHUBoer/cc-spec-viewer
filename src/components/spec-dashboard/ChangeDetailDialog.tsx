import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  FileText,
  GitCompare,
  ListTodo,
  PenTool,
} from "lucide-react";
import type { FC } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "../../app/components/MarkdownContent";
import { getChangeDetails } from "../../lib/api/openspec";
import type { OpenSpecChange } from "./SpecDashboardService";

interface ChangeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  change: OpenSpecChange | null;
  projectId: string;
}

export const ChangeDetailDialog: FC<ChangeDetailDialogProps> = ({
  open,
  onOpenChange,
  change,
  projectId,
}) => {
  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["openspec", "change", projectId, change?.name],
    queryFn: () => getChangeDetails(projectId, change?.name ?? ""),
    enabled: open && !!change,
  });

  if (!change) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <span>{change.name}</span>
            <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full border bg-muted">
              {change.status}
            </span>
          </DialogTitle>
          {change.description && (
            <DialogDescription>{change.description}</DialogDescription>
          )}
        </DialogHeader>
        {!change.description && (
          <DialogDescription className="sr-only">
            Details for {change.name}
          </DialogDescription>
        )}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs
            defaultValue="proposal"
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger
                  value="proposal"
                  className="data-[state=active]:bg-muted data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-4 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Proposal
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="data-[state=active]:bg-muted data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-4 gap-2"
                >
                  <GitCompare className="w-4 h-4" />
                  Specs (Delta)
                </TabsTrigger>
                <TabsTrigger
                  value="design"
                  className="data-[state=active]:bg-muted data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-4 gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Design
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-muted data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-4 gap-2"
                >
                  <ListTodo className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/10 min-h-0">
              <TabsContent
                value="proposal"
                className="m-0 h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto bg-background p-8 rounded-lg border shadow-sm min-h-fit">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      Loading proposal...
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-40 text-red-500">
                      Error loading details: {error.message}
                    </div>
                  ) : details?.proposalContent ? (
                    <MarkdownContent content={details.proposalContent} />
                  ) : (
                    <div className="text-muted-foreground italic">
                      No proposal content available.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="specs"
                className="m-0 h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto bg-background p-8 rounded-lg border shadow-sm min-h-fit">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <GitCompare className="w-5 h-5" />
                    Spec Files
                  </h3>
                  {details?.specFiles && details.specFiles.length > 0 ? (
                    <div className="space-y-4">
                      {details.specFiles.map((file) => (
                        <Collapsible
                          key={file.name}
                          className="border rounded-md group"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors text-left font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="font-mono text-sm">
                                {file.name}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 pt-0 border-t bg-muted/5 mt-4">
                              <MarkdownContent content={file.content} />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No spec files found.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="design"
                className="m-0 h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto bg-background p-8 rounded-lg border shadow-sm min-h-fit">
                  {details?.designContent ? (
                    <MarkdownContent content={details.designContent} />
                  ) : (
                    <div className="text-muted-foreground italic">
                      No design content available.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="tasks"
                className="m-0 h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto bg-background p-8 rounded-lg border shadow-sm min-h-fit">
                  {details?.tasksContent ? (
                    <MarkdownContent content={details.tasksContent} />
                  ) : (
                    <div className="text-muted-foreground italic">
                      No tasks content available.
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
