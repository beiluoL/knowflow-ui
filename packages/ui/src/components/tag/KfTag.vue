<template>
  <span class="kf-tag" :class="[`kf-tag--${variant}`, `kf-tag--${size}`, { 'kf-tag--disabled': disabled }]">
    <slot />
    <button
      v-if="closable"
      type="button"
      class="kf-tag__close"
      :disabled="disabled"
      :aria-label="closeLabel || '移除标签'"
      @click.stop="onClose"
    >
      <KfIcon name="x" :size="12" aria-hidden="true" />
    </button>
  </span>
</template>

<script setup lang="ts">
/**
 * KfTag — 标签 / 可移除标记。
 *
 * 对应 V5 的 Tag 条目（原项目仅有参考实现，无可复用生产组件）。
 * 只负责展示与「请求移除」的信号，是否真的移除由宿主决定。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfTagEmits, KfTagProps } from './types'

const props = withDefaults(defineProps<KfTagProps>(), {
  variant: 'default',
  size: 'md',
  closable: false,
  disabled: false,
  closeLabel: '',
})

const emit = defineEmits<KfTagEmits>()

function onClose(event: MouseEvent): void {
  if (props.disabled) return
  emit('close', event)
}
</script>

<style scoped>
.kf-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-1);
  box-sizing: border-box;
  border-radius: var(--kf-tag-radius);
  border: 1px solid transparent;
  font-family: var(--kf-font-sans);
  font-weight: var(--kf-fw-label);
  line-height: 1.5;
  white-space: nowrap;
  vertical-align: middle;
}
.kf-tag--sm {
  height: 20px;
  padding: 0 6px;
  font-size: var(--kf-fs-xs);
}
.kf-tag--md {
  height: 24px;
  padding: 0 8px;
  font-size: var(--kf-fs-caption);
}
.kf-tag--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-inline-end: -2px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--kf-motion-fast) ease, background-color var(--kf-motion-fast) ease;
}
.kf-tag__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}
.kf-tag__close:focus-visible {
  outline: var(--kf-focus-ring-width) solid currentColor;
  outline-offset: 1px;
  opacity: 1;
}
.kf-tag--default {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-tag--primary {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-tag--success {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-tag--warning {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-tag--danger {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-tag--neutral {
  background: transparent;
  border-color: var(--kf-border);
  color: var(--kf-muted-foreground);
}
@media (prefers-reduced-motion: reduce) {
  .kf-tag__close {
    transition: none;
  }
}
</style>
