import { Command, FileSystem, Path } from "@effect/platform";
import { Context, Data, Duration, Effect, Either, Layer, Option } from "effect";
import type { InferEffect } from "../../../lib/effect/types";

// ============================================================================
// Error Types
// ============================================================================

export class SkillInstallError extends Data.TaggedError("SkillInstallError")<{
  message: string;
  gitUrl?: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export interface SkillInstallResult {
  name: string;
  description: string;
}

export interface SkillPreflightResult {
  ok: boolean;
  category:
    | "none"
    | "network"
    | "auth"
    | "not_found"
    | "invalid_path"
    | "unknown";
  message?: string;
  missingSkills?: string[];
}

// ============================================================================
// 纯函数（导出供测试和外部使用）
// ============================================================================

/**
 * 解析 SKILL.md 的 frontmatter，提取 name 和 description
 */
function parseSkillFrontmatter(content: string): {
  name: string | null;
  description: string | null;
} {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch?.[1]) {
    return { name: null, description: null };
  }

  const frontmatter = frontmatterMatch[1];

  // 提取 name 字段
  const nameMatch = frontmatter.match(/^name:\s*['"]?([^'"\n]+)['"]?\s*$/m);
  const name = nameMatch?.[1]?.trim() ?? null;

  // 提取 description 字段
  const descriptionMatch = frontmatter.match(
    /^description:\s*['"]?([^'"\n]+)['"]?\s*$/m,
  );
  const description = descriptionMatch?.[1]?.trim() ?? null;

  return { name, description };
}

/**
 * 按 name 去重 skill 列表（保留首次出现的）
 */
function deduplicateSkills(skills: SkillInstallResult[]): SkillInstallResult[] {
  const seen = new Set<string>();
  const unique: SkillInstallResult[] = [];

  for (const skill of skills) {
    if (!seen.has(skill.name)) {
      seen.add(skill.name);
      unique.push(skill);
    }
  }

  return unique;
}

