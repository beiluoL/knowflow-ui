export interface KfMarkdownRendererProps {
  /** Markdown 源文本（不可信内容可直接传入，渲染过程不使用 v-html） */
  content?: string
  /** 是否允许链接可点击；false 时链接渲染为普通文本 */
  linkable?: boolean
}

export interface KfMarkdownRendererSlots {
  /** 内容为空时的占位 */
  empty?: () => unknown
}
