/**
 * Studio 条目注册表 —— 65 条，按 V5 的目录结构迁移。
 *
 * 关键规则：
 *   1. `status` 是 **v0.2.0 重新核算**的结果，不沿用 V5 的「已接入」说法；
 *      真实组件的 `source` 指向本仓库 packages，不再指向原项目路径。
 *   2. `interactiveStory` 记录「V5 是否为该条目提供交互参考 Story」，
 *      用于保持 153 Story 的历史覆盖（与本轮是否已实现无关）。
 *   3. props/events/slots 全部来自 registry/specs.ts 的文档数据，
 *      与真实实现的一致性由 Studio 测试 + 组件单测共同保证。
 */
import { componentByName, componentEmits } from '../previews/runtime'
import { EVENTS, eventsFor, propSpecs, slotsFor } from './specs'
import type { EntryCategory, EntryStatus, PlaygroundEntry } from './types'

interface Row {
  name: string
  title: string
  category: EntryCategory
  status: EntryStatus
  component?: string
  pkg?: 'ui' | 'ai' | 'learning'
  variants?: string[]
  desc?: string
  source?: string
  a11y?: string
  specs?: Record<string, string | number>
  interactive?: boolean
  fallback?: string
}

const DEFAULT_A11Y =
  '标签与控件通过 id 关联；Tab 可聚焦，Enter/Space 触发；浮层 Escape 关闭并把焦点还给触发元素。未实测项不标 PASS。'

const P0: EntryCategory = '基础组件 P0'
const P1: EntryCategory = '工作台组件 P1'
const AI: EntryCategory = 'AI与学习组件'
const EXT: EntryCategory = '扩展组件'
const OTHER: EntryCategory = '其他已有组件'

const UI = (dir: string, file: string): string => `packages/ui/src/components/${dir}/${file}.vue`
const AI_SRC = (dir: string, file: string): string => `packages/ai/src/${dir}/${file}.vue`
const LEARN_SRC = (dir: string, file: string): string => `packages/learning/src/${dir}/${file}.vue`

