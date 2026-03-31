import { toDisplayMessage } from "../../../../lib/session-display";
import type { ParsedUserMessage } from "../../claude-code/functions/parseUserMessage";
import type { ExtendedConversation } from "../../types";
import { extractFirstUserText } from "./extractFirstUserText";

export const extractFirstUserMessage = (
  conversation: ExtendedConversation,
): ParsedUserMessage | undefined => {
  if (conversation.type !== "user") {
    return undefined;
  }

  if (conversation.isSidechain === true) {
    return undefined;
  }

  const firstUserText = extractFirstUserText(conversation);

  if (firstUserText === null) {
    return undefined;
  }

  const command = toDisplayMessage(firstUserText);
  if (command === null) {
    return undefined;
  }

  return command;
};
