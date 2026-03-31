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

type ListenerRegistration = {
  id: symbol;
  register: (sse: ReturnType<typeof callSSE>) => () => void;
};

export const ServerEventsProvider: FC<PropsWithChildren> = ({ children }) => {
  const sseRef = useRef<ReturnType<typeof callSSE> | null>(null);
  const listenersRef = useRef<Map<symbol, ListenerRegistration>>(new Map());
  const activeCleanupRef = useRef<Map<symbol, () => void>>(new Map());
  const [, setSSEState] = useAtom(sseAtom);
  const queryClient = useQueryClient();

  const unregisterAllListeners = useCallback(() => {
    for (const cleanup of activeCleanupRef.current.values()) {
      cleanup();
    }
    activeCleanupRef.current.clear();
  }, []);

  const registerAllListeners = useCallback(
    (sse: ReturnType<typeof callSSE>) => {
      unregisterAllListeners();
      for (const registration of listenersRef.current.values()) {
        const cleanup = registration.register(sse);
        activeCleanupRef.current.set(registration.id, cleanup);
      }
    },
    [unregisterAllListeners],
  );

  useEffect(() => {
    const sse = callSSE({
      onOpen: async () => {
        setSSEState({
          isConnected: true,
        });

        await queryClient.invalidateQueries({
          queryKey: projectListQuery.queryKey,
        });
        await queryClient.invalidateQueries({
          type: "active",
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key[0] === "projects" &&
              typeof key[1] === "string" &&
              key.length === 2
            );
          },
        });
        await queryClient.invalidateQueries({
          type: "active",
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
        setSSEState({
          isConnected: false,
        });
      },
    });
    sseRef.current = sse;

    registerAllListeners(sse);

    const { removeEventListener } = sse.addEventListener("connect", (event) => {
      console.log("SSE connected", event);
    });

    return () => {
      unregisterAllListeners();
      sse.cleanUp();
      removeEventListener();
      sseRef.current = null;
    };
  }, [setSSEState, queryClient, registerAllListeners, unregisterAllListeners]);

  const addEventListener = useCallback(
    <T extends SSEEvent["kind"]>(eventType: T, listener: EventListener<T>) => {
      const registrationId = Symbol(`sse-listener-${eventType}`);
      const registration: ListenerRegistration = {
        id: registrationId,
        register: (sse) => {
          const { removeEventListener } = sse.addEventListener(
            eventType,
            (event) => {
              listener(event);
            },
          );
          return removeEventListener;
        },
      };

      listenersRef.current.set(registrationId, registration);

      if (sseRef.current) {
        const cleanup = registration.register(sseRef.current);
        activeCleanupRef.current.set(registrationId, cleanup);
      }

      return () => {
        const cleanup = activeCleanupRef.current.get(registrationId);
        if (cleanup) {
          cleanup();
          activeCleanupRef.current.delete(registrationId);
        }
        listenersRef.current.delete(registrationId);
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