const ROWS: Row[] = [
  /* ── 基础组件 P0 ─────────────────────────────────────────── */
  {
    name: 'Button',
    title: '按钮',
    category: P0,
    status: 'real',
    component: 'KfButton',
    pkg: 'ui',
    variants: ['primary', 'secondary', 'outline', 'ghost', 'text', 'danger'],
    source: UI('button', 'KfButton'),
    specs: { height: 38, fontSize: 14, fontWeight: 500, iconSize: '16–18', gap: 8, radius: 6 },
  },
  {
    name: 'Icon',
    title: '图标',
    category: P0,
    status: 'real',
    component: 'KfIcon',
    pkg: 'ui',
    source: UI('icon', 'KfIcon'),
    desc: '78 个内置线性图标（lucide 风格，ISC），支持运行时注册自定义图标；SVG 内联渲染，无字体依赖。',
  },
  {
    name: 'Input',
    title: '输入框',
    category: P0,
    status: 'real',
    component: 'KfInput',
    pkg: 'ui',
    source: UI('input', 'KfInput'),
    specs: { height: 44, fontSize: 14, radius: 6 },
  },
  {
    name: 'Textarea',
    title: '多行输入',
    category: P0,
    status: 'real',
    component: 'KfTextarea',
    pkg: 'ui',
    source: UI('textarea', 'KfTextarea'),
    specs: { minHeight: 96, fontSize: 14, radius: 6 },
  },
  {
    name: 'Checkbox',
    title: '复选框',
    category: P0,
    status: 'real',
    component: 'KfCheckbox',
    pkg: 'ui',
    source: UI('checkbox', 'KfCheckbox'),
    specs: { width: 20, height: 20, borderWidth: 3, radius: 4, gap: 8, boxShadow: 'none' },
  },
  {
    name: 'Radio',
    title: '单选组',
    category: P0,
    status: 'real',
    component: 'KfRadioGroup',
    pkg: 'ui',
    source: UI('radio', 'KfRadio'),
    interactive: true,
    desc: 'KfRadio + KfRadioGroup：context 注入实现组内互斥，方向键切换，原生 input 语义。',
  },
  {
    name: 'Switch',
    title: '开关',
    category: P0,
    status: 'real',
    component: 'KfSwitch',
    pkg: 'ui',
    source: UI('switch', 'KfSwitch'),
    interactive: true,
    desc: 'role=switch + aria-checked；40×22 轨道、18 滑块，支持 sm/md 两档。',
  },
  {
    name: 'Select',
    title: '选择器',
    category: P0,
    status: 'real',
    component: 'KfSelect',
    pkg: 'ui',
    source: UI('select', 'KfSelect'),
    desc: 'combobox + listbox 模式，Teleport 定位并在视口边缘翻转，支持搜索与多选。',
  },
  {
    name: 'DatePicker',
    title: '日期',
    category: P0,
    status: 'real',
    component: 'KfDatePicker',
    pkg: 'ui',
    source: UI('date-picker', 'KfDatePicker'),
    desc: '日历弹层 + 键盘漫游（方向键/PageUp/PageDown/Home/End/Esc），值为 YYYY-MM-DD 字符串。',
  },
  {
    name: 'FormField',
    title: '表单轨道',
    category: P0,
    status: 'real',
    component: 'KfFormField',
    pkg: 'ui',
    source: UI('form-field', 'KfFormField'),
    desc: 'label/help/error 与控件 id 关联；错误态使用 aria-describedby 指向错误文案。',
  },
  {
    name: 'Dialog',
    title: '对话框',
    category: P0,
    status: 'real',
    component: 'KfDialog',
    pkg: 'ui',
    source: UI('dialog', 'KfDialog'),
    specs: { radius: 16, maxWidth: 560 },
  },
  {
    name: 'Tooltip',
    title: '提示',
    category: P0,
    status: 'real',
    component: 'KfTooltip',
    pkg: 'ui',
    source: UI('tooltip', 'KfTooltip'),
    interactive: true,
    desc: 'aria-describedby 关联；hover/focus 触发，视口翻转，卸载时清理滚动与 resize 监听。',
  },
  {
    name: 'Toast',
    title: '通知',
    category: P0,
    status: 'real',
    component: 'KfToast',
    pkg: 'ui',
    source: UI('toast', 'KfToast'),
    desc: 'useToast() 组合式而非全局单例：状态随组件作用域销毁，onScopeDispose 清理定时器。',
  },
  {
    name: 'Tabs',
    title: '标签页',
    category: P0,
    status: 'real',
    component: 'KfTabs',
    pkg: 'ui',
    source: UI('tabs', 'KfTabs'),
    interactive: true,
    desc: 'WAI-ARIA tabs：roving tabindex，方向键切换，Home/End 跳首尾。',
  },
  {
    name: 'Dropdown',
    title: '动作菜单',
    category: P0,
    status: 'real',
    component: 'KfContextMenu',
    pkg: 'ui',
    source: UI('context-menu', 'KfContextMenu'),
    desc: 'V5 的 Dropdown 统一由 KfContextMenu 承担：菜单项 roving tabindex、Escape 关闭。',
  },

  /* ── 工作台组件 P1 ───────────────────────────────────────── */
  {
    name: 'Table',
    title: '表格',
    category: P1,
    status: 'real',
    component: 'KfTable',
    pkg: 'ui',
    source: UI('table', 'KfTable'),
    interactive: true,
    desc: '原生 <table> 语义；表头 aria-sort、行选择 checkbox、空态与加载遮罩；排序只发事件。',
  },
  {
    name: 'Pagination',
    title: '分页',
    category: P1,
    status: 'real',
    component: 'KfPagination',
    pkg: 'ui',
    source: UI('pagination', 'KfPagination'),
  },
  {
    name: 'Tree',
    title: '树',
    category: P1,
    status: 'real',
    component: 'KfTree',
    pkg: 'ui',
    source: UI('tree', 'KfTree'),
    interactive: true,
    desc: '拍平成可见列表后渲染；↑↓→←/Home/End/Enter 全套键盘漫游。',
  },
  {
    name: 'Drawer',
    title: '抽屉',
    category: P1,
    status: 'real',
    component: 'KfDrawer',
    pkg: 'ui',
    source: UI('drawer', 'KfDrawer'),
    desc: '与 Dialog 共用模态栈（body 滚动锁只加一次），焦点陷阱与归还。',
  },
  {
    name: 'Popover',
    title: '浮层',
    category: P1,
    status: 'real',
    component: 'KfPopover',
    pkg: 'ui',
    source: UI('popover', 'KfPopover'),
    interactive: true,
    desc: '点击触发，外部点击/Esc 关闭，视口翻转；Esc 后焦点回到触发元素。',
  },
  {
    name: 'Upload',
    title: '本地文件',
    category: P1,
    status: 'real',
    component: 'KfUpload',
    pkg: 'ui',
    source: UI('upload', 'KfUpload'),
    interactive: true,
    desc: '类型/大小/数量三档校验；只发 File 列表，不上传、不生成 objectURL。',
  },
  {
    name: 'Badge',
    title: '徽标',
    category: P1,
    status: 'real',
    component: 'KfBadge',
    pkg: 'ui',
    source: UI('badge', 'KfBadge'),
  },
  {
    name: 'Card',
    title: '卡片',
    category: P1,
    status: 'real',
    component: 'KfCard',
    pkg: 'ui',
    source: UI('card', 'KfCard'),
  },
  {
    name: 'Skeleton',
    title: '骨架屏',
    category: P1,
    status: 'real',
    component: 'KfSkeleton',
    pkg: 'ui',
    source: UI('skeleton', 'KfSkeleton'),
  },
  {
    name: 'Empty',
    title: '空状态',
    category: P1,
    status: 'real',
    component: 'KfEmptyState',
    pkg: 'ui',
    source: UI('empty-state', 'KfEmptyState'),
  },
  {
    name: 'Progress',
    title: '进度条',
    category: P1,
    status: 'real',
    component: 'KfProgress',
    pkg: 'ui',
    source: UI('progress', 'KfProgress'),
  },
  {
    name: 'Combobox',
    title: '组合搜索',
    category: P1,
    status: 'real',
    component: 'KfCombobox',
    pkg: 'ui',
    source: UI('combobox', 'KfCombobox'),
    interactive: true,
    desc: 'input[role=combobox] + listbox + aria-activedescendant；本地过滤或宿主检索二选一。',
  },
  {
    name: 'SearchInput',
    title: '搜索框',
    category: P1,
    status: 'real',
    component: 'KfSearchInput',
    pkg: 'ui',
    source: UI('search-input', 'KfSearchInput'),
    interactive: true,
  },

  /* ── AI 与学习组件 ──────────────────────────────────────── */
  {
    name: 'AIChat',
    title: 'AI 对话',
    category: AI,
    status: 'real',
    component: 'KfChatMessage + KfChatComposer',
    pkg: 'ai',
    source: AI_SRC('chat-message', 'KfChatMessage'),
    interactive: true,
    desc: '由 KfChatMessage / KfChatComposer / KfMarkdownRenderer 组合出的真实对话场景，不发请求。',
  },
  {
    name: 'RAG',
    title: '检索引用',
    category: AI,
    status: 'real',
    component: 'KfSourceList + KfEvidencePanel',
    pkg: 'ai',
    source: AI_SRC('source-list', 'KfSourceList'),
    interactive: true,
    desc: '引用列表 + 证据高亮（分段渲染，无 v-html）；相关性数值仅展示宿主给的值。',
  },
  {
    name: 'Agent',
    title: '执行轨迹',
    category: AI,
    status: 'real',
    component: 'KfAgentTrace + KfToolCallCard',
    pkg: 'ai',
    source: AI_SRC('agent-trace', 'KfAgentTrace'),
    interactive: true,
    desc: '公共执行阶段展示 + 审批只发 approve/reject 事件，永不自行执行工具。',
  },
  {
    name: 'Flashcard',
    title: '闪卡',
    category: AI,
    status: 'real',
    component: 'KfFlashcard + KfFlashcardRating',
    pkg: 'learning',
    source: LEARN_SRC('flashcard', 'KfFlashcard'),
    interactive: true,
    desc: '正反面翻转 + 四档评分；不含 FSRS，间隔文案由宿主提供。',
  },
  {
    name: 'SmartQuiz',
    title: '智能测验',
    category: AI,
    status: 'real',
    component: 'KfQuestionCard + KfAnswerOptions + KfQuizResult',
    pkg: 'learning',
    source: LEARN_SRC('question-card', 'KfQuestionCard'),
    interactive: true,
    desc: '题干/选项/反馈/进度/结果五段式；判分由宿主完成，组件只着色。',
  },
  {
    name: 'Interview',
    title: '模拟面试',
    category: AI,
    status: 'real',
    component: 'KfInterviewQuestion + KfInterviewFeedback + KfInterviewScore',
    pkg: 'learning',
    source: LEARN_SRC('interview-question', 'KfInterviewQuestion'),
    interactive: true,
    desc: '提问 → 作答 → 维度反馈 + 总分环；不录音、不计时、不评分。',
  },
  {
    name: 'CodeBlock',
    title: '代码块',
    category: AI,
    status: 'real',
    component: 'KfCodeBlock',
    pkg: 'ai',
    source: AI_SRC('code-block', 'KfCodeBlock'),
    desc: '头部信息 + 复制 + 行号；不内置语法高亮，宿主用 #code 插槽接入自己的高亮器。',
  },

  /* ── 其他已有组件（V5 seeds） ───────────────────────────── */
  {
    name: 'SkeletonList',
    title: '骨架屏列表',
    category: OTHER,
    status: 'real',
    component: 'KfSkeleton',
    pkg: 'ui',
    source: UI('skeleton', 'KfSkeleton'),
    desc: 'V5 的 SkeletonList 现由 KfSkeleton 的 list 类型承担。',
  },
  {
    name: 'AppDialog',
    title: '对话框（旧名）',
    category: OTHER,
    status: 'real',
    component: 'KfDialog',
    pkg: 'ui',
    source: UI('dialog', 'KfDialog'),
    desc: 'V5 的 AppDialog 更名并重写为 KfDialog（同一个组件的两个入口）。',
  },
  {
    name: 'ToastHost',
    title: '通知宿主',
    category: OTHER,
    status: 'real',
    component: 'KfToast',
    pkg: 'ui',
    source: UI('toast', 'KfToast'),
    desc: 'V5 的全局 ToastHost 改为 useToast() 组合式，避免模块级单例。',
  },
  {
    name: 'ConfirmDialog',
    title: '确认弹窗',
    category: OTHER,
    status: 'real',
    component: 'KfConfirmDialog',
    pkg: 'ui',
    source: UI('confirm-dialog', 'KfConfirmDialog'),
  },
  {
    name: 'ContextMenu',
    title: '上下文菜单',
    category: OTHER,
    status: 'real',
    component: 'KfContextMenu',
    pkg: 'ui',
    source: UI('context-menu', 'KfContextMenu'),
  },
  {
    name: 'EmptyState',
    title: '空状态（旧名）',
    category: OTHER,
    status: 'real',
    component: 'KfEmptyState',
    pkg: 'ui',
    source: UI('empty-state', 'KfEmptyState'),
  },
  {
    name: 'ErrorState',
    title: '错误状态',
    category: OTHER,
    status: 'real',
    component: 'KfErrorState',
    pkg: 'ui',
    source: UI('error-state', 'KfErrorState'),
  },
  {
    name: 'AIComposer',
    title: 'AI 输入区',
    category: OTHER,
    status: 'real',
    component: 'KfChatComposer',
    pkg: 'ai',
    source: AI_SRC('chat-composer', 'KfChatComposer'),
    desc: '去掉模型选择与知识库开关（改由 #toolbar 插槽提供），保留 IME 保护与自动撑高。',
  },
  {
    name: 'MarkdownRenderer',
    title: 'Markdown 正文',
    category: OTHER,
    status: 'real',
    component: 'KfMarkdownRenderer',
    pkg: 'ai',
    source: AI_SRC('markdown', 'KfMarkdownRenderer'),
    desc: 'token 化解析 + 元素渲染，全包零 v-html；链接协议白名单。',
  },

  /* ── V5 未实现的占位条目（本轮补齐部分） ─────────────────── */
  {
    name: 'Tag',
    title: '标签',
    category: OTHER,
    status: 'real',
    component: 'KfTag',
    pkg: 'ui',
    source: UI('tag', 'KfTag'),
    desc: 'V5 标为「尚未实现」；v0.2.0 已补齐 KfTag。',
  },
  {
    name: 'Divider',
    title: '分割线',
    category: OTHER,
    status: 'real',
    component: 'KfDivider',
    pkg: 'ui',
    source: UI('divider', 'KfDivider'),
    desc: 'V5 标为「尚未实现」；v0.2.0 已补齐 KfDivider（水平/垂直、间距档位）。',
  },
  {
    name: 'Typography',
    title: '排版',
    category: OTHER,
    status: 'missing',
    source: 'docs/migration/v5-to-ui/PLAN.md',
    desc: 'V5 与 v0.2.0 均未提供独立 Typography 组件：字号/行高由 --kf-fs-* / --kf-lh-* 令牌约束。',
    fallback: '未实现：请直接使用令牌类或语义标签（h1–h3 / p / small）。',
  },
  {
    name: 'Link',
    title: '链接',
    category: OTHER,
    status: 'real',
    component: 'KfLink',
    pkg: 'ui',
    source: UI('link', 'KfLink'),
    desc: 'V5 标为「尚未实现」；v0.2.0 已补齐 KfLink（外链自动 rel=noopener）。',
  },
  {
    name: 'Breadcrumb',
    title: '面包屑',
    category: OTHER,
    status: 'missing',
    source: 'docs/migration/v5-to-ui/PLAN.md',
    desc: 'V5 与 v0.2.0 均未实现；当前页面层级由布局组件自行渲染。',
    fallback: '未实现：v0.2.0 未提取面包屑组件。',
  },
  {
    name: 'Alert',
    title: '提示条',
    category: OTHER,
    status: 'real',
    component: 'KfAlert',
    pkg: 'ui',
    source: UI('alert', 'KfAlert'),
    desc: 'V5 标为「尚未实现」；v0.2.0 已补齐 KfAlert（四种语义 + 可关闭）。',
  },
  {
    name: 'Loading',
    title: '加载',
    category: OTHER,
    status: 'missing',
    source: 'docs/migration/v5-to-ui/PLAN.md',
    desc: '没有独立 Loading 组件：加载态统一用 KfSkeleton（占位）与 KfProgress（确定进度）表达。',
    fallback: '未实现：用 KfSkeleton / KfProgress 组合，不提供旋转图标单件。',
  },
  {
    name: 'ReviewProgress',
    title: '复习进度',
    category: OTHER,
    status: 'real',
    component: 'KfReviewProgress',
    pkg: 'learning',
    source: LEARN_SRC('review-progress', 'KfReviewProgress'),
    desc: 'V5 标为「尚未实现」；v0.2.0 由 packages/learning 提供真实组件。',
  },
  {
    name: 'QuestionCard',
    title: '题目卡片',
    category: OTHER,
    status: 'real',
    component: 'KfQuestionCard',
    pkg: 'learning',
    source: LEARN_SRC('question-card', 'KfQuestionCard'),
    desc: 'V5 标为「尚未实现」；v0.2.0 由 packages/learning 提供真实组件。',
  },

  /* ── V5 扩展组件 ─────────────────────────────────────────── */
  {
    name: 'Accordion',
    title: '折叠面板',
    category: EXT,
    status: 'real',
    component: 'KfAccordion',
    pkg: 'ui',
    source: UI('accordion', 'KfAccordion'),
    interactive: true,
    desc: '展开多个章节；inert 阻止收起内容被 Tab 命中；触发器 aria-expanded 同步。',
  },
  {
    name: 'Avatar',
    title: '头像',
    category: EXT,
    status: 'real',
    component: 'KfAvatar',
    pkg: 'ui',
    source: UI('avatar', 'KfAvatar'),
    desc: '首字母 / 图标 / 图片三态，状态点带可读文字。',
  },
  {
    name: 'ButtonGroup',
    title: '按钮组',
    category: EXT,
    status: 'real',
    component: 'KfButtonGroup',
    pkg: 'ui',
    source: UI('button-group', 'KfButtonGroup'),
    interactive: true,
  },
  {
    name: 'Slider',
    title: '滑块',
    category: EXT,
    status: 'real',
    component: 'KfSlider',
    pkg: 'ui',
    source: UI('slider', 'KfSlider'),
    interactive: true,
    desc: '原生 range 语义（role=slider + aria-valuenow），方向键步进。',
  },
  {
    name: 'DataTable',
    title: '数据表格',
    category: EXT,
    status: 'demo',
    source: 'apps/studio/src/previews/DataTablePreview.vue',
    interactive: true,
    desc: 'V5 的 DataTable 是本地排序/筛选/分页的组合演示；v0.2.0 的真实表格能力在 KfTable，分页由 KfPagination 承担。',
    fallback: 'Demo 演示：组合 KfTable + KfPagination 的本地排序/分页，非独立生产组件。',
  },
  {
    name: 'InputGroup',
    title: '组合输入',
    category: EXT,
    status: 'demo',
    source: 'apps/studio/src/previews/FormsPreview.vue',
    interactive: true,
    desc: 'V5 的组合输入是接口草案；v0.2.0 用 KfInput 的 prefix/suffix 插槽演示同样效果。',
    fallback: 'Demo 演示：KfInput 的 prefix/suffix 插槽组合，无独立 InputGroup 组件。',
  },
  {
    name: 'NumberInput',
    title: '数字输入',
    category: EXT,
    status: 'real',
    component: 'KfNumberInput',
    pkg: 'ui',
    source: UI('number-input', 'KfNumberInput'),
    interactive: true,
    desc: '保留空值（null 不变成 0），aria-valuemin/max 仅在有限值时刻输出。',
  },
  {
    name: 'TagsInput',
    title: '标签输入',
    category: EXT,
    status: 'real',
    component: 'KfTagsInput',
    pkg: 'ui',
    source: UI('tags-input', 'KfTagsInput'),
    interactive: true,
    desc: 'Enter 添加、去重、单项移除；输入法组合期间不提交。',
  },
  {
    name: 'CopyButton',
    title: '复制按钮',
    category: EXT,
    status: 'real',
    component: 'KfCopyButton',
    pkg: 'ui',
    source: UI('copy-button', 'KfCopyButton'),
    interactive: true,
    desc: 'clipboard + execCommand 回退；失败显式暴露，不静默。',
  },
  {
    name: 'StatusIndicator',
    title: '状态指示',
    category: EXT,
    status: 'real',
    component: 'KfStatusIndicator',
    pkg: 'ui',
    source: UI('status-indicator', 'KfStatusIndicator'),
    interactive: true,
    desc: '状态色 + 可读文字双通道，不依赖颜色单独传达信息。',
  },
  {
    name: 'ResizablePanels',
    title: '可调面板',
    category: EXT,
    status: 'demo',
    source: 'apps/studio/src/previews/DataTablePreview.vue',
    interactive: true,
    desc: 'V5 的两栏拖拽是隔离演示；v0.2.0 未提供生产级 ResizablePanels（缺少可靠键盘与持久化方案）。',
    fallback: 'Demo 演示：本地比例调整，不含拖拽与持久化，非生产组件。',
  },
  {
    name: 'Toolbar',
    title: '工具栏',
    category: EXT,
    status: 'demo',
    source: 'apps/studio/src/previews/DataTablePreview.vue',
    interactive: true,
    desc: 'V5 的格式工具栏是隔离演示；v0.2.0 用 KfButtonGroup 组合出同等交互，不提供独立 Toolbar。',
    fallback: 'Demo 演示：KfButtonGroup + KfIcon 组合，无独立 Toolbar 组件。',
  },
]

