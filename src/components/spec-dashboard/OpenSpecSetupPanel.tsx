import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  Loader2,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import {
  type BuiltInProfile,
  type EnvironmentStatus,
  type ScenarioType,
  specDashboardService,
} from "./SpecDashboardService";

// ============================================================================
// 场景描述映射
// ============================================================================

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  S1_NEW: "全新项目",
  S2_OPENSPEC_ONLY: "纯 OpenSpec 项目",
  S3_CLAUDE_ONLY: "纯 .claude 项目",
  S4_BOTH_NON_SPECFORGE: "已有配置（非 SpecForge）",
  S5_CONFIGURED: "SpecForge 已配置",
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

const ACTION_LABELS: Record<string, string> = {
  full_init: "完整初始化",
  incremental_inject: "增量注入",
  reconfigure: "重新配置",
  repair: "修复缺失",
  none: "无需操作",
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

const ProfileSelector: FC<{
  profiles: BuiltInProfile[];
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ profiles, selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  const selectedProfile =
    selected === "custom"
      ? {
          displayName: "自定义配置 (JSON)",
          description: "手动输入 Profile JSON",
        }
      : profiles.find((p) => p.id === selected);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 border border-sidebar-border rounded-md bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm truncate">
          {selectedProfile?.displayName || "选择 Profile..."}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-sidebar border border-sidebar-border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors cursor-pointer ${
                profile.id === selected ? "bg-sidebar-accent" : ""
              }`}
              onClick={() => {
                onSelect(profile.id);
                setOpen(false);
              }}
            >
              <div className="font-medium">{profile.displayName}</div>
              <div className="text-xs text-sidebar-foreground/60">
                {profile.description}
              </div>
            </button>
          ))}
          {/* 自定义选项 */}
          <button
            type="button"
            className={`w-full text-left px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors cursor-pointer ${
              selected === "custom" ? "bg-sidebar-accent" : ""
            }`}
            onClick={() => {
              onSelect("custom");
              setOpen(false);
            }}
          >
            <div className="font-medium">自定义配置 (JSON)</div>
            <div className="text-xs text-sidebar-foreground/60">
              手动输入完整的 Profile JSON 配置
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

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
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [customJson, setCustomJson] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 加载环境状态和 Profile 列表
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [envData, profilesData] = await Promise.all([
        specDashboardService.getEnvironment(projectId),
        specDashboardService.getProfiles(projectId),
      ]);
      setEnvironment(envData);
      setProfiles(profilesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 自动选择第一个 Profile，并确保选中项有效
  useEffect(() => {
    if (profiles.length === 0) return;

    const firstProfile = profiles[0];
    // 检查当前选中项是否有效（存在于列表中或是 custom）
    const isCustom = selectedProfile === "custom";
    const exists = profiles.some((p) => p.id === selectedProfile);

    // 如果未选中，或选中项无效，则重置为第一个
    if (firstProfile && (!selectedProfile || (!isCustom && !exists))) {
      setSelectedProfile(firstProfile.id);
    }
  }, [profiles, selectedProfile]);

  // 执行初始化
  const handleInitialize = async () => {
    if (!environment || !selectedProfile) return;

    setInitializing(true);
    setInitResult(null);
    setError(null);

    try {
      let finalProfile: BuiltInProfile;

      if (selectedProfile === "custom") {
        try {
          const parsed = JSON.parse(customJson);
          if (!parsed.infra_catalog) {
            throw new Error("JSON 缺少 infra_catalog 字段");
          }
          finalProfile = {
            id: "custom",
            displayName: parsed.displayName || "Custom Profile",
            description: parsed.description || "User defined profile",
            infra_catalog: parsed.infra_catalog,
          };
        } catch (e) {
          throw new Error(
            `JSON 解析失败: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      } else {
        const found = profiles.find((p) => p.id === selectedProfile);
        if (!found) {
          throw new Error("Profile not found");
        }
        finalProfile = found;
      }

      const result = await specDashboardService.initialize(projectId, {
        scenario: environment.scenario,
        profile: {
          displayName: finalProfile.displayName,
          description: finalProfile.description || "Custom Profile",
          infra_catalog: finalProfile.infra_catalog,
        },
      });

      if (result.success) {
        setInitResult({
          success: true,
          message: `成功创建 ${result.created.length} 个文件`,
        });
        // 刷新环境状态
        await loadData();
        onSetupComplete?.();
      } else {
        setInitResult({
          success: false,
          message: `部分失败: ${result.errors.length} 个错误`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "初始化失败");
    } finally {
      setInitializing(false);
    }
  };

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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-sidebar-foreground/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-red-500 mb-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
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

  // S5_CONFIGURED: 已完整配置
  if (environment.scenario === "S5_CONFIGURED") {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <Check className="w-5 h-5" />
          <span className="font-medium">SpecForge 已配置</span>
        </div>
        {environment.specforgeConfig && (
          <div className="text-xs text-sidebar-foreground/60 space-y-1">
            <div>Profile: {environment.specforgeConfig.profile}</div>
            <div>版本: {environment.specforgeConfig.version}</div>
            <div>
              初始化时间:{" "}
              {new Date(
                environment.specforgeConfig.initializedAt,
              ).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="font-semibold text-base">SpecForge 配置</h3>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
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
              ? `OpenSpec CLI v${environment.cliVersion} (${environment.cliInstallType})`
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

      {/* Profile 选择 */}
      {environment.recommendedAction !== "none" && (
        <div className="space-y-2">
          <span className="text-xs text-sidebar-foreground/60">
            选择配置模板
          </span>
          <ProfileSelector
            profiles={profiles}
            selected={selectedProfile}
            onSelect={setSelectedProfile}
          />

          {selectedProfile === "custom" && (
            <textarea
              className="w-full h-32 px-3 py-2 text-xs font-mono bg-sidebar-accent/10 border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-sidebar-ring resize-none mt-2"
              placeholder="粘贴 Profile JSON..."
              value={customJson}
              onChange={(e) => setCustomJson(e.target.value)}
            />
          )}
        </div>
      )}

      {/* 初始化结果 */}
      {initResult && (
        <div
          className={`p-2 rounded-md text-xs ${
            initResult.success
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {initResult.message}
        </div>
      )}

      {/* 操作按钮 */}
      {environment.recommendedAction !== "none" && (
        <>
          {/* S1_NEW 场景下 CLI 未安装的警告 */}
          {environment.scenario === "S1_NEW" && !environment.cliInstalled && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
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

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            onClick={handleInitialize}
            disabled={
              initializing ||
              !selectedProfile ||
              (selectedProfile === "custom" && !customJson) ||
              (environment.scenario === "S1_NEW" && !environment.cliInstalled)
            }
          >
            {initializing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                配置中...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {selectedProfile === "custom"
                  ? "使用自定义配置初始化"
                  : ACTION_LABELS[environment.recommendedAction]}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};
