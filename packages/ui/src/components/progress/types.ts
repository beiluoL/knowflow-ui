export type KfProgressVariant = 'primary' | 'success' | 'warning' | 'danger'
export type KfProgressSize = 'sm' | 'md' | 'lg'

export interface KfProgressProps {
  /** 0–100；超出范围会被夹取 */
  percentage: number
  variant?: KfProgressVariant
  /** 条高：sm 4px / md 8px / lg 12px */
  size?: KfProgressSize
  /** 左侧标签文字 */
  label?: string
  /** 显示「标签 / 百分比」行 */
  showLabel?: boolean
  /** 不确定进度（动画条纹，无具体百分比） */
  indeterminate?: boolean
}

export interface KfProgressSlots {
  /** 自定义标签区域（覆盖 label 文本） */
  label?: () => unknown
}
