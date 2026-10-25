<template>
  <Teleport to="body">
    <Transition name="kf-dialog" @after-enter="emit('opened')" @after-leave="emit('closed')">
      <div
        v-if="open"
        class="kf-dialog__mask"
        :class="{ 'kf-dialog__mask--right': placement === 'right' }"
        @click.self="onMaskClick"
      >
        <div
          ref="panel"
          class="kf-dialog"
          :class="[
            `kf-dialog--${variant}`,
            `kf-dialog--${placement}`,
            { 'kf-dialog--scrollable': scrollable, 'kf-dialog--confirmation': confirmation },
          ]"
          :style="{ width: resolvedWidth }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="descriptionId"
          :aria-busy="loading || undefined"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <button
            v-if="!persistent"
            type="button"
            class="kf-dialog__close"
            aria-label="关闭"
            :disabled="loading"
            @click="cancel"
          >
            <KfIcon name="x" :size="18" aria-hidden="true" />
          </button>

          <div class="kf-dialog__head">
            <span v-if="resolvedIcon" class="kf-dialog__icon" :class="`kf-dialog__icon--${variant}`">
              <slot name="icon">
                <KfIcon :name="resolvedIcon" :size="confirmation ? 22 : 20" aria-hidden="true" />
              </slot>
            </span>
            <div class="kf-dialog__heading">
              <h2 :id="titleId" class="kf-dialog__title">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" class="kf-dialog__description">{{ description }}</p>
            </div>
          </div>

          <div class="kf-dialog__body">
            <p v-if="message" class="kf-dialog__message">{{ message }}</p>
            <slot />
            <p v-if="error" class="kf-dialog__error" role="alert">{{ error }}</p>
          </div>

          <div v-if="!hideFooter" class="kf-dialog__foot">
            <slot name="footer">
              <button
                v-if="showCancel"
                type="button"
                class="kf-dialog__button kf-dialog__button--cancel"
                :disabled="loading"
                @click="cancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="kf-dialog__button"
                :class="`kf-dialog__button--${variant === 'default' ? 'confirm' : variant}`"
                :disabled="loading || disabled"
                @click="confirm"
              >
                {{ loading ? '处理中…' : confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * KfDialog — 对话框 / 抽屉。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/AppDialog.vue。
 * 解耦：`@/utils/dialog` 的类型内联到 types.ts，全局 .kb-* 样式改 scoped + --kf-*，
 * modal-stack 一并带过来（多弹窗叠加只锁一次滚动）。
 *
 * 保留的关键行为（这些是「能安全用在生产」的部分，不是装饰）：
 *   - role=dialog + aria-modal + aria-labelledby/aria-describedby；
 *   - 打开时抢焦点、关闭时把焦点还给触发者；
 *   - Tab 在弹窗内循环，Escape 关闭（可由 closeOnEsc 关掉）；
 *   - 遮罩点击 / persistent 语义；
 *   - body 滚动锁在卸载时一定释放（否则页面永久滚不动）。
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import { enterModal, isTopModal, leaveModal } from './modal-stack'
import type { KfDialogEmits, KfDialogProps } from './types'

const props = withDefaults(defineProps<KfDialogProps>(), {
  open: false,
  title: '',
  description: '',
  message: '',
  variant: 'default',
  icon: '',
  confirmText: '确定',
  cancelText: '取消',
  loading: false,
  disabled: false,
  error: '',
  width: 'md',
  closeOnOverlay: true,
  closeOnEsc: true,
  persistent: false,
  showCancel: true,
  hideFooter: false,
  scrollable: false,
  placement: 'center',
  confirmation: false,
})

const emit = defineEmits<KfDialogEmits>()

const uid = useId()
const instanceId = Math.floor(Math.random() * 1e9)
const titleId = computed(() => `kf-dialog-title-${uid}`)
const descriptionId = computed(() => `kf-dialog-desc-${uid}`)

const WIDTHS: Record<string, string> = { sm: '380px', md: '480px', lg: '640px', xl: '800px' }
const resolvedWidth = computed(() =>
  props.placement === 'right' ? (WIDTHS[props.width as string] ?? props.width) : (WIDTHS[props.width as string] ?? props.width),
)

const VARIANT_ICON: Record<string, string> = {
  default: '',
  danger: 'alert-circle',
  warning: 'alert-circle',
  success: 'check-circle',
  info: 'info',
}
const resolvedIcon = computed(() => props.icon || VARIANT_ICON[props.variant] || '')

const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusable(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

async function activate(): Promise<void> {
  if (typeof document === 'undefined') return
  if (props.open) {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    enterModal(instanceId)
    await nextTick()
    const targets = focusable()
    ;(targets[0] ?? panel.value)?.focus({ preventScroll: true })
  } else {
    leaveModal(instanceId)
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true })
    lastFocused = null
  }
}

watch(() => props.open, activate, { immediate: true, flush: 'post' })

onBeforeUnmount(() => {
  leaveModal(instanceId)
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true })
})

