<template>
  <div class="st-shell">
    <header class="st-topbar">
      <button type="button" class="st-topbar__menu" aria-label="打开导航" @click="navOpen = true">
        <KfIcon name="menu" :size="18" aria-hidden="true" />
      </button>

      <a class="st-topbar__brand" href="#/" @click.prevent="go({ view: 'catalog' })">
        <span class="st-topbar__logo" aria-hidden="true">KF</span>
        <span class="st-topbar__brand-text">
          <strong>KnowFlow UI</strong>
          <span>Studio · v0.2.0</span>
        </span>
      </a>

      <button type="button" class="st-topbar__search" @click="paletteOpen = true">
        <KfIcon name="search" :size="15" aria-hidden="true" />
        <span>搜索 {{ ENTRIES.length }} 个条目 / {{ STORIES.length }} 个 Story</span>
        <kbd class="st-topbar__kbd">⌘K</kbd>
      </button>

      <nav class="st-topbar__nav" aria-label="主导航">
        <button
          v-for="item in NAV"
          :key="item.view"
          type="button"
          class="st-topbar__link"
          :class="{ 'st-topbar__link--active': route.view === item.view }"
          :aria-current="route.view === item.view ? 'page' : undefined"
          @click="go({ view: item.view })"
        >
          {{ item.label }}
        </button>
      </nav>

      <button
        type="button"
        class="st-icon-button"
        :aria-label="isDark ? '切换到浅色' : '切换到深色'"
        @click="toggleTheme"
      >
        <KfIcon :name="isDark ? 'sun' : 'moon'" :size="16" aria-hidden="true" />
      </button>
    </header>

    <div class="st-shell__body">
      <aside class="st-nav" aria-label="组件导航">
        <div class="st-nav__search">
          <KfIcon name="search" :size="14" aria-hidden="true" />
          <input
            v-model="filter"
            class="st-nav__input"
            type="search"
            placeholder="过滤条目"
            aria-label="过滤条目"
          />
        </div>

        <nav class="st-nav__scroll">
          <section v-for="group in navGroups" :key="group.category" class="st-nav__group">
            <p class="st-nav__category">
              {{ group.category }}
              <span class="st-nav__count">{{ group.entries.length }}</span>
            </p>
            <ul class="st-nav__list">
              <li v-for="item in group.entries" :key="item.id">
                <button
                  type="button"
                  class="st-nav__item"
                  :class="{ 'st-nav__item--active': route.entryId === item.id }"
                  :aria-current="route.entryId === item.id ? 'page' : undefined"
                  @click="openEntry(item.id)"
                >
                  <span class="st-nav__dot" :class="`st-nav__dot--${item.status}`" aria-hidden="true" />
                  <span class="st-nav__label">{{ item.title }}</span>
                  <span class="st-nav__name">{{ item.name }}</span>
                </button>
              </li>
            </ul>
          </section>
        </nav>

        <footer class="st-nav__foot">
          <button type="button" class="st-nav__foot-link" @click="go({ view: 'quality' })">
            <KfIcon name="award" :size="14" aria-hidden="true" /> 质量总览
          </button>
          <button type="button" class="st-nav__foot-link" @click="go({ view: 'tokens' })">
            <KfIcon name="palette" :size="14" aria-hidden="true" /> 设计令牌
          </button>
        </footer>
      </aside>

      <main class="st-main">
        <CatalogPage v-if="route.view === 'catalog'" />
        <ComponentPage v-else-if="route.view === 'component'" />
        <QualityPage v-else-if="route.view === 'quality'" />
        <TokensPage v-else />
      </main>
    </div>

    <CommandPalette :open="paletteOpen" @close="paletteOpen = false" />

    <KfDrawer
      :open="navOpen"
      placement="left"
      title="组件导航"
      :width="300"
      @update:open="(value: boolean) => (navOpen = value)"
    >
      <nav class="st-nav st-nav--drawer">
        <section v-for="group in navGroups" :key="group.category" class="st-nav__group">
          <p class="st-nav__category">{{ group.category }}</p>
          <ul class="st-nav__list">
            <li v-for="item in group.entries" :key="item.id">
              <button
                type="button"
                class="st-nav__item"
                :class="{ 'st-nav__item--active': route.entryId === item.id }"
                @click="openEntry(item.id)"
              >
                <span class="st-nav__dot" :class="`st-nav__dot--${item.status}`" aria-hidden="true" />
                <span class="st-nav__label">{{ item.title }}</span>
                <span class="st-nav__name">{{ item.name }}</span>
              </button>
            </li>
          </ul>
        </section>
      </nav>
    </KfDrawer>
  </div>
</template>

<script setup lang="ts">
/**
 * Studio 壳层：紧凑顶栏 + 左侧条目导航 + 中间内容区。
 *
 * 视觉沿用 KnowFlow（#3B6FE0 / #F7F8FA / 白卡 / Lucide），
 * 但不复制业务样式表：所有颜色来自 --kf-* 令牌，因此 Light/Dark 只需切 data-theme。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { KfDrawer, KfIcon } from '@beiluol/knowflow-ui'
import CatalogPage from './pages/CatalogPage.vue'
import ComponentPage from './pages/ComponentPage.vue'
import QualityPage from './pages/QualityPage.vue'
import TokensPage from './pages/TokensPage.vue'
import CommandPalette from './components/CommandPalette.vue'
import { useHashRoute } from './composables/useHashRoute'
import { useTheme } from './composables/useTheme'
import { CATEGORIES, ENTRIES } from './registry/entries'
import { STORIES } from './registry/stories'

const { route, navigate } = useHashRoute()
const { isDark, toggleTheme } = useTheme()

const NAV = [
  { view: 'catalog', label: '目录' },
  { view: 'quality', label: '质量' },
  { view: 'tokens', label: '令牌' },
] as const

const paletteOpen = ref(false)
const navOpen = ref(false)
const filter = ref('')

const navGroups = computed(() =>
  CATEGORIES.map((category) => ({
    category,
    entries: ENTRIES.filter(
      (entry) =>
        entry.category === category &&
        (!filter.value.trim() ||
          `${entry.title} ${entry.name}`.toLowerCase().includes(filter.value.trim().toLowerCase())),
    ),
  })).filter((group) => group.entries.length > 0),
)

function go(next: { view: 'catalog' | 'quality' | 'tokens' }): void {
  navigate({ ...next, entryId: '', storyId: '' })
  navOpen.value = false
}

function openEntry(id: string): void {
  navigate({ view: 'component', entryId: id, storyId: '', tab: 'preview' })
  navOpen.value = false
}

// 顶栏的 ⌘K 与全局快捷键合并到一处：避免每个页面各注册一次
function onKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
