/**
 * 学习包边界守门测试。
 *
 * 学习类组件最容易被反向侵蚀：只要有人「顺手」在组件里算一下下次复习时间、
 * 写一下 localStorage、调一下评分接口，组件库就变成了业务代码。
 * 这里把这条线固化成测试。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import * as publicApi from '../index'

const SRC_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.(ts|vue)$/.test(entry.name)) out.push(full)
  }
  return out
}

const SOURCES = walk(SRC_ROOT).map((file) => ({
  file: path.relative(SRC_ROOT, file),
  text: fs.readFileSync(file, 'utf8'),
}))

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function hits(patterns: RegExp[]): string[] {
  return SOURCES.filter(({ text }) => {
    const code = stripComments(text)
    return patterns.some((pattern) => pattern.test(code))
  }).map((entry) => entry.file)
}

describe('Learning 包边界', () => {
  it('扫描到的源文件数量正常（防止遍历失效导致空跑通过）', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(11)
  })

  it('不内置记忆算法（FSRS / SM-2 / 艾宾浩斯）', () => {
    expect(hits([/fsrs/i, /\bsm-?2\b/i, /ebbinghaus/i, /spacedRepetition/i])).toEqual([])
  })

  it('不做时间推算：不出现 Date 计算与调度字段', () => {
    expect(hits([/new Date\s*\(/, /Date\.now\s*\(/, /nextReviewAt/, /scheduledDays/, /\bstability\b/i])).toEqual([])
  })

  it('不持有网络能力与本地存储', () => {
    expect(hits([/[^.\w]fetch\s*\(/, /\baxios\b/, /new\s+WebSocket/, /localStorage/, /sessionStorage/, /indexedDB/])).toEqual([])
  })

  it('不依赖状态管理与路由', () => {
    expect(hits([/from\s+['"]pinia['"]/, /from\s+['"]vue-router['"]/, /defineStore/])).toEqual([])
  })

  it('不执行动态代码，也没有 HTML 注入入口', () => {
    expect(hits([/\beval\s*\(/, /new\s+Function\s*\(/, /\bv-html\b/])).toEqual([])
  })

  it('只依赖 vue 与 @beiluol/knowflow-ui', () => {
    const allowed = new Set(['vue', '@beiluol/knowflow-ui'])
    const externals = new Set<string>()
    for (const { text } of SOURCES) {
      for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const specifier = match[1]
        if (specifier.startsWith('.') || specifier.startsWith('node:')) continue
        externals.add(specifier.startsWith('@') ? specifier : specifier.split('/')[0])
      }
    }
    expect([...externals].filter((name) => !allowed.has(name))).toEqual([])
  })

  it('组件文件名与目录对应', () => {
    const mismatched = SOURCES.filter(({ file }) => {
      if (!file.endsWith('.vue')) return false
      const base = path.basename(file, '.vue')
      if (!base.startsWith('Kf')) return false
      const dir = path.basename(path.dirname(file))
      const kebab = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/^kf-/, '')
      return !kebab.startsWith(dir)
    })
    expect(mismatched.map((entry) => entry.file)).toEqual([])
  })
})

describe('Learning 包公开 API', () => {
  const COMPONENTS = [
    'KfFlashcard',
    'KfFlashcardRating',
    'KfReviewProgress',
    'KfQuestionCard',
    'KfAnswerOptions',
    'KfAnswerFeedback',
    'KfQuizProgress',
    'KfQuizResult',
    'KfInterviewQuestion',
    'KfInterviewFeedback',
    'KfInterviewScore',
  ] as const

  it('11 个组件全部从根入口导出', () => {
    for (const name of COMPONENTS) {
      expect(publicApi, `${name} 未导出`).toHaveProperty(name)
      expect(typeof publicApi[name]).toBe('object')
    }
  })

  it('版本号与包清单一致', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(SRC_ROOT, '../package.json'), 'utf8')) as {
      version: string
    }
    expect(publicApi.version).toBe(pkg.version)
    expect(publicApi.version).toBe('0.2.0')
  })
})
