<template>
  <div class="kf-markdown">
    <template v-if="blocks.length">
      <template v-for="(block, index) in blocks" :key="index">
        <h1 v-if="block.type === 'heading' && block.level === 1" class="kf-markdown__h1">
          <MdInlines :tokens="block.inlines" :linkable="linkable" />
        </h1>
        <h2 v-else-if="block.type === 'heading' && block.level === 2" class="kf-markdown__h2">
          <MdInlines :tokens="block.inlines" :linkable="linkable" />
        </h2>
        <h3 v-else-if="block.type === 'heading' && block.level === 3" class="kf-markdown__h3">
          <MdInlines :tokens="block.inlines" :linkable="linkable" />
        </h3>

        <p v-else-if="block.type === 'paragraph'" class="kf-markdown__paragraph">
          <MdInlines :tokens="block.inlines" :linkable="linkable" />
        </p>

        <ul v-else-if="block.type === 'list' && !block.ordered" class="kf-markdown__list">
          <li v-for="(item, i) in block.items" :key="i" class="kf-markdown__list-item">
            <MdInlines :tokens="item" :linkable="linkable" />
          </li>
        </ul>
        <ol v-else-if="block.type === 'list' && block.ordered" class="kf-markdown__list">
          <li v-for="(item, i) in block.items" :key="i" class="kf-markdown__list-item">
            <MdInlines :tokens="item" :linkable="linkable" />
          </li>
        </ol>

        <blockquote v-else-if="block.type === 'quote'" class="kf-markdown__quote">
          <MdInlines :tokens="block.inlines" :linkable="linkable" />
        </blockquote>

        <pre v-else-if="block.type === 'code'" class="kf-markdown__pre"><code class="kf-markdown__code">{{ block.code }}</code></pre>

        <hr v-else-if="block.type === 'hr'" class="kf-markdown__hr" />
      </template>
    </template>
    <slot v-else name="empty" />
  </div>
</template>

<script setup lang="ts">
/**
 * KfMarkdownRenderer — 安全的 Markdown 渲染。
 *
 * 与「marked + v-html」的根本区别：**输出的是 Vue 元素，不是 HTML 字符串**。
 * 因此不存在 HTML 注入面：`<script>`、`<img onerror>` 只会作为文本显示；
 * 链接协议被白名单限制（http/https/mailto/站内相对路径），`javascript:` 被降级为文本。
 *
 * 语法子集见 ./parse.ts 顶部说明。宿主若需要表格/图片等，请自己渲染后通过插槽传入 ——
 * 库不提供 `unsafeHtml` 逃生口，这是刻意设计。
 */
import { computed } from 'vue'
import MdInlines from './MdInlines.vue'
import { parseMarkdown } from './parse'
import type { KfMarkdownRendererProps } from './types'

const props = withDefaults(defineProps<KfMarkdownRendererProps>(), {
  content: '',
  linkable: true,
})

const blocks = computed(() => parseMarkdown(props.content))
</script>

<style scoped>
.kf-markdown {
  min-width: 0;
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  overflow-wrap: anywhere;
}
.kf-markdown__h1 {
  margin: var(--kf-space-4) 0 var(--kf-space-2);
  font-size: var(--kf-fs-h2);
  font-weight: var(--kf-fw-h2);
  line-height: var(--kf-lh-h2);
}
.kf-markdown__h2 {
  margin: var(--kf-space-4) 0 var(--kf-space-2);
  font-size: var(--kf-fs-h3);
  font-weight: var(--kf-fw-h3);
  line-height: var(--kf-lh-h3);
}
.kf-markdown__h3 {
  margin: var(--kf-space-3) 0 var(--kf-space-2);
  font-size: var(--kf-fs-h4);
  font-weight: var(--kf-fw-h4);
  line-height: var(--kf-lh-h4);
}
.kf-markdown__paragraph {
  margin: 0 0 var(--kf-space-3);
}
.kf-markdown__paragraph:last-child {
  margin-bottom: 0;
}
.kf-markdown__list {
  margin: 0 0 var(--kf-space-3);
  padding-left: var(--kf-space-5);
}
.kf-markdown__list-item {
  margin-bottom: 2px;
}
.kf-markdown__quote {
  margin: 0 0 var(--kf-space-3);
  padding: var(--kf-space-2) var(--kf-space-3);
  border-left: 3px solid var(--kf-border);
  color: var(--kf-muted-foreground);
}
.kf-markdown__pre {
  margin: 0 0 var(--kf-space-3);
  padding: var(--kf-space-3);
  overflow: auto;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
}
.kf-markdown__code {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-body-sm);
  line-height: 1.6;
  white-space: pre;
}
.kf-markdown__hr {
  height: 0;
  margin: var(--kf-space-4) 0;
  border: 0;
  border-top: 1px solid var(--kf-border);
}
</style>
