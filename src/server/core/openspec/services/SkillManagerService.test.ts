import { NodeContext } from "@effect/platform-node";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { SkillManagerService } from "./SkillManagerService";

/**
 * SkillManagerService 测试
 *
 * 测试范围：
 * - 纯函数：parseSkillFrontmatter、deduplicateSkills
 * - 服务方法：installSkillsFromGit（通过 mock FileSystem / CommandExecutor 验证逻辑）
 *
 * 注意：不测试实际的 git clone（需要网络），仅测试 installSkillsFromGit 的参数验证
 * 和纯逻辑函数。
 */

// ============================================================================
// 纯函数测试
// ============================================================================

describe("parseSkillFrontmatter", () => {
  it("应该从标准 frontmatter 中提取 name 和 description", () => {
    const content = `---
name: zx-h5-develop-experience
description: H5 开发经验技能
---
# Content`;

    const result = SkillManagerService.parseSkillFrontmatter(content);
    expect(result.name).toBe("zx-h5-develop-experience");
    expect(result.description).toBe("H5 开发经验技能");
  });

  it("应该处理带引号的值", () => {
    const content = `---
name: "my-skill"
description: 'Skill 描述'
---`;

    const result = SkillManagerService.parseSkillFrontmatter(content);
    expect(result.name).toBe("my-skill");
    expect(result.description).toBe("Skill 描述");
  });

  it("没有 frontmatter 时返回 null", () => {
    const content = "# 普通 Markdown";
    const result = SkillManagerService.parseSkillFrontmatter(content);
    expect(result.name).toBeNull();
    expect(result.description).toBeNull();
  });

  it("frontmatter 缺少 description 时返回 null description", () => {
    const content = `---
name: my-skill
---
# Content`;

    const result = SkillManagerService.parseSkillFrontmatter(content);
    expect(result.name).toBe("my-skill");
    expect(result.description).toBeNull();
  });

  it("应该支持 CRLF 换行符", () => {
    const content =
      "---\r\nname: crlf-skill\r\ndescription: CRLF 测试\r\n---\r\n# Content";
    const result = SkillManagerService.parseSkillFrontmatter(content);
    expect(result.name).toBe("crlf-skill");
    expect(result.description).toBe("CRLF 测试");
  });

  it("空内容返回 null", () => {
    const result = SkillManagerService.parseSkillFrontmatter("");
    expect(result.name).toBeNull();
    expect(result.description).toBeNull();
  });
});

describe("deduplicateSkills", () => {
  it("应该按 name 去重", () => {
    const skills = [
      { name: "skill-a", description: "第一个" },
      { name: "skill-b", description: "B" },
      { name: "skill-a", description: "重复的" },
    ];
    const result = SkillManagerService.deduplicateSkills(skills);
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("skill-a");
    expect(result[0]?.description).toBe("第一个");
    expect(result[1]?.name).toBe("skill-b");
  });

  it("空数组返回空数组", () => {
    expect(SkillManagerService.deduplicateSkills([])).toEqual([]);
  });

  it("没有重复时返回原数组", () => {
    const skills = [
      { name: "a", description: "A" },
      { name: "b", description: "B" },
    ];
    const result = SkillManagerService.deduplicateSkills(skills);
    expect(result).toHaveLength(2);
  });
});

// ============================================================================
// 服务方法测试
// ============================================================================

describe("SkillManagerService.installSkillsFromGit", () => {
  it("gitUrl 为空时返回空数组", async () => {
    const result = await Effect.runPromise(
      SkillManagerService.pipe(
        Effect.flatMap((service) =>
          service.installSkillsFromGit("/test/project", "", ["skill1"]),
        ),
        Effect.provide(SkillManagerService.Live),
        Effect.provide(NodeContext.layer),
      ),
    );

    expect(result).toEqual([]);
  });

  it("skillsList 为空数组时返回空数组", async () => {
    const result = await Effect.runPromise(
      SkillManagerService.pipe(
        Effect.flatMap((service) =>
          service.installSkillsFromGit(
            "/test/project",
            "http://example.com/repo.git",
            [],
          ),
        ),
        Effect.provide(SkillManagerService.Live),
        Effect.provide(NodeContext.layer),
      ),
    );

    expect(result).toEqual([]);
  });

  it("gitUrl 和 skillsList 都为空时返回空数组", async () => {
    const result = await Effect.runPromise(
      SkillManagerService.pipe(
        Effect.flatMap((service) =>
          service.installSkillsFromGit("/test/project", "", []),
        ),
        Effect.provide(SkillManagerService.Live),
        Effect.provide(NodeContext.layer),
      ),
    );

    expect(result).toEqual([]);
  });
});
