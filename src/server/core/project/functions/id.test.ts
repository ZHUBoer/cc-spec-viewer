import { resolve } from "node:path";
import {
  decodeProjectId,
  encodeProjectId,
  encodeProjectIdFromSessionFilePath,
} from "./id";

const sampleProjectPath =
  "/path/to/claude-code-project-dir/projects/sample-project";
const sampleProjectId =
  "L3BhdGgvdG8vY2xhdWRlLWNvZGUtcHJvamVjdC1kaXIvcHJvamVjdHMvc2FtcGxlLXByb2plY3Q";

describe("encodeProjectId", () => {
  it("should encode project id from project path", () => {
    expect(encodeProjectId(sampleProjectPath)).toBe(sampleProjectId);
  });
});

describe("decodeProjectId", () => {
  it("should decode project absolute path from project id", () => {
    expect(decodeProjectId(sampleProjectId)).toBe(sampleProjectPath);
  });
});

describe("encodeProjectIdFromSessionFilePath", () => {
  it("should encode project id from session file path", () => {
    expect(
      encodeProjectIdFromSessionFilePath(
        resolve(sampleProjectPath, "sample-session-id.jsonl"),
      ),
    ).toBe(sampleProjectId);
  });

  it("should use root directory when session file is directly under root", () => {
    expect(encodeProjectIdFromSessionFilePath("/sample-session-id.jsonl")).toBe(
      encodeProjectId("/"),
    );
  });

  it("should fall back to current directory marker when no separator exists", () => {
    expect(encodeProjectIdFromSessionFilePath("sample-session-id.jsonl")).toBe(
      encodeProjectId("."),
    );
  });
});
