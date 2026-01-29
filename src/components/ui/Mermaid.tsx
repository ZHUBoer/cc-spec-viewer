"use client";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/useTheme";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  fontFamily: "inherit",
});
interface MermaidProps {
  chart: string;
}

// Helper to get CSS variable value in RGB format (required for Mermaid)
function parsedColor(varName: string): string {
  if (typeof window === "undefined") return "";

  // 1. Resolve the CSS variable to a browser-computed color string
  const el = document.createElement("div");
  el.style.display = "none";
  el.style.color = `var(${varName})`;
  document.body.appendChild(el);
  const computedColor = window.getComputedStyle(el).color;
  document.body.removeChild(el);

  if (!computedColor) return "";

  // 2. If it's already in a format Mermaid likely supports (rgb/rgba/hex), return it.
  // Note: Modern browsers might return 'oklch(...)' which Mermaid < 11.x (or specific parsers) might not handle.
  if (computedColor.startsWith("rgb") || computedColor.startsWith("#")) {
    return computedColor;
  }

  // 3. Force conversion to RGB using Canvas
  // This handles oklch, hsl, hwb, etc. by letting the browser render it to pixels.
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = computedColor;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      if (data.length >= 4) {
        const r = data[0] ?? 0;
        const g = data[1] ?? 0;
        const b = data[2] ?? 0;
        const a = data[3] ?? 255;
        const alpha = a / 255;
        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
  } catch (e) {
    console.warn("Mermaid: Failed to convert color via canvas", e);
  }

  // Fallback to original computed value
  return computedColor;
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAndRender = async () => {
      if (!chart || !containerRef.current) return;

      try {
        // Initialize with current theme variables
        // This is safe to call multiple times; it updates configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          themeVariables: {
            fontFamily: "inherit",
            darkMode: resolvedTheme === "dark",
            background: parsedColor("--background"),
            primaryColor: parsedColor("--primary"),
            secondaryColor: parsedColor("--secondary"),
            tertiaryColor: parsedColor("--muted"),
            primaryBorderColor: parsedColor("--primary"),
            secondaryBorderColor: parsedColor("--secondary"),
            tertiaryBorderColor: parsedColor("--border"),
            lineColor: parsedColor("--foreground"),
            textColor: parsedColor("--foreground"),
            mainBkg: parsedColor("--background"),
            nodeBorder: parsedColor("--primary"),
          },
        });

        if (mounted) {
          setError(null);
        }

        const cleanChart = chart.trim();
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;

        const { svg } = await mermaid.render(id, cleanChart);

        if (mounted) {
          setSvg(svg);
        }
      } catch (err) {
        // console.error("Failed to render mermaid chart:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    };

    initAndRender();

    return () => {
      mounted = false;
    };
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono border border-red-200 dark:border-red-900/50">
        <div className="font-semibold mb-1">Failed to render diagram</div>
        <div className="whitespace-pre-wrap">{error}</div>
        <pre className="mt-2 text-xs opacity-75 overflow-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart flex justify-center p-4 my-6 bg-white dark:bg-neutral-900/50 rounded-lg border border-border overflow-x-auto"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid generates safe SVG
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
