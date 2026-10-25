<template>
  <div class="page">
    <header class="page__header">
      <p class="page__crumb">{{ categoryTitle }} / {{ story.title }}</p>
      <div class="page__title-row">
        <h1 class="page__title">{{ story.title }}</h1>
        <span class="page__badge">v0.1.0 · 已完成</span>
      </div>
      <p class="page__subtitle">{{ story.subtitle }}</p>
      <p class="page__desc">{{ story.description }}</p>

      <div class="page__meta">
        <span class="page__meta-item">
          <span class="page__meta-label">源码</span>
          <code>{{ story.sourcePath }}</code>
          <button class="page__copy" type="button" @click="copyPath">{{ copiedPath ? '已复制' : '复制路径' }}</button>
        </span>
        <span class="page__meta-item">
          <span class="page__meta-label">迁移自</span>
          <code>{{ story.migratedFrom }}</code>
        </span>
      </div>
    </header>

    <section class="page__section">
      <div class="page__preview-grid">
        <div class="page__preview-col">
          <h2 class="page__h2">实时预览</h2>
          <div ref="host">
            <PreviewStage :metrics="metrics" :events="events">
              <component :is="preview" v-if="preview" :state="state" @patch="patch" @event="onEvent" />
            </PreviewStage>
          </div>
          <p class="page__hint">
            尺寸与颜色来自浏览器真实计算值（getComputedStyle），不是文档里手写的期望值。
          </p>
        </div>

        <aside class="page__props">
          <div class="page__props-head">
            <h2 class="page__h2">属性</h2>
            <button class="page__reset" type="button" @click="reset">恢复默认</button>
          </div>
          <PropControls :specs="story.props" :state="state" @patch="patch" />
        </aside>
      </div>
    </section>

    <section v-for="block in story.gallery" :key="block.title" class="page__section">
      <h2 class="page__h2">{{ block.title }}</h2>
      <p class="page__section-desc">{{ block.description }}</p>
      <div class="gallery">
        <div v-for="item in block.items" :key="item.label" class="gallery__item">
          <div class="gallery__stage">
            <component :is="preview" v-if="preview" :state="galleryState(item.state)" @patch="patch" />
          </div>
          <code class="gallery__label">{{ item.label }}</code>
        </div>
      </div>
    </section>

    <section class="page__section">
      <h2 class="page__h2">Vue 代码示例</h2>
      <p class="page__section-desc">示例与上面的组件走同一份实现；复制后可直接在 Vue 3 工程使用。</p>
      <div class="page__examples">
        <div v-for="example in story.examples" :key="example.title" class="example">
          <h3 class="example__title">{{ example.title }}</h3>
          <p class="example__desc">{{ example.description }}</p>
          <CodeBlock :code="example.code" :title="`${story.title} · ${example.title}`" />
        </div>
      </div>
    </section>

    <section class="page__section page__two-col">
      <div>
        <h2 class="page__h2">可访问性</h2>
        <ul class="page__list">
          <li v-for="item in story.a11y" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div>
        <h2 class="page__h2">设计规格</h2>
        <dl class="spec-list">
          <div v-for="spec in story.specs" :key="spec.label" class="spec-list__row">
            <dt>{{ spec.label }}</dt>
            <dd>{{ spec.value }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { ComponentStory, PropState } from '../stories/types'
import { previewFor } from '../stories/previews'
import { CATEGORIES } from '../stories/catalog'
import { useElementMetrics } from '../composables/useElementMetrics'
import PreviewStage from '../components/PreviewStage.vue'
import PropControls from '../components/PropControls.vue'
import CodeBlock from '../components/CodeBlock.vue'

const props = defineProps<{ story: ComponentStory }>()

const state = reactive<PropState>({})
const events = ref<string[]>([])
const host = ref<HTMLElement | null>(null)
const copiedPath = ref(false)

const preview = computed(() => previewFor(props.story.id))
const categoryTitle = computed(
  () => CATEGORIES.find((item) => item.id === props.story.category)?.title ?? '',
)
const { metrics, measure } = useElementMetrics(host, () => props.story.measureSelector)

function reset() {
  for (const key of Object.keys(state)) delete state[key]
  for (const spec of props.story.props) state[spec.name] = spec.defaultValue
  events.value = []
}

watch(
  () => props.story.id,
  () => {
    reset()
    void nextTick(measure)
  },
  { immediate: true },
)

watch(state, () => void nextTick(measure), { deep: true })

function patch(key: string, value: string | number | boolean) {
  state[key] = value
}

function onEvent(name: string) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  events.value = [`${time} · ${name}`, ...events.value].slice(0, 5)
}

