export interface KfComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface KfComboboxProps {
  /** 输入框文本（受控） */
  modelValue?: string
  options?: KfComboboxOption[]
  placeholder?: string
  /** 外部标签（渲染为 label，与输入框通过 id 关联） */
  label?: string
  emptyText?: string
  loading?: boolean
  /** 错误文案；有值时输入框进入错误态并设置 aria-invalid */
  error?: string
  disabled?: boolean
  /** 允许提交列表外的自由文本 */
  freeInput?: boolean
  /** 本地按 label 过滤；false 时只发 search 事件，由宿主给新 options */
  filterable?: boolean
  ariaLabel?: string
}

export interface KfComboboxEmits {
  'update:modelValue': [value: string]
  search: [query: string]
  select: [option: KfComboboxOption]
  clear: []
  /** 失焦时若文本不在选项中且不允许自由输入，发出以提示宿主 */
  invalid: [value: string]
}
