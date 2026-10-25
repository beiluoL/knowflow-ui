/**
 * 质量面板数据 —— 全部从注册表**实时计算**。
 *
 * 硬规则：这里不出现任何来自 V5 报告的历史数字（如「1628 项」「29 个真实适配」）。
 * 数字只能是当前 ENTRIES / STORIES 的函数；改了注册表，面板跟着变。
 */
import { CATEGORIES, ENTRIES, entryStats } from './entries'
import { STORIES, storyStats } from './stories'
import type { EntryCategory, EntryStatus, PlaygroundEntry } from './types'
import { hasCustomPreview } from '../previews'

export interface EntryQuality {
  id: string
  name: string
  title: string
  category: EntryCategory
  status: EntryStatus
  packageName: string
  components: string[]
  storyCount: number
  props: number
  events: number
  slots: number
  hasA11y: boolean
  hasDesignSpecs: boolean
  preview: 'custom' | 'generic' | 'none'
  source: string
}

export interface QualityReport {
  generatedAt: string
  entries: {
    total: number
    real: number
    demo: number
    missing: number
    byCategory: Record<EntryCategory, number>
    byPackage: Record<string, number>
  }
  stories: {
    total: number
    components: number
    byCategory: Record<string, number>
    averagePerEntry: number
    entriesWithoutStory: string[]
  }
  api: {
    props: number
    events: number
    slots: number
    documentedEvents: number
  }
  previews: {
    custom: number
    generic: number
    none: number
  }
  coverage: {
    a11yDocumented: number
    designSpecsDocumented: number
  }
  entriesDetail: EntryQuality[]
}

export function buildQualityReport(now: string = new Date().toISOString()): QualityReport {
  const entriesStats = entryStats()
  const storiesStats = storyStats()

  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    EntryCategory,
    number
  >
  const byPackage: Record<string, number> = { ui: 0, ai: 0, learning: 0, none: 0 }
  const detail: EntryQuality[] = ENTRIES.map((entry: PlaygroundEntry) => {
    byCategory[entry.category] += 1
    byPackage[entry.packageName ?? 'none'] += 1
    const count = storiesStats.byComponent[entry.id] ?? 0
    return {
      id: entry.id,
      name: entry.name,
      title: entry.title,
      category: entry.category,
      status: entry.status,
      packageName: entry.packageName ?? '—',
      components: entry.components,
      storyCount: count,
      props: entry.props.length,
      events: entry.events.length,
      slots: entry.slots.length,
      hasA11y: Boolean(entry.a11y),
      hasDesignSpecs: Object.keys(entry.designSpecs).length > 0,
      preview:
        entry.status !== 'real' || !entry.components.length
          ? 'none'
          : hasCustomPreview(entry)
            ? 'custom'
            : 'generic',
      source: entry.source,
    }
  })

  const previewCount = detail.reduce(
    (acc, item) => {
      if (item.preview === 'custom') acc.custom += 1
      else if (item.preview === 'generic') acc.generic += 1
      else acc.none += 1
      return acc
    },
    { custom: 0, generic: 0, none: 0 },
  )

  return {
    generatedAt: now,
    entries: {
      total: entriesStats.total,
      real: entriesStats.real,
      demo: entriesStats.demo,
      missing: entriesStats.missing,
      byCategory,
      byPackage,
    },
    stories: {
      total: storiesStats.total,
      components: storiesStats.components,
      byCategory: storiesStats.byCategory,
      averagePerEntry:
        storiesStats.components === 0
          ? 0
          : Math.round((storiesStats.total / storiesStats.components) * 10) / 10,
      entriesWithoutStory: ENTRIES.filter((entry) => !storiesStats.byComponent[entry.id]).map(
        (entry) => entry.id,
      ),
    },
    api: {
      props: ENTRIES.reduce((sum, entry) => sum + entry.props.length, 0),
      events: ENTRIES.reduce((sum, entry) => sum + entry.events.length, 0),
      slots: ENTRIES.reduce((sum, entry) => sum + entry.slots.length, 0),
      documentedEvents: ENTRIES.filter((entry) => entry.events.length > 0).length,
    },
    previews: previewCount,
    coverage: {
      a11yDocumented: detail.filter((item) => item.hasA11y).length,
      designSpecsDocumented: detail.filter((item) => item.hasDesignSpecs).length,
    },
    entriesDetail: detail,
  }
}

/** 质量面板的默认报告（模块加载时算一次，导出时再算一次以保证时间戳新鲜） */
export const QUALITY_REPORT: QualityReport = buildQualityReport()

export function qualityToJson(report: QualityReport = buildQualityReport()): string {
  return `${JSON.stringify(report, null, 2)}\n`
}

export function qualityToMarkdown(report: QualityReport = buildQualityReport()): string {
  const lines: string[] = [
    '# KnowFlow UI Studio · 质量报告',
    '',
    `生成时间：${report.generatedAt}`,
    '',
    '## 汇总',
    '',
    '| 指标 | 数值 |',
    '| --- | ---: |',
    `| 条目总数 | ${report.entries.total} |`,
    `| real（真实组件） | ${report.entries.real} |`,
    `| demo（仅演示） | ${report.entries.demo} |`,
    `| missing（未实现） | ${report.entries.missing} |`,
    `| Story 总数 | ${report.stories.total} |`,
    `| 平均每条目 Story | ${report.stories.averagePerEntry} |`,
    `| Prop 文档条目 | ${report.api.props} |`,
    `| 事件总数 | ${report.api.events} |`,
    `| 插槽总数 | ${report.api.slots} |`,
    `| 专门组合预览 | ${report.previews.custom} |`,
    `| 通用渲染预览 | ${report.previews.generic} |`,
    `| 无预览（demo/missing） | ${report.previews.none} |`,
    '',
    '## 分类分布',
    '',
    '| 分类 | 条目数 |',
    '| --- | ---: |',
  ]
  for (const [category, count] of Object.entries(report.entries.byCategory)) {
    lines.push(`| ${category} | ${count} |`)
  }

  lines.push('', '## 逐条目明细', '', '| 条目 | 状态 | 包 | Story | Props | 预览 |', '| --- | --- | --- | ---: | ---: | --- |')
  for (const item of report.entriesDetail) {
    lines.push(
      `| ${item.title} (${item.name}) | ${item.status} | ${item.packageName} | ${item.storyCount} | ${item.props} | ${item.preview} |`,
    )
  }

  lines.push('')
  return lines.join('\n')
}

/** 供测试使用：确保没有条目声明了 real 却没有 Story */
export function missingStoryEntries(): string[] {
  const withStory = new Set(STORIES.map((story) => story.componentId))
  return ENTRIES.filter((entry) => !withStory.has(entry.id)).map((entry) => entry.id)
}
