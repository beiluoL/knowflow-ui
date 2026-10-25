/**
 * 日期纯函数工具 —— 只处理「年 / 月 / 日」整数，不引入任何日期库。
 *
 * 为什么不用 Date 做值：`new Date('2024-03-01')` 按 UTC 解析，在东八区会得到
 * 2 月 29 日 23:00。本模块统一用本地构造 `new Date(y, m - 1, d)` 并只用
 * getFullYear / getMonth / getDate 读回，跨时区不会漂移。
 *
 * 为什么单独成文件：日历网格、键盘漫游、min/max 裁剪都需要可单测的纯函数，
 * 组件里只做状态编排。
 */
import type { KfCalendarDay } from './types'

export interface Ymd {
  year: number
  /** 1-12 */
  month: number
  /** 1-31 */
  day: number
}

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

/** 该年该月的天数（month 为 1-12） */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 严格解析 `YYYY-MM-DD`：
 *   - 必须是 4-2-2 位数字；
 *   - 2 月 30 日、13 月这类不存在的日期返回 null（不做静默进位）。
 */
export function parseISODate(value: string): Ymd | null {
  const match = ISO_PATTERN.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function formatISODate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** 0=周日 … 6=周六 */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay()
}

/** 按天偏移（自动跨月 / 跨年，负数向前） */
export function shiftDays(value: Ymd, delta: number): Ymd {
  const date = new Date(value.year, value.month - 1, value.day + delta)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

/** 按月偏移；目标月天数不足时收敛到月末（1/31 + 1 月 → 2/28） */
export function shiftMonths(value: Ymd, delta: number): Ymd {
  const total = value.year * 12 + (value.month - 1) + delta
  const year = Math.floor(total / 12)
  const month = (total % 12 + 12) % 12 + 1
  const day = Math.min(value.day, daysInMonth(year, month))
  return { year, month, day }
}

/** 可比较的整数序（仅用于 min / max 裁剪） */
export function dayNumber(value: Ymd): number {
  return value.year * 10000 + value.month * 100 + value.day
}

/** 把日期裁剪到 [min, max]；越界时返回边界值 */
export function clampDate(value: Ymd, min?: Ymd | null, max?: Ymd | null): Ymd {
  const current = dayNumber(value)
  if (min && current < dayNumber(min)) return { ...min }
  if (max && current > dayNumber(max)) return { ...max }
  return { ...value }
}

export function isSameDay(a: Ymd | null, b: Ymd | null): boolean {
  if (!a || !b) return false
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/**
 * 生成 6×7 = 42 个格子（固定行数，避免切换月份时面板高度跳动）。
 * 前置补齐上月末尾、后置补齐下月开头，`inMonth` 标记归属。
 */
export function buildMonthGrid(year: number, month: number, weekStartsOn: 0 | 1): KfCalendarDay[] {
  const firstWeekday = weekdayOf(year, month, 1)
  const offset = (firstWeekday - weekStartsOn + 7) % 7
  const start = shiftDays({ year, month, day: 1 }, -offset)
  const cells: KfCalendarDay[] = []
  for (let index = 0; index < 42; index += 1) {
    const current = shiftDays(start, index)
    cells.push({
      key: formatISODate(current.year, current.month, current.day),
      year: current.year,
      month: current.month,
      day: current.day,
      inMonth: current.year === year && current.month === month,
    })
  }
  return cells
}

/** 星期表头（周一开头：一 二 三 四 五 六 日） */
export function weekdayLabels(weekStartsOn: 0 | 1): string[] {
  const base = ['一', '二', '三', '四', '五', '六', '日']
  if (weekStartsOn === 1) return base
  return [base[6], ...base.slice(0, 6)]
}

/** 本地「今天」，用于「今天」按钮与默认视图 */
export function today(): Ymd {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}

/** 面板标题：2024 年 3 月 */
export function monthTitle(year: number, month: number): string {
  return `${year} 年 ${month} 月`
}
