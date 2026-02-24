import { AlertCircle, Settings2 } from "lucide-react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InitRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onGoToInit: () => void;
}

export const InitRequiredDialog: FC<InitRequiredDialogProps> = ({
  open,
  onClose,
  onGoToInit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <DialogTitle>需要初始化配置</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            在使用 SpecForge 功能之前，需要先完成项目配置初始化。
            请点击"去初始化"按钮进行配置。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() => {
              onGoToInit();
              onClose();
            }}
            className="cursor-pointer"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            去初始化
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
