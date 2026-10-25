/**
 * KnowFlow Tokens — token index (no values duplicated here).
 *
 * 为什么只存令牌名：数值唯一来源是 tokens.css，Studio 通过
 * getComputedStyle 读取运行时真实值，避免 JS 常量与 CSS 漂移。
 */

export interface TokenGroup {
  /** 分组标题（Studio 分区） */
  title: string
  /** 说明 */
  note: string
  /** 令牌名（含 --kf- 前缀） */
  tokens: string[]
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: 'Color · Brand',
    note: '主色与品牌衍生色；深色模式由 [data-theme="dark"] 覆盖。',
    tokens: [
      '--kf-primary',
      '--kf-primary-foreground',
      '--kf-primary-hover',
      '--kf-primary-active',
      '--kf-primary-soft',
      '--kf-primary-subtle',
      '--kf-ring',
    ],
  },
  {
    title: 'Color · Surface & Text',
    note: '页面/卡片/侧栏层级与正文、次要文字。',
    tokens: [
      '--kf-background',
      '--kf-foreground',
      '--kf-card',
      '--kf-card-foreground',
      '--kf-sidebar',
      '--kf-muted',
      '--kf-muted-foreground',
      '--kf-border',
    ],
  },
  {
    title: 'Color · Semantic',
    note: '成功/警告/危险/信息四类状态色。',
    tokens: [
      '--kf-accent',
      '--kf-state-success',
      '--kf-warning',
      '--kf-state-warning',
      '--kf-destructive',
      '--kf-danger-text',
      '--kf-state-error',
      '--kf-state-info',
    ],
  },
  {
    title: 'Typography',
    note: '字号/行高/字重阶梯，根字号 14px。',
    tokens: [
      '--kf-font-sans',
      '--kf-font-mono',
      '--kf-fs-h1',
      '--kf-fs-h2',
      '--kf-fs-h3',
      '--kf-fs-h4',
      '--kf-fs-body-lg',
      '--kf-fs-body-md',
      '--kf-fs-body-sm',
      '--kf-fs-caption',
      '--kf-fs-xs',
      '--kf-fw-label',
    ],
  },
  {
    title: 'Spacing & Radius',
    note: '4px 基线网格与圆角阶梯。',
    tokens: [
      '--kf-space-1',
      '--kf-space-2',
      '--kf-space-3',
      '--kf-space-4',
      '--kf-space-5',
      '--kf-space-6',
      '--kf-space-8',
      '--kf-radius-xs',
      '--kf-radius-sm',
      '--kf-radius-md',
      '--kf-radius-lg',
      '--kf-radius-xl',
    ],
  },
  {
    title: 'Component · Button',
    note: '三档高度 32/38/44，内边距 12/16/24，图标槽 18。',
    tokens: [
      '--kf-button-height-sm',
      '--kf-button-height-md',
      '--kf-button-height-lg',
      '--kf-button-padding-sm',
      '--kf-button-padding-md',
      '--kf-button-padding-lg',
      '--kf-button-radius',
      '--kf-button-gap',
      '--kf-button-line-height',
      '--kf-button-icon-slot',
    ],
  },
  {
    title: 'Component · Input',
    note: '浅灰表面、44px 高、12px 内边距、无聚焦外框。',
    tokens: [
      '--kf-input-height',
      '--kf-field-radius',
      '--kf-field-padding',
      '--kf-field-surface',
      '--kf-field-hover',
      '--kf-field-active',
      '--kf-field-disabled',
      '--kf-field-error-bg',
      '--kf-field-placeholder',
    ],
  },
  {
    title: 'Component · Checkbox',
    note: '20×20 方框、3px 圆角、8px 文字间距、可见键盘焦点。',
    tokens: [
      '--kf-checkbox-size',
      '--kf-checkbox-radius',
      '--kf-checkbox-border-width',
      '--kf-checkbox-mark-size',
      '--kf-checkbox-gap',
      '--kf-checkbox-hit-size',
      '--kf-checkbox-touch-size',
      '--kf-checkbox-focus-width',
      '--kf-checkbox-focus-offset',
    ],
  },
]

/** 读取当前主题下的真实令牌值（浏览器环境） */
export function readTokenValues(names: string[], el: HTMLElement | null = null): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const target = el ?? document.documentElement
  const style = window.getComputedStyle(target)
  const out: Record<string, string> = {}
  for (const name of names) out[name] = style.getPropertyValue(name).trim()
  return out
}
