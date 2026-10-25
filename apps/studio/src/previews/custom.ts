/**
 * 需要「组合 / 受控状态 / 打开动作」的预览。
 *
 * 与 GenericPreview 的分工：
 *   - 单组件、props 自足的条目走通用渲染；
 *   - 这里只处理三类必须写代码的场景：
 *       ① 模态与浮层（需要触发元素与 open 状态）
 *       ② 集合型组件（表格选择、树展开、上传文件列表）
 *       ③ 复合场景（AIChat / RAG / Agent / 闪卡 / 测验 / 面试）
 *
 * 所有交互只改本地状态：不发请求、不写记录、不调用 AI。
 */
import {
  computed,
  defineComponent,
  h,
  ref,
  type Component,
  type PropType,
  type VNodeChild,
} from 'vue'
import {
  KfAccordion,
  KfAccordionItem,
  KfButton,
  KfCombobox,
  KfConfirmDialog,
  KfContextMenu,
  KfDialog,
  KfDrawer,
  KfEmptyState,
  KfFormField,
  KfPagination,
  KfPopover,
  KfSearchInput,
  KfSelect,
  KfSkeleton,
  KfTable,
  KfTabs,
  KfToast,
  KfTooltip,
  KfTree,
  KfUpload,
  useToast,
} from '@beiluol/knowflow-ui'
import type {
  KfPopoverPlacement,
  KfTabsVariant,
  KfTableColumn,
  KfTableRow,
  KfToastPlacement,
  KfTooltipPlacement,
  KfTreeNode,
  KfUploadFile,
} from '@beiluol/knowflow-ui'
import {
  KfAgentTrace,
  KfChatComposer,
  KfChatMessage,
  KfEvidencePanel,
  KfSourceList,
  KfToolCallCard,
} from '@beiluol/knowflow-ai'
import type { KfAgentStep, KfComposerAttachment, KfEvidenceChunk, KfSourceItem } from '@beiluol/knowflow-ai'
import {
  KfAnswerFeedback,
  KfAnswerOptions,
  KfFlashcard,
  KfFlashcardRating,
  KfInterviewFeedback,
  KfInterviewQuestion,
  KfInterviewScore,
  KfQuestionCard,
  KfQuizResult,
} from '@beiluol/knowflow-learning'
import type { KfAnswerOption, KfInterviewDimension } from '@beiluol/knowflow-learning'
import type { PreviewApi, StoryFixtureFlags } from './api'
import { componentEmits } from './runtime'

const baseProps = { api: { type: Object as PropType<PreviewApi>, required: true } } as const

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function useFixture(props: { api: PreviewApi }) {
  const data = computed(() => asRecord(props.api.fixture.data))
  const flags = computed<StoryFixtureFlags>(() => asRecord(props.api.fixture.ui) as StoryFixtureFlags)
  return { data, flags }
}

/**
 * 只保留组件真实声明过的 emit 监听。
 *
 * 为什么需要：同一个预览会渲染多个不同组件（ModalPreview 现在服务 3 个），
 * 它们的 emits 并不相同（Drawer 有 close，Dialog 没有）。无脑挂 `onXxx`
 * 会让 Vue 报 "Extraneous non-emits event listeners"，也说明预览在假装组件有能力。
 */
