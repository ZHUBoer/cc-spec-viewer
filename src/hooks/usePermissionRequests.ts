import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerEventListener } from "@/lib/sse/hook/useServerEventListener";
import type {
  PermissionRequest,
  PermissionResponse,
} from "@/types/permissions";
import { honoClient } from "../lib/api/client";
import {
  EMPTY_POLL_CLEAR_THRESHOLD,
  getLatestPendingRequest,
  shouldAcceptPermissionEvent,
} from "./permissionRequestState";

export const usePermissionRequests = (options?: {
  sessionProcessId?: string;
}) => {
  const { sessionProcessId } = options ?? {};
  const [currentPermissionRequest, setCurrentPermissionRequest] =
    useState<PermissionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentPermissionRequestRef = useRef<PermissionRequest | null>(null);
  const emptyPollCountRef = useRef(0);

  useEffect(() => {
    currentPermissionRequestRef.current = currentPermissionRequest;
  }, [currentPermissionRequest]);

  useEffect(() => {
    if (sessionProcessId === undefined) {
      emptyPollCountRef.current = 0;
      setCurrentPermissionRequest(null);
      setIsDialogOpen(false);
      return;
    }
    emptyPollCountRef.current = 0;
    setCurrentPermissionRequest(null);
    setIsDialogOpen(false);
  }, [sessionProcessId]);

  const refreshPending = useCallback(async () => {
    if (!sessionProcessId) {
      emptyPollCountRef.current = 0;
      setCurrentPermissionRequest(null);
      setIsDialogOpen(false);
      return;
    }

    try {
      const response = await honoClient.api.cc[
        "permission-requests"
      ].pending.$get({
        query: {
          sessionProcessId,
        },
      });
      const data = await response.json();
      const nextRequest = getLatestPendingRequest({
        requests: data.requests,
        sessionProcessId,
      });

      if (nextRequest) {
        emptyPollCountRef.current = 0;
        setCurrentPermissionRequest(nextRequest);
        setIsDialogOpen(true);
        return;
      }

      const currentRequest = currentPermissionRequestRef.current;
      if (
        currentRequest &&
        currentRequest.sessionProcessId === sessionProcessId
      ) {
        emptyPollCountRef.current += 1;
        if (emptyPollCountRef.current < EMPTY_POLL_CLEAR_THRESHOLD) {
          return;
        }
      }

      emptyPollCountRef.current = 0;
      setCurrentPermissionRequest(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error loading pending permission requests:", error);
    }
  }, [sessionProcessId]);

  // Listen for permission requests from the server
  useServerEventListener("permissionRequested", (data) => {
    if (data.permissionRequest) {
      if (
        !shouldAcceptPermissionEvent({
          sessionProcessId,
          request: data.permissionRequest,
        })
      ) {
        void refreshPending();
        return;
      }
      emptyPollCountRef.current = 0;
      setCurrentPermissionRequest(data.permissionRequest);
      setIsDialogOpen(true);
    }
  });

  // Re-fetch on SSE connect/reconnect to recover missed events.
  useServerEventListener("connect", () => {
    void refreshPending();
  });

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshPending();
    }, 10_000);
    return () => {
      clearInterval(timer);
    };
  }, [refreshPending]);

  const handlePermissionResponse = useCallback(
    async (response: PermissionResponse) => {
      try {
        const apiResponse = await honoClient.api.cc[
          "permission-response"
        ].$post({
          json: response,
        });

        if (!apiResponse.ok) {
          throw new Error("Failed to send permission response");
        }

        // Close the dialog
        emptyPollCountRef.current = 0;
        setIsDialogOpen(false);
        setCurrentPermissionRequest(null);
      } catch (error) {
        console.error("Error sending permission response:", error);
        toast.error("Failed to send permission response");
      }
    },
    [],
  );

  return {
    currentPermissionRequest,
    isDialogOpen,
    onPermissionResponse: handlePermissionResponse,
    refreshPending,
  };
};
