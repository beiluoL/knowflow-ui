export type KfSwitchSize = 'sm' | 'md'

export interface KfSwitchProps {
  /** 受控开关值 */
  modelValue?: boolean
  disabled?: boolean
  /** 加载中：禁用交互并显示旋转指示 */
  loading?: boolean
  size?: KfSwitchSize
  /** 控件右侧文字 */
  label?: string
  /** 开启/关闭时的状态文字（显示在轨道内或右侧） */
  onLabel?: string
  offLabel?: string
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
}

export interface KfSwitchEmits {
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}

export interface KfSwitchSlots {
  /** 覆盖 label 文本 */
  default?: () => unknown
}