function declaredOnly(
  component: Component,
  handlers: Record<string, (...args: never[]) => void>,
): Record<string, unknown> {
  const declared = new Set(componentEmits(component))
  const attrs: Record<string, unknown> = {}
  for (const [event, handler] of Object.entries(handlers)) {
    if (!declared.has(event)) continue
    attrs[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = handler
  }
  return attrs
}

/** 场景区的分节标题（纯展示，不进组件） */
function section(title: string, children: VNodeChild[], note?: string): VNodeChild {
  return h('section', { class: 'scenario' }, [
    h('header', { class: 'scenario__head' }, [
      h('h4', { class: 'scenario__title' }, title),
      note ? h('span', { class: 'scenario__note' }, note) : null,
    ]),
    h('div', { class: 'scenario__body' }, children),
  ])
}

/* ── ① 模态与浮层 ─────────────────────────────────────────── */

export const ModalPreview = defineComponent({
  name: 'ModalPreview',
  props: baseProps,
  setup(props) {
    const { flags } = useFixture(props)
    const open = ref(true)
    const component = computed<Component>(() => {
      switch (props.api.entry.name) {
        case 'Drawer':
          return KfDrawer
        case 'ConfirmDialog':
          return KfConfirmDialog
        default:
          return KfDialog
      }
    })

    return () => {
      const values = { ...props.api.values }
      const longContent = Boolean(flags.value.longContent)
      const body = longContent
        ? [
            h(
              'p',
              null,
              '这是用于观察「内容超长」时内部滚动、标题固定与焦点陷阱是否仍然成立的段落。'.repeat(8),
            ),
            h('p', null, 'Escape 关闭后，焦点应回到触发按钮。'),
          ]
        : [h('p', null, String(values.message ?? '这里是对话框正文，可由默认插槽替换。'))]

      const close = () => {
        open.value = false
        props.api.log('update:open', false)
      }

      return h('div', { class: 'preview-stack' }, [
        h('div', { class: 'preview-toolbar' }, [
          h(
            KfButton,
            { variant: 'secondary', iconName: 'plus', onClick: () => { open.value = true } },
            () => '重新打开',
          ),
          h('span', { class: 'preview-hint' }, open.value ? '当前：打开' : '当前：关闭（Esc / 遮罩 / 按钮都会关闭）'),
        ]),
        h(
          component.value,
          {
            ...values,
            open: open.value,
            ...declaredOnly(component.value, {
              'update:open': (value: unknown) => {
                open.value = Boolean(value)
                props.api.log('update:open', value)
              },
              confirm: () => {
                props.api.log('confirm')
                close()
              },
              cancel: () => {
                props.api.log('cancel')
                close()
              },
              // KfDrawer 声明了 close；KfDialog / KfConfirmDialog 用 update:open + cancel，
              // 在这里按真实 defineEmits 过滤，避免「给不存在的 emit 挂监听」的 Vue 警告。
              close: () => {
                props.api.log('close')
                close()
              },
            }),
          },
          { default: () => body },
        ),
      ])
    }
  },
})

export const PopoverPreview = defineComponent({
  name: 'PopoverPreview',
  props: baseProps,
  setup(props) {
    return () =>
      h(
        KfPopover,
        {
          placement: (props.api.values.placement ?? 'bottom') as KfPopoverPlacement,
          ariaLabel: String(props.api.values.ariaLabel ?? '筛选面板'),
          'onUpdate:open': (value: boolean) => props.api.log('update:open', value),
          onOpen: () => props.api.log('open'),
          onClose: () => props.api.log('close'),
        },
        {
          trigger: () => h(KfButton, { variant: 'secondary', iconName: 'filter' }, () => '筛选'),
          default: () =>
            h('div', { class: 'popover-demo' }, [
              h('p', { class: 'popover-demo__title' }, '按状态筛选'),
              h('label', null, [h('input', { type: 'checkbox', checked: true }), '只看未掌握']),
              h('label', null, [h('input', { type: 'checkbox' }), '只看今天到期']),
              h(KfButton, { size: 'sm', onClick: () => props.api.log('apply') }, () => '应用'),
            ]),
        },
      )
  },
})

export const TooltipPreview = defineComponent({
  name: 'TooltipPreview',
  props: baseProps,
  setup(props) {
    return () =>
      h('div', { class: 'preview-center' }, [
        h(
          KfTooltip,
          {
            content: String(props.api.values.content ?? '按 ⌘K 打开命令面板'),
            placement: (props.api.values.placement ?? 'top') as KfTooltipPlacement,
          },
          { default: () => h(KfButton, { variant: 'outline' }, () => '悬停或聚焦查看提示') },
        ),
      ])
  },
})

export const ContextMenuPreview = defineComponent({
  name: 'ContextMenuPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const open = ref(false)
    const position = ref({ x: 0, y: 0 })
    const area = ref<HTMLElement | null>(null)

    return () => {
      const items = asArray<{ key: string; label: string }>(data.value.items)
      return h('div', { class: 'preview-stack' }, [
        h(
          'div',
          {
            ref: area,
            class: 'context-area',
            onContextmenu: (event: MouseEvent) => {
              event.preventDefault()
              // KfContextMenu 的 x / y 是视口坐标（与原右键菜单契约一致）
              position.value = { x: event.clientX, y: event.clientY }
              open.value = true
              props.api.log('open', { x: position.value.x, y: position.value.y })
            },
          },
          '在此区域点右键（或长按触屏）打开菜单',
        ),
        h(KfContextMenu, {
          open: open.value,
          x: position.value.x,
          y: position.value.y,
          items,
          label: String(props.api.values.label ?? '操作菜单'),
          restoreFocusTo: area.value,
          onSelect: (key: string) => {
            props.api.log('select', key)
            open.value = false
          },
          onClose: () => {
            props.api.log('close')
            open.value = false
          },
        }),
      ])
    }
  },
})

