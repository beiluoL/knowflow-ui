<template>
  <div class="st-page">
    <header class="st-page__header">
      <div class="st-page__heading">
        <div class="st-page__title-row">
          <h2 class="st-page__title">Design Tokens</h2>
          <span class="st-chip">{{ valueCount }} 个令牌值</span>
          <span class="st-chip">{{ isDark ? 'Dark' : 'Light' }}</span>
        </div>
        <p class="st-page__desc">
          数值唯一来源是 <code>packages/tokens/src/tokens.css</code>；这里通过
          <code>getComputedStyle</code> 读当前主题下的真实值，不做第二份 JS 常量。
        </p>
      </div>
      <div class="st-page__actions">
        <button type="button" class="st-button st-button--ghost" @click="toggleTheme">
          切换到 {{ isDark ? 'Light' : 'Dark' }}
        </button>
      </div>
    </header>

    <div class="st-filters">
      <div class="st-filters__search">
        <KfIcon name="search" :size="15" aria-hidden="true" />
        <input
          v-model="keyword"
          class="st-filters__input"
          type="search"
          placeholder="过滤令牌名，如 --kf-fs、--kf-button"
          aria-label="过滤令牌"
        />
      </div>
    </div>

    <section v-for="group in groups" :key="group.title" class="st-panel">
      <h3 class="st-panel__title">{{ group.title }}</h3>
      <p class="st-panel__hint">{{ group.note }}</p>
      <table class="st-table">
        <thead>
          <tr><th scope="col">令牌</th><th scope="col">值</th><th scope="col">预览</th></tr>
        </thead>
        <tbody>
          <tr v-for="token in group.tokens" :key="token.name">
            <td><code>{{ token.name }}</code></td>
            <td><code>{{ token.value || '（未定义）' }}</code></td>
            <td>
              <span v-if="token.color" class="st-swatch" :style="{ background: token.value }" />
              <span v-else-if="token.length" class="st-length" :style="{ width: token.previewWidth }" />
              <span v-else class="st-panel__empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <p v-if="!groups.length" class="st-panel__empty">没有匹配的令牌。</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 令牌页：只读运行时值。
 *
 * 为什么不做「可编辑令牌」：那会变成第二套主题实现，与 tokens.css 冲突。
 * Studio 的职责是展示消费方接入后真实得到的那份值。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { TOKEN_GROUPS, readTokenValues } from '@beiluol/knowflow-tokens'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const keyword = ref('')
const values = ref<Record<string, string>>({})

function read(): void {
  const all = TOKEN_GROUPS.flatMap((group) => group.tokens)
  values.value = readTokenValues(all)
}

onMounted(read)

// 主题切换后重新读：同一个令牌在 dark 下是另一组值
watch(isDark, () => read())

const COLOR_PATTERN = /^#|rgb|hsl|oklch|color\(/

const groups = computed(() => {
  const needle = keyword.value.trim().toLowerCase()
  return TOKEN_GROUPS.map((group) => ({
    ...group,
    tokens: group.tokens
      .filter((name) => !needle || name.toLowerCase().includes(needle))
      .map((name) => {
        const value = values.value[name] ?? ''
        const color = COLOR_PATTERN.test(value)
        const length = /^(0|[0-9.]+(px|rem|em|%))$/.test(value) && !color
        const numeric = Number.parseFloat(value)
        return {
          name,
          value,
          color,
          length,
          previewWidth: length && Number.isFinite(numeric) ? `${Math.min(numeric, 160)}px` : '0px',
        }
      }),
  })).filter((group) => group.tokens.length > 0)
})

const valueCount = computed(() => Object.values(values.value).filter(Boolean).length)
</script>
