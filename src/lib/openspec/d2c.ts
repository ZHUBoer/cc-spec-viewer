export type D2CTargetScope = "page" | "module" | "component" | "unknown";
export type D2CChangeKind = "new" | "modify" | "unknown";
export type D2CReviewStatus = "passed" | "failed" | "unknown";

export interface D2CMaterial {
  link: string;
  description?: string;
  scope: D2CTargetScope;
  artifactId?: string;
}

export interface D2CManifest {
  enabled: boolean;
  changeKind: D2CChangeKind;
  materials: D2CMaterial[];
  reviewStatus: D2CReviewStatus;
  canEnterDesign: boolean;
  reviewSummary?: string;
  generator?: string;
  generatedAt?: string;
  baselineFrozenAt?: string;
  entryFiles: string[];
  sourceHash?: string;
  previewPath?: string;
  reviewPath?: string;
}

export interface D2CArtifactFile {
  name: string;
  content: string;
}

export interface D2CInfo {
  enabled: boolean;
  changeKind: D2CChangeKind;
  materials: D2CMaterial[];
  targetScope: D2CTargetScope;
  baselineFrozen: boolean;
  baselineFrozenAt?: string;
  reviewOverride: boolean;
  reviewOverrideAt?: string;
  reviewOverrideReason?: string;
  reviewStatus: D2CReviewStatus;
  canEnterDesign: boolean;
  effectiveCanEnterDesign: boolean;
  reviewSummary?: string;
  generatedAt?: string;
  generator?: string;
  previewPath?: string;
  reviewPath?: string;
  entryFiles: string[];
  hasManifest: boolean;
  hasGeneratedFiles: boolean;
  generatedFiles: D2CArtifactFile[];
  previewFiles: D2CArtifactFile[];
}

const matchCommentValue = (
  content: string,
  key: string,
): string | undefined => {
  const pattern = new RegExp(`<!--\\s*${key}:\\s*([\\s\\S]*?)\\s*-->`);
  const match = content.match(pattern);
  return match?.[1]?.trim();
};

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return value.trim().toLowerCase() === "true";
};

const normalizeTargetScope = (value: string | undefined): D2CTargetScope => {
  if (value === "page" || value === "module" || value === "component") {
    return value;
  }
  return "unknown";
};

const normalizeChangeKind = (value: string | undefined): D2CChangeKind => {
  if (value === "new" || value === "modify") {
    return value;
  }
  return "unknown";
};

const normalizeReviewStatus = (value: string | undefined): D2CReviewStatus => {
  if (value === "passed" || value === "failed") {
    return value;
  }
  return "unknown";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readOptionalString = (
  value: Record<string, unknown>,
  field: string,
): string | undefined => {
  const target = value[field];
  return typeof target === "string" && target.trim().length > 0
    ? target.trim()
    : undefined;
};

const readStringArray = (
  value: Record<string, unknown>,
  field: string,
): string[] => {
  const target = value[field];
  if (!Array.isArray(target)) {
    return [];
  }
  return target.filter((item): item is string => typeof item === "string");
};

const toMaterial = (
  value: unknown,
  defaultScope: D2CTargetScope,
): D2CMaterial | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const link = readOptionalString(value, "link");
  if (!link) {
    return undefined;
  }

  const normalizedScope = normalizeTargetScope(
    readOptionalString(value, "scope"),
  );
  const artifactId = readOptionalString(value, "artifactId");

  return {
    link,
    description: readOptionalString(value, "description"),
    scope: normalizedScope === "unknown" ? defaultScope : normalizedScope,
    artifactId,
  };
};

const readMaterialArray = (
  value: unknown,
  defaultScope: D2CTargetScope,
): D2CMaterial[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const material = toMaterial(item, defaultScope);
    return material ? [material] : [];
  });
};

const parseProposalMaterials = (
  rawValue: string | undefined,
  defaultScope: D2CTargetScope,
): D2CMaterial[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    return readMaterialArray(parsed, defaultScope);
  } catch {
    return [];
  }
};

