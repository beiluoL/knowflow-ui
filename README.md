# KnowFlow UI

> 从 [KnowFlow](../../) 真实线上界面中抽出的 Vue 3 组件库。首版（v0.1.0）只做四个基础组件：
> **Button / Icon / Input / Checkbox**，但要求每一个都真正可独立安装、可构建、可测试、可预览。

A standalone Vue 3 component library extracted from the KnowFlow learning workspace.
v0.1.0 ships only four primitives — deliberately — to prove the whole pipeline
(extract → decouple → build → Studio → install → verify) before growing.

---

## 1. 这是什么，不是什么

**是**：一个独立 Git 仓库、独立 pnpm workspace、独立依赖与版本的组件库。包名 `@beiluol/knowflow-ui`，
设计令牌在 `@beiluol/knowflow-tokens`，示例工程在 `examples/vue-vite`。

**不是**：

- 不是把 `frontend/src/components/ui/` 整个目录复制过来。四个组件都去掉了业务 Store、后端 API、
  `@/` 别名、Tailwind 原子类与全局 CSS 依赖；图标是从原 `Icon.vue` 的 212 个内联分支里按脚本提取的 78 个。
- 不是原 KnowFlow 的新依赖源。原项目继续使用它自己的组件，本版本**没有**替换任何业务代码。
- 不是"看起来有 40 个组件"的空壳。未迁移组件只存在于 [Roadmap](#9-路线图) 与 Studio 的路线图页，目录里没有空文件。

## 2. 特性

| 能力 | 状态 |
| --- | --- |
| Button（6 变体 × 3 尺寸 × loading / iconOnly / block） | ✅ v0.1.0 |
| Icon（78 个内联 SVG + 运行时注册 + 语义尺寸 + a11y） | ✅ v0.1.0 |
| Input（v-model / label / error / help / 图标 / IME 安全） | ✅ v0.1.0 |
| Checkbox（v-model / 半选 / 禁用 / 整行可点 / 键盘焦点） | ✅ v0.1.0 |
| Light / Dark 主题（`data-theme="dark"`） | ✅ |
| TypeScript 类型声明（`dist/index.d.ts`） | ✅ |
| 独立 Studio（预览 / 属性 / 代码 / 令牌 / 实测尺寸） | ✅ |
| 产物级消费验证（tarball 安装 + 类型 + 构建 + 浏览器） | ✅ |
| npm 发布 | ⛔ 未执行（见 [许可证](#10-许可证与发布状态)） |
| 其余组件（Select / Table / Dialog / AI / 学习组件…） | 🕒 规划 |

## 3. 技术栈

- Vue **3.4+**（`vue` 是 peerDependency，绝不打包第二个运行时）
- TypeScript + `vue-tsc`（`dist/index.d.ts` 由真实 SFC 生成）
- Vite **Library Mode**（ESM 单包 + 独立 CSS）
- pnpm workspace（`packages/*` + `apps/*`）
- Vitest + `@vue/test-utils` + happy-dom

## 4. 目录结构

```
knowflow-ui/
├── packages/
│   ├── tokens/                  # 设计令牌：--kf-* 唯一来源 + --kb-* 兼容桥
│   └── ui/                      # @beiluol/knowflow-ui
│       ├── src/components/{button,icon,input,checkbox,form-field}
│       ├── src/styles/index.css # 只引令牌，组件样式在各 SFC 的 scoped 块
│       ├── src/__tests__/       # 42 个组件测试
│       └── vite.config.ts
├── apps/studio/                 # 独立预览与规范中心（端口 5180）
├── examples/vue-vite/           # 外部消费示例（不在 workspace 内，装 tgz）
├── scripts/
│   ├── export-icons.mjs         # 从原 Icon.vue 提取图标（迁移期工具）
│   ├── pack-ui.mjs              # 构建 + pnpm pack → artifacts/
│   ├── check-dist.mjs           # 产物泄漏/别名/密钥检查
│   └── verify-consumer.mjs      # 隔离安装 + 类型 + 构建校验
├── docs/{architecture,migration,releases}
└── .github/workflows/ci.yml
```

## 5. 快速开始

### 5.1 在 Vue 3 工程里使用

```bash
npm i @beiluol/knowflow-ui          # npm 尚未发布，见下方本地安装
# 本地（推荐，v0.1.0 阶段）：
pnpm run pack:ui                    # 生成 artifacts/beiluol-knowflow-ui-0.1.0.tgz
npm i ./artifacts/beiluol-knowflow-ui-0.1.0.tgz
```

```ts
import { KfButton, KfIcon, KfInput, KfCheckbox } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'
```

```vue
<template>
  <KfButton icon-name="check" @click="save">保存</KfButton>
  <KfInput v-model="email" label="邮箱地址" placeholder="you@example.com" />
  <KfCheckbox v-model="agree" label="同意条款" />
  <KfIcon name="sparkles" size="lg" />
</template>
```

主题切换：`document.documentElement.setAttribute('data-theme', 'dark')`（移除属性即回到 Light）。

### 5.2 本地开发

```bash
pnpm install      # Node ≥ 20.19，pnpm 11（corepack enable 即可）
pnpm dev          # 启动 Studio → http://localhost:5180
pnpm test         # 42 个组件测试
pnpm build        # 构建 packages/ui + Studio
pnpm verify       # 类型 → 测试 → 构建 → 产物检查 → 消费验证（完整门禁）
```

单独执行：

| 命令 | 作用 |
| --- | --- |
| `pnpm build:ui` | 只构建组件库（`dist/index.js` + `dist/style.css` + 类型） |
| `pnpm build:studio` | 只构建 Studio |
| `pnpm typecheck` | ui 与 studio 双端 `vue-tsc` |
| `pnpm pack:ui` | 构建并打 tgz 到 `artifacts/` |
| `pnpm verify:dist` | 扫描产物中的 `@/`、本机路径、密钥、Vue 重复打包 |
| `pnpm verify:consumer` | 隔离安装 tgz → `vue-tsc` → `vite build` |
| `pnpm icons:export` | 从原 KnowFlow `Icon.vue` 重新提取图标 |

## 6. 组件示例

### Button

```vue
<KfButton variant="primary" size="md" icon-name="download">导出</KfButton>
<KfButton variant="danger" icon-name="trash-2">删除</KfButton>
<KfButton :loading="saving" icon-name="check">保存</KfButton>
<KfButton icon-only icon-name="plus" aria-label="新建" />
```

三档高度 32 / 38 / 44，文字 14px/500，图标 16px（lg 18px），图文间距 8px，圆角 6px。

### Icon

```vue
<KfIcon name="search" />                        <!-- 装饰图标：aria-hidden -->
<KfIcon name="bell" size="xl" />
<KfIcon name="flame" :decorative="false" aria-label="连续学习 12 天" />

import { registerIcon } from '@beiluol/knowflow-ui'
registerIcon('kf-logo', '<path d="M4 4h16v16H4z" />')  // 业务自定义图标
```

尺寸阶梯：`xxs 10 / xs 12 / sm 14 / md 16 / lg 18 / xl 20 / 2xl 24 / 3xl 32`，也可直接传数字。

### Input

```vue
<KfInput v-model="email" label="邮箱" required error="邮箱格式不正确" />
<KfInput v-model="kw" label="搜索" prefix-icon-name="search" help="支持标题与正文" />
<KfInput model-value="只读" label="邀请码" readonly />
```

浅灰表面 44px，默认无边框，聚焦不出现蓝/灰外框；`label`/`error`/`help` 通过 `id` + `aria-describedby` 关联；
输入法组合期间不向父组件抛中间态。

### Checkbox

```vue
<KfCheckbox v-model="agree" label="我已阅读并同意协议" />
<KfCheckbox :model-value="false" :indeterminate="true" label="部分已选" />
<KfCheckbox :model-value="true" label="不可修改" disabled />
```

20×20 方框、3px 圆角、8px 文字间距、32px 命中区（触摸 44px），键盘 Space 可切换。

## 7. Studio

```bash
pnpm dev     # http://localhost:5180
```

包含：组件目录、实时预览、属性面板（改 prop 立即生效）、变体/尺寸/状态矩阵、Vue 代码示例与复制、
Light/Dark、Design Tokens（读浏览器真实计算值）、源码路径定位、**真实 DOM 尺寸测量**。

原 KnowFlow 的 `/dev/ui-components` 展示中心保持原样，与本 Studio 互不影响。

## 8. 设计令牌

```css
/* packages/tokens/src/tokens.css —— 唯一来源 */
--kf-primary: #3b6fe0;
--kf-button-height-md: 38px;
--kf-checkbox-size: 20px;
```

旧项目迁移期可加一层兼容桥（方向固定为 `--kb-* → var(--kf-*)`）：

```ts
import '@beiluol/knowflow-tokens/tokens.css'
import '@beiluol/knowflow-tokens/kb-compat.css'
```

## 9. 路线图

| 版本 | 内容 | 状态 |
| --- | --- | --- |
| v0.1.0 | Button、Icon、Input、Checkbox + 令牌 + Studio + 消费验证 | 本次交付 |
| v0.2.0 | Select、DatePicker、Dialog、Tooltip、Toast、Tabs | 规划 |
| v0.3.0 | Table、Tree、Pagination、Upload、Combobox、Drawer | 规划 |
| v0.4.0 | AI Chat、RAG 引用、Agent 工具轨迹 | 规划 |
| v0.5.0 | Flashcard、Quiz、Interview 学习组件 | 规划 |

规划版本不代表已发布，Studio 的「迁移路线」页同步标注。

## 10. 许可证与发布状态

- 本仓库当前 `package.json` 标注 **UNLICENSED**：原 KnowFlow 仓库未附 LICENSE，迁移代码的再许可权利尚未确认，
  因此**不声明 MIT**。详见 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)。
- npm publish **未执行**。`@beiluol` scope 的归属与对外发布授权需人工确认后再操作。
- Git tag 待 v0.1.0 全量门禁通过并人工确认后创建。

## 11. 仓库地址

- GitHub（主）：<https://github.com/beiluoL/knowflow-ui>
- Gitee（镜像）：<https://gitee.com/beiluol/knowflow-ui>

## 12. 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。迁移细节与接口差异见 [COMPONENT_MIGRATION.md](COMPONENT_MIGRATION.md)。
