<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menu"
      class="kf-context-menu"
      role="menu"
      tabindex="-1"
      :aria-label="label"
      :style="{ left: `${left}px`, top: `${top}px` }"
      @keydown="onKey"
      @contextmenu.prevent
    >
      <template v-for="item in items" :key="item.key">
        <div v-if="item.separator" class="kf-context-menu__separator" role="separator" />
        <button
          v-else
          type="button"
          class="kf-context-menu__item"
          :class="{ 'kf-context-menu__item--danger': item.danger, 'kf-context-menu__item--selected': item.selected }"
          :role="item.selected === undefined ? 'menuitem' : 'menuitemcheckbox'"
          :aria-checked="item.selected === undefined ? undefined : item.selected ? 'true' : 'false'"
          :disabled="item.disabled"
          @click="select(item)"
        >
          <KfIcon v-if="item.iconName" :name="item.iconName" :size="15" class="kf-context-menu__icon" />
          <span class="kf-context-menu__label">{{ item.label }}</span>
          <KfIcon
            v-if="item.selected"
            name="check"
            :size="15"
            class="kf-context-menu__mark"
            aria-hidden="true"
          />
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * KfContextMenu — 右键 / 上下文菜单（对应 V5 的 Dropdown / ContextMenu 条目）。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/ContextMenu.vue。
 * 解耦：去掉 `@/` 别名与 Icon 全局组件，`onSelect` 回调从 item 上移除 ——
 * 独立库不应该持有宿主的闭包（会破坏序列化与测试可预期性），改为 emit('select', key)。
 *
 * 保留的边界处理：视口夹取、ResizeObserver 重新定位、滚动/缩放关闭、
 * 点击外部关闭、方向键/Home/End 巡航、Escape 关闭并归还焦点。
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfContextMenuEmits, KfContextMenuItem, KfContextMenuProps } from './types'

const props = withDefaults(defineProps<KfContextMenuProps>(), {
  label: '上下文菜单',
  restoreFocusTo: null,
})

const emit = defineEmits<KfContextMenuEmits>()

const menu = ref<HTMLElement | null>(null)
const left = ref(0)
const top = ref(0)
let generation = 0
let observer: ResizeObserver | undefined

function buttons(): HTMLButtonElement[] {
  return Array.from(menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
}

function position(): void {
  const el = menu.value
  if (!props.open || !el) return
  const rect = el.getBoundingClientRect()
  const gap = 8
  left.value = Math.max(gap, Math.min(props.x, window.innerWidth - rect.width - gap))
  top.value = Math.max(gap, Math.min(props.y, window.innerHeight - rect.height - gap))
}

function close(restoreFocus = false): void {
  if (!props.open) return
  emit('close')
  if (restoreFocus) props.restoreFocusTo?.focus()
}

function select(item: KfContextMenuItem): void {
  if (item.disabled) return
  emit('select', item.key)
  close(true)
}

function onKey(event: KeyboardEvent): void {
  const list = buttons()
  const index = list.indexOf(document.activeElement as HTMLButtonElement)
  if (event.key === 'Escape' || event.key === 'Tab') {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
    }
    close(true)
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !list.length) return
  event.preventDefault()
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
  list[next]?.focus()
}

function outside(event: Event): void {
  if (menu.value?.contains(event.target as Node)) return
  // 点到可聚焦控件时把焦点留在那里，不要强行抢回触发器
  const target =
    event.target instanceof Element
      ? event.target.closest('button,a,input,textarea,select,[tabindex]')
      : null
  close(!target)
}

function onResize(): void {
  close()
}

function onScroll(event: Event): void {
  if (!menu.value?.contains(event.target as Node)) close()
}

function cleanup(): void {
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll, true)
  observer?.disconnect()
  observer = undefined
}

async function activate(): Promise<void> {
  const current = ++generation
  cleanup()
  if (!props.open) return
  left.value = props.x
  top.value = props.y
  await nextTick()
  if (current !== generation || !props.open || !menu.value) return
  position()
  await nextTick()
  if (current !== generation || !props.open || !menu.value) return
  ;(buttons()[0] ?? menu.value)?.focus({ preventScroll: true })
  document.addEventListener('pointerdown', outside)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, true)
  if (typeof ResizeObserver !== 'undefined' && menu.value) {
    observer = new ResizeObserver(position)
    observer.observe(menu.value)
  }
}

watch(() => [props.open, props.x, props.y] as const, activate, { flush: 'sync' })
onMounted(activate)
onUnmounted(() => {
  generation++
  cleanup()
})
</script>

<style scoped>
.kf-context-menu {
  position: fixed;
  z-index: var(--kf-z-overlay);
  box-sizing: border-box;
  min-width: 200px;
  max-width: calc(100vw - var(--kf-space-4));
  max-height: calc(100dvh - var(--kf-space-4));
  overflow: auto;
  padding: var(--kf-space-1);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-menu-radius);
  background: var(--kf-menu-surface);
  color: var(--kf-foreground);
  box-shadow: var(--kf-menu-shadow);
  font-family: var(--kf-font-sans);
  outline: 0;
}
.kf-context-menu__item {
  display: flex;
  align-items: center;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  height: var(--kf-control-height-sm);
  padding: 0 var(--kf-space-2);
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  text-align: left;
  cursor: pointer;
}
.kf-context-menu__item:hover:not(:disabled) {
  background: var(--kf-muted);
}
.kf-context-menu__item:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(-1 * var(--kf-focus-ring-width));
}
.kf-context-menu__item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-context-menu__item--danger {
  color: var(--kf-danger);
}
.kf-context-menu__item--selected {
  color: var(--kf-primary);
}
.kf-context-menu__icon {
  flex: none;
}
.kf-context-menu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-context-menu__mark {
  flex: none;
}
.kf-context-menu__separator {
  height: 1px;
  margin: var(--kf-space-1) 0;
  background: var(--kf-border);
}
</style>
