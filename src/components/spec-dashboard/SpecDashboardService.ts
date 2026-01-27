import { hc } from "hono/client";
import type { RouteType } from "@/server/hono/route";

const client = hc<RouteType>("/");

export interface OpenSpecChange {
  name: string;
  status: "draft" | "ready" | "implementing" | "review" | "archived";
  description?: string;
  updatedAt: string;
  proposalContent?: string;
  // Details
  designContent?: string;
  tasksContent?: string;
  testsContent?: string;
  specsContent?: string;
  specFiles?: { name: string; content: string }[];
}

export const specDashboardService = {
  getChanges: async (projectId: string): Promise<OpenSpecChange[]> => {
    const res = await client.api.projects[":projectId"].openspec.changes.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch changes");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    return data;
  },

  getArchivedChanges: async (projectId: string): Promise<OpenSpecChange[]> => {
    const res = await client.api.projects[":projectId"].openspec.archive.$get({
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch archived changes");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    return data;
  },

  getChangeDetails: async (
    projectId: string,
    changeId: string,
  ): Promise<OpenSpecChange> => {
    const res = await client.api.projects[":projectId"].openspec.changes[
      ":changeId"
    ].$get({
      param: { projectId, changeId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch change details");
    }
    const data = await res.json();
    if ("error" in data) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(errorMessage);
    }
    // Backend now returns full details including status and content
    return data as OpenSpecChange;
  },
};
