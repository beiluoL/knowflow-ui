# 组件迁移记录（COMPONENT_MIGRATION）

记录 v0.1.0 的四个组件：从哪来、拆掉了什么、接口是否兼容、样式有什么差异、还没做什么。

原始项目：`/Users/beiluo/Documents/alProject/qoderProject/knowflow`
新项目：`knowflow-ui/`（独立 Git 仓库）

---

## 1. 迁移审计矩阵

审计依据：逐文件阅读当前源码（不是 V4 报告）+ 依赖 grep。V4 报告显示 53 个展示条目，但其中包含
Demo-only 与未实现条目，**不等于 53 个可迁移的生产组件**。

| 组件 | 源码位置（原项目） | 当前依赖 | 可独立运行 | 首版迁移 | 风险 |
| --- | --- | --- | --- | --- | --- |
| Button | `frontend/src/components/ui/Button.vue` | Icon、`--kb-*` 令牌、`--kb-button-*` | ✅ 是 | ✅ | 低：仅图标组件与令牌耦合 |
| Icon | `frontend/src/components/ui/Icon.vue`（59 KB，212 个内联分支） | 仅 vue；另有 iconfont 字体与图片/SVG 代码分支 | ✅ 是 | ✅ | 中：全量带入体积大；iconfont 依赖宿主字体 |
| Input | `frontend/src/components/ui/Input.vue` | `@/` 别名、Tailwind 原子类、Icon、FormField、全局 `.kb-field/.kb-input` 样式 | ⚠️ 需解耦 | ✅ | 中：样式一半在组件内、一半在 `style.css` |
| Checkbox | `frontend/src/components/ui/Checkbox.vue` | Icon、全局 `.kb-checkbox*` 样式（全部在 `style.css`） | ⚠️ 需解耦 | ✅ | 中：视觉样式 100% 在全局表里，组件内没有 style 块 |
| FormField | `frontend/src/components/ui/FormField.vue` | 无（纯结构） | ✅ 是 | ✅（内部） | 低：作为 Input 的 label/meta 轨道，不对外导出 |
| Select / CascaderSelect | `components/ui/Select.vue`、`CascaderSelect.vue` | `composables/use-anchored-panel`、`select-position`、`select-types`、浮动定位、键盘管理 | ❌ 否 | ⛔ | 高：需先抽 3 个定位/交互 composable |
| DatePicker / DateRange / DateTime / Month / Year / Time | `components/ui/Date*.vue`、`Time*.vue` | `date-picker-utils`、`date-time-format`、`datetime-picker-utils`、`time-picker-utils` | ❌ 否 | ⛔ | 高：日期工具与业务时区约定绑在一起 |
| AppDialog / ConfirmDialog / ToastHost | `components/ui/` | `modal-stack`、`utils/dialog`、`utils/toast` 单例 | ❌ 否 | ⛔ | 高：单例宿主与全局挂载，需重新设计提供方式 |
| 业务组件（AIComposer、Flashcard 等） | `components/ai/*`、`components/flashcards/*` | Pinia store、后端 API、学习事件 | ❌ 否 | ⛔ | 极高：属于业务，不进组件库 |

结论：首版只迁 4 个（+1 个内部 FormField），先把「提取 → 解耦 → 构建 → 预览 → 安装 → 验证」跑通。

---

## 2. 逐组件差异

### 2.1 Button → `KfButton`

| 维度 | 原实现 | 新实现 | 说明 |
| --- | --- | --- | --- |
| 类名前缀 | `.kb-button` | `.kf-button` | 避免与宿主旧样式互相覆盖 |
| 令牌 | `--kb-btn-height-*` 等 | `--kf-button-height-*` 等 | 数值完全一致（32/38/44、12/16/24、6px 圆角） |
| 图标 | 全局 `Icon` | `KfIcon` | 相对导入，无别名 |
| 变体 | `primary/secondary/outline/ghost/text/danger` | 同 | `ghost` 与 `outline` 仍同义（保留历史契约） |
| 尺寸/字体 | lg 时图标 18px | 同 | 其余 16px；文字恒 14px/500 |
| 点击 | 直接 `$emit('click')` | 增加 `disabled/loading` 前置拦截 | 原生 disabled 已拦，但 loading 需防重复提交 |
| aria-label | `:aria-label="ariaLabel"` 总是绑定 | 仅在有值时绑定 | 避免 `aria-label=""` 造出空名称 |
| 样式位置 | 组件 scoped | 组件 scoped | 无变化 |

**接口兼容性**：props 完全一致（`variant/size/type/disabled/loading/block/iconName/iconOnly/ariaLabel/title/iconPosition`），
事件一致（`click`），默认插槽一致。唯一行为差异是 loading/disabled 时不再派发 click（原实现依赖原生 disabled）。

### 2.2 Icon → `KfIcon`

| 维度 | 原实现 | 新实现 | 说明 |
| --- | --- | --- | --- |
| 图标来源 | 212 个 `<template v-else-if>` 内联分支 | `icons.generated.ts` 常量表（78 个） | 由 `scripts/export-icons.mjs` 从原文件提取，路径逐字一致 |
| 渲染方式 | 模板分支 | `v-html` 注入 SVG 内部标记 | 输出结构与原实现同为 `<svg viewBox="0 0 24 24" stroke="currentColor">` |
| 自定义图标 | 图片 URL / iconfont Unicode / iconfont class / 裸 SVG 代码 | 图片 URL + `registerIcon()` | **iconfont 与裸 SVG 代码分支未迁移**（依赖宿主字体/信任边界不清） |
| 类型 | `name: string` | `BuiltinIconName \| (string & {})` | 内置名有字面量补全，同时保留扩展自由 |
| 尺寸 | 语义 8 档 + 数字 | 同 | 映射抽到 `types.ts` 的 `ICON_SIZE_PX` |
| a11y | `decorative` + `ariaLabel` | 同 + 开发环境告警 | 缺 label 或未知图标时 warn，不静默渲染空白 |
| 未知图标 | 渲染空 `<svg>` | 渲染 `.kf-icon--missing` 占位 | 便于发现漏迁 |

