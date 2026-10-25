<template>
  <KfFormField
    :control-id="triggerId"
    :label="label"
    :required="false"
    :help="help"
    :error="error"
  >
    <div ref="root" class="kf-select" :class="{ 'kf-select--open': open, 'kf-select--disabled': disabled, 'kf-select--error': !!error }">
      <button
        :id="triggerId"
        type="button"
        class="kf-select__trigger"
        role="combobox"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="listId"
        :aria-haspopup="'listbox'"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :aria-label="ariaLabel || label || undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="descriptionId"
        :aria-busy="loading ? 'true' : undefined"
        :disabled="disabled || loading"
        @click="toggle"
        @keydown="onTriggerKeydown"
      >
        <span class="kf-select__value">
          <template v-if="multiple && selectedOptions.length">
            <span v-for="option in selectedOptions" :key="option.value" class="kf-select__chip">
              <span class="kf-select__chip-label">{{ option.label }}</span>
              <span
                class="kf-select__chip-remove"
                role="button"
                tabindex="-1"
                :aria-label="`移除 ${option.label}`"
                @click.stop="removeOption(option.value)"
              >
                <KfIcon name="x" :size="11" aria-hidden="true" />
              </span>
            </span>
          </template>
          <span v-else-if="singleLabel" class="kf-select__single">{{ singleLabel }}</span>
          <span v-else class="kf-select__placeholder">{{ placeholder }}</span>
        </span>
        <span
          v-if="clearable && hasValue"
          class="kf-select__clear"
          role="button"
          tabindex="-1"
          aria-label="清空选择"
          @click.stop="clear"
        >
          <KfIcon name="x" :size="13" aria-hidden="true" />
        </span>
        <span
          v-if="loading"
          class="kf-select__spinner"
          role="presentation"
          aria-hidden="true"
        />
        <KfIcon name="chevron-down" :size="16" class="kf-select__chevron" aria-hidden="true" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="open"
        :id="listId"
        ref="panel"
        class="kf-select__panel"
        :style="panelStyle"
        role="listbox"
        :aria-multiselectable="multiple ? 'true' : undefined"
        @keydown="onPanelKeydown"
      >
        <div v-if="searchable" class="kf-select__search">
          <input
            ref="search"
            v-model="query"
            class="kf-select__search-input"
            type="text"
            placeholder="搜索选项"
            aria-label="搜索选项"
            autocomplete="off"
          />
        </div>
        <ul class="kf-select__list" role="presentation">
          <li
            v-for="(option, index) in filteredOptions"
            :id="optionId(index)"
            :key="option.value"
            class="kf-select__option"
            :class="{
              'kf-select__option--active': index === activeIndex,
              'kf-select__option--selected': isSelected(option.value),
              'kf-select__option--disabled': option.disabled,
            }"
            role="option"
            :aria-selected="isSelected(option.value) ? 'true' : 'false'"
            :aria-disabled="option.disabled ? 'true' : undefined"
            @click="choose(option)"
            @mousemove="activeIndex = index"
          >
            <span class="kf-select__option-label">{{ option.label }}</span>
            <span v-if="option.hint" class="kf-select__option-hint">{{ option.hint }}</span>
            <KfIcon
              v-if="isSelected(option.value)"
              name="check"
              :size="14"
              class="kf-select__option-mark"
              aria-hidden="true"
            />
          </li>
          <li v-if="!filteredOptions.length" class="kf-select__empty">{{ emptyText }}</li>
        </ul>
      </div>
    </Teleport>

    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfSelect — 选择器（单选 / 多选 / 可搜索 / 可清空）。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Select.vue 的**交互契约**，
 * 但不是逐行搬运：原实现 762 行，内含虚拟滚动、分组、异步加载等本库暂不承诺的能力。
 * 这里实现的是 WAI-ARIA combobox + listbox 的可靠子集：
 *   - 触发器是 role=combobox，面板是 role=listbox，aria-activedescendant 指向高亮项；
 *   - 键盘：↓/↑ 移动、Enter 选中、Escape 关闭、Home/End 首尾；
 *   - Escape 关闭并把焦点还给触发器；点击外部关闭；
 *   - 面板 Teleport 到 body 并用 fixed 定位，避免被 `overflow:hidden` 裁掉；
 *   - 卸载时移除全局监听。
 * 未实现（在文档里明确标注，不假装支持）：虚拟滚动、分组、远程搜索、自定义选项渲染。
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import KfFormField from '../form-field/KfFormField.vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfSelectEmits, KfSelectOption, KfSelectProps } from './types'

