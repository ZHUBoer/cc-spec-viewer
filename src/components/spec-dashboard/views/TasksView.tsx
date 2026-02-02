import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";

import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { honoClient } from "@/lib/api/client";
import type { OpenSpecChange } from "../SpecDashboardService";
import { specDashboardService } from "../SpecDashboardService";

interface TasksViewProps {
  projectId: string;
  changeId: string;
  content: string;
  status: OpenSpecChange["status"];
}

/**
 * 解析 tasks.md 中的任务进度
 */
const parseTasksProgress = (content: string) => {
  const checkboxes = content.match(/- \[(x| )\]/g) || [];
  const completed = checkboxes.filter((cb) => cb.includes("x")).length;
  const total = checkboxes.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
};

export const TasksView: FC<TasksViewProps> = ({
  projectId,
  changeId,
  content,
  status,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const progress = useMemo(() => parseTasksProgress(content), [content]);
  const tasksConfirmed = content.includes("<!-- TASKS_CONFIRMED: true -->");

  // 确认任务规划
  const handleConfirmTasks = async () => {
    try {
      setIsProcessing(true);

      const updatedContent =
        content +
        "\n\n<!-- TASKS_CONFIRMED: true -->" +
        "\n<!-- CONFIRMED_AT: " +
        new Date().toISOString() +
        " -->";

      await specDashboardService.updateChangeFile(
        projectId,
        changeId,
        "tasks.md",
        updatedContent,
      );

      await queryClient.invalidateQueries({
        queryKey: ["openspec", "change", projectId, changeId],
      });

      toast.success("任务规划已确认");
    } catch (error) {
      console.error("Failed to confirm tasks", error);
      toast.error("确认任务失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // 开始实施（/clear + /opsx:apply）
  const handleStartImplementation = async () => {
    try {
      setIsProcessing(true);

      // 1. 创建会话并发送 /clear
      const clearResponse = await honoClient.api.cc["session-processes"].$post({
        json: {
          projectId,
          input: { text: "/clear" },
        },
      });

      const clearData = await clearResponse.json();

      if ("error" in clearData) {
        throw new Error(clearData.error);
      }

      const sessionProcessId = clearData.sessionProcess.id;

      toast.info("正在清空上下文...");

      // 2. 等待一下让 /clear 完成
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. 在同一会话中继续，发送 /opsx:apply
      const applyResponse = await honoClient.api.cc["session-processes"][
        ":sessionProcessId"
      ].continue.$post({
        param: { sessionProcessId },
        json: {
          projectId,
          baseSessionId: clearData.sessionProcess.sessionId,
          input: { text: `/opsx:apply ${changeId}` },
        },
      });

      const applyData = await applyResponse.json();

      if ("error" in applyData) {
        throw new Error(applyData.error);
      }

      toast.success("正在启动实施流程...");

      // 4. 导航到会话页面
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId,
        },
        search: {
          sessionId: applyData.sessionProcess.sessionId,
        },
      });
    } catch (error) {
      console.error("Failed to start implementation", error);
      toast.error("启动实施失败");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Progress Card - for implementing and completed states */}
      {(status === "implementing" || status === "completed") && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            {status === "completed" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            )}
            实施进度
          </h4>
          <Progress value={progress.percent} className="mb-2 h-2" />
          <p className="text-sm text-muted-foreground">
            {progress.completed} / {progress.total} 任务已完成
          </p>

          {status === "completed" && (
            <Alert
              variant="default"
              className="mt-3 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700 dark:text-green-400">
                所有任务已完成！
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-500">
                实施阶段完成，可以进行验收或归档。
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Markdown Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <MarkdownContent content={content} />
      </div>

      {/* Action Cards */}
      {status === "task-planning" && !tasksConfirmed && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            📋 任务规划确认
          </h4>
          <p className="text-sm mb-3 text-muted-foreground">
            请仔细审查任务列表。确认后将清空上下文并开始实施。
          </p>
          <Button
            onClick={handleConfirmTasks}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? "处理中..." : "确认任务规划"}
          </Button>
        </Card>
      )}

      {status === "task-planning" && tasksConfirmed && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
            🚀 准备开始实施
          </h4>
          <p className="text-sm mb-3 text-muted-foreground">
            任务规划已确认。点击按钮后将：
          </p>
          <ol className="text-sm mb-3 ml-4 list-decimal space-y-1 text-muted-foreground">
            <li>
              清空当前上下文 (<code className="text-xs">/clear</code>)
            </li>
            <li>
              启动 OpenSpec 实施流程 (
              <code className="text-xs">/opsx:apply {changeId}</code>)
            </li>
            <li>OpenSpec 将引导 Claude 自动完成所有任务</li>
          </ol>
          <Button
            onClick={handleStartImplementation}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "处理中..." : "开始实施"}
          </Button>
        </Card>
      )}

      {status === "implementing" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>⚙️ 实施进行中</AlertTitle>
          <AlertDescription>
            OpenSpec 正在引导 Claude 执行任务。进度会自动更新。
          </AlertDescription>
        </Alert>
      )}

      {status === "completed" && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <h4 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
            ✨ 实施完成
          </h4>
          <p className="text-sm mb-4 text-muted-foreground">
            所有任务已完成。你可以：
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // 导航到项目页面
                navigate({
                  to: "/projects",
                });
              }}
            >
              查看项目列表
            </Button>
            <Button
              className="bg-gray-600 hover:bg-gray-700"
              onClick={async () => {
                try {
                  const response = await honoClient.api.cc[
                    "session-processes"
                  ].$post({
                    json: {
                      projectId,
                      input: { text: `/opsx:archive ${changeId}` },
                    },
                  });

                  const data = await response.json();

                  if ("error" in data) {
                    throw new Error(data.error);
                  }

                  toast.success("正在归档...");

                  navigate({
                    to: "/projects/$projectId/session",
                    params: {
                      projectId,
                    },
                    search: {
                      sessionId: data.sessionProcess.sessionId,
                    },
                  });
                } catch (error) {
                  console.error("Failed to archive", error);
                  toast.error("归档失败");
                }
              }}
            >
              归档此 Change
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
