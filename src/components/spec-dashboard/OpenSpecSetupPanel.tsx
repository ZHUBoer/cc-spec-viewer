import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Settings2,
  Terminal,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSpecForgeInitialization } from "./hooks/useSpecForgeInitialization";
import {
  ProfileConfigDialog,
  type ProfileFormData,
} from "./ProfileConfigDialog";
import {
  type BuiltInProfile,
  type EnvironmentStatus,
  type ProfileLoadWarning,
  type ProjectProfileConfig,
  type ScenarioType,
  specDashboardService,
} from "./SpecDashboardService";
import type { ProfileInfraCatalogSchema } from "./schemas";

type ProfileInfraCatalog = z.infer<typeof ProfileInfraCatalogSchema>;

// ============================================================================
// 场景描述映射
// ============================================================================

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  S1_NEW: "全新项目",
  S2_OPENSPEC_ONLY: "纯 OpenSpec 项目",
  S3_CLAUDE_ONLY: "纯 .claude 项目",
  S4_BOTH_NON_SPECFORGE: "已有配置（非 SpecForge）",
  S5_CONFIGURED: "已配置",
  S6_PARTIAL: "部分配置",
};

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  S1_NEW: "text-green-500",
  S2_OPENSPEC_ONLY: "text-blue-500",
  S3_CLAUDE_ONLY: "text-purple-500",
  S4_BOTH_NON_SPECFORGE: "text-yellow-500",
  S5_CONFIGURED: "text-emerald-500",
  S6_PARTIAL: "text-orange-500",
};

// ============================================================================
// Sub Components
// ============================================================================

// ============================================================================
// Sub Components
// ============================================================================

