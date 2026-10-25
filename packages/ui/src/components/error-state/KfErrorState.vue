<template>
  <div class="kf-error-state" role="alert" aria-live="assertive">
    <span class="kf-error-state__icon" aria-hidden="true">
      <KfIcon :name="icon" :size="32" />
    </span>
    <h3 class="kf-error-state__title">{{ title }}</h3>
    <div class="kf-error-state__description">
      <slot>{{ description }}</slot>
    </div>
    <p v-if="scope" class="kf-error-state__scope">
      <KfIcon name="info" :size="13" aria-hidden="true" />
      <span>{{ scope }}</span>
    </p>
    <p v-if="hint" class="kf-error-state__hint">{{ hint }}</p>
    <div v-if="$slots.action || showRetry" class="kf-error-state__action">
      <slot name="action">
        <button v-if="showRetry" type="button" class="kf-error-state__retry" @click="emit('retry')">
          <KfIcon name="refresh-cw" :size="14" aria-hidden="true" />
          <span>{{ retryText }}</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfErrorState — 错误状态。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/ErrorState.vue。
 * 三问契约不变：① 发生了什么 ② 是否影响当前页面 ③ 怎么解决。
 * 注意：组件只负责展示，不读取任何错误对象 —— 「把 err.message / status code 渲染给用户」
 * 属于宿主责任，库不应该替宿主决定文案。
 */
import KfIcon from '../icon/KfIcon.vue'
import type { KfErrorStateEmits, KfErrorStateProps } from './types'

withDefaults(defineProps<KfErrorStateProps>(), {
  icon: 'alert-circle',
  title: '加载失败',
  description: '请稍后重试，或检查网络后再次尝试',
  scope: '',
  hint: '',
  showRetry: true,
  retryText: '重试',
})

const emit = defineEmits<KfErrorStateEmits>()
</script>

<style scoped>
.kf-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--kf-space-8) var(--kf-space-4);
  text-align: center;
  font-family: var(--kf-font-sans);
}
.kf-error-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--kf-space-4);
  border-radius: var(--kf-radius-full);
  background: var(--kf-danger-surface);
  color: var(--kf-danger);
}
.kf-error-state__title {
  margin: 0 0 var(--kf-space-2);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-lg);
  font-weight: var(--kf-fw-h1);
  line-height: var(--kf-lh-body-lg);
}
.kf-error-state__description {
  max-width: 360px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
}
.kf-error-state__scope {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 360px;
  margin: 10px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
  text-align: left;
}
.kf-error-state__hint {
  max-width: 360px;
  margin: 6px 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
  text-align: left;
}
.kf-error-state__action {
  margin-top: var(--kf-space-6);
}
.kf-error-state__retry {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  height: var(--kf-control-height-sm);
  padding: 0 var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease;
}
.kf-error-state__retry:hover {
  background: var(--kf-muted);
}
.kf-error-state__retry:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
@media (prefers-reduced-motion: reduce) {
  .kf-error-state__retry {
    transition: none;
  }
}
</style>
