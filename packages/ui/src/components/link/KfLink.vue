<template>
  <a
    v-if="href"
    class="kf-link"
    :class="[`kf-link--${tone}`, `kf-link--underline-${underline}`, { 'kf-link--disabled': disabled }]"
    :href="disabled ? undefined : href"
    :target="target || undefined"
    :rel="rel"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    @click="onClick"
  >
    <KfIcon v-if="iconName" :name="iconName" :size="14" class="kf-link__icon" />
    <span class="kf-link__label"><slot /></span>
    <KfIcon v-if="external" name="external-link" :size="13" class="kf-link__external" />
  </a>
  <button
    v-else
    type="button"
    class="kf-link kf-link--button"
    :class="[`kf-link--${tone}`, `kf-link--underline-${underline}`, { 'kf-link--disabled': disabled }]"
    :disabled="disabled"
    @click="onClick"
  >
    <KfIcon v-if="iconName" :name="iconName" :size="14" class="kf-link__icon" />
    <span class="kf-link__label"><slot /></span>
    <KfIcon v-if="external" name="external-link" :size="13" class="kf-link__external" />
  </button>
</template>

<script setup lang="ts">
/**
 * KfLink — 文本链接。
 *
 * 对应 V5 的 Link 条目（原项目无生产组件）。
 * 安全默认：target="_blank" 时强制 rel="noopener noreferrer"，避免 window.opener 被利用；
 * 禁用态用 aria-disabled + tabindex=-1，而不是只把颜色改灰。
 */
import { computed } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfLinkEmits, KfLinkProps } from './types'

const props = withDefaults(defineProps<KfLinkProps>(), {
  href: '',
  target: '_self',
  external: false,
  disabled: false,
  underline: 'hover',
  tone: 'primary',
  iconName: '',
})

const emit = defineEmits<KfLinkEmits>()

const rel = computed(() => {
  if (props.target !== '_blank') return undefined
  return 'noopener noreferrer'
})

function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
.kf-link {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-1);
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--kf-font-sans);
  font-size: inherit;
  line-height: inherit;
  text-decoration: none;
  cursor: pointer;
  border-radius: var(--kf-radius-xs);
  transition: color var(--kf-motion-fast) ease;
}
.kf-link__label {
  min-width: 0;
}
.kf-link__icon,
.kf-link__external {
  flex: none;
  opacity: 0.85;
}
.kf-link--button {
  border: 0;
}
.kf-link--default {
  color: var(--kf-foreground);
}
.kf-link--primary {
  color: var(--kf-primary);
}
.kf-link--muted {
  color: var(--kf-muted-foreground);
}
.kf-link--underline-always .kf-link__label {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.kf-link--underline-hover:hover .kf-link__label {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.kf-link--default:hover,
.kf-link--muted:hover {
  color: var(--kf-foreground);
}
.kf-link--primary:hover {
  color: var(--kf-primary-hover);
}
.kf-link:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-link--disabled,
.kf-link--disabled:hover {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
  opacity: 0.6;
  text-decoration: none;
}
@media (prefers-reduced-motion: reduce) {
  .kf-link {
    transition: none;
  }
}
</style>
