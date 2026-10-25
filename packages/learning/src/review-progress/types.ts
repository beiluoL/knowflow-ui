export interface KfReviewBreakdownItem {
  label: string
  value: number
}

export interface KfReviewProgressProps {
  /** 本轮计划复习总数 */
  total?: number
  /** 已完成数量 */
  completed?: number
  /** 剩余数量；不传时按 total - completed 推导（不小于 0） */
  remaining?: number | null
  /** 覆盖默认标题文案 */
  label?: string
  showCounts?: boolean
  /** 额外统计（新卡 / 到期待复习 等），纯展示 */
  breakdown?: KfReviewBreakdownItem[]
  size?: 'sm' | 'md'
  /** 全部完成时的提示文案 */
  doneText?: string
}

export interface KfReviewProgressSlots {
  /** 进度条下方的自定义区域 */
  default?: () => unknown
}
