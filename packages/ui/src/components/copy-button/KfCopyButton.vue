<template>
  <button
    type="button"
    class="kf-copy-button"
    :class="[`kf-copy-button--${variant}`, `kf-copy-button--${size}`, `kf-copy-button--${state}`]"
    :disabled="disabled"
    :aria-label="ariaLabel || undefined"
    :aria-live="'polite'"
    @click="copy"
  >
    <KfIcon :name="iconName" :size="size === 'lg' ? 18 : 16" class="kf-copy-button__icon" />
    <span class="kf-copy-button__label">
      <slot>{{ stateText }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * KfCopyButton — 复制按钮。
 *
 * 对应 V5 的 CopyButton 条目（原项目只有 Demo）。
 * 三条硬要求：
 *   1. 剪贴板 API 不可用（非 HTTPS、旧浏览器、权限被拒）时必须**显式失败**，
 *      不能静默什么都不发生 —— 通过 failed 态 + emit('error') 暴露；
 *   2. execCommand 只作为回退路径，且用的是离屏 textarea（会立即移除）；
 *   3. 成功态计时器在卸载时清理，避免 v-if 销毁后仍 setTimeout 改已卸载的状态。
 *
 * 组件不读取任何全局 toast：提示由宿主根据 copy / error 事件决定。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfCopyButtonEmits, KfCopyButtonProps } from './types'

const props = withDefaults(defineProps<KfCopyButtonProps>(), {
  label: '复制',
  copiedLabel: '已复制',
  failedLabel: '复制失败',
  size: 'sm',
  variant: 'secondary',
  disabled: false,
  timeout: 1600,
  ariaLabel: '',
})

const emit = defineEmits<KfCopyButtonEmits>()

type State = 'idle' | 'copied' | 'failed'
const state = ref<State>('idle')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const stateText = computed(() => {
  if (state.value === 'copied') return props.copiedLabel
  if (state.value === 'failed') return props.failedLabel
  return props.label
})

const iconName = computed(() => {
  if (state.value === 'copied') return 'check'
  if (state.value === 'failed') return 'alert-circle'
  return 'copy'
})

function scheduleReset(): void {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    state.value = 'idle'
    resetTimer = undefined
  }, props.timeout)
}

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  // 回退：旧浏览器 / 非安全上下文没有 clipboard API
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.appendChild(area)
  try {
    area.select()
    const ok = document.execCommand('copy')
    if (!ok) throw new Error('execCommand 返回 false')
  } finally {
    document.body.removeChild(area)
  }
}

async function copy(): Promise<void> {
  if (props.disabled) return
  try {
    await writeClipboard(props.text)
    state.value = 'copied'
    emit('copy', props.text)
  } catch (error) {
    state.value = 'failed'
    emit('error', error instanceof Error ? error.message : String(error))
  } finally {
    scheduleReset()
  }
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<style scoped>
.kf-copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--kf-button-gap);
  box-sizing: border-box;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-button-radius);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-weight: var(--kf-fw-label);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease, border-color var(--kf-motion-fast) ease,
    color var(--kf-motion-fast) ease;
}
.kf-copy-button--sm {
  height: var(--kf-button-height-sm);
  padding: 0 var(--kf-button-padding-sm);
  font-size: var(--kf-fs-body-sm);
}
.kf-copy-button--md {
  height: var(--kf-button-height-md);
  padding: 0 var(--kf-button-padding-md);
  font-size: var(--kf-button-font-md);
}
.kf-copy-button--lg {
  height: var(--kf-button-height-lg);
  padding: 0 var(--kf-button-padding-lg);
  font-size: var(--kf-button-font-lg);
}
.kf-copy-button--primary {
  border-color: transparent;
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-copy-button--ghost,
.kf-copy-button--text {
  border-color: transparent;
  background: transparent;
}
.kf-copy-button:hover:not(:disabled) {
  background: var(--kf-muted);
}
.kf-copy-button--primary:hover:not(:disabled) {
  background: var(--kf-primary-hover);
}
.kf-copy-button__icon,
.kf-copy-button__label {
  flex: none;
}
.kf-copy-button--copied {
  border-color: color-mix(in srgb, var(--kf-success) 40%, transparent);
  color: var(--kf-success);
}
.kf-copy-button--failed {
  border-color: color-mix(in srgb, var(--kf-danger) 40%, transparent);
  color: var(--kf-danger);
}
.kf-copy-button:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-copy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .kf-copy-button {
    transition: none;
  }
}
</style>