const props = withDefaults(defineProps<KfSelectProps>(), {
  modelValue: '',
  multiple: false,
  searchable: false,
  clearable: false,
  placeholder: '请选择',
  label: '',
  help: '',
  error: '',
  disabled: false,
  loading: false,
  ariaLabel: '',
  emptyText: '没有匹配项',
})

const emit = defineEmits<KfSelectEmits>()

const uid = useId()
const triggerId = `kf-select-trigger-${uid}`
const listId = `kf-select-list-${uid}`
const descriptionId = computed(
  () =>
    [props.help ? `${triggerId}-help` : undefined, props.error ? `${triggerId}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const search = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const coords = ref({ left: 0, top: 0, width: 0 })

const selectedValues = computed<string[]>(() =>
  props.multiple
    ? Array.isArray(props.modelValue)
      ? props.modelValue
      : []
    : props.modelValue
      ? [String(props.modelValue)]
      : [],
)

const selectedOptions = computed(() =>
  props.options.filter((option) => selectedValues.value.includes(option.value)),
)

const singleLabel = computed(() => (props.multiple ? '' : selectedOptions.value[0]?.label ?? ''))
const hasValue = computed(() => selectedValues.value.length > 0)

const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter((option) => option.label.toLowerCase().includes(keyword))
})

const panelStyle = computed(() => ({
  left: `${coords.value.left}px`,
  top: `${coords.value.top}px`,
  minWidth: `${coords.value.width}px`,
}))

function optionId(index: number): string {
  return `kf-select-option-${uid}-${index}`
}

function isSelected(value: string): boolean {
  return selectedValues.value.includes(value)
}

function place(): void {
  const anchor = root.value
  if (!anchor) return
  const rect = anchor.getBoundingClientRect()
  const height = panel.value?.offsetHeight ?? 0
  const gap = 4
  const below = rect.bottom + gap
  const above = rect.top - height - gap
  coords.value = {
    left: Math.max(gap, Math.min(rect.left, window.innerWidth - rect.width - gap)),
    top: below + height > window.innerHeight && above > gap ? above : below,
    width: rect.width,
  }
}

async function openPanel(): Promise<void> {
  if (props.disabled || props.loading || open.value) return
  open.value = true
  const current = props.options.findIndex((option) => isSelected(option.value))
  activeIndex.value = current >= 0 ? current : 0
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)
  await nextTick()
  place()
  if (props.searchable) search.value?.focus()
  panel.value?.focus()
}

function closePanel(restoreFocus = false): void {
  if (!open.value) return
  open.value = false
  query.value = ''
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
  if (restoreFocus) root.value?.querySelector<HTMLButtonElement>('.kf-select__trigger')?.focus()
}

function toggle(): void {
  if (open.value) closePanel()
  else void openPanel()
}

function commit(value: string | string[]): void {
  emit('update:modelValue', value)
  emit('change', value)
}

function choose(option: KfSelectOption): void {
  if (option.disabled) return
  if (props.multiple) {
    const next = isSelected(option.value)
      ? selectedValues.value.filter((value) => value !== option.value)
      : [...selectedValues.value, option.value]
    commit(next)
    query.value = ''
    return
  }
  commit(option.value)
  closePanel(true)
}

function removeOption(value: string): void {
  if (props.disabled) return
  commit(selectedValues.value.filter((item) => item !== value))
}

function clear(): void {
  if (props.disabled) return
  commit(props.multiple ? [] : '')
}

function move(delta: number): void {
  const list = filteredOptions.value
  if (!list.length) return
  let next = activeIndex.value
  for (let i = 0; i < list.length; i += 1) {
    next = (next + delta + list.length) % list.length
    if (!list[next]?.disabled) break
  }
  activeIndex.value = next
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    if (!open.value) void openPanel()
    else if (event.key === 'Enter' && filteredOptions.value[activeIndex.value]) {
      choose(filteredOptions.value[activeIndex.value])
    } else if (event.key === 'ArrowDown') move(1)
    else if (event.key === 'ArrowUp') move(-1)
  }
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closePanel(true)
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(event.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = 0
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = Math.max(0, filteredOptions.value.length - 1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const option = filteredOptions.value[activeIndex.value]
    if (option) choose(option)
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel(true)
  }
}

function onPointerDown(event: Event): void {
  const target = event.target as Node
  if (panel.value?.contains(target) || root.value?.contains(target)) return
  closePanel()
}

watch(filteredOptions, () => {
  if (activeIndex.value >= filteredOptions.value.length) activeIndex.value = 0
})

watch(open, (value) => {
  if (value) document.addEventListener('pointerdown', onPointerDown)
  else document.removeEventListener('pointerdown', onPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
})
</script>

<style scoped>
.kf-select {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: var(--kf-input-height);
  display: flex;
  align-items: center;
  padding: 0 var(--kf-field-padding) 0 0;
  border: 0;
  border-radius: var(--kf-field-radius);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  transition: background-color var(--kf-control-motion) ease;
}
.kf-select:hover:not(.kf-select--disabled) {
  background: var(--kf-field-hover);
}
.kf-select--open {
  background: var(--kf-field-active);
}
.kf-select--error {
  background: var(--kf-field-error-bg);
}
.kf-select--disabled {
  background: var(--kf-field-disabled);
  color: var(--kf-muted-foreground);
}
.kf-select__trigger {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: var(--kf-input-height);
  padding: 0 0 0 var(--kf-field-padding);
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  text-align: left;
  cursor: pointer;
  outline: 0;
}
.kf-select__trigger:disabled {
  cursor: not-allowed;
}
.kf-select__value {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  align-items: center;
}
.kf-select__single,
.kf-select__placeholder {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-select__placeholder {
  color: var(--kf-field-placeholder);
}
.kf-select__chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
  height: 22px;
  padding: 0 4px 0 7px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-card);
  font-size: var(--kf-fs-caption);
}
.kf-select__chip-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-select__chip-remove,
.kf-select__clear {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--kf-radius-full);
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-select__clear:hover,
.kf-select__chip-remove:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-select__chevron {
  flex: none;
  color: var(--kf-muted-foreground);
  transition: transform var(--kf-motion-base) ease;
}
.kf-select__spinner {
  flex: none;
  width: 14px;
  height: 14px;
  border: 2px solid var(--kf-border);
  border-top-color: var(--kf-primary);
  border-radius: var(--kf-radius-full);
  animation: kf-select-spin 720ms linear infinite;
}
@keyframes kf-select-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-select__spinner {
    animation-duration: 2400ms;
  }
}
.kf-select--open .kf-select__chevron {
  transform: rotate(180deg);
}
.kf-select__panel {
  position: fixed;
  z-index: var(--kf-z-overlay);
  box-sizing: border-box;
  max-height: 280px;
  overflow: auto;
  padding: var(--kf-space-1);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-menu-radius);
  background: var(--kf-menu-surface);
  box-shadow: var(--kf-menu-shadow);
  font-family: var(--kf-font-sans);
  outline: 0;
}
.kf-select__search {
  position: sticky;
  top: 0;
  padding: var(--kf-space-1) var(--kf-space-1) var(--kf-space-2);
  background: var(--kf-menu-surface);
}
.kf-select__search-input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 var(--kf-space-2);
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  outline: 0;
}
.kf-select__search-input:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: -1px;
}
.kf-select__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.kf-select__option {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-height: var(--kf-control-height-sm);
  padding: 0 var(--kf-space-2);
  border-radius: var(--kf-radius-sm);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  cursor: pointer;
}
.kf-select__option--active {
  background: var(--kf-muted);
}
.kf-select__option--selected {
  color: var(--kf-primary);
  font-weight: var(--kf-fw-label);
}
.kf-select__option--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-select__option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-select__option-hint {
  flex: none;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-select__option-mark {
  flex: none;
}
.kf-select__empty {
  padding: var(--kf-space-3) var(--kf-space-2);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  text-align: center;
}
@media (prefers-reduced-motion: reduce) {
  .kf-select,
  .kf-select__chevron {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-select {
    border: 1px solid CanvasText;
  }
}
</style>
