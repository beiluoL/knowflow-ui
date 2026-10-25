/**
 * KfIcon 公共类型
 *
 * 命名规范：`Kf + PascalCase + Props`。
 */
import type { BuiltinIconName } from './registry'

export type IconSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/** 语义尺寸 → 像素（与 KnowFlow 图标阶梯一致） */
export const ICON_SIZE_PX: Record<IconSize, number> = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
}

export interface KfIconProps {
  /** 图标名（内置名有类型提示，自定义图标需先 registerIcon） */
  name: BuiltinIconName | (string & {})
  /** 语义尺寸或像素数值，默认 md = 16px */
  size?: IconSize | number
  /** 颜色，缺省继承 currentColor */
  color?: string
  /** 装饰性图标（默认 true）：对屏幕阅读器隐藏；设 false 时必须提供 ariaLabel */
  decorative?: boolean
  /** 非装饰图标的可访问名称 */
  ariaLabel?: string
}
