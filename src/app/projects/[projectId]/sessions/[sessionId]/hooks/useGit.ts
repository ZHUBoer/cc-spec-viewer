import { useMutation, useQuery } from "@tanstack/react-query";
import { honoClient } from "@/lib/api/client";
import {
  getErrorMessage,
  isErrorResponseWithoutSuccessFlag,
} from "@/lib/api/responseGuards";
import { gitCurrentRevisionsQuery } from "../../../../../../lib/api/queries";

type CommitFilesResult =
  | {
      success: true;
      commitSha: string;
      filesCommitted: number;
      message: string;
    }
  | {
      success: false;
      error: string;
      errorCode: string;
      details: string;
    };

type PushCommitsResult =
  | {
      success: true;
      remote: string;
      branch: string;
    }
  | {
      success: false;
      error: string;
      errorCode: string;
      details: string;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCommitFilesResult = (value: unknown): value is CommitFilesResult => {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }
  if (value.success) {
    return (
      typeof value.commitSha === "string" &&
      typeof value.filesCommitted === "number" &&
      typeof value.message === "string"
    );
  }
  return (
    typeof value.error === "string" &&
    typeof value.errorCode === "string" &&
    typeof value.details === "string"
  );
};

const isPushCommitsResult = (value: unknown): value is PushCommitsResult => {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }
  if (value.success) {
    return typeof value.remote === "string" && typeof value.branch === "string";
  }
  return (
    typeof value.error === "string" &&
    typeof value.errorCode === "string" &&
    typeof value.details === "string"
  );
};

export const useGitCurrentRevisions = (projectId: string) => {
  return useQuery({
    queryKey: gitCurrentRevisionsQuery(projectId).queryKey,
    queryFn: gitCurrentRevisionsQuery(projectId).queryFn,
    staleTime: 30000, // 30 seconds
  });
};

export const useGitDiff = () => {
  return useMutation({
    mutationFn: async ({
      projectId,
      fromRef,
      toRef,
    }: {
      projectId: string;
      fromRef: string;
      toRef: string;
    }) => {
      const response = await honoClient.api.projects[
        ":projectId"
      ].git.diff.$post({
        param: { projectId },
        json: { fromRef, toRef },
      });

      if (!response.ok) {
        throw new Error(`Failed to get diff: ${response.statusText}`);
      }

      const data = await response.json();
      if (isErrorResponseWithoutSuccessFlag(data)) {
        throw new Error(data.error);
      }
      return data;
    },
  });
};

export const useCommitFiles = (projectId: string) => {
  return useMutation({
    mutationFn: async ({
      files,
      message,
    }: {
      files: string[];
      message: string;
    }): Promise<CommitFilesResult> => {
      const response = await honoClient.api.projects[
        ":projectId"
      ].git.commit.$post({
        param: { projectId },
        json: { projectId, files, message },
      });

      if (!response.ok) {
        throw new Error(`Failed to commit files: ${response.statusText}`);
      }

      const data = await response.json();
      if (isErrorResponseWithoutSuccessFlag(data)) {
        throw new Error(data.error);
      }
      if (!isCommitFilesResult(data)) {
        throw new Error(getErrorMessage(data) ?? "Invalid commit response");
      }
      return data;
    },
  });
};

export const usePushCommits = (projectId: string) => {
  return useMutation({
    mutationFn: async (): Promise<PushCommitsResult> => {
      const response = await honoClient.api.projects[
        ":projectId"
      ].git.push.$post({
        param: { projectId },
        json: { projectId },
      });

      if (!response.ok) {
        throw new Error(`Failed to push commits: ${response.statusText}`);
      }

      const data = await response.json();
      if (isErrorResponseWithoutSuccessFlag(data)) {
        throw new Error(data.error);
      }
      if (!isPushCommitsResult(data)) {
        throw new Error(getErrorMessage(data) ?? "Invalid push response");
      }
      return data;
    },
  });
};

export const useCommitAndPush = (projectId: string) => {
  return useMutation({
    mutationFn: async ({
      files,
      message,
    }: {
      files: string[];
      message: string;
    }) => {
      const response = await honoClient.api.projects[":projectId"].git[
        "commit-and-push"
      ].$post({
        param: { projectId },
        json: { projectId, files, message },
      });

      if (!response.ok) {
        throw new Error(`Failed to commit and push: ${response.statusText}`);
      }

      const data = await response.json();
      if (isErrorResponseWithoutSuccessFlag(data)) {
        throw new Error(getErrorMessage(data) ?? "Failed to commit and push");
      }
      return data;
    },
  });
};
