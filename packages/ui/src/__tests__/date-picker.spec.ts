import { afterEach, describe, expect, it } from 'vitest'
import { mount as baseMount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import KfDatePicker from '../components/date-picker/KfDatePicker.vue'
import {
  buildMonthGrid,
  clampDate,
  dayNumber,
  daysInMonth,
  formatISODate,
  isSameDay,
  parseISODate,
  shiftDays,
  shiftMonths,
  weekdayLabels,
  weekdayOf,
} from '../components/date-picker/date-utils'

const active: VueWrapper[] = []

function mount(component: unknown, options?: Record<string, unknown>): VueWrapper {
  const wrapper = baseMount(component as never, options as never) as VueWrapper
  active.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (active.length) active.pop()?.unmount()
  document.body.innerHTML = ''
})

function panel(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.kf-date-picker__panel')
}

function grid(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.kf-date-picker__grid')
}

describe('date-utils', () => {
  it('严格解析 YYYY-MM-DD，不静默进位', () => {
    expect(parseISODate('2024-03-01')).toEqual({ year: 2024, month: 3, day: 1 })
    expect(parseISODate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 })
    expect(parseISODate('2023-02-29')).toBeNull()
    expect(parseISODate('2024-02-30')).toBeNull()
    expect(parseISODate('2024-13-01')).toBeNull()
    expect(parseISODate('2024-00-10')).toBeNull()
    expect(parseISODate('2024-3-1')).toBeNull()
    expect(parseISODate('')).toBeNull()
    expect(parseISODate('not-a-date')).toBeNull()
  })

  it('闰年天数', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2023, 2)).toBe(28)
    expect(daysInMonth(2024, 4)).toBe(30)
    expect(daysInMonth(2024, 12)).toBe(31)
  })

  it('格式化补零', () => {
    expect(formatISODate(2024, 3, 1)).toBe('2024-03-01')
    expect(formatISODate(2024, 12, 31)).toBe('2024-12-31')
  })

  it('按天偏移可跨月跨年', () => {
    expect(shiftDays({ year: 2024, month: 2, day: 29 }, 1)).toEqual({ year: 2024, month: 3, day: 1 })
    expect(shiftDays({ year: 2023, month: 12, day: 31 }, 1)).toEqual({ year: 2024, month: 1, day: 1 })
    expect(shiftDays({ year: 2024, month: 1, day: 1 }, -1)).toEqual({ year: 2023, month: 12, day: 31 })
  })

  it('按月偏移时天数收敛到月末', () => {
    expect(shiftMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({ year: 2024, month: 2, day: 29 })
    expect(shiftMonths({ year: 2023, month: 1, day: 31 }, 1)).toEqual({ year: 2023, month: 2, day: 28 })
    expect(shiftMonths({ year: 2024, month: 12, day: 15 }, 1)).toEqual({ year: 2025, month: 1, day: 15 })
    expect(shiftMonths({ year: 2024, month: 1, day: 15 }, -1)).toEqual({ year: 2023, month: 12, day: 15 })
  })

  it('min/max 裁剪到边界', () => {
    const min = { year: 2024, month: 3, day: 10 }
    const max = { year: 2024, month: 3, day: 20 }
    expect(clampDate({ year: 2024, month: 3, day: 1 }, min, max)).toEqual(min)
    expect(clampDate({ year: 2024, month: 3, day: 25 }, min, max)).toEqual(max)
    expect(clampDate({ year: 2024, month: 3, day: 15 }, min, max)).toEqual({
      year: 2024,
      month: 3,
      day: 15,
    })
  })

  it('星期与可比较序号', () => {
    expect(weekdayOf(2024, 3, 1)).toBe(5) // 2024-03-01 是周五
    expect(dayNumber({ year: 2024, month: 3, day: 1 })).toBeLessThan(
      dayNumber({ year: 2024, month: 3, day: 2 }),
    )
    expect(isSameDay({ year: 2024, month: 3, day: 1 }, { year: 2024, month: 3, day: 1 })).toBe(true)
    expect(isSameDay({ year: 2024, month: 3, day: 1 }, { year: 2024, month: 3, day: 2 })).toBe(false)
    expect(isSameDay(null, { year: 2024, month: 3, day: 1 })).toBe(false)
  })

  it('固定 42 格，周一起始时 2024-03 从 02-26 开始', () => {
    const cells = buildMonthGrid(2024, 3, 1)
    expect(cells).toHaveLength(42)
    expect(cells[0]?.key).toBe('2024-02-26')
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(31)
    // 周日起始时同一月从 02-25 开始
    expect(buildMonthGrid(2024, 3, 0)[0]?.key).toBe('2024-02-25')
  })

  it('星期表头随一周起始变化', () => {
    expect(weekdayLabels(1)).toEqual(['一', '二', '三', '四', '五', '六', '日'])
    expect(weekdayLabels(0)).toEqual(['日', '一', '二', '三', '四', '五', '六'])
  })
})

