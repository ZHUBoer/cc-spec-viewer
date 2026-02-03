export type PermissionRequest = {
  id: string;
  turnId: string;
  sessionId?: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  timestamp: number;
};

export type PermissionResponse = {
  permissionRequestId: string;
  decision: "allow" | "deny";
  updatedInput?: Record<string, unknown>; // For tools like AskUserQuestion that need user input
};
