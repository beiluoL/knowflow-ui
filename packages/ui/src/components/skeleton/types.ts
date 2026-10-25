export type KfSkeletonType = 'list' | 'card' | 'line'

export interface KfSkeletonProps {
  /** 重复行数 */
  rows?: number
  /** 形态：list 列表卡片 / card 卡片网格 / line 单行 */
  type?: KfSkeletonType
  /** type=card 时的列数（1–3） */
  cols?: number
  /** 呼吸动画；尊重 prefers-reduced-motion */
  animated?: boolean
  /** 无障碍：容器默认对读屏隐藏，由宿主用 aria-busy 表达加载中 */
  label?: string
}

export interface KfSkeletonSlots {
  /** 无插槽：骨架屏不承载内容 */
  default?: never
}
