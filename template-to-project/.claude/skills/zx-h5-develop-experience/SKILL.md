---
name: zx-h5-develop-experience
description: 提供智行公共前端开发流程规范和经验，指导 Agent 编写高质量、标准化的 H5 业务代码。涵盖：请求、分享、埋点、异常处理、登录和渐进式渲染。适用于实现 H5 业务功能阶段。
---

# H5 开发经验 (H5 Develop Experience)

指导 Agent 按照智行公共前端团队规范进行 H5 功能开发。

## 核心原则 (Core Principles)

1.  **环境兼容优先 (Platform Compatibility)**: 代码必须兼容 APP、小程序和 H5 三端，优先使用 `xtaro-zx-h5` 提供的跨端 API。
2.  **用户体验至上 (UX First)**: 避免阻塞性 Loading，确保流畅的交互反馈。
3.  **数据驱动 (Data Driven)**: 关键路径必须有埋点，异常必须上报。
4.  **规范一致性 (Consistency)**: 严格遵循参考文档中的 API 使用规范，禁止"臆造"参数。

## 快速参考

| 任务 | 关键词 | 推荐 API/组件 | 核心文档 |
| --- | --- | --- | --- |
| **请求** | Request | `zRequest` | [请求规范.md](references/请求规范.md) |
| **分享** | Share | `zShare`, `ZShareModal` | [分享流程开发规范.md](references/分享流程开发规范.md) |
| **埋点** | Trace | `xUbt.logTrace` | [埋点规范.md](references/埋点规范.md) |
| **异常** | Error | `throw err` | [异常处理规范.md](references/异常处理规范.md) |
| **登录** | Login | `zUser.isLogin`, `zUser.login` | [登录流程开发规范.md](references/登录流程开发规范.md) |
| **渲染** | Loading | Skeleton, Local Loading | [页面渐进式渲染开发规范.md](references/页面渐进式渲染开发规范.md) |

## 指令 (Instructions)

### 1. 数据请求 (Data Request)

当需要调用后端接口获取数据时：

- **Action**: 使用 `import { zRequest } from '@ctrip/xtaro-zx-h5'`。
- **Rules**:
    - **必须定义**: 使用 `zRequest(serviceCode, serviceName)` 定义接口，禁止直接拼写 URL。
    - **禁止 Head**: 调用时只传业务参数，**严禁**手动构造 `head` 字段。
    - **禁止本地缓存**: 每次需要数据时重新请求，**严禁**将接口数据缓存到 localStorage/sessionStorage 复用。
    - **成功判断**: 统一使用 `res.resultCode === 1` 判断业务成功。
    - **登录前置**: 若需登录，使用 `zRequest.withLogin(api)`。
    - **登录态传递**: 用户登录后，`zRequest` 会自动携带 cookie，服务端可通过 cookie 获取用户 `userid` 等登录信息，**无需**前端手动传递登录凭证。（注：`cid` 为设备标识，无需登录即可获取）
- **Verification**:
    - [ ] 是否使用了 `zRequest` 而非 raw fetch/axios？
    - [ ] 是否移除了参数中的 `head` 字段？
    - [ ] 是否正确处理了 `resultCode !== 1` 的异常分支？
    - [ ] 是否未将接口数据缓存到本地（localStorage/sessionStorage）？

### 2. 实现分享 (Sharing)

当任务涉及"分享"、"转发"或"生成海报"时：

- **Context Check**: 确认当前运行环境（通常 API 内部兼容，但需注意参数）。
- **Action**:
    - 优先使用 `ZShareModal` 组件实现底部弹窗分享。
    - 若需直接拉起，使用 `zShare.share()`。
- **Rules**:
    - **必须** 区分 `app`(APP环境) 和 `mini`(小程序环境) 的配置。
    - **小程序分享**：`miniProgramPath` 和 `miniProgramImage` 为必填项，**严禁**留空或填伪造数据。
    - **H5 链接分享**：必须提供 `link`、`title`、`desc`。
