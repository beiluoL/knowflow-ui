<template>
  <div
    v-if="direction === 'horizontal'"
    class="kf-divider kf-divider--horizontal"
    :class="[`kf-divider--${spacing}`, { 'kf-divider--dashed': dashed, 'kf-divider--with-text': hasContent }]"
    role="separator"
    :aria-orientation="'horizontal'"
  >
    <span v-if="hasContent" class="kf-divider__content" :class="`kf-divider__content--${contentPosition}`">
      <slot />
    </span>
  </div>
  <div
    v-else
    class="kf-divider kf-divider--vertical"
    :class="[`kf-divider--${spacing}`, { 'kf-divider--dashed': dashed }]"
    role="separator"
    aria-orientation="vertical"
  />
</template>

<script setup lang="ts">
/**
 * KfDivider — 分隔线。对应 V5 的 Divider 条目（原项目只有占位，无生产组件）。
 * 用 role="separator" 而不是 <hr>：<hr> 在 aria 里是语义分隔符但不可带文字，
 * 这里需要支持「带标题的分隔线」，因此统一用 div + role。
 */
import { computed, useSlots } from 'vue'
import type { KfDividerProps } from './types'

const props = withDefaults(defineProps<KfDividerProps>(), {
  direction: 'horizontal',
  spacing: 'md',
  dashed: false,
  contentPosition: 'center',
})

const slots = useSlots()
const hasContent = computed(() => props.direction === 'horizontal' && !!slots.default)
</script>

<style scoped>
.kf-divider {
  box-sizing: border-box;
  font-family: var(--kf-font-sans);
  color: var(--kf-muted-foreground);
}
.kf-divider--horizontal {
  display: flex;
  align-items: center;
  gap: var(--kf-space-3);
  width: 100%;
  border-top: 1px solid var(--kf-border);
}
.kf-divider--horizontal.kf-divider--dashed {
  border-top-style: dashed;
}
.kf-divider--vertical {
  display: inline-block;
  align-self: stretch;
  width: 0;
  height: 100%;
  min-height: 1em;
  border-left: 1px solid var(--kf-border);
  vertical-align: middle;
}
.kf-divider--vertical.kf-divider--dashed {
  border-left-style: dashed;
}
.kf-divider--sm.kf-divider--horizontal {
  margin-block: var(--kf-space-2);
}
.kf-divider--md.kf-divider--horizontal {
  margin-block: var(--kf-space-4);
}
.kf-divider--lg.kf-divider--horizontal {
  margin-block: var(--kf-space-6);
}
.kf-divider--vertical.kf-divider--sm {
  margin-inline: var(--kf-space-2);
}
.kf-divider--vertical.kf-divider--md {
  margin-inline: var(--kf-space-3);
}
.kf-divider--vertical.kf-divider--lg {
  margin-inline: var(--kf-space-4);
}

/* 有文字时：用两条伪线夹住文字，避免 flex gap 把边框拉断 */
.kf-divider--with-text {
  border-top: 0;
}
.kf-divider--with-text::before,
.kf-divider--with-text::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--kf-border);
}
.kf-divider--with-text.kf-divider--dashed::before,
.kf-divider--with-text.kf-divider--dashed::after {
  border-top-style: dashed;
}
.kf-divider__content {
  flex: none;
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  white-space: nowrap;
}
.kf-divider__content--left {
  order: -1;
}
.kf-divider__content--right {
  order: 1;
}
</style>