未迁移的 134 个图标：保留在 Roadmap（`v0.2.0` 起按需补充），不进入初始包以控制体积（当前 11.6 KB 源文件）。

### 2.3 Input → `KfInput`

| 维度 | 原实现 | 新实现 | 说明 |
| --- | --- | --- | --- |
| 导入 | `@/components/ui/Icon.vue` | `../icon/KfIcon.vue` | 去掉 `@/` 别名 |
| class | `kb-input w-full px-3 py-2 text-sm transition-colors duration-200` | 纯 `kf-input` | 去掉 Tailwind 依赖 |
| 外壳样式 | 全局 `.kb-field`（`style.css`） | 组件内 scoped `.kf-field` | 消费方不必再导入宿主样式表 |
| 表面色 | `--kb-field-surface = #E8ECF1` | `--kf-field-surface`（同值） | 视觉一致 |
| 高度 | `--kb-input-height: 44px` | `--kf-input-height: 44px` | 一致 |
| 聚焦 | 仅表面变深，无外框 | 同 + 显式 `outline:0` 于内部 input | 不引入全局 `outline:none` |
| readonly | **仅靠属性透传** | 显式 `readonly` prop，并同样透传 | 类型可发现性更好 |
| IME | `@input` 直接 emit | `compositionstart/end` 期间不 emit | 中文拼音中间态不再写进 v-model |
| label/error | FormField | 内部 `KfFormField`（不对外导出） | 结构不变：label / control / meta 三轨 |
| 其他 | 属性透传过滤 class/style/id/aria-describedby | 同 | `data-*` 等仍落 input |

**接口兼容性**：新增 `readonly` prop（原为透传），其余 props/事件一致。`aria-describedby` 现在会合并
外部传入值 + help id + error id（原实现会直接覆盖外部值）。

### 2.4 Checkbox → `KfCheckbox`

| 维度 | 原实现 | 新实现 | 说明 |
| --- | --- | --- | --- |
| 样式位置 | `style.css` 全局（`.kb-checkbox*` 共 10 条规则） | 组件 scoped（`kf-checkbox*`） | 迁移中最大的解耦动作 |
| 尺寸 | 20×20、3px 圆角、14px 标记、8px 间距、32px 命中区 | 同（改为 `--kf-checkbox-*`） | 数值一致 |
| 焦点 | `.kb-checkbox-box:has(input:focus-visible)` | 同（scoped） | 键盘焦点环仍可见 |
| 半选 | `.kb-checkbox-box-mixed` + Icon minus | 同 + `aria-checked="mixed"` | 补了 ARIA |
| 逻辑 | 原生 input + computed 代理（generic `T`） | 同 | 支持数组/Set/true-value |
| 事件 | `update:modelValue`、`change`、`native-change` | 同 | 一致 |
| 根节点 | `label` 或 `span`（`as`） | 同 | 嵌入已有可点行时用 `span` |

**接口兼容性**：完全一致（`modelValue/checked/label/disabled/indeterminate/value/trueValue/falseValue/as`）。
新增 `aria-checked="mixed"`，属于可访问性增强而非行为变更。

---

## 3. 删除/替代的原项目依赖

| 依赖 | 原用途 | 新方案 |
| --- | --- | --- |
| `@/` 别名 | 组件内绝对导入 | 相对导入 |
| Tailwind 原子类 | `Input` 的 `px-3 py-2 text-sm` 等 | `--kf-*` 令牌 + 组件 scoped |
| 全局 `style.css` | `.kb-field`、`.kb-checkbox*` | 各自 SFC 的 scoped 样式 |
| Vue Router | 仅原项目路由使用 | 组件库不使用（Studio 用 hash 路由手写） |
| Pinia / 业务 Store | 原项目状态 | 组件库不依赖 |
| 后端 API（axios） | 原项目 | 组件库零网络请求 |
| iconfont 字体 | `Icon` 的 iconfont 分支 | 未迁移（Roadmap） |
| `utils/toast` / `utils/dialog` | 原项目反馈 | 组件库不含全局单例（Roadmap v0.2.0 重新设计） |

---

## 4. 原项目保持不变（本次未做）

- 未修改原项目任何组件、页面、Store、API、样式。
- 原 `/dev/ui-components` 展示中心继续运行。
- 原项目**尚未**切换到新包；替换业务依赖是后续单独任务。
- 原项目 Git 历史未改动，唯一变化是 `.gitignore` 追加一行 `/knowflow-ui/`（未提交）。

---

## 5. 后续迁移计划

1. **v0.2.0**：先抽 `useAnchoredPanel`（来自 `use-anchored-panel.ts` + `select-position.ts`），再迁 Select；
   随后 DatePicker（需先决定日期工具的时区/格式契约）、Dialog（需重新设计非单例宿主）、Tooltip、Toast、Tabs。
2. **v0.3.0**：Table / Tree / Pagination / Upload / Combobox / Drawer。
3. **图标补全**：把剩余 134 个图标分批纳入（改 `CORE_ICONS` 后跑 `pnpm icons:export`），并评估是否需要
   按需导入的子路径导出。
4. **业务替换**：在 v0.2.0 稳定后，先在原项目的一个低风险页面用 `KfButton` 试点（保留可回滚提交）。
