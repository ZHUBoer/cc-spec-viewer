import { type FC, memo, useMemo } from "react";
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

// 将 components 对象提取到组件外部，避免每次渲染都重新创建
const createMarkdownComponents = (syntaxTheme: typeof oneDark) => ({
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h1({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h2({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h3({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h4({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h5({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h6({ children, ...props }: any) {
    const id = typeof children === "string" ? generateId(children) : undefined;
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
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  p({ children, ...props }: any) {
    return (
      <p className="mb-2 leading-7 text-foreground break-all" {...props}>
        {children}
      </p>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  ul({ children, ...props }: any) {
    return (
      <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
        {children}
      </ul>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  ol({ children, ...props }: any) {
    return (
      <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
        {children}
      </ol>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  li({ children, ...props }: any) {
    return (
      <li className="leading-7 text-foreground" {...props}>
        {children}
      </li>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  code({ className, children, ...props }: any) {
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
          wrapLines={false}
          wrapLongLines={false}
          showLineNumbers={false}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  pre({ children, ...props }: any) {
    return <pre {...props}>{children}</pre>;
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  blockquote({ children, ...props }: any) {
    return (
      <blockquote
        className="border-l-4 border-primary/30 bg-muted/30 pl-6 pr-4 py-4 my-6 italic rounded-r-lg"
        {...props}
      >
        <div className="text-muted-foreground">{children}</div>
      </blockquote>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  a({ children, href, ...props }: any) {
    return (
      <MarkdownLink href={href} {...props}>
        {children}
      </MarkdownLink>
    );
  },
  // 表格改进
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  table({ children, ...props }: any) {
    return (
      <div className="overflow-x-auto my-6 rounded-lg border border-border max-w-full">
        <table className="w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  thead({ children, ...props }: any) {
    return (
      <thead className="bg-muted/50" {...props}>
        {children}
      </thead>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  th({ children, ...props }: any) {
    return (
      <th
        className="border-b border-border px-4 py-3 text-left font-semibold text-foreground"
        {...props}
      >
        {children}
      </th>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  td({ children, ...props }: any) {
    return (
      <td
        className="border-b border-border px-4 py-3 text-foreground"
        {...props}
      >
        {children}
      </td>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  hr({ ...props }: any) {
    return <hr className="my-8 border-t border-border" {...props} />;
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  strong({ children, ...props }: any) {
    return (
      <strong className="font-semibold text-foreground" {...props}>
        {children}
      </strong>
    );
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  em({ children, ...props }: any) {
    return (
      <em className="italic text-foreground" {...props}>
        {children}
      </em>
    );
  },
});

export const MarkdownContent: FC<MarkdownContentProps> = memo(
  ({ content, className = "" }) => {
    const { resolvedTheme } = useTheme();
    const syntaxTheme = useMemo(
      () => (resolvedTheme === "dark" ? oneDark : oneLight),
      [resolvedTheme],
    );

    // 使用 useMemo 缓存 components 对象，只有当 syntaxTheme 变化时才重新创建
    const components = useMemo(
      () => createMarkdownComponents(syntaxTheme),
      [syntaxTheme],
    );

    return (
      <div
        className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}
      >
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </Markdown>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数：只有当 content 或 className 变化时才重新渲染
    return (
      prevProps.content === nextProps.content &&
      prevProps.className === nextProps.className
    );
  },
);
