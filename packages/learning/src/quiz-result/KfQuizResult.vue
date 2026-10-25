<template>
  <section class="kf-quiz-result" :class="{ 'kf-quiz-result--passed': passed, 'kf-quiz-result--failed': !passed && showPass }">
    <header class="kf-quiz-result__head">
      <p class="kf-quiz-result__title">{{ title }}</p>
      <span v-if="showPass" class="kf-quiz-result__badge">{{ passed ? '通过' : '未通过' }}</span>
      <span v-if="duration" class="kf-quiz-result__duration">用时 {{ duration }}</span>
    </header>

    <div class="kf-quiz-result__score">
      <span class="kf-quiz-result__score-value">{{ scoreText }}</span>
      <span class="kf-quiz-result__score-unit">分</span>
      <span v-if="showPass" class="kf-quiz-result__pass-line">通过线 {{ safePassScore }}</span>
    </div>

    <dl class="kf-quiz-result__stats">
      <div v-if="total" class="kf-quiz-result__stat">
        <dt>总题数</dt>
        <dd>{{ total }}</dd>
      </div>
      <div v-if="correct !== null" class="kf-quiz-result__stat kf-quiz-result__stat--ok">
        <dt>正确</dt>
        <dd>{{ correct }}</dd>
      </div>
      <div v-if="incorrect !== null" class="kf-quiz-result__stat kf-quiz-result__stat--bad">
        <dt>错误</dt>
        <dd>{{ incorrect }}</dd>
      </div>
      <div v-if="skipped !== null" class="kf-quiz-result__stat">
        <dt>跳过</dt>
        <dd>{{ skipped }}</dd>
      </div>
    </dl>

    <slot />

    <footer v-if="$slots.actions || reviewLabel || retryLabel" class="kf-quiz-result__foot">
      <slot name="actions">
        <button v-if="reviewLabel" type="button" class="kf-quiz-result__btn kf-quiz-result__btn--ghost" @click="emit('review')">
          {{ reviewLabel }}
        </button>
        <button v-if="retryLabel" type="button" class="kf-quiz-result__btn kf-quiz-result__btn--primary" @click="emit('retry')">
          {{ retryLabel }}
        </button>
      </slot>
    </footer>
  </section>
</template>

<script setup lang="ts">
/**
 * KfQuizResult — 测验结果汇总。
 *
 * 不做统计：score / correct / incorrect / skipped 全部由宿主计算后传入。
 * 组件只把越界的分数裁剪到 0–100 防止展示出 "120 分" 这类脏数据。
 */
import { computed } from 'vue'
import type { KfQuizResultEmits, KfQuizResultProps } from './types'

const props = withDefaults(defineProps<KfQuizResultProps>(), {
  score: 0,
  passScore: 60,
  total: 0,
  correct: null,
  incorrect: null,
  skipped: null,
  duration: '',
  title: '本次结果',
  showPass: true,
  retryLabel: '再测一次',
  reviewLabel: '查看解析',
})

const emit = defineEmits<KfQuizResultEmits>()

const safeScore = computed(() => {
  if (!Number.isFinite(props.score)) return 0
  return Math.min(100, Math.max(0, Math.round(props.score)))
})
const safePassScore = computed(() => Math.min(100, Math.max(0, Math.round(props.passScore))))
const scoreText = computed(() => String(safeScore.value))
const passed = computed(() => safeScore.value >= safePassScore.value)
</script>

<style scoped>
.kf-quiz-result {
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
.kf-quiz-result--passed {
  border-color: var(--kf-success);
}
.kf-quiz-result--failed {
  border-color: var(--kf-warning-color);
}
.kf-quiz-result__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-quiz-result__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
}
.kf-quiz-result__badge {
  padding: 1px 8px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
}
.kf-quiz-result--passed .kf-quiz-result__badge {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-quiz-result--failed .kf-quiz-result__badge {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-quiz-result__duration {
  margin-left: auto;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-quiz-result__score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}
.kf-quiz-result__score-value {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-h1);
  font-weight: var(--kf-fw-h1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kf-quiz-result__score-unit {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-quiz-result__pass-line {
  margin-left: var(--kf-space-2);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-quiz-result__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  margin: 0;
}
.kf-quiz-result__stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  font-size: var(--kf-fs-caption);
}
.kf-quiz-result__stat dt {
  color: var(--kf-muted-foreground);
}
.kf-quiz-result__stat dd {
  margin: 0;
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
}
.kf-quiz-result__stat--ok dd {
  color: var(--kf-success);
}
.kf-quiz-result__stat--bad dd {
  color: var(--kf-danger);
}
.kf-quiz-result__foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  justify-content: flex-end;
}
.kf-quiz-result__btn {
  height: var(--kf-control-height-md);
  padding: 0 var(--kf-space-4);
  border: 1px solid transparent;
  border-radius: var(--kf-radius-sm);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-quiz-result__btn--primary {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-quiz-result__btn--primary:hover {
  background: var(--kf-primary-hover);
}
.kf-quiz-result__btn--ghost {
  border-color: var(--kf-border);
  background: var(--kf-card);
  color: var(--kf-foreground);
}
.kf-quiz-result__btn--ghost:hover {
  background: var(--kf-muted);
}
.kf-quiz-result__btn:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
</style>
