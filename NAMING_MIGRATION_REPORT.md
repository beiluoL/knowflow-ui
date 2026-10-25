# 命名规范统一 · 迁移报告

> 执行时间：2026-10-25
> 范围：`knowflow-ui` 独立仓库（`@beiluol/knowflow-ui` v0.1.0，**未发布**）
> 目标：在不改变现有视觉效果与组件行为的前提下，统一组件名、CSS 命名空间、导出结构与类型名。

---

## 1. 审计结论（改动前）

| 项目 | 审计结果 |
| --- | --- |
| 实际组件数量 | **5 个 SFC**：KfButton / KfIcon / KfInput / KfCheckbox + 内部 KfFormField |
| 已公开组件 | 4 个（KfFormField 不从根入口导出） |
| 展示条目 | Studio 4 个组件页 + 7 个导航页；`PLANNED` 清单 20 项（仅清单，无空文件） |
| 现有组件命名 | ✅ 已是 `Kf + PascalCase`，无需改名 |
| 现有 CSS 命名空间 | ⚠️ 全部 `kf-` 前缀，但 **15 个类名不符合 BEM**（单连字符当元素名） |
| CSS 变量 | ✅ `--kf-*`；组件内无 `--kb-*`（`--kb-*` 只存在于 tokens 的兼容桥） |
| 公共导出入口 | ⚠️ 只有根 `src/index.ts` 一个文件；**组件目录无 `index.ts`** |
| Props/Emits 类型 | ❌ 内联在 SFC 中，**未导出** `KfXxxProps` / `KfXxxEmits` |
| 全局注册能力 | ❌ 不存在 Vue Plugin，`<kf-button>` 全局标签**无法解析**（未注册） |
| 指定的审计文档 | `COMPONENT_MATRIX.md` / `AUDIT.md` / `PLAN.md` / `UI_REVIEW.md` / `TEST_REPORT.md` / `OPEN_SOURCE_REFERENCES.md` **在仓库中均不存在**（已用 `find` 全仓确认）；现存的是 `COMPONENT_MIGRATION.md`、`docs/migration/MIGRATION_MATRIX.md`、`docs/architecture/ARCHITECTURE.md` |

> 说明：本次是**增量修正**，没有重建组件库、没有重新封装任何组件、没有新增组件。

---

## 2. 修改的实际文件清单（33 项）

### 2.1 组件与类型（12）

| 文件 | 变更 |
| --- | --- |
| `packages/ui/src/components/button/KfButton.vue` | props/emits 改用导入类型；注释补命名说明 |
| `packages/ui/src/components/button/types.ts` | 新增 `KfButtonProps` / `KfButtonEmits` / `KfButtonSlots` |
| `packages/ui/src/components/icon/KfIcon.vue` | props 改用 `KfIconProps` |
| `packages/ui/src/components/icon/types.ts` | 新增 `KfIconProps` |
| `packages/ui/src/components/input/KfInput.vue` | props/emits 改用导入类型；CSS 类名 BEM 化 |
| `packages/ui/src/components/input/types.ts` | 新增 `KfInputProps` / `KfInputEmits` / `KfInputSlots` |
| `packages/ui/src/components/checkbox/KfCheckbox.vue` | 泛型 props/emits 改用导入类型；CSS 类名 BEM 化 |
| `packages/ui/src/components/checkbox/types.ts` | 新增 `KfCheckboxProps<T>` / `KfCheckboxEmits<T>` / `KfCheckboxSlots` |
| `packages/ui/src/components/form-field/KfFormField.vue` | props 改用 `KfFormFieldProps`；CSS 类名 BEM 化 |
| `packages/ui/src/components/form-field/types.ts` | **新增**（内部类型） |
| `packages/ui/src/components/{button,icon,input,checkbox,form-field}/index.ts` | **新增** 5 个目录入口 |
| `packages/ui/src/components/index.ts` | **新增** 公共组件聚合层 |

### 2.2 导出与注册（2）

| 文件 | 变更 |
| --- | --- |
| `packages/ui/src/installer.ts` | **新增** `KfPlugin` / `KF_COMPONENTS` / `KF_TAGS` |
| `packages/ui/src/index.ts` | 改为显式具名导出 + 新增类型/插件导出 |

