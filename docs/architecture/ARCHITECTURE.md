# 架构说明（v0.1.0）

## 1. 分层

```
packages/tokens  →  packages/ui  →  apps/studio
                                 ↘  examples/vue-vite（安装 tgz，不在 workspace 内）
```

| 层 | 职责 | 依赖 | 产出 |
| --- | --- | --- | --- |
| `tokens` | 设计令牌唯一来源（`--kf-*`）+ 旧名兼容桥（`--kb-*`） | 无 | CSS + 令牌名索引（TS） |
| `ui` | 组件实现 + 样式入口 | `vue`（peer）、`tokens`（构建期） | `dist/index.js`、`dist/style.css`、`dist/**/*.d.ts` |
| `studio` | 预览、属性面板、代码示例、令牌、路线图 | `ui`（源码 alias）、`tokens` | 静态站点 |
| `examples/vue-vite` | 外部消费方模拟 | `ui`（tgz 产物） | 静态站点 |

依赖方向是单向的：tokens 不知道 ui，ui 不知道 studio，studio 不跨项目引用原 KnowFlow。
`examples` 刻意放在 workspace 之外，避免 pnpm 用 workspace 链接"假装"安装成功。

## 2. 构建链路

```
src/index.ts
  ├─ import './styles/index.css'          → 解析 @beiluol/knowflow-tokens/tokens.css
  ├─ components/**/Kf*.vue                → @vitejs/plugin-vue 编译
  └─ export …

vite build (lib mode, es only)
  ├─ external: vue
  ├─ cssCodeSplit: false → dist/style.css（令牌 + 所有 scoped 样式）
  └─ dist/index.js（单 ESM 包，minify: false）

vue-tsc -p tsconfig.build.json
  └─ emitDeclarationOnly → dist/**/*.d.ts（与 index.js 同布局）
```

为什么不用 `preserveModules`：SFC 的 id 带 `.vue` 后缀，preserveModules 产出的文件名与
`vue-tsc` 生成的 `.vue.d.ts` 容易错位，导致消费方类型解析失败。单包 + 平铺 d.ts 更稳。
tree-shaking 依赖 `sideEffects` 字段（仅 CSS 有副作用）与 ESM 静态结构。

## 3. 样式策略

- 组件样式全部在 SFC `<style scoped>`，不产出全局类名污染。
- 令牌是唯一可跨组件共享的东西，通过 `dist/style.css` 提供。
- 消费方必须显式 `import '@beiluol/knowflow-ui/style.css'`；不做 JS 注入（避免 SSR 场景样式抖动）。
- 主题切换靠 `<html data-theme="dark">`，不在组件内维护主题状态。

## 4. 组件契约

| 组件 | 根节点 | 键 props | 关键 a11y |
| --- | --- | --- | --- |
| `KfButton` | `<button type>` | `variant/size/disabled/loading/iconName/iconPosition/iconOnly/block/ariaLabel` | `aria-busy`、`aria-label`（iconOnly）、focus-visible ring |
| `KfIcon` | `<svg viewBox="0 0 24 24">` | `name/size/color/decorative/ariaLabel` | 默认 `aria-hidden`；非装饰 `role="img"` |
| `KfInput` | `<div class="kf-form-field">` | `modelValue/type/label/help/error/required/disabled/readonly/*IconName` | `label for`、`aria-invalid`、`aria-describedby` |
| `KfCheckbox` | `<label>` 或 `<span>` | `modelValue/checked/label/disabled/indeterminate/as/value/trueValue/falseValue` | 原生 input、`aria-checked="mixed"`、焦点环 |

## 5. Studio 数据流

```
stories/<id>.ts  (props schema / examples / gallery / specs / measureSelector)
        │
        ├─→ PropControls  ── patch(key,value) ──→ state (reactive)
        │                                              │
        │                                              ├─→ previews/<Id>Preview.vue ─→ 真实 Kf* 组件
        │                                              └─→ useElementMetrics（getComputedStyle + ResizeObserver）
        └─→ gallery 用「同一份 preview + 局部 state 覆盖」渲染，不写第二套演示实现
```

`measureSelector` 必须指向组件自身（`.kf-button`、`.kf-field`、`.kf-checkbox-box`、图标 `svg`），
否则量到外层容器的继承样式，会显示"字重 400 / 背景透明"这类假数据。

## 6. 质量门禁

| 门禁 | 命令 | 当前结果 |
| --- | --- | --- |
| 类型 | `pnpm typecheck`（ui + studio） | 0 error |
| 单测 | `pnpm test` | 42 passed / 4 files |
| 构建 | `pnpm build` | ui 30.8 kB JS + 17.8 kB CSS；studio 129.9 kB JS |
| 产物检查 | `pnpm verify:dist` | 14 文件，无泄漏 |
| 消费验证 | `pnpm verify:consumer` | tgz 21.5 kB，安装后 typecheck + build 通过 |
| 浏览器 | 人工脚本（1440 / 390、Light/Dark） | Studio 54 项 + 消费示例 9 项 |

## 7. 已知边界

- 单包体积随组件增加而线性增长；超过 ~15 个组件时应改为按组件子路径导出（`./button` 等）。
- 图标全量常量会进入包体；补全图标前需评估子路径导出或 `lucide-vue-next` 依赖。
- Studio 用 hash 手写路由，不引入 vue-router——它只是工具，不需要路由库。
- 原 KnowFlow 的 `/dev/ui-components` 与本 Studio 是两套；后者不引用前者任何代码。