- **Verification**:
    - [ ] 检查是否遗漏了小程序必填字段？
    - [ ] 检查是否为 APP 和 小程序 分别配置了 `platform` 和 `shareType`？

### 3. 埋点上报 (Tracking)

当实现交互功能或页面加载时：

- **Action**: 使用 `import { xUbt } from '@ctrip/xtaro-zx-h5'`。
- **Rules**:
    - **曝光埋点**: 在 `useEffect` (React) 或 `onMounted` (Vue) 中调用 `xUbt.logTrace`。
    - **点击/交互埋点**: 在事件处理函数顶部调用。
    - **按需埋点**: 仅当 PRD 或上下文提供了具体的 Trace Key 和参数时才添加埋点代码，**不要**自动生成无意义的埋点。
- **Verification**:
    - [ ] 埋点 Key 是否与需求一致？
    - [ ] 动态参数（如 `PageId`）是否已正确传递？

### 4. 异常处理 (Error Handling)

当编写异步操作、网络请求或复杂逻辑时：

- **Action**: 使用 `try-catch` 捕获异常。
- **Rules**:
    - **捕获即上报**: H5 框架会自动捕获抛出的错误。因此，在 `catch` 块中处理完 UI 反馈（如 `xShowToast`）后，**必须** 使用 `throw err` 将错误重新抛出。
    - **禁止吞没**: 严禁写空的 `catch (e) {}` 或只打印日志不抛出。
    - **禁止重试**: 后端接口调用失败时，**严禁实现重试机制**（如 while 循环重试、retry 库等）。让错误自然抛出，由框架监控捕获。
- **Code Pattern**:
    ```javascript
    try {
      await apiCall();
    } catch (e) {
      xShowToast({ title: '操作失败' });
      throw e; // Critical: Must re-throw for monitoring
    }
    ```
- **Verification**:
    - [ ] 是否在 `catch` 块末尾执行了 `throw error`？
    - [ ] 是否避免了空的 `catch` 块？
    - [ ] 是否避免了接口重试机制（while/for 循环、retry 库等）？

### 5. 登录流程 (Login Flow)

当功能依赖用户登录态时：

- **Action**: 使用 `zUser` 类。
- **Rules**:
    - **判断登录**: `await zUser.isLogin()`。
    - **发起登录**: `zUser.login().then(...)`。
    - **APP 环境特性**: APP 内登录是弹窗模式，登录成功后执行 `.then()` 回调；H5/小程序是跳转模式，登录后刷新页面。
    - **代码编写**: 主要针对 APP 环境编写 `then` 回调逻辑。
    - **取消登录**: `catch` 捕获通常意味着用户取消登录或失败，应给予提示（如 Toast），不需要 `throw`。
- **Verification**:
    - [ ] 是否处理了 `isLogin` 的异步结果？
    - [ ] 是否在 `login` 的 `catch` 中处理了用户取消的情况？

### 6. 渐进式渲染 (Progressive Rendering)

当实现页面或组件 UI 时：

- **Action**: 拆分 UI 为 **Static Reference** (静态无依赖) 和 **Dynamic Dependent** (动态强依赖)。
- **Rules**:
    - **禁止全屏 Loading**: 除非 90% 内容依赖同一接口，否则严禁使用页面级全屏 Loading。
    - **优先展示**: Header、背景、固定文案必须在数据请求前渲染。
    - **骨架屏**: 为动态内容区域添加 Skeleton 或局部 Loading 占位。
- **Verification**:
    - [ ] 页面加载时是否有静态内容立即可见？
    - [ ] Loading 状态是否限制在局部组件内？

## 何时跳过此 Skill (When to Skip)

- 简单的工具函数编写，不涉及 UI 或业务流程。
- 纯后端 Node.js 脚本编写（非 H5/前端环境）。
- 用户明确要求"快速原型"或"忽略规范"。