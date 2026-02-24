import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { claudeCommandsQuery } from "@/lib/api/queries";

/**
 * SpecForge 初始化后的通用后处理逻辑 Hook
 *
 * 封装了初始化成功后需要执行的通用操作：
 * - 使命令查询缓存失效
 * - 发送初始化完成事件
 */
export const useSpecForgeInitialization = (projectId: string) => {
  const queryClient = useQueryClient();

  /**
   * 执行初始化后的通用后处理逻辑
   *
   * @param options 可选配置
   * @param options.onSuccess 成功后的回调函数
   * @param options.invalidateQueries 是否使查询缓存失效（默认 true）
   * @param options.dispatchEvent 是否发送初始化完成事件（默认 true）
   */
  const handlePostInitialization = useCallback(
    async (options?: {
      onSuccess?: () => void | Promise<void>;
      invalidateQueries?: boolean;
      dispatchEvent?: boolean;
    }) => {
      // 使命令查询缓存失效，强制重新获取最新的命令列表
      if (options?.invalidateQueries !== false) {
        await queryClient.invalidateQueries({
          queryKey: claudeCommandsQuery(projectId).queryKey,
        });
      }

      // 发送初始化完成事件，通知其他组件更新状态
      if (options?.dispatchEvent !== false) {
        window.dispatchEvent(
          new CustomEvent("specforge:init-complete", {
            detail: { projectId },
          }),
        );
      }

      // 执行自定义成功回调
      await options?.onSuccess?.();
    },
    [projectId, queryClient],
  );

  return { handlePostInitialization };
};
