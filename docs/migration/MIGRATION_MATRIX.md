# 迁移矩阵（审计结果）

审计时间：2026-10-25
审计对象：KnowFlow `frontend/src/components/ui/`（53 项展示条目）+ 相关 composables / 全局样式

> V4 报告中的 53 个条目包含「真实组件适配」「Demo-only」「未实现」三类，**不等于 53 个可迁移的生产组件**。
> 下表按真实源码依赖判定，不按展示条目数。

## 1. 总表

| 组件 | 源码位置 | 当前依赖 | 可独立运行 | 首版迁移 | 风险 |
| --- | --- | --- | --- | --- | --- |
| Button | `components/ui/Button.vue` | Icon、`--kb-*` | ✅ | ✅ 已迁移 | 低 |
| Icon | `components/ui/Icon.vue` | vue（+ iconfont/图片分支） | ✅ | ✅ 已迁移（78/212 图标） | 中 |
| Input | `components/ui/Input.vue` | `@/`、Tailwind、Icon、FormField、全局 CSS | ⚠️ | ✅ 已迁移 | 中 |
| Checkbox | `components/ui/Checkbox.vue` | Icon、全局 CSS | ⚠️ | ✅ 已迁移 | 中 |
| FormField | `components/ui/FormField.vue` | 无 | ✅ | ✅ 内部使用 | 低 |
| Textarea | `components/ui/Textarea.vue` | Icon、FormField、全局 CSS | ⚠️ | ⛔ v0.2.0 | 低 |
| Select | `components/ui/Select.vue` | `use-anchored-panel`、`select-position`、`select-types`、Icon | ❌ | ⛔ v0.2.0 | 高 |
| CascaderSelect | `components/ui/CascaderSelect.vue` | `cascader-types`、anchored panel、Icon | ❌ | ⛔ v0.3.0 | 高 |
| CategoryTreeSelect | `components/ui/CategoryTreeSelect.vue` | 业务分类数据结构 | ❌ | ⛔ 待评估 | 高 |
| DatePicker / DateRangePicker / DateTimePicker | `components/ui/Date*.vue` | `date-picker-utils`、`date-time-format` | ❌ | ⛔ v0.2.0 | 高 |
| MonthPicker / YearPicker / TimePicker | `components/ui/*Picker.vue`、`TimeColumns.vue` | 同上 + `time-picker-utils` | ❌ | ⛔ v0.3.0 | 高 |
| DatePanel | `components/ui/DatePanel.vue` | 日期工具 | ❌ | ⛔ | 中 |
| AppDialog / ConfirmDialog / SelectDialog | `components/ui/*Dialog.vue` | `modal-stack`、`utils/dialog` 单例 | ❌ | ⛔ v0.2.0 | 高 |
| ToastHost | `components/ui/ToastHost.vue` | `utils/toast` 单例 | ❌ | ⛔ v0.2.0 | 高 |
| DialogHost | `components/ui/DialogHost.vue` | `modal-stack` | ❌ | ⛔ v0.2.0 | 中 |
| ContextMenu | `components/ui/ContextMenu.vue` | anchored panel、Icon | ❌ | ⛔ v0.2.0 | 中 |
| CommandPalette | `components/ui/CommandPalette.vue` | Router、搜索、业务命令 | ❌ | ⛔ 不迁移 | 极高 |
| Pagination | `components/ui/Pagination.vue` | 无（纯 props） | ✅ | ⛔ v0.3.0 | 低 |
| Badge / Card / Progress / Avatar / StatCard | `components/ui/*.vue` | `--kb-*` | ✅ | ⛔ v0.2.0 | 低 |
| SkeletonList / EmptyState / ErrorState / StateView | `components/ui/*.vue` | Icon、Router（ErrorState 可能） | ⚠️ | ⛔ v0.2.0 | 中 |
| PageHeader / StudioVisual | `components/ui/*.vue` | Router、Icon | ⚠️ | ⛔ 待评估 | 中 |
| Celebration / Pomodoro* | `components/ui/*.vue` | 业务计时/学习事件 | ❌ | ⛔ 不迁移 | 极高 |
| AIComposer / AI 相关 | `components/ai/*` | Pinia、API、SSE | ❌ | ⛔ v0.4.0 重设计 | 极高 |
| Flashcard / Quiz / Interview | `components/flashcards/*`、业务页 | Pinia、API、FSRS | ❌ | ⛔ v0.5.0 重设计 | 极高 |

## 2. 判定依据

- **可独立运行**：删掉 `@/` 别名与全局样式后，组件仍能渲染且无网络/路由/Store 访问 → ✅；
  需要补 1–2 个内部文件 → ⚠️；需要抽 3 个以上 composable 或业务数据 → ❌。
- **风险**：取决于是否依赖浮动定位、日期时区、全局单例宿主、业务事件。
- 展示条目里的 Demo-only（如部分 AI/RAG/Agent 条目）直接标为「不迁移」，避免把演示当成能力。

## 3. 首版取舍

只迁 4 个：Button（样式最干净）、Icon（纯函数式）、Input（有 label/a11y 轨道）、Checkbox（视觉全在全局表里，
迁移收益最大）。这四个覆盖了「纯展示 / 图标 / 表单输入 / 表单选择」四类典型结构，足以验证架构。