export const ToastPreview = defineComponent({
  name: 'ToastPreview',
  props: baseProps,
  setup(props) {
    // 每个预览实例一份自己的 toast 状态：不共享模块级单例
    const { items, notify, dismiss } = useToast({ duration: 0 })
    return () =>
      h('div', { class: 'preview-stack' }, [
        h('div', { class: 'preview-toolbar' }, [
          h(KfButton, { size: 'sm', onClick: () => notify('已保存到本地草稿', 'success') }, () => '成功'),
          h(KfButton, { size: 'sm', variant: 'secondary', onClick: () => notify('网络不可用，稍后重试', 'error') }, () => '失败'),
          h(KfButton, { size: 'sm', variant: 'ghost', onClick: () => notify('已复制到剪贴板', 'info') }, () => '信息'),
        ]),
        h(KfToast, {
          items: items.value,
          placement: (props.api.values.placement ?? 'top-right') as KfToastPlacement,
          onDismiss: (id: string) => {
            props.api.log('dismiss', id)
            dismiss(id)
          },
        }),
      ])
  },
})

/* ── ② 集合型组件 ─────────────────────────────────────────── */

export const TablePreview = defineComponent({
  name: 'TablePreview',
  props: baseProps,
  setup(props) {
    const { data, flags } = useFixture(props)
    const selected = ref<Array<string | number>>([])
    const sortKey = ref('')
    const sortOrder = ref<'asc' | 'desc' | null>(null)

    return () => {
      const rows = flags.value.tableEmpty ? [] : asArray<KfTableRow>(data.value.rows)
      return h(KfTable, {
        columns: asArray<KfTableColumn>(data.value.columns),
        rows,
        rowKey: 'id',
        selectable: Boolean(props.api.values.selectable),
        selectedKeys: selected.value,
        sortKey: sortKey.value,
        sortOrder: sortOrder.value,
        loading: Boolean(flags.value.busy),
        caption: String(props.api.values.caption ?? '知识库列表'),
        emptyText: '还没有知识库',
        'onUpdate:selectedKeys': (keys: Array<string | number>) => {
          selected.value = keys
          props.api.set('selectedKeys', keys)
          props.api.log('update:selectedKeys', keys)
        },
        'onUpdate:sortKey': (key: string) => {
          sortKey.value = key
          props.api.log('update:sortKey', key)
        },
        'onUpdate:sortOrder': (order: 'asc' | 'desc' | null) => {
          sortOrder.value = order
          props.api.log('update:sortOrder', order)
        },
        onSort: (payload: { key: string; order: 'asc' | 'desc' | null }) => {
          sortKey.value = payload.key
          sortOrder.value = payload.order
          props.api.log('sort', payload)
        },
        onRowClick: (row: KfTableRow, index: number) => props.api.log('rowClick', { row: row.id, index }),
      })
    }
  },
})

