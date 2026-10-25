# KnowFlow UI

> 从 [KnowFlow](../../) 真实线上界面中抽出的 Vue 3 组件库。v0.2.0 把 V5 组件开发中心的
> **65 个条目、153 个 Story** 完整迁移为独立的 Studio，并把公共组件从 5 个扩到 **67 个**
> （ui 44 + ai 12 + learning 11）。每一个都能独立安装、构建、测试、预览。

A standalone Vue 3 component library extracted from the KnowFlow learning workspace.
v0.2.0 migrates the whole V5 playground (65 entries / 153 stories) into a standalone
Studio and grows the public surface to 67 components — every one of them installable,
buildable, testable and previewable on its own.

---

## 1. 这是什么，不是什么

**是**：一个独立 Git 仓库、独立 pnpm workspace、独立依赖与版本的组件库。包名 `@beiluol/knowflow-ui`，
设计令牌在 `@beiluol/knowflow-tokens`，AI 展示组件在 `@beiluol/knowflow-ai`，学习组件在
`@beiluol/knowflow-learning`，示例工程在 `examples/vue-vite`。

**不是**：

- 不是把 `frontend/src/components/ui/` 整个目录复制过来。所有组件都去掉了业务 Store、后端 API、
  `@/` 别名、Tailwind 原子类与全局 CSS 依赖；图标是从原 `Icon.vue` 的内联分支里按脚本提取的 78 个。
- 不是原 KnowFlow 的新依赖源。原项目继续使用它自己的组件，本版本**没有**替换任何业务代码。
- 不是"看起来有 40 个组件"的空壳。V5 里只有 HTML 演示的 4 个条目（DataTable / InputGroup /
  ResizablePanels / Toolbar）仍然如实标注为 **demo**，2 版都没实现的 3 个（Typography / Breadcrumb /
  Loading）标注为 **missing**，都不伪造实现。

## 2. 特性

