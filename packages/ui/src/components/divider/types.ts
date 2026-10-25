export type KfDividerDirection = 'horizontal' | 'vertical'
export type KfDividerSpacing = 'sm' | 'md' | 'lg'

export interface KfDividerProps {
  /** 方向：horizontal 分隔上下内容，vertical 分隔行内元素 */
  direction?: KfDividerDirection
  /** 与相邻内容的间距 */
  spacing?: KfDividerSpacing
  /** 虚线 */
  dashed?: boolean
  /** 文字位置（仅 horizontal + 有默认插槽时生效） */
  contentPosition?: 'left' | 'center' | 'right'
}

export interface KfDividerSlots {
  default?: () => unknown
}
