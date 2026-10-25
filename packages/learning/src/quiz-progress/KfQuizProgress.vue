<template>
  <nav class="kf-quiz-progress" :aria-label="ariaLabel">
    <div v-if="showSummary" class="kf-quiz-progress__summary">
      <span class="kf-quiz-progress__summary-main">已答 {{ answeredCount }} / {{ items.length }}</span>
      <span v-if="correctCount || incorrectCount" class="kf-quiz-progress__summary-sub">
        <span class="kf-quiz-progress__ok">对 {{ correctCount }}</span>
        <span class="kf-quiz-progress__bad">错 {{ incorrectCount }}</span>
      </span>
    </div>

    <ol class="kf-quiz-progress__list">
      <li v-for="(item, index) in items" :key="item.id" class="kf-quiz-progress__item">
        <component
          :is="jumpable ? 'button' : 'span'"
          class="kf-quiz-progress__dot"
          :class="[`kf-quiz-progress__dot--${statusOf(item)}`, { 'kf-quiz-progress__dot--current': index === current }]"
          :type="jumpable ? 'button' : undefined"
          :aria-current="index === current ? 'step' : undefined"
          :aria-label="`第 ${index + 1} 题：${STATUS_TEXT[statusOf(item)]}`"
          @click="jumpable && emit('jump', index)"
        >
          {{ item.label || index + 1 }}
        </component>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/**
 * KfQuizProgress — 测验进度导航（题号点阵）。
 *
 * 组件只反映宿主给的 items[].status，不推断「答过 = 对」。
 * 跳题只发 jump 事件，是否允许跳题由宿主的 jumpable 决定。
 */
import { computed } from 'vue'
import type { KfQuizProgressEmits, KfQuizProgressItem, KfQuizProgressProps, KfQuizQuestionStatus } from './types'

const props = withDefaults(defineProps<KfQuizProgressProps>(), {
  items: () => [],
  current: -1,
  showSummary: true,
  jumpable: true,
  ariaLabel: '答题进度',
})

const emit = defineEmits<KfQuizProgressEmits>()

const STATUS_TEXT: Record<KfQuizQuestionStatus, string> = {
  unanswered: '未作答',
  answered: '已作答',
  correct: '正确',
  incorrect: '错误',
}

function statusOf(item: KfQuizProgressItem): KfQuizQuestionStatus {
  return item.status ?? 'unanswered'
}

const answeredCount = computed(() => props.items.filter((item) => statusOf(item) !== 'unanswered').length)
const correctCount = computed(() => props.items.filter((item) => statusOf(item) === 'correct').length)
const incorrectCount = computed(() => props.items.filter((item) => statusOf(item) === 'incorrect').length)
</script>

<style scoped>
.kf-quiz-progress {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-quiz-progress__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--kf-space-2);
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
}
.kf-quiz-progress__summary-main {
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
}
.kf-quiz-progress__summary-sub {
  display: inline-flex;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}
.kf-quiz-progress__ok {
  color: var(--kf-success);
}
.kf-quiz-progress__bad {
  color: var(--kf-danger);
}
.kf-quiz-progress__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-quiz-progress__item {
  display: flex;
}
.kf-quiz-progress__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  font-variant-numeric: tabular-nums;
  cursor: default;
}
button.kf-quiz-progress__dot {
  cursor: pointer;
}
button.kf-quiz-progress__dot:hover {
  border-color: var(--kf-primary);
  color: var(--kf-foreground);
}
.kf-quiz-progress__dot:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-quiz-progress__dot--answered {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-quiz-progress__dot--correct {
  border-color: var(--kf-success);
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-quiz-progress__dot--incorrect {
  border-color: var(--kf-danger);
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-quiz-progress__dot--current {
  border-color: var(--kf-foreground);
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
  box-shadow: inset 0 0 0 1px var(--kf-foreground);
}
@media (forced-colors: active) {
  .kf-quiz-progress__dot--current {
    border-color: Highlight;
    box-shadow: inset 0 0 0 1px Highlight;
  }
}
</style>
