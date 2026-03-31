import {
  CheckSquare,
  ClipboardList,
  FileSearch,
  FlaskConical,
  PenTool,
} from "lucide-react";
import type { FC } from "react";

type StageType = "spec" | "design" | "tasks" | "specs" | "tests";

interface StageEmptyStateProps {
  stage: StageType;
  title?: string;
  description?: string;
  hint?: string;
}

const STAGE_EMPTY_STATE_CONFIG: Record<
  StageType,
  {
    title: string;
    description: string;
    hint: string;
    Icon: typeof ClipboardList;
  }
> = {
  spec: {
    title: "Spec 尚未生成",
    description: "当前 change 还没有 spec 产物，因此无法进入评审。",
    hint: "先在会话中生成 spec，产物写入后这里会自动显示完整文档与评审操作。",
    Icon: ClipboardList,
  },
  design: {
    title: "Design 尚未生成",
    description: "当前 change 还没有 design 产物。",
    hint: "通常需要先确认 spec，再继续生成 design。",
    Icon: PenTool,
  },
  tasks: {
    title: "Tasks 尚未生成",
    description: "当前 change 还没有任务规划产物。",
    hint: "通常需要先确认 design，再生成 tasks。",
    Icon: CheckSquare,
  },
  specs: {
    title: "Specs 尚未生成",
    description: "当前 change 还没有规格说明文件或拆分 spec 文件。",
    hint: "实施推进后，这里会展示 specs.md 与拆分后的详细规格文件。",
    Icon: FileSearch,
  },
  tests: {
    title: "Tests 尚未生成",
    description: "当前 change 还没有测试方案或验收内容。",
    hint: "通常在实施完成或验收准备阶段，才会补齐 tests 产物。",
    Icon: FlaskConical,
  },
};

export const StageEmptyState: FC<StageEmptyStateProps> = ({
  stage,
  title,
  description,
  hint,
}) => {
  const config = STAGE_EMPTY_STATE_CONFIG[stage];

  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center py-8">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-dashed border-border bg-card/90 px-8 py-12 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <config.Icon className="h-7 w-7" />
        </div>
        <h3 className="mx-auto mb-3 max-w-md text-2xl font-semibold text-foreground">
          {title ?? config.title}
        </h3>
        <p className="mx-auto mb-3 max-w-lg text-sm leading-7 text-muted-foreground">
          {description ?? config.description}
        </p>
        <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground/90">
          {hint ?? config.hint}
        </p>
      </div>
    </div>
  );
};
