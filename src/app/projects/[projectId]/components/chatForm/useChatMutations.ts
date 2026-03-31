import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HttpError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/responseGuards";
import {
  type SessionProcessesState,
  sessionProcessesStateQuery,
  upsertSessionProcessState,
} from "@/lib/session-process/sessionProcessesState";
import type { PublicSessionProcess } from "@/types/session-process";
import { honoClient } from "../../../../../lib/api/client";
import {
  ccModelsQuery,
  projectDetailQuery,
  sessionProcessesQuery,
} from "../../../../../lib/api/queries";
import type { MessageInput } from "./ChatInput";

/**
 * 会话连接进度 toast 的固定 ID，
 * SSEEventListeners 中的 initializationProgress 监听也使用此 ID 来原地更新消息。
 */
export const SESSION_CONNECT_TOAST_ID = "session-connect-progress";

const toRunningSessionProcess = (sessionProcess: {
  id: string;
  projectId: string;
  sessionId: string;
}): PublicSessionProcess => ({
  id: sessionProcess.id,
  projectId: sessionProcess.projectId,
  sessionId: sessionProcess.sessionId,
  status: "running",
});

const hasSessionProcess = (
  value: unknown,
): value is {
  sessionProcess: {
    id: string;
    projectId: string;
    sessionId: string;
  };
} => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("sessionProcess" in value)) {
    return false;
  }
  const sessionProcess = value.sessionProcess;
  if (typeof sessionProcess !== "object" || sessionProcess === null) {
    return false;
  }
  if (!("id" in sessionProcess)) {
    return false;
  }
  if (!("projectId" in sessionProcess)) {
    return false;
  }
  if (!("sessionId" in sessionProcess)) {
    return false;
  }
  return (
    typeof sessionProcess.id === "string" &&
    typeof sessionProcess.projectId === "string" &&
    typeof sessionProcess.sessionId === "string"
  );
};

export const useCreateSessionProcessMutation = (
  projectId: string,
  onSuccess?: () => void,
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      input: MessageInput;
      baseSessionId?: string;
    }) => {
      toast.loading("正在建立会话连接，需重新连接 MCP server...", {
        id: SESSION_CONNECT_TOAST_ID,
      });

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

      const data = await response.json();
      if (!hasSessionProcess(data)) {
        throw new Error(getErrorMessage(data) ?? "Failed to create session");
      }
      return data;
    },
    onSuccess: async (response) => {
      onSuccess?.();
      queryClient.setQueryData(
        sessionProcessesStateQuery.queryKey,
        (currentState: SessionProcessesState | undefined) =>
          upsertSessionProcessState(
            currentState,
            toRunningSessionProcess(response.sessionProcess),
          ),
      );

      // Invalidate project detail query to refresh session list immediately
      await queryClient.invalidateQueries({
        queryKey: projectDetailQuery(projectId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: sessionProcessesQuery.queryKey,
      });

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
    onError: () => {
      toast.error("会话连接失败", {
        id: SESSION_CONNECT_TOAST_ID,
      });
    },
  });
};

export const useContinueSessionProcessMutation = (
  projectId: string,
  baseSessionId: string,
) => {
  const queryClient = useQueryClient();
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

      const data = await response.json();
      if (!hasSessionProcess(data)) {
        throw new Error(getErrorMessage(data) ?? "Failed to continue session");
      }
      return data;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        sessionProcessesStateQuery.queryKey,
        (currentState: SessionProcessesState | undefined) =>
          upsertSessionProcessState(
            currentState,
            toRunningSessionProcess(response.sessionProcess),
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: sessionProcessesQuery.queryKey,
      });
    },
  });
};

export const useSwitchCcModelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (options: { targetIndex: number }) => {
      try {
        const response = await honoClient.api.cc.models.switch.$post({
          json: {
            targetIndex: options.targetIndex,
          },
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return await response.json();
      } catch (error) {
        if (error instanceof HttpError && error.status === 409) {
          throw new Error("MODEL_SWITCH_BLOCKED_RUNNING_TASK");
        }
        if (error instanceof HttpError && error.status === 422) {
          throw new Error("MODEL_SWITCH_UNSUPPORTED_MODE");
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ccModelsQuery.queryKey,
      });
    },
  });
};
