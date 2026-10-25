/**
 * KnowFlow UI — public entry
 *
 * 只导出 v0.1.0 正式封装的四个组件及其类型/工具。
 * 未迁移组件不在本入口出现（避免"看起来已实现"）。
 */
import './styles/index.css'

export { default as KfButton } from './components/button/KfButton.vue'
export type {
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from './components/button/types'

export { default as KfIcon } from './components/icon/KfIcon.vue'
export type { IconSize } from './components/icon/types'
export { ICON_SIZE_PX } from './components/icon/types'

export { default as KfInput } from './components/input/KfInput.vue'
export type { InputModelValue, InputType } from './components/input/types'

export { default as KfCheckbox } from './components/checkbox/KfCheckbox.vue'
export type { CheckboxAs, CheckboxValue } from './components/checkbox/types'

/* Icon registry：内置图标清单 + 运行时扩展 */
export {
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from './components/icon/registry'
export type { BuiltinIconName } from './components/icon/registry'
export { BUILTIN_ICON_NAMES, ICON_SVG } from './components/icon/icons.generated'

export const version = '0.1.0'
