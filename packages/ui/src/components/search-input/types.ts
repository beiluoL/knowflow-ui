export interface KfSearchInputProps {
  modelValue?: string
  placeholder?: string
  label?: string
  help?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  /** 显示清空按钮 */
  clearable?: boolean
  /** 输入停止后多久触发 search（毫秒）；0 表示每次输入都触发 */
  debounce?: number
  /** 搜索中：在尾部显示旋转指示 */
  loading?: boolean
  /** 输入框的可访问名称（无 label 时使用） */
  ariaLabel?: string
  /** Enter 是否立即触发（不等 debounce） */
  submitOnEnter?: boolean
}

export interface KfSearchInputEmits {
  'update:modelValue': [value: string]
  /** 防抖后的搜索请求；宿主据此发请求 */
  search: [value: string]
  /** 点击清空 */
  clear: []
  /** Enter 或搜索按钮 */
  submit: [value: string]
}
