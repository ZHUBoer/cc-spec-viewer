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

  // 确认任务规划并开始实施
  const handleConfirmAndStart = async () => {
    try {
      setIsProcessing(true);

      // 1. 更新 tasks.md 状态
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

      // 2. 创建新会话并发送 /clear (相当于新开干净会话)
      toast.info("正在创建实施会话...");

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

      // 3. 等待一下让 /clear 完成
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 4. 在同一会话中继续，发送 /opsx:apply
      toast.info("正在启动实施 Agent...");

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

      toast.success("实施流程已启动，即将跳转...");

      // 5. 导航到会话页面
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
      console.error("Failed to confirm and start", error);
      toast.error("启动实施失败，请重试");
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
            🚀 确认并实施
          </h4>
          <p className="text-sm mb-3 text-muted-foreground">
            确认任务规划无误后，将自动创建新会话并启动实施 Agent。
          </p>
          <Button
            onClick={handleConfirmAndStart}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? "正在启动..." : "确认任务规划并实施"}
          </Button>
        </Card>
      )}

      {/* Fallback state if somehow confirmed but not implementing yet (should normally jump) */}
      {status === "task-planning" && tasksConfirmed && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            任务已确认，正在等待状态更新...
          </p>
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
