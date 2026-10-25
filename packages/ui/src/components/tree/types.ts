export interface KfTreeNode {
  id: string
  label: string
  children?: KfTreeNode[]
  disabled?: boolean
  /** 节点图标名（可选） */
  iconName?: string
}

export interface KfTreeProps {
  nodes?: KfTreeNode[]
  /** 受控展开集合 */
  expandedIds?: string[]
  /** 受控选中项 */
  selectedId?: string
  /** 初始展开层级：0 全收起，-1 全展开（仅非受控时生效） */
  defaultExpandLevel?: number
  ariaLabel?: string
  emptyText?: string
  /** 显示连接线 */
  showLines?: boolean
}

export interface KfTreeEmits {
  'update:expandedIds': [ids: string[]]
  'update:selectedId': [id: string]
  toggle: [id: string, expanded: boolean]
  select: [node: KfTreeNode]
}

export interface KfTreeSlots {
  /** 自定义节点标签，作用域 { node, depth, expanded, selected } */
  node?: (props: { node: KfTreeNode; depth: number; expanded: boolean; selected: boolean }) => unknown
  empty?: () => unknown
}
