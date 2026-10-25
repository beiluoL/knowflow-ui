<template>
  <article
    class="kf-citation-card"
    :class="{ 'kf-citation-card--active': active, 'kf-citation-card--link': Boolean(url) }"
  >
    <header class="kf-citation-card__head">
      <span v-if="index" class="kf-citation-card__index" aria-hidden="true">{{ index }}</span>
      <div class="kf-citation-card__heading">
        <p class="kf-citation-card__title">{{ title || '未命名来源' }}</p>
        <p v-if="source || locator" class="kf-citation-card__source">
          <span v-if="source" class="kf-citation-card__source-name">{{ source }}</span>
          <span v-if="source && locator" class="kf-citation-card__sep" aria-hidden="true">·</span>
          <span v-if="locator" class="kf-citation-card__locator">{{ locator }}</span>
        </p>
      </div>
      <span v-if="scoreText" class="kf-citation-card__score" :title="`相关性 ${scoreText}`">
        {{ scoreText }}
      </span>
    </header>

    <div v-if="$slots.default || snippet" class="kf-citation-card__body">
      <slot>
        <p class="kf-citation-card__snippet" :style="clampStyle">{{ snippet }}</p>
      </slot>
    </div>

    <footer v-if="$slots.actions || $slots.footer || actions.length || url" class="kf-citation-card__foot">
      <slot name="actions">
        <button
          v-for="action in actions"
          :key="action.key"
          type="button"
          class="kf-citation-card__action"
          :disabled="action.disabled"
          @click.stop="emit('action', action.key)"
        >
          <KfIcon v-if="action.iconName" :name="action.iconName" :size="13" aria-hidden="true" />
          <span>{{ action.label }}</span>
        </button>
      </slot>
      <button
        v-if="url"
        type="button"
        class="kf-citation-card__open"
        :aria-label="`打开来源：${title || url}`"
        @click.stop="emit('open', url)"
      >
        <span>查看来源</span>
        <KfIcon name="external-link" :size="12" aria-hidden="true" />
      </button>
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
/**
 * KfCitationCard — 单条引用卡片（RAG 引用、检索命中、证据条目）。
 *
 * 职责边界：只渲染宿主给的 title/source/snippet/score。
 * 组件不做检索、不算相关性、不拼接或改写引用原文 ——
 * score 仅作为宿主提供的展示值原样呈现（四舍五入为百分比）。
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { formatScore } from '../shared/format'
import type { KfCitationCardEmits, KfCitationCardProps } from './types'

const props = withDefaults(defineProps<KfCitationCardProps>(), {
  index: 0,
  title: '',
  source: '',
  url: '',
  snippet: '',
  score: null,
  locator: '',
  active: false,
  actions: () => [],
  snippetLines: 0,
})

const emit = defineEmits<KfCitationCardEmits>()

const scoreText = computed(() => formatScore(props.score))

const clampStyle = computed<CSSProperties>(() => {
  if (props.snippetLines <= 0) return {}
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: String(props.snippetLines),
    overflow: 'hidden',
  }
})
</script>

<style scoped>
.kf-citation-card {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  transition: border-color var(--kf-motion-fast) ease, background var(--kf-motion-fast) ease;
}
.kf-citation-card:hover {
  border-color: var(--kf-primary);
}
.kf-citation-card--active {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
}
.kf-citation-card__head {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-citation-card__index {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
  font-variant-numeric: tabular-nums;
}
.kf-citation-card__heading {
  flex: 1 1 auto;
  min-width: 0;
}
.kf-citation-card__title {
  margin: 0;
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-citation-card__source {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0 0;
  min-width: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
}
.kf-citation-card__source-name,
.kf-citation-card__locator {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-citation-card__sep {
  flex: none;
  opacity: 0.6;
}
.kf-citation-card__score {
  flex: none;
  padding: 1px 5px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-citation-card__body {
  min-width: 0;
}
.kf-citation-card__snippet {
  margin: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  overflow-wrap: anywhere;
}
.kf-citation-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--kf-space-2);
}
.kf-citation-card__action,
.kf-citation-card__open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  cursor: pointer;
}
.kf-citation-card__open {
  margin-left: auto;
  color: var(--kf-primary);
}
.kf-citation-card__action:hover:not(:disabled),
.kf-citation-card__open:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-citation-card__open:hover {
  color: var(--kf-primary-hover);
}
.kf-citation-card__action:focus-visible,
.kf-citation-card__open:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-citation-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .kf-citation-card {
    transition: none;
  }
}
</style>
