# 发布检查清单 · v0.2.0

> 结论：**可以本地提交 / 可以推送仓库；不可以 `npm publish`**（许可证未确认）。
> 本文件只记录本轮实测结果，不写"应该没问题"。

## 一、构建与产物

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| `packages/ui` build | ✅ `dist/index.js` 219.4 kB、`dist/style.css` 111.9 kB、`dist/index.d.ts` | `pnpm run build:ui` |
| `packages/ai` build | ✅ 74.2 kB + 46.3 kB CSS | `pnpm run build:ai` |
| `packages/learning` build | ✅ 54.0 kB + 37.2 kB CSS | `pnpm run build:learning` |
| `apps/studio` build | ✅ `index.html` 0.78 kB、JS 352.1 kB、CSS 197.7 kB | `pnpm run build:studio` |
| `vue-tsc` 类型声明 | ✅ 三个包 `--emitDeclarationOnly` 均成功 | build 日志 |
| `check-dist` | ✅ 3 包 / 223 个产物文件 / 0 问题 | `pnpm run verify:dist` |
| 产物无本机路径 / 别名 / 密钥 / 业务 API / pinia / vue-router / axios | ✅ | 同上（规则见脚本） |
| Vue 是否 external | ✅ `dist/index.js` 从 `vue` 导入，无 Vue 运行时内联 | 同上 |
| 44 个组件是否都有类型声明 | ✅ 逐个核对（含 `KfDatePicker`） | 同上 |
| CSS 是否含 `:focus-visible` / `prefers-reduced-motion` | ✅ | 同上 |
| BEM / `--kf-*` / 无 `.kb-` / 无裸元素选择器 | ✅ | 同上 |

## 二、打包与消费验证

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| `pnpm pack` | ✅ `artifacts/beiluol-knowflow-ui-0.2.0.tgz`（105.5 kB） | `pnpm run pack:ui` |
| 包内顶层文件 | ✅ 只有 `dist` + `package.json`（无 `src`） | `verify-consumer` 输出 |
| 隔离安装（无 workspace 链接） | ✅ `examples/vue-vite` 先删 `node_modules`/lockfile，再从 tgz `npm install` | `pnpm run verify:consumer` |
| 消费方 `vue-tsc` | ✅ 0 error | 同上 |
| 消费方 `vite build` | ✅ `index.js` 191.5 kB / `index.css` 99.0 kB | 同上 |
| 打包结果无 `packages/ui/src` / `/Users/` 引用 | ✅ | 同上 |
| CSS 含 `--kf-primary`、JS 含 `kf-button` | ✅ | 同上 |

## 三、测试

| 检查项 | 结果 |
| --- | --- |
| `pnpm run typecheck` | ✅ 4 包 0 error |
| `pnpm run test` | ✅ 22 文件 / 511 例 |
| `npx playwright test` | ✅ 22 例 / 15 张截图 |
| 原项目零修改 | ✅ `snapshot-original.mjs compare`：`originalUntouched: true`、`problemCount: 0`、HEAD `78f4b11d` 前后一致、git status 条数 1328 → 1328 |

## 四、npm publish 阻断项（**不发布**）

| 阻断项 | 详情 | 解除方式 |
| --- | --- | --- |
| 许可证未确认 | 四个包均为 `"license": "UNLICENSED"`；原 KnowFlow 仓库无 LICENSE，迁移代码的再许可权利未由权利人确认 | 仓库所有者书面确认后，补 `LICENSE` 并改 `package.json`，再更新 `THIRD_PARTY_LICENSES.md` |
| `ai`/`learning` peer 版本 | peerDependencies 写着 `workspace:^0.2.0`（pnpm 发布时才替换）；单独发布前建议改成 `^0.2.0` | 发布前调整 + 复跑 `verify:dist` |
| 未做 registry 端验证 | 没有尝试 `npm publish --dry-run` 到真实 registry | 解除许可证后执行 dry-run |

因此本轮**不执行 `npm publish`**，只产出 tarball 并验证「外部开发者装得到同样的东西」。

## 五、Git 状态

| 项 | 状态 |
| --- | --- |
| 分支 | `main` |
| 远程 | `origin` = `https://github.com/beiluoL/knowflow-ui.git`；`gitee` = `git@gitee.com:beiluol/knowflow-ui.git` |
| 远程当前提交 | `0d07f4f`（`origin/main` 与 `gitee/main` 都在这里） |
| 本地领先提交 | `1b234f2` refactor(naming)（上一轮，**未推送**）+ 本轮待提交 |
| 本轮提交信息 | `feat: migrate KnowFlow V5 playground and expand UI library` |
| 推送策略 | **等用户确认后**分别推 `origin` 与 `gitee`；不使用 `--force` |

> 注：`origin` 走 HTTPS 在本机会受代理影响，必要时可临时改用 `git@github.com:beiluoL/knowflow-ui.git`（SSH 已配置）。`gitee` 已是 SSH。

## 六、本次提交包含什么

- `packages/ui`：+39 个组件（含新增 `KfDatePicker`）、Select `loading`、44 项注册表
- `packages/ai`：12 个组件（含 Composer `error`）
- `packages/learning`：11 个组件
- `packages/tokens`：75 个令牌、8 组、兼容桥
- `apps/studio`：全新 Studio（65 条目 / 153 Story / 7 标签 / ⌘K / 移动端抽屉）
- 测试：ui 133、ai 102、learning 79、studio 197、browser 22
- 脚本：`check-dist`（3 包）、`verify-consumer`（自动对齐 tgz 名）、`gen-migration-docs`（文档生成）
- 文档：`docs/migration/v5-to-ui/` 十份 + `evidence/`

## 七、回滚方案

| 场景 | 操作 |
| --- | --- |
| 需要退回 v0.1.0 | `git revert <本轮提交>`（**禁止** `reset --hard`） |
| Studio 构建异常 | `git revert` 后 `pnpm install && pnpm run build:studio` |
| tarball 有问题 | 删 `artifacts/*.tgz` 重新 `pnpm run pack:ui`，`verify:consumer` 会重新装 |
| 原项目被误改（本轮未发生） | 用 `evidence/baseline.json` 的哈希定位差异，人工还原；**不要**对原项目执行任何 git 写操作 |

## 八、发布前最后一遍（清单）

```bash
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:dist
pnpm run pack:ui
pnpm run verify:consumer
cd apps/studio && npx playwright test
node scripts/snapshot-original.mjs after && node scripts/snapshot-original.mjs compare
git status --short          # 确认改动只在 knowflow-ui 内
```

全部通过 → 提交。发布：等许可证确认。
