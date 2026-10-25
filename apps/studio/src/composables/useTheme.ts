/**
 * Studio 主题切换（Light / Dark）。
 * 只操作 <html data-theme>，令牌由 @beiluol/knowflow-tokens 提供；
 * 不复制第二套颜色，保证「Studio 看到的」＝「消费方接入后的」。
 */
import { computed, ref } from 'vue'

export type ThemeName = 'light' | 'dark'

const STORAGE_KEY = 'kf-studio-theme'

function readInitial(): ThemeName {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  }
  return 'light'
}

const theme = ref<ThemeName>(readInitial())

function apply(next: ThemeName) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (next === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
}

apply(theme.value)

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeName) {
    theme.value = next
    apply(next)
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
