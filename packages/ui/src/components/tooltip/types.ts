export type KfTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface KfTooltipProps {
  /** 提示文本；也可用 #content 插槽放富内容 */
  content?: string
  placement?: KfTooltipPlacement
  /** 显示延迟（毫秒），避免鼠标扫过时闪一片 */
  delay?: number
  /** 隐藏延迟（毫秒），让用户能把指针移进提示里选中文本 */
  hideDelay?: number
  disabled?: boolean
  /** 最大宽度，长文本自动换行 */
  maxWidth?: number
  /** 与触发元素的间距 */
  offset?: number
}

export interface KfTooltipSlots {
  /** 触发元素（建议放可聚焦控件） */
  default?: () => unknown
  /** 富内容提示 */
  content?: () => unknown
}
