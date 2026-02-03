import { useCallback, useMemo } from "react";
import { useSessionQuery } from "./useSessionQuery";

export const useSession = (projectId: string, sessionId: string) => {
  const query = useSessionQuery(projectId, sessionId);
  const session = query.data?.session;
  if (session === undefined || session === null) {
    throw new Error("Session not found");
  }

  const toolResultMap = useMemo(() => {
    const entries = session.conversations.flatMap((conversation) => {
      if (conversation.type !== "user") {
        return [];
      }

      if (typeof conversation.message.content === "string") {
        return [];
      }

      return conversation.message.content.flatMap((message) => {
        if (typeof message === "string") {
          return [];
        }

        if (message.type !== "tool_result") {
          return [];
        }

        return [[message.tool_use_id, message] as const];
      });
    });

    return new Map(entries);
  }, [session.conversations]);

  const toolUseResultMap = useMemo(() => {
    const entries = session.conversations.flatMap((conversation) => {
      if (conversation.type !== "user") {
        return [];
      }

      if (!conversation.toolUseResult) {
        return [];
      }

      // toolUseResult 包含 questions 和 answers
      // 需要找到对应的 tool_use_id
      if (typeof conversation.message.content === "string") {
        return [];
      }

      // 注意：使用 find() 只会匹配第一个 tool_result
      // 如果一个 user entry 包含多个 tool_result，只有第一个会被映射
      // 实际中极少出现，因为 toolUseResult 通常只对应一个 tool_use
      const toolResultContent = conversation.message.content.find((message) => {
        if (typeof message === "string") {
          return false;
        }
        return message.type === "tool_result";
      });

      if (
        !toolResultContent ||
        typeof toolResultContent === "string" ||
        toolResultContent.type !== "tool_result"
      ) {
        return [];
      }

      return [
        [toolResultContent.tool_use_id, conversation.toolUseResult] as const,
      ];
    });

    return new Map(entries);
  }, [session.conversations]);

  const getToolResult = useCallback(
    (toolUseId: string) => {
      return toolResultMap.get(toolUseId);
    },
    [toolResultMap],
  );

  const getToolUseResult = useCallback(
    (toolUseId: string) => {
      return toolUseResultMap.get(toolUseId);
    },
    [toolUseResultMap],
  );

  return {
    session,
    conversations: session.conversations,
    getToolResult,
    getToolUseResult,
  };
};
