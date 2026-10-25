<template>
  <KfFormField
    :control-id="inputId"
    :label="label"
    :required="false"
    :help="help"
    :error="error"
  >
    <div
      class="kf-number-input"
      :class="{ 'kf-number-input--error': !!error, 'kf-number-input--disabled': disabled }"
    >
      <button
        v-if="showControls"
        type="button"
        class="kf-number-input__step"
        aria-label="减少"
        :disabled="disabled || readonly || atMin"
        tabindex="-1"
        @click="nudge(-1)"
      >
        <KfIcon name="minus" :size="14" aria-hidden="true" />
      </button>
      <input
        :id="inputId"
        class="kf-number-input__control"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :value="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-label="ariaLabel || label || undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="descriptionId"
        role="spinbutton"
        :aria-valuenow="modelValue ?? undefined"
        :aria-valuemin="ariaMin"
        :aria-valuemax="ariaMax"
        @input="onInput"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <button
        v-if="showControls"
        type="button"
        class="kf-number-input__step"
        aria-label="增加"
        :disabled="disabled || readonly || atMax"
        tabindex="-1"
        @click="nudge(1)"
      >
        <KfIcon name="plus" :size="14" aria-hidden="true" />
      </button>
    </div>
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfNumberInput — 数字输入。
 *
 * 对应 V5 的 NumberInput 条目（原项目只有 Demo）。
 * 与「直接 type=number」的三个区别，都是为了修真实问题：
 *   1. 空值保持 null：type=number 在清空时给 ''，宿主拿到后常常变成 NaN 再写进后端；
 *   2. 输入中间态（"-"、"1."）先留在本地文本里，不强行 emit 半个数字；
 *   3. 步进与 clamp 在失焦时统一收敛，并遵守 min/max/precision。
 * 语义上用 role="spinbutton" + aria-valuenow，键盘 ↑↓ 可用。
 */
import { computed, ref, useId, watch } from 'vue'
import KfFormField from '../form-field/KfFormField.vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfNumberInputEmits, KfNumberInputProps } from './types'

const props = withDefaults(defineProps<KfNumberInputProps>(), {
  modelValue: null,
  min: -Infinity,
  max: Infinity,
  step: 1,
  precision: 0,
  disabled: false,
  readonly: false,
  label: '',
  placeholder: '',
  help: '',
  error: '',
  showControls: true,
  ariaLabel: '',
})

const emit = defineEmits<KfNumberInputEmits>()

const inputId = `kf-number-input-${useId()}`
const descriptionId = computed(
  () =>
    [props.help ? `${inputId}-help` : undefined, props.error ? `${inputId}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)

function format(value: number | null): string {
  if (value === null || Number.isNaN(value)) return ''
  return props.precision > 0 ? value.toFixed(props.precision) : String(value)
}

const text = ref(format(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    if (value === null || Number.isNaN(value as number)) {
      if (text.value !== '') text.value = ''
      return
    }
    // 只在与当前文本数字不相等时覆盖，避免打字时把 "1.0" 立刻改成 "1"
    if (Number(text.value) !== value) text.value = format(value)
  },
)

const atMin = computed(() => props.modelValue !== null && props.modelValue <= props.min)
const atMax = computed(() => props.modelValue !== null && props.modelValue >= props.max)
/** 无界时不输出 aria-valuemin/max，避免渲染出 "-Infinity" 这种非法值 */
const ariaMin = computed(() => (Number.isFinite(props.min) ? props.min : undefined))
const ariaMax = computed(() => (Number.isFinite(props.max) ? props.max : undefined))

function clamp(value: number): number {
  const bounded = Math.min(props.max, Math.max(props.min, value))
  if (props.precision <= 0) return Math.round(bounded)
  return Number(bounded.toFixed(props.precision))
}

function commit(value: number | null): void {
  emit('update:modelValue', value)
  emit('change', value)
}

function onInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  text.value = raw
  if (raw === '' || raw === '-') {
    commit(null)
    return
  }
  const parsed = Number(raw)
  if (!Number.isNaN(parsed)) commit(clamp(parsed))
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || props.readonly) return
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  nudge(event.key === 'ArrowUp' ? 1 : -1)
}

function nudge(direction: 1 | -1): void {
  if (props.disabled || props.readonly) return
  const base = props.modelValue ?? 0
  const next = clamp(base + direction * props.step)
  text.value = format(next)
  commit(next)
}

function onBlur(): void {
  if (text.value === '' || text.value === '-') {
    text.value = ''
    if (props.modelValue !== null) commit(null)
    return
  }
  const parsed = Number(text.value)
  const next = Number.isNaN(parsed) ? props.modelValue : clamp(parsed)
  text.value = format(next)
  if (next !== props.modelValue) commit(next)
}
</script>

<style scoped>
.kf-number-input {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: var(--kf-input-height);
  padding: 0 4px;
  border: 0;
  border-radius: var(--kf-field-radius);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  transition: background-color var(--kf-control-motion) ease;
}
.kf-number-input:focus-within {
  background: var(--kf-field-active);
}
.kf-number-input--error {
  background: var(--kf-field-error-bg);
}
.kf-number-input--disabled {
  background: var(--kf-field-disabled);
  color: var(--kf-muted-foreground);
}
.kf-number-input__step {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-number-input__step:hover:not(:disabled) {
  background: var(--kf-card);
  color: var(--kf-foreground);
}
.kf-number-input__step:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.kf-number-input__control {
  flex: 1;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0 var(--kf-space-1);
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  font-variant-numeric: tabular-nums;
  text-align: center;
  outline: 0;
}
.kf-number-input__control::placeholder {
  color: var(--kf-field-placeholder);
  opacity: 1;
}
@media (forced-colors: active) {
  .kf-number-input:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-number-input {
    transition: none;
  }
}
</style>
