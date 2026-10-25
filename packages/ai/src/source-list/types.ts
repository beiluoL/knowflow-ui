export interface KfSourceItem {
  id: string
  title: string
  /** 来源名称：文件名 / 站点 / 知识库名 */
  source?: string
  url?: string
  snippet?: string
  /** 宿主提供的相关性 0–1 */
  score?: number | null
  /** 定位信息：页码 / 行号 / 章节 */
  locator?: string
}

export interface KfSourceListProps {
  sources?: KfSourceItem[]
  title?: string
  /** 显示条目数量徽标 */
  showCount?: boolean
  /** 最多可见条数；0 表示全部展开 */
  maxVisible?: number
  /** 当前高亮的条目 id */
  activeId?: string
  /** 紧凑模式：不展示片段，仅标题与来源 */
  dense?: boolean
  emptyText?: string
  ariaLabel?: string
}

export interface KfSourceListEmits {
  select: [item: KfSourceItem, index: number]
  open: [url: string, item: KfSourceItem]
}

export interface KfSourceListSlots {
  /** 自定义单条渲染，作用域参数 { item, index } */
  item?: (props: { item: KfSourceItem; index: number }) => unknown
  empty?: () => unknown
  header?: () => unknown
}
