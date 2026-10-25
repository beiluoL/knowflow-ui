/** KfIcon 公共类型 */
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
