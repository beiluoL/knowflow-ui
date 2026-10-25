export type KfTableAlign = 'left' | 'center' | 'right'
export type KfTableSortOrder = 'asc' | 'desc' | null
export type KfTableRow = Record<string, unknown>

export interface KfTableColumn {
  key: string
  title: string
  width?: string | number
  align?: KfTableAlign
  sortable?: boolean
  /** 纯展示格式化函数；不要在这里发请求或改状态 */
  format?: (value: unknown, row: KfTableRow) => string
}

export interface KfTableProps {
  columns?: KfTableColumn[]
  rows?: KfTableRow[]
  /** 行唯一键字段名，默认 id */
  rowKey?: string
  selectable?: boolean
  selectedKeys?: Array<string | number>
  /** 受控排序字段（组件不自行排序，只发事件） */
  sortKey?: string
  sortOrder?: KfTableSortOrder
  loading?: boolean
  emptyText?: string
  density?: 'compact' | 'normal'
  striped?: boolean
  /** 表格说明（屏幕阅读器可见） */
  caption?: string
  /** 行是否禁用选择 */
  rowDisabled?: (row: KfTableRow) => boolean
}

export interface KfTableEmits {
  'update:selectedKeys': [keys: Array<string | number>]
  'update:sortKey': [key: string]
  'update:sortOrder': [order: KfTableSortOrder]
  sort: [payload: { key: string; order: KfTableSortOrder }]
  rowClick: [row: KfTableRow, index: number]
}

export interface KfTableSlots {
  /** 自定义单元格，作用域 { row, column, value, index } */
  cell?: (props: { row: KfTableRow; column: KfTableColumn; value: unknown; index: number }) => unknown
  empty?: () => unknown
}
