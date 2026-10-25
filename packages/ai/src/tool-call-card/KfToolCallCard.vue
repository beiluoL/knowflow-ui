<template>
  <section
    class="kf-tool-call-card"
    :class="[`kf-tool-call-card--${status}`, { 'kf-tool-call-card--open': expanded }]"
    :aria-label="ariaLabel || `工具调用 ${title || name}`"
  >
    <header class="kf-tool-call-card__head">
      <span class="kf-tool-call-card__icon" aria-hidden="true">
        <KfIcon :name="statusIcon" :size="13" />
      </span>

      <button
        type="button"
        class="kf-tool-call-card__toggle"
        :aria-expanded="expanded"
        :aria-controls="bodyId"
        @click="toggle"
      >
        <span class="kf-tool-call-card__name">{{ title || name }}</span>
        <code class="kf-tool-call-card__code">{{ name }}</code>
        <span class="kf-tool-call-card__state" :class="`kf-tool-call-card__state--${status}`">{{ statusText }}</span>
        <span v-if="duration" class="kf-tool-call-card__duration">{{ duration }}</span>
        <KfIcon
          :name="expanded ? 'chevron-up' : 'chevron-down'"
          :size="13"
          class="kf-tool-call-card__chevron"
          aria-hidden="true"
        />
      </button>
    </header>

    <div v-if="approval === 'requested'" class="kf-tool-call-card__approval" role="group" aria-label="工具调用审批">
      <p class="kf-tool-call-card__approval-text">该工具需要你确认后才会执行</p>
      <div class="kf-tool-call-card__approval-actions">
        <slot name="actions">
          <button type="button" class="kf-tool-call-card__btn kf-tool-call-card__btn--ghost" @click="emit('reject')">
            {{ rejectLabel }}
          </button>
          <button type="button" class="kf-tool-call-card__btn kf-tool-call-card__btn--primary" @click="emit('approve')">
            {{ approveLabel }}
          </button>
        </slot>
      </div>
    </div>
    <p v-else-if="approval === 'approved'" class="kf-tool-call-card__approval-note">已确认执行</p>
    <p v-else-if="approval === 'rejected'" class="kf-tool-call-card__approval-note kf-tool-call-card__approval-note--rejected">
      已拒绝执行
    </p>

    <div v-show="expanded" :id="bodyId" class="kf-tool-call-card__body">
      <div v-if="$slots.args || args" class="kf-tool-call-card__section">
        <p class="kf-tool-call-card__section-title">入参</p>
        <slot name="args">
          <pre class="kf-tool-call-card__pre">{{ args }}</pre>
        </slot>
      </div>

      <div v-if="$slots.result || result" class="kf-tool-call-card__section">
        <p class="kf-tool-call-card__section-title">结果</p>
        <slot name="result">
          <pre class="kf-tool-call-card__pre">{{ result }}</pre>
        </slot>
      </div>

      <div v-if="error" class="kf-tool-call-card__section">
        <p class="kf-tool-call-card__section-title kf-tool-call-card__section-title--error">错误</p>
        <pre class="kf-tool-call-card__pre kf-tool-call-card__pre--error">{{ error }}</pre>
      </div>

      <p v-if="!args && !result && !error && !$slots.args && !$slots.result" class="kf-tool-call-card__placeholder">
        暂无调用详情
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * KfToolCallCard — Agent 工具调用卡片。
 *
 * 审批只发事件：approve / reject 由宿主决定后续动作，组件永远不自己执行工具。
 * 入参与结果按纯文本渲染（<pre>），不做 HTML 解析 —— 工具返回值同样不可信。
 */
