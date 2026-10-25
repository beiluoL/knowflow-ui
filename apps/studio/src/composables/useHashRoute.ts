/**
 * Studio 的极简 hash 路由。
 *
 * 为什么不用 vue-router：
 *   1. Studio 是单页工具，不需要路由守卫 / 嵌套视图；
 *   2. 引入 router 会让「Studio 不依赖业务栈」的边界变模糊（项目里 router 是业务路由）；
 *   3. hash 路由在 file:// 预览与静态托管下都能工作，不需要服务端 fallback。
 *
 * 形态：
 *   #/                      → 目录
 *   #/quality               → 质量面板
 *   #/tokens                → 令牌
 *   #/c/button              → 条目（默认第一条 Story）
 *   #/c/button/size-lg      → Story 深链接
 *   #/c/button/size-lg?tab=api&viewport=mobile
 */
import { computed, ref } from 'vue'

export type StudioView = 'catalog' | 'component' | 'quality' | 'tokens'
export type TabKey = 'preview' | 'examples' | 'api' | 'states' | 'specs' | 'a11y' | 'quality'
export type ViewportKey = 'desktop' | 'tablet' | 'mobile'

export interface StudioRoute {
  view: StudioView
  entryId: string
  storyId: string
  tab: TabKey
  viewport: ViewportKey
}

const TABS: TabKey[] = ['preview', 'examples', 'api', 'states', 'specs', 'a11y', 'quality']
const VIEWPORTS: ViewportKey[] = ['desktop', 'tablet', 'mobile']

function parse(hash: string): StudioRoute {
  const raw = hash.replace(/^#/, '')
  const [pathPart, queryPart] = raw.split('?')
  const params = new URLSearchParams(queryPart ?? '')
  const tab = params.get('tab')
  const viewport = params.get('viewport')

  const segments = pathPart.split('/').filter(Boolean)
  const route: StudioRoute = {
    view: 'catalog',
    entryId: '',
    storyId: '',
    tab: TABS.includes((tab ?? '') as TabKey) ? (tab as TabKey) : 'preview',
    viewport: VIEWPORTS.includes((viewport ?? '') as ViewportKey)
      ? (viewport as ViewportKey)
      : 'desktop',
  }

  if (segments[0] === 'quality') route.view = 'quality'
  else if (segments[0] === 'tokens') route.view = 'tokens'
  else if (segments[0] === 'c' && segments[1]) {
    route.view = 'component'
    route.entryId = decodeURIComponent(segments[1])
    route.storyId = segments[2] ? decodeURIComponent(segments[2]) : ''
  }
  return route
}

function stringify(route: StudioRoute): string {
  const params = new URLSearchParams()
  if (route.view === 'component' && route.tab !== 'preview') params.set('tab', route.tab)
  if (route.view === 'component' && route.viewport !== 'desktop') params.set('viewport', route.viewport)
  const query = params.toString()

  let path = '/'
  if (route.view === 'quality') path = '/quality'
  else if (route.view === 'tokens') path = '/tokens'
  else if (route.view === 'component') {
    path = `/c/${encodeURIComponent(route.entryId)}`
    if (route.storyId) path += `/${encodeURIComponent(route.storyId)}`
  }
  return `#${path}${query ? `?${query}` : ''}`
}

const route = ref<StudioRoute>(
  typeof window === 'undefined'
    ? { view: 'catalog', entryId: '', storyId: '', tab: 'preview', viewport: 'desktop' }
    : parse(window.location.hash),
)

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    route.value = parse(window.location.hash)
  })
}

/** 写 hash 并同步状态；replace=true 时替换历史记录（改 tab / viewport 时用） */
export function navigate(next: Partial<StudioRoute>, options: { replace?: boolean } = {}): void {
  const merged: StudioRoute = { ...route.value, ...next }
  const hash = stringify(merged)
  route.value = merged
  if (typeof window === 'undefined') return
  if (options.replace) {
    const url = `${window.location.pathname}${window.location.search}${hash}`
    window.history.replaceState(null, '', url)
  } else if (window.location.hash !== hash) {
    window.location.hash = hash
  }
}

export function useHashRoute() {
  return {
    route: computed(() => route.value),
    navigate,
    isComponent: computed(() => route.value.view === 'component'),
  }
}
