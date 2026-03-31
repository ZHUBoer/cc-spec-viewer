import { describe, expect, test } from "vitest";
import {
  buildCorehashInjection,
  type CorehashInfo,
  serializeCorehashMap,
} from "./d2cPreviewCorehash";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCorehashInfo = (value: unknown): value is CorehashInfo => {
  if (!isRecord(value)) return false;
  const {
    filename,
    fileDir,
    line,
    endLine,
    nodeCode,
    nodeStartLine,
    nodeEndLine,
  } = value;
  return (
    typeof filename === "string" &&
    typeof fileDir === "string" &&
    typeof line === "number" &&
    typeof endLine === "number" &&
    typeof nodeCode === "string" &&
    typeof nodeStartLine === "number" &&
    typeof nodeEndLine === "number"
  );
};

describe("buildCorehashInjection", () => {
  test("为 JSX 元素注入 data-corehash 并生成映射", () => {
    const sourceText = `
const App = () => (
  <div>
    <span>Hello</span>
    <Button />
  </div>
);

export default App;
`;

    const result = buildCorehashInjection({
      sourceText,
      fileDir: "openspec/changes/demo/d2c/d2c产物01/index.tsx",
      filename: "index.tsx",
    });

    const keys = Object.keys(result.corehashMap);
    expect(keys.length).toBe(3);

    const matches = Array.from(
      result.injectedCode.matchAll(/data-corehash="([^"]+)"/g),
    );
    const foundHashes = matches.map((match) => match[1]).filter(Boolean);
    expect(foundHashes.length).toBe(3);
    for (const key of keys) {
      expect(foundHashes).toContain(key);
      const raw = result.corehashMap[key];
      if (typeof raw !== "string") {
        throw new Error(`corehash 映射缺少内容: ${key}`);
      }
      const parsed = JSON.parse(raw);
      expect(isCorehashInfo(parsed)).toBe(true);
      if (isCorehashInfo(parsed)) {
        expect(parsed.fileDir).toBe(
          "openspec/changes/demo/d2c/d2c产物01/index.tsx",
        );
        expect(parsed.filename).toBe("index.tsx");
        expect(parsed.nodeCode.length).toBeGreaterThan(0);
      }
    }
  });

  test("保留已有 data-corehash 并继续写入映射", () => {
    const sourceText = `
const App = () => (
  <div data-corehash="keep123">
    <span>Keep</span>
  </div>
);
`;

    const result = buildCorehashInjection({
      sourceText,
      fileDir: "openspec/changes/demo/d2c/d2c产物02/index.tsx",
      filename: "index.tsx",
    });

    expect(Object.keys(result.corehashMap)).toContain("keep123");
    expect(result.injectedCode).toContain('data-corehash="keep123"');
  });

  test("序列化 corehashMap 输出稳定 JSON 字符串", () => {
    const content = serializeCorehashMap({ foo: '{"ok":true}' });
    const parsed = JSON.parse(content);
    if (!isRecord(parsed)) {
      throw new Error("序列化结果不是对象");
    }
    const value = parsed.foo;
    expect(value).toBe('{"ok":true}');
  });
});
