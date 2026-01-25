import { FileText, GitCompare, ListTodo, PenTool } from "lucide-react";
import type { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "../../app/components/MarkdownContent";
import type { OpenSpecChange } from "./SpecDashboardService";

interface ChangeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  change: OpenSpecChange | null;
}

export const ChangeDetailDialog: FC<ChangeDetailDialogProps> = ({
  open,
  onOpenChange,
  change,
}) => {
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

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="proposal" className="flex-1 flex flex-col">
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

            <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
              <TabsContent value="proposal" className="m-0 h-full">
                <div className="max-w-4xl mx-auto bg-background p-8 rounded-lg border shadow-sm min-h-full">
                  {change.proposalContent ? (
                    <MarkdownContent content={change.proposalContent} />
                  ) : (
                    <div className="text-muted-foreground italic">
                      No proposal content available.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="m-0 h-full">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Spec Diff Viewer Placeholder
                </div>
              </TabsContent>

              <TabsContent value="design" className="m-0 h-full">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Design Doc Viewer Placeholder
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="m-0 h-full">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Tasks Checklist Placeholder
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
