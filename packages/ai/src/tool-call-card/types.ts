export type KfToolCallStatus = 'pending' | 'running' | 'success' | 'error'

/** 审批状态由宿主驱动；组件只负责展示与发出 approve / reject */
export type KfToolApproval = 'none' | 'requested' | 'approved' | 'rejected'

export interface KfToolCallCardProps {
  /** 工具名（如 search_docs、run_sql） */
  name: string
  /** 可读标题；缺省用工具名 */
  title?: string
  status?: KfToolCallStatus
  approval?: KfToolApproval
  /** 入参：已序列化的字符串（组件不做 JSON.stringify，避免双序列化） */
  args?: string
  /** 返回结果文本 */
  result?: string
  /** 错误信息（宿主提供；组件不加工） */
  error?: string
  duration?: string
  defaultOpen?: boolean
  approveLabel?: string
  rejectLabel?: string
  ariaLabel?: string
}

export interface KfToolCallCardEmits {
  approve: []
  reject: []
  toggle: [open: boolean]
}

export interface KfToolCallCardSlots {
  args?: () => unknown
  result?: () => unknown
  actions?: () => unknown
}
