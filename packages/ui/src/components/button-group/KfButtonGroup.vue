<template>
  <div
    class="kf-button-group"
    :class="[`kf-button-group--${size}`, { 'kf-button-group--block': block }]"
    role="group"
    :aria-label="ariaLabel"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="kf-button-group__item"
      :class="[
        `kf-button-group__item--${variant}`,
        {
          'kf-button-group__item--active': item.value === modelValue,
        },
      ]"
      :aria-pressed="item.value === modelValue ? 'true' : 'false'"
      :disabled="disabled || item.disabled"
      @click="select(item)"
    >
      <KfIcon v-if="item.iconName" :name="item.iconName" :size="size === 'lg' ? 18 : 16" class="kf-button-group__icon" />
      <span class="kf-button-group__label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * KfButtonGroup — 互斥按钮组（分段控件）。
 *
 * 对应 V5 的 ButtonGroup 条目（原项目只有 Demo）。
 * 语义选择：用 role="group" + aria-pressed，而不是 radiogroup —— 它是「一组视角切换开关」，
 * 不是表单选项；两者读屏播报不同，用 radiogroup 会让用户以为自己在填表单。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfButtonGroupEmits, KfButtonGroupProps } from './types'

const props = withDefaults(defineProps<KfButtonGroupProps>(), {
  modelValue: '',
  size: 'md',
  variant: 'secondary',
  disabled: false,
  ariaLabel: '',
  block: false,
})

const emit = defineEmits<KfButtonGroupEmits>()

function select(item: { value: string; disabled?: boolean }): void {
  if (props.disabled || item.disabled || item.value === props.modelValue) return
  emit('update:modelValue', item.value)
  emit('change', item.value)
}
</script>

<style scoped>
.kf-button-group {
  display: inline-flex;
  align-items: stretch;
  box-sizing: border-box;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-button-radius);
  background: var(--kf-card);
  overflow: hidden;
  font-family: var(--kf-font-sans);
}
.kf-button-group--block {
  display: flex;
  width: 100%;
}
.kf-button-group__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--kf-button-gap);
  box-sizing: border-box;
  padding: 0 var(--kf-space-3);
  border: 0;
  border-right: 1px solid var(--kf-border);
  background: transparent;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease, color var(--kf-motion-fast) ease;
}
.kf-button-group__item:last-child {
  border-right: 0;
}
.kf-button-group--sm .kf-button-group__item {
  height: calc(var(--kf-button-height-sm) - 2px);
  font-size: var(--kf-fs-body-sm);
}
.kf-button-group--md .kf-button-group__item {
  height: calc(var(--kf-button-height-md) - 2px);
}
.kf-button-group--lg .kf-button-group__item {
  height: calc(var(--kf-button-height-lg) - 2px);
  font-size: var(--kf-button-font-lg);
}
.kf-button-group--block .kf-button-group__item {
  flex: 1;
  min-width: 0;
}
.kf-button-group__item:hover:not(:disabled, .kf-button-group__item--active) {
  background: var(--kf-muted);
}
.kf-button-group__item:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(-1 * var(--kf-focus-ring-width));
}
.kf-button-group__item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-button-group__item--active {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-button-group__item--active:hover {
  background: var(--kf-primary-hover);
}
.kf-button-group__icon {
  flex: none;
}
.kf-button-group__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (prefers-reduced-motion: reduce) {
  .kf-button-group__item {
    transition: none;
  }
}
</style>
