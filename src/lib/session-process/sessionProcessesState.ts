import type { PublicSessionProcess } from "@/types/session-process";

export type SessionProcessesSnapshot = {
  processes: PublicSessionProcess[];
  requestedAt: number;
};

export type SessionProcessesState = {
  processes: PublicSessionProcess[];
  lastUpdatedAt: number;
};

export const sessionProcessesStateQuery = {
  queryKey: ["sessionProcesses", "state"] as const,
};

const getSessionProcessPriority = (process: PublicSessionProcess) =>
  process.status === "running" ? 1 : 0;

const shouldReplaceSessionProcess = (
  current: PublicSessionProcess,
  candidate: PublicSessionProcess,
) => {
  const currentPriority = getSessionProcessPriority(current);
  const candidatePriority = getSessionProcessPriority(candidate);

  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority;
  }

  return true;
};

export const createEmptySessionProcessesState = (): SessionProcessesState => ({
  processes: [],
  lastUpdatedAt: 0,
});

export const normalizeSessionProcesses = (
  processes: PublicSessionProcess[],
): PublicSessionProcess[] => {
  const dedupedProcesses = new Map<string, PublicSessionProcess>();

  for (const process of processes) {
    const current = dedupedProcesses.get(process.sessionId);

    if (
      current === undefined ||
      shouldReplaceSessionProcess(current, process)
    ) {
      dedupedProcesses.set(process.sessionId, process);
    }
  }

  return Array.from(dedupedProcesses.values());
};

export const replaceSessionProcessesState = (
  currentState: SessionProcessesState | undefined,
  processes: PublicSessionProcess[],
  updatedAt: number = Date.now(),
): SessionProcessesState => ({
  processes: normalizeSessionProcesses(processes),
  lastUpdatedAt: Math.max(currentState?.lastUpdatedAt ?? 0, updatedAt),
});

export const applySessionProcessesSnapshot = (
  currentState: SessionProcessesState | undefined,
  snapshot: SessionProcessesSnapshot,
): SessionProcessesState => {
  const safeCurrentState = currentState ?? createEmptySessionProcessesState();

  if (snapshot.requestedAt < safeCurrentState.lastUpdatedAt) {
    return safeCurrentState;
  }

  return replaceSessionProcessesState(
    safeCurrentState,
    snapshot.processes,
    snapshot.requestedAt,
  );
};

export const upsertSessionProcessState = (
  currentState: SessionProcessesState | undefined,
  process: PublicSessionProcess,
  updatedAt: number = Date.now(),
): SessionProcessesState => {
  const safeCurrentState = currentState ?? createEmptySessionProcessesState();

  return replaceSessionProcessesState(
    safeCurrentState,
    [
      ...safeCurrentState.processes.filter(
        (item) =>
          item.id !== process.id && item.sessionId !== process.sessionId,
      ),
      process,
    ],
    updatedAt,
  );
};

export const removeSessionProcessStateById = (
  currentState: SessionProcessesState | undefined,
  sessionProcessId: string,
  updatedAt: number = Date.now(),
): SessionProcessesState => {
  const safeCurrentState = currentState ?? createEmptySessionProcessesState();

  return replaceSessionProcessesState(
    safeCurrentState,
    safeCurrentState.processes.filter(
      (process) => process.id !== sessionProcessId,
    ),
    updatedAt,
  );
};

export const getSessionProcessBySessionId = (
  processes: PublicSessionProcess[],
  sessionId: string,
) => processes.find((process) => process.sessionId === sessionId);
