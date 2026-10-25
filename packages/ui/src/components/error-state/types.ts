export interface KfErrorStateProps {
  /** 图标名，默认 alert-circle */
  icon?: string
  /** ① 发生了什么 */
  title?: string
  /** 补充说明；也可用默认插槽 */
  description?: string
  /** ② 是否影响当前页面（如「只有这一块没加载出来」） */
  scope?: string
  /** ③ 怎么解决（如「请确认服务已启动」） */
  hint?: string
  /** 显示「重试」按钮 */
  showRetry?: boolean
  /** 重试按钮文案 */
  retryText?: string
}

export interface KfErrorStateEmits {
  retry: []
}

export interface KfErrorStateSlots {
  default?: () => unknown
  /** 覆盖默认重试按钮 */
  action?: () => unknown
}
