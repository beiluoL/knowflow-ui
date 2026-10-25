import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfInput from '../components/input/KfInput.vue'

describe('KfInput', () => {
  it('label 与 input 通过 for/id 关联', () => {
    const wrapper = mount(KfInput, { props: { label: '邮箱地址' } })
    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.text()).toContain('邮箱地址')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('输入触发 update:modelValue（字符串）', async () => {
    const wrapper = mount(KfInput, { props: { modelValue: '' } })
    const input = wrapper.get('input')
    await input.setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['hello'])
  })

  it('外部 id 覆盖自动生成 id，并保持 label 关联', () => {
    const wrapper = mount(KfInput, { props: { label: '昵称' }, attrs: { id: 'nickname' } })
    expect(wrapper.get('input').attributes('id')).toBe('nickname')
    expect(wrapper.get('label').attributes('for')).toBe('nickname')
  })

  it('错误态：aria-invalid + aria-describedby 指向 error 节点', () => {
    const wrapper = mount(KfInput, { props: { label: '邮箱', error: '格式不正确' } })
    const input = wrapper.get('input')
    const describedBy = input.attributes('aria-describedby') ?? ''
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(describedBy).toContain('-error')
    expect(wrapper.get('.kf-form-field__error').text()).toBe('格式不正确')
    expect(wrapper.get('.kf-form-field__error').attributes('id')).toBe(describedBy.trim())
  })

  it('help 文本进入 aria-describedby', () => {
    const wrapper = mount(KfInput, { props: { label: '邀请码', help: '区分大小写' } })
    const input = wrapper.get('input')
    expect(input.attributes('aria-describedby')).toContain('-help')
    expect(wrapper.get('.kf-form-field__help').text()).toBe('区分大小写')
  })

  it('required / disabled / readonly 透传原生属性', () => {
    const wrapper = mount(KfInput, {
      props: { label: '字段', required: true, disabled: true, readonly: true },
    })
    const input = wrapper.get('input')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('readonly')).toBeDefined()
    expect(wrapper.get('.kf-input').classes()).toContain('kf-input--disabled')
  })

  it('原生属性透传（name / maxlength / autocomplete / placeholder）', () => {
    const wrapper = mount(KfInput, {
      props: { placeholder: '请输入' },
      attrs: { name: 'email', maxlength: '32', autocomplete: 'email' },
    })
    const input = wrapper.get('input')
    expect(input.attributes('name')).toBe('email')
    expect(input.attributes('maxlength')).toBe('32')
    expect(input.attributes('autocomplete')).toBe('email')
    expect(input.attributes('placeholder')).toBe('请输入')
  })

  it('class 落在表单根节点而不是 input 上', () => {
    const wrapper = mount(KfInput, { props: { label: 'x' }, attrs: { class: 'my-field' } })
    expect(wrapper.get('.kf-form-field').classes()).toContain('my-field')
    expect(wrapper.get('input').classes()).not.toContain('my-field')
  })

  it('输入法组合期间不 emit，组合结束才同步', async () => {
    const wrapper = mount(KfInput, { props: { modelValue: '' } })
    const input = wrapper.get('input')

    await input.trigger('compositionstart')
    await input.setValue('nihao')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await input.trigger('compositionend')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['nihao'])
  })

  it('focus / blur 事件透出', async () => {
    const wrapper = mount(KfInput, { props: { label: 'x' } })
    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('前置/后置图标按需渲染', () => {
    const wrapper = mount(KfInput, {
      props: { label: '搜索', prefixIconName: 'search', suffixIconName: 'check' },
    })
    expect(wrapper.findAll('.kf-input__icon')).toHaveLength(2)
  })

  it('type 透传', () => {
    const wrapper = mount(KfInput, { props: { label: '密码', type: 'password' } })
    expect(wrapper.get('input').attributes('type')).toBe('password')
  })
})
