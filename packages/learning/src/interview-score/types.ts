export interface KfInterviewScoreProps {
  /** 得分 */
  score?: number
  /** 满分，默认 100 */
  maxScore?: number
  /** 标题，如「综合得分」 */
  label?: string
  /**
   * 等级文案。不传时按得分比例给一个**展示用**默认档位（优秀 / 良好 / 合格 / 待提升）——
   * 真实评级标准因场景而异，建议宿主显式传入。
   */
  level?: string
  showLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface KfInterviewScoreSlots {
  /** 分数下方补充（如维度摘要） */
  default?: () => unknown
}
