import { Trans } from "@lingui/react";
import { ChevronDown, Lightbulb, Wrench } from "lucide-react";
import { type FC, useState } from "react";
import z from "zod";
import { CodeBlock } from "@/app/components/CodeBlock";
import { AskUserQuestionInteractive } from "@/components/AskUserQuestionInteractive";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import type { AssistantMessageContent } from "@/lib/conversation-schema/message/AssistantMessageSchema";
import type { SidechainConversation } from "../../../../../../../lib/conversation-schema";
import { MarkdownContent } from "../../../../../../components/MarkdownContent";
import { usePendingAskUserQuestion } from "../../hooks/usePendingAskUserQuestion";
import { AskUserQuestionCard } from "./AskUserQuestionCard";
import type { AssistantContentSegment } from "./assistantContentSegments";
import { isMeaningfulAssistantText } from "./assistantContentSegments";
import { TaskModal } from "./TaskModal";
import { ToolInputOneLine } from "./ToolInputOneLine";

type ProcessGroupItems = Extract<
  AssistantContentSegment,
  { type: "process-group" }
>["items"];

type AssistantConversationContentProps = {
  content: AssistantMessageContent | ProcessGroupItems;
  collapsible: boolean;
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
  getToolUseResult: (toolUseId: string) => unknown;
  getAgentIdForToolUse: (toolUseId: string) => string | undefined;
  getSidechainConversationByAgentId: (
    agentId: string,
  ) => SidechainConversation | undefined;
  getSidechainConversationByPrompt: (
    prompt: string,
  ) => SidechainConversation | undefined;
  getSidechainConversations: (rootUuid: string) => SidechainConversation[];
  projectId: string;
  sessionId: string;
};

export const taskToolInputSchema = z
  .object({
    prompt: z.string(),
    description: z.string().optional(),
    subagent_type: z.string().optional(),
    model: z.string().optional(),
    max_turns: z.number().optional(),
    run_in_background: z.boolean().optional(),
    resume: z.string().optional(),
  })
  .passthrough();

export const isSubagentToolName = (name: string): boolean =>
  name === "Task" || name === "Agent";

export const askUserQuestionInputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      header: z.string(),
      options: z.array(
        z.object({
          label: z.string(),
          description: z.string(),
        }),
      ),
      multiSelect: z.boolean(),
    }),
  ),
});

export const askUserQuestionToolUseResultSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      header: z.string(),
      options: z.array(
        z.object({
          label: z.string(),
          description: z.string(),
        }),
      ),
      multiSelect: z.boolean(),
    }),
  ),
  answers: z.record(z.string(), z.string()),
});

const AssistantProcessGroup: FC<
  Omit<AssistantConversationContentProps, "content"> & {
    items: ProcessGroupItems;
  }
