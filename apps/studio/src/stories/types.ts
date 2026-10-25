/**
 * Studio 的目录/属性模型。
 * 目的：让「文档、预览、代码片段」共用一份声明，避免三者各写一遍导致漂移。
 */

export type CategoryId =
  | 'foundations'
  | 'forms'
  | 'data-display'
  | 'navigation'
  | 'overlay'
  | 'ai'
  | 'learning'
  | 'tokens'

export interface CategoryMeta {
  id: CategoryId
  title: string
  description: string
}

export type PropControl = 'boolean' | 'select' | 'text' | 'number'

export interface PropOption {
  label: string
  value: string | number | boolean
}

export interface PropSpec {
  /** 组件 prop 名 */
  name: string
  control: PropControl
  /** 控件默认值（同时作为 Studio 初始状态） */
  defaultValue: string | number | boolean
  options?: PropOption[]
  description: string
}

export type PropState = Record<string, string | number | boolean>

export interface StoryExample {
  title: string
  description: string
  /** 可直接复制的 Vue 代码 */
  code: string
}

export interface GalleryItem {
  label: string
  /** 覆盖在默认状态之上的局部状态 */
  state: PropState
}

export interface GalleryBlock {
  title: string
  description: string
  items: GalleryItem[]
}

/** 命名规范展示（与 NAMING_CONVENTIONS.md 一一对应） */
export interface NamingSpec {
  /** JS / TS 组件名 */
  js: string
  /** Vue 模板标签 */
  tag: string
  /** CSS 类名前缀与 BEM 形态 */
  css: string
  /** 导出的 Props / Emits 类型 */
  types: string
}

export interface EventSpec {
  name: string
  /** 回调参数签名 */
  payload: string
  description: string
}

export interface SlotSpec {
  name: string
  description: string
}

export interface ComponentStory {
  id: 'button' | 'icon' | 'input' | 'checkbox'
  title: string
  subtitle: string
  category: CategoryId
  status: 'implemented'
  description: string
  /** 新包内源码路径（相对 knowflow-ui 根目录） */
  sourcePath: string
  /** 原始 KnowFlow 来源（迁移证据） */
  migratedFrom: string
  /** 真实测量目标选择器（相对主预览容器）：必须指向组件自身，而不是外层包装 */
  measureSelector: string
  /** 命名规范（JS 名 / 模板标签 / CSS 前缀 / 类型名） */
  naming: NamingSpec
  /** 对外事件（名称遵循 Vue 约定，无 kf 前缀） */
  events: EventSpec[]
  /** 对外插槽 */
  slots: SlotSpec[]
  props: PropSpec[]
  examples: StoryExample[]
  /** 变体 / 尺寸 / 状态矩阵：用同一份 preview 渲染器渲染，避免第二套演示实现 */
  gallery: GalleryBlock[]
  a11y: string[]
  specs: { label: string; value: string }[]
}
