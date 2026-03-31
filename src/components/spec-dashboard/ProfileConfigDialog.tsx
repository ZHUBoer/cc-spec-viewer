import {
  AlertCircle,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Minus,
  Plus,
  Save,
  Settings2,
  Upload,
} from "lucide-react";
import {
  type FC,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BuiltInProfile } from "./SpecDashboardService";
import type { ProfileInfraCatalogSchema } from "./schemas";

type ProfileInfraCatalog = z.infer<typeof ProfileInfraCatalogSchema>;

export interface ProfileFormData {
  displayName?: string;
  custom_variables?: Record<string, string>;
  infra_catalog: ProfileInfraCatalog;
}

// ============================================================================
// 默认 Description 值（来自 config.example.json）
// ============================================================================

const DEFAULT_TOOL_DEFINITION_DESCRIPTIONS = {
  overview:
    "业务基建/框架全景认知能力。用于在任务开始时建立全局上下文，了解框架结构、核心规范与组件和 API 概览等开发指南。",
  search:
    "探索与发现能力。用于在需求模糊或未知具体实现方案时，通过自然语言检索匹配最相关的文档内容、代码示例、解决方案和最佳实践。",
  specifications:
    "精准规格查阅能力。用于在已确定具体组件或 API 名称后，获取其详细的介绍、属性说明、使用方式和代码示例。",
} as const;

const DEFAULT_DEVELOP_SKILLS_DESCRIPTION =
  "开发过程中 agent 需要的开发经验/知识，识别合适场景，按需使用。";

// Code Examples 固定值（来自 config.example.json）
const CODE_EXAMPLE_NAME = "最佳实践页面（或者最佳实践接口等）";
const CODE_EXAMPLE_DESCRIPTION =
  "展示项目中一个标准页面的开发规范和封装习惯，包括基建能力的使用规范。";

// ============================================================================
// MCP Server Provider 编辑器
// ============================================================================

