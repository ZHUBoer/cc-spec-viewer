import type { D2CInfo } from "@/lib/openspec/d2c";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export type SpecD2CFooterMode = "default" | "checkpoint" | "design-ready";

export interface D2CSummaryItem {
  key:
    | "changeKind"
    | "materials"
    | "targetScope"
    | "generatedAt"
    | "reviewStatus"
    | "entryFiles";
  label: string;
  values: string[];
  valueTone: "default" | "code";
}

export type ReviewPart =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "block";
      content: string;
      id: string;
      blockContent: string;
    };

const MARKDOWN_HEADER_REGEX = /^(#{1,6})\s+(.+)$/;

const USER_INPUT_BLOCK_REGEX =
  /<!-- USER_INPUT_START:(.*?) -->([\s\S]*?)<!-- USER_INPUT_END:\1 -->/g;

export const generateMarkdownHeadingId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
};

export const extractMarkdownToc = (
  content: string,
  maxDepth = 3,
): TocItem[] => {
  return content.split("\n").flatMap((line) => {
    const match = line.match(MARKDOWN_HEADER_REGEX);

    if (!match?.[1] || !match[2]) {
      return [];
    }

    const level = match[1].length;

    if (level > maxDepth) {
      return [];
    }

    const text = match[2].trim();

    return [
      {
        level,
        text,
        id: generateMarkdownHeadingId(text),
      },
    ];
  });
};

export const parseReviewBlocks = (content: string) => {
  const parts: ReviewPart[] = [];
  const questionBlockIds: string[] = [];

  let lastIndex = 0;
  let match = USER_INPUT_BLOCK_REGEX.exec(content);

  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    const id = match[1] ?? "";
    const blockContent = match[2]?.trim() ?? "";

    if (id.length > 0) {
      const isQuestion =
        /\[\s*\]|\[x\]/i.test(blockContent) ||
        blockContent.includes("待决策问题");

      if (isQuestion) {
        questionBlockIds.push(id);
      }

      parts.push({
        type: "block",
        id,
        blockContent,
        content: match[0] ?? "",
      });
    }

    lastIndex = USER_INPUT_BLOCK_REGEX.lastIndex;
    match = USER_INPUT_BLOCK_REGEX.exec(content);
  }

  USER_INPUT_BLOCK_REGEX.lastIndex = 0;

  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return {
    parts,
    questionBlockIds,
  };
};

export const parseTasksProgress = (content: string) => {
  const checkboxes = content.match(/- \[(x| )\]/g) ?? [];
  const completed = checkboxes.filter((checkbox) =>
    checkbox.includes("x"),
  ).length;
  const total = checkboxes.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percent,
  };
};

export const getSpecD2CFooterMode = ({
  isSpec,
  hasD2CGuard,
  isSpecConfirmed,
  isD2CFrozen,
  canEnterDesign,
}: {
  isSpec: boolean;
  hasD2CGuard: boolean;
  isSpecConfirmed: boolean;
  isD2CFrozen: boolean;
  canEnterDesign: boolean;
}): SpecD2CFooterMode => {
  if (!isSpec || !hasD2CGuard || !isSpecConfirmed) {
    return "default";
  }

  if (!isD2CFrozen || !canEnterDesign) {
    return "checkpoint";
  }

  return "design-ready";
};

export const getD2CStatusBadgeText = ({
  isSpecConfirmed,
  isD2CFrozen,
  canEnterDesign,
}: {
  isSpecConfirmed: boolean;
  isD2CFrozen: boolean;
  canEnterDesign: boolean;
}) => {
  if (!isSpecConfirmed) {
    return "待确认 Spec";
  }

  if (isD2CFrozen && canEnterDesign) {
    return "UI 基线已确认";
  }

  if (isD2CFrozen && !canEnterDesign) {
    return "审查未通过，待处理";
  }

  return "已进入 D2C checkpoint";
};

export const getD2CStepRequirements = ({
  isSpecConfirmed,
  hasD2CMaterials,
  hasGeneratedFiles,
  isD2CFrozen,
  hasReviewResult,
  canEnterDesign,
}: {
  isSpecConfirmed: boolean;
  hasD2CMaterials: boolean;
  hasGeneratedFiles: boolean;
  isD2CFrozen: boolean;
  hasReviewResult: boolean;
  canEnterDesign: boolean;
}) => ({
  missingSpecConfirmation: !isSpecConfirmed,
  missingMaterials: !hasD2CMaterials,
  missingGeneratedFiles: !hasGeneratedFiles,
  missingBaselineConfirmation: !isD2CFrozen,
  missingReviewResult: !hasReviewResult,
  reviewNotPassed: hasReviewResult && !canEnterDesign,
});

