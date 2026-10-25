export type KfAlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface KfAlertProps {
  /** 语义风格：warning / danger 使用 role="alert"，其余 role="status" */
  variant?: KfAlertVariant
  /** 标题（可选；只有 description 时用单行排版） */
  title?: string
  /** 描述文本；也可用默认插槽放富内容 */
  description?: string
  /** 显示左侧图标 */
  showIcon?: boolean
  /** 覆盖默认图标名 */
  iconName?: string
  /** 显示关闭按钮；点击只 emit('close')，不自行隐藏 */
  closable?: boolean
  /** 关闭按钮可访问名称 */
  closeLabel?: string
}

export interface KfAlertEmits {
  close: [event: MouseEvent]
}

export interface KfAlertSlots {
  default?: () => unknown
  icon?: () => unknown
  action?: () => unknown
}
