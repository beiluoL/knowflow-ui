import { describe, expect, it } from 'vitest'
import { ENTRIES, entryStats } from '../registry/entries'
import {
  STORIES,
  buildStories,
  findStory,
  resolveStory,
  storyCountByComponent,
  storyStats,
  validateStories,
} from '../registry/stories'

/**
 * 153 Story 是 V5 的历史覆盖基线，迁移后必须逐条对得上。
 * 这里同时锁住「生成规则」与「条目数」：改动任一都会让总数偏离。
 */
describe('Story 注册表', () => {
  it('保留 65 个条目、153 个 Story', () => {
    expect(ENTRIES).toHaveLength(65)
    expect(STORIES).toHaveLength(153)
  })

  it('每个 Story 的 componentId 都能在条目表里找到', () => {
    const ids = new Set(ENTRIES.map((entry) => entry.id))
    const orphans = STORIES.filter((item) => !ids.has(item.componentId))
    expect(orphans.map((item) => item.componentId)).toEqual([])
  })

  it('每条目至少有一个 Basic Story，且全局只有 65 个 basic', () => {
    const basics = STORIES.filter((item) => item.storyId === 'basic')
    expect(basics).toHaveLength(65)
    for (const entry of ENTRIES) {
      expect(findStory(entry.id, 'basic')).toBeTruthy()
    }
  })

  it('storyId 在条目内唯一', () => {
    const seen = new Set<string>()
    const duplicates: string[] = []
    for (const item of STORIES) {
      const key = `${item.componentId}:${item.storyId}`
      if (seen.has(key)) duplicates.push(key)
      seen.add(key)
    }
    expect(duplicates).toEqual([])
  })

  it('validateStories 无错误（Prop / 枚举 / 布尔 / 插槽全部自洽）', () => {
    expect(validateStories(ENTRIES, STORIES)).toEqual([])
  })

  it('已知条目的 Story 数与 V5 矩阵一致', () => {
    expect(storyCountByComponent()).toMatchObject({
      button: 15,
      input: 6,
      textarea: 6,
      checkbox: 3,
      radio: 3,
      switch: 3,
      select: 6,
      datepicker: 4,
      formfield: 3,
      dialog: 5,
      tooltip: 2,
      table: 4,
      drawer: 3,
      combobox: 5,
      searchinput: 5,
      aichat: 2,
      rag: 3,
      agent: 4,
      flashcard: 4,
      appdialog: 2,
      confirmdialog: 2,
      aicomposer: 3,
    })
  })

  it('Button 的尺寸 / 变体 / 图标 / 长标签 Story 齐全', () => {
    const ids = STORIES.filter((item) => item.componentId === 'button').map((item) => item.storyId)
    expect(ids).toEqual(
      expect.arrayContaining([
        'basic',
        'disabled',
        'loading',
        'size-sm',
        'size-md',
        'size-lg',
        'variant-primary',
        'variant-secondary',
        'variant-outline',
        'variant-ghost',
        'variant-text',
        'variant-danger',
        'icon-right',
        'icon-only',
        'long-label',
      ]),
    )
  })

  it('只有 interactiveStory 的条目才有交互参考 Story', () => {
    const interactive = STORIES.filter((item) => item.storyId === 'interactive')
    expect(interactive).toHaveLength(ENTRIES.filter((entry) => entry.interactiveStory).length)
    for (const item of interactive) {
      const entry = ENTRIES.find((candidate) => candidate.id === item.componentId)
      expect(entry?.interactiveStory).toBe(true)
    }
  })

  it('Demo / 未实现条目的 Story 不会被标成真实事件', () => {
    for (const item of STORIES) {
      const entry = ENTRIES.find((candidate) => candidate.id === item.componentId)
      if (entry && entry.status !== 'real') {
        expect(entry.events).toEqual(['event(name, value)'])
      }
    }
  })

  it('storyStats 的分类合计与总数一致', () => {
    const stats = storyStats()
    const sum = Object.values(stats.byCategory).reduce((total, value) => total + value, 0)
    expect(sum).toBe(stats.total)
    expect(stats.total).toBe(153)
    expect(stats.components).toBe(65)
  })

  it('buildStories 可重入且结果稳定', () => {
    expect(buildStories(ENTRIES).map((item) => `${item.componentId}:${item.storyId}`)).toEqual(
      STORIES.map((item) => `${item.componentId}:${item.storyId}`),
    )
  })

  it('深链接解析：命中 / 未知组件 / 未知 Story 都能落到有效 Story', () => {
    expect(resolveStory(ENTRIES, STORIES, 'button', 'size-lg').story.storyId).toBe('size-lg')
    expect(resolveStory(ENTRIES, STORIES, 'Button', 'size-lg').story.storyId).toBe('size-lg')
    // 未知组件回退 Button
    expect(resolveStory(ENTRIES, STORIES, 'nope', 'x').entry.name).toBe('Button')
    // 已知组件 + 未知 Story 回退该条目第一条
    expect(resolveStory(ENTRIES, STORIES, 'input', 'nope').story.storyId).toBe('basic')
  })

  it('条目状态分布：真实 / 演示 / 未实现', () => {
    const stats = entryStats()
    expect(stats.total).toBe(65)
    expect(stats.real + stats.demo + stats.missing).toBe(65)
    expect(stats.demo).toBe(4)
    expect(stats.missing).toBe(3)
    expect(stats.real).toBe(58)
  })
})
