<template>
  <div class="icon-preview">
    <div class="icon-preview__hero">
      <KfIcon
        :name="name"
        :size="size"
        :color="color || undefined"
        :decorative="decorative"
        :aria-label="ariaLabel || undefined"
      />
    </div>
    <div class="icon-preview__scale">
      <div v-for="step in SCALE" :key="step.label" class="icon-preview__scale-item">
        <span class="icon-preview__scale-glyph">
          <KfIcon :name="name" :size="step.value" />
        </span>
        <code>{{ step.label }}</code>
        <span class="icon-preview__scale-px">{{ ICON_SIZE_PX[step.value] }}px</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KfIcon, ICON_SIZE_PX, type IconSize } from '@beiluol/knowflow-ui'
import type { PropState } from '../stories/types'

const props = defineProps<{ state: PropState }>()

const SCALE: { label: string; value: IconSize }[] = [
  { label: 'xxs', value: 'xxs' },
  { label: 'xs', value: 'xs' },
  { label: 'sm', value: 'sm' },
  { label: 'md', value: 'md' },
  { label: 'lg', value: 'lg' },
  { label: 'xl', value: 'xl' },
  { label: '2xl', value: '2xl' },
  { label: '3xl', value: '3xl' },
]

function str(key: string): string {
  const value = props.state[key]
  return typeof value === 'string' ? value : ''
}

const name = computed(() => str('name') || 'sparkles')
const size = computed(() => (str('size') || 'md') as IconSize)
const color = computed(() => str('color'))
const ariaLabel = computed(() => str('ariaLabel'))
const decorative = computed(() => props.state.decorative !== false)
</script>

<style scoped>
.icon-preview {
  display: grid;
  gap: var(--kf-space-5);
  width: 100%;
}
.icon-preview__hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: var(--kf-radius-md);
  background: var(--kf-background);
  color: var(--kf-primary);
}
.icon-preview__scale {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: var(--kf-space-2);
}
.icon-preview__scale-item {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: var(--kf-space-2);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-background);
  color: var(--kf-foreground);
}
.icon-preview__scale-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}
.icon-preview__scale-item code {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.icon-preview__scale-px {
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
@media (max-width: 720px) {
  .icon-preview__scale {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
