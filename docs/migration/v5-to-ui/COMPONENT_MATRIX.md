# V5 → KnowFlow UI 组件迁移矩阵

> 生成时间：2026-10-25T10:51:19.809Z
> 生成方式：`node scripts/gen-migration-docs.mjs`（V5 侧事实来自 `evidence/v5-matrix.json`，v0.2.0 侧事实来自 Studio 注册表导出）

## 一、两个版本的数字对照

| 指标 | V5（原项目） | v0.2.0（本仓库） |
| --- | ---: | ---: |
| 条目总数 | 65 | 65 |
| 真实组件（real） | 29 | 58 |
| 仅演示（demo） | 27 | 4 |
| 未实现（missing） | 9 | 3 |
| Story 总数 | 153 | 153 |

> V5 的「真实适配 29」里包含同一源码被多个条目复用的情况（唯一生产源码 23 个）；本仓库按「独立可发布组件」重算，因此 real 条目数与公共组件数不同。

v0.2.0 的 API 文档量：

| 指标 | 数值 |
| --- | ---: |
| 文档化 Props | 86 |
| 文档化事件 | 113 |
| 文档化插槽 | 20 |
| 有事件文档的条目 | 51 |
| 专门组合预览 / 通用渲染 / 无预览 | 25 / 33 / 7 |
| 有可访问性说明的条目 | 65 |
| 有设计规格（数字）的条目 | 11 |

按分类（v0.2.0）：

| 分类 | 条目数 |
| --- | ---: |
| 基础组件 P0 | 15 |
| 工作台组件 P1 | 13 |
| AI与学习组件 | 7 |
| 扩展组件 | 12 |
| 其他已有组件 | 18 |

按包（v0.2.0）：

| 包 | 条目数 |
| --- | ---: |
| ui | 47 |
| ai | 6 |
| learning | 5 |
| none | 7 |

## 二、逐条目矩阵

