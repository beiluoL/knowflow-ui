import type { ComponentStory } from './types'

const ICON_OPTIONS = [
  { label: '无', value: '' },
  { label: 'check', value: 'check' },
  { label: 'plus', value: 'plus' },
  { label: 'search', value: 'search' },
  { label: 'download', value: 'download' },
  { label: 'trash-2', value: 'trash-2' },
  { label: 'arrow-right', value: 'arrow-right' },
  { label: 'sparkles', value: 'sparkles' },
]

export const buttonStory: ComponentStory = {
  id: 'button',
  title: 'Button',
  subtitle: '按钮 · KfButton',
  category: 'foundations',
  status: 'implemented',
  description:
    '三档高度（32 / 38 / 44）与六种变体的基础操作按钮。图标槽固定 18px，图文间距 8px，双轴居中且标签不换行。',
  sourcePath: 'packages/ui/src/components/button/KfButton.vue',
  measureSelector: '.kf-button',
  migratedFrom: 'frontend/src/components/ui/Button.vue',
  naming: {
    js: 'KfButton',
    tag: '<kf-button>',
    css: '.kf-button / __icon / __label / --primary',
    types: 'KfButtonProps / KfButtonEmits',
  },
  events: [{ name: 'click', payload: 'MouseEvent', description: '点击；disabled 或 loading 时不触发' }],
  slots: [{ name: 'default', description: '按钮文本；iconOnly 为 true 时不渲染' }],
  props: [
    {
      name: 'variant',
      control: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'primary', value: 'primary' },
        { label: 'secondary', value: 'secondary' },
        { label: 'outline', value: 'outline' },
        { label: 'ghost', value: 'ghost' },
        { label: 'text', value: 'text' },
        { label: 'danger', value: 'danger' },
      ],
      description: '视觉变体；ghost 与 outline 同义（沿用原组件历史契约）',
    },
    {
      name: 'size',
      control: 'select',
      defaultValue: 'md',
      options: [
        { label: 'sm · 32px', value: 'sm' },
        { label: 'md · 38px', value: 'md' },
        { label: 'lg · 44px', value: 'lg' },
      ],
      description: '高度档位',
    },
    { name: 'label', control: 'text', defaultValue: '保存更改', description: '默认插槽文本（展示用，非 prop）' },
    {
      name: 'iconName',
      control: 'select',
      defaultValue: 'check',
      options: ICON_OPTIONS,
      description: '前置/后置图标名',
    },
    {
      name: 'iconPosition',
      control: 'select',
      defaultValue: 'left',
      options: [
        { label: 'left', value: 'left' },
        { label: 'right', value: 'right' },
      ],
      description: '图标位置',
    },
    { name: 'iconOnly', control: 'boolean', defaultValue: false, description: '仅图标（正方形）；需 ariaLabel' },
    { name: 'block', control: 'boolean', defaultValue: false, description: '撑满容器宽度' },
    { name: 'loading', control: 'boolean', defaultValue: false, description: '加载态：禁用点击 + 旋转图标' },
    { name: 'disabled', control: 'boolean', defaultValue: false, description: '禁用' },
    { name: 'ariaLabel', control: 'text', defaultValue: '', description: '可访问名称（iconOnly 时必填）' },
  ],
  examples: [
    {
      title: '基础用法',
      description: '默认 primary / md / 无图标。',
      code: `<script setup lang="ts">
import { KfButton } from '@beiluol/knowflow-ui'
<\/script>

<template>
  <KfButton @click="handleSave">保存更改</KfButton>
</template>`,
    },
    {
      title: '六种变体',
      description: 'primary 用于主操作，secondary 用于同级次操作，text 用于低权重操作，danger 仅用于破坏性动作。',
      code: `<KfButton variant="primary">主要操作</KfButton>
<KfButton variant="secondary">次要操作</KfButton>
<KfButton variant="outline">描边</KfButton>
<KfButton variant="ghost">幽灵</KfButton>
<KfButton variant="text">文字</KfButton>
<KfButton variant="danger">删除</KfButton>`,
    },
    {
      title: '三档尺寸',
      description: '32 / 38 / 44，文字统一 14px / 500。',
      code: `<KfButton size="sm">小按钮</KfButton>
<KfButton size="md">中按钮</KfButton>
<KfButton size="lg">大按钮</KfButton>`,
    },
    {
      title: '图标与加载',
      description: 'loading 时按钮不可点，并保留原标签宽度避免布局跳动。',
      code: `<KfButton icon-name="download">导出</KfButton>
<KfButton icon-name="arrow-right" icon-position="right">下一步</KfButton>
<KfButton :loading="saving">保存中</KfButton>
<KfButton icon-only icon-name="plus" aria-label="新建" />`,
    },
  ],
  gallery: [
    {
      title: '变体 Variants',
      description: '同一尺寸下六种变体的视觉权重对比。',
      items: [
        { label: 'primary', state: { variant: 'primary' } },
        { label: 'secondary', state: { variant: 'secondary' } },
        { label: 'outline', state: { variant: 'outline' } },
        { label: 'ghost', state: { variant: 'ghost' } },
        { label: 'text', state: { variant: 'text' } },
        { label: 'danger', state: { variant: 'danger' } },
      ],
    },
    {
      title: '尺寸 Sizes',
      description: '32 / 38 / 44 三档，文字恒为 14px。',
      items: [
        { label: 'sm · 32px', state: { size: 'sm' } },
        { label: 'md · 38px', state: { size: 'md' } },
        { label: 'lg · 44px', state: { size: 'lg' } },
      ],
    },
    {
      title: '状态 States',
      description: '禁用与加载共用 opacity .5，加载额外显示旋转图标且不可点击。',
      items: [
        { label: '默认', state: {} },
        { label: 'disabled', state: { disabled: true } },
        { label: 'loading', state: { loading: true } },
        { label: 'icon only', state: { iconOnly: true, iconName: 'plus', ariaLabel: '新建' } },
      ],
    },
  ],
  a11y: [
    '原生 <button>，保留 type / submit 语义与键盘 Enter/Space 激活。',
    'loading 时设置 aria-busy 并禁用点击，读屏可感知忙状态。',
    'iconOnly 必须提供 ariaLabel，否则按钮没有可访问名称。',
    'focus-visible 使用 2px ring + 4px offset，不取消键盘焦点提示。',
    'prefers-reduced-motion 下取消过渡与旋转动画。',
  ],
  specs: [
    { label: '高度', value: 'sm 32px / md 38px / lg 44px' },
    { label: '字号', value: '14px · 500（--kf-fs-body-md / --kf-fw-label）' },
    { label: '图标', value: '16px（lg 为 18px），槽位 18px' },
    { label: '图文间距', value: '8px（--kf-button-gap）' },
    { label: '圆角', value: '6px（--kf-radius-sm）' },
    { label: '阴影', value: '无装饰阴影' },
  ],
}
