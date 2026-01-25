import { Check, Copy, Terminal } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface NewProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewProposalDialog: FC<NewProposalDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [copied, setCopied] = useState(false);
  const command = "/openspec:proposal";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New OpenSpec Proposal</DialogTitle>
          <DialogDescription>
            To start a new proposal, run the command below in your chat session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-x-2 mt-2">
          <div className="flex-1 relative">
            <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={command}
              readOnly
              className="pl-9 font-mono bg-muted/50"
            />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="bg-muted p-4 rounded-md mt-4 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Tip:</strong> This will start an interactive flow where you
            can describe:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Why is this change needed? (Problem)</li>
            <li>What is the proposed solution? (Solution)</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
