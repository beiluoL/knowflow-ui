<template>
  <KfFormField
    :control-id="inputId"
    :label="label"
    :required="required"
    :help="help"
    :error="error"
  >
    <div
      ref="root"
      class="kf-date-picker"
      :class="{
        'kf-date-picker--open': open,
        'kf-date-picker--disabled': disabled,
        'kf-date-picker--readonly': readonly,
        'kf-date-picker--error': !!error,
      }"
    >
      <div class="kf-date-picker__control">
        <KfIcon name="calendar" :size="16" class="kf-date-picker__icon" aria-hidden="true" />
        <input
          :id="inputId"
          ref="inputEl"
          class="kf-date-picker__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          :value="text"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :aria-label="ariaLabel || (!label ? placeholder : undefined)"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="descriptionId"
          aria-haspopup="dialog"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-controls="open ? panelId : undefined"
          @input="onInput"
          @keydown="onInputKeydown"
          @blur="onInputBlur"
        />
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="kf-date-picker__clear"
          aria-label="清空日期"
          @click="clear"
        >
          <KfIcon name="x" :size="13" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="kf-date-picker__toggle"
          :aria-label="open ? '收起日历' : '打开日历'"
          :aria-expanded="open ? 'true' : 'false'"
          :disabled="disabled || readonly"
          @click="toggle"
        >
          <KfIcon name="chevron-down" :size="14" aria-hidden="true" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="open"
        :id="panelId"
        ref="panelEl"
        class="kf-date-picker__panel"
        role="dialog"
        aria-label="选择日期"
        :style="panelStyle"
        @mousedown.prevent
      >
        <div class="kf-date-picker__header">
          <button
            type="button"
            class="kf-date-picker__nav"
            aria-label="上一个月"
            @click="stepMonth(-1)"
          >
            <KfIcon name="chevron-left" :size="16" aria-hidden="true" />
          </button>
          <div class="kf-date-picker__title" aria-live="polite">{{ title }}</div>
          <button type="button" class="kf-date-picker__nav" aria-label="下一个月" @click="stepMonth(1)">
            <KfIcon name="chevron-right" :size="16" aria-hidden="true" />
          </button>
        </div>

        <div class="kf-date-picker__weekdays" aria-hidden="true">
          <span v-for="label in weekdays" :key="label" class="kf-date-picker__weekday">{{ label }}</span>
        </div>

        <div
          ref="gridEl"
          class="kf-date-picker__grid"
          role="grid"
          :aria-label="title"
          tabindex="0"
          :aria-activedescendant="activeCellId"
          @keydown="onGridKeydown"
        >
          <div
            v-for="cell in cells"
            :id="cellId(cell.key)"
            :key="cell.key"
            role="gridcell"
            class="kf-date-picker__day"
            :class="{
              'kf-date-picker__day--outside': !cell.inMonth,
              'kf-date-picker__day--selected': cell.key === modelValue,
              'kf-date-picker__day--today': cell.key === todayKey,
              'kf-date-picker__day--cursor': cell.key === cursorKey,
              'kf-date-picker__day--disabled': isOutOfRange(cell.key),
            }"
            :aria-selected="cell.key === modelValue ? 'true' : 'false'"
            :aria-disabled="isOutOfRange(cell.key) ? 'true' : undefined"
            :aria-current="cell.key === todayKey ? 'date' : undefined"
            @click="pick(cell.key)"
            @mousemove="moveCursorTo(cell.key)"
          >
            {{ cell.day }}
          </div>
        </div>

        <div class="kf-date-picker__footer">
          <button type="button" class="kf-date-picker__action" @click="pick(todayKey)">今天</button>
          <button
            v-if="clearable"
            type="button"
            class="kf-date-picker__action"
            :disabled="!modelValue"
            @click="clear"
          >
            清除
          </button>
        </div>
      </div>
    </Teleport>

    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfDatePicker — 日期选择（YYYY-MM-DD）。
 *
 * 交互契约迁移自 KnowFlow frontend/src/components/ui/DatePicker.vue，但重新实现：
 *   - 输入框可直接键入 2024-03-01，非法日期不落在 modelValue 上（不会静默进位）；
 *   - 日历面板 role=dialog + 内部 role=grid，`aria-activedescendant` 指向游标日期；
 *   - 键盘：←→ 一天、↑↓ 一周、PageUp/PageDown 一月、Home/End 一周首尾、Enter 选中、Esc 关闭；
 *   - min/max 之外的日期渲染为 aria-disabled，点击与 Enter 都不生效；
 *   - 面板 Teleport 到 body 并 fixed 定位，视口下方放不下时翻转到上方；
 *   - 卸载时移除 scroll / resize / mousedown 监听，不留全局副作用。
 *
 * 不负责：范围选择、时间选择、时区换算、本地化文案（只提供中文）。
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import KfFormField from '../form-field/KfFormField.vue'
import KfIcon from '../icon/KfIcon.vue'
import { nextInstanceId } from '../shared/instance'
import {
  buildMonthGrid,
  clampDate,
  dayNumber,
  formatISODate,
  monthTitle,
  parseISODate,
  shiftDays,
  shiftMonths,
  today,
  weekdayLabels,
  weekdayOf,
  type Ymd,
} from './date-utils'
import type { KfDatePickerEmits, KfDatePickerProps } from './types'

