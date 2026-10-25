<template>
  <nav class="kf-pagination" :aria-label="ariaLabel">
    <span class="kf-pagination__info">
      <template v-if="showInfo">显示 {{ startIndex }}-{{ endIndex }} / 共 {{ total }} 项</template>
    </span>
    <div class="kf-pagination__controls">
      <button
        type="button"
        class="kf-pagination__button"
        :disabled="disabled || pageNum <= 1"
        aria-label="上一页"
        @click="goTo(pageNum - 1)"
      >
        <KfIcon name="chevron-left" :size="16" aria-hidden="true" />
        <span class="kf-pagination__button-text">上一页</span>
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        class="kf-pagination__page"
        :class="{ 'kf-pagination__page--active': page === pageNum }"
        :aria-current="page === pageNum ? 'page' : undefined"
        :disabled="disabled"
        @click="goTo(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="kf-pagination__button kf-pagination__button--next"
        :disabled="disabled || pageNum >= totalPages"
        aria-label="下一页"
        @click="goTo(pageNum + 1)"
      >
        <span class="kf-pagination__button-text">下一页</span>
        <KfIcon name="chevron-right" :size="16" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * KfPagination — 分页器。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Pagination.vue。
 * 除样式解耦外补了三处语义：
 *   1. `<nav aria-label>` 包住，读屏可以把分页当导航区跳转；
 *   2. 当前页加 aria-current="page"（原来只有视觉高亮）；
 *   3. 页码越界时夹取后再 emit，避免宿主拿到 page=0 去请求。
 */
import { computed } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfPaginationEmits, KfPaginationProps } from './types'

const props = withDefaults(defineProps<KfPaginationProps>(), {
  showInfo: true,
  maxVisiblePages: 5,
  disabled: false,
  ariaLabel: '分页',
})

const emit = defineEmits<KfPaginationEmits>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))))

const startIndex = computed(() => (props.total === 0 ? 0 : (props.pageNum - 1) * props.pageSize + 1))
const endIndex = computed(() => Math.min(props.pageNum * props.pageSize, props.total))

const visiblePages = computed(() => {
  const total = totalPages.value
  const max = props.maxVisiblePages
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1)

  const current = props.pageNum
  const half = Math.floor(max / 2)
  let start = Math.max(1, current - half)
  const end = Math.min(total, start + max - 1)
  start = Math.max(1, end - max + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goTo(page: number): void {
  if (props.disabled) return
  const next = Math.min(totalPages.value, Math.max(1, page))
  if (next === props.pageNum) return
  emit('update:pageNum', next)
  emit('change', next)
}
</script>

<style scoped>
.kf-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-3);
  width: 100%;
  font-family: var(--kf-font-sans);
}
.kf-pagination__info {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
}
.kf-pagination__controls {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.kf-pagination__button {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-1);
  box-sizing: border-box;
  height: var(--kf-control-height-sm);
  padding: 0 var(--kf-space-2);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease;
}
.kf-pagination__button:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-pagination__button--next {
  border-color: transparent;
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-pagination__button--next:hover:not(:disabled) {
  background: var(--kf-primary-hover);
  color: var(--kf-primary-foreground);
}
.kf-pagination__page {
  box-sizing: border-box;
  min-width: 32px;
  height: var(--kf-control-height-sm);
  padding: 0 var(--kf-space-1);
  border: 1px solid transparent;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
.kf-pagination__page:hover:not(:disabled, .kf-pagination__page--active) {
  background: var(--kf-muted);
}
.kf-pagination__page--active {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
  font-weight: var(--kf-fw-label);
}
.kf-pagination__button:focus-visible,
.kf-pagination__page:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-pagination__button:disabled,
.kf-pagination__page:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-pagination__button-text {
  white-space: nowrap;
}
@media (max-width: 560px) {
  .kf-pagination__button-text {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-pagination__button {
    transition: none;
  }
}
</style>
