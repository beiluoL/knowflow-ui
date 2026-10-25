<template>
  <div class="page">
    <header class="hero">
      <p class="hero__eyebrow">KnowFlow UI · v0.1.0</p>
      <h1 class="hero__title">从 KnowFlow 抽出的 Vue 3 组件库</h1>
      <p class="hero__desc">
        四个基础组件（Button / Icon / Input / Checkbox）真实迁移自 KnowFlow 线上实现，去掉业务 Store、后端 API、
        Tailwind 原子类与 <code>@/</code> 别名，改用 <code>--kf-*</code> 令牌。Studio 与示例工程都只依赖这个包。
      </p>
      <div class="hero__chips">
        <span class="hero__chip">Vue 3.4+</span>
        <span class="hero__chip">TypeScript</span>
        <span class="hero__chip">Vite Library Mode</span>
        <span class="hero__chip">Light / Dark</span>
        <span class="hero__chip">78 icons</span>
      </div>
    </header>

    <section class="cards">
      <button
        v-for="story in stories"
        :key="story.id"
        class="card"
        type="button"
        @click="go(story.id)"
      >
        <span class="card__title">{{ story.title }}</span>
        <span class="card__subtitle">{{ story.subtitle }}</span>
        <span class="card__hint">查看预览与属性 →</span>
      </button>
    </section>

    <section class="block">
      <h2 class="block__title">本地开发</h2>
      <CodeBlock title="Shell" :code="devCommands" />
    </section>

    <section class="block block--split">
      <div>
        <h2 class="block__title">组件消费</h2>
        <CodeBlock title="Vue 3" :code="usage" />
      </div>
      <div>
        <h2 class="block__title">范围与边界</h2>
        <ul class="block__list">
          <li>只封装 4 个基础组件，其余在 Roadmap 里标注为规划。</li>
          <li>不修改原 KnowFlow，也不替换它的业务依赖。</li>
          <li>包产物已在 <code>examples/vue-vite</code> 用 tarball 安装验证。</li>
          <li>npm publish 未执行；许可证待确认（当前 UNLICENSED）。</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'
import { STORIES } from '../stories/catalog'

const emit = defineEmits<{ navigate: [id: string] }>()

const stories = STORIES

const devCommands = `pnpm install          # 安装 workspace 依赖
pnpm dev              # 启动 Studio（默认 5180）
pnpm build            # 构建 packages/ui 与 Studio
pnpm test             # 组件单元测试（Vitest）
pnpm verify           # 类型 + 测试 + 构建 + 产物/消费校验`

const usage = `npm i @beiluol/knowflow-ui
# 或本地：npm i ./artifacts/beiluol-knowflow-ui-0.1.0.tgz

import { KfButton, KfInput, KfCheckbox, KfIcon } from '@beiluol/knowflow-ui'
import '@beiluol/knowflow-ui/style.css'

<KfButton icon-name="check" @click="save">保存</KfButton>
<KfInput v-model="email" label="邮箱" placeholder="you@example.com" />
<KfCheckbox v-model="agree" label="同意条款" />`

function go(id: string) {
  emit('navigate', id)
}
</script>

<style scoped>
.page {
  display: grid;
  gap: var(--kf-space-6);
  max-width: 1180px;
  padding: var(--kf-space-6) var(--kf-space-6) 64px;
}
.hero {
  padding: var(--kf-space-8) var(--kf-space-6);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-lg);
  background:
    radial-gradient(circle at 88% 12%, var(--kf-primary-soft), transparent 42%),
    var(--kf-card);
}
.hero__eyebrow {
  margin: 0;
  font-size: var(--kf-fs-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--kf-primary);
}
.hero__title {
  margin: 8px 0 0;
  font-size: var(--kf-fs-display);
  line-height: var(--kf-lh-display);
  font-weight: var(--kf-fw-display);
  color: var(--kf-foreground);
}
.hero__desc {
  margin: var(--kf-space-3) 0 0;
  max-width: 780px;
  font-size: var(--kf-fs-body-lg);
  line-height: 1.7;
  color: var(--kf-foreground);
}
.hero__desc code,
.block__list code {
  font-family: var(--kf-font-mono);
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: var(--kf-radius-xs);
  background: var(--kf-background);
}
.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  margin-top: var(--kf-space-5);
}
.hero__chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: var(--kf-radius-full);
  border: 1px solid var(--kf-border);
  background: var(--kf-card);
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--kf-space-3);
}
.card {
  display: grid;
  gap: 4px;
  padding: var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s,
    transform 0.16s;
}
.card:hover {
  border-color: var(--kf-primary);
  transform: translateY(-1px);
}
.card:focus-visible {
  outline: 2px solid var(--kf-ring);
  outline-offset: 2px;
}
.card__title {
  font-size: var(--kf-fs-h4);
  font-weight: var(--kf-fw-h4);
  color: var(--kf-foreground);
}
.card__subtitle {
  font-size: var(--kf-fs-body-sm);
  color: var(--kf-muted-foreground);
}
.card__hint {
  margin-top: 8px;
  font-size: var(--kf-fs-xs);
  color: var(--kf-primary);
}
.block {
  padding: var(--kf-space-5);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
}
.block--split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--kf-space-6);
}
.block__title {
  margin: 0 0 var(--kf-space-3);
  font-size: var(--kf-fs-h4);
  font-weight: var(--kf-fw-h4);
  color: var(--kf-foreground);
}
.block__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  font-size: var(--kf-fs-body-sm);
  line-height: 1.6;
  color: var(--kf-foreground);
}
@media (max-width: 1024px) {
  .block--split {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 720px) {
  .page {
    padding: var(--kf-space-4) var(--kf-space-4) 48px;
  }
  .hero {
    padding: var(--kf-space-5) var(--kf-space-4);
  }
  .hero__title {
    font-size: var(--kf-fs-h1);
  }
}
</style>
