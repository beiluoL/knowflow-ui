/**
 * 条目 → 预览组件的唯一解析入口。
 *
 * 解析顺序：demo / missing → 说明卡；有专门组合 → custom；其余 → 通用渲染。
 * 页面只调用 `resolvePreview(entry)`，不自己判断该用哪个。
 */
import type { Component } from 'vue'
import type { PlaygroundEntry } from '../registry/types'
import { GenericPreview } from './GenericPreview'
import {
  AccordionPreview,
  AIChatPreview,
  AgentPreview,
  ComboboxPreview,
  ContextMenuPreview,
  DemoPreview,
  FlashcardPreview,
  FormFieldPreview,
  InterviewPreview,
  ModalPreview,
  PaginationPreview,
  PopoverPreview,
  RagPreview,
  SearchInputPreview,
  SelectPreview,
  SmartQuizPreview,
  TablePreview,
  TabsPreview,
  ToastPreview,
  TooltipPreview,
  TreePreview,
  UploadPreview,
} from './custom'

const CUSTOM: Record<string, Component> = {
  dialog: ModalPreview,
  drawer: ModalPreview,
  confirmdialog: ModalPreview,
  appdialog: ModalPreview,
  popover: PopoverPreview,
  tooltip: TooltipPreview,
  contextmenu: ContextMenuPreview,
  dropdown: ContextMenuPreview,
  toast: ToastPreview,
  table: TablePreview,
  tree: TreePreview,
  upload: UploadPreview,
  select: SelectPreview,
  combobox: ComboboxPreview,
  searchinput: SearchInputPreview,
  pagination: PaginationPreview,
  tabs: TabsPreview,
  accordion: AccordionPreview,
  formfield: FormFieldPreview,
  aichat: AIChatPreview,
  rag: RagPreview,
  agent: AgentPreview,
  flashcard: FlashcardPreview,
  smartquiz: SmartQuizPreview,
  interview: InterviewPreview,
}

export function resolvePreview(entry: PlaygroundEntry): Component {
  if (entry.status !== 'real' || !entry.components.length) return DemoPreview
  return CUSTOM[entry.id] ?? GenericPreview
}

/** 是否使用了专门组合（质量面板据此区分「通用渲染」与「场景组合」） */
export function hasCustomPreview(entry: PlaygroundEntry): boolean {
  return Boolean(CUSTOM[entry.id])
}

export { GenericPreview, DemoPreview }
