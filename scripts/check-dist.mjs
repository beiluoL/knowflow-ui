#!/usr/bin/env node
/**
 * check-dist.mjs — 构建产物安全与完整性检查。
 *
 * 检查项都是"发出去会出事"的类型：
 *   - 相对/别名路径没解析（@/、../frontend）
 *   - 本机绝对路径、内网地址、业务后端地址泄漏
 *   - 把 Vue 运行时打进包里（会与宿主 Vue 打架）
 *   - 缺类型声明或缺样式入口
 *   - 疑似密钥
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(repoRoot, 'packages/ui/dist')

const problems = []
const notes = []

function exists(file) {
  return fs.existsSync(path.join(dist, file))
}

for (const required of ['index.js', 'index.d.ts', 'style.css']) {
  if (!exists(required)) problems.push(`缺少产物文件：dist/${required}`)
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

const files = fs.existsSync(dist) ? readAll(dist) : []

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

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const rel = path.relative(repoRoot, file)
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(text)) problems.push(`${rel} 命中「${rule.label}」`)
  }
}

// Vue 必须是 external：入口文件应 import 自 'vue'，且包体不含 Vue 运行时标志
const entry = path.join(dist, 'index.js')
if (fs.existsSync(entry)) {
  const code = fs.readFileSync(entry, 'utf8')
  if (!/from\s*["']vue["']/.test(code)) problems.push('dist/index.js 没有 import "vue"（可能被打进包内）')
  if (code.includes('__VUE_OPTIONS_API__') || code.includes('@vue/runtime-core')) {
    problems.push('dist/index.js 疑似内联了 Vue 运行时')
  }
  const sizeKb = (Buffer.byteLength(code) / 1024).toFixed(1)
  notes.push(`dist/index.js ${sizeKb} kB`)
}

if (exists('style.css')) {
  const css = fs.readFileSync(path.join(dist, 'style.css'), 'utf8')
  for (const token of ['--kf-primary', '--kf-button-height-md', '--kf-checkbox-size']) {
    if (!css.includes(token)) problems.push(`dist/style.css 缺少令牌 ${token}`)
  }
  notes.push(`dist/style.css ${(Buffer.byteLength(css) / 1024).toFixed(1)} kB`)
}

// 类型入口必须真实指向组件声明
if (exists('index.d.ts')) {
  const dts = fs.readFileSync(path.join(dist, 'index.d.ts'), 'utf8')
  for (const symbol of ['KfButton', 'KfIcon', 'KfInput', 'KfCheckbox']) {
    if (!dts.includes(symbol)) problems.push(`dist/index.d.ts 未导出 ${symbol}`)
  }
}

for (const note of notes) console.log(`  · ${note}`)

if (problems.length) {
  console.error('\n[check-dist] 失败：')
  for (const problem of problems) console.error(`  ✗ ${problem}`)
  process.exit(1)
}

console.log(`\n[check-dist] 通过（${files.length} 个产物文件，未发现泄漏/别名/密钥问题）`)
