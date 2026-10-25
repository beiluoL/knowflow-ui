<template>
  <article class="kf-interview-question" :class="{ 'kf-interview-question--answering': answering }" :aria-label="ariaLabel">
    <header class="kf-interview-question__head">
      <span v-if="index" class="kf-interview-question__index">第 {{ index }} 题</span>
      <span v-if="total" class="kf-interview-question__total">/ {{ total }}</span>
      <span v-if="category" class="kf-interview-question__category">{{ category }}</span>
      <span v-if="difficultyText" class="kf-interview-question__difficulty" :class="`kf-interview-question__difficulty--${difficulty}`">
        {{ difficultyText }}
      </span>
      <span v-if="timeLimit" class="kf-interview-question__time">
        <KfIcon name="clock" :size="12" aria-hidden="true" />
        {{ timeLimit }}
      </span>
      <span v-if="answered" class="kf-interview-question__answered">{{ answeredLabel }}</span>
    </header>

    <div class="kf-interview-question__body">
      <slot>
        <p class="kf-interview-question__text">{{ question || '（问题为空）' }}</p>
      </slot>
      <slot name="extra" />
      <p v-if="followUp" class="kf-interview-question__follow-up">
        <span class="kf-interview-question__follow-up-label">追问</span>
        {{ followUp }}
      </p>
    </div>

    <footer class="kf-interview-question__foot">
      <button
        v-if="!answering"
        type="button"
        class="kf-interview-question__btn kf-interview-question__btn--primary"
        @click="emit('start')"
      >
        <KfIcon name="zap" :size="13" aria-hidden="true" />
        <span>{{ startLabel }}</span>
      </button>
      <button v-else type="button" class="kf-interview-question__btn kf-interview-question__btn--stop" @click="emit('finish')">
        <KfIcon name="square" :size="12" aria-hidden="true" />
        <span>{{ finishLabel }}</span>
      </button>
      <slot name="actions" />
    </footer>
  </article>
</template>

<script setup lang="ts">
/**
 * KfInterviewQuestion — 面试题卡（题目 + 建议时长 + 作答入口）。
 *
 * 不录音、不计时、不评分：start / finish 只是意图信号，
 * 真正的录音、计时、转写与评分全部由宿主实现。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfInterviewDifficulty, KfInterviewQuestionEmits, KfInterviewQuestionProps } from './types'

const props = withDefaults(defineProps<KfInterviewQuestionProps>(), {
  question: '',
  index: 0,
  total: 0,
  category: '',
  difficulty: undefined,
  timeLimit: '',
  answering: false,
  answered: false,
  followUp: '',
  startLabel: '开始作答',
  finishLabel: '结束作答',
  answeredLabel: '已回答',
  ariaLabel: '面试题',
})

const emit = defineEmits<KfInterviewQuestionEmits>()

const DIFFICULTY_TEXT: Record<KfInterviewDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const difficultyText = computed(() => (props.difficulty ? DIFFICULTY_TEXT[props.difficulty] : ''))
</script>

<style scoped>
.kf-interview-question {
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
  transition: border-color var(--kf-motion-fast) ease;
}
.kf-interview-question--answering {
  border-color: var(--kf-primary);
}
.kf-interview-question__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-interview-question__index {
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
  font-size: var(--kf-fs-caption);
}
.kf-interview-question__total {
  font-variant-numeric: tabular-nums;
}
.kf-interview-question__category {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-interview-question__difficulty {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
}
.kf-interview-question__difficulty--hard {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-interview-question__difficulty--easy {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-interview-question__time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-variant-numeric: tabular-nums;
}
.kf-interview-question__answered {
  margin-left: auto;
  color: var(--kf-success);
}
.kf-interview-question__body {
  min-width: 0;
}
.kf-interview-question__text {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-lg);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-lg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-interview-question__follow-up {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin: var(--kf-space-2) 0 0;
  padding: var(--kf-space-2) var(--kf-space-3);
  border-left: 2px solid var(--kf-primary);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-primary-subtle);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
}
.kf-interview-question__follow-up-label {
  flex: none;
  color: var(--kf-primary);
  font-weight: var(--kf-fw-label);
}
.kf-interview-question__foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
}
.kf-interview-question__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: var(--kf-control-height-md);
  padding: 0 var(--kf-space-4);
  border: 1px solid transparent;
  border-radius: var(--kf-radius-sm);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-interview-question__btn--primary {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-interview-question__btn--primary:hover {
  background: var(--kf-primary-hover);
}
.kf-interview-question__btn--stop {
  background: var(--kf-danger);
  color: var(--kf-primary-foreground);
}
.kf-interview-question__btn:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
@media (prefers-reduced-motion: reduce) {
  .kf-interview-question {
    transition: none;
  }
}
</style>
