<template>
  <section class="kf-agent-trace" :class="{ 'kf-agent-trace--compact': compact }" :aria-label="ariaLabel || title">
    <header v-if="title || $slots.header" class="kf-agent-trace__head">
      <KfIcon name="route" :size="14" class="kf-agent-trace__head-icon" aria-hidden="true" />
      <h3 class="kf-agent-trace__title">{{ title }}</h3>
      <slot name="header" />
    </header>

    <div v-if="steps.length === 0" class="kf-agent-trace__empty">
      <slot name="empty">{{ emptyText }}</slot>
    </div>

    <ol v-else class="kf-agent-trace__list">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="kf-agent-trace__item"
        :class="[`kf-agent-trace__item--${statusOf(step)}`, `kf-agent-trace__item--${step.kind || 'plan'}`]"
        :aria-current="statusOf(step) === 'running' ? 'step' : undefined"
      >
        <span class="kf-agent-trace__marker" aria-hidden="true">
          <KfIcon :name="iconOf(step)" :size="12" />
        </span>

        <div class="kf-agent-trace__body">
          <div class="kf-agent-trace__line">
            <button type="button" class="kf-agent-trace__title-btn" @click="emit('select', step, index)">
              {{ step.title }}
            </button>
            <span v-if="step.duration && !compact" class="kf-agent-trace__duration">{{ step.duration }}</span>
            <span v-if="statusOf(step) === 'error'" class="kf-agent-trace__status kf-agent-trace__status--error">
              失败
            </span>
            <span v-else-if="statusOf(step) === 'skipped'" class="kf-agent-trace__status">已跳过</span>
            <span v-else-if="statusOf(step) === 'running'" class="kf-agent-trace__status kf-agent-trace__status--running">
              进行中
            </span>
          </div>

          <slot name="step" :step="step" :index="index">
            <p v-if="step.description && !compact" class="kf-agent-trace__desc">{{ step.description }}</p>
            <div v-if="step.detail && !compact" class="kf-agent-trace__detail-wrap">
              <button
                type="button"
                class="kf-agent-trace__detail-toggle"
                :aria-expanded="isOpen(step.id)"
                @click="toggle(step.id)"
              >
                {{ isOpen(step.id) ? '收起详情' : '展开详情' }}
                <KfIcon :name="isOpen(step.id) ? 'chevron-up' : 'chevron-down'" :size="12" aria-hidden="true" />
              </button>
              <p v-show="isOpen(step.id)" class="kf-agent-trace__detail">{{ step.detail }}</p>
            </div>
          </slot>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
/**
 * KfAgentTrace — Agent 执行轨迹（计划 → 工具 → 观察 → 决策）。
 *
 * 纯展示：步骤来自宿主，组件不做状态推导、不把 running 自动推进为 success。
 * 步骤详情文本按纯文本渲染（保留换行），不解析 HTML / Markdown。
 */
import { ref } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfAgentStep, KfAgentStepStatus, KfAgentTraceEmits, KfAgentTraceProps } from './types'

const props = withDefaults(defineProps<KfAgentTraceProps>(), {
  steps: () => [],
  title: '执行轨迹',
  compact: false,
  expandedIds: () => [],
  emptyText: '暂无执行步骤',
  ariaLabel: '',
})

const emit = defineEmits<KfAgentTraceEmits>()

const openIds = ref<Set<string>>(new Set(props.expandedIds))

const KIND_ICON: Record<string, string> = {
  plan: 'target',
  tool: 'zap',
  observation: 'eye',
  decision: 'route',
  final: 'check-circle',
}

const STATUS_ICON: Record<KfAgentStepStatus, string> = {
  pending: 'clock',
  running: 'loader',
  success: 'check',
  error: 'x',
  skipped: 'minus',
}

function statusOf(step: KfAgentStep): KfAgentStepStatus {
  return step.status ?? 'pending'
}

function iconOf(step: KfAgentStep): string {
  if (step.iconName) return step.iconName
  const status = statusOf(step)
  // 失败/跳过优先表达状态，其余用步骤类型图标，视觉上更易扫读
  if (status === 'error' || status === 'skipped' || status === 'running') return STATUS_ICON[status]
  return KIND_ICON[step.kind ?? 'plan'] ?? 'target'
}

function isOpen(id: string): boolean {
  return openIds.value.has(id)
}

function toggle(id: string): void {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}
</script>

<style scoped>
.kf-agent-trace {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-agent-trace__head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-agent-trace__head-icon {
  flex: none;
  color: var(--kf-primary);
}
.kf-agent-trace__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
}
.kf-agent-trace__empty {
  padding: var(--kf-space-3);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-agent-trace__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-agent-trace__item {
  position: relative;
  display: flex;
  gap: var(--kf-space-2);
  min-width: 0;
  padding-bottom: var(--kf-space-2);
}
.kf-agent-trace__item:last-child {
  padding-bottom: 0;
}
.kf-agent-trace__item::before {
  content: '';
  position: absolute;
  top: 20px;
  bottom: 0;
  left: 9px;
  width: 1px;
  background: var(--kf-border);
}
.kf-agent-trace__item:last-child::before {
  display: none;
}
.kf-agent-trace__marker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  margin-top: 1px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
  color: var(--kf-muted-foreground);
}
.kf-agent-trace__item--success .kf-agent-trace__marker {
  border-color: var(--kf-success);
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-agent-trace__item--running .kf-agent-trace__marker {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-agent-trace__item--running .kf-agent-trace__marker :deep(svg) {
  animation: kf-agent-spin 1s linear infinite;
}
.kf-agent-trace__item--error .kf-agent-trace__marker {
  border-color: var(--kf-danger);
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-agent-trace__item--skipped .kf-agent-trace__marker {
  opacity: 0.6;
}
.kf-agent-trace__body {
  flex: 1 1 auto;
  min-width: 0;
}
.kf-agent-trace__line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-agent-trace__title-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
  text-align: left;
  cursor: pointer;
}
.kf-agent-trace__title-btn:hover {
  color: var(--kf-primary);
}
.kf-agent-trace__title-btn:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 2px;
  border-radius: var(--kf-radius-xs);
}
.kf-agent-trace__item--pending .kf-agent-trace__title-btn,
.kf-agent-trace__item--skipped .kf-agent-trace__title-btn {
  color: var(--kf-muted-foreground);
}
.kf-agent-trace__duration {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-agent-trace__status {
  padding: 0 4px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-agent-trace__status--error {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-agent-trace__status--running {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-agent-trace__desc {
  margin: 2px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  overflow-wrap: anywhere;
}
.kf-agent-trace__detail-wrap {
  margin-top: 4px;
  min-width: 0;
}
.kf-agent-trace__detail-toggle {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kf-primary);
  font-family: inherit;
  font-size: var(--kf-fs-xs);
  cursor: pointer;
}
.kf-agent-trace__detail-toggle:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 2px;
  border-radius: var(--kf-radius-xs);
}
.kf-agent-trace__detail {
  margin: 4px 0 0;
  padding: var(--kf-space-2);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-agent-trace--compact .kf-agent-trace__item {
  padding-bottom: 4px;
}
@keyframes kf-agent-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-agent-trace__item--running .kf-agent-trace__marker :deep(svg) {
    animation: none;
  }
}
@media (forced-colors: active) {
  .kf-agent-trace__marker {
    border-color: CanvasText;
  }
}
</style>
