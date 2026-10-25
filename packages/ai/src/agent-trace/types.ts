export type KfAgentStepStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped'

export type KfAgentStepKind = 'plan' | 'tool' | 'observation' | 'decision' | 'final'

export interface KfAgentStep {
  id: string
  title: string
  /** 一行说明（宿主给，可由模型输出但须已脱敏） */
  description?: string
  kind?: KfAgentStepKind
  status?: KfAgentStepStatus
  /** 耗时文本，组件不自行计时 */
  duration?: string
  /** 覆盖默认图标名 */
  iconName?: string
  /** 展开后的详情文本；为空表示不可展开 */
  detail?: string
}

export interface KfAgentTraceProps {
  steps?: KfAgentStep[]
  title?: string
  /** 紧凑模式：隐藏描述与详情，仅保留步骤标题 */
  compact?: boolean
  /** 初始展开的步骤 id 列表 */
  expandedIds?: string[]
  emptyText?: string
  ariaLabel?: string
}

export interface KfAgentTraceEmits {
  select: [step: KfAgentStep, index: number]
}

export interface KfAgentTraceSlots {
  step?: (props: { step: KfAgentStep; index: number }) => unknown
  empty?: () => unknown
  header?: () => unknown
}
