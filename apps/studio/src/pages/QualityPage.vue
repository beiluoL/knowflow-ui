<template>
  <div class="st-page">
    <header class="st-page__header">
      <div class="st-page__heading">
        <div class="st-page__title-row">
          <h2 class="st-page__title">质量总览</h2>
          <span class="st-chip">实时计算</span>
        </div>
        <p class="st-page__desc">
          所有数字都由当前注册表计算得出，不引用任何历史报告（V5 的 1628 项 / v0.1.0 的 42 项都不作为这里的数据源）。
        </p>
      </div>
      <div class="st-page__actions">
        <button type="button" class="st-button" @click="download('json')">导出 JSON</button>
        <button type="button" class="st-button st-button--ghost" @click="download('md')">导出 Markdown</button>
      </div>
    </header>

    <section class="st-metrics">
      <article v-for="card in cards" :key="card.label" class="st-metric">
        <p class="st-metric__label">{{ card.label }}</p>
        <p class="st-metric__value">{{ card.value }}</p>
        <p class="st-metric__note">{{ card.note }}</p>
      </article>
    </section>

    <section class="st-panel">
      <h3 class="st-panel__title">状态分布</h3>
      <ul class="st-bars">
        <li v-for="item in statusBars" :key="item.label" class="st-bar">
          <span class="st-bar__label">{{ item.label }}</span>
          <span class="st-bar__track">
            <span class="st-bar__fill" :class="`st-bar__fill--${item.key}`" :style="{ width: item.width }" />
          </span>
          <span class="st-bar__value">{{ item.count }}</span>
        </li>
      </ul>
      <p class="st-panel__hint">
        real = packages 内存在真实组件且画布可交互；demo = 仅 V5 内部演示、v0.2.0 未提升为公共组件；
        missing = 两个版本都没有实现。
      </p>
    </section>

    <section class="st-panel">
      <h3 class="st-panel__title">分类分布</h3>
      <table class="st-table">
        <thead>
          <tr><th scope="col">分类</th><th scope="col">条目</th><th scope="col">Story</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in categoryRows" :key="row.category">
            <td>{{ row.category }}</td>
            <td>{{ row.entries }}</td>
            <td>{{ row.stories }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="st-panel">
      <h3 class="st-panel__title">逐条目明细</h3>
      <p class="st-panel__hint">
        点击任意行进入该条目；Story 数为 0 会高亮显示（正常情况不应出现）。
      </p>
      <div class="st-table-wrap">
        <table class="st-table st-table--dense">
          <thead>
            <tr>
              <th scope="col">条目</th>
              <th scope="col">状态</th>
              <th scope="col">包</th>
              <th scope="col">Story</th>
              <th scope="col">Props</th>
              <th scope="col">Events</th>
              <th scope="col">预览</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in report.entriesDetail"
              :key="item.id"
              class="st-table__row"
              tabindex="0"
              @click="open(item.id)"
              @keydown.enter="open(item.id)"
            >
              <td>
                <span class="st-table__title">{{ item.title }}</span>
                <code class="st-table__code">{{ item.name }}</code>
              </td>
              <td><span class="st-badge" :class="`st-badge--${item.status}`">{{ item.status }}</span></td>
              <td>{{ item.packageName }}</td>
              <td :class="{ 'st-table__warn': item.storyCount === 0 }">{{ item.storyCount }}</td>
              <td>{{ item.props }}</td>
              <td>{{ item.events }}</td>
              <td>{{ item.preview }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="st-panel__hint">
      生成时间：{{ new Date(report.generatedAt).toLocaleString('zh-CN') }} ·
      导出的是当前快照，不含测试结果（测试结果见 docs/migration/v5-to-ui/TEST_REPORT.md）。
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * 质量面板 —— Phase 9 的 Quality Dashboard。
 *
 * 只做三件事：真实统计、可读分布、可导出快照。
 * 不把「测试通过数」写进页面：那是 CI 的事实，应该留在 TEST_REPORT.md，
 * 否则页面一刷新就会展示一个没人验证过的数字。
 */
import { computed } from 'vue'
import { CATEGORIES } from '../registry/entries'
import { buildQualityReport, qualityToJson, qualityToMarkdown } from '../registry/quality'
import { navigate } from '../composables/useHashRoute'

const report = computed(() => buildQualityReport())

const cards = computed(() => {
  const data = report.value
  return [
    {
      label: '条目总数',
      value: data.entries.total,
      note: `real ${data.entries.real} · demo ${data.entries.demo} · missing ${data.entries.missing}`,
    },
    {
      label: 'Story 总数',
      value: data.stories.total,
      note: `平均每条目 ${data.stories.averagePerEntry} 条`,
    },
    {
      label: 'Props 文档项',
      value: data.api.props,
      note: `覆盖 ${data.api.events} 个事件 / ${data.api.slots} 个插槽`,
    },
    {
      label: '可交互预览',
      value: data.previews.custom + data.previews.generic,
      note: `组合 ${data.previews.custom} · 通用 ${data.previews.generic}`,
    },
  ]
})

const statusBars = computed(() => {
  const { real, demo, missing, total } = report.value.entries
  return [
    { key: 'real', label: '真实组件', count: real, width: `${(real / total) * 100}%` },
    { key: 'demo', label: '仅演示', count: demo, width: `${(demo / total) * 100}%` },
    { key: 'missing', label: '未实现', count: missing, width: `${(missing / total) * 100}%` },
  ]
})

const categoryRows = computed(() =>
  CATEGORIES.map((category) => ({
    category,
    entries: report.value.entries.byCategory[category] ?? 0,
    stories: report.value.entriesDetail
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.storyCount, 0),
  })),
)

function download(kind: 'json' | 'md'): void {
  const content = kind === 'json' ? qualityToJson(report.value) : qualityToMarkdown(report.value)
  const blob = new Blob([content], {
    type: kind === 'json' ? 'application/json;charset=utf-8' : 'text/markdown;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = kind === 'json' ? 'knowflow-ui-quality.json' : 'knowflow-ui-quality.md'
  anchor.click()
  URL.revokeObjectURL(url)
}

function open(id: string): void {
  navigate({ view: 'component', entryId: id, storyId: '', tab: 'preview' })
}
</script>
