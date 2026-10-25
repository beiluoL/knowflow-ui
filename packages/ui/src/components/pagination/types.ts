export interface KfPaginationProps {
  /** 当前页码，从 1 开始 */
  pageNum: number
  pageSize: number
  /** 总条数 */
  total: number
  /** 显示「显示 1-10 / 共 N 项」 */
  showInfo?: boolean
  /** 最多显示多少个页码按钮 */
  maxVisiblePages?: number
  disabled?: boolean
  /** 无可见文字时的可访问名称 */
  ariaLabel?: string
}

export interface KfPaginationEmits {
  /** 页码变化（只在真正换页时触发） */
  change: [page: number]
  'update:pageNum': [page: number]
}
