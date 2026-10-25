# 更新日志（CHANGELOG）

版本遵循 [SemVer](https://semver.org/lang/zh-CN/)。当前仍处于 `0.x`，任何 minor 都可能含破坏性调整，
但每次都会在此写明升级步骤。

## [0.2.0] — V5 开发中心完整迁移与组件扩编（2026-10-25）

> 升级方式：`pnpm up @beiluol/knowflow-ui`。**没有删除或重命名 v0.1.0 的任何导出**，不需要改调用方代码。

### 新增（包）

- `packages/ai`：12 个 AI 展示组件（ChatMessage / ChatComposer / MarkdownRenderer / CodeBlock /
  ThinkingPanel / AgentTrace / ToolCallCard / ExecutionStatus / CitationCard / SourceList /
  EvidencePanel / AttachmentPreview）。不发请求、不绑模型、零 `v-html`。
- `packages/learning`：11 个学习组件（Flashcard / FlashcardRating / ReviewProgress / QuestionCard /
  AnswerOptions / AnswerFeedback / QuizProgress / QuizResult / InterviewQuestion / InterviewFeedback /
  InterviewScore）。不内置 FSRS、不写学习记录、不调评分接口。

### 新增（`@beiluol/knowflow-ui`，共 44 个组件）

- P0：Textarea、Radio(+RadioGroup)、Switch、Select、**DatePicker（自研，无日期库）**、Dialog、
  ConfirmDialog、Tooltip、Toast(+`useToast`)、Tabs、ContextMenu、Alert、Divider、Link
- P1：Table、Pagination、Tree、Drawer、Popover、Upload、Combobox、SearchInput、Badge、Tag、Card、
  Avatar、Skeleton、EmptyState、ErrorState、Progress、StatusIndicator、CopyButton
- 扩展：Accordion(+AccordionItem)、ButtonGroup、Slider、NumberInput、TagsInput
- 插件：`KF_COMPONENTS` 扩到 44 项，`app.use(KfPlugin)` 一次注册

### 新增（Studio）

- V5 开发中心迁移：65 条目 / 153 Story / 7 标签页 / 深链接 / 事件日志 / 移动端双 Drawer
- ⌘K 命令面板（65 条目 + 153 Story 统一索引，↑↓ / Enter / Esc）
- 质量面板：数字全部现算，可导出 JSON / Markdown
- 令牌页：`getComputedStyle` 读运行时值，随 Light/Dark 变化

### 变更

- `KfSelect` 新增 `loading`（`aria-busy`，加载中不展开面板）
- `KfChatComposer` 新增 `error`（`role=alert` + `aria-invalid`）
- `KfInput` 新增 `prefix` / `suffix` / `meta` 插槽
- `KfFormField` 从内部组件提升为公共导出，新增 `KfFormFieldSlots`
- 包版本 `0.1.0 → 0.2.0`（`ui` / `tokens` / 根 workspace）

### 修复

- 5 个组件用包名自引用 `@beiluol/knowflow-ui` 导致 typecheck TS7016 → 改为相对导入
- `KfDatePicker` 的 BEM block 名与文件名不一致（`kf-datepicker` → `kf-date-picker`）
- Studio fixtures 键名（kebab-case）与条目 id（name 小写）不匹配 → 14 例 Story 挂载失败
- 预览给 `KfDialog` 挂了未声明的 `close` 监听 → 按真实 `defineEmits` 过滤
- 移动端 375px 画布顶栏被控件挤成省略号 → ≤600px 折两行

### 测试与门禁

- 单测 **511 例 / 22 文件**（ui 133、ai 102、learning 79、studio 197）
- 浏览器回归 **22 例**（Playwright + 系统 Chrome），15 张截图
- `check-dist` 扩到三包，新增「源码有组件、类型声明没导出」断言
- `verify-consumer` 自动对齐 tgz 版本号，避免升级后指向不存在的包

### 文档

- 新增 `docs/migration/v5-to-ui/` 十份（AUDIT / PLAN / COMPONENT_MATRIX / STORY_MATRIX /
  DEPENDENCY_AUDIT / MIGRATION_REPORT / API_COMPATIBILITY / TEST_REPORT / BROWSER_REPORT /
  RELEASE_CHECKLIST）+ `evidence/`
- 更新 `docs/architecture/ARCHITECTURE.md` 到 v0.2.0

### 未做

- `npm publish`：许可证未确认（UNLICENSED），见 RELEASE_CHECKLIST 的阻断项
- DataTable / InputGroup / ResizablePanels / Toolbar 仍为 demo；Typography / Breadcrumb / Loading 仍为 missing

## [Unreleased] — 命名规范统一与工程收口（2026-10-25）

> `0.1.0` 从未发布到 npm，因此本节的类名调整**不构成对外破坏性变更**；已发布版本发布时直接从净化后的命名开始。

### 新增

- `KfXxxProps` / `KfXxxEmits` 类型导出：`KfButtonProps`、`KfButtonEmits`、`KfIconProps`、
  `KfInputProps`、`KfInputEmits`、`KfCheckboxProps<T>`、`KfCheckboxEmits<T>`，以及 `KfXxxSlots`（文档用）。
- `KfPlugin` 全局注册插件 + `KF_COMPONENTS` / `KF_TAGS`：`app.use(KfPlugin)` 后
  `<kf-button>` / `<kf-icon>` / `<kf-input>` / `<kf-checkbox>` 均可直接解析；`<KfButton>` 同样有效。
- 每个组件目录新增 `index.ts`，新增 `components/index.ts` 聚合层与 `installer.ts`。
- 测试：`naming.spec.ts`（11 项命名守门）、`plugin.spec.ts`（12 项注册/标签解析/共存），
  单测总数 42 → **67**。
- 文档：`NAMING_CONVENTIONS.md`、`NAMING_MIGRATION_REPORT.md`；Studio 新增「命名与 API」区块
  （JS 名 / 模板标签 / CSS 类名 / 导出类型 / Events / Slots）。
- `check-dist` 新增断言：BEM 类名、类型导出、运行时 `emits` 声明、无裸元素选择器。

### 变更（内部 CSS 类名，对齐 BEM）

| 旧 | 新 |
| --- | --- |
| `.kf-field` / `--error` / `--disabled` / `--readonly` | `.kf-input` / `.kf-input--error` / `--disabled` / `--readonly` |
| `.kf-field__icon` | `.kf-input__icon` |
| `.kf-input`（原生 input） | `.kf-input__control` |
| `.kf-checkbox-box` / `-box-mixed` / `-input` / `-mark` / `-check` / `-label` | `.kf-checkbox__box` / `__box--mixed` / `__input` / `__mark` / `__mark--check` / `__label` |
| `.kf-form-label` / `-required` / `-help` / `-error` | `.kf-form-field__label` / `__required` / `__help` / `__error` |

**视觉零变化**：仅重写选择器，未改任何属性值/DOM 结构；已用 Studio 浏览器回归逐项核对计算样式。

### 升级步骤（若已基于旧类名自定义样式）

1. 按上表替换自己的覆盖规则；
2. 若原本用 `KfXxx` 内联 props 类型做包装，改为 `import type { KfXxxProps } from '@beiluol/knowflow-ui'`；
3. 若在模板里直接写 `<kf-button>` 之前不生效，现在可以 `app.use(KfPlugin)`（或继续按需 import）。

## [0.1.0] — 2026-10-25

首个可独立安装的版本。只封装 4 个基础组件，用于验证「提取 → 解耦 → 构建 → 预览 → 安装」全链路。

### 新增

- `@beiluol/knowflow-ui`：`KfButton`、`KfIcon`、`KfInput`、`KfCheckbox` 四个组件。
- `@beiluol/knowflow-tokens`：`--kf-*` 设计令牌（Light/Dark）与 `--kb-*` 单向兼容桥。
- 内置 78 个 lucide 风格图标 + `registerIcon()` 运行时扩展 + `listIconNames()`。
- 组件级 TypeScript 类型：`ButtonVariant`、`ButtonSize`、`IconSize`、`InputType`、`CheckboxAs` 等。
- `apps/studio`：独立预览中心（端口 5180），含实时预览、属性面板、变体/尺寸/状态矩阵、
  代码示例与复制、Light/Dark、令牌真实值表、源码路径、DOM 实测尺寸。
- `examples/vue-vite`：不在 workspace 内的消费示例，从 `artifacts/*.tgz` 安装。
- 工程脚本：`export-icons` / `pack:ui` / `verify:dist` / `verify:consumer`。
- GitHub Actions 最小 CI（typecheck + test + build + pack + 产物检查 + 消费验证）。

### 迁移来源

| 新组件 | 原 KnowFlow 来源 | 主要变更 |
| --- | --- | --- |
| `KfButton` | `frontend/src/components/ui/Button.vue` | `kb-`→`kf-` 令牌与类名；loading/disabled 前置拦截；`aria-label` 仅在提供时绑定 |
| `KfIcon` | `frontend/src/components/ui/Icon.vue` | 212 个模板分支 → 78 个常量表（脚本提取）；去掉 iconfont/裸 SVG 分支；增加未知图标占位与告警 |
| `KfInput` | `frontend/src/components/ui/Input.vue` | 去 Tailwind 与 `@/`；外壳样式内联到 scoped；新增 `readonly` prop；IME 组合期不 emit |
| `KfCheckbox` | `frontend/src/components/ui/Checkbox.vue` | 全局 `.kb-checkbox*` 样式迁入 scoped；补 `aria-checked="mixed"` |
| `KfFormField` | `frontend/src/components/ui/FormField.vue` | 仅内部使用，不从公共入口导出 |

### 已知限制

- npm **未发布**；包为 `UNLICENSED`（原仓库无 LICENSE，再许可权利待确认）。
- 图标只迁 78/212；剩余 134 个在 Roadmap。
- 未提供 UMD/CJS 产物，仅 ESM。
- 原 KnowFlow 未切换到本包（保持原状）。
- 单包构建：组件数增长到 ~15 个后应改为子路径导出。

### 升级说明

首次发布，无升级路径。
