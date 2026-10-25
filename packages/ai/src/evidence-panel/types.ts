export interface KfEvidenceChunk {
  id: string
  /** 证据原文（宿主已做脱敏；组件只展示不改写） */
  text: string
  /** 宿主提供的相关性 0–1 */
  score?: number | null
  source?: string
  /** 定位信息：`p.12` / `L40-58` / `第二章` */
  locator?: string
  /** 需要在正文中高亮的命中词（仅作用于展示） */
  highlights?: string[]
}

export interface KfEvidencePanelProps {
  chunks?: KfEvidenceChunk[]
  title?: string
  /** 宿主传入的原始查询，仅用于展示，不参与检索 */
  query?: string
  emptyText?: string
  /** 是否显示每条的相关性分数 */
  showScore?: boolean
  /** 折叠阈值：单条正文超过该行数时收起；0 表示不截断 */
  clampLines?: number
  ariaLabel?: string
}

export interface KfEvidencePanelEmits {
  select: [chunk: KfEvidenceChunk, index: number]
}

export interface KfEvidencePanelSlots {
  chunk?: (props: { chunk: KfEvidenceChunk; index: number }) => unknown
  empty?: () => unknown
  header?: () => unknown
}
