/**
 * KfFormField 模块入口 —— 内部组件，**不从根入口导出**。
 *
 * 保留 index.ts 是为了让内部目录结构与其它组件一致，且方便未来
 * 若决定公开时只需在 components/index.ts 加一行。
 */
export { default as KfFormField } from './KfFormField.vue'
export type { KfFormFieldProps } from './types'
