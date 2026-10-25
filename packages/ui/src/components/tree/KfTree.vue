<template>
  <div class="kf-tree" :class="{ 'kf-tree--lines': showLines }">
    <div
      v-if="visible.length === 0"
      class="kf-tree__empty"
      role="status"
    >
      <slot name="empty">{{ emptyText }}</slot>
    </div>

    <ul
      v-else
      class="kf-tree__list"
      role="tree"
      :aria-label="ariaLabel"
      @keydown="onKeydown"
    >
      <li
        v-for="(item, index) in visible"
        :key="item.node.id"
        :ref="(el) => setItem(el, index)"
        class="kf-tree__item"
        :class="{
          'kf-tree__item--selected': item.node.id === selectedId,
          'kf-tree__item--disabled': item.node.disabled,
        }"
        role="treeitem"
        :aria-level="item.depth + 1"
        :aria-expanded="item.hasChildren ? item.expanded : undefined"
        :aria-selected="item.node.id === selectedId"
        :aria-disabled="item.node.disabled || undefined"
        :tabindex="index === focusIndex ? 0 : -1"
        :style="{ paddingLeft: `${item.depth * 16 + 6}px` }"
        @click="activate(item)"
        @focus="focusIndex = index"
      >
        <span
          class="kf-tree__toggle"
          :class="{ 'kf-tree__toggle--hidden': !item.hasChildren }"
          aria-hidden="true"
          @click.stop="item.hasChildren && toggle(item.node.id)"
        >
          <KfIcon :name="item.expanded ? 'chevron-down' : 'chevron-right'" :size="12" />
        </span>

        <KfIcon
          v-if="item.node.iconName"
          :name="item.node.iconName"
          :size="13"
          class="kf-tree__icon"
          aria-hidden="true"
        />

        <span class="kf-tree__label">
          <slot
            name="node"
            :node="item.node"
            :depth="item.depth"
            :expanded="item.expanded"
            :selected="item.node.id === selectedId"
          >
            {{ item.node.label }}
          </slot>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * KfTree — 树形导航。
 *
 * 结构：把树拍平成「可见节点列表」再渲染，避免了递归组件的复杂度，
 * 也让键盘漫游（roving tabindex）只需操作一个下标。
 *
 * 键盘遵循 WAI-ARIA tree 约定：
 *   ↑/↓ 移动、→ 展开或进入子节点、← 收起或回到父节点、Home/End 首尾、Enter/Space 选中。
 * 组件不加载异步子节点、不做多选与拖拽。
 */
import { computed, ref, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfTreeEmits, KfTreeNode, KfTreeProps } from './types'

interface FlatNode {
  node: KfTreeNode
  depth: number
  parentId: string | null
  hasChildren: boolean
  expanded: boolean
}

const props = withDefaults(defineProps<KfTreeProps>(), {
  nodes: () => [],
  expandedIds: undefined,
  selectedId: '',
  defaultExpandLevel: 1,
  ariaLabel: '树形导航',
  emptyText: '暂无节点',
  showLines: false,
})

const emit = defineEmits<KfTreeEmits>()

const items = ref<(HTMLElement | null)[]>([])
const focusIndex = ref(0)

function collect(list: KfTreeNode[], depth: number, expanded: Set<string>, out: FlatNode[], parentId: string | null): void {
  for (const node of list) {
    const hasChildren = Boolean(node.children && node.children.length > 0)
    const isExpanded = expanded.has(node.id)
    out.push({ node, depth, parentId, hasChildren, expanded: isExpanded })
    if (hasChildren && isExpanded) collect(node.children as KfTreeNode[], depth + 1, expanded, out, node.id)
  }
}

function initialExpanded(): string[] {
  if (props.expandedIds !== undefined) return [...props.expandedIds]
  if (props.defaultExpandLevel < 0) {
    const ids: string[] = []
    const walk = (list: KfTreeNode[]): void => {
      for (const node of list) {
        if (node.children?.length) {
          ids.push(node.id)
          walk(node.children)
        }
      }
    }
    walk(props.nodes)
    return ids
  }
  if (props.defaultExpandLevel === 0) return []
  const ids: string[] = []
  const walk = (list: KfTreeNode[], level: number): void => {
    if (level >= props.defaultExpandLevel) return
    for (const node of list) {
      if (node.children?.length) {
        ids.push(node.id)
        walk(node.children, level + 1)
      }
    }
  }
  walk(props.nodes, 0)
  return ids
}

