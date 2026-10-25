<template>
  <div
    class="kf-execution-status"
    :class="[
      `kf-execution-status--${status}`,
      `kf-execution-status--${size}`,
      { 'kf-execution-status--inline': inline },
    ]"
    role="status"
    aria-live="polite"
    :aria-busy="isBusy || undefined"
  >
    <span class="kf-execution-status__icon" aria-hidden="true">
      <KfIcon :name="meta.icon" :size="size === 'sm' ? 12 : 14" />
    </span>

    <div class="kf-execution-status__body">
      <p class="kf-execution-status__label">
        <span>{{ label || meta.text }}</span>
        <span v-if="progressText" class="kf-execution-status__percent">{{ progressText }}</span>
      </p>
      <p v-if="description" class="kf-execution-status__desc">{{ description }}</p>

      <div
        v-if="hasProgress"
        class="kf-execution-status__track"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="clamped"
        :aria-label="label || meta.text"
      >
        <span class="kf-execution-status__bar" :style="{ width: `${clamped}%` }" />
      </div>
      <div v-else-if="isBusy" class="kf-execution-status__track kf-execution-status__track--indeterminate">
        <span class="kf-execution-status__bar kf-execution-status__bar--indeterminate" />
      </div>

      <slot />
    </div>

    <span v-if="showCancel" class="kf-execution-status__actions">
      <slot name="actions">
        <button type="button" class="kf-execution-status__cancel" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * KfExecutionStatus — 执行状态条（排队 / 运行 / 成功 / 失败 / 已取消）。
 *
 * 组件不驱动状态机：status 与 progress 完全由宿主提供。
 * 取消只发 cancel 事件，不中止任何请求。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfExecutionState, KfExecutionStatusEmits, KfExecutionStatusProps } from './types'

const props = withDefaults(defineProps<KfExecutionStatusProps>(), {
  status: 'idle',
  label: '',
  description: '',
  progress: null,
  cancellable: false,
  cancelLabel: '取消',
  size: 'md',
  inline: false,
})

const emit = defineEmits<KfExecutionStatusEmits>()

const META: Record<KfExecutionState, { icon: string; text: string; busy: boolean }> = {
  idle: { icon: 'clock', text: '等待开始', busy: false },
  queued: { icon: 'clock', text: '排队中', busy: true },
  running: { icon: 'loader', text: '执行中', busy: true },
  success: { icon: 'check-circle', text: '已完成', busy: false },
  error: { icon: 'alert-circle', text: '执行失败', busy: false },
  cancelled: { icon: 'x-circle', text: '已取消', busy: false },
}

const meta = computed(() => META[props.status])
const isBusy = computed(() => meta.value.busy)
const hasProgress = computed(() => typeof props.progress === 'number' && Number.isFinite(props.progress))
const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.progress ?? 0))))
const progressText = computed(() => (hasProgress.value ? `${clamped.value}%` : ''))
const showCancel = computed(() => props.cancellable && (props.status === 'running' || props.status === 'queued'))
</script>

<style scoped>
.kf-execution-status {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-2) var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
}
.kf-execution-status--sm {
  padding: 5px var(--kf-space-2);
}
.kf-execution-status--inline {
  align-items: center;
  display: inline-flex;
  border-radius: var(--kf-radius-full);
  padding: 3px 10px 3px 6px;
}
.kf-execution-status__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-execution-status--inline .kf-execution-status__icon {
  margin-top: 0;
}
.kf-execution-status--running .kf-execution-status__icon,
.kf-execution-status--queued .kf-execution-status__icon {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-execution-status--running .kf-execution-status__icon :deep(svg) {
  animation: kf-execution-spin 1s linear infinite;
}
.kf-execution-status--success .kf-execution-status__icon {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-execution-status--error .kf-execution-status__icon {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-execution-status__body {
  flex: 1 1 auto;
  min-width: 0;
}
.kf-execution-status__label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
}
.kf-execution-status--sm .kf-execution-status__label {
  font-size: var(--kf-fs-caption);
}
.kf-execution-status__percent {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}
.kf-execution-status__desc {
  margin: 1px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  overflow-wrap: anywhere;
}
.kf-execution-status__track {
  position: relative;
  height: 4px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
}
.kf-execution-status__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--kf-primary);
  transition: width var(--kf-motion-base) ease;
}
.kf-execution-status__track--indeterminate .kf-execution-status__bar--indeterminate {
  width: 40%;
  animation: kf-execution-slide 1.4s ease-in-out infinite;
}
.kf-execution-status--success .kf-execution-status__bar {
  background: var(--kf-success);
}
.kf-execution-status--error .kf-execution-status__bar {
  background: var(--kf-danger);
}
.kf-execution-status__actions {
  flex: none;
  align-self: center;
}
.kf-execution-status__cancel {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-xs);
  cursor: pointer;
}
.kf-execution-status__cancel:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-execution-status__cancel:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
@keyframes kf-execution-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes kf-execution-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-execution-status--running .kf-execution-status__icon :deep(svg) {
    animation: none;
  }
  .kf-execution-status__track--indeterminate .kf-execution-status__bar--indeterminate {
    width: 100%;
    animation: none;
    opacity: 0.5;
  }
  .kf-execution-status__bar {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-execution-status__bar {
    background: Highlight;
  }
}
</style>
