import { useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { InitRequiredDialog } from "./InitRequiredDialog";

type ConfigCheckContextValue = {
  openInitRequiredDialog: (
    projectId: string,
    reason?: "init" | "upgrade-template",
  ) => void;
};

const ConfigCheckContext = createContext<ConfigCheckContextValue | null>(null);

export function useConfigCheckDialog() {
  const context = useContext(ConfigCheckContext);
  if (!context) {
    throw new Error(
      "useConfigCheckDialog must be used within ConfigCheckProvider",
    );
  }
  return context;
}

type ConfigCheckProviderProps = {
  children: React.ReactNode;
};

function getProjectIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1];
}

export function ConfigCheckProvider({ children }: ConfigCheckProviderProps) {
  const [dialogState, setDialogState] = useState<{
    projectId: string;
    open: boolean;
    reason: "init" | "upgrade-template";
  } | null>(null);
  const routerState = useRouterState();
  const currentProjectId = getProjectIdFromPath(routerState.location.pathname);

  const openInitRequiredDialog = useCallback(
    (projectId: string, reason: "init" | "upgrade-template" = "init") => {
      setDialogState({ projectId, open: true, reason });
    },
    [],
  );

  const handleGoToInit = useCallback(() => {
    if (dialogState?.projectId) {
      if (dialogState.reason === "upgrade-template") {
        // 升级场景：切换到系统信息面板
        window.dispatchEvent(
          new CustomEvent("specforge:open-system-info", {
            detail: { projectId: dialogState.projectId },
          }),
        );
      } else {
        // 初始化场景：打开初始化弹窗
        window.dispatchEvent(
          new CustomEvent("specforge:open-init-dialog", {
            detail: { projectId: dialogState.projectId },
          }),
        );
      }
    }
    setDialogState(null);
  }, [dialogState]);

  const handleClose = useCallback(() => {
    setDialogState(null);
  }, []);

  // 当路由变化时，如果弹窗打开但 projectId 不匹配，则关闭弹窗
  useEffect(() => {
    if (dialogState?.open && dialogState.projectId !== currentProjectId) {
      setDialogState(null);
    }
  }, [currentProjectId, dialogState]);

  return (
    <ConfigCheckContext.Provider value={{ openInitRequiredDialog }}>
      {children}
      {dialogState && (
        <InitRequiredDialog
          open={dialogState.open}
          reason={dialogState.reason}
          onClose={handleClose}
          onGoToInit={handleGoToInit}
        />
      )}
    </ConfigCheckContext.Provider>
  );
}
