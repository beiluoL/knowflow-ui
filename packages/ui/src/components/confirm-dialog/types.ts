import type { KfDialogVariant, KfDialogWidth } from '../dialog/types'

export interface KfConfirmDialogProps {
  open?: boolean
  title?: string
  /** 标题下的一行说明 */
  description?: string
  /** 正文段落 */
  message?: string
  variant?: KfDialogVariant
  icon?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  disabled?: boolean
  error?: string
  width?: KfDialogWidth
  persistent?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  placement?: 'center' | 'right'
  showCancel?: boolean
}

export interface KfConfirmDialogEmits {
  'update:open': [open: boolean]
  confirm: [value: true]
  cancel: []
}

export interface KfConfirmDialogSlots {
  default?: () => unknown
  icon?: () => unknown
  footer?: () => unknown
}
