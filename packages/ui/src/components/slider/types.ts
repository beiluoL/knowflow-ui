export interface KfSliderProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** 左侧标签 */
  label?: string
  /** 显示当前值 */
  showValue?: boolean
  /** 数值后缀（如 %） */
  suffix?: string
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
}

export interface KfSliderEmits {
  'update:modelValue': [value: number]
  change: [value: number]
}

export interface KfSliderSlots {
  /** 自定义数值展示（覆盖 showValue 的文本） */
  value?: () => unknown
}
