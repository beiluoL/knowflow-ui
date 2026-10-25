import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfMarkdownRenderer from '../markdown/KfMarkdownRenderer.vue'
import { isSafeHref, parseInline, parseMarkdown } from '../markdown/parse'

describe('markdown/parse', () => {
  it('协议白名单只放行 http/https/mailto/站内相对路径', () => {
    expect(isSafeHref('https://example.com/a')).toBe(true)
    expect(isSafeHref('http://example.com')).toBe(true)
    expect(isSafeHref('mailto:a@b.com')).toBe(true)
    expect(isSafeHref('/docs/1')).toBe(true)
    expect(isSafeHref('#section')).toBe(true)

    expect(isSafeHref('javascript:alert(1)')).toBe(false)
    expect(isSafeHref('JavaScript:alert(1)')).toBe(false)
    expect(isSafeHref('data:text/html;base64,PHNjcmlwdD4=')).toBe(false)
    expect(isSafeHref('vbscript:msgbox')).toBe(false)
    expect(isSafeHref('   ')).toBe(false)
  })

  it('控制字符不能绕过协议判断（"java\\nscript:"）', () => {
    expect(isSafeHref('java\nscript:alert(1)')).toBe(false)
    expect(isSafeHref('java\u0000script:alert(1)')).toBe(false)
  })

  it('标题 / 段落 / 行内格式解析为结构化 token', () => {
    const blocks = parseMarkdown('# 标题\n\n正文 **粗体** 与 `code`')
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toMatchObject({ type: 'heading', level: 1 })

    const paragraph = blocks[1]
    expect(paragraph.type).toBe('paragraph')
    if (paragraph.type !== 'paragraph') throw new Error('期望段落块')
    expect(paragraph.inlines.map((token) => token.type)).toEqual(['text', 'strong', 'text', 'code'])
  })

  it('围栏代码块保留语言与原始缩进', () => {
    const blocks = parseMarkdown('```ts\nconst a = 1\n  return a\n```')
    expect(blocks[0]).toMatchObject({ type: 'code', lang: 'ts' })
    if (blocks[0].type !== 'code') throw new Error('期望代码块')
    expect(blocks[0].code).toContain('  return a')
  })

  it('有序 / 无序列表与引用被区分', () => {
    expect(parseMarkdown('- a\n- b')[0].type).toBe('list')
    const ordered = parseMarkdown('1. a\n2. b')[0]
    expect(ordered).toMatchObject({ type: 'list', ordered: true })

    const quote = parseMarkdown('> 提示')[0]
    expect(quote.type).toBe('quote')
  })

  it('不支持的语法（表格）保留为普通段落文本，不静默吞掉', () => {
    const blocks = parseMarkdown('| a | b |\n| - | - |')
    expect(blocks.length).toBeGreaterThan(0)
    expect(blocks.every((block) => block.type === 'paragraph')).toBe(true)
  })

  it('parseInline 对链接做协议校验，危险协议降级为纯文本', () => {
    const safe = parseInline('[文档](https://example.com/doc)')
    expect(safe[0]).toMatchObject({ type: 'link', href: 'https://example.com/doc' })

    const unsafe = parseInline('[危险](javascript:alert)')
    expect(unsafe.every((token) => token.type !== 'link')).toBe(true)
    expect(unsafe.map((token) => token.text).join('')).toContain('危险')
  })
})

describe('KfMarkdownRenderer', () => {
  it('渲染标题 / 段落 / 列表 / 引用 / 分隔线', () => {
    const wrapper = mount(KfMarkdownRenderer, {
      props: { content: '# H1\n\n正文\n\n- 一\n- 二\n\n> 引用\n\n---' },
    })
    expect(wrapper.find('.kf-markdown__h1').text()).toBe('H1')
    expect(wrapper.find('.kf-markdown__paragraph').text()).toBe('正文')
    expect(wrapper.findAll('.kf-markdown__list-item')).toHaveLength(2)
    expect(wrapper.find('.kf-markdown__quote').text()).toBe('引用')
    expect(wrapper.find('.kf-markdown__hr').exists()).toBe(true)
  })

  it('HTML 标签只作为文本渲染，不产生真实元素（无 v-html）', () => {
    const wrapper = mount(KfMarkdownRenderer, {
      props: { content: '<img src=x onerror="alert(1)"> 与 <script>alert(2)</script>' },
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x onerror="alert(1)">')
  })

  it('链接在 linkable 时渲染 <a>，危险协议不生成 <a>', async () => {
    const wrapper = mount(KfMarkdownRenderer, {
      props: { content: '[安全](https://example.com) 与 [危险](javascript:alert)' },
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://example.com')
    expect(links[0].attributes('rel')).toContain('noopener')

    await wrapper.setProps({ linkable: false })
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('代码块内容保持原文，不被当作内联语法解析', () => {
    const wrapper = mount(KfMarkdownRenderer, {
      props: { content: '```js\nconst url = "**not bold**"\n```' },
    })
    expect(wrapper.find('.kf-markdown__code').text()).toBe('const url = "**not bold**"')
    expect(wrapper.find('strong').exists()).toBe(false)
  })

  it('空内容渲染 empty 插槽而不是空白块', () => {
    const wrapper = mount(KfMarkdownRenderer, {
      props: { content: '' },
      slots: { empty: '<span class="empty-slot">暂无内容</span>' },
    })
    expect(wrapper.find('.empty-slot').exists()).toBe(true)
  })
})
