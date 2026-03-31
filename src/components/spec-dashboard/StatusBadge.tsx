import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { OpenSpecChange } from "./SpecDashboardService";

type ChangeStatus = OpenSpecChange["status"];

interface StatusBadgeProps {
  status: ChangeStatus;
  className?: string;
}

export const STATUS_CONFIG = {
  draft: {
    color: "gray" as const,
    label: "需求 Spec",
    icon: "📝",
    description: "需求 Spec 阶段，等待生成设计文档",
  },
  designing: {
    color: "yellow" as const,
    label: "技术设计评审中",
    icon: "🎨",
    description: "技术设计文档已生成，等待用户确认",
  },
  "design-confirmed": {
    color: "blue" as const,
    label: "技术设计已确认",
    icon: "✅",
    description: "技术设计评审完成，可以生成任务列表",
  },
  "task-planning": {
    color: "yellow" as const,
    label: "任务规划中",
    icon: "📋",
    description: "任务列表已生成，等待用户确认",
  },
  implementing: {
    color: "brand" as const,
    label: "实施中",
    icon: "⚙️",
    description: "OpenSpec 正在引导 Claude 实施任务",
  },
  completed: {
    color: "green" as const,
    label: "已完成",
    icon: "✨",
    description: "所有任务已完成，可以归档",
  },
  archived: {
    color: "gray" as const,
    label: "已归档",
    icon: "📦",
    description: "已归档，只读模式",
  },
} as const;

const getVariantClass = (status: ChangeStatus) => {
  const variantMap = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
    yellow:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700",
    brand:
      "bg-muted/30 text-primary border-primary/20 dark:bg-primary/12 dark:text-primary dark:border-primary/30",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700",
  } as const;

  const config = STATUS_CONFIG[status];
  return variantMap[config.color];
};

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${getVariantClass(status)} ${className} border`}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
