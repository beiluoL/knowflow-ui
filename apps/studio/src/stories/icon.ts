import type { ComponentStory } from './types'
import {
  COMMON_ICON_ITEMS,
  ICON_NAME_OPTIONS,
  ICON_SIZE_OPTIONS,
  SEMANTIC_ICON_ITEMS,
} from '../fixtures/studio-data'

export const iconStory: ComponentStory = {
  id: 'icon',
  title: 'Icon',
  subtitle: '图标 · KfIcon',
  category: 'foundations',
  status: 'implemented',
  description:
    '内联 SVG 图标组件。首版内置 78 个 lucide 风格线性图标，24×24 viewBox，stroke=currentColor；支持语义尺寸、颜色与可访问性开关。',
  sourcePath: 'packages/ui/src/components/icon/KfIcon.vue',
  measureSelector: '.icon-preview__hero svg',
  migratedFrom: 'frontend/src/components/ui/Icon.vue（原文件 211 个内联分支）',
  naming: {
    js: 'KfIcon',
    tag: '<kf-icon>',
    css: '.kf-icon / --img / --missing',
    types: 'KfIconProps',
  },
  events: [],
  slots: [],
  props: [
    {
      name: 'name',
      control: 'select',
      defaultValue: 'sparkles',
      options: ICON_NAME_OPTIONS,
      description: '内置图标名（类型安全）；自定义图标先 registerIcon()',
    },
    {
      name: 'size',
      control: 'select',
      defaultValue: 'md',
      options: ICON_SIZE_OPTIONS,
      description: '语义尺寸阶梯，也可直接传数字像素',
    },
    { name: 'color', control: 'text', defaultValue: '', description: '颜色；留空继承 currentColor' },
    { name: 'decorative', control: 'boolean', defaultValue: true, description: '装饰图标（aria-hidden）；关闭后必须给 ariaLabel' },
    { name: 'ariaLabel', control: 'text', defaultValue: '', description: '非装饰图标的可访问名称' },
  ],
  examples: [
    {
      title: '基础用法',
      description: '装饰性图标默认 aria-hidden="true"，读屏会跳过。',
      code: `<script setup lang="ts">
import { KfIcon } from '@beiluol/knowflow-ui'
<\/script>

<template>
  <KfIcon name="search" />
  <KfIcon name="bell" size="xl" />
  <KfIcon name="github" :size="24" />
</template>`,
    },
    {
      title: '语义尺寸阶梯',
      description: '10 → 32px 的 8 档阶梯，避免页面里随手写 17px 这类魔法数字。',
      code: `<KfIcon name="target" size="xxs" />
<KfIcon name="target" size="sm" />
<KfIcon name="target" size="md" />
<KfIcon name="target" size="xl" />
<KfIcon name="target" size="3xl" />`,
    },
    {
      title: '颜色继承与显式着色',
      description: '默认 currentColor，继承父级文字颜色；也可显式传 color。',
      code: `<KfIcon name="check-circle" color="var(--kf-state-success)" />
<KfIcon name="alert-circle" color="var(--kf-danger-text)" />`,
    },
    {
      title: '语义图标（非装饰）',
      description: '承担信息含义的图标要给 ariaLabel 并关闭 decorative。',
      code: `<KfIcon name="flame" :decorative="false" aria-label="连续学习 12 天" />`,
    },
    {
      title: '运行时扩展图标',
      description: '业务自定义图标无需 fork 组件库。',
      code: `import { registerIcon } from '@beiluol/knowflow-ui'

registerIcon('kf-logo', '<path d="M4 4h16v16H4z" />')

// <KfIcon name="kf-logo" />`,
    },
  ],
  gallery: [
    {
      title: '语义色 Semantic colors',
      description: '颜色由令牌驱动，深色模式自动跟随主题。',
      items: SEMANTIC_ICON_ITEMS,
    },
    {
      title: '常用图标 Common icons',
      description: '首版内置 78 个；未迁移图标不会被静默渲染成空白，开发环境会告警。',
      items: COMMON_ICON_ITEMS,
    },
  ],
  a11y: [
    '装饰图标渲染 aria-hidden="true"，避免读屏重复朗读。',
    'decorative=false 时输出 role="img" + aria-label；缺 ariaLabel 会在开发环境告警。',
    'SVG 带 focusable="false"，避免 IE/旧 Edge 把它拉进 Tab 序列。',
    '尺寸由 width/height 属性固定，不随文字大小抖动。',
  ],
  specs: [
    { label: '内置数量', value: '78（原项目 212 中的首版必要集）' },
    { label: 'viewBox', value: '0 0 24 24' },
    { label: '描边', value: 'stroke=currentColor，width=2，圆头圆角' },
    { label: '尺寸阶梯', value: '10 / 12 / 14 / 16 / 18 / 20 / 24 / 32' },
    { label: '默认尺寸', value: '16px（md）' },
  ],
}
