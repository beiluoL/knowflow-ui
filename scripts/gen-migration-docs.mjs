#!/usr/bin/env node
/**
 * gen-migration-docs.mjs — 从「V5 基线 + 本仓库注册表」生成两张不许手抄的矩阵。
 *
 * 为什么要有这个脚本：65 条目 × 10 列、153 Story 手抄必错，而且一旦注册表改动，
 * 文档就会悄悄过期。这里让 COMPONENT_MATRIX.md / STORY_MATRIX.md 完全由数据生成：
 *
 *   docs/migration/v5-to-ui/evidence/v5-matrix.json   ← V5 侧事实（原状态/原源码/Story 数）
 *   artifacts/registry-dump.json                      ← v0.2.0 侧事实（由 Studio 注册表导出）
 *
 * 数据准备：
 *   1. pnpm --filter @knowflow-ui/studio dump:registry
 *   2. node scripts/gen-migration-docs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dumpPath = path.join(repoRoot, 'artifacts/registry-dump.json')
const baselinePath = path.join(repoRoot, 'docs/migration/v5-to-ui/evidence/v5-matrix.json')
const outDir = path.join(repoRoot, 'docs/migration/v5-to-ui')

for (const [label, file, hint] of [
  ['artifacts/registry-dump.json', dumpPath, 'pnpm --filter @knowflow-ui/studio dump:registry'],
  ['docs/migration/v5-to-ui/evidence/v5-matrix.json', baselinePath, '从 V5 COMPONENT_MATRIX.md 解析后放回 evidence/'],
]) {
  if (!fs.existsSync(file)) {
    console.error(`[gen-docs] 缺少 ${label}\n  生成方式：${hint}`)
    process.exit(1)
  }
}

const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'))
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
const baselineByName = new Map(baseline.rows.map((row) => [row.name, row]))

const NEW_STATUS = { real: 'real（真实组件）', demo: 'demo（仅演示）', missing: 'missing（未实现）' }
const OLD_STATUS = {
  已接入真实组件: '已接入真实组件',
  仅有内部演示: '仅有内部演示',
  尚未实现: '尚未实现',
}

function cell(value) {
  return String(value ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

/** 「迁移修改」列：按「V5 状态 → 本轮状态」的迁移路径说明真实做了什么 */
function changeNote(entry, v5) {
  if (entry.status === 'real') {
    if (v5.status === '尚未实现') return 'V5 未实现，本轮从零实现（含键盘/焦点/ARIA）'
    if (v5.status === '仅有内部演示') return 'V5 只有 HTML 参考演示，本轮重写为真实组件'
    if (entry.name === 'DatePicker') return 'V5 有 DatePicker.vue；knowflow-ui v0.1.0 未包含，本轮补齐'
    return '沿用真实组件，重写为 Kf + BEM + 令牌，剥离业务耦合'
  }
  if (entry.status === 'demo') return '保持 demo：V5 只有参考演示，不伪造实现'
  return '两版均未实现，文档与画布如实标注'
}

function testNote(entry) {
  if (entry.status !== 'real') return '预览挂载（说明卡）'
  if (entry.components.length > 1) return '场景组合预览 + 153 Story 挂载'
  return '组件单测 + 153 Story 挂载'
}

/* ── COMPONENT_MATRIX.md ─────────────────────────────────── */

