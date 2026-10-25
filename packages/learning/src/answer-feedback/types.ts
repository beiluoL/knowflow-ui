export type KfAnswerFeedbackStatus = 'correct' | 'incorrect' | 'partial' | 'skipped'

export interface KfAnswerFeedbackProps {
  status?: KfAnswerFeedbackStatus
  /** 覆盖默认标题 */
  title?: string
  /** 用户作答（已由宿主格式化为文本） */
  answer?: string
  /** 正确答案 */
  correctAnswer?: string
  /** 解析 / 讲解 */
  explanation?: string
  /** 得分展示，如 "2/3"；仅展示，不参与计算 */
  score?: string
  retryable?: boolean
  retryLabel?: string
  answerLabel?: string
  correctLabel?: string
}

export interface KfAnswerFeedbackEmits {
  retry: []
}

export interface KfAnswerFeedbackSlots {
  /** 覆盖解析区 */
  default?: () => unknown
  /** 额外操作（下一题、收藏等） */
  actions?: () => unknown
}
