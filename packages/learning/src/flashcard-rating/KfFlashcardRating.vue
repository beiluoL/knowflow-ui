<template>
  <div class="kf-flashcard-rating" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="(option, index) in resolvedOptions"
      :key="option.value"
      :ref="(el) => setButton(el, index)"
      type="button"
      role="radio"
      class="kf-flashcard-rating__button"
      :class="[
        `kf-flashcard-rating__button--${option.tone || 'primary'}`,
        { 'kf-flashcard-rating__button--selected': option.value === modelValue },
      ]"
      :aria-checked="option.value === modelValue"
      :tabindex="index === activeIndex ? 0 : -1"
      :disabled="disabled"
      @click="choose(option)"
      @keydown="onKeydown($event, index)"
    >
      <span class="kf-flashcard-rating__label">{{ option.label }}</span>
      <span v-if="showInterval && option.interval" class="kf-flashcard-rating__interval">{{ option.interval }}</span>
      <span v-if="option.hint" class="kf-flashcard-rating__hint" aria-hidden="true">{{ option.hint }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * KfFlashcardRating — 复习评分按钮组（忘记 / 困难 / 一般 / 简单）。
 *
 * 组件只负责「选择 + 发事件」：
 *   - 不计算间隔、不写入复习记录、不调用接口；
 *   - `interval` 文案由宿主按自己的算法算好后传入，组件原样展示。
 * 键盘遵循 radiogroup 模式：方向键移动、空格/回车确认，roving tabindex 只保留一个可聚焦项。
 */
import { computed, ref, watch } from 'vue'
import type {
  KfFlashcardRatingEmits,
  KfFlashcardRatingOption,
  KfFlashcardRatingProps,
} from './types'

const props = withDefaults(defineProps<KfFlashcardRatingProps>(), {
  options: () => [
    { value: 1, label: '忘记', hint: '1', tone: 'danger' },
    { value: 2, label: '困难', hint: '2', tone: 'warning' },
    { value: 3, label: '一般', hint: '3', tone: 'primary' },
    { value: 4, label: '简单', hint: '4', tone: 'success' },
  ],
  modelValue: null,
  disabled: false,
  showInterval: true,
  ariaLabel: '复习评分',
})

const emit = defineEmits<KfFlashcardRatingEmits>()

const buttons = ref<(HTMLButtonElement | null)[]>([])

const resolvedOptions = computed<KfFlashcardRatingOption[]>(() =>
  props.options.map((option) => ({ tone: 'primary' as const, ...option })),
)

const selectedIndex = computed(() => resolvedOptions.value.findIndex((option) => option.value === props.modelValue))
const activeIndex = ref(selectedIndex.value >= 0 ? selectedIndex.value : 0)

// 选择变化时把 roving tabindex 跟到当前项，键盘用户再次 Tab 进来会落在已选项上
watch(selectedIndex, (index) => {
  if (index >= 0) activeIndex.value = index
})

function setButton(el: unknown, index: number): void {
  buttons.value[index] = (el as HTMLButtonElement | null) ?? null
}

function choose(option: KfFlashcardRatingOption): void {
  if (props.disabled) return
  emit('update:modelValue', option.value)
  emit('select', option.value, option)
}

function onKeydown(event: KeyboardEvent, index: number): void {
  if (props.disabled) return
  const total = resolvedOptions.value.length
  if (total === 0) return

  const KEYS = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
  if (!KEYS.includes(event.key)) return
  event.preventDefault()

  let next = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % total
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + total) % total
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = total - 1

  activeIndex.value = next
  buttons.value[next]?.focus()
}

/** 供宿主的数字快捷键（1–4）调用；越界值直接忽略，不做模糊匹配 */
defineExpose({
  chooseByValue(value: number): void {
    const option = resolvedOptions.value.find((item) => item.value === value)
    if (option) choose(option)
  },
})
</script>

<style scoped>
.kf-flashcard-rating {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-flashcard-rating__button {
  display: inline-flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  box-sizing: border-box;
  min-width: 64px;
  min-height: var(--kf-control-height-lg);
  padding: 5px 10px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--kf-motion-fast) ease, background var(--kf-motion-fast) ease;
}
.kf-flashcard-rating__button:hover:not(:disabled) {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
}
.kf-flashcard-rating__button:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-flashcard-rating__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-flashcard-rating__label {
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
}
.kf-flashcard-rating__interval {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-flashcard-rating__hint {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  opacity: 0.7;
}
.kf-flashcard-rating__button--selected {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
  box-shadow: inset 0 0 0 1px var(--kf-primary);
}
.kf-flashcard-rating__button--danger .kf-flashcard-rating__label {
  color: var(--kf-danger);
}
.kf-flashcard-rating__button--warning .kf-flashcard-rating__label {
  color: var(--kf-warning-color);
}
.kf-flashcard-rating__button--success .kf-flashcard-rating__label {
  color: var(--kf-success);
}
.kf-flashcard-rating__button--selected .kf-flashcard-rating__label {
  color: var(--kf-foreground);
}
@media (prefers-reduced-motion: reduce) {
  .kf-flashcard-rating__button {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-flashcard-rating__button--selected {
    border-color: Highlight;
    box-shadow: inset 0 0 0 1px Highlight;
  }
}
</style>
