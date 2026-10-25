import type { ComponentStory } from './types'
import { FORM_FIXTURES } from '../fixtures/studio-data'

const ICON_OPTIONS = [
  { label: '无', value: '' },
  { label: 'search', value: 'search' },
  { label: 'user', value: 'user' },
  { label: 'lock', value: 'lock' },
  { label: 'mail', value: 'mail' },
  { label: 'link', value: 'link' },
  { label: 'eye', value: 'eye' },
  { label: 'check', value: 'check' },
]

export const inputStory: ComponentStory = {
  id: 'input',
  title: 'Input',
  subtitle: '输入框 · KfInput',
  category: 'forms',
  status: 'implemented',
  description:
    '单行文本输入。浅灰表面 44px 高，默认无边框、聚焦不出现蓝色或灰色外框；label / help / error 通过 id + aria-describedby 关联，输入法组合期间不打断用户。',
  sourcePath: 'packages/ui/src/components/input/KfInput.vue',
  measureSelector: '.kf-field',
  migratedFrom: 'frontend/src/components/ui/Input.vue',
  props: [
    { name: 'label', control: 'text', defaultValue: '邮箱地址', description: '字段标签（同时关联 label for）' },
    { name: 'modelValue', control: 'text', defaultValue: '', description: 'v-model 值' },
    { name: 'placeholder', control: 'text', defaultValue: FORM_FIXTURES.email, description: '占位文本' },
    {
      name: 'type',
      control: 'select',
      defaultValue: 'text',
      options: [
        { label: 'text', value: 'text' },
        { label: 'password', value: 'password' },
        { label: 'email', value: 'email' },
        { label: 'number', value: 'number' },
      ],
      description: '原生 input type',
    },
    { name: 'help', control: 'text', defaultValue: '', description: '辅助说明（关联 aria-describedby）' },
    { name: 'error', control: 'text', defaultValue: '', description: '错误信息（aria-invalid + describedby）' },
    { name: 'required', control: 'boolean', defaultValue: false, description: '必填标记' },
    { name: 'disabled', control: 'boolean', defaultValue: false, description: '禁用' },
    { name: 'readonly', control: 'boolean', defaultValue: false, description: '只读（可聚焦、可复制）' },
    {
      name: 'prefixIconName',
      control: 'select',
      defaultValue: '',
      options: ICON_OPTIONS,
      description: '前置图标',
    },
    {
      name: 'suffixIconName',
      control: 'select',
      defaultValue: '',
      options: ICON_OPTIONS,
      description: '后置图标',
    },
  ],
  examples: [
    {
      title: '基础用法',
      description: 'v-model 双向绑定，label 自动关联。',
      code: `<script setup lang="ts">
import { ref } from 'vue'
import { KfInput } from '@beiluol/knowflow-ui'

const email = ref('')
<\/script>

<template>
  <KfInput v-model="email" label="邮箱地址" placeholder="you@example.com" />
</template>`,
    },
    {
      title: '图标与帮助文本',
      description: '图标由外壳负责间距（12px），内部 input 透明，不出现双层容器。',
      code: `<KfInput v-model="keyword" label="搜索" prefix-icon-name="search" help="支持标题与正文" />
<KfInput v-model="password" label="密码" type="password" suffix-icon-name="eye" />`,
    },
    {
      title: '错误与必填',
      description: '错误态只改表面与提示文字，不为错误恢复外框。',
      code: `<KfInput v-model="email" label="邮箱地址" required error="邮箱格式不正确" />`,
    },
    {
      title: '禁用与只读',
      description: 'disabled 不可聚焦；readonly 可聚焦、可复制、不参与修改。',
      code: `<KfInput model-value="已禁用" label="账号" disabled />
<KfInput model-value="只读内容" label="邀请码" readonly />`,
    },
  ],
  gallery: [
    {
      title: '状态 States',
      description: '空、错误、禁用、只读四种典型状态；错误只改表面与提示，不加外框。',
      items: [
        { label: '默认', state: { label: '搜索关键词', modelValue: '', placeholder: '输入关键词' } },
        {
          label: '带帮助',
          state: { label: '邀请码', modelValue: FORM_FIXTURES.inviteCode, help: '区分大小写，8 位字符' },
        },
        {
          label: '错误',
          state: { label: '邮箱地址', modelValue: 'not-an-email', error: '邮箱格式不正确' },
        },
        { label: '禁用', state: { label: '账号', modelValue: 'beiluo', disabled: true } },
        { label: '只读', state: { label: '邀请码', modelValue: 'KF-READONLY', readonly: true } },
        { label: '必填', state: { label: '昵称', modelValue: '', required: true } },
      ],
    },
    {
      title: '图标 Icons',
      description: '前置/后置图标由外壳统一留出 12px 间距，不遮挡输入内容。',
      items: [
        { label: '前置', state: { label: '搜索', prefixIconName: 'search', modelValue: '' } },
        { label: '后置', state: { label: '密码', type: 'password', suffixIconName: 'eye', modelValue: FORM_FIXTURES.password } },
        { label: '双图标', state: { label: '链接', prefixIconName: 'link', suffixIconName: 'check', modelValue: '' } },
      ],
    },
  ],
  a11y: [
    'label 通过 for/id 绑定，错误与帮助文本进入 aria-describedby。',
    '错误时设置 aria-invalid="true"，不只靠颜色传达。',
    '输入法组合（composition）期间不向父组件抛中间态，combination 结束才同步。',
    'readonly 与 disabled 语义区分：只读仍可聚焦复制，禁用不参与表单。',
    '聚焦反馈只改变表面底色，不用 outline 遮挡原有布局。',
  ],
  specs: [
    { label: '高度', value: '44px（--kf-input-height）' },
    { label: '表面', value: '--kf-field-surface（浅灰 #E8ECF1）' },
    { label: '圆角', value: '10px（--kf-field-radius）' },
    { label: '内边距', value: '12px（--kf-field-padding）' },
    { label: '图标间距', value: '12px（gap）' },
    { label: '聚焦', value: '仅表面变深，无 border / outline / ring' },
  ],
}
