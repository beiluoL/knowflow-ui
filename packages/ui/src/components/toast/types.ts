export type KfToastType = 'info' | 'success' | 'warning' | 'error'
export type KfToastPlacement = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface KfToastItem {
  id: string
  message: string
  type?: KfToastType
  /** 标题（可选，用于有多行的通知） */
  title?: string
  /** 单位毫秒；0 表示不自动关闭（由 useToast 消费，组件本身不设计时器） */
  duration?: number
}

export interface KfToastProps {
  items: KfToastItem[]
  placement?: KfToastPlacement
  /** 单条最大宽度 */
  maxWidth?: number
}

export interface KfToastEmits {
  dismiss: [id: string]
}

export interface KfToastSlots {
  /** 自定义单条内容；作用域提供 item */
  default?: (scope: { item: KfToastItem }) => unknown
}
