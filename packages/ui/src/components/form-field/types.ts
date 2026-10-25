/**
 * KfFormField 内部类型（v0.1.0 不从公共入口导出，仅供 KfInput 复用）。
 *
 * 命名同样遵循 `Kf + PascalCase + Props`，避免内部组件成为规范盲区。
 */
export interface KfFormFieldProps {
  /** 关联控件的 id（label for / help 与 error 的 id 前缀） */
  controlId: string
  label?: string
  required?: boolean
  help?: string
  error?: string
}