| 能力 | 状态 |
| --- | --- |
| `@beiluol/knowflow-ui` 44 个组件（表单 16 / 反馈 7 / 浮层 6 / 数据 8 / 展示 7） | ✅ v0.2.0 |
| `@beiluol/knowflow-ai` 12 个 AI 展示组件（零请求、零 `v-html`） | ✅ v0.2.0 |
| `@beiluol/knowflow-learning` 11 个学习组件（不内置 FSRS / 不写记录） | ✅ v0.2.0 |
| Studio：65 条目 / 153 Story / 7 标签页 / ⌘K / 深链接 / 移动端抽屉 | ✅ v0.2.0 |
| 质量面板：数字全部现算，可导出 JSON / Markdown | ✅ v0.2.0 |
| 键盘与焦点：Select(combobox)、Dialog(焦点陷阱)、DatePicker(grid)、Tree、Tabs(roving tabindex) | ✅ |
| Light / Dark 主题（`data-theme="dark"`，令牌级切换） | ✅ |
| TypeScript 类型声明（`dist/index.d.ts` + `KfXxxProps` / `KfXxxEmits` / `KfXxxSlots`） | ✅ |
| 全局注册 `KfPlugin`（44 个组件一次注册） | ✅ |
| 命名规范统一（`Kf` / `kf-` / `--kf-` + BEM） | ✅ 见 [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) |
| 产物级消费验证（tarball 安装 + 类型 + 构建 + 真实 Chrome 回归） | ✅ |
| npm 发布 | ⛔ 未执行（见 [许可证](#10-许可证与发布状态)） |
| DataTable / InputGroup / ResizablePanels / Toolbar | 🕒 demo（V5 亦无真实组件） |

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
│   ├── tokens/                  # 设计令牌：--kf-* 唯一来源（8 组 / 75 个）+ --kb-* 兼容桥
│   ├── ui/                      # @beiluol/knowflow-ui —— 44 个组件
│   │   ├── src/components/{button,icon,input,textarea,checkbox,radio,switch,select,
│   │   │                   date-picker,number-input,tags-input,search-input,slider,
│   │   │                   form-field,button-group,dialog,drawer,confirm-dialog,
│   │   │                   popover,tooltip,context-menu,toast,tabs,table,tree,
│   │   │                   pagination,accordion,upload,copy-button,badge,tag,card,
│   │   │                   avatar,link,divider,alert,progress,skeleton,status-indicator,
│   │   │                   empty-state,error-state,combobox}/
│   │   │       ├── KfXxx.vue    # 组件实现（scoped 样式）
│   │   │       ├── types.ts     # KfXxxProps / KfXxxEmits / KfXxxSlots
│   │   │       └── index.ts     # 目录导出
│   │   ├── src/installer.ts     # KfPlugin / KF_COMPONENTS（44 项）
│   │   └── src/__tests__/       # 9 文件 / 133 例（含命名规范守门）
│   ├── ai/                      # @beiluol/knowflow-ai —— 12 个组件（5 文件 / 102 例）
│   └── learning/                # @beiluol/knowflow-learning —— 11 个组件（4 文件 / 79 例）
├── apps/studio/                 # V5 开发中心迁移目标（端口 5180）
│   ├── src/registry/            # entries(65) / stories(153) / specs / quality
│   ├── src/previews/            # GenericPreview + 22 个场景组合 + runtime 索引
│   ├── src/__tests__/           # 4 文件 / 197 例（含 153 Story 全量挂载）
│   └── tests/browser/           # Playwright：22 例 / 15 张截图
├── examples/vue-vite/           # 外部消费示例（不在 workspace 内，装 tgz）
├── docs/migration/v5-to-ui/     # 十份迁移文档 + evidence
├── scripts/
│   ├── export-icons.mjs         # 从原 Icon.vue 提取图标（迁移期工具）
│   ├── pack-ui.mjs              # 构建 + pnpm pack → artifacts/
│   ├── check-dist.mjs           # 三包产物检查（泄漏/别名/密钥/业务栈依赖/类型缺失）
│   ├── verify-consumer.mjs      # 隔离安装 tgz + 类型 + 构建
│   ├── gen-migration-docs.mjs   # 生成 COMPONENT_MATRIX / STORY_MATRIX
│   └── snapshot-original.mjs    # 原项目只读快照 + 零修改比对
├── NAMING_CONVENTIONS.md        # 正式命名规范
└── NAMING_MIGRATION_REPORT.md   # 命名统一的迁移报告
```

## 5. 快速开始

### 5.1 在 Vue 3 工程里使用

```bash
npm i @beiluol/knowflow-ui          # npm 尚未发布，见下方本地安装
# 本地（推荐）：
pnpm run pack:ui                    # 生成 artifacts/beiluol-knowflow-ui-0.2.0.tgz
npm i ./artifacts/beiluol-knowflow-ui-0.2.0.tgz
```

```ts
import { KfButton, KfInput, KfSelect } from '@beiluol/knowflow-ui'
import type { KfButtonProps, KfButtonEmits } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'

// 可选：需要全局 kebab 标签时（一次注册 44 个组件）
import { KfPlugin } from '@beiluol/knowflow-ui'
app.use(KfPlugin)   // 之后 <kf-button> / <kf-input> … 无需再 import
```

```vue
<template>
  <!-- Node 名用 PascalCase，标签两种写法等价 -->
  <KfButton icon-name="check" @click="save">保存</KfButton>
  <kf-input v-model="email" label="邮箱地址" placeholder="you@example.com" />
  <kf-checkbox v-model="agree" label="同意条款" />
  <kf-icon name="sparkles" size="lg" />
</template>
```

主题切换：`document.documentElement.setAttribute('data-theme', 'dark')`（移除属性即回到 Light）。

### 5.2 本地开发

```bash
pnpm install      # Node ≥ 20.19，pnpm 11（corepack enable 即可）
pnpm dev          # 启动 Studio → http://localhost:5180
pnpm test         # 511 例（ui 133 + ai 102 + learning 79 + studio 197）
pnpm build        # 构建 ui / ai / learning / studio
pnpm verify       # 类型 → 测试 → 构建 → 产物检查 → 打包 → 消费验证（完整门禁）
```

单独执行：

| 命令 | 作用 |
| --- | --- |
| `pnpm build:ui` / `build:ai` / `build:learning` | 只构建某个包（`dist/index.js` + `style.css` + 类型） |
| `pnpm build:studio` | 只构建 Studio |
| `pnpm typecheck` | 四个包 `vue-tsc`（含 ai / learning / studio） |
| `pnpm test:browser`（在 `apps/studio`） | Playwright + 系统 Chrome：22 例 / 15 张截图 |
| `pnpm pack:ui` | 构建并打 tgz 到 `artifacts/` |
| `pnpm verify:dist` | 三包产物检查（`@/`、本机路径、密钥、业务栈依赖、类型缺失、BEM、焦点样式） |
| `pnpm verify:consumer` | 隔离安装 tgz → `vue-tsc` → `vite build` |
| `node scripts/gen-migration-docs.mjs` | 从注册表重新生成迁移矩阵文档 |
| `node scripts/snapshot-original.mjs compare` | 证明原 KnowFlow 项目零修改 |
| `pnpm icons:export` | 从原 KnowFlow `Icon.vue` 重新提取图标 |

## 6. 组件示例

> 命名速查：JS 名 `KfButton` / 模板 `<kf-button>` / CSS `.kf-button__icon` / 变量 `--kf-*` /
> 类型 `KfButtonProps`。完整规则见 [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md)；
> 逐个条目的 Props/事件/插槽见 [docs/migration/v5-to-ui/COMPONENT_MATRIX.md](docs/migration/v5-to-ui/COMPONENT_MATRIX.md)。

### 组件总览

| 包 | 组件 |
| --- | --- |
| `ui` 表单（16） | Button · Input · Textarea · Checkbox · Radio / RadioGroup · Switch · Select · Combobox · DatePicker · NumberInput · TagsInput · SearchInput · Slider · FormField · ButtonGroup |
| `ui` 反馈（7） | Alert · Toast（+`useToast()`） · Progress · Skeleton · EmptyState · ErrorState · StatusIndicator |
| `ui` 浮层（6） | Dialog · ConfirmDialog · Drawer · Popover · Tooltip · ContextMenu |
| `ui` 数据（8） | Table · Tree · Pagination · Accordion / AccordionItem · Tabs · Upload · CopyButton |
| `ui` 展示（7） | Icon · Badge · Tag · Card · Avatar · Link · Divider |
| `ai`（12） | ChatMessage · ChatComposer · MarkdownRenderer · CodeBlock · ThinkingPanel · AgentTrace · ToolCallCard · ExecutionStatus · CitationCard · SourceList · EvidencePanel · AttachmentPreview |
| `learning`（11） | Flashcard · FlashcardRating · ReviewProgress · QuestionCard · AnswerOptions · AnswerFeedback · QuizProgress · QuizResult · InterviewQuestion · InterviewFeedback · InterviewScore |

### Button

```vue
<KfButton variant="primary" size="md" icon-name="download">导出</KfButton>
<KfButton variant="danger" icon-name="trash-2">删除</KfButton>
<KfButton :loading="saving" icon-name="check">保存</KfButton>
<KfButton icon-only icon-name="plus" aria-label="新建" />
```

三档高度 32 / 38 / 44，文字 14px/500，图标 16px（lg 18px），图文间距 8px，圆角 6px。
类名：`.kf-button` / `__icon` / `__label` / `--primary`、`--sm`、`--lg`、`--block`、`--icon-only`。
事件：`click`。插槽：`default`。类型：`KfButtonProps` / `KfButtonEmits`。

### Icon

```vue
<KfIcon name="search" />                        <!-- 装饰图标：aria-hidden -->
<KfIcon name="bell" size="xl" />
<KfIcon name="flame" :decorative="false" aria-label="连续学习 12 天" />

import { registerIcon } from '@beiluol/knowflow-ui'
registerIcon('kf-logo', '<path d="M4 4h16v16H4z" />')  // 业务自定义图标
```

尺寸阶梯：`xxs 10 / xs 12 / sm 14 / md 16 / lg 18 / xl 20 / 2xl 24 / 3xl 32`，也可直接传数字。
类名：`.kf-icon` / `--img` / `--missing`。事件与插槽：无。类型：`KfIconProps`。

### Input

```vue
<KfInput v-model="email" label="邮箱" required error="邮箱格式不正确" />
<KfInput v-model="kw" label="搜索" prefix-icon-name="search" help="支持标题与正文" />
<KfInput model-value="只读" label="邀请码" readonly />
```

浅灰表面 44px，默认无边框，聚焦不出现蓝/灰外框；`label`/`error`/`help` 通过 `id` + `aria-describedby` 关联；
输入法组合期间不向父组件抛中间态。
类名：`.kf-input`（表面）/ `.kf-input__control`（原生 input）/ `.kf-input__icon` / `.kf-input--error`。
事件：`update:modelValue`、`focus`、`blur`。插槽：无。类型：`KfInputProps` / `KfInputEmits`。

### Checkbox

```vue
<KfCheckbox v-model="agree" label="我已阅读并同意协议" />
<KfCheckbox :model-value="false" :indeterminate="true" label="部分已选" />
<KfCheckbox :model-value="true" label="不可修改" disabled />
```

20×20 方框、3px 圆角、8px 文字间距、32px 命中区（触摸 44px），键盘 Space 可切换。
类名：`.kf-checkbox` / `__box` / `__input` / `__mark` / `__label` / `--disabled` / `--embedded`。
事件：`update:modelValue`、`change`、`native-change`。插槽：`default`。类型：`KfCheckboxProps` / `KfCheckboxEmits`。

### 命名与第三方库共存

- 类名 `kf-`、变量 `--kf-`，与 `el-` / `n-` / `van-` 零重叠；
- 样式全部 scoped，**没有**裸元素选择器（`button {}`），不会命中 Element Plus 内部结构；
- 已用模拟 `ElButton` / `ElInput` 的测试用例验证同页共存（`src/__tests__/plugin.spec.ts`）。

## 7. Studio

```bash
pnpm dev     # http://localhost:5180
```

V5 开发中心的迁移结果：

- **目录**：65 条目，按 5 个分类分组，可按名称过滤，状态徽标（real / demo / missing）如实显示；
- **条目页**：左侧 Story 轨（153 条）、中间预览画布（视口 / 背景 / 全屏 / 重置 / 事件日志）、右侧属性面板（可编辑 Props + `getComputedStyle` 实测样式）；
- **七个标签页**：Preview · Examples · API · States · Design Specs · Accessibility · Quality；
- **深链接**：`#/c/button/size-lg?tab=api&viewport=mobile`，刷新、分享、浏览器后退都成立；
- **搜索**：顶栏搜索框 + **⌘K 命令面板**（65 条目 + 153 Story 统一索引，↑↓ / Enter / Esc 可用）；
- **代码示例**：只输出非默认值 Props，kebab-case，带真实包名与 `style.css` 入口；
- **质量面板**：数字全部由当前注册表现算（65 / 153 / 58 / 4 / 3），可导出 JSON 与 Markdown；
- **令牌页**：读 `getComputedStyle` 的真实值，随 Light/Dark 变化；
- **移动端**：≤900px 双 Drawer（Story 列表 / 属性面板），≤600px 画布控件折行。

原 KnowFlow 的 `/dev/ui-components` 展示中心保持原样，与本 Studio 互不影响（原项目零修改，见 `docs/migration/v5-to-ui/evidence/`）。

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
| v0.1.0 | Button、Icon、Input、Checkbox、FormField + 令牌 + Studio + 消费验证 | 已交付 |
| **v0.2.0** | **V5 开发中心完整迁移（65 条目 / 153 Story）+ 67 个公共组件（ui 44 / ai 12 / learning 11）+ 质量面板 + 浏览器回归** | **本次交付** |
| v0.3.0 | DataTable（基于 KfTable 扩展）、ResizablePanels、Toolbar、InputGroup 升级为真实组件 | 规划 |
| v0.4.0 | Typography、Breadcrumb、Loading；表格虚拟滚动与服务端分页契约 | 规划 |
| v0.5.0 | 主题定制器（令牌注入 + 品牌色生成） | 规划 |

规划版本不代表已发布。当前 4 个 demo 与 3 个 missing 条目在 Studio 里如实标注，不做假实现。

## 10. 许可证与发布状态

- 本仓库当前 `package.json` 标注 **UNLICENSED**：原 KnowFlow 仓库未附 LICENSE，迁移代码的再许可权利尚未确认，
  因此**不声明 MIT**。详见 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)。这也是 npm publish 的**唯一阻断项**。
