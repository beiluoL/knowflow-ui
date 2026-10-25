/**
 * 高亮分段工具 —— 把「文本 + 命中词」切成分段数组，由模板用 v-for 渲染 <mark>。
 *
 * 为什么不返回 HTML 字符串：组件库不能为了做高亮就引入 v-html，
 * 否则任何未转义的模型输出都变成潜在注入面。分段后交给 Vue 元素渲染，
 * 文本天然被转义，等于把安全责任交给框架而不是正则。
 */

export interface KfTextSegment {
  text: string
  /** 是否为命中片段（模板据此渲染 <mark>） */
  match: boolean
}

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

function escapeRegExp(input: string): string {
  return input.replace(REGEX_SPECIALS, '\\$&')
}

/**
 * 按命中词切分文本（大小写不敏感、多词取并集）。
 * 空文本返回空数组；无命中词时整段作为非命中片段返回。
 */
export function splitByTerms(text: string, terms: readonly string[] = []): KfTextSegment[] {
  if (!text) return []

  const cleaned = terms.map((term) => term.trim()).filter(Boolean)
  if (cleaned.length === 0) return [{ text, match: false }]

  const pattern = new RegExp(`(${cleaned.map(escapeRegExp).join('|')})`, 'gi')
  const segments: KfTextSegment[] = []
  let cursor = 0

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false })
    segments.push({ text: match[0], match: true })
    cursor = start + match[0].length
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })
  return segments.length > 0 ? segments : [{ text, match: false }]
}
