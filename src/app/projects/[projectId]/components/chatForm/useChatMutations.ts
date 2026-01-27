import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import type { PublicSessionProcess } from "@/types/session-process";
import { honoClient } from "../../../../../lib/api/client";
import { sessionProcessesAtom } from "../../sessions/[sessionId]/store/sessionProcessesAtom";
import type { MessageInput } from "./ChatInput";

export const useCreateSessionProcessMutation = (
  projectId: string,
  onSuccess?: () => void,
) => {
  const navigate = useNavigate();
  const setSessionProcesses = useSetAtom(sessionProcessesAtom);

  return useMutation({
    mutationFn: async (options: {
      input: MessageInput;
      baseSessionId?: string;
    }) => {
      const response = await honoClient.api.cc["session-processes"].$post(
        {
          json: {
            projectId,
            baseSessionId: options.baseSessionId,
            input: options.input,
          },
        },
        {
          init: {
            signal: AbortSignal.timeout(60 * 1000),
          },
        },
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    },
    onSuccess: async (response) => {
      onSuccess?.();
      setSessionProcesses((prev) => [
        ...prev,
        {
          ...response.sessionProcess,
          status: "running" as const,
        } as unknown as PublicSessionProcess,
      ]);
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId,
        },
        search: (prev) => ({
          ...prev,
          sessionId: response.sessionProcess.sessionId,
        }),
      });
    },
  });
};

export const useContinueSessionProcessMutation = (
  projectId: string,
  baseSessionId: string,
) => {
  const setSessionProcesses = useSetAtom(sessionProcessesAtom);
  return useMutation({
    mutationFn: async (options: {
      input: MessageInput;
      sessionProcessId: string;
    }) => {
      const response = await honoClient.api.cc["session-processes"][
        ":sessionProcessId"
      ].continue.$post(
        {
          param: { sessionProcessId: options.sessionProcessId },
          json: {
            projectId: projectId,
            baseSessionId: baseSessionId,
            input: options.input,
          },
        },
        {
          init: {
            signal: AbortSignal.timeout(60 * 1000),
          },
        },
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    },
    onSuccess: (response) => {
      setSessionProcesses((prev) => {
        // Remove existing process if any (to avoid duplicates or stale state)
        const filtered = prev.filter(
          (p) => p.sessionId !== response.sessionProcess.sessionId,
        );
        return [
          ...filtered,
          {
            ...response.sessionProcess,
            status: "running" as const,
          } as unknown as PublicSessionProcess,
        ];
      });
    },
  });
};
