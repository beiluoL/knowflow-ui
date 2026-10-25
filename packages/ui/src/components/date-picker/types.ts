/**
 * KfDatePicker 公共类型。
 *
 * 值域是 `YYYY-MM-DD` 字符串（与 KnowFlow 原 DatePicker 的契约一致），
 * 组件内部只用「年 / 月 / 日」三个整数做运算，不暴露 Date 对象，
 * 避免宿主把时区问题带进来。
 */

export interface KfDatePickerProps {
  /** 受控值，格式 YYYY-MM-DD；空字符串表示未选 */
  modelValue?: string
  /** 字段标签 */
  label?: string
  placeholder?: string
  /** 辅助说明 */
  help?: string
  /** 错误信息（aria-invalid + aria-describedby） */
  error?: string
  disabled?: boolean
  /** 只读：可聚焦、可复制，但不能改值也不能打开日历 */
  readonly?: boolean
  required?: boolean
  /** 显示清空按钮与「清除」动作 */
  clearable?: boolean
  /** 最小可选日期（含），YYYY-MM-DD */
  min?: string
  /** 最大可选日期（含），YYYY-MM-DD */
  max?: string
  /** 一周从周几开始：0=周日，1=周一 */
  weekStartsOn?: 0 | 1
  /** 无可见 label 时的可访问名称 */
  ariaLabel?: string
}

export interface KfDatePickerEmits {
  'update:modelValue': [value: string]
  /** 值真正变化时触发（含清空 → 空字符串） */
  change: [value: string]
}

export interface KfDatePickerSlots {
  /** 追加到说明区右侧 */
  meta?: () => unknown
}

/** 日历单元（内部与测试共用） */
export interface KfCalendarDay {
  /** YYYY-MM-DD */
  key: string
  year: number
  /** 1-12 */
  month: number
  day: number
  /** 是否属于当前展示月 */
  inMonth: boolean
}