// ============================================================================
// Service Implementation
// ============================================================================

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const classifyGitError = (
    errorText: string,
  ): SkillPreflightResult["category"] => {
    const text = errorText.toLowerCase();
    if (
      text.includes("authentication failed") ||
      text.includes("permission denied") ||
      text.includes("not authorized")
    ) {
      return "auth";
    }
    if (text.includes("repository not found") || text.includes("not found")) {
      return "not_found";
    }
    if (
      text.includes("could not resolve host") ||
      text.includes("failed to connect") ||
      text.includes("connection timed out") ||
      text.includes("network is unreachable") ||
      text.includes("connection reset")
    ) {
      return "network";
    }
    return "unknown";
  };

  const cloneRepoWithRetry = (
    gitUrl: string,
    tempDir: string,
    options: { attempts?: number; backoffMs?: number } = {},
  ) =>
    Effect.gen(function* () {
      const attempts = options.attempts ?? 3;
      const backoffMs = options.backoffMs ?? 1000;

      let lastError = "";
      for (let i = 0; i < attempts; i++) {
        const cloneCommand = Command.make(
          "git",
          "clone",
          "--depth",
          "1",
          gitUrl,
          tempDir,
        );
        const cloneResult = yield* Effect.either(
          Command.string(cloneCommand).pipe(
            Effect.timeout(Duration.seconds(120)),
          ),
        );
        if (Either.isRight(cloneResult)) {
          return { success: true as const, errorText: "" };
        }

        lastError = String(cloneResult.left);
        const category = classifyGitError(lastError);
        const isTransient = category === "network";
        if (!isTransient || i === attempts - 1) {
          break;
        }
        const waitMs = backoffMs * 2 ** i;
        yield* Effect.sleep(Duration.millis(waitMs));
      }

      return { success: false as const, errorText: lastError };
    });

  /**
   * 在目录中查找 SKILL.md（大小写不敏感）
   */
  const findSkillMd = (dirPath: string) =>
    Effect.gen(function* () {
      const exactPath = path.join(dirPath, "SKILL.md");
      if (yield* fs.exists(exactPath)) {
        return exactPath;
      }

      // 大小写不敏感查找
      const files = yield* fs
        .readDirectory(dirPath)
        .pipe(Effect.catchAll(() => Effect.succeed<string[]>([])));

      const found = files.find((f) => f.toLowerCase() === "skill.md");
      if (found) {
        return path.join(dirPath, found);
      }

      return null;
    });

  const findSkillDirsByName = (repoRoot: string, skillName: string) =>
    Effect.gen(function* () {
      const matches: string[] = [];
      const queue: string[] = [repoRoot];

      while (queue.length > 0) {
        const currentDir = queue.shift();
        if (!currentDir) continue;

        const entries = yield* fs
          .readDirectory(currentDir)
          .pipe(Effect.catchAll(() => Effect.succeed<string[]>([])));

        for (const entry of entries) {
          if (entry.startsWith(".")) continue;
          const entryPath = path.join(currentDir, entry);
          const statResult = yield* fs.stat(entryPath).pipe(Effect.option);
          if (Option.isNone(statResult)) continue;
          if (statResult.value.type !== "Directory") continue;

          if (entry === skillName) {
            const skillMdPath = yield* findSkillMd(entryPath);
            if (skillMdPath) {
              matches.push(entryPath);
            }
          }

          queue.push(entryPath);
        }
      }

      return matches;
    });

  /**
   * 安装单个 Skill 目录并解析元数据
   */
  const installSingleSkill = (
    sourcePath: string,
    skillName: string,
    skillsDir: string,
  ) =>
    Effect.gen(function* () {
      // 检查源路径是否存在
      if (!(yield* fs.exists(sourcePath))) {
        return null;
      }

      // 查找 SKILL.md
      const skillMdPath = yield* findSkillMd(sourcePath);
      if (!skillMdPath) {
        return null;
      }

      const targetPath = path.join(skillsDir, skillName);

      // 确保目标目录存在
      yield* fs.makeDirectory(targetPath, { recursive: true });

      // 递归复制源目录到目标目录
      yield* copyDirectory(sourcePath, targetPath);

      // 从已安装的 SKILL.md 读取描述
      const installedSkillMd = yield* findSkillMd(targetPath);
      if (!installedSkillMd) {
        return { name: skillName, description: "暂无描述" };
      }

      const content = yield* fs
        .readFileString(installedSkillMd)
        .pipe(Effect.catchAll(() => Effect.succeed("")));

      const { description } = parseSkillFrontmatter(content);

      return {
        name: skillName,
        description: description ?? "暂无描述",
      } satisfies SkillInstallResult;
    }).pipe(Effect.catchAll(() => Effect.succeed(null)));

  /**
   * 递归复制目录
   */
  const copyDirectory = (
    src: string,
    dest: string,
  ): Effect.Effect<
    void,
    import("@effect/platform/Error").PlatformError,
    FileSystem.FileSystem
  > =>
    Effect.gen(function* () {
      yield* fs.makeDirectory(dest, { recursive: true });

      const entries = yield* fs.readDirectory(src);

      for (const entry of entries) {
        if (entry.startsWith(".")) continue;

        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        const stat = yield* fs.stat(srcPath);

        if (stat.type === "Directory") {
          yield* copyDirectory(srcPath, destPath);
        } else {
          const content = yield* fs.readFile(srcPath);
          yield* fs.writeFile(destPath, content);
        }
      }
    });

  /**
   * 从 Git 仓库安装 Skills
   *
   * @param projectPath - 目标项目路径
   * @param gitUrl - Git 仓库 URL
   * @param skillsList - Skill 路径列表（支持 path/* 通配符）
   * @returns 安装成功的 Skill 元数据列表
   */
  const installSkillsFromGit = (
    projectPath: string,
    gitUrl: string,
    skillsList: string[],
  ) =>
    Effect.gen(function* () {
      // 参数校验：空参数直接返回空数组
      if (!gitUrl || !Array.isArray(skillsList) || skillsList.length === 0) {
        return [] as SkillInstallResult[];
      }

      const skillsDir = path.join(projectPath, ".claude", "skills");

      // 使用 Effect-TS FileSystem 创建临时目录（避免 node:os 直接引用）
      const tempDir = yield* fs.makeTempDirectory({
        prefix: "specforge-skills-",
      });

      // 使用 ensuring 确保临时目录始终被清理
      const installEffect = Effect.gen(function* () {
        // 1. Git clone（shallow clone + 瞬时网络错误重试）
        const cloneResult = yield* cloneRepoWithRetry(gitUrl, tempDir, {
          attempts: 3,
          backoffMs: 1000,
        });
        if (!cloneResult.success) {
          console.error(
            `[SkillManager] Git clone 失败: ${gitUrl}`,
            cloneResult.errorText,
          );
          return [] as SkillInstallResult[];
        }

        // 确保 skills 目标目录存在
        yield* fs.makeDirectory(skillsDir, { recursive: true });

        const installedSkills: (SkillInstallResult | null)[] = [];

        // 2. 遍历配置的 skill 路径
        for (const skillPath of skillsList) {
          if (skillPath.endsWith("/*")) {
            // 通配符：展开子目录
            const parentDir = skillPath.slice(0, -2);
            const fullParentPath = path.join(tempDir, parentDir);

            if (yield* fs.exists(fullParentPath)) {
              const children = yield* fs.readDirectory(fullParentPath);

              for (const child of children) {
                const childPath = path.join(fullParentPath, child);
                const stat = yield* fs.stat(childPath);

                if (stat.type === "Directory") {
                  const result = yield* installSingleSkill(
                    childPath,
                    child,
                    skillsDir,
                  );
                  installedSkills.push(result);
                }
              }
            } else {
              console.warn(`[SkillManager] 未找到 Skill 父目录: ${parentDir}`);
            }
          } else {
            // 单个 skill 路径
            const requestedPath = skillPath.trim();
            const skillName = path.basename(requestedPath);
            let sourcePath = path.join(tempDir, requestedPath);

            if (
              !(yield* fs.exists(sourcePath)) &&
              !requestedPath.includes("/")
            ) {
              // 兼容“仅配置 skill 名称”的场景：在仓库中按目录名自动发现
              const matchedDirs = yield* findSkillDirsByName(
                tempDir,
                skillName,
              );
              if (matchedDirs.length === 1 && matchedDirs[0]) {
                sourcePath = matchedDirs[0];
              }
            }

            const result = yield* installSingleSkill(
              sourcePath,
              skillName,
              skillsDir,
            );
            installedSkills.push(result);
          }
        }

        // 3. 过滤 null 并去重
        const validSkills = installedSkills.filter(
          (s): s is SkillInstallResult => s !== null,
        );

        return deduplicateSkills(validSkills);
      });

      // 确保临时目录被清理
      return yield* installEffect.pipe(
        Effect.ensuring(
          fs
            .remove(tempDir, { recursive: true })
            .pipe(Effect.catchAll(() => Effect.succeed(undefined))),
        ),
        // 全局兜底：任何未预期的错误都返回空数组
        Effect.catchAll((error) => {
          console.error(
            `[SkillManager] Skill 安装失败:`,
            error instanceof Error ? error.message : String(error),
          );
          return Effect.succeed<SkillInstallResult[]>([]);
        }),
      );
    });

  const preflightSkillsFromGit = (gitUrl: string, skillsList: string[]) =>
    Effect.gen(function* () {
      if (!gitUrl || !Array.isArray(skillsList) || skillsList.length === 0) {
        return {
          ok: false,
          category: "invalid_path",
          message: "develop_skills 配置不完整：缺少 gitUrl 或 skills。",
        } satisfies SkillPreflightResult;
      }

      const tempDir = yield* fs.makeTempDirectory({
        prefix: "specforge-skills-preflight-",
      });

      return yield* Effect.gen(function* () {
        const cloneResult = yield* cloneRepoWithRetry(gitUrl, tempDir, {
          attempts: 3,
          backoffMs: 1000,
        });
        if (!cloneResult.success) {
          const category = classifyGitError(cloneResult.errorText);
          return {
            ok: false,
            category,
            message: `Git 仓库不可用: ${cloneResult.errorText}`,
          } satisfies SkillPreflightResult;
        }

        const missingSkills: string[] = [];
        for (const configuredPath of skillsList) {
          const skillPath = configuredPath.trim();
          if (!skillPath) continue;

          if (skillPath.endsWith("/*")) {
            const parentDir = skillPath.slice(0, -2);
            const fullParentPath = path.join(tempDir, parentDir);
            if (!(yield* fs.exists(fullParentPath))) {
              missingSkills.push(skillPath);
              continue;
            }
            const children = yield* fs.readDirectory(fullParentPath);
            let hasAnySkill = false;
            for (const child of children) {
              const childPath = path.join(fullParentPath, child);
              const statResult = yield* fs.stat(childPath).pipe(Effect.option);
              if (Option.isNone(statResult)) continue;
              if (statResult.value.type !== "Directory") continue;
              const skillMdPath = yield* findSkillMd(childPath);
              if (skillMdPath) {
                hasAnySkill = true;
                break;
              }
            }
            if (!hasAnySkill) {
              missingSkills.push(skillPath);
            }
          } else {
            let sourcePath = path.join(tempDir, skillPath);
            let exists = yield* fs.exists(sourcePath);
            if (!exists && !skillPath.includes("/")) {
              const skillName = path.basename(skillPath);
              const matchedDirs = yield* findSkillDirsByName(
                tempDir,
                skillName,
              );
              if (matchedDirs.length === 1 && matchedDirs[0]) {
                sourcePath = matchedDirs[0];
                exists = true;
              } else if (matchedDirs.length > 1) {
                missingSkills.push(
                  `${skillPath}（匹配到多个目录，请改为仓库相对路径）`,
                );
                continue;
              }
            }

            if (!exists) {
              missingSkills.push(skillPath);
              continue;
            }
            const skillMdPath = yield* findSkillMd(sourcePath);
            if (!skillMdPath) {
              missingSkills.push(skillPath);
            }
          }
        }

        if (missingSkills.length > 0) {
          return {
            ok: false,
            category: "invalid_path",
            message: "部分 skill 路径不存在或缺少 SKILL.md。",
            missingSkills,
          } satisfies SkillPreflightResult;
        }

        return { ok: true, category: "none" } satisfies SkillPreflightResult;
      }).pipe(
        Effect.ensuring(
          fs
            .remove(tempDir, { recursive: true })
            .pipe(Effect.catchAll(() => Effect.succeed(undefined))),
        ),
      );
    });

  return {
    installSkillsFromGit,
    preflightSkillsFromGit,
  };
});

// ============================================================================
// Service Export
// ============================================================================

export type ISkillManagerService = InferEffect<typeof LayerImpl>;

export class SkillManagerService extends Context.Tag("SkillManagerService")<
  SkillManagerService,
  ISkillManagerService
>() {
  static Live = Layer.effect(this, LayerImpl);

  /**
   * 纯函数：解析 SKILL.md frontmatter
   * 导出供测试和外部使用
   */
  static parseSkillFrontmatter = parseSkillFrontmatter;

  /**
   * 纯函数：按 name 去重
   * 导出供测试和外部使用
   */
  static deduplicateSkills = deduplicateSkills;
}
