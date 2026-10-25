export interface KfThinkingPanelProps {
  /** 面板标题 */
  title?: string
  /**
   * 已经由宿主判定「可公开」的思考文本。
   * 组件只负责展示与折叠，不做任何推理过程的截取或补全 ——
   * 是否展示思维链属于产品与合规决策，不属于组件。
   */
  content?: string
  /** 仍在生成：标题区显示脉冲点，并默认展开 */
  streaming?: boolean
  /** 宿主传入的耗时文本（组件不做计时，避免与宿主生命周期不一致） */
  duration?: string
  /** 初始是否展开（受控于一次性初值，之后由用户点击决定） */
  defaultOpen?: boolean
  /** 是否允许折叠；为 false 时始终展示内容 */
  collapsible?: boolean
  /** 内容为空时的占位文案 */
  emptyText?: string
  ariaLabel?: string
}

export interface KfThinkingPanelEmits {
  toggle: [open: boolean]
}

export interface KfThinkingPanelSlots {
  default?: () => unknown
  /** 标题右侧的附加信息（token 数、模型名等） */
  'header-extra'?: () => unknown
}
