import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAdaModelService, parseAdaModelOutput } from "./AdaModelService";

describe("parseAdaModelOutput", () => {
  it("parses standard menu output", () => {
    const parsed = parseAdaModelOutput(`
请选择团队模型配置
> 1. 跟随团队默认 (MiniMax-M2.5)
  2. claude-haiku-4
  3. kimi-k2
  5. MiniMax-M2.5 [当前]
`);

    expect(parsed.models).toHaveLength(4);
    expect(parsed.currentIndex).toBe(5);
    expect(parsed.currentLabel).toBe("MiniMax-M2.5");
  });

  it("parses real ada output and detects current model", () => {
    const parsed = parseAdaModelOutput(`
* 当前用户: Boer Zhu （朱柏尔） (TR054152) , 执行 ada help 查看更多功能
* 当前模式: 团队模式 (智行前端组) , 当前模型: MiniMax-M2.5
提示：一个会话内可切换 Claude 模型，但不要在同一会话内将 Claude 模型切换到 Kimi 等模型（或反向），上下文格式不同会报错。
请选择团队模型配置：
> 1. 跟随团队默认 (MiniMax-M2.5)
  2. claude-haiku-4-5
  3. kimi-k2.5
  4. glm-5
  5. MiniMax-M2.5 [当前]
  6. claude-sonnet-4-6
`);

    expect(parsed.models).toHaveLength(6);
    expect(parsed.currentIndex).toBe(5);
    expect(parsed.currentLabel).toBe("MiniMax-M2.5");
  });

  it("handles output without [当前] marker", () => {
    const parsed = parseAdaModelOutput(`
> 1. 跟随团队默认 (MiniMax-M2.5)
  2. claude-haiku-4
  3. kimi-k2
`);

    expect(parsed.models).toHaveLength(3);
    expect(parsed.currentIndex).toBeNull();
    expect(parsed.currentLabel).toBeNull();
  });

  it("supports lines with or without leading >", () => {
    const parsed = parseAdaModelOutput(`
  1. A
> 2. B [当前]
  3. C
`);

    expect(parsed.models.map((model) => model.index)).toEqual([1, 2, 3]);
    expect(parsed.currentIndex).toBe(2);
    expect(parsed.currentLabel).toBe("B");
  });

  it("supports mixed Chinese and English labels", () => {
    const parsed = parseAdaModelOutput(`
  1. 跟随团队默认 (MiniMax-M2.5)
  2. claude-sonnet-4
  3. glm-4 [当前]
`);

    expect(parsed.models[0]?.label).toContain("跟随团队默认");
    expect(parsed.models[1]?.label).toBe("claude-sonnet-4");
    expect(parsed.currentLabel).toBe("glm-4");
  });

  it("cursor (>) and [当前] can point to different rows in real output", () => {
    const parsed = parseAdaModelOutput(`
* 当前模式: 团队模式 (智行前端组) , 当前模型: MiniMax-M2.5
请选择团队模型配置：
  1. 跟随团队默认 (MiniMax-M2.5)
  2. claude-haiku-4-5
  3. kimi-k2.5
  4. glm-5
  5. MiniMax-M2.5 [当前]
> 6. claude-sonnet-4-6
`);
    expect(parsed.currentIndex).toBe(5);
    expect(parsed.models).toHaveLength(6);
  });
});

describe("createAdaModelService", () => {
  it("switches to larger index with down arrows", async () => {
    const writesByRun: string[][] = [];
    const outputs = [
      {
        code: 0,
        chunks: ["  1. model-a [当前]\n", "  2. model-b\n", "  3. model-c\n"],
      },
      {
        code: 0,
        chunks: ["  1. model-a [当前]\n  2. model-b\n  3. model-c\n"],
      },
      {
        code: 0,
        chunks: ["  1. model-a\n", "  2. model-b\n", "  3. model-c [当前]\n"],
      },
    ];

    let index = 0;
    const service = createAdaModelService((options) =>
      Effect.sync(() => {
        const run = outputs[index++];
        if (!run) {
          throw new Error("unexpected run");
        }

        const writes: string[] = [];
        let fullOutput = "";
        const write = (input: string) => {
          writes.push(input);
        };

        for (const chunk of run.chunks) {
          fullOutput += chunk;
          options?.onData?.(chunk, fullOutput, write);
        }

        writesByRun.push(writes);
        return {
          code: run.code,
          output: fullOutput,
        };
      }),
    );

    const result = await Effect.runPromise(service.switchModel(3));

    expect(result.currentIndex).toBe(3);
    expect(result.switchedTo).toEqual({ index: 3, label: "model-c" });
    expect(writesByRun[1]).toContain("\u001b[B\u001b[B");
    expect(writesByRun[1]).toContain("\r");
  });

  it("switches to smaller index with up arrows", async () => {
    const writesByRun: string[][] = [];
    const outputs = [
      {
        code: 0,
        chunks: ["  1. model-a\n", "  2. model-b\n", "  3. model-c [当前]\n"],
      },
      {
        code: 0,
        chunks: ["  1. model-a\n  2. model-b\n  3. model-c [当前]\n"],
      },
      {
        code: 0,
        chunks: ["  1. model-a [当前]\n", "  2. model-b\n", "  3. model-c\n"],
      },
    ];

    let index = 0;
    const service = createAdaModelService((options) =>
      Effect.sync(() => {
        const run = outputs[index++];
        if (!run) {
          throw new Error("unexpected run");
        }

        const writes: string[] = [];
        let fullOutput = "";
        const write = (input: string) => {
          writes.push(input);
        };

        for (const chunk of run.chunks) {
          fullOutput += chunk;
          options?.onData?.(chunk, fullOutput, write);
        }

        writesByRun.push(writes);
        return {
          code: run.code,
          output: fullOutput,
        };
      }),
    );

    const result = await Effect.runPromise(service.switchModel(1));

    expect(result.currentIndex).toBe(1);
    expect(result.switchedTo).toEqual({ index: 1, label: "model-a" });
    expect(writesByRun[1]).toContain("\u001b[A\u001b[A");
    expect(writesByRun[1]).toContain("\r");
  });

  it("fails on timeout", async () => {
    const service = createAdaModelService(() =>
      Effect.sync(() => {
        throw new Error("ada model timed out after 15000ms");
      }),
    );

    await expect(Effect.runPromise(service.listModels())).rejects.toThrow(
      "timed out",
    );
  });

  it("returns unsupported state in custom api key mode", async () => {
    const service = createAdaModelService(() =>
      Effect.succeed({
        code: 0,
        output: `
* 当前模式: 自定义 API Key 模式 , 当前模型: claude-sonnet-4-6
当前为自定义 API Key 模式，不支持切换模型
`,
      }),
    );

    const result = await Effect.runPromise(service.listModels());
    expect(result.switchSupported).toBe(false);
    expect(result.unsupportedReason).toBe("CUSTOM_API_KEY_MODE");
    expect(result.currentLabel).toBe("claude-sonnet-4-6");
    expect(result.models).toEqual([]);
  });

  it("blocks switch when custom api key mode is detected", async () => {
    const service = createAdaModelService(() =>
      Effect.succeed({
        code: 0,
        output: `
* 当前模式: 自定义 API Key 模式 , 当前模型: claude-sonnet-4-6
当前为自定义 API Key 模式，不支持切换模型
`,
      }),
    );

    await expect(Effect.runPromise(service.switchModel(1))).rejects.toThrow(
      "not supported",
    );
  });
});
