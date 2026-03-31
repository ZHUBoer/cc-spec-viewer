import { FileSystem, Path } from "@effect/platform";
import { Context, Data, Effect, Layer } from "effect";
import type { InferEffect } from "../../../lib/effect/types";

// ============================================================================
// Error Types
// ============================================================================

class TemplateProcessingError extends Data.TaggedError(
  "TemplateProcessingError",
)<{
  message: string;
  file?: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export interface TemplateVariables {
  // 基础变量
  PROJECT_ROOT?: string;
  VERSION?: string;

  // MCP 相关变量
  INFRA_CATALOG_TOOL_IDS_APPEND?: string;
  INFRA_CATALOG_OVERVIEW_TOOLS_MD?: string;
  INFRA_CATALOG_SEARCH_TOOLS_MD?: string;
  INFRA_CATALOG_SPECIFICATIONS_TOOLS_MD?: string;
  INFRA_CATALOG_TOOL_DEFINITIONS_TABLE_MD?: string;

  // Skills 相关变量
  DEVELOP_SKILLS_APPEND?: string;
  /** @deprecated 仅兼容历史逻辑，禁止在模板语义句中直接拼接该变量 */
  DEVELOP_SKILLS_NAMES?: string;
  DEVELOP_SKILLS_USAGE_MD?: string;
  DEVELOP_SKILLS_RULE_LINE?: string;
  DEVELOP_SKILLS_TASK_INSTRUCTION?: string;
  DEVELOP_SKILLS_APPLY_ITEM?: string;

  // querying-infra-catalog 能力开关相关变量
  QUERYING_INFRA_RULE_LINE?: string;
  QUERYING_INFRA_OVERVIEW_TASK_DESCRIPTION?: string;
  QUERYING_INFRA_SEARCH_TASK_DESCRIPTION?: string;
  QUERYING_INFRA_FACT_CHECK_SOURCE?: string;
  QUERYING_INFRA_APPLY_ITEM?: string;
  QUERYING_INFRA_QUALITY_USAGE_LINE?: string;

  // 代码示例变量
  CODE_EXAMPLES_MD?: string;

  // 其他自定义变量
  [key: string]: string | undefined;
}

export interface ProcessTemplateOptions {
  /** 是否处理 @引用（内联其他文件） */
  resolveReferences?: boolean;
  /** 基础路径（用于解析相对引用） */
  basePath?: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  /**
   * 替换模板变量
   * 将 {{VAR_NAME}} 替换为实际值
   */
  const replaceVariables = (
    content: string,
    variables: TemplateVariables,
  ): string => {
    let processed = content;

    // 替换所有 {{VAR}} 格式的变量
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        processed = processed.replace(regex, value);
      }
    }

    // 清理所有剩余的 {{VAR}} 格式标签（处理未定义的自定义变量）
    processed = processed.replace(/\{\{[A-Z0-9_]+\}\}/g, "");

    return processed;
  };

  /**
   * 处理模板内容（简化版本，不处理递归引用）
   */
  const processTemplate = (
    content: string,
    variables: TemplateVariables,
    options: ProcessTemplateOptions = {},
  ) =>
    Effect.gen(function* () {
      // 1. 替换变量
      let processed = replaceVariables(content, variables);

      // 2. 解析 @引用（如果启用，只处理一层）
      if (options.resolveReferences && options.basePath) {
        const lines = processed.split("\n");
        const resolvedLines: string[] = [];

        for (const line of lines) {
          const trimmed = line.trim();

          // 匹配 @path/to/file.md 格式
          if (trimmed.startsWith("@") && trimmed.endsWith(".md")) {
            const refPath = trimmed.slice(1);
            const fullRefPath = path.resolve(
              path.dirname(options.basePath),
              refPath,
            );

            const exists = yield* fs.exists(fullRefPath);
            if (exists) {
              let refContent = yield* fs.readFileString(fullRefPath);
              refContent = replaceVariables(refContent, variables);
              resolvedLines.push(refContent);
            } else {
              resolvedLines.push(
                `<!-- Warning: Referenced file not found: ${refPath} -->`,
              );
            }
          } else {
            resolvedLines.push(line);
          }
        }

        processed = resolvedLines.join("\n");
      }

      return processed;
    });

  /**
   * 处理模板文件并写入目标路径
   */
  const processTemplateFile = (
    templatePath: string,
    targetPath: string,
    variables: TemplateVariables,
    options: ProcessTemplateOptions = {},
  ) =>
    Effect.gen(function* () {
      // 检查模板文件是否存在
      const exists = yield* fs.exists(templatePath);
      if (!exists) {
        return yield* Effect.fail(
          new TemplateProcessingError({
            message: `Template file not found: ${templatePath}`,
            file: templatePath,
          }),
        );
      }

      // 读取模板内容
      const content = yield* fs.readFileString(templatePath);

      // 处理模板
      const processed = yield* processTemplate(content, variables, {
        ...options,
        basePath: templatePath,
      });

      // 确保目标目录存在
      const targetDir = path.dirname(targetPath);
      const dirExists = yield* fs.exists(targetDir);
      if (!dirExists) {
        yield* fs.makeDirectory(targetDir, { recursive: true });
      }

      // 写入目标文件
      yield* fs.writeFileString(targetPath, processed);
    });

  /**
   * 获取目录下所有文件（非递归 Effect 版本）
   */
  const getAllFilesInDir = (dir: string, basePath: string) =>
    Effect.gen(function* () {
      const results: string[] = [];
      const dirsToProcess = [dir];

      while (dirsToProcess.length > 0) {
        const currentDir = dirsToProcess.pop();
        if (!currentDir) continue;
        const exists = yield* fs.exists(currentDir);
        if (!exists) continue;

        const entries = yield* fs.readDirectory(currentDir);

        for (const entry of entries) {
          if (entry.startsWith(".")) continue;

          const entryPath = path.join(currentDir, entry);
          const stat = yield* fs.stat(entryPath);

          if (stat.type === "Directory") {
            dirsToProcess.push(entryPath);
          } else {
            const relativePath = path.relative(basePath, entryPath);
            results.push(relativePath);
          }
        }
      }

      return results;
    });

  /**
   * 批量处理模板目录
   */
  const processTemplateDirectory = (
    templateDir: string,
    targetDir: string,
    variables: TemplateVariables,
    options: {
      /** 跳过已存在的文件 */
      skipExisting?: boolean;
      /** 文件过滤器 */
      filter?: (relativePath: string) => boolean;
    } = {},
  ) =>
    Effect.gen(function* () {
      const created: string[] = [];
      const skipped: string[] = [];
      const errors: string[] = [];

      const files = yield* getAllFilesInDir(templateDir, templateDir);

      for (const relativePath of files) {
        // 应用过滤器
        if (options.filter && !options.filter(relativePath)) {
          continue;
        }

        const templatePath = path.join(templateDir, relativePath);
        const targetPath = path.join(targetDir, relativePath);

        // 检查目标文件是否存在
        const targetExists = yield* fs.exists(targetPath);
        if (targetExists && options.skipExisting) {
          skipped.push(relativePath);
          continue;
        }

        // 处理模板文件
        const result = yield* processTemplateFile(
          templatePath,
          targetPath,
          variables,
          { resolveReferences: true },
        ).pipe(
          Effect.map(() => ({ success: true as const })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              error: error instanceof Error ? error.message : String(error),
            }),
          ),
        );

        if (result.success) {
          created.push(relativePath);
        } else {
          errors.push(`${relativePath}: ${result.error}`);
        }
      }

      return { created, skipped, errors };
    });

  return {
    replaceVariables,
    processTemplate,
    processTemplateFile,
    processTemplateDirectory,
  };
});

// ============================================================================
// Service Export
// ============================================================================

export type ITemplateProcessor = InferEffect<typeof LayerImpl>;

export class TemplateProcessor extends Context.Tag("TemplateProcessor")<
  TemplateProcessor,
  ITemplateProcessor
>() {
  static Live = Layer.effect(this, LayerImpl);
}
