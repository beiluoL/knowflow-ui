<template>
  <span
    class="kf-badge"
    :class="[`kf-badge--${variant}`, `kf-badge--${size}`, { 'kf-badge--with-dot': dot }]"
  >
    <span v-if="dot" class="kf-badge__dot" aria-hidden="true" />
    <KfIcon v-if="iconName" :name="iconName" :size="12" class="kf-badge__icon" />
    <slot />
  </span>
</template>

<script setup lang="ts">
/**
 * KfBadge — 状态徽标。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Badge.vue。
 * 解耦：去掉 Tailwind 原子类与 bg-primary-50 这类宿主色板，改为 scoped + --kf-* 令牌，
 * 使暗色模式与宿主主题自动同步。变体语义与视觉重量保持不变。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfBadgeProps } from './types'

withDefaults(defineProps<KfBadgeProps>(), {
  variant: 'default',
  size: 'md',
  dot: false,
  iconName: '',
})
</script>

<style scoped>
.kf-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-1);
  box-sizing: border-box;
  border-radius: var(--kf-radius-full);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  line-height: 1.5;
  white-space: nowrap;
  vertical-align: middle;
}
.kf-badge--sm {
  padding: 0 6px;
  font-size: var(--kf-fs-xs);
}
.kf-badge--md {
  padding: 1px 8px;
}
.kf-badge__dot {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: var(--kf-radius-full);
  background: currentColor;
}
.kf-badge__icon {
  flex: none;
}

.kf-badge--default {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-badge--primary {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-badge--success {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-badge--warning {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-badge--danger {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-badge--info {
  background: var(--kf-info-surface);
  color: var(--kf-info);
}
.kf-badge--learning {
  background: var(--kf-primary-soft);
  color: var(--kf-primary);
}
.kf-badge--review {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-badge--ai {
  background: var(--kf-highlight-subtle);
  color: var(--kf-highlight);
}
.kf-badge--neutral {
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}

@media (forced-colors: active) {
  .kf-badge {
    border: 1px solid CanvasText;
  }
}
</style>
