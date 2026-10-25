export type KfComposerAttachmentStatus = 'ready' | 'uploading' | 'error'

export interface KfComposerAttachment {
  id: string
  name: string
  /** 字节数；仅用于展示，组件不做换算以外的判断 */
  size?: number
  /** MIME 或扩展名标签 */
  type?: string
  status?: KfComposerAttachmentStatus
}

export interface KfChatComposerProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  /** 正在生成：发送按钮变为停止 */
  busy?: boolean
  /** busy 时是否允许停止 */
  stoppable?: boolean
  /** 最大字符数；超出时阻止继续输入并提示 */
  maxLength?: number
  /** 自动撑高的上下限 */
  minHeight?: number
  maxHeight?: number
  /** 显示附件按钮 */
  showAttach?: boolean
  attachments?: KfComposerAttachment[]
  /** 底部提示文案（快捷键说明等） */
  hint?: string
  /** 输入框的可访问名称 */
  ariaLabel?: string
  /** 提交失败的本地提示（role=alert）；由宿主产生与清除，组件不自行推断 */
  error?: string
}

export interface KfChatComposerEmits {
  'update:modelValue': [value: string]
  /** 提交当前内容；组件不负责清空（由宿主决定，便于失败时保留草稿） */
  submit: [value: string]
  stop: []
  attach: []
  removeAttachment: [id: string]
}

export interface KfChatComposerSlots {
  /** 工具栏左侧扩展（模型选择、知识库开关等） */
  toolbar?: () => unknown
  /** 完全替换底部提示区 */
  hint?: () => unknown
}
