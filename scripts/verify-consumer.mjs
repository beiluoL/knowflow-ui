#!/usr/bin/env node
/**
 * verify-consumer.mjs — 在隔离环境中安装 tgz 并做类型检查 + 构建。
 *
 * 隔离的含义：
 *   1. examples/vue-vite 不在 pnpm workspace 内（见 pnpm-workspace.yaml 注释）；
 *   2. 每次先删掉它的 node_modules 与 lockfile，强制重新从 tarball 安装；
 *   3. 构建的是 dist 产物，不是 monorepo 源码。
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exampleDir = path.join(repoRoot, 'examples/vue-vite')
const artifacts = path.join(repoRoot, 'artifacts')

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

const tgz = fs.existsSync(artifacts)
  ? fs.readdirSync(artifacts).find((file) => file.endsWith('.tgz'))
  : undefined

if (!tgz) {
  console.error('[verify-consumer] 未找到 artifacts/*.tgz，请先执行：pnpm run pack:ui')
  process.exit(1)
}

console.log(`[verify-consumer] 使用产物：artifacts/${tgz}`)

for (const target of ['node_modules', 'package-lock.json', 'pnpm-lock.yaml', 'dist']) {
  fs.rmSync(path.join(exampleDir, target), { recursive: true, force: true })
}

run('npm install --no-audit --no-fund', exampleDir)
run('npm run typecheck', exampleDir)
run('npm run build', exampleDir)

/* ---- 校验安装结果确实来自 tarball，且只有构建产物 ---- */
const installedPkg = path.join(exampleDir, 'node_modules/@beiluol/knowflow-ui')
if (!fs.existsSync(installedPkg)) {
  console.error('[verify-consumer] 安装后未找到 @beiluol/knowflow-ui')
  process.exit(1)
}

const pkgJson = JSON.parse(fs.readFileSync(path.join(installedPkg, 'package.json'), 'utf8'))
const installedFiles = fs.readdirSync(installedPkg).sort()
console.log(`\n[verify-consumer] 已安装版本 ${pkgJson.version}，包内顶层文件：${installedFiles.join(', ')}`)

if (installedFiles.some((name) => name === 'src')) {
  console.error('[verify-consumer] 安装包内出现 src/，说明 files 字段过宽')
  process.exit(1)
}

const distEntry = path.join(installedPkg, 'dist/index.js')
if (!fs.existsSync(distEntry)) {
  console.error('[verify-consumer] 安装包内缺少 dist/index.js')
  process.exit(1)
}

/* ---- 校验示例构建产物没有反向引用 monorepo ---- */
const outDir = path.join(exampleDir, 'dist')
const assets = fs.readdirSync(path.join(outDir, 'assets'))
const jsAssets = assets.filter((file) => file.endsWith('.js'))
const cssAssets = assets.filter((file) => file.endsWith('.css'))
if (!jsAssets.length || !cssAssets.length) {
  console.error('[verify-consumer] 示例构建缺少 JS 或 CSS 产物')
  process.exit(1)
}

const bundle = fs.readFileSync(path.join(outDir, 'assets', jsAssets[0]), 'utf8')
const css = fs.readFileSync(path.join(outDir, 'assets', cssAssets[0]), 'utf8')

const leaks = []
if (bundle.includes('packages/ui/src')) leaks.push('打包结果引用了 packages/ui/src')
if (bundle.includes('/Users/')) leaks.push('打包结果包含本机绝对路径')
if (!css.includes('--kf-primary')) leaks.push('CSS 产物缺少 --kf-primary（样式入口未生效）')
if (!bundle.includes('kf-button')) leaks.push('JS 产物缺少 kf-button 类名（组件未真正打进包）')

if (leaks.length) {
  console.error('\n[verify-consumer] 失败：')
  for (const leak of leaks) console.error(`  ✗ ${leak}`)
  process.exit(1)
}

console.log(
  `\n[verify-consumer] 通过：示例 ${jsAssets[0]} + ${cssAssets[0]}，样式与组件均来自 tarball 安装产物`,
)