export const TreePreview = defineComponent({
  name: 'TreePreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const expanded = ref<string[]>(asArray<string>(data.value.expandedIds))
    const selected = ref('')
    return () =>
      h(KfTree, {
        nodes: asArray<KfTreeNode>(data.value.nodes),
        expandedIds: expanded.value,
        selectedId: selected.value,
        showLines: props.api.values.showLines !== false,
        ariaLabel: String(props.api.values.ariaLabel ?? '知识树'),
        'onUpdate:expandedIds': (ids: string[]) => {
          expanded.value = ids
          props.api.log('update:expandedIds', ids)
        },
        'onUpdate:selectedId': (id: string) => {
          selected.value = id
          props.api.log('update:selectedId', id)
        },
        onToggle: (id: string, isExpanded: boolean) => props.api.log('toggle', { id, expanded: isExpanded }),
        onSelect: (node: KfTreeNode) => props.api.log('select', node.id),
      })
  },
})

export const UploadPreview = defineComponent({
  name: 'UploadPreview',
  props: baseProps,
  setup(props) {
    const files = ref<KfUploadFile[]>([])
    let seq = 0

    return () =>
      h(KfUpload, {
        accept: String(props.api.values.accept ?? ''),
        multiple: props.api.values.multiple !== false,
        maxSizeMb: Number(props.api.values.maxSizeMb ?? 10),
        maxCount: Number(props.api.values.maxCount ?? 5),
        hint: String(props.api.values.hint ?? ''),
        files: files.value,
        disabled: Boolean(props.api.values.disabled),
        onSelect: (picked: File[]) => {
          seq += picked.length
          const next = picked.map((file, index) => ({
            id: `local-${seq}-${index}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready' as const,
          }))
          files.value = [...files.value, ...next]
          props.api.log('select', picked.map((file) => file.name))
        },
        onRemove: (id: string) => {
          files.value = files.value.filter((file) => file.id !== id)
          props.api.log('remove', id)
        },
        onRetry: (id: string) => {
          files.value = files.value.map((file) =>
            file.id === id ? { ...file, status: 'ready' as const, errorText: undefined } : file,
          )
          props.api.log('retry', id)
        },
        'onUpdate:files': (next: KfUploadFile[]) => {
          files.value = next
        },
        onReject: (payload: { file: File; reason: string }) =>
          props.api.log('reject', { name: payload.file.name, reason: payload.reason }),
      })
  },
})

export const SelectPreview = defineComponent({
  name: 'SelectPreview',
  props: baseProps,
  setup(props) {
    const { data, flags } = useFixture(props)
    return () =>
      h(KfSelect, {
        options: flags.value.empty
          ? []
          : asArray<{ label: string; value: string; disabled?: boolean; hint?: string }>(
              data.value.options,
            ),
        modelValue: props.api.values.modelValue as string | string[],
        multiple: Boolean(props.api.values.multiple),
        searchable: Boolean(props.api.values.searchable),
        clearable: Boolean(props.api.values.clearable),
        loading: Boolean(props.api.values.loading),
        disabled: Boolean(props.api.values.disabled),
        error: String(props.api.values.error ?? ''),
        label: String(props.api.values.label ?? ''),
        placeholder: String(props.api.values.placeholder ?? '请选择'),
        emptyText: '没有匹配项',
        'onUpdate:modelValue': (value: string | string[]) => {
          props.api.set('modelValue', value)
          props.api.log('update:modelValue', value)
        },
        onChange: (value: string | string[]) => props.api.log('change', value),
      })
  },
})

export const ComboboxPreview = defineComponent({
  name: 'ComboboxPreview',
  props: baseProps,
  setup(props) {
    const { data, flags } = useFixture(props)
    const value = ref(String(props.api.values.modelValue ?? ''))
    return () =>
      h(KfCombobox, {
        modelValue: value.value,
        options: asArray<{ label: string; value: string; disabled?: boolean }>(data.value.options),
        label: String(props.api.values.label ?? '关联知识点'),
        placeholder: String(props.api.values.placeholder ?? '输入关键词过滤'),
        loading: Boolean(flags.value.searchLoading),
        error: flags.value.searchError ? '搜索失败：本地 Fixture 模拟' : '',
        disabled: Boolean(props.api.values.disabled),
        freeInput: Boolean(props.api.values.freeInput),
        filterable: props.api.values.filterable !== false,
        'onUpdate:modelValue': (next: string) => {
          value.value = next
          props.api.set('modelValue', next)
          props.api.log('update:modelValue', next)
        },
        onSearch: (query: string) => props.api.log('search', query),
        onSelect: (option: { value: string }) => props.api.log('select', option.value),
        onClear: () => props.api.log('clear'),
      })
  },
})

export const SearchInputPreview = defineComponent({
  name: 'SearchInputPreview',
  props: baseProps,
  setup(props) {
    const { flags } = useFixture(props)
    const value = ref(flags.value.query ? String(flags.value.query) : String(props.api.values.modelValue ?? ''))
    return () =>
      h(
        KfSearchInput,
        {
          modelValue: value.value,
          label: '搜索',
          placeholder: String(props.api.values.placeholder ?? '搜索知识库、笔记或闪卡'),
          clearable: true,
          loading: Boolean(flags.value.searchLoading),
          error: flags.value.searchError ? '搜索失败：本地 Fixture 模拟' : '',
          debounce: 0,
          'onUpdate:modelValue': (next: string) => {
            value.value = next
            props.api.set('modelValue', next)
            props.api.log('update:modelValue', next)
          },
          onSearch: (query: string) => props.api.log('search', query),
          onSubmit: (query: string) => props.api.log('submit', query),
          onClear: () => props.api.log('clear'),
        },
      )
  },
})

export const PaginationPreview = defineComponent({
  name: 'PaginationPreview',
  props: baseProps,
  setup(props) {
    const page = ref(Number(props.api.values.pageNum ?? 1))
    return () =>
      h('div', { class: 'preview-center' }, [
        h(KfPagination, {
          pageNum: page.value,
          pageSize: Number(props.api.values.pageSize ?? 10),
          total: Number(props.api.values.total ?? 86),
          showInfo: props.api.values.showInfo !== false,
          'onUpdate:pageNum': (next: number) => {
            page.value = next
            props.api.set('pageNum', next)
            props.api.log('update:pageNum', next)
          },
          onChange: (next: number) => props.api.log('change', next),
        }),
      ])
  },
})

export const TabsPreview = defineComponent({
  name: 'TabsPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const active = ref(String(props.api.values.modelValue ?? 'preview'))
    return () => {
      const items = asArray<{ id: string; label: string }>(data.value.items)
      const current = items.find((item) => item.id === active.value)
      return h('div', { class: 'preview-stack' }, [
        h(KfTabs, {
          items,
          modelValue: active.value,
          variant: (props.api.values.variant ?? 'line') as KfTabsVariant,
          ariaLabel: String(props.api.values.ariaLabel ?? '组件面板'),
          'onUpdate:modelValue': (id: string) => {
            active.value = id
            props.api.set('modelValue', id)
            props.api.log('update:modelValue', id)
          },
          onChange: (id: string) => props.api.log('change', id),
        }),
        h('p', { class: 'preview-hint' }, `当前面板：${current?.label ?? active.value}`),
      ])
    }
  },
})

export const AccordionPreview = defineComponent({
  name: 'AccordionPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const open = ref<string[]>(asArray<string>(props.api.values.modelValue as unknown))
    return () => {
      const items = asArray<{ name: string; title: string; content: string }>(data.value.items)
      return h(
        KfAccordion,
        {
          modelValue: open.value,
          multiple: props.api.values.multiple !== false,
          'onUpdate:modelValue': (names: string[]) => {
            open.value = names
            props.api.set('modelValue', names)
            props.api.log('update:modelValue', names)
          },
          onChange: (names: string[]) => props.api.log('change', names),
        },
        {
          default: () =>
            items.map((item) =>
              h(KfAccordionItem, { name: item.name, title: item.title }, { default: () => item.content }),
            ),
        },
      )
    }
  },
})

export const FormFieldPreview = defineComponent({
  name: 'FormFieldPreview',
  props: baseProps,
  setup(props) {
    return () =>
      h(
        KfFormField,
        {
          controlId: String(props.api.values.controlId ?? 'kf-demo-field'),
          label: String(props.api.values.label ?? '邮箱'),
          required: Boolean(props.api.values.required),
          help: String(props.api.values.help ?? ''),
          error: String(props.api.values.error ?? ''),
        },
        {
          default: () =>
            h('input', {
              id: String(props.api.values.controlId ?? 'kf-demo-field'),
              class: 'demo-control',
              type: 'email',
              placeholder: 'you@example.com',
            }),
        },
      )
  },
})

/* ── ③ 复合场景 ───────────────────────────────────────────── */

export const AIChatPreview = defineComponent({
  name: 'AIChatPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const draft = ref(String(props.api.values.modelValue ?? ''))
    const attachments = ref<KfComposerAttachment[]>([])

    return () => {
      const messages = asArray<{ id: string; role: 'user' | 'assistant'; content: string; timestamp?: string }>(
        data.value.messages,
      )
      return h('div', { class: 'chat-scenario' }, [
        h(
          'div',
          { class: 'chat-scenario__messages' },
          messages.map((message) =>
            h(
              KfChatMessage,
              {
                key: message.id,
                role: message.role,
                timestamp: message.timestamp,
              },
              { default: () => message.content },
            ),
          ),
        ),
        h(KfChatComposer, {
          modelValue: draft.value,
          placeholder: String(props.api.values.placeholder ?? '输入问题，Enter 发送'),
          busy: Boolean(props.api.values.busy),
          disabled: Boolean(props.api.values.disabled),
          attachments: attachments.value,
          'onUpdate:modelValue': (value: string) => {
            draft.value = value
            props.api.set('modelValue', value)
          },
          onSubmit: (value: string) => {
            props.api.log('submit', value)
            draft.value = ''
            props.api.set('modelValue', '')
          },
          onStop: () => props.api.log('stop'),
          onAttach: () => {
            attachments.value = [
              ...attachments.value,
              { id: `att-${attachments.value.length + 1}`, name: '实验记录.md', size: 20480, type: 'text/markdown', status: 'ready' },
            ]
            props.api.log('attach')
          },
          onRemoveAttachment: (id: string) => {
            attachments.value = attachments.value.filter((item) => item.id !== id)
            props.api.log('removeAttachment', id)
          },
        }),
      ])
    }
  },
})

export const RagPreview = defineComponent({
  name: 'RagPreview',
  props: baseProps,
  setup(props) {
    const { data, flags } = useFixture(props)
    const activeId = ref('')
    return () =>
      h('div', { class: 'rag-scenario' }, [
        h(KfSourceList, {
          sources: flags.value.empty ? [] : asArray<KfSourceItem>(data.value.sources),
          title: '引用来源',
          showCount: true,
          maxVisible: 0,
          activeId: activeId.value,
          emptyText: '没有找到足够证据（Fixture）',
          onSelect: (item: KfSourceItem) => {
            activeId.value = item.id
            props.api.log('select', item.id)
          },
          onOpen: (url: string) => props.api.log('open', url),
        }),
        h(KfEvidencePanel, {
          chunks: flags.value.empty ? [] : asArray<KfEvidenceChunk>(data.value.evidence),
          query: String(data.value.query ?? ''),
          showScore: true,
          clampLines: 0,
          emptyText: '证据不足时不要编造答案',
          onSelect: (chunk: KfEvidenceChunk) => props.api.log('select', chunk.id),
        }),
      ])
  },
})

export const AgentPreview = defineComponent({
  name: 'AgentPreview',
  props: baseProps,
  setup(props) {
    const { data, flags } = useFixture(props)
    const approval = ref<'requested' | 'approved' | 'rejected'>('requested')
    return () => {
      const timeout = flags.value.toolStatus === 'timeout'
      return h('div', { class: 'preview-stack' }, [
        h(
          'div',
          { class: 'scenario-grid' },
          [
            section(
              '执行轨迹',
              [
                h(KfAgentTrace, {
                  steps: asArray<KfAgentStep>(data.value.steps),
                  title: '本次执行的公开步骤',
                  onSelect: (step: KfAgentStep) => props.api.log('select', step.id),
                }),
              ],
              '只展示宿主提供的可公开文本',
            ),
            section('工具调用（需审批）', [
              h(KfToolCallCard, {
                name: 'search_docs',
                title: '检索知识库',
                status: timeout ? 'error' : 'success',
                approval: timeout ? 'none' : approval.value,
                args: '{"query":"rerank 作用","topK":5}',
                result: timeout ? '' : '命中 3 篇文档（本地 Fixture）',
                error: timeout ? '工具超时（本地 Fixture 模拟）' : '',
                duration: timeout ? '30.0s' : '420ms',
                defaultOpen: true,
                onApprove: () => {
                  approval.value = 'approved'
                  props.api.log('approve')
                },
                onReject: () => {
                  approval.value = 'rejected'
                  props.api.log('reject')
                },
              }),
            ]),
          ],
        ),
      ])
    }
  },
})

export const FlashcardPreview = defineComponent({
  name: 'FlashcardPreview',
  props: baseProps,
  setup(props) {
    const { flags } = useFixture(props)
    const flipped = ref(false)
    const rating = ref<number | null>(null)
    return () => {
      if (flags.value.cardLoading) {
        return h('div', { class: 'preview-center' }, [h(KfSkeleton, { type: 'card', rows: 1 })])
      }
      if (flags.value.empty) {
        return h(KfEmptyState, {
          icon: 'book-open',
          title: '今天没有到期卡片',
          description: '这不是错误：只是当前没有需要复习的内容。',
        })
      }
      return h('div', { class: 'flashcard-scenario' }, [
        h(KfFlashcard, {
          front: String(props.api.values.front ?? ''),
          back: String(props.api.values.back ?? ''),
          tags: asArray<string>(props.api.values.tags),
          index: Number(props.api.values.index ?? 1),
          total: Number(props.api.values.total ?? 1),
          flipped: flipped.value,
          'onUpdate:flipped': (value: boolean) => {
            flipped.value = value
            props.api.log('update:flipped', value)
          },
          onFlip: (value: boolean) => props.api.log('flip', value),
        }),
        h(KfFlashcardRating, {
          modelValue: rating.value,
          'onUpdate:modelValue': (value: number) => {
            rating.value = value
            props.api.log('update:modelValue', value)
          },
          onSelect: (value: number) => props.api.log('select', value),
        }),
      ])
    }
  },
})

export const SmartQuizPreview = defineComponent({
  name: 'SmartQuizPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const answer = ref<string | null>('b')
    return () => {
      const result = asRecord(data.value.result)
      return h('div', { class: 'preview-stack' }, [
        h(KfQuestionCard, {
          question: String(data.value.question ?? ''),
          type: 'single',
          index: 4,
          total: 10,
          difficulty: 'medium',
          points: 2,
          tags: ['RAG'],
        }),
        h(KfAnswerOptions, {
          options: asArray<KfAnswerOption>(data.value.options),
          mode: 'single',
          modelValue: answer.value,
          revealed: true,
          correctValues: ['b'],
          'onUpdate:modelValue': (value: string | string[]) => {
            answer.value = Array.isArray(value) ? (value[0] ?? null) : value
            props.api.log('update:modelValue', value)
          },
        }),
        h(KfAnswerFeedback, {
          status: 'correct',
          score: '2/2',
          answer: 'B',
          correctAnswer: 'B',
          explanation: 'rerank 的价值在于「重排」而不是「再召回」：它用更贵的模型对少量候选逐对打分。',
          retryable: true,
          onRetry: () => props.api.log('retry'),
        }),
        h(KfQuizResult, {
          score: Number(result.score ?? 0),
          passScore: Number(result.passScore ?? 60),
          total: Number(result.total ?? 0),
          correct: Number(result.correct ?? 0),
          incorrect: Number(result.incorrect ?? 0),
          skipped: Number(result.skipped ?? 0),
          duration: String(result.duration ?? ''),
          showPass: true,
          onRetry: () => props.api.log('retry'),
          onReview: () => props.api.log('review'),
        }),
      ])
    }
  },
})

export const InterviewPreview = defineComponent({
  name: 'InterviewPreview',
  props: baseProps,
  setup(props) {
    const { data } = useFixture(props)
    const answering = ref(false)
    const answered = ref(true)
    return () => {
      const dimensions = asArray<KfInterviewDimension>(data.value.dimensions)
      return h('div', { class: 'preview-stack' }, [
        h(KfInterviewQuestion, {
          question: String(data.value.question ?? ''),
          index: 2,
          total: 6,
          category: 'RAG / 检索',
          difficulty: 'medium',
          timeLimit: '3 分钟',
          answering: answering.value,
          answered: answered.value,
          followUp: '如果只能改一个参数，你会先动哪个？',
          onStart: () => {
            answering.value = true
            props.api.log('start')
          },
          onFinish: () => {
            answering.value = false
            answered.value = true
            props.api.log('finish')
          },
        }),
        h(
          'div',
          { class: 'scenario-grid' },
          [
            section('维度反馈', [
              h(KfInterviewFeedback, {
                dimensions,
                overall: '结构清晰，但对成本与延迟的权衡还需要更具体的数字。',
                strengths: ['先给结论再展开', '能定位到召回与重排两个阶段'],
                improvements: ['补一次量化对比', '追问时先复述问题再回答'],
              }),
            ]),
            section('综合得分', [
              h(KfInterviewScore, {
                score: Number(data.value.score ?? 0),
                maxScore: 100,
                label: '综合得分',
                size: 'lg',
              }),
            ]),
          ],
        ),
      ])
    }
  },
})

/* ── 未实现的 Demo 条目：只给说明，不伪造实现 ───────────────── */

export const DemoPreview = defineComponent({
  name: 'DemoPreview',
  props: baseProps,
  setup(props) {
    return () =>
      h('div', { class: 'demo-note' }, [
        h('p', { class: 'demo-note__badge' }, 'DEMO ONLY'),
        h('h4', null, `${props.api.entry.title} 在 v0.2.0 仍是演示条目`),
        h(
          'p',
          null,
          props.api.entry.fallback ??
            '该条目在 V5 中只有内部参考实现。v0.2.0 没有把它提升为公共组件，因此这里不渲染任何「看起来能用的假组件」。',
        ),
        h('p', { class: 'demo-note__hint' }, '如需正式支持，请先在 packages/ui 内实现并补测试，再把它改为 real。'),
      ])
  },
})
