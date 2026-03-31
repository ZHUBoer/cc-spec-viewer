import { Trans, useLingui } from "@lingui/react";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon, RefreshCwIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ccModelsQuery } from "@/lib/api/queries";
import { useSwitchCcModelMutation } from "./useChatMutations";

interface ModelSwitchBarProps {
  disabled: boolean;
  requireConfirm?: boolean;
  onSwitched?: () => void;
  onSwitchingChange?: (isSwitching: boolean) => void;
}

export const ModelSwitchBar: FC<ModelSwitchBarProps> = ({
  disabled,
  requireConfirm = false,
  onSwitched,
  onSwitchingChange,
}) => {
  const { i18n } = useLingui();
  const modelsQuery = useQuery({
    ...ccModelsQuery,
    staleTime: 30_000,
    retry: 1,
  });
  const switchModel = useSwitchCcModelMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTargetIndex, setPendingTargetIndex] = useState<number | null>(
    null,
  );

  const data = modelsQuery.data;
  const currentLabel = data?.currentLabel;

  const performSwitch = async (targetIndex: number) => {
    if (Number.isNaN(targetIndex)) {
      return;
    }

    try {
      await switchModel.mutateAsync({ targetIndex });
      toast.success(
        i18n._({
          id: "chat.model_switch.success",
          message: "Model switched successfully",
        }),
        {
          description: i18n._({
            id: "chat.model_switch.force_new_session",
            message: "Switched model and started a new session context.",
          }),
        },
      );
      onSwitched?.();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "MODEL_SWITCH_BLOCKED_RUNNING_TASK"
      ) {
        toast.error(
          i18n._({
            id: "chat.model_switch.blocked_running_task",
            message: "Cannot switch model while a session process is running.",
          }),
        );
        return;
      }
      if (
        error instanceof Error &&
        error.message === "MODEL_SWITCH_UNSUPPORTED_MODE"
      ) {
        toast.error(
          i18n._({
            id: "chat.model_switch.unsupported_mode",
            message: "Model switch is available only in team mode.",
          }),
        );
        return;
      }

      toast.error(
        i18n._({
          id: "chat.model_switch.load_failed",
          message: "Failed to switch model",
        }),
      );
    }
  };

  const handleSwitch = async (value: string) => {
    const targetIndex = Number.parseInt(value, 10);
    if (Number.isNaN(targetIndex)) {
      return;
    }

    if (requireConfirm) {
      setPendingTargetIndex(targetIndex);
      setConfirmOpen(true);
      return;
    }

    await performSwitch(targetIndex);
  };

  const handleConfirmSwitch = async () => {
    if (pendingTargetIndex === null) {
      return;
    }
    setConfirmOpen(false);
    await performSwitch(pendingTargetIndex);
    setPendingTargetIndex(null);
  };

  const handleCancelSwitch = () => {
    setConfirmOpen(false);
    setPendingTargetIndex(null);
  };

  const isSwitching = switchModel.isPending;
  const isLoading = modelsQuery.isLoading;
  const hasModels = (data?.models.length ?? 0) > 0;
  const modelErrorCode =
    data &&
    typeof data === "object" &&
    "code" in data &&
    typeof data.code === "string"
      ? data.code
      : null;
  const isAdaCliMissing = modelErrorCode === "MODEL_SWITCH_ADA_CLI_MISSING";
  const switchSupported =
    data && "switchSupported" in data ? data.switchSupported : true;
  const isPersonalModeUnsupported = !isAdaCliMissing && !switchSupported;
  const personalModelLabel =
    currentLabel ??
    i18n._({
      id: "chat.model_switch.unknown_model",
      message: "Unknown model",
    });
  const isDisabled = disabled || isSwitching || isLoading || !hasModels;

  useEffect(() => {
    onSwitchingChange?.(isSwitching);
  }, [isSwitching, onSwitchingChange]);

  return (
    <>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {isPersonalModeUnsupported ? (
          <>
            <span className="text-sm">
              <Trans
                id="chat.model_switch.personal_title"
                message="Personal Model"
              />
            </span>
            <span className="text-sm text-foreground">
              <Trans
                id="chat.model_switch.personal_unsupported"
                message="Model: {model} (model switch is not supported)"
                values={{ model: personalModelLabel }}
              />
            </span>
          </>
        ) : (
          <>
            <span className="text-sm">
              <Trans id="chat.model_switch.title" message="Team Model" />
            </span>
            {isLoading ? (
              <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
            ) : null}
            <Select
              value={currentLabel ? String(data?.currentIndex) : undefined}
              onValueChange={handleSwitch}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-7 min-h-0 w-auto border-0 bg-transparent px-1 py-0 text-sm font-medium text-foreground shadow-none ring-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                {isSwitching ? (
                  <div className="flex items-center gap-1.5">
                    <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      <Trans
                        id="chat.model_switch.switching"
                        message="Switching..."
                      />
                    </span>
                  </div>
                ) : (
                  <SelectValue
                    placeholder={i18n._({
                      id: "chat.model_switch.current",
                      message: "Select model",
                    })}
                  />
                )}
              </SelectTrigger>
              <SelectContent>
                {(data?.models ?? []).map(
                  (model: { index: number; label: string }) => (
                    <SelectItem key={model.index} value={String(model.index)}>
                      {model.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </>
        )}
        {isAdaCliMissing ? (
          <span className="text-xs text-muted-foreground">
            <Trans
              id="chat.model_switch.missing_ada_cli"
              message="Install ada-cli to enable team model switching."
            />
          </span>
        ) : null}
        {modelsQuery.isError ||
        (!hasModels && switchSupported && !isPersonalModeUnsupported) ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => void modelsQuery.refetch()}
            disabled={disabled || isLoading || isSwitching}
            title={i18n._({
              id: "common.reload",
              message: "Reload",
            })}
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
          </Button>
        ) : null}
      </div>
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setPendingTargetIndex(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <Trans
                id="chat.model_switch.confirm_existing.title"
                message="Switch team model?"
              />
            </DialogTitle>
            <DialogDescription>
              <Trans
                id="chat.model_switch.confirm_existing.description"
                message="Switching model will start a new session and clear current session context."
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelSwitch}
              disabled={isSwitching}
            >
              <Trans id="common.cancel" message="Cancel" />
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirmSwitch()}
              disabled={isSwitching}
            >
              <Trans
                id="chat.model_switch.confirm_existing.confirm"
                message="Switch model"
              />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
