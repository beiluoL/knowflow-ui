# 架构说明（v0.2.0）

## 1. 分层

```
packages/tokens  →  packages/ui  →  packages/ai
                                 ↘  packages/learning
                                        │
apps/studio  ── 源码 alias ─────────────┘   （消费四包，不反向）
examples/vue-vite  ── 只装 tgz 产物 ────────┘
```

| 层 | 职责 | 依赖 | 产出 |
| --- | --- | --- | --- |
| `tokens` | 设计令牌唯一来源（8 组 / 75 个 `--kf-*`）+ 旧名兼容桥（`--kb-*`） | 无 | CSS + 令牌名索引（TS，`readTokenValues` 读运行时值） |
| `ui` | 44 个通用组件 + 样式入口 + 插件 | `vue`（peer）、`tokens`（构建期） | `dist/index.js`、`dist/style.css`、`dist/**/*.d.ts` |
| `ai` | 12 个 AI 展示组件（不发请求、零 `v-html`） | `vue`、`ui`（均 peer） | 同上 |
| `learning` | 11 个学习组件（不写记录、不评分） | `vue`、`ui`（均 peer） | 同上 |
| `studio` | 目录 / Story / 预览 / 属性 / API / 质量 / 令牌 | 四包（源码 alias） | 静态站点（端口 5180） |
| `examples/vue-vite` | 外部消费方模拟 | `ui`（tgz 产物） | 静态站点 |

依赖方向单向：`tokens` 不知道 `ui`，`ui` 不知道 `ai`/`learning`，四包都不知道 Studio 存在（产物里搜不到 `apps/studio`）。
`examples` 刻意在 workspace 之外，避免 pnpm 用 workspace 链接"假装"安装成功。

## 2. 构建链路

```
src/index.ts
  ├─ import './styles/index.css'          → 解析 @beiluol/knowflow-tokens/tokens.css
  ├─ components/index.ts                  → 逐组件 index.ts → Kf*.vue
  ├─ installer.ts                         → KfPlugin（KF_COMPONENTS：44 项）
  └─ export …（显式具名导出）

vite build (lib mode, es only, minify: false)
  ├─ external: vue                （ui）
  ├─ external: vue, @beiluol/knowflow-ui   （ai / learning）
  ├─ cssCodeSplit: false → dist/style.css
  └─ vue-tsc --emitDeclarationOnly → dist/**/*.d.ts
```

`minify: false` 是刻意的：产物要能被 `check-dist.mjs` 正则检查（emits 声明、别名泄漏、绝对路径），压缩后这些断言会失效。

## 3. 样式策略

- 组件样式写在各自 SFC 的 `<style scoped>`，类名 `kf-*` + BEM；
- 字号/圆角**必须**走令牌（`--kf-fs-*`、`--kf-radius-*`），`naming.spec.ts` 会拦裸数值；
- 令牌定义在 `packages/tokens/src/tokens.css`，深色由 `[data-theme="dark"]` 覆盖；
- `kb-compat.css` 是**单向**兼容桥（`--kb-* → var(--kf-*)`），只服务需要旧名的宿主，不复制整份全局样式；
- 没有裸元素选择器（`button {}`），可与 Element Plus / Naive 等共存。

## 4. 组件契约

- Props / Emits / Slots 一律 `Kf<Name>Props` / `Kf<Name>Emits` / `Kf<Name>Slots`，`types.ts` 单文件；
- `defineEmits<T>()` 必须声明运行时 emits（否则监听器会二次落进 `attrs`），`check-dist` 会核对；
- 受控组件同时支持 `v-model` 与 `modelValue` 单向传入；
- 复杂组件必须实现：键盘操作、焦点管理、`aria-*` 语义、卸载时清理监听/定时器；
- `KfDialog` / `KfDrawer` / `KfPopover` / `KfTooltip` 共用模态栈 `enterModal()` / `isTopModal()`，多层时只有最上层响应 Esc。

