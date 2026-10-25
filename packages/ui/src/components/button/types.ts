/**
 * KfButton 公共类型
 *
 * 命名规范：`Kf + PascalCase + Props / Emits`。
 * Props / Emits 从 SFC 抽出，供消费者 `import type`、为包装组件做泛型约束，
 * 同时让 vue-tsc 产出的 d.ts 有稳定可引用的类型名。
 */
import type { BuiltinIconName } from '../icon/registry'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'
export type ButtonIconPosition = 'left' | 'right'

export interface KfButtonProps {
  /** 视觉变体。ghost 与 outline 在本库中同义（沿用 KnowFlow 历史契约） */
  variant?: ButtonVariant
  /** sm 32px / md 38px / lg 44px */
  size?: ButtonSize
  /** 原生 button type */
  type?: ButtonType
  disabled?: boolean
  /** 加载态：禁用点击并显示旋转图标 */
  loading?: boolean
  /** 撑满容器宽度 */
  block?: boolean
  /** 前置/后置图标名（内置名有提示，自定义需先 registerIcon） */
  iconName?: BuiltinIconName | (string & {})
  /** 仅图标按钮：正方形，必须提供 ariaLabel */
  iconOnly?: boolean
  /** 可访问名称（iconOnly 时必填） */
  ariaLabel?: string
  /** 原生 title 提示 */
  title?: string
  /** 图标位置 */
  iconPosition?: ButtonIconPosition
}

/**
 * 事件定义（对象式元组，与 SFC 内 `defineEmits` 完全对应）。
 * 事件名保持 Vue 原生约定，不添加 kf 前缀。
 */
export type KfButtonEmits = {
  click: [event: MouseEvent]
}

/** 插槽定义（仅用于文档与类型提示，SFC 未启用 defineSlots） */
export type KfButtonSlots = {
  default?: () => unknown
}
