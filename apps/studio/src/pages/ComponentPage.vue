<template>
  <div class="st-page" :class="{ 'st-page--wide': isWideTab }">
    <header class="st-page__header">
      <div class="st-page__heading">
        <div class="st-page__title-row">
          <h2 class="st-page__title">{{ entry.title }}</h2>
          <code class="st-page__name">{{ entry.name }}</code>
          <span class="st-badge" :class="`st-badge--${entry.status}`">{{ STATUS_LABEL[entry.status] }}</span>
          <span class="st-chip">{{ entry.category }}</span>
        </div>
        <p class="st-page__desc">{{ entry.description }}</p>
        <p class="st-page__source">
          源码：<code>{{ entry.source }}</code>
          <template v-if="entry.components.length">
            · 组件：<code v-for="name in entry.components" :key="name">{{ name }}</code>
          </template>
        </p>
      </div>

      <div class="st-page__actions">
        <button type="button" class="st-icon-button st-icon-button--mobile" aria-label="打开 Story 列表" @click="storiesOpen = true">
          <KfIcon name="list" :size="16" aria-hidden="true" />
        </button>
        <button type="button" class="st-icon-button st-icon-button--mobile" aria-label="打开属性面板" @click="propsOpen = true">
          <KfIcon name="settings" :size="16" aria-hidden="true" />
        </button>
      </div>
    </header>

    <nav class="st-tabs" role="tablist" aria-label="组件视图">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        role="tab"
        class="st-tabs__item"
        :class="{ 'st-tabs__item--active': route.tab === tab.key }"
        :aria-selected="route.tab === tab.key ? 'true' : 'false'"
        @click="navigate({ tab: tab.key }, { replace: true })"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 预览 / 状态：三栏工作台 -->
    <div v-if="isWideTab" class="st-workbench">
      <div class="st-workbench__rail">
        <StoryRail :stories="stories" :active-id="story.storyId" @select="selectStory" />
      </div>

      <div class="st-workbench__main">
        <PreviewCanvas
          :entry="entry"
          :story="story"
          :preview="preview"
          :api="api"
          :preview-key="previewKey"
          :viewport="route.viewport"
          :background="background"
          :events="events"
          @update:viewport="(value) => navigate({ viewport: value }, { replace: true })"
          @update:background="(value) => (background = value)"
          @reset="resetValues"
          @clear-events="events = []"
        />

        <CodeSample
          v-if="route.tab === 'preview'"
          :entry="entry"
          :values="values"
          :slots="(fixture.slots ?? {}) as Record<string, string>"
        />
      </div>

      <div class="st-workbench__props">
        <PropsPanel
          :entry="entry"
          :values="values"
          :metrics="metrics"
          @update="setValue"
          @reset="resetValues"
        />
      </div>
    </div>

    <!-- 示例 -->
    <div v-else-if="route.tab === 'examples'" class="st-panel">
      <h3 class="st-panel__title">全部 Story（{{ stories.length }}）</h3>
      <p class="st-panel__hint">
        每一条都是同一组件在不同 Props 下的本地状态；点击切换不会丢失注册表数据。
      </p>
      <ul class="st-examples">
        <li v-for="item in stories" :key="item.storyId" class="st-example">
          <button type="button" class="st-example__button" @click="selectStory(item.storyId)">
            <span class="st-example__head">
              <span class="st-example__title">{{ item.title }}</span>
              <span class="st-chip st-chip--sm">{{ item.category }}</span>
            </span>
            <span class="st-example__desc">{{ item.description }}</span>
            <code class="st-example__id">{{ item.storyId }}</code>
          </button>
        </li>
      </ul>
    </div>

    <!-- API -->
    <div v-else-if="route.tab === 'api'" class="st-panel">
      <ApiTable :entry="entry" />
    </div>

    <!-- 设计规范 -->
    <div v-else-if="route.tab === 'specs'" class="st-panel">
      <h3 class="st-panel__title">设计规范</h3>
      <p class="st-panel__hint">
        数字是规范目标值；画布右侧「实测样式」读的是当前渲染的真实计算值。两者不一致时以实测为准。
      </p>
      <table v-if="specRows.length" class="st-table">
        <thead>
          <tr><th scope="col">项目</th><th scope="col">规范值</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in specRows" :key="row.key">
            <td>{{ row.key }}</td>
            <td><code>{{ row.value }}</code></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="st-panel__empty">
        该条目没有单独的设计规范条目，遵循全局令牌（间距 4px 基线、圆角 4/6/10/16、字号阶梯）。
      </p>
      <h4 class="st-panel__subtitle">使用的令牌</h4>
      <ul class="st-api__chips">
        <li v-for="token in relatedTokens" :key="token"><code>{{ token }}</code></li>
      </ul>
    </div>

    <!-- 可访问性 -->
    <div v-else-if="route.tab === 'a11y'" class="st-panel">
      <h3 class="st-panel__title">可访问性</h3>
      <p class="st-panel__hint">
        这里写的是约定；是否真能键盘操作，请在 Preview 标签里用 Tab / 方向键 / Esc 现场验证。
      </p>
      <div class="st-callout">
        <p>{{ entry.a11y }}</p>
      </div>
      <h4 class="st-panel__subtitle">当前 Story 的补充</h4>
      <div class="st-callout st-callout--soft">
        <p>{{ story.a11y }}</p>
      </div>
      <h4 class="st-panel__subtitle">期望交互</h4>
      <ol class="st-list">
        <li v-for="(step, index) in story.interaction" :key="index">{{ step }}</li>
      </ol>
    </div>

    <!-- 质量 -->
    <div v-else class="st-panel">
      <h3 class="st-panel__title">条目质量</h3>
      <dl class="st-kv">
        <dt>状态</dt><dd>{{ STATUS_LABEL[entry.status] }}（{{ entry.status }}）</dd>
        <dt>真实组件</dt><dd>{{ entry.components.join(' + ') || '—' }}</dd>
        <dt>Story 数</dt><dd>{{ stories.length }}</dd>
        <dt>Props / Events / Slots</dt><dd>{{ entry.props.length }} / {{ entry.events.length }} / {{ entry.slots.length }}</dd>
        <dt>预览实现</dt><dd>{{ previewKind }}</dd>
        <dt>设计规范条目</dt><dd>{{ specRows.length }}</dd>
        <dt>可访问性说明</dt><dd>{{ entry.a11y ? '有' : '无' }}</dd>
      </dl>
      <p class="st-panel__hint">
        状态是 v0.2.0 重新核算的结果：只有 packages 里真实存在、且在画布上可交互的组件才标 real。
      </p>
      <button type="button" class="st-button" @click="navigate({ view: 'quality' })">
        打开质量总览
      </button>
    </div>

    <!-- 移动端：Story 抽屉 -->
    <KfDrawer
      :open="storiesOpen"
      placement="left"
      title="Stories"
      :width="288"
      @update:open="(value: boolean) => (storiesOpen = value)"
    >
      <StoryRail :stories="stories" :active-id="story.storyId" @select="selectStory" />
    </KfDrawer>

    <!-- 移动端：属性抽屉 -->
    <KfDrawer
      :open="propsOpen"
      placement="right"
      title="Properties"
      :width="320"
      @update:open="(value: boolean) => (propsOpen = value)"
    >
      <PropsPanel :entry="entry" :values="values" :metrics="metrics" @update="setValue" @reset="resetValues" />
    </KfDrawer>
  </div>