export const getD2CCheckpointActionState = ({
  hasD2CMaterials,
  hasGeneratedFiles,
  isD2CFrozen,
  hasReviewResult,
  canEnterDesign,
  isGeneratingD2C,
  isFreezingD2C,
}: {
  hasD2CMaterials: boolean;
  hasGeneratedFiles: boolean;
  isD2CFrozen: boolean;
  hasReviewResult: boolean;
  canEnterDesign: boolean;
  isGeneratingD2C: boolean;
  isFreezingD2C: boolean;
}) => {
  const isBusy = isGeneratingD2C || isFreezingD2C;

  return {
    canGenerate: hasD2CMaterials && !isBusy && !isD2CFrozen,
    canPreview: hasGeneratedFiles && !isBusy,
    canFreeze:
      hasGeneratedFiles &&
      hasReviewResult &&
      canEnterDesign &&
      !isBusy &&
      !isD2CFrozen,
  };
};

export const buildD2CSummaryItems = (d2cInfo: D2CInfo): D2CSummaryItem[] => {
  const materials =
    d2cInfo.materials.length > 0
      ? d2cInfo.materials.map((material, index) => {
          const description = material.description
            ? `${material.description} - `
            : "";
          return `${index + 1}. [${material.scope}] ${description}${material.link}`;
        })
      : ["未填写"];

  return [
    {
      key: "changeKind",
      label: "变更类型",
      values: [d2cInfo.changeKind],
      valueTone: "default",
    },
    {
      key: "materials",
      label: "设计材料",
      values: materials,
      valueTone: "code",
    },
    {
      key: "targetScope",
      label: "目标范围",
      values: [d2cInfo.targetScope],
      valueTone: "default",
    },
    {
      key: "generatedAt",
      label: "生成时间",
      values: [d2cInfo.generatedAt ?? "Spec 确认后生成"],
      valueTone: "code",
    },
    {
      key: "reviewStatus",
      label: "D2C 审查",
      values: [
        d2cInfo.reviewSummary
          ? `${d2cInfo.reviewStatus}${d2cInfo.reviewOverride ? "（人工放行）" : ""} - ${d2cInfo.reviewSummary}`
          : `${d2cInfo.reviewStatus}${d2cInfo.reviewOverride ? "（人工放行）" : ""}`,
      ],
      valueTone: "default",
    },
    {
      key: "entryFiles",
      label: "入口文件",
      values: d2cInfo.entryFiles.length > 0 ? d2cInfo.entryFiles : ["尚未记录"],
      valueTone: "code",
    },
  ];
};

export interface D2CStepperStep {
  key: "confirm-spec" | "generate" | "review" | "freeze";
  label: string;
  status: "completed" | "active" | "pending" | "error";
  description?: string;
}

export const getD2CStepperState = ({
  isSpecConfirmed,
  hasD2CMaterials,
  hasGeneratedFiles,
  isD2CFrozen,
  hasReviewResult,
  canEnterDesign,
  reviewSummary,
}: {
  isSpecConfirmed: boolean;
  hasD2CMaterials: boolean;
  hasGeneratedFiles: boolean;
  isD2CFrozen: boolean;
  hasReviewResult: boolean;
  canEnterDesign: boolean;
  reviewSummary?: string;
}): D2CStepperStep[] => {
  const confirmSpecStatus: D2CStepperStep["status"] = isSpecConfirmed
    ? "completed"
    : "active";

  const resolveGenerateStatus = (): D2CStepperStep["status"] => {
    if (!isSpecConfirmed) return "pending";
    if (hasReviewResult && !canEnterDesign) return "error";
    if (hasGeneratedFiles && hasReviewResult && canEnterDesign)
      return "completed";
    return "active";
  };
  const generateStatus = resolveGenerateStatus();

  const resolveReviewStatus = (): D2CStepperStep["status"] => {
    if (!hasGeneratedFiles) return "pending";
    if (hasReviewResult && canEnterDesign) return "completed";
    if (hasReviewResult && !canEnterDesign) return "error";
    return "active";
  };
  const reviewStatus = resolveReviewStatus();

  const resolveFreezeStatus = (): D2CStepperStep["status"] => {
    if (isD2CFrozen) return "completed";
    if (hasReviewResult && canEnterDesign && hasGeneratedFiles) return "active";
    return "pending";
  };
  const freezeStatus = resolveFreezeStatus();

  const generateDescription =
    generateStatus === "error"
      ? reviewSummary
        ? `审查未通过：${reviewSummary}`
        : "审查未通过，请调整后重新生成"
      : !hasD2CMaterials && isSpecConfirmed
        ? "请先在 Spec 中补充设计材料"
        : undefined;

  return [
    {
      key: "confirm-spec",
      label: "确认 Spec",
      status: confirmSpecStatus,
    },
    {
      key: "generate",
      label: "生成静态 UI",
      status: generateStatus,
      description: generateDescription,
    },
    {
      key: "review",
      label: "完成 D2C 审查",
      status: reviewStatus,
    },
    {
      key: "freeze",
      label: "确认 UI 基线",
      status: freezeStatus,
    },
  ];
};
