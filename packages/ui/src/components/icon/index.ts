/**
 * KfIcon 模块入口：组件 + 尺寸类型 + 图标注册表 API。
 */
export { default as KfIcon } from './KfIcon.vue'
export { ICON_SIZE_PX } from './types'
export type { IconSize, KfIconProps } from './types'
export {
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from './registry'
export type { BuiltinIconName, BuiltinIconNameMap } from './registry'
export { BUILTIN_ICON_NAMES, ICON_SVG } from './icons.generated'
