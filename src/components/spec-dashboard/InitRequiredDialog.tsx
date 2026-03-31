import { Trans } from "@lingui/react";
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
  reason?: "init" | "upgrade-template";
  onClose: () => void;
  onGoToInit: () => void;
}

export const InitRequiredDialog: FC<InitRequiredDialogProps> = ({
  open,
  reason = "init",
  onClose,
  onGoToInit,
}) => {
  const isTemplateUpgrade = reason === "upgrade-template";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <DialogTitle>
              {isTemplateUpgrade ? (
                <Trans
                  id="spec_dashboard.dialog.workflow_upgrade.title"
                  message="Workflow version update detected"
                />
              ) : (
                <Trans
                  id="spec_dashboard.dialog.init_required.title"
                  message="Initialization required"
                />
              )}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {isTemplateUpgrade ? (
              <Trans
                id="spec_dashboard.dialog.workflow_upgrade.description"
                message="This project is not on the latest workflow version. Upgrade first to get the latest capabilities; your current profile configuration will be preserved."
              />
            ) : (
              <Trans
                id="spec_dashboard.dialog.init_required.description"
                message='Before using SpecForge features, you need to finish project initialization. Click "Go initialize" to continue.'
              />
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            <Trans id="common.cancel" />
          </Button>
          <Button
            type="button"
            onClick={() => {
              onGoToInit();
            }}
            className="cursor-pointer"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {isTemplateUpgrade ? (
              <Trans
                id="spec_dashboard.dialog.workflow_upgrade.go"
                message="Go upgrade workflow version"
              />
            ) : (
              <Trans
                id="spec_dashboard.dialog.init_required.go"
                message="Go initialize"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
