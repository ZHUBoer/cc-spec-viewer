import type { PermissionRequest } from "../types/permissions";

export const EMPTY_POLL_CLEAR_THRESHOLD = 2;

export const shouldAcceptPermissionEvent = (options: {
  sessionProcessId?: string;
  request: PermissionRequest;
}): boolean => {
  const { sessionProcessId, request } = options;
  if (!sessionProcessId) {
    return false;
  }
  return request.sessionProcessId === sessionProcessId;
};

export const getLatestPendingRequest = (options: {
  requests: PermissionRequest[];
  sessionProcessId?: string;
}): PermissionRequest | null => {
  const { requests, sessionProcessId } = options;
  if (!sessionProcessId) {
    return null;
  }
  const matched = requests.filter(
    (request) => request.sessionProcessId === sessionProcessId,
  );
  return matched.at(-1) ?? null;
};
