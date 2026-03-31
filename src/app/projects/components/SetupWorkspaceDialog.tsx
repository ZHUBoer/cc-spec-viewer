import { Trans } from "@lingui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { honoClient } from "@/lib/api/client";
import { projectListQuery } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import { DirectoryPicker } from "./DirectoryPicker";

// 工作区名称校验：禁止包含 \ / : * ? " < > |
const INVALID_NAME_REGEX = /[\\/:*?"<>|]/;
// Windows 保留名
const RESERVED_NAMES_REGEX = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;

type StepStatus = "completed" | "active" | "pending";

const stepStatusColors: Record<StepStatus, string> = {
  completed:
    "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-600",
  active:
    "border-primary bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary",
  pending:
    "border-muted-foreground/30 bg-muted/20 text-muted-foreground dark:bg-muted/10",
};

const connectorColors: Record<StepStatus, string> = {
  completed: "bg-emerald-400 dark:bg-emerald-600",
  active: "bg-primary/40",
  pending: "bg-muted-foreground/20",
};

export const SetupWorkspaceDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [parentPath, setParentPath] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [additionalDirectories, setAdditionalDirectories] = useState<string[]>(
    [],
  );
  const [isAddingDirectory, setIsAddingDirectory] = useState(false);
  const [pendingDirPath, setPendingDirPath] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const nameError = useMemo(() => {
    if (!workspaceName) return null;
    if (INVALID_NAME_REGEX.test(workspaceName)) return "invalid";
    if (RESERVED_NAMES_REGEX.test(workspaceName)) return "reserved";
    return null;
  }, [workspaceName]);

  const setupWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await honoClient.api.workspaces.$post({
        json: { parentPath, workspaceName, additionalDirectories },
      });

      if (!response.ok) {
        throw new Error("Failed to set up workspace");
      }

      return await response.json();
    },

    onSuccess: async (result) => {
      if (!("projectId" in result)) {
        toast.error(result.error);
        return;
      }
      toast.success("Workspace created successfully");
      await queryClient.invalidateQueries({
        queryKey: projectListQuery.queryKey,
      });
      setOpen(false);
      navigate({
        to: "/projects/$projectId/session",
        params: {
          projectId: result.projectId,
        },
        search: (prev) => prev,
      });
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to set up workspace",
      );
    },
  });

  const handleConfirmAdd = () => {
    if (!pendingDirPath) return;
    if (additionalDirectories.includes(pendingDirPath)) {
      toast.warning(<Trans id="workspace.setup.directories.duplicate" />);
      return;
    }
    setAdditionalDirectories((prev) => [...prev, pendingDirPath]);
    setPendingDirPath("");
    setIsAddingDirectory(false);
  };

  const handleRemoveDirectory = (index: number) => {
    setAdditionalDirectories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setStep(1);
      setParentPath("");
      setWorkspaceName("");
      setAdditionalDirectories([]);
      setIsAddingDirectory(false);
      setPendingDirPath("");
    }
  };

  const canGoNext = (currentStep: number): boolean => {
    if (currentStep === 1) {
      return !!parentPath && !!workspaceName.trim() && !nameError;
    }
    return true;
  };

  const getStepStatus = (s: number): StepStatus => {
    if (s < step) return "completed";
    if (s === step) return "active";
    return "pending";
  };

  const stepLabels = [
    { step: 1, label: <Trans id="workspace.setup.step1.title" /> },
    { step: 2, label: <Trans id="workspace.setup.step2.title" /> },
    { step: 3, label: <Trans id="workspace.setup.step3.title" /> },
  ];

  // 预览路径：前端拼接仅用于展示
  const previewPath =
    parentPath && workspaceName
      ? `${parentPath}${parentPath.endsWith("/") || parentPath.endsWith("\\") ? "" : "/"}${workspaceName}`
      : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="new-workspace-button" className="cursor-pointer">
          <FolderPlus className="w-4 h-4 mr-2" />
          <Trans id="workspace.new" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="new-workspace-modal">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            <Trans id="workspace.setup.title" />
          </DialogTitle>
          <DialogDescription>
            <Trans id="workspace.setup.description" />
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Stepper 指示器 */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map(({ step: s, label }, index) => {
              const status = getStepStatus(s);
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                        stepStatusColors[status],
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        s
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        status === "completed" &&
                          "text-emerald-700 dark:text-emerald-300",
                        status === "active" && "text-foreground",
                        status === "pending" && "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {index < stepLabels.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 rounded-full transition-colors",
                        connectorColors[getStepStatus(s)],
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: 选择父目录 + 工作区名称 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  <Trans id="workspace.setup.step1.parent_dir" />
                </h4>
                <DirectoryPicker onPathChange={setParentPath} />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  <Trans id="workspace.setup.name.label" />
                </h4>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="my-workspace"
                  className={cn(
                    nameError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {nameError === "invalid" && (
                  <p className="text-xs text-destructive mt-1">
                    <Trans id="workspace.setup.name.invalid" />
                  </p>
                )}
                {nameError === "reserved" && (
                  <p className="text-xs text-destructive mt-1">
                    <Trans id="workspace.setup.name.reserved" />
                  </p>
                )}
                {parentPath && workspaceName && !nameError && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Trans id="workspace.setup.name.preview" />{" "}
                    <span className="font-mono">{previewPath}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 关联目录管理 */}
          {step === 2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                <Trans id="workspace.setup.directories.title" />
              </h4>

              {additionalDirectories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  <Trans id="workspace.setup.directories.empty" />
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-auto">
                  {additionalDirectories.map((dir, index) => (
                    <div
                      key={dir}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="truncate mr-2 font-mono text-xs">
                        {dir}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 cursor-pointer"
                        onClick={() => handleRemoveDirectory(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isAddingDirectory ? (
                <div className="space-y-2 rounded-md border p-3">
                  <DirectoryPicker onPathChange={setPendingDirPath} />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setIsAddingDirectory(false);
                        setPendingDirPath("");
                      }}
                    >
                      <Trans id="common.action.cancel" />
                    </Button>
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      disabled={!pendingDirPath}
                      onClick={handleConfirmAdd}
                    >
                      <Trans id="workspace.setup.directories.confirm_add" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setIsAddingDirectory(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <Trans id="workspace.setup.directories.add" />
                </Button>
              )}
            </div>
          )}

          {/* Step 3: 确认汇总 */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                <Trans id="workspace.setup.step3.title" />
              </h4>
              <div className="rounded-md border p-4 space-y-3 bg-muted/20">
                <div>
                  <span className="text-xs text-muted-foreground">
                    <Trans id="workspace.setup.summary.path" />
                  </span>
                  <p className="text-sm font-mono mt-0.5">{previewPath}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    <Trans id="workspace.setup.summary.directories" />
                  </span>
                  {additionalDirectories.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <Trans id="workspace.setup.directories.empty" />
                    </p>
                  ) : (
                    <div className="space-y-1 mt-1">
                      {additionalDirectories.map((dir) => (
                        <p key={dir} className="text-sm font-mono">
                          {dir}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step === 1 && (
            <>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleOpenChange(false)}
              >
                <Trans id="common.action.cancel" />
              </Button>
              <Button
                className="cursor-pointer"
                disabled={!canGoNext(1)}
                onClick={() => setStep(2)}
              >
                <Trans id="workspace.setup.action.next" />
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setIsAddingDirectory(false);
                  setPendingDirPath("");
                  setStep(1);
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <Trans id="workspace.setup.action.back" />
              </Button>
              <Button className="cursor-pointer" onClick={() => setStep(3)}>
                <Trans id="workspace.setup.action.next" />
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <Trans id="workspace.setup.action.back" />
              </Button>
              <Button
                className="cursor-pointer"
                onClick={async () => await setupWorkspaceMutation.mutateAsync()}
                disabled={setupWorkspaceMutation.isPending}
              >
                {setupWorkspaceMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <Trans id="workspace.setup.action.creating" />
                  </>
                ) : (
                  <Trans id="workspace.setup.action.create" />
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
