/**
 * 条目 API 规格来源 —— 从 V5 的 `catalog-v4.ts` 数据迁移而来。
 *
 * 说明：这里只保留「文档层」数据（参数名、类型、默认值、枚举、事件、插槽），
 * 组件实现本身在本仓库 packages 内；两边靠 `entries.ts` 的 component 字段对齐。
 */
import type { PropSpec } from './types'

/** 各条目的公开参数名（顺序即 API 表顺序） */
export const PROP_NAMES: Record<string, string[]> = {
  AIComposer: ['modelValue', 'busy', 'stoppable', 'disabled', 'error'],
  CodeBlock: [],
  MarkdownRenderer: [],
  Radio: ['disabled'],
  Switch: ['disabled'],
  Table: [],
  Tree: [],
  Tooltip: [],
  Tabs: [],
  Upload: [],
  Popover: [],
  Combobox: [],
  SearchInput: [],
  Button: [
    'size',
    'variant',
    'disabled',
    'loading',
    'iconName',
    'iconPosition',
    'iconOnly',
    'ariaLabel',
    'label',
  ],
  Icon: ['name', 'size'],
  Input: [
    'modelValue',
    'type',
    'label',
    'placeholder',
    'disabled',
    'readonly',
    'required',
    'error',
    'prefixIconName',
    'suffixIconName',
  ],
  Textarea: [
    'modelValue',
    'label',
    'disabled',
    'readonly',
    'required',
    'error',
    'rows',
    'maxlength',
    'showCount',
    'autoResize',
    'minHeight',
    'maxHeight',
  ],
  Checkbox: ['modelValue', 'label', 'disabled', 'indeterminate'],
  Select: ['options', 'modelValue', 'disabled', 'loading', 'error', 'multiple', 'searchable', 'clearable'],
  DatePicker: ['modelValue', 'disabled', 'readonly', 'error', 'clearable', 'min', 'max'],
  FormField: ['controlId', 'label', 'required', 'help', 'error'],
  Dialog: ['open', 'loading', 'disabled', 'error', 'variant', 'width'],
  Drawer: ['open', 'width', 'loading'],
  Dropdown: ['open', 'items'],
  Toast: [],
  Badge: ['variant'],
  Card: ['variant', 'padding'],
  Pagination: ['pageSize'],
  Skeleton: ['rows', 'type'],
  Empty: ['title', 'description'],
  Progress: ['percentage', 'variant', 'showLabel'],
}

const BOOLS = [
  'disabled',
  'loading',
  'icon',
  'rightIcon',
  'readonly',
  'required',
  'clearable',
  'multiple',
  'searchable',
  'autoResize',
  'showCount',
  'indeterminate',
  'showLabel',
  'busy',
  'stoppable',
  'iconOnly',
]

const ENUMS: Record<string, string[]> = {
  size: ['sm', 'md', 'lg'],
  variant: ['primary', 'secondary', 'outline', 'ghost', 'text', 'danger'],
  type: ['text', 'number', 'email', 'password'],
  iconPosition: ['left', 'right'],
  precision: ['minute', 'second'],
}

const DEFAULTS: Record<string, unknown> = {
  size: 'md',
  variant: 'primary',
  label: '新增内容',
  modelValue: '',
  placeholder: '输入本地内容',
  iconName: 'plus',
  iconPosition: 'left',
  disabled: false,
  loading: false,
  readonly: false,
  required: false,
  clearable: false,
  searchable: true,
  rows: 4,
  maxHeight: 320,
  minHeight: 96,
  maxlength: 300,
  percentage: 64,
  pageSize: 10,
  showCount: true,
  autoResize: true,
  showLabel: true,
}

const NUMBERS = ['rows', 'maxlength', 'minHeight', 'maxHeight', 'percentage', 'pageSize']

/** 源码里的默认语义（V5 实测值），用于 API 表第二列 */
const SOURCE_DEFAULTS: Record<string, Record<string, string>> = {
  Button: { size: 'md', variant: 'primary', iconPosition: 'left', label: '默认 slot，无此 Prop' },
  Icon: { size: 'md', name: '必填' },
  Input: {
    modelValue: '空字符串',
    type: 'text',
    label: '未指定',
    placeholder: '空字符串',
    error: '未指定',
    readonly: '原生属性，未指定',
  },
  Textarea: {
    modelValue: '空字符串',
    rows: '4',
    maxlength: '未指定',
    showCount: 'false',
    autoResize: 'false',
    minHeight: '96',
    maxHeight: '320',
  },
  Checkbox: { modelValue: '未指定', label: '空字符串' },
  Select: { options: '必填', modelValue: '未指定', searchable: 'undefined（自动阈值）', error: '空字符串' },
  DatePicker: { modelValue: '空字符串', min: '空字符串', max: '空字符串' },
  Card: { variant: 'default' },
  Skeleton: { rows: '3', type: 'list' },
  Progress: { percentage: '必填', showLabel: 'false' },
  FormField: { controlId: '必填' },
}