const innerExpanded = ref<string[]>(initialExpanded())
const controlledExpanded = computed(() => props.expandedIds !== undefined)
const expandedSet = computed(() => new Set(controlledExpanded.value ? props.expandedIds : innerExpanded.value))

const visible = computed<FlatNode[]>(() => {
  const out: FlatNode[] = []
  collect(props.nodes, 0, expandedSet.value, out, null)
  return out
})

watch(
  () => props.nodes,
  () => {
    if (!controlledExpanded.value) innerExpanded.value = initialExpanded()
    focusIndex.value = 0
  },
)

function setItem(el: unknown, index: number): void {
  items.value[index] = (el as HTMLElement | null) ?? null
}

function isExpanded(id: string): boolean {
  return expandedSet.value.has(id)
}

function toggle(id: string): void {
  const wasExpanded = isExpanded(id)
  const next = wasExpanded
    ? (controlledExpanded.value ? props.expandedIds ?? [] : innerExpanded.value).filter((item) => item !== id)
    : [...Array.from(expandedSet.value), id]
  if (!controlledExpanded.value) innerExpanded.value = next
  emit('update:expandedIds', next)
  // 注意：emit 的第二个参数是「变化后」的状态，必须在更新前先取旧值
  emit('toggle', id, !wasExpanded)
}

function select(node: KfTreeNode): void {
  if (node.disabled) return
  emit('update:selectedId', node.id)
  emit('select', node)
}

function activate(item: FlatNode): void {
  if (item.node.disabled) return
  select(item.node)
  focusIndex.value = visible.value.findIndex((entry) => entry.node.id === item.node.id)
}

function focusAt(index: number): void {
  const total = visible.value.length
  if (total === 0) return
  const next = Math.min(Math.max(0, index), total - 1)
  focusIndex.value = next
  items.value[next]?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  const current = visible.value[focusIndex.value]
  if (!current) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusAt(focusIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusAt(focusIndex.value - 1)
      break
    case 'Home':
      event.preventDefault()
      focusAt(0)
      break
    case 'End':
      event.preventDefault()
      focusAt(visible.value.length - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      if (current.hasChildren && !current.expanded) toggle(current.node.id)
      else if (current.hasChildren) focusAt(focusIndex.value + 1)
      break
    case 'ArrowLeft': {
      event.preventDefault()
      if (current.hasChildren && current.expanded) {
        toggle(current.node.id)
        break
      }
      const parentIndex = current.parentId
        ? visible.value.findIndex((entry) => entry.node.id === current.parentId)
        : -1
      if (parentIndex >= 0) focusAt(parentIndex)
      break
    }
    case 'Enter':
    case ' ':
      event.preventDefault()
      select(current.node)
      break
    default:
      break
  }
}
</script>

<style scoped>
.kf-tree {
  box-sizing: border-box;
  min-width: 0;
  padding: var(--kf-space-1);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
}
.kf-tree__list {
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-tree__item {
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  min-height: 28px;
  padding: 2px 6px;
  border-radius: var(--kf-radius-sm);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  cursor: pointer;
  user-select: none;
}
.kf-tree__item:hover {
  background: var(--kf-muted);
}
.kf-tree__item:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(var(--kf-focus-ring-width) * -1);
}
.kf-tree__item--selected {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
  font-weight: var(--kf-fw-label);
}
.kf-tree__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-tree__toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--kf-radius-xs);
  color: var(--kf-muted-foreground);
}
.kf-tree__toggle:hover {
  background: var(--kf-muted);
}
.kf-tree__toggle--hidden {
  visibility: hidden;
}
.kf-tree__icon {
  flex: none;
  color: var(--kf-muted-foreground);
}
.kf-tree__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-tree__empty {
  padding: var(--kf-space-3);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-tree--lines .kf-tree__item {
  border-left: 1px solid var(--kf-border);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
@media (forced-colors: active) {
  .kf-tree__item--selected {
    outline: 1px solid Highlight;
  }
}
</style>
