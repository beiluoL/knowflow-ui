<template>
  <div class="st-page">
    <header class="st-page__header">
      <div class="st-page__heading">
        <div class="st-page__title-row">
          <h2 class="st-page__title">组件目录</h2>
          <span class="st-chip">{{ ENTRIES.length }} 个条目</span>
          <span class="st-chip">{{ STORIES.length }} 个 Story</span>
        </div>
        <p class="st-page__desc">
          KnowFlow V5 组件开发中心的完整迁移：65 个条目原样保留，状态按 v0.2.0 重新核算。
          点击卡片进入预览；⌘K 可以直接搜组件或 Story。
        </p>
      </div>
    </header>

    <div class="st-filters">
      <div class="st-filters__search">
        <KfIcon name="search" :size="15" aria-hidden="true" />
        <input
          v-model="keyword"
          class="st-filters__input"
          type="search"
          placeholder="按名称 / 分类 / 组件名过滤"
          aria-label="过滤组件"
        />
      </div>
      <div class="st-segmented" role="group" aria-label="按状态过滤">
        <button
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          type="button"
          class="st-segmented__item"
          :class="{ 'st-segmented__item--active': status === option.value }"
          :aria-pressed="status === option.value"
          @click="status = option.value"
        >
          {{ option.label }}
          <span class="st-segmented__hint">{{ statusCount[option.value] }}</span>
        </button>
      </div>
    </div>

    <div v-for="group in groups" :key="group.category" class="st-catalog__group">
      <div class="st-catalog__head">
        <h3>{{ group.category }}</h3>
        <span class="st-catalog__count">{{ group.entries.length }}</span>
      </div>
      <ul class="st-catalog">
        <li v-for="item in group.entries" :key="item.id" class="st-catalog__item">
          <button type="button" class="st-card-button" @click="open(item.id)">
            <span class="st-card-button__head">
              <span class="st-card-button__title">{{ item.title }}</span>
              <span class="st-badge" :class="`st-badge--${item.status}`">{{ item.status }}</span>
            </span>
            <code class="st-card-button__name">{{ item.name }}</code>
            <span class="st-card-button__meta">
              {{ item.components.length ? item.components.join(' + ') : '无真实组件' }}
            </span>
            <span class="st-card-button__meta st-card-button__meta--soft">
              {{ storyCount[item.id] ?? 0 }} Story · {{ item.props.length }} Props
            </span>
          </button>
        </li>
      </ul>
    </div>

    <p v-if="!groups.length" class="st-panel__empty">没有匹配的条目。</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 目录页：65 条目的全部入口。
 *
 * 分类顺序沿用 V5（P0 → P1 → AI/学习 → 扩展 → 其他），不按字母重排：
 * 顺序本身是文档的一部分。
 */
import { computed, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { CATEGORIES, ENTRIES } from '../registry/entries'
import { STORIES, storyCountByComponent } from '../registry/stories'
import { navigate } from '../composables/useHashRoute'
import type { EntryStatus, PlaygroundEntry } from '../registry/types'

const keyword = ref('')
const status = ref<'all' | EntryStatus>('all')

const STATUS_OPTIONS: Array<{ value: 'all' | EntryStatus; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'real', label: '真实' },
  { value: 'demo', label: '演示' },
  { value: 'missing', label: '未实现' },
]

const storyCount = storyCountByComponent()

const statusCount = computed(() => ({
  all: ENTRIES.length,
  real: ENTRIES.filter((entry) => entry.status === 'real').length,
  demo: ENTRIES.filter((entry) => entry.status === 'demo').length,
  missing: ENTRIES.filter((entry) => entry.status === 'missing').length,
}))

function matches(entry: PlaygroundEntry): boolean {
  if (status.value !== 'all' && entry.status !== status.value) return false
  const needle = keyword.value.trim().toLowerCase()
  if (!needle) return true
  return `${entry.name} ${entry.title} ${entry.category} ${entry.components.join(' ')}`
    .toLowerCase()
    .includes(needle)
}

const groups = computed(() =>
  CATEGORIES.map((category) => ({
    category,
    entries: ENTRIES.filter((entry) => entry.category === category && matches(entry)),
  })).filter((group) => group.entries.length > 0),
)

function open(id: string): void {
  navigate({ view: 'component', entryId: id, storyId: '', tab: 'preview' })
}
</script>
