#!/usr/bin/env node
/**
 * pack-ui.mjs — 构建 packages/ui 并产出可安装的 tgz 到 artifacts/。
 *
 * 为什么要真的 pack：monorepo 里 workspace 链接会掩盖 exports/files 配置错误，
 * 只有拿到 tarball 再装一遍，才能证明外部开发者装得到同样的东西。
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkgDir = path.join(repoRoot, 'packages/ui')
const artifacts = path.join(repoRoot, 'artifacts')

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

run('pnpm run build', pkgDir)

fs.mkdirSync(artifacts, { recursive: true })
for (const file of fs.readdirSync(artifacts)) {
  if (file.endsWith('.tgz')) fs.rmSync(path.join(artifacts, file))
}

run(`pnpm pack --pack-destination "${artifacts}"`, pkgDir)

const tgz = fs.readdirSync(artifacts).find((file) => file.endsWith('.tgz'))
if (!tgz) {
  console.error('[pack-ui] 未找到生成的 tgz')
  process.exit(1)
}

const size = (fs.statSync(path.join(artifacts, tgz)).size / 1024).toFixed(1)
console.log(`\n[pack-ui] artifacts/${tgz} (${size} kB)`)
