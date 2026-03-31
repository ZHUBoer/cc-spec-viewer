import type { PublicSessionProcess } from "@/types/session-process";

export const isSessionProcessAbortable = (
  sessionProcess?: PublicSessionProcess,
): sessionProcess is PublicSessionProcess =>
  sessionProcess?.status === "running" || sessionProcess?.status === "paused";

export const removeSessionProcessById = (
  processes: PublicSessionProcess[],
  sessionProcessId: string,
): PublicSessionProcess[] =>
  processes.filter((process) => process.id !== sessionProcessId);
