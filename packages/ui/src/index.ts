/**
 * KnowFlow UI — 公共入口
 *
 * 命名规范（详见仓库根目录 NAMING_CONVENTIONS.md）：
 *   - JS/TS 组件名：Kf + PascalCase（KfButton）
 *   - 模板标签：kf- + kebab-case（<kf-button>）
 *   - CSS 类：kf- 命名空间 + BEM（.kf-button__icon / .kf-button--primary）
 *   - CSS 变量：--kf- 命名空间（令牌见 @beiluol/knowflow-tokens）
 *   - Props / Emits 类型：Kf + PascalCase + Props / Emits（KfButtonProps）
 *
 * 只导出**已正式封装并有测试**的组件。未迁移组件不在本入口出现，
 * 避免"看起来已实现"；它们的状态见 docs/migration/v5-to-ui/COMPONENT_MATRIX.md。
 */
import './styles/index.css'

/* 组件 + 类型 + 图标工具 + useToast：统一由 components/index.ts 聚合 */
export * from './components/index'

/* 全局注册插件（可选）：app.use(KfPlugin) 后可直接写 <kf-button> */
export { KF_COMPONENTS, KF_TAGS, KfPlugin } from './installer'
export type { KfComponentName } from './installer'

export const version = '0.2.0'
