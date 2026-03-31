import type { OpenSpecChangeDetails } from "../../server/core/openspec/services/OpenSpecService";
import { honoClient } from "./client";
import { getErrorMessage } from "./responseGuards";

const isOpenSpecChangeDetails = (
  value: unknown,
): value is OpenSpecChangeDetails => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("name" in value) || typeof value.name !== "string") {
    return false;
  }
  if (!("status" in value) || typeof value.status !== "string") {
    return false;
  }
  if (!("updatedAt" in value) || typeof value.updatedAt !== "string") {
    return false;
  }
  if (!("specFiles" in value) || !Array.isArray(value.specFiles)) {
    return false;
  }
  return true;
};

export const getChangeDetails = async (
  projectId: string,
  changeId: string,
): Promise<OpenSpecChangeDetails> => {
  const response = await honoClient.api.projects[":projectId"].openspec.changes[
    ":changeId"
  ].$get({
    param: { projectId, changeId },
  });
  if (!response.ok) {
    throw new Error("Failed to get change details");
  }
  const data = await response.json();
  if (!isOpenSpecChangeDetails(data)) {
    throw new Error(getErrorMessage(data) ?? "Failed to get change details");
  }
  return data;
};
