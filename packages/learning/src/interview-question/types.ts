export type KfInterviewDifficulty = 'easy' | 'medium' | 'hard'

export interface KfInterviewQuestionProps {
  question?: string
  index?: number
  total?: number
  category?: string
  difficulty?: KfInterviewDifficulty
  /** 建议作答时长（文本，如 "3 分钟"） */
  timeLimit?: string
  /** 正在作答：按钮变为「结束作答」 */
  answering?: boolean
  /** 是否已回答过 */
  answered?: boolean
  /** 追问提示 */
  followUp?: string
  startLabel?: string
  finishLabel?: string
  answeredLabel?: string
  ariaLabel?: string
}

export interface KfInterviewQuestionEmits {
  start: []
  finish: []
}

export interface KfInterviewQuestionSlots {
  /** 覆盖题干 */
  default?: () => unknown
  /** 题干下方（录音波形、计时器等） */
  extra?: () => unknown
  /** 操作按钮右侧扩展 */
  actions?: () => unknown
}
