<template>
  <section class="kf-evidence-panel" :aria-label="ariaLabel || title">
    <header v-if="title || query || $slots.header" class="kf-evidence-panel__head">
      <h3 class="kf-evidence-panel__title">{{ title }}</h3>
      <p v-if="query" class="kf-evidence-panel__query">
        <span class="kf-evidence-panel__query-label">检索</span>
        <span class="kf-evidence-panel__query-text">{{ query }}</span>
      </p>
      <slot name="header" />
    </header>

    <div v-if="chunks.length === 0" class="kf-evidence-panel__empty">
      <slot name="empty">
        <KfIcon name="search" :size="16" aria-hidden="true" />
        <span>{{ emptyText }}</span>
      </slot>
    </div>

    <ol v-else class="kf-evidence-panel__list">
      <li v-for="(chunk, index) in chunks" :key="chunk.id" class="kf-evidence-panel__item">
        <slot name="chunk" :chunk="chunk" :index="index">
          <div class="kf-evidence-panel__meta">
            <span class="kf-evidence-panel__index">#{{ index + 1 }}</span>
            <span v-if="chunk.source" class="kf-evidence-panel__source">{{ chunk.source }}</span>
            <span v-if="chunk.locator" class="kf-evidence-panel__locator">{{ chunk.locator }}</span>
            <span v-if="showScore && scoreText(chunk)" class="kf-evidence-panel__score">
              {{ scoreText(chunk) }}
            </span>
            <button type="button" class="kf-evidence-panel__select" @click="emit('select', chunk, index)">
              定位
            </button>
          </div>
          <p class="kf-evidence-panel__text" :style="clampStyle">
            <template v-for="(segment, i) in split(chunk)" :key="i">
              <mark v-if="segment.match" class="kf-evidence-panel__mark">{{ segment.text }}</mark>
              <span v-else>{{ segment.text }}</span>
            </template>
          </p>
        </slot>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
/**
 * KfEvidencePanel — RAG 证据面板（检索片段 + 命中高亮 + 定位）。
 *
 * 高亮通过「分段 + <mark> 元素」实现，不使用 v-html：
 * 片段文本即便包含 `<script>` 也只会被当成纯文本渲染。
 * 组件不计算相关性、不重排、不丢弃低分片段。
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { formatScore } from '../shared/format'
import { splitByTerms, type KfTextSegment } from '../shared/highlight'
import type { KfEvidenceChunk, KfEvidencePanelEmits, KfEvidencePanelProps } from './types'

const props = withDefaults(defineProps<KfEvidencePanelProps>(), {
  chunks: () => [],
  title: '检索证据',
  query: '',
  emptyText: '没有命中任何证据片段',
  showScore: true,
  clampLines: 4,
  ariaLabel: '',
})

const emit = defineEmits<KfEvidencePanelEmits>()

const clampStyle = computed<CSSProperties>(() => {
  if (props.clampLines <= 0) return {}
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: String(props.clampLines),
    overflow: 'hidden',
  }
})

function scoreText(chunk: KfEvidenceChunk): string {
  return formatScore(chunk.score)
}

function split(chunk: KfEvidenceChunk): KfTextSegment[] {
  return splitByTerms(chunk.text, chunk.highlights ?? [])
}
</script>

<style scoped>
.kf-evidence-panel {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-evidence-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-evidence-panel__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
}
.kf-evidence-panel__query {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  min-width: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-evidence-panel__query-label {
  flex: none;
  padding: 0 4px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  font-size: var(--kf-fs-xs);
}
.kf-evidence-panel__query-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-evidence-panel__empty {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  padding: var(--kf-space-3);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-evidence-panel__list {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-evidence-panel__item {
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-2) var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
}
.kf-evidence-panel__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-evidence-panel__index {
  color: var(--kf-primary);
  font-variant-numeric: tabular-nums;
  font-weight: var(--kf-fw-label);
}
.kf-evidence-panel__source,
.kf-evidence-panel__locator {
  overflow: hidden;
  max-width: 40%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-evidence-panel__locator {
  padding: 0 4px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
}
.kf-evidence-panel__score {
  color: var(--kf-primary);
  font-variant-numeric: tabular-nums;
}
.kf-evidence-panel__select {
  margin-left: auto;
  height: 20px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-xs);
  cursor: pointer;
}
.kf-evidence-panel__select:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-evidence-panel__select:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-evidence-panel__text {
  margin: var(--kf-space-1) 0 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  overflow-wrap: anywhere;
}
.kf-evidence-panel__mark {
  padding: 0 2px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-highlight-subtle);
  color: var(--kf-highlight);
  font-weight: var(--kf-fw-label);
}
</style>