### 2.3 测试（6）

| 文件 | 变更 |
| --- | --- |
| `src/__tests__/naming.spec.ts` | **新增** 11 个用例：文件命名、`index.ts` 存在性、BEM、`kb-` 残留、变量命名空间、裸元素选择器、类型导出 |
| `src/__tests__/plugin.spec.ts` | **新增** 12 个用例：插件注册、kebab/Pascal 标签解析、`script setup` 导入 + kebab 标签匹配、未注册时不可用、按需导入、与 Element Plus 共存 |
| `src/__tests__/fixtures/GlobalTags.vue` | **新增** 全局标签渲染夹具 |
| `src/__tests__/fixtures/Coexistence.vue` | **新增** 共存渲染夹具 |
| `src/__tests__/{input,checkbox}.spec.ts` | 同步新类名 |
| `src/__tests__/button.spec.ts` | 新增 2 个回归用例（click 只触发一次、禁用/加载不触发） |

### 2.4 Studio（7）

`apps/studio/src/stories/{types,button,icon,input,checkbox}.ts`（新增 `naming` / `events` / `slots` 字段）、
`apps/studio/src/pages/ComponentPage.vue`（新增「命名与 API」区块：JS 名 / 模板标签 / CSS 类名 / 导出类型 / 导入示例 / Events 表 / Slots 表）、
`apps/studio/src/pages/OverviewPage.vue`（用法示例改为 PascalCase + kebab 混排，并说明 `KfPlugin`）。

### 2.5 脚本与文档（6）

`scripts/check-dist.mjs`（新增 BEM 类名、类型导出、运行时 emits、裸元素选择器检查）、
`NAMING_CONVENTIONS.md`（**新增**）、`NAMING_MIGRATION_REPORT.md`（**新增**，本文件）、
`README.md`、`COMPONENT_MIGRATION.md`、`docs/**`（同步）。

---

## 3. 组件命名迁移映射表

| 原组件名 | 新组件名 | 原 CSS | 新 CSS | 兼容风险 |
| --- | --- | --- | --- | --- |
| `KfButton` | `KfButton`（不变） | `.kf-button*` | 不变（原本已合规） | 无 |
| `KfIcon` | `KfIcon`（不变） | `.kf-icon` / `.kf-icon--img` / `.kf-icon--missing` | 不变 | 无 |
| `KfInput` | `KfInput`（不变） | `.kf-field` / `.kf-field__icon` / `.kf-input`（原生框） | `.kf-input`（表面）/ `.kf-input__icon` / `.kf-input__control`（原生框） | 低：v0.1.0 未发布，无外部消费者；Studio 测量选择器已同步 |
| `KfCheckbox` | `KfCheckbox`（不变） | `.kf-checkbox-box` / `-box-mixed` / `-input` / `-mark` / `-check` / `-label` | `.kf-checkbox__box` / `__box--mixed` / `__input` / `__mark` / `__mark--check` / `__label` | 低（同上） |
| `KfFormField`（内部） | `KfFormField`（不变） | `.kf-form-label` / `-required` / `-help` / `-error` | `.kf-form-field__label` / `__required` / `__help` / `__error` | 无（内部组件） |

**`KfInput` 的一处语义修正**：原实现里 `.kf-field`（灰色表面）与 `.kf-input`（原生 `<input>`）命名倒挂——
block 名落到了内层原生元素上。本次把 `.kf-input` 提升为组件 block（表面），原生输入改为 `.kf-input__control`。

---

## 4. CSS 类名迁移情况

| 原类名 | 新类名 |
| --- | --- |
| `.kf-field` | `.kf-input` |
| `.kf-field--error` / `--disabled` / `--readonly` | `.kf-input--error` / `--disabled` / `--readonly` |
| `.kf-field__icon` | `.kf-input__icon` |
| `.kf-input`（原生框） | `.kf-input__control` |
| `.kf-checkbox-box` | `.kf-checkbox__box` |
| `.kf-checkbox-box-mixed` | `.kf-checkbox__box--mixed` |
| `.kf-checkbox-input` | `.kf-checkbox__input` |
| `.kf-checkbox-mark` | `.kf-checkbox__mark` |
| `.kf-checkbox-check` | `.kf-checkbox__mark--check` |
| `.kf-checkbox-label` | `.kf-checkbox__label` |
| `.kf-form-label` | `.kf-form-field__label` |
| `.kf-form-required` | `.kf-form-field__required` |
| `.kf-form-help` | `.kf-form-field__help` |
| `.kf-form-error` | `.kf-form-field__error` |

