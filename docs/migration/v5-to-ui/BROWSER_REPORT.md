# 浏览器验收报告 · Chrome

> 工具：Playwright + 系统 Google Chrome（`channel: 'chrome'`，不额外下载 Chromium）
> 命令：`cd apps/studio && npx playwright test` → **22 例通过 / 0 失败**
> 截图：`evidence/screens/` 共 15 张（真实 1:1 像素，非缩略图）
> 位置：`http://localhost:5180`（Studio dev server，由 Playwright `webServer` 自启）

## 一、视口矩阵

| 视口 | 目录页 | 条目工作台 | 结论 |
| --- | --- | --- | --- |
| 1440×900 | `catalog-1440x900.png` | `workbench-1440x900.png` | ✅ 三栏完整，无横向溢出 |
| 1280×800 | `catalog-1280x800.png` | `workbench-1280x800.png` | ✅ 右栏收窄，Prop 控件不换行 |
| 1024×768 | `catalog-1024x768.png` | `workbench-1024x768.png` | ✅ 左栏折叠为图标+文字单列，无溢出 |
| 390×844 | `catalog-390x844.png` | `workbench-390x844.png` | ✅ 顶部菜单抽屉 + Story/Props 双 Drawer |
| 375×812 | `catalog-375x812.png` | `workbench-375x812.png` | ✅ 同上；画布顶栏折两行 |
| 720×450（200% 缩放等效） | — | `zoom-200-720x450.png` | ✅ 单栏堆叠，无横向滚动 |

判定「无横向溢出」的口径：`document.documentElement.scrollWidth ≤ clientWidth + 1`。这条断言在 12 个用例里都执行，是 CSS 回归最容易破的地方。

## 二、主题与视觉

| 项 | 截图 | 结论 |
| --- | --- | --- |
| Dark | `theme-dark-1440x900.png` | ✅ `html[data-theme="dark"]` 生效，`--kf-background` 计算值发生变化（不是只换个 class） |
| Light | 各视口截图 | ✅ 白卡 + `#F7F8FA` 背景 + `#3B6FE0` 主色 |
| 弹窗 | `dialog-open.png` | ✅ 遮罩、焦点环、按钮层级正常 |
| 长内容弹窗 | `dialog-long-content.png` | ✅ 内部滚动，`clientHeight ≤ window.innerHeight`，标题不滚走 |
| 质量页面 | `quality-1440x900.png` | ✅ 指标卡显示 65 / 153，条形图正常 |

## 三、22 条用例清单

**响应式布局（11）**

| # | 用例 |
| ---: | --- |
| 1–5 | 目录页在 1440/1280/1024/390/375 五个视口：标题可见、无横向溢出、截图 |
| 6–10 | 条目工作台在同样五个视口：`[data-preview-root]` 可见、无横向溢出、截图 |
| 11 | 200% 缩放等效（720×450）：画布可见、无横向溢出、截图 |

**深链接与标签（3）**

| # | 用例 |
| ---: | --- |
| 12 | `#/c/select/basic?tab=api` → API 标签 `aria-selected=true`、标题正确 |
| 13 | `?tab=preview&viewport=tablet` → 平板按钮 `aria-pressed=true`；切到 API 后 URL 仍保留 `viewport` |
| 14 | 切标签写回 URL；`page.goBack()` 回到上一个条目；390×844 下 Story Drawer 可开可 Esc 关 |

**键盘可达性（3）**

| # | 用例 |
| ---: | --- |
| 15 | `Meta+K` 打开命令面板 → 输入 `table` → `↓` → `Enter` → 跳到 `#/c/table*` |
| 16 | Esc 关闭命令面板，弹层从 DOM 消失 |
| 17 | Dialog：连续 `Tab` 焦点仍在面板内；Esc 关闭后焦点回到「重新打开」按钮 |

**长文本与浮层清理（2）**

| # | 用例 |
| ---: | --- |
| 18 | 超长正文在弹窗内部滚动，`clientHeight ≤ window.innerHeight` |
| 19 | 连续切 6 个含浮层的条目后回目录：`[role=dialog]` 0 个、`.kf-toast` 0 个、控制台 0 错误 |

**主题与令牌（2）**

| # | 用例 |
| ---: | --- |
| 20 | 深色切换 → `--kf-background` 计算值改变 → 切回浅色 |
| 21 | 令牌页读到的第一个值是真实计算值（非空） |

**质量面板（1）**

| # | 用例 |
| ---: | --- |
| 22 | 质量页指标卡包含 `65` 与 `153`（来自当前注册表，不是写死的） |

## 四、浏览器里发现并修掉的问题

| 问题 | 现象 | 处理 |
| --- | --- | --- |
| 375px 画布顶栏被控件挤爆 | Story 名缩成一个点，`real` 徽标消失 | ≤600px 顶栏折两行：第一行 Story + 状态，第二行视口/背景/全屏/重置 |
| 移动端标签栏出现滚动条压内容 | 7 个标签横向溢出，滚动条盖住文字 | `.st-tabs` 隐藏滚动条（仍可滑动） |
| 深链接 tab 中文标签与 V5 不一致 | `?tab=api` 显示「API」但本地曾写成「代码示例」 | 恢复 V5 英文标签 |
| Dialog 首屏自动打开时"关闭后回焦"断言失败 | 首屏没有触发元素，焦点只能回 body | 修正测试语义：验证「由按钮打开 → 关闭回触发按钮」，而不是强求回 body 里的某个元素 |

## 五、未做/不宣称

- **不做截图 diff**：字体渲染与抗锯齿跨机器不一致，diff 会变成噪声。改为结构断言 + 人工抽查截图。
- **不测 Safari/Firefox**：本轮验收范围是 Chrome；组件用的是标准 API（`inert` 有降级、`aria-*` 原生属性），但没有跨浏览器实测证据，故不宣称。
- **不模拟系统级 200% 缩放**：用 720×450 CSS 视口等效（Chrome 页面缩放不改变 DOM 布局断点语义）。
- **不测真实设备**：移动端为 Chrome 视口模拟，未覆盖 iOS Safari 的 100vh/键盘弹出差异。

## 六、复跑

```bash
cd apps/studio
npx playwright test                 # 22 例
npx playwright test --headed        # 需要肉眼看时
npx playwright test -g "375x812"    # 只跑某个视口
```
如需清理产物：`docs/migration/v5-to-ui/evidence/browser-artifacts/`（失败时的 trace/error-context）可整目录删除，截图在 `evidence/screens/` 不要删。
