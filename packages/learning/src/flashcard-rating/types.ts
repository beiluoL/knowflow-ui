export type KfFlashcardRatingTone = 'danger' | 'warning' | 'primary' | 'success'

export interface KfFlashcardRatingOption {
  value: number
  label: string
  /** 快捷键提示（如 1 / 2 / 3 / 4），仅展示 */
  hint?: string
  /**
   * 预计下次间隔（如 "1 天"）。
   * 由宿主按自己的调度算法算出后传入 —— 组件不内置 FSRS / SM-2。
   */
  interval?: string
  tone?: KfFlashcardRatingTone
}

export interface KfFlashcardRatingProps {
  options?: KfFlashcardRatingOption[]
  /** 当前选择；null 表示未选择 */
  modelValue?: number | null
  disabled?: boolean
  showInterval?: boolean
  ariaLabel?: string
}

export interface KfFlashcardRatingEmits {
  'update:modelValue': [value: number]
  select: [value: number, option: KfFlashcardRatingOption]
}
