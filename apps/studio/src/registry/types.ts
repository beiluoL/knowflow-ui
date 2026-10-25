/**
 * Studio 注册表类型。
 *
 * 与 V5 的区别：`implementationStatus` 从「V5 当时的接入情况」改为
 * **v0.2.0 重新核算**的三档，真实组件指向本仓库 packages 内的实现，
 * 不再指向原项目源码路径。
 */

export type EntryCategory =
  | '基础组件 P0'
  | '工作台组件 P1'
  | 'AI与学习组件'
  | '扩展组件'
  | '其他已有组件'

/** real = 已接入 v0.2.0 真实组件；demo = 仅本地演示；missing = 未实现 */
export type EntryStatus = 'real' | 'demo' | 'missing'

export interface PropSpec {
  name: string
  type: string
  default: unknown
  /** 源码里的默认语义（无默认值时说明来源） */
  sourceDefault: string
  required: boolean
  description: string
  options?: string[]
  /** 是否允许在右侧面板实时调节 */
  editable: boolean
}

export interface PlaygroundEntry {
  id: string
  name: string
  title: string
  category: EntryCategory
  status: EntryStatus
  /** 真实组件名（status=real 时给出，复合场景取首个作为主组件） */
  component?: string
  /** 该条目涉及的全部真实组件（复合条目如 AIChat = 消息 + 输入区） */
  components: string[]
  /** 所属包：ui / ai / learning；demo/missing 为空 */
  packageName?: 'ui' | 'ai' | 'learning'
  props: PropSpec[]
  events: string[]
  slots: string[]
  variants: string[]
  description: string
  /** 本仓库内的源码位置（不是原项目路径） */
  source: string
  a11y: string
  designSpecs: Record<string, string | number>
  /** V5 是否提供了「交互参考」Story（用于保持 153 Story 的历史覆盖） */
  interactiveStory: boolean
  /** Demo/未实现条目的替代说明 */
  fallback?: string
}

export type StoryCategory =
  | 'Basic'
  | 'Variants'
  | 'Sizes'
  | 'States'
  | 'Interactive'
  | 'Form'
  | 'Edge Cases'
  | 'Accessibility'

export interface PlaygroundStory {
  storyId: string
  componentId: string
  title: string
  category: StoryCategory
  /** 该 Story 的初始 Props（只影响预览，不改注册表） */
  initialProps: Record<string, unknown>
  /** 该 Story 的插槽文本（如 Button 的长标签） */
  slots: Record<string, string>
  /** 预览用的本地 Fixture 开关 */
  fixture: Record<string, unknown>
  description: string
  /** 期望事件（用于 API/质量面板说明） */
  expectedEvents: string[]
  interaction: string[]
  viewport: Array<'desktop' | 'tablet' | 'mobile'>
  a11y: string
}
