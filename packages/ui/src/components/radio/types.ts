export type KfRadioSize = 'sm' | 'md'

export interface KfRadioProps {
  /** 选项值（与 group 的 modelValue 比较） */
  value: string | number | boolean
  label?: string
  disabled?: boolean
  /** 独立使用时的受控值；在 KfRadioGroup 内自动从 group 读取 */
  modelValue?: string | number | boolean
  /** 原生 name；在 group 内自动继承 */
  name?: string
  size?: KfRadioSize
}

export interface KfRadioEmits {
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean, event: Event]
}

export interface KfRadioOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface KfRadioGroupProps {
  modelValue?: string | number | boolean
  /** 快捷选项；也可用默认插槽放 KfRadio */
  options?: KfRadioOption[]
  /** 原生 name（不传会自动生成） */
  name?: string
  disabled?: boolean
  /** 排列方向 */
  direction?: 'horizontal' | 'vertical'
  size?: KfRadioSize
  label?: string
  /** 表单必填语义（只加 aria-required，不做校验） */
  required?: boolean
}

export interface KfRadioGroupEmits {
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}

export interface KfRadioGroupSlots {
  default?: () => unknown
}
