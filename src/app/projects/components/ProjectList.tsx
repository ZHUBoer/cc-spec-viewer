import { Trans } from "@lingui/react";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, FolderIcon, FolderOpen } from "lucide-react";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatLocaleDate } from "../../../lib/date/formatLocaleDate";
import { useConfig } from "../../hooks/useConfig";
import { useProjects } from "../hooks/useProjects";

export const ProjectList: FC = () => {
  const {
    data: { projects },
  } = useProjects();
  const { config } = useConfig();

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            <Trans id="project_list.no_projects.title" />
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            <Trans id="project_list.no_projects.description" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={"/projects/$projectId/session"}
          params={{ projectId: project.id }}
          className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
        >
          <Card className="h-full gap-0 border-border transition-[border-color,background-color] hover:border-primary/24 hover:bg-muted/35">
            <CardHeader className="gap-3 pb-4">
              <CardTitle className="flex items-start gap-3 text-base leading-6">
                {project.meta.isWorkspace ? (
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                    <FolderOpen className="h-4.5 w-4.5" />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <FolderIcon className="h-4.5 w-4.5" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 break-words">
                    {project.meta.projectName ?? project.claudeProjectPath}
                    {project.meta.isWorkspace && (
                      <Badge variant="secondary" className="ml-2 align-middle">
                        <Trans id="workspace.badge" />
                      </Badge>
                    )}
                  </span>
                </span>
              </CardTitle>
              {project.meta.projectPath ? (
                <CardDescription className="line-clamp-2 break-all text-sm leading-6">
                  {project.meta.projectPath}
                </CardDescription>
              ) : null}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p className="leading-6">
                  <Trans id="project_list.last_modified" />{" "}
                  {project.lastModifiedAt
                    ? formatLocaleDate(project.lastModifiedAt, {
                        locale: config.locale,
                        target: "time",
                      })
                    : ""}
                </p>
                <p className="text-xs leading-5">
                  <Trans id="project_list.messages" />{" "}
                  {project.meta.sessionCount}
                </p>
              </div>
            </CardContent>

            <CardFooter className="mt-auto border-t border-border/80 pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary/85">
                <Trans id="project_list.view_conversations" />
                <ChevronRightIcon className="h-4 w-4" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};
