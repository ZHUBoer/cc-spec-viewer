import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  createEmptySessionProcessesState,
  getSessionProcessBySessionId,
  sessionProcessesStateQuery,
} from "@/lib/session-process/sessionProcessesState";

export const useSessionProcess = () => {
  const { data } = useQuery({
    queryKey: sessionProcessesStateQuery.queryKey,
    queryFn: async () => createEmptySessionProcessesState(),
    initialData: createEmptySessionProcessesState(),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const sessionProcesses = data.processes;

  const getSessionProcess = useCallback(
    (sessionId: string) =>
      getSessionProcessBySessionId(sessionProcesses, sessionId),
    [sessionProcesses],
  );

  return {
    sessionProcesses,
    getSessionProcess,
  };
};
