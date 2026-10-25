<template>
  <div class="kf-empty-state" role="status" aria-live="polite">
    <span class="kf-empty-state__icon" :class="`kf-empty-state__icon--${variant}`" aria-hidden="true">
      <KfIcon :name="icon" :size="32" />
    </span>
    <h3 class="kf-empty-state__title">{{ title }}</h3>
    <div class="kf-empty-state__description">
      <slot>{{ description }}</slot>
    </div>
    <div v-if="$slots.action" class="kf-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfEmptyState — 空状态。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/EmptyState.vue。
 * 三要素契约不变：① 发生了什么（title）② 为什么为空（description/默认插槽）③ 下一步（#action）。
 * 解耦：Tailwind 的 bg-blue-50 / text-warning-500 一类硬编码换成 --kf-* 语义令牌
 * （原实现同一文件里混用了两套色板，暗色模式必然分叉）。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfEmptyStateProps } from './types'

withDefaults(defineProps<KfEmptyStateProps>(), {
  icon: 'folder',
  description: '暂无数据',
  variant: 'default',
})
</script>

<style scoped>
.kf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--kf-space-8) var(--kf-space-4);
  text-align: center;
  font-family: var(--kf-font-sans);
}
.kf-empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--kf-space-4);
  border-radius: var(--kf-radius-full);
}
.kf-empty-state__icon--default {
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-empty-state__icon--info {
  background: var(--kf-info-surface);
  color: var(--kf-info);
}
.kf-empty-state__icon--warning {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-empty-state__icon--success {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-empty-state__title {
  margin: 0 0 var(--kf-space-2);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-lg);
  font-weight: var(--kf-fw-h1);
  line-height: var(--kf-lh-body-lg);
}
.kf-empty-state__description {
  max-width: 360px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
}
.kf-empty-state__action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--kf-space-3);
  margin-top: var(--kf-space-6);
}
</style>
