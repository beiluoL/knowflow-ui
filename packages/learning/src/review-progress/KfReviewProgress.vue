<template>
  <section
    class="kf-review-progress"
    :class="[`kf-review-progress--${size}`, { 'kf-review-progress--done': isDone }]"
    :aria-label="label"
  >
    <header class="kf-review-progress__head">
      <span class="kf-review-progress__label">{{ isDone ? doneText : label }}</span>
      <span v-if="showCounts" class="kf-review-progress__counts">
        <span class="kf-review-progress__done">{{ safeCompleted }}</span>
        <span class="kf-review-progress__sep" aria-hidden="true">/</span>
        <span class="kf-review-progress__total">{{ safeTotal }}</span>
      </span>
    </header>

    <div
      class="kf-review-progress__track"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="safeTotal"
      :aria-valuenow="safeCompleted"
      :aria-valuetext="`已完成 ${safeCompleted} / ${safeTotal}`"
      :aria-label="label"
    >
      <span class="kf-review-progress__bar" :style="{ width: `${percent}%` }" />
    </div>

    <div v-if="breakdown.length || remainingText" class="kf-review-progress__meta">
      <span v-if="remainingText" class="kf-review-progress__remaining">{{ remainingText }}</span>
      <span v-for="item in breakdown" :key="item.label" class="kf-review-progress__chip">
        {{ item.label }}
        <b class="kf-review-progress__chip-value">{{ item.value }}</b>
      </span>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
/**
 * KfReviewProgress — 复习进度条。
 *
 * 只做展示：total / completed 由宿主的复习会话提供，
 * 组件不保存进度、不推断到期数量、不与后端同步。
 */
import { computed } from 'vue'
import type { KfReviewProgressProps } from './types'

const props = withDefaults(defineProps<KfReviewProgressProps>(), {
  total: 0,
  completed: 0,
  remaining: null,
  label: '今日复习',
  showCounts: true,
  breakdown: () => [],
  size: 'md',
  doneText: '今日复习已完成',
})

function clampInt(value: number, min = 0): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.round(value))
}

const safeTotal = computed(() => clampInt(props.total))
const safeCompleted = computed(() => Math.min(clampInt(props.completed), Math.max(safeTotal.value, 0)))
const safeRemaining = computed(() => {
  if (props.remaining === null) return Math.max(safeTotal.value - safeCompleted.value, 0)
  return clampInt(props.remaining)
})
const percent = computed(() => (safeTotal.value === 0 ? 0 : Math.min(100, Math.round((safeCompleted.value / safeTotal.value) * 100))))
const isDone = computed(() => safeTotal.value > 0 && safeRemaining.value === 0)
const remainingText = computed(() => (safeRemaining.value > 0 ? `还剩 ${safeRemaining.value} 张` : ''))
</script>

<style scoped>
.kf-review-progress {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
}
.kf-review-progress--sm {
  padding: var(--kf-space-2) var(--kf-space-3);
  gap: 6px;
}
.kf-review-progress__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-review-progress__label {
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-review-progress--sm .kf-review-progress__label {
  font-size: var(--kf-fs-caption);
}
.kf-review-progress--done .kf-review-progress__label {
  color: var(--kf-success);
}
.kf-review-progress__counts {
  flex: none;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  font-variant-numeric: tabular-nums;
}
.kf-review-progress__done {
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
}
.kf-review-progress__sep {
  margin: 0 1px;
  opacity: 0.5;
}
.kf-review-progress__track {
  position: relative;
  height: 6px;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
}
.kf-review-progress--sm .kf-review-progress__track {
  height: 4px;
}
.kf-review-progress__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--kf-primary);
  transition: width var(--kf-motion-base) ease;
}
.kf-review-progress--done .kf-review-progress__bar {
  background: var(--kf-success);
}
.kf-review-progress__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-review-progress__remaining {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-review-progress__chip {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-review-progress__chip-value {
  color: var(--kf-foreground);
  font-variant-numeric: tabular-nums;
  font-weight: var(--kf-fw-label);
}
@media (prefers-reduced-motion: reduce) {
  .kf-review-progress__bar {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-review-progress__bar {
    background: Highlight;
  }
}
</style>