/** 不需要在右侧面板实时调节的参数 */
const READONLY_PROPS = [
  'open',
  'items',
  'modelValue',
  'prefixIconName',
  'suffixIconName',
  'name',
  'padding',
  'options',
  'controlId',
]

function sourceDefault(name: string, prop: string): string {
  const known = SOURCE_DEFAULTS[name]?.[prop]
  if (known) return known
  if (BOOLS.includes(prop)) return 'false'
  if (prop === 'variant' && ['Dialog', 'Drawer'].includes(name)) return 'default'
  if (prop === 'open') return 'false'
  return '未指定；见源码'
}

function optionsFor(name: string, prop: string): string[] | undefined {
  if (prop === 'variant' && name !== 'Button') {
    if (name === 'Badge') return ['primary', 'success', 'warning', 'danger', 'info', 'neutral']
    if (name === 'Card') return ['default', 'flat', 'outlined', 'elevated']
    if (name === 'Progress') return ['primary', 'success', 'warning', 'danger']
    return ['default', 'danger', 'info']
  }
  if (prop === 'type' && name === 'Skeleton') return ['list', 'card', 'line']
  if (prop === 'size' && name === 'Icon') return ['14', '16', '18', '20', '24']
  return ENUMS[prop]
}

/** 生成某条目的参数规格（与 V5 的 specs() 等价） */
export function propSpecs(name: string): PropSpec[] {
  const names = PROP_NAMES[name] ?? []
  return names.map((prop) => {
    const options = optionsFor(name, prop)
    const type =
      prop === 'modelValue'
        ? name === 'Checkbox'
          ? 'boolean | array'
          : '受控值'
        : BOOLS.includes(prop)
          ? 'boolean'
          : NUMBERS.includes(prop)
            ? 'number'
            : options
              ? 'enum'
              : ['items', 'options'].includes(prop)
                ? 'array'
                : 'string'

    const defaultValue =
      prop === 'variant' && name === 'Card'
        ? 'flat'
        : prop === 'variant' && ['Dialog', 'Drawer'].includes(name)
          ? 'default'
          : prop === 'type' && name === 'Skeleton'
            ? 'line'
            : prop === 'size' && name === 'Icon'
              ? '16'
              : (DEFAULTS[prop] ?? (type === 'boolean' ? false : ''))

    return {
      name: prop,
      type,
      default: defaultValue,
      sourceDefault: sourceDefault(name, prop),
      required: ['items', 'options', 'controlId', 'name'].includes(prop),
      description:
        prop === 'readonly'
          ? '通过原生属性透传；不是 disabled'
          : prop === 'label' && name === 'Button'
            ? '默认插槽文字（展示适配，不是 Button Prop）'
            : `${name}.${prop}，以真实接口为准`,
      options,
      editable: !READONLY_PROPS.includes(prop),
    }
  })
}

/** 事件名（真实组件的事件契约） */
export const EVENTS: Record<string, string[]> = {
  AIComposer: [
    'update:modelValue',
    'update:useKnowledgeBase',
    'update:thinkingEnabled',
    'update:selectedModel',
    'submit',
    'stop',
    'attach',
    'removeAttachment',
    'voice',
    'modelSettings',
    'input',
  ],
  Button: ['click'],
  Input: ['update:modelValue', 'focus', 'blur'],
  Textarea: ['update:modelValue', 'focus', 'blur'],
  Checkbox: ['update:modelValue', 'change', 'native-change'],
  Select: ['update:modelValue', 'change'],
  DatePicker: ['update:modelValue', 'change'],
  Dialog: ['confirm', 'cancel'],
  Drawer: ['confirm', 'cancel'],
  Dropdown: ['select', 'close'],
  Pagination: ['change'],
}

const DEMO_EVENTS = ['event(name, value)']

/** 插槽（真实组件公开的插槽） */
export const SLOTS: Record<string, string[]> = {
  Button: ['default'],
  Checkbox: ['default'],
  FormField: ['default'],
  Badge: ['default'],
  Card: ['default', 'header', 'footer'],
  Select: ['option'],
  Dialog: ['default', 'icon', 'footer'],
  Drawer: ['default', 'footer'],
  Table: ['cell', 'empty'],
  Tree: ['node', 'empty'],
  Upload: ['default'],
  Accordion: ['default'],
  Pagination: ['default'],
}

export function eventsFor(name: string, status: 'real' | 'demo' | 'missing'): string[] {
  if (status !== 'real') return DEMO_EVENTS
  return EVENTS[name] ?? []
}

export function slotsFor(name: string, status: 'real' | 'demo' | 'missing'): string[] {
  if (status !== 'real') return []
  return SLOTS[name] ?? []
}
