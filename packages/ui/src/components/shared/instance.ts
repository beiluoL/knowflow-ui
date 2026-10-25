/**
 * 组件实例序号（非响应式）。
 *
 * 用途：模态栈、焦点管理等需要「每个实例一个稳定 id」的场景。
 * 不用 Vue 3.5 的 useId —— 本库 peerDependencies 仍允许 Vue 3.4。
 */
let seq = 0

export function nextInstanceId(): number {
  seq += 1
  return seq
}
