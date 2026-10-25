<template>
  <section
    class="kf-answer-feedback"
    :class="`kf-answer-feedback--${status}`"
    role="status"
    aria-live="polite"
  >
    <header class="kf-answer-feedback__head">
      <span class="kf-answer-feedback__icon" aria-hidden="true">
        <KfIcon :name="meta.icon" :size="15" />
      </span>
      <p class="kf-answer-feedback__title">{{ title || meta.text }}</p>
      <span v-if="scoreText" class="kf-answer-feedback__score">{{ scoreText }}</span>
    </header>

    <dl v-if="answer || correctAnswer" class="kf-answer-feedback__compare">
      <div v-if="answer" class="kf-answer-feedback__row">
        <dt class="kf-answer-feedback__dt">{{ answerLabel }}</dt>
        <dd class="kf-answer-feedback__dd">{{ answer }}</dd>
      </div>
      <div v-if="correctAnswer" class="kf-answer-feedback__row">
        <dt class="kf-answer-feedback__dt">{{ correctLabel }}</dt>
        <dd class="kf-answer-feedback__dd kf-answer-feedback__dd--correct">{{ correctAnswer }}</dd>
      </div>
    </dl>

    <div v-if="$slots.default || explanation" class="kf-answer-feedback__explain">
      <p class="kf-answer-feedback__explain-title">解析</p>
      <slot>
        <p class="kf-answer-feedback__explain-text">{{ explanation }}</p>
      </slot>
    </div>

    <footer v-if="retryable || $slots.actions" class="kf-answer-feedback__foot">
      <slot name="actions" />
      <button v-if="retryable" type="button" class="kf-answer-feedback__retry" @click="emit('retry')">
        <KfIcon name="rotate-ccw" :size="13" aria-hidden="true" />
        <span>{{ retryLabel }}</span>
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
/**
 * KfAnswerFeedback — 作答反馈（对 / 错 / 部分正确 / 跳过 + 解析）。
 *
 * 组件不判断对错：status 由宿主根据评分规则给出。
 * 展示的正确答案与得分同样来自宿主，组件不做计算与格式化。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type {
  KfAnswerFeedbackEmits,
  KfAnswerFeedbackProps,
  KfAnswerFeedbackStatus,
} from './types'

const props = withDefaults(defineProps<KfAnswerFeedbackProps>(), {
  status: 'correct',
  title: '',
  answer: '',
  correctAnswer: '',
  explanation: '',
  score: '',
  retryable: false,
  retryLabel: '再试一次',
  answerLabel: '你的答案',
  correctLabel: '正确答案',
})

const emit = defineEmits<KfAnswerFeedbackEmits>()

const META: Record<KfAnswerFeedbackStatus, { icon: string; text: string }> = {
  correct: { icon: 'check-circle', text: '回答正确' },
  incorrect: { icon: 'x-circle', text: '回答错误' },
  partial: { icon: 'alert-circle', text: '部分正确' },
  skipped: { icon: 'minus', text: '已跳过' },
}

const meta = computed(() => META[props.status])
const scoreText = computed(() => props.score.trim())
</script>

<style scoped>
.kf-answer-feedback {
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
.kf-answer-feedback--correct {
  border-color: var(--kf-success);
  background: var(--kf-success-surface);
}
.kf-answer-feedback--incorrect {
  border-color: var(--kf-danger);
  background: var(--kf-danger-surface);
}
.kf-answer-feedback--partial {
  border-color: var(--kf-warning-color);
  background: var(--kf-warning-surface);
}
.kf-answer-feedback__head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-answer-feedback__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-answer-feedback--correct .kf-answer-feedback__icon {
  background: var(--kf-success);
  color: var(--kf-primary-foreground);
}
.kf-answer-feedback--incorrect .kf-answer-feedback__icon {
  background: var(--kf-danger);
  color: var(--kf-primary-foreground);
}
.kf-answer-feedback--partial .kf-answer-feedback__icon {
  background: var(--kf-warning-color);
  color: var(--kf-primary-foreground);
}
.kf-answer-feedback__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
}
.kf-answer-feedback__score {
  margin-left: auto;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  font-variant-numeric: tabular-nums;
}
.kf-answer-feedback__compare {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}
.kf-answer-feedback__row {
  display: flex;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-answer-feedback__dt {
  flex: none;
  min-width: 56px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-answer-feedback__dd {
  margin: 0;
  min-width: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  overflow-wrap: anywhere;
}
.kf-answer-feedback__dd--correct {
  color: var(--kf-success);
  font-weight: var(--kf-fw-label);
}
.kf-answer-feedback--incorrect .kf-answer-feedback__dd--correct,
.kf-answer-feedback--partial .kf-answer-feedback__dd--correct {
  color: var(--kf-foreground);
}
.kf-answer-feedback__explain {
  min-width: 0;
  padding-top: var(--kf-space-2);
  border-top: 1px solid var(--kf-border);
}
.kf-answer-feedback__explain-title {
  margin: 0 0 2px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
}
.kf-answer-feedback__explain-text {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-answer-feedback__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--kf-space-2);
}
.kf-answer-feedback__retry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-answer-feedback__retry:hover {
  background: var(--kf-muted);
}
.kf-answer-feedback__retry:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
</style>
