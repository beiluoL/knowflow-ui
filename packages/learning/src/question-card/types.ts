export type KfQuestionType = 'single' | 'multiple' | 'true-false' | 'short-answer' | 'essay'

export type KfQuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface KfQuestionCardProps {
  /** 题干纯文本；富文本请用默认插槽 */
  question?: string
  type?: KfQuestionType
  /** 位置（1 起），仅展示 */
  index?: number
  total?: number
  difficulty?: KfQuestionDifficulty
  /** 提示内容；有值时渲染「查看提示」折叠区 */
  hint?: string
  tags?: string[]
  /** 分值，仅展示，不做计分 */
  points?: number
  ariaLabel?: string
}

export interface KfQuestionCardEmits {
  /** 提示展开状态变化 */
  hint: [visible: boolean]
}

export interface KfQuestionCardSlots {
  /** 覆盖题干（可放代码块、图片等） */
  default?: () => unknown
  /** 题干下方补充区（答题区通常放这里或放在组件外） */
  extra?: () => unknown
  /** 头部右侧 */
  meta?: () => unknown
}