/** 设计规范补充：输入类控件统一 44px 高 */
const INPUT_LIKE = new Set([
  'Select',
  'DatePicker',
  'Combobox',
  'SearchInput',
  'NumberInput',
  'TagsInput',
])

/**
 * 事件契约：真实组件的 defineEmits 优先，文档表只做兜底。
 * 为什么不是反过来：文档会滞后（例如 Select 曾文档里有 search/retry，实现里没有），
 * Studio 展示的必须是「组件真的会 emit 的事件」。
 */
function runtimeEvents(row: Row, components: string[]): string[] {
  if (row.status !== 'real' || !row.pkg || !components.length) {
    return eventsFor(row.name, row.status)
  }
  const component = componentByName(row.pkg, components[0])
  const real = component ? componentEmits(component) : []
  return real.length ? real : (EVENTS[row.name] ?? [])
}

function toEntry(row: Row): PlaygroundEntry {
  const designSpecs = row.specs ?? (INPUT_LIKE.has(row.name) ? { height: 44, fontSize: 14 } : {})
  // 复合条目用 ' + ' 连接多个真实组件（如 AIChat = KfChatMessage + KfChatComposer）
  const components = (row.component ?? '')
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  return {
    id: row.name.toLowerCase(),
    name: row.name,
    title: row.title,
    category: row.category,
    status: row.status,
    component: components[0],
    components,
    packageName: row.pkg,
    props: propSpecs(row.name),
    events: runtimeEvents(row, components),
    slots: slotsFor(row.name, row.status),
    variants: row.variants ?? [],
    description: row.desc ?? `${row.title}：真实组件本地预览，不连接业务服务。`,
    source: row.source ?? 'docs/migration/v5-to-ui/COMPONENT_MATRIX.md',
    a11y: row.a11y ?? DEFAULT_A11Y,
    designSpecs,
    interactiveStory: Boolean(row.interactive),
    fallback: row.fallback,
  }
}

export const ENTRIES: PlaygroundEntry[] = ROWS.map(toEntry)

export const CATEGORIES: EntryCategory[] = ['基础组件 P0', '工作台组件 P1', 'AI与学习组件', '扩展组件', '其他已有组件']

export function entryById(id: string): PlaygroundEntry | undefined {
  const key = id.toLowerCase()
  return ENTRIES.find((entry) => entry.id === key)
}

export function entryStats() {
  return {
    total: ENTRIES.length,
    real: ENTRIES.filter((entry) => entry.status === 'real').length,
    demo: ENTRIES.filter((entry) => entry.status === 'demo').length,
    missing: ENTRIES.filter((entry) => entry.status === 'missing').length,
    props: ENTRIES.reduce((sum, entry) => sum + entry.props.length, 0),
    events: ENTRIES.reduce((sum, entry) => sum + entry.events.length, 0),
    slots: ENTRIES.reduce((sum, entry) => sum + entry.slots.length, 0),
  }
}
