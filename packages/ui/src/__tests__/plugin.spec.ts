/**
 * 全局注册 / 模板标签解析 / 与第三方库共存。
 *
 * 关键点：Vue 只在组件「已注册」时才能把 <kf-button> 解析到 KfButton；
 * 注册 KfButton 后，<kf-button> 与 <KfButton> 都应可用。
 */
import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import Coexistence from './fixtures/Coexistence.vue'
import GlobalTags from './fixtures/GlobalTags.vue'
import KebabTags from './fixtures/KebabTags.vue'
import KfButton from '../components/button/KfButton.vue'
import KfInput from '../components/input/KfInput.vue'
import { KF_COMPONENTS, KF_TAGS, KfPlugin } from '../index'

const emptyApp = () => createApp(defineComponent({ render: () => null }))

/** 模拟 Element Plus：同名语义的 el-* 组件，验证两套库可同时注册与渲染 */
const ElButton = defineComponent({
  name: 'ElButton',
  setup(_props, { slots }) {
    return () => h('button', { class: 'el-button' }, slots.default?.())
  },
})

const ElInput = defineComponent({
  name: 'ElInput',
  props: { modelValue: { type: String, default: '' } },
  setup(props) {
    return () => h('input', { class: 'el-input', value: props.modelValue })
  },
})

describe('KfPlugin 全局注册', () => {
  it('install 注册全部公共组件（不含内部组件）', () => {
    const app = emptyApp()
    app.use(KfPlugin)

    for (const name of Object.keys(KF_COMPONENTS)) {
      expect(app.component(name), `未注册 ${name}`).toBeTruthy()
    }
    expect(app.component('KfButton')).toBe(KfButton)
    // v0.2.0 起 KfFormField 正式公开：宿主自定义控件需要同一条 label/help/error 轨道
    expect(app.component('KfFormField')).toBeTruthy()
  })

  it('重复 install 不产生重复注册或报警（Vue 自身已做幂等）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = emptyApp()
    expect(() => {
      app.use(KfPlugin)
      app.use(KfPlugin)
    }).not.toThrow()

    // Vue 只提示“已应用”，不会重复执行 install
    expect(warn.mock.calls.flat().join(' ')).toContain('already been applied')
    expect(
      Object.keys(app._context.components).filter((key) => key.startsWith('Kf')),
    ).toHaveLength(Object.keys(KF_COMPONENTS).length)
  })

  it('注册后 kebab 与 PascalCase 两种标签都能解析', () => {
    const wrapper = mount(GlobalTags, { global: { plugins: [KfPlugin] } })

    // <kf-button> 与 <KfButton> 各一个
    expect(wrapper.findAll('.kf-button')).toHaveLength(2)
    expect(wrapper.find('[data-probe="pascal"]').classes()).toContain('kf-button')
    expect(wrapper.find('.kf-input__control').exists()).toBe(true)
    expect(wrapper.find('.kf-checkbox').exists()).toBe(true)
    expect(wrapper.findAll('.kf-icon').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('全局按钮')
  })

  it('全局注册后的 kebab 标签仍保持 v-model 与事件语义', async () => {
    const wrapper = mount(GlobalTags, { global: { plugins: [KfPlugin] } })
    const vm = wrapper.vm as unknown as { text: string; agree: boolean }

    await wrapper.get('.kf-input__control').setValue('你好')
    expect(vm.text).toBe('你好')

    await wrapper.get('.kf-checkbox__input').setValue(true)
    expect(vm.agree).toBe(true)

    await wrapper.get('.kf-button').trigger('click')
    expect(wrapper.emitted('hit')).toHaveLength(1)
  })

  it('未 install 时 kebab 标签无法解析（证明注册是必需的，而非碰巧可用）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(GlobalTags)

    expect(wrapper.find('.kf-button').exists()).toBe(false)
    expect(warn.mock.calls.flat().join(' ')).toContain('Failed to resolve component: kf-button')
  })

  it('KF_TAGS 与注册表一一对应', () => {
    const kebab = Object.keys(KF_COMPONENTS).map((name) =>
      name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
    )
    expect(kebab.sort()).toEqual([...KF_TAGS].sort())
  })
})

describe('按需导入（不使用插件）', () => {
  it('直接 import 组件即可渲染，无需全局注册', () => {
    const wrapper = mount(KfButton, { props: { variant: 'primary' }, slots: { default: '直接挂载' } })
    expect(wrapper.classes()).toContain('kf-button')
    expect(wrapper.classes()).toContain('kf-button--primary')
    expect(wrapper.text()).toBe('直接挂载')
  })

  it('PascalCase 导入 + kebab-case 标签可匹配（SFC 模板，无插件）', async () => {
    const wrapper = mount(KebabTags)
    const vm = wrapper.vm as unknown as { text: string }

    expect(wrapper.get('.kf-button').text()).toBe('kebab 标签')
    expect(wrapper.find('.kf-input__control').exists()).toBe(true)

    await wrapper.get('.kf-input__control').setValue('kebab-v-model')
    expect(vm.text).toBe('kebab-v-model')
  })

  it('直接挂载的 KfInput 仍具备 v-model 语义', async () => {
    const wrapper = mount(KfInput, { props: { modelValue: '' } })
    await wrapper.get('.kf-input__control').setValue('abc')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['abc'])
  })
})

describe('与 Element Plus 共存', () => {
  const global = { plugins: [KfPlugin], components: { ElButton, ElInput } }

  it('两套库的组件同时注册且互不覆盖', () => {
    const app = emptyApp()
    app.use(KfPlugin)
    app.component('ElButton', ElButton)
    app.component('ElInput', ElInput)

    expect(app.component('KfButton')).toBe(KfButton)
    expect(app.component('ElButton')).toBe(ElButton)
  })

  it('同一页面同时渲染，类名与 DOM 结构彼此隔离', () => {
    const wrapper = mount(Coexistence, { global })

    const kfButton = wrapper.get('.kf-button')
    const elButton = wrapper.get('.el-button')

    expect(kfButton.classes()).not.toContain('el-button')
    expect(elButton.classes()).not.toContain('kf-button')
    expect(elButton.classes().some((name) => name.startsWith('kf-'))).toBe(false)
    expect(kfButton.classes().some((name) => name.startsWith('el-'))).toBe(false)

    expect(wrapper.find('.el-input').attributes('value')).toBe('x')
    expect(wrapper.get('.kf-input__control').attributes('value')).toBe('y')
  })

  it('Element Plus 组件不受 kf- 样式表影响（无裸元素选择器）', () => {
    // 结构性证明：组件库样式全部以 .kf- 开头或为 keyframes/属性选择器，
    // 不存在 button/input 这类裸元素选择器，因此不会命中 el-* 组件内部。
    const wrapper = mount(Coexistence, { global })
    const elButton = wrapper.get('.el-button')
    expect(elButton.element.tagName).toBe('BUTTON')
    expect(elButton.classes()).toEqual(['el-button'])
  })
})
