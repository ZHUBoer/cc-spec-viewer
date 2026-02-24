import {
  AlertCircle,
  FileText,
  HelpCircle,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProfileInfraCatalogSchema } from "./schemas";

type ProfileInfraCatalog = z.infer<typeof ProfileInfraCatalogSchema>;

export interface ProfileFormData {
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
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 border border-primary/30 rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          添加服务
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="text-sm text-sidebar-foreground/50 py-6 text-center border-2 border-dashed border-sidebar-border/40 rounded-xl bg-sidebar-accent/5 hover:bg-sidebar-accent/10 transition-colors duration-200">
          暂无 MCP 服务，点击上方"添加服务"按钮添加
        </div>
      ) : (
        entries.map(([key, server]) => (
          <div
            key={key}
            className="p-5 bg-gradient-to-br from-sidebar-accent/15 to-sidebar-accent/5 border border-sidebar-border/50 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-sidebar-border/70"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => updateEntry(key, e.target.value, server)}
                className="flex-1 px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="px-3.5 py-2.5 text-sm bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
    <div className="p-5 bg-gradient-to-br from-sidebar-accent/10 to-sidebar-accent/5 border border-sidebar-border/50 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-all duration-200">
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
            className="flex-1 px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 border border-primary/30 rounded-lg transition-all duration-200 cursor-pointer w-full justify-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
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
  onSave: (data: ProfileFormData) => void;
  saving?: boolean;
}> = ({ open, onClose, initialData, loading, onSave, saving }) => {
  const [formData, setFormData] = useState<ProfileFormData>(() =>
    initialData
      ? JSON.parse(JSON.stringify(initialData))
      : createEmptyFormData(),
  );
  const [error, setError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dsGitId = useId();
  const dsSkillsId = useId();

  // 当弹窗打开且 initialData 变化时重置表单
  // 只在弹窗打开时同步数据，避免在用户编辑过程中被旧数据覆盖
  // 保存过程中（saving 为 true）不更新 formData，避免保存时数据被覆盖
  useEffect(() => {
    if (!open) return;
    // 保存过程中不更新 formData
    if (saving) return;
    if (initialData) {
      // 深拷贝防止修改原数据
      setFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      // 没有 initialData 时，初始化空表单
      setFormData(createEmptyFormData());
    }
  }, [open, initialData, saving]);

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

      // 验证并设置表单数据，强制使用默认 description
      const importedData: ProfileFormData = {
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

      // 重置 input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleJsonImport],
  );

  if (!open) return null;

  const handleSave = () => {
    setError(null);

    // 基本校验
    const { mcp_tool_definitions } = formData.infra_catalog;
    if (
      mcp_tool_definitions.overview.tools.length === 0 &&
      mcp_tool_definitions.search.tools.length === 0 &&
      mcp_tool_definitions.specifications.tools.length === 0
    ) {
      setError("至少需要配置一个 MCP Tool");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // 不允许通过点击背景或 ESC 键关闭，只能通过取消/保存按钮关闭
        if (!isOpen) {
          // 不执行任何操作，保持弹窗打开
          return;
        }
      }}
    >
      <DialogContent
        className="max-w-[720px] max-h-[85vh] flex flex-col p-0 bg-sidebar/95 backdrop-blur-sm border border-sidebar-border/60 shadow-2xl shadow-black/20"
        showCloseButton={false}
        onInteractOutside={(e) => {
          // 阻止点击背景关闭
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // 阻止 ESC 键关闭
          e.preventDefault();
        }}
      >
        {/* 标题栏 */}
        <DialogHeader className="px-6 py-4 border-b border-sidebar-border/40 bg-gradient-to-b from-sidebar-accent/5 to-transparent shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent">
                Profile 配置
              </span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* JSON 导入按钮 */}
              <button
                type="button"
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-all duration-200 cursor-pointer border border-sidebar-border/40 hover:border-sidebar-border/60 hover:shadow-sm"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-sidebar-accent/50 rounded-md transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    上传文件
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-96 px-4 py-3 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 resize-none shadow-sm hover:shadow-md"
                  placeholder="粘贴 JSON 配置或点击上方按钮上传文件..."
                />
              </div>
            </div>
          ) : (
            <>
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
                <div className="p-5 bg-gradient-to-br from-sidebar-accent/10 to-sidebar-accent/5 border border-sidebar-border/50 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-all duration-200">
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
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-sidebar-accent/10 border border-sidebar-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <div className="p-5 bg-gradient-to-br from-sidebar-accent/10 to-sidebar-accent/5 border border-sidebar-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
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
        <div className="px-6 py-4 border-t border-sidebar-border/40 bg-gradient-to-b from-transparent to-sidebar-accent/5 flex items-center justify-between shrink-0">
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
              className="px-5 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-all duration-200 cursor-pointer border border-sidebar-border/40 hover:border-sidebar-border/60 hover:shadow-sm"
            >
              取消
            </button>
            {showJsonImport ? (
              <button
                type="button"
                onClick={() => handleJsonImport(jsonInput)}
                disabled={!jsonInput.trim() || saving || loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
