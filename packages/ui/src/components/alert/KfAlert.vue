<template>
  <div
    class="kf-alert"
    :class="[`kf-alert--${variant}`, { 'kf-alert--titled': !!title }]"
    :role="role"
    :aria-live="role === 'alert' ? 'assertive' : 'polite'"
  >
    <span v-if="showIcon" class="kf-alert__icon" aria-hidden="true">
      <slot name="icon">
        <KfIcon :name="iconName || DEFAULT_ICON[variant]" :size="18" />
      </slot>
    </span>
    <div class="kf-alert__body">
      <p v-if="title" class="kf-alert__title">{{ title }}</p>
      <div class="kf-alert__description">
        <slot>{{ description }}</slot>
      </div>
      <div v-if="$slots.action" class="kf-alert__action"><slot name="action" /></div>
    </div>
    <button
      v-if="closable"
      type="button"
      class="kf-alert__close"
      :aria-label="closeLabel || '关闭提示'"
      @click="emit('close', $event)"
    >
      <KfIcon name="x" :size="14" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * KfAlert — 行内提示条。
 *
 * 对应 V5 的 Alert 条目（原项目未实现真实组件，只有占位条目）。
 * 语义分级遵循 KnowFlow 的既有约定：错误/警告用 role="alert"（assertive），
 * 信息/成功用 role="status"（polite），避免所有提示都抢占读屏播报。
 */
import { computed } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfAlertEmits, KfAlertProps, KfAlertVariant } from './types'

const DEFAULT_ICON: Record<KfAlertVariant, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-circle',
  danger: 'alert-circle',
}

const props = withDefaults(defineProps<KfAlertProps>(), {
  variant: 'info',
  title: '',
  description: '',
  showIcon: true,
  iconName: '',
  closable: false,
  closeLabel: '',
})

const emit = defineEmits<KfAlertEmits>()
const role = computed(() => (props.variant === 'danger' || props.variant === 'warning' ? 'alert' : 'status'))
</script>

<style scoped>
.kf-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  padding: 10px var(--kf-space-3);
  border: 1px solid transparent;
  border-radius: var(--kf-radius-md);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  color: var(--kf-foreground);
}
.kf-alert__icon {
  display: inline-flex;
  flex: none;
  margin-top: 1px;
}
.kf-alert__body {
  flex: 1;
  min-width: 0;
}
.kf-alert__title {
  margin: 0;
  font-weight: var(--kf-fw-label);
}
.kf-alert__description {
  min-width: 0;
}
.kf-alert--titled .kf-alert__description {
  margin-top: 2px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
}
.kf-alert__action {
  display: flex;
  gap: var(--kf-space-2);
  margin-top: var(--kf-space-2);
}
.kf-alert__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin: -2px -4px 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
}
.kf-alert__close:hover {
  opacity: 1;
}
.kf-alert__close:focus-visible {
  outline: var(--kf-focus-ring-width) solid currentColor;
  outline-offset: 1px;
  opacity: 1;
}

.kf-alert--info {
  background: var(--kf-info-surface);
  border-color: color-mix(in srgb, var(--kf-info) 22%, transparent);
  color: var(--kf-info);
}
.kf-alert--success {
  background: var(--kf-success-surface);
  border-color: color-mix(in srgb, var(--kf-success) 22%, transparent);
  color: var(--kf-success);
}
.kf-alert--warning {
  background: var(--kf-warning-surface);
  border-color: color-mix(in srgb, var(--kf-warning-color) 26%, transparent);
  color: var(--kf-warning-color);
}
.kf-alert--danger {
  background: var(--kf-danger-surface);
  border-color: color-mix(in srgb, var(--kf-danger) 26%, transparent);
  color: var(--kf-danger);
}
.kf-alert--titled .kf-alert__title,
.kf-alert--titled .kf-alert__icon {
  color: inherit;
}
.kf-alert--titled .kf-alert__description {
  color: color-mix(in srgb, currentColor 78%, var(--kf-foreground));
}

@media (forced-colors: active) {
  .kf-alert {
    border-color: CanvasText;
  }
}
</style>
