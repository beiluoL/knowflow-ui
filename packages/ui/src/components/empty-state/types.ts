export type KfEmptyStateVariant = 'default' | 'info' | 'warning' | 'success'

export interface KfEmptyStateProps {
  /** 图标名（内置名或 registerIcon 注册名） */
  icon?: string
  /** ① 发生了什么 */
  title: string
  /** ② 为什么为空；也可用默认插槽写富文本 */
  description?: string
  variant?: KfEmptyStateVariant
}

export interface KfEmptyStateSlots {
  /** 覆盖 description 区域 */
  default?: () => unknown
  /** ③ 下一步怎么办：放按钮，不在组件内发起任何请求 */
  action?: () => unknown
}
