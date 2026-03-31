import { Trans, useLingui } from "@lingui/react";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GitCompareIcon,
  GlobeIcon,
  LoaderIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspacePanel } from "../../../../../../../hooks/useWorkspacePanel";
import type { PublicSessionProcess } from "../../../../../../../types/session-process";
import { isSessionProcessAbortable } from "./sessionProcessUi";

interface ChatActionMenuProps {
  projectId: string;
  isPending?: boolean;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  onOpenDiffModal?: () => void;
  sessionProcess?: PublicSessionProcess;
  abortTask?: UseMutationResult<unknown, Error, string, unknown>;
  isNewChat?: boolean;
}

const DEFAULT_BROWSER_URL = "https://trip.larkenterprise.com/drive/home/";

export const ChatActionMenu: FC<ChatActionMenuProps> = ({
  projectId,
  isPending = false,
  onScrollToTop,
  onScrollToBottom,
  onOpenDiffModal,
  sessionProcess,
  abortTask,
  isNewChat: _isNewChat,
}) => {
  const { i18n } = useLingui();
  const { openBrowser } = useWorkspacePanel();

  const [isOpeningNewChange, setIsOpeningNewChange] = useState(false);

  const handleOpenNewChange = () => {
    setIsOpeningNewChange(true);
    window.dispatchEvent(
      new CustomEvent("specforge:open-new-spec", {
        detail: { projectId },
      }),
    );
    setTimeout(() => {
      setIsOpeningNewChange(false);
    }, 300);
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-1">
      <div className="py-0 flex items-center gap-1.5 flex-wrap">
        {onOpenDiffModal && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenDiffModal}
            disabled={isPending}
            className="h-7 px-2 gap-1.5 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
            title={i18n._({
              id: "control.open_git_dialog",
              message: "Open Git Dialog",
            })}
          >
            <GitCompareIcon className="w-3.5 h-3.5" />
            <span>
              <Trans id="control.git" />
            </span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => openBrowser(DEFAULT_BROWSER_URL)}
          disabled={isPending}
          className="h-7 px-2 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
          title={i18n._({
            id: "control.open_browser",
            message: "Open Browser",
          })}
        >
          <GlobeIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending || isOpeningNewChange}
          className="h-7 px-2 gap-1.5 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
          onClick={handleOpenNewChange}
          title={i18n._({
            id: "control.new_change",
            message: "新建 Change",
          })}
        >
          {isOpeningNewChange ? (
            <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PlusIcon className="w-3.5 h-3.5" />
          )}
          <span>
            <Trans id="control.new_change" message="新建 Change" />
          </span>
        </Button>
        {/* TODO(yiwei): restore after opsx:continue is ready
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-7 px-2 gap-1.5 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("specforge:send-message", {
                detail: {
                  projectId,
                  message: "/opsx:continue ",
                },
              }),
            );
          }}
          title="/opsx:continue"
        >
          <span className="font-mono text-[10px] sm:text-xs">
            /opsx:continue{" "}
          </span>
        </Button>
        */}
        {onScrollToTop && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onScrollToTop}
            disabled={isPending}
            className="h-7 px-2 gap-1.5 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
            title={i18n._({
              id: "control.scroll_to_top",
              message: "Scroll to Top",
            })}
          >
            <ArrowUpIcon className="w-3.5 h-3.5" />
          </Button>
        )}
        {onScrollToBottom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onScrollToBottom}
            disabled={isPending}
            className="h-7 px-2 gap-1.5 text-xs bg-muted/20 rounded-lg border border-border/40 cursor-pointer"
            title={i18n._({
              id: "control.scroll_to_bottom",
              message: "Scroll to Bottom",
            })}
          >
            <ArrowDownIcon className="w-3.5 h-3.5" />
          </Button>
        )}
        {isSessionProcessAbortable(sessionProcess) && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              abortTask?.mutate(sessionProcess.id);
            }}
            disabled={!abortTask || abortTask.isPending || isPending}
            className="h-7 px-2 gap-1.5 text-xs rounded-lg cursor-pointer"
          >
            {abortTask?.isPending ? (
              <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XIcon className="w-3.5 h-3.5" />
            )}
            <span>
              {abortTask?.isPending ? (
                <Trans
                  id="session.conversation.aborting"
                  message="Aborting..."
                />
              ) : (
                <Trans id="session.conversation.abort" />
              )}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
