export interface KfCodeBlockProps {
  code: string
  /** 语言标识，显示在头部左侧 */
  language?: string
  /** 文件名 / 来源说明 */
  filename?: string
  /** 显示行号 */
  lineNumbers?: boolean
  /** 最大高度，超出滚动 */
  maxHeight?: number
  /** 显示复制按钮 */
  copyable?: boolean
  /** 复制成功文案 */
  copiedText?: string
}

export interface KfCodeBlockEmits {
  copy: [code: string]
  /** 复制失败（非安全上下文 / 权限拒绝） */
  error: [reason: string]
}

export interface KfCodeBlockSlots {
  /**
   * 自定义代码渲染（宿主自接高亮器时用）。
   * 库本身不内置语法高亮：引入 highlight.js / shiki 会带来数倍体积与额外许可证，
   * 且高亮属于「宿主已有渲染管线」，不该由 UI 库强制。
   */
  code?: () => unknown
}
