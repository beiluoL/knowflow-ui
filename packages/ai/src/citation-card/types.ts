export interface KfCitationAction {
  key: string
  label: string
  iconName?: string
  disabled?: boolean
}

export interface KfCitationCardProps {
  /** 角标序号（1 起）；宿主决定编号规则，组件不重排 */
  index?: number
  title?: string
  /** 来源名称：文档名 / 站点 / 知识库 */
  source?: string
  /** 原文链接；仅用于渲染与 emit，组件不主动跳转 */
  url?: string
  /** 引用片段 */
  snippet?: string
  /** 相关性 0–1，由宿主提供；不传则不展示 */
  score?: number | null
  /** 定位信息：页码 / 行号 / 章节 */
  locator?: string
  /** 视觉强调（例如当前选中的引用） */
  active?: boolean
  actions?: KfCitationAction[]
  /** 片段折叠行数，0 表示不截断 */
  snippetLines?: number
}

export interface KfCitationCardEmits {
  /** 点击卡片主体或「打开来源」 */
  open: [url: string]
  action: [key: string]
}

export interface KfCitationCardSlots {
  /** 覆盖整个片段区 */
  default?: () => unknown
  /** 右上角自定义区域 */
  actions?: () => unknown
  footer?: () => unknown
}
