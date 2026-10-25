<template>
  <div class="page">
    <header>
      <p class="page__crumb">Roadmap</p>
      <h1 class="page__title">迁移路线</h1>
      <p class="page__desc">
        v0.1.0 只封装 4 个组件，其余条目是规划，不代表已实现。目录里没有为规划项创建空组件文件——
        空文件会让"组件数"看起来很好看，但无法安装、无法测试。
      </p>
    </header>

    <section v-for="group in groups" :key="group.id" class="group">
      <div class="group__head">
        <h2 class="group__title">{{ group.title }}</h2>
        <p class="group__desc">{{ group.description }}</p>
      </div>

      <div class="group__rows">
        <div v-for="story in group.done" :key="story.id" class="row row--done">
          <span class="row__name">{{ story.title }}</span>
          <span class="row__origin">{{ story.sourcePath }}</span>
          <span class="row__badge row__badge--done">已完成 · v0.1.0</span>
        </div>
        <div v-for="item in group.planned" :key="item.title" class="row">
          <span class="row__name">{{ item.title }}</span>
          <span class="row__origin">{{ item.origin ?? '尚无迁移来源' }}</span>
          <span class="row__badge">{{ item.version }} 规划</span>
        </div>
        <div v-if="!group.done.length && !group.planned.length" class="row row--empty">
          <span class="row__name">暂无条目</span>
        </div>
      </div>
    </section>

    <section class="notice">
      <h2 class="notice__title">发布状态</h2>
      <ul class="notice__list">
        <li>npm publish：<strong>未执行</strong>（scope 归属与许可证尚未确认）。</li>
        <li>Git tag：待 v0.1.0 全量门禁通过并人工确认后创建。</li>
        <li>原 KnowFlow 仍在用旧组件，本版本不替换业务依赖。</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORIES, plannedOf, storiesOf } from '../stories/catalog'

const groups = computed(() =>
  CATEGORIES.map((category) => ({
    ...category,
    done: storiesOf(category.id),
    planned: plannedOf(category.id),
  })),
)
</script>

<style scoped>
.page {
  display: grid;
  gap: var(--kf-space-6);
  max-width: 1180px;
  padding: var(--kf-space-6) var(--kf-space-6) 64px;
}
.page__crumb {
  margin: 0 0 6px;
  font-size: var(--kf-fs-caption);
  color: var(--kf-muted-foreground);
}
.page__title {
  margin: 0;
  font-size: var(--kf-fs-h1);
  line-height: var(--kf-lh-h1);
  font-weight: var(--kf-fw-h1);
  color: var(--kf-foreground);
}
.page__desc {
  margin: var(--kf-space-3) 0 0;
  max-width: 820px;
  font-size: var(--kf-fs-body-md);
  line-height: 1.75;
  color: var(--kf-foreground);
}
.group {
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
}
.group__head {
  padding: 12px 16px;
  border-bottom: 1px solid var(--kf-border);
  background: var(--kf-background);
}
.group__title {
  margin: 0;
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
  color: var(--kf-foreground);
}
.group__desc {
  margin: 4px 0 0;
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
}
.group__rows {
  display: grid;
}
.row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) 128px;
  align-items: center;
  gap: var(--kf-space-3);
  padding: 10px 16px;
  border-bottom: 1px solid var(--kf-border);
  font-size: var(--kf-fs-body-sm);
}
.row:last-child {
  border-bottom: 0;
}
.row__name {
  color: var(--kf-foreground);
  font-weight: 500;
}
.row__origin {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row__badge {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-background);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.row__badge--done {
  background: var(--kf-primary-soft);
  color: var(--kf-primary);
}
.row--empty {
  grid-template-columns: 1fr;
  color: var(--kf-muted-foreground);
}
.notice {
  padding: var(--kf-space-5);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
}
.notice__title {
  margin: 0 0 var(--kf-space-2);
  font-size: var(--kf-fs-body-md);
  font-weight: var(--kf-fw-label);
}
.notice__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: var(--kf-fs-body-sm);
  color: var(--kf-foreground);
}
@media (max-width: 720px) {
  .page {
    padding: var(--kf-space-4) var(--kf-space-4) 48px;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .row__badge {
    justify-self: start;
  }
}
</style>
