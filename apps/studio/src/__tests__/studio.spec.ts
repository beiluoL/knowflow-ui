import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { TOKEN_GROUPS } from '@beiluol/knowflow-tokens'
import { ENTRIES, entryStats } from '../registry/entries'
import { STORIES, storyStats } from '../registry/stories'
import { buildQualityReport, qualityToJson, qualityToMarkdown } from '../registry/quality'
import { navigate, useHashRoute } from '../composables/useHashRoute'
import CodeSample from '../components/CodeSample.vue'
import PropsPanel from '../components/PropsPanel.vue'
import type { PlaygroundEntry } from '../registry/types'

/**
 * Studio 自身行为的回归测试。
 *
 * 覆盖 Phase 10 里「Studio 测试」这一档：
 *   深链接 / 后退 · Props 面板同步 · 代码示例 · 令牌页数据源 · 质量报告 · 条目状态分布。
 * 这些都不依赖真实浏览器，和 render.spec.ts 的「真实挂载」互补。
 */

function entryOf(id: string): PlaygroundEntry {
  const found = ENTRIES.find((entry) => entry.id === id)
  if (!found) throw new Error(`条目不存在：${id}`)
  return found
}

function goHash(hash: string): void {
  window.location.hash = hash
  window.dispatchEvent(new Event('hashchange'))
}

beforeEach(() => {
  goHash('#/')
})

/* ── ① 深链接 / 后退 ─────────────────────────────────────── */

describe('hash 路由与深链接', () => {
  it('没有 hash 时落在目录页', () => {
    const { route } = useHashRoute()
    expect(route.value.view).toBe('catalog')
  })

  it('解析 #/c/:entry/:story 与查询参数', () => {
    goHash('#/c/button/size-lg?tab=api&viewport=mobile')
    const { route } = useHashRoute()
    expect(route.value).toEqual({
      view: 'component',
      entryId: 'button',
      storyId: 'size-lg',
      tab: 'api',
      viewport: 'mobile',
    })
  })

  it('非法的 tab / viewport 回落到默认值，而不是渲染空白', () => {
    goHash('#/c/button/basic?tab=nope&viewport=watch')
    const { route } = useHashRoute()
    expect(route.value.tab).toBe('preview')
    expect(route.value.viewport).toBe('desktop')
  })

  it('质量页与令牌页有独立深链接', () => {
    goHash('#/quality')
    expect(useHashRoute().route.value.view).toBe('quality')
    goHash('#/tokens')
    expect(useHashRoute().route.value.view).toBe('tokens')
  })

  it('navigate 写回 hash，且默认 tab/viewport 不写进 URL', async () => {
    navigate({ view: 'component', entryId: 'input', storyId: 'focus' })
    await nextTick()
    expect(window.location.hash).toBe('#/c/input/focus')

    navigate({ tab: 'api' })
    await nextTick()
    expect(window.location.hash).toBe('#/c/input/focus?tab=api')
    expect(useHashRoute().route.value.storyId).toBe('focus')
  })

  it('后退回到上一个 hash 时状态跟着回退', () => {
    goHash('#/c/button/basic')
    goHash('#/c/input/focus?tab=api')
    expect(useHashRoute().route.value.entryId).toBe('input')

    // 浏览器后退 = 地址栏回到上一个 hash 并触发 hashchange
    goHash('#/c/button/basic')
    expect(useHashRoute().route.value).toMatchObject({
      view: 'component',
      entryId: 'button',
      storyId: 'basic',
      tab: 'preview',
    })
  })
})

/* ── ② Props 面板同步 ────────────────────────────────────── */

