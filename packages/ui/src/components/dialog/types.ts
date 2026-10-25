export type KfDialogVariant = 'default' | 'danger' | 'warning' | 'success' | 'info'
/** 尺寸预设；也可直接传任意 CSS 宽度 */
export type KfDialogWidth = 'sm' | 'md' | 'lg' | 'xl' | (string & {})

export interface KfDialogProps {
  /** 是否打开（v-model:open） */
  open?: boolean
  title?: string
  /** 标题下的一行说明 */
  description?: string
  /** 正文段落（也可用默认插槽） */
  message?: string
  variant?: KfDialogVariant
  /** 覆盖左侧图标 */
  icon?: string
  confirmText?: string
  cancelText?: string
  /** 确认/取消按钮 loading 态 */
  loading?: boolean
  /** 禁用确认按钮 */
  disabled?: boolean
  /** 表单错误提示（role=alert） */
  error?: string
  width?: KfDialogWidth
  /** 点遮罩是否关闭 */
  closeOnOverlay?: boolean
  /** Esc 是否关闭 */
  closeOnEsc?: boolean
  /** 不显示右上角关闭按钮，也不响应遮罩关闭 */
  persistent?: boolean
  /** 显示取消按钮 */
  showCancel?: boolean
  /** 隐藏整个底部操作区（自己用 #footer 时用） */
  hideFooter?: boolean
  /** 内容超高时内部滚动 */
  scrollable?: boolean
  /** center 居中弹窗 / right 右侧抽屉 */
  placement?: 'center' | 'right'
  /** 紧凑的确认型布局（无图标圆底） */
  confirmation?: boolean
}

export interface KfDialogEmits {
  'update:open': [open: boolean]
  confirm: [value: true]
  cancel: []
  /** 打开动画结束 */
  opened: []
  /** 关闭动画结束 */
  closed: []
}

export interface KfDialogSlots {
  default?: () => unknown
  icon?: () => unknown
  footer?: () => unknown
}
