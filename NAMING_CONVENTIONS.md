# KnowFlow UI 命名规范 V1.0

> 本文件是 **正式规范**，不是建议稿。新增组件、改类名、加导出前先读这一页。
> 参照 Element Plus / Naive UI 的命名形态，前缀统一为 `Kf` / `kf-` / `--kf-`。

适用范围：`packages/ui`（`@beiluol/knowflow-ui`）、`packages/tokens`（`@beiluol/knowflow-tokens`）、
`apps/studio`、`examples/vue-vite`。

---

## 1. 总览

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| JS / TS 组件名 | `Kf` + PascalCase | `KfButton` |
| Vue 模板标签 | `kf-` + kebab-case | `<kf-button>` |
| CSS 类（block） | `kf-` + kebab-case | `.kf-button` |
| CSS 类（element） | BEM `__` | `.kf-button__icon` |
| CSS 类（modifier） | BEM `--` | `.kf-button--primary` |
| CSS 自定义变量 | `--kf-` + kebab-case | `--kf-color-primary` |
| 组件文件 | `Kf` + PascalCase + `.vue` | `KfButton.vue` |
| Props 类型 | `Kf` + PascalCase + `Props` | `KfButtonProps` |
| Emits 类型 | `Kf` + PascalCase + `Emits` | `KfButtonEmits` |
| Slots 类型（可选） | `Kf` + PascalCase + `Slots` | `KfButtonSlots` |
| TS 公共导出 | 具名 + `Kf` 前缀 | `export { KfButton }` |
| 事件名 | Vue 原生约定，**不加** `kf` 前缀 | `click` / `update:modelValue` |
| Props 名 | camelCase | `modelValue` / `iconPosition` |
| npm 包名 | 沿用已有包名 | `@beiluol/knowflow-ui` |

### 1.1 禁止事项

- ❌ 组件名写成 `KButton` / `KnowButton` / `FlowButton` / `Button`
- ❌ CSS 类名不带 `kf-` 前缀（会与 Element Plus、Naive UI、Tailwind 冲突）
- ❌ 元素/修饰符层级混用单连字符（`.kf-checkbox-box` ✗ → `.kf-checkbox__box` ✓）
- ❌ 事件加前缀（`kfClick` ✗ → `click` ✓）
- ❌ 在 `<script setup>` 里内联写 props 类型后**不**导出对应 `KfXxxProps`
- ❌ 为了凑数量创建空壳组件或空目录

---

## 2. 组件清单（当前实际实现）

| 组件 | JS / TS | 模板标签 | CSS block | 状态 |
| --- | --- | --- | --- | --- |
| Button | `KfButton` | `<kf-button>` | `.kf-button` | ✅ 已实现 |
| Icon | `KfIcon` | `<kf-icon>` | `.kf-icon` | ✅ 已实现 |
| Input | `KfInput` | `<kf-input>` | `.kf-input` | ✅ 已实现 |
| Checkbox | `KfCheckbox` | `<kf-checkbox>` | `.kf-checkbox` | ✅ 已实现 |
| FormField | `KfFormField` | `<kf-form-field>` | `.kf-form-field` | 🔒 内部组件，不从根入口导出 |

以下组件**只有命名规则，没有实现**，不要当成已有能力：

`KfTextarea`、`KfRadio`、`KfSwitch`、`KfSelect`、`KfDialog`、`KfDrawer`、`KfTooltip`、`KfPopover`、
`KfTabs`、`KfTable`、`KfPagination`、`KfDatePicker`、`KfChatMessage`、`KfCodeBlock`、`KfReasoningPanel`。

---

## 3. 用法

### 3.1 按需导入（推荐）

```ts
import { KfButton, KfCheckbox, KfInput } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'
```

```vue
<template>
  <!-- PascalCase 与 kebab-case 指向同一个组件，两种写法都可以 -->
  <KfInput v-model="keyword" placeholder="请输入内容" />
  <kf-checkbox v-model="remember">记住我</kf-checkbox>
  <KfButton variant="primary">提交</KfButton>
</template>
```

### 3.2 全局注册（可选）

`<kf-button>` 这类标签只有在**已注册**时才能被解析。需要全量注册时：

```ts
import { createApp } from 'vue'
import { KfPlugin } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'
import App from './App.vue'

createApp(App).use(KfPlugin).mount('#app')
```

此时四个组件的 kebab 标签（`kf-button` / `kf-icon` / `kf-input` / `kf-checkbox`）均可直接使用，
且 `<KfButton>` 这类 PascalCase 写法依然有效——这是 Vue 组件名解析规则（`kebab → camelize → capitalize`）决定的。

不做自动扫描注册：自动注册会阻碍 tree-shaking，并让"到底用了哪些组件"变得不可见。

---

## 4. CSS 规范

### 4.1 结构与修饰

```css
/* block：组件根 */
.kf-button { display: inline-flex; align-items: center; }

/* element：组件内部结构 */
.kf-button__icon { display: inline-flex; }
.kf-button__label { white-space: nowrap; }

/* modifier：状态 / 变体 */
.kf-button--primary { background: var(--kf-primary); }
.kf-button--sm { height: var(--kf-button-height-sm, 32px); }

/* element + modifier 同时出现 */
.kf-button__icon--trailing { order: 1; }
```

### 4.2 变量

组件样式**只允许**引用 `--kf-*` 变量，且必须带兜底值（包在宿主未引入令牌时仍可渲染）：

