export type KfChatRole = 'user' | 'assistant' | 'system'
export type KfChatMessageStatus = 'sending' | 'sent' | 'error'

export interface KfChatMessageAction {
  key: string
  label: string
  iconName?: string
  disabled?: boolean
}

export interface KfChatMessageProps {
  role?: KfChatRole
  /** 发言人名称；不传时按 role 使用默认中文名 */
  name?: string
  avatarSrc?: string
  /** 头像图标名（无头像图时使用） */
  avatarIcon?: string
  /** 时间文本，组件不做格式化（避免时区/语言耦合） */
  timestamp?: string
  status?: KfChatMessageStatus
  /** 气泡下方的操作按钮（复制、重试…） */
  actions?: KfChatMessageAction[]
  /** 正在生成：显示打字指示 */
  pending?: boolean
  /** 无 name 时的可访问标签 */
  ariaLabel?: string
}

export interface KfChatMessageEmits {
  action: [key: string]
}

export interface KfChatMessageSlots {
  default?: () => unknown
  avatar?: () => unknown
  actions?: () => unknown
  footer?: () => unknown
}
