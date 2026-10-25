<template>
  <div class="kf-code-block">
    <div class="kf-code-block__head">
      <span class="kf-code-block__meta">
        <span v-if="filename" class="kf-code-block__filename">{{ filename }}</span>
        <span v-if="language" class="kf-code-block__language">{{ language }}</span>
      </span>
      <button
        v-if="copyable"
        type="button"
        class="kf-code-block__copy"
        :class="{ 'kf-code-block__copy--done': copied, 'kf-code-block__copy--failed': failed }"
        :aria-label="failed ? '复制失败' : copied ? copiedText : '复制代码'"
        @click="copy"
      >
        <KfIcon :name="copied ? 'check' : 'copy'" :size="13" aria-hidden="true" />
        <span class="kf-code-block__copy-label">{{ failed ? '失败' : copied ? copiedText : '复制' }}</span>
      </button>
    </div>
    <pre class="kf-code-block__pre" :style="{ maxHeight: `${maxHeight}px` }">
      <code class="kf-code-block__code">
        <template v-if="$slots.code"><slot name="code" /></template>
        <template v-else>
          <template v-if="lineNumbers">
            <span v-for="(line, index) in lines" :key="index" class="kf-code-block__line">
              <span class="kf-code-block__lineno" aria-hidden="true">{{ index + 1 }}</span>
              <span class="kf-code-block__text">{{ line }}</span>
            </span>
          </template>
          <template v-else>{{ code }}</template>
        </template>
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
/**
 * KfCodeBlock — 代码块（头部信息 + 复制 + 行号 + 自定义高亮插槽）。
 *
 * 迁移自 KnowFlow frontend/src/components/chat/ChatCodeBlock.vue 的展示契约。
 * 与原实现的差异：**不内置语法高亮**。原组件直接依赖宿主的高亮管线；
 * 独立库若自带 highlight.js 会显著增加体积且需要引入额外许可证。
 * 需要高亮的宿主用 `#code` 插槽传入自己的渲染结果，库不提供 v-html 入口。
 *
 * 复制失败会显式显示「复制失败」并 emit('error')，不静默失败。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfCodeBlockEmits, KfCodeBlockProps } from './types'

const props = withDefaults(defineProps<KfCodeBlockProps>(), {
  language: '',
  filename: '',
  lineNumbers: false,
  maxHeight: 420,
  copyable: true,
  copiedText: '已复制',
})

const emit = defineEmits<KfCodeBlockEmits>()

const copied = ref(false)
const failed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const lines = computed(() => props.code.split('\n'))

function resetSoon(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
    failed.value = false
    timer = undefined
  }, 1600)
}

async function copy(): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.code)
    } else {
      const area = document.createElement('textarea')
      area.value = props.code
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      try {
        area.select()
        if (!document.execCommand('copy')) throw new Error('execCommand 返回 false')
      } finally {
        document.body.removeChild(area)
      }
    }
    copied.value = true
    failed.value = false
    emit('copy', props.code)
  } catch (error) {
    copied.value = false
    failed.value = true
    emit('error', error instanceof Error ? error.message : String(error))
  } finally {
    resetSoon()
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.kf-code-block {
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  font-family: var(--kf-font-mono);
}
.kf-code-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2);
  padding: 4px var(--kf-space-2) 4px var(--kf-space-3);
  border-bottom: 1px solid var(--kf-border);
  background: color-mix(in srgb, var(--kf-muted) 60%, var(--kf-card));
}
.kf-code-block__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-code-block__filename {
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-code-block__language {
  flex: none;
  padding: 0 6px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  text-transform: lowercase;
}
.kf-code-block__copy {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-caption);
  cursor: pointer;
}
.kf-code-block__copy:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-code-block__copy:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-code-block__copy--done {
  color: var(--kf-success);
}
.kf-code-block__copy--failed {
  color: var(--kf-danger);
}
.kf-code-block__pre {
  margin: 0;
  padding: var(--kf-space-3);
  overflow: auto;
}
.kf-code-block__code {
  display: block;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  line-height: 1.65;
  white-space: pre;
}
.kf-code-block__line {
  display: flex;
  gap: var(--kf-space-3);
}
.kf-code-block__lineno {
  flex: none;
  min-width: 2.2em;
  color: var(--kf-muted-foreground);
  text-align: right;
  user-select: none;
}
.kf-code-block__text {
  flex: 1;
  min-width: 0;
  white-space: pre;
}
</style>
