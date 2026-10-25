import { afterEach, describe, expect, it } from 'vitest'
import { mount as baseMount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import KfDrawer from '../components/drawer/KfDrawer.vue'
import KfPopover from '../components/popover/KfPopover.vue'

/**
 * 浮层组件会 Teleport 到 body 并往模态栈里登记实例。
 * 如果测试结束不卸载，栈里残留实例会让后续用例的滚动锁断言失败，
 * 因此这里统一收集并按相反顺序卸载。
 */
const active: VueWrapper[] = []

function mount(component: unknown, options?: Record<string, unknown>): VueWrapper {
  const wrapper = baseMount(component as never, options as never) as VueWrapper
  active.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (active.length) active.pop()?.unmount()
  document.body.innerHTML = ''
})

function bodyPanel(selector: string): HTMLElement | null {
  return document.body.querySelector<HTMLElement>(selector)
}

describe('KfDrawer', () => {
  it('open=false 时不渲染面板', () => {
    mount(KfDrawer, { props: { open: false, title: '详情' } })
    expect(bodyPanel('.kf-drawer__panel')).toBeNull()
  })

  it('open=true 时 teleport 到 body，并带 modal 语义', async () => {
    mount(KfDrawer, { props: { open: true, title: '详情', description: '说明' } })
    await nextTick()

    const panel = bodyPanel('.kf-drawer__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('aria-label')).toBe('详情')
    expect(panel?.textContent).toContain('说明')
  })

  it('placement 影响类名，width 数字按 px 输出', async () => {
    mount(KfDrawer, { props: { open: true, placement: 'left', width: 320 } })
    await nextTick()

    expect(bodyPanel('.kf-drawer')?.className).toContain('kf-drawer--left')
    expect(bodyPanel('.kf-drawer__panel')?.getAttribute('style')).toContain('width: 320px')
  })

  it('Esc 关闭并派发 close / update:open', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true, title: 'x' } })
    await nextTick()

    bodyPanel('.kf-drawer__panel')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('persistent 时 Esc 与遮罩都不关闭', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true, persistent: true } })
    await nextTick()

    bodyPanel('.kf-drawer__panel')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    bodyPanel('.kf-drawer__overlay')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(bodyPanel('.kf-drawer__close')).toBeNull()
  })

  it('closeOnOverlay=false 时点击遮罩不关闭', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true, closeOnOverlay: false } })
    await nextTick()

    bodyPanel('.kf-drawer__overlay')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('showFooter 渲染确认/取消并派发事件', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true, showFooter: true } })
    await nextTick()

    const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.kf-drawer__btn'))
    expect(buttons).toHaveLength(2)

    buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('loading 时确认按钮禁用且不派发 confirm', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true, showFooter: true, loading: true } })
    await nextTick()

    const primary = document.body.querySelector<HTMLButtonElement>('.kf-drawer__btn--primary')
    expect(primary?.disabled).toBe(true)
    expect(primary?.textContent).toContain('处理中')
    primary?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('卸载后解除 body 滚动锁', async () => {
    const wrapper = mount(KfDrawer, { props: { open: true } })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('KfPopover', () => {
  it('默认关闭，点击触发元素后打开并 teleport 面板', async () => {
    const wrapper = mount(KfPopover, {
      props: { ariaLabel: '筛选' },
      slots: { trigger: '<button class="t" type="button">打开</button>', default: '<div class="body">内容</div>' },
    })

    expect(bodyPanel('.kf-popover__panel')).toBeNull()

    await wrapper.get('.t').trigger('click')
    await nextTick()

    const panel = bodyPanel('.kf-popover__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-label')).toBe('筛选')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('再次点击触发元素关闭', async () => {
    const wrapper = mount(KfPopover, {
      slots: { trigger: '<button class="t" type="button">打开</button>', default: '<div>内容</div>' },
    })
    await wrapper.get('.t').trigger('click')
    await nextTick()
    await wrapper.get('.t').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(bodyPanel('.kf-popover__panel')).toBeNull()
  })

  it('外部 mousedown 关闭，内部不关闭', async () => {
    const wrapper = mount(KfPopover, {
      slots: { trigger: '<button class="t" type="button">打开</button>', default: '<button class="inner">内部</button>' },
    })
    await wrapper.get('.t').trigger('click')
    await nextTick()

    bodyPanel('.inner')?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(bodyPanel('.kf-popover__panel')).not.toBeNull()

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('Esc 关闭面板并停止冒泡', async () => {
    const wrapper = mount(KfPopover, {
      slots: { trigger: '<button class="t" type="button">打开</button>', default: '<div>内容</div>' },
    })
    await wrapper.get('.t').trigger('click')
    await nextTick()

    bodyPanel('.kf-popover__panel')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('受控模式下点击只发事件，面板跟随 props', async () => {
    const wrapper = mount(KfPopover, {
      props: { open: false },
      slots: { trigger: '<button class="t" type="button">打开</button>', default: '<div>内容</div>' },
    })
    await wrapper.get('.t').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(bodyPanel('.kf-popover__panel')).toBeNull()

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(bodyPanel('.kf-popover__panel')).not.toBeNull()
  })

  it('disabled 时不响应触发', async () => {
    const wrapper = mount(KfPopover, {
      props: { disabled: true },
      slots: { trigger: '<button class="t" type="button">打开</button>' },
    })
    await wrapper.get('.t').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })
})
