<template>
  <section class="kf-thinking-panel" :class="{ 'kf-thinking-panel--open': expanded, 'kf-thinking-panel--streaming': streaming }">
    <component
      :is="collapsible ? 'button' : 'div'"
      class="kf-thinking-panel__head"
      :type="collapsible ? 'button' : undefined"
      :aria-expanded="collapsible ? expanded : undefined"
      :aria-controls="collapsible ? bodyId : undefined"
      :disabled="collapsible ? disabled : undefined"
      :aria-label="collapsible ? undefined : ariaLabel || title"
      @click="collapsible && toggle()"
    >
      <KfIcon name="brain" :size="14" class="kf-thinking-panel__icon" aria-hidden="true" />
      <span class="kf-thinking-panel__title">{{ title }}</span>

      <span v-if="streaming" class="kf-thinking-panel__live" role="status" aria-label="思考中">
        <span class="kf-thinking-panel__dot" aria-hidden="true" />
        思考中
      </span>
      <span v-else-if="duration" class="kf-thinking-panel__meta">{{ duration }}</span>

      <slot name="header-extra" />
      <KfIcon
        v-if="collapsible"
        :name="expanded ? 'chevron-up' : 'chevron-down'"
        :size="14"
        class="kf-thinking-panel__chevron"
        aria-hidden="true"
      />
    </component>

    <div v-show="expanded" :id="bodyId" class="kf-thinking-panel__body" role="region" :aria-label="ariaLabel || title">
      <slot>
        <p v-if="content" class="kf-thinking-panel__text">{{ content }}</p>
        <p v-else class="kf-thinking-panel__empty">{{ emptyText }}</p>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * KfThinkingPanel — 思考过程折叠面板（纯展示）。
 *
 * 安全边界：content 必须是宿主已经做了脱敏/筛选的**可公开文本**。
 * 组件不读取模型原始 reasoning 字段、不拼接系统提示词、不做任何自动展开猜测。
 */
import { computed, ref, watch } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { nextUid } from '../shared/uid'
import type { KfThinkingPanelEmits, KfThinkingPanelProps } from './types'

const props = withDefaults(defineProps<KfThinkingPanelProps>(), {
  title: '思考过程',
  content: '',
  streaming: false,
  duration: '',
  defaultOpen: false,
  collapsible: true,
  emptyText: '暂无思考内容',
  ariaLabel: '',
})

const emit = defineEmits<KfThinkingPanelEmits>()

const bodyId = nextUid('kf-thinking-panel')
const expanded = ref(props.defaultOpen || props.streaming)
const disabled = computed(() => props.streaming && !props.content)

// 开始流式时自动展开，结束流式后不强行收起（避免用户正在读时内容突然消失）
watch(
  () => props.streaming,
  (isStreaming) => {
    if (isStreaming) expanded.value = true
  },
)

function toggle(): void {
  if (disabled.value) return
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}

// 非折叠模式始终展开，避免 defaultOpen=false 时内容被 v-show 隐藏
watch(
  () => props.collapsible,
  (canCollapse) => {
    if (!canCollapse) expanded.value = true
  },
  { immediate: true },
)
</script>

<style scoped>
.kf-thinking-panel {
  box-sizing: border-box;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-family: var(--kf-font-sans);
  overflow: hidden;
}
.kf-thinking-panel__head {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 6px var(--kf-space-3);
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  text-align: left;
}
button.kf-thinking-panel__head {
  cursor: pointer;
}
button.kf-thinking-panel__head:hover:not(:disabled) {
  color: var(--kf-foreground);
}
button.kf-thinking-panel__head:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(var(--kf-focus-ring-offset) * -1);
}
button.kf-thinking-panel__head:disabled {
  cursor: default;
  opacity: 0.7;
}
.kf-thinking-panel__icon {
  flex: none;
  color: var(--kf-primary);
}
.kf-thinking-panel__title {
  font-weight: var(--kf-fw-label);
  color: var(--kf-foreground);
}
.kf-thinking-panel__meta {
  margin-left: auto;
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.kf-thinking-panel__chevron {
  flex: none;
  margin-left: auto;
}
.kf-thinking-panel__meta + .kf-thinking-panel__chevron {
  margin-left: 0;
}
.kf-thinking-panel__live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  font-size: var(--kf-fs-xs);
  color: var(--kf-primary);
}
.kf-thinking-panel__dot {
  width: 5px;
  height: 5px;
  border-radius: var(--kf-radius-full);
  background: currentColor;
  animation: kf-thinking-pulse 1.2s ease-in-out infinite;
}
.kf-thinking-panel__body {
  padding: 0 var(--kf-space-3) var(--kf-space-3);
  border-top: 1px solid var(--kf-border);
  padding-top: var(--kf-space-2);
}
.kf-thinking-panel__text {
  margin: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-body-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.kf-thinking-panel__empty {
  margin: 0;
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
  opacity: 0.75;
}
@keyframes kf-thinking-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-thinking-panel__dot {
    animation: none;
    opacity: 1;
  }
}
</style>