const buildLegacyMaterial = (
  link: string | undefined,
  defaultScope: D2CTargetScope,
): D2CMaterial[] => {
  if (!link) {
    return [];
  }

  return [
    {
      link,
      scope: defaultScope,
    },
  ];
};

const pickPreferredMaterials = (
  primary: D2CMaterial[],
  fallback: D2CMaterial[],
): D2CMaterial[] => {
  if (primary.length > 0) {
    return primary;
  }
  return fallback;
};

const materialKey = (material: D2CMaterial): string =>
  `${material.link}::${material.scope}::${material.description ?? ""}`;

const mergeMaterialArtifactIds = (
  primary: D2CMaterial[],
  fallback: D2CMaterial[],
): D2CMaterial[] => {
  if (primary.length === 0) {
    return fallback;
  }
  if (fallback.length === 0) {
    return primary;
  }

  const artifactMap = new Map<string, string>();
  for (const material of fallback) {
    if (material.artifactId) {
      artifactMap.set(materialKey(material), material.artifactId);
    }
  }

  return primary.map((material, index) => {
    if (material.artifactId) {
      return material;
    }

    const fallbackMaterial = fallback[index];
    if (
      fallbackMaterial?.artifactId &&
      fallbackMaterial.link === material.link &&
      fallbackMaterial.scope === material.scope &&
      (fallbackMaterial.description ?? "") === (material.description ?? "")
    ) {
      return { ...material, artifactId: fallbackMaterial.artifactId };
    }

    const artifactId = artifactMap.get(materialKey(material));
    if (!artifactId) {
      return material;
    }
    return { ...material, artifactId };
  });
};

export const extractD2CInfoFromSpec = (
  specContent: string | undefined,
): D2CInfo | undefined => {
  if (!specContent) {
    return undefined;
  }

  const enabled = parseBoolean(matchCommentValue(specContent, "D2C_ENABLED"));
  const targetScope = normalizeTargetScope(
    matchCommentValue(specContent, "D2C_TARGET_SCOPE"),
  );
  const changeKind = normalizeChangeKind(
    matchCommentValue(specContent, "D2C_CHANGE_KIND"),
  );
  const materials = pickPreferredMaterials(
    parseProposalMaterials(
      matchCommentValue(specContent, "D2C_MATERIALS_JSON"),
      targetScope,
    ),
    buildLegacyMaterial(
      matchCommentValue(specContent, "D2C_FIGMA_URL"),
      targetScope,
    ),
  );
  const baselineFrozen = parseBoolean(
    matchCommentValue(specContent, "D2C_BASELINE_FROZEN"),
  );
  const baselineFrozenAt = matchCommentValue(
    specContent,
    "D2C_BASELINE_FROZEN_AT",
  );
  const reviewOverride = parseBoolean(
    matchCommentValue(specContent, "D2C_REVIEW_OVERRIDE"),
  );
  const reviewOverrideAt = matchCommentValue(
    specContent,
    "D2C_REVIEW_OVERRIDE_AT",
  );
  const reviewOverrideReason = matchCommentValue(
    specContent,
    "D2C_REVIEW_OVERRIDE_REASON",
  );

  if (
    !enabled &&
    materials.length === 0 &&
    !baselineFrozen &&
    !reviewOverride
  ) {
    return undefined;
  }

  return {
    enabled,
    changeKind,
    materials,
    targetScope:
      targetScope !== "unknown"
        ? targetScope
        : (materials[0]?.scope ?? "unknown"),
    baselineFrozen,
    baselineFrozenAt,
    reviewOverride,
    reviewOverrideAt,
    reviewOverrideReason,
    reviewStatus: "unknown",
    canEnterDesign: false,
    effectiveCanEnterDesign: reviewOverride,
    reviewSummary: undefined,
    generatedAt: undefined,
    generator: undefined,
    previewPath: undefined,
    reviewPath: undefined,
    entryFiles: [],
    hasManifest: false,
    hasGeneratedFiles: false,
    generatedFiles: [],
    previewFiles: [],
  };
};

export const extractD2CInfoFromProposal = extractD2CInfoFromSpec;

