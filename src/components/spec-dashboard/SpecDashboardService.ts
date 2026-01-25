import { hc } from "hono/client";
import type { RouteType } from "@/server/hono/route";

const client = hc<RouteType>("/");

export interface OpenSpecChange {
  name: string;
  status: "draft" | "ready" | "implementing" | "review" | "archived";
  description?: string;
  updatedAt: string;
  proposalContent?: string;
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
    // Map backend OpenSpecChangeDetails to frontend OpenSpecChange if fields differ slightly,
    // but for now they are compatible enough for this demo.
    // Need to fill in missing fields like status/updatedAt if the details endpoint doesn't return them,
    // or merge with list data. For now, details endpoint returns name and content.
    return {
      name: data.name,
      status: "draft", // default if not provided
      updatedAt: new Date().toISOString(), // default
      proposalContent: data.proposalContent,
      description: "",
    };
  },
};
