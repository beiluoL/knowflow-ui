<template>
  <section class="kf-source-list" :aria-label="ariaLabel || title">
    <header v-if="title || showCount || $slots.header" class="kf-source-list__head">
      <h3 class="kf-source-list__title">{{ title }}</h3>
      <span v-if="showCount" class="kf-source-list__count">{{ sources.length }}</span>
      <slot name="header" />
    </header>

    <div v-if="sources.length === 0" class="kf-source-list__empty">
      <slot name="empty">
        <KfIcon name="file-text" :size="16" aria-hidden="true" />
        <span>{{ emptyText }}</span>
      </slot>
    </div>

    <div v-else class="kf-source-list__items">
      <template v-for="(item, index) in visible" :key="item.id">
        <slot name="item" :item="item" :index="index">
          <KfCitationCard
            :index="index + 1"
            :title="item.title"
            :source="item.source"
            :url="item.url"
            :snippet="dense ? '' : item.snippet"
            :score="item.score ?? null"
            :locator="item.locator"
            :active="item.id === activeId"
            @open="emit('open', item.url || '', item)"
            @click="emit('select', item, index)"
          />
        </slot>
      </template>
    </div>

    <button
      v-if="hiddenCount > 0"
      type="button"
      class="kf-source-list__more"
      @click="expanded = true"
    >
      展开其余 {{ hiddenCount }} 条
      <KfIcon name="chevron-down" :size="13" aria-hidden="true" />
    </button>
    <button
      v-else-if="expandable && expanded && maxVisible > 0"
      type="button"
      class="kf-source-list__more"
      @click="expanded = false"
    >
      收起
      <KfIcon name="chevron-up" :size="13" aria-hidden="true" />
    </button>
  </section>
</template>

<script setup lang="ts">
/**
 * KfSourceList — 引用来源列表（RAG「参考资料」面板）。
 *
 * 只做列表渲染、折叠与选中转发。检索与排序由宿主完成：
 * 组件不会按 score 重排，也不会过滤低分条目 —— 那是产品策略不是 UI 职责。
 */
import { computed, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import KfCitationCard from '../citation-card/KfCitationCard.vue'
import type { KfSourceListEmits, KfSourceListProps } from './types'

const props = withDefaults(defineProps<KfSourceListProps>(), {
  sources: () => [],
  title: '参考来源',
  showCount: true,
  maxVisible: 0,
  activeId: '',
  dense: false,
  emptyText: '本次回答没有引用来源',
  ariaLabel: '',
})

const emit = defineEmits<KfSourceListEmits>()

const expanded = ref(false)

const expandable = computed(() => props.maxVisible > 0 && props.sources.length > props.maxVisible)
const visible = computed(() =>
  expandable.value && !expanded.value ? props.sources.slice(0, props.maxVisible) : props.sources,
)
const hiddenCount = computed(() => props.sources.length - visible.value.length)
</script>

<style scoped>
.kf-source-list {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-source-list__head {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-source-list__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
}
.kf-source-list__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-source-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-source-list__empty {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  padding: var(--kf-space-3);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-source-list__more {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  height: 24px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-primary);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  cursor: pointer;
}
.kf-source-list__more:hover {
  background: var(--kf-primary-subtle);
}
.kf-source-list__more:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
</style>