const StatusIndicator: FC<{ installed: boolean; label: string }> = ({
  installed,
  label,
}) => (
  <div className="flex items-center gap-2">
    {installed ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-500" />
    )}
    <span className="text-sm">{label}</span>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const OpenSpecSetupPanel: FC<{
  projectId: string;
  onSetupComplete?: () => void;
}> = ({ projectId, onSetupComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentStatus | null>(
    null,
  );
  const [profiles, setProfiles] = useState<BuiltInProfile[]>([]);
  const [_warnings, setWarnings] = useState<ProfileLoadWarning[]>([]);
  const [reinitializing, setReinitializing] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileConfig, setProfileConfig] =
    useState<ProjectProfileConfig | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initResult, _setInitResult] = useState<{
    success: boolean;
    message: string;
    warnings?: string[];
  } | null>(null);
  const { handlePostInitialization } = useSpecForgeInitialization(projectId);

  // 加载环境状态和 Profile 列表
  const loadData = useCallback(async () => {
    if (!projectId) {
      setError("未选择项目");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [envData, profilesData] = await Promise.all([
        specDashboardService.getEnvironment(projectId),
        specDashboardService.getProfiles(projectId),
      ]);
      setEnvironment(envData);
      setProfiles(profilesData.profiles);
      setWarnings(profilesData.warnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 监听配置初始化完成事件，刷新 environment 状态
  useEffect(() => {
    const handleInitComplete = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        loadData();
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
  }, [projectId, loadData]);

  // 打开 Profile 编辑弹窗
  const handleOpenProfileDialog = async () => {
    setProfileDialogOpen(true);
    setProfileLoading(true);
    try {
      const config =
        await specDashboardService.getProjectProfileConfig(projectId);
      if (config) {
        // 将 ProjectProfileConfig 转换为 ProfileFormData（只保留 infra_catalog）
        setProfileConfig({
          displayName: config.displayName,
          infra_catalog: config.infra_catalog,
        });
      } else {
        // 没有已保存配置时，尝试用当前 profile 匹配内置列表
        const matched = profiles.find(
          (p) => p.id === environment?.specforgeConfig?.profile,
        );
        if (matched) {
          setProfileConfig({
            displayName: matched.displayName,
            infra_catalog: matched.infra_catalog,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载 Profile 配置失败");
      setProfileDialogOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // 保存 Profile 编辑并重新初始化
  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!environment) return;
    setProfileSaving(true);
    setError(null);

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
        setProfileConfig({
          displayName: "Custom Profile",
          infra_catalog: data.infra_catalog,
        });
        setProfileDialogOpen(false);
        await loadData();
        // 使用 Hook 处理通用的后处理逻辑
        await handlePostInitialization({
          onSuccess: onSetupComplete,
        });
      } else {
        setError(`更新失败: ${result.errors.length} 个错误`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存配置失败");
    } finally {
      setProfileSaving(false);
    }
  };

  // 重新初始化配置（S5_CONFIGURED 状态下使用）
  const handleReinitialize = async () => {
    if (!environment?.specforgeConfig) return;

    setReinitializing(true);
    setError(null);

    try {
      // 优先从已保存的项目配置中读取
      let profileToUse: {
        displayName: string;
        infra_catalog: ProfileInfraCatalog;
      } | null = null;

      const savedConfig =
        await specDashboardService.getProjectProfileConfig(projectId);
      if (savedConfig) {
        // 使用已保存的项目配置
        profileToUse = {
          displayName: savedConfig.displayName,
          infra_catalog: savedConfig.infra_catalog,
        };
      } else {
        // 如果没有已保存配置，尝试从内置列表中找到匹配的
        const currentProfile = profiles.find(
          (p) => p.id === environment.specforgeConfig?.profile,
        );
        if (currentProfile) {
          profileToUse = {
            displayName: currentProfile.displayName,
            infra_catalog: currentProfile.infra_catalog,
          };
        }
      }

      if (!profileToUse) {
        setError("未找到当前 Profile 配置，请先通过编辑配置保存后再重新初始化");
        setReinitializing(false);
        return;
      }

      const result = await specDashboardService.initialize(projectId, {
        scenario: environment.scenario,
        force: true,
        profile: profileToUse,
      });

      if (result.success) {
        await loadData();
        // 使用 Hook 处理通用的后处理逻辑
        await handlePostInitialization({
          onSuccess: onSetupComplete,
        });
      } else {
        setError(`更新失败: ${result.errors.length} 个错误`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "重新初始化失败");
    } finally {
      setReinitializing(false);
    }
  };

  // 加载配置数据（用于导出）
  const loadProfileConfigForExport = useCallback(async () => {
    try {
      const config =
        await specDashboardService.getProjectProfileConfig(projectId);
      if (config) {
        setProfileConfig({
          displayName: config.displayName,
          infra_catalog: config.infra_catalog,
        });
      } else {
        // 没有已保存配置时，尝试用当前 profile 匹配内置列表
        const matched = profiles.find(
          (p) => p.id === environment?.specforgeConfig?.profile,
        );
        if (matched) {
          setProfileConfig({
            displayName: matched.displayName,
            infra_catalog: matched.infra_catalog,
          });
        } else {
          // 如果都没有，设置为空配置
          setProfileConfig(null);
        }
      }
    } catch (err) {
      console.error("Failed to load profile config for export", err);
      setProfileConfig(null);
    }
  }, [projectId, profiles, environment]);

  // 打开导出配置弹窗
  const handleOpenExportDialog = useCallback(async () => {
    // 先加载配置数据
    await loadProfileConfigForExport();
    setShowExportDialog(true);
  }, [loadProfileConfigForExport]);

  // 导出配置为 JSON 字符串
  const getExportJson = useCallback(() => {
    if (!profileConfig) {
      return JSON.stringify({ infra_catalog: {} }, null, 2);
    }
    // 将 ProjectProfileConfig 转换为 ProfileFormData 格式
    const exportData = {
      infra_catalog: profileConfig.infra_catalog,
    };
    return JSON.stringify(exportData, null, 2);
  }, [profileConfig]);

  // 复制到剪贴板
  const handleCopyToClipboard = useCallback(async () => {
    try {
      const jsonString = getExportJson();
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("配置已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
      toast.error("复制失败，请手动复制");
    }
  }, [getExportJson]);

  // 保存为文件
  const handleSaveAsFile = useCallback(() => {
    try {
      const jsonString = getExportJson();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `specforge-profile-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("配置已保存为文件");
    } catch (err) {
      console.error("Failed to save file", err);
      toast.error("保存文件失败");
    }
  }, [getExportJson]);

  // CLI 安装
  const handleInstallCli = async (type: "global" | "project") => {
    setError(null);
    try {
      if (type === "global") {
        await specDashboardService.installCliGlobal(projectId);
      } else {
        await specDashboardService.installCliProject(projectId);
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CLI 安装失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-sidebar-foreground/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-md transition-colors cursor-pointer"
          onClick={loadData}
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    );
  }

  if (!environment) {
    return null;
  }

  // S5_CONFIGURED: 已完整配置（或部分配置有错误）
  if (environment.scenario === "S5_CONFIGURED") {
    return (
      <div className="space-y-3">
        {/* 配置状态 + 初始化时间 */}
        <div className="flex items-center justify-between">
          {!environment.isConfigCorrupted ? (
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Check className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">已配置</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">配置异常</span>
            </div>
          )}
          {environment.specforgeConfig && (
            <span className="text-xs text-sidebar-foreground/50">
              {new Date(
                environment.specforgeConfig.initializedAt,
              ).toLocaleString()}
            </span>
          )}
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenProfileDialog}
            className="flex-1 min-w-0 px-3 py-1.5 text-xs whitespace-nowrap bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 shrink-0" />
            编辑配置
          </button>
          <button
            type="button"
            onClick={handleReinitialize}
            disabled={reinitializing}
            className="flex-1 min-w-0 px-3 py-1.5 text-xs whitespace-nowrap bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {reinitializing ? (
              <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            )}
            {reinitializing ? "更新中..." : "重新初始化"}
          </button>
          <button
            type="button"
            onClick={handleOpenExportDialog}
            className="shrink-0 px-2 py-1.5 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground rounded-md transition-colors flex items-center justify-center cursor-pointer"
            title="导出配置"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profile 编辑弹窗 */}
        <ProfileConfigDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          initialData={
            profileConfig
              ? { infra_catalog: profileConfig.infra_catalog }
              : null
          }
          loading={profileLoading}
          onSave={handleSaveProfile}
          saving={profileSaving}
        />

        {/* 导出配置弹窗 */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-[640px] max-h-[85vh] flex flex-col p-0 bg-sidebar border-sidebar-border">
            {/* 标题栏 */}
            <DialogHeader className="px-5 py-3.5 border-b border-sidebar-border shrink-0">
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                <Download className="w-4.5 h-4.5 text-primary" />
                导出配置
              </DialogTitle>
            </DialogHeader>

            {/* JSON 内容区域 */}
            <div className="flex-1 overflow-y-auto px-5 py-4 shrink min-h-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-sidebar-foreground/70">
                    配置 JSON 内容
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 rounded-md transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          复制
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsFile}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 rounded-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      保存为文件
                    </button>
                  </div>
                </div>
                <div className="bg-sidebar-accent/10 border border-sidebar-border/50 rounded-lg p-4">
                  <pre className="text-xs font-mono text-sidebar-foreground/90 whitespace-pre-wrap wrap-break-word overflow-x-auto">
                    {getExportJson()}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 配置错误列表 */}
        {environment.isConfigCorrupted && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-amber-500">
              检测到以下问题：
            </div>
            <ul className="text-xs text-sidebar-foreground/70 space-y-1 list-disc list-inside">
              {environment.configErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            {/* 修复按钮 */}
            <button
              type="button"
              onClick={() => {
                // TODO: 实现修复逻辑
                console.log("执行配置修复");
              }}
              className="w-full mt-2 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
            >
              修复配置
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 提示信息 */}
      <div>
        <p className="text-sm text-sidebar-foreground/70">
          检测到项目状态，可一键配置 SpecForge
        </p>
      </div>

      {/* 场景状态 */}
      <div className="p-3 bg-sidebar-accent/20 rounded-lg border border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-sidebar-foreground/60">当前场景</span>
          <span
            className={`text-xs font-medium ${SCENARIO_COLORS[environment.scenario]}`}
          >
            {SCENARIO_LABELS[environment.scenario]}
          </span>
        </div>
        <p className="text-xs text-sidebar-foreground/80">
          {environment.scenarioDescription}
        </p>
      </div>

      {/* CLI 状态 */}
      <div className="space-y-2">
        <StatusIndicator
          installed={environment.cliInstalled}
          label={
            environment.cliInstalled
              ? `OpenSpec CLI v${environment.cliVersion}${
                  environment.cliInstallType
                    ? ` (${environment.cliInstallType})`
                    : ""
                }`
              : "OpenSpec CLI 未安装"
          }
        />

        {!environment.cliInstalled && (
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-md transition-colors cursor-pointer"
              onClick={() => handleInstallCli("global")}
            >
              <Terminal className="w-3.5 h-3.5" />
              全局安装
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sidebar-accent/50 hover:bg-sidebar-accent/80 rounded-md transition-colors cursor-pointer"
              onClick={() => handleInstallCli("project")}
            >
              <Download className="w-3.5 h-3.5" />
              项目安装
            </button>
          </div>
        )}
      </div>

      {/* 缺失项目 */}
      {(environment.missingSpecforgeSkills.length > 0 ||
        environment.missingMcpServers.length > 0) && (
        <div className="text-xs space-y-1">
          {environment.missingSpecforgeSkills.length > 0 && (
            <div className="text-yellow-600">
              缺少 Skills: {environment.missingSpecforgeSkills.join(", ")}
            </div>
          )}
          {environment.missingMcpServers.length > 0 && (
            <div className="text-yellow-600">
              缺少 MCP 服务: {environment.missingMcpServers.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {environment.recommendedAction !== "none" && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1.5">
                  需要初始化配置
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  在使用 SpecForge 功能之前，请先完成项目配置初始化
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  // 触发侧边栏打开初始化弹窗
                  window.dispatchEvent(
                    new CustomEvent("specforge:open-init-dialog", {
                      detail: { projectId },
                    }),
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30 rounded-md transition-colors cursor-pointer shadow-sm"
              >
                <Settings2 className="w-4 h-4" />
                <span>立即初始化</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 初始化结果 */}
      {initResult && (
        <div className="space-y-2">
          <div
            className={`p-2 rounded-md text-xs ${
              initResult.success
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {initResult.message}
          </div>
          {initResult.warnings && initResult.warnings.length > 0 && (
            <div className="p-2 rounded-md text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 space-y-1">
              {initResult.warnings.map((warning) => (
                <div key={warning} className="whitespace-pre-wrap">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      {environment.recommendedAction !== "none" && (
        <>
          {/* S1_NEW 场景下 CLI 未安装的警告 */}
          {environment.scenario === "S1_NEW" && !environment.cliInstalled && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-xs text-yellow-700">
                  <div className="font-medium mb-1">
                    需要先安装 OpenSpec CLI
                  </div>
                  <div className="text-yellow-600">
                    全新项目需要先安装 CLI 来初始化 OpenSpec
                    标准结构，然后再注入 SpecForge
                    增强配置。请使用上方的"全局安装"或"项目安装"按钮。
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 初始化按钮已移除，改为在侧边栏显示 */}
        </>
      )}
    </div>
  );
};
