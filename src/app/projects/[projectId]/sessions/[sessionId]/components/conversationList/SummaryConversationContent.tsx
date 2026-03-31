import { ChevronDown } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const SummaryConversationContent: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2 mb-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            Summarized
          </h4>
          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 min-w-0 max-w-full rounded border bg-background p-3">
          <pre className="min-w-0 max-w-full break-all text-xs overflow-x-auto whitespace-pre-wrap">
            {children}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