export const parseD2CManifest = (
  manifestContent: string | undefined,
): D2CManifest | undefined => {
  if (!manifestContent) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(manifestContent);
    if (!isRecord(parsed)) {
      return undefined;
    }
    const targetScope = normalizeTargetScope(
      readOptionalString(parsed, "targetScope"),
    );
    const materials = pickPreferredMaterials(
      readMaterialArray(parsed.materials, targetScope),
      buildLegacyMaterial(readOptionalString(parsed, "figmaUrl"), targetScope),
    );
    return {
      enabled: Boolean(parsed.enabled),
      changeKind: normalizeChangeKind(readOptionalString(parsed, "changeKind")),
      materials,
      reviewStatus: normalizeReviewStatus(
        readOptionalString(parsed, "reviewStatus"),
      ),
      canEnterDesign: Boolean(parsed.canEnterDesign),
      reviewSummary: readOptionalString(parsed, "reviewSummary"),
      generator: readOptionalString(parsed, "generator"),
      generatedAt: readOptionalString(parsed, "generatedAt"),
      baselineFrozenAt: readOptionalString(parsed, "baselineFrozenAt"),
      entryFiles: readStringArray(parsed, "entryFiles"),
      sourceHash: readOptionalString(parsed, "sourceHash"),
      previewPath: readOptionalString(parsed, "previewPath"),
      reviewPath: readOptionalString(parsed, "reviewPath"),
    };
  } catch {
    return undefined;
  }
};

