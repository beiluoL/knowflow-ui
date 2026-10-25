import { onScopeDispose, ref } from 'vue'
import type { KfToastItem, KfToastType } from './types'

let seq = 0

export interface UseToastOptions {
  /** 默认自动关闭时间（毫秒）；0 表示常驻 */
  duration?: number
  /** 最多同时保留多少条，超出后丢弃最早的 */
  max?: number
}

/**
 * useToast —— 通知的本地状态管理。
 *
 * 刻意做成组合式函数而不是模块级单例：
 *   - 单例在 SSR 下会跨请求串数据；
 *   - 单例让测试之间互相污染（前一个用例的 toast 还在 DOM 里）；
 *   - 单例等于隐式全局，宿主无法同时存在两个独立的通知区域。
 *
 * 用法：
 *   const { items, notify, dismiss } = useToast()
 *   <KfToast :items="items" @dismiss="dismiss" />
 */
export function useToast(options: UseToastOptions = {}) {
  const defaultDuration = options.duration ?? 3200
  const max = options.max ?? 5

  const items = ref<KfToastItem[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function clearTimer(id: string): void {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }

  function dismiss(id: string): void {
    clearTimer(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  function clear(): void {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    items.value = []
  }

  function notify(message: string, type: KfToastType = 'info', extra: Partial<KfToastItem> = {}): string {
    const id = `kf-toast-${(seq += 1)}`
    const duration = extra.duration ?? defaultDuration
    items.value = [...items.value, { ...extra, id, message, type, duration }]
    if (items.value.length > max) {
      const [dropped] = items.value
      if (dropped) dismiss(dropped.id)
    }
    if (duration > 0) {
      timers.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    }
    return id
  }

  // 组件/作用域销毁时清空计时器，避免定时器持有已卸载的响应式引用
  onScopeDispose(clear)

  return { items, notify, dismiss, clear }
}
