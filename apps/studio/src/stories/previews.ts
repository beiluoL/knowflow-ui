/**
 * 预览渲染器：Studio 直接使用新包真实组件，不引用原 KnowFlow 任何代码。
 * 每个 story 一个 preview 组件，接受 state（来自属性面板）并回传事件。
 */
import type { Component } from 'vue'
import ButtonPreview from '../previews/ButtonPreview.vue'
import IconPreview from '../previews/IconPreview.vue'
import InputPreview from '../previews/InputPreview.vue'
import CheckboxPreview from '../previews/CheckboxPreview.vue'
import type { PropState } from '../stories/types'

export const PREVIEW_MAP: Record<string, Component> = {
  button: ButtonPreview,
  icon: IconPreview,
  input: InputPreview,
  checkbox: CheckboxPreview,
}

export function previewFor(id: string): Component | undefined {
  return PREVIEW_MAP[id]
}

/** 把状态里的空字符串图标名转成 undefined，避免把 '' 当图标去查表 */
export function iconOrUndefined(value: PropState[string]): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** 只保留有值的字符串 prop，用于生成代码样例 */
export function compactCode(lines: string[]): string {
  return lines.filter(Boolean).join('\n')
}
