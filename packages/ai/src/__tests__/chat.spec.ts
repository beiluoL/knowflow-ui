import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KfChatMessage from '../chat-message/KfChatMessage.vue'
import KfChatComposer from '../chat-composer/KfChatComposer.vue'
import KfCodeBlock from '../code-block/KfCodeBlock.vue'

afterEach(() => {
  // clipboard 是共享全局状态，测试之间必须还原，否则会串到后续用例
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  vi.restoreAllMocks()
})

function stubClipboard(writeText: () => Promise<void>): ReturnType<typeof vi.fn> {
  const spy = vi.fn(writeText)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: spy }, configurable: true })
  return spy
}

describe('KfChatMessage', () => {
  it('按 role 渲染默认名称与头像图标', () => {
    const assistant = mount(KfChatMessage, { props: { role: 'assistant' } })
    expect(assistant.text()).toContain('AI 助手')

    const user = mount(KfChatMessage, { props: { role: 'user' } })
    expect(user.text()).toContain('我')
    expect(user.classes()).toContain('kf-chat-message--user')
  })

  it('自定义 name 覆盖默认名称，并用作 aria-label', () => {
    const wrapper = mount(KfChatMessage, { props: { name: '知识库助手' } })
    expect(wrapper.text()).toContain('知识库助手')
    expect(wrapper.attributes('aria-label')).toBe('知识库助手')
  })

  it('pending 时显示打字指示且带 role=status', () => {
    const wrapper = mount(KfChatMessage, { props: { pending: true } })
    const typing = wrapper.get('.kf-chat-message__typing')
    expect(typing.attributes('role')).toBe('status')
    expect(wrapper.findAll('.kf-chat-message__dot')).toHaveLength(3)
  })

  it('action 按钮点击派发 key，disabled 时不派发', async () => {
    const wrapper = mount(KfChatMessage, {
      props: {
        actions: [
          { key: 'copy', label: '复制' },
          { key: 'retry', label: '重试', disabled: true },
        ],
      },
    })
    const buttons = wrapper.findAll('.kf-chat-message__action')
    expect(buttons).toHaveLength(2)

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('action')).toEqual([['copy']])
  })

  it('默认插槽承载正文（用于挂 Markdown 渲染器）', () => {
    const wrapper = mount(KfChatMessage, { slots: { default: '<p class="body">正文</p>' } })
    expect(wrapper.find('.kf-chat-message__bubble .body').exists()).toBe(true)
  })
})

