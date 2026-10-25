/**
 * KfCheckbox 公共类型
 *
 * 命名规范：`Kf + PascalCase + Props / Emits`。
 * 泛型 T 表示 v-model 的值类型（默认 boolean；数组收集场景可传 string[] 等）。
 */
export type CheckboxAs = 'label' | 'span'
export type CheckboxValue<T = boolean> = T

export interface KfCheckboxProps<T = boolean> {
  /** v-model 值；数组/Set 场景由原生 checkbox 语义处理 */
  modelValue?: T
  /** 受控 checked（优先于 modelValue），用于纯展示态 */
  checked?: boolean
  label?: string
  disabled?: boolean
  /** 半选态：视觉显示横线，并设置 aria-checked="mixed" */
  indeterminate?: boolean
  /** 原生 value（数组收集时使用） */
  value?: unknown
  trueValue?: unknown
  falseValue?: unknown
  modelModifiers?: Record<string, boolean>
  /** label：整行可点（默认）；span：嵌入列表行时避免嵌套 label */
  as?: CheckboxAs
}

/** 事件名遵循 Vue 原生约定：update:modelValue / change，不加 kf 前缀 */
export type KfCheckboxEmits<T = boolean> = {
  'update:modelValue': [value: T]
  change: [checked: boolean]
  'native-change': [event: Event]
}

/** 插槽：默认插槽即标签内容（优先于 label prop） */
export type KfCheckboxSlots = {
  default?: () => unknown
}
