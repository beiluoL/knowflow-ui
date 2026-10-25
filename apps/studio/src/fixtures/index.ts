/**
 * Studio 本地 Fixture —— 只服务于预览画布。
 *
 * 三条硬规则（写进数据层，避免后续漂移）：
 *   1. 这里没有任何 fetch / 延时请求：数据是常量，状态是本地的；
 *   2. 所有文案都是「示例知识库」而非真实用户数据，不冒充生产内容；
 *   3. fixture 只提供**组件需要的数据形状**，不替组件决定默认值
 *      （默认值仍然来自 registry/specs.ts，二者冲突以真实组件为准）。
 */
import type { VNodeChild } from 'vue'

export interface EntryFixture {
  /** 覆盖面板初始值（例如模态的 open=true） */
  props?: Record<string, unknown>
  /** 插槽内容；字符串直接渲染，函数用于需要真实节点的场景 */
  slots?: Record<string, string | (() => VNodeChild)>
  /** 场景数据（表格行、树节点、消息列表等） */
  data?: Record<string, unknown>
  /** 实际尺寸面板要量的选择器（默认取组件根节点） */
  measure?: string
}

const SELECT_OPTIONS = [
  { label: 'Java', value: 'java' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Vue 3', value: 'vue' },
  { label: 'Spring Boot', value: 'spring' },
  { label: 'MyBatis-Plus', value: 'mybatis', hint: 'ORM' },
  { label: 'Milvus', value: 'milvus', hint: '向量库' },
  { label: '已归档：Vue 2', value: 'vue2', disabled: true },
]

const TABLE_COLUMNS = [
  { key: 'name', title: '知识库', sortable: true, width: 180 },
  { key: 'docs', title: '文档数', align: 'right' as const, sortable: true, width: 100 },
  { key: 'updated', title: '最近更新', width: 160 },
  { key: 'owner', title: '负责人', width: 120 },
]

const TABLE_ROWS = [
  { id: 'kb-1', name: 'Spring AI 实战', docs: 128, updated: '2026-10-21', owner: '我' },
  { id: 'kb-2', name: '前端工程化笔记', docs: 64, updated: '2026-10-18', owner: '我' },
  { id: 'kb-3', name: 'RAG 检索实验', docs: 37, updated: '2026-10-12', owner: '协作者' },
  { id: 'kb-4', name: '算法错题本', docs: 12, updated: '2026-09-30', owner: '我' },
]

const TREE_NODES = [
  {
    id: 'root-1',
    label: 'Java 后端',
    children: [
      { id: 'n-1-1', label: 'Spring Boot 基础' },
      {
        id: 'n-1-2',
        label: 'Spring AI',
        children: [
          { id: 'n-1-2-1', label: 'ChatClient' },
          { id: 'n-1-2-2', label: '向量检索' },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    label: '前端',
    children: [
      { id: 'n-2-1', label: 'Vue 3 响应式' },
      { id: 'n-2-2', label: 'Vite 构建' },
    ],
  },
]

const CODE_SAMPLE = `export async function resolveNextAction(input: LearningInput) {
  const evidence = resolveEvidenceBatch(input.events)
  const aggregated = aggregateEvidence(evidence)
  const diagnosis = diagnoseFromEvidence(aggregated)
  return buildTopCandidate(diagnosis)
}`

const MARKDOWN_SAMPLE = `## 间隔复习为什么有效

遗忘曲线说明：**间隔**比重复次数更关键。一次 20 分钟的集中复习，
远不如四次 5 分钟的分散复习。

- 第 1 次：学习当天
- 第 2 次：+1 天
- 第 3 次：+3 天
- 第 4 次：+7 天

> 组件只负责渲染，不负责计算间隔。

\`\`\`ts
const interval = [1, 3, 7, 15]
\`\`\`

更多见 [说明文档](https://example.com/docs)。`

const CHAT_MESSAGES = [
  {
    id: 'm-1',
    role: 'user' as const,
    content: '帮我解释一下 RAG 里的 rerank 有什么作用？',
    timestamp: '10:24',
  },
  {
    id: 'm-2',
    role: 'assistant' as const,
    content:
      '**Rerank** 是在粗排召回之后做的一次精排：\n\n1. 召回阶段追求「不漏」，通常取 top-50；\n2. Rerank 用交叉编码器逐对打分，追求「排序准」；\n3. 最终只把 top-5 交给模型，降低噪声与 token 成本。',
    timestamp: '10:24',
  },
]

const SOURCES = [
  {
    id: 's-1',
    title: 'Spring AI 官方文档 · Vector Store',
    source: 'docs.spring.io',
    url: 'https://docs.spring.io/spring-ai/reference/api/vectordbs.html',
    snippet: '向量库负责存储 embedding 并执行相似度检索，常见实现包括 Milvus、PgVector。',
    score: 0.92,
    locator: '第 4 章',
  },
  {
    id: 's-2',
    title: 'RAG 检索增强生成实践',
    source: '内部知识库',
    url: 'https://example.com/rag',
    snippet: '混合检索（关键词 + 向量）在长文档场景通常优于单一向量检索。',
    score: 0.81,
    locator: '第 2 节',
  },
  {
    id: 's-3',
    title: 'Chunk 切分策略对比',
    source: '内部知识库',
    snippet: '按标题切分 + 200 字重叠，在问答场景召回率更稳定。',
    score: 0.67,
  },
]

const EVIDENCE = [
  {
    id: 'e-1',
    title: '为什么需要重排序',
    source: '内部知识库 / 检索实验',
    text: '粗排召回阶段使用向量相似度，速度快但精度有限；重排序阶段使用交叉编码器对候选逐一打分，可以显著提升 top-k 的相关性。',
    score: 0.92,
    highlights: ['重排序', '交叉编码器'],
  },
  {
    id: 'e-2',
    title: '成本与延迟权衡',
    source: '内部知识库 / 检索实验',
    text: '重排序会增加一次模型调用，延迟通常增加 80–200ms，因此只在召回数量较大时启用。',
    score: 0.74,
    highlights: ['延迟', '召回'],
  },
]

const AGENT_STEPS = [
  {
    id: 'step-1',
    kind: 'plan' as const,
    title: '拆解问题',
    description: '判断需要先检索知识库，再运行一段 SQL 统计。',
    status: 'success' as const,
  },
  {
    id: 'step-2',
    kind: 'tool' as const,
    title: 'search_docs',
    description: '在「RAG 检索实验」中检索 rerank 相关文档。',
    status: 'success' as const,
    detail: 'args: { query: "rerank 作用", topK: 5 }',
  },
  {
    id: 'step-3',
    kind: 'observation' as const,
    title: '命中 3 篇文档',
    status: 'success' as const,
  },
  {
    id: 'step-4',
    kind: 'decision' as const,
    title: '决定直接回答',
    description: '证据足够，不再追加工具调用。',
    status: 'success' as const,
  },
]

const QUIZ_OPTIONS = [
  { value: 'a', label: '把召回结果按向量距离重新排序' },
  { value: 'b', label: '用交叉编码器对候选逐对打分后重排' },
  { value: 'c', label: '把文档切得更碎以提升召回率' },
  { value: 'd', label: '在生成阶段增加 temperature' },
]

const INTERVIEW_DIMENSIONS = [
  { key: 'structure', label: '表达结构', score: 82, maxScore: 100, comment: '先结论后展开' },
  { key: 'depth', label: '技术深度', score: 74, maxScore: 100, comment: '可以补一次量化对比' },
  { key: 'tradeoff', label: '权衡意识', score: 68, maxScore: 100, comment: '提到了延迟，但没说成本' },
  { key: 'followup', label: '追问应对', score: 59, maxScore: 100, comment: '追问时略显发散' },
]

export const FIXTURES: Record<string, EntryFixture> = {
  /* ── 表单 ─────────────────────────────────────────────── */
  button: { slots: { default: '保存更改' } },
  input: { props: { modelValue: 'Spring AI 实战笔记', label: '知识库名称', placeholder: '给知识库起个名字' } },
  textarea: {
    props: { modelValue: '记录今天关于 rerank 的实验结论：召回 top-50 后重排，答案相关性明显提升。', label: '笔记内容', rows: 4 },
  },
  checkbox: { props: { modelValue: true, label: '记住这台设备' } },
  radio: {
    props: { modelValue: '7', label: '复习提醒' },
    data: {
      options: [
        { label: '每天', value: '1' },
        { label: '每 3 天', value: '3' },
        { label: '每周', value: '7' },
      ],
    },
  },
  switch: { props: { modelValue: true, label: '开启专注模式' } },
  select: {
    props: { modelValue: 'vue', label: '技术栈', clearable: true, searchable: true },
    data: { options: SELECT_OPTIONS },
  },
  datepicker: { props: { modelValue: '2026-10-25', label: '复习日期', clearable: true } },
  formfield: { props: { controlId: 'kf-demo-field', label: '邮箱', help: '用于接收复习提醒', error: '' } },
  slider: { props: { modelValue: 64, label: '每日目标', suffix: '%', showValue: true } },
  numberinput: { props: { modelValue: 20, label: '每日新卡上限', min: 0, max: 200, step: 5 } },
  tagsinput: { props: { modelValue: ['Java', 'RAG'], label: '标签' } },
  searchinput: { props: { modelValue: '', placeholder: '搜索知识库、笔记或闪卡' } },
  buttongroup: {
    props: {
      modelValue: 'list',
      ariaLabel: '布局',
      items: [
        { value: 'list', label: '列表', iconName: 'list' },
        { value: 'grid', label: '网格', iconName: 'grid' },
      ],
    },
  },

  /* ── 展示 ─────────────────────────────────────────────── */
  icon: { props: { name: 'sparkles', size: '20' } },
  badge: { props: { variant: 'success' }, slots: { default: '已同步' } },
  tag: { props: { variant: 'primary' }, slots: { default: 'Java' } },
  card: {
    props: { variant: 'default', padding: 'md' },
    slots: { default: '卡片正文：这里是任意内容，Card 只负责表面、圆角与内边距。' },
  },
  avatar: { props: { name: '北落', size: 'md', showStatus: true, status: 'online' } },
  alert: {
    props: { variant: 'warning', title: '离线草稿', description: '当前网络不可用，修改已保存在本地。' },
  },
  progress: { props: { percentage: 64, label: '本周复习完成度', showLabel: true } },
  skeleton: { props: { rows: 3, type: 'list' } },
  statusindicator: { props: { status: 'running', label: '正在检索', pulse: true } },
  divider: { props: { direction: 'horizontal' }, slots: { default: '以上为今日新增' } },
  link: { props: { href: 'https://example.com', external: true }, slots: { default: '查看规范文档' } },
  emptystate: {
    props: { icon: 'folder', title: '还没有知识库', description: '创建第一个知识库，把散落的笔记收进来。' },
  },
  errorstate: {
    props: {
      title: '这一块没能加载出来',
      scope: '只有「最近复习」受影响，其它内容正常。',
      hint: '请确认后端服务已启动，然后重试。',
      showRetry: true,
    },
  },
  copybutton: { props: { text: 'npm i @beiluol/knowflow-ui', label: '复制安装命令' } },

  /* ── 导航与数据 ───────────────────────────────────────── */
  tabs: {
    props: { modelValue: 'preview', ariaLabel: '组件面板' },
    data: {
      items: [
        { id: 'preview', label: '预览' },
        { id: 'api', label: 'API' },
        { id: 'states', label: '状态' },
      ],
    },
  },
  accordion: {
    props: { modelValue: ['a1'] },
    data: {
      items: [
        { name: 'a1', title: '为什么默认收起？', content: '避免长文档一次占满屏幕，让用户先看到结构。' },
        { name: 'a2', title: '支持多项展开吗？', content: '传 multiple 即可；默认允许同时展开多项。' },
        { name: 'a3', title: '键盘如何操作？', content: 'Enter / Space 切换，↑↓ 在标题之间移动。' },
      ],
    },
  },
  pagination: { props: { pageNum: 2, pageSize: 10, total: 86, showInfo: true } },
  table: {
    props: { selectable: true, caption: '知识库列表' },
    data: { columns: TABLE_COLUMNS, rows: TABLE_ROWS },
  },
  tree: {
    props: { ariaLabel: '知识树', showLines: true },
    data: { nodes: TREE_NODES, expandedIds: ['root-1', 'n-1-2'] },
  },
  upload: {
    props: {
      accept: '.pdf,.md,image/*',
      multiple: true,
      maxSizeMb: 10,
      maxCount: 5,
      hint: '支持 PDF / Markdown / 图片，单文件不超过 10MB',
    },
  },
  combobox: {
    props: { modelValue: '', label: '关联知识点', placeholder: '输入关键词过滤' },
    data: { options: SELECT_OPTIONS.map(({ label, value }) => ({ label, value })) },
  },

  /* ── 浮层 ─────────────────────────────────────────────── */
  dialog: { props: { title: '删除这篇笔记？', message: '删除后无法恢复，关联的闪卡不会受影响。' } },
  drawer: { props: { title: '筛选条件', width: 360 } },
  confirmdialog: { props: { title: '退出编辑？', message: '未保存的修改会丢失。' } },
  appdialog: { props: { title: '重命名知识库', message: '名称会同步到所有协作者。' } },
  tooltip: { props: { content: '按 ⌘K 打开命令面板', placement: 'top' }, slots: { default: '查看快捷键' } },
  popover: { props: { placement: 'bottom', ariaLabel: '筛选面板' } },
  contextmenu: {
    props: { label: '笔记操作' },
    data: {
      items: [
        { key: 'open', label: '打开', iconName: 'external-link' },
        { key: 'rename', label: '重命名', iconName: 'edit' },
        { key: 'delete', label: '删除', iconName: 'trash-2', danger: true },
      ],
    },
  },
  toast: {
    data: {
      items: [
        { id: 't-1', type: 'success', message: '已保存到本地草稿', duration: 0 },
        { id: 't-2', type: 'error', message: '同步失败：网络不可用，稍后会自动重试', duration: 0 },
      ],
    },
  },
  toasthost: { data: { items: [{ id: 't-3', type: 'info', message: '已复制到剪贴板', duration: 0 }] } },

  /* ── AI ──────────────────────────────────────────────── */
  aichat: { data: { messages: CHAT_MESSAGES } },
  rag: { data: { sources: SOURCES, evidence: EVIDENCE, query: 'rerank 有什么作用？' } },
  agent: { data: { steps: AGENT_STEPS } },
  codeblock: {
    props: { code: CODE_SAMPLE, language: 'ts', filename: 'learning/action-priority.ts', lineNumbers: true },
  },
  markdownrenderer: { props: { content: MARKDOWN_SAMPLE, linkable: false } },
  aicomposer: {
    props: { modelValue: '', placeholder: '输入问题，Enter 发送，Shift+Enter 换行' },
  },

  /* ── 学习 ─────────────────────────────────────────────── */
  flashcard: {
    props: {
      front: 'rerank 解决的是什么问题？',
      back: '召回阶段追求「不漏」，rerank 用交叉编码器逐对打分，解决「排序不准」。',
      tags: ['RAG', '检索'],
      index: 3,
      total: 12,
    },
  },
  smartquiz: {
    data: {
      question:
        '在 RAG 流程中，rerank 阶段最直接的作用是什么？',
      options: QUIZ_OPTIONS,
      result: { score: 78, passScore: 60, total: 10, correct: 8, incorrect: 2, skipped: 0, duration: '12 分钟' },
    },
  },
  interview: {
    data: {
      question: '如果线上检索结果变差，你会如何定位问题？',
      dimensions: INTERVIEW_DIMENSIONS,
      score: 71,
    },
  },
  reviewprogress: {
    props: {
      total: 40,
      completed: 26,
      breakdown: [
        { label: '新卡', value: 8 },
        { label: '到期', value: 32 },
      ],
    },
  },
  questioncard: {
    props: {
      question: '什么情况下应该使用组合而不是继承？',
      type: 'single',
      index: 4,
      total: 10,
      difficulty: 'medium',
      hint: '想想「has-a」与「is-a」的区别。',
      tags: ['面向对象'],
      points: 2,
    },
  },

  /* ── 扩展 / 演示 ──────────────────────────────────────── */
  resizablepanels: {},
  toolbar: {},
  inputgroup: { props: { placeholder: '搜索文档' } },
  datatable: {},

  /* ── 未实现条目（不渲染组件，只出说明） ─────────────────── */
  typography: {},
  breadcrumb: {},
  loading: {},
}
