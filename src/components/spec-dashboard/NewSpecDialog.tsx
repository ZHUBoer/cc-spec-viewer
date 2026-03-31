import { useLingui } from "@lingui/react";
import { useNavigate } from "@tanstack/react-router";
import { Info, Loader2, Plus, Trash2 } from "lucide-react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SupportedLocale } from "@/lib/i18n/schema";
import {
  createEmptyD2CMaterial,
  type D2CMaterialDraft,
  hasDraftValidationErrors,
  isD2CTargetScope,
  validateNewChangeDraft,
} from "./newChangeDraft";
import { renderNewChangePrompt } from "./newChangePromptTemplate";
import { savePendingNewChangeDraft } from "./pendingNewChangeDraft";

interface NewSpecDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const createInitialMaterials = (): D2CMaterialDraft[] => [
  createEmptyD2CMaterial(),
];

const createInitialTouchedState = (): boolean[] => [false];

export const NewSpecDialog: FC<NewSpecDialogProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const { i18n } = useLingui();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState("");
  const [enableD2C, setEnableD2C] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementTouched, setRequirementTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [d2cMaterials, setD2CMaterials] = useState<D2CMaterialDraft[]>(
    createInitialMaterials(),
  );
  const [d2cLinkTouched, setD2CLinkTouched] = useState<boolean[]>(
    createInitialTouchedState(),
  );
  const [d2cDescriptionTouched, setD2CDescriptionTouched] = useState<boolean[]>(
    createInitialTouchedState(),
  );
  const locale = (i18n.locale as SupportedLocale) || "en";
  const isChinese = locale === "zh_CN";

  const resetForm = useCallback(() => {
    setRequirement("");
    setEnableD2C(false);
    setIsSubmitting(false);
    setRequirementTouched(false);
    setSubmitAttempted(false);
    setD2CMaterials(createInitialMaterials());
    setD2CLinkTouched(createInitialTouchedState());
    setD2CDescriptionTouched(createInitialTouchedState());
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const validation = useMemo(() => {
    return validateNewChangeDraft({
      requirement,
      enableD2C,
      d2cMaterials,
    });
  }, [d2cMaterials, enableD2C, requirement]);

  const handleMaterialChange = <K extends keyof D2CMaterialDraft>(
    index: number,
    key: K,
    value: D2CMaterialDraft[K],
  ) => {
    setD2CMaterials((current) =>
      current.map((material, currentIndex) => {
        if (currentIndex !== index) {
          return material;
        }
        return {
          ...material,
          [key]: value,
        };
      }),
    );
  };

  const handleAddMaterial = () => {
    setD2CMaterials((current) => [...current, createEmptyD2CMaterial()]);
    setD2CLinkTouched((current) => [...current, false]);
    setD2CDescriptionTouched((current) => [...current, false]);
  };

  const handleRemoveMaterial = (index: number) => {
    setD2CMaterials((current) => {
      if (current.length <= 1) {
        return current;
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
    setD2CLinkTouched((current) => {
      if (current.length <= 1) {
        return current;
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
    setD2CDescriptionTouched((current) => {
      if (current.length <= 1) {
        return current;
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleToggleD2C = (checked: boolean) => {
    setEnableD2C(checked);
    if (checked && d2cMaterials.length === 0) {
      setD2CMaterials(createInitialMaterials());
    }
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setRequirementTouched(true);
    setD2CLinkTouched(d2cMaterials.map(() => true));
    setD2CDescriptionTouched(d2cMaterials.map(() => true));

    if (hasDraftValidationErrors(validation)) {
      return;
    }

    const text = renderNewChangePrompt(
      {
        requirement,
        enableD2C,
        d2cMaterials,
      },
      locale,
    );
    setIsSubmitting(true);
    savePendingNewChangeDraft(projectId, {
      id: crypto.randomUUID(),
      text,
    });
    onOpenChange(false);
    navigate({
      to: "/projects/$projectId/session",
      params: { projectId },
      search: (prev) => {
        const { sessionId: _removed, ...rest } = prev;
        return rest;
      },
    });
  };

  const shouldShowRequirementError = submitAttempted || requirementTouched;
  const shouldShowMaterialSectionError = submitAttempted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-[calc(100vw-2rem)] max-w-3xl flex-col overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>{isChinese ? "新建 Change" : "New Change"}</DialogTitle>
          <DialogDescription>
            {isChinese ? (
              <>
                直接填写需求并发送，系统会自动以 <code>/opsx:new </code>{" "}
                作为前缀启动 spec coding。用户无需复制命令到新会话。
              </>
            ) : (
              <>
                Fill in the request and send directly. The system will prepend{" "}
                <code>/opsx:new </code> automatically.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <label
              htmlFor="new-change-requirement"
              className="text-sm font-medium"
            >
              {isChinese
                ? "告诉我你想实现什么"
                : "Tell me what you want to build"}
            </label>
            <Textarea
              id="new-change-requirement"
              value={requirement}
              onChange={(event) => {
                setRequirement(event.target.value);
              }}
              onBlur={() => {
                setRequirementTouched(true);
              }}
              placeholder={
                isChinese
                  ? "描述你想要的功能，或粘贴飞书文档链接"
                  : "Describe the feature you want, or paste a Lark doc link"
              }
              className="min-h-[120px] break-all"
              aria-invalid={
                shouldShowRequirementError && validation.requirement
                  ? "true"
                  : "false"
              }
            />
            {shouldShowRequirementError && validation.requirement ? (
              <p className="text-sm text-destructive">
                {validation.requirement}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isChinese
                  ? "系统将自动附加结构化信息"
                  : "The system will auto-attach structured info"}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="enable-d2c"
                checked={enableD2C}
                onCheckedChange={(checked) => {
                  handleToggleD2C(checked === true);
                }}
              />
              <div className="space-y-1">
                <label
                  htmlFor="enable-d2c"
                  className="cursor-pointer text-sm font-medium"
                >
                  {isChinese
                    ? "需要设计稿还原？添加 Figma 链接"
                    : "Need design implementation? Add Figma link"}
                </label>
                <p className="text-xs text-muted-foreground">
                  {isChinese
                    ? "仅前端/全栈需求开启"
                    : "For frontend or full-stack changes only"}
                </p>
              </div>
            </div>

            {enableD2C ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    {isChinese ? "D2C 设计材料" : "D2C Design Materials"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isChinese
                      ? "填写 Figma section / node link，支持多条"
                      : "Add Figma section or node links, multiple entries supported"}
                  </p>
                </div>

                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="space-y-2">
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        {isChinese
                          ? "图片转存配置提示"
                          : "Image Upload Configuration"}
                      </p>
                      <p className="text-blue-700 dark:text-blue-400">
                        {isChinese
                          ? "如果你不是智行火车票的成员，请在 MCP 配置中设置以下图片转存相关环境变量："
                          : "If you are not a member of ZhiXing Train Tickets, please set the following image upload environment variables in MCP config:"}
                      </p>
                      <ul className="list-inside list-disc space-y-0.5 font-mono text-xs text-blue-700 dark:text-blue-400">
                        <li>IMAGE_UPLOAD_CHANNEL</li>
                        <li>IMAGE_UPLOAD_SCENE</li>
                        <li>IMAGE_UPLOAD_APP_SECRET</li>
                      </ul>
                      <div className="space-y-1 text-blue-700 dark:text-blue-400">
                        <p>
                          {isChinese
                            ? "• 不配：系统默认使用智行火车票的图片转存配置，默认用户是智行火车票成员。"
                            : "• Not configured: The system uses ZhiXing Train Tickets' default image upload config."}
                        </p>
                        <p>
                          {isChinese
                            ? "• 配了：系统会尝试把图片转存到公司可持续使用的图片服务链接。"
                            : "• Configured: The system will try to upload images to a persistent company image service."}
                        </p>
                      </div>
                      <p>
                        <a
                          href="https://trip.larkenterprise.com/wiki/SeEMwK8O5iTZoAk1E6bcUIQHnWb?from=from_parent_docx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isChinese
                            ? "图片转存/上传服务配置参考文档"
                            : "Image Upload Service Configuration Docs"}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {shouldShowMaterialSectionError && validation.d2cMaterials ? (
                  <p className="text-sm text-destructive">
                    {validation.d2cMaterials}
                  </p>
                ) : null}

                <div className="space-y-3">
                  {d2cMaterials.map((material, index) => {
                    const materialError = validation.materialErrors[index];
                    const showLinkError =
                      submitAttempted || d2cLinkTouched[index] === true;
                    const showDescriptionError =
                      submitAttempted || d2cDescriptionTouched[index] === true;

                    return (
                      <div
                        key={`${index}-${material.link}`}
                        className="rounded-md border bg-background p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {isChinese
                              ? `材料 ${index + 1}`
                              : `Material ${index + 1}`}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => {
                              handleRemoveMaterial(index);
                            }}
                            disabled={d2cMaterials.length <= 1}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {isChinese ? "删除" : "Remove"}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`d2c-link-${index}`}
                            className="text-sm font-medium"
                          >
                            Figma section / node link
                          </label>
                          <Input
                            id={`d2c-link-${index}`}
                            value={material.link}
                            onChange={(event) => {
                              handleMaterialChange(
                                index,
                                "link",
                                event.target.value,
                              );
                            }}
                            onBlur={() => {
                              setD2CLinkTouched((current) =>
                                current.map((item, currentIndex) => {
                                  if (currentIndex === index) {
                                    return true;
                                  }
                                  return item;
                                }),
                              );
                            }}
                            placeholder="请填写对应 section / node link"
                            className="break-all"
                            aria-invalid={
                              showLinkError && materialError?.link
                                ? "true"
                                : "false"
                            }
                          />
                          {showLinkError && materialError?.link ? (
                            <p className="text-sm text-destructive">
                              {materialError.link}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`d2c-description-${index}`}
                            className="text-sm font-medium"
                          >
                            {isChinese ? "关键说明" : "Key Description"}
                          </label>
                          <Textarea
                            id={`d2c-description-${index}`}
                            value={material.description}
                            onChange={(event) => {
                              handleMaterialChange(
                                index,
                                "description",
                                event.target.value,
                              );
                            }}
                            onBlur={() => {
                              setD2CDescriptionTouched((current) =>
                                current.map((item, currentIndex) => {
                                  if (currentIndex === index) {
                                    return true;
                                  }
                                  return item;
                                }),
                              );
                            }}
                            placeholder={
                              isChinese
                                ? "请说明这条设计材料要实现什么、关注哪些交互闭环、涉及哪些关键场景。"
                                : "Describe what this material should implement, which interaction loops matter, and the key scenarios involved."
                            }
                            className="min-h-[96px] break-all"
                            aria-invalid={
                              showDescriptionError && materialError?.description
                                ? "true"
                                : "false"
                            }
                          />
                          {showDescriptionError &&
                          materialError?.description ? (
                            <p className="text-sm text-destructive">
                              {materialError.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {isChinese ? "目标范围" : "Target Scope"}
                          </p>
                          <Select
                            value={material.targetScope}
                            onValueChange={(value) => {
                              if (isD2CTargetScope(value)) {
                                handleMaterialChange(
                                  index,
                                  "targetScope",
                                  value,
                                );
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="page">
                                {isChinese ? "页面" : "Page"}
                              </SelectItem>
                              <SelectItem value="component">
                                {isChinese ? "组件" : "Component"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleAddMaterial}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {isChinese ? "添加材料" : "Add"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isChinese
                  ? "纯后端需求保持关闭即可，后续流程不会感知 D2C。"
                  : "Keep this off for backend-only changes. The rest of the workflow will remain unaware of D2C."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            {isChinese ? "取消" : "Cancel"}
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (submitAttempted && hasDraftValidationErrors(validation))
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isChinese ? "正在跳转到新会话" : "Opening new session"}
              </>
            ) : isChinese ? (
              "发送并创建 Change"
            ) : (
              "Send & Create Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
