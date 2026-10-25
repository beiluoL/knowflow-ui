<template>
  <article class="kf-question-card" :aria-label="ariaLabel || `第 ${index || 1} 题`">
    <header class="kf-question-card__head">
      <span v-if="index" class="kf-question-card__index">第 {{ index }} 题</span>
      <span v-if="total" class="kf-question-card__total">共 {{ total }} 题</span>
      <span class="kf-question-card__type">{{ typeText }}</span>
      <span v-if="difficultyText" class="kf-question-card__difficulty" :class="`kf-question-card__difficulty--${difficulty}`">
        {{ difficultyText }}
      </span>
      <span v-if="points" class="kf-question-card__points">{{ points }} 分</span>
      <slot name="meta" />
    </header>

    <div class="kf-question-card__body">
      <slot>
        <p class="kf-question-card__text">{{ question || '（题干为空）' }}</p>
      </slot>
      <slot name="extra" />
    </div>

    <div v-if="tags.length" class="kf-question-card__tags">
      <span v-for="tag in tags" :key="tag" class="kf-question-card__tag">{{ tag }}</span>
    </div>

    <div v-if="hint" class="kf-question-card__hint-wrap">
      <button
        type="button"
        class="kf-question-card__hint-toggle"
        :aria-expanded="hintVisible"
        :aria-controls="hintId"
        @click="toggleHint"
      >
        <KfIcon :name="hintVisible ? 'eye-off' : 'help-circle'" :size="13" aria-hidden="true" />
        <span>{{ hintVisible ? '收起提示' : '查看提示' }}</span>
      </button>
      <p v-show="hintVisible" :id="hintId" class="kf-question-card__hint">{{ hint }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * KfQuestionCard — 题目卡片头部（题号 / 题型 / 难度 / 分值 / 提示）。
 *
 * 只展示题干与元信息，不判定答案、不计分、不保存作答。
 * 答题控件（KfAnswerOptions 等）由宿主放在默认插槽或 `#extra` 中。
 */
import { computed, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { nextUid } from '../shared/uid'
import type { KfQuestionCardEmits, KfQuestionCardProps, KfQuestionDifficulty, KfQuestionType } from './types'

const props = withDefaults(defineProps<KfQuestionCardProps>(), {
  question: '',
  type: 'single',
  index: 0,
  total: 0,
  difficulty: undefined,
  hint: '',
  tags: () => [],
  points: 0,
  ariaLabel: '',
})

const emit = defineEmits<KfQuestionCardEmits>()

const hintId = nextUid('kf-question-card-hint')
const hintVisible = ref(false)

const TYPE_TEXT: Record<KfQuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  'true-false': '判断题',
  'short-answer': '简答题',
  essay: '论述题',
}

const DIFFICULTY_TEXT: Record<KfQuestionDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '较难',
}

const typeText = computed(() => TYPE_TEXT[props.type])
const difficultyText = computed(() => (props.difficulty ? DIFFICULTY_TEXT[props.difficulty] : ''))

function toggleHint(): void {
  hintVisible.value = !hintVisible.value
  emit('hint', hintVisible.value)
}
</script>

<style scoped>
.kf-question-card {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-question-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-question-card__index {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
}
.kf-question-card__total {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-question-card__type {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
}
.kf-question-card__difficulty {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-question-card__difficulty--easy {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-question-card__difficulty--hard {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-question-card__points {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-question-card__body {
  min-width: 0;
}
.kf-question-card__text {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-lg);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-lg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-question-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.kf-question-card__tag {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-question-card__hint-wrap {
  min-width: 0;
}
.kf-question-card__hint-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kf-primary);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  cursor: pointer;
}
.kf-question-card__hint-toggle:hover {
  text-decoration: underline;
}
.kf-question-card__hint-toggle:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 2px;
  border-radius: var(--kf-radius-xs);
}
.kf-question-card__hint {
  margin: 6px 0 0;
  padding: var(--kf-space-2) var(--kf-space-3);
  border-left: 2px solid var(--kf-primary);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-primary-subtle);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
