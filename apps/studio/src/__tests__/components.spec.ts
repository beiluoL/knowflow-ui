import { describe, expect, it } from 'vitest'
import * as AI from '@beiluol/knowflow-ai'
import * as LEARNING from '@beiluol/knowflow-learning'
import * as UI from '@beiluol/knowflow-ui'
import { ENTRIES } from '../registry/entries'

/**
 * 条目表的 `component` 字段是 Studio 预览与 API 溯源的锚点。
 * 一旦写成不存在的组件名，Studio 会渲染成空画布而测试仍然"绿"——
 * 所以这里直接对三个包的真实导出做存在性断言。
 */
const NAMESPACE = {
  ui: UI as Record<string, unknown>,
  ai: AI as Record<string, unknown>,
  learning: LEARNING as Record<string, unknown>,
}

describe('条目 ↔ 真实组件', () => {
  it('status=real 的条目都能在对应包里找到组件', () => {
    const missing: string[] = []
    for (const entry of ENTRIES) {
      if (entry.status !== 'real') continue
      if (!entry.components.length || !entry.packageName) {
        missing.push(`${entry.id}: 缺少 component/packageName`)
        continue
      }
      const ns = NAMESPACE[entry.packageName]
      for (const name of entry.components) {
        if (typeof ns[name] !== 'object' && typeof ns[name] !== 'function') {
          missing.push(`${entry.id} → ${entry.packageName}.${name}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('status=demo / missing 的条目不声明组件', () => {
    for (const entry of ENTRIES) {
      if (entry.status === 'real') continue
      expect(entry.components, `${entry.id} 不应有 components`).toEqual([])
      expect(entry.component, `${entry.id} 不应有 component`).toBeUndefined()
    }
  })

  it('真实条目的组件名以 Kf 开头', () => {
    for (const entry of ENTRIES) {
      if (entry.status !== 'real') continue
      expect(entry.component?.startsWith('Kf'), `${entry.id} → ${entry.component}`).toBe(true)
    }
  })

  it('条目声明的 Props 都能在真实组件的 props 里找到（允许文档层 label）', () => {
    const problems: string[] = []
    for (const entry of ENTRIES) {
      if (entry.status !== 'real' || !entry.component) continue
      // 复合条目的 Prop 表按主组件核对（副组件各自有独立 API 表）
      const component = NAMESPACE[entry.packageName!][entry.components[0]] as
        | { props?: Record<string, unknown> }
        | undefined
      const declared = component?.props ?? {}
      for (const spec of entry.props) {
        // Button.label 是展示适配（默认插槽），不是真实 Prop
        if (entry.name === 'Button' && spec.name === 'label') continue
        if (!(spec.name in declared)) problems.push(`${entry.id}.${spec.name}`)
      }
    }
    expect(problems).toEqual([])
  })
})
