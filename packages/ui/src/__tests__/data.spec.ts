import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import KfTable from '../components/table/KfTable.vue'
import KfTree from '../components/tree/KfTree.vue'
import KfUpload from '../components/upload/KfUpload.vue'
import KfCombobox from '../components/combobox/KfCombobox.vue'

const COLUMNS = [
  { key: 'name', title: '名称', sortable: true },
  { key: 'count', title: '数量', align: 'right' as const },
]
const ROWS = [
  { id: 1, name: '第一章', count: 12 },
  { id: 2, name: '第二章', count: 7 },
]

describe('KfTable', () => {
  it('渲染表头与单元格，caption 供屏幕阅读器使用', () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: ROWS, caption: '章节列表' } })
    expect(wrapper.findAll('th')).toHaveLength(2)
    expect(wrapper.findAll('tbody .kf-table__row')).toHaveLength(2)
    expect(wrapper.get('.kf-table__caption').text()).toBe('章节列表')
    expect(wrapper.text()).toContain('第一章')
  })

  it('format 影响展示但不改原始行数据', () => {
    const wrapper = mount(KfTable, {
      props: {
        columns: [{ key: 'count', title: '数量', format: (value) => `${String(value)} 条` }],
        rows: ROWS,
      },
    })
    expect(wrapper.get('.kf-table__td').text()).toBe('12 条')
    expect(ROWS[0].count).toBe(12)
  })

  it('可排序表头暴露 aria-sort 并在点击时循环 asc → desc → none', async () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: ROWS } })
    const header = wrapper.findAll('th')[0]
    expect(header.attributes('aria-sort')).toBe('none')

    await wrapper.get('.kf-table__sort').trigger('click')
    expect(wrapper.emitted('sort')?.[0]).toEqual([{ key: 'name', order: 'asc' }])

    await wrapper.setProps({ sortKey: 'name', sortOrder: 'asc' })
    await wrapper.get('.kf-table__sort').trigger('click')
    expect(wrapper.emitted('sort')?.[1]).toEqual([{ key: 'name', order: 'desc' }])

    await wrapper.setProps({ sortOrder: 'desc' })
    await wrapper.get('.kf-table__sort').trigger('click')
    expect(wrapper.emitted('sort')?.[2]).toEqual([{ key: 'name', order: null }])
  })

  it('选择行派发选中键集合，行点击单独派发 rowClick', async () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: ROWS, selectable: true } })

    await wrapper.findAll('tbody input[type="checkbox"]')[1].setValue(true)
    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([[2]])

    await wrapper.findAll('tbody .kf-table__row')[0].trigger('click')
    expect(wrapper.emitted('rowClick')?.[0]).toEqual([ROWS[0], 0])
  })

  it('全选与取消全选', async () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: ROWS, selectable: true } })
    const header = wrapper.get('thead input[type="checkbox"]')

    await header.setValue(true)
    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([[1, 2]])

    await wrapper.setProps({ selectedKeys: [1, 2] })
    await header.setValue(false)
    expect(wrapper.emitted('update:selectedKeys')?.[1]).toEqual([[]])
  })

  it('部分选中时表头 checkbox 处于 indeterminate', () => {
    const wrapper = mount(KfTable, {
      props: { columns: COLUMNS, rows: ROWS, selectable: true, selectedKeys: [1] },
    })
    const header = wrapper.get('thead input[type="checkbox"]').element as HTMLInputElement
    expect(header.indeterminate).toBe(true)
    expect(header.checked).toBe(false)
  })

  it('空数据渲染占位行且 colspan 覆盖所有列', () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: [], selectable: true, emptyText: '没有记录' } })
    expect(wrapper.get('.kf-table__td--empty').text()).toBe('没有记录')
    expect(wrapper.get('.kf-table__td--empty').attributes('colspan')).toBe('3')
  })

  it('loading 时显示加载遮罩并带 role=status', () => {
    const wrapper = mount(KfTable, { props: { columns: COLUMNS, rows: ROWS, loading: true } })
    expect(wrapper.get('.kf-table__loading').attributes('role')).toBe('status')
  })

  it('rowDisabled 的行不可勾选，且不参与全选', async () => {
    const wrapper = mount(KfTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        selectable: true,
        rowDisabled: (row: Record<string, unknown>) => row.id === 2,
      },
    })
    const boxes = wrapper.findAll('tbody input[type="checkbox"]')
    expect((boxes[1].element as HTMLInputElement).disabled).toBe(true)

    await wrapper.get('thead input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([[1]])
  })
})

