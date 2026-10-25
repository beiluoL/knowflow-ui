# 迁移报告 · V5 → KnowFlow UI v0.2.0

> 结论先说：65 条目、153 Story 全部迁移完成；公共组件从 5 个扩到 **67 个**（ui 44 + ai 12 + learning 11），真实条目从 V5 的 29 条提到 **58 条**，demo 从 27 降到 4、missing 从 9 降到 3。四个包 typecheck 0 error、测试 533 例全绿、构建与 tarball 消费验证通过、原项目零修改。

## 一、迁了什么，迁到哪里

| 类别 | 来源（V5，只读） | 去向（本仓库） | 数量 |
| --- | --- | --- | --- |
| 目录与条目 | `dev/catalog-v4.ts`、`dev/extensions-v5.ts`、`dev/registry.ts` | `apps/studio/src/registry/entries.ts` | 65 条 |
| Story 生成规则 | `dev/stories.ts` 的 `buildStories()` | `apps/studio/src/registry/stories.ts` | 153 条 |
| API 文档数据 | `registry.ts` 的 `PropSpec` / `eventMap` / `docs` | `apps/studio/src/registry/specs.ts` | Props 86 / 事件 113 / 插槽 20 |
| 画布与属性面板 | `ComponentPreview.vue`、`PlaygroundProperties.vue`、`StyleInspector.vue` | `components/PreviewCanvas.vue`、`PropsPanel.vue` | 7 个标签页 |
| 演示素材 | `ReferenceDemos.vue`、`ExtensionDemos.vue`、`ScenarioPreview.vue` | **不迁移**，改为真实组件 + 场景组合预览 | 25 个组合 |
| 质量面板 | `QualityDashboard.vue`、`quality.ts` | `pages/QualityPage.vue`、`registry/quality.ts` | 现算 + JSON/MD 导出 |
| 令牌中心 | `TokenCenter.vue` | `pages/TokensPage.vue`（`getComputedStyle` 读取真实值） | 75 个令牌 / 8 组 |
| 组件实现 | `@/components/**`（29 条真实适配，23 个唯一源码） | `packages/{ui,ai,learning}` | 67 个组件 |

## 二、V5 交互能力的保留情况

| V5 能力 | 状态 | 说明 |
| --- | --- | --- |
| 65 条目目录 | ✅ 保留 | 分类、搜索、状态徽标一致；状态按 v0.2.0 重算 |
| 153 Story | ✅ 保留 | 逐条目数量与 V5 相等（STORY_MATRIX 的「V5 / 本轮」列） |
| 三栏工作台（导航/预览/属性） | ✅ 保留并加强 | 预览区多了视口、背景、全屏、重置、事件日志 |
| Preview/Examples/API/States/Design Specs/Accessibility/Quality | ✅ 保留 | 七标签全部有内容，且 API 表来自真实 `defineProps` |
| Story 深链接 | ✅ 保留 | `#/c/button/size-lg?tab=api&viewport=mobile`，支持复制与刷新 |
| 搜索 | ✅ 加强 | 顶栏搜索 + 左栏过滤 + **⌘K 命令面板**（65 条目 + 153 Story 统一索引，↑↓/Enter/Esc 可用） |
| 代码示例 | ✅ 保留 | 只输出非默认值 Props，kebab-case，带真实包名与 `style.css` 入口 |
| 质量面板 | ✅ 保留 | 数字全部现算，可导出 JSON / Markdown |
| 移动端 | ✅ 新增 | ≤900px 双 Drawer（Story 列表 / 属性面板），≤600px 画布控件折行 |
| 深色主题 | ✅ 保留 | `[data-theme="dark"]`，令牌页读数随主题变化 |
| 事件日志 | ✅ 保留 | `PreviewApi.log()` 记录事件名与 payload 形状，不落原文 |
| V5 的"适配器 + 20 个 v-if 预览壳" | ❌ 不迁移 | 改为「通用渲染 + 场景组合」，画布渲染的就是真实组件 |

## 三、本轮新增/重写的组件

**P0（16 条目，含本轮补的 DatePicker）**：Button、Icon、Input、Textarea、Checkbox、Radio、Switch、Select、DatePicker、FormField、Dialog、Tooltip、Toast、Tabs、Dropdown
**P1（13 条目）**：Table、Pagination、Tree、Drawer、Popover、Upload、Badge、Card、Skeleton、EmptyState、Progress、Combobox、SearchInput
**扩展（8 个从 HTML 参考升级为真实组件）**：Accordion、Avatar、ButtonGroup、Slider、NumberInput、TagsInput、CopyButton、StatusIndicator
**AI（12）**：KfChatMessage、KfChatComposer、KfMarkdownRenderer、KfCodeBlock、KfThinkingPanel、KfAgentTrace、KfToolCallCard、KfExecutionStatus、KfCitationCard、KfSourceList、KfEvidencePanel、KfAttachmentPreview
**学习（11）**：KfFlashcard、KfFlashcardRating、KfReviewProgress、KfQuestionCard、KfAnswerOptions、KfAnswerFeedback、KfQuizProgress、KfQuizResult、KfInterviewQuestion、KfInterviewFeedback、KfInterviewScore
**别名/组合（5）**：KfConfirmDialog、KfContextMenu、KfErrorState、KfSkeleton（原 SkeletonList）、KfToast + `useToast`（原 ToastHost）