> = ({
  items,
  collapsible,
  getToolResult,
  getToolUseResult,
  getAgentIdForToolUse,
  getSidechainConversationByAgentId,
  getSidechainConversationByPrompt,
  getSidechainConversations,
  projectId,
  sessionId,
}) => {
  const { pendingToolUseId } = usePendingAskUserQuestion();
  const toolUseCount = items.filter((item) => item.type === "tool_use").length;
  const thinkingCount = items.length - toolUseCount;
  const shouldForceExpand = items.some((item) => {
    if (item.type !== "tool_use" || item.name !== "AskUserQuestion") {
      return false;
    }

    return pendingToolUseId === item.id && getToolResult(item.id) === undefined;
  });

  const itemList = (
    <ul className="w-full space-y-2">
      {items.map((item, index) => (
        <li key={`${item.type}-${index}`}>
          <AssistantConversationContent
            content={item}
            collapsible={false}
            getToolResult={getToolResult}
            getToolUseResult={getToolUseResult}
            getAgentIdForToolUse={getAgentIdForToolUse}
            getSidechainConversationByAgentId={
              getSidechainConversationByAgentId
            }
            getSidechainConversationByPrompt={getSidechainConversationByPrompt}
            getSidechainConversations={getSidechainConversations}
            projectId={projectId}
            sessionId={sessionId}
          />
        </li>
      ))}
    </ul>
  );

  if (!collapsible || shouldForceExpand) {
    return itemList;
  }

  const summaryParts: string[] = [];
  if (toolUseCount > 0) {
    summaryParts.push(`${toolUseCount} 个工具`);
  }
  if (thinkingCount > 0) {
    summaryParts.push(`${thinkingCount} 条思考`);
  }

  return (
    <Card className="bg-muted/35 border-dashed mb-2 max-w-full min-w-0 p-0 overflow-hidden">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/60 transition-all duration-200 py-2.5 px-4 group">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <CardTitle className="text-sm font-medium truncate">
                  <Trans
                    id="assistant.process_group.title"
                    message="过程 {count} 条"
                    values={{ count: items.length }}
                  />
                </CardTitle>
                {summaryParts.length > 0 && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {summaryParts.join(" / ")}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3">{itemList}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const AssistantConversationContent: FC<
  AssistantConversationContentProps
> = ({
  content,
  collapsible,
  getToolResult,
  getToolUseResult,
  getAgentIdForToolUse,
  getSidechainConversationByAgentId,
  getSidechainConversationByPrompt,
  getSidechainConversations,
  projectId,
  sessionId,
}) => {
  const { pendingRequestId, pendingToolUseId, onAnswersSubmit } =
    usePendingAskUserQuestion();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (Array.isArray(content)) {
    return (
      <AssistantProcessGroup
        items={content}
        collapsible={collapsible}
        getToolResult={getToolResult}
        getToolUseResult={getToolUseResult}
        getAgentIdForToolUse={getAgentIdForToolUse}
        getSidechainConversationByAgentId={getSidechainConversationByAgentId}
        getSidechainConversationByPrompt={getSidechainConversationByPrompt}
        getSidechainConversations={getSidechainConversations}
        projectId={projectId}
        sessionId={sessionId}
      />
    );
  }

  if (content.type === "text") {
    if (!isMeaningfulAssistantText(content)) {
      return null;
    }

    return (
      <div className="w-full mx-1 sm:mx-2 my-4 sm:my-6">
        <MarkdownContent content={content.text} />
      </div>
    );
  }

  if (content.type === "thinking") {
    return (
      <Card className="bg-muted/50 border-dashed gap-2 py-3 mb-2 max-w-full min-w-0 overflow-hidden hover:shadow-sm transition-all duration-200">
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/80 rounded-t-lg transition-all duration-200 py-0 px-4 group">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 transition-colors" />
                <CardTitle className="text-sm font-medium group-hover:text-foreground transition-colors">
                  <Trans id="assistant.thinking" />
                </CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="min-w-0 max-w-full px-4 py-2">
              <div className="min-w-0 max-w-full break-all whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                {content.thinking}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  if (content.type === "tool_use") {
    const toolResult = getToolResult(content.id);

    if (content.name === "AskUserQuestion") {
      const parseResult = askUserQuestionInputSchema.safeParse(content.input);

      if (!parseResult.success) {
        console.warn(
          "AskUserQuestion schema parse failed:",
          content.input,
          parseResult.error,
        );
        return null;
      }

      const askInput = parseResult.data;
      const rawToolUseResult = getToolUseResult(content.id);
      const toolUseResultParse = rawToolUseResult
        ? askUserQuestionToolUseResultSchema.safeParse(rawToolUseResult)
        : undefined;

      if (rawToolUseResult && !toolUseResultParse?.success) {
        console.warn(
          "AskUserQuestion toolUseResult parse failed:",
          rawToolUseResult,
          toolUseResultParse?.error,
        );
      }

      const answers = toolUseResultParse?.success
        ? toolUseResultParse.data.answers
        : undefined;
      const toolResultContent = toolResult?.content;
      const toolResultText =
        typeof toolResultContent === "string"
          ? toolResultContent
          : toolResultContent?.find((item) => item.type === "text")?.text;

      const hasMatchingToolUseId = pendingToolUseId === content.id;
      const isWaitingForOtherPending =
        !toolResult &&
        pendingRequestId !== null &&
        pendingToolUseId !== content.id;
      const isInteractive =
        !toolResult &&
        pendingRequestId !== null &&
        hasMatchingToolUseId &&
        onAnswersSubmit !== null;
      const questionTitle = askInput.questions[0]?.header || "问题";
      const totalCount = askInput.questions.length;

      return (
        <Card className="mb-2 max-w-full min-w-0 overflow-hidden border-emphasis-line p-0">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-all duration-200 py-2.5 px-4 group">
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wrench className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-medium group-hover:text-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                      {questionTitle}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      · 问题 {totalCount}/{totalCount}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={isInteractive ? "px-4 pb-4" : "px-4 pb-3 pt-1"}>
                {isInteractive ? (
                  <AskUserQuestionInteractive
                    questions={askInput.questions}
                    onSubmit={async (answers) => {
                      setIsSubmitting(true);
                      try {
                        await onAnswersSubmit(answers);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    isSubmitting={isSubmitting}
                  />
                ) : (
                  <AskUserQuestionCard
                    input={askInput}
                    answers={answers}
                    toolResult={toolResultText}
                    waitingForResponse={isWaitingForOtherPending}
                  />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      );
    }

    const taskModal = (() => {
      const taskInput = isSubagentToolName(content.name)
        ? taskToolInputSchema.safeParse(content.input)
        : undefined;

      if (taskInput === undefined || taskInput.success === false) {
        return undefined;
      }

      const agentId = getAgentIdForToolUse(content.id);

      return (
        <TaskModal
          prompt={taskInput.data.prompt}
          projectId={projectId}
          sessionId={sessionId}
          agentId={agentId}
          getSidechainConversationByAgentId={getSidechainConversationByAgentId}
          getSidechainConversationByPrompt={getSidechainConversationByPrompt}
          getSidechainConversations={getSidechainConversations}
          getToolResult={getToolResult}
        />
      );
    })();

    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 mb-2 max-w-full min-w-0 p-0 overflow-hidden">
        <Collapsible>
          <div className="flex items-center min-w-0">
            <CollapsibleTrigger asChild>
              <div className="flex-1 min-w-0 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all duration-200 px-3 py-1.5 group">
                <div className="flex items-center gap-2 min-w-0">
                  <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="w-full min-w-0 text-sm font-medium group-hover:text-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                    {content.name}
                    {Object.keys(content.input).length > 0 && (
                      <span className="font-normal">
                        {" "}
                        (<ToolInputOneLine input={content.input} />)
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
                </div>
              </div>
            </CollapsibleTrigger>
            {taskModal && (
              <div className="flex-shrink-0 border-l border-blue-200 dark:border-blue-800 flex items-center">
                {taskModal}
              </div>
            )}
          </div>
          <CollapsibleContent>
            <div className="min-w-0 max-w-full space-y-3 border-t border-blue-200 px-4 py-3 dark:border-blue-800">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  <Trans id="assistant.tool.tool_id" />
                </h4>
                <code className="max-w-full min-w-0 break-all bg-background/50 px-2 py-1 text-xs rounded border border-blue-200 font-mono dark:border-blue-800">
                  {content.id}
                </code>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  <Trans id="assistant.tool.input_parameters" />
                </h4>
                <CodeBlock
                  className="my-0"
                  language="json"
                  code={JSON.stringify(content.input, null, 2)}
                />
              </div>
              {toolResult && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    <Trans id="assistant.tool.result" />
                  </h4>
                  <div className="min-w-0 max-w-full bg-background rounded border p-3">
                    {typeof toolResult.content === "string" ? (
                      <pre className="max-w-full min-w-0 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        {toolResult.content}
                      </pre>
                    ) : (
                      toolResult.content.map((item) => {
                        if (item.type === "image") {
                          return (
                            <img
                              key={item.source.data}
                              src={`data:${item.source.media_type};base64,${item.source.data}`}
                              alt="Tool Result"
                            />
                          );
                        }
                        if (item.type === "text") {
                          return (
                            <pre
                              key={item.text}
                              className="max-w-full min-w-0 text-xs overflow-x-auto whitespace-pre-wrap break-all"
                            >
                              {item.text}
                            </pre>
                          );
                        }
                        item satisfies never;
                        throw new Error("Unexpected tool result content type");
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  if (content.type === "tool_result") {
    return null;
  }

  return null;
};