describe('Props 面板', () => {
  it('只渲染可编辑参数，受控参数不出现在面板里', () => {
    const wrapper = mount(PropsPanel, {
      props: { entry: entryOf('input'), values: { modelValue: 'x', placeholder: '本地内容' }, metrics: {} },
    })
    expect(wrapper.text()).toContain('placeholder')
    // modelValue 由画布状态驱动，出现在面板里就会产生两套真相
    expect(wrapper.text()).not.toContain('modelValue')
    wrapper.unmount()
  })

  it('开关类参数改动会以 update 事件回传，并且面板值可回流', async () => {
    const wrapper = mount(PropsPanel, {
      props: { entry: entryOf('input'), values: { disabled: false }, metrics: {} },
    })
    const switches = wrapper.findAll('[role="switch"]')
    expect(switches.length).toBeGreaterThan(0)
    // Input 的可编辑顺序首位是 true/false 类参数，直接取 disabled 对应的那个
    const disabled = switches[0]
    expect(disabled.attributes('aria-checked')).toBe('false')
    await disabled.trigger('click')
    expect(wrapper.emitted('update')?.[0]).toEqual(['disabled', true])

    // 面板值回流：外部把 values 改掉，开关跟着变（不是本地第二份状态）
    await wrapper.setProps({ values: { disabled: true } })
    expect(wrapper.findAll('[role="switch"]')[0].attributes('aria-checked')).toBe('true')
    wrapper.unmount()
  })

  it('实测样式只在拿到 measurements 时出现', () => {
    const wrapper = mount(PropsPanel, {
      props: { entry: entryOf('button'), values: {}, metrics: { height: '38px', fontSize: '14px' } },
    })
    expect(wrapper.text()).toContain('38px')
    expect(wrapper.text()).toContain('14px')
    wrapper.unmount()
  })
})

/* ── ③ 代码示例 ──────────────────────────────────────────── */

describe('代码示例生成', () => {
  it('默认值不输出，避免淹没有效信息', () => {
    const wrapper = mount(CodeSample, {
      props: { entry: entryOf('button'), values: { size: 'md', variant: 'primary', disabled: false }, slots: { default: '提交' } },
    })
    const code = wrapper.find('code').text()
    expect(code).not.toContain('size=')
    expect(code).not.toContain('variant=')
    expect(code).not.toContain('disabled')
    expect(code).toContain('<kf-button>提交</kf-button>')
    wrapper.unmount()
  })

  it('非默认值按类型生成，并带上真实包名与样式入口', () => {
    const wrapper = mount(CodeSample, {
      props: {
        entry: entryOf('button'),
        values: { size: 'lg', disabled: true, iconName: 'sparkles' },
        slots: { default: '新建' },
      },
    })
    const code = wrapper.find('code').text()
    expect(code).toContain('size="lg"')
    // iconName 的注册表默认值是 plus，取非默认值才会落进代码
    expect(code).toContain('icon-name="sparkles"')
    // boolean 用裸属性，不写 ="true"
    expect(code).toMatch(/^\s*disabled$/m)
    expect(code).toContain("import { KfButton } from '@beiluol/knowflow-ui'")
    expect(code).toContain("import '@beiluol/knowflow-ui/style.css'")
    expect(code.trimEnd().endsWith('</script>')).toBe(true)
    wrapper.unmount()
  })

  it('AI 包组件用 @beiluol/knowflow-ai', () => {
    const wrapper = mount(CodeSample, {
      props: { entry: entryOf('aichat'), values: {}, slots: {} },
    })
    const code = wrapper.find('code').text()
    expect(code).toContain("from '@beiluol/knowflow-ai'")
    expect(code).toContain('组合而成')
    wrapper.unmount()
  })

  it('demo / missing 条目不编造用法', () => {
    const wrapper = mount(CodeSample, {
      props: { entry: entryOf('datatable'), values: {}, slots: {} },
    })
    const code = wrapper.find('code').text()
    expect(code.startsWith('<!--')).toBe(true)
    expect(code).toContain('尚未提供公共组件')
    wrapper.unmount()
  })
})

/* ── ④ 令牌页数据源 ──────────────────────────────────────── */

