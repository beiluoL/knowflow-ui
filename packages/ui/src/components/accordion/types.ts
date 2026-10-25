export interface KfAccordionProps {
  /** 展开项 name 列表（受控） */
  modelValue?: string[]
  /** 允许多项同时展开；false 时始终保持最多一项 */
  multiple?: boolean
  /** 是否允许全部收起 */
  collapsible?: boolean
}

export interface KfAccordionEmits {
  'update:modelValue': [names: string[]]
  change: [names: string[]]
}

export interface KfAccordionSlots {
  /** 放 KfAccordionItem */
  default?: () => unknown
}

export interface KfAccordionItemProps {
  /** 唯一标识，参与 modelValue 数组 */
  name: string
  title: string
  disabled?: boolean
}

export interface KfAccordionItemSlots {
  default?: () => unknown
  /** 覆盖标题文字（仍由内层按钮承载交互） */
  title?: () => unknown
}
