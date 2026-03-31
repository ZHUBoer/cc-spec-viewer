"use client";

import { Trans, useLingui } from "@lingui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FC, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mcpConfigQuery, mcpListQuery, saveMcpConfig } from "@/lib/api/queries";

interface McpConfigDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const McpConfigDialog: FC<McpConfigDialogProps> = ({
  projectId,
  open,
  onOpenChange,
}) => {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: configData, isLoading } = useQuery({
    ...mcpConfigQuery(projectId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (newContent: string) => saveMcpConfig(projectId, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mcpListQuery(projectId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: mcpConfigQuery(projectId).queryKey,
      });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (configData?.content) {
      setContent(configData.content);
      setError(null);
    }
  }, [configData?.content]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError(i18n._("mcp.config.error.invalid_json"));
    }
  }, [content, i18n]);

  const handleSave = useCallback(() => {
    try {
      JSON.parse(content);
      setError(null);
      mutation.mutate(content);
    } catch {
      setError(i18n._("mcp.config.error.invalid_json"));
    }
  }, [content, mutation, i18n]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans id="mcp.config.dialog.title" />
          </DialogTitle>
          <DialogDescription>
            <Trans id="mcp.config.dialog.description" />
          </DialogDescription>
          {configData?.configPath && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {configData.configPath}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-sm text-muted-foreground">
                <Trans id="mcp.config.loading" />
              </span>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              className="min-h-[400px] font-mono text-sm resize-none"
              placeholder='{"mcpServers": {}}'
              spellCheck={false}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleFormat}
            disabled={isLoading || mutation.isPending}
          >
            <Trans id="mcp.config.button.format" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            <Trans id="mcp.config.button.cancel" />
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || mutation.isPending}
          >
            {mutation.isPending ? (
              <Trans id="mcp.config.button.saving" />
            ) : (
              <Trans id="mcp.config.button.save" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
