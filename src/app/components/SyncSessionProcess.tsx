import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { type FC, type PropsWithChildren, useEffect } from "react";
import { sessionProcessesQuery } from "../../lib/api/queries";
import {
  applySessionProcessesSnapshot,
  createEmptySessionProcessesState,
  replaceSessionProcessesState,
  type SessionProcessesState,
  sessionProcessesStateQuery,
} from "../../lib/session-process/sessionProcessesState";
import { useServerEventListener } from "../../lib/sse/hook/useServerEventListener";
import { sseAtom } from "../../lib/sse/store/sseAtom";

export const SyncSessionProcess: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isConnected } = useAtomValue(sseAtom);
  const { data } = useSuspenseQuery({
    queryKey: sessionProcessesQuery.queryKey,
    queryFn: sessionProcessesQuery.queryFn,
    refetchInterval: isConnected ? false : 2000,
  });

  useServerEventListener("sessionProcessChanged", ({ processes }) => {
    queryClient.setQueryData(
      sessionProcessesStateQuery.queryKey,
      (currentState: SessionProcessesState | undefined) =>
        replaceSessionProcessesState(
          currentState ?? createEmptySessionProcessesState(),
          processes,
        ),
    );
  });

  useEffect(() => {
    queryClient.setQueryData(
      sessionProcessesStateQuery.queryKey,
      (currentState: SessionProcessesState | undefined) =>
        applySessionProcessesSnapshot(
          currentState ?? createEmptySessionProcessesState(),
          data,
        ),
    );
  }, [data, queryClient]);

  return <>{children}</>;
};
