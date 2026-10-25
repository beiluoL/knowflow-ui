/**
 * UI 包内部使用的展示格式化工具（不对外导出，避免成为公共 API 负担）。
 */

const UNITS = ['B', 'KB', 'MB', 'GB'] as const

/** 字节数 → 紧凑文本；非法值返回空串，避免渲染 "NaN KB" */
export function formatFileSize(bytes?: number | null): string {
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
