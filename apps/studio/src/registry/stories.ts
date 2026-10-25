/**
 * Story 注册表 —— 153 个 Story，生成规则与 V5 完全一致。
 *
 * 规则来源：V5 `frontend/src/dev/stories.ts` 的 `buildStories()`。
 * 本文件只复刻「生成规则」，不复制 V5 的条目数据——条目来自本仓库
 * `registry/entries.ts`（65 条，状态已按 v0.2.0 重新核算）。
 *
 * 逐条目核对结果（与 V5 COMPONENT_MATRIX.md 的 Story 数列一致）：
 *   P0 61 + P1 29 + AI 18 + 其他 22 + 扩展 23 = 153
 *
 * 这里的 Story 全部是**本地状态**：不请求后端、不写学习记录、不调用 AI 接口。
 */
import { ENTRIES } from './entries'
import type { PlaygroundEntry, PlaygroundStory, StoryCategory } from './types'

/** 状态类开关（存在该 Prop 才生成对应 Story） */
const STATE_KEYS = ['disabled', 'loading', 'readonly', 'required', 'indeterminate'] as const

/** 带长内容 / 长文本的条目 */
const LONG_TEXT_ENTRIES = ['Input', 'Textarea']
const MODAL_ENTRIES = ['Dialog', 'Drawer', 'ConfirmDialog', 'AppDialog']
const SEARCH_ENTRIES = ['Combobox', 'SearchInput']

const LONG_TEXT =
  '这是一段仅用于 Story 预览的长文本，用来观察换行、行高、滚动与截断行为。'.repeat(6)

interface StoryExtra {
  fixture?: Record<string, unknown>
  slots?: Record<string, string>
  description?: string
  interaction?: string[]
  viewport?: Array<'desktop' | 'tablet' | 'mobile'>
  a11y?: string
}

function story(
  entry: PlaygroundEntry,
  storyId: string,
  title: string,
  initialProps: Record<string, unknown> = {},
  category: StoryCategory = 'States',
  extra: StoryExtra = {},
): PlaygroundStory {
  return {
    storyId,
    componentId: entry.id,
    title,
    category,
    initialProps,
    slots: extra.slots ?? {},
    fixture: extra.fixture ?? {},
    description:
      extra.description ?? `${entry.title} · ${title}。全部为本地状态，不触发任何业务请求。`,
    expectedEvents: entry.events,
    interaction: extra.interaction ?? [
      'Tab 聚焦到真实控件',
      '按控件的语义操作，观察本地事件与视觉反馈',
    ],
    viewport: extra.viewport ?? ['desktop', 'tablet', 'mobile'],
    a11y: extra.a11y ?? entry.a11y,
  }
}

