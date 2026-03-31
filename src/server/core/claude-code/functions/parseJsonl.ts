import { ConversationSchema } from "../../../../lib/conversation-schema";
import type { ErrorJsonl, ExtendedConversation } from "../../types";

type AssistantApiErrorLike = {
  type: "assistant";
  message: {
    type: "error";
    error?: unknown;
  };
  isSidechain: boolean;
  userType: "external";
  cwd: string;
  sessionId: string;
  version: string;
  uuid: string;
  timestamp: string;
  parentUuid: string | null;
  gitBranch?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const toOptionalNullableString = (value: unknown): string | null | undefined =>
  typeof value === "string" || value === null ? value : undefined;

const toOptionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const toOptionalRecord = (
  value: unknown,
): Record<string, unknown> | undefined => (isRecord(value) ? value : undefined);

const extractNormalizedApiError = (rawError: unknown) => {
  const errorRecord = toOptionalRecord(rawError);

  const nestedErrorRaw = errorRecord?.error;
  const nestedErrorRecord = toOptionalRecord(nestedErrorRaw);

  const nestedError =
    nestedErrorRecord &&
    typeof nestedErrorRecord.type === "string" &&
    typeof nestedErrorRecord.message === "string"
      ? {
          type: nestedErrorRecord.type,
          message: nestedErrorRecord.message,
        }
      : undefined;

  return {
    status: toOptionalNumber(errorRecord?.status),
    headers: toOptionalRecord(errorRecord?.headers),
    requestID: toOptionalNullableString(errorRecord?.requestID),
    error: {
      type: toOptionalString(errorRecord?.type) ?? "api_error",
      message: toOptionalString(errorRecord?.message),
      error: nestedError,
    },
  };
};

const isAssistantApiErrorLike = (
  value: unknown,
): value is AssistantApiErrorLike => {
  if (!isRecord(value)) {
    return false;
  }

  const message = value.message;
  const error = isRecord(message) ? message.error : undefined;

  return (
    value.type === "assistant" &&
    isRecord(message) &&
    message.type === "error" &&
    isRecord(error) &&
    error.type === "api_error" &&
    typeof value.isSidechain === "boolean" &&
    value.userType === "external" &&
    typeof value.cwd === "string" &&
    typeof value.sessionId === "string" &&
    typeof value.version === "string" &&
    typeof value.uuid === "string" &&
    typeof value.timestamp === "string" &&
    (typeof value.parentUuid === "string" || value.parentUuid === null)
  );
};

const normalizeAssistantApiErrorToSystem = (entry: AssistantApiErrorLike) => ({
  ...(() => {
    const normalizedError = extractNormalizedApiError(entry.message.error);
    return {
      error: {
        ...(normalizedError.status !== undefined
          ? { status: normalizedError.status }
          : {}),
        ...(normalizedError.headers !== undefined
          ? { headers: normalizedError.headers }
          : {}),
        ...(normalizedError.requestID !== undefined
          ? { requestID: normalizedError.requestID }
          : {}),
        error: normalizedError.error,
      },
    };
  })(),
  type: "system" as const,
  subtype: "api_error" as const,
  level: "error" as const,
  isSidechain: entry.isSidechain,
  userType: entry.userType,
  cwd: entry.cwd,
  sessionId: entry.sessionId,
  version: entry.version,
  uuid: entry.uuid,
  timestamp: entry.timestamp,
  parentUuid: entry.parentUuid,
  ...(entry.gitBranch !== undefined ? { gitBranch: entry.gitBranch } : {}),
});

export const parseJsonl = (content: string): ExtendedConversation[] => {
  const lines = content
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines.map((line, index) => {
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      const errorData: ErrorJsonl = {
        type: "x-error",
        line,
        lineNumber: index + 1,
      };
      return errorData;
    }
    const normalized = isAssistantApiErrorLike(raw)
      ? normalizeAssistantApiErrorToSystem(raw)
      : raw;

    const parsed = ConversationSchema.safeParse(normalized);
    if (!parsed.success) {
      const errorData: ErrorJsonl = {
        type: "x-error",
        line,
        lineNumber: index + 1,
      };
      return errorData;
    }

    return parsed.data;
  });
};
