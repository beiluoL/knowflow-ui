<template>
  <section class="preview-stage">
    <div class="preview-stage__canvas" :class="{ 'preview-stage__canvas--narrow': narrow }">
      <slot />
    </div>

    <div class="preview-stage__bar">
      <div class="preview-stage__metrics">
        <span v-for="item in metricItems" :key="item.label" class="preview-stage__metric">
          <span class="preview-stage__metric-label">{{ item.label }}</span>
          <code>{{ item.value }}</code>
        </span>
      </div>
      <div class="preview-stage__events">
        <span class="preview-stage__metric-label">事件</span>
        <code v-if="events.length">{{ events.slice(0, 3).join(' · ') }}</code>
        <span v-else class="preview-stage__placeholder">暂无</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementMetrics } from '../composables/useElementMetrics'

const props = defineProps<{ metrics: ElementMetrics; events: string[]; narrow?: boolean }>()

const metricItems = computed(() => [
  { label: '尺寸', value: `${props.metrics.width} × ${props.metrics.height}` },
  { label: '字号/字重', value: `${props.metrics.fontSize} / ${props.metrics.fontWeight}` },
  { label: '圆角', value: props.metrics.borderRadius || '—' },
  { label: '背景', value: props.metrics.background || '—' },
  { label: '阴影', value: props.metrics.boxShadow === 'none' ? 'none' : '有' },
])
</script>

<style scoped>
.preview-stage {
  display: grid;
  gap: 0;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
}
.preview-stage__canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 240px;
  padding: var(--kf-space-8) var(--kf-space-6);
  overflow: hidden;
  background:
    linear-gradient(0deg, color-mix(in srgb, var(--kf-border) 40%, transparent) 1px, transparent 1px)
      0 0 / 100% 24px,
    var(--kf-background);
}
.preview-stage__canvas--narrow {
  max-width: 390px;
  margin: 0 auto;
}
.preview-stage__bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-3);
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--kf-space-4);
  border-top: 1px solid var(--kf-border);
  background: var(--kf-card);
}
.preview-stage__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-3);
}
.preview-stage__metric {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--kf-fs-xs);
}
.preview-stage__metric-label {
  color: var(--kf-muted-foreground);
}
.preview-stage__metric code,
.preview-stage__events code {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  color: var(--kf-foreground);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.preview-stage__events {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--kf-fs-xs);
}
.preview-stage__placeholder {
  color: var(--kf-muted-foreground);
}
</style>
