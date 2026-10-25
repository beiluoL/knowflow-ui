<template>
  <Teleport to="body">
    <Transition name="kf-drawer">
      <div v-if="open" class="kf-drawer" :class="`kf-drawer--${placement}`">
        <div class="kf-drawer__overlay" @click="onOverlay" />

        <section
          ref="panel"
          class="kf-drawer__panel"
          :style="panelStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel || title || undefined"
          :aria-busy="loading || undefined"
          @keydown="onKeydown"
        >
          <header class="kf-drawer__head">
            <slot name="header">
              <div class="kf-drawer__heading">
                <h2 v-if="title" class="kf-drawer__title">{{ title }}</h2>
                <p v-if="description" class="kf-drawer__desc">{{ description }}</p>
              </div>
            </slot>
            <button
              v-if="!persistent"
              type="button"
              class="kf-drawer__close"
              aria-label="关闭"
              @click="requestClose"
            >
              <KfIcon name="x" :size="16" aria-hidden="true" />
            </button>
          </header>

          <div class="kf-drawer__body">
            <slot />
          </div>

          <footer v-if="showFooter || $slots.footer" class="kf-drawer__foot">
            <slot name="footer">
              <button type="button" class="kf-drawer__btn kf-drawer__btn--ghost" @click="cancel">
                {{ cancelLabel }}
              </button>
              <button type="button" class="kf-drawer__btn kf-drawer__btn--primary" :disabled="loading" @click="confirm">
                {{ loading ? '处理中…' : confirmLabel }}
              </button>
            </slot>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * KfDrawer — 侧边抽屉。
 *
 * 与 KfDialog 共用模态栈（body 滚动锁只加一次），并实现：
 *   - 打开时聚焦面板、Tab 焦点陷阱、关闭后焦点归还触发元素；
 *   - Esc / 遮罩关闭（persistent 可禁用）；
 *   - 首尾 Transition 类名显式放行 BEM 校验。
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import { enterModal, isTopModal, leaveModal } from '../dialog/modal-stack'
import { nextInstanceId } from '../shared/instance'
import type { KfDrawerEmits, KfDrawerProps } from './types'

const props = withDefaults(defineProps<KfDrawerProps>(), {
  open: false,
  title: '',
  description: '',
  placement: 'right',
  width: 420,
  closeOnEsc: true,
  closeOnOverlay: true,
  persistent: false,
  loading: false,
  showFooter: false,
  confirmLabel: '确定',
  cancelLabel: '取消',
  ariaLabel: '',
})

const emit = defineEmits<KfDrawerEmits>()

const instanceId = nextInstanceId()

const panel = ref<HTMLElement | null>(null)
let lastActive: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

function requestClose(): void {
  if (props.persistent || props.loading) return
  emit('update:open', false)
  emit('close')
}

function cancel(): void {
  if (props.loading) return
  emit('cancel')
  emit('update:open', false)
  emit('close')
}

function confirm(): void {
  if (props.loading) return
  emit('confirm')
}

function onOverlay(): void {
  if (!props.closeOnOverlay) return
  requestClose()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (!props.closeOnEsc || !isTopModal(instanceId)) return
    event.stopPropagation()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return

  const nodes = panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE)
  if (!nodes || nodes.length === 0) return
  const list = Array.from(nodes).filter((node) => node.offsetParent !== null || node === document.activeElement)
  if (list.length === 0) return

  const first = list[0]
  const last = list[list.length - 1]
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastActive = document.activeElement as HTMLElement | null
      enterModal(instanceId)
      await nextTick()
      const target = panel.value?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.value
      target?.focus()
    } else {
      leaveModal(instanceId)
      lastActive?.focus?.()
      lastActive = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  leaveModal(instanceId)
})
</script>

<style scoped>
.kf-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--kf-z-overlay);
  display: flex;
}
.kf-drawer--right {
  justify-content: flex-end;
}
.kf-drawer--left {
  justify-content: flex-start;
}
.kf-drawer__overlay {
  position: absolute;
  inset: 0;
  background: var(--kf-overlay);
}
.kf-drawer__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 100%;
  height: 100%;
  background: var(--kf-card);
  box-shadow: var(--kf-shadow-dropdown);
  outline: none;
}
.kf-drawer__head {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  padding: var(--kf-space-4);
  border-bottom: 1px solid var(--kf-border);
}
.kf-drawer__heading {
  flex: 1 1 auto;
  min-width: 0;
}
.kf-drawer__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-h3);
  font-weight: var(--kf-fw-h3);
  line-height: var(--kf-lh-h3);
}
.kf-drawer__desc {
  margin: 4px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  line-height: var(--kf-lh-caption);
}
.kf-drawer__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-drawer__close:hover {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-drawer__close:focus-visible,
.kf-drawer__btn:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-drawer__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--kf-space-4);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
}
.kf-drawer__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--kf-space-2);
  padding: var(--kf-space-3) var(--kf-space-4);
  border-top: 1px solid var(--kf-border);
}
.kf-drawer__btn {
  height: var(--kf-control-height-md);
  padding: 0 var(--kf-space-4);
  border: 1px solid transparent;
  border-radius: var(--kf-radius-sm);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-drawer__btn--primary {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-drawer__btn--primary:hover:not(:disabled) {
  background: var(--kf-primary-hover);
}
.kf-drawer__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.kf-drawer__btn--ghost {
  border-color: var(--kf-border);
  background: var(--kf-card);
  color: var(--kf-foreground);
}
.kf-drawer__btn--ghost:hover {
  background: var(--kf-muted);
}
.kf-drawer-enter-active,
.kf-drawer-leave-active {
  transition: opacity var(--kf-motion-base) ease;
}
.kf-drawer-enter-active .kf-drawer__panel,
.kf-drawer-leave-active .kf-drawer__panel {
  transition: transform var(--kf-motion-base) ease;
}
.kf-drawer-enter-from,
.kf-drawer-leave-to {
  opacity: 0;
}
.kf-drawer--right.kf-drawer-enter-from .kf-drawer__panel,
.kf-drawer--right.kf-drawer-leave-to .kf-drawer__panel {
  transform: translateX(100%);
}
.kf-drawer--left.kf-drawer-enter-from .kf-drawer__panel,
.kf-drawer--left.kf-drawer-leave-to .kf-drawer__panel {
  transform: translateX(-100%);
}
@media (prefers-reduced-motion: reduce) {
  .kf-drawer-enter-active,
  .kf-drawer-leave-active,
  .kf-drawer-enter-active .kf-drawer__panel,
  .kf-drawer-leave-active .kf-drawer__panel {
    transition: none;
  }
}
</style>
