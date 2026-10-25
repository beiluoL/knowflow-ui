<template>
  <div
    class="kf-card"
    :class="[`kf-card--${variant}`, { 'kf-card--hoverable': hoverable }]"
  >
    <div v-if="$slots.header" class="kf-card__header">
      <slot name="header" />
    </div>
    <div class="kf-card__body" :class="`kf-card__body--${padding}`">
      <slot />
    </div>
    <div v-if="$slots.footer" class="kf-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfCard — 卡片容器。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Card.vue。
 * 解耦：Tailwind 的 rounded-lg / shadow-card / bg-card 换成 --kf-card-radius 与 --kf-* 令牌；
 * hoverable 的 translateY 改用 CSS 变量统一控制，并尊重 prefers-reduced-motion。
 */
import type { KfCardProps } from './types'

withDefaults(defineProps<KfCardProps>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
})
</script>

<style scoped>
.kf-card {
  display: block;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--kf-card-radius);
  border: 1px solid var(--kf-border);
  background: var(--kf-card);
  color: var(--kf-card-foreground);
  font-family: var(--kf-font-sans);
  transition: box-shadow var(--kf-motion-base) ease, transform var(--kf-motion-base) ease;
}
.kf-card--default {
  box-shadow: var(--kf-shadow-card);
}
.kf-card--flat {
  box-shadow: none;
}
.kf-card--outlined {
  background: transparent;
  box-shadow: none;
}
.kf-card--elevated {
  box-shadow: var(--kf-shadow-dropdown);
}
.kf-card--hoverable {
  cursor: pointer;
}
.kf-card--hoverable:hover {
  box-shadow: var(--kf-shadow-dropdown);
  transform: translateY(-1px);
}
.kf-card__header {
  padding: var(--kf-space-4) var(--kf-space-6);
  border-bottom: 1px solid var(--kf-border);
}
.kf-card__body--none {
  padding: 0;
}
.kf-card__body--sm {
  padding: var(--kf-space-4);
}
.kf-card__body--md {
  padding: var(--kf-space-6);
}
.kf-card__body--lg {
  padding: var(--kf-space-8);
}
.kf-card__footer {
  padding: var(--kf-space-4) var(--kf-space-6);
  border-top: 1px solid var(--kf-border);
  background: color-mix(in srgb, var(--kf-muted) 50%, var(--kf-card));
}
@media (prefers-reduced-motion: reduce) {
  .kf-card {
    transition: none;
  }
  .kf-card--hoverable:hover {
    transform: none;
  }
}
</style>