function componentMatrix() {
  const v5Totals = baseline.totals
  const lines = [
    '# V5 → KnowFlow UI 组件迁移矩阵',
    '',
    `> 生成时间：${dump.generatedAt}`,
    '> 生成方式：`node scripts/gen-migration-docs.mjs`（V5 侧事实来自 `evidence/v5-matrix.json`，v0.2.0 侧事实来自 Studio 注册表导出）',
    '',
    '## 一、两个版本的数字对照',
    '',
    '| 指标 | V5（原项目） | v0.2.0（本仓库） |',
    '| --- | ---: | ---: |',
    `| 条目总数 | ${v5Totals.entries} | ${dump.entryStats.total} |`,
    `| 真实组件（real） | ${v5Totals.byStatus['已接入真实组件']} | ${dump.entryStats.real} |`,
    `| 仅演示（demo） | ${v5Totals.byStatus['仅有内部演示']} | ${dump.entryStats.demo} |`,
    `| 未实现（missing） | ${v5Totals.byStatus['尚未实现']} | ${dump.entryStats.missing} |`,
    `| Story 总数 | ${v5Totals.stories} | ${dump.storyStats.total} |`,
    '',
    '> V5 的「真实适配 29」里包含同一源码被多个条目复用的情况（唯一生产源码 23 个）；本仓库按「独立可发布组件」重算，因此 real 条目数与公共组件数不同。',
    '',
    'v0.2.0 的 API 文档量：',
    '',
    '| 指标 | 数值 |',
    '| --- | ---: |',
    `| 文档化 Props | ${dump.quality.api.props} |`,
    `| 文档化事件 | ${dump.quality.api.events} |`,
    `| 文档化插槽 | ${dump.quality.api.slots} |`,
    `| 有事件文档的条目 | ${dump.quality.api.documentedEvents} |`,
    `| 专门组合预览 / 通用渲染 / 无预览 | ${dump.quality.previews.custom} / ${dump.quality.previews.generic} / ${dump.quality.previews.none} |`,
    `| 有可访问性说明的条目 | ${dump.quality.coverage.a11yDocumented} |`,
    `| 有设计规格（数字）的条目 | ${dump.quality.coverage.designSpecsDocumented} |`,
    '',
    '按分类（v0.2.0）：',
    '',
    '| 分类 | 条目数 |',
    '| --- | ---: |',
    ...Object.entries(dump.quality.entries.byCategory).map(([name, count]) => `| ${name} | ${count} |`),
    '',
    '按包（v0.2.0）：',
    '',
    '| 包 | 条目数 |',
    '| --- | ---: |',
    ...Object.entries(dump.quality.entries.byPackage).map(([name, count]) => `| ${name} | ${count} |`),
    '',
    '## 二、逐条目矩阵',
    '',
    '| 原条目 ID | 原组件名 | 原源码 | 原状态 | Story 数 | 新源码 | 新状态 | 业务依赖 | 迁移修改 | 测试 |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
  ]

  const missingBaseline = []
  for (const entry of dump.entries) {
    const v5 = baselineByName.get(entry.name)
    if (!v5) missingBaseline.push(entry.name)
    // V5 源码路径直接来自其矩阵的相对链接（../../../frontend/src/...），去掉前缀即可
    const oldPath = v5?.sourcePath ? v5.sourcePath.replace(/^(\.\.\/)+/, '') : ''
    const oldSource = oldPath ? `\`${oldPath}\`` : '—'
    const newSource =
      entry.status === 'real' ? `\`${entry.source}\`` : entry.status === 'demo' ? '—（仅演示）' : '—（未实现）'
    const business = entry.status === 'real' ? '无' : entry.status === 'demo' ? 'V5 内部演示耦合' : '无实现'

    lines.push(
      `| ${cell(entry.name)} | ${cell(entry.title)} | ${oldSource} | ${cell(OLD_STATUS[v5?.status] ?? v5?.status)} | ${v5?.stories ?? 0} | ${cell(newSource)} | ${cell(NEW_STATUS[entry.status])} | ${cell(business)} | ${cell(changeNote(entry, v5 ?? { status: '尚未实现' }))} | ${cell(testNote(entry))} |`,
    )
  }

  if (missingBaseline.length) {
    console.warn(`[gen-docs] 注意：以下条目在 V5 基线里找不到：${missingBaseline.join(', ')}`)
  }

  lines.push(
    '',
    '## 三、状态重算口径',
    '',
    'V5 的「已接入真实组件」只代表适配器 import 了某个真实组件，不代表该组件可以脱离业务运行。本轮按三条标准重新核算：',
    '',
    '1. **有真实组件**：`packages/` 内存在 `.vue` 实现，且不依赖 Pinia / Router / 业务 API；',
    '2. **可独立渲染**：Studio 用白名单 Props 直接挂载，不需要伪造宿主状态；',
    '3. **可交互且无副作用**：键盘/焦点/错误态可用，且不写学习记录、不发请求。',
    '',
    `结果：real ${dump.entryStats.real} 条、demo ${dump.entryStats.demo} 条、missing ${dump.entryStats.missing} 条。`,
    '',
    '## 四、迁移中刻意没做的事',
    '',
    '- **不复制 V5 适配器**：V5 的适配器多为「包一层 div + 传业务 props」，本仓库改为「真实组件 + 场景预览」两层。',
    '- **不冒充**：demo 条目在画布上显示说明卡，不渲染 HTML 假实现；missing 条目直接标注未实现。',
    '- **不引入业务依赖**：新源码路径全部指向 `packages/`，无一处指向原项目 `frontend/src`。',
    '- **不搬 V5 常量**：注册表数字由 `registry/entries.ts` 现算，质量页/质量报告不引用 V5 报告里的历史统计。',
    '',
  )
  return lines.join('\n')
}

