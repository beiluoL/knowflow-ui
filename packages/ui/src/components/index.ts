/**
 * 公共组件总入口（内部聚合层）。
 *
 * 规则：
 *   - 只在这里出现「已正式公开」的组件；
 *   - 组件实现与类型都从各自的 `components/<name>/index.ts` 汇总，避免多处维护；
 *   - 新增组件时只改本文件一行 + 一个目录，不在根入口散落重复导出。
 */

/* Button */
export { KfButton } from './button/index'
export type {
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  ButtonVariant,
  KfButtonEmits,
  KfButtonProps,
  KfButtonSlots,
} from './button/index'

/* Icon（含注册表 API） */
export { KfIcon } from './icon/index'
export { ICON_SIZE_PX } from './icon/index'
export type { IconSize, KfIconProps } from './icon/index'
export {
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from './icon/index'
export type { BuiltinIconName, BuiltinIconNameMap } from './icon/index'
export { BUILTIN_ICON_NAMES, ICON_SVG } from './icon/index'

/* Input */
export { KfInput } from './input/index'
export type { InputModelValue, InputType, KfInputEmits, KfInputProps, KfInputSlots } from './input/index'

/* Checkbox */
export { KfCheckbox } from './checkbox/index'
export type {
  CheckboxAs,
  CheckboxValue,
  KfCheckboxEmits,
  KfCheckboxProps,
  KfCheckboxSlots,
} from './checkbox/index'
