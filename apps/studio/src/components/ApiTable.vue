<template>
  <div class="st-api">
    <section class="st-api__section">
      <header class="st-api__head">
        <h3>Props</h3>
        <span class="st-api__count">{{ entry.props.length }}</span>
      </header>
      <p v-if="!entry.props.length" class="st-api__empty">该条目没有公开 Props。</p>
      <table v-else class="st-table">
        <thead>
          <tr>
            <th scope="col">名称</th>
            <th scope="col">类型</th>
            <th scope="col">默认值</th>
            <th scope="col">必填</th>
            <th scope="col">说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spec in entry.props" :key="spec.name">
            <td><code>{{ spec.name }}</code></td>
            <td>{{ spec.type }}</td>
            <td><code>{{ formatDefault(spec.default) }}</code></td>
            <td>{{ spec.required ? '是' : '—' }}</td>
            <td>{{ spec.description }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="st-api__section">
      <header class="st-api__head">
        <h3>Events</h3>
        <span class="st-api__count">{{ entry.events.length }}</span>
      </header>
      <p v-if="!entry.events.length" class="st-api__empty">
        该条目没有声明事件（{{ entry.status === 'real' ? '真实组件 defineEmits 为空' : '非真实组件' }}）。
      </p>
      <ul v-else class="st-api__chips">
        <li v-for="event in entry.events" :key="event"><code>{{ event }}</code></li>
      </ul>
    </section>

    <section class="st-api__section">
      <header class="st-api__head">
        <h3>Slots</h3>
        <span class="st-api__count">{{ entry.slots.length }}</span>
      </header>
      <p v-if="!entry.slots.length" class="st-api__empty">没有公开插槽。</p>
      <ul v-else class="st-api__chips">
        <li v-for="slot in entry.slots" :key="slot"><code>#{{ slot }}</code></li>
      </ul>
    </section>

    <section class="st-api__section">
      <header class="st-api__head">
        <h3>来源</h3>
      </header>
      <p class="st-api__source">
        <code>{{ entry.source }}</code>
      </p>
      <p v-if="entry.components.length" class="st-api__source">
        真实组件：<code v-for="name in entry.components" :key="name">{{ name }}</code>
      </p>
      <p class="st-api__source">
        所属包：<code>{{ entry.packageName ? pkgName : '—' }}</code>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * API 表：全部来自注册表 + 真实组件契约。
 *
 * 注意 `Events` 一栏来自 SFC 的 `defineEmits`（见 registry/entries.ts 的 runtimeEvents），
 * 不是手写的文档清单 —— 所以「文档写了但组件没发」这种情况在这里会直接暴露为空。
 */
import { computed } from 'vue'
import type { PlaygroundEntry } from '../registry/types'

const props = defineProps<{ entry: PlaygroundEntry }>()

const pkgName = computed(() => {
  switch (props.entry.packageName) {
    case 'ai':
      return '@beiluol/knowflow-ai'
    case 'learning':
      return '@beiluol/knowflow-learning'
    case 'ui':
      return '@beiluol/knowflow-ui'
    default:
      return '—'
  }
})

function formatDefault(value: unknown): string {
  if (value === undefined) return '—'
  if (value === '') return "''"
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value)
}
</script>
