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
 * 插槽：
 *   - prefix / suffix：在输入框内部前后插入自定义内容（清空按钮、单位、快捷键提示）；
 *     不传时分别回退到 prefixIconName / suffixIconName 的图标。
 *   - meta：追加到字段下方说明区（由 KfFormField 提供）。
 */
export interface KfInputSlots {
  prefix?: () => unknown
  suffix?: () => unknown
  meta?: () => unknown
}
