export type KfStatus =
  | 'online'
  | 'offline'
  | 'busy'
  | 'away'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'

export type KfStatusIndicatorSize = 'sm' | 'md'

export interface KfStatusIndicatorProps {
  status?: KfStatus
  /** 状态文字；不传时使用默认中文文案（始终有文字，不靠颜色单独表达） */
  label?: string
  /** 只显示圆点（此时必须自己保证外部有文字说明） */
  dotOnly?: boolean
  /** 呼吸动画，仅用于「进行中」 */
  pulse?: boolean
  size?: KfStatusIndicatorSize
}

export interface KfStatusIndicatorSlots {
  /** 覆盖状态文字 */
  default?: () => unknown
}
