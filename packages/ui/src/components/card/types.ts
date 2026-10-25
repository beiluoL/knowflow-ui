export type KfCardVariant = 'default' | 'flat' | 'outlined' | 'elevated'
export type KfCardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface KfCardProps {
  /** 视觉重量：default 带轻阴影，flat 无阴影，outlined 透明底，elevated 强阴影 */
  variant?: KfCardVariant
  /** 内边距 */
  padding?: KfCardPadding
  /** 悬停时抬升（仅在有交互意图时使用） */
  hoverable?: boolean
}

export interface KfCardSlots {
  default?: () => unknown
  header?: () => unknown
  footer?: () => unknown
}
