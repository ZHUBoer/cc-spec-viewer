import { createContext, useContext } from "react";

export type PanelMode = "browser" | "spec" | "diff" | "none";

export interface WorkspacePanelContextType {
  // Common state
  activeMode: PanelMode;
  panelWidth: number; // percentage

  // Browser state
  browserUrl: string | null;
  openBrowser: (url: string) => void;
  closeBrowser: () => void;
  reloadBrowser: () => void;

  // Spec state
  specContext: unknown | null;
  openSpec: (context: unknown) => void;
  closeSpec: () => void;

  // Generic close
  closePanel: () => void;
}

export const WorkspacePanelContext = createContext<
  WorkspacePanelContextType | undefined
>(undefined);

export function useWorkspacePanel(): WorkspacePanelContextType {
  const context = useContext(WorkspacePanelContext);
  if (!context) {
    throw new Error(
      "useWorkspacePanel must be used within a WorkspacePanelProvider",
    );
  }
  return context;
}
