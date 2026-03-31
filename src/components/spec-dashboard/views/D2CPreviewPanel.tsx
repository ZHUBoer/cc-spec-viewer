import { useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MousePointer2,
  RefreshCw,
} from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import {
  useContinueSessionProcessMutation,
  useCreateSessionProcessMutation,
} from "@/app/projects/[projectId]/components/chatForm";
import { useSessionProcess } from "@/app/projects/[projectId]/sessions/[sessionId]/hooks/useSessionProcess";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { honoClient } from "@/lib/api/client";
import { D2CCheckpointActionBar } from "./D2CCheckpointActionBar";
import type { D2CCheckpointActionBarState } from "./d2cCheckpointWorkflow";
import { D2C_PREVIEW_DEFAULTS } from "./d2cPreviewDefaults";
import {
  resolveInitDismissButtonLabel,
  resolvePreviewInitBannerState,
} from "./d2cPreviewInitState";
import {
  clampZoomPercent,
  computeFitZoomPercent,
  resolveEffectiveZoomPercent,
} from "./d2cPreviewZoom";

const PREVIEW_URL_FALLBACK = "http://localhost:8123/demo";
const INIT_POLL_INTERVAL = 2000;
const INIT_POLL_MAX_TIMES = 60;
const PREVIEW_WIDTH_OPTIONS = [375, 393, 414, 480, 600, 750] as const;
const PREVIEW_ZOOM_OPTIONS = [50, 75, 100, 125] as const;
const AUTO_ADJUST_ZOOM_CHECKBOX_ID = "d2c-preview-auto-adjust-zoom";
const CONTROL_PANEL_HOVER_CLOSE_DELAY_MS = 120;

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "unknown error";
  }
};

const shouldToastCloneTimeout = (message: string): boolean =>
  message.includes("git clone") && message.includes("30秒");

const resolveEnsureRunningError = (result: unknown): string => {
  if (
    isRecord(result) &&
    "error" in result &&
    typeof result.error === "string" &&
    result.error.length > 0
  ) {
    return result.error;
  }
  return "预览服务启动失败";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

interface D2CPreviewPanelProps {
  projectId: string;
  changeId: string;
  d2cPrimaryState: D2CCheckpointActionBarState | null;
  canUndoFreeze: boolean;
  isApprovingReviewOverride: boolean;
  onContinueToDesign: () => void;
  onFreezeBaseline: () => void;
  onGenerate: () => void;
  onApproveReviewOverride: (reason: string) => Promise<boolean>;
  onRefreshReview: () => void;
  onRequestReview: () => void;
  onRequestReviewFollowup: () => void;
  onUndoFreezeBaseline: () => void;
  isUndoingFreezeBaseline: boolean;
}

interface PreviewArtifact {
  id: string;
  title: string;
  description?: string;
}

interface PreviewProjectStatus {
  valid: boolean;
  previewRoot: string;
  progress?: {
    step: string;
    message?: string;
    updatedAt?: string;
  };
}

const normalizeArtifacts = (data: unknown): PreviewArtifact[] => {
  if (!Array.isArray(data)) return [];
  const result: PreviewArtifact[] = [];
  for (const item of data) {
    if (!isRecord(item)) continue;
    const id = item.id;
    const title = item.title;
    if (typeof id === "string" && typeof title === "string") {
      const description = item.description;
      result.push({
        id,
        title,
        description: typeof description === "string" ? description : undefined,
      });
    }
  }
  return result;
};

const normalizePreviewProjectStatus = (
  data: unknown,
): PreviewProjectStatus | null => {
  if (!isRecord(data)) return null;
  const valid = data.valid;
  const previewRoot = data.previewRoot;
  const progress = data.progress;
  let normalizedProgress: PreviewProjectStatus["progress"] | undefined;
  if (isRecord(progress) && typeof progress.step === "string") {
    normalizedProgress = {
      step: progress.step,
      message:
        typeof progress.message === "string" ? progress.message : undefined,
      updatedAt:
        typeof progress.updatedAt === "string" ? progress.updatedAt : undefined,
    };
  }
  if (typeof valid === "boolean" && typeof previewRoot === "string") {
    return { valid, previewRoot, progress: normalizedProgress };
  }
  return null;
};

interface CorehashInfo {
  filename: string;
  fileDir: string;
  line: number;
  endLine: number;
  nodeCode: string;
  nodeStartLine: number;
  nodeEndLine: number;
}

interface StashItem {
  id: string;
  prompt: string;
  codeInfo: CorehashInfo;
  createdAt: number;
}

type PreviewControlPanel = "size" | "zoom";

const normalizePath = (value: string): string => value.replaceAll("\\", "/");

const parseCorehashInfo = (raw: string): CorehashInfo | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const {
      filename,
      fileDir,
      line,
      endLine,
      nodeCode,
      nodeStartLine,
      nodeEndLine,
    } = parsed;
    if (
      typeof filename !== "string" ||
      typeof fileDir !== "string" ||
      typeof line !== "number" ||
      typeof endLine !== "number" ||
      typeof nodeCode !== "string" ||
      typeof nodeStartLine !== "number" ||
      typeof nodeEndLine !== "number"
    ) {
      return null;
    }
    return {
      filename,
      fileDir,
      line,
      endLine,
      nodeCode,
      nodeStartLine,
      nodeEndLine,
    };
  } catch {
    return null;
  }
};

