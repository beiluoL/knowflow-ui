export type KfDrawerPlacement = 'right' | 'left'

export interface KfDrawerProps {
  open?: boolean
  title?: string
  description?: string
  placement?: KfDrawerPlacement
  /** 宽度：数字按 px，字符串原样使用（如 '60%'） */
  width?: number | string
  closeOnEsc?: boolean
  closeOnOverlay?: boolean
  /** 强模态：点击遮罩与 Esc 都不关闭（如正在提交） */
  persistent?: boolean
  loading?: boolean
  showFooter?: boolean
  confirmLabel?: string
  cancelLabel?: string
  ariaLabel?: string
}

export interface KfDrawerEmits {
  'update:open': [open: boolean]
  close: []
  confirm: []
  cancel: []
}

export interface KfDrawerSlots {
  default?: () => unknown
  header?: () => unknown
  footer?: () => unknown
}
