# 通用字段推导逻辑库 (Field Inference Heuristics)

> **核心机制**: 本逻辑库采用 **Priority Waterfall (L1 Explicit > L2 Pattern > L3 Ambiguous)** 判定。
> **判定规则**: 自上而下匹配，一旦命中即停止。**禁止**使用任何算术权重。

## 置信度分级标准 (Confidence Levels)

| 级别 | 标记 | 判定依据 | 处理动作 |
| :--- | :--- | :--- | :--- |
| **L1** | ✅ | **proposal 原文明确** (Explicit Logic) | 直接写入文档，无需生成问题 |
| **L2** | 🔧 | **符合通用惯例/强模式匹配** (Strong Pattern) | 写入文档，用户无异议即确认，**不生成问题** |
| **L3** | ⚠️ | **有歧义/反直觉/未命中** (Ambiguous) | 标记为待确认，**必须生成问题** |

---

## 1. ID 与主键类 (Identity & Context)

**Pattern**: `*Id`, `*Code`, `*No`, `*Key` (e.g. `orderId`, `deptCode`)

### Step 1: L1 Explicit (proposal 明确提及)
- 若 proposal 明确说明 "从 URL 获取"、"路由参数" → **✅ Route Params**
- 若 proposal 明确说明 "选择列表中的..."、"点击某项..." → **✅ Route Params**（传递给详情页）
- 若 proposal 明确说明 "用户输入"、"表单填写" → **✅ Form Data**

### Step 2: L2 Pattern (场景强推导)
- **场景A**: 接口名为 `get*Detail` / `get*Info` (详情页) → 推导为 **🔧 Route Params**
- **场景B**: 接口名为 `create*` / `submit*` (表单提交) → 推导为 **🔧 Form Data** (User Input)
- **场景C**: 接口名为 `update*` / `delete*` (操作) → 推导为 **🔧 Form Data** (隐含的主键)

### Step 3: L3 Ambiguous (无法确定)
- 若以上皆不命中 → 标记 **⚠️ 待确认 (L3)**

---

## 2. 分页与筛选类 (Pagination & Filter)

**Pattern**: `page*`, `size`, `limit`, `sort`, `keyword`, `query`, `filter*`

### Step 1: L1 Explicit
- proposal 提到 "支持分享搜索结果"、"刷新后保留条件" → **✅ Query Params** (URL)

### Step 2: L2 Pattern
- 只要是 GET 请求的列表接口 (`list*`, `search*`, `query*`) → 默认推导为 **🔧 Query Params** (Standard RESTful)

### Step 3: L3 Ambiguous
- 若为 POST 复杂查询接口 → 推导为 **🔧 Request Body**
- 其他情况 → **⚠️ 待确认 (L3)**

---

## 3. 用户与权限类 (User & Auth)

**Pattern**: `userId`, `userCode`, `createBy`, `tenantId`, `*Token`

### Step 1: L1 Explicit
- proposal 提到 "指定用户"、"查询他人" → **✅ Context/Input** (非当前用户)

### Step 2: L2 Pattern
- 字段包含 `Token`, `Authorization` → 推导为 **🔧 Headers / Cookie**
- 字段为 `userId`, `userCode` 且语境为常规业务操作（非Admin） → 推导为 **🔧 Global Store** (Current User)

---

## 4. 配置与常量类 (Config & Enums)

**Pattern**: `type`, `status`, `category`, `source`, `config*`

### Step 1: L1 Explicit
- proposal 明确指代 "从配置获取" → **✅ Remote Config**

### Step 2: L2 Pattern
- 字段名为 `type`, `category` 且接口用于"获取列表" → 推导为 **🔧 Query Params** (Filter)
- 字段名为 `source`, `platform` (e.g. `source=H5`) → 推导为 **🔧 Constants** (Hardcoded)

### Step 3: L3 Ambiguous
- 枚举值不明确时 → 标记 **⚠️ 待确认 (L3)**

---

## 扩展策略

若遇到新领域字段（如 `device*` 物联网、`model*` AI），当前模式库无法匹配时：
- 降级为 **L3** → 生成问题让用户明确
- 可在后续版本中扩展此模式库
