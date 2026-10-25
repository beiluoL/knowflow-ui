<template>
  <KfInput
    :model-value="modelValue"
    type="search"
    :placeholder="placeholder"
    :label="label"
    :help="help"
    :error="error"
    :disabled="disabled"
    :readonly="readonly"
    :aria-label="ariaLabel || undefined"
    @update:model-value="onInput"
    @keydown.enter="onEnter"
  >
    <template #prefix>
      <KfIcon name="search" :size="16" class="kf-search-input__icon" />
    </template>
    <template #suffix>
      <span v-if="loading" class="kf-search-input__loading" aria-hidden="true">
        <KfIcon name="loader" :size="14" class="kf-search-input__spinner" />
      </span>
      <button
        v-else-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="kf-search-input__clear"
        aria-label="清空搜索"
        @click="onClear"
      >
        <KfIcon name="x" :size="14" aria-hidden="true" />
      </button>
    </template>
  </KfInput>
</template>

<script setup lang="ts">
/**
 * KfSearchInput — 搜索输入框。
 *
 * 对应 V5 的 SearchInput 条目（原项目只有 Demo）。
 * 关键点：**v-model 立即回写，search 事件防抖**。两者混用一个事件会让「边打字边发请求」
 * 和「输入框卡顿」二选一；拆开后宿主既能实时显示输入，又只在停手后发请求。
 * 计时器在卸载时清理。
 */
import { onBeforeUnmount, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import KfInput from '../input/KfInput.vue'
import type { KfSearchInputEmits, KfSearchInputProps } from './types'

const props = withDefaults(defineProps<KfSearchInputProps>(), {
  modelValue: '',
  placeholder: '搜索',
  label: '',
  help: '',
  error: '',
  disabled: false,
  readonly: false,
  clearable: true,
  debounce: 300,
  loading: false,
  ariaLabel: '',
  submitOnEnter: true,
})

const emit = defineEmits<KfSearchInputEmits>()

let timer: ReturnType<typeof setTimeout> | undefined

function clearTimer(): void {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function scheduleSearch(value: string): void {
  clearTimer()
  if (props.debounce <= 0) {
    emit('search', value)
    return
  }
  timer = setTimeout(() => {
    timer = undefined
    emit('search', value)
  }, props.debounce)
}

function onInput(value: string): void {
  emit('update:modelValue', value)
  scheduleSearch(value)
}

function onClear(): void {
  clearTimer()
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
}

/** Enter 立即搜索（跳过防抖），并取消挂起的定时器避免重复触发 */
function onEnter(): void {
  if (!props.submitOnEnter) return
  clearTimer()
  emit('submit', props.modelValue)
  emit('search', props.modelValue)
}

/** 外部清空（例如重置筛选项）时也要取消挂起的搜索，避免旧词回填结果 */
watch(
  () => props.modelValue,
  (value) => {
    if (!value) clearTimer()
  },
)

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.kf-search-input__icon {
  color: var(--kf-muted-foreground);
}
.kf-search-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-full);
  background: color-mix(in srgb, var(--kf-muted-foreground) 22%, transparent);
  color: var(--kf-card);
  cursor: pointer;
}
.kf-search-input__clear:hover {
  background: var(--kf-muted-foreground);
}
.kf-search-input__clear:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-search-input__loading {
  display: inline-flex;
  color: var(--kf-muted-foreground);
}
.kf-search-input__spinner {
  animation: kf-search-input-spin 0.9s linear infinite;
}
@keyframes kf-search-input-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-search-input__spinner {
    animation: none;
  }
}
</style>