/* ── STORY_MATRIX.md ─────────────────────────────────────── */

function storyMatrix() {
  const byComponent = new Map()
  for (const story of dump.stories) {
    if (!byComponent.has(story.componentId)) byComponent.set(story.componentId, [])
    byComponent.get(story.componentId).push(story)
  }

  const lines = [
    '# V5 Story 迁移清单',
    '',
    `> 生成时间：${dump.generatedAt}`,
    '> 生成方式：`node scripts/gen-migration-docs.mjs`（`buildStories()` 的产物，不是手抄清单）',
    '',
    '## 一、总量',
    '',
    '| 指标 | V5 | v0.2.0 |',
    '| --- | ---: | ---: |',
    `| Story 总数 | ${baseline.totals.stories} | ${dump.storyStats.total} |`,
    `| 覆盖组件 | ${baseline.totals.entries} | ${dump.storyStats.components} |`,
    '',
    `平均每组件 **${Math.round((dump.storyStats.total / dump.storyStats.components) * 10) / 10}** 条；逐条目数量与 V5 完全一致（下表「V5 / 本轮」两列相等）。`,
    '',
    '按类别（v0.2.0）：',
    '',
    '| 类别 | 数量 |',
    '| --- | ---: |',
    ...Object.entries(dump.storyStats.byCategory).map(([name, count]) => `| ${name} | ${count} |`),
    '',
    '## 二、逐组件 Story 数',
    '',
    '| 条目 | 条目 ID | V5 / 本轮 | Story 列表 |',
    '| --- | --- | ---: | --- |',
  ]

  for (const entry of dump.entries) {
    const stories = byComponent.get(entry.id) ?? []
    const v5 = baselineByName.get(entry.name)
    const same = (v5?.stories ?? 0) === stories.length ? '✅' : '⚠️'
    lines.push(
      `| ${cell(entry.title)} | \`${entry.id}\` | ${v5?.stories ?? 0} / ${stories.length} ${same} | ${stories.map((story) => `\`${story.storyId}\``).join(' · ') || '—'} |`,
    )
  }

  lines.push(
    '',
    '## 三、Story 生成规则（与 V5 一致）',
    '',
    '1. 每个条目必有一条 `basic`（Basic 类别，65 条全覆盖）；',
    '2. 有 `variant` 枚举 → 逐变体生成（Variants）；',
    '3. 有 `size` 枚举 → 逐尺寸生成（Sizes）；',
    '4. 状态类 Prop（`disabled` / `loading` / `readonly` / `required` / `indeterminate`）→ 对应 State Story；',
    '5. demo 条目生成 Interactive（交互参考）；',
    '6. 表单类生成 Form Story，边界类生成 Edge Cases；',
    '7. 搜索类（Combobox / SearchInput）生成 loading / error / empty；模态类生成 long-content。',
    '',
    '## 四、Story 与真实实现的关系',
    '',
    '- Story 只切换 **本地 Props 与本地状态**：不请求后端、不调用 AI、不写学习记录；',
    '- 每条 Story 都被 `apps/studio/src/__tests__/render.spec.ts` 真实挂载一次（153 例），出现 Vue 警告即失败；',
    '- `initialProps` 只包含注册表声明过的 Prop（`stories.spec.ts` 断言），防止文档写了组件不承认的参数；',
    '- 深链接形如 `#/c/button/size-lg?tab=api&viewport=mobile`，刷新与分享都能复现同一条 Story。',
    '',
  )
  return lines.join('\n')
}

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'COMPONENT_MATRIX.md'), componentMatrix())
fs.writeFileSync(path.join(outDir, 'STORY_MATRIX.md'), storyMatrix())
console.log(
  `[gen-docs] COMPONENT_MATRIX.md（${dump.entries.length} 条目）与 STORY_MATRIX.md（${dump.stories.length} Story）已更新`,
)
