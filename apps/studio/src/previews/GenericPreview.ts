/**
 * 通用预览：用「真实组件 + 当前面板值」直接渲染，不为每个条目手写一个 Wrapper。
 *
 * 为什么这样更诚实：
 *   - 画布上的就是宿主真正会装到的那个组件，不存在「预览是另一套实现」；
 *   - 面板改一个 Prop，走的是同一条 props 链路，不会出现「面板改了但预览没变」；
 *   - 事件由组件真实的 defineEmits 决定，文档写错也骗不了画布。
 *
 * 不能覆盖的场景（模态、需要受控集合、复合场景）走 previews/custom.ts。
 */
import { computed, defineComponent, h, type PropType, type VNodeChild } from 'vue'
import type { PreviewApi } from './api'
import { componentEmits, componentPropKeys, primaryComponent } from './runtime'

const UPDATE_PREFIX = 'update:'

function camel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const GenericPreview = defineComponent({
  name: 'GenericPreview',
  props: {
    api: { type: Object as PropType<PreviewApi>, required: true },
  },
  setup(props) {
    return () => {
      const api = props.api
      const component = primaryComponent(api.entry)
      if (!component) {
        return h(
          'p',
          { class: 'preview-missing' },
          `该条目当前没有可渲染的真实组件（status=${api.entry.status}）。`,
        )
      }

      const allowed = new Set(componentPropKeys(component))
      const data = (api.fixture.data ?? {}) as Record<string, unknown>
      const merged: Record<string, unknown> = { ...api.values, ...data }
      const attrs: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(merged)) {
        if (allowed.has(key) && value !== undefined) attrs[key] = value
      }

      for (const event of componentEmits(component)) {
        if (event.startsWith(UPDATE_PREFIX)) {
          const target = event.slice(UPDATE_PREFIX.length)
          attrs[`on${camel(event)}`] = (value: unknown) => {
            api.set(target, value)
            api.log(event, value)
          }
        } else {
          attrs[`on${camel(event)}`] = (...args: unknown[]) => {
            api.log(event, args.length === 1 ? args[0] : args)
          }
        }
      }

      const slots: Record<string, () => VNodeChild> = {}
      for (const [name, content] of Object.entries(api.fixture.slots ?? {})) {
        slots[name] = () => (typeof content === 'function' ? content() : (content as string))
      }

      return h(component, attrs, slots)
    }
  },
})

/** 一个只读的「空态」占位，供 demo / missing 条目复用 */
export const NotImplementedPreview = defineComponent({
  name: 'NotImplementedPreview',
  props: {
    api: { type: Object as PropType<PreviewApi>, required: true },
  },
  setup(props) {
    const entry = computed(() => props.api.entry)
    return () =>
      h('div', { class: 'preview-missing' }, [
        h('p', { class: 'preview-missing__title' }, `${entry.value.title} 尚未提供真实组件`),
        h(
          'p',
          { class: 'preview-missing__body' },
          entry.value.fallback ??
            '该项在 V5 中只是内部参考演示，v0.2.0 未把它提升为公共组件。这里不渲染任何伪造实现。',
        ),
      ])
  },
})
