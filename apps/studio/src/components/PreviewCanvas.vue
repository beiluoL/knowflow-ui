<template>
  <div class="st-canvas" :class="{ 'st-canvas--fullscreen': fullscreen }">
    <div class="st-canvas__bar">
      <div class="st-canvas__left">
        <span class="st-canvas__label">{{ story.title }}</span>
        <span class="st-badge" :class="`st-badge--${entry.status}`">{{ entry.status }}</span>
        <span class="st-canvas__meta">{{ entry.title }}</span>
      </div>

      <div class="st-canvas__right">
        <div class="st-segmented" role="group" aria-label="视口宽度">
          <button
            v-for="option in VIEWPORT_OPTIONS"
            :key="option.key"
            type="button"
            class="st-segmented__item"
            :class="{ 'st-segmented__item--active': viewport === option.key }"
            :aria-pressed="viewport === option.key"
            @click="$emit('update:viewport', option.key)"
          >
            {{ option.label }}
            <span class="st-segmented__hint">{{ option.width }}</span>
          </button>
        </div>

        <div class="st-segmented" role="group" aria-label="画布背景">
          <button
            v-for="option in BACKGROUNDS"
            :key="option"
            type="button"
            class="st-segmented__swatch"
            :class="{ 'st-segmented__swatch--active': background === option }"
            :style="{ background: option }"
            :aria-label="`背景 ${option}`"
            :aria-pressed="background === option"
            @click="$emit('update:background', option)"
          />
        </div>

        <button type="button" class="st-icon-button" :aria-label="fullscreen ? '退出全屏' : '全屏预览'" @click="toggleFullscreen">
          <KfIcon :name="fullscreen ? 'x' : 'grid'" :size="15" aria-hidden="true" />
        </button>
        <button type="button" class="st-icon-button" aria-label="重置 Props" @click="$emit('reset')">
          <KfIcon name="rotate-ccw" :size="15" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="st-canvas__stage" :style="{ background }">
      <div
        class="st-canvas__frame"
        :style="{ width: frameWidth }"
        :data-viewport="viewport"
      >
        <div ref="host" class="preview-host" data-preview-root>
          <component :is="preview" :key="previewKey" :api="api" />
        </div>
      </div>
    </div>

    <div v-if="events.length" class="st-events">
      <div class="st-events__head">
        <span>事件日志（本地）</span>
        <button type="button" class="st-link-button" @click="$emit('clear-events')">清空</button>
      </div>
      <ul class="st-events__list">
        <li v-for="(item, index) in events.slice(0, 6)" :key="`${item.at}-${index}`" class="st-events__item">
          <code>{{ item.name }}</code>
          <span class="st-events__payload">{{ formatPayload(item.payload) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 预览画布 —— 只负责「框住真实组件 + 视口 + 背景 + 事件日志」。
 *
 * 尺寸口径：desktop 自适应（上限 100%），tablet 834px，mobile 390px，
 * 与 V5 的 Desktop/Tablet/Mobile 档位一致；不做「假缩放」，
 * 因此 100% 缩放下量到的尺寸就是真实尺寸。
 */
import { computed, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { Component } from 'vue'
import type { PreviewApi } from '../previews/api'
import type { ViewportKey } from '../composables/useHashRoute'

const props = defineProps<{
  entry: { id: string; title: string; status: string }
  story: { storyId: string; title: string }
  preview: Component
  api: PreviewApi
  previewKey: string
  viewport: ViewportKey
  background: string
  events: Array<{ name: string; payload?: unknown; at: number }>
}>()

defineEmits<{
  'update:viewport': [value: ViewportKey]
  'update:background': [value: string]
  reset: []
  'clear-events': []
}>()

const VIEWPORT_OPTIONS: Array<{ key: ViewportKey; label: string; width: string }> = [
  { key: 'desktop', label: '桌面', width: '自适应' },
  { key: 'tablet', label: '平板', width: '834' },
  { key: 'mobile', label: '手机', width: '390' },
]

const BACKGROUNDS = ['#FFFFFF', '#F7F8FA', '#EFF3FB', '#101828']

const host = ref<HTMLElement | null>(null)
const fullscreen = ref(false)

const frameWidth = computed(() => {
  if (props.viewport === 'tablet') return '834px'
  if (props.viewport === 'mobile') return '390px'
  return '100%'
})

function toggleFullscreen(): void {
  fullscreen.value = !fullscreen.value
}

function formatPayload(payload: unknown): string {
  if (payload === undefined) return '—'
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

defineExpose({ host })
</script>
