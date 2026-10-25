/**
 * Markdown 的最小安全子集解析器。
 *
 * 为什么不用 marked / markdown-it + DOMPurify：
 *   1. 两个包 + 三份许可证（MIT/BSD）只为渲染聊天气泡，成本不成比例；
 *   2. 更关键的是 **安全模型**：本解析器输出的是结构化 token，模板用 v-for 渲染成
 *      Vue 元素，全程没有 `v-html`。不可信内容里就算写了 `<img onerror=...>`
 *      也只会被当成普通文本显示，不存在「过滤器漏一个属性就 XSS」的面。
 *
 * 支持：ATX 标题（1–3 级）、段落、无序/有序列表、围栏代码块、引用、分隔线，
 *      行内 **粗体**、*斜体*、`代码`、[链接](url)。
 * 不支持（明确不做，避免半成品语义）：表格、HTML 内联、图片、脚注、嵌套列表。
 */

export type MdInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string }

export type MdBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inlines: MdInline[] }
  | { type: 'paragraph'; inlines: MdInline[] }
  | { type: 'list'; ordered: boolean; items: MdInline[][] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'quote'; inlines: MdInline[] }
  | { type: 'hr' }

const SAFE_PROTOCOL = /^(https?:|mailto:|\/|#)/i

/** 只允许 http/https/mailto 与站内相对地址；其余（javascript:、data: 等）一律降级为纯文本 */
export function isSafeHref(href: string): boolean {
  const trimmed = href.trim()
  if (!trimmed) return false
  // 形如 "java\nscript:alert(1)" 的绕过：先去掉控制字符再判断
  const normalized = trimmed.replace(/[\u0000-\u001f\u007f]/g, '')
  return SAFE_PROTOCOL.test(normalized)
}

export function parseInline(source: string): MdInline[] {
  const tokens: MdInline[] = []
  let buffer = ''
  let index = 0

  const flush = (): void => {
    if (buffer) {
      tokens.push({ type: 'text', text: buffer })
      buffer = ''
    }
  }

  while (index < source.length) {
    const rest = source.slice(index)

    const code = /^`([^`]+)`/.exec(rest)
    if (code) {
      flush()
      tokens.push({ type: 'code', text: code[1] })
      index += code[0].length
      continue
    }

    const strong = /^\*\*([^*]+)\*\*/.exec(rest)
    if (strong) {
      flush()
      tokens.push({ type: 'strong', text: strong[1] })
      index += strong[0].length
      continue
    }

    const em = /^\*([^*\n]+)\*/.exec(rest)
    if (em) {
      flush()
      tokens.push({ type: 'em', text: em[1] })
      index += em[0].length
      continue
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest)
    if (link) {
      flush()
      const [, text, href] = link
      tokens.push(
        isSafeHref(href) ? { type: 'link', text, href } : { type: 'text', text: `${text} (${href})` },
      )
      index += link[0].length
      continue
    }

    buffer += source[index]
    index += 1
  }

  flush()
  return tokens
}

export function parseMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: MdBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    // 围栏代码块：```lang
    const fence = /^```\s*([\w-]*)\s*$/.exec(line)
    if (fence) {
      const lang = fence[1] || ''
      const body: string[] = []
      index += 1
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        body.push(lines[index])
        index += 1
      }
      // 跳过结束围栏（若缺失则吃到文末，不报错）
      if (index < lines.length) index += 1
      blocks.push({ type: 'code', lang, code: body.join('\n') })
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        inlines: parseInline(heading[2].trim()),
      })
      index += 1
      continue
    }

    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const collected: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        collected.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', inlines: parseInline(collected.join(' ')) })
      continue
    }

    const unordered = /^\s*[-*+]\s+(.*)$/
    const ordered = /^\s*\d+[.)]\s+(.*)$/
    if (unordered.test(line) || ordered.test(line)) {
      const isOrdered = ordered.test(line)
      const pattern = isOrdered ? ordered : unordered
      const items: MdInline[][] = []
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(parseInline((pattern.exec(lines[index]) as RegExpExecArray)[1].trim()))
        index += 1
      }
      blocks.push({ type: 'list', ordered: isOrdered, items })
      continue
    }

    // 段落：连续非空、非特殊行
    const paragraph: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^#{1,3}\s/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*(---|\*\*\*)\s*$/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', inlines: parseInline(paragraph.join(' ')) })
  }

  return blocks
}
