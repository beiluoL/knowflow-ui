<template>
  <template v-for="(token, index) in tokens" :key="index">
    <strong v-if="token.type === 'strong'" class="kf-markdown__strong">{{ token.text }}</strong>
    <em v-else-if="token.type === 'em'" class="kf-markdown__em">{{ token.text }}</em>
    <code v-else-if="token.type === 'code'" class="kf-markdown__inline-code">{{ token.text }}</code>
    <a
      v-else-if="token.type === 'link' && linkable"
      class="kf-markdown__link"
      :href="token.href"
      target="_blank"
      rel="noopener noreferrer nofollow"
      >{{ token.text }}</a
    >
    <span v-else-if="token.type === 'link'" class="kf-markdown__link-plain">{{ token.text }}</span>
    <template v-else>{{ token.text }}</template>
  </template>
</template>

<script setup lang="ts">
/**
 * 行内 token 渲染器（KfMarkdownRenderer 内部使用，不对外导出）。
 * 只做「token → 元素」的一对一映射，没有任何字符串拼接 HTML 的机会。
 */
import type { MdInline } from './parse'

withDefaults(defineProps<{ tokens: MdInline[]; linkable?: boolean }>(), {
  linkable: true,
})
</script>

<style scoped>
.kf-markdown__strong {
  font-weight: var(--kf-fw-h1);
}
.kf-markdown__em {
  font-style: italic;
}
.kf-markdown__inline-code {
  padding: 1px 5px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  font-family: var(--kf-font-mono);
  font-size: 0.92em;
}
.kf-markdown__link {
  color: var(--kf-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.kf-markdown__link-plain {
  color: var(--kf-muted-foreground);
}
</style>
