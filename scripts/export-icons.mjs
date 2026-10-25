#!/usr/bin/env node
/**
 * export-icons.mjs — 从 KnowFlow 原始 Icon.vue 提取 SVG 标记，生成 KnowFlow UI 图标注册表。
 *
 * 为什么需要脚本而不是手抄：原始 Icon.vue 用 211 个 <template v-else-if> 分支内联
 * lucide 风格路径，手工复制极易抄错路径。脚本保证「迁移后的路径与源码逐字一致」。
 *
 * 约束：
 *   - 这是**迁移期工具**，只在人工执行时读取原项目；构建、测试、发布都不依赖它。
 *   - 输出文件 committed，包内运行时只读 icons.generated.ts。
 *   - 首版只取 CORE_ICONS（约 76 个），其余 135 个不进入初始包（见 README 路线图）。
 *
 * 用法：
 *   node scripts/export-icons.mjs [path/to/Icon.vue]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const defaultSource = path.resolve(
  repoRoot,
  '../frontend/src/components/ui/Icon.vue',
)
const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSource
const outFile = path.join(repoRoot, 'packages/ui/src/components/icon/icons.generated.ts')

/** 首版必要图标：基础控件 + 通用 UI 语义，覆盖 Button/Input/Checkbox 及常见页面需求 */
const CORE_ICONS = [
  // 方向与导航
  'chevron-left',
  'chevron-right',
  'chevron-down',
  'chevron-up',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'menu',
  'more-horizontal',
  'more-vertical',
  'external-link',
  'home',
  'square',
  'check-square',
  'palette',
  'route',
  // 基础操作
  'x',
  'plus',
  'minus',
  'check',
  'search',
  'filter',
  'list',
  'grid',
  'edit',
  'copy',
  'trash-2',
  'save',
  'download',
  'upload',
  'refresh-cw',
  'rotate-ccw',
  'send',
  'link',
  'share-2',
  'archive',
  // 状态
  'loader',
  'alert-circle',
  'check-circle',
  'x-circle',
  'info',
  'help-circle',
  // 内容与对象
  'file-text',
  'folder',
  'file-plus',
  'folder-plus',
  'image',
  'code',
  'table',
  'book-open',
  'calendar',
  'clock',
  'tag',
  'bookmark',
  'star',
  'heart',
  // 用户与系统
  'user',
  'users',
  'settings',
  'log-in',
  'log-out',
  'lock',
  'mail',
  'bell',
  'eye',
  'eye-off',
  'sun',
  'moon',
  'github',
  // 学习场景
  'brain',
  'sparkles',
  'zap',
  'target',
  'award',
  'flame',
  'trophy',
  'graduation-cap',
]

function extract(source) {
  // 首个分支是 v-if（home），其余是 v-else-if；两者都要抓。
  const re = /<template v-(?:else-)?if="name === '([^']+)'">([\s\S]*?)<\/template>/g
  const map = new Map()
  let m
  while ((m = re.exec(source)) !== null) {
    const markup = m[2]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
    if (!map.has(m[1])) map.set(m[1], markup)
  }
  return map
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error(`[export-icons] source not found: ${sourcePath}`)
    process.exit(1)
  }
  const all = extract(fs.readFileSync(sourcePath, 'utf8'))
  const missing = CORE_ICONS.filter((name) => !all.has(name))
  if (missing.length) {
    console.error(`[export-icons] icons missing in source: ${missing.join(', ')}`)
    process.exit(1)
  }

  const entries = CORE_ICONS.map((name) => {
    const markup = all.get(name).replace(/'/g, "\\'")
    return `  '${name}': '${markup}',`
  })

  const output = `/* eslint-disable */
/**
 * AUTO-GENERATED FILE — 由 scripts/export-icons.mjs 从 KnowFlow 原始 Icon.vue 提取。
 * 不要手工编辑；如需增删图标，修改脚本里的 CORE_ICONS 后重新生成。
 *
 * 来源：${path.relative(repoRoot, sourcePath)}
 * 图标集：lucide 风格线性图标（ISC License），见 THIRD_PARTY_LICENSES.md
 * 数量：${CORE_ICONS.length}
 */

export const ICON_SVG = {
${entries.join('\n')}
} as const

export type BuiltinIconName = keyof typeof ICON_SVG

/** 内置图标名列表（Studio 图标墙与测试使用） */
export const BUILTIN_ICON_NAMES = Object.keys(ICON_SVG) as BuiltinIconName[]
`

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, output, 'utf8')
  console.log(
    `[export-icons] wrote ${CORE_ICONS.length} icons (source has ${all.size}) -> ${path.relative(repoRoot, outFile)}`,
  )
}

main()
