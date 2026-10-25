<template>
  <span class="kf-switch" :class="`kf-switch--${size}`">
    <button
      type="button"
      role="switch"
      class="kf-switch__control"
      :class="{ 'kf-switch__control--on': modelValue, 'kf-switch__control--loading': loading }"
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-label="ariaLabel || undefined"
      :aria-busy="loading || undefined"
      :disabled="disabled || loading"
      @click="toggle"
    >
      <span class="kf-switch__thumb" aria-hidden="true">
        <KfIcon v-if="loading" name="loader" :size="12" class="kf-switch__spinner" />
      </span>
    </button>
    <span v-if="label || $slots.default || statusText" class="kf-switch__label">
      <slot>{{ label }}</slot>
      <span v-if="statusText" class="kf-switch__status">{{ statusText }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
/**
 * KfSwitch — 开关。
 *
 * 对应 V5 的 Switch 条目（原项目只有 ReferenceDemos 的 role="switch" 参考按钮）。
 * 语义要点：
 *   - 用 <button role="switch" aria-checked>，而不是 checkbox：视觉是滑轨，语义是开/关；
 *   - Space / Enter 由原生 button 承担，无需自己实现键位；
 *   - loading 期间同时 disabled，避免连点产生两次请求。
 */
import { computed } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfSwitchEmits, KfSwitchProps } from './types'

const props = withDefaults(defineProps<KfSwitchProps>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
  label: '',
  onLabel: '',
  offLabel: '',
  ariaLabel: '',
})

const emit = defineEmits<KfSwitchEmits>()

const statusText = computed(() => (props.modelValue ? props.onLabel : props.offLabel))

function toggle(): void {
  if (props.disabled || props.loading) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style scoped>
.kf-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  font-family: var(--kf-font-sans);
  vertical-align: middle;
}
.kf-switch__control {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  box-sizing: border-box;
  padding: 2px;
  border: 0;
  border-radius: var(--kf-radius-full);
  background: var(--kf-border);
  cursor: pointer;
  transition: background-color var(--kf-motion-base) ease;
}
.kf-switch--sm .kf-switch__control {
  width: 32px;
  height: 18px;
}
.kf-switch--md .kf-switch__control {
  width: var(--kf-switch-width);
  height: var(--kf-switch-height);
}
.kf-switch__control--on {
  background: var(--kf-primary);
}
.kf-switch__control:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.kf-switch__control:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-primary);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-switch__thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  transition: transform var(--kf-motion-base) ease;
}
.kf-switch--sm .kf-switch__thumb {
  width: 14px;
  height: 14px;
}
.kf-switch--md .kf-switch__thumb {
  width: var(--kf-switch-thumb);
  height: var(--kf-switch-thumb);
}
.kf-switch--sm .kf-switch__control--on .kf-switch__thumb {
  transform: translateX(14px);
}
.kf-switch--md .kf-switch__control--on .kf-switch__thumb {
  transform: translateX(18px);
}
.kf-switch__spinner {
  color: var(--kf-muted-foreground);
  animation: kf-switch-spin 0.9s linear infinite;
}
@keyframes kf-switch-spin {
  to {
    transform: rotate(360deg);
  }
}
.kf-switch__label {
  display: inline-flex;
  align-items: baseline;
  gap: var(--kf-space-2);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  cursor: pointer;
}
.kf-switch__status {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
}
@media (prefers-reduced-motion: reduce) {
  .kf-switch__control,
  .kf-switch__thumb {
    transition: none;
  }
  .kf-switch__spinner {
    animation: none;
  }
}
@media (forced-colors: active) {
  .kf-switch__control {
    border: 1px solid CanvasText;
  }
}
</style>
