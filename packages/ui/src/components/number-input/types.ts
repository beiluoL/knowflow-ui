export interface KfNumberInputProps {
  /** 数值；空值用 null 表示（与 0 区分） */
  modelValue?: number | null
  min?: number
  max?: number
  step?: number
  /** 小数位；0 表示整数 */
  precision?: number
  disabled?: boolean
  readonly?: boolean
  label?: string
  placeholder?: string
  help?: string
  error?: string
  /** 显示两侧步进按钮 */
  showControls?: boolean
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
}

export interface KfNumberInputEmits {
  'update:modelValue': [value: number | null]
  change: [value: number | null]
}

export interface KfNumberInputSlots {
  meta?: () => unknown
}
