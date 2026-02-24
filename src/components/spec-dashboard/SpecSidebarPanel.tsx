import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Clock,
  FileText,
  Layers,
  PlusIcon,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { useWorkspacePanel } from "@/hooks/useWorkspacePanel";
import { useSpecForgeInitialization } from "./hooks/useSpecForgeInitialization";
import { NewProposalDialog } from "./NewProposalDialog";
import { OpenSpecSetupPanel } from "./OpenSpecSetupPanel";
import {
  ProfileConfigDialog,
  type ProfileFormData,
} from "./ProfileConfigDialog";
import {
  type EnvironmentStatus,
  type OpenSpecChange,
  specDashboardService,
} from "./SpecDashboardService";

const StatusIcon = ({ status }: { status: OpenSpecChange["status"] }) => {
  switch (status) {
    case "draft":
      return <FileText className="w-4 h-4 text-slate-400" />;
    case "designing":
    case "design-confirmed":
    case "task-planning":
      return <CircleDashed className="w-4 h-4 text-blue-500" />;
    case "implementing":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "completed":
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
  const [showChanges, setShowChanges] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [newProposalOpen, setNewProposalOpen] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentStatus | null>(
    null,
  );
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [profileConfig, setProfileConfig] = useState<ProfileFormData | null>(
    null,
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const { openSpec } = useWorkspacePanel();
  const { handlePostInitialization } = useSpecForgeInitialization(projectId);

  // 加载环境状态
  const loadEnvironment = useCallback(async () => {
    if (!projectId) return;
    try {
      const envData = await specDashboardService.getEnvironment(projectId);
      setEnvironment(envData);
      // 如果未配置，自动打开初始化弹窗
      // 如果已配置，确保弹窗关闭
      if (
        envData.scenario !== "S5_CONFIGURED" &&
        envData.recommendedAction !== "none"
      ) {
        setInitDialogOpen(true);
      } else {
        setInitDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to load environment", err);
    }
  }, [projectId]);

  // 打开初始化弹窗
  const handleOpenInitDialog = useCallback(async () => {
    setInitDialogOpen(true);
    setProfileLoading(true);
    try {
      const config =
        await specDashboardService.getProjectProfileConfig(projectId);
      if (config) {
        setProfileConfig(config);
      } else {
        // 没有已保存配置时，使用空配置
        setProfileConfig({
          infra_catalog: {
            mcp_server_providers: {},
            mcp_tool_definitions: {
              overview: { description: "", tools: [] },
              search: { description: "", tools: [] },
              specifications: { description: "", tools: [] },
            },
          },
        });
      }
    } catch (err) {
      console.error("Failed to load profile config", err);
      // 即使加载失败也使用空配置
      setProfileConfig({
        infra_catalog: {
          mcp_server_providers: {},
          mcp_tool_definitions: {
            overview: { description: "", tools: [] },
            search: { description: "", tools: [] },
            specifications: { description: "", tools: [] },
          },
        },
      });
    } finally {
      setProfileLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        const [changesData] = await Promise.all([
          specDashboardService.getChanges(projectId),
          loadEnvironment(),
        ]);
        setChanges(changesData);
      } catch (err) {
        console.error("Failed to load spec dashboard data", err);
        setChanges([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId, loadEnvironment]);

  // 监听来自其他组件的初始化弹窗打开事件
  useEffect(() => {
    const handleOpenInitDialogEvent = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        handleOpenInitDialog();
      }
    };

    window.addEventListener(
      "specforge:open-init-dialog",
      handleOpenInitDialogEvent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "specforge:open-init-dialog",
        handleOpenInitDialogEvent as EventListener,
      );
    };
  }, [projectId, handleOpenInitDialog]);

  // 监听配置初始化完成事件，刷新 environment 状态
  useEffect(() => {
    const handleInitComplete = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        loadEnvironment();
      }
    };
    window.addEventListener(
      "specforge:init-complete",
      handleInitComplete as EventListener,
    );
    return () => {
      window.removeEventListener(
        "specforge:init-complete",
        handleInitComplete as EventListener,
      );
    };
  }, [projectId, loadEnvironment]);

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

  // 保存 Profile 并初始化
  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!environment) return;
    setProfileSaving(true);
    try {
      const result = await specDashboardService.initialize(projectId, {
        scenario: environment.scenario,
        force: true,
        profile: {
          displayName: "Custom Profile",
          infra_catalog: data.infra_catalog,
        },
      });

      if (result.success) {
        // 更新 profileConfig 状态，使用保存的数据
        setProfileConfig(data);
        setInitDialogOpen(false);
        // 等待文件系统状态更新，并重试加载环境状态
        // 初始化完成后，环境检查需要重新读取文件系统，可能需要一些时间
        let retries = 3;
        let envData: EnvironmentStatus | null = null;
        while (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          try {
            envData = await specDashboardService.getEnvironment(projectId);
            // 如果状态已经变成 S5_CONFIGURED，说明初始化成功
            if (envData.scenario === "S5_CONFIGURED") {
              break;
            }
          } catch (err) {
            console.error("Failed to load environment", err);
          }
          retries--;
        }
        // 更新环境状态
        if (envData) {
          setEnvironment(envData);
          setInitDialogOpen(false);
        } else {
          // 如果重试失败，仍然尝试加载一次
          await loadEnvironment();
        }
        // 刷新 changes 列表
        await specDashboardService.getChanges(projectId).then(setChanges);
        // 使用 Hook 处理通用的后处理逻辑
        await handlePostInitialization();
      } else {
        throw new Error(`初始化失败: ${result.errors.length} 个错误`);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
      throw err;
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - 与系统其他面板一致 */}
      <div className="border-sidebar-border p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Spec Dashboard</h2>
          <p className="text-xs text-sidebar-foreground/70">
            Manage Spec changes
          </p>
        </div>
        <button
          type="button"
          className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer"
          title="New Proposal"
          onClick={() => setNewProposalOpen(true)}
        >
          <PlusIcon className="w-5 h-5 text-sidebar-foreground/70" />
        </button>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 配置区段 */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-sidebar-foreground">
            外接能力配置
          </h3>
          <OpenSpecSetupPanel
            projectId={projectId}
            onSetupComplete={() => {
              // 刷新 changes 列表
              specDashboardService.getChanges(projectId).then(setChanges);
            }}
          />
        </div>

        {/* Changes 区段 */}
        <div className="space-y-3">
          <button
            type="button"
            className="flex items-center justify-between w-full text-sm text-sidebar-foreground hover:text-sidebar-foreground/80 transition-colors cursor-pointer"
            onClick={() => setShowChanges(!showChanges)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-medium">Changes</span>
              {!loading && changes.length > 0 && (
                <span className="text-xs text-sidebar-foreground/50 bg-sidebar-accent/50 px-1.5 py-0.5 rounded-full leading-none">
                  {changes.length}
                </span>
              )}
            </div>
            {showChanges ? (
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
            )}
          </button>

          {showChanges && (
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-sm text-sidebar-foreground/50">
                  Loading...
                </div>
              ) : changes.length === 0 ? (
                <div className="text-sm text-sidebar-foreground/50 text-center py-6">
                  No active changes
                </div>
              ) : (
                changes.map((change) => (
                  <button
                    key={change.name}
                    type="button"
                    className="w-full text-left p-3 rounded-lg border border-sidebar-border hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectChange(change)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {change.name}
                      </span>
                      <StatusIcon status={change.status} />
                    </div>
                    {change.description && (
                      <div className="text-xs text-sidebar-foreground/60 line-clamp-2 mb-1.5">
                        {change.description}
                      </div>
                    )}
                    <div className="text-xs text-sidebar-foreground/40 text-right">
                      {new Date(change.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Archived 区段 */}
        <div className="space-y-3">
          <button
            type="button"
            className="flex items-center justify-between w-full text-sm text-sidebar-foreground hover:text-sidebar-foreground/80 transition-colors cursor-pointer"
            onClick={toggleArchived}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              <span className="font-medium">Archived</span>
              {archivedChanges.length > 0 && (
                <span className="text-xs text-sidebar-foreground/50 bg-sidebar-accent/50 px-1.5 py-0.5 rounded-full leading-none">
                  {archivedChanges.length}
                </span>
              )}
            </div>
            {showArchived ? (
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
            )}
          </button>

          {showArchived && (
            <div className="space-y-1">
              {archivedLoading ? (
                <div className="text-sm text-sidebar-foreground/50 text-center py-4">
                  Loading...
                </div>
              ) : archivedChanges.length === 0 ? (
                <div className="text-sm text-sidebar-foreground/50 text-center py-4">
                  No archived changes
                </div>
              ) : (
                archivedChanges.map((change) => (
                  <button
                    key={change.name}
                    type="button"
                    className="w-full text-left p-2.5 rounded-md hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectChange(change)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{change.name}</span>
                      <span className="text-xs text-sidebar-foreground/40 shrink-0">
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

      {/* 强制初始化弹窗 */}
      {environment && environment.scenario !== "S5_CONFIGURED" && (
        <ProfileConfigDialog
          open={initDialogOpen}
          onClose={() => setInitDialogOpen(false)}
          initialData={profileConfig}
          loading={profileLoading}
          onSave={handleSaveProfile}
          saving={profileSaving}
        />
      )}
    </div>
  );
};
