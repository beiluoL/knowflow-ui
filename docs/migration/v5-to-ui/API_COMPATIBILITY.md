# 公开 API 与兼容性

> 发布入口统一为 `@beiluol/knowflow-ui`（另有 `@beiluol/knowflow-ai`、`@beiluol/knowflow-learning`、`@beiluol/knowflow-tokens`）。
> 本文档只写**真实存在的导出**：每一条都能在 `packages/*/dist/index.d.ts` 或源码 `index.ts` 里找到对应物，`check-dist.mjs` 会核对「源码有组件、类型声明没导出」的情况。

## 一、安装与接入

```bash
npm i @beiluol/knowflow-ui vue
```

```ts
// main.ts —— 两种接法，二选一
import { createApp } from 'vue'
import KnowFlowUI from '@beiluol/knowflow-ui'          // 全量注册
import '@beiluol/knowflow-ui/style.css'                // 必需的样式入口（含令牌）

createApp(App).use(KnowFlowUI).mount('#app')
```

```ts
// 或者按需导入（推荐：tree-shaking 友好、类型精确）
import { KfButton, KfInput, KfSelect } from '@beiluol/knowflow-ui'
```

样式说明：`style.css` 里已经 `@import` 了 `--kf-*` 令牌，**不需要**再单独引 Tailwind、也不需要复制原项目的全局 `style.css`。

## 二、`@beiluol/knowflow-ui` 导出清单

### 组件（44）

| 分组 | 组件 |
| --- | --- |
| 表单 | `KfButton` `KfInput` `KfTextarea` `KfCheckbox` `KfRadio` `KfRadioGroup` `KfSwitch` `KfSelect` `KfCombobox` `KfDatePicker` `KfNumberInput` `KfTagsInput` `KfSearchInput` `KfSlider` `KfFormField` `KfButtonGroup` |
| 反馈 | `KfAlert` `KfToast`（+ `useToast()`） `KfProgress` `KfSkeleton` `KfEmptyState` `KfErrorState` `KfStatusIndicator` |
| 浮层 | `KfDialog` `KfConfirmDialog` `KfDrawer` `KfPopover` `KfTooltip` `KfContextMenu` |
| 数据 | `KfTable` `KfTree` `KfPagination` `KfAccordion` `KfAccordionItem` `KfTabs` `KfUpload` `KfCopyButton` |
| 展示 | `KfIcon` `KfBadge` `KfTag` `KfCard` `KfAvatar` `KfLink` `KfDivider` |
| 插件 | `KfPlugin` / `KF_COMPONENTS`（`app.use()` 注册全部组件） |

### 纯函数与工具

| 导出 | 用途 |
| --- | --- |
| `nextInstanceId()` / `nextUid(prefix)` | 实例 id 生成（不依赖 Vue 3.5 的 `useId`） |
| `enterModal()` / `leaveModal()` / `isTopModal()` / `modalDepth()` | 模态栈（多层弹窗只让最上层响应 Esc） |
| `parseISODate` `formatISODate` `daysInMonth` `weekdayOf` `shiftDays` `shiftMonths` `dayNumber` `clampDate` `isSameDay` `buildMonthGrid` `weekdayLabels` `today` `monthTitle` | 日期选择器的纯逻辑（无日期库） |

### 类型

每个组件都有 `Kf<Name>Props` / `Kf<Name>Emits` / `Kf<Name>Slots`，另有 `Kf<Name>Item`（集合项）、`Kf<Name>Variant` / `Kf<Name>Placement` 等枚举类型。`KfFormFieldProps`、`KfFormFieldSlots` 自 v0.2.0 起**对外公开**。

## 三、`@beiluol/knowflow-ai`（12）

`KfChatMessage`、`KfChatComposer`、`KfMarkdownRenderer`、`KfCodeBlock`、`KfThinkingPanel`、`KfAgentTrace`、`KfToolCallCard`、`KfExecutionStatus`、`KfCitationCard`、`KfSourceList`、`KfEvidencePanel`、`KfAttachmentPreview`

纯函数：`parseMarkdown` / `parseInline`（token 化，输出 `MdBlock` / `MdInline`）、`isSafeHref`、`splitByTerms`、`formatBytes`、`formatScore`。

**边界**：不发请求、不绑模型供应商、不渲染不可信 HTML（零 `v-html`）。Agent 审批只 `emit('approve' | 'reject')`，不执行工具；ThinkingPanel 只展示宿主给的可公开文本。

## 四、`@beiluol/knowflow-learning`（11）

`KfFlashcard`、`KfFlashcardRating`、`KfReviewProgress`、`KfQuestionCard`、`KfAnswerOptions`、`KfAnswerFeedback`、`KfQuizProgress`、`KfQuizResult`、`KfInterviewQuestion`、`KfInterviewFeedback`、`KfInterviewScore`

**边界**：不内置 FSRS 调度、不写学习记录、不调用评分接口。评分/评级都通过 `emit` 交给宿主。