const McpServerEditor: FC<{
  providers: Record<
    string,
    {
      type: "http" | "sse" | "stdio";
      url?: string;
      command?: string;
      args?: string[];
    }
  >;
  onChange: (
    providers: Record<
      string,
      {
        type: "http" | "sse" | "stdio";
        url?: string;
        command?: string;
        args?: string[];
      }
    >,
  ) => void;
}> = ({ providers, onChange }) => {
  const entries = Object.entries(providers);

  const updateEntry = (
    oldKey: string,
    newKey: string,
    value: {
      type: "http" | "sse" | "stdio";
      url?: string;
      command?: string;
      args?: string[];
    },
  ) => {
    const updated: typeof providers = {};
    for (const [k, v] of Object.entries(providers)) {
      if (k === oldKey) {
        updated[newKey] = value;
      } else {
        updated[k] = v;
      }
    }
    onChange(updated);
  };

  const removeEntry = (key: string) => {
    const updated: typeof providers = {};
    for (const [k, v] of Object.entries(providers)) {
      if (k !== key) {
        updated[k] = v;
      }
    }
    onChange(updated);
  };

  const addEntry = () => {
    onChange({
      ...providers,
      [`mcp-server-${Date.now()}`]: { type: "http", url: "" },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sidebar-border/40">
        <span className="text-sm font-semibold text-sidebar-foreground/90 tracking-wide">
          MCP Server Providers
        </span>
        <button
          type="button"
          onClick={addEntry}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/25 hover:bg-muted/35 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          添加服务
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="py-6 text-center text-sm text-sidebar-foreground/50 border-2 border-dashed border-sidebar-border/40 rounded-xl bg-background hover:bg-muted/20 transition-colors duration-200">
          暂无 MCP 服务，点击上方"添加服务"按钮添加
        </div>
      ) : (
        entries.map(([key, server]) => (
          <div
            key={key}
            className="space-y-3 rounded-xl border border-sidebar-border/50 bg-background p-5 transition-all duration-200 hover:border-sidebar-border/70"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => updateEntry(key, e.target.value, server)}
                className="flex-1 rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="服务名称"
              />
              <select
                value={server.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  if (
                    newType === "http" ||
                    newType === "sse" ||
                    newType === "stdio"
                  ) {
                    updateEntry(key, key, { ...server, type: newType });
                  }
                }}
                className="cursor-pointer rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="http">HTTP</option>
                <option value="sse">SSE</option>
                <option value="stdio">stdio</option>
              </select>
              <button
                type="button"
                onClick={() => removeEntry(key)}
                className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
            {(server.type === "http" || server.type === "sse") && (
              <input
                type="text"
                value={server.url ?? ""}
                onChange={(e) =>
                  updateEntry(key, key, { ...server, url: e.target.value })
                }
                className="w-full rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="URL"
              />
            )}
            {server.type === "stdio" && (
              <>
                <input
                  type="text"
                  value={server.command ?? ""}
                  onChange={(e) =>
                    updateEntry(key, key, {
                      ...server,
                      command: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="command"
                />
                <input
                  type="text"
                  value={(server.args ?? []).join(" ")}
                  onChange={(e) =>
                    updateEntry(key, key, {
                      ...server,
                      args: e.target.value
                        ? e.target.value.split(" ")
                        : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="args（空格分隔）"
                />
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// ============================================================================
// MCP Tool Definition 编辑器
// ============================================================================

const ToolDefinitionEditor: FC<{
  label: string;
  definition: { description: string; tools: string[] };
  onChange: (def: { description: string; tools: string[] }) => void;
  defaultDescription: string;
  mcpServerNames?: string[];
}> = ({
  label,
  definition,
  onChange,
  defaultDescription,
  mcpServerNames = [],
}) => {
  // 生成示例格式：如果有 MCP 服务器名称，使用第一个；否则使用通用示例
  // 格式：mcp__mcp名称__工具名称（使用双下划线）
  const exampleFormat =
    mcpServerNames.length > 0
      ? `mcp__${mcpServerNames[0]}__工具名称`
      : "mcp__mcp名称__工具名称";

  return (
    <div className="space-y-4 rounded-xl border border-sidebar-border/50 bg-background p-5 transition-all duration-200">
      <div className="space-y-2 pb-3 border-b border-sidebar-border/30">
        <span className="block text-sm font-semibold text-sidebar-foreground/90 tracking-wide">
          {label}
        </span>
        <span className="block text-sm text-sidebar-foreground/70 leading-relaxed">
          {defaultDescription}
        </span>
      </div>
      <StringListEditor
        items={definition.tools}
        onChange={(tools) =>
          onChange({ ...definition, tools, description: defaultDescription })
        }
        placeholder={exampleFormat}
      />
    </div>
  );
};

// ============================================================================
// 字符串列表编辑器（通用）
// ============================================================================

const StringListEditor: FC<{
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}> = ({ items, onChange, placeholder = "输入内容" }) => {
  const baseId = useId();
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={`${baseId}-${String(index)}`}
          className="flex items-center gap-1"
        >
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[index] = e.target.value;
              onChange(updated);
            }}
            className="flex-1 rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/25 hover:bg-muted/35 active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" />
        添加项
      </button>
    </div>
  );
};

// ============================================================================
// Code Examples 编辑器（固定只有一项）
// ============================================================================

const CodeExamplesEditor: FC<{
  paths: string[];
  onChange: (paths: string[]) => void;
}> = ({ paths, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {/* 固定的名称和描述 */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-sidebar-foreground/70 shrink-0">
            名称：
          </span>
          <span className="text-sm text-sidebar-foreground/70">
            {CODE_EXAMPLE_NAME}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-sm text-sidebar-foreground/70 shrink-0">
            描述：
          </span>
          <span className="text-sm text-sidebar-foreground/70">
            {CODE_EXAMPLE_DESCRIPTION}
          </span>
        </div>
        {/* 可编辑的路径 */}
        <div>
          <span className="text-sm text-sidebar-foreground/60 mb-1 block">
            路径
          </span>
          <StringListEditor
            items={paths}
            onChange={onChange}
            placeholder="文件路径"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 主弹窗组件
// ============================================================================

// 创建空表单数据的辅助函数
const createEmptyFormData = (): ProfileFormData => ({
  custom_variables: {},
  infra_catalog: {
    mcp_server_providers: {},
    mcp_tool_definitions: {
      overview: {
        description: DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.overview,
        tools: [],
      },
      search: {
        description: DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.search,
        tools: [],
      },
      specifications: {
        description: DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.specifications,
        tools: [],
      },
    },
    develop_skills: {
      description: DEFAULT_DEVELOP_SKILLS_DESCRIPTION,
      skills: [],
    },
    code_examples: {
      examples: [
        {
          name: CODE_EXAMPLE_NAME,
          description: CODE_EXAMPLE_DESCRIPTION,
          paths: [],
        },
      ],
    },
  },
});

export const ProfileConfigDialog: FC<{
  open: boolean;
  onClose: () => void;
  initialData: ProfileFormData | null;
  loading?: boolean;
  onSave: (data: ProfileFormData) => void | Promise<void>;
  saving?: boolean;
  availableProfiles?: BuiltInProfile[];
}> = ({
  open,
  onClose,
  initialData,
  loading,
  onSave,
  saving,
  availableProfiles = [],
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(() =>
    initialData
      ? JSON.parse(JSON.stringify(initialData))
      : createEmptyFormData(),
  );
  const [error, setError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dsGitId = useId();
  const dsSkillsId = useId();

  // 当弹窗打开且 initialData 变化时重置表单
  useEffect(() => {
    if (!open) return;
    if (saving) return;
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      setFormData(createEmptyFormData());
    }
  }, [open, initialData, saving]);

  // 处理 Profile 切换
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = availableProfiles.find((p) => p.id === profileId);
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        custom_variables: profile.custom_variables || {},
        infra_catalog: JSON.parse(JSON.stringify(profile.infra_catalog)),
      });
    }
  };

  const updateInfraCatalog = useCallback(
    (patch: Partial<ProfileInfraCatalog>) => {
      if (!formData) return;
      setFormData({
        ...formData,
        infra_catalog: { ...formData.infra_catalog, ...patch },
      });
    },
    [formData],
  );

  // JSON 导入处理
  const handleJsonImport = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.infra_catalog) {
        setError("JSON 缺少 infra_catalog 字段");
        return;
      }

      // 验证并设置表单数据
      const importedData: ProfileFormData = {
        displayName: parsed.displayName,
        custom_variables: parsed.custom_variables || {},
        infra_catalog: parsed.infra_catalog,
      };

      // 确保 code_examples 有固定的一项
      if (
        !importedData.infra_catalog.code_examples?.examples ||
        importedData.infra_catalog.code_examples.examples.length === 0
      ) {
        importedData.infra_catalog.code_examples = {
          examples: [
            {
              name: CODE_EXAMPLE_NAME,
              description: CODE_EXAMPLE_DESCRIPTION,
              paths: [],
            },
          ],
        };
      } else {
        // 确保第一项的 name 和 description 是固定的
        importedData.infra_catalog.code_examples.examples[0] = {
          name: CODE_EXAMPLE_NAME,
          description: CODE_EXAMPLE_DESCRIPTION,
          paths:
            importedData.infra_catalog.code_examples.examples[0]?.paths || [],
        };
        // 只保留第一项
        importedData.infra_catalog.code_examples.examples = [
          importedData.infra_catalog.code_examples.examples[0],
        ];
      }

      // 强制使用默认 description 值
      if (importedData.infra_catalog.mcp_tool_definitions) {
        importedData.infra_catalog.mcp_tool_definitions.overview.description =
          DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.overview;
        importedData.infra_catalog.mcp_tool_definitions.search.description =
          DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.search;
        importedData.infra_catalog.mcp_tool_definitions.specifications.description =
          DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.specifications;
      }
      if (importedData.infra_catalog.develop_skills) {
        importedData.infra_catalog.develop_skills.description =
          DEFAULT_DEVELOP_SKILLS_DESCRIPTION;
      }

      setFormData(importedData);
      setJsonInput("");
      setShowJsonImport(false);
      setError(null);
    } catch (e) {
      setError(`JSON 解析失败: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          handleJsonImport(content);
        }
      };
      reader.onerror = () => {
        setError("文件读取失败");
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleJsonImport],
  );

  if (!open) return null;

  const handleSave = async () => {
    setError(null);
    try {
      await onSave(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          return;
        }
      }}
    >
      <DialogContent
        className="max-h-[85vh] max-w-[720px] flex flex-col border border-sidebar-border/60 bg-sidebar/95 p-0 shadow-[0_22px_60px_-34px_rgba(7,17,31,0.55)] backdrop-blur-sm"
        showCloseButton={false}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {/* 标题栏 */}
        <DialogHeader className="px-6 py-4 border-b border-sidebar-border/40 bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <div className="rounded-lg border border-primary/20 bg-primary/8 p-1.5">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <span>Profile 配置</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-sidebar-border/40 px-3.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:border-sidebar-border/60 hover:bg-muted/25 hover:text-sidebar-foreground"
              >
                <FileText className="w-4 h-4" />
                {showJsonImport ? "表单编辑" : "JSON 导入"}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 shrink min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-sidebar-foreground/50" />
            </div>
          ) : showJsonImport ? (
            /* JSON 导入模式 */
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-sidebar-foreground/70">
                    粘贴 JSON 配置
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted/30 rounded-md transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    上传文件
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="h-96 w-full resize-none rounded-xl border border-sidebar-border/60 bg-background px-4 py-3 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="粘贴 JSON 配置或点击上方按钮上传文件..."
                />
              </div>
            </div>
          ) : (
            <>
              {/* Profile 选择器 */}
              {availableProfiles.length > 0 && (
                <section className="space-y-3 pb-6 border-b border-sidebar-border/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground/90 uppercase tracking-wider mb-2">
                    <Layers className="w-4 h-4 text-primary" />
                    选择预设 Profile
                  </div>
                  <Select
                    value={selectedProfileId}
                    onValueChange={handleProfileChange}
                  >
                    <SelectTrigger className="w-full bg-background border-sidebar-border/60 hover:bg-muted/25 transition-all duration-200">
                      <SelectValue placeholder="从内置列表中选择一个 Profile 进行初始化" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {profile.displayName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-sidebar-foreground/50">
                    选择预设 Profile
                    会自动填充下方的配置。你也可以在填充后手动修改。
                  </p>
                </section>
              )}

              {/* MCP Server Providers */}
              <section className="space-y-5 pb-7 border-b border-sidebar-border/40">
                <h3 className="text-base font-semibold text-sidebar-foreground/90 uppercase tracking-wider">
                  MCP 服务
                </h3>
                <McpServerEditor
                  providers={formData.infra_catalog.mcp_server_providers}
                  onChange={(providers) =>
                    updateInfraCatalog({ mcp_server_providers: providers })
                  }
                />
              </section>

              {/* MCP Tool Definitions */}
              <section className="space-y-5 pb-7 border-b border-sidebar-border/40">
                <h3 className="text-base font-semibold text-sidebar-foreground/90 uppercase tracking-wider">
                  MCP Tool 定义
                </h3>
                <div className="space-y-4">
                  <ToolDefinitionEditor
                    label="Overview（全景认知）"
                    definition={
                      formData.infra_catalog.mcp_tool_definitions.overview
                    }
                    onChange={(overview) =>
                      updateInfraCatalog({
                        mcp_tool_definitions: {
                          ...formData.infra_catalog.mcp_tool_definitions,
                          overview: {
                            ...overview,
                            description:
                              DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.overview,
                          },
                        },
                      })
                    }
                    defaultDescription={
                      DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.overview
                    }
                    mcpServerNames={Object.keys(
                      formData.infra_catalog.mcp_server_providers,
                    )}
                  />
                  <ToolDefinitionEditor
                    label="Search（探索发现）"
                    definition={
                      formData.infra_catalog.mcp_tool_definitions.search
                    }
                    onChange={(search) =>
                      updateInfraCatalog({
                        mcp_tool_definitions: {
                          ...formData.infra_catalog.mcp_tool_definitions,
                          search: {
                            ...search,
                            description:
                              DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.search,
                          },
                        },
                      })
                    }
                    defaultDescription={
                      DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.search
                    }
                    mcpServerNames={Object.keys(
                      formData.infra_catalog.mcp_server_providers,
                    )}
                  />
                  <ToolDefinitionEditor
                    label="Specifications（精准规格）"
                    definition={
                      formData.infra_catalog.mcp_tool_definitions.specifications
                    }
                    onChange={(specifications) =>
                      updateInfraCatalog({
                        mcp_tool_definitions: {
                          ...formData.infra_catalog.mcp_tool_definitions,
                          specifications: {
                            ...specifications,
                            description:
                              DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.specifications,
                          },
                        },
                      })
                    }
                    defaultDescription={
                      DEFAULT_TOOL_DEFINITION_DESCRIPTIONS.specifications
                    }
                    mcpServerNames={Object.keys(
                      formData.infra_catalog.mcp_server_providers,
                    )}
                  />
                </div>
              </section>

              {/* Develop Skills */}
              <section className="space-y-5 pb-7 border-b border-sidebar-border/40">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-sidebar-foreground/90 uppercase tracking-wider">
                    Develop Skills
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-sidebar-foreground/50 hover:text-sidebar-foreground/70 cursor-help transition-colors duration-200" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-sm whitespace-nowrap"
                    >
                      <p>可选，填写开发技能相关信息，包括 Git URL 和技能列表</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-4 rounded-xl border border-sidebar-border/50 bg-background p-5 transition-all duration-200">
                  <div className="flex items-start gap-2 pb-2 border-b border-sidebar-border/30">
                    <span className="text-sm font-semibold text-sidebar-foreground/90 shrink-0">
                      描述：
                    </span>
                    <span className="text-sm text-sidebar-foreground/70">
                      {DEFAULT_DEVELOP_SKILLS_DESCRIPTION}
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor={dsGitId}
                      className="text-sm text-sidebar-foreground/70 mb-1 block"
                    >
                      Git URL（可选）
                    </label>
                    <input
                      id={dsGitId}
                      type="text"
                      value={
                        formData.infra_catalog.develop_skills?.gitUrl ?? ""
                      }
                      onChange={(e) =>
                        updateInfraCatalog({
                          develop_skills: {
                            description: DEFAULT_DEVELOP_SKILLS_DESCRIPTION,
                            gitUrl: e.target.value || undefined,
                            skills:
                              formData.infra_catalog.develop_skills?.skills ??
                              [],
                          },
                        })
                      }
                      className="w-full rounded-lg border border-sidebar-border/60 bg-background px-3.5 py-2.5 text-sm font-mono transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="http://git.example.com/repo.git"
                    />
                  </div>
                  <div>
                    <span
                      id={dsSkillsId}
                      className="text-sm text-sidebar-foreground/70 mb-1 block"
                    >
                      Skills 列表
                    </span>
                    <StringListEditor
                      items={
                        formData.infra_catalog.develop_skills?.skills ?? []
                      }
                      onChange={(skills) =>
                        updateInfraCatalog({
                          develop_skills: {
                            description: DEFAULT_DEVELOP_SKILLS_DESCRIPTION,
                            gitUrl:
                              formData.infra_catalog.develop_skills?.gitUrl,
                            skills,
                          },
                        })
                      }
                      placeholder="skill 名称"
                    />
                  </div>
                </div>
              </section>

              {/* Code Examples */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-sidebar-foreground/90 uppercase tracking-wider">
                    代码示例
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-sidebar-foreground/50 hover:text-sidebar-foreground/70 cursor-help transition-colors duration-200" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-sm whitespace-nowrap"
                    >
                      <p>
                        可选，填写示例代码相对路径（相对于项目根目录），如
                        app/demo
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="rounded-xl border border-sidebar-border/50 bg-background p-5 transition-all duration-200">
                  <CodeExamplesEditor
                    paths={
                      formData.infra_catalog.code_examples?.examples?.[0]
                        ?.paths ?? []
                    }
                    onChange={(paths) =>
                      updateInfraCatalog({
                        code_examples: {
                          examples: [
                            {
                              name: CODE_EXAMPLE_NAME,
                              description: CODE_EXAMPLE_DESCRIPTION,
                              paths,
                            },
                          ],
                        },
                      })
                    }
                  />
                </div>
              </section>
            </>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t border-sidebar-border/40 bg-background flex items-center justify-between shrink-0">
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 font-medium animate-in fade-in slide-in-from-left-2 duration-200">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-sidebar-border/40 px-5 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:border-sidebar-border/60 hover:bg-muted/25 hover:text-sidebar-foreground"
            >
              取消
            </button>
            {showJsonImport ? (
              <button
                type="button"
                onClick={() => handleJsonImport(jsonInput)}
                disabled={!jsonInput.trim() || saving || loading}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/80 bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:border-primary hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    导入配置
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/80 bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:border-primary hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存并重新初始化中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存并重新初始化
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
