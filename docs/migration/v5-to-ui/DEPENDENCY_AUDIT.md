# 依赖与边界审计

> 目标：证明「组件库能脱离原项目、脱离业务栈运行」，并如实记录剩下哪些依赖是刻意的。
> 所有结论都可以用文末命令复跑。

## 一、运行时依赖：零

| 包 | `dependencies` | `peerDependencies` | 构建 external |
| --- | --- | --- | --- |
| `@beiluol/knowflow-tokens` | `{}` | `{}` | —（纯 CSS + 只读工具） |
| `@beiluol/knowflow-ui` | `{}` | `vue ^3.4.0` | `vue` |
| `@beiluol/knowflow-ai` | `{}` | `vue ^3.4.0`、`@beiluol/knowflow-ui` | `vue`、`@beiluol/knowflow-ui` |
| `@beiluol/knowflow-learning` | `{}` | `vue ^3.4.0`、`@beiluol/knowflow-ui` | `vue`、`@beiluol/knowflow-ui` |

没有日期库、没有图标库、没有 Markdown 库、没有请求库、没有状态管理库。理由不是"清高"，而是这些选择会传染给宿主：一旦组件库带 `dayjs`，宿主就没法统一时区策略；一旦带 `axios`，组件库就开始有了"该不该发请求"的争议。

`@playwright/test` 只是 Studio 的 devDependency，不进任何包的产物。

## 二、依赖方向

```
tokens  ←─ ui  ←─ ai
                 └─ learning

apps/studio  ──imports──▶  ui / ai / learning / tokens   （单向消费，不反向）
examples/vue-vite ──imports──▶ 只有 tgz 产物            （不接触源码）
```

- `ai` / `learning` 依赖 `ui` 的 `KfIcon`、`KfButton`、`KfProgress` 等基础件；`ui` 不知道它们存在。
- Studio 依赖四个包，四个包**不知道 Studio 存在**（产物里搜不到 `apps/studio`、`st-` 前缀类名）。

## 三、业务栈隔离（逐条扫描结果）

| 检查项 | 结果 | 命令 |
| --- | --- | --- |
| 引用原项目路径（`frontend/src`、`qoderProject/knowflow`） | **0 处** | `grep -rn "frontend/src\|qoderProject/knowflow/" packages/*/src apps/studio/src` |
| `pinia` / `vue-router` / `axios` 导入 | **0 处** | `grep -rn "from 'pinia'\|from 'vue-router'\|from 'axios'" packages/*/src apps/studio/src` |
| `fetch` / `WebSocket` / `EventSource` / `XMLHttpRequest` | **0 处**（`packages/*/src`） | `grep -rn "fetch(\|new WebSocket\|EventSource\|XMLHttpRequest" packages/*/src` |
| `v-html` | **0 处使用**（只有 5 处注释解释"为什么不用"） | `grep -rn "v-html" packages/*/src apps/studio/src` |
| `localStorage` / `sessionStorage` | 0 处（主题偏好由 Studio 的 `useTheme` 管，不进组件） | `grep -rn "localStorage" packages/*/src` |
| 绝对路径 / 本机路径 | 产品物 0 处（`check-dist.mjs` 拦截 `/Users/`） | `pnpm run verify:dist` |
| 业务后端 API 路径（`/api/`） | 产品物 0 处（`check-dist.mjs` 拦截） | `pnpm run verify:dist` |

## 四、刻意保留的依赖

| 依赖 | 谁用 | 为什么保留 | 风险 |
| --- | --- | --- | --- |
| `vue ^3.4.0`（peer） | 全部组件 | 组件就是 Vue 组件 | 宿主必须是 Vue 3.4+；内部未使用 3.5 才有的 `useId`，改用自带 `nextInstanceId()` |
| `@beiluol/knowflow-ui`（ai/learning peer） | AI / 学习组件复用 `KfIcon`/`KfButton` | 避免两套图标与按钮 | 单独发布 `ai`/`learning` 时需先发布 `ui`（写进 RELEASE_CHECKLIST） |
| `@playwright/test`（dev） | Studio 浏览器回归 | 真实 Chrome 验收 | 只影响开发环境 |

## 五、Studio 与组件的耦合方式

Studio 用 Vite alias 把包名映射到源码：

```ts
{ find: /^@beiluol\/knowflow-ui$/, replacement: src('../../packages/ui/src/index.ts') }
```

这样做的收益是 HMR 与"预览即真实组件"；代价是 Studio 构建会把三包源码打进来（`dist` 352 kB JS / 197 kB CSS）。发布链路的真实性不靠 Studio 证明，而靠 `examples/vue-vite`：它**不在 pnpm workspace 内**，每次先删 `node_modules` 再从 tarball 安装。

`previews/runtime.ts` 是「字符串组件名 → 组件对象」的唯一入口，预览、API 表、测试三处共用，避免"预览用 A、文档写 B"。

## 六、第三方素材与许可证

- **图标**：78 个内联 SVG 路径，迁移自原项目 `Icon.vue`，未引入任何图标包。
- **字体**：只声明字体栈（`var(--kf-font-sans)`），不分发字体文件。
- **图片/插画**：无。Studio 的 fixture 不含真实用户数据与外部图片。
- ⚠️ **许可证状态**：各包 `license: UNLICENSED`。原 KnowFlow 仓库无 LICENSE 文件，迁移代码的再许可权利未确认，详见 `THIRD_PARTY_LICENSES.md`。**这是 npm publish 的阻断项**（不是本地提交/推送的阻断项）。

## 七、复跑命令

```bash
pnpm run verify:dist          # 产物级：本机路径 / 别名 / 密钥 / 业务栈依赖 / Vue 是否 external
pnpm run verify:consumer      # 消费级：tarball 安装后 typecheck + build，扫打包结果是否引用 packages/ui/src
node -e "console.log(require('./packages/ui/package.json').dependencies)"   # 应为 {}
```
