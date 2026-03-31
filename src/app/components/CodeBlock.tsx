import type { FC } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  className = "",
}) => {
  const normalizedCode = code.replace(/\n$/, "");
  const normalizedLanguage =
    typeof language === "string" && language.trim().length > 0
      ? language.trim()
      : undefined;

  return (
    <div
      className={`notranslate relative my-2 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-muted/15 ${className}`}
      translate="no"
    >
      {normalizedLanguage ? (
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {normalizedLanguage}
          </span>
        </div>
      ) : null}
      <pre className="max-w-full overflow-x-auto p-4 text-sm leading-6">
        <code className="font-mono text-foreground whitespace-pre">
          {normalizedCode}
        </code>
      </pre>
    </div>
  );
};