- npm publish **未执行**。`@beiluol` scope 的归属与对外发布授权需人工确认后再操作。
  本轮只产出 tarball（`artifacts/beiluol-knowflow-ui-0.2.0.tgz`）并验证外部安装可用。
- Git tag 待人工确认后创建；发布检查清单见 [docs/migration/v5-to-ui/RELEASE_CHECKLIST.md](docs/migration/v5-to-ui/RELEASE_CHECKLIST.md)。

## 11. 仓库地址

- GitHub（主）：<https://github.com/beiluoL/knowflow-ui>
- Gitee（镜像）：<https://gitee.com/beiluol/knowflow-ui>

## 12. 贡献与文档

见 [CONTRIBUTING.md](CONTRIBUTING.md)。命名规则见 [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md)；
迁移细节与接口差异见 [COMPONENT_MIGRATION.md](COMPONENT_MIGRATION.md)；命名统一改动见 [NAMING_MIGRATION_REPORT.md](NAMING_MIGRATION_REPORT.md)。

V5 迁移的完整材料在 `docs/migration/v5-to-ui/`：

| 文档 | 内容 |
| --- | --- |
| [AUDIT.md](docs/migration/v5-to-ui/AUDIT.md) | V5 审计与 A–E 分类 |
| [PLAN.md](docs/migration/v5-to-ui/PLAN.md) | 架构、包边界、决策与代价 |
| [COMPONENT_MATRIX.md](docs/migration/v5-to-ui/COMPONENT_MATRIX.md) | 65 条目逐项迁移结果（生成） |
| [STORY_MATRIX.md](docs/migration/v5-to-ui/STORY_MATRIX.md) | 153 Story 逐项对照（生成） |
| [DEPENDENCY_AUDIT.md](docs/migration/v5-to-ui/DEPENDENCY_AUDIT.md) | 依赖与业务栈隔离证据 |
| [MIGRATION_REPORT.md](docs/migration/v5-to-ui/MIGRATION_REPORT.md) | 迁移报告与修掉的问题 |
| [API_COMPATIBILITY.md](docs/migration/v5-to-ui/API_COMPATIBILITY.md) | 公开 API 与 v0.1.0 兼容性 |
| [TEST_REPORT.md](docs/migration/v5-to-ui/TEST_REPORT.md) | 511 + 22 例测试明细 |
| [BROWSER_REPORT.md](docs/migration/v5-to-ui/BROWSER_REPORT.md) | Chrome 22 例 / 15 张截图 |
| [RELEASE_CHECKLIST.md](docs/migration/v5-to-ui/RELEASE_CHECKLIST.md) | 发布门禁与阻断项 |
