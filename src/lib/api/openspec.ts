import type { OpenSpecChangeDetails } from "../../server/core/openspec/services/OpenSpecService";

const getBaseUrl = (projectId: string) =>
  `/api/projects/${encodeURIComponent(projectId)}/openspec`;

export const getChangeDetails = async (
  projectId: string,
  changeId: string,
): Promise<OpenSpecChangeDetails> => {
  const response = await fetch(
    `${getBaseUrl(projectId)}/changes/${encodeURIComponent(changeId)}`,
  );
  if (!response.ok) {
    throw new Error("Failed to get change details");
  }
  return response.json();
};
