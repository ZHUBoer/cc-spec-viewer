import { ChevronDown, Terminal } from "lucide-react";
import type { FC } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { parseUserMessage } from "../../../../../../../server/core/claude-code/functions/parseUserMessage";
import { MarkdownContent } from "../../../../../../components/MarkdownContent";

export const UserTextContent: FC<{ text: string; id?: string }> = ({
  text,
  id,
}) => {
  const parsed = parseUserMessage(text);

  if (parsed.kind === "command") {
    return (
      <Card
        className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 gap-2 py-3 mb-3"
        id={id}
      >
        <CardHeader className="py-0 px-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-600 dark:text-green-400" />
            <CardTitle className="text-sm font-medium">
              Claude Code Command
            </CardTitle>
            <Badge
              variant="outline"
              className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
            >
              {parsed.commandName}
            </Badge>
          </div>
        </CardHeader>
        {parsed.commandArgs || parsed.commandMessage ? (
          <CardContent className="py-0 px-4">
            <div className="space-y-2">
              <div>
                <Collapsible defaultOpen className="group/collapsible">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Details
                    </span>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    {parsed.commandArgs && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-muted-foreground block mb-1">
                          Arguments:
                        </span>
                        <div className="bg-background rounded border p-2">
                          <code className="text-xs whitespace-pre-line break-all">
                            {parsed.commandArgs}
                          </code>
                        </div>
                      </div>
                    )}
                    {parsed.commandMessage && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">
                          Message:
                        </span>
                        <div className="bg-background rounded border p-2">
                          <code className="text-xs whitespace-pre-line break-all">
                            {parsed.commandMessage}
                          </code>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  if (parsed.kind === "local-command") {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 gap-2 py-3 mb-3">
        <CardHeader className="py-0 px-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-600 dark:text-green-400" />
            <CardTitle className="text-sm font-medium">Local Command</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-0 px-4">
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
            {parsed.stdout}
          </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <MarkdownContent
      className="w-full px-3 py-3 mb-5 border border-border rounded-lg bg-slate-50 dark:bg-slate-900/50"
      content={parsed.content}
    />
  );
};
