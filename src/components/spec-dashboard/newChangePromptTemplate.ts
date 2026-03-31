import type { SupportedLocale } from "@/lib/i18n/schema";
import { getD2CTargetScopeLabel, type NewChangeDraft } from "./newChangeDraft";

const zhPromptTemplate = `/opsx:new 

请为以下内容创建新的 change，并进入 spec coding 流程。

需求内容
{{requirement}}

D2C 配置
- 是否启用 D2C：{{d2cEnabled}}
{{d2cSection}}`;

const enPromptTemplate = `/opsx:new 

Please create a new change from the following request and enter the spec coding workflow.

Requirement
{{requirement}}

D2C Configuration
- D2C Enabled: {{d2cEnabled}}
{{d2cSection}}`;

const zhD2CSectionTemplate = `
- 说明：
  - Spec 阶段只声明 D2C 配置，不生成静态 UI。
  - Spec 确认后，如启用 D2C，先进入 D2C checkpoint，再决定是否进入 design。
  - D2C 生成器固定为 design-to-code-zx MCP。
- 设计材料：
{{d2cMaterials}}`;

const enD2CSectionTemplate = `
- Notes:
  - The spec stage only declares D2C settings and does not generate static UI.
  - After spec confirmation, if D2C is enabled, enter the D2C checkpoint before design.
  - The D2C generator is fixed to design-to-code-zx MCP.
- D2C Materials:
{{d2cMaterials}}`;

const renderTemplate = (
  template: string,
  variables: Record<string, string>,
): string => {
  return Object.entries(variables).reduce((content, [key, value]) => {
    return content.replaceAll(`{{${key}}}`, value);
  }, template);
};

const renderD2CMaterials = (
  draft: NewChangeDraft,
  locale: SupportedLocale,
): string => {
  return draft.d2cMaterials
    .map((material, index) => {
      const scopeParts = getD2CTargetScopeLabel(material.targetScope).split(
        " / ",
      );
      const zhScope = scopeParts[0] ?? material.targetScope;
      const enScope = scopeParts[1] ?? material.targetScope;

      if (locale === "zh_CN") {
        return [
          `  ${index + 1}. 链接：${material.link.trim()}`,
          `     目标范围：${zhScope}`,
          `     关键说明：${material.description.trim()}`,
        ].join("\n");
      }

      return [
        `  ${index + 1}. Link: ${material.link.trim()}`,
        `     Target Scope: ${enScope}`,
        `     Description: ${material.description.trim()}`,
      ].join("\n");
    })
    .join("\n");
};

export const renderNewChangePrompt = (
  draft: NewChangeDraft,
  locale: SupportedLocale = "zh_CN",
): string => {
  const d2cSection = draft.enableD2C
    ? renderTemplate(
        locale === "zh_CN" ? zhD2CSectionTemplate : enD2CSectionTemplate,
        {
          d2cMaterials: renderD2CMaterials(draft, locale),
        },
      )
    : "";

  if (locale === "zh_CN") {
    return renderTemplate(zhPromptTemplate, {
      requirement: draft.requirement.trim(),
      d2cEnabled: draft.enableD2C ? "是" : "否",
      d2cSection,
    });
  }

  return renderTemplate(enPromptTemplate, {
    requirement: draft.requirement.trim(),
    d2cEnabled: draft.enableD2C ? "Yes" : "No",
    d2cSection,
  });
};
