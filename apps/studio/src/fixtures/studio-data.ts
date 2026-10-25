/**
 * Studio 示例数据（fixtures）：只放"展示用的样例取值"，
 * 不放组件默认值 —— 默认值以各组件源码为准，避免两处维护。
 */
import type { PropOption } from '../stories/types'

/** Icon 页面属性面板可选图标 */
export const ICON_NAME_OPTIONS: PropOption[] = [
  'check',
  'plus',
  'search',
  'bell',
  'user',
  'settings',
  'calendar',
  'file-text',
  'folder',
  'book-open',
  'brain',
  'sparkles',
  'zap',
  'target',
  'graduation-cap',
  'github',
].map((name) => ({ label: name, value: name }))

export const ICON_SIZE_OPTIONS: PropOption[] = [
  { label: 'xxs · 10px', value: 'xxs' },
  { label: 'xs · 12px', value: 'xs' },
  { label: 'sm · 14px', value: 'sm' },
  { label: 'md · 16px（默认）', value: 'md' },
  { label: 'lg · 18px', value: 'lg' },
  { label: 'xl · 20px', value: 'xl' },
  { label: '2xl · 24px', value: '2xl' },
  { label: '3xl · 32px', value: '3xl' },
]

/** 语义色矩阵 */
export const SEMANTIC_ICON_ITEMS = [
  { label: 'primary', state: { name: 'check-circle', color: 'var(--kf-primary)' } },
  { label: 'success', state: { name: 'check-circle', color: 'var(--kf-state-success)' } },
  { label: 'warning', state: { name: 'alert-circle', color: 'var(--kf-state-warning)' } },
  { label: 'danger', state: { name: 'x-circle', color: 'var(--kf-danger-text)' } },
  { label: 'muted', state: { name: 'info', color: 'var(--kf-muted-foreground)' } },
]

/** 常用图标矩阵 */
export const COMMON_ICON_ITEMS = [
  'search',
  'bell',
  'calendar',
  'file-text',
  'brain',
  'flame',
  'graduation-cap',
  'github',
].map((name) => ({ label: name, state: { name } }))

/** Form 组件的示例文案 */
export const FORM_FIXTURES = {
  email: 'you@example.com',
  inviteCode: 'KF-2026',
  password: 'secret',
  nickname: '',
} as const
