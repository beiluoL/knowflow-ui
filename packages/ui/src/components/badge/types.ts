/**
 * KfBadge 类型。
 *
 * 变体语义沿用 KnowFlow 的历史映射（learning / review / ai 是业务语义，
 * 但这里只是「颜色语义」，不引入任何业务判断）。
 */
export type KfBadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'learning'
  | 'review'
  | 'ai'
  | 'neutral'

export type KfBadgeSize = 'sm' | 'md'

export interface KfBadgeProps {
  /** 语义配色 */
  variant?: KfBadgeVariant
  /** 尺寸：sm 20px / md 22px 视觉高度 */
  size?: KfBadgeSize
  /** 前置状态圆点（纯装饰） */
  dot?: boolean
  /** 前置图标名（内置名或 registerIcon 注册的自定义名） */
  iconName?: string
}

export interface KfBadgeSlots {
  default?: () => unknown
}
