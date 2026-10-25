import type { CategoryId, CategoryMeta, ComponentStory } from './types'
import { buttonStory } from './button'
import { iconStory } from './icon'
import { inputStory } from './input'
import { checkboxStory } from './checkbox'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'foundations', title: 'Foundations', description: '基础控件与图标语言' },
  { id: 'forms', title: 'Forms', description: '表单输入与选择' },
  { id: 'data-display', title: 'Data Display', description: '数据展示与容器' },
  { id: 'navigation', title: 'Navigation', description: '导航与页面骨架' },
  { id: 'overlay', title: 'Overlay', description: '浮层与反馈' },
  { id: 'ai', title: 'AI', description: 'AI 交互与可解释性' },
  { id: 'learning', title: 'Learning', description: '学习闭环组件' },
  { id: 'tokens', title: 'Design Tokens', description: '令牌与主题' },
]

/** v0.1.0 真实迁移的组件（Studio 只渲染这些为"已完成"） */
export const STORIES: ComponentStory[] = [buttonStory, iconStory, inputStory, checkboxStory]

export interface PlannedEntry {
  title: string
  category: CategoryId
  /** 计划版本 */
  version: string
  /** 原 KnowFlow 对应实现（存在不代表可直接迁移） */
  origin?: string
}

/**
 * 规划项：只做清单，不创建空组件文件。
 * 理由：空文件会让"目录里有 40 个组件"看起来像已完成，属于自欺。
 */
export const PLANNED: PlannedEntry[] = [
  { title: 'Select', category: 'forms', version: 'v0.2.0', origin: 'components/ui/Select.vue' },
  { title: 'DatePicker', category: 'forms', version: 'v0.2.0', origin: 'components/ui/DatePicker.vue' },
  { title: 'Textarea', category: 'forms', version: 'v0.2.0', origin: 'components/ui/Textarea.vue' },
  { title: 'Radio / Switch', category: 'forms', version: 'v0.2.0' },
  { title: 'Dialog', category: 'overlay', version: 'v0.2.0', origin: 'components/ui/AppDialog.vue' },
  { title: 'Tooltip', category: 'overlay', version: 'v0.2.0' },
  { title: 'Toast', category: 'overlay', version: 'v0.2.0', origin: 'components/ui/ToastHost.vue' },
  { title: 'Tabs', category: 'navigation', version: 'v0.2.0' },
  { title: 'Table', category: 'data-display', version: 'v0.3.0' },
  { title: 'Tree', category: 'data-display', version: 'v0.3.0' },
  { title: 'Pagination', category: 'data-display', version: 'v0.3.0', origin: 'components/ui/Pagination.vue' },
  { title: 'Upload', category: 'forms', version: 'v0.3.0' },
  { title: 'Combobox', category: 'forms', version: 'v0.3.0' },
  { title: 'Drawer', category: 'overlay', version: 'v0.3.0' },
  { title: 'AI Chat', category: 'ai', version: 'v0.4.0', origin: 'components/ai/AIComposer.vue' },
  { title: 'RAG Citation', category: 'ai', version: 'v0.4.0' },
  { title: 'Agent Trace', category: 'ai', version: 'v0.4.0' },
  { title: 'Flashcard', category: 'learning', version: 'v0.5.0' },
  { title: 'Quiz', category: 'learning', version: 'v0.5.0' },
  { title: 'Interview', category: 'learning', version: 'v0.5.0' },
]

export function findStory(id: string): ComponentStory | undefined {
  return STORIES.find((story) => story.id === id)
}

export function storiesOf(category: CategoryId): ComponentStory[] {
  return STORIES.filter((story) => story.category === category)
}

export function plannedOf(category: CategoryId): PlannedEntry[] {
  return PLANNED.filter((entry) => entry.category === category)
}
