<template>
  <div
    class="kf-answer-options"
    :class="`kf-answer-options--${mode}`"
    :role="mode === 'single' ? 'radiogroup' : 'group'"
    :aria-label="ariaLabel"
  >
    <label
      v-for="(option, index) in options"
      :key="option.value"
      class="kf-answer-options__option"
      :class="[
        `kf-answer-options__option--${stateOf(option)}`,
        { 'kf-answer-options__option--disabled': disabled || option.disabled },
      ]"
    >
      <input
        class="kf-answer-options__input"
        :type="mode === 'single' ? 'radio' : 'checkbox'"
        :name="mode === 'single' ? groupName : undefined"
        :value="option.value"
        :checked="isChecked(option.value)"
        :disabled="disabled || option.disabled"
        @change="toggle(option)"
      />

      <span class="kf-answer-options__marker" aria-hidden="true">
        <KfIcon
          v-if="stateOf(option) === 'correct'"
          name="check"
          :size="12"
        />
        <KfIcon
          v-else-if="stateOf(option) === 'wrong'"
          name="x"
          :size="12"
        />
      </span>

      <span class="kf-answer-options__letter" aria-hidden="true">{{ letterOf(index) }}</span>

      <span class="kf-answer-options__body">
        <slot name="option" :option="option" :index="index" :state="stateOf(option)" :checked="isChecked(option.value)">
          <span class="kf-answer-options__label">{{ option.label }}</span>
          <span v-if="option.description" class="kf-answer-options__desc">{{ option.description }}</span>
        </slot>
      </span>

      <span v-if="isChecked(option.value) && !revealed" class="kf-answer-options__selected-hint">已选</span>
      <span v-else-if="stateOf(option) === 'missed'" class="kf-answer-options__selected-hint kf-answer-options__selected-hint--missed">
        漏选
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
/**
 * KfAnswerOptions — 答题选项组（单选 / 多选）。
 *
 * 用原生 radio / checkbox 而不是自绘 div：
 *   - 屏幕阅读器与键盘（Tab + 方向键）行为由浏览器保证；
 *   - 表单语义正确，宿主可以直接嵌进 <form>。
 * 组件只维护「选中了哪些 value」，不做对错判定 ——
 * 是否算对由宿主用 correctValues / 自己的评分逻辑决定，组件只负责着色。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { nextUid } from '../shared/uid'
import type {
  KfAnswerOption,
  KfAnswerOptionState,
  KfAnswerOptionsEmits,
  KfAnswerOptionsProps,
} from './types'

const props = withDefaults(defineProps<KfAnswerOptionsProps>(), {
  options: () => [],
  mode: 'single',
  modelValue: null,
  disabled: false,
  revealed: false,
  correctValues: () => [],
  name: '',
  ariaLabel: '选项',
})

const emit = defineEmits<KfAnswerOptionsEmits>()

const autoName = nextUid('kf-answer-options')
const groupName = computed(() => props.name || autoName)

const selectedValues = computed<string[]>(() => {
  if (props.modelValue === null || props.modelValue === undefined) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

const correctSet = computed(() => new Set(props.correctValues))

function isChecked(value: string): boolean {
  return selectedValues.value.includes(value)
}

function stateOf(option: KfAnswerOption): KfAnswerOptionState {
  const checked = isChecked(option.value)
  if (!props.revealed) return checked ? 'selected' : 'idle'
  const correct = correctSet.value.has(option.value)
  if (checked && correct) return 'correct'
  if (checked && !correct) return 'wrong'
  if (!checked && correct) return 'missed'
  return 'idle'
}

function letterOf(index: number): string {
  // 超过 26 个选项时循环 A–Z，避免出现乱码字符
  return String.fromCharCode(65 + (index % 26))
}

function toggle(option: KfAnswerOption): void {
  if (props.disabled || option.disabled) return

  if (props.mode === 'single') {
    emit('update:modelValue', option.value)
    emit('change', option.value, option)
    return
  }

  const next = selectedValues.value.includes(option.value)
    ? selectedValues.value.filter((value) => value !== option.value)
    : [...selectedValues.value, option.value]
  emit('update:modelValue', next)
  emit('change', next, option)
}
</script>

<style scoped>
.kf-answer-options {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-answer-options__option {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  padding: 10px var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  cursor: pointer;
  transition: border-color var(--kf-motion-fast) ease, background var(--kf-motion-fast) ease;
}
.kf-answer-options__option:hover {
  border-color: var(--kf-primary);
}
/* 原生 input 视觉隐藏但保留在可访问树中；焦点环画在整行上 */
.kf-answer-options__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
.kf-answer-options__option:has(.kf-answer-options__input:focus-visible) {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-answer-options__marker {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
  color: transparent;
}
.kf-answer-options--multiple .kf-answer-options__marker {
  border-radius: var(--kf-radius-xs);
}
.kf-answer-options__option--selected {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
}
.kf-answer-options__option--selected .kf-answer-options__marker {
  border-color: var(--kf-primary);
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-answer-options__option--correct {
  border-color: var(--kf-success);
  background: var(--kf-success-surface);
}
.kf-answer-options__option--correct .kf-answer-options__marker {
  border-color: var(--kf-success);
  background: var(--kf-success);
  color: var(--kf-primary-foreground);
}
.kf-answer-options__option--wrong {
  border-color: var(--kf-danger);
  background: var(--kf-danger-surface);
}
.kf-answer-options__option--wrong .kf-answer-options__marker {
  border-color: var(--kf-danger);
  background: var(--kf-danger);
  color: var(--kf-primary-foreground);
}
.kf-answer-options__option--missed {
  border-style: dashed;
  border-color: var(--kf-success);
}
.kf-answer-options__option--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.kf-answer-options__letter {
  flex: none;
  min-width: 14px;
  margin-top: 1px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
}
.kf-answer-options__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1 1 auto;
  min-width: 0;
}
.kf-answer-options__label {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
  overflow-wrap: anywhere;
}
.kf-answer-options__desc {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  overflow-wrap: anywhere;
}
.kf-answer-options__selected-hint {
  flex: none;
  align-self: center;
  color: var(--kf-primary);
  font-size: var(--kf-fs-xs);
}
.kf-answer-options__selected-hint--missed {
  color: var(--kf-success);
}
@media (prefers-reduced-motion: reduce) {
  .kf-answer-options__option {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-answer-options__option--selected,
  .kf-answer-options__option--correct,
  .kf-answer-options__option--wrong {
    border-color: Highlight;
  }
}
</style>