export function buildStories(catalog: PlaygroundEntry[]): PlaygroundStory[] {
  return catalog.flatMap((entry) => {
    const result: PlaygroundStory[] = [story(entry, 'basic', '基础预览', {}, 'Basic')]
    const supports = (name: string) => entry.props.some((prop) => prop.name === name)

    /* ── 状态开关 ─────────────────────────────────────────── */
    for (const key of STATE_KEYS) {
      if (supports(key)) result.push(story(entry, key, key))
    }

    /* ── Button 特化：尺寸 / 变体 / 图标 / 长标签 ───────────── */
    if (entry.name === 'Button') {
      for (const size of ['sm', 'md', 'lg']) {
        result.push(story(entry, `size-${size}`, `${size} 尺寸`, { size }, 'Sizes'))
      }
      for (const variant of entry.variants) {
        result.push(story(entry, `variant-${variant}`, `${variant} 变体`, { variant }, 'Variants'))
      }
      result.push(
        story(entry, 'icon-right', '右侧图标', { iconName: 'plus', iconPosition: 'right' }, 'Variants'),
      )
      if (supports('iconOnly')) {
        result.push(
          story(
            entry,
            'icon-only',
            '纯图标',
            { iconOnly: true, iconName: 'search', ariaLabel: '搜索示例' },
            'Accessibility',
            {
              a11y: '纯图标按钮必须有 ariaLabel，否则屏幕阅读器只会读出「按钮」。',
            },
          ),
        )
      }
      result.push(
        story(entry, 'long-label', '长标签', {}, 'Edge Cases', {
          slots: { default: '查看当前知识库的学习与交互规范' },
        }),
      )
    }

    /* ── 长文本 ───────────────────────────────────────────── */
    if (LONG_TEXT_ENTRIES.includes(entry.name)) {
      result.push(
        story(entry, 'long-text', '长文本与输入', { modelValue: LONG_TEXT }, 'Edge Cases'),
      )
    }

    /* ── 错误态 ───────────────────────────────────────────── */
    if (supports('error')) {
      result.push(
        story(entry, 'error', '错误提示', { error: 'Fixture：请检查本地输入' }, 'Form'),
      )
    }

    /* ── Select：多选搜索 + 空选项 ─────────────────────────── */
    if (entry.name === 'Select') {
      result.push(
        story(
          entry,
          'multi-search',
          '多选搜索',
          { multiple: true, searchable: true, clearable: true, modelValue: ['java'] },
          'Interactive',
        ),
      )
      result.push(
        story(entry, 'empty', '空选项', {}, 'Edge Cases', { fixture: { ui: { empty: true } } }),
      )
    }

    /* ── 模态：长内容与焦点 ───────────────────────────────── */
    if (MODAL_ENTRIES.includes(entry.name)) {
      result.push(
        story(entry, 'long-content', '长内容与焦点', {}, 'Edge Cases', {
          fixture: { ui: { longContent: true } },
          interaction: ['打开后 Tab / Shift+Tab 在面板内循环', 'Escape 关闭并把焦点还给触发元素'],
        }),
      )
    }

    /* ── Table：空数据 / 加载中 ───────────────────────────── */
    if (entry.name === 'Table') {
      result.push(
        story(entry, 'empty', '空数据', {}, 'States', { fixture: { ui: { tableEmpty: true } } }),
      )
      result.push(
        story(entry, 'fixture-loading', '加载中', {}, 'States', { fixture: { ui: { busy: true } } }),
      )
    }

    /* ── 搜索类：加载 / 错误 / 无结果 ─────────────────────── */
    if (SEARCH_ENTRIES.includes(entry.name)) {
      result.push(
        story(entry, 'fixture-loading', '搜索中', {}, 'States', {
          fixture: { ui: { searchLoading: true } },
        }),
      )
      result.push(
        story(entry, 'fixture-error', '搜索失败', {}, 'States', {
          fixture: { ui: { searchError: true } },
        }),
      )
      result.push(
        story(entry, 'no-results', '无匹配结果', {}, 'States', {
          fixture: { ui: { query: '没有匹配', open: true } },
        }),
      )
    }

    /* ── 闪卡：空卡 / 加载中 ──────────────────────────────── */
    if (entry.name === 'Flashcard') {
      result.push(
        story(entry, 'empty', '空卡组', {}, 'States', { fixture: { ui: { empty: true } } }),
      )
      result.push(
        story(entry, 'fixture-loading', '加载中', {}, 'States', {
          fixture: { ui: { cardLoading: true } },
        }),
      )
    }

    /* ── RAG：证据不足 ────────────────────────────────────── */
    if (entry.name === 'RAG') {
      result.push(
        story(entry, 'no-answer', '证据不足（Fixture）', {}, 'Edge Cases', {
          fixture: { ui: { empty: true } },
          description:
            'RAG · 证据不足。展示「没有足够证据」的呈现方式；这里的相关性是演示数据，不是生产检索结果。',
        }),
      )
    }

    /* ── Agent：工具成功 / 超时 ───────────────────────────── */
    if (entry.name === 'Agent') {
      for (const toolStatus of ['success', 'timeout']) {
        result.push(
          story(entry, `fixture-${toolStatus}`, `${toolStatus}（模拟工具状态）`, {}, 'States', {
            fixture: { ui: { toolStatus } },
          }),
        )
      }
    }

    /* ── 交互参考（V5 的 Demo-only 条目） ─────────────────── */
    if (entry.interactiveStory) {
      result.push(
        story(entry, 'interactive', '交互参考', {}, 'Interactive', {
          interaction: ['操作画布中的本地 Fixture 控件', '切换 Story 验证状态彼此隔离'],
        }),
      )
    }

    return result
  })
}

export const STORIES: PlaygroundStory[] = buildStories(ENTRIES)

