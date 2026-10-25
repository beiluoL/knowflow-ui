# 贡献指南（CONTRIBUTING）

本仓库是 KnowFlow UI 组件库的独立仓库。约定以"可安装、可测试、可回滚"为底线。

## 1. 组件命名

| 项 | 规则 | 示例 |
| --- | --- | --- |
| 导出名 | `Kf` 前缀 + PascalCase | `KfButton`、`KfInput` |
| 文件 | 与导出名一致 | `components/button/KfButton.vue` |
| 目录 | 小写 kebab-case | `components/checkbox/` |
| CSS 类 | `kf-<组件>` + BEM 修饰 | `.kf-button--primary`、`.kf-checkbox-box` |
| 类型 | 独立 `types.ts`，不写在 SFC 里导出 | `ButtonVariant` |

为什么加 `Kf` 前缀：避免与宿主工程的 `Button`、`Icon` 以及原生标签重名；也避免和原 KnowFlow 的
`kb-*` 体系混淆——两套东西可以同时存在于一个页面而互不覆盖。

## 2. Props 设计

- 一律使用 `withDefaults(defineProps<{...}>(), {...})`，容器型 prop 必须有默认值。
- 布尔 prop 默认 `false`，命名用正向语义（`disabled` 而不是 `enabled`）。
- 受控值优先 `modelValue` + `update:modelValue`，不要提供第二个真源。
- 与原生属性同名的 prop（`disabled` / `readonly` / `required` / `type`）必须真的透传到原生元素。
- 需要透传额外属性时显式 `inheritAttrs: false`，并把 `class` / `style` 留在根节点、其余透传给控件
  （参考 `KfInput` 的 `controlAttrs`、`KfCheckbox` 的 `rootAttrs`）。
- 不引入业务概念：不出现 `chapterId`、`userId`、`courseId` 这类字段。

## 3. 事件

- 优先使用 `update:modelValue`、`change`、`focus`、`blur` 等原生语义命名。
- 透传原生事件时保留原始 `Event` 参数（如 `native-change`），方便消费方做精细判断。
- 不要吞掉错误：组件本身不做网络请求，也不 `catch` 后静默。

## 4. Slots

- 只有一个默认插槽的组件（Button、Checkbox）不要再造 `content` / `text` 插槽。
- 需要装饰性结构时用命名插槽（如 `meta`），并在文档里写清"会被 aria-describedby 关联吗"。

## 5. 样式

- 组件样式写在各自 SFC 的 `<style scoped>`；**不放**全局样式表。
- 只用 `--kf-*` 令牌，禁止写死 hex / 魔法像素（`var(--kf-x, fallback)` 的 fallback 仅用于独立进程渲染兜底）。
- 不使用 Tailwind 原子类：消费方不一定装了 Tailwind。
- 保留 `prefers-reduced-motion` 与 `forced-colors` 分支。
- 焦点可见性：可以移除**控件自身**的默认 outline（如 Input 的 `:focus-visible` 由外壳表面反馈承担），
  但**禁止**全局 `outline: none`；按钮、Checkbox 等需要可见焦点环的控件必须保留。

## 6. 令牌

- 新令牌先加 `packages/tokens/src/tokens.css`，再在组件里引用；深色模式的值放在 `[data-theme='dark']` 块。
- 令牌名用语义，不用具体值：`--kf-field-surface` 而不是 `--kf-gray-e8ecf1`。
- 旧名兼容只在 `kb-compat.css` 里做单向映射（`--kb-* → var(--kf-*)`）。

## 7. 可访问性

- 交互元素必须是原生元素（`button` / `input` / `label`），不要用 `div` + 手写键盘。
- 装饰图标 `aria-hidden="true"`；承担语义的图标必须给 `ariaLabel` 并 `role="img"`。
- 仅图标按钮必须有 `aria-label`，否则开发环境会告警。
- 错误信息必须同时体现在 `aria-invalid` + `aria-describedby`，不能只靠颜色。
- 半选复选框设置 `aria-checked="mixed"`。

## 8. 测试

- 每个组件一个 `src/__tests__/<component>.spec.ts`，使用 `@vue/test-utils` + happy-dom。
- 必测：默认渲染、每个变体/尺寸、disabled/readonly/required、v-model 往返、事件、a11y 属性、属性透传。
- 修 bug 必须先补一个会失败的用例，再修。
- 禁止删除断言或改断言来制造通过。

## 9. 文档

- 新增/修改组件需同步：Studio story（`apps/studio/src/stories/<id>.ts`）、`README.md` 示例、
  `COMPONENT_MIGRATION.md` 的接口差异表。
- Studio story 是"唯一事实来源"：属性表、代码示例、变体矩阵都从它驱动，不要在页面里另写一份。

## 10. PR 规范

1. 分支：`feat/<topic>`、`fix/<topic>`。
2. 提交信息：
   - `feat: <新增能力>` — 新组件或兼容性扩展（minor）
   - `fix: <修复内容>` — 缺陷修复（patch）
   - `docs: <文档>` / `chore: <工程>`
   - 破坏性变更必须写 `BREAKING CHANGE:` 段落（major），并在 `docs/releases/CHANGELOG.md` 说明升级步骤。
3. 合并前必须全绿：

```bash
pnpm typecheck && pnpm test && pnpm build && pnpm verify:dist && pnpm verify:consumer
```

4. 涉及 UI 的改动需附 Studio 截图（1440 与 390，Light/Dark）。
5. 不提交：`dist/`、`artifacts/`、`node_modules/`、`.env*`、任何密钥。

## 11. 版本

- 遵循 SemVer；当前 `0.1.0`。
- 版本号同步修改 `packages/ui/package.json`、`packages/tokens/package.json`、`packages/ui/src/index.ts`
  的 `version` 常量，并在 `docs/releases/CHANGELOG.md` 记录。
