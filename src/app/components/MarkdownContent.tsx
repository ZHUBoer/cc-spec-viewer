import { type FC, memo, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateMarkdownHeadingId } from "../../components/spec-dashboard/views/document-utils";
import { Mermaid } from "../../components/ui/Mermaid";
import { CodeBlock } from "./CodeBlock";
import { MarkdownLink } from "./MarkdownLink";
import { SpecNotificationCard } from "./SpecNotificationCard";

type SpecArtifact = "spec" | "proposal" | "design" | "tasks";
type ParsedSegment =
  | { type: "markdown"; key: string; content: string }
  | {
      type: "spec-card";
      key: string;
      artifact: SpecArtifact;
      changeId?: string;
      title: string;
      description: string;
    };

const SPEC_NOTIFICATION_REGEX =
  /<spec-notification\b([\s\S]*?)(?:\s*\/>|>\s*<\/spec-notification>)/gi;
const SPEC_NOTIFICATION_ATTR_REGEX = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;

const isSpecArtifact = (value: string | undefined): value is SpecArtifact => {
  return (
    value === "spec" ||
    value === "proposal" ||
    value === "design" ||
    value === "tasks"
  );
};

const parseSpecNotificationAttributes = (
  attrsStr: string,
): {
  artifact?: SpecArtifact;
  changeId?: string;
  title?: string;
  description?: string;
} => {
  const attrs: Record<string, string> = {};
  SPEC_NOTIFICATION_ATTR_REGEX.lastIndex = 0;
  let attrMatch = SPEC_NOTIFICATION_ATTR_REGEX.exec(attrsStr);

  while (attrMatch !== null) {
    const m = attrMatch;
    if (m[1] !== undefined && (m[2] !== undefined || m[3] !== undefined)) {
      attrs[m[1]] = m[2] ?? m[3] ?? "";
    }
    attrMatch = SPEC_NOTIFICATION_ATTR_REGEX.exec(attrsStr);
  }

  const artifact = attrs.artifact;

  return {
    artifact: isSpecArtifact(artifact) ? artifact : undefined,
    changeId: attrs.changeId ?? attrs.changeid,
    title: attrs.title,
    description: attrs.description,
  };
};

const splitBySpecNotification = (content: string): ParsedSegment[] => {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  SPEC_NOTIFICATION_REGEX.lastIndex = 0;
  let match = SPEC_NOTIFICATION_REGEX.exec(content);

  while (match !== null) {
    const fullTag = match[0] ?? "";
    const attrsStr = match[1] ?? "";

    if (match.index > lastIndex) {
      const markdownStart = lastIndex;
      const markdownEnd = match.index;
      segments.push({
        type: "markdown",
        key: `md-${markdownStart}-${markdownEnd}`,
        content: content.slice(markdownStart, markdownEnd),
      });
    }

    const { artifact, changeId, title, description } =
      parseSpecNotificationAttributes(attrsStr);

    if (
      artifact !== undefined &&
      title !== undefined &&
      description !== undefined &&
      ["spec", "proposal", "design", "tasks"].includes(artifact)
    ) {
      segments.push({
        type: "spec-card",
        key: `spec-${match.index}-${match.index + fullTag.length}`,
        artifact,
        changeId,
        title,
        description,
      });
    } else {
      segments.push({
        type: "markdown",
        key: `md-${match.index}-${match.index + fullTag.length}`,
        content: fullTag,
      });
    }

    lastIndex = match.index + fullTag.length;
    match = SPEC_NOTIFICATION_REGEX.exec(content);
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "markdown",
      key: `md-${lastIndex}-${content.length}`,
      content: content.slice(lastIndex),
    });
  }

  return segments.length > 0
    ? segments
    : [{ type: "markdown", key: "md-0-root", content }];
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// 将 components 对象提取到组件外部，避免每次渲染都重新创建
const createMarkdownComponents = () => ({
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  h1({ children, ...props }: any) {
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
    const id =
      typeof children === "string"
        ? generateMarkdownHeadingId(children)
        : undefined;
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
      <p
        className="mb-2 leading-7 text-foreground break-all whitespace-pre-wrap"
        {...props}
      >
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
  code({ className, children, node, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline =
      node?.position?.start.line === node?.position?.end.line && !match;
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

    return <CodeBlock code={String(children)} language={language} />;
  },
  // biome-ignore lint/suspicious/noExplicitAny: React Markdown 组件 props 类型由库动态提供
  pre({ children }: any) {
    // code 渲染器已经完整处理 fenced code/mermaid，继续包一层 pre
    // 会产生 <pre><div /></pre> 这类非法 DOM 结构。
    return children;
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
    const components = useMemo(() => createMarkdownComponents(), []);
    const segments = useMemo(() => splitBySpecNotification(content), [content]);

    return (
      <div
        className={`notranslate prose prose-neutral dark:prose-invert w-full min-w-0 max-w-full ${className}`}
        translate="no"
      >
        {segments.map((segment) => {
          if (segment.type === "spec-card") {
            return (
              <div key={segment.key} className="my-4">
                <SpecNotificationCard
                  artifact={segment.artifact}
                  changeId={segment.changeId}
                  title={segment.title}
                  description={segment.description}
                />
              </div>
            );
          }

          if (segment.content.length === 0) {
            return null;
          }

          return (
            <Markdown
              key={segment.key}
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {segment.content}
            </Markdown>
          );
        })}
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
