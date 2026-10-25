<template>
  <div class="kf-table" :class="[`kf-table--${density}`, { 'kf-table--striped': striped, 'kf-table--loading': loading }]">
    <div class="kf-table__scroll">
      <table class="kf-table__table">
        <caption class="kf-table__caption">{{ caption }}</caption>
        <thead class="kf-table__head">
          <tr>
            <th v-if="selectable" class="kf-table__th kf-table__th--select" scope="col">
              <input
                class="kf-table__checkbox"
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                :disabled="selectableRows.length === 0"
                aria-label="全选当前页"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="kf-table__th"
              :class="[`kf-table__th--${column.align || 'left'}`, { 'kf-table__th--sortable': column.sortable }]"
              scope="col"
              :style="widthStyle(column)"
              :aria-sort="ariaSort(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="kf-table__sort"
                @click="toggleSort(column.key)"
              >
                <span>{{ column.title }}</span>
                <KfIcon :name="sortIcon(column.key)" :size="12" aria-hidden="true" />
              </button>
              <template v-else>{{ column.title }}</template>
            </th>
          </tr>
        </thead>

        <tbody class="kf-table__body">
          <tr v-if="rows.length === 0" class="kf-table__row kf-table__row--empty">
            <td class="kf-table__td kf-table__td--empty" :colspan="colspan">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>

          <tr
            v-for="(row, index) in rows"
            :key="keyOf(row, index)"
            class="kf-table__row"
            :class="{ 'kf-table__row--selected': isSelected(row, index) }"
            @click="emit('rowClick', row, index)"
          >
            <td v-if="selectable" class="kf-table__td kf-table__td--select" @click.stop>
              <input
                class="kf-table__checkbox"
                type="checkbox"
                :checked="isSelected(row, index)"
                :disabled="rowDisabled?.(row) ?? false"
                :aria-label="`选择第 ${index + 1} 行`"
                @change="toggleRow(row, index)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              class="kf-table__td"
              :class="`kf-table__td--${column.align || 'left'}`"
            >
              <slot name="cell" :row="row" :column="column" :value="row[column.key]" :index="index">
                {{ display(column, row) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="kf-table__loading" role="status">加载中…</div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfTable — 数据表格（展示 + 选择 + 排序意图）。
 *
 * 组件不排序、不分页、不请求：排序只发 sort 事件并同步受控的 sortKey/sortOrder，
 * 数据由宿主处理。用原生 <table> 语义，行选择走 checkbox，键盘可达。
 */
import { computed } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfTableColumn, KfTableEmits, KfTableProps, KfTableRow, KfTableSortOrder } from './types'

const props = withDefaults(defineProps<KfTableProps>(), {
  columns: () => [],
  rows: () => [],
  rowKey: 'id',
  selectable: false,
  selectedKeys: () => [],
  sortKey: '',
  sortOrder: null,
  loading: false,
  emptyText: '暂无数据',
  density: 'normal',
  striped: false,
  caption: '数据表格',
  rowDisabled: undefined,
})

const emit = defineEmits<KfTableEmits>()

const colspan = computed(() => props.columns.length + (props.selectable ? 1 : 0))
const selectableRows = computed(() => props.rows.filter((row) => !(props.rowDisabled?.(row) ?? false)))

function keyOf(row: KfTableRow, index: number): string | number {
  const value = row[props.rowKey]
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

function isSelected(row: KfTableRow, index: number): boolean {
  return props.selectedKeys.includes(keyOf(row, index))
}

const allSelected = computed(
  // 用 rows 里的真实下标定位行键：selectableRows 过滤后下标会错位
  () => selectableRows.value.length > 0 && selectableRows.value.every((row) => isSelected(row, props.rows.indexOf(row))),
)
const someSelected = computed(() => props.selectedKeys.length > 0 && !allSelected.value)

function display(column: KfTableColumn, row: KfTableRow): string {
  const value = row[column.key]
  if (column.format) return column.format(value, row)
  if (value === null || value === undefined) return ''
  return String(value)
}

function widthStyle(column: KfTableColumn): Record<string, string> {
  if (!column.width) return {}
  return { width: typeof column.width === 'number' ? `${column.width}px` : column.width }
}

function toggleRow(row: KfTableRow, index: number): void {
  const key = keyOf(row, index)
  const next = isSelected(row, index)
    ? props.selectedKeys.filter((item) => item !== key)
    : [...props.selectedKeys, key]
  emit('update:selectedKeys', next)
}

function toggleAll(): void {
  if (allSelected.value) {
    emit('update:selectedKeys', [])
    return
  }
  const next = props.rows
    .map((row, index) => ({ row, key: keyOf(row, index) }))
    .filter(({ row }) => !(props.rowDisabled?.(row) ?? false))
    .map(({ key }) => key)
  emit('update:selectedKeys', next)
}

function toggleSort(key: string): void {
  const order: KfTableSortOrder = props.sortKey !== key ? 'asc' : props.sortOrder === 'asc' ? 'desc' : null
  emit('update:sortKey', key)
  emit('update:sortOrder', order)
  emit('sort', { key, order })
}

function sortIcon(key: string): string {
  if (props.sortKey !== key) return 'chevron-down'
  return props.sortOrder === 'desc' ? 'chevron-down' : 'chevron-up'
}

function ariaSort(column: KfTableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (props.sortKey !== column.key || !props.sortOrder) return 'none'
  return props.sortOrder === 'asc' ? 'ascending' : 'descending'
}
</script>

<style scoped>
.kf-table {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
  overflow: hidden;
}
.kf-table__scroll {
  overflow-x: auto;
}
.kf-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--kf-fs-body-sm);
}
.kf-table__caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.kf-table__th {
  padding: 8px var(--kf-space-3);
  border-bottom: 1px solid var(--kf-border);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
  text-align: left;
  white-space: nowrap;
}
.kf-table__th--center {
  text-align: center;
}
.kf-table__th--right {
  text-align: right;
}
.kf-table__th--select,
.kf-table__td--select {
  width: 36px;
  padding-right: 0;
}
.kf-table__sort {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.kf-table__sort:hover {
  color: var(--kf-foreground);
}
.kf-table__sort:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 2px;
  border-radius: var(--kf-radius-xs);
}
.kf-table__td {
  padding: 8px var(--kf-space-3);
  border-bottom: 1px solid var(--kf-border);
  color: var(--kf-foreground);
  vertical-align: top;
  overflow-wrap: anywhere;
}
.kf-table--compact .kf-table__th,
.kf-table--compact .kf-table__td {
  padding-top: 5px;
  padding-bottom: 5px;
}
.kf-table__td--center {
  text-align: center;
}
.kf-table__td--right {
  text-align: right;
}
.kf-table__row:last-child .kf-table__td {
  border-bottom: 0;
}
.kf-table--striped .kf-table__row:nth-child(even) .kf-table__td {
  background: var(--kf-muted);
}
.kf-table__row--selected .kf-table__td {
  background: var(--kf-primary-subtle);
}
.kf-table__checkbox {
  width: 15px;
  height: 15px;
  accent-color: var(--kf-primary);
  cursor: pointer;
}
.kf-table__checkbox:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-table__row--empty .kf-table__td--empty {
  padding: var(--kf-space-6) var(--kf-space-3);
  color: var(--kf-muted-foreground);
  text-align: center;
}
.kf-table__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--kf-card) 72%, transparent);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
</style>
