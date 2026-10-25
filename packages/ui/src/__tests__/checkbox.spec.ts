import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfCheckbox from '../components/checkbox/KfCheckbox.vue'

describe('KfCheckbox', () => {
  it('默认渲染 label 容器，label for 指向 input id', () => {
    const wrapper = mount(KfCheckbox, { props: { modelValue: false, label: '同意条款' } })
    const root = wrapper.get('.kf-checkbox')
    expect(root.element.tagName).toBe('LABEL')
    const input = wrapper.get('input[type="checkbox"]')
    expect(root.attributes('for')).toBe(input.attributes('id'))
    expect(wrapper.get('.kf-checkbox-label').text()).toBe('同意条款')
  })

  it('v-model 未选中时 input 不 checked；选中时 checked', () => {
    const off = mount(KfCheckbox, { props: { modelValue: false, label: 'x' } })
    expect((off.get('input').element as HTMLInputElement).checked).toBe(false)

    const on = mount(KfCheckbox, { props: { modelValue: true, label: 'x' } })
    expect((on.get('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('点击切换后派发 update:modelValue 与 change', async () => {
    const wrapper = mount(KfCheckbox, { props: { modelValue: false, label: 'x' } })
    const input = wrapper.get('input')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('native-change')).toHaveLength(1)
  })

  it('indeterminate 设置原生属性与 aria-checked="mixed"', () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: false, indeterminate: true, label: '部分选中' },
    })
    const input = wrapper.get('input')
    expect((input.element as HTMLInputElement).indeterminate).toBe(true)
    expect(input.attributes('aria-checked')).toBe('mixed')
    expect(wrapper.get('.kf-checkbox-box').classes()).toContain('kf-checkbox-box-mixed')
    // 半选态显示 minus 而不是 check
    expect(wrapper.find('.kf-checkbox-mark').exists()).toBe(true)
  })

  it('disabled 时不派发更新，并渲染禁用类', async () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: false, disabled: true, label: 'x' },
    })
    const input = wrapper.get('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(wrapper.get('.kf-checkbox').classes()).toContain('kf-checkbox--disabled')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('checked 受控优先于 modelValue', () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: false, checked: true, label: 'x' },
    })
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('as="span" 时根节点不是 label（避免嵌套 label）', () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: false, as: 'span', label: 'x' },
    })
    const root = wrapper.get('.kf-checkbox')
    expect(root.element.tagName).toBe('SPAN')
    expect(root.attributes('for')).toBeUndefined()
    expect(root.classes()).toContain('kf-checkbox--embedded')
  })

  it('data-* 落在根节点，其余属性透传给原生 input', () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: false, label: 'x' },
      attrs: { 'data-testid': 'cb', name: 'agree', value: 'yes' },
    })
    expect(wrapper.get('.kf-checkbox').attributes('data-testid')).toBe('cb')
    expect(wrapper.get('input').attributes('name')).toBe('agree')
    expect(wrapper.get('input').attributes('value')).toBe('yes')
  })

  it('textarea 使用 true-value / false-value 时按原生语义工作', async () => {
    const wrapper = mount(KfCheckbox, {
      props: { modelValue: 'off', trueValue: 'on', falseValue: 'off', label: 'x' },
    })
    const input = wrapper.get('input')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['on'])
  })

  it('无 label 且无插槽时不渲染标签节点', () => {
    const wrapper = mount(KfCheckbox, { props: { modelValue: false } })
    expect(wrapper.find('.kf-checkbox-label').exists()).toBe(false)
  })
})