export const D2CPreviewPanel: FC<D2CPreviewPanelProps> = ({
  projectId,
  changeId,
  d2cPrimaryState,
  canUndoFreeze,
  isApprovingReviewOverride,
  onContinueToDesign,
  onFreezeBaseline,
  onGenerate,
  onApproveReviewOverride,
  onRefreshReview,
  onRequestReview,
  onRequestReviewFollowup,
  onUndoFreezeBaseline,
  isUndoingFreezeBaseline,
}) => {
  const search = useSearch({ strict: false });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeMessageReady, setIframeMessageReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [artifacts, setArtifacts] = useState<PreviewArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    null,
  );
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number>(
    D2C_PREVIEW_DEFAULTS.previewWidth,
  );
  const [manualZoomPercent, setManualZoomPercent] = useState<number>(
    D2C_PREVIEW_DEFAULTS.manualZoomPercent,
  );
  const [autoAdjustZoom, setAutoAdjustZoom] = useState<boolean>(
    D2C_PREVIEW_DEFAULTS.autoAdjustZoom,
  );
  const [previewViewportWidth, setPreviewViewportWidth] = useState<number>(0);
  const [previewViewportHeight, setPreviewViewportHeight] = useState<number>(0);
  const [supportsHoverControlPanel, setSupportsHoverControlPanel] =
    useState(false);
  const [openControlPanel, setOpenControlPanel] =
    useState<PreviewControlPanel | null>(null);
  const [lockedControlPanel, setLockedControlPanel] =
    useState<PreviewControlPanel | null>(null);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [isInitRunning, setIsInitRunning] = useState(false);
  const [previewProjectRoot, setPreviewProjectRoot] = useState<string | null>(
    null,
  );
  const [initProgress, setInitProgress] =
    useState<PreviewProjectStatus["progress"]>(undefined);
  const [initCompleted, setInitCompleted] = useState(false);
  const [hasDismissedInitDialog, setHasDismissedInitDialog] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [stashDialogOpen, setStashDialogOpen] = useState(false);
  const [stashMap, setStashMap] = useState<Record<string, StashItem[]>>({});
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [isSubmittingStash, setIsSubmittingStash] = useState(false);
  const isInitRunningRef = useRef(false);
  const recentSubmitRef = useRef<Map<string, number>>(new Map());
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const controlPanelCloseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const backgroundInitBanner = resolvePreviewInitBannerState({
    hasDismissedInitDialog,
    initCompleted,
    initDialogOpen,
    initProgressStep: initProgress?.step,
    isInitRunning,
    previewUrl,
  });
  const showInitHint = initDialogOpen && !previewUrl && !isInitRunning;
  const initHintTopClass = notice ? "top-20" : "top-4";
  const { getSessionProcess } = useSessionProcess();
  const currentSessionId =
    typeof search === "object" &&
    search !== null &&
    "sessionId" in search &&
    typeof search.sessionId === "string"
      ? search.sessionId
      : undefined;
  const currentSessionProcess = currentSessionId
    ? getSessionProcess(currentSessionId)
    : undefined;
  const createSessionProcess = useCreateSessionProcessMutation(projectId);
  const continueSessionProcess = useContinueSessionProcessMutation(
    projectId,
    currentSessionId ?? "",
  );

  const callPreviewAction = useCallback(
    async (
      action:
        | "list"
        | "check-status"
        | "check-project"
        | "ensure-running"
        | "sync"
        | "trigger-rebuild",
      payload?: Record<string, unknown>,
    ) => {
      const response = await honoClient.api.projects[
        ":projectId"
      ].d2c.preview.$post({
        param: { projectId },
        json: {
          action,
          ...payload,
        },
      });
      return response.json();
    },
    [projectId],
  );

  const checkPreviewProject = useCallback(async () => {
    const result = await callPreviewAction("check-project");
    if ("error" in result) {
      throw new Error(result.error);
    }
    if (!result.success) {
      throw new Error("预览工程状态检查失败");
    }
    const status = normalizePreviewProjectStatus(result.data);
    if (!status) {
      throw new Error("预览工程状态解析失败");
    }
    if (isInitRunningRef.current) {
      setInitProgress(status.progress);
    }
    return status;
  }, [callPreviewAction]);

  const waitForPreviewProjectReady = useCallback(async () => {
    for (let attempt = 0; attempt < INIT_POLL_MAX_TIMES; attempt += 1) {
      const status = await checkPreviewProject();
      if (status.progress?.step === "failed") {
        throw new Error(status.progress.message || "预览工程初始化失败");
      }
      if (status.valid && status.progress?.step === "done") {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, INIT_POLL_INTERVAL));
    }
    return null;
  }, [checkPreviewProject]);

  const runPreviewFlow = useCallback(async () => {
    const ensureResult = await callPreviewAction("ensure-running");
    if ("error" in ensureResult) {
      throw new Error(ensureResult.error);
    }
    if (!ensureResult.success) {
      throw new Error(resolveEnsureRunningError(ensureResult));
    }
    const ensureData = ensureResult.data;
    if (
      "isRunning" in ensureData &&
      ensureData.isRunning &&
      !("starting" in ensureData && ensureData.starting)
    ) {
      setNotice("预览工程正在运行，请耐心等待。");
    }

    const nextPreviewUrl =
      ("previewUrl" in ensureData ? ensureData.previewUrl : undefined) ||
      PREVIEW_URL_FALLBACK;
    setPreviewUrl(nextPreviewUrl);

    const listResult = await callPreviewAction("list", { changeId });
    if ("error" in listResult) {
      throw new Error(listResult.error);
    }
    const listData = normalizeArtifacts(listResult.data);
    if (listData.length === 0) {
      throw new Error("未找到可预览的产物目录");
    }
    setArtifacts(listData);
    const firstArtifact = listData[0];
    if (!firstArtifact) {
      throw new Error("产物列表为空");
    }
    setSelectedArtifactId(firstArtifact.id);

    const statusResult = await callPreviewAction("check-status");
    if ("error" in statusResult) {
      setError(`预览服务检查失败: ${statusResult.error}`);
    } else {
      const statusData = statusResult.data;
      if (!("isRunning" in statusData && statusData.isRunning)) {
        setError("预览服务尚未就绪，若持续失败请检查预览工程日志。");
      }
    }

    const syncResult = await callPreviewAction("sync", {
      changeId,
      artifactId: firstArtifact.id,
    });
    if ("error" in syncResult) {
      throw new Error(syncResult.error);
    }
    if (!syncResult.success) {
      throw new Error("同步预览代码失败");
    }

    const rebuildResult = await callPreviewAction("trigger-rebuild");
    if ("error" in rebuildResult) {
      throw new Error(rebuildResult.error);
    }
    if (!rebuildResult.success) {
      throw new Error("触发预览编译失败");
    }

    setIframeSrc(`${nextPreviewUrl}?t=${Date.now()}`);
  }, [callPreviewAction, changeId]);

  const preparePreview = useCallback(async () => {
    setIsPreparing(true);
    setError(undefined);
    setIframeReady(false);
    setIframeMessageReady(false);
    setNotice(null);

    try {
      const status = await checkPreviewProject();
      setPreviewProjectRoot(status.previewRoot);
      if (!status.valid) {
        setInitProgress(undefined);
        setInitCompleted(false);
        setHasDismissedInitDialog(false);
        setInitDialogOpen(true);
        return;
      }

      await runPreviewFlow();
    } catch (err) {
      setError(formatUnknownError(err));
    } finally {
      setIsPreparing(false);
    }
  }, [checkPreviewProject, runPreviewFlow]);

  const reloadPreview = useCallback(async () => {
    setIsReloading(true);
    setError(undefined);
    setIframeReady(false);
    setIframeMessageReady(false);
    setNotice(null);
    try {
      if (!selectedArtifactId) {
        throw new Error("尚未选择预览产物");
      }

      // 先检查预览服务是否在运行，已运行则直接 sync + rebuild
      const statusResult = await callPreviewAction("check-status");
      if ("error" in statusResult) {
        throw new Error(statusResult.error);
      }
      const statusData = statusResult.data;
      if (!("isRunning" in statusData && statusData.isRunning)) {
        throw new Error("预览服务未运行，请重新初始化预览工程。");
      }

      const syncResult = await callPreviewAction("sync", {
        changeId,
        artifactId: selectedArtifactId,
      });
      if ("error" in syncResult) {
        throw new Error(syncResult.error);
      }
      if (!syncResult.success) {
        throw new Error("同步预览代码失败");
      }

      const rebuildResult = await callPreviewAction("trigger-rebuild");
      if ("error" in rebuildResult) {
        throw new Error(rebuildResult.error);
      }
      if (!rebuildResult.success) {
        throw new Error("触发预览编译失败");
      }
      if (previewUrl) {
        setIframeSrc(`${previewUrl}?t=${Date.now()}`);
      }
    } catch (err) {
      setError(formatUnknownError(err));
    } finally {
      setIsReloading(false);
    }
  }, [callPreviewAction, changeId, previewUrl, selectedArtifactId]);

  const handleSelectArtifact = useCallback(
    async (artifactId: string) => {
      if (artifactId === selectedArtifactId) return;
      setIsReloading(true);
      setError(undefined);
      setIframeReady(false);
      try {
        // 先检查预览服务是否在运行，已运行则直接 sync + rebuild
        const statusResult = await callPreviewAction("check-status");
        if ("error" in statusResult) {
          throw new Error(statusResult.error);
        }
        const statusData = statusResult.data;
        if (!("isRunning" in statusData && statusData.isRunning)) {
          throw new Error("预览服务未运行，请重新初始化预览工程。");
        }

        const syncResult = await callPreviewAction("sync", {
          changeId,
          artifactId,
        });
        if ("error" in syncResult) {
          throw new Error(syncResult.error);
        }
        if (!syncResult.success) {
          throw new Error("同步预览代码失败");
        }

        const rebuildResult = await callPreviewAction("trigger-rebuild");
        if ("error" in rebuildResult) {
          throw new Error(rebuildResult.error);
        }
        if (!rebuildResult.success) {
          throw new Error("触发预览编译失败");
        }

        setSelectedArtifactId(artifactId);
        setIframeMessageReady(false);
        if (previewUrl) {
          setIframeSrc(`${previewUrl}?t=${Date.now()}`);
        }
      } catch (err) {
        setError(formatUnknownError(err));
      } finally {
        setIsReloading(false);
      }
    },
    [callPreviewAction, changeId, previewUrl, selectedArtifactId],
  );

  const handleConfirmInit = useCallback(async () => {
    isInitRunningRef.current = true;
    setIsInitRunning(true);
    setError(undefined);
    setInitProgress({ step: "copying", message: "准备创建预览工程" });
    setInitCompleted(false);
    setHasDismissedInitDialog(false);
    try {
      const ensureResult = await callPreviewAction("ensure-running");
      if ("error" in ensureResult) {
        throw new Error(ensureResult.error);
      }
      if (!ensureResult.success) {
        throw new Error(resolveEnsureRunningError(ensureResult));
      }
      const ensureData = ensureResult.data;
      if (
        "isRunning" in ensureData &&
        ensureData.isRunning &&
        !("starting" in ensureData && ensureData.starting)
      ) {
        setNotice("预览工程正在运行，请耐心等待。");
      }

      const readyStatus = await waitForPreviewProjectReady();
      if (!readyStatus) {
        throw new Error("预览工程初始化超时，请检查预览工程日志。");
      }

      setPreviewProjectRoot(readyStatus.previewRoot);
      await runPreviewFlow();
      setInitCompleted(true);
      setHasDismissedInitDialog(false);
    } catch (err) {
      const errorMessage = formatUnknownError(err);
      if (shouldToastCloneTimeout(errorMessage)) {
        toast.error(errorMessage);
      }
      setError(errorMessage);
      setInitProgress({ step: "failed", message: errorMessage });
    } finally {
      isInitRunningRef.current = false;
      setIsInitRunning(false);
    }
  }, [callPreviewAction, runPreviewFlow, waitForPreviewProjectReady]);

  const handleDismissInitDialog = useCallback(() => {
    setInitDialogOpen(false);
    if (isInitRunning || initProgress?.step === "failed") {
      setHasDismissedInitDialog(true);
      return;
    }
    setHasDismissedInitDialog(false);
    setError("已取消预览工程初始化。");
  }, [initProgress?.step, isInitRunning]);

  const handleCloseInitDialog = useCallback(() => {
    setInitDialogOpen(false);
    setHasDismissedInitDialog(false);
  }, []);

  const handleOpenInitDialog = useCallback(() => {
    setInitDialogOpen(true);
  }, []);

  const postMessageToIframe = useCallback(
    (payload: Record<string, unknown>) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return;
      targetWindow.postMessage(payload, "*");
    },
    [],
  );

  const sendPromptToSession = useCallback(
    async (message: string, successMessage: string) => {
      if (currentSessionId) {
        if (
          currentSessionProcess?.status === "running" &&
          currentSessionProcess.id
        ) {
          await continueSessionProcess.mutateAsync({
            input: { text: message },
            sessionProcessId: currentSessionProcess.id,
          });
        } else {
          await createSessionProcess.mutateAsync({
            input: { text: message },
            baseSessionId: currentSessionId,
          });
        }
        toast.success(successMessage);
        return;
      }

      await navigator.clipboard.writeText(message);
      toast.success("提示词已复制，请在原会话中粘贴发送。", {
        duration: 5000,
      });
    },
    [
      continueSessionProcess,
      createSessionProcess,
      currentSessionId,
      currentSessionProcess?.id,
      currentSessionProcess?.status,
    ],
  );

  const addStashItem = useCallback((item: StashItem, artifactId: string) => {
    setStashMap((current) => {
      const existing = current[artifactId] ?? [];
      return {
        ...current,
        [artifactId]: [...existing, item],
      };
    });
  }, []);

  const clearStashItems = useCallback((artifactId: string) => {
    setStashMap((current) => {
      if (!current[artifactId]) return current;
      const next = { ...current };
      delete next[artifactId];
      return next;
    });
  }, []);

  const removeStashItem = useCallback((artifactId: string, itemId: string) => {
    setStashMap((current) => {
      const existing = current[artifactId];
      if (!existing) return current;
      const nextItems = existing.filter((item) => item.id !== itemId);
      if (nextItems.length === 0) {
        const next = { ...current };
        delete next[artifactId];
        return next;
      }
      return {
        ...current,
        [artifactId]: nextItems,
      };
    });
  }, []);

  const buildStashPromptMessage = useCallback(
    (items: StashItem[], artifactId: string) => {
      const header = `以下是 D2C 产物的局部调整指令（共 ${items.length} 条），请严格遵守范围：`;
      const artifactLine = `- 产物目录：openspec/changes/${changeId}/d2c/${artifactId}`;
      const details = items
        .map((item, index) => {
          const info = item.codeInfo;
          return `\n【指令 ${index + 1}】
- 目标文件：${info.fileDir}
- 行号范围：${info.nodeStartLine}-${info.nodeEndLine}
- 选中代码：
${info.nodeCode}

用户指令：
${item.prompt}`;
        })
        .join("\n");

      const hint =
        "补充提示：这是 UI 基线对齐阶段，请始终同步检查同目录下的 index.module.scss 是否需要配套调整。";
      const constraints = `约束：
1. 仅允许修改当前产物目录内的文件：openspec/changes/${changeId}/d2c/${artifactId}/**
2. 如需调整样式，可修改同目录下的 index.module.scss（或该组件引用到的样式文件），但不得越出当前产物目录。
3. 除非用户明确要求，不要改动 manifest.json 与 review.md。
4. 如果无法定位到对应代码，请说明原因并要求重新选择元素。`;

      return `${header}

${artifactLine}
${details}

${hint}

${constraints}`;
    },
    [changeId],
  );

  const handleSubmitStash = useCallback(async () => {
    if (!selectedArtifactId) {
      toast.error("尚未选择预览产物，无法提交暂存指令");
      return;
    }
    const items = stashMap[selectedArtifactId] ?? [];
    if (items.length === 0) {
      toast.error("当前产物没有暂存指令");
      return;
    }
    if (isSubmittingStash) {
      toast.message("暂存指令提交中，请稍候");
      return;
    }
    setIsSubmittingStash(true);
    try {
      const message = buildStashPromptMessage(items, selectedArtifactId);
      await sendPromptToSession(message, "已提交暂存指令");
      clearStashItems(selectedArtifactId);
      setStashDialogOpen(false);
    } finally {
      setIsSubmittingStash(false);
    }
  }, [
    buildStashPromptMessage,
    clearStashItems,
    isSubmittingStash,
    selectedArtifactId,
    sendPromptToSession,
    stashMap,
  ]);

  const handleElementPrompt = useCallback(
    async (options: {
      prompt: string;
      codeInfo: CorehashInfo;
      isStash: boolean;
    }) => {
      if (!selectedArtifactId) {
        toast.error("尚未选择预览产物，无法执行元素调整");
        return;
      }
      const normalized = normalizePath(options.codeInfo.fileDir);
      const expectedPrefix = `openspec/changes/${changeId}/d2c/${selectedArtifactId}/`;
      if (!normalized.startsWith(expectedPrefix)) {
        toast.error("选中元素不属于当前 D2C 产物目录，请重新选择。");
        return;
      }

      const promptMessage = `以下是 D2C 产物的局部调整指令，请严格遵守范围：

- 产物目录：openspec/changes/${changeId}/d2c/${selectedArtifactId}
- 目标文件：${options.codeInfo.fileDir}
- 行号范围：${options.codeInfo.nodeStartLine}-${options.codeInfo.nodeEndLine}
- 选中代码：
${options.codeInfo.nodeCode}

用户指令：
${options.prompt}

补充提示：这是 UI 基线对齐阶段，请始终同步检查同目录下的 index.module.scss 是否需要配套调整。

约束：
1. 仅允许修改当前产物目录内的文件：openspec/changes/${changeId}/d2c/${selectedArtifactId}/**
2. 如需调整样式，可修改同目录下的 index.module.scss（或该组件引用到的样式文件），但不得越出当前产物目录。
3. 除非用户明确要求，不要改动 manifest.json 与 review.md。
4. 如果无法定位到对应代码，请说明原因并要求重新选择元素。`;

      if (!options.isStash) {
        setIsSubmittingPrompt(true);
      }
      try {
        const successMessage = options.isStash
          ? "已暂存元素调整指令"
          : "已发送元素调整指令";
        await sendPromptToSession(promptMessage, successMessage);
      } finally {
        if (!options.isStash) {
          setIsSubmittingPrompt(false);
        }
      }
    },
    [changeId, selectedArtifactId, sendPromptToSession],
  );

  const handleIframeMessage = useCallback(
    (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow) return;
      if (event.source !== iframeRef.current.contentWindow) return;
      const data = event.data;
      if (!isRecord(data) || typeof data.type !== "string") return;

      if (data.type === "iframeLoaded") {
        setIframeMessageReady(true);
        return;
      }

      if (data.type === "aiPrompt" || data.type === "aiStash") {
        const prompt = data.prompt;
        const codeInfoRaw = data.codeInfo;
        if (typeof prompt !== "string" || prompt.trim().length === 0) {
          toast.error("未收到有效的元素调整指令");
          return;
        }
        if (typeof codeInfoRaw !== "string") {
          toast.error("缺少元素定位信息，无法执行调整");
          return;
        }
        const parsed = parseCorehashInfo(codeInfoRaw);
        if (!parsed) {
          toast.error("元素定位信息解析失败，请重新选择元素");
          return;
        }
        const submitKey = [
          data.type,
          parsed.fileDir,
          parsed.nodeStartLine,
          parsed.nodeEndLine,
          prompt.trim(),
        ].join("|");
        const now = Date.now();
        const lastSentAt = recentSubmitRef.current.get(submitKey);
        if (lastSentAt && now - lastSentAt < 800) {
          toast.message("操作过快，请稍候");
          return;
        }
        recentSubmitRef.current.set(submitKey, now);
        if (data.type === "aiPrompt" && isSubmittingPrompt) {
          toast.message("提交处理中，请稍候");
          return;
        }
        if (data.type === "aiStash") {
          if (!selectedArtifactId) {
            toast.error("尚未选择预览产物，无法暂存");
            return;
          }
          const item: StashItem = {
            id: ulid(),
            prompt: prompt.trim(),
            codeInfo: parsed,
            createdAt: Date.now(),
          };
          addStashItem(item, selectedArtifactId);
          const stashCount = (stashMap[selectedArtifactId]?.length ?? 0) + 1;
          toast.success(`已暂存，当前产物共 ${stashCount} 条`);
          return;
        }
        void handleElementPrompt({
          prompt: prompt.trim(),
          codeInfo: parsed,
          isStash: false,
        });
      }

      if (data.type === "iframeError") {
        const errorMessage =
          "error" in data && isRecord(data.error) && "message" in data.error
            ? data.error.message
            : undefined;
        if (typeof errorMessage === "string" && errorMessage.length > 0) {
          setError(`预览脚本错误: ${errorMessage}`);
        }
      }
    },
    [
      addStashItem,
      handleElementPrompt,
      isSubmittingPrompt,
      selectedArtifactId,
      stashMap,
    ],
  );

  const handleToggleSelectMode = useCallback(() => {
    const next = !isSelectMode;
    setIsSelectMode(next);
    if (iframeMessageReady) {
      postMessageToIframe({ type: "toggleSelectMode", enable: next });
    }
  }, [iframeMessageReady, isSelectMode, postMessageToIframe]);

  const resolveProgressIndex = useCallback(() => {
    if (!isInitRunning) return -1;
    const step = initProgress?.step;
    if (!step) return -1;
    if (step === "copying") return 0;
    if (step === "installing") return 1;
    if (step === "starting") return 2;
    if (step === "done") return 3;
    if (step === "failed") return 3;
    return -1;
  }, [initProgress?.step, isInitRunning]);

  const progressIndex = resolveProgressIndex();
  const progressSteps = ["创建预览工程", "安装依赖", "启动预览服务", "完成"];

  useEffect(() => {
    if (isInitRunningRef.current) return; // 初始化进行中，不重复触发
    preparePreview();
  }, [preparePreview]);

  useEffect(() => {
    if (error) {
      setNotice(null);
    }
  }, [error]);

  useEffect(() => {
    if (!notice) return;
    if (!iframeReady) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [iframeReady, notice]);

  useEffect(() => {
    setStashMap({});
    setStashDialogOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  useEffect(() => {
    if (!iframeMessageReady) return;
    postMessageToIframe({ type: "toggleSelectMode", enable: isSelectMode });
  }, [iframeMessageReady, isSelectMode, postMessageToIframe]);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const rect = viewport.getBoundingClientRect();
      setPreviewViewportWidth(Math.max(0, Math.floor(rect.width)));
      setPreviewViewportHeight(Math.max(0, Math.floor(rect.height)));
    };

    updateViewportSize();
    const observer = new ResizeObserver(() => updateViewportSize());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateSupport = () => {
      setSupportsHoverControlPanel(mediaQuery.matches);
    };
    updateSupport();
    mediaQuery.addEventListener("change", updateSupport);
    return () => {
      mediaQuery.removeEventListener("change", updateSupport);
    };
  }, []);

  const clearControlPanelCloseTimer = useCallback(() => {
    if (controlPanelCloseTimerRef.current === null) return;
    clearTimeout(controlPanelCloseTimerRef.current);
    controlPanelCloseTimerRef.current = null;
  }, []);

  const closeControlPanels = useCallback(() => {
    clearControlPanelCloseTimer();
    setOpenControlPanel(null);
    setLockedControlPanel(null);
  }, [clearControlPanelCloseTimer]);

  const openPanelOnHover = useCallback(
    (panel: PreviewControlPanel) => {
      if (!supportsHoverControlPanel) return;
      if (lockedControlPanel !== null) return;
      clearControlPanelCloseTimer();
      setOpenControlPanel(panel);
    },
    [
      clearControlPanelCloseTimer,
      lockedControlPanel,
      supportsHoverControlPanel,
    ],
  );

  const schedulePanelCloseOnHoverLeave = useCallback(
    (panel: PreviewControlPanel) => {
      if (!supportsHoverControlPanel) return;
      if (lockedControlPanel !== null) return;
      clearControlPanelCloseTimer();
      controlPanelCloseTimerRef.current = setTimeout(() => {
        setOpenControlPanel((currentPanel) =>
          currentPanel === panel ? null : currentPanel,
        );
      }, CONTROL_PANEL_HOVER_CLOSE_DELAY_MS);
    },
    [
      clearControlPanelCloseTimer,
      lockedControlPanel,
      supportsHoverControlPanel,
    ],
  );

  useEffect(
    () => () => {
      clearControlPanelCloseTimer();
    },
    [clearControlPanelCloseTimer],
  );

  const toggleControlPanelLock = useCallback(
    (panel: PreviewControlPanel) => {
      clearControlPanelCloseTimer();
      setLockedControlPanel((currentLockedPanel) => {
        if (currentLockedPanel === panel) {
          setOpenControlPanel(null);
          return null;
        }
        setOpenControlPanel(panel);
        return panel;
      });
    },
    [clearControlPanelCloseTimer],
  );

  const handleControlPanelOpenChange = useCallback(
    (panel: PreviewControlPanel, isOpen: boolean) => {
      clearControlPanelCloseTimer();
      if (isOpen) {
        setOpenControlPanel(panel);
        return;
      }
      setOpenControlPanel((currentPanel) =>
        currentPanel === panel ? null : currentPanel,
      );
      setLockedControlPanel((currentLockedPanel) =>
        currentLockedPanel === panel ? null : currentLockedPanel,
      );
    },
    [clearControlPanelCloseTimer],
  );

  const handleSelectWidth = useCallback(
    (width: number) => {
      setPreviewWidth(width);
      closeControlPanels();
    },
    [closeControlPanels],
  );

  const fitZoomPercent = computeFitZoomPercent(
    previewViewportWidth,
    previewWidth,
  );
  const effectiveZoomPercent = resolveEffectiveZoomPercent({
    autoAdjustZoom,
    fitZoomPercent,
    manualZoomPercent,
  });
  const zoomScale = effectiveZoomPercent / 100;
  const iframeBaseHeight = Math.max(previewViewportHeight, 1);
  const scaledPreviewWidth = Math.max(1, Math.round(previewWidth * zoomScale));
  const scaledPreviewHeight = Math.max(
    1,
    Math.round(iframeBaseHeight * zoomScale),
  );

  const handleSelectZoomPercent = useCallback(
    (percent: number) => {
      setManualZoomPercent(clampZoomPercent(percent));
      setAutoAdjustZoom(false);
      closeControlPanels();
    },
    [closeControlPanels],
  );

  const handleFitToWindow = useCallback(() => {
    setManualZoomPercent(fitZoomPercent);
    setAutoAdjustZoom(false);
    closeControlPanels();
  }, [closeControlPanels, fitZoomPercent]);

  const handleAutoAdjustZoomChange = useCallback(
    (checked: boolean | "indeterminate") => {
      setAutoAdjustZoom(checked === true);
    },
    [],
  );

  const selectedStashItems = selectedArtifactId
    ? (stashMap[selectedArtifactId] ?? [])
    : [];

  if (error && !previewUrl) {
    const isBlockingError =
      error.includes("预览工程") ||
      error.includes("Node") ||
      error.includes("模板不存在");

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isBlockingError ? "预览工程未就绪" : "预览启动失败"}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {isBlockingError ? (
              <p className="text-xs">
                请检查预览工程模板是否存在，或点击上方"初始化预览工程"按钮创建。
              </p>
            ) : null}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-1.5"
          onClick={() => preparePreview()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {notice ? (
        <div className="absolute left-4 top-4 z-10 max-w-md">
          <Alert className="border-border bg-background/95">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>提示</AlertTitle>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      {backgroundInitBanner ? (
        <div className={`absolute left-4 ${initHintTopClass} z-10 max-w-md`}>
          <Alert className="border-border bg-background/95">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{backgroundInitBanner.title}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{backgroundInitBanner.description}</p>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleOpenInitDialog}
                >
                  {backgroundInitBanner.actionLabel}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      {showInitHint ? (
        <div className={`absolute left-4 ${initHintTopClass} z-10 max-w-md`}>
          <Alert className="border-border bg-background/95">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>需要初始化预览工程</AlertTitle>
            <AlertDescription>
              检测到预览工程未就绪，需要复制模板并安装依赖后才能预览。
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <Dialog
        open={initDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDismissInitDialog();
            return;
          }
          setInitDialogOpen(true);
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>需要初始化预览工程</DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              未检测到完整的预览工程，初始化会复制模板到项目同级目录，
              安装依赖并启动 `npm run dev`。确认后才能正常内嵌预览。
              {previewProjectRoot ? ` 目标路径：${previewProjectRoot}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            {progressSteps.map((label, index) => {
              const isDone =
                isInitRunning &&
                (progressIndex > index || initProgress?.step === "done");
              const isActive = isInitRunning && progressIndex === index;
              const isFailed =
                isInitRunning &&
                initProgress?.step === "failed" &&
                index === progressSteps.length - 1;
              return (
                <div key={label} className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isActive && isInitRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                  )}
                  <div className="flex-1">
                    <div className="text-foreground">{label}</div>
                    {isActive && initProgress?.message ? (
                      <div className="text-muted-foreground">
                        {initProgress.message}
                      </div>
                    ) : null}
                    {isFailed && initProgress?.message ? (
                      <div className="text-destructive">
                        {initProgress.message}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-muted-foreground">
                    {isDone ? "已完成" : isActive ? "进行中" : "等待"}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDismissInitDialog}>
              {resolveInitDismissButtonLabel(isInitRunning)}
            </Button>
            {initCompleted ? (
              <Button onClick={handleCloseInitDialog}>完成并进入预览</Button>
            ) : (
              <Button onClick={handleConfirmInit} disabled={isInitRunning}>
                {isInitRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    初始化中
                  </>
                ) : (
                  "确认初始化"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex w-48 flex-col border-r border-border bg-muted/20">
        <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
          产物列表
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {artifacts.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">
              暂无可预览产物
            </div>
          ) : (
            artifacts.map((artifact) => (
              <Button
                key={artifact.id}
                variant={
                  artifact.id === selectedArtifactId ? "secondary" : "ghost"
                }
                size="sm"
                className="mb-2 h-auto w-full flex-col items-start gap-0 px-2 py-1.5 text-xs"
                onClick={() => handleSelectArtifact(artifact.id)}
                disabled={isPreparing || isReloading}
              >
                <span className="w-full truncate text-left">
                  {artifact.title}
                </span>
                {artifact.description ? (
                  <span className="w-full truncate text-left text-[10px] font-normal text-muted-foreground">
                    {artifact.description}
                  </span>
                ) : null}
              </Button>
            ))
          )}
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col">
        <div className="border-b border-border bg-emerald-50/50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
          当前处于 D2C checkpoint。请先查看静态 UI，再在底部完成 D2C
          审查、补充说明或确认 UI 基线。
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={reloadPreview}
            disabled={isReloading || isPreparing}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新/重新预览
          </Button>
          <Button
            variant={isSelectMode ? "default" : "ghost"}
            size="sm"
            className={`cursor-pointer gap-1.5 text-xs transition-all${isSelectMode ? " ring-2 ring-primary/40 ring-offset-1" : ""}`}
            onClick={handleToggleSelectMode}
            disabled={!iframeMessageReady || !selectedArtifactId}
          >
            <MousePointer2
              className={`h-3.5 w-3.5${isSelectMode ? "" : " text-muted-foreground"}`}
            />
            {isSelectMode ? "退出选中" : "元素选中"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => setStashDialogOpen(true)}
            disabled={!selectedArtifactId}
          >
            暂存
            {selectedArtifactId
              ? ` (${stashMap[selectedArtifactId]?.length ?? 0})`
              : ""}
          </Button>
          {isSubmittingPrompt ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              提交中...
            </span>
          ) : null}
          <Popover
            open={openControlPanel === "size"}
            onOpenChange={(nextOpen) =>
              handleControlPanelOpenChange("size", nextOpen)
            }
          >
            <div
              className="flex items-center"
              onMouseEnter={() => openPanelOnHover("size")}
              onMouseLeave={() => schedulePanelCloseOnHoverLeave("size")}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={() => toggleControlPanelLock("size")}
                >
                  <span>预览尺寸</span>
                  <span className="text-muted-foreground">
                    {previewWidth}px
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-36 p-2"
                align="start"
                sideOffset={6}
                onMouseEnter={() => openPanelOnHover("size")}
                onMouseLeave={() => schedulePanelCloseOnHoverLeave("size")}
              >
                <div className="flex flex-col gap-1">
                  {PREVIEW_WIDTH_OPTIONS.map((width) => {
                    const isActive = previewWidth === width;
                    return (
                      <Button
                        key={width}
                        type="button"
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 justify-between px-2 text-xs"
                        onClick={() => handleSelectWidth(width)}
                      >
                        <span>{width}</span>
                        <span className="text-muted-foreground">px</span>
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </div>
          </Popover>
          <Popover
            open={openControlPanel === "zoom"}
            onOpenChange={(nextOpen) =>
              handleControlPanelOpenChange("zoom", nextOpen)
            }
          >
            <div
              className="flex items-center"
              onMouseEnter={() => openPanelOnHover("zoom")}
              onMouseLeave={() => schedulePanelCloseOnHoverLeave("zoom")}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={() => toggleControlPanelLock("zoom")}
                >
                  <span>缩放</span>
                  <span className="text-muted-foreground">
                    {effectiveZoomPercent}%
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-52 p-2"
                align="start"
                sideOffset={6}
                onMouseEnter={() => openPanelOnHover("zoom")}
                onMouseLeave={() => schedulePanelCloseOnHoverLeave("zoom")}
              >
                <div className="flex flex-col gap-1">
                  {PREVIEW_ZOOM_OPTIONS.map((zoomPercent) => {
                    const isActive =
                      !autoAdjustZoom && manualZoomPercent === zoomPercent;
                    return (
                      <Button
                        key={zoomPercent}
                        type="button"
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 justify-between px-2 text-xs"
                        onClick={() => handleSelectZoomPercent(zoomPercent)}
                      >
                        <span>{zoomPercent}%</span>
                        {isActive ? <span>已选</span> : null}
                      </Button>
                    );
                  })}
                  <div className="mt-1 border-t border-border pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-between px-2 text-xs"
                      onClick={handleFitToWindow}
                    >
                      <span>Fit to window</span>
                      <span className="text-muted-foreground">
                        {fitZoomPercent}%
                      </span>
                    </Button>
                    <div className="mt-1 flex items-center justify-between rounded-sm px-2 py-1.5">
                      <label
                        htmlFor={AUTO_ADJUST_ZOOM_CHECKBOX_ID}
                        className="cursor-pointer text-xs text-muted-foreground"
                      >
                        自动适配
                      </label>
                      <Checkbox
                        id={AUTO_ADJUST_ZOOM_CHECKBOX_ID}
                        checked={autoAdjustZoom}
                        onCheckedChange={handleAutoAdjustZoomChange}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </div>
          </Popover>
          {isPreparing || isReloading ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {isPreparing ? "准备预览中..." : "刷新中..."}
            </span>
          ) : null}
        </div>

        {error ? (
          error.includes("超时") || error.includes("就绪") ? null : (
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">预览警告: {error}</span>
              <div className="flex items-center gap-1">
                {(error.includes("未运行") || error.includes("初始化")) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 cursor-pointer px-2 text-xs font-medium text-primary hover:text-primary"
                    onClick={handleOpenInitDialog}
                  >
                    初始化预览工程
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 cursor-pointer px-2 text-xs"
                  onClick={reloadPreview}
                  disabled={isReloading}
                >
                  重试
                </Button>
              </div>
            </div>
          )
        ) : null}

        <div
          ref={previewViewportRef}
          className="relative flex-1 min-h-0 overflow-auto"
        >
          {!iframeReady ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {isPreparing ? "正在准备预览..." : "正在加载预览..."}
                </span>
              </div>
            </div>
          ) : null}
          <div className="flex min-h-full min-w-full items-start justify-center">
            <div
              className="relative shrink-0"
              style={{
                width: scaledPreviewWidth,
                height: scaledPreviewHeight,
              }}
            >
              {iframeSrc ? (
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: previewWidth,
                    height: iframeBaseHeight,
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    src={iframeSrc}
                    className="h-full w-full border-0"
                    title="D2C 预览"
                    onLoad={() => setIframeReady(true)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {d2cPrimaryState ? (
          <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
            <D2CCheckpointActionBar
              primaryState={d2cPrimaryState}
              onGenerate={onGenerate}
              onFreezeBaseline={onFreezeBaseline}
              onContinueToDesign={onContinueToDesign}
              onApproveReviewOverride={onApproveReviewOverride}
              onRefreshReview={onRefreshReview}
              onRequestReview={onRequestReview}
              onRequestReviewFollowup={onRequestReviewFollowup}
              onUndoFreezeBaseline={
                canUndoFreeze ? () => onUndoFreezeBaseline() : undefined
              }
              isApprovingReviewOverride={isApprovingReviewOverride}
              isUndoingFreezeBaseline={isUndoingFreezeBaseline}
            />
          </div>
        ) : null}
      </div>
      <Dialog open={stashDialogOpen} onOpenChange={setStashDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>暂存指令</DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              当前产物：
              {selectedArtifactId
                ? ` openspec/changes/${changeId}/d2c/${selectedArtifactId}`
                : " 未选择"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedStashItems.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                暂无暂存指令
              </div>
            ) : (
              selectedStashItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border bg-background p-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">
                        {item.codeInfo.fileDir}:{item.codeInfo.nodeStartLine}-
                        {item.codeInfo.nodeEndLine}
                      </div>
                      <div className="whitespace-pre-wrap text-foreground">
                        {item.codeInfo.nodeCode}
                      </div>
                      <div className="whitespace-pre-wrap text-muted-foreground">
                        指令：{item.prompt}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        if (!selectedArtifactId) return;
                        removeStashItem(selectedArtifactId, item.id);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedArtifactId) return;
                clearStashItems(selectedArtifactId);
              }}
              disabled={!selectedArtifactId || isSubmittingStash}
            >
              清空暂存
            </Button>
            <Button
              onClick={handleSubmitStash}
              disabled={!selectedArtifactId || isSubmittingStash}
            >
              {isSubmittingStash ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中
                </>
              ) : (
                "提交暂存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
