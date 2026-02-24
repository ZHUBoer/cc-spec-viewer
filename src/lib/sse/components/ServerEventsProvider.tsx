import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { SSEEvent } from "../../../types/sse";
import { projectListQuery } from "../../api/queries";
import { callSSE } from "../callSSE";
import {
  type EventListener,
  SSEContext,
  type SSEContextType,
} from "../SSEContext";
import { sseAtom } from "../store/sseAtom";

export const ServerEventsProvider: FC<PropsWithChildren> = ({ children }) => {
  const sseRef = useRef<ReturnType<typeof callSSE> | null>(null);
  const listenersRef = useRef<
    Map<SSEEvent["kind"], Set<(event: SSEEvent) => void>>
  >(new Map());
  const [, setSSEState] = useAtom(sseAtom);
  const queryClient = useQueryClient();

  // Re-register all listeners to the current SSE instance
  const registerAllListeners = useCallback(
    (sse: ReturnType<typeof callSSE>) => {
      const cleanups: (() => void)[] = [];
      for (const [eventType, listeners] of listenersRef.current.entries()) {
        for (const listener of listeners) {
          const { removeEventListener } = sse.addEventListener(
            eventType,
            (event) => {
              listener(
                event as unknown as Extract<
                  SSEEvent,
                  { kind: typeof eventType }
                >,
              );
            },
          );
          cleanups.push(removeEventListener);
        }
      }
      return () =>
        cleanups.forEach((cleanup) => {
          cleanup();
        });
    },
    [],
  );

  useEffect(() => {
    const sse = callSSE({
      onOpen: async () => {
        // 连接成功，更新状态
        setSSEState({
          isConnected: true,
        });

        // Cannot subscribe to events during reconnection
        // So invalidate uniformly when connection opens
        await queryClient.invalidateQueries({
          queryKey: projectListQuery.queryKey,
        });
        // Also invalidate session detail queries to ensure current session is refreshed
        // Pattern: ["projects", projectId, "sessions", sessionId]
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key[0] === "projects" &&
              key[2] === "sessions"
            );
          },
        });
      },
      onError: () => {
        // 连接错误，更新状态
        setSSEState({
          isConnected: false,
        });
      },
    });
    sseRef.current = sse;

    // Register existing listeners to the new connection
    const cleanupListeners = registerAllListeners(sse);

    const { removeEventListener } = sse.addEventListener("connect", (event) => {
      console.log("SSE connected", event);
    });

    return () => {
      // clean up
      cleanupListeners();
      sse.cleanUp();
      removeEventListener();
      sseRef.current = null;
    };
  }, [setSSEState, queryClient, registerAllListeners]);

  const addEventListener = useCallback(
    <T extends SSEEvent["kind"]>(eventType: T, listener: EventListener<T>) => {
      // Store the listener in our internal map
      if (!listenersRef.current.has(eventType)) {
        listenersRef.current.set(eventType, new Set());
      }
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.add(listener as (event: SSEEvent) => void);
      }

      // Register with the actual SSE connection if it exists
      let sseCleanup: (() => void) | null = null;
      if (sseRef.current) {
        const { removeEventListener } = sseRef.current.addEventListener(
          eventType,
          (event) => {
            // The listener expects the specific event type, so we cast it through unknown first
            listener(event as unknown as Extract<SSEEvent, { kind: T }>);
          },
        );
        sseCleanup = removeEventListener;
      }

      // Return cleanup function
      return () => {
        // Remove from internal listeners
        const listeners = listenersRef.current.get(eventType);
        if (listeners) {
          listeners.delete(listener as (event: SSEEvent) => void);
          if (listeners.size === 0) {
            listenersRef.current.delete(eventType);
          }
        }
        // Remove from SSE connection
        if (sseCleanup) {
          sseCleanup();
        }
      };
    },
    [],
  );

  const contextValue: SSEContextType = {
    addEventListener,
  };

  return (
    <SSEContext.Provider value={contextValue}>{children}</SSEContext.Provider>
  );
};
