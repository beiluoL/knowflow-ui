# Phase 0 · V5 组件开发中心审计

> 审计对象：`/Users/beiluo/Documents/alProject/qoderProject/knowflow`（**只读**）
> 审计目标：把 V5 的 65 条目 / 153 Story 迁移到独立组件库 `knowflow-ui`，并如实标注哪些能真正脱离业务运行。
> 审计方式：静态读源码（不执行、不格式化、不写任何文件），数字来自 V5 自己产出的 `docs/component-playground/v5/COMPONENT_MATRIX.md`（解析结果见 `evidence/v5-matrix.json`）。

## 一、V5 开发中心的真实构成

`frontend/src/dev/` 共 26 个文件，可以分成四层：

| 层 | 文件 | 作用 |
| --- | --- | --- |
| 注册表 | `registry.ts`、`catalog-v4.ts`、`extensions-v5.ts` | 65 个条目（38 个 catalog 条目 + 12 个扩展条目 + 其余由注册表补充），Props/事件/插槽文档，`implementationStatus` 三态 |
| Story | `stories.ts` | `buildStories()` 生成 153 条 Story，规则见 STORY_MATRIX.md |
| 预览壳 | `ComponentPreview.vue`、`PlaygroundProperties.vue`、`PlaygroundDrawer.vue`、`ComponentNavigation.vue`、`EventLog.vue`、`StyleInspector.vue`、`TokenCenter.vue`、`QualityDashboard.vue`、`IconGallery.vue`、`ComponentDocs.vue` | 三栏工作台、属性面板、事件日志、令牌中心、质量面板 |
| 演示素材 | `ReferenceDemos.vue`、`ExtensionDemos.vue`、`ScenarioPreview.vue` | 27 个 demo 条目的**唯一实现**：手写 HTML + 内联样式 |
| 支撑 | `capabilities.ts`、`quality.ts`、`code-examples.ts`、`safe-fixture-log.ts`、`playground-v5.css`、`playground.css`、`icon-catalog.ts`、`routes.ts` | 能力探测、质量统计、代码示例、Fixture 日志脱敏、样式 |

关键事实：**demo 条目没有组件**。它们的「实现」是 `ReferenceDemos.vue` / `ExtensionDemos.vue` 里的一个 `<button class="ref-btn">` 之类的片段。V5 的画布之所以看起来"能用"，是因为画布里渲染的就是这段 HTML 本身，而不是真实组件。

## 二、V5 的真实状态分布（基线）

| 状态 | 条目数 | 含义 |
| --- | ---: | --- |
| 已接入真实组件 | 29 | 适配器 import 了 `@/components/**` 里的真实 `.vue` |
| 仅有内部演示 | 27 | 只有 `ReferenceDemos` / `ExtensionDemos` 的 HTML 片段 |
| 尚未实现 | 9 | 连演示都没有，仅占位 |
| **合计** | **65** | Story 153 |

「已接入 29」并不等于「29 个可独立发布组件」：同一个 `.vue` 被多个条目复用（`AppDialog.vue` 同时支撑 Dialog / Drawer，`ContextMenu.vue` 支撑 Dropdown，`ToastHost.vue` 支撑 Toast，`SkeletonList.vue` 支撑 Skeleton，`EmptyState.vue` 支撑 Empty），V5 自己统计的**唯一生产源码只有 23 个**。

## 三、分类结果（A / B / C / D / E）

分类口径：以「能否脱离 Pinia / Router / 业务 API 独立渲染」为唯一标准，不按目录位置分类。

### A 类：已封装、可直接复用（5 个）

`Button`、`Icon`、`Input`、`Checkbox`、`FormField` —— knowflow-ui v0.1.0 已有实现，本轮只需保证 API 不变、补齐文档与 Story。

### B 类：真实可提取（62 个组件）

V5 有真实 `.vue`，但做了 Kf 化重写（BEM、`--kf-*` 令牌、键盘/焦点/ARIA、卸载清理）：

- **P0（15 条目）**：Textarea / Radio / Switch / Select / DatePicker / Dialog / Tooltip / Toast / Tabs / Dropdown / FormField / …
- **P1（13 条目）**：Table / Pagination / Tree / Drawer / Popover / Upload / Badge / Card / Skeleton / Empty / Progress / Combobox / SearchInput
- **扩展（8 个真实）**：Accordion / Avatar / ButtonGroup / Slider / NumberInput / TagsInput / CopyButton / StatusIndicator
- **AI（12 个组件）**：ChatMessage / ChatComposer / MarkdownRenderer / CodeBlock / ThinkingPanel / AgentTrace / ToolCallCard / ExecutionStatus / CitationCard / SourceList / EvidencePanel / AttachmentPreview
- **学习（11 个组件）**：Flashcard / FlashcardRating / ReviewProgress / QuestionCard / AnswerOptions / AnswerFeedback / QuizProgress / QuizResult / InterviewQuestion / InterviewFeedback / InterviewScore
- **原有别名（5 个）**：ConfirmDialog（→ Dialog 语义子集）、ContextMenu（→ Dropdown）、ErrorState、SkeletonList（→ Skeleton）、ToastHost（→ Toast + `useToast`）

