export type KfQuizQuestionStatus = 'unanswered' | 'answered' | 'correct' | 'incorrect'

export interface KfQuizProgressItem {
  id: string | number
  status?: KfQuizQuestionStatus
  /** 显示标记，默认用序号 */
  label?: string
}

export interface KfQuizProgressProps {
  items?: KfQuizProgressItem[]
  /** 当前题目的下标；-1 表示没有当前题 */
  current?: number
  /** 显示「已答 x / 共 y」汇总 */
  showSummary?: boolean
  /** 是否允许点击跳题 */
  jumpable?: boolean
  ariaLabel?: string
}

export interface KfQuizProgressEmits {
  jump: [index: number]
}
