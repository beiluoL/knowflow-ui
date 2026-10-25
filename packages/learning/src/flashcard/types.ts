export interface KfFlashcardProps {
  /** 正面文本（问题） */
  front?: string
  /** 背面文本（答案） */
  back?: string
  /**
   * 是否已翻到背面。
   * 组件支持受控（v-model:flipped）与非受控两种用法：
   * 传了 `flipped` 就完全跟随外部值，不传则由内部状态管理。
   */
  flipped?: boolean
  flippable?: boolean
  frontLabel?: string
  backLabel?: string
  /** 底部快捷键提示 */
  hint?: string
  tags?: string[]
  /** 当前位置（仅展示，不做计算） */
  index?: number
  total?: number
  disabled?: boolean
  ariaLabel?: string
}

export interface KfFlashcardEmits {
  'update:flipped': [flipped: boolean]
  flip: [flipped: boolean]
}

export interface KfFlashcardSlots {
  /** 正面内容（不要放按钮/链接等可交互元素，交互请放 footer） */
  front?: () => unknown
  /** 背面内容 */
  back?: () => unknown
  /** 翻转按钮下方区域（评分按钮通常放这里） */
  footer?: () => unknown
  /** 头部右侧（标签、来源等） */
  meta?: () => unknown
}
