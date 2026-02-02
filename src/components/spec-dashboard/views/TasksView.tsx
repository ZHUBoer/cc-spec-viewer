import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
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
  readonly?: boolean;
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

// Layout components for consistent styling with DesignReviewView
const Header = () => (
  <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
    <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      Task Planning Mode
    </h4>
    <p className="text-sm text-foreground/80">
      请审查生成的实施任务列表。确保所有步骤完整且合理。
    </p>
  </div>
);

export const TasksView: FC<TasksViewProps> = ({
  projectId,
  changeId,
  content,
  status,
  readonly = false,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const progress = useMemo(() => parseTasksProgress(content), [content]);
  const tasksConfirmed = content.includes("<!-- TASKS_CONFIRMED: true -->");

  const isCompleted = status === "completed";
  const isImplementing = status === "implementing";
  const isPlanning = status === "task-planning";

  const handleRegenerateTasks = async () => {
    try {
      setIsProcessing(true);
      const message = `我已经查看了 tasks.md 的任务规划，你需要根据我的意见来修改任务列表：\n（请在此处补充具体的修改意见，例如：细分某个任务、添加测试步骤等）。\n\n直接修改 tasks.md 文件，不要创建新的文件。`;

      await navigator.clipboard.writeText(message);
      toast.success(
        "提示词已复制！请前往左侧【会话列表】，选择刚才的会话，粘贴并补充意见。",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
      toast.error("复制失败，请手动复制");
    } finally {
      setIsProcessing(false);
    }
  };

  // 确认任务规划并开始实施
  const handleConfirmAndStart = async () => {
    try {
      setIsProcessing(true);

      // 1. 更新 tasks.md 状态
      const confirmationTag = "<!-- TASKS_CONFIRMED: true -->";
      const timeTagPrefix = "<!-- CONFIRMED_AT: ";

      let updatedContent = content;

      // 移除旧的确认标记（如果有）
      if (updatedContent.includes(confirmationTag)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${confirmationTag}\\s*`, "g"),
          "",
        );
      }
      if (updatedContent.includes(timeTagPrefix)) {
        updatedContent = updatedContent.replace(
          /<!-- CONFIRMED_AT: .*? -->\s*/g,
          "",
        );
      }

      // 追加新的标记
      updatedContent =
        updatedContent.trim() +
        "\n\n" +
        confirmationTag +
        "\n" +
        timeTagPrefix +
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

      // 2. 创建新会话并直接发送 /opsx:apply
      toast.info("正在启动实施 Agent...");

      const createResponse = await honoClient.api.cc["session-processes"].$post(
        {
          json: {
            projectId,
            input: { text: `/opsx:apply ${changeId}` },
          },
        },
      );

      const createData = await createResponse.json();

      if ("error" in createData) {
        throw new Error(createData.error);
      }

      toast.success("实施流程已启动，即将跳转...");

      // 3. 导航到会话页面
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId,
        },
        search: {
          sessionId: createData.sessionProcess.sessionId,
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
    <div className="flex h-full bg-background animate-in fade-in duration-300 relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0 relative mb-40">
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          {isPlanning && <Header />}

          {/* Progress Card - for implementing and completed states */}
          {(isImplementing || isCompleted) && (
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                实施进度
              </h4>
              <Progress value={progress.percent} className="mb-2 h-2" />
              <p className="text-sm text-muted-foreground">
                {progress.completed} / {progress.total} 任务已完成
              </p>

              {isCompleted && (
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
        </div>
      </div>

      {/* Footer / Global Actions (Persistent) */}
      {!readonly && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background shadow-lg z-10 transition-transform">
          <div className="max-w-4xl mx-auto">
            {/* Planning State Actions */}
            {isPlanning && !tasksConfirmed && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <h4 className="font-semibold text-base">任务规划评审</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 cursor-pointer"
                    variant="outline"
                    onClick={handleRegenerateTasks}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isProcessing ? "处理中..." : "重新生成任务"}
                  </Button>

                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    onClick={handleConfirmAndStart}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isProcessing ? "请求中..." : "确认计划并开始实施"}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-muted-foreground flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    点击"重新生成"将复制提示词，请在左侧会话中发送以调整任务。
                    点击"确认"将自动创建新会话并启动实施 Agent。
                  </span>
                </div>
              </>
            )}

            {/* Planning Confirmed (Waiting) */}
            {isPlanning && tasksConfirmed && (
              <div className="text-center py-2">
                <span className="flex items-center justify-center gap-2 text-primary font-medium">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  任务已确认，正在启动实施流程...
                </span>
              </div>
            )}

            {/* Implementing State */}
            {isImplementing && (
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div>
                    <p className="font-medium text-sm">实施进行中</p>
                    <p className="text-xs text-muted-foreground">
                      执行任务时，请保持页面开启。
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirmAndStart}
                  disabled={isProcessing}
                  className="cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  重试实施
                </Button>
              </div>
            )}

            {/* Completed State */}
            {isCompleted && (
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1">
                  <p className="font-medium text-green-600 dark:text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    实施已完成
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate({ to: "/projects" });
                  }}
                  className="cursor-pointer"
                >
                  查看项目列表
                </Button>

                <Button
                  className="bg-gray-600 hover:bg-gray-700 cursor-pointer"
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
                        params: { projectId },
                        search: { sessionId: data.sessionProcess.sessionId },
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
