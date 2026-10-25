<template>
  <div class="token-table">
    <div v-for="group in groups" :key="group.title" class="token-group">
      <div class="token-group__head">
        <h3 class="token-group__title">{{ group.title }}</h3>
        <p class="token-group__note">{{ group.note }}</p>
      </div>
      <div class="token-group__rows">
        <div v-for="row in group.rows" :key="row.name" class="token-row">
          <span
            v-if="isColor(row.value)"
            class="token-row__swatch"
            :style="{ background: row.value }"
            aria-hidden="true"
          />
          <code class="token-row__name">{{ row.name }}</code>
          <code class="token-row__value">{{ row.value || '（未定义）' }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { TOKEN_GROUPS, readTokenValues } from '@beiluol/knowflow-tokens'

const props = defineProps<{ theme: string }>()

/** 主题切换后需要等浏览器重算样式，用 tick 触发重新读取 */
const tick = ref(0)

onMounted(() => {
  tick.value += 1
})

watch(
  () => props.theme,
  () => {
    requestAnimationFrame(() => {
      tick.value += 1
    })
  },
)

const groups = computed(() => {
  void tick.value
  return TOKEN_GROUPS.map((group) => {
    const values = readTokenValues(group.tokens)
    return {
      ...group,
      rows: group.tokens.map((name) => ({ name, value: values[name] ?? '' })),
    }
  })
})

function isColor(value: string): boolean {
  return /^(#|rgb|hsl|color\()/i.test(value.trim())
}
</script>

<style scoped>
.token-table {
  display: grid;
  gap: var(--kf-space-5);
}
.token-group {
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
}
.token-group__head {
  padding: 12px 16px;
  border-bottom: 1px solid var(--kf-border);
  background: var(--kf-background);
}
.token-group__title {
  margin: 0;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  color: var(--kf-foreground);
}
.token-group__note {
  margin: 4px 0 0;
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.token-group__rows {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2px 16px;
  padding: 12px 16px 16px;
}
.token-row {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px dashed var(--kf-border);
}
.token-row__swatch {
  width: 16px;
  height: 16px;
  border-radius: var(--kf-radius-xs);
  border: 1px solid var(--kf-border);
}
.token-row__name,
.token-row__value {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.token-row__name {
  color: var(--kf-foreground);
}
.token-row__value {
  color: var(--kf-muted-foreground);
  text-align: right;
}
</style>
