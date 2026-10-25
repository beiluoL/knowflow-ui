#!/usr/bin/env node
/**
 * 原 KnowFlow 只读基线快照工具。
 *
 * 用途：证明本轮改造没有触碰原项目（除本仓库所在的 knowflow-ui 目录）。
 * 只读：本脚本对原项目仅调用 `fs.readFileSync` / `git status` / `git rev-parse`，
 *       不写入、不暂存、不提交、不 reset。
 *
 * 用法：
 *   node scripts/snapshot-original.mjs baseline   # 开工前
 *   node scripts/snapshot-original.mjs after      # 收工前
 *   node scripts/snapshot-original.mjs compare    # 比对两份快照
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const UI_ROOT = path.resolve(HERE, '..')
const ORIGINAL = path.resolve(UI_ROOT, '..')
const EVIDENCE = path.join(UI_ROOT, 'docs/migration/v5-to-ui/evidence')

/** 需要逐文件哈希的目录（相对原项目根）。knowflow-ui 自身明确排除。 */
const TRACKED_DIRS = [
  'frontend/src/dev',
  'frontend/src/components',
  'frontend/src/views/dev',
  'frontend/src/styles',
  'docs/component-playground',
]

/** 需要单独哈希的关键文件。 */
const TRACKED_FILES = [
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/pnpm-lock.yaml',
  'frontend/vite.config.ts',
  'frontend/tsconfig.json',
  'frontend/tailwind.config.js',
  'frontend/src/style.css',
  '.gitignore',
]

/** 这些文件在不同机器上可能不存在，缺失记为 null 而不是报错。 */
function sha256(file) {
  try {
    return createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  } catch {
    return null
  }
}

function walk(dir, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ORIGINAL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch (error) {
    return `__ERROR__ ${error.message}`
  }
}

function collect() {
  const dirs = {}
  for (const rel of TRACKED_DIRS) {
    const abs = path.join(ORIGINAL, rel)
    const files = walk(abs).sort()
    const hashes = {}
    for (const file of files) hashes[path.relative(ORIGINAL, file)] = sha256(file)
    dirs[rel] = { fileCount: files.length, hashes }
  }
  const files = {}
  for (const rel of TRACKED_FILES) files[rel] = sha256(path.join(ORIGINAL, rel))

  const status = git(['status', '--porcelain', '--', '.', ':!knowflow-ui'])
  const lines = status.startsWith('__ERROR__') ? [] : status.split('\n').filter(Boolean)

  return {
    capturedAt: new Date().toISOString(),
    originalRoot: ORIGINAL,
    head: git(['rev-parse', 'HEAD']).trim(),
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']).trim(),
    // 只读索引指纹：`ls-files -s` 输出（mode + blob + stage + path）的哈希。
    // 不用 write-tree —— 那会向原仓库 objects 写入新对象。
    indexFingerprint: createHash('sha256')
      .update(git(['ls-files', '-s', '--', '.', ':!knowflow-ui']))
      .digest('hex'),
    directories: dirs,
    files,
    gitStatus: {
      total: lines.length,
      modified: lines.filter((line) => line.startsWith(' M') || line.startsWith('M ')).length,
      deleted: lines.filter((line) => line.startsWith(' D') || line.startsWith('D ')).length,
      untracked: lines.filter((line) => line.startsWith('??')).length,
      // 只记录路径与状态码，不记录文件内容
      entries: lines.slice(0, 400).map((line) => line.slice(0, 200)),
    },
  }
}

function compare() {
  const basePath = path.join(EVIDENCE, 'baseline.json')
  const afterPath = path.join(EVIDENCE, 'after.json')
  if (!fs.existsSync(basePath) || !fs.existsSync(afterPath)) {
    console.error('缺少 baseline.json 或 after.json')
    process.exit(2)
  }
  const before = JSON.parse(fs.readFileSync(basePath, 'utf8'))
  const after = JSON.parse(fs.readFileSync(afterPath, 'utf8'))
  const problems = []

  if (before.head !== after.head) problems.push(`HEAD 变化：${before.head} → ${after.head}`)
  if (before.indexFingerprint !== after.indexFingerprint) problems.push('Git 索引指纹变化')

  for (const rel of TRACKED_DIRS) {
    const a = before.directories[rel]
    const b = after.directories[rel]
    if (!a || !b) {
      problems.push(`目录缺失：${rel}`)
      continue
    }
    if (a.fileCount !== b.fileCount) problems.push(`${rel} 文件数变化：${a.fileCount} → ${b.fileCount}`)
    for (const [file, hash] of Object.entries(a.hashes)) {
      if (!(file in b.hashes)) problems.push(`${file} 被删除`)
      else if (b.hashes[file] !== hash) problems.push(`${file} 内容变化`)
    }
    for (const file of Object.keys(b.hashes)) {
      if (!(file in a.hashes)) problems.push(`${file} 新增`)
    }
  }
  for (const rel of TRACKED_FILES) {
    if (before.files[rel] !== after.files[rel]) problems.push(`${rel} 内容变化`)
  }

  const report = {
    comparedAt: new Date().toISOString(),
    originalUntouched: problems.length === 0,
    problemCount: problems.length,
    problems,
    baselineHead: before.head,
    afterHead: after.head,
    gitStatusBefore: before.gitStatus.total,
    gitStatusAfter: after.gitStatus.total,
  }
  fs.writeFileSync(path.join(EVIDENCE, 'scope-check.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
  if (problems.length) process.exit(1)
}

const mode = process.argv[2] || 'baseline'
fs.mkdirSync(EVIDENCE, { recursive: true })

if (mode === 'compare') {
  compare()
} else {
  const target = path.join(EVIDENCE, `${mode}.json`)
  const data = collect()
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`)
  const fileTotal = Object.values(data.directories).reduce((sum, dir) => sum + dir.fileCount, 0)
  console.log(`写入 ${path.relative(UI_ROOT, target)}`)
  console.log(
    `HEAD ${data.head.slice(0, 8)} · 目录文件 ${fileTotal} · 原项目 git status ${data.gitStatus.total} 条`,
  )
}
