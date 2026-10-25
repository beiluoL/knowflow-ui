<template>
  <div class="kf-tabs" :class="[`kf-tabs--${variant}`, `kf-tabs--${size}`, { 'kf-tabs--block': block }]">
    <div class="kf-tabs__list" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(item, index) in items"
        :id="tabId(item.id)"
        :key="item.id"
        type="button"
        role="tab"
        class="kf-tabs__tab"
        :class="{ 'kf-tabs__tab--active': item.id === activeId, 'kf-tabs__tab--disabled': item.disabled }"
        :aria-selected="item.id === activeId ? 'true' : 'false'"
        :aria-controls="panelId"
        :disabled="item.disabled"
        :tabindex="item.id === activeId ? 0 : -1"
        @click="select(item)"
        @keydown="onKeydown($event, index)"
      >
        <span class="kf-tabs__label">{{ item.label }}</span>
        <span v-if="item.badge" class="kf-tabs__badge">{{ item.badge }}</span>
      </button>
    </div>
    <div
      :id="panelId"
      class="kf-tabs__panel"
      role="tabpanel"
      :aria-labelledby="activeId ? tabId(activeId) : undefined"
      :tabindex="0"
    >
      <slot :active-id="activeId" :active-item="activeItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfTabs — 标签页。
 *
 * 对应 V5 的 Tabs 条目（原项目只有 ReferenceDemos 的 role=tablist 参考实现）。
 * 交互契约（WAI-ARIA Tabs 模式）：
 *   - tablist / tab / tabpanel 三角色齐备，tab 与 panel 用 aria-controls / aria-labelledby 互相指向；
 *   - 只让激活项进 Tab 序列（roving tabindex），组内用 ← → Home End 移动；
 *   - 禁用项跳过但不隐藏，读屏仍能感知它存在。
 * 组件不持有面板内容：内容由宿主通过默认插槽按 activeId 渲染，避免把业务视图塞进库。
 */
import { computed, useId } from 'vue'
import type { KfTabItem, KfTabsEmits, KfTabsProps } from './types'

const props = withDefaults(defineProps<KfTabsProps>(), {
  modelValue: '',
  variant: 'line',
  size: 'md',
  ariaLabel: '',
  block: false,
})

const emit = defineEmits<KfTabsEmits>()
const uid = useId()
const panelId = computed(() => `kf-tabs-panel-${uid}`)

const firstEnabled = computed(() => props.items.find((item) => !item.disabled)?.id ?? '')
const activeId = computed(() => props.modelValue || firstEnabled.value)
const activeItem = computed(() => props.items.find((item) => item.id === activeId.value))

function tabId(id: string): string {
  return `kf-tabs-tab-${uid}-${id}`
}

function select(item: KfTabItem): void {
  if (item.disabled || item.id === activeId.value) return
  emit('update:modelValue', item.id)
  emit('change', item.id)
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()

  const enabled = props.items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !item.disabled)
  if (!enabled.length) return

  const current = enabled.findIndex(({ i }) => i === index)
  let nextIndex = current
  if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = enabled.length - 1
  else if (event.key === 'ArrowRight') nextIndex = (current + 1 + enabled.length) % enabled.length
  else nextIndex = (current - 1 + enabled.length) % enabled.length

  const next = enabled[nextIndex].item
  emit('update:modelValue', next.id)
  emit('change', next.id)
  const el = document.getElementById(tabId(next.id))
  el?.focus()
}
</script>

<style scoped>
.kf-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-4);
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-tabs__list {
  display: flex;
  align-items: center;
  gap: var(--kf-space-1);
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}
.kf-tabs--line .kf-tabs__list {
  border-bottom: 1px solid var(--kf-border);
  gap: var(--kf-space-4);
}
.kf-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  flex: none;
  padding: 0 var(--kf-space-1);
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-button-line-height);
  cursor: pointer;
  position: relative;
  transition: color var(--kf-motion-fast) ease, background-color var(--kf-motion-fast) ease;
}
.kf-tabs--sm .kf-tabs__tab {
  height: var(--kf-control-height-sm);
  font-size: var(--kf-fs-body-sm);
}
.kf-tabs--md .kf-tabs__tab {
  height: var(--kf-control-height-md);
}
.kf-tabs--line .kf-tabs__tab {
  padding-inline: 0;
}
.kf-tabs--line .kf-tabs__tab--active {
  color: var(--kf-primary);
}
.kf-tabs--line .kf-tabs__tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-primary);
}
.kf-tabs--segmented .kf-tabs__list {
  padding: 2px;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
}
.kf-tabs--segmented .kf-tabs__tab {
  padding-inline: var(--kf-space-3);
  border-radius: var(--kf-radius-xs);
}
.kf-tabs--segmented .kf-tabs__tab--active {
  background: var(--kf-card);
  color: var(--kf-foreground);
  box-shadow: var(--kf-shadow-card);
}
.kf-tabs--block .kf-tabs__tab {
  flex: 1;
  justify-content: center;
}
.kf-tabs__tab:hover:not(.kf-tabs__tab--active, .kf-tabs__tab--disabled) {
  color: var(--kf-foreground);
}
.kf-tabs__tab:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
  border-radius: var(--kf-radius-xs);
}
.kf-tabs__tab--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-tabs__badge {
  padding: 0 6px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
  line-height: 1.6;
}
.kf-tabs__tab--active .kf-tabs__badge {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-tabs__panel {
  min-width: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
}
.kf-tabs__panel:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
  border-radius: var(--kf-radius-xs);
}
@media (prefers-reduced-motion: reduce) {
  .kf-tabs__tab {
    transition: none;
  }
}
</style>
