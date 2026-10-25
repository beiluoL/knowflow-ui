export type KfExecutionState = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'cancelled'

export interface KfExecutionStatusProps {
  status?: KfExecutionState
  /** 覆盖默认状态文案 */
  label?: string
  /** 次要说明：当前步骤、耗时等 */
  description?: string
  /** 0–100；传 null / undefined 表示进度未知（只显示不确定动效） */
  progress?: number | null
  /** 是否显示取消按钮（仅运行/排队态生效） */
  cancellable?: boolean
  cancelLabel?: string
  size?: 'sm' | 'md'
  /** 单行紧凑布局 */
  inline?: boolean
}

export interface KfExecutionStatusEmits {
  cancel: []
}

export interface KfExecutionStatusSlots {
  default?: () => unknown
  actions?: () => unknown
}
