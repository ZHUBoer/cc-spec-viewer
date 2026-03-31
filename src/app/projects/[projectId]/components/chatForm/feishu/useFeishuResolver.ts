import { useCallback, useRef, useState } from "react";
import { HttpError, honoClient } from "@/lib/api/client";
import { detectFeishuUrls, replaceFeishuUrls } from "./feishuUtils";

/** 飞书文档下载超时时间（毫秒） */
const FEISHU_DOWNLOAD_TIMEOUT_MS = 30 * 1000;

/**
 * 单个飞书链接的下载结果
 */
export interface FeishuDownloadResult {
  url: string;
  success: boolean;
  markdown?: string;
  error?: string;
}

/**
 * 对话框状态
 */
export type FeishuDialogState =
  | null
  | {
      type: "loading";
      urls: string[];
      originalMessage: string;
    }
  | {
      type: "allFailed";
      originalMessage: string;
      succeeded: string[];
      errors: Array<{ url: string; error: string }>;
    };

/**
 * 从后端下载单个飞书文档内容
 */
const fetchFeishuContent = async (
  projectId: string,
  larkDoc: string,
  signal?: AbortSignal,
): Promise<{ markdown: string }> => {
  try {
    const response = await honoClient.api.feishu.download.$post(
      {
        json: { projectId, larkDoc },
      },
      {
        init: { signal },
      },
    );

    const data = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "markdown" in data &&
      typeof data.markdown === "string"
    ) {
      return { markdown: data.markdown };
    }
    throw new Error("下载返回数据格式异常");
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(`HTTP ${error.status}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error");
  }
};

/**
 * 飞书文档解析 Hook
 *
 * 提供可插拔的消息预处理能力：
 * - 自动检测消息中的飞书链接
 * - 自动下载所有飞书文档
 * - 将链接替换为格式化的 markdown 内容
 * - 全部成功时自动发送，有失败时显示错误提示并保留输入
 *
 * @example
 * ```tsx
 * const { beforeSubmit, dialogState, dialogActions, isProcessing } = useFeishuResolver(projectId);
 * <ChatInput onBeforeSubmit={beforeSubmit} ... />
 * <FeishuResolverDialogs state={dialogState} actions={dialogActions} />
 * ```
 */
export const useFeishuResolver = (projectId: string) => {
  const [dialogState, setDialogState] = useState<FeishuDialogState>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  /**
   * 消息预处理函数，作为 ChatInput.onBeforeSubmit 使用
   */
  const beforeSubmit = useCallback(
    async (message: string): Promise<string | null> => {
      const urls = detectFeishuUrls(message);
      if (urls.length === 0) {
        // 无飞书链接，直接放行
        return message;
      }

      // 初始化取消标记和 AbortController
      cancelledRef.current = false;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 直接开始下载，不等待用户确认
      setDialogState({ type: "loading", urls, originalMessage: message });
      setIsProcessing(true);

      // 设置超时自动中断
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, FEISHU_DOWNLOAD_TIMEOUT_MS);

      try {
        // 并行下载所有飞书文档
        const results = await Promise.allSettled(
          urls.map(async (url): Promise<FeishuDownloadResult> => {
            try {
              const data = await fetchFeishuContent(
                projectId,
                url,
                abortController.signal,
              );
              return { url, success: true, markdown: data.markdown };
            } catch (error) {
              return {
                url,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          }),
        );

        // 用户已主动取消，直接返回 null，不显示 allFailed 弹窗
        if (cancelledRef.current) {
          return null;
        }

        const downloadResults = results.map((r) =>
          r.status === "fulfilled"
            ? r.value
            : { url: "", success: false, error: "Promise rejected" },
        );

        const succeeded = downloadResults.filter((r) => r.success);
        const failed = downloadResults.filter((r) => !r.success);

        if (failed.length > 0) {
          // 有失败（全部失败或部分失败）：显示失败对话框，返回null保留输入
          setDialogState({
            type: "allFailed",
            originalMessage: message,
            succeeded: succeeded.map((r) => r.url),
            errors: failed.map((r) => ({
              url: r.url,
              error: r.error || "Unknown error",
            })),
          });
          return null;
        }

        // 全部成功：直接返回处理后的消息，自动发送
        const urlContentMap = new Map<string, string>();
        for (const result of succeeded) {
          if (result.markdown) {
            urlContentMap.set(result.url, result.markdown);
          }
        }

        const processedMessage = replaceFeishuUrls(message, urlContentMap);
        setDialogState(null);
        return processedMessage;
      } finally {
        clearTimeout(timeoutId);
        abortControllerRef.current = null;
        setIsProcessing(false);
      }
    },
    [projectId],
  );

  /**
   * 关闭失败对话框
   */
  const handleClose = useCallback(() => {
    setDialogState(null);
  }, []);

  /**
   * 取消下载（用户主动取消或 ESC 关闭 loading 弹窗）
   */
  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    abortControllerRef.current?.abort();
    setDialogState(null);
    setIsProcessing(false);
  }, []);

  return {
    beforeSubmit,
    dialogState,
    isProcessing,
    dialogActions: {
      onClose: handleClose,
      onCancel: handleCancel,
    },
  };
};

export type FeishuDialogActions = ReturnType<
  typeof useFeishuResolver
>["dialogActions"];