import { computed, ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { nextUid } from '../shared/uid'
import type { KfToolCallCardEmits, KfToolCallCardProps, KfToolCallStatus } from './types'

const props = withDefaults(defineProps<KfToolCallCardProps>(), {
  title: '',
  status: 'pending',
  approval: 'none',
  args: '',
  result: '',
  error: '',
  duration: '',
  defaultOpen: false,
  approveLabel: '允许执行',
  rejectLabel: '拒绝',
  ariaLabel: '',
})

const emit = defineEmits<KfToolCallCardEmits>()

const bodyId = nextUid('kf-tool-call-card')
const expanded = ref(props.defaultOpen)

const STATUS_META: Record<KfToolCallStatus, { icon: string; text: string }> = {
  pending: { icon: 'clock', text: '待执行' },
  running: { icon: 'loader', text: '执行中' },
  success: { icon: 'check', text: '成功' },
  error: { icon: 'x', text: '失败' },
}

const statusIcon = computed(() => STATUS_META[props.status].icon)
const statusText = computed(() => (props.error && props.status !== 'success' ? '失败' : STATUS_META[props.status].text))

function toggle(): void {
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}
</script>

<style scoped>
.kf-tool-call-card {
  box-sizing: border-box;
  min-width: 0;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
  overflow: hidden;
}
.kf-tool-call-card--error {
  border-color: var(--kf-danger);
}
.kf-tool-call-card__head {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  padding: 6px 10px 6px var(--kf-space-2);
  min-height: 34px;
}
.kf-tool-call-card__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-tool-call-card--success .kf-tool-call-card__icon {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-tool-call-card--running .kf-tool-call-card__icon {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-tool-call-card--running .kf-tool-call-card__icon :deep(svg) {
  animation: kf-tool-spin 1s linear infinite;
}
.kf-tool-call-card--error .kf-tool-call-card__icon {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-tool-call-card__toggle {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.kf-tool-call-card__toggle:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 2px;
  border-radius: var(--kf-radius-xs);
}
.kf-tool-call-card__name {
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-tool-call-card__code {
  overflow: hidden;
  max-width: 40%;
  padding: 1px 4px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-tool-call-card__state {
  padding: 0 5px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-tool-call-card__state--success {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-tool-call-card__state--running {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-tool-call-card__state--error {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-tool-call-card__duration {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-tool-call-card__chevron {
  flex: none;
  margin-left: auto;
  color: var(--kf-muted-foreground);
}
.kf-tool-call-card__approval {
  padding: var(--kf-space-2) var(--kf-space-3);
  border-top: 1px solid var(--kf-border);
  background: var(--kf-warning-subtle);
}
.kf-tool-call-card__approval-text {
  margin: 0 0 6px;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-tool-call-card__approval-actions {
  display: flex;
  gap: var(--kf-space-2);
}
.kf-tool-call-card__btn {
  height: 28px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--kf-radius-sm);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-tool-call-card__btn--primary {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-tool-call-card__btn--primary:hover {
  background: var(--kf-primary-hover);
}
.kf-tool-call-card__btn--ghost {
  border-color: var(--kf-border);
  background: var(--kf-card);
  color: var(--kf-foreground);
}
.kf-tool-call-card__btn--ghost:hover {
  background: var(--kf-muted);
}
.kf-tool-call-card__btn:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-tool-call-card__approval-note {
  margin: 0;
  padding: 6px var(--kf-space-3);
  border-top: 1px solid var(--kf-border);
  background: var(--kf-success-surface);
  color: var(--kf-success);
  font-size: var(--kf-fs-caption);
}
.kf-tool-call-card__approval-note--rejected {
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-tool-call-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  padding: var(--kf-space-2) var(--kf-space-3) var(--kf-space-3);
  border-top: 1px solid var(--kf-border);
}
.kf-tool-call-card__section {
  min-width: 0;
}
.kf-tool-call-card__section-title {
  margin: 0 0 3px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
}
.kf-tool-call-card__section-title--error {
  color: var(--kf-danger);
}
.kf-tool-call-card__pre {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  padding: var(--kf-space-2);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  color: var(--kf-foreground);
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-tool-call-card__pre--error {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-tool-call-card__placeholder {
  margin: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
@keyframes kf-tool-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-tool-call-card--running .kf-tool-call-card__icon :deep(svg) {
    animation: none;
  }
}
</style>
