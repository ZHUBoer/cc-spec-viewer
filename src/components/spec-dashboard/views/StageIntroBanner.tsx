import { FileText, ListTodo, PenTool } from "lucide-react";
import type { FC } from "react";

type StageType = "spec" | "design" | "tasks" | "specs" | "tests";

interface StageIntroBannerProps {
  stage: StageType;
}

const STAGE_CONFIG: Record<
  StageType,
  {
    title: string;
    description: string;
    Icon: typeof FileText;
  }
> = {
  spec: {
    title: "Spec Review Mode",
    description:
      "请确认每一项内容。待决策问题请统一确认。所有段落确认后方可完成评审。",
    Icon: FileText,
  },
  design: {
    title: "Design Review Mode",
    description:
      "请确认每一项内容。待决策问题请统一确认。所有段落确认后方可完成评审。",
    Icon: PenTool,
  },
  tasks: {
    title: "Task Planning Mode",
    description: "请审查生成的实施任务列表。确保所有步骤完整且合理。",
    Icon: ListTodo,
  },
  specs: {
    title: "Specs Review Mode",
    description: "查看规格说明与拆分文件，确认结构完整、引用清晰、内容可追踪。",
    Icon: FileText,
  },
  tests: {
    title: "Tests Review Mode",
    description: "查看测试方案与验收内容，确认覆盖范围与预期行为一致。",
    Icon: FileText,
  },
};

export const StageIntroBanner: FC<StageIntroBannerProps> = ({ stage }) => {
  const config = STAGE_CONFIG[stage];

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-background via-muted/20 to-muted/35 px-6 py-6">
      <h4 className="mb-3 flex items-center gap-3 text-[1.75rem] font-semibold tracking-[-0.02em] text-foreground">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <config.Icon className="h-5 w-5" />
        </span>
        {config.title}
      </h4>
      <p className="text-base leading-8 text-muted-foreground">
        {config.description}
      </p>
    </div>
  );
};
