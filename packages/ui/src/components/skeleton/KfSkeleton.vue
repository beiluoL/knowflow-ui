<template>
  <div class="kf-skeleton" :class="{ 'kf-skeleton--animated': animated }" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'">
    <div v-for="row in rows" :key="row" class="kf-skeleton__row">
      <template v-if="type === 'list'">
        <div class="kf-skeleton__card">
          <div class="kf-skeleton__line kf-skeleton__line--title" />
          <div class="kf-skeleton__line kf-skeleton__line--full" />
          <div class="kf-skeleton__line kf-skeleton__line--wide" />
          <div class="kf-skeleton__meta">
            <div class="kf-skeleton__line kf-skeleton__line--chip" />
            <div class="kf-skeleton__line kf-skeleton__line--chip" />
            <div class="kf-skeleton__line kf-skeleton__line--chip kf-skeleton__line--end" />
          </div>
        </div>
      </template>
      <template v-else-if="type === 'card'">
        <div class="kf-skeleton__grid" :class="`kf-skeleton__grid--${cols}`">
          <div v-for="col in cols" :key="col" class="kf-skeleton__card">
            <div class="kf-skeleton__avatar" />
            <div class="kf-skeleton__line kf-skeleton__line--title" />
            <div class="kf-skeleton__line kf-skeleton__line--half" />
            <div class="kf-skeleton__line kf-skeleton__line--narrow" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="kf-skeleton__bar" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfSkeleton — 骨架屏占位。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/SkeletonList.vue（对外名 KfSkeleton，更贴合通用库语义）。
 * 变更：
 *   1. Tailwind 的 animate-pulse / grid-cols-* 改为 scoped 关键帧与固定列宽；
 *   2. 默认 aria-hidden —— 骨架屏是纯视觉占位，读屏读到一堆空 div 只会更吵；
 *      需要播报「加载中」时由宿主给 label，或用 aria-busy 表达。
 */
import type { KfSkeletonProps } from './types'

withDefaults(defineProps<KfSkeletonProps>(), {
  rows: 3,
  type: 'list',
  cols: 1,
  animated: true,
  label: '',
})
</script>

<style scoped>
.kf-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-3);
  width: 100%;
  min-width: 0;
}
.kf-skeleton__row {
  min-width: 0;
}
.kf-skeleton__card {
  box-sizing: border-box;
  padding: var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
}
.kf-skeleton__line,
.kf-skeleton__bar,
.kf-skeleton__avatar {
  border-radius: var(--kf-radius-xs);
  background: var(--kf-border);
}
.kf-skeleton__line {
  height: 12px;
  margin-bottom: var(--kf-space-2);
}
.kf-skeleton__line:last-child {
  margin-bottom: 0;
}
.kf-skeleton__line--title {
  height: 16px;
  width: 75%;
  background: var(--kf-muted);
  margin-bottom: var(--kf-space-3);
}
.kf-skeleton__line--full {
  width: 100%;
}
.kf-skeleton__line--wide {
  width: 83%;
}
.kf-skeleton__line--half {
  width: 50%;
}
.kf-skeleton__line--narrow {
  width: 33%;
}
.kf-skeleton__line--chip {
  width: 64px;
  margin-bottom: 0;
}
.kf-skeleton__line--end {
  margin-left: auto;
}
.kf-skeleton__meta {
  display: flex;
  align-items: center;
  gap: var(--kf-space-4);
  margin-top: var(--kf-space-3);
}
.kf-skeleton__bar {
  height: 40px;
  width: 100%;
}
.kf-skeleton__avatar {
  width: 32px;
  height: 32px;
  margin-bottom: var(--kf-space-3);
  border-radius: var(--kf-radius-full);
}
.kf-skeleton__grid {
  display: grid;
  gap: var(--kf-space-4);
}
.kf-skeleton__grid--1 {
  grid-template-columns: minmax(0, 1fr);
}
.kf-skeleton__grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.kf-skeleton__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 720px) {
  .kf-skeleton__grid--2,
  .kf-skeleton__grid--3 {
    grid-template-columns: minmax(0, 1fr);
  }
}

.kf-skeleton--animated .kf-skeleton__line,
.kf-skeleton--animated .kf-skeleton__bar,
.kf-skeleton--animated .kf-skeleton__avatar {
  animation: kf-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes kf-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-skeleton--animated .kf-skeleton__line,
  .kf-skeleton--animated .kf-skeleton__bar,
  .kf-skeleton--animated .kf-skeleton__avatar {
    animation: none;
  }
}
</style>
