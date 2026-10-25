/**
 * Icon registry — 内置图标 + 运行时扩展。
 *
 * 设计取舍：
 *   - 内置图标是编译期常量（icons.generated.ts），保证类型安全且可被消费方 tree-shake；
 *   - 业务自定义图标通过 registerIcon() 注册，避免为了定制图标去 fork 组件库；
 *   - 不依赖任何图标字体 / iconfont CSS，SVG 内联渲染，尺寸与颜色可控。
 */
import { ICON_SVG, type BuiltinIconName } from './icons.generated'

export type BuiltinIconNameMap = typeof ICON_SVG
export type { BuiltinIconName }

/** 运行时注册的图标（业务方自定义） */
const customIcons = new Map<string, string>()

/**
 * 注册自定义图标。
 * @param name 图标名（建议 kebab-case）
 * @param markup 24×24 viewBox 下的 SVG 内部标记（不含 <svg> 外层）
 */
export function registerIcon(name: string, markup: string): void {
  const trimmed = markup.trim()
  if (!name) throw new Error('[knowflow-ui] registerIcon: name is required')
  if (!trimmed) throw new Error(`[knowflow-ui] registerIcon: markup is required for "${name}"`)
  customIcons.set(name, trimmed)
}

/** 移除已注册的自定义图标（测试与热更新场景） */
export function unregisterIcon(name: string): void {
  customIcons.delete(name)
}

/** 判断是否为内置图标名 */
export function isBuiltinIcon(name: string): name is BuiltinIconName {
  return Object.prototype.hasOwnProperty.call(ICON_SVG, name)
}

/** 取图标内部标记；未注册返回 undefined */
export function getIconMarkup(name: string): string | undefined {
  if (isBuiltinIcon(name)) return ICON_SVG[name]
  return customIcons.get(name)
}

/** 当前可用图标名（内置 + 自定义），Studio 图标墙使用 */
export function listIconNames(): string[] {
  return [...Object.keys(ICON_SVG), ...customIcons.keys()]
}