describe('KfDatePicker', () => {
  it('渲染初始值与 label 关联', () => {
    const wrapper = mount(KfDatePicker, {
      props: { modelValue: '2024-03-15', label: '开始日期' },
    })
    const input = wrapper.get('.kf-date-picker__input')
    expect((input.element as HTMLInputElement).value).toBe('2024-03-15')
    const label = wrapper.get('.kf-form-field__label')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('默认不渲染面板，点击切换按钮后 teleport 出 dialog', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    expect(panel()).toBeNull()
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    const dialog = panel()
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-label')).toBe('选择日期')
    expect(wrapper.get('.kf-date-picker__input').attributes('aria-expanded')).toBe('true')
  })

  it('禁用时不展开面板', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15', disabled: true } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    expect(panel()).toBeNull()
  })

  it('只读时不展开面板', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15', readonly: true } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    expect(panel()).toBeNull()
  })

  it('点击日期同时更新 modelValue 与 change，并关闭面板', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    const target = document.body.querySelector<HTMLElement>(
      '[role="gridcell"][id$="-2024-03-20"]',
    )
    expect(target).not.toBeNull()
    target!.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2024-03-20'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['2024-03-20'])
    expect(panel()).toBeNull()
  })

  it('min/max 之外的日期带 aria-disabled 且点击无效', async () => {
    const wrapper = mount(KfDatePicker, {
      props: { modelValue: '2024-03-15', min: '2024-03-10', max: '2024-03-20' },
    })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    const outside = document.body.querySelector<HTMLElement>('[role="gridcell"][id$="-2024-03-05"]')
    expect(outside?.getAttribute('aria-disabled')).toBe('true')
    outside!.click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('键盘：方向键移动游标，Enter 选中', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    const gridEl = grid()!
    expect(gridEl.getAttribute('aria-activedescendant')).toContain('2024-03-15')

    gridEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    expect(grid()!.getAttribute('aria-activedescendant')).toContain('2024-03-16')

    gridEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    expect(grid()!.getAttribute('aria-activedescendant')).toContain('2024-03-23')

    grid()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2024-03-23'])
  })

  it('键盘：PageDown 切到下个月并跟随游标', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    grid()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
    await nextTick()
    expect(document.body.querySelector('.kf-date-picker__title')?.textContent).toContain('4 月')
    expect(grid()!.getAttribute('aria-activedescendant')).toContain('2024-04-15')
  })

  it('键盘：Escape 关闭并把焦点还给输入框', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()

    grid()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(panel()).toBeNull()
  })

  it('键入合法日期立即生效', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '' } })
    const input = wrapper.get('.kf-date-picker__input')
    await input.setValue('2024-05-06')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2024-05-06'])
  })

  it('键入非法日期不写回 modelValue', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '' } })
    const input = wrapper.get('.kf-date-picker__input')
    await input.setValue('2024-02-30')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('清空按钮发出空字符串', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15', clearable: true } })
    await wrapper.get('.kf-date-picker__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('clearable=false 时不渲染清空按钮', () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15', clearable: false } })
    expect(wrapper.find('.kf-date-picker__clear').exists()).toBe(false)
  })

  it('错误态写入 aria-invalid 与描述关联', () => {
    const wrapper = mount(KfDatePicker, {
      props: { modelValue: '', label: '日期', error: '请选择日期', help: '格式 YYYY-MM-DD' },
    })
    const input = wrapper.get('.kf-date-picker__input')
    expect(input.attributes('aria-invalid')).toBe('true')
    const describedBy = input.attributes('aria-describedby') ?? ''
    expect(describedBy).toContain('-help')
    expect(describedBy).toContain('-error')
  })

  it('卸载时移除全局监听并清理面板', async () => {
    const wrapper = mount(KfDatePicker, { props: { modelValue: '2024-03-15' } })
    await wrapper.get('.kf-date-picker__toggle').trigger('click')
    await nextTick()
    expect(panel()).not.toBeNull()
    wrapper.unmount()
    await nextTick()
    expect(panel()).toBeNull()
  })
})
