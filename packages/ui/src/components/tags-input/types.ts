export interface KfTagsInputProps {
  /** 标签数组 */
  modelValue?: string[]
  placeholder?: string
  label?: string
  help?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  /** 最多标签数，达到后不再接受新值 */
  max?: number
  /** 允许重复标签（默认去重） */
  allowDuplicates?: boolean
  /** 失焦时把当前草稿也提交 */
  addOnBlur?: boolean
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
}

export interface KfTagsInputEmits {
  'update:modelValue': [tags: string[]]
  add: [tag: string]
  remove: [tag: string]
}

export interface KfTagsInputSlots {
  meta?: () => unknown
}
