export type D2CTargetScope = "page" | "component";

export interface D2CMaterialDraft {
  link: string;
  description: string;
  targetScope: D2CTargetScope;
}

export interface NewChangeDraft {
  requirement: string;
  enableD2C: boolean;
  d2cMaterials: D2CMaterialDraft[];
}

export interface D2CMaterialValidationError {
  link?: string;
  description?: string;
}

export interface NewChangeDraftValidationResult {
  requirement?: string;
  d2cMaterials?: string;
  materialErrors: D2CMaterialValidationError[];
}

const scopeLabelMap: Record<D2CTargetScope, string> = {
  page: "页面 / Page",
  component: "组件 / Component",
};

export const createEmptyD2CMaterial = (): D2CMaterialDraft => ({
  link: "",
  description: "",
  targetScope: "page",
});

export const isD2CTargetScope = (value: string): value is D2CTargetScope => {
  return value === "page" || value === "component";
};

export const validateNewChangeDraft = (
  draft: NewChangeDraft,
): NewChangeDraftValidationResult => {
  const materialErrors: D2CMaterialValidationError[] = draft.d2cMaterials.map(
    () => ({}),
  );

  const result: NewChangeDraftValidationResult = {
    materialErrors,
  };

  if (draft.requirement.trim().length === 0) {
    result.requirement = "请填写需求内容或飞书云文档链接：";
  }

  if (!draft.enableD2C) {
    return result;
  }

  if (draft.d2cMaterials.length === 0) {
    result.d2cMaterials = "启用 D2C 后至少需要一条设计材料";
    return result;
  }

  draft.d2cMaterials.forEach((material, index) => {
    const itemError = materialErrors[index];
    if (!itemError) {
      return;
    }
    if (material.link.trim().length === 0) {
      itemError.link = "请填写 Figma section / node link";
    }
    if (material.description.trim().length === 0) {
      itemError.description = "请填写关键说明";
    }
  });

  return result;
};

export const hasDraftValidationErrors = (
  validation: NewChangeDraftValidationResult,
): boolean => {
  if (validation.requirement || validation.d2cMaterials) {
    return true;
  }

  return validation.materialErrors.some((item) => {
    return Boolean(item.link || item.description);
  });
};

export const getD2CTargetScopeLabel = (scope: D2CTargetScope): string => {
  return scopeLabelMap[scope];
};
