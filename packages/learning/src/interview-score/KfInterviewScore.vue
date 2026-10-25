<template>
  <div
    class="kf-interview-score"
    :class="[`kf-interview-score--${size}`, `kf-interview-score--${tone}`]"
    role="img"
    :aria-label="`${label} ${safeScore} 分，满分 ${safeMax} 分${showLevel ? `，${levelText}` : ''}`"
  >
    <div class="kf-interview-score__ring">
      <svg class="kf-interview-score__svg" viewBox="0 0 80 80" aria-hidden="true">
        <circle class="kf-interview-score__track" cx="40" cy="40" :r="radius" fill="none" :stroke-width="strokeWidth" />
        <circle
          class="kf-interview-score__progress"
          cx="40"
          cy="40"
          :r="radius"
          fill="none"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="kf-interview-score__center">
        <span class="kf-interview-score__value">{{ safeScore }}</span>
        <span class="kf-interview-score__max">/ {{ safeMax }}</span>
      </div>
    </div>

    <p v-if="label" class="kf-interview-score__label">{{ label }}</p>
    <p v-if="showLevel" class="kf-interview-score__level">{{ levelText }}</p>

    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * KfInterviewScore — 面试总分环形图。
 *
 * 只画环：分数来自宿主的评分结果，组件不做加权、不推断等级含义
 * （默认档位仅为无 level 时的兜底展示文案，可被 props 覆盖）。
 */
import { computed } from 'vue'
import type { KfInterviewScoreProps } from './types'

const props = withDefaults(defineProps<KfInterviewScoreProps>(), {
  score: 0,
  maxScore: 100,
  label: '综合得分',
  level: '',
  showLevel: true,
  size: 'md',
})

const radius = 34
const circumference = 2 * Math.PI * radius
const strokeWidth = 6

const safeMax = computed(() => {
  const max = Number.isFinite(props.maxScore) && props.maxScore > 0 ? props.maxScore : 100
  return Math.round(max)
})

const safeScore = computed(() => {
  const raw = Number.isFinite(props.score) ? props.score : 0
  return Math.min(safeMax.value, Math.max(0, Math.round(raw)))
})

const ratio = computed(() => safeScore.value / safeMax.value)
const dashOffset = computed(() => Math.round(circumference * (1 - ratio.value) * 100) / 100)

const levelText = computed(() => {
  if (props.level) return props.level
  if (ratio.value >= 0.9) return '优秀'
  if (ratio.value >= 0.75) return '良好'
  if (ratio.value >= 0.6) return '合格'
  return '待提升'
})

const tone = computed(() => {
  if (ratio.value >= 0.75) return 'good'
  if (ratio.value >= 0.6) return 'warn'
  return 'bad'
})
</script>

<style scoped>
.kf-interview-score {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-interview-score__ring {
  position: relative;
  width: 96px;
  height: 96px;
}
.kf-interview-score--sm .kf-interview-score__ring {
  width: 68px;
  height: 68px;
}
.kf-interview-score--lg .kf-interview-score__ring {
  width: 132px;
  height: 132px;
}
.kf-interview-score__svg {
  display: block;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.kf-interview-score__track {
  stroke: var(--kf-muted);
}
.kf-interview-score__progress {
  stroke: var(--kf-primary);
  transition: stroke-dashoffset var(--kf-motion-base) ease;
}
.kf-interview-score--good .kf-interview-score__progress {
  stroke: var(--kf-success);
}
.kf-interview-score--warn .kf-interview-score__progress {
  stroke: var(--kf-warning-color);
}
.kf-interview-score--bad .kf-interview-score__progress {
  stroke: var(--kf-danger);
}
.kf-interview-score__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}
.kf-interview-score__value {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-h2);
  font-weight: var(--kf-fw-h2);
  font-variant-numeric: tabular-nums;
}
.kf-interview-score--sm .kf-interview-score__value {
  font-size: var(--kf-fs-h3);
}
.kf-interview-score--lg .kf-interview-score__value {
  font-size: var(--kf-fs-h1);
}
.kf-interview-score__max {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-interview-score__label {
  margin: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-interview-score__level {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
}
.kf-interview-score--good .kf-interview-score__level {
  color: var(--kf-success);
}
.kf-interview-score--warn .kf-interview-score__level {
  color: var(--kf-warning-color);
}
.kf-interview-score--bad .kf-interview-score__level {
  color: var(--kf-danger);
}
@media (prefers-reduced-motion: reduce) {
  .kf-interview-score__progress {
    transition: none;
  }
}
</style>