</template>

<script setup lang="ts">
/**
 * 组件页 —— Studio 的核心视图。
 *
 * 数据流是单向的：
 *   story/entry 变化 → resetValues() 重置面板值与画布 key
 *   面板改值 → values 变化 → PreviewApi 重新构造 → 画布重渲染
 *   画布交互 → api.set()/api.log() → 同上（并写事件日志）
 *
 * 这里没有任何业务请求：previews/ 里的组件只碰本地 state。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { KfDrawer, KfIcon } from '@beiluol/knowflow-ui'
import ApiTable from '../components/ApiTable.vue'
import CodeSample from '../components/CodeSample.vue'
import PreviewCanvas from '../components/PreviewCanvas.vue'
import PropsPanel from '../components/PropsPanel.vue'
import StoryRail from '../components/StoryRail.vue'
import { useHashRoute } from '../composables/useHashRoute'
import { FIXTURES } from '../fixtures'
import { ENTRIES, entryById } from '../registry/entries'
import { storiesFor, storyDefaults } from '../registry/stories'
import { hasCustomPreview, resolvePreview } from '../previews'
import type { PreviewApi } from '../previews/api'
import type { EntryStatus, PlaygroundEntry, PlaygroundStory } from '../registry/types'

const { route, navigate } = useHashRoute()

const TABS = [
  { key: 'preview', label: 'Preview' },
  { key: 'examples', label: 'Examples' },
  { key: 'api', label: 'API' },
  { key: 'states', label: 'States' },
  { key: 'specs', label: 'Design Specs' },
  { key: 'a11y', label: 'Accessibility' },
  { key: 'quality', label: 'Quality' },
] as const

const STATUS_LABEL: Record<EntryStatus, string> = {
  real: '真实组件',
  demo: '仅演示',
  missing: '未实现',
}

const isWideTab = computed(() => route.value.tab === 'preview' || route.value.tab === 'states')

const entry = computed<PlaygroundEntry>(() => entryById(route.value.entryId) ?? ENTRIES[0])

const stories = computed<PlaygroundStory[]>(() => storiesFor(entry.value.id))

const story = computed<PlaygroundStory>(() => {
  const wanted = route.value.storyId
  return stories.value.find((item) => item.storyId === wanted) ?? stories.value[0]
})

const fixture = computed(() => {
  const base = FIXTURES[entry.value.id] ?? {}
  return {
    ...base,
    slots: { ...(base.slots ?? {}), ...(story.value.slots ?? {}) },
    ui: story.value.fixture.ui ?? {},
  }
})

const preview = computed(() => resolvePreview(entry.value))
const previewKind = computed(() => {
  if (entry.value.status !== 'real' || !entry.value.components.length) return '无（demo/missing）'
  return hasCustomPreview(entry.value) ? '场景组合（custom）' : '通用渲染（generic）'
})

const values = ref<Record<string, unknown>>({})
const events = ref<Array<{ name: string; payload?: unknown; at: number }>>([])
const previewKey = ref('')
const background = ref('#FFFFFF')
const metrics = ref<Record<string, string>>({})
const storiesOpen = ref(false)
const propsOpen = ref(false)
let observer: ResizeObserver | null = null

function resetValues(): void {
  values.value = {
    ...storyDefaults(entry.value, story.value),
    ...(FIXTURES[entry.value.id]?.props ?? {}),
  }
  events.value = []
  previewKey.value = `${entry.value.id}:${story.value.storyId}:${resetSeq += 1}`
  void nextTick(readMetrics)
}

let resetSeq = 0

function setValue(name: string, value: unknown): void {
  values.value = { ...values.value, [name]: value }
}

function log(eventName: string, payload?: unknown): void {
  events.value = [{ name: eventName, payload, at: Date.now() }, ...events.value].slice(0, 20)
}

const api = computed<PreviewApi>(() => ({
  entry: entry.value,
  story: story.value,
  values: values.value,
  fixture: fixture.value as unknown as Record<string, unknown>,
  set: setValue,
  log,
}))

function selectStory(storyId: string): void {
  navigate({ view: 'component', entryId: entry.value.id, storyId, tab: route.value.tab })
  storiesOpen.value = false
}

const specRows = computed(() =>
  Object.entries(entry.value.designSpecs).map(([key, value]) => ({ key, value: String(value) })),
)

/** 只列出与该条目相关的令牌前缀，避免把所有令牌都堆上来 */
const relatedTokens = computed(() => {
  const prefix: Record<string, string[]> = {
    button: ['--kf-button-'],
    input: ['--kf-input-', '--kf-field-'],
    textarea: ['--kf-input-', '--kf-field-'],
    select: ['--kf-input-', '--kf-field-', '--kf-menu-'],
    datepicker: ['--kf-input-', '--kf-field-', '--kf-menu-'],
    checkbox: ['--kf-checkbox-'],
    switch: ['--kf-switch-'],
    slider: ['--kf-slider-'],
    dialog: ['--kf-overlay', '--kf-radius-lg', '--kf-menu-shadow'],
    drawer: ['--kf-overlay', '--kf-menu-shadow'],
    toast: ['--kf-tooltip-', '--kf-menu-shadow'],
    tooltip: ['--kf-tooltip-'],
    badge: ['--kf-tag-radius'],
    tag: ['--kf-tag-radius'],
    card: ['--kf-card-radius', '--kf-card-'],
  }
  return prefix[entry.value.id] ?? ['--kf-fs-*', '--kf-space-*', '--kf-radius-*']
})

