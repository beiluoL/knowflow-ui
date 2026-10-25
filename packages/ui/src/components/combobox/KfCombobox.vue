<template>
  <div
    ref="root"
    class="kf-combobox"
    :class="{ 'kf-combobox--open': open, 'kf-combobox--error': Boolean(error), 'kf-combobox--disabled': disabled }"
  >
    <label v-if="label" class="kf-combobox__label" :for="inputId">{{ label }}</label>

    <div class="kf-combobox__control">
      <input
        :id="inputId"
        ref="control"
        class="kf-combobox__input"
        type="text"
        role="combobox"
        autocomplete="off"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-label="ariaLabel || label || placeholder"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
      />

      <button
        v-if="modelValue && !disabled"
        type="button"
        class="kf-combobox__clear"
        aria-label="清空"
        @click="clear"
      >
        <KfIcon name="x" :size="13" aria-hidden="true" />
      </button>
      <KfIcon v-else name="chevron-down" :size="14" class="kf-combobox__chevron" aria-hidden="true" />
    </div>

    <p v-if="error" class="kf-combobox__error">{{ error }}</p>

    <div v-if="open" class="kf-combobox__panel">
      <p v-if="loading" class="kf-combobox__status" role="status">搜索中…</p>
      <p v-else-if="filtered.length === 0" class="kf-combobox__status">{{ emptyText }}</p>

      <ul v-else :id="listId" class="kf-combobox__list" role="listbox" :aria-label="ariaLabel || label">
        <li
          v-for="(option, index) in filtered"
          :id="optionId(index)"
          :key="option.value"
          class="kf-combobox__option"
          :class="{
            'kf-combobox__option--active': index === active,
            'kf-combobox__option--selected': option.value === modelValue,
            'kf-combobox__option--disabled': option.disabled,
          }"
          role="option"
          :aria-selected="option.value === modelValue"
          :aria-disabled="option.disabled || undefined"
          @mouseenter="active = index"
          @click="choose(option)"
        >
          <span class="kf-combobox__option-label">{{ option.label }}</span>
          <span v-if="option.description" class="kf-combobox__option-desc">{{ option.description }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfCombobox — 组合搜索框（输入 + 建议列表）。
 *
 * 实现 WAI-ARIA combobox 模式：input[role=combobox] + listbox + aria-activedescendant。
 * 过滤策略有两档：
 *   - filterable（默认）：组件按 label 本地过滤；
 *   - filterable=false：只发 search 事件，options 由宿主根据检索结果给（服务端搜索场景）。
 * 组件不发请求、不做防抖（防抖属于宿主策略，避免两处各防一次）。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import { nextInstanceId } from '../shared/instance'
import type { KfComboboxEmits, KfComboboxOption, KfComboboxProps } from './types'

const props = withDefaults(defineProps<KfComboboxProps>(), {
  modelValue: '',
  options: () => [],
  placeholder: '搜索…',
  label: '',
  emptyText: '没有匹配项',
  loading: false,
  error: '',
  disabled: false,
  freeInput: true,
  filterable: true,
  ariaLabel: '',
})

const emit = defineEmits<KfComboboxEmits>()

const seq = nextInstanceId()
const inputId = `kf-combobox-input-${seq}`
const listId = `kf-combobox-list-${seq}`

const root = ref<HTMLElement | null>(null)
const control = ref<HTMLInputElement | null>(null)
const open = ref(false)
const active = ref(-1)

const filtered = computed<KfComboboxOption[]>(() => {
  if (!props.filterable) return props.options
  const query = props.modelValue.trim().toLowerCase()
  if (!query) return props.options
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})

watch(
  () => props.options,
  () => {
    active.value = filtered.value.findIndex((option) => option.value === props.modelValue)
  },
)

function optionId(index: number): string {
  return `${listId}-option-${index}`
}

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  open.value = true
  active.value = -1
  emit('search', value)
}

function onFocus(): void {
  if (props.disabled) return
  open.value = true
  active.value = filtered.value.findIndex((option) => option.value === props.modelValue)
}

function choose(option: KfComboboxOption): void {
  if (option.disabled) return
  emit('update:modelValue', option.label)
  emit('select', option)
  open.value = false
}

function clear(): void {
  emit('update:modelValue', '')
  emit('clear')
  open.value = false
  control.value?.focus()
}

function move(delta: number): void {
  const total = filtered.value.length
  if (total === 0) return
  let next = active.value
  for (let step = 0; step < total; step += 1) {
    next = (next + delta + total) % total
    if (!filtered.value[next].disabled) {
      active.value = next
      return
    }
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter') {
    if (open.value && active.value >= 0) {
      event.preventDefault()
      const option = filtered.value[active.value]
      if (option) choose(option)
    } else if (!props.freeInput) {
      event.preventDefault()
    }
  } else if (event.key === 'Escape') {
    if (open.value) {
      event.stopPropagation()
      open.value = false
    }
  }
}

function onDocumentPointerDown(event: MouseEvent): void {
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  if (!open.value) return
  open.value = false
  if (!props.freeInput) {
    const matched = props.options.some((option) => option.label === props.modelValue || option.value === props.modelValue)
    if (!matched && props.modelValue) emit('invalid', props.modelValue)
  }
}

onMounted(() => document.addEventListener('mousedown', onDocumentPointerDown, true))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentPointerDown, true))

defineExpose({ focus: () => control.value?.focus() })
</script>

<style scoped>
.kf-combobox {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-combobox__label {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-label, var(--kf-fs-caption));
  font-weight: var(--kf-fw-label);
}
.kf-combobox__control {
  position: relative;
  display: flex;
  align-items: center;
}
.kf-combobox__input {
  box-sizing: border-box;
  width: 100%;
  height: var(--kf-control-height-lg);
  padding: 0 32px 0 var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-field-radius);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-md);
}
.kf-combobox__input::placeholder {
  color: var(--kf-field-placeholder);
}
.kf-combobox__input:hover:not(:disabled) {
  background: var(--kf-field-hover);
}
.kf-combobox__input:focus {
  border-color: var(--kf-primary);
  outline: none;
  box-shadow: 0 0 0 var(--kf-focus-ring-width) var(--kf-primary-subtle);
}
.kf-combobox--error .kf-combobox__input {
  border-color: var(--kf-danger);
}
.kf-combobox--disabled .kf-combobox__input {
  background: var(--kf-field-disabled);
  cursor: not-allowed;
}
.kf-combobox__clear,
.kf-combobox__chevron {
  position: absolute;
  right: 10px;
  color: var(--kf-muted-foreground);
}
.kf-combobox__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  cursor: pointer;
}
.kf-combobox__clear:hover {
  color: var(--kf-foreground);
}
.kf-combobox__clear:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-combobox__error {
  margin: 0;
  color: var(--kf-danger);
  font-size: var(--kf-fs-caption);
}
.kf-combobox__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: var(--kf-z-overlay);
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-menu-radius);
  background: var(--kf-menu-surface);
  box-shadow: var(--kf-menu-shadow);
}
.kf-combobox__status {
  margin: 0;
  padding: var(--kf-space-2);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-combobox__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.kf-combobox__option {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 8px;
  border-radius: var(--kf-radius-sm);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  cursor: pointer;
}
.kf-combobox__option--active {
  background: var(--kf-muted);
}
.kf-combobox__option--selected {
  color: var(--kf-primary);
  font-weight: var(--kf-fw-label);
}
.kf-combobox__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-combobox__option-desc {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: 400;
}
</style>
