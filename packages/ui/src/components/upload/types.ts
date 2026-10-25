export type KfUploadFileStatus = 'ready' | 'uploading' | 'success' | 'error'

export interface KfUploadFile {
  id: string
  name: string
  size?: number
  type?: string
  status?: KfUploadFileStatus
  /** 上传进度 0–100（由宿主更新） */
  progress?: number | null
  errorText?: string
}

export type KfUploadRejectReason = 'type' | 'size' | 'count'

export interface KfUploadProps {
  /** 原生 accept 语法，如 "image/*,.pdf" */
  accept?: string
  multiple?: boolean
  /** 单文件大小上限（MB）；0 表示不限制 */
  maxSizeMb?: number
  /** 数量上限；0 表示不限制 */
  maxCount?: number
  files?: KfUploadFile[]
  disabled?: boolean
  hint?: string
  dragText?: string
  ariaLabel?: string
}

export interface KfUploadEmits {
  'update:files': [files: KfUploadFile[]]
  /** 通过校验的文件（组件不上传，宿主自行处理） */
  select: [files: File[]]
  remove: [id: string]
  retry: [id: string]
  /** 被校验拦下的文件与原因 */
  reject: [payload: { file: File; reason: KfUploadRejectReason }]
}

export interface KfUploadSlots {
  /** 拖拽区内容 */
  default?: () => unknown
}
