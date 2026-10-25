<template>
  <section class="kf-interview-feedback">
    <header class="kf-interview-feedback__head">
      <KfIcon name="award" :size="15" class="kf-interview-feedback__icon" aria-hidden="true" />
      <h3 class="kf-interview-feedback__title">{{ title }}</h3>
    </header>

    <p v-if="overall" class="kf-interview-feedback__overall">{{ overall }}</p>

    <div v-if="dimensions.length" class="kf-interview-feedback__dimensions">
      <article v-for="dimension in dimensions" :key="dimension.key" class="kf-interview-feedback__dimension">
        <header class="kf-interview-feedback__dimension-head">
          <span class="kf-interview-feedback__dimension-label">{{ dimension.label }}</span>
          <span v-if="showScores" class="kf-interview-feedback__dimension-score">
            {{ safeScore(dimension) }}
            <span class="kf-interview-feedback__dimension-max">/ {{ maxOf(dimension) }}</span>
          </span>
        </header>

        <div
          class="kf-interview-feedback__track"
          role="progressbar"
          :aria-valuemin="0"
          :aria-valuemax="maxOf(dimension)"
          :aria-valuenow="safeScore(dimension)"
          :aria-label="dimension.label"
        >
          <span
            class="kf-interview-feedback__bar"
            :class="`kf-interview-feedback__bar--${toneOf(dimension)}`"
            :style="{ width: `${percentOf(dimension)}%` }"
          />
        </div>

        <p v-if="dimension.comment" class="kf-interview-feedback__comment">{{ dimension.comment }}</p>
      </article>
    </div>

    <div v-else class="kf-interview-feedback__empty">{{ emptyText }}</div>

    <div v-if="strengths.length || improvements.length" class="kf-interview-feedback__lists">
      <section v-if="strengths.length" class="kf-interview-feedback__list-block">
        <h4 class="kf-interview-feedback__list-title kf-interview-feedback__list-title--good">亮点</h4>
        <ul class="kf-interview-feedback__list">
          <li v-for="(item, index) in strengths" :key="`s-${index}`" class="kf-interview-feedback__list-item">
            <KfIcon name="check" :size="12" class="kf-interview-feedback__list-icon" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <section v-if="improvements.length" class="kf-interview-feedback__list-block">
        <h4 class="kf-interview-feedback__list-title kf-interview-feedback__list-title--warn">待改进</h4>
        <ul class="kf-interview-feedback__list">
          <li v-for="(item, index) in improvements" :key="`i-${index}`" class="kf-interview-feedback__list-item">
            <KfIcon name="arrow-up" :size="12" class="kf-interview-feedback__list-icon" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
/**
 * KfInterviewFeedback — 面试反馈（维度得分 + 总评 + 亮点/待改进）。
 *
 * 不做评分：所有分数、评语、亮点都由宿主的评分管线（可能包含 AI）产出。
 * 组件只把越界分数裁剪到 [0, max] 并换算为进度条宽度，避免脏数据撑破布局。
 */
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfInterviewDimension, KfInterviewFeedbackProps } from './types'

withDefaults(defineProps<KfInterviewFeedbackProps>(), {
  title: '面试反馈',
  dimensions: () => [],
  overall: '',
  strengths: () => [],
  improvements: () => [],
  showScores: true,
  emptyText: '暂无评分明细',
})

function maxOf(dimension: KfInterviewDimension): number {
  const max = dimension.maxScore ?? 100
  return Number.isFinite(max) && max > 0 ? max : 100
}

function safeScore(dimension: KfInterviewDimension): number {
  const raw = Number.isFinite(dimension.score) ? dimension.score : 0
  return Math.min(maxOf(dimension), Math.max(0, Math.round(raw)))
}

function percentOf(dimension: KfInterviewDimension): number {
  return Math.round((safeScore(dimension) / maxOf(dimension)) * 100)
}

function toneOf(dimension: KfInterviewDimension): 'good' | 'warn' | 'bad' {
  const ratio = percentOf(dimension)
  if (ratio >= 80) return 'good'
  if (ratio >= 60) return 'warn'
  return 'bad'
}
</script>

<style scoped>
.kf-interview-feedback {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-3);
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-lg);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
}
.kf-interview-feedback__head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-interview-feedback__icon {
  flex: none;
  color: var(--kf-primary);
}
.kf-interview-feedback__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
}
.kf-interview-feedback__overall {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-interview-feedback__dimensions {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-3);
  min-width: 0;
}
.kf-interview-feedback__dimension {
  min-width: 0;
}
.kf-interview-feedback__dimension-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-interview-feedback__dimension-label {
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-interview-feedback__dimension-score {
  flex: none;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  font-variant-numeric: tabular-nums;
}
.kf-interview-feedback__dimension-max {
  color: var(--kf-muted-foreground);
}
.kf-interview-feedback__track {
  height: 5px;
  margin-top: 5px;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
}
.kf-interview-feedback__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--kf-primary);
  transition: width var(--kf-motion-base) ease;
}
.kf-interview-feedback__bar--good {
  background: var(--kf-success);
}
.kf-interview-feedback__bar--warn {
  background: var(--kf-warning-color);
}
.kf-interview-feedback__bar--bad {
  background: var(--kf-danger);
}
.kf-interview-feedback__comment {
  margin: 4px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  line-height: var(--kf-lh-caption);
  overflow-wrap: anywhere;
}
.kf-interview-feedback__empty {
  padding: var(--kf-space-3);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-interview-feedback__lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--kf-space-3);
  min-width: 0;
}
.kf-interview-feedback__list-block {
  min-width: 0;
}
.kf-interview-feedback__list-title {
  margin: 0 0 4px;
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
}
.kf-interview-feedback__list-title--good {
  color: var(--kf-success);
}
.kf-interview-feedback__list-title--warn {
  color: var(--kf-warning-color);
}
.kf-interview-feedback__list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-interview-feedback__list-item {
  display: flex;
  gap: 5px;
  align-items: flex-start;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  overflow-wrap: anywhere;
}
.kf-interview-feedback__list-icon {
  flex: none;
  margin-top: 2px;
  color: var(--kf-muted-foreground);
}
@media (prefers-reduced-motion: reduce) {
  .kf-interview-feedback__bar {
    transition: none;
  }
}
</style>
