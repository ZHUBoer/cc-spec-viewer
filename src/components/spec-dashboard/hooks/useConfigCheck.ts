import { useCallback, useEffect, useState } from "react";
import { useConfigCheckDialog } from "../ConfigCheckProvider";
import { specDashboardService } from "../SpecDashboardService";

export const useConfigCheck = (projectId: string) => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const { openInitRequiredDialog } = useConfigCheckDialog();

  const checkConfig = useCallback(async () => {
    try {
      const env = await specDashboardService.getEnvironment(projectId);
      setIsConfigured(env.scenario === "S5_CONFIGURED");
    } catch (err) {
      console.error("Failed to check environment", err);
      setIsConfigured(null); // 检查失败时允许操作
    }
  }, [projectId]);

  const handleGoToInit = useCallback(() => {
    openInitRequiredDialog(projectId);
  }, [projectId, openInitRequiredDialog]);

  // 初始检查
  useEffect(() => {
    checkConfig();
  }, [checkConfig]);

  // 监听初始化完成事件
  useEffect(() => {
    const handleInitComplete = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        checkConfig();
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
  }, [projectId, checkConfig]);

  return { isConfigured, checkConfig, handleGoToInit };
};
