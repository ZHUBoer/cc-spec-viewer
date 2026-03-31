import { useCallback, useEffect, useState } from "react";
import { useConfigCheckDialog } from "../ConfigCheckProvider";
import { specDashboardService } from "../SpecDashboardService";
import {
  deriveConfigCheckState,
  type RequiredDialogReason,
} from "./configCheckState";

export const useConfigCheck = (projectId: string) => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [requiredDialogReason, setRequiredDialogReason] =
    useState<RequiredDialogReason>("init");
  const { openInitRequiredDialog } = useConfigCheckDialog();

  const checkConfig = useCallback(async () => {
    try {
      const env = await specDashboardService.getEnvironment(projectId);
      const nextState = deriveConfigCheckState(env);
      setIsConfigured(nextState.isConfigured);
      setRequiredDialogReason(nextState.requiredDialogReason);
    } catch (err) {
      console.error("Failed to check environment", err);
      setIsConfigured(null); // 检查失败时允许操作
      setRequiredDialogReason("init");
    }
  }, [projectId]);

  const handleGoToInit = useCallback(() => {
    openInitRequiredDialog(projectId, requiredDialogReason);
  }, [projectId, openInitRequiredDialog, requiredDialogReason]);

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

  return { isConfigured, checkConfig, handleGoToInit, requiredDialogReason };
};
