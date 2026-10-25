export type KfTabsVariant = 'line' | 'segmented'
export type KfTabsSize = 'sm' | 'md'

export interface KfTabItem {
  /** 唯一标识，同时用作 DOM id 后缀 */
  id: string
  label: string
  disabled?: boolean
  /** 标签右侧计数/徽标文字 */
  badge?: string
}

export interface KfTabsProps {
  items: KfTabItem[]
  /** 受控激活项 */
  modelValue?: string
  variant?: KfTabsVariant
  size?: KfTabsSize
  /** tablist 的可访问名称 */
  ariaLabel?: string
  /** 撑满容器宽度（segmented 常用） */
  block?: boolean
}

export interface KfTabsEmits {
  'update:modelValue': [id: string]
  change: [id: string]
}

export interface KfTabsSlots {
  /** 面板内容；作用域提供当前激活项 */
  default?: (scope: { activeId: string; activeItem: KfTabItem | undefined }) => unknown
}
