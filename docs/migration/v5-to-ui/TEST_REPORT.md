# 测试报告 · v0.2.0

> 全部数字为**本轮本机实测**，不沿用 V5 的 1628 项，也不沿用 v0.1.0 的 42 项。
> 复跑：`pnpm run test`（单测 + Studio）、`cd apps/studio && npx playwright test`（浏览器）。

## 一、总览

| 范围 | 测试文件 | 用例 | 结果 |
| --- | ---: | ---: | --- |
| `packages/ui` | 9 | 133 | ✅ 全绿 |
| `packages/ai` | 5 | 102 | ✅ 全绿 |
| `packages/learning` | 4 | 79 | ✅ 全绿 |
| `apps/studio`（vitest） | 4 | 197 | ✅ 全绿 |
| **小计（vitest）** | **22** | **511** | ✅ |
| `apps/studio/tests/browser`（Playwright/Chrome） | 1 | 22 | ✅ |
| **合计** | **23** | **533** | ✅ |

## 二、`packages/ui`（9 文件 / 133 例）

| 文件 | 用例 | 覆盖内容 |
| --- | ---: | --- |
| `button.spec.ts` | 12 | 三种尺寸/六种变体渲染、图标位、`loading` 禁用与 `aria-busy`、`iconOnly` 需 `ariaLabel`、click 只在非禁用时触发、插槽 |
| `input.spec.ts` | 12 | v-model 往返、label/for 关联、`error` 的 `aria-describedby` 与 `aria-invalid`、disabled/readonly、prefix/suffix 插槽、IME 组合期间不提交 |
| `checkbox.spec.ts` | 10 | 受控/非受控、`indeterminate` 的 `aria-checked="mixed"`、label 点击、键盘 Space、焦点可见类 |
| `icon.spec.ts` | 10 | 内置名解析、尺寸、图片型（URL/data URI）分支、装饰性 `aria-hidden`、未知名回退 |
| `date-picker.spec.ts` | 24 | 9 例纯函数（严格 ISO 解析、闰年、月末收敛、42 格网格、周起始）+ 15 例组件（开合、点选、min/max 拦截、方向键/PageUp/PageDown/Escape、非法输入、清空、`aria-describedby`、卸载移除监听） |
| `overlays.spec.ts` | 15 | Dialog 焦点陷阱/`aria-modal`/Esc/遮罩、Drawer 关闭回焦、Popover/Tooltip 定位与 `aria-describedby`、模态栈（多层只关最上层）、卸载清理 |
| `data.spec.ts` | 27 | Table 排序与 `aria-sort`、行选择、空态；Tree 展开/`aria-expanded`/方向键；Pagination 边界；Tabs roving tabindex；Accordion `aria-expanded`；Upload 选择/移除/进度；Select combobox 键盘（↑↓/Home/End/Enter/Esc、输入过滤、IME 保护、`loading` 不展开） |
| `plugin.spec.ts` | 12 | `KF_COMPONENTS` 数量与命名、`app.use()` 全量注册、重复注册幂等、每个组件 name 唯一 |
| `naming.spec.ts` | 11 | 目录必有 `index.ts`、类名全部 `kf-` + BEM（block 由文件名推导）、无 `kb-` 残留、CSS 变量全部 `--kf-*`、字号/圆角走令牌、无裸元素选择器 |

## 三、`packages/ai`（5 文件 / 102 例）

| 文件 | 用例 | 覆盖内容 |
| --- | ---: | --- |
| `markdown.spec.ts` | 12 | token 解析（标题/列表/引用/围栏代码/表格/链接/强调）、`isSafeHref` 协议白名单（`javascript:`/`data:` 被拒）、**全程无 `v-html`** |
| `chat.spec.ts` | 19 | 消息角色渲染（user/assistant/system）、流式光标、错误条、Composer 的 Enter/Shift+Enter、`busy`/`stoppable`、`error` 的 `role=alert`、附件移除、IME 组合保护 |
| `reasoning.spec.ts` | 28 | ThinkingPanel 折叠与时长展示（只显示宿主给的可公开文本）、AgentTrace 步骤状态、ToolCallCard 参数/结果、**审批只 emit approve/reject**、ExecutionStatus 四态 |
| `retrieval.spec.ts` | 31 | CitationCard 序号/来源/得分、SourceList 索引与点击、EvidencePanel 高亮（`highlights` 词）、无证据态、附件预览（大小/类型/移除） |
| `boundary.spec.ts` | 12 | 长文本不溢出、空数据不崩、卸载时清理定时器与监听、组件包内无 fetch/WebSocket/EventSource、无 `v-html` |

