import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Clock,
  FileText,
  PlusIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useWorkspacePanel } from "@/hooks/useWorkspacePanel";
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
  const [archivedChanges, setArchivedChanges] = useState<OpenSpecChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newProposalOpen, setNewProposalOpen] = useState(false);
  const { openSpec } = useWorkspacePanel();

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await specDashboardService.getChanges(projectId);
      setChanges(data);
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  const loadArchivedData = async () => {
    if (archivedChanges.length > 0) return;
    setArchivedLoading(true);
    try {
      const data = await specDashboardService.getArchivedChanges(projectId);
      setArchivedChanges(data);
    } catch (error) {
      console.error("Failed to load archived changes", error);
    } finally {
      setArchivedLoading(false);
    }
  };

  const toggleArchived = () => {
    if (!showArchived) {
      loadArchivedData();
    }
    setShowArchived(!showArchived);
  };

  const handleSelectChange = (change: OpenSpecChange) => {
    openSpec({
      projectId,
      changeId: change.name,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-sidebar-border p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Spec Dashboard</h2>
          <p className="text-xs text-sidebar-foreground/70">
            Manage Spec changes
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
              onClick={() => handleSelectChange(change)}
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

        <div className="pt-4 border-t border-sidebar-border mt-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 rounded-md transition-colors"
            onClick={toggleArchived}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              <span>Archived</span>
            </div>
            {showArchived ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {showArchived && (
            <div className="mt-2 space-y-1 pl-2 border-l border-sidebar-border/50 ml-2">
              {archivedLoading ? (
                <div className="text-xs text-sidebar-foreground/50 p-2">
                  Loading...
                </div>
              ) : archivedChanges.length === 0 ? (
                <div className="text-xs text-sidebar-foreground/50 p-2">
                  No archived changes
                </div>
              ) : (
                archivedChanges.map((change) => (
                  <button
                    key={change.name}
                    type="button"
                    className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent/50 text-xs text-sidebar-foreground/80 transition-colors"
                    onClick={() => handleSelectChange(change)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1">{change.name}</span>
                      <span className="text-[10px] text-sidebar-foreground/40 ml-2">
                        {new Date(change.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <NewProposalDialog
        open={newProposalOpen}
        onOpenChange={setNewProposalOpen}
      />
    </div>
  );
};
