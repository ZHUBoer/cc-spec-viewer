export function isMermaidErrorSvg(svg: string): boolean {
  return (
    /Syntax error in text|mermaid version/i.test(svg) ||
    /id=["']errorSvg["']/i.test(svg)
  );
}
