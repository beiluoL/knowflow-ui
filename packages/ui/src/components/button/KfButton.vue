<template>
  <button
    :type="type"
    :class="[
      'kf-button',
      `kf-button--${variant}`,
      `kf-button--${size}`,
      {
        'kf-button--icon-only': iconOnly,
        'kf-button--block': block,
        'kf-button--loading-text': loading && !iconName,
      },
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel || undefined"
    :title="title"
    @click="onClick"
  >
    <span
      v-if="iconName || loading"
      class="kf-button__icon"
      :class="{ 'kf-button__icon--trailing': iconPosition === 'right' }"
    >
      <KfIcon
        :name="loading ? 'loader' : (iconName as string)"
        :size="size === 'lg' ? 18 : 16"
        :class="{ 'kf-button__spinner': loading }"
      />
    </span>
    <span v-if="!iconOnly" class="kf-button__label"><slot /></span>
  </button>
</template>

<script setup lang="ts">
import KfIcon from '../icon/KfIcon.vue'
import type { KfButtonEmits, KfButtonProps } from './types'

const props = withDefaults(defineProps<KfButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
  iconPosition: 'left',
})

const emit = defineEmits<KfButtonEmits>()

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
.kf-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--kf-button-gap, 8px);
  height: var(--kf-button-height-md, 38px);
  padding: 0 var(--kf-button-padding-md, 16px);
  border: 1px solid transparent;
  border-radius: var(--kf-button-radius, 6px);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-button-font-md, 14px);
  line-height: var(--kf-button-line-height, 20px);
  font-weight: var(--kf-button-font-weight, 500);
  white-space: nowrap;
  box-shadow: none;
  cursor: pointer;
  transition:
    background-color 0.16s,
    color 0.16s,
    border-color 0.16s;
}
.kf-button--sm {
  height: var(--kf-button-height-sm, 32px);
  padding-inline: var(--kf-button-padding-sm, 12px);
}
.kf-button--lg {
  height: var(--kf-button-height-lg, 44px);
  padding-inline: var(--kf-button-padding-lg, 24px);
}
.kf-button--block {
  width: 100%;
}
.kf-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--kf-button-icon-slot, 18px);
  flex: 0 0 var(--kf-button-icon-slot, 18px);
}
.kf-button__icon--trailing {
  order: 1;
}
.kf-button__label {
  min-width: 0;
  white-space: nowrap;
}
/* 无图标名的加载态：保留标签宽度，图标居中覆盖 */
.kf-button--loading-text .kf-button__icon {
  position: absolute;
  inset: 0;
  width: auto;
}
.kf-button--loading-text .kf-button__label {
  color: transparent;
}
.kf-button--icon-only {
  width: var(--kf-button-height-md, 38px);
  padding: 0;
}
.kf-button--icon-only.kf-button--sm {
  width: var(--kf-button-height-sm, 32px);
}
.kf-button--icon-only.kf-button--lg {
  width: var(--kf-button-height-lg, 44px);
}

.kf-button--primary {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-button--danger {
  background: var(--kf-danger-text);
  color: var(--kf-destructive-foreground);
}
.kf-button--secondary {
  background: var(--kf-card);
  color: var(--kf-foreground);
  border-color: var(--kf-border);
}
.kf-button--outline,
.kf-button--ghost {
  background: transparent;
  color: var(--kf-primary);
  border-color: var(--kf-primary);
}
.kf-button--text {
  background: transparent;
  color: var(--kf-primary);
}

.kf-button:hover:not(:disabled) {
  filter: brightness(0.96);
}
.kf-button--text:hover:not(:disabled) {
  background: var(--kf-primary-soft);
}
.kf-button:active:not(:disabled) {
  filter: brightness(0.9);
}
.kf-button:focus-visible {
  outline: 2px solid var(--kf-ring);
  outline-offset: var(--kf-space-1, 4px);
}
.kf-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-button__spinner {
  animation: kf-button-spin 1s linear infinite;
}
@keyframes kf-button-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-button {
    transition: none;
  }
  .kf-button__spinner {
    animation: none;
  }
}
@media (forced-colors: active) {
  .kf-button {
    border-color: ButtonText;
  }
  .kf-button:focus-visible {
    outline-color: Highlight;
  }
  .kf-button:disabled {
    color: GrayText;
  }
}
</style>
