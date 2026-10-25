export interface KfInterviewDimension {
  key: string
  label: string
  /** 该维度得分 */
  score: number
  /** 满分，默认 100 */
  maxScore?: number
  /** 评语 */
  comment?: string
}

export interface KfInterviewFeedbackProps {
  title?: string
  /** 各维度得分；由宿主的评分（含 AI 评分）结果提供 */
  dimensions?: KfInterviewDimension[]
  /** 总评文字 */
  overall?: string
  strengths?: string[]
  improvements?: string[]
  showScores?: boolean
  emptyText?: string
}

export interface KfInterviewFeedbackSlots {
  /** 总评区之后的补充内容 */
  default?: () => unknown
}
