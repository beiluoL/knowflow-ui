#!/usr/bin/env node
/**
 * check-dist.mjs — 构建产物安全与完整性检查（ui / ai / learning 三个包）。
 *
 * 检查项都是"发出去会出事"的类型：
 *   - 相对/别名路径没解析（@/、../frontend）
 *   - 本机绝对路径、内网地址、业务后端地址泄漏
 *   - 把 Vue 运行时打进包里（会与宿主 Vue 打架）
 *   - 缺类型声明或缺样式入口
 *   - 疑似密钥
 *   - 源码里有组件、类型声明里却没有（Studio 会在预览里假装它能用）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const problems = []
const notes = []

/** 每个包：源码组件名 → 必须出现在产物类型声明里（递归，兼容 components/<name>/ 布局） */
function componentNamesOf(srcRoot) {
  const names = new Set()
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === '__tests__') continue
        walk(full)
      } else if (/^Kf[A-Za-z0-9]+\.vue$/.test(entry.name)) {
        names.add(entry.name.replace(/\.vue$/, ''))
      }
    }
  }
  walk(srcRoot)
  return [...names].sort()
}

function readAll(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...readAll(full))
    else if (/\.(js|css|d\.ts)$/.test(entry.name)) out.push(full)
  }
  return out
}

const FORBIDDEN = [
  { pattern: /from\s+["']@\//, label: '未解析的 @/ 别名导入' },
  // 只在「被引号包住」时才算泄漏：源码里保留迁移出处的注释（如 来源：../frontend/src/...）是证据，不是依赖
  { pattern: /["'`][^"'`\n]*frontend\/src/, label: '指向原 KnowFlow 源码的模块路径' },
  { pattern: /\/Users\/[a-zA-Z]/, label: '本机绝对路径' },
  { pattern: /["'`]https?:\/\/localhost/, label: '本地开发地址' },
  { pattern: /127\.0\.0\.1/, label: '本地回环地址' },
  { pattern: /["'`]\/api\//, label: '业务后端 API 路径' },
  { pattern: /sk-[A-Za-z0-9]{16,}/, label: '疑似 API Key' },
  { pattern: /DEEPSEEK_API_KEY/, label: '密钥环境变量名' },
  { pattern: /workspace:\*/, label: '未替换的 workspace 协议依赖' },
]

/** 业务栈依赖：组件库不允许出现（宿主自己装，不该被库绑死） */
const BUSINESS_IMPORTS = [
  { pattern: /from\s+["']pinia["']/, label: '依赖 pinia（业务状态管理）' },
  { pattern: /from\s+["']vue-router["']/, label: '依赖 vue-router（业务路由）' },
  { pattern: /from\s+["']axios["']/, label: '依赖 axios（网络请求应在宿主）' },
]

const PACKAGES = [
  {
    label: 'ui',
    dir: path.join(repoRoot, 'packages/ui'),
    criticalSymbols: [
      'KfButton',
      'KfIcon',
      'KfInput',
      'KfSelect',
      'KfDatePicker',
      'KfDialog',
      'KfTable',
      'KfTree',
      'KfUpload',
      'KfToast',
      'KfButtonProps',
      'KfButtonEmits',
      'KfDialogProps',
      'KfDatePickerProps',
      'KfDatePickerEmits',
      'KfPlugin',
    ],
  },
  {
    label: 'ai',
    dir: path.join(repoRoot, 'packages/ai'),
    criticalSymbols: ['KfChatMessage', 'KfChatComposer', 'KfMarkdownRenderer', 'KfCitationCard'],
  },
  {
    label: 'learning',
    dir: path.join(repoRoot, 'packages/learning'),
    criticalSymbols: ['KfFlashcard', 'KfFlashcardRating', 'KfQuestionCard'],
  },
]

let totalFiles = 0

for (const pkg of PACKAGES) {
  const dist = path.join(pkg.dir, 'dist')
  const required = ['index.js', 'index.d.ts', 'style.css']

  for (const file of required) {
    if (!fs.existsSync(path.join(dist, file))) problems.push(`[${pkg.label}] 缺少产物文件：dist/${file}`)
  }
  if (!fs.existsSync(dist)) continue

  const files = readAll(dist)
  totalFiles += files.length

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    const rel = path.relative(repoRoot, file)
    for (const rule of [...FORBIDDEN, ...BUSINESS_IMPORTS]) {
      if (rule.pattern.test(text)) problems.push(`[${pkg.label}] ${rel} 命中「${rule.label}」`)
    }
  }

  // Vue 必须是 external：ui 入口应 import 自 'vue'
  const entry = path.join(dist, 'index.js')
  if (fs.existsSync(entry)) {
    const code = fs.readFileSync(entry, 'utf8')
    if (pkg.label === 'ui' && !/from\s*["']vue["']/.test(code)) {
      problems.push('[ui] dist/index.js 没有 import "vue"（可能被打进包内）')
    }
    if (code.includes('__VUE_OPTIONS_API__') || code.includes('@vue/runtime-core')) {
      problems.push(`[${pkg.label}] dist/index.js 疑似内联了 Vue 运行时`)
    }
    notes.push(`[${pkg.label}] index.js ${(Buffer.byteLength(code) / 1024).toFixed(1)} kB`)
  }

  // 源码里有组件 → 类型声明里必须能找到（ai/learning 走 `export * from './x/index'`，
  // 组件声明分散在子目录 d.ts 里，所以把所有 .d.ts 拼起来查，而不是只看 index.d.ts）
  const expected = componentNamesOf(path.join(pkg.dir, 'src'))
  const dtsPath = path.join(dist, 'index.d.ts')
  if (fs.existsSync(dtsPath)) {
    const dtsAll = files
      .filter((file) => file.endsWith('.d.ts'))
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n')
    for (const name of expected) {
      if (!new RegExp(`\\b${name}\\b`).test(dtsAll)) {
        problems.push(`[${pkg.label}] 类型声明未导出组件 ${name}（源码已有 ${name}.vue）`)
      }
    }
    for (const symbol of pkg.criticalSymbols) {
      if (!dtsAll.includes(symbol)) problems.push(`[${pkg.label}] 类型声明未导出 ${symbol}`)
    }
    notes.push(`[${pkg.label}] ${expected.length} 个组件、${files.length} 个产物文件`)
  }

  if (pkg.label === 'ui') checkUiCss(dist)
}

function checkUiCss(dist) {
  const cssPath = path.join(dist, 'style.css')
  if (!fs.existsSync(cssPath)) return
  const css = fs.readFileSync(cssPath, 'utf8')

  for (const token of ['--kf-primary', '--kf-button-height-md', '--kf-checkbox-size', '--kf-input-height']) {
    if (!css.includes(token)) problems.push(`dist/style.css 缺少令牌 ${token}`)
  }

  // 命名规范：kf- 命名空间 + BEM（block__element / block--modifier）
  const selectors = [
    '.kf-button',
    '.kf-button__icon',
    '.kf-button--primary',
    '.kf-checkbox__box',
    '.kf-select__trigger',
    '.kf-date-picker',
    '.kf-table__th',
    '.kf-dialog__mask',
  ]
  for (const selector of selectors) {
    if (!css.includes(selector)) problems.push(`dist/style.css 缺少类 ${selector}`)
  }

  const legacyClasses = [
    '.kf-field{',
    '.kf-field ',
    '.kf-field:',
    '.kf-checkbox-box',
    '.kf-checkbox-label',
    '.kf-form-error',
    '.kf-form-help',
  ]
  for (const legacy of legacyClasses) {
    if (css.includes(legacy)) problems.push(`dist/style.css 残留非 BEM 类名 ${legacy}`)
  }
  if (/\.kb-[a-z]/.test(css)) problems.push('dist/style.css 出现旧命名空间 .kb- 类名')

  // 与第三方库共存的结构性前提：不存在裸元素选择器
  const bareElement = /(^|\})\s*(button|input|label|svg|img|span|div|a)\s*[,{]/
  if (bareElement.test(css)) problems.push('dist/style.css 存在裸元素选择器（会命中 Element Plus 等第三方组件）')

  // 无障碍基线：焦点可见 & 降低动效
  if (!css.includes('focus-visible')) problems.push('dist/style.css 缺少 :focus-visible 基线样式')
  if (!css.includes('prefers-reduced-motion')) problems.push('dist/style.css 缺少 prefers-reduced-motion 降级')

  notes.push(`style.css ${(Buffer.byteLength(css) / 1024).toFixed(1)} kB`)
}

// 运行时 emits 声明：类型从 types.ts 导入后仍必须生成，否则监听器会二次落进 attrs
const uiEntry = path.join(repoRoot, 'packages/ui/dist/index.js')
if (fs.existsSync(uiEntry)) {
  const code = fs.readFileSync(uiEntry, 'utf8')
  for (const emitName of ['click', 'update:modelValue', 'native-change', 'update:open']) {
    if (!code.includes(`"${emitName}"`)) problems.push(`[ui] dist/index.js 缺少运行时 emits 声明 ${emitName}`)
  }
}

// 插件注册表：装一次能注册全部组件
const uiDts = path.join(repoRoot, 'packages/ui/dist/index.d.ts')
if (fs.existsSync(uiDts)) {
  const dts = fs.readFileSync(uiDts, 'utf8')
  if (!dts.includes('KF_COMPONENTS')) problems.push('[ui] dist/index.d.ts 未导出 KF_COMPONENTS 注册表')
}

for (const note of notes) console.log(`  · ${note}`)

if (problems.length) {
  console.error('\n[check-dist] 失败：')
  for (const problem of problems) console.error(`  ✗ ${problem}`)
  process.exit(1)
}

console.log(`\n[check-dist] 通过（3 个包、${totalFiles} 个产物文件，未发现泄漏/别名/密钥/业务栈依赖问题）`)