| 原条目 ID | 原组件名 | 原源码 | 原状态 | Story 数 | 新源码 | 新状态 | 业务依赖 | 迁移修改 | 测试 |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| Button | 按钮 | `frontend/src/components/ui/Button.vue` | 已接入真实组件 | 15 | `packages/ui/src/components/button/KfButton.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Icon | 图标 | `frontend/src/components/ui/Icon.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/icon/KfIcon.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Input | 输入框 | `frontend/src/components/ui/Input.vue` | 已接入真实组件 | 6 | `packages/ui/src/components/input/KfInput.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Textarea | 多行输入 | `frontend/src/components/ui/Textarea.vue` | 已接入真实组件 | 6 | `packages/ui/src/components/textarea/KfTextarea.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Checkbox | 复选框 | `frontend/src/components/ui/Checkbox.vue` | 已接入真实组件 | 3 | `packages/ui/src/components/checkbox/KfCheckbox.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Radio | 单选组 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 3 | `packages/ui/src/components/radio/KfRadio.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Switch | 开关 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 3 | `packages/ui/src/components/switch/KfSwitch.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Select | 选择器 | `frontend/src/components/ui/Select.vue` | 已接入真实组件 | 6 | `packages/ui/src/components/select/KfSelect.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| DatePicker | 日期 | `frontend/src/components/ui/DatePicker.vue` | 已接入真实组件 | 4 | `packages/ui/src/components/date-picker/KfDatePicker.vue` | real（真实组件） | 无 | V5 有 DatePicker.vue；knowflow-ui v0.1.0 未包含，本轮补齐 | 组件单测 + 153 Story 挂载 |
| FormField | 表单轨道 | `frontend/src/components/ui/FormField.vue` | 已接入真实组件 | 3 | `packages/ui/src/components/form-field/KfFormField.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Dialog | 对话框 | `frontend/src/components/ui/AppDialog.vue` | 已接入真实组件 | 5 | `packages/ui/src/components/dialog/KfDialog.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Tooltip | 提示 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/tooltip/KfTooltip.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Toast | 通知 | `frontend/src/components/ui/ToastHost.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/toast/KfToast.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Tabs | 标签页 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/tabs/KfTabs.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Dropdown | 动作菜单 | `frontend/src/components/ui/ContextMenu.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/context-menu/KfContextMenu.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Table | 表格 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 4 | `packages/ui/src/components/table/KfTable.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Pagination | 分页 | `frontend/src/components/ui/Pagination.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/pagination/KfPagination.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Tree | 树 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/tree/KfTree.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Drawer | 抽屉 | `frontend/src/components/ui/AppDialog.vue` | 已接入真实组件 | 3 | `packages/ui/src/components/drawer/KfDrawer.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Popover | 浮层 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/popover/KfPopover.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Upload | 本地文件 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/upload/KfUpload.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Badge | 徽标 | `frontend/src/components/ui/Badge.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/badge/KfBadge.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Card | 卡片 | `frontend/src/components/ui/Card.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/card/KfCard.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Skeleton | 骨架屏 | `frontend/src/components/ui/SkeletonList.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/skeleton/KfSkeleton.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Empty | 空状态 | `frontend/src/components/ui/EmptyState.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/empty-state/KfEmptyState.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Progress | 进度条 | `frontend/src/components/ui/Progress.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/progress/KfProgress.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Combobox | 组合搜索 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 5 | `packages/ui/src/components/combobox/KfCombobox.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| SearchInput | 搜索框 | `frontend/src/dev/ReferenceDemos.vue` | 仅有内部演示 | 5 | `packages/ui/src/components/search-input/KfSearchInput.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| AIChat | AI 对话 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 2 | `packages/ai/src/chat-message/KfChatMessage.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| RAG | 检索引用 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 3 | `packages/ai/src/source-list/KfSourceList.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| Agent | 执行轨迹 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 4 | `packages/ai/src/agent-trace/KfAgentTrace.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| Flashcard | 闪卡 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 4 | `packages/learning/src/flashcard/KfFlashcard.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| SmartQuiz | 智能测验 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 2 | `packages/learning/src/question-card/KfQuestionCard.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| Interview | 模拟面试 | `frontend/src/dev/ScenarioPreview.vue` | 仅有内部演示 | 2 | `packages/learning/src/interview-question/KfInterviewQuestion.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 场景组合预览 + 153 Story 挂载 |
| CodeBlock | 代码块 | `frontend/src/components/chat/ChatCodeBlock.vue` | 已接入真实组件 | 1 | `packages/ai/src/code-block/KfCodeBlock.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| SkeletonList | 骨架屏列表 | `frontend/src/components/ui/SkeletonList.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/skeleton/KfSkeleton.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| AppDialog | 对话框（旧名） | `frontend/src/components/ui/AppDialog.vue` | 已接入真实组件 | 2 | `packages/ui/src/components/dialog/KfDialog.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| ToastHost | 通知宿主 | `frontend/src/components/ui/ToastHost.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/toast/KfToast.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| ConfirmDialog | 确认弹窗 | `frontend/src/components/ui/ConfirmDialog.vue` | 已接入真实组件 | 2 | `packages/ui/src/components/confirm-dialog/KfConfirmDialog.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| ContextMenu | 上下文菜单 | `frontend/src/components/ui/ContextMenu.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/context-menu/KfContextMenu.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| EmptyState | 空状态（旧名） | `frontend/src/components/ui/EmptyState.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/empty-state/KfEmptyState.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| ErrorState | 错误状态 | `frontend/src/components/ui/ErrorState.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/error-state/KfErrorState.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| AIComposer | AI 输入区 | `frontend/src/components/ai/AIComposer.vue` | 已接入真实组件 | 3 | `packages/ai/src/chat-composer/KfChatComposer.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| MarkdownRenderer | Markdown 正文 | `frontend/src/components/chat/ChatMarkdownRenderer.vue` | 已接入真实组件 | 1 | `packages/ai/src/markdown/KfMarkdownRenderer.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| Tag | 标签 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/ui/src/components/tag/KfTag.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| Divider | 分割线 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/ui/src/components/divider/KfDivider.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| Typography | 排版 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | —（未实现） | missing（未实现） | 无实现 | 两版均未实现，文档与画布如实标注 | 预览挂载（说明卡） |
| Link | 链接 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/ui/src/components/link/KfLink.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| Breadcrumb | 面包屑 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | —（未实现） | missing（未实现） | 无实现 | 两版均未实现，文档与画布如实标注 | 预览挂载（说明卡） |
| Alert | 提示条 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/ui/src/components/alert/KfAlert.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| Loading | 加载 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | —（未实现） | missing（未实现） | 无实现 | 两版均未实现，文档与画布如实标注 | 预览挂载（说明卡） |
| ReviewProgress | 复习进度 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/learning/src/review-progress/KfReviewProgress.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| QuestionCard | 题目卡片 | `frontend/src/dev/ReferenceDemos.vue` | 尚未实现 | 1 | `packages/learning/src/question-card/KfQuestionCard.vue` | real（真实组件） | 无 | V5 未实现，本轮从零实现（含键盘/焦点/ARIA） | 组件单测 + 153 Story 挂载 |
| Accordion | 折叠面板 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/accordion/KfAccordion.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Avatar | 头像 | `frontend/src/components/ui/Avatar.vue` | 已接入真实组件 | 1 | `packages/ui/src/components/avatar/KfAvatar.vue` | real（真实组件） | 无 | 沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合 | 组件单测 + 153 Story 挂载 |
| ButtonGroup | 按钮组 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/button-group/KfButtonGroup.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| Slider | 滑块 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/slider/KfSlider.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| DataTable | 数据表格 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | —（仅演示） | demo（仅演示） | V5 内部演示耦合 | 保持 demo：V5 只有参考演示，不伪造实现 | 预览挂载（说明卡） |
| InputGroup | 组合输入 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | —（仅演示） | demo（仅演示） | V5 内部演示耦合 | 保持 demo：V5 只有参考演示，不伪造实现 | 预览挂载（说明卡） |
| NumberInput | 数字输入 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/number-input/KfNumberInput.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| TagsInput | 标签输入 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/tags-input/KfTagsInput.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| CopyButton | 复制按钮 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/copy-button/KfCopyButton.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| StatusIndicator | 状态指示 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | `packages/ui/src/components/status-indicator/KfStatusIndicator.vue` | real（真实组件） | 无 | V5 只有 HTML 参考演示，本轮重写为真实组件 | 组件单测 + 153 Story 挂载 |
| ResizablePanels | 可调面板 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | —（仅演示） | demo（仅演示） | V5 内部演示耦合 | 保持 demo：V5 只有参考演示，不伪造实现 | 预览挂载（说明卡） |
| Toolbar | 工具栏 | `frontend/src/dev/ExtensionDemos.vue` | 仅有内部演示 | 2 | —（仅演示） | demo（仅演示） | V5 内部演示耦合 | 保持 demo：V5 只有参考演示，不伪造实现 | 预览挂载（说明卡） |

## 三、状态重算口径

V5 的「已接入真实组件」只代表适配器 import 了某个真实组件，不代表该组件可以脱离业务运行。本轮按三条标准重新核算：

1. **有真实组件**：`packages/` 内存在 `.vue` 实现，且不依赖 Pinia / Router / 业务 API；
2. **可独立渲染**：Studio 用白名单 Props 直接挂载，不需要伪造宿主状态；
3. **可交互且无副作用**：键盘/焦点/错误态可用，且不写学习记录、不发请求。

结果：real 58 条、demo 4 条、missing 3 条。

## 四、迁移中刻意没做的事

- **不复制 V5 适配器**：V5 的适配器多为「包一层 div + 传业务 props」，本仓库改为「真实组件 + 场景预览」两层。
- **不冒充**：demo 条目在画布上显示说明卡，不渲染 HTML 假实现；missing 条目直接标注未实现。
- **不引入业务依赖**：新源码路径全部指向 `packages/`，无一处指向原项目 `frontend/src`。
- **不搬 V5 常量**：注册表数字由 `registry/entries.ts` 现算，质量页/质量报告不引用 V5 报告里的历史统计。
