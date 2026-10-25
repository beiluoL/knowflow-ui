<template>
  <span class="kf-status-indicator" :class="[`kf-status-indicator--${size}`, `kf-status-indicator--${status}`]">
    <span class="kf-status-indicator__dot" :class="{ 'kf-status-indicator__dot--pulse': pulse }" aria-hidden="true" />
    <span v-if="!dotOnly" class="kf-status-indicator__label">
      <slot>{{ label || DEFAULT_LABEL[status] }}</slot>
    </span>
    <span v-else class="kf-status-indicator__sr">{{ label || DEFAULT_LABEL[status] }}</span>
  </span>
</template>

<script setup lang="ts">
/**
 * KfStatusIndicator — 状态指示。
 *
 * 对应 V5 的 StatusIndicator 条目（原项目只有 Demo）。
 * 无障碍底线：**颜色不能单独承载语义**。即使 dotOnly，也会渲染一段仅供读屏的文本，
 * 避免色弱用户只能看到一个「有颜色的点」。
 */
import type { KfStatus, KfStatusIndicatorProps } from './types'

const DEFAULT_LABEL: Record<KfStatus, string> = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
  away: '离开',
  success: '正常',
  warning: '需注意',
  error: '异常',
  info: '提示',
  neutral: '未知',
}

withDefaults(defineProps<KfStatusIndicatorProps>(), {
  status: 'neutral',
  label: '',
  dotOnly: false,
  pulse: false,
  size: 'md',
})
</script>

<style scoped>
.kf-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--kf-font-sans);
  color: var(--kf-foreground);
  vertical-align: middle;
}
.kf-status-indicator--sm {
  font-size: var(--kf-fs-caption);
}
.kf-status-indicator--md {
  font-size: var(--kf-fs-body-sm);
}
.kf-status-indicator__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: var(--kf-radius-full);
  background: currentColor;
}
.kf-status-indicator--sm .kf-status-indicator__dot {
  width: 6px;
  height: 6px;
}
.kf-status-indicator__dot--pulse {
  animation: kf-status-pulse 1.6s ease-in-out infinite;
}
@keyframes kf-status-pulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 0 3px transparent;
  }
}
.kf-status-indicator__label {
  min-width: 0;
}
/* 只显示圆点时，为读屏保留文本 */
.kf-status-indicator__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.kf-status-indicator--online,
.kf-status-indicator--success {
  color: var(--kf-success);
}
.kf-status-indicator--busy,
.kf-status-indicator--error {
  color: var(--kf-danger);
}
.kf-status-indicator--away,
.kf-status-indicator--warning {
  color: var(--kf-warning-color);
}
.kf-status-indicator--info {
  color: var(--kf-info);
}
.kf-status-indicator--offline,
.kf-status-indicator--neutral {
  color: var(--kf-muted-foreground);
}
@media (prefers-reduced-motion: reduce) {
  .kf-status-indicator__dot--pulse {
    animation: none;
  }
}
</style>