## 五、`@beiluol/knowflow-tokens`

- `TOKEN_GROUPS`：8 组、75 个 `--kf-*` 令牌名（Brand / Surface & Text / Semantic / Typography / Spacing & Radius / Button / Input / Checkbox）
- `readTokenValues(names)`：用 `getComputedStyle` 读运行时值（Studio 令牌页就用它）
- `tokens.css`：令牌定义（含 `[data-theme="dark"]`）
- `kb-compat.css`：`--kf-* → --kb-*` 的**单向**兼容桥（只给需要旧名的地方用，不复制整份全局样式）

## 六、v0.1.0 → v0.2.0 兼容性

| 项 | 变化 | 影响 |
| --- | --- | --- |
| `KfButton` / `KfIcon` / `KfInput` / `KfCheckbox` | 无破坏性变更 | 老代码直接可用 |
| `KfInput` 插槽 | 新增 `prefix` / `suffix` / `meta` | 纯增量 |
| `KfFormField` | 从「内部组件」提升为公开导出，新增 `KfFormFieldSlots` | 纯增量（原来不能 import，现在可以） |
| 包版本 | 0.1.0 → **0.2.0** | 新增大量组件，按 minor 升级 |
| 样式入口 | 仍是 `@beiluol/knowflow-ui/style.css` | 不变 |
| 命名 | `Kf*` / `kf-*` / `--kf-*` / BEM | 不变（见 NAMING_CONVENTIONS.md） |

**没有删除或重命名任何 v0.1.0 的导出**。`check-dist.mjs` 会核对 44 个组件全部出现在类型声明里。

## 七、Props / Emits / Slots 契约（核心组件）

| 组件 | 关键 Props | 事件 | 插槽 |
| --- | --- | --- | --- |
| `KfButton` | `size(sm\|md\|lg)` `variant(primary\|secondary\|outline\|ghost\|text\|danger)` `disabled` `loading` `iconName` `iconPosition` `iconOnly` `ariaLabel` | `click` | `default` |
| `KfInput` | `modelValue` `type` `label` `placeholder` `disabled` `readonly` `required` `error` `prefixIconName` `suffixIconName` | `update:modelValue` `focus` `blur` | `prefix` `suffix` `meta` |
| `KfSelect` | `options` `modelValue` `multiple` `searchable` `clearable` `loading` `error` `disabled` | `update:modelValue` `change` | `default`（自定义选项） |
| `KfDatePicker` | `modelValue` `min` `max` `weekStartsOn` `clearable` `readonly` `error` | `update:modelValue` `change` | — |
| `KfDialog` | `open` `title` `variant` `width` `loading` `disabled` `error` `persistent` `placement` | `update:open` `confirm` `cancel` `opened` `closed` | `default` `icon` `footer` |
| `KfTable` | `columns` `rows` `selectable` `sortable` `loading` `emptyText` | `update:selected` `sort` `row-click` | `empty` `cell-<key>` |
| `KfUpload` | `accept` `multiple` `maxSize` `disabled` | `select` `remove` `retry` | `default` |
| `KfChatComposer` | `modelValue` `busy` `stoppable` `disabled` `error` `attachments` | `update:modelValue` `submit` `stop` `remove-attachment` | `toolbar` |
| `KfFlashcard` | `front` `back` `revealed` `disabled` | `update:revealed` `rate` | `front` `back` |
| `KfQuestionCard` | `question` `index` `total` `selected` | `update:selected` `submit` | `footer` |

完整逐条目 Props 见 `COMPONENT_MATRIX.md`（86 个 Props / 113 个事件 / 20 个插槽），运行时以 Studio 的 API 标签页为准——它读的是真实 `defineProps`。

## 八、Vue 使用示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { KfButton, KfInput, KfDialog, KfSelect } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'

const name = ref('')
const stack = ref('vue')
const open = ref(false)
const options = [
  { label: 'Vue 3', value: 'vue' },
  { label: 'React', value: 'react' },
]
</script>

<template>
  <KfInput v-model="name" label="知识库名称" placeholder="例如：前端学习" required />
  <KfSelect v-model="stack" :options="options" label="技术栈" />

  <KfButton variant="primary" :disabled="!name" @click="open = true">保存</KfButton>

  <KfDialog v-model:open="open" title="确认保存？" @confirm="open = false">
    将创建知识库「{{ name }}」。
  </KfDialog>
</template>
```

## 九、已知限制

- `KfDatePicker` 只支持格里高利历；无农历、无时区偏移设置（全部本地时间）。
- `KfMarkdownRenderer` 支持语法是白名单子集：标题/列表/引用/围栏代码/表格/链接/强调/分割线；不支持内联 HTML。
- `KfTable` 是客户端表格（排序/选择/空态），不含虚拟滚动与服务端分页契约。
- `KfUpload` 只做文件选择与进度展示，真正上传由宿主实现。
- `ai` / `learning` 的 peerDependencies 写的是 `workspace:^0.2.0`，单独发布前需要改成具体版本号。
