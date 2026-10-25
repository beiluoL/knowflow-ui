# Phase 1 · 架构与实施计划

> 一句话：把 V5 的「开发中心」拆成**可独立发布的组件库**（`packages/*`）+ **只消费、不反向依赖的 Studio**（`apps/studio`）+ **证明消费方可用的示例**（`examples/vue-vite`）。

## 一、目标结构

```
knowflow-ui/
├── apps/
│   └── studio/                 # V5 开发中心迁移目标，http://localhost:5180
│       ├── src/
│       │   ├── pages/          # Catalog / Component / Quality / Tokens
│       │   ├── components/     # 预览画布、属性面板、代码示例、API 表、Story 轨、命令面板
│       │   ├── registry/       # entries(65) / stories(153) / specs / quality（唯一数据源）
│       │   ├── previews/       # runtime 索引 + GenericPreview + 22 个场景组合
│       │   ├── fixtures/       # 本地示例数据（无网络、无真实用户数据）
│       │   ├── composables/    # hash 路由、主题
│       │   └── styles/         # studio.css（壳层样式，与组件样式分离）
│       ├── tests/browser/      # Playwright 回归（Chrome）
│       ├── playwright.config.ts
│       └── vite.config.ts      # alias 到 packages/*/src（源码联调，不跨目录）
├── packages/
│   ├── tokens/                 # --kf-* 单一来源 + --kb-* 单向兼容桥
│   ├── ui/                     # 44 个通用组件（含 5 个别名/组合）
│   ├── ai/                     # 12 个 AI 展示组件（不发请求）
│   └── learning/               # 11 个学习组件（不写记录、不评分）
├── examples/vue-vite/          # 刻意在 workspace 之外：只装 tgz 产物
├── docs/migration/v5-to-ui/    # 本轮十份文档 + evidence
└── scripts/                    # 产物检查、打包、消费验证、快照、文档生成
```

## 二、包边界（不可协商）

| 规则 | 原因 | 验证方式 |
| --- | --- | --- |
| `packages/*` 不依赖 `apps/*` | Studio 是消费者，不是运行时依赖 | `check-dist.mjs` 扫产物 + 人工 review import |
| `apps/studio` 只通过包名导入组件 | 保证预览的是"宿主会装到的东西" | `vite.config.ts` 只把包名 alias 到源码 |
| 依赖方向单向：`ai`/`learning` → `ui` → `tokens` | 防止循环依赖与版本地狱 | `package.json` peerDependencies |
| 运行时依赖为零 | 组件库不能替宿主选日期库/请求库 | 各包 `dependencies: {}` |
| Studio 不引入 vue-router | 单页工具不需要路由栈，也避免与业务路由混淆 | `composables/useHashRoute.ts` |

## 三、Studio 的四个决定

1. **hash 路由而不是 vue-router**：`#/c/button/size-lg?tab=api&viewport=mobile` 在 `file://` 与静态托管下都能直接用，不需要服务端 fallback。
2. **注册表驱动，不写模板**：65 条目 / 153 Story 全部来自 `registry/`，页面只做渲染。新增条目 = 加一行数据 + 必要时加一个场景预览。
3. **两层预览**：`GenericPreview` 用「真实组件 + 白名单 Props」直出；只有必须写代码的场景（模态、集合、复合）才进 `previews/custom.ts`。当前 25 条走场景组合、33 条走通用渲染、7 条（demo/missing）走说明卡。
4. **质量数字现算**：`registry/quality.ts` 从注册表现算，导出 JSON / Markdown。**不引用 V5 的 1628 项、也不引用 v0.1.0 的 42 项**。

## 四、Phase 划分与实际产出

| Phase | 内容 | 结果 |
| --- | --- | --- |
| 0 审计 | 分类 A–E、状态重算口径、V5 基线解析 | `AUDIT.md` + `evidence/v5-matrix.json` |
| 1 架构 | monorepo 结构、包边界、Studio 骨架 | 本文件 |
| 2 迁移 | 65 条目 / 153 Story / 7 个标签页 / 移动端 Drawer / ⌘K | `apps/studio/src/**` |
| 3 提取 | P0 16 + P1 13 + 扩展 8 + AI 12 + 学习 11 | `packages/{ui,ai,learning}` |
| 4 Demo 升级 | 8 个扩展条目从 HTML 参考升级为真实组件 | `packages/ui/src/components/{accordion,button-group,slider,…}` |
| 5 AI 组件 | 12 个，零请求、零 v-html、审批只发事件 | `packages/ai` |
| 6 学习组件 | 11 个，不内置 FSRS / 记录 / 评分 | `packages/learning` |
| 7 设计规范 | `--kf-*` 令牌、BEM、字号/圆角令牌化 | `packages/tokens` + 各组件 `<style>` |
| 8/9 Studio 与 API | 目录、Story 浏览器、预览、API 表、Inspector、质量导出 | `apps/studio` |
| 10 测试 | 单测 314 + Studio 197 + 浏览器 22 | `TEST_REPORT.md` / `BROWSER_REPORT.md` |

## 五、关键决策与其代价

| 决策 | 收益 | 代价（如实记录） |
| --- | --- | --- |
| 组件全部重写而不是复制 V5 适配器 | 真正可独立运行、可发布 | 工作量大；每个组件都要补键盘/焦点/ARIA 测试 |
| 日历/日期选择器自研（不引日期库） | 零运行时依赖、时区行为可控 | 只有格里高利历、周起始可配，无农历/多历法 |
| Markdown 用 token 解析而不是 `marked + v-html` | 不可信内容不会变成可执行 HTML | 支持的语法是白名单子集（标题/列表/引用/代码/表格/链接/强调） |
| Studio 直接 alias 到源码 | HMR 快、改组件立刻可见、不跨目录 | Studio 构建体积包含三包源码；发布链路由 `examples/vue-vite` 单独验证 |
| demo 条目保持 demo | 不制造"假组件" | 4 个条目仍是说明卡，DataTable 等能力暂不可用 |
| Playwright 用系统 Chrome（`channel: 'chrome'`） | 不额外下载浏览器、验证真实 Chrome | 依赖本机已安装 Chrome |

## 六、验收方式（可复跑）

```bash
pnpm run typecheck        # 4 个包，0 error
pnpm run test             # 314（ui 133 + ai 102 + learning 79）+ Studio 197
pnpm run build            # ui / ai / learning / studio 全部产出
pnpm run verify:dist      # 3 个包的产物安全检查（泄漏/别名/密钥/业务栈依赖）
pnpm run pack:ui          # artifacts/beiluol-knowflow-ui-0.2.0.tgz
pnpm run verify:consumer  # 隔离安装 tgz → typecheck → build
cd apps/studio && npx playwright test   # 22 例真实浏览器回归 + 15 张截图
node scripts/snapshot-original.mjs compare  # 原项目零修改
```

## 七、风险与已知边界

- **4 个 demo 条目**（DataTable / InputGroup / ResizablePanels / Toolbar）需要独立的版本级工作，本轮不做。
- **3 个 missing 条目**（Typography / Breadcrumb / Loading）未实现，文档与画布都标注为未实现。
- **`ai` / `learning` 的 peerDependencies 指向 `workspace:^0.2.0`**：单独发布这两个包时，需要先把 `@beiluol/knowflow-ui@0.2.0` 发布到 registry，或改用具体版本号。本轮只验证 `@beiluol/knowflow-ui` 的 tarball 安装。
- **200% 缩放**用 720×450 CSS 视口等效验证，不模拟系统级缩放（Chrome 的页面缩放由浏览器渲染，DOM 断言的等价场景是小视口）。
