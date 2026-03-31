import { Trans, useLingui } from "@lingui/react";
import type { FC } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteSession } from "../../hooks/useDeleteSession";

type DeleteSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sessionId: string;
  sessionTitle: string;
  onSuccess?: () => void;
};

export const DeleteSessionDialog: FC<DeleteSessionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  sessionId,
  sessionTitle,
  onSuccess,
}) => {
  const { i18n } = useLingui();
  const deleteSession = useDeleteSession();

  const handleDelete = () => {
    deleteSession.mutate(
      { projectId, sessionId },
      {
        onSuccess: () => {
          toast.success(
            i18n._({
              id: "session.delete.success",
              message: "Session deleted successfully",
            }),
          );
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(
            i18n._({
              id: "session.delete.failed",
              message: "Failed to delete session",
            }),
            {
              description: error.message,
            },
          );
        },
      },
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            <Trans id="session.delete_dialog.title" />
          </DialogTitle>
          <DialogDescription className="break-words">
            <Trans
              id="session.delete_dialog.description.compact"
              message="确定要删除这个会话吗？下方展示的是将被删除的会话标题。"
            />
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 rounded-md border bg-muted/30 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            <Trans id="session.delete_dialog.title" />
          </p>
          <div className="max-h-32 overflow-y-auto text-sm leading-6 text-foreground break-all">
            {sessionTitle}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={deleteSession.isPending}
            className="cursor-pointer"
          >
            <Trans id="common.cancel" />
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSession.isPending}
            className="cursor-pointer"
          >
            {deleteSession.isPending ? (
              <Trans id="common.deleting" />
            ) : (
              <Trans id="common.delete" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