function galleryState(overrides: PropState): PropState {
  return { ...state, ...overrides }
}

async function copyPath() {
  try {
    await navigator.clipboard.writeText(props.story.sourcePath)
    copiedPath.value = true
    window.setTimeout(() => {
      copiedPath.value = false
    }, 1600)
  } catch {
    copiedPath.value = false
  }
}
</script>

<style scoped>
.page {
  display: grid;
  gap: var(--kf-space-6);
  max-width: 1180px;
  padding: var(--kf-space-6) var(--kf-space-6) 64px;
}
/* grid item 默认 min-width:auto，遇到长路径/代码块会撑破窄屏，这里统一归零 */
.page > * {
  min-width: 0;
}
.page__crumb {
  margin: 0 0 6px;
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
}
.page__title-row {
  display: flex;
  align-items: center;
  gap: var(--kf-space-3);
  flex-wrap: wrap;
}
.page__title {
  margin: 0;
  font-size: var(--kf-fs-h1);
  line-height: var(--kf-lh-h1);
  font-weight: var(--kf-fw-h1);
  color: var(--kf-foreground);
}
.page__badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-primary-soft);
  color: var(--kf-primary);
  font-size: var(--kf-fs-xs);
  font-weight: 500;
}
.page__subtitle {
  margin: 6px 0 0;
  font-size: var(--kf-fs-body-md);
  color: var(--kf-muted-foreground);
}
.page__desc {
  margin: var(--kf-space-3) 0 0;
  max-width: 760px;
  font-size: var(--kf-fs-body-md);
  line-height: 1.7;
  color: var(--kf-foreground);
}
.page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-4);
  margin-top: var(--kf-space-4);
}
.page__meta-item {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  font-size: var(--kf-fs-xs);
}
.page__meta-label {
  color: var(--kf-muted-foreground);
}
.page__meta-item code {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  padding: 2px 6px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-background);
  color: var(--kf-foreground);
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-all;
}
.page__copy {
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--kf-primary);
  font-size: var(--kf-fs-xs);
  cursor: pointer;
}
.page__section {
  padding: var(--kf-space-6);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
}
.page__h2 {
  margin: 0 0 var(--kf-space-3);
  font-size: var(--kf-fs-h4);
  line-height: var(--kf-lh-h4);
  font-weight: var(--kf-fw-h4);
  color: var(--kf-foreground);
}
.page__section-desc {
  margin: -4px 0 var(--kf-space-4);
  font-size: var(--kf-fs-body-sm);
  color: var(--kf-muted-foreground);
}
.page__preview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--kf-space-6);
  align-items: start;
  min-width: 0;
}
.page__preview-col {
  min-width: 0;
}
.page__props {
  padding: var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-background);
}
.page__props-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2);
}
.page__reset {
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-xs);
  background: var(--kf-card);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  padding: 3px 8px;
  cursor: pointer;
}
.page__hint {
  margin: var(--kf-space-2) 0 0;
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--kf-space-3);
}
.gallery__item {
  display: grid;
  gap: 8px;
  padding: var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-background);
}
.gallery__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
}
.gallery__label {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
  text-align: center;
}
.page__examples {
  display: grid;
  gap: var(--kf-space-5);
  min-width: 0;
}
.example {
  min-width: 0;
}
.gallery__item {
  min-width: 0;
}
.example__title {
  margin: 0;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  color: var(--kf-foreground);
}
.example__desc {
  margin: 4px 0 8px;
  font-size: var(--kf-fs-body-sm);
  color: var(--kf-muted-foreground);
}
.page__two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--kf-space-6);
}
.page__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: var(--kf-fs-body-sm);
  line-height: 1.6;
  color: var(--kf-foreground);
}
.spec-list {
  margin: 0;
  display: grid;
  gap: 8px;
}
.spec-list__row {
  display: flex;
  justify-content: space-between;
  gap: var(--kf-space-3);
  font-size: var(--kf-fs-body-sm);
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--kf-border);
}
.spec-list dt {
  color: var(--kf-muted-foreground);
}
.spec-list dd {
  margin: 0;
  text-align: right;
  color: var(--kf-foreground);
}
@media (max-width: 1024px) {
  .page__preview-grid,
  .page__two-col {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 720px) {
  .page {
    padding: var(--kf-space-4) var(--kf-space-4) 48px;
  }
  .page__section {
    padding: var(--kf-space-4);
  }
}
</style>
