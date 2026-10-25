/**
 * 模态栈：多弹窗叠加时只锁一次 body 滚动，关闭后恢复原值。
 *
 * 为什么需要：Drawer 里再开 Dialog 是常见组合。若每个弹窗各自
 * `body.style.overflow = 'hidden'` 再各自恢复，先关的那个会把后开的滚锁解掉，
 * 页面在仍有弹窗时开始滚动。
 *
 * 这里用「栈」而不是计数器：同一个实例重复 enter 不会导致计数失衡
 * （Vue 的 watch 在 open 抖动时完全可能多触发一次）。
 */
const stack: number[] = []
let savedOverflow = ''
let savedPaddingRight = ''

export function enterModal(id: number): void {
  if (typeof document === 'undefined') return
  if (stack.includes(id)) return
  if (!stack.length) {
    savedOverflow = document.body.style.overflow
    savedPaddingRight = document.body.style.paddingRight
    // 补上滚动条宽度，避免锁定瞬间页面横向跳动
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
  }
  stack.push(id)
}

export function leaveModal(id: number): void {
  if (typeof document === 'undefined') return
  const index = stack.indexOf(id)
  if (index < 0) return
  stack.splice(index, 1)
  if (!stack.length) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight
  }
}

export function isTopModal(id: number): boolean {
  return stack[stack.length - 1] === id
}

export function modalDepth(): number {
  return stack.length
}
