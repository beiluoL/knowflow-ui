/**
 * 组件实例 id 生成器。
 *
 * 不用 Vue 3.5 的 useId：本库 peerDependencies 允许 Vue 3.4，
 * 且 SSR 水合要求 id 在服务端与客户端一致 —— 计数器在单次渲染流程中即可满足。
 */
let counter = 0

export function nextUid(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}
