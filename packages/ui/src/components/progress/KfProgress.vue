<template>
  <div class="kf-progress" :class="`kf-progress--${size}`">
    <div v-if="showLabel || $slots.label" class="kf-progress__header">
      <span class="kf-progress__label">
        <slot name="label">{{ label }}</slot>
      </span>
      <span class="kf-progress__value">{{ indeterminate ? '—' : `${clamped}%` }}</span>
    </div>
    <div
      class="kf-progress__track"
      role="progressbar"
      :aria-valuenow="indeterminate ? undefined : clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuetext="indeterminate ? '进行中' : `${clamped}%`"
      :aria-label="label || undefined"
      :aria-busy="indeterminate || undefined"
    >
      <div
        class="kf-progress__bar"
        :class="[`kf-progress__bar--${variant}`, { 'kf-progress__bar--indeterminate': indeterminate }]"
        :style="indeterminate ? undefined : { width: `${clamped}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfProgress — 进度条。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Progress.vue。
 * 变更（均属修复，不是重设计）：
 *   1. 补 role="progressbar" + aria-valuenow/min/max —— 原实现是纯视觉 div，读屏完全不可见；
 *   2. percentage 夹取到 0–100，避免宿主传入 120 时条溢出容器；
 *   3. 新增 indeterminate，替代宿主自己写动画。
 */
import { computed } from 'vue'
import type { KfProgressProps } from './types'

const props = withDefaults(defineProps<KfProgressProps>(), {
  variant: 'primary',
  size: 'md',
  label: '',
  showLabel: false,
  indeterminate: false,
})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(Number(props.percentage) || 0))))
</script>

<style scoped>
.kf-progress {
  width: 100%;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-progress__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--kf-space-2);
  margin-bottom: 6px;
}
.kf-progress__label {
  min-width: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
}
.kf-progress__value {
  flex: none;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
}
.kf-progress__track {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
}
.kf-progress--sm .kf-progress__track {
  height: 4px;
}
.kf-progress--md .kf-progress__track {
  height: 8px;
}
.kf-progress--lg .kf-progress__track {
  height: 12px;
}
.kf-progress__bar {
  height: 100%;
  border-radius: inherit;
  transition: width var(--kf-motion-base) ease-out;
}
.kf-progress__bar--primary {
  background: var(--kf-primary);
}
.kf-progress__bar--success {
  background: var(--kf-success);
}
.kf-progress__bar--warning {
  background: var(--kf-warning-color);
}
.kf-progress__bar--danger {
  background: var(--kf-danger);
}
.kf-progress__bar--indeterminate {
  width: 40%;
  animation: kf-progress-slide 1.2s ease-in-out infinite;
}
@keyframes kf-progress-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-progress__bar {
    transition: none;
  }
  .kf-progress__bar--indeterminate {
    animation: none;
    width: 100%;
    opacity: 0.55;
  }
}
</style>
