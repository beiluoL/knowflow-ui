<template>
  <div class="st-stories">
    <div class="st-stories__head">
      <span class="st-stories__title">Stories</span>
      <span class="st-stories__count">{{ stories.length }}</span>
    </div>

    <div v-for="group in grouped" :key="group.category" class="st-stories__group">
      <p class="st-stories__category">{{ CATEGORY_LABEL[group.category] ?? group.category }}</p>
      <ul class="st-stories__list">
        <li v-for="item in group.items" :key="item.storyId">
          <button
            type="button"
            class="st-story"
            :class="{ 'st-story--active': item.storyId === activeId }"
            :aria-current="item.storyId === activeId ? 'true' : undefined"
            @click="$emit('select', item.storyId)"
          >
            <span class="st-story__title">{{ item.title }}</span>
            <span class="st-story__id">{{ item.storyId }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Story 列表：按类别分组，保持 V5 的 153 条 Story 结构。
 *
 * 类别顺序固定为 Basic → Variants → Sizes → States → Interactive → Form → Edge Cases → Accessibility，
 * 与 stories.ts 的生成顺序一致，避免「刷新后顺序变化」。
 */
import { computed } from 'vue'
import type { PlaygroundStory, StoryCategory } from '../registry/types'

const props = defineProps<{
  stories: PlaygroundStory[]
  activeId: string
}>()

defineEmits<{ select: [storyId: string] }>()

const ORDER: StoryCategory[] = [
  'Basic',
  'Variants',
  'Sizes',
  'States',
  'Interactive',
  'Form',
  'Edge Cases',
  'Accessibility',
]

const CATEGORY_LABEL: Record<string, string> = {
  Basic: '基础',
  Variants: '变体',
  Sizes: '尺寸',
  States: '状态',
  Interactive: '交互',
  Form: '表单',
  'Edge Cases': '边界',
  Accessibility: '可访问性',
}

const grouped = computed(() =>
  ORDER.map((category) => ({
    category,
    items: props.stories.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0),
)
</script>
