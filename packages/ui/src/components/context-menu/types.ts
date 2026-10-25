export interface KfContextMenuItem {
  key: string
  label: string
  iconName?: string
  danger?: boolean
  disabled?: boolean
  /** 作为分隔线渲染；此时 label 可为空 */
  separator?: boolean
  /** 勾选态（渲染为 menuitemcheckbox） */
  selected?: boolean
}

export interface KfContextMenuProps {
  open: boolean
  /** 视口坐标（通常是 pointer 事件 clientX / clientY） */
  x: number
  y: number
  items: KfContextMenuItem[]
  /** 菜单的可访问名称 */
  label?: string
  /** 关闭后把焦点还给谁（通常是被右键的元素） */
  restoreFocusTo?: HTMLElement | null
}

export interface KfContextMenuEmits {
  select: [key: string]
  close: []
}
