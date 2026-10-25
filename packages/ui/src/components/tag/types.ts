export type KfTagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
export type KfTagSize = 'sm' | 'md'

export interface KfTagProps {
  /** 语义配色 */
  variant?: KfTagVariant
  size?: KfTagSize
  /** 显示关闭按钮；点击后 emit('close')，组件自身不删除数据 */
  closable?: boolean
  disabled?: boolean
  /** 关闭按钮的可访问名称（含标签文字时不必传） */
  closeLabel?: string
}

export interface KfTagEmits {
  close: [event: MouseEvent]
}

export interface KfTagSlots {
  default?: () => unknown
}