describe('KfChatComposer', () => {
  it('输入时派发 update:modelValue', async () => {
    const wrapper = mount(KfChatComposer, { props: { modelValue: '' } })
    const textarea = wrapper.get('textarea')
    await textarea.setValue('你好')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['你好'])
  })

  it('Enter 提交，Shift+Enter 不提交', async () => {
    const wrapper = mount(KfChatComposer, { props: { modelValue: '问题' } })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('submit')).toBeUndefined()

    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toEqual([['问题']])
  })

  it('输入法组合中的 Enter 不触发提交', async () => {
    const wrapper = mount(KfChatComposer, { props: { modelValue: '拼音' } })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('compositionstart')
    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toBeUndefined()

    await textarea.trigger('compositionend')
    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('空白内容时发送按钮禁用且不提交', async () => {
    const wrapper = mount(KfChatComposer, { props: { modelValue: '   ' } })
    const send = wrapper.get('.kf-chat-composer__send')
    expect(send.attributes('disabled')).toBeDefined()
    await send.trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('disabled 状态下 textarea 原生禁用', () => {
    const wrapper = mount(KfChatComposer, { props: { disabled: true, modelValue: 'x' } })
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
  })

  it('busy + stoppable 时发送按钮变为停止并派发 stop', async () => {
    const wrapper = mount(KfChatComposer, { props: { busy: true, modelValue: 'x' } })
    const stop = wrapper.get('.kf-chat-composer__send--stop')
    expect(stop.attributes('aria-label')).toBe('停止生成')
    await stop.trigger('click')
    expect(wrapper.emitted('stop')).toHaveLength(1)
  })

  it('展示附件列表、体积与移除事件', async () => {
    const wrapper = mount(KfChatComposer, {
      props: {
        modelValue: '',
        attachments: [{ id: 'a1', name: '报告.pdf', size: 2048 }],
      },
    })
    expect(wrapper.get('.kf-chat-composer__attachment-name').text()).toBe('报告.pdf')
    expect(wrapper.get('.kf-chat-composer__attachment-size').text()).toBe('2.0 KB')

    await wrapper.get('.kf-chat-composer__attachment-remove').trigger('click')
    expect(wrapper.emitted('removeAttachment')).toEqual([['a1']])
  })

  it('maxLength 展示计数并在超限时加提示类', () => {
    const wrapper = mount(KfChatComposer, { props: { modelValue: 'abc', maxLength: 3 } })
    const count = wrapper.get('.kf-chat-composer__count')
    expect(count.text()).toBe('3/3')
    expect(count.classes()).toContain('kf-chat-composer__count--over')
    expect(wrapper.get('textarea').attributes('maxlength')).toBe('3')
  })
})

describe('KfCodeBlock', () => {
  it('按行渲染行号，行数与代码行一致', () => {
    const wrapper = mount(KfCodeBlock, { props: { code: 'a\nb\nc', lineNumbers: true } })
    expect(wrapper.findAll('.kf-code-block__line')).toHaveLength(3)
    expect(wrapper.findAll('.kf-code-block__lineno').map((n) => n.text())).toEqual(['1', '2', '3'])
  })

  it('关闭行号时渲染原始文本', () => {
    const wrapper = mount(KfCodeBlock, { props: { code: 'const a = 1', lineNumbers: false } })
    expect(wrapper.get('.kf-code-block__code').text()).toBe('const a = 1')
    expect(wrapper.find('.kf-code-block__lineno').exists()).toBe(false)
  })

  it('复制成功派发 copy 并显示已复制文案', async () => {
    const writeText = stubClipboard(() => Promise.resolve())
    const wrapper = mount(KfCodeBlock, { props: { code: 'npm i vue', copiedText: '已复制' } })

    await wrapper.get('.kf-code-block__copy').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(writeText).toHaveBeenCalledWith('npm i vue')
    expect(wrapper.emitted('copy')).toEqual([['npm i vue']])
    expect(wrapper.get('.kf-code-block__copy').classes()).toContain('kf-code-block__copy--done')
    expect(wrapper.get('.kf-code-block__copy-label').text()).toBe('已复制')
  })

  it('复制失败显式暴露：error 事件 + 失败态样式，不静默', async () => {
    stubClipboard(() => Promise.reject(new Error('权限被拒绝')))
    const wrapper = mount(KfCodeBlock, { props: { code: 'x' } })

    await wrapper.get('.kf-code-block__copy').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.emitted('error')?.[0]).toEqual(['权限被拒绝'])
    const button = wrapper.get('.kf-code-block__copy')
    expect(button.classes()).toContain('kf-code-block__copy--failed')
    expect(button.attributes('aria-label')).toBe('复制失败')
    expect(wrapper.get('.kf-code-block__copy-label').text()).toBe('失败')
  })

  it('copyable=false 时不渲染复制按钮', () => {
    const wrapper = mount(KfCodeBlock, { props: { code: 'x', copyable: false } })
    expect(wrapper.find('.kf-code-block__copy').exists()).toBe(false)
  })

  it('卸载时清除复位定时器（不留下悬挂计时器）', async () => {
    stubClipboard(() => Promise.resolve())
    const wrapper = mount(KfCodeBlock, { props: { code: 'x' } })
    await wrapper.get('.kf-code-block__copy').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