未改动的类名（本已合规）：`.kf-button` `__icon` `__label` `__spinner` `--primary/--secondary/--outline/--ghost/--text/--danger/--sm/--md/--lg/--block/--icon-only/--loading-text`、
`.kf-icon` `--img` `--missing`、`.kf-checkbox` `--disabled` `--embedded`、`.kf-form-field` `__control` `__meta` `--unlabelled`、`.kf-input__control` 等。

**CSS 变量未改名**：`--kf-field-*`（如 `--kf-field-surface` / `--kf-field-padding`）保持原样。它们是
**表单字段令牌组**（Input 与未来的 Textarea/Select 共用），已在 `--kf-` 命名空间内且被 Studio 令牌页与
`dist` 检查引用；改名会引入无收益的视觉回归风险。

**视觉影响**：仅类名与选择器重写，未改动任何属性值、令牌值或 DOM 结构，像素级结果不变。

---

## 5. 公共 API 变更

### 5.1 新增（向后兼容）

```ts
// 类型
import type {
  KfButtonProps, KfButtonEmits, KfButtonSlots,
  KfIconProps,
  KfInputProps, KfInputEmits, KfInputSlots,
  KfCheckboxProps, KfCheckboxEmits, KfCheckboxSlots,
} from '@beiluol/knowflow-ui'

// 全局注册
import { KfPlugin, KF_COMPONENTS, KF_TAGS } from '@beiluol/knowflow-ui'
app.use(KfPlugin)
```

原有 `ButtonVariant` / `ButtonSize` / `ButtonType` / `ButtonIconPosition` / `IconSize` / `ICON_SIZE_PX` /
`InputModelValue` / `InputType` / `CheckboxAs` / `CheckboxValue` / `BuiltinIconName` / `BUILTIN_ICON_NAMES` /
`ICON_SVG` / `registerIcon` / `unregisterIcon` / `isBuiltinIcon` / `getIconMarkup` / `listIconNames` / `version`
**全部保留**，签名不变。

### 5.2 变更（内部结构）

- 根入口改为显式具名导出（原为逐条 `export`，等价但顺序与来源改为经 `components/index.ts` 聚合）；
- 每个组件目录新增 `index.ts`，`import` 路径多一层可选入口（根入口行为不变）；
- `KfIconProps.name` 仍是 `BuiltinIconName | (string & {})`，图标名自动补全能力保留。

### 5.3 未变更

组件 props、默认值、事件名、事件签名、插槽、ARIA 属性、DOM 层级结构、CSS 变量取值——**全部未变**。

---

## 6. 兼容性处理说明

1. **运行时 emits 声明必须保留**：把 `defineEmits` 的内联类型换成导入类型后，若编译器不生成运行时
   `emits`，父级 `@click` 会落进 `attrs` 二次触发并绕过 `disabled` 守卫。
   已用 `@vue/compiler-sfc` 实测确认导入类型会生成 `emits: ["click"]`，并在 `button.spec.ts` 加两个
   回归用例（开启时只触发 1 次、禁用/加载时 0 次）钉死该行为。
2. **`--kb-*` 兼容桥保留**：`@beiluol/knowflow-tokens/kb-compat.css` 未删除，方向仍为
   `--kb-* = var(--kf-*)`；组件库自身不引用任何 `--kb-*`。
3. **不新增废弃别名**：`0.1.0` 从未 publish（`npm view @beiluol/knowflow-ui` 无记录），仓内消费者只有
   `apps/studio` 与 `examples/vue-vite`（后者装 tarball）。为不存在的消费者保留旧类名只会制造
   "两套类名都生效但没人知道该用哪个"的长期债务，故直接改名并全量同步引用点。
   若未来确有外部消费者，再按 CHANGELOG 的 `BREAKING CHANGE` 流程处理。