const NODES = [
  {
    id: 'a',
    label: 'Java 基础',
    children: [
      { id: 'a1', label: '集合' },
      { id: 'a2', label: '并发' },
    ],
  },
  { id: 'b', label: 'Vue 3' },
]

describe('KfTree', () => {
  it('按 defaultExpandLevel 展开，aria-level 反映层级', () => {
    const wrapper = mount(KfTree, { props: { nodes: NODES, defaultExpandLevel: 1 } })
    const items = wrapper.findAll('.kf-tree__item')
    expect(items).toHaveLength(4)
    expect(items.map((item) => item.attributes('aria-level'))).toEqual(['1', '2', '2', '1'])
  })

  it('点击节点派发 select 与 update:selectedId，禁用节点不响应', async () => {
    const wrapper = mount(KfTree, {
      props: { nodes: [...NODES, { id: 'c', label: '禁用', disabled: true }], defaultExpandLevel: 1 },
    })
    await wrapper.findAll('.kf-tree__item')[3].trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'b' })

    await wrapper.findAll('.kf-tree__item')[4].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('点击箭头展开/收起并派发 toggle', async () => {
    const wrapper = mount(KfTree, { props: { nodes: NODES, defaultExpandLevel: 0 } })
    expect(wrapper.findAll('.kf-tree__item')).toHaveLength(2)

    await wrapper.get('.kf-tree__toggle').trigger('click')
    expect(wrapper.findAll('.kf-tree__item')).toHaveLength(4)
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['a', true])

    await wrapper.get('.kf-tree__toggle').trigger('click')
    expect(wrapper.findAll('.kf-tree__item')).toHaveLength(2)
  })

  it('键盘：↓ 移动焦点、→ 展开、← 收起、Enter 选中', async () => {
    const wrapper = mount(KfTree, { props: { nodes: NODES, defaultExpandLevel: 0 } })
    const list = wrapper.get('[role="tree"]')
    const items = wrapper.findAll('.kf-tree__item')

    await items[0].trigger('focus')
    await list.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.findAll('.kf-tree__item')[1].attributes('tabindex')).toBe('0')

    await list.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.findAll('.kf-tree__item')[0].attributes('tabindex')).toBe('0')

    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('.kf-tree__item')).toHaveLength(4)

    await list.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.findAll('.kf-tree__item')).toHaveLength(2)

    await list.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('End 跳到最后一个可见节点，空节点展示占位', async () => {
    const wrapper = mount(KfTree, { props: { nodes: NODES, defaultExpandLevel: 1 } })
    await wrapper.get('[role="tree"]').trigger('keydown', { key: 'End' })
    const items = wrapper.findAll('.kf-tree__item')
    expect(items[items.length - 1].attributes('tabindex')).toBe('0')

    const empty = mount(KfTree, { props: { nodes: [], emptyText: '没有目录' } })
    expect(empty.get('.kf-tree__empty').text()).toBe('没有目录')
  })
})

function fileOf(name: string, size: number, type = 'text/plain'): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

async function pick(wrapper: ReturnType<typeof mount>, files: File[]): Promise<void> {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
}

describe('KfUpload', () => {
  it('选择文件后派发 files 与 select，不上传', async () => {
    const wrapper = mount(KfUpload, { props: { files: [] } })
    await pick(wrapper, [fileOf('a.txt', 10)])

    const files = wrapper.emitted('update:files')?.[0]?.[0] as Array<Record<string, unknown>>
    expect(files).toHaveLength(1)
    expect(files[0].name).toBe('a.txt')
    expect(files[0].status).toBe('ready')
    expect(wrapper.emitted('select')?.[0]?.[0]).toHaveLength(1)
  })

  it('类型不符被拒绝并给出 reason=type', async () => {
    const wrapper = mount(KfUpload, { props: { accept: '.pdf', files: [] } })
    await pick(wrapper, [fileOf('a.txt', 10)])
    expect(wrapper.emitted('reject')?.[0]?.[0]).toMatchObject({ reason: 'type' })
    expect(wrapper.emitted('update:files')).toBeUndefined()
  })

  it('超过大小上限被拒绝，reason=size', async () => {
    const wrapper = mount(KfUpload, { props: { maxSizeMb: 1, files: [] } })
    await pick(wrapper, [fileOf('big.bin', 2 * 1024 * 1024)])
    expect(wrapper.emitted('reject')?.[0]?.[0]).toMatchObject({ reason: 'size' })
  })

  it('超过数量上限被拒绝，reason=count', async () => {
    const wrapper = mount(KfUpload, {
      props: { maxCount: 1, files: [{ id: 'x', name: '已存在.txt' }] },
    })
    await pick(wrapper, [fileOf('new.txt', 10)])
    expect(wrapper.emitted('reject')?.[0]?.[0]).toMatchObject({ reason: 'count' })
  })

  it('列表展示体积 / 进度 / 失败，并派发 remove 与 retry', async () => {
    const wrapper = mount(KfUpload, {
      props: {
        files: [
          { id: 'f1', name: 'ok.pdf', size: 2048, status: 'ready' },
          { id: 'f2', name: 'run.pdf', size: 10, status: 'uploading', progress: 40 },
          { id: 'f3', name: 'bad.pdf', size: 10, status: 'error' },
        ],
      },
    })
    const metas = wrapper.findAll('.kf-upload__file-meta').map((node) => node.text())
    expect(metas).toEqual(['2 KB', '上传中 40%', '上传失败'])
    expect(wrapper.get('.kf-upload__bar').attributes('style')).toContain('width: 40%')

    const retry = wrapper.findAll('.kf-upload__action').find((button) => button.text() === '重试')
    await retry?.trigger('click')
    expect(wrapper.emitted('retry')).toEqual([['f3']])

    const remove = wrapper.findAll('.kf-upload__action--remove')[0]
    await remove.trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['f1']])
  })

  it('disabled 时不打开选择器', async () => {
    const wrapper = mount(KfUpload, { props: { disabled: true, files: [] } })
    expect(wrapper.get('.kf-upload__zone').attributes('tabindex')).toBe('-1')
    expect(wrapper.get('input[type="file"]').attributes('disabled')).toBeDefined()
  })
})

