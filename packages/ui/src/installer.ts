/**
 * KfPlugin —— 全局注册插件（可选能力，不影响按需导入）。
 *
 * 为什么必须存在：Vue 只有在**已注册**的前提下才能把 `<kf-button>` 解析到 `KfButton`
 * （resolveComponent 会依次尝试 kebab → camelize → capitalize）。仅 `import { KfButton }`
 * 而不注册时，模板里写 kebab 标签会得到 "Failed to resolve component"。
 *
 * 为什么不做自动注册：自动扫描目录会引入构建期副作用、破坏 tree-shaking，
 * 也让「用了哪些组件」变得不可见。注册表显式声明，代价只有一行。
 *
 * Vue 的组件名解析规则保证：注册 `KfButton` 后，`<kf-button>` 与 `<KfButton>` 都可用。
 */
import type { App, Component, Plugin } from 'vue'
import { KfButton, KfCheckbox, KfIcon, KfInput } from './components/index'

/** 参与全局注册的组件表（唯一事实来源，新增组件只改这里） */
export const KF_COMPONENTS = {
  KfButton,
  KfIcon,
  KfInput,
  KfCheckbox,
} as const

export type KfComponentName = keyof typeof KF_COMPONENTS

/** 全局注册后可直接在模板中使用的标签名（kebab-case） */
export const KF_TAGS: string[] = ['kf-button', 'kf-icon', 'kf-input', 'kf-checkbox']

export const KfPlugin: Plugin = {
  install(app: App): void {
    for (const [name, component] of Object.entries(KF_COMPONENTS)) {
      app.component(name, component as Component)
    }
  },
}

export default KfPlugin
