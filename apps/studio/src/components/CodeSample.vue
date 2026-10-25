<template>
  <div class="st-code">
    <div class="st-code__head">
      <span class="st-code__title">Vue 3 用法</span>
      <KfCopyButton :text="code" label="复制代码" size="sm" variant="ghost" />
    </div>
    <pre class="st-code__block"><code>{{ code }}</code></pre>
    <p class="st-code__note">
      只包含「与默认值不同」的 Props；样式由 <code>@beiluol/knowflow-ui/style.css</code> 提供，不需要
      Tailwind 或额外的全局样式表。
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * 代码示例生成器 —— 从当前面板值生成**可直接粘贴**的 SFC 片段。
 *
 * 两条规则：
 *   1. 只输出真实组件承认的 Props（`componentPropKeys`），文档层字段不落到代码里；
 *   2. 默认值不输出，避免 8 个 `:disabled="false"` 淹没有效信息。
 */
import { computed } from 'vue'
import { KfCopyButton } from '@beiluol/knowflow-ui'
import type { PlaygroundEntry } from '../registry/types'
import { componentPropKeys, componentByName } from '../previews/runtime'

const props = defineProps<{
  entry: PlaygroundEntry
  values: Record<string, unknown>
  slots: Record<string, string>
}>()

const PACKAGE_OF = {
  ui: '@beiluol/knowflow-ui',
  ai: '@beiluol/knowflow-ai',
  learning: '@beiluol/knowflow-learning',
} as const

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function isVueComponentName(name: string): boolean {
  return /^[A-Z]/.test(name)
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return String(value)
}

const code = computed(() => {
  const entry = props.entry
  const pkgName = entry.packageName ?? 'ui'
  const pkg = PACKAGE_OF[pkgName]
  const primary = entry.components[0]
  if (!primary) {
    return `<!-- ${entry.title}：尚未提供公共组件，无可粘贴的用法 -->`
  }

  const component = componentByName(pkgName, primary)
  const allowed = new Set(component ? componentPropKeys(component) : [])
  const attrs: string[] = []
  for (const spec of entry.props) {
    if (spec.name === 'label' && entry.name === 'Button') continue
    if (!allowed.has(spec.name)) continue
    const value = props.values[spec.name]
    if (value === undefined || value === spec.default) continue
    if (value === '' || value === false) continue
    if (typeof value === 'boolean') {
      attrs.push(spec.name)
    } else if (typeof value === 'number') {
      attrs.push(`:${kebab(spec.name)}="${formatValue(value)}"`)
    } else {
      attrs.push(`${kebab(spec.name)}="${formatValue(value)}"`)
    }
  }

  const tag = kebab(primary)
  const slot = props.slots.default ? `${props.slots.default}` : ''
  const openTag = attrs.length ? `<${tag}\n  ${attrs.join('\n  ')}\n>` : `<${tag}>`
  const templateBody = slot ? `${openTag}${slot}</${tag}>` : `${openTag.slice(0, -1)} />`

  const imports = entry.components
    .filter((name) => isVueComponentName(name))
    .map((name) => `import { ${name} } from '${pkg}'`)
    .join('\n')

  const extra =
    entry.components.length > 1
      ? `<!-- 该条目由 ${entry.components.join(' + ')} 组合而成，这里只示例主组件 -->\n`
      : ''

  return `${extra}<template>
  ${templateBody}
</template>

<script setup lang="ts">
${imports}
import '${pkg}/style.css'
<\/script>`
})
</script>