const OPTIONS = [
  { value: 'java', label: 'Java' },
  { value: 'vue', label: 'Vue' },
  { value: 'ts', label: 'TypeScript', description: '类型系统' },
]

describe('KfCombobox', () => {
  it('输入时派发 update:modelValue 与 search，并本地过滤', async () => {
    const wrapper = mount(KfCombobox, { props: { options: OPTIONS, modelValue: '' } })
    const input = wrapper.get('input')

    await input.trigger('focus')
    expect(wrapper.find('.kf-combobox__list').exists()).toBe(true)

    await input.setValue('vu')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['vu'])
    expect(wrapper.emitted('search')?.[0]).toEqual(['vu'])

    await wrapper.setProps({ modelValue: 'vu' })
    const labels = wrapper.findAll('.kf-combobox__option-label').map((node) => node.text())
    expect(labels).toEqual(['Vue'])
  })

  it('方向键移动高亮并写入 aria-activedescendant，Enter 选中', async () => {
    const wrapper = mount(KfCombobox, { props: { options: OPTIONS, modelValue: '' } })
    const input = wrapper.get('input')
    await input.trigger('focus')

    await input.trigger('keydown', { key: 'ArrowDown' })
    const activeId = wrapper.get('input').attributes('aria-activedescendant')
    expect(activeId).toContain('-option-0')

    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ value: 'java' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Java'])
  })

  it('filterable=false 时不做本地过滤，交给宿主给 options', async () => {
    const wrapper = mount(KfCombobox, { props: { options: OPTIONS, filterable: false, modelValue: 'zzz' } })
    await wrapper.get('input').trigger('focus')
    expect(wrapper.findAll('.kf-combobox__option')).toHaveLength(3)
  })

  it('无匹配时展示空文案，loading 优先展示搜索中', async () => {
    const empty = mount(KfCombobox, { props: { options: OPTIONS, modelValue: 'zzz' } })
    await empty.get('input').trigger('focus')
    expect(empty.get('.kf-combobox__status').text()).toBe('没有匹配项')

    const loading = mount(KfCombobox, { props: { options: OPTIONS, loading: true } })
    await loading.get('input').trigger('focus')
    expect(loading.get('.kf-combobox__status').text()).toBe('搜索中…')
  })

  it('清空按钮派发空值与 clear', async () => {
    const wrapper = mount(KfCombobox, { props: { options: OPTIONS, modelValue: 'Java' } })
    await wrapper.get('.kf-combobox__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('error 设置 aria-invalid 与错误类', () => {
    const wrapper = mount(KfCombobox, { props: { options: OPTIONS, error: '必填' } })
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.classes()).toContain('kf-combobox--error')
    expect(wrapper.get('.kf-combobox__error').text()).toBe('必填')
  })

  it('关闭自由输入时，外部点击后对非法值发 invalid', async () => {
    const wrapper = mount(KfCombobox, {
      props: { options: OPTIONS, modelValue: '不存在的值', freeInput: false },
    })
    await wrapper.get('input').trigger('focus')
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('invalid')).toEqual([['不存在的值']])
  })
})
