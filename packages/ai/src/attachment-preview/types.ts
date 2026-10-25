export type KfAttachmentKind = 'file' | 'image' | 'audio' | 'video' | 'code' | 'link'

export type KfAttachmentStatus = 'ready' | 'uploading' | 'error'

export interface KfAttachmentItem {
  id: string
  name: string
  /** 字节数；用于展示体积，非法值不渲染 */
  size?: number | null
  kind?: KfAttachmentKind
  /** 缩略图（图片类） */
  thumbnailSrc?: string
  /** 下载/预览地址；组件只用于 emit，不主动请求 */
  url?: string
  status?: KfAttachmentStatus
  /** 上传进度 0–100（status=uploading 时展示） */
  progress?: number | null
  errorText?: string
}

export interface KfAttachmentPreviewProps {
  files?: KfAttachmentItem[]
  /** 是否显示移除按钮 */
  removable?: boolean
  layout?: 'list' | 'grid'
  /** 最多可见数量；0 表示全部 */
  maxVisible?: number
  emptyText?: string
  ariaLabel?: string
}

export interface KfAttachmentPreviewEmits {
  remove: [id: string, item: KfAttachmentItem]
  open: [item: KfAttachmentItem]
}

export interface KfAttachmentPreviewSlots {
  item?: (props: { item: KfAttachmentItem; index: number }) => unknown
  empty?: () => unknown
}
