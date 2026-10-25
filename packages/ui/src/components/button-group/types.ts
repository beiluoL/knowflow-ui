import type { ButtonSize, ButtonVariant } from '../button/types'

export interface KfButtonGroupItem {
  value: string
  label: string
  iconName?: string
  disabled?: boolean
}

export interface KfButtonGroupProps {
  /** 当前选中项 */
  modelValue?: string
  items: KfButtonGroupItem[]
  size?: ButtonSize
  variant?: ButtonVariant
  /** 整组禁用 */
  disabled?: boolean
  /** 组的可访问名称 */
  ariaLabel?: string
  /** 撑满容器 */
  block?: boolean
}

export interface KfButtonGroupEmits {
  'update:modelValue': [value: string]
  change: [value: string]
}

export interface KfButtonGroupSlots {
  default?: never
}