/* ── 查询与校验 ──────────────────────────────────────────── */

export function storiesFor(componentId: string, list: PlaygroundStory[] = STORIES): PlaygroundStory[] {
  return list.filter((item) => item.componentId === componentId)
}

export function findStory(
  componentId: string,
  storyId: string,
  list: PlaygroundStory[] = STORIES,
): PlaygroundStory | undefined {
  return list.find((item) => item.componentId === componentId && item.storyId === storyId)
}

/** 逐条目 Story 数（用于质量面板与测试） */
export function storyCountByComponent(
  list: PlaygroundStory[] = STORIES,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const item of list) out[item.componentId] = (out[item.componentId] ?? 0) + 1
  return out
}

/**
 * 校验 Story 与条目是否自洽。
 * 检查项：重复 storyId、未知条目、未知 Prop、枚举越界、布尔类型不符、未知插槽。
 */
export function validateStories(
  catalog: PlaygroundEntry[],
  list: PlaygroundStory[] = STORIES,
): string[] {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const item of list) {
    const entry = catalog.find((candidate) => candidate.id === item.componentId)
    const key = `${item.componentId}:${item.storyId}`
    if (seen.has(key)) errors.push(`duplicate:${key}`)
    seen.add(key)
    if (!entry) {
      errors.push(`component:${item.componentId}`)
      continue
    }
    for (const [name, value] of Object.entries(item.initialProps)) {
      const spec = entry.props.find((prop) => prop.name === name)
      // Button.label 是展示适配（默认插槽文字），不是真实 Prop
      if (!spec || (entry.name === 'Button' && name === 'label')) {
        errors.push(`prop:${key}:${name}`)
        continue
      }
      if (spec.options && !spec.options.includes(String(value))) {
        errors.push(`option:${key}:${name}`)
      }
      if (spec.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`boolean:${key}:${name}`)
      }
    }
    for (const slot of Object.keys(item.slots)) {
      if (!entry.slots.includes(slot)) errors.push(`slot:${key}:${slot}`)
    }
  }

  return errors
}

/** 深链接解析：`/c/:componentId/:storyId`；未命中时回退到 Button/basic */
export function resolveStory(
  catalog: PlaygroundEntry[],
  list: PlaygroundStory[],
  component: unknown,
  storyId: unknown,
): { entry: PlaygroundEntry; story: PlaygroundStory } {
  const id = typeof component === 'string' ? component.toLowerCase() : ''
  const entry =
    catalog.find((item) => item.id.toLowerCase() === id) ??
    catalog.find((item) => item.name === 'Button') ??
    catalog[0]
  const own = list.filter((item) => item.componentId === entry?.id)
  const found =
    own.find((item) => item.storyId === storyId) ??
    own[0]
  return { entry, story: found }
}

/** 预览初始 Props：条目默认值 + 该 Story 的覆盖值（不改注册表） */
export function storyDefaults(
  entry: PlaygroundEntry,
  storyItem: PlaygroundStory,
): Record<string, unknown> {
  const defaults = Object.fromEntries(entry.props.map((prop) => [prop.name, prop.default]))
  return { ...defaults, ...storyItem.initialProps }
}

/** 仅取真实组件也承认的 Prop（避免把文档层字段传给组件） */
export function componentProps(
  entry: PlaygroundEntry,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = new Set(entry.props.map((prop) => prop.name))
  return Object.fromEntries(Object.entries(values).filter(([name]) => allowed.has(name)))
}

export interface StoryStats {
  total: number
  components: number
  byCategory: Record<StoryCategory, number>
  byComponent: Record<string, number>
}

export function storyStats(list: PlaygroundStory[] = STORIES): StoryStats {
  const byCategory = {
    Basic: 0,
    Variants: 0,
    Sizes: 0,
    States: 0,
    Interactive: 0,
    Form: 0,
    'Edge Cases': 0,
    Accessibility: 0,
  } as Record<StoryCategory, number>
  const byComponent: Record<string, number> = {}
  for (const item of list) {
    byCategory[item.category] += 1
    byComponent[item.componentId] = (byComponent[item.componentId] ?? 0) + 1
  }
  return {
    total: list.length,
    components: Object.keys(byComponent).length,
    byCategory,
    byComponent,
  }
}
