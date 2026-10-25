<template>
  <!-- 图片型图标：仅当显式传入 URL / data URI 时使用（迁移自原 Icon 的图片分支） -->
  <img
    v-if="isImageSource"
    :src="name"
    :width="sizePx"
    :height="sizePx"
    class="kf-icon kf-icon--img"
    :style="color ? { color } : undefined"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : ariaLabel || undefined"
    :role="decorative ? undefined : 'img'"
  />
  <!-- 系统图标：内联 SVG，24×24 viewBox，currentColor 描边 -->
  <svg
    v-else-if="markup"
    xmlns="http://www.w3.org/2000/svg"
    :width="sizePx"
    :height="sizePx"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="kf-icon"
    :style="color ? { color } : undefined"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : ariaLabel || undefined"
    :role="decorative ? undefined : 'img'"
    focusable="false"
    v-html="markup"
  />
  <!-- 未知图标：不渲染空白盒，仅在开发环境提示 -->
  <span v-else class="kf-icon kf-icon--missing" :style="{ width: sizeCss, height: sizeCss }" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconMarkup } from './registry'
import { ICON_SIZE_PX, type IconSize, type KfIconProps } from './types'

const props = withDefaults(defineProps<KfIconProps>(), {
  size: 'md',
  color: '',
  decorative: true,
  ariaLabel: '',
})

const isImageSource = computed(() => /^(data:|https?:\/\/|\/)/i.test(props.name))

const sizePx = computed(() => {
  const { size } = props
  if (typeof size === 'number') return size
  return ICON_SIZE_PX[size as IconSize] ?? ICON_SIZE_PX.md
})

const sizeCss = computed(() => `${sizePx.value}px`)

const markup = computed(() => (isImageSource.value ? undefined : getIconMarkup(props.name)))

if (import.meta.env.DEV) {
  if (!isImageSource.value && !markup.value) {
    console.warn(`[knowflow-ui] KfIcon: unknown icon "${props.name}". Use registerIcon() to add it.`)
  }
  if (!props.decorative && !props.ariaLabel) {
    console.warn('[knowflow-ui] KfIcon: decorative=false requires ariaLabel for accessibility.')
  }
}
</script>

<style scoped>
.kf-icon {
  display: block;
  flex: none;
  overflow: visible;
}
.kf-icon--img {
  object-fit: contain;
}
.kf-icon--missing {
  display: inline-block;
  flex: none;
  border-radius: var(--kf-radius-xs, 4px);
  background: repeating-linear-gradient(
    45deg,
    var(--kf-border, #e2e6ec),
    var(--kf-border, #e2e6ec) 2px,
    transparent 2px,
    transparent 4px
  );
}
</style>
