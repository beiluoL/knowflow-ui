/**
 * 展示层格式化工具（仅做无副作用的纯计算，不做本地化/时区耦合）。
 */

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/**
 * 字节数 → 紧凑可读文本。
 * 只用于附件卡片等展示场景；不确定值（负数/NaN）返回空串，避免渲染 "NaN KB"。
 */
export function formatBytes(bytes?: number | null): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`

  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded} ${UNITS[unit]}`
}

/** 分数（0–1）→ 百分比整数字符串；非法值返回空串，避免把 undefined 渲染成 "NaN%" */
export function formatScore(score?: number | null): string {
  if (typeof score !== 'number' || !Number.isFinite(score)) return ''
  const clamped = Math.min(1, Math.max(0, score))
  return `${Math.round(clamped * 100)}%`
}
