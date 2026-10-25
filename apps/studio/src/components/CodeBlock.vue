<template>
  <div class="code-block">
    <div class="code-block__bar">
      <span class="code-block__title">{{ title || 'Vue 示例' }}</span>
      <button class="code-block__copy" type="button" @click="copy">
        {{ copied ? '已复制' : '复制代码' }}
      </button>
    </div>
    <pre class="code-block__body"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ code: string; title?: string }>()
const copied = ref(false)

async function copy() {
  const text = props.code
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<style scoped>
.code-block {
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
}
.code-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2);
  padding: 8px 12px;
  border-bottom: 1px solid var(--kf-border);
  background: var(--kf-background);
}
.code-block__title {
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
}
.code-block__copy {
  border: 0;
  padding: 4px 8px;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-primary);
  font-size: var(--kf-fs-caption);
  font-weight: 500;
  cursor: pointer;
}
.code-block__copy:hover {
  background: var(--kf-primary-soft);
}
.code-block__copy:focus-visible {
  outline: 2px solid var(--kf-ring);
  outline-offset: 2px;
}
.code-block__body {
  margin: 0;
  padding: 12px 14px;
  max-height: 360px;
  overflow: auto;
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-body-sm);
  line-height: 1.7;
  color: var(--kf-foreground);
  white-space: pre;
}
</style>
