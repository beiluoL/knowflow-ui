export type KfPopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface KfPopoverProps {
  /** 受控开合；不传则由内部状态管理 */
  open?: boolean
  placement?: KfPopoverPlacement
  /** 与触发元素的间距 */
  offset?: number
  /** 面板最小宽度对齐触发元素宽度 */
  matchWidth?: boolean
  closeOnOutside?: boolean
  closeOnEsc?: boolean
  disabled?: boolean
  /** 面板可访问名称 */
  ariaLabel?: string
}

export interface KfPopoverEmits {
  'update:open': [open: boolean]
  open: []
  close: []
}

export interface KfPopoverSlots {
  /** 触发元素，作用域参数 { open, toggle } */
  trigger?: (props: { open: boolean; toggle: () => void }) => unknown
  default?: () => unknown
}
