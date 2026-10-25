import type { ButtonSize, ButtonVariant } from '../button/types'

export interface KfCopyButtonProps {
  /** 要复制的文本 */
  text: string
  /** 默认文案 */
  label?: string
  /** 复制成功后的文案 */
  copiedLabel?: string
  /** 失败文案 */
  failedLabel?: string
  size?: ButtonSize
  variant?: ButtonVariant
  disabled?: boolean
  /** 成功态回退时间（毫秒） */
  timeout?: number
  /** 无可见文字时的可访问名称 */
  ariaLabel?: string
}

export interface KfCopyButtonEmits {
  /** 复制成功 */
  copy: [text: string]
  /** 复制失败（权限被拒、非安全上下文、浏览器不支持） */
  error: [reason: string]
}

export interface KfCopyButtonSlots {
  /** 覆盖按钮文字（仍会带上成功/失败态语义） */
  default?: () => unknown
}
