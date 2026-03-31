import { CheckCircle2Icon, LoaderIcon, XCircleIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../../components/ui/dialog";
import type {
  FeishuDialogActions,
  FeishuDialogState,
} from "./useFeishuResolver";

interface FeishuResolverDialogsProps {
  state: FeishuDialogState;
  actions: FeishuDialogActions;
}

/**
 * 飞书文档解析对话框组件
 *
 * 根据 useFeishuResolver 的状态渲染不同阶段的对话框：
 * - loading: 下载中
 * - allFailed: 解析失败提示（全部失败或部分失败）
 */
export const FeishuResolverDialogs: FC<FeishuResolverDialogsProps> = ({
  state,
  actions,
}) => {
  if (state === null) return null;

  const handleDismiss = () => {
    if (state.type === "loading") {
      actions.onCancel();
    } else {
      actions.onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleDismiss}>
      <DialogContent
        className="sm:max-w-2xl max-w-[calc(100vw-2rem)] mx-4"
        showCloseButton={false}
        onInteractOutside={(e) => {
          e.preventDefault();
          handleDismiss();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleDismiss();
        }}
      >
        {state.type === "loading" && (
          <LoadingDialog urls={state.urls} onCancel={actions.onCancel} />
        )}

        {state.type === "allFailed" && (
          <AllFailedDialog
            errors={state.errors}
            succeeded={state.succeeded}
            onClose={actions.onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

// ========== 子对话框组件 ==========

/** 下载中对话框 */
const LoadingDialog: FC<{
  urls: string[];
  onCancel: () => void;
}> = ({ urls, onCancel }) => (
  <>
    <DialogHeader>
      <div className="flex items-center gap-2">
        <LoaderIcon className="w-5 h-5 animate-spin text-blue-500" />
        <DialogTitle>正在获取飞书文档内容...</DialogTitle>
      </div>
      <DialogDescription className="pt-2">
        正在下载 {urls.length} 个飞书文档，请稍候...
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-2 max-h-40 overflow-y-auto">
      {urls.map((url) => (
        <div
          key={url}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm"
        >
          <span className="break-all text-muted-foreground">{url}</span>
        </div>
      ))}
    </div>

    <div className="text-xs text-muted-foreground text-center pt-2">
      首次使用可能需要完成飞书授权
    </div>

    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="cursor-pointer"
      >
        取消
      </Button>
    </DialogFooter>
  </>
);

/** 失败对话框（全部失败或部分失败） */
const AllFailedDialog: FC<{
  errors: Array<{ url: string; error: string }>;
  succeeded?: string[];
  onClose: () => void;
}> = ({ errors, succeeded = [], onClose }) => {
  const allFailed = succeeded.length === 0;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-red-500" />
          <DialogTitle>飞书文档解析失败</DialogTitle>
        </div>
        <DialogDescription className="pt-2">
          {allFailed
            ? "所有飞书文档解析失败，请稍后重试。消息内容已保留。"
            : `部分飞书文档解析失败（${succeeded.length} 个成功，${errors.length} 个失败），请稍后重试。消息内容已保留。`}
        </DialogDescription>
      </DialogHeader>

      {/* 成功列表（部分失败时显示） */}
      {succeeded.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">
            成功解析:
          </div>
          {succeeded.map((url) => (
            <div
              key={url}
              className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-green-500/10 text-sm"
            >
              <CheckCircle2Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
              <span className="break-all text-muted-foreground truncate">
                {url}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 失败列表 */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-muted-foreground">
          解析失败:
        </div>
        {errors.map(({ url, error }) => (
          <div
            key={url}
            className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-sm"
          >
            <XCircleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0">
              <div className="break-all text-muted-foreground truncate">
                {url}
              </div>
              <div className="text-xs text-red-500">{error}</div>
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="button" onClick={onClose} className="cursor-pointer">
          知道了
        </Button>
      </DialogFooter>
    </>
  );
};