## 5. Studio 数据流

```
registry/entries.ts (65)  ──┐
registry/stories.ts (153) ──┼─→ 页面（Catalog / Component / Quality / Tokens）
registry/specs.ts         ──┘        │
                                     ▼
                    resolvePreview(entry) ──┬─→ GenericPreview（真实组件 + 白名单 Props + 自动 update 回写）
                                            └─→ previews/custom.ts（22 个场景组合：模态/集合/复合）

fixtures/index.ts ──→ PreviewApi { values, fixture, set(), log() } ──→ 画布 / PropsPanel / CodeSample
```

要点：

- **一个 API，两条链路**：面板改值走 `set()` 回到页面 state，组件 emit 也走 `set()`，不会出现两套真相；
- **白名单**：`GenericPreview` 只把 `componentPropKeys()` 认识的 Prop 传下去，文档写错的参数不会静默生效（Vue 会报 missing/extraneous）；
- **事件按真实声明挂**：`componentEmits()` 过滤，避免给不存在的事件挂监听；
- **质量数字现算**：`registry/quality.ts` 从注册表算，页面不写死数字。

## 6. 路由与深链接

hash 路由（`composables/useHashRoute.ts`），不用 vue-router：

```
#/                          → 目录
#/c/:entryId/:storyId       → 条目 + Story
#/c/:entryId/:storyId?tab=api&viewport=mobile
#/quality | #/tokens
```

`navigate()` 改 tab/viewport 时用 `replaceState`（不污染历史），切条目用 hash 跳转（可后退）。

## 7. 质量门禁（v0.2.0 实测）

| 门禁 | 命令 | 当前结果 |
| --- | --- | --- |
| 类型 | `pnpm typecheck` | 4 包 0 error |
| 单测 | `pnpm test` | **511 例 / 22 文件**（ui 133、ai 102、learning 79、studio 197） |
| 命名守门 | `pnpm test`（`naming.spec.ts`） | 11 项：目录 `index.ts` / BEM / `kb-` 残留 / 变量命名空间 / 裸元素 |
| 注册与共存 | `pnpm test`（`plugin.spec.ts`） | 12 项：kebab 标签 / 按需导入 / 重复注册 / 与 El* 共存 |
| Story 全量挂载 | `pnpm test`（`render.spec.ts`） | 153 例，Vue 警告即失败 |
| 构建 | `pnpm build` | ui 219.4 kB JS + 111.9 kB CSS；ai 74.2 + 46.3；learning 54.0 + 37.2；studio 352.1 kB JS + 197.7 kB CSS |
| 产物检查 | `pnpm verify:dist` | 3 包 / 223 文件，0 问题 |
| 打包与消费 | `pnpm pack:ui` + `pnpm verify:consumer` | tgz 105.5 kB，隔离安装后 typecheck + build 通过 |
| 浏览器 | `cd apps/studio && npx playwright test` | 22 例 / 15 张截图（5 视口、Light/Dark、200% 缩放、键盘、弹层） |
| 原项目零修改 | `node scripts/snapshot-original.mjs compare` | `originalUntouched: true`，0 问题 |

## 8. 已知边界

- 单包 219 kB（未压缩）已接近"该做子路径导出"的量级；下一版建议改为 `import { KfButton } from '@beiluol/knowflow-ui/button'`。
- 图标以常量内联（78 个 SVG），全量进包；补图标前需评估子路径导出或图标库。
- `KfTable` 是客户端表格，无虚拟滚动；`KfDatePicker` 只有格里高利历。
- 4 个 demo 条目（DataTable / InputGroup / ResizablePanels / Toolbar）尚未提升为组件。
- `ai` / `learning` 的 peer 写的是 `workspace:^0.2.0`，单独发布前需改成具体版本。
- 原 KnowFlow 的 `/dev/ui-components` 与本 Studio 是两套；后者不引用前者任何代码（只读参考，零修改）。
