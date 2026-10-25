<template>
  <div class="kf-accordion-item" :class="{ 'kf-accordion-item--open': isOpen, 'kf-accordion-item--disabled': disabled }">
    <h3 class="kf-accordion-item__heading">
      <button
        :id="triggerId"
        type="button"
        class="kf-accordion-item__trigger"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="onToggle"
      >
        <span class="kf-accordion-item__title">
          <slot name="title">{{ title }}</slot>
        </span>
        <KfIcon
          name="chevron-down"
          :size="16"
          class="kf-accordion-item__chevron"
          aria-hidden="true"
        />
      </button>
    </h3>
    <div
      v-show="isOpen"
      :id="panelId"
      class="kf-accordion-item__panel"
      role="region"
      :aria-labelledby="triggerId"
      :inert="isOpen ? undefined : true"
    >
      <div class="kf-accordion-item__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfAccordionItem — 折叠项。
 *
 * 折叠时用 inert 而不是只 display:none 的近似做法：inert 会同时阻止聚焦与读屏访问，
 * 避免「看不见但 Tab 还能进去」的老问题；内容仍保留在 DOM 里，表单状态不会丢。
 */
import { computed, inject, useId } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import { KF_ACCORDION } from './context'
import type { KfAccordionItemProps } from './types'

const props = withDefaults(defineProps<KfAccordionItemProps>(), {
  disabled: false,
})

const uid = useId()
const triggerId = computed(() => `kf-accordion-trigger-${uid}`)
const panelId = computed(() => `kf-accordion-panel-${uid}`)

const context = inject(KF_ACCORDION, null)
const isOpen = computed(() => context?.isOpen(props.name) ?? false)

function onToggle(): void {
  if (props.disabled) return
  context?.toggle(props.name)
}
</script>

<style scoped>
.kf-accordion-item {
  border-bottom: 1px solid var(--kf-border);
  min-width: 0;
}
.kf-accordion-item:last-child {
  border-bottom: 0;
}
.kf-accordion-item__heading {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
.kf-accordion-item__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-3);
  box-sizing: border-box;
  width: 100%;
  min-height: var(--kf-control-height-lg);
  padding: var(--kf-space-3) var(--kf-space-4);
  border: 0;
  background: transparent;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-md);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--kf-motion-fast) ease;
}
.kf-accordion-item__trigger:hover:not(:disabled) {
  background: var(--kf-muted);
}
.kf-accordion-item__trigger:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(-1 * var(--kf-focus-ring-width));
}
.kf-accordion-item__trigger:disabled {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-accordion-item__title {
  min-width: 0;
  overflow-wrap: anywhere;
}
.kf-accordion-item__chevron {
  flex: none;
  color: var(--kf-muted-foreground);
  transition: transform var(--kf-motion-base) ease;
}
.kf-accordion-item--open .kf-accordion-item__chevron {
  transform: rotate(180deg);
}
.kf-accordion-item__panel {
  min-width: 0;
}
.kf-accordion-item__content {
  padding: 0 var(--kf-space-4) var(--kf-space-4);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  line-height: var(--kf-lh-body-sm);
}
@media (prefers-reduced-motion: reduce) {
  .kf-accordion-item__trigger,
  .kf-accordion-item__chevron {
    transition: none;
  }
}
</style>
