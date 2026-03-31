import { Effect, Layer } from "effect";
import {
  ProjectMetaService,
  type ProjectPathRepairResult,
} from "../../server/core/project/services/ProjectMetaService";
import type { ProjectMeta } from "../../server/core/types";

export const testProjectMetaServiceLayer = (options?: {
  meta?: ProjectMeta;
  invalidateProject?: () => Effect.Effect<void>;
  repairProjectPath?: (
    projectId: string,
  ) => Effect.Effect<ProjectPathRepairResult>;
}) => {
  const {
    meta = {
      projectName: null,
      projectPath: null,
      sessionCount: 0,
      isWorkspace: false,
    },
    invalidateProject = () => Effect.void,
    repairProjectPath = (_projectId: string) =>
      Effect.succeed({
        success: false,
        reason: "no_project_path_found",
        candidates: [],
      } satisfies ProjectPathRepairResult),
  } = options ?? {};

  return Layer.mock(ProjectMetaService, {
    getProjectMeta: () => Effect.succeed(meta),
    invalidateProject: invalidateProject,
    repairProjectPath: repairProjectPath,
  });
};