function readMetrics(): void {
  if (typeof window === 'undefined') return
  const target = document.querySelector<HTMLElement>('.preview-host > *')
  if (!target) {
    metrics.value = {}
    return
  }
  const style = window.getComputedStyle(target)
  const rect = target.getBoundingClientRect()
  metrics.value = {
    width: `${rect.width.toFixed(1)}px`,
    height: `${rect.height.toFixed(1)}px`,
    padding: style.padding,
    margin: style.margin,
    gap: style.gap,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    display: style.display,
    border:
      style.borderWidth === '0px'
        ? 'none'
        : `${style.borderWidth} ${style.borderStyle} ${style.borderColor}`,
    radius: style.borderRadius,
    shadow: style.boxShadow === 'none' ? 'none' : style.boxShadow,
    color: style.color,
    background: style.backgroundColor,
  }
}

watch(
  () => [route.value.entryId, route.value.storyId],
  () => resetValues(),
  { immediate: true },
)

watch(values, () => void nextTick(readMetrics), { deep: true })

onMounted(() => {
  void nextTick(() => {
    readMetrics()
    const target = document.querySelector<HTMLElement>('.preview-host > *')
    if (target && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => readMetrics())
      observer.observe(target)
    }
  })
  window.addEventListener('resize', readMetrics)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', readMetrics)
})
</script>
