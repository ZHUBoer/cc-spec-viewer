import {
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  PlusIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { ChangeDetailDialog } from "./ChangeDetailDialog";
import { NewProposalDialog } from "./NewProposalDialog";
import {
  type OpenSpecChange,
  specDashboardService,
} from "./SpecDashboardService";

const StatusIcon = ({ status }: { status: OpenSpecChange["status"] }) => {
  switch (status) {
    case "draft":
      return <FileText className="w-4 h-4 text-slate-400" />;
    case "ready":
      return <CircleDashed className="w-4 h-4 text-blue-500" />;
    case "implementing":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "review":
      return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
    case "archived":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export const SpecSidebarPanel: FC<{ projectId: string }> = ({ projectId }) => {
  const [changes, setChanges] = useState<OpenSpecChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<OpenSpecChange | null>(
    null,
  );
  const [newProposalOpen, setNewProposalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await specDashboardService.getChanges(projectId);
      setChanges(data);
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-sidebar-border p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Spec Dashboard</h2>
          <p className="text-xs text-sidebar-foreground/70">
            Manage OpenSpec changes
          </p>
        </div>
        <button
          type="button"
          className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
          title="New Proposal"
          onClick={() => setNewProposalOpen(true)}
        >
          <PlusIcon className="w-5 h-5 text-sidebar-foreground/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center p-4 text-sm text-sidebar-foreground/50">
            Loading...
          </div>
        ) : changes.length === 0 ? (
          <div className="text-sm text-sidebar-foreground/50 text-center mt-10">
            No active changes
          </div>
        ) : (
          changes.map((change) => (
            <button
              key={change.name}
              type="button"
              className="w-full text-left p-3 rounded-lg border border-sidebar-border hover:bg-sidebar-accent/50 cursor-pointer transition-colors group"
              onClick={() => setSelectedChange(change)}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="font-medium text-sm truncate pr-2">
                  {change.name}
                </div>
                <StatusIcon status={change.status} />
              </div>
              {change.description && (
                <div className="text-xs text-sidebar-foreground/60 line-clamp-2 mb-2">
                  {change.description}
                </div>
              )}
              <div className="text-[10px] text-sidebar-foreground/40 text-right">
                {new Date(change.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))
        )}
      </div>

      <ChangeDetailDialog
        open={!!selectedChange}
        onOpenChange={(open) => !open && setSelectedChange(null)}
        change={selectedChange}
        projectId={projectId}
      />
      <NewProposalDialog
        open={newProposalOpen}
        onOpenChange={setNewProposalOpen}
      />
    </div>
  );
};
