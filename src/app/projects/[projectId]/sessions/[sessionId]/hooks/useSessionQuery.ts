import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { sessionDetailQuery } from "../../../../../../lib/api/queries";
import { sseAtom } from "../../../../../../lib/sse/store/sseAtom";
import { getSessionDetailRefetchInterval } from "./sessionRefreshPolicy";
import { useSessionProcess } from "./useSessionProcess";

export const useSessionQuery = (projectId: string, sessionId: string) => {
  const { isConnected } = useAtomValue(sseAtom);
  const { getSessionProcess } = useSessionProcess();
  const sessionProcess = getSessionProcess(sessionId);

  return useSuspenseQuery({
    queryKey: sessionDetailQuery(projectId, sessionId).queryKey,
    queryFn: sessionDetailQuery(projectId, sessionId).queryFn,
    refetchInterval: getSessionDetailRefetchInterval({
      isSseConnected: isConnected,
      sessionProcessStatus: sessionProcess?.status,
    }),
    refetchIntervalInBackground: false,
  });
};
