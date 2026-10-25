export interface KfSelectOption {
  label: string
  value: string
  disabled?: boolean
  /** 选项右侧的补充说明 */
  hint?: string
}

export interface KfSelectProps {
  /** 单选值或多选值数组 */
  modelValue?: string | string[]
  options: KfSelectOption[]
  /** 多选 */
  multiple?: boolean
  /** 选项内搜索框 */
  searchable?: boolean
  /** 显示清空按钮 */
  clearable?: boolean
  placeholder?: string
  label?: string
  help?: string
  error?: string
  disabled?: boolean
  /** 选项异步加载中：触发器显示旋转指示，暂不展开面板 */
  loading?: boolean
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
  /** 空选项文案 */
  emptyText?: string
}

export interface KfSelectEmits {
  'update:modelValue': [value: string | string[]]
  change: [value: string | string[]]
}

export interface KfSelectSlots {
  meta?: () => unknown
}