复杂组件（Select / Dialog / Popover / Tree / Table / Upload / DatePicker）都实现了真实键盘与焦点行为：
Select 是 `combobox + listbox`（↑↓/Home/End/Enter/Esc/输入过滤/IME 保护）；Dialog 有焦点陷阱、`aria-modal`、模态栈、关闭后回焦；DatePicker 是 `grid + aria-activedescendant`（←→↑↓/PageUp/PageDown/Home/End/Enter/Esc），min/max 用 `aria-disabled`；Table 有排序、行选择、`aria-sort`；Tree 有 `treeitem`/`aria-expanded` 与方向键；Upload 支持拖拽、进度、取消与卸载清理。

## 四、迁移中修掉的契约漂移（真实发生过的问题）

| 现象 | 根因 | 处理 |
| --- | --- | --- |
| Select 文档写了 `loading`，组件没有 | 文档抄 V5 参数表，实现漏了 | 补 `loading`（`aria-busy` + 旋转指示 + 不展开面板） |
| AIComposer 文档有 `error`，`KfChatComposer` 没有 | 同上 | 补 `error`（`role=alert` + `aria-invalid`） |
| 65 条目里的 DatePicker 在包里不存在 | P0 缺口 | 自研 `KfDatePicker` + 13 个纯函数 + 24 例单测 |
| `import { KfIcon } from '@beiluol/knowflow-ui'`（包内自引用） | 构建期指向 dist，TS7016 | 5 个组件改为相对导入 `'../icon/KfIcon.vue'` |
| 153 Story 挂载测试 14 例失败（Dialog/AppDialog/ConfirmDialog/EmptyState/ButtonGroup/CopyButton） | ① fixtures 键名用 kebab-case，条目 id 是 name 小写 ② 给 KfDialog 挂了它没有声明的 `close` 监听 | 键名改为条目 id；预览按真实 `defineEmits` 过滤监听（`declaredOnly()`） |
| Studio 里 4 个 tab 标签写成中文，深链接与 V5 不一致 | 迁移时手改 | 恢复 V5 的英文标签（Preview/Examples/API/States/Design Specs/Accessibility/Quality） |
| 移动端 375px 画布顶栏被压成省略号 | 控件 `flex-shrink: 0` 挤掉左侧 | ≤600px 顶栏折两行，控件单独一行 |

## 五、没有做的事（有意）

1. **不做 4 个 demo 条目的假实现**：DataTable / InputGroup / ResizablePanels / Toolbar 需要真实状态机，本轮保持 demo。
2. **不做 3 个 missing 条目**：Typography / Breadcrumb / Loading 两版都没有实现。
3. **不搬 V5 的适配器代码**：V5 适配器多为「div 包一层 + 传业务 props」，直接搬等于把业务耦合带进来。
4. **不引入日期库/图标库/Markdown 库**：见 DEPENDENCY_AUDIT。
5. **不执行 `npm publish`**：许可证未确认（UNLICENSED），见 RELEASE_CHECKLIST 的阻断项。

## 六、验收数字（本机实测）

| 项目 | 结果 |
| --- | --- |
| `pnpm run typecheck` | 4 个包全部 0 error |
| `pnpm run test` | ui 9 文件/133、ai 5/102、learning 4/79、Studio 4/197 → **22 文件 / 511 例** |
| `npx playwright test` | **22 例通过**，15 张截图（5 视口 × Light + Dark + 弹窗 + 质量页 + 200% 缩放） |
| `pnpm run build` | ui 219.4 kB JS + 111.9 kB CSS；ai 74.2 + 46.3；learning 54.0 + 37.2；Studio 352.1 kB JS + 197.7 kB CSS |
| `pnpm run pack:ui` | `artifacts/beiluol-knowflow-ui-0.2.0.tgz`（105.5 kB） |
| `pnpm run verify:dist` | 3 包 / 223 个产物文件，0 问题 |
| `pnpm run verify:consumer` | 安装 0.2.0 成功 → typecheck 通过 → build 通过；包内只有 `dist` + `package.json` |
| 原项目零修改 | `snapshot-original.mjs compare`：`originalUntouched: true`，problemCount 0，HEAD 与 git status 条数一致（1328） |

## 七、遗留与建议

- **P2 建议**：把 `Toolbar` / `ResizablePanels` 提升为真实组件（工作量中等，复用现有 Button/Divider 即可）。
- **P2 建议**：`DataTable` 建议基于现有 `KfTable` 扩展（列显隐 + 服务端分页契约），而不是另写一个表格。
- **P1 建议**：`ai` / `learning` 独立发布前，把 peer 里的 `workspace:^0.2.0` 改成具体版本，并补 `THIRD_PARTY_LICENSES` 的确认。
