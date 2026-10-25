/**
 * 包边界守门测试。
 *
 * 这不是「组件功能测试」，而是防止 AI 包在后续迭代中被业务代码污染：
 * 只要有人加一行 `fetch(` / `axios` / `pinia` / `vue-router` / `v-html`，
 * 这里就会失败。目录约束靠人盯不住，只能靠测试盯。
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

/** 去掉注释后再匹配，避免「文档里提到 fetch 也算违规」的误报 */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('AI 包边界', () => {
  it('扫描到的源文件数量正常（防止遍历失效导致空跑通过）', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(12)
  })

  it('不存在任何网络请求能力的直接调用', () => {
    const forbidden = [/[^.\w]fetch\s*\(/, /\baxios\b/, /new\s+WebSocket/, /new\s+EventSource/, /navigator\.sendBeacon/]
    const hits = SOURCES.filter(({ text }) => {
      const code = stripComments(text)
      return forbidden.some((pattern) => pattern.test(code))
    })
    expect(hits.map((hit) => hit.file)).toEqual([])
  })

  it('不依赖状态管理与路由', () => {
    const forbidden = [/from\s+['"]pinia['"]/, /from\s+['"]vue-router['"]/, /useRouter|useRoute\b/, /defineStore/]
    const hits = SOURCES.filter(({ text }) => forbidden.some((pattern) => pattern.test(text)))
    expect(hits.map((hit) => hit.file)).toEqual([])
  })

  it('不读写浏览器持久化与凭证', () => {
    const forbidden = [/localStorage/, /sessionStorage/, /document\.cookie/, /indexedDB/]
    const hits = SOURCES.filter(({ text }) => {
      const code = stripComments(text)
      return forbidden.some((pattern) => pattern.test(code))
    })
    expect(hits.map((hit) => hit.file)).toEqual([])
  })

  it('不执行动态代码，也没有 HTML 注入入口', () => {
    const forbidden = [/\beval\s*\(/, /new\s+Function\s*\(/, /\bv-html\b/]
    const hits = SOURCES.filter(({ text }) => {
      const code = stripComments(text)
      return forbidden.some((pattern) => pattern.test(code))
    })
    expect(hits.map((hit) => hit.file)).toEqual([])
  })

  it('不引用宿主业务路径（@/ 别名、原项目源码、后端接口路径）', () => {
    // 只查代码：组件头部注释里写明「迁移自 KnowFlow frontend/src/...」是溯源信息，不算依赖
    const forbidden = [/from\s+['"]@\//, /frontend\/src/, /\/api\//]
    const hits = SOURCES.filter(({ text }) => {
      const code = stripComments(text)
      return forbidden.some((pattern) => pattern.test(code))
    })
    expect(hits.map((hit) => hit.file)).toEqual([])
  })

  it('只依赖 vue 与 @beiluol/knowflow-ui 两个运行时包', () => {
    const allowed = new Set(['vue', '@beiluol/knowflow-ui', '@beiluol/knowflow-tokens'])
    const externalSpecifiers = new Set<string>()

    for (const { text } of SOURCES) {
      for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const specifier = match[1]
        if (specifier.startsWith('.') || specifier.startsWith('node:')) continue
        externalSpecifiers.add(specifier.split('/')[0].startsWith('@') ? specifier : specifier.split('/')[0])
      }
    }

    expect([...externalSpecifiers].filter((name) => !allowed.has(name))).toEqual([])
  })

  it('组件文件名与所在目录一致（避免 KfXxx 落在错误目录）', () => {
    const mismatched = SOURCES.filter(({ file }) => {
      if (!file.endsWith('.vue')) return false
      const dir = path.basename(path.dirname(file))
      const base = path.basename(file, '.vue')
      // 只约束公开组件：KfAgentTrace → kf-agent-trace → agent-trace 应落在同名目录。
      // 内部辅助组件（MdInlines 这类不以 Kf 开头的）不参与模块命名约束。
      if (!base.startsWith('Kf')) return false
      const kebab = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/^kf-/, '')
      return !kebab.startsWith(dir)
    })
    expect(mismatched.map((entry) => entry.file)).toEqual([])
  })
})

describe('AI 包公开 API', () => {
  const COMPONENTS = [
    'KfChatMessage',
    'KfChatComposer',
    'KfMarkdownRenderer',
    'KfCodeBlock',
    'KfThinkingPanel',
    'KfCitationCard',
    'KfSourceList',
    'KfEvidencePanel',
    'KfAgentTrace',
    'KfToolCallCard',
    'KfExecutionStatus',
    'KfAttachmentPreview',
  ] as const

  it('12 个组件全部从根入口导出', () => {
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

  it('Markdown 安全工具作为公共 API 暴露，便于宿主复用同一套协议白名单', () => {
    expect(publicApi.isSafeHref('https://example.com')).toBe(true)
    expect(publicApi.isSafeHref('javascript:alert(1)')).toBe(false)
    expect(publicApi.parseMarkdown('# t')[0]).toMatchObject({ type: 'heading' })
  })

  it('格式化与分段工具可从根入口使用', () => {
    expect(publicApi.formatBytes(2048)).toBe('2 KB')
    expect(publicApi.formatScore(0.5)).toBe('50%')
    expect(publicApi.splitByTerms('ab', ['a'])).toEqual([
      { text: 'a', match: true },
      { text: 'b', match: false },
    ])
  })
})
