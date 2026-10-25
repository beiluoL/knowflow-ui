<template>
  <Teleport to="body">
    <div
      class="kf-toast"
      :class="`kf-toast--${placement}`"
      :style="{ maxWidth: `${maxWidth}px` }"
      role="region"
      aria-label="通知"
    >
      <TransitionGroup name="kf-toast">
        <div
          v-for="item in items"
          :key="item.id"
          class="kf-toast__item"
          :class="`kf-toast__item--${item.type || 'info'}`"
          role="status"
          :aria-live="item.type === 'error' ? 'assertive' : 'polite'"
        >
          <KfIcon :name="ICONS[item.type || 'info']" :size="18" class="kf-toast__icon" aria-hidden="true" />
          <div class="kf-toast__body">
            <p v-if="item.title" class="kf-toast__title">{{ item.title }}</p>
            <slot :item="item">
              <p class="kf-toast__message">{{ item.message }}</p>
            </slot>
          </div>
          <button
            type="button"
            class="kf-toast__close"
            aria-label="关闭提示"
            @click="emit('dismiss', item.id)"
          >
            <KfIcon name="x" :size="14" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * KfToast — 通知宿主。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/ToastHost.vue，但**去掉了全局单例**：
 * 原实现直接读 `@/utils/toast` 的模块级状态，独立库不能持有宿主的运行时单例
 * （会成为隐式全局，破坏多实例与测试隔离）。这里改为 props 驱动 + dismiss 事件，
 * 由可选的 `useToast()` 组合式函数提供开箱即用的本地状态。
 *
 * 自动关闭的计时器由 useToast 管理，组件本身无副作用，渲染即可预测。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfToastEmits, KfToastProps, KfToastType } from './types'

const ICONS: Record<KfToastType, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-circle',
  error: 'x-circle',
}

withDefaults(defineProps<KfToastProps>(), {
  placement: 'top-right',
  maxWidth: 360,
})

const emit = defineEmits<KfToastEmits>()
</script>

<style scoped>
.kf-toast {
  position: fixed;
  z-index: var(--kf-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  width: 100%;
  pointer-events: none;
  font-family: var(--kf-font-sans);
}
.kf-toast--top-right {
  top: var(--kf-space-4);
  right: var(--kf-space-4);
  align-items: flex-end;
}
.kf-toast--top-center {
  top: var(--kf-space-4);
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}
.kf-toast--bottom-right {
  bottom: var(--kf-space-4);
  right: var(--kf-space-4);
  align-items: flex-end;
}
.kf-toast--bottom-center {
  bottom: var(--kf-space-4);
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}
.kf-toast__item {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-3);
  box-sizing: border-box;
  width: 100%;
  padding: 10px var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-left-width: 3px;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  box-shadow: var(--kf-shadow-dropdown);
  pointer-events: auto;
}
.kf-toast__item--info {
  border-left-color: var(--kf-info);
}
.kf-toast__item--success {
  border-left-color: var(--kf-success);
}
.kf-toast__item--warning {
  border-left-color: var(--kf-warning-color);
}
.kf-toast__item--error {
  border-left-color: var(--kf-danger);
}
.kf-toast__icon {
  flex: none;
  margin-top: 1px;
}
.kf-toast__item--info .kf-toast__icon {
  color: var(--kf-info);
}
.kf-toast__item--success .kf-toast__icon {
  color: var(--kf-success);
}
.kf-toast__item--warning .kf-toast__icon {
  color: var(--kf-warning-color);
}
.kf-toast__item--error .kf-toast__icon {
  color: var(--kf-danger);
}
.kf-toast__body {
  flex: 1;
  min-width: 0;
}
.kf-toast__title {
  margin: 0 0 2px;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-md);
}
.kf-toast__message {
  margin: 0;
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
  overflow-wrap: anywhere;
}
.kf-toast__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-toast__close:hover {
  color: var(--kf-foreground);
}
.kf-toast__close:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}

.kf-toast-enter-active,
.kf-toast-leave-active {
  transition: opacity var(--kf-motion-base) ease, transform var(--kf-motion-base) ease;
}
.kf-toast-enter-from,
.kf-toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (prefers-reduced-motion: reduce) {
  .kf-toast-enter-active,
  .kf-toast-leave-active {
    transition: none;
  }
}
</style>