const props = withDefaults(defineProps<KfDatePickerProps>(), {
  modelValue: '',
  label: '',
  placeholder: '选择日期',
  help: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  clearable: true,
  min: '',
  max: '',
  weekStartsOn: 1,
  ariaLabel: '',
})

const emit = defineEmits<KfDatePickerEmits>()

const uid = nextInstanceId()
const inputId = `kf-date-picker-input-${uid}`
const panelId = `kf-date-picker-panel-${uid}`
const gridId = `kf-date-picker-grid-${uid}`

const descriptionId = computed(
  () =>
    [props.help ? `${inputId}-help` : undefined, props.error ? `${inputId}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)

const root = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)

const open = ref(false)
const text = ref(props.modelValue)
const coords = ref({ left: 0, top: 0, width: 0 })

const minDate = computed(() => parseISODate(props.min))
const maxDate = computed(() => parseISODate(props.max))
const todayKey = formatISODate(today().year, today().month, today().day)

const initial = parseISODate(props.modelValue) ?? clampDate(today(), minDate.value, maxDate.value)
const view = ref<Ymd>({ ...initial })
const cursor = ref<Ymd>({ ...initial })

const weekdays = computed(() => weekdayLabels(props.weekStartsOn))
const title = computed(() => monthTitle(view.value.year, view.value.month))
const cells = computed(() => buildMonthGrid(view.value.year, view.value.month, props.weekStartsOn))
const cursorKey = computed(() => formatISODate(cursor.value.year, cursor.value.month, cursor.value.day))
const activeCellId = computed(() => cellId(cursorKey.value))

const panelStyle = computed(() => ({
  left: `${coords.value.left}px`,
  top: `${coords.value.top}px`,
  minWidth: `${Math.max(coords.value.width, 272)}px`,
}))

function cellId(key: string): string {
  return `${gridId}-${key}`
}

function isOutOfRange(key: string): boolean {
  const target = parseISODate(key)
  if (!target) return true
  const value = dayNumber(target)
  if (minDate.value && value < dayNumber(minDate.value)) return true
  if (maxDate.value && value > dayNumber(maxDate.value)) return true
  return false
}

function place(): void {
  const anchor = root.value
  if (!anchor) return
  const rect = anchor.getBoundingClientRect()
  const height = panelEl.value?.offsetHeight ?? 320
  const gap = 6
  const below = rect.bottom + gap
  const above = rect.top - height - gap
  const width = Math.max(rect.width, 272)
  coords.value = {
    left: Math.max(gap, Math.min(rect.left, window.innerWidth - width - gap)),
    top: below + height > window.innerHeight && above > gap ? above : below,
    width: rect.width,
  }
}

function onDocumentDown(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!target) return
  if (root.value?.contains(target) || panelEl.value?.contains(target)) return
  closePanel()
}

function closePanel(restoreFocus = false): void {
  if (!open.value) return
  open.value = false
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
  document.removeEventListener('mousedown', onDocumentDown, true)
  if (restoreFocus) inputEl.value?.focus()
}

async function openPanel(): Promise<void> {
  if (props.disabled || props.readonly || open.value) return
  const base = parseISODate(props.modelValue) ?? clampDate(today(), minDate.value, maxDate.value)
  view.value = { ...base }
  cursor.value = { ...base }
  open.value = true
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)
  document.addEventListener('mousedown', onDocumentDown, true)
  await nextTick()
  place()
  gridEl.value?.focus()
}

function toggle(): void {
  if (open.value) closePanel()
  else void openPanel()
}

function commit(value: string): void {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}

function pick(key: string): void {
  if (isOutOfRange(key)) return
  text.value = key
  commit(key)
  closePanel(true)
}

function clear(): void {
  text.value = ''
  commit('')
  closePanel(true)
}

function moveCursorTo(key: string): void {
  const target = parseISODate(key)
  if (target) cursor.value = { ...target }
}

function applyCursor(next: Ymd): void {
  cursor.value = next
  view.value = { year: next.year, month: next.month, day: 1 }
}

function stepMonth(delta: number): void {
  const next = shiftMonths({ year: view.value.year, month: view.value.month, day: 1 }, delta)
  view.value = { year: next.year, month: next.month, day: 1 }
  cursor.value = { ...next }
}

function onGridKeydown(event: KeyboardEvent): void {
  const key = event.key
  const current = cursor.value
  const offset = (weekdayOf(current.year, current.month, current.day) - props.weekStartsOn + 7) % 7
  switch (key) {
    case 'ArrowLeft':
      applyCursor(shiftDays(current, -1))
      break
    case 'ArrowRight':
      applyCursor(shiftDays(current, 1))
      break
    case 'ArrowUp':
      applyCursor(shiftDays(current, -7))
      break
    case 'ArrowDown':
      applyCursor(shiftDays(current, 7))
      break
    case 'PageUp':
      applyCursor(shiftMonths(current, -1))
      break
    case 'PageDown':
      applyCursor(shiftMonths(current, 1))
      break
    case 'Home':
      applyCursor(shiftDays(current, -offset))
      break
    case 'End':
      applyCursor(shiftDays(current, 6 - offset))
      break
    case 'Enter':
    case ' ':
      pick(cursorKey.value)
      break
    case 'Escape':
      closePanel(true)
      break
    case 'Tab':
      closePanel()
      return
    default:
      return
  }
  event.preventDefault()
}

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  text.value = value
  const parsed = parseISODate(value)
  if (!parsed) return
  if (isOutOfRange(formatISODate(parsed.year, parsed.month, parsed.day))) return
  moveCursorTo(value)
  view.value = { ...parsed }
  commit(value)
}

function onInputBlur(): void {
  // 面板内点击时 mousedown 已 preventDefault，不会触发这里的回填
  if (text.value !== props.modelValue) text.value = props.modelValue
}

function onInputKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' && !open.value) {
    event.preventDefault()
    void openPanel()
    return
  }
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closePanel(true)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const parsed = parseISODate(text.value)
    if (!parsed) {
      text.value = props.modelValue
      return
    }
    const key = formatISODate(parsed.year, parsed.month, parsed.day)
    if (isOutOfRange(key)) {
      text.value = props.modelValue
      return
    }
    commit(key)
    closePanel(true)
  }
}

watch(
  () => props.modelValue,
  (value) => {
    text.value = value
    const parsed = parseISODate(value)
    if (parsed && !open.value) {
      view.value = { ...parsed }
      cursor.value = { ...parsed }
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
  document.removeEventListener('mousedown', onDocumentDown, true)
})
</script>

<style scoped>
.kf-date-picker {
  width: 100%;
  min-width: 0;
}
.kf-date-picker__control {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2, 8px);
  box-sizing: border-box;
  width: 100%;
  min-height: var(--kf-input-height, 44px);
  padding: 0 var(--kf-field-padding, 12px);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-field-radius, 8px);
  background: var(--kf-field-surface);
  transition: border-color var(--kf-motion-fast, 120ms) ease;
}
.kf-date-picker__control:hover {
  border-color: var(--kf-field-hover, var(--kf-border));
}
.kf-date-picker--open .kf-date-picker__control,
.kf-date-picker__control:focus-within {
  border-color: var(--kf-primary);
  box-shadow: var(--kf-focus-ring, 0 0 0 3px var(--kf-primary-soft));
}
.kf-date-picker--error .kf-date-picker__control {
  border-color: var(--kf-destructive);
  background: var(--kf-field-error-bg, var(--kf-field-surface));
}
.kf-date-picker--disabled .kf-date-picker__control {
  background: var(--kf-field-disabled);
  cursor: not-allowed;
}
.kf-date-picker__icon {
  flex: none;
  color: var(--kf-muted-foreground);
}
.kf-date-picker__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md, 14px);
  outline: 0;
}
.kf-date-picker__input::placeholder {
  color: var(--kf-field-placeholder);
}
.kf-date-picker__input:disabled {
  cursor: not-allowed;
}
.kf-date-picker__clear,
.kf-date-picker__toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-full, 999px);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-date-picker__clear:hover,
.kf-date-picker__toggle:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-date-picker__toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.kf-date-picker__panel {
  position: fixed;
  z-index: var(--kf-z-overlay, 1000);
  box-sizing: border-box;
  width: 272px;
  padding: var(--kf-space-2, 8px);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-menu-radius, 10px);
  background: var(--kf-menu-surface, var(--kf-card));
  box-shadow: var(--kf-menu-shadow);
  font-family: var(--kf-font-sans);
}
.kf-date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2, 8px);
  padding: 0 2px var(--kf-space-2, 8px);
}
.kf-date-picker__title {
  flex: 1;
  min-width: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm, 13px);
  font-weight: var(--kf-fw-label, 500);
  text-align: center;
}
.kf-date-picker__nav {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-sm, 6px);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-date-picker__nav:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-date-picker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding-bottom: 4px;
}
.kf-date-picker__weekday {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption, 12px);
  text-align: center;
}
.kf-date-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  border-radius: var(--kf-radius-sm, 6px);
  outline: 0;
}
.kf-date-picker__grid:focus-visible {
  box-shadow: var(--kf-focus-ring, 0 0 0 3px var(--kf-primary-soft));
}
.kf-date-picker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border-radius: var(--kf-radius-sm, 6px);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm, 13px);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  user-select: none;
}
.kf-date-picker__day:hover {
  background: var(--kf-muted);
}
.kf-date-picker__day--outside {
  color: var(--kf-muted-foreground);
  opacity: 0.6;
}
.kf-date-picker__day--today {
  box-shadow: inset 0 0 0 1px var(--kf-primary);
}
.kf-date-picker__day--cursor {
  outline: 1px dashed var(--kf-primary);
  outline-offset: -2px;
}
.kf-date-picker__day--selected {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground, #fff);
  font-weight: var(--kf-fw-label, 500);
}
.kf-date-picker__day--selected:hover {
  background: var(--kf-primary-hover, var(--kf-primary));
}
.kf-date-picker__day--disabled {
  color: var(--kf-muted-foreground);
  opacity: 0.35;
  cursor: not-allowed;
}
.kf-date-picker__day--disabled:hover {
  background: transparent;
}
.kf-date-picker__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--kf-space-1, 4px);
  padding-top: var(--kf-space-2, 8px);
  border-top: 1px solid var(--kf-border);
  margin-top: var(--kf-space-2, 8px);
}
.kf-date-picker__action {
  height: 26px;
  padding: 0 var(--kf-space-2, 8px);
  border: 0;
  border-radius: var(--kf-radius-sm, 6px);
  background: transparent;
  color: var(--kf-primary);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-caption, 12px);
  cursor: pointer;
}
.kf-date-picker__action:hover:not(:disabled) {
  background: var(--kf-primary-soft);
}
.kf-date-picker__action:disabled {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
@media (forced-colors: active) {
  .kf-date-picker__day--selected {
    border: 2px solid CanvasText;
  }
}
</style>