export const mergeD2CInfo = (options: {
  specInfo?: D2CInfo;
  proposalInfo?: D2CInfo;
  manifest?: D2CManifest;
  generatedFiles?: D2CArtifactFile[];
  previewFiles?: D2CArtifactFile[];
}): D2CInfo | undefined => {
  const specInfo = options.specInfo ?? options.proposalInfo;
  const { manifest } = options;

  if (!specInfo && !manifest) {
    return undefined;
  }

  const generatedFiles = options.generatedFiles ?? [];
  const previewFiles = options.previewFiles ?? [];
  const materials = mergeMaterialArtifactIds(
    specInfo?.materials ?? [],
    manifest?.materials ?? [],
  );
  const specScope = specInfo?.targetScope;

  return {
    enabled: specInfo?.enabled ?? manifest?.enabled ?? false,
    changeKind: specInfo?.changeKind ?? manifest?.changeKind ?? "unknown",
    materials,
    targetScope:
      specScope && specScope !== "unknown"
        ? specScope
        : (materials[0]?.scope ?? "unknown"),
    baselineFrozen: specInfo?.baselineFrozen ?? false,
    baselineFrozenAt: specInfo?.baselineFrozenAt ?? manifest?.baselineFrozenAt,
    reviewOverride: specInfo?.reviewOverride ?? false,
    reviewOverrideAt: specInfo?.reviewOverrideAt,
    reviewOverrideReason: specInfo?.reviewOverrideReason,
    reviewStatus: manifest?.reviewStatus ?? "unknown",
    canEnterDesign: manifest?.canEnterDesign ?? false,
    effectiveCanEnterDesign:
      (manifest?.canEnterDesign ?? false) ||
      (specInfo?.reviewOverride ?? false),
    reviewSummary: manifest?.reviewSummary,
    generatedAt: manifest?.generatedAt,
    generator: manifest?.generator,
    previewPath: manifest?.previewPath,
    reviewPath: manifest?.reviewPath,
    entryFiles: manifest?.entryFiles ?? [],
    hasManifest: manifest !== undefined,
    hasGeneratedFiles: generatedFiles.length > 0,
    generatedFiles,
    previewFiles,
  };
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const buildD2CPreviewDocument = (
  changeId: string,
  d2cInfo: D2CInfo,
): string => {
  const fileCards = [...d2cInfo.generatedFiles, ...d2cInfo.previewFiles]
    .map(
      (file) => `
      <section class="card">
        <div class="card-header">
          <strong>${escapeHtml(file.name)}</strong>
        </div>
        <pre><code>${escapeHtml(file.content)}</code></pre>
      </section>`,
    )
    .join("");

  const entryFiles =
    d2cInfo.entryFiles.length > 0
      ? d2cInfo.entryFiles
          .map((file) => `<li>${escapeHtml(file)}</li>`)
          .join("")
      : "<li>暂未记录入口文件</li>";
  const materials =
    d2cInfo.materials.length > 0
      ? d2cInfo.materials
          .map((material) => {
            const description = material.description
              ? `${escapeHtml(material.description)} - `
              : "";
            return `<li>[${escapeHtml(material.scope)}] ${description}${escapeHtml(material.link)}</li>`;
          })
          .join("")
      : "<li>暂未记录设计材料</li>";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(changeId)} - D2C 产物预览</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f4ef;
        --panel: #fffdf7;
        --line: #d8d0be;
        --text: #1f2937;
        --muted: #6b7280;
        --accent: #0f766e;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "SF Pro Display", "PingFang SC", sans-serif;
        background: linear-gradient(180deg, #f4f4ef 0%, #efe7d4 100%);
        color: var(--text);
      }
      main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }
      .hero, .card {
        background: rgba(255, 253, 247, 0.94);
        border: 1px solid var(--line);
        border-radius: 20px;
        box-shadow: 0 18px 50px rgba(72, 55, 24, 0.08);
      }
      .hero {
        padding: 24px;
        margin-bottom: 20px;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .meta div {
        padding: 14px;
        border-radius: 14px;
        background: #f7f1e3;
      }
      .muted { color: var(--muted); font-size: 14px; }
      .accent { color: var(--accent); }
      .list {
        margin: 18px 0 0;
        padding-left: 18px;
      }
      .files {
        display: grid;
        gap: 16px;
      }
      .card { overflow: hidden; }
      .card-header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        background: #f7f1e3;
      }
      pre {
        margin: 0;
        padding: 16px;
        overflow: auto;
        background: #221f1b;
        color: #f8fafc;
        min-height: 160px;
      }
      code {
        font-family: "SFMono-Regular", "JetBrains Mono", monospace;
        font-size: 13px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="muted accent">SpecForge D2C Browser Preview</p>
        <h1>${escapeHtml(changeId)} 的静态产物</h1>
        <p class="muted">当前 Browser 模式展示的是 change 内收口的 D2C 产物清单，便于冻结前后核对入口文件、源码和 manifest 元数据。</p>
        <div class="meta">
          <div><strong>启用状态</strong><br />${d2cInfo.enabled ? "已启用" : "未启用"}</div>
          <div><strong>变更类型</strong><br />${escapeHtml(d2cInfo.changeKind)}</div>
          <div><strong>目标范围</strong><br />${escapeHtml(d2cInfo.targetScope)}</div>
          <div><strong>UI 基线确认</strong><br />${d2cInfo.baselineFrozen ? "已确认" : "未确认"}</div>
          <div><strong>D2C 审查结论</strong><br />${escapeHtml(d2cInfo.reviewStatus)}</div>
          <div><strong>人工放行</strong><br />${d2cInfo.reviewOverride ? "已放行" : "未放行"}</div>
          <div><strong>生成器</strong><br />${escapeHtml(d2cInfo.generator ?? "design-to-code-zx")}</div>
        </div>
        <h2>审查摘要</h2>
        <p class="muted">${escapeHtml(d2cInfo.reviewSummary ?? "尚未记录结构化审查摘要")}</p>
        <h2>设计材料</h2>
        <ul class="list">${materials}</ul>
        <h2>入口文件</h2>
        <ul class="list">${entryFiles}</ul>
      </section>
      <section class="files">
        ${fileCards || '<section class="card"><div class="card-header"><strong>暂无静态产物</strong></div><pre><code>请先在 Spec 确认后进入 D2C checkpoint，再通过“生成静态 UI”按钮触发 d2c-baseline skill。产物会收口到 openspec/changes/&lt;change-id&gt;/d2c/ 目录。</code></pre></section>'}
      </section>
    </main>
  </body>
</html>`;
};
