import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfCitationCard from '../citation-card/KfCitationCard.vue'
import KfSourceList from '../source-list/KfSourceList.vue'
import KfEvidencePanel from '../evidence-panel/KfEvidencePanel.vue'
import KfAttachmentPreview from '../attachment-preview/KfAttachmentPreview.vue'
import { formatBytes, formatScore } from '../shared/format'
import { splitByTerms } from '../shared/highlight'

describe('shared/format', () => {
  it('字节格式化为紧凑单位，非法值返回空串', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1023)).toBe('1023 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(1024 * 1024 * 3.5)).toBe('3.5 MB')
    expect(formatBytes(undefined)).toBe('')
    expect(formatBytes(-1)).toBe('')
    expect(formatBytes(Number.NaN)).toBe('')
  })

  it('相关性分数四舍五入为百分比并裁剪越界值', () => {
    expect(formatScore(0.876)).toBe('88%')
    expect(formatScore(0)).toBe('0%')
    expect(formatScore(1.4)).toBe('100%')
    expect(formatScore(-0.5)).toBe('0%')
    expect(formatScore(null)).toBe('')
    expect(formatScore(Number.NaN)).toBe('')
  })
})

describe('shared/highlight', () => {
  it('按命中词切分并保留原文顺序', () => {
    const segments = splitByTerms('检索增强生成与检索', ['检索'])
    expect(segments.map((segment) => segment.text)).toEqual(['检索', '增强生成与', '检索'])
    expect(segments.map((segment) => segment.match)).toEqual([true, false, true])
  })

  it('无命中词时整段返回非命中片段', () => {
    expect(splitByTerms('全文', [])).toEqual([{ text: '全文', match: false }])
    expect(splitByTerms('', ['a'])).toEqual([])
  })

  it('正则特殊字符被转义，不会抛异常', () => {
    const segments = splitByTerms('a.b.c', ['.'])
    expect(segments.filter((segment) => segment.match)).toHaveLength(2)
  })

  it('大小写不敏感匹配但保留原文大小写', () => {
    const segments = splitByTerms('RAG 与 rag', ['rag'])
    expect(segments.filter((segment) => segment.match).map((segment) => segment.text)).toEqual(['RAG', 'rag'])
  })
})

