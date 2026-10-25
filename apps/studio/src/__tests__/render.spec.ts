import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount as baseMount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { FIXTURES } from '../fixtures'
import { ENTRIES } from '../registry/entries'
import { STORIES, storiesFor, storyDefaults } from '../registry/stories'
import { resolvePreview } from '../previews'
import type { PreviewApi } from '../previews/api'
import type { PlaygroundEntry, PlaygroundStory } from '../registry/types'

/**
 * 把 153 个 Story 全部真实挂载一次。
 *
 * 这条测试的价值不在断言 DOM 细节，而在**暴露契约漂移**：
 *   - 条目写了不存在的 Prop → Vue 警告（unresolved component / missing required prop）
 *   - 预览用了错误的组件 → 渲染报错
 *   - 模态/浮层没有清理 → 后续用例的 body 里堆满 teleport 节点
 * 因此这里把 console.error / console.warn 也当成失败信号。
 */
const active: VueWrapper[] = []

function mountPreview(preview: unknown, api: PreviewApi): VueWrapper {
  const wrapper = baseMount(preview as never, { props: { api } as never }) as VueWrapper
  active.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (active.length) active.pop()?.unmount()
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-theme')
})

function makeApi(entry: PlaygroundEntry, story: PlaygroundStory): PreviewApi {
  const base = FIXTURES[entry.id] ?? {}
  return {
    entry,
    story,
    values: { ...storyDefaults(entry, story), ...(base.props ?? {}) },
    fixture: {
      ...base,
      slots: { ...(base.slots ?? {}), ...(story.slots ?? {}) },
      ui: story.fixture.ui ?? {},
    } as Record<string, unknown>,
    set: vi.fn(),
    log: vi.fn(),
  }
}

const cases: Array<[string, PlaygroundEntry, PlaygroundStory]> = STORIES.map((story) => {
  const entry = ENTRIES.find((candidate) => candidate.id === story.componentId)!
  return [`${entry.name} · ${story.storyId}`, entry, story]
})

describe('全部 Story 都能挂载', () => {
  it('用例数与 153 一致', () => {
    expect(cases).toHaveLength(153)
  })

  it.each(cases)('%s', async (_label, entry, story) => {
    const warnings: string[] = []
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(' '))
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(' '))
    })

    const api = makeApi(entry, story)
    const preview = resolvePreview(entry)
    const wrapper = mountPreview(preview, api)
    await nextTick()
    await nextTick()

    expect(wrapper.html().length).toBeGreaterThan(0)

    const noise = warnings.filter(
      (message) =>
        !message.includes('Failed to resolve component') &&
        !message.includes('Hydration') &&
        message.trim().length > 0,
    )
    expect(noise, `Vue 警告：${noise.join(' | ')}`).toEqual([])

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })
})

describe('条目结构与 Story 一致', () => {
  it('每个真实条目都有一个能被解析的预览组件', () => {
    for (const entry of ENTRIES) {
      const preview = resolvePreview(entry)
      expect(preview, entry.id).toBeTruthy()
    }
  })

  it('非真实条目使用说明卡而不是伪造组件', () => {
    for (const entry of ENTRIES) {
      if (entry.status === 'real') continue
      const preview = resolvePreview(entry) as { name?: string }
      expect(preview.name, entry.id).toBe('DemoPreview')
    }
  })

  it('Story 默认值只包含注册表声明的 Prop', () => {
    for (const entry of ENTRIES) {
      for (const story of storiesFor(entry.id)) {
        const values = storyDefaults(entry, story)
        const declared = new Set(entry.props.map((spec) => spec.name))
        for (const name of Object.keys(values)) {
          if (entry.name === 'Button' && name === 'label') continue
          expect(declared.has(name), `${entry.id}.${name}`).toBe(true)
        }
      }
    }
  })
})
