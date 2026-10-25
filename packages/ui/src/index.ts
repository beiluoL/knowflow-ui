/**
 * KnowFlow UI — 公共入口
 *
 * 命名规范（详见仓库根目录 NAMING_CONVENTIONS.md）：
 *   - JS/TS 组件名：Kf + PascalCase（KfButton）
 *   - 模板标签：kf- + kebab-case（<kf-button>）
 *   - CSS 类：kf- 命名空间 + BEM（.kf-button__icon / .kf-button--primary）
 *   - CSS 变量：--kf- 命名空间（--kf-color-primary 语义组见 @beiluol/knowflow-tokens）
 *   - Props / Emits 类型：Kf + PascalCase + Props / Emits（KfButtonProps）
 *
 * 只导出 v0.1.0 正式封装的四个组件（+ 内部 KfFormField 不导出）。
 * 未迁移组件不在本入口出现，避免"看起来已实现"。
 */
import './styles/index.css'

/* 组件 + 类型 + 图标工具：统一由 components/index.ts 聚合 */
export {
  BUILTIN_ICON_NAMES,
  ICON_SIZE_PX,
  ICON_SVG,
  KfButton,
  KfCheckbox,
  KfIcon,
  KfInput,
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from './components/index'

export type {
  BuiltinIconName,
  BuiltinIconNameMap,
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  ButtonVariant,
  CheckboxAs,
  CheckboxValue,
  IconSize,
  InputModelValue,
  InputType,
  KfButtonEmits,
  KfButtonProps,
  KfButtonSlots,
  KfCheckboxEmits,
  KfCheckboxProps,
  KfCheckboxSlots,
  KfIconProps,
  KfInputEmits,
  KfInputProps,
  KfInputSlots,
} from './components/index'

/* 全局注册插件（可选）：app.use(KfPlugin) 后可直接写 <kf-button> */
export { KF_COMPONENTS, KF_TAGS, KfPlugin } from './installer'
export type { KfComponentName } from './installer'

export const version = '0.1.0'