describe('KfCitationCard', () => {
  it('渲染角标、标题、来源、定位与相关性', () => {
    const wrapper = mount(KfCitationCard, {
      props: {
        index: 3,
        title: '间隔复习算法说明',
        source: 'learning.md',
        locator: 'L40-58',
        snippet: 'FSRS 通过稳定性与难度估计复习间隔。',
        score: 0.87,
      },
    })
    expect(wrapper.get('.kf-citation-card__index').text()).toBe('3')
    expect(wrapper.get('.kf-citation-card__title').text()).toBe('间隔复习算法说明')
    expect(wrapper.get('.kf-citation-card__source-name').text()).toBe('learning.md')
    expect(wrapper.get('.kf-citation-card__locator').text()).toBe('L40-58')
    expect(wrapper.get('.kf-citation-card__score').text()).toBe('87%')
  })

  it('无 url 时不渲染查看来源，有 url 时点击派发 open', async () => {
    const withoutUrl = mount(KfCitationCard, { props: { title: 'x' } })
    expect(withoutUrl.find('.kf-citation-card__open').exists()).toBe(false)

    const wrapper = mount(KfCitationCard, { props: { title: 'x', url: 'https://example.com/a' } })
    await wrapper.get('.kf-citation-card__open').trigger('click')
    expect(wrapper.emitted('open')).toEqual([['https://example.com/a']])
  })

  it('actions 点击派发 key 并阻止冒泡', async () => {
    const wrapper = mount(KfCitationCard, {
      props: { title: 'x', actions: [{ key: 'copy', label: '复制' }] },
    })
    await wrapper.get('.kf-citation-card__action').trigger('click')
    expect(wrapper.emitted('action')).toEqual([['copy']])
  })

  it('active 时附加高亮类', () => {
    const wrapper = mount(KfCitationCard, { props: { title: 'x', active: true } })
    expect(wrapper.classes()).toContain('kf-citation-card--active')
  })

  it('snippetLines 控制行数裁剪，0 表示不裁剪', () => {
    // 注：happy-dom 会丢弃 -webkit-box / -webkit-line-clamp 这类厂商前缀声明，
    // 因此这里断言同一分支写入的 overflow 裁剪标记，行数在真实浏览器中生效。
    const clamped = mount(KfCitationCard, { props: { title: 'x', snippet: '长文本', snippetLines: 2 } })
    expect(clamped.get('.kf-citation-card__snippet').attributes('style')).toContain('overflow: hidden')

    const free = mount(KfCitationCard, { props: { title: 'x', snippet: '长文本', snippetLines: 0 } })
    expect(free.get('.kf-citation-card__snippet').attributes('style')).toBeUndefined()
  })

  it('片段按纯文本渲染，注入标签不生成元素', () => {
    const wrapper = mount(KfCitationCard, {
      props: { title: 'x', snippet: '<img src=x onerror="alert(1)">' },
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x onerror="alert(1)">')
  })
})

describe('KfSourceList', () => {
  const sources = [
    { id: 'a', title: 'A 文档', source: 'a.md', score: 0.9 },
    { id: 'b', title: 'B 文档', source: 'b.md', score: 0.7 },
    { id: 'c', title: 'C 文档', source: 'c.md', score: 0.5 },
  ]

  it('渲染标题、数量徽标与全部条目', () => {
    const wrapper = mount(KfSourceList, { props: { sources } })
    expect(wrapper.get('.kf-source-list__title').text()).toBe('参考来源')
    expect(wrapper.get('.kf-source-list__count').text()).toBe('3')
    expect(wrapper.findAll('.kf-citation-card')).toHaveLength(3)
    // 序号由列表位置决定，不跟随宿主顺序字段
    expect(wrapper.findAll('.kf-citation-card__index').map((n) => n.text())).toEqual(['1', '2', '3'])
  })

  it('maxVisible 折叠其余条目，点击后全部展开', async () => {
    const wrapper = mount(KfSourceList, { props: { sources, maxVisible: 1 } })
    expect(wrapper.findAll('.kf-citation-card')).toHaveLength(1)
    expect(wrapper.get('.kf-source-list__more').text()).toContain('展开其余 2 条')

    await wrapper.get('.kf-source-list__more').trigger('click')
    expect(wrapper.findAll('.kf-citation-card')).toHaveLength(3)
    expect(wrapper.get('.kf-source-list__more').text()).toContain('收起')
  })

  it('dense 模式不渲染片段', () => {
    const wrapper = mount(KfSourceList, {
      props: { sources: [{ id: 'a', title: 'A', snippet: '片段' }], dense: true },
    })
    expect(wrapper.find('.kf-citation-card__snippet').exists()).toBe(false)
  })

  it('activeId 命中的条目高亮', () => {
    const wrapper = mount(KfSourceList, { props: { sources, activeId: 'b' } })
    const cards = wrapper.findAll('.kf-citation-card')
    expect(cards[1].classes()).toContain('kf-citation-card--active')
    expect(cards[0].classes()).not.toContain('kf-citation-card--active')
  })

  it('空列表展示占位文案', () => {
    const wrapper = mount(KfSourceList, { props: { sources: [], emptyText: '没有引用' } })
    expect(wrapper.get('.kf-source-list__empty').text()).toBe('没有引用')
  })

  it('点击条目派发 select，打开来源派发 open', async () => {
    const wrapper = mount(KfSourceList, {
      props: { sources: [{ id: 'a', title: 'A', url: 'https://example.com' }] },
    })
    const card = wrapper.get('.kf-citation-card')
    await card.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([{ id: 'a', title: 'A', url: 'https://example.com' }, 0])

    await wrapper.get('.kf-citation-card__open').trigger('click')
    expect(wrapper.emitted('open')?.[0]?.[0]).toBe('https://example.com')
  })
})

describe('KfEvidencePanel', () => {
  const chunks = [
    { id: 'c1', text: '检索增强生成结合检索与生成', score: 0.92, source: 'rag.md', locator: 'p.3', highlights: ['检索'] },
  ]

  it('渲染片段、来源、定位与分数', () => {
    const wrapper = mount(KfEvidencePanel, { props: { chunks } })
    expect(wrapper.get('.kf-evidence-panel__index').text()).toBe('#1')
    expect(wrapper.get('.kf-evidence-panel__source').text()).toBe('rag.md')
    expect(wrapper.get('.kf-evidence-panel__locator').text()).toBe('p.3')
    expect(wrapper.get('.kf-evidence-panel__score').text()).toBe('92%')
  })

  it('命中词渲染为 <mark>，未命中部分保持文本', () => {
    const wrapper = mount(KfEvidencePanel, { props: { chunks } })
    const marks = wrapper.findAll('.kf-evidence-panel__mark')
    expect(marks.map((mark) => mark.text())).toEqual(['检索', '检索'])
    expect(wrapper.get('.kf-evidence-panel__text').text()).toContain('增强生成结合')
  })

  it('片段中的 HTML 不作为元素渲染（高亮不走 v-html）', () => {
    const wrapper = mount(KfEvidencePanel, {
      props: { chunks: [{ id: 'x', text: '<script>alert(1)</script> 检索', highlights: ['检索'] }] },
    })
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
    expect(wrapper.findAll('.kf-evidence-panel__mark')).toHaveLength(1)
  })

  it('showScore=false 隐藏分数', () => {
    const wrapper = mount(KfEvidencePanel, { props: { chunks, showScore: false } })
    expect(wrapper.find('.kf-evidence-panel__score').exists()).toBe(false)
  })

  it('clampLines 写入行数裁剪样式', () => {
    const wrapper = mount(KfEvidencePanel, { props: { chunks, clampLines: 3 } })
    expect(wrapper.get('.kf-evidence-panel__text').attributes('style')).toContain('overflow: hidden')

    const free = mount(KfEvidencePanel, { props: { chunks, clampLines: 0 } })
    expect(free.get('.kf-evidence-panel__text').attributes('style')).toBeUndefined()
  })

  it('点击定位派发 select', async () => {
    const wrapper = mount(KfEvidencePanel, { props: { chunks } })
    await wrapper.get('.kf-evidence-panel__select').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([chunks[0], 0])
  })

  it('空证据展示占位文案，query 仅作展示', () => {
    const wrapper = mount(KfEvidencePanel, {
      props: { chunks: [], query: '什么是 RAG', emptyText: '无命中' },
    })
    expect(wrapper.get('.kf-evidence-panel__query-text').text()).toBe('什么是 RAG')
    expect(wrapper.get('.kf-evidence-panel__empty').text()).toBe('无命中')
  })
})

describe('KfAttachmentPreview', () => {
  it('渲染名称与体积，未知体积不显示 NaN', () => {
    const wrapper = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a', name: '报告.pdf', size: 2048 }] },
    })
    expect(wrapper.get('.kf-attachment-preview__name').text()).toBe('报告.pdf')
    expect(wrapper.get('.kf-attachment-preview__sub').text()).toBe('2 KB')

    const unknown = mount(KfAttachmentPreview, { props: { files: [{ id: 'b', name: 'x.bin' }] } })
    expect(unknown.get('.kf-attachment-preview__sub').text()).toBe('未知大小')
  })

  it('上传中展示进度，失败展示错误文案', () => {
    const uploading = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a', name: 'x.zip', status: 'uploading', progress: 40 }] },
    })
    expect(uploading.get('.kf-attachment-preview__sub').text()).toBe('上传中 40%')
    expect(uploading.get('.kf-attachment-preview__bar').attributes('style')).toContain('width: 40%')

    const failed = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a', name: 'x.zip', status: 'error' }] },
    })
    expect(failed.get('.kf-attachment-preview__item').classes()).toContain('kf-attachment-preview__item--error')
    expect(failed.get('.kf-attachment-preview__sub').text()).toBe('上传失败')
  })

  it('移除按钮派发 id 与条目，removable=false 时不渲染', async () => {
    const wrapper = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a1', name: 'x.png' }] },
    })
    const remove = wrapper.get('.kf-attachment-preview__remove')
    expect(remove.attributes('aria-label')).toBe('移除附件 x.png')
    await remove.trigger('click')
    expect(wrapper.emitted('remove')?.[0]).toEqual(['a1', { id: 'a1', name: 'x.png' }])

    const locked = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a1', name: 'x.png' }], removable: false },
    })
    expect(locked.find('.kf-attachment-preview__remove').exists()).toBe(false)
  })

  it('maxVisible 截断并提示剩余数量', () => {
    const wrapper = mount(KfAttachmentPreview, {
      props: {
        files: [
          { id: 'a', name: 'a' },
          { id: 'b', name: 'b' },
          { id: 'c', name: 'c' },
        ],
        maxVisible: 1,
      },
    })
    expect(wrapper.findAll('.kf-attachment-preview__item')).toHaveLength(1)
    expect(wrapper.get('.kf-attachment-preview__more').text()).toBe('还有 2 个附件未显示')
  })

  it('空列表展示 emptyText，grid 模式附加布局类', () => {
    const wrapper = mount(KfAttachmentPreview, { props: { files: [], emptyText: '暂无附件' } })
    expect(wrapper.get('.kf-attachment-preview__empty').text()).toBe('暂无附件')
    expect(wrapper.classes()).toContain('kf-attachment-preview--list')

    const grid = mount(KfAttachmentPreview, { props: { files: [{ id: 'a', name: 'a' }], layout: 'grid' } })
    expect(grid.classes()).toContain('kf-attachment-preview--grid')
  })

  it('点击附件派发 open', async () => {
    const wrapper = mount(KfAttachmentPreview, {
      props: { files: [{ id: 'a', name: 'a.png', url: 'blob:x' }] },
    })
    await wrapper.get('.kf-attachment-preview__open').trigger('click')
    expect(wrapper.emitted('open')?.[0]?.[0]).toEqual({ id: 'a', name: 'a.png', url: 'blob:x' })
  })
})
