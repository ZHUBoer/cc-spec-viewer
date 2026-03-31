import { describe, expect, test } from "vitest";
import { isMermaidErrorSvg } from "./mermaidError";

describe("isMermaidErrorSvg", () => {
  test("detects Mermaid syntax error placeholder svg output", () => {
    const errorSvg = `
      <svg>
        <g id="errorSvg">
          <text>Syntax error in text</text>
          <text>mermaid version 11.12.2</text>
        </g>
      </svg>
    `;

    const validSvg = `
      <svg>
        <g id="flowchart-1">
          <text>Normal chart</text>
        </g>
      </svg>
    `;

    expect(isMermaidErrorSvg(errorSvg)).toBe(true);
    expect(isMermaidErrorSvg(validSvg)).toBe(false);
  });
});