### C 类：Demo 可升级，但本轮不升级（4 个）

`DataTable`、`InputGroup`、`ResizablePanels`、`Toolbar`。

V5 的这 4 个只有 HTML 片段。要升级成生产级组件，需要真实的分页/排序/列显隐状态机、焦点管理与键盘拖拽，属于独立的版本级工作。本轮**保持 demo 并如实标注**——把它们写成"能点两下的 HTML"再标成 real，正是 V5 被诟病的问题。

### D 类：规划中（3 个）

`Typography`、`Breadcrumb`、`Loading` —— 两版都没有实现。文档与画布都显示说明卡，不编造。

### E 类：强业务依赖，必须拆分才能迁移

| V5 实现 | 耦合点 | 迁移处理 |
| --- | --- | --- |
| `AIComposer.vue` | `selectedModel`、`useKnowledgeBase`、`thinkingEnabled` 等业务 props；上传/语音走业务接口 | 拆成 `KfChatComposer`：只保留 `modelValue` / `busy` / `stoppable` / `attachments` / `error`，附件与语音由宿主通过事件接管 |
| `ChatMarkdownRenderer.vue` | 依赖业务侧 markdown 配置与 `v-html` | 重写为 token 解析 + Vue 元素渲染，**零 v-html**，链接协议白名单 |
| `ChatCodeBlock.vue` | 依赖 highlight.js 全局配置 | 保留纯文本渲染 + `#code` 插槽，语言标签保留，不绑定高亮库 |
| `ToastHost.vue` | 业务单例 + 全局定时器 | 拆成 `KfToast` + `useToast()` 本地队列，卸载时清定时器 |
| `AppDialog.vue` | 同时承担 Dialog / Drawer 两种形态 + 业务确认流 | 拆成 `KfDialog`、`KfDrawer`、`KfConfirmDialog`，统一模态栈 `enterModal/leaveModal` |
| `ScenarioPreview.vue` | 直接读取业务 fixture 并调用业务 store | 不迁移。Studio 用本地 fixture + 场景组合预览替代 |

## 四、迁移前必须先解决的技术债（本轮已处理）

| 问题 | 影响 | 处理 |
| --- | --- | --- |
| `implementationStatus` 三态混用「有没有组件」和「能不能独立跑」 | 27 个 demo 被显示成"组件" | 换成 `real / demo / missing`，并给出重算口径 |
| Story 里的 `expectedVisualState: 'NOT VERIFIED'` | 文档里写着"未验证"，但界面照样打勾 | Studio 用真实挂载测试（153 例）替代口头声明 |
| 预览壳与组件强绑定（同一个 `ComponentPreview.vue` 里 20 个 `v-if`） | 无法证明预览的是真组件 | 改为「通用渲染 + 场景组合」两层，`resolvePreview()` 单一入口 |
| 样式写在 `playground-v5.css`，组件样式与壳样式混杂 | 无法独立发布 | 组件样式进 `packages/*/src/**`，壳样式进 `apps/studio/src/styles/studio.css` |
| Fixture 日志可能带用户数据 | 隐私风险 | Studio fixture 全部是示例常量，`safe-fixture-log` 的脱敏思路保留在 `PreviewApi.log()`（只记事件名与结构，不落原文） |

## 五、审计结论

1. V5 的 65 条目 / 153 Story **可以完整迁移**，迁移的是"目录结构与交互契约"，不是"适配器代码"。
2. V5 标称的 29 个真实组件里，只有 23 个唯一源码，且多数仍带业务耦合；按「可独立发布」重算后，本轮把 real 从 29 提到 **58 条**，demo 从 27 降到 **4 条**，missing 从 9 降到 **3 条**。
3. V5 的画布/Story/深链接能力必须保留（这是它的核心价值），但预览层必须重写：**画布渲染的必须是宿主真正会装到的那个组件**。

## 六、证据

- `evidence/v5-matrix.json` —— V5 矩阵解析结果（65 行、153 Story、29/27/9 状态分布）
- `docs/migration/v5-to-ui/COMPONENT_MATRIX.md` —— 逐条目迁移结果
- `docs/migration/v5-to-ui/evidence/baseline.json` / `after.json` —— 原项目零修改快照