4. **原 KnowFlow 主项目零改动**：`grep -rn "knowflow-ui|@beiluol" frontend/` 命中 **0** 次——
   主项目从未依赖本组件库，仍使用自己的 `frontend/src/components/ui/*`（326 处 import）。
   因此本次改名**不可能**导致主项目启动失败；主项目构建已实测通过（见第 7 节）。
5. **不与 Element Plus 冲突**：类名 `kf-` / 变量 `--kf-` 前缀、无裸元素选择器、无全局 `outline: none`；
   已用模拟 `ElButton` / `ElInput` 的夹具验证同页共存，类名互不污染。

---

## 7. 测试执行结果

| 项目 | 命令 | 结果 |
| --- | --- | --- |
| 组件库类型检查 | `pnpm --filter @beiluol/knowflow-ui typecheck` | ✅ 0 error |
| 组件库单测 | `pnpm --filter @beiluol/knowflow-ui test` | ✅ **67/67 passed**（6 文件） |
| PascalCase 导入 ↔ kebab 标签 | `plugin.spec.ts`「PascalCase 导入 + kebab-case 标签可匹配」 | ✅ 真实 SFC 编译后 `<kf-button>` / `<kf-input v-model>` 均渲染成功（无插件、仅 script setup 绑定） |
| 组件库构建 | `pnpm --filter @beiluol/knowflow-ui build` | ✅ `dist/index.js` 32.67 kB / `style.css` 18.35 kB |
| 产物检查（增强后） | `pnpm verify:dist` | ✅ 22 个产物文件（新增类名/类型/emits/裸选择器检查） |
| Studio 类型检查 | `pnpm --filter @knowflow-ui/studio typecheck` | ✅ 0 error（并已验证门禁非空跑：注入错误类型文件会报 TS2322） |
| Studio 构建 | `pnpm --filter @knowflow-ui/studio build` | ✅ 133.78 kB JS / 38.72 kB CSS |
| 打包 | `pnpm pack:ui` | ✅ `artifacts/beiluol-knowflow-ui-0.1.0.tgz` 25,448 B（vite 报 24.9 kB） |
| 消费验证 | `node scripts/verify-consumer.mjs` | ✅ 安装 0.1.0；顶层仅 `dist, package.json`；`vue-tsc` 0 error；`vite build` 通过（88.70 kB JS + 15.67 kB CSS） |
| Studio 浏览器回归 | Playwright + 本机 Chrome（1440 / 390、Light/Dark） | ✅ **74/74**：命名区块内容、Events/Slots 条数、计算样式（按钮 38px/14px/500/6px/主色、输入 44px/浅灰表面/内层透明、复选 20×20/3px/无灰影）、勾选态与勾可见性不变量、键盘焦点环、暗色切换、390 溢出 0px、控制台无 error |
| 原 KnowFlow 前端构建 | `frontend: npm run build` | ✅ 通过（15.28s），父仓库仅 `.gitignore` 一处既有改动，组件/页面/Store 零改动 |

单测明细：`button 12` / `icon 10` / `input 12` / `checkbox 10` / `naming 11` / `plugin 12`。

未执行项：**ESLint 未运行**——仓库不存在 ESLint 配置文件与依赖（`ls | grep eslint` 为空），
按"不随意升级/新增依赖"边界本次不引入。

---

## 8. 尚未完成事项

| 项 | 原因 / 状态 |
| --- | --- |
| npm publish | 按需求本次不发布；`@beiluol` scope 归属仍未验证 |
| Git tag `v0.1.0` | 需人工确认后创建 |
| Git push | 待确认（默认只做本地 commit） |
| ESLint / Prettier 落地 | 仓库无配置，新增属独立工程决策 |
| 原 KnowFlow 迁移到本库 | 主项目 326 处仍用自有组件；迁移属版本级改造，需单独排期与回归，不在本次范围 |
| 真实 Element Plus 共存验证 | 未安装 `element-plus` 依赖；当前用模拟 `ElButton`/`ElInput` 验证注册、解析、类名隔离，并做结构性证明（无裸元素选择器）。真实包验证待后续 |
| Vue 自动导入（unplugin-vue-components）解析器 | 未提供 resolver；当前全局注册与按需导入两条路都已可用 |
