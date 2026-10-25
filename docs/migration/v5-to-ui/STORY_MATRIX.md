# V5 Story 迁移清单

> 生成时间：2026-10-25T10:51:19.809Z
> 生成方式：`node scripts/gen-migration-docs.mjs`（`buildStories()` 的产物，不是手抄清单）

## 一、总量

| 指标 | V5 | v0.2.0 |
| --- | ---: | ---: |
| Story 总数 | 153 | 153 |
| 覆盖组件 | 65 | 65 |

平均每组件 **2.4** 条；逐条目数量与 V5 完全一致（下表「V5 / 本轮」两列相等）。

按类别（v0.2.0）：

| 类别 | 数量 |
| --- | ---: |
| Basic | 65 |
| Variants | 7 |
| Sizes | 3 |
| States | 33 |
| Interactive | 28 |
| Form | 7 |
| Edge Cases | 9 |
| Accessibility | 1 |

## 二、逐组件 Story 数

| 条目 | 条目 ID | V5 / 本轮 | Story 列表 |
| --- | --- | ---: | --- |
| 按钮 | `button` | 15 / 15 ✅ | `basic` · `disabled` · `loading` · `size-sm` · `size-md` · `size-lg` · `variant-primary` · `variant-secondary` · `variant-outline` · `variant-ghost` · `variant-text` · `variant-danger` · `icon-right` · `icon-only` · `long-label` |
| 图标 | `icon` | 1 / 1 ✅ | `basic` |
| 输入框 | `input` | 6 / 6 ✅ | `basic` · `disabled` · `readonly` · `required` · `long-text` · `error` |
| 多行输入 | `textarea` | 6 / 6 ✅ | `basic` · `disabled` · `readonly` · `required` · `long-text` · `error` |
| 复选框 | `checkbox` | 3 / 3 ✅ | `basic` · `disabled` · `indeterminate` |
| 单选组 | `radio` | 3 / 3 ✅ | `basic` · `disabled` · `interactive` |
| 开关 | `switch` | 3 / 3 ✅ | `basic` · `disabled` · `interactive` |
| 选择器 | `select` | 6 / 6 ✅ | `basic` · `disabled` · `loading` · `error` · `multi-search` · `empty` |
| 日期 | `datepicker` | 4 / 4 ✅ | `basic` · `disabled` · `readonly` · `error` |
| 表单轨道 | `formfield` | 3 / 3 ✅ | `basic` · `required` · `error` |
| 对话框 | `dialog` | 5 / 5 ✅ | `basic` · `disabled` · `loading` · `error` · `long-content` |
| 提示 | `tooltip` | 2 / 2 ✅ | `basic` · `interactive` |
| 通知 | `toast` | 1 / 1 ✅ | `basic` |
| 标签页 | `tabs` | 2 / 2 ✅ | `basic` · `interactive` |
| 动作菜单 | `dropdown` | 1 / 1 ✅ | `basic` |
| 表格 | `table` | 4 / 4 ✅ | `basic` · `empty` · `fixture-loading` · `interactive` |
| 分页 | `pagination` | 1 / 1 ✅ | `basic` |
| 树 | `tree` | 2 / 2 ✅ | `basic` · `interactive` |
| 抽屉 | `drawer` | 3 / 3 ✅ | `basic` · `loading` · `long-content` |
| 浮层 | `popover` | 2 / 2 ✅ | `basic` · `interactive` |
| 本地文件 | `upload` | 2 / 2 ✅ | `basic` · `interactive` |
| 徽标 | `badge` | 1 / 1 ✅ | `basic` |
| 卡片 | `card` | 1 / 1 ✅ | `basic` |
| 骨架屏 | `skeleton` | 1 / 1 ✅ | `basic` |
| 空状态 | `empty` | 1 / 1 ✅ | `basic` |
| 进度条 | `progress` | 1 / 1 ✅ | `basic` |
| 组合搜索 | `combobox` | 5 / 5 ✅ | `basic` · `fixture-loading` · `fixture-error` · `no-results` · `interactive` |
| 搜索框 | `searchinput` | 5 / 5 ✅ | `basic` · `fixture-loading` · `fixture-error` · `no-results` · `interactive` |
| AI 对话 | `aichat` | 2 / 2 ✅ | `basic` · `interactive` |
| 检索引用 | `rag` | 3 / 3 ✅ | `basic` · `no-answer` · `interactive` |
| 执行轨迹 | `agent` | 4 / 4 ✅ | `basic` · `fixture-success` · `fixture-timeout` · `interactive` |
| 闪卡 | `flashcard` | 4 / 4 ✅ | `basic` · `empty` · `fixture-loading` · `interactive` |
| 智能测验 | `smartquiz` | 2 / 2 ✅ | `basic` · `interactive` |
| 模拟面试 | `interview` | 2 / 2 ✅ | `basic` · `interactive` |
| 代码块 | `codeblock` | 1 / 1 ✅ | `basic` |
| 骨架屏列表 | `skeletonlist` | 1 / 1 ✅ | `basic` |
| 对话框（旧名） | `appdialog` | 2 / 2 ✅ | `basic` · `long-content` |
| 通知宿主 | `toasthost` | 1 / 1 ✅ | `basic` |
| 确认弹窗 | `confirmdialog` | 2 / 2 ✅ | `basic` · `long-content` |
| 上下文菜单 | `contextmenu` | 1 / 1 ✅ | `basic` |
| 空状态（旧名） | `emptystate` | 1 / 1 ✅ | `basic` |
| 错误状态 | `errorstate` | 1 / 1 ✅ | `basic` |
| AI 输入区 | `aicomposer` | 3 / 3 ✅ | `basic` · `disabled` · `error` |
| Markdown 正文 | `markdownrenderer` | 1 / 1 ✅ | `basic` |
| 标签 | `tag` | 1 / 1 ✅ | `basic` |
| 分割线 | `divider` | 1 / 1 ✅ | `basic` |
| 排版 | `typography` | 1 / 1 ✅ | `basic` |
| 链接 | `link` | 1 / 1 ✅ | `basic` |
| 面包屑 | `breadcrumb` | 1 / 1 ✅ | `basic` |
| 提示条 | `alert` | 1 / 1 ✅ | `basic` |
| 加载 | `loading` | 1 / 1 ✅ | `basic` |
| 复习进度 | `reviewprogress` | 1 / 1 ✅ | `basic` |
| 题目卡片 | `questioncard` | 1 / 1 ✅ | `basic` |
| 折叠面板 | `accordion` | 2 / 2 ✅ | `basic` · `interactive` |
| 头像 | `avatar` | 1 / 1 ✅ | `basic` |
| 按钮组 | `buttongroup` | 2 / 2 ✅ | `basic` · `interactive` |
| 滑块 | `slider` | 2 / 2 ✅ | `basic` · `interactive` |
| 数据表格 | `datatable` | 2 / 2 ✅ | `basic` · `interactive` |
| 组合输入 | `inputgroup` | 2 / 2 ✅ | `basic` · `interactive` |
| 数字输入 | `numberinput` | 2 / 2 ✅ | `basic` · `interactive` |
| 标签输入 | `tagsinput` | 2 / 2 ✅ | `basic` · `interactive` |
| 复制按钮 | `copybutton` | 2 / 2 ✅ | `basic` · `interactive` |
| 状态指示 | `statusindicator` | 2 / 2 ✅ | `basic` · `interactive` |
| 可调面板 | `resizablepanels` | 2 / 2 ✅ | `basic` · `interactive` |
| 工具栏 | `toolbar` | 2 / 2 ✅ | `basic` · `interactive` |

## 三、Story 生成规则（与 V5 一致）

1. 每个条目必有一条 `basic`（Basic 类别，65 条全覆盖）；
2. 有 `variant` 枚举 → 逐变体生成（Variants）；
3. 有 `size` 枚举 → 逐尺寸生成（Sizes）；
4. 状态类 Prop（`disabled` / `loading` / `readonly` / `required` / `indeterminate`）→ 对应 State Story；
5. demo 条目生成 Interactive（交互参考）；
6. 表单类生成 Form Story，边界类生成 Edge Cases；
7. 搜索类（Combobox / SearchInput）生成 loading / error / empty；模态类生成 long-content。

## 四、Story 与真实实现的关系

- Story 只切换 **本地 Props 与本地状态**：不请求后端、不调用 AI、不写学习记录；
- 每条 Story 都被 `apps/studio/src/__tests__/render.spec.ts` 真实挂载一次（153 例），出现 Vue 警告即失败；
- `initialProps` 只包含注册表声明过的 Prop（`stories.spec.ts` 断言），防止文档写了组件不承认的参数；
- 深链接形如 `#/c/button/size-lg?tab=api&viewport=mobile`，刷新与分享都能复现同一条 Story。
