/**
 * KfFormField 公共类型。
 *
 * 命名遵循 `Kf + PascalCase + Props / Slots`。
 * v0.2.0 起对外公开：宿主自定义表单控件时可以直接复用同一条 label/help/error 轨道，
 * 而不必为了「一个特殊输入框」再造一套标签排版。
 */
export interface KfFormFieldProps {
  /** 关联控件的 id（label for / help 与 error 的 id 前缀） */
  controlId: string
  /** 标签文字；不传则不渲染 label 行 */
  label?: string
  /** 显示必填星号（纯视觉，不做校验） */
  required?: boolean
  /** 辅助说明 */
  help?: string
  /** 错误信息 */
  error?: string
}

export interface KfFormFieldSlots {
  /** 控件本体 */
  default?: () => unknown
  /** 追加到说明区右侧（字数统计、快捷键提示等） */
  meta?: () => unknown
}
