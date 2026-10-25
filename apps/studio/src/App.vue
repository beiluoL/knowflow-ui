<template>
  <div class="shell">
    <button
      v-if="isMobile"
      class="shell__drawer-toggle"
      type="button"
      aria-label="打开导航"
      @click="navOpen = true"
    >
      <KfIcon name="menu" size="lg" />
    </button>

    <aside class="sidebar" :class="{ 'sidebar--open': navOpen }">
      <div class="sidebar__brand">
        <span class="sidebar__logo">KF</span>
        <div class="sidebar__brand-text">
          <strong>KnowFlow UI</strong>
          <span>v0.1.0 · Studio</span>
        </div>
        <button
          v-if="isMobile"
          class="sidebar__close"
          type="button"
          aria-label="关闭导航"
          @click="navOpen = false"
        >
          <KfIcon name="x" size="md" />
        </button>
      </div>

      <nav class="sidebar__nav" aria-label="组件导航">
        <button
          class="nav-item"
          type="button"
          :class="{ 'nav-item--active': route === 'overview' }"
          @click="navigate('overview')"
        >
          <KfIcon name="home" size="md" />
          <span>概览</span>
        </button>

        <p class="nav-group">组 件</p>
        <button
          v-for="story in stories"
          :key="story.id"
          class="nav-item"
          type="button"
          :class="{ 'nav-item--active': route === story.id }"
          @click="navigate(story.id)"
        >
          <KfIcon :name="iconOf(story.id)" size="md" />
          <span>{{ story.title }}</span>
        </button>

        <p class="nav-group">系 统</p>
        <button
          class="nav-item"
          type="button"
          :class="{ 'nav-item--active': route === 'tokens' }"
          @click="navigate('tokens')"
        >
          <KfIcon name="palette" size="md" />
          <span>Design Tokens</span>
        </button>
        <button
          class="nav-item"
          type="button"
          :class="{ 'nav-item--active': route === 'roadmap' }"
          @click="navigate('roadmap')"
        >
          <KfIcon name="route" size="md" />
          <span>迁移路线</span>
        </button>
      </nav>

      <div class="sidebar__footer">
        <span>{{ stories.length }} 个组件 · 78 图标</span>
        <a href="https://github.com/beiluoL/knowflow-ui" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </aside>

    <div v-if="isMobile && navOpen" class="shell__scrim" @click="navOpen = false" />

    <div class="shell__main">
      <header class="topbar">
        <div class="topbar__left">
          <span class="topbar__crumb">{{ currentTitle }}</span>
          <span class="topbar__tag">v0.1.0</span>
        </div>
        <div class="topbar__right">
          <button
            class="theme-toggle"
            type="button"
            :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
            @click="toggleTheme"
          >
            <KfIcon :name="isDark ? 'sun' : 'moon'" size="md" />
            <span>{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
      </header>

      <main class="content">
        <OverviewPage v-if="route === 'overview'" @navigate="navigate" />
        <ComponentPage v-else-if="currentStory" :key="currentStory.id" :story="currentStory" />
        <TokensPage v-else-if="route === 'tokens'" :theme="theme" />
        <RoadmapPage v-else-if="route === 'roadmap'" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { useTheme } from './composables/useTheme'
import { findStory, STORIES } from './stories/catalog'
import OverviewPage from './pages/OverviewPage.vue'
import ComponentPage from './pages/ComponentPage.vue'
import TokensPage from './pages/TokensPage.vue'
import RoadmapPage from './pages/RoadmapPage.vue'

const { theme, isDark, toggleTheme } = useTheme()
const stories = STORIES

const route = ref<string>('overview')
const navOpen = ref(false)
const isMobile = ref(false)

const currentStory = computed(() => findStory(route.value))
const currentTitle = computed(() => {
  if (route.value === 'overview') return '概览'
  if (route.value === 'tokens') return 'Design Tokens'
  if (route.value === 'roadmap') return '迁移路线'
  return currentStory.value?.title ?? '未找到'
})

const ICON_BY_STORY: Record<string, string> = {
  button: 'square',
  icon: 'sparkles',
  input: 'edit',
  checkbox: 'check-square',
}

function iconOf(id: string): string {
  return ICON_BY_STORY[id] ?? 'square'
}

function syncFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  route.value = raw || 'overview'
}

function navigate(id: string) {
  window.location.hash = `#/${id}`
  route.value = id
  navOpen.value = false
}

let media: MediaQueryList | null = null
function syncViewport() {
  isMobile.value = window.innerWidth < 900
  if (!isMobile.value) navOpen.value = false
}

onMounted(() => {
  syncFromHash()
  window.addEventListener('hashchange', syncFromHash)
  syncViewport()
  media = window.matchMedia('(max-width: 900px)')
  media.addEventListener('change', syncViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncFromHash)
  media?.removeEventListener('change', syncViewport)
})
</script>
