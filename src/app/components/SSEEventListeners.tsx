import { useQueryClient } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import {
  projectDetailQuery,
  projectListQuery,
  sessionDetailQuery,
} from "../../lib/api/queries";
import { useServerEventListener } from "../../lib/sse/hook/useServerEventListener";

export const SSEEventListeners: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();

  useServerEventListener("sessionListChanged", async (event) => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectDetailQuery(event.projectId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectListQuery.queryKey,
        }),
      ]);
    } catch (error) {
      console.error(
        "[SSEEventListeners] Failed to invalidate project queries:",
        error,
      );
    }
  });

  useServerEventListener("sessionChanged", async (event) => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sessionDetailQuery(event.projectId, event.sessionId)
            .queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectListQuery.queryKey,
        }),
      ]);
    } catch (error) {
      console.error(
        "[SSEEventListeners] Failed to invalidate session queries:",
        error,
      );
    }
  });

  useServerEventListener("agentSessionChanged", async (event) => {
    try {
      // Invalidate the specific agent-session query for this agentSessionId
      // New query key pattern: ["projects", projectId, "agent-sessions", agentId]
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === "projects" &&
            queryKey[1] === event.projectId &&
            queryKey[2] === "agent-sessions" &&
            queryKey[3] === event.agentSessionId
          );
        },
      });
    } catch (error) {
      console.error(
        "[SSEEventListeners] Failed to invalidate agent session queries:",
        error,
      );
    }
  });

  // Listen for virtual conversation updates - triggers before file watcher debounce
  // This reduces perceived latency by refreshing session data as soon as new assistant message is received
  useServerEventListener("virtualConversationUpdated", async (event) => {
    try {
      await queryClient.invalidateQueries({
        queryKey: sessionDetailQuery(event.projectId, event.sessionId).queryKey,
      });
    } catch (error) {
      console.error(
        "[SSEEventListeners] Failed to invalidate virtual conversation queries:",
        error,
      );
    }
  });

  return <>{children}</>;
};
