<template>
  <div class="page">
    <header>
      <p class="page__crumb">Design Tokens</p>
      <h1 class="page__title">设计令牌</h1>
      <p class="page__desc">
        令牌唯一来源是 <code>packages/tokens/src/tokens.css</code>；下表读取的是当前主题下浏览器计算后的真实值。
        组件只消费 <code>--kf-*</code>，旧项目可通过 <code>@beiluol/knowflow-tokens/kb-compat.css</code> 把
        <code>--kb-*</code> 映射到新命名空间。
      </p>
      <div class="page__actions">
        <span class="page__chip">当前主题：{{ theme === 'dark' ? 'Dark' : 'Light' }}</span>
        <span class="page__chip">命名空间：--kf-*</span>
        <span class="page__chip">兼容：--kb-* → --kf-*</span>
      </div>
    </header>

    <TokenTable :theme="theme" />
  </div>
</template>

<script setup lang="ts">
import TokenTable from '../components/TokenTable.vue'

defineProps<{ theme: string }>()
</script>

<style scoped>
.page {
  display: grid;
  gap: var(--kf-space-6);
  max-width: 1180px;
  padding: var(--kf-space-6) var(--kf-space-6) 64px;
}
.page__crumb {
  margin: 0 0 6px;
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
}
.page__title {
  margin: 0;
  font-size: var(--kf-fs-h1);
  line-height: var(--kf-lh-h1);
  font-weight: var(--kf-fw-h1);
  color: var(--kf-foreground);
}
.page__desc {
  margin: var(--kf-space-3) 0 0;
  max-width: 820px;
  font-size: var(--kf-fs-body-md);
  line-height: 1.75;
  color: var(--kf-foreground);
}
.page__desc code {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-body-sm);
  padding: 1px 5px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-background);
}
.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  margin-top: var(--kf-space-4);
}
.page__chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--kf-radius-full);
  border: 1px solid var(--kf-border);
  background: var(--kf-card);
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
@media (max-width: 720px) {
  .page {
    padding: var(--kf-space-4) var(--kf-space-4) 48px;
  }
}
</style>
