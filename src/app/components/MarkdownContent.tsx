import type { FC } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Mermaid } from "../../components/ui/Mermaid";
import { useTheme } from "../../hooks/useTheme";
import { MarkdownLink } from "./MarkdownLink";

// Utility to generate IDs from text
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, ""); // Keep Chinese characters
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: FC<MarkdownContentProps> = ({
  content,
  className = "",
}) => {
  const { resolvedTheme } = useTheme();
  const syntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;

  return (
    <div
      className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h1
                id={id}
                className="text-3xl font-bold mb-6 mt-8 pb-3 border-b border-border text-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h2
                id={id}
                className="text-2xl font-semibold mb-4 mt-8 pb-2 border-b border-border/50 text-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h3
                id={id}
                className="text-xl font-semibold mb-3 mt-6 text-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h4
                id={id}
                className="text-lg font-medium mb-2 mt-4 text-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h4>
            );
          },
          h5({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h5
                id={id}
                className="text-base font-medium mb-2 mt-4 text-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h5>
            );
          },
          h6({ children, ...props }) {
            const id =
              typeof children === "string" ? generateId(children) : undefined;
            return (
              <h6
                id={id}
                className="text-sm font-medium mb-2 mt-4 text-muted-foreground scroll-mt-20"
                {...props}
              >
                {children}
              </h6>
            );
          },
          p({ children, ...props }) {
            return (
              <p
                className="mb-2 leading-7 text-foreground break-all"
                {...props}
              >
                {children}
              </p>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="leading-7 text-foreground" {...props}>
                {children}
              </li>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            const language = match ? match[1] : "";

            if (isInline) {
              return (
                <code
                  className="bg-muted/70 px-2 py-1 rounded-md text-sm font-mono text-foreground border break-all"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            if (language === "mermaid") {
              return <Mermaid chart={String(children)} />;
            }

            return (
              <div className="relative my-2">
                <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-b border-border rounded-t-lg">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language}
                  </span>
                </div>
                <SyntaxHighlighter
                  style={syntaxTheme}
                  language={language}
                  PreTag="div"
                  className="!mt-0 !rounded-t-none !rounded-b-lg !border-t-0 !border !border-border"
                  customStyle={{
                    margin: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          pre({ children, ...props }) {
            return <pre {...props}>{children}</pre>;
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-primary/30 bg-muted/30 pl-6 pr-4 py-4 my-6 italic rounded-r-lg"
                {...props}
              >
                <div className="text-muted-foreground">{children}</div>
              </blockquote>
            );
          },
          a({ children, href, ...props }) {
            return (
              <MarkdownLink href={href} {...props}>
                {children}
              </MarkdownLink>
            );
          },
          // テーブルの改善
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6 rounded-lg border border-border max-w-full">
                <table className="w-full border-collapse" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-muted/50" {...props}>
                {children}
              </thead>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="border-b border-border px-4 py-3 text-left font-semibold text-foreground"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td
                className="border-b border-border px-4 py-3 text-foreground"
                {...props}
              >
                {children}
              </td>
            );
          },
          hr({ ...props }) {
            return <hr className="my-8 border-t border-border" {...props} />;
          },
          strong({ children, ...props }) {
            return (
              <strong className="font-semibold text-foreground" {...props}>
                {children}
              </strong>
            );
          },
          em({ children, ...props }) {
            return (
              <em className="italic text-foreground" {...props}>
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