describe('Design Tokens 数据源', () => {
  it('只使用 --kf-* 规范命名空间', () => {
    const names = TOKEN_GROUPS.flatMap((group) => group.tokens)
    expect(names.length).toBeGreaterThan(60)
    for (const name of names) expect(name.startsWith('--kf-'), name).toBe(true)
  })

  it('没有重复令牌，分组都有标题与说明', () => {
    const names = TOKEN_GROUPS.flatMap((group) => group.tokens)
    expect(new Set(names).size).toBe(names.length)
    for (const group of TOKEN_GROUPS) {
      expect(group.title.length).toBeGreaterThan(0)
      expect(group.note.length).toBeGreaterThan(0)
    }
  })
})

/* ── ⑤ 质量报告 ──────────────────────────────────────────── */

describe('质量报告', () => {
  const report = buildQualityReport('2026-01-01T00:00:00.000Z')

  it('所有数字都是注册表的函数，不是抄来的历史值', () => {
    const stats = entryStats()
    expect(report.entries.total).toBe(ENTRIES.length)
    expect(report.entries.real).toBe(stats.real)
    expect(report.entries.demo).toBe(stats.demo)
    expect(report.entries.missing).toBe(stats.missing)
    expect(report.entries.real + report.entries.demo + report.entries.missing).toBe(report.entries.total)
    expect(report.stories.total).toBe(STORIES.length)
    expect(report.stories.total).toBe(storyStats().total)
  })

  it('V5 的历史统计不会出现在导出物里', () => {
    const json = qualityToJson(report)
    const markdown = qualityToMarkdown(report)
    for (const stale of ['1628', '153 个 Story 全部完成', '42 tests']) {
      expect(json).not.toContain(stale)
      expect(markdown).not.toContain(stale)
    }
  })

  it('JSON 可被解析，Markdown 含汇总与逐条目明细', () => {
    const parsed = JSON.parse(qualityToJson(report)) as { entries: { total: number } }
    expect(parsed.entries.total).toBe(ENTRIES.length)

    const markdown = qualityToMarkdown(report)
    expect(markdown).toContain('# KnowFlow UI Studio · 质量报告')
    expect(markdown).toContain('| 条目总数 |')
    expect(markdown).toContain('## 逐条目明细')
    expect(markdown.split('\n').length).toBeGreaterThan(ENTRIES.length)
  })

  it('每个真实条目都有 Story，每条目的 Story 数与汇总一致', () => {
    const realIds = ENTRIES.filter((entry) => entry.status === 'real').map((entry) => entry.id)
    for (const id of realIds) expect(report.stories.entriesWithoutStory, id).not.toContain(id)

    const sum = report.entriesDetail.reduce((acc, item) => acc + item.storyCount, 0)
    expect(sum).toBe(report.stories.total)
  })

  it('预览方式统计与条目状态一致', () => {
    expect(report.previews.none).toBe(report.entries.demo + report.entries.missing)
    expect(report.previews.custom + report.previews.generic + report.previews.none).toBe(
      report.entries.total,
    )
  })
})

/* ── ⑥ 条目状态分布 ──────────────────────────────────────── */

describe('条目状态如实标注', () => {
  it('demo 与 missing 条目点名固定，改状态必须改测试', () => {
    const demo = ENTRIES.filter((entry) => entry.status === 'demo').map((entry) => entry.id).sort()
    const missing = ENTRIES.filter((entry) => entry.status === 'missing').map((entry) => entry.id).sort()
    expect(demo).toEqual(['datatable', 'inputgroup', 'resizablepanels', 'toolbar'])
    expect(missing).toEqual(['breadcrumb', 'loading', 'typography'])
  })

  it('real 条目必须真的指向本仓库组件', () => {
    for (const entry of ENTRIES) {
      if (entry.status !== 'real') continue
      expect(entry.packageName, entry.id).toBeTruthy()
      expect(entry.components.length, entry.id).toBeGreaterThan(0)
      for (const name of entry.components) expect(name.startsWith('Kf'), `${entry.id}:${name}`).toBe(true)
    }
  })

  it('demo / missing 条目不自称已接入真实组件', () => {
    for (const entry of ENTRIES) {
      if (entry.status === 'real') continue
      const quality = buildQualityReport().entriesDetail.find((item) => item.id === entry.id)!
      expect(quality.preview, entry.id).toBe('none')
    }
  })
})
