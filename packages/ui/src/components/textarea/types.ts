export interface KfTextareaProps {
  /** v-model 值 */
  modelValue?: string
  placeholder?: string
  /** 字段标签，同时作为 label 关联文本 */
  label?: string
  /** 初始可见行数 */
  rows?: number
  /** 最大字符数（原生 maxlength） */
  maxlength?: number
  /** 显示「已输入/上限」计数；需要 maxlength 才生效 */
  showCount?: boolean
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** 辅助说明（关联 aria-describedby） */
  help?: string
  /** 错误信息（设置 aria-invalid + aria-describedby） */
  error?: string
  /** 随内容自动撑高 */
  autoResize?: boolean
  /** 自动撑高的最小高度 */
  minHeight?: number
  /** 自动撑高的最大高度，超出后内部滚动 */
  maxHeight?: number
}

export interface KfTextareaEmits {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface KfTextareaSlots {
  /** 追加在字段下方的说明区（FormField meta 插槽） */
  meta?: () => unknown
}
