<template>
  <main class="page" :class="{ 'page--dark': isDark }">
    <header class="hero">
      <p class="hero__eyebrow">Consumer example</p>
      <h1 class="hero__title">用打包产物消费 KnowFlow UI</h1>
      <p class="hero__desc">
        本工程不引用 monorepo 源码、不使用任何 alias，只安装
        <code>artifacts/beiluol-knowflow-ui-0.1.0.tgz</code>。能构建、能类型检查、能渲染，才算包真的可发布。
      </p>
      <button class="hero__toggle" type="button" @click="toggleTheme">
        {{ isDark ? '切换浅色' : '切换深色' }}
      </button>
    </header>

    <section class="card">
      <h2 class="card__title">Button</h2>
      <div class="row">
        <KfButton variant="primary" icon-name="check" @click="onSave">保存更改</KfButton>
        <KfButton variant="secondary" icon-name="download">导出</KfButton>
        <KfButton variant="outline" icon-name="arrow-right" icon-position="right">下一步</KfButton>
        <KfButton variant="text">取消</KfButton>
        <KfButton variant="danger" icon-name="trash-2">删除</KfButton>
        <KfButton size="sm">小号</KfButton>
        <KfButton size="lg">大号</KfButton>
        <KfButton :loading="saving">保存中</KfButton>
        <KfButton icon-only icon-name="plus" aria-label="新建" />
      </div>
      <p class="row__meta">最近事件：{{ lastEvent }}</p>
    </section>

    <section class="card">
      <h2 class="card__title">Icon</h2>
      <div class="row row--icons">
        <KfIcon v-for="name in icons" :key="name" :name="name" size="2xl" />
        <KfIcon name="flame" :decorative="false" aria-label="连续学习 12 天" size="2xl" />
      </div>
      <p class="row__meta">{{ icons.length + 1 }} 个图标来自注册表（含 1 个语义图标）</p>
    </section>

    <section class="card">
      <h2 class="card__title">Input</h2>
      <div class="stack">
        <KfInput v-model="email" label="邮箱地址" placeholder="you@example.com" prefix-icon-name="mail" />
        <KfInput v-model="password" label="密码" type="password" suffix-icon-name="eye" help="至少 8 位字符" />
        <KfInput
          v-model="invalidEmail"
          label="错误示例"
          error="邮箱格式不正确"
          placeholder="not-an-email"
        />
        <KfInput model-value="只读内容" label="只读" readonly />
        <KfInput model-value="禁用内容" label="禁用" disabled />
      </div>
      <p class="row__meta">v-model 回写：{{ email || '（空）' }} / {{ password ? '••••••' : '（空）' }}</p>
    </section>

    <section class="card">
      <h2 class="card__title">Checkbox</h2>
      <div class="stack">
        <KfCheckbox v-model="agree" label="我已阅读并同意服务条款" />
        <KfCheckbox :model-value="false" :indeterminate="true" label="部分选中（半选）" />
        <KfCheckbox :model-value="true" label="已选中" />
        <KfCheckbox :model-value="false" label="禁用" disabled />
      </div>
      <p class="row__meta">agree = {{ agree }}</p>
    </section>

    <footer class="footer">
      包版本：<code>{{ version }}</code>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { KfButton, KfCheckbox, KfIcon, KfInput, version } from '@beiluol/knowflow-ui'

const isDark = ref(false)
const email = ref('')
const password = ref('')
const invalidEmail = ref('not-an-email')
const agree = ref(false)
const saving = ref(false)
const lastEvent = ref('暂无')

const icons = ['check', 'plus', 'search', 'bell', 'calendar', 'file-text', 'book-open', 'brain', 'sparkles', 'github']

const themeLabel = computed(() => (isDark.value ? 'dark' : 'light'))

function toggleTheme() {
  isDark.value = !isDark.value
  const root = document.documentElement
  if (isDark.value) root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  lastEvent.value = `主题切换为 ${themeLabel.value}`
}

function onSave() {
  saving.value = true
  lastEvent.value = 'click · 开始保存'
  window.setTimeout(() => {
    saving.value = false
    lastEvent.value = 'click · 保存完成'
  }, 900)
}
</script>
