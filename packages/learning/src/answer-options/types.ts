export type KfAnswerOptionsMode = 'single' | 'multiple'

/** 单个选项的视觉状态；由「是否选中 + 是否揭示答案」共同推导 */
export type KfAnswerOptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed'

export interface KfAnswerOption {
  value: string
  label: string
  /** 选项补充说明 */
  description?: string
  disabled?: boolean
}

export interface KfAnswerOptionsProps {
  options?: KfAnswerOption[]
  mode?: KfAnswerOptionsMode
  /** 单选：string | null；多选：string[] */
  modelValue?: string | string[] | null
  disabled?: boolean
  /** 是否已揭示答案（组件据此着色，但不会自行判定对错之外的信息） */
  revealed?: boolean
  /** 正确答案的 value 列表；仅用于着色比对 */
  correctValues?: string[]
  /** 单选组的原生 name（不传则自动生成） */
  name?: string
  ariaLabel?: string
}

export interface KfAnswerOptionsEmits {
  'update:modelValue': [value: string | string[]]
  change: [value: string | string[], option: KfAnswerOption]
}

export interface KfAnswerOptionsSlots {
  /** 自定义选项内容，作用域 { option, index, state, checked } */
  option?: (props: {
    option: KfAnswerOption
    index: number
    state: KfAnswerOptionState
    checked: boolean
  }) => unknown
}