```css
.kf-button {
  height: var(--kf-button-height-md, 38px);
  border-radius: var(--kf-button-radius, 6px);
}
```

令牌唯一来源：`packages/tokens/src/tokens.css`。组件 SFC 里**不允许**新增全局 `:root` 变量、
不允许写裸元素选择器（`button {}`、`input {}`），否则会命中 Element Plus 等第三方组件。

### 4.3 主题

暗色由 `[data-theme='dark']` 覆盖令牌值实现，组件样式里**不写**主题分支：

```ts
document.documentElement.setAttribute('data-theme', 'dark') // 开
document.documentElement.removeAttribute('data-theme')      // 关
```

### 4.4 与第三方库共存

- 类名一律 `kf-` 前缀，变量一律 `--kf-` 前缀 → 与 `el-` / `n-` / `van-` 零重叠；
- 不使用 Tailwind / UnoCSS 原子类，不依赖宿主全局 CSS；
- 样式全部在 SFC `<style scoped>` 内，导入即生效，卸载不留残留。

---

## 5. 目录与导出

```
packages/ui/src/
├── components/
│   ├── index.ts            # 公共组件聚合（只列已公开组件）
│   ├── button/
│   │   ├── KfButton.vue
│   │   ├── types.ts        # KfButtonProps / KfButtonEmits / KfButtonSlots
│   │   └── index.ts        # export { default as KfButton }
│   ├── icon/  input/  checkbox/
│   └── form-field/         # 内部组件，index.ts 有导出但根入口不转发
├── installer.ts            # KfPlugin（KF_COMPONENTS / KF_TAGS）
├── styles/index.css        # 只 import 令牌
└── index.ts                # 根入口：显式具名导出，不用 export *
```

规则：

1. 每个组件目录必须有 `index.ts`，导出组件与类型；
2. 根入口用**显式具名导出**（便于 d.ts 审阅与 API 冻结），不用 `export *`；
3. 内部组件不进 `components/index.ts`，因此不会出现在公共 API 与 d.ts 入口里；
4. 不产生循环依赖：`components/<name>/index.ts` 只导出本目录内容，跨组件引用走相对路径的 `.vue`；
5. 不重复注册：`KF_COMPONENTS` 是注册表唯一事实来源。

---

## 6. Props / Events / Slots

```ts
// packages/ui/src/components/button/types.ts
export interface KfButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  // …
}

export type KfButtonEmits = {
  click: [event: MouseEvent]
}
```

```vue
<script setup lang="ts">
import type { KfButtonEmits, KfButtonProps } from './types'

const props = withDefaults(defineProps<KfButtonProps>(), { variant: 'primary', size: 'md' })
const emit = defineEmits<KfButtonEmits>()
</script>
```

⚠️ 重要：`defineProps` / `defineEmits` 允许使用**外部导入**的类型，并且 Vue 编译器会据此生成运行时
`props` / `emits` 声明（实测见 `src/__tests__/button.spec.ts` 的"click 只触发一次"用例）。
如果 emits 没有被声明到运行时，父级 `@click` 会落进 `attrs` 再触发一次，同时绕过 `disabled` 守卫。

Slots 命名：`default` / `prefix` / `suffix` / `header` / `footer` / `empty`。当前四个组件的实际插槽：

| 组件 | 插槽 |
| --- | --- |
| KfButton | `default`（按钮文本；`iconOnly` 时不渲染） |
| KfCheckbox | `default`（标签内容，优先于 `label`） |
| KfInput | 无 |
| KfIcon | 无 |

---

## 7. 新增组件检查清单

- [ ] 目录 `components/<kebab>/`，文件 `Kf<Pascal>.vue` + `types.ts` + `index.ts`
- [ ] `types.ts` 里有 `Kf<Pascal>Props`（+ 有事件则 `Kf<Pascal>Emits`）
- [ ] 类名全部 `kf-` 前缀且符合 BEM；变量全部 `--kf-` 且有兜底值
- [ ] 无裸元素选择器、无全局 `outline: none`、无 `@/` 别名、无 Tailwind 类
- [ ] 在 `components/index.ts` 与根 `index.ts` 显式导出
- [ ] 在 `installer.ts` 的 `KF_COMPONENTS` / `KF_TAGS` 登记
- [ ] `src/__tests__/<name>.spec.ts` 覆盖渲染 / props / events / 禁用态
- [ ] `apps/studio/src/stories/<name>.ts` 填 `naming` / `events` / `slots`
- [ ] `pnpm typecheck && pnpm test && pnpm verify` 全绿

自动化守门：`src/__tests__/naming.spec.ts` 会扫描磁盘上的 SFC，校验文件命名、`index.ts` 是否存在、
类名是否符合 BEM、是否残留 `kb-` 类名、是否出现裸元素选择器；`scripts/check-dist.mjs` 会校验产物里的
类名、类型导出与运行时 emits 声明。

---

## 8. 版本与兼容

- `0.1.0` **从未发布到 npm**，因此本次命名统一（`.kf-field` → `.kf-input` 等）不构成对外破坏性变更。
- 旧 `--kb-*` 变量桥（`@beiluol/knowflow-tokens/kb-compat.css`）仍然保留，方向固定
  `--kb-* = var(--kf-*)`，供仍需与原 KnowFlow 样式共存的老页面过渡使用；组件库自身不再引用任何 `--kb-*`。
- 后续若正式发布，破坏性命名变更必须走 CHANGELOG 的 `BREAKING CHANGE` 段落。
