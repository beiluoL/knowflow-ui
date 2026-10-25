/**
 * KfFormField 模块入口。
 *
 * v0.2.0 起公开：它是 KfInput / KfTextarea / KfSelect / KfNumberInput 的共同外壳，
 * 宿主写自定义控件时也应该能用同一条轨道，否则每个业务表单都会重写一次 label/help/error。
 */
export { default as KfFormField } from './KfFormField.vue'
export type { KfFormFieldProps, KfFormFieldSlots } from './types'
