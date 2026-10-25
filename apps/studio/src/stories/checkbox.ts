import type { ComponentStory } from './types'

export const checkboxStory: ComponentStory = {
  id: 'checkbox',
  title: 'Checkbox',
  subtitle: '复选框 · KfCheckbox',
  category: 'forms',
  status: 'implemented',
  description:
    '20×20 正方形复选框，3px 微圆角、品牌蓝选中、白色 Check，无默认灰色外围阴影。原生 input 承担键盘与表单语义，焦点环只画在可见方框上。',
  sourcePath: 'packages/ui/src/components/checkbox/KfCheckbox.vue',
  measureSelector: '.kf-checkbox__box',
  migratedFrom: 'frontend/src/components/ui/Checkbox.vue',
  naming: {
    js: 'KfCheckbox',
    tag: '<kf-checkbox>',
    css: '.kf-checkbox / __box / __mark / --disabled',
    types: 'KfCheckboxProps / KfCheckboxEmits',
  },
  events: [
    { name: 'update:modelValue', payload: 'T', description: 'v-model 值变化（默认 boolean）' },
    { name: 'change', payload: 'boolean', description: '选中态变化后的布尔值' },
    { name: 'native-change', payload: 'Event', description: '原生 change 事件（需要原始 target 时使用）' },
  ],
  slots: [{ name: 'default', description: '标签内容，优先于 label prop' }],
  props: [
    { name: 'modelValue', control: 'boolean', defaultValue: true, description: 'v-model 布尔值' },
    { name: 'label', control: 'text', defaultValue: '接收每周学习报告', description: '标签文本（整行可点）' },
    { name: 'indeterminate', control: 'boolean', defaultValue: false, description: '半选态（横线 + aria-checked="mixed"）' },
    { name: 'disabled', control: 'boolean', defaultValue: false, description: '禁用' },
  ],
  examples: [
    {
      title: '基础用法',
      description: '默认渲染 <label>，点击文字也能切换。',
      code: `<script setup lang="ts">
import { ref } from 'vue'
import { KfCheckbox } from '@beiluol/knowflow-ui'

const agree = ref(false)
<\/script>

<template>
  <KfCheckbox v-model="agree" label="我已阅读并同意协议" />
</template>`,
    },
    {
      title: '半选态',
      description: '父级复选（如"全选部分命中"）使用 indeterminate，视觉为横线。',
      code: `<KfCheckbox :model-value="false" :indeterminate="true" label="部分已选" />`,
    },
    {
      title: '禁用',
      description: '禁用态使用中性灰方框，文字降级为次要色。',
      code: `<KfCheckbox :model-value="true" label="不可修改" disabled />`,
    },
    {
      title: '嵌入列表行',
      description: '放在已有可点击行内时用 as="span"，避免嵌套 label。',
      code: `<div class="row" @click="toggle">
  <KfCheckbox :model-value="checked" as="span" aria-label="选择该项" />
  <span>列表项标题</span>
</div>`,
    },
  ],
  gallery: [
    {
      title: '状态 States',
      description: '未选 / 选中 / 半选 / 禁用四种状态，方框尺寸恒为 20×20。',
      items: [
        { label: 'unchecked', state: { modelValue: false } },
        { label: 'checked', state: { modelValue: true } },
        { label: 'indeterminate', state: { modelValue: false, indeterminate: true } },
        { label: 'disabled · off', state: { modelValue: false, disabled: true } },
        { label: 'disabled · on', state: { modelValue: true, disabled: true } },
      ],
    },
  ],
  a11y: [
    '原生 <input type="checkbox"> 保留 Tab 聚焦与 Space 切换。',
    'indeterminate 同时设置 aria-checked="mixed"。',
    '焦点环画在 20px 方框上（2px + 2px offset），不做全局 outline:none。',
    '标签与控件同属一个 label，整行 32px 命中区（触摸设备 44px）。',
    'disabled 时 hover 不再变蓝，避免误以为可点。',
  ],
  specs: [
    { label: '方框', value: '20 × 20px' },
    { label: '圆角', value: '3px' },
    { label: '选中色', value: '--kf-primary（#3B6FE0）' },
    { label: '标记', value: '14px Check / Minus' },
    { label: '文字间距', value: '8px' },
    { label: '命中区', value: '32px（触摸 44px）' },
  ],
}
