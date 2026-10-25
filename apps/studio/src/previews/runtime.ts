/**
 * 运行时组件索引 —— Studio 预览、API 表、测试共用的唯一查找入口。
 *
 * 为什么单独一层：条目表只存「字符串组件名」，真正把名字变成组件的是这里。
 * 如果 Studio 各处自己 import 各自的包，很容易出现「预览用的是 A、API 表写的是 B」。
 */
import type { Component } from 'vue'
import * as AI from '@beiluol/knowflow-ai'
import * as LEARNING from '@beiluol/knowflow-learning'
import * as UI from '@beiluol/knowflow-ui'
import type { PlaygroundEntry } from '../registry/types'

export type PackageName = 'ui' | 'ai' | 'learning'

const NAMESPACE: Record<PackageName, Record<string, unknown>> = {
  ui: UI as unknown as Record<string, unknown>,
  ai: AI as unknown as Record<string, unknown>,
  learning: LEARNING as unknown as Record<string, unknown>,
}

export function componentByName(pkg: PackageName, name: string): Component | null {
  const found = NAMESPACE[pkg][name]
  if (!found) return null
  return found as Component
}

/** 条目的主组件（复合条目取第一个） */
export function primaryComponent(entry: PlaygroundEntry): Component | null {
  if (entry.status !== 'real' || !entry.packageName || !entry.components.length) return null
  return componentByName(entry.packageName, entry.components[0])
}

/** 真实组件声明的事件（SFC defineEmits 的运行时形态） */
export function componentEmits(component: Component): string[] {
  const emits = (component as { emits?: string[] | Record<string, unknown> }).emits
  if (!emits) return []
  return Array.isArray(emits) ? [...emits] : Object.keys(emits)
}

/** 真实组件声明的 Props（键名） */
export function componentPropKeys(component: Component): string[] {
  const props = (component as { props?: Record<string, unknown> | string[] }).props
  if (!props) return []
  return Array.isArray(props) ? props : Object.keys(props)
}

export function isComponentLike(value: unknown): value is Component {
  return typeof value === 'object' || typeof value === 'function'
}
