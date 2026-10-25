# 更新日志（CHANGELOG）

版本遵循 [SemVer](https://semver.org/lang/zh-CN/)。当前仍处于 `0.x`，任何 minor 都可能含破坏性调整，
但每次都会在此写明升级步骤。

## [Unreleased] — 命名规范统一与工程收口（2026-10-25）

> `0.1.0` 从未发布到 npm，因此本节的类名调整**不构成对外破坏性变更**；已发布版本发布时直接从净化后的命名开始。

### 新增

- `KfXxxProps` / `KfXxxEmits` 类型导出：`KfButtonProps`、`KfButtonEmits`、`KfIconProps`、
  `KfInputProps`、`KfInputEmits`、`KfCheckboxProps<T>`、`KfCheckboxEmits<T>`，以及 `KfXxxSlots`（文档用）。
- `KfPlugin` 全局注册插件 + `KF_COMPONENTS` / `KF_TAGS`：`app.use(KfPlugin)` 后
  `<kf-button>` / `<kf-icon>` / `<kf-input>` / `<kf-checkbox>` 均可直接解析；`<KfButton>` 同样有效。
- 每个组件目录新增 `index.ts`，新增 `components/index.ts` 聚合层与 `installer.ts`。
- 测试：`naming.spec.ts`（11 项命名守门）、`plugin.spec.ts`（12 项注册/标签解析/共存），
  单测总数 42 → **67**。
- 文档：`NAMING_CONVENTIONS.md`、`NAMING_MIGRATION_REPORT.md`；Studio 新增「命名与 API」区块
  （JS 名 / 模板标签 / CSS 类名 / 导出类型 / Events / Slots）。
- `check-dist` 新增断言：BEM 类名、类型导出、运行时 `emits` 声明、无裸元素选择器。

### 变更（内部 CSS 类名，对齐 BEM）

| 旧 | 新 |
| --- | --- |
| `.kf-field` / `--error` / `--disabled` / `--readonly` | `.kf-input` / `.kf-input--error` / `--disabled` / `--readonly` |
| `.kf-field__icon` | `.kf-input__icon` |
| `.kf-input`（原生 input） | `.kf-input__control` |
| `.kf-checkbox-box` / `-box-mixed` / `-input` / `-mark` / `-check` / `-label` | `.kf-checkbox__box` / `__box--mixed` / `__input` / `__mark` / `__mark--check` / `__label` |
| `.kf-form-label` / `-required` / `-help` / `-error` | `.kf-form-field__label` / `__required` / `__help` / `__error` |

**视觉零变化**：仅重写选择器，未改任何属性值/DOM 结构；已用 Studio 浏览器回归逐项核对计算样式。

### 升级步骤（若已基于旧类名自定义样式）

1. 按上表替换自己的覆盖规则；
2. 若原本用 `KfXxx` 内联 props 类型做包装，改为 `import type { KfXxxProps } from '@beiluol/knowflow-ui'`；
3. 若在模板里直接写 `<kf-button>` 之前不生效，现在可以 `app.use(KfPlugin)`（或继续按需 import）。

## [0.1.0] — 2026-10-25

首个可独立安装的版本。只封装 4 个基础组件，用于验证「提取 → 解耦 → 构建 → 预览 → 安装」全链路。

### 新增

- `@beiluol/knowflow-ui`：`KfButton`、`KfIcon`、`KfInput`、`KfCheckbox` 四个组件。
- `@beiluol/knowflow-tokens`：`--kf-*` 设计令牌（Light/Dark）与 `--kb-*` 单向兼容桥。
- 内置 78 个 lucide 风格图标 + `registerIcon()` 运行时扩展 + `listIconNames()`。
- 组件级 TypeScript 类型：`ButtonVariant`、`ButtonSize`、`IconSize`、`InputType`、`CheckboxAs` 等。
- `apps/studio`：独立预览中心（端口 5180），含实时预览、属性面板、变体/尺寸/状态矩阵、
  代码示例与复制、Light/Dark、令牌真实值表、源码路径、DOM 实测尺寸。
- `examples/vue-vite`：不在 workspace 内的消费示例，从 `artifacts/*.tgz` 安装。
- 工程脚本：`export-icons` / `pack:ui` / `verify:dist` / `verify:consumer`。
- GitHub Actions 最小 CI（typecheck + test + build + pack + 产物检查 + 消费验证）。

### 迁移来源

| 新组件 | 原 KnowFlow 来源 | 主要变更 |
| --- | --- | --- |
| `KfButton` | `frontend/src/components/ui/Button.vue` | `kb-`→`kf-` 令牌与类名；loading/disabled 前置拦截；`aria-label` 仅在提供时绑定 |
| `KfIcon` | `frontend/src/components/ui/Icon.vue` | 212 个模板分支 → 78 个常量表（脚本提取）；去掉 iconfont/裸 SVG 分支；增加未知图标占位与告警 |
| `KfInput` | `frontend/src/components/ui/Input.vue` | 去 Tailwind 与 `@/`；外壳样式内联到 scoped；新增 `readonly` prop；IME 组合期不 emit |
| `KfCheckbox` | `frontend/src/components/ui/Checkbox.vue` | 全局 `.kb-checkbox*` 样式迁入 scoped；补 `aria-checked="mixed"` |
| `KfFormField` | `frontend/src/components/ui/FormField.vue` | 仅内部使用，不从公共入口导出 |

### 已知限制

- npm **未发布**；包为 `UNLICENSED`（原仓库无 LICENSE，再许可权利待确认）。
- 图标只迁 78/212；剩余 134 个在 Roadmap。
- 未提供 UMD/CJS 产物，仅 ESM。
- 原 KnowFlow 未切换到本包（保持原状）。
- 单包构建：组件数增长到 ~15 个后应改为子路径导出。

### 升级说明

首次发布，无升级路径。