function close(): void {
  emit('update:open', false)
  emit('cancel')
}

function cancel(): void {
  if (props.loading) return
  close()
}

function confirm(): void {
  if (props.loading || props.disabled) return
  emit('confirm', true)
}

function onMaskClick(): void {
  if (props.persistent || !props.closeOnOverlay || props.loading) return
  if (!isTopModal(instanceId)) return
  close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (!props.closeOnEsc || props.persistent || props.loading || !isTopModal(instanceId)) return
    event.stopPropagation()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const targets = focusable()
  if (!targets.length) {
    event.preventDefault()
    panel.value?.focus()
    return
  }
  const first = targets[0]
  const last = targets[targets.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<style scoped>
.kf-dialog__mask {
  position: fixed;
  inset: 0;
  z-index: var(--kf-z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--kf-space-4);
  background: var(--kf-overlay);
}
.kf-dialog__mask--right {
  justify-content: flex-end;
  align-items: stretch;
  padding: 0;
}
.kf-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 100%;
  max-height: calc(100dvh - var(--kf-space-8));
  padding: var(--kf-space-6);
  border-radius: var(--kf-radius-lg);
  background: var(--kf-card);
  color: var(--kf-card-foreground);
  box-shadow: var(--kf-shadow-dropdown);
  font-family: var(--kf-font-sans);
  outline: 0;
}
.kf-dialog--right {
  height: 100%;
  max-height: 100dvh;
  border-radius: var(--kf-radius-lg) 0 0 var(--kf-radius-lg);
}
.kf-dialog--scrollable .kf-dialog__body {
  overflow-y: auto;
}
.kf-dialog--confirmation {
  padding: var(--kf-space-6);
}
.kf-dialog__close {
  position: absolute;
  top: var(--kf-space-3);
  right: var(--kf-space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-dialog__close:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-dialog__close:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-dialog__head {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-3);
  padding-right: var(--kf-space-6);
}
.kf-dialog__heading {
  min-width: 0;
}
.kf-dialog__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--kf-radius-full);
}
.kf-dialog__icon--danger {
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-dialog__icon--warning {
  background: var(--kf-warning-surface);
  color: var(--kf-warning-color);
}
.kf-dialog__icon--success {
  background: var(--kf-success-surface);
  color: var(--kf-success);
}
.kf-dialog__icon--info {
  background: var(--kf-info-surface);
  color: var(--kf-info);
}
.kf-dialog__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-h4);
  font-weight: var(--kf-fw-h1);
  line-height: var(--kf-lh-h4);
}
.kf-dialog__description {
  margin: 4px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
}
.kf-dialog__body {
  flex: 1;
  min-height: 0;
  margin-top: var(--kf-space-4);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
}
.kf-dialog__message {
  margin: 0;
  color: var(--kf-muted-foreground);
}
.kf-dialog__error {
  margin: var(--kf-space-3) 0 0;
  color: var(--kf-danger);
  font-size: var(--kf-fs-body-sm);
}
.kf-dialog__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--kf-space-2);
  margin-top: var(--kf-space-6);
}
.kf-dialog__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 76px;
  height: var(--kf-button-height-md);
  padding: 0 var(--kf-button-padding-md);
  border: 1px solid transparent;
  border-radius: var(--kf-button-radius);
  font-family: inherit;
  font-size: var(--kf-button-font-md);
  font-weight: var(--kf-button-font-weight);
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease;
}
.kf-dialog__button:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-dialog__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.kf-dialog__button--cancel {
  border-color: var(--kf-border);
  background: var(--kf-card);
  color: var(--kf-foreground);
}
.kf-dialog__button--cancel:hover:not(:disabled) {
  background: var(--kf-muted);
}
.kf-dialog__button--confirm {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-dialog__button--confirm:hover:not(:disabled) {
  background: var(--kf-primary-hover);
}
.kf-dialog__button--danger {
  background: var(--kf-destructive);
  color: var(--kf-destructive-foreground);
}
.kf-dialog__button--warning {
  background: var(--kf-warning);
  color: var(--kf-warning-foreground);
}
.kf-dialog__button--success {
  background: var(--kf-accent);
  color: var(--kf-accent-foreground);
}
.kf-dialog__button--info {
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}

.kf-dialog-enter-active,
.kf-dialog-leave-active {
  transition: opacity var(--kf-motion-base) ease;
}
.kf-dialog-enter-from,
.kf-dialog-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .kf-dialog-enter-active,
  .kf-dialog-leave-active {
    transition: none;
  }
  .kf-dialog__button {
    transition: none;
  }
}
@media (max-width: 560px) {
  .kf-dialog {
    width: 100% !important;
    max-height: calc(100dvh - var(--kf-space-6));
    padding: var(--kf-space-4);
  }
  .kf-dialog--right {
    border-radius: var(--kf-radius-lg) 0 0 var(--kf-radius-lg);
  }
}
</style>
