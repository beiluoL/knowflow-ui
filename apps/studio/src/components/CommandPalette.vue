<template>
  <div v-if="open" class="st-palette" role="dialog" aria-modal="true" aria-label="命令面板">
    <div class="st-palette__backdrop" @click="$emit('close')" />
    <div class="st-palette__panel">
      <div class="st-palette__search">
        <KfIcon name="search" :size="16" aria-hidden="true" />
        <input
          ref="input"
          v-model="query"
          class="st-palette__input"
          type="text"
          placeholder="搜索组件或 Story（↑↓ 选择，Enter 打开，Esc 关闭）"
          aria-label="搜索组件或 Story"
          @keydown="onKeydown"
        />
        <kbd class="st-palette__kbd">Esc</kbd>
      </div>

      <ul v-if="results.length" class="st-palette__list" role="listbox" aria-label="搜索结果">
        <li v-for="(item, index) in results" :key="item.key">
          <button
            type="button"
            class="st-palette__item"
            :class="{ 'st-palette__item--active': index === cursor }"
            role="option"
            :aria-selected="index === cursor ? 'true' : 'false'"
            @mousemove="cursor = index"
            @click="choose(item)"
          >
            <span class="st-palette__item-main">
              <span class="st-palette__item-title">{{ item.title }}</span>
              <span v-if="item.subtitle" class="st-palette__item-sub">{{ item.subtitle }}</span>
            </span>
            <span class="st-badge" :class="`st-badge--${item.status}`">{{ item.status }}</span>
          </button>
        </li>
      </ul>
      <p v-else class="st-palette__empty">没有匹配项。试试「table」「flashcard」或「状态」。</p>

      <footer class="st-palette__foot">
        <span>{{ ENTRIES.length }} 个条目 · {{ STORIES.length }} 个 Story</span>
        <span><kbd>⌘</kbd><kbd>K</kbd> 打开 · <kbd>↑</kbd><kbd>↓</kbd> 移动 · <kbd>↵</kbd> 打开</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 命令面板（⌘K / Ctrl+K）—— 把 65 条目 + 153 Story 变成可键盘直达的索引。
 *
 * 结果分两类：条目（打开默认 Story）与具体 Story（深链接）。
 * 输入为空时只列条目：在 153 条里翻 Story 没有意义。
 */
import { computed, nextTick, ref, watch } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { ENTRIES } from '../registry/entries'
import { STORIES } from '../registry/stories'
import { navigate } from '../composables/useHashRoute'
import type { EntryStatus } from '../registry/types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

interface PaletteItem {
  key: string
  title: string
  subtitle: string
  status: EntryStatus
  entryId: string
  storyId: string
}

const query = ref('')
const cursor = ref(0)
const input = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    query.value = ''
    cursor.value = 0
    await nextTick()
    input.value?.focus()
  },
)

const entryItems = computed<PaletteItem[]>(() =>
  ENTRIES.map((entry) => ({
    key: `e:${entry.id}`,
    title: `${entry.title} · ${entry.name}`,
    subtitle: entry.category,
    status: entry.status,
    entryId: entry.id,
    storyId: '',
  })),
)

const storyItems = computed<PaletteItem[]>(() =>
  STORIES.map((story) => {
    const entry = ENTRIES.find((candidate) => candidate.id === story.componentId)
    return {
      key: `s:${story.componentId}:${story.storyId}`,
      title: `${entry?.title ?? story.componentId} · ${story.title}`,
      subtitle: story.storyId,
      status: entry?.status ?? 'missing',
      entryId: story.componentId,
      storyId: story.storyId,
    }
  }),
)

const results = computed<PaletteItem[]>(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return entryItems.value
  return [...entryItems.value, ...storyItems.value]
    .filter((item) =>
      `${item.title} ${item.subtitle} ${item.storyId}`.toLowerCase().includes(keyword),
    )
    .slice(0, 24)
})

function choose(item: PaletteItem): void {
  navigate({ view: 'component', entryId: item.entryId, storyId: item.storyId, tab: 'preview' })
  emit('close')
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    cursor.value = (cursor.value + 1) % Math.max(results.value.length, 1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    cursor.value =
      (cursor.value - 1 + Math.max(results.value.length, 1)) % Math.max(results.value.length, 1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const item = results.value[cursor.value]
    if (item) choose(item)
  }
}

watch(query, () => {
  cursor.value = 0
})
</script>
