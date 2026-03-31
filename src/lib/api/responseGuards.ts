const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getErrorMessage = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }
  const error = value.error;
  return typeof error === "string" ? error : null;
};

// Some RPC endpoints return `{ error: string }` without a `success` flag.
// This guard intentionally excludes `{ success: false, ... }` business failures.
export const isErrorResponseWithoutSuccessFlag = (
  value: unknown,
): value is { error: string } =>
  isRecord(value) && !("success" in value) && typeof value.error === "string";

export const isBusinessFailureResponse = (
  value: unknown,
): value is { success: false; error: string } =>
  isRecord(value) && value.success === false && typeof value.error === "string";

export const hasSuccessTrue = (value: unknown): value is { success: true } =>
  isRecord(value) && value.success === true;

export const hasStringHtml = (value: unknown): value is { html: string } =>
  isRecord(value) && typeof value.html === "string";
