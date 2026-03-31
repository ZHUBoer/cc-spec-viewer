import { FileSystem } from "@effect/platform";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { testPlatformLayer } from "../../../../testing/layers/testPlatformLayer";
import { TemplateProcessor, type TemplateVariables } from "./TemplateProcessor";

/**
 * TemplateProcessor 测试
 *
 * 测试范围：
 * - 模板变量替换
 * - 模板文件处理
 * - 目录批量处理
 */

// 创建 mock FileSystem
const createMockFileSystem = (
  files: Record<string, string> = {},
  directories: Record<string, { files: string[]; subdirs: string[] }> = {},
) => {
  return Layer.succeed(FileSystem.FileSystem, {
    exists: (path: string) =>
      Effect.succeed(path in files || path in directories),
    readFileString: (path: string) => {
      if (path in files) {
        return Effect.succeed(files[path]);
      }
      return Effect.fail(new Error(`File not found: ${path}`));
    },
    writeFileString: () => Effect.succeed(undefined),
    readDirectory: (path: string) => {
      if (path in directories) {
        const dir = directories[path];
        if (dir) {
          return Effect.succeed([...dir.files, ...dir.subdirs]);
        }
      }
      return Effect.succeed([]);
    },
    stat: (path: string) => {
      if (path in directories) {
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
        return Effect.succeed({ type: "Directory" } as any);
      }
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
      return Effect.succeed({ type: "File" } as any);
    },
    makeDirectory: () => Effect.succeed(undefined),
    // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
  } as any);
};

describe("TemplateProcessor - 变量替换", () => {
  it("应该替换单个变量", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "Hello {{NAME}}!";
    const variables: TemplateVariables = { NAME: "World" };

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Hello World!");
  });

  it("应该替换多个变量", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "{{GREETING}} {{NAME}}! Your age is {{AGE}}.";
    const variables: TemplateVariables = {
      GREETING: "Hello",
      NAME: "Alice",
      AGE: "30",
    };

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Hello Alice! Your age is 30.");
  });

  it("应该处理未定义的变量", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "Hello {{NAME}}! Your age is {{AGE}}.";
    const variables: TemplateVariables = { NAME: "Alice" }; // AGE 未定义

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Hello Alice! Your age is ."); // 未定义变量会被清理为空
  });

  it("应该处理特殊字符", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "Path: {{PROJECT_ROOT}}/src";
    const variables: TemplateVariables = {
      PROJECT_ROOT: "/Users/test/project",
    };

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Path: /Users/test/project/src");
  });

  it("应该处理空字符串变量", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "Value: {{EMPTY_VALUE}}";
    const variables: TemplateVariables = { EMPTY_VALUE: "" };

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Value: ");
  });

  it("应该处理重复的变量", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "{{NAME}} and {{NAME}} are friends";
    const variables: TemplateVariables = { NAME: "Alice" };

    const result = service.replaceVariables(content, variables);

    expect(result).toBe("Alice and Alice are friends");
  });
});

describe("TemplateProcessor - 模板处理", () => {
  it("应该处理简单模板内容", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "# {{TITLE}}\n\nWelcome to {{PROJECT_NAME}}!";
    const variables: TemplateVariables = {
      TITLE: "My Project",
      PROJECT_NAME: "SpecForge",
    };

    const result = await Effect.runPromise(
      service.processTemplate(content, variables),
    );

    expect(result).toContain("# My Project");
    expect(result).toContain("Welcome to SpecForge!");
  });

  it("应该处理空内容", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "";
    const variables: TemplateVariables = {};

    const result = await Effect.runPromise(
      service.processTemplate(content, variables),
    );

    expect(result).toBe("");
  });

  it("应该处理没有变量的内容", async () => {
    const mockFs = createMockFileSystem();

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const content = "This is a plain text file.";
    const variables: TemplateVariables = {};

    const result = await Effect.runPromise(
      service.processTemplate(content, variables),
    );

    expect(result).toBe("This is a plain text file.");
  });
});

describe("TemplateProcessor - 批量处理", () => {
  it("应该处理目录中的所有文件", async () => {
    const mockFs = createMockFileSystem(
      {
        "/templates/file1.md": "# {{TITLE}}",
        "/templates/file2.md": "Content: {{CONTENT}}",
      },
      {
        "/templates": { files: ["file1.md", "file2.md"], subdirs: [] },
      },
    );

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const variables: TemplateVariables = {
      TITLE: "Test",
      CONTENT: "Hello",
    };

    const result = await Effect.runPromise(
      service.processTemplateDirectory("/templates", "/output", variables),
    );

    expect(result.created).toHaveLength(2);
    expect(result.created).toContain("file1.md");
    expect(result.created).toContain("file2.md");
    expect(result.errors).toHaveLength(0);
  });

  it("应该跳过已存在的文件（如果设置了 skipExisting）", async () => {
    const mockFs = Layer.succeed(FileSystem.FileSystem, {
      exists: (path: string) => {
        if (path === "/output/file1.md") return Effect.succeed(true);
        if (path.includes("/templates")) return Effect.succeed(true);
        return Effect.succeed(false);
      },
      readFileString: (path: string) => {
        if (path === "/templates/file1.md")
          return Effect.succeed("# {{TITLE}}");
        if (path === "/templates/file2.md")
          return Effect.succeed("Content: {{CONTENT}}");
        return Effect.fail(new Error("File not found"));
      },
      writeFileString: () => Effect.succeed(undefined),
      readDirectory: (path: string) => {
        if (path === "/templates")
          return Effect.succeed(["file1.md", "file2.md"]);
        return Effect.succeed([]);
      },
      stat: (path: string) => {
        if (path === "/templates")
          // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
          return Effect.succeed({ type: "Directory" } as any);
        // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
        return Effect.succeed({ type: "File" } as any);
      },
      makeDirectory: () => Effect.succeed(undefined),
      // biome-ignore lint/suspicious/noExplicitAny: 测试 Mock 简化实现
    } as any);

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const variables: TemplateVariables = {};

    const result = await Effect.runPromise(
      service.processTemplateDirectory("/templates", "/output", variables, {
        skipExisting: true,
      }),
    );

    expect(result.skipped).toContain("file1.md");
    expect(result.created).toContain("file2.md");
  });

  it("应该应用文件过滤器", async () => {
    const mockFs = createMockFileSystem(
      {
        "/templates/file1.md": "Content 1",
        "/templates/file2.txt": "Content 2",
        "/templates/.DS_Store": "System file",
      },
      {
        "/templates": {
          files: ["file1.md", "file2.txt", ".DS_Store"],
          subdirs: [],
        },
      },
    );

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      service.processTemplateDirectory(
        "/templates",
        "/output",
        {},
        {
          filter: (path) => !path.includes(".DS_Store") && path.endsWith(".md"),
        },
      ),
    );

    expect(result.created).toHaveLength(1);
    expect(result.created).toContain("file1.md");
    expect(result.created).not.toContain("file2.txt");
    expect(result.created).not.toContain(".DS_Store");
  });

  it("应该处理空目录", async () => {
    const mockFs = createMockFileSystem(
      {},
      {
        "/templates": { files: [], subdirs: [] },
      },
    );

    const testLayer = TemplateProcessor.Live.pipe(
      Layer.provide(Layer.mergeAll(testPlatformLayer(), mockFs)),
    );

    const service = await Effect.runPromise(
      TemplateProcessor.pipe(Effect.provide(testLayer)),
    );

    const result = await Effect.runPromise(
      service.processTemplateDirectory("/templates", "/output", {}),
    );

    expect(result.created).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
