export const normalizeClaudeProjectPath = (projectPath: string) =>
  projectPath.replace(/[\\/]+$/, "").replace(/[\\/:_]/g, "-");
