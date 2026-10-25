<template>
  <span
    ref="trigger"
    class="kf-tooltip__trigger"
    :aria-describedby="visible ? tooltipId : undefined"
    @mouseenter="scheduleShow"
    @mouseleave="scheduleHide"
    @focusin="show"
    @focusout="scheduleHide"
    @keydown="onKeydown"
    @pointerdown="hide"
    @touchstart.passive="hide"
  >
    <slot />
  </span>
  <Teleport to="body">
    <div
      v-if="visible"
      :id="tooltipId"
      ref="bubble"
      class="kf-tooltip"
      :class="`kf-tooltip--${resolvedPlacement}`"
      role="tooltip"
      :style="bubbleStyle"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * KfTooltip — 轻量提示气泡。
 *
 * 对应 V5 的 Tooltip 条目（原项目只有 ReferenceDemos 的 span 参考实现）。
 *
 * 为什么自己算位置而不是 CSS-only：CSS-only 方案会被父级 `overflow: hidden` 裁掉，
 * 而应用里的提示大量出现在表格/侧栏/卡片内部。这里 Teleport 到 body + fixed 定位，
 * 并做一次视口翻转与夹取，保证气泡始终可见。
 *
 * 无障碍：气泡只在可见时进入 DOM（读屏不会读到隐藏文案），
 * 触发元素通过 aria-describedby 指向它；Escape 立即关闭。
 * 计时器与 window 监听在隐藏/卸载时全部清理。
 */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import type { KfTooltipPlacement, KfTooltipProps } from './types'

const props = withDefaults(defineProps<KfTooltipProps>(), {
  content: '',
  placement: 'top',
  delay: 120,
  hideDelay: 80,
  disabled: false,
  maxWidth: 280,
  offset: 8,
})

const uid = useId()
const tooltipId = computed(() => `kf-tooltip-${uid}`)

const trigger = ref<HTMLElement | null>(null)
const bubble = ref<HTMLElement | null>(null)
const visible = ref(false)
const coords = ref({ left: 0, top: 0 })
const resolvedPlacement = ref<KfTooltipPlacement>(props.placement)

let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

const bubbleStyle = computed(() => ({
  left: `${coords.value.left}px`,
  top: `${coords.value.top}px`,
  maxWidth: `${props.maxWidth}px`,
}))

function clearTimers(): void {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
  showTimer = undefined
  hideTimer = undefined
}

function scheduleShow(): void {
  if (props.disabled) return
  clearTimers()
  showTimer = setTimeout(show, props.delay)
}

function scheduleHide(): void {
  clearTimers()
  if (!visible.value) return
  hideTimer = setTimeout(hide, props.hideDelay)
}

function show(): void {
  if (props.disabled) return
  clearTimers()
  visible.value = true
  position()
  window.addEventListener('scroll', position, true)
  window.addEventListener('resize', position)
}

function hide(): void {
  clearTimers()
  visible.value = false
  window.removeEventListener('scroll', position, true)
  window.removeEventListener('resize', position)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !visible.value) return
  event.stopPropagation()
  hide()
}

/** 计算 fixed 坐标；越界时翻到对侧，再做视口夹取 */
function position(): void {
  const anchor = trigger.value
  const el = bubble.value
  if (!anchor) return

  const rect = anchor.getBoundingClientRect()
  const gap = props.offset
  const size = el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 0, height: 0 }
  const vw = window.innerWidth
  const vh = window.innerHeight

  let placement = props.placement
  if (placement === 'top' && rect.top - size.height - gap < 0) placement = 'bottom'
  else if (placement === 'bottom' && rect.bottom + size.height + gap > vh) placement = 'top'
  else if (placement === 'left' && rect.left - size.width - gap < 0) placement = 'right'
  else if (placement === 'right' && rect.right + size.width + gap > vw) placement = 'left'

  let left = 0
  let top = 0
  if (placement === 'top' || placement === 'bottom') {
    left = rect.left + rect.width / 2 - size.width / 2
    top = placement === 'top' ? rect.top - size.height - gap : rect.bottom + gap
  } else {
    left = placement === 'left' ? rect.left - size.width - gap : rect.right + gap
    top = rect.top + rect.height / 2 - size.height / 2
  }

  resolvedPlacement.value = placement
  coords.value = {
    left: Math.max(gap, Math.min(left, vw - size.width - gap)),
    top: Math.max(gap, Math.min(top, vh - size.height - gap)),
  }
}

onBeforeUnmount(() => {
  // 卸载时必须清计时器与全局监听：否则组件被 v-if 销毁后仍会把 window 监听留在页面上
  clearTimers()
  window.removeEventListener('scroll', position, true)
  window.removeEventListener('resize', position)
})
</script>

<style scoped>
.kf-tooltip__trigger {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
.kf-tooltip {
  position: fixed;
  z-index: var(--kf-z-toast);
  box-sizing: border-box;
  padding: 6px var(--kf-space-2);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-tooltip-surface);
  color: var(--kf-tooltip-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
  font-weight: 400;
  text-align: left;
  overflow-wrap: break-word;
  box-shadow: var(--kf-shadow-dropdown);
  pointer-events: none;
}
@media (forced-colors: active) {
  .kf-tooltip {
    border: 1px solid CanvasText;
  }
}
</style>
