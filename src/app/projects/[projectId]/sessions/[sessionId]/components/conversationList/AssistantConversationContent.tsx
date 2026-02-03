import { Trans } from "@lingui/react";
import { ChevronDown, Lightbulb, Wrench } from "lucide-react";
import type { FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import z from "zod";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import type { AssistantMessageContent } from "@/lib/conversation-schema/message/AssistantMessageSchema";
import { useTheme } from "../../../../../../../hooks/useTheme";
import type { SidechainConversation } from "../../../../../../../lib/conversation-schema";
import { MarkdownContent } from "../../../../../../components/MarkdownContent";
import { AskUserQuestionCard } from "./AskUserQuestionCard";
import { TaskModal } from "./TaskModal";
import { ToolInputOneLine } from "./ToolInputOneLine";

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
  .passthrough(); // Allow unknown fields for future compatibility

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
  answers: z.record(z.string(), z.string()), // question -> answer
});

export const AssistantConversationContent: FC<{
  content: AssistantMessageContent;
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
}> = ({
  content,
  getToolResult,
  getToolUseResult,
  getAgentIdForToolUse,
  getSidechainConversationByAgentId,
  getSidechainConversationByPrompt,
  getSidechainConversations,
  projectId,
  sessionId,
}) => {
  const { resolvedTheme } = useTheme();
  const syntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;
  if (content.type === "text") {
    return (
      <div className="w-full mx-1 sm:mx-2 my-4 sm:my-6">
        <MarkdownContent content={content.text} />
      </div>
    );
  }

  if (content.type === "thinking") {
    return (
      <Card className="bg-muted/50 border-dashed gap-2 py-3 mb-2 hover:shadow-sm transition-all duration-200">
        <Collapsible>
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
            <div className="py-2 px-4">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
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

    // 特殊处理：AskUserQuestion
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

      // 从 toolUseResult 获取 answers（如果存在）
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

      // 获取 tool_result 的确认消息
      const toolResultContent = toolResult?.content;
      const toolResultText =
        typeof toolResultContent === "string"
          ? toolResultContent
          : toolResultContent?.find((item) => item.type === "text")?.text;

      return (
        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20 mb-2 p-0 overflow-hidden">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-all duration-200 py-3 px-4 group">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <CardTitle className="text-sm font-medium group-hover:text-foreground transition-colors">
                    <Trans id="assistant.tool.ask_user_question.title" />
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <AskUserQuestionCard
                  input={askInput}
                  answers={answers}
                  toolResult={toolResultText}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      );
    }

    const taskModal = (() => {
      // Task tool 包含 prompt、description、subagent_type 等字段
      // taskToolInputSchema 使用 .passthrough() 允许额外字段通过
      const taskInput =
        content.name === "Task"
          ? taskToolInputSchema.safeParse(content.input)
          : undefined;

      if (taskInput === undefined || taskInput.success === false) {
        return undefined;
      }

      // Get agentId from toolUseResult if available (new Claude Code versions)
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
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 mb-2 p-0 overflow-hidden">
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
                        (
                        <ToolInputOneLine input={content.input} />)
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
            <div className="space-y-3 py-3 px-4 border-t border-blue-200 dark:border-blue-800">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  <Trans id="assistant.tool.tool_id" />
                </h4>
                <code className="text-xs bg-background/50 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 font-mono">
                  {content.id}
                </code>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  <Trans id="assistant.tool.input_parameters" />
                </h4>
                <SyntaxHighlighter
                  style={syntaxTheme}
                  language="json"
                  PreTag="div"
                  className="text-xs rounded"
                >
                  {JSON.stringify(content.input, null, 2)}
                </SyntaxHighlighter>
              </div>
              {toolResult && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    <Trans id="assistant.tool.result" />
                  </h4>
                  <div className="bg-background rounded border p-3">
                    {typeof toolResult.content === "string" ? (
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
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
                              className="text-xs overflow-x-auto whitespace-pre-wrap break-words"
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
