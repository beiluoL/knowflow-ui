import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KfButton from '../components/button/KfButton.vue'

describe('KfButton', () => {
  it('渲染默认插槽文本，默认为 primary / md / type=button', () => {
    const wrapper = mount(KfButton, { slots: { default: '保存' } })
    const button = wrapper.get('button')
    expect(button.text()).toBe('保存')
    expect(button.classes()).toContain('kf-button--primary')
    expect(button.classes()).toContain('kf-button--md')
    expect(button.attributes('type')).toBe('button')
  })

  it('三档尺寸映射到独立类名', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(KfButton, { props: { size }, slots: { default: 'x' } })
      expect(wrapper.get('button').classes()).toContain(`kf-button--${size}`)
    }
  })

  it('六种变体都渲染对应类名', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'text', 'danger'] as const
    for (const variant of variants) {
      const wrapper = mount(KfButton, { props: { variant }, slots: { default: 'x' } })
      expect(wrapper.get('button').classes()).toContain(`kf-button--${variant}`)
    }
  })

  it('disabled 时设置原生 disabled 且不派发 click', async () => {
    const onClick = vi.fn()
    const wrapper = mount(KfButton, {
      props: { disabled: true, onClick },
      slots: { default: 'x' },
    })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading 时 aria-busy + 禁用 + 旋转图标', () => {
    const wrapper = mount(KfButton, { props: { loading: true }, slots: { default: '保存' } })
    const button = wrapper.get('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.kf-button__spinner').exists()).toBe(true)
    // 无 iconName 时走覆盖式加载态，保留标签宽度
    expect(button.classes()).toContain('kf-button--loading-text')
  })

  it('点击正常派发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(KfButton, { props: { onClick }, slots: { default: 'x' } })
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('图标位置决定 icon 容器的排列类名', () => {
    const left = mount(KfButton, { props: { iconName: 'check' }, slots: { default: 'x' } })
    expect(left.get('.kf-button__icon').classes()).not.toContain('kf-button__icon--trailing')

    const right = mount(KfButton, {
      props: { iconName: 'check', iconPosition: 'right' },
      slots: { default: 'x' },
    })
    expect(right.get('.kf-button__icon').classes()).toContain('kf-button__icon--trailing')
  })

  it('iconOnly 时不渲染标签文本，并把 aria-label 传给原生按钮', () => {
    const wrapper = mount(KfButton, {
      props: { iconOnly: true, iconName: 'plus', ariaLabel: '新建' },
      slots: { default: '不应出现' },
    })
    expect(wrapper.get('button').classes()).toContain('kf-button--icon-only')
    expect(wrapper.find('.kf-button__label').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-label')).toBe('新建')
  })

  it('block 撑满容器', () => {
    const wrapper = mount(KfButton, { props: { block: true }, slots: { default: 'x' } })
    expect(wrapper.get('button').classes()).toContain('kf-button--block')
  })

  it('图标尺寸：md 为 16px，lg 为 18px', () => {
    const md = mount(KfButton, { props: { iconName: 'check' }, slots: { default: 'x' } })
    expect(md.get('.kf-button__icon svg').attributes('width')).toBe('16')

    const lg = mount(KfButton, { props: { iconName: 'check', size: 'lg' }, slots: { default: 'x' } })
    expect(lg.get('.kf-button__icon svg').attributes('width')).toBe('18')
  })

  /**
   * props/emits 从 types.ts 导入后仍必须生成运行时 emits 声明。
   * 若 emit 未声明，父级 onClick 会落进 attrs 并作为原生监听器再触发一次，
   * 同时绕过 disabled/loading 守卫 —— 这里用调用次数把该回归钉死。
   */
  it('click 只触发一次（emits 已在运行时声明，不重复冒泡）', async () => {
    const onClick = vi.fn()
    const wrapper = mount(KfButton, { props: { onClick }, slots: { default: '确定' } })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('禁用/加载态即使被点击也不触发 click', async () => {
    const onDisabled = vi.fn()
    const disabled = mount(KfButton, {
      props: { disabled: true, onClick: onDisabled },
      slots: { default: '确定' },
    })
    await disabled.trigger('click')
    expect(onDisabled).not.toHaveBeenCalled()

    const onLoading = vi.fn()
    const loading = mount(KfButton, {
      props: { loading: true, onClick: onLoading },
      slots: { default: '保存' },
    })
    await loading.trigger('click')
    expect(onLoading).not.toHaveBeenCalled()
  })
})
