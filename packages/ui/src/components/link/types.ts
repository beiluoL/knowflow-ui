export type KfLinkUnderline = 'always' | 'hover' | 'never'
export type KfLinkTone = 'default' | 'primary' | 'muted'

export interface KfLinkProps {
  /** 目标地址；缺省时渲染为 button 语义（用于纯交互） */
  href?: string
  /** 新窗口打开时自动补 rel="noopener noreferrer" */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** 外链图标标记（仅视觉提示，不影响行为） */
  external?: boolean
  disabled?: boolean
  underline?: KfLinkUnderline
  tone?: KfLinkTone
  /** 前置图标名 */
  iconName?: string
}

export interface KfLinkEmits {
  click: [event: MouseEvent]
}

export interface KfLinkSlots {
  default?: () => unknown
}
