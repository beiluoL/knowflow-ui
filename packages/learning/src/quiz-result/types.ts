export interface KfQuizResultProps {
  /** 得分率 0–100（宿主算好后传入） */
  score?: number
  /** 通过线 0–100 */
  passScore?: number
  total?: number
  /** 答对数量；null 表示不展示该统计 */
  correct?: number | null
  incorrect?: number | null
  skipped?: number | null
  /** 用时文本 */
  duration?: string
  title?: string
  /** 是否显示通过 / 未通过 */
  showPass?: boolean
  retryLabel?: string
  reviewLabel?: string
}

export interface KfQuizResultEmits {
  retry: []
  review: []
}

export interface KfQuizResultSlots {
  /** 分数下方的补充区（错题列表等） */
  default?: () => unknown
  actions?: () => unknown
}
