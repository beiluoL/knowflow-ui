<template>
  <span ref="anchor" class="kf-popover">
    <span class="kf-popover__trigger" @click="toggle">
      <slot name="trigger" :open="isOpen" :toggle="toggle">
        <button type="button" class="kf-popover__default-trigger" :disabled="disabled" :aria-expanded="isOpen">
          打开
        </button>
      </slot>
    </span>

    <Teleport to="body">
      <Transition name="kf-popover">
        <div
          v-if="isOpen"
          ref="panel"
          class="kf-popover__panel"
          :class="`kf-popover__panel--${resolvedPlacement}`"
          :style="panelStyle"
          role="dialog"
          :aria-label="ariaLabel || undefined"
          @keydown="onKeydown"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
/**
 * KfPopover — 通用浮层（点击触发、外部点击/Esc 关闭、视口翻转）。
 *
 * 与 KfTooltip 的分工：Tooltip 是纯展示的提示，不可交互；Popover 可以放表单与按钮，
 * 因此用 role=dialog 而不是 aria-describedby，并在 Esc 关闭时把焦点还给触发元素。
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { KfPopoverEmits, KfPopoverPlacement, KfPopoverProps } from './types'

const props = withDefaults(defineProps<KfPopoverProps>(), {
  open: undefined,
  placement: 'bottom',
  offset: 6,
  matchWidth: false,
  closeOnOutside: true,
  closeOnEsc: true,
  disabled: false,
  ariaLabel: '',
})

const emit = defineEmits<KfPopoverEmits>()

const anchor = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const coords = ref({ left: 0, top: 0, width: 0 })
const resolvedPlacement = ref<KfPopoverPlacement>(props.placement)

const innerOpen = ref(false)
const controlled = computed(() => props.open !== undefined)
const isOpen = computed(() => (controlled.value ? Boolean(props.open) : innerOpen.value))

const panelStyle = computed(() => ({
  left: `${coords.value.left}px`,
  top: `${coords.value.top}px`,
  minWidth: props.matchWidth ? `${coords.value.width}px` : undefined,
}))

function place(): void {
  const el = anchor.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  coords.value = { left: rect.left, top: rect.top, width: rect.width }
  if (!panel.value) return

  const panelRect = panel.value.getBoundingClientRect()
  const gap = props.offset
  let placement = props.placement

  // 视口翻转：下方放不下且上方空间更大时上翻，左右同理
  if (placement === 'bottom' && rect.bottom + gap + panelRect.height > window.innerHeight && rect.top > panelRect.height + gap) {
    placement = 'top'
  } else if (placement === 'top' && rect.top - gap - panelRect.height < 0 && rect.bottom + panelRect.height + gap < window.innerHeight) {
    placement = 'bottom'
  } else if (placement === 'right' && rect.right + gap + panelRect.width > window.innerWidth) {
    placement = 'left'
  } else if (placement === 'left' && rect.left - gap - panelRect.width < 0) {
    placement = 'right'
  }
  resolvedPlacement.value = placement

  let left = rect.left
  let top = rect.top
  if (placement === 'bottom') top = rect.bottom + gap
  else if (placement === 'top') top = rect.top - gap - panelRect.height
  else if (placement === 'right') left = rect.right + gap
  else left = rect.left - gap - panelRect.width

  coords.value = {
    left: Math.min(Math.max(8, left), Math.max(8, window.innerWidth - panelRect.width - 8)),
    top: Math.min(Math.max(8, top), Math.max(8, window.innerHeight - panelRect.height - 8)),
    width: rect.width,
  }
}

function setOpen(next: boolean): void {
  if (props.disabled) return
  if (!controlled.value) innerOpen.value = next
  emit('update:open', next)
  if (next) emit('open')
  else emit('close')
}

function toggle(): void {
  setOpen(!isOpen.value)
}

function onDocumentPointerDown(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!target) return
  if (panel.value?.contains(target) || anchor.value?.contains(target)) return
  if (!props.closeOnOutside) return
  setOpen(false)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !props.closeOnEsc) return
  event.stopPropagation()
  setOpen(false)
  anchor.value?.querySelector<HTMLElement>('button, [tabindex]')?.focus()
}

function bind(): void {
  document.addEventListener('mousedown', onDocumentPointerDown, true)
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)
}

function unbind(): void {
  document.removeEventListener('mousedown', onDocumentPointerDown, true)
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
}

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    place()
    bind()
    await nextTick()
    place()
    panel.value?.querySelector<HTMLElement>('button, input, [tabindex], a[href]')?.focus()
  } else {
    unbind()
  }
})

watch(
  () => props.placement,
  (placement) => {
    resolvedPlacement.value = placement
    if (isOpen.value) place()
  },
)

onBeforeUnmount(unbind)

defineExpose({ toggle, place })
</script>

<style scoped>
.kf-popover {
  display: inline-flex;
  min-width: 0;
}
.kf-popover__trigger {
  display: inline-flex;
  min-width: 0;
}
.kf-popover__default-trigger {
  height: var(--kf-control-height-md);
  padding: 0 var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-sm);
  cursor: pointer;
}
.kf-popover__panel {
  position: fixed;
  z-index: var(--kf-z-overlay);
  box-sizing: border-box;
  max-width: min(360px, calc(100vw - 16px));
  padding: var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-menu-radius);
  background: var(--kf-menu-surface);
  box-shadow: var(--kf-menu-shadow);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-sm);
  outline: none;
}
.kf-popover-enter-active,
.kf-popover-leave-active {
  transition: opacity var(--kf-motion-fast) ease, transform var(--kf-motion-fast) ease;
}
.kf-popover-enter-from,
.kf-popover-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .kf-popover-enter-active,
  .kf-popover-leave-active {
    transition: none;
  }
}
</style>
