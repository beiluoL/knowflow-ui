/**
 * KfInput 公共类型
 *
 * 命名规范：`Kf + PascalCase + Props / Emits / Slots`。
 */
import type { BuiltinIconName } from '../icon/registry'

export type InputModelValue = string | number
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | (string & {})

export interface KfInputProps {
  /** v-model 值 */
  modelValue?: InputModelValue
  /** 原生 input type */
  type?: InputType
  placeholder?: string
  /** 字段标签，同时作为 label 关联文本 */
  label?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** 辅助说明（关联 aria-describedby） */
  help?: string
  /** 错误信息（设置 aria-invalid + aria-describedby） */
  error?: string
  prefixIconName?: BuiltinIconName | (string & {})
  suffixIconName?: BuiltinIconName | (string & {})
}

/** 事件名遵循 Vue 原生约定：update:modelValue / focus / blur，不加 kf 前缀 */
export type KfInputEmits = {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

/**
 * 插槽：KfInput 当前只接受默认插槽之外的 meta 扩展能力，
 * 由内部 KfFormField 提供；对外无具名插槽（prefix/suffix 由 props 提供图标）。
 */
export type KfInputSlots = Record<string, never>