## 四、`packages/learning`（4 文件 / 79 例）

| 文件 | 用例 | 覆盖内容 |
| --- | ---: | --- |
| `flashcard.spec.ts` | 22 | 正反面翻转、`revealed` 受控、评级按钮（again/hard/good/easy）只 emit、禁用态、`aria-pressed` |
| `quiz.spec.ts` | 30 | QuestionCard 单选/多选、AnswerOptions 键盘与 `aria-checked`、AnswerFeedback 正确/错误/解析、QuizProgress 进度语义、QuizResult 统计 |
| `interview.spec.ts` | 17 | InterviewQuestion 题干/追问、InterviewFeedback 维度评分（`key/label`）、InterviewScore 总分与拆解 |
| `boundary.spec.ts` | 10 | 空题目/空维度不崩、卸载清理、**不写 localStorage、不调评分接口** |

## 五、`apps/studio`（4 文件 / 197 例）

| 文件 | 用例 | 覆盖内容 |
| --- | ---: | --- |
| `stories.spec.ts` | 13 | Story 总数 **153**、每条目 Basic 唯一、`validateStories()` 无错、逐条目数量与 V5 矩阵一致（Button 15 / Input 6 / Select 6 / Dialog 5 / Combobox 5 / SearchInput 5 / Table 4 / Agent 4 / Flashcard 4 …） |
| `components.spec.ts` | 4 | 65 条目映射、`entry.components` 在对应包命名空间里真实存在、`entry.props` 是真实组件声明的 Prop、状态分布 |
| `render.spec.ts` | 157 | **153 条 Story 全部真实挂载**（每例把 `console.error/warn` 当失败信号）+ 4 例结构断言（预览可解析、demo/missing 用说明卡、`initialProps` 只含声明过的 Prop） |
| `studio.spec.ts` | 23 | hash 路由解析/深链接/后退、Props 面板只渲染可编辑项且值可回流、代码示例（默认值不输出/类型化/包名/样式入口）、令牌只含 `--kf-*`、质量报告全部现算且不含历史数字、demo/missing 不自称已接入 |

## 六、业务隔离（零副作用）断言

| 断言 | 在哪测 |
| --- | --- |
| 组件包内无 `fetch` / `WebSocket` / `EventSource` / `XMLHttpRequest` | `ai/boundary`、`learning/boundary`、`check-dist` 扫描 |
| 无 `v-html` 使用 | `ai/markdown`、`ai/boundary`、`check-dist` |
| 不写 localStorage / 学习记录 | `learning/boundary` |
| 不导入 pinia / vue-router / axios | `check-dist` 的 `BUSINESS_IMPORTS` 规则 |
| 153 Story 挂载期间无未处理异常 | `render.spec.ts`（console 事件即失败） |
| Studio 预览不执行用户代码、不落原始 payload | `PreviewApi.log()` 只记事件名与结构；`studio.spec` 断言面板值来自 fixture |

## 七、测试过程中被测试抓出来的真实 bug（已修）

1. **14 例 Story 挂载失败**：fixtures 键名 kebab-case 与条目 id（name 小写）不匹配 → `EmptyState`/`ButtonGroup`/`CopyButton` 缺必填 Prop；`ModalPreview` 给 `KfDialog` 挂了未声明的 `close` 监听。修复后 157/157。
2. **`KfDatePicker` 缺失**：文档里有、包里没有，`select.loading`、`chat-composer.error` 同样问题。
3. **包内自引用 `@beiluol/knowflow-ui`**：5 个组件运行时指向 dist，typecheck 报 TS7016。
4. **Playwright 用例被 vitest 收集**：`vitest.config.ts` 的 include 曾包含 `tests/**`，导致「vitest 执行 Playwright 用例」的假失败，已限定为 `src/**/*.spec.ts`。

## 八、未覆盖/不宣称的部分

- **视觉像素比对**：没有做截图 diff（主题/字体在不同机器上不稳定），改为真实浏览器里断言布局不溢出 + 关键元素可见。
- **服务端交互**：组件库本就不发请求，因此没有 network mock 测试。
- **200% 缩放的系统级模拟**：用 720×450 CSS 视口等效验证（见 BROWSER_REPORT）。
- **性能基准**：未测渲染耗时，只保证构建体积与无死循环定时器。

## 九、复跑

```bash
pnpm run test        # 22 文件 / 511 例
pnpm run typecheck   # 4 包 0 error
cd apps/studio && npx playwright test   # 22 例 / 15 张截图
pnpm --filter @knowflow-ui/studio dump:registry   # 文档数据导出（工具，不是测试）
```
