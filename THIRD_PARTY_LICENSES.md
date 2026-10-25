# 第三方许可证（THIRD_PARTY_LICENSES）

本文件记录 KnowFlow UI 中外部代码、图标素材与工具链依赖的来源与许可证。

> 审计结论（v0.1.0）：**本仓库整体未声明开源许可证**。原 KnowFlow 项目根目录没有 LICENSE 文件，
> 迁移代码的再许可权利尚未由权利人确认，因此 `package.json` 标注 `UNLICENSED`，不声明 MIT/Apache。
> 对外发布前必须先完成权利人确认。

---

## 1. 迁移代码（来自 KnowFlow）

| 内容 | 来源 | 权利状态 |
| --- | --- | --- |
| `KfButton` / `KfInput` / `KfCheckbox` / `KfFormField` 的组件逻辑与样式 | KnowFlow `frontend/src/components/{ui/Button.vue, Input.vue, Checkbox.vue, FormField.vue}` 及其全局样式 `.kb-*` | ⚠️ 原仓库无 LICENSE，权利未确认 → 本项目标注 UNLICENSED |
| `KfIcon` 的图标渲染方式与 78 个 SVG 路径 | KnowFlow `frontend/src/components/ui/Icon.vue` | 同上；图标本身见第 2 节 |
| 设计令牌数值 | KnowFlow `frontend/src/style.css`、`frontend/src/styles/ui-tokens.css` | 同上 |

**为什么不能直接写 MIT**：迁移的是原项目的实现与设计数值，不是从零重写。没有 LICENSE 的仓库默认
保留所有权利（all rights reserved），第三方无权单方面改为 MIT。需要仓库所有者明确同意后才能改。

## 2. 图标素材（lucide）

- 来源：KnowFlow `Icon.vue` 内联的 212 个 lucide 风格图标路径；本项目取其中 78 个。
- 上游项目：<https://lucide.dev>（前身 Feather Icons）
- 许可证：**ISC License**（lucide 与 Feather 均为 ISC，允许商用、修改、再分发，需保留版权与许可声明）
- 义务：再分发时保留 ISC 声明。建议发布前在包内附带本文件的 ISC 段落。

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

> 说明：`Icon.vue` 中的路径为手写/改写后的形态，若需严格合规，发布前应逐条与 lucide 上游比对，
> 或改为直接从 `lucide-vue-next` 依赖引用（Roadmap 中评估）。

## 3. 字体

组件只引用字体族名称，不打包任何字体文件：

- `Noto Sans SC` / `Noto Serif SC` — SIL Open Font License 1.1
- `JetBrains Mono` — SIL Open Font License 1.1

原项目通过 `fonts.loli.net` CDN 加载字体，本组件库**不**发起任何字体请求；由消费方自行决定字体来源。

## 4. 工具链与运行时依赖

| 包 | 版本（本地实测） | 许可证 | 用途 |
| --- | --- | --- | --- |
| `vue` | 3.5.44 | MIT | peerDependency（不打包） |
| `vite` | 8.3.5 | MIT | 构建 |
| `vitest` | 4.1.12 | MIT | 测试 |
| `typescript` | 6.0.3 | Apache-2.0 | 类型检查 |
| `vue-tsc` | 3.3.13 | MIT | SFC 类型声明生成 |
| `@vitejs/plugin-vue` | 6.x | MIT | SFC 编译 |
| `@vue/test-utils` | 2.x | MIT | 组件测试 |
| `happy-dom` | 20.14.6 | MIT | 测试 DOM 环境 |

运行时依赖只有 `vue`（peer）。构建期依赖不进入 `dist`，因此不随包分发。

## 5. 本次发布前已做的检查

| 检查 | 结果 |
| --- | --- |
| 产物是否包含本机绝对路径 / `@/` 别名 / 业务 API / 密钥 | ✅ `pnpm verify:dist` 通过 |
| 是否重复打包 Vue 运行时 | ✅ 入口 `import ... from "vue"`，external 生效 |
| 是否包含第三方源码文件 | ✅ 只有自研组件 + 图标常量（ISC 已声明） |
| npm scope / 包名归属 | ⚠️ 未验证 `@beiluol` 的 npm 归属，未发布 |
| 整体再许可权利 | ⚠️ 未确认（UNLICENSED） |
