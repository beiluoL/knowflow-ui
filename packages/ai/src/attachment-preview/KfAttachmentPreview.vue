<template>
  <div
    class="kf-attachment-preview"
    :class="`kf-attachment-preview--${layout}`"
    :aria-label="ariaLabel"
  >
    <ul v-if="files.length" class="kf-attachment-preview__list" role="list">
      <li
        v-for="(item, index) in visible"
        :key="item.id"
        class="kf-attachment-preview__item"
        :class="[`kf-attachment-preview__item--${statusOf(item)}`, `kf-attachment-preview__item--${item.kind || 'file'}`]"
      >
        <slot name="item" :item="item" :index="index">
          <button
            type="button"
            class="kf-attachment-preview__open"
            :aria-label="`查看附件 ${item.name}`"
            @click="emit('open', item)"
          >
            <span class="kf-attachment-preview__thumb">
              <img v-if="item.thumbnailSrc" :src="item.thumbnailSrc" alt="" class="kf-attachment-preview__img" />
              <KfIcon v-else :name="iconOf(item)" :size="15" aria-hidden="true" />
            </span>

            <span class="kf-attachment-preview__meta">
              <span class="kf-attachment-preview__name" :title="item.name">{{ item.name }}</span>
              <span class="kf-attachment-preview__sub">
                <template v-if="statusOf(item) === 'uploading'">上传中 {{ progressOf(item) }}</template>
                <template v-else-if="statusOf(item) === 'error'">{{ item.errorText || '上传失败' }}</template>
                <template v-else>{{ sizeOf(item) }}</template>
              </span>
            </span>
          </button>

          <span v-if="statusOf(item) === 'uploading'" class="kf-attachment-preview__track" aria-hidden="true">
            <span class="kf-attachment-preview__bar" :style="{ width: `${progressValue(item)}%` }" />
          </span>

          <button
            v-if="removable"
            type="button"
            class="kf-attachment-preview__remove"
            :aria-label="`移除附件 ${item.name}`"
            @click="emit('remove', item.id, item)"
          >
            <KfIcon name="x" :size="12" aria-hidden="true" />
          </button>
        </slot>
      </li>
    </ul>

    <p v-else class="kf-attachment-preview__empty">
      <slot name="empty">{{ emptyText }}</slot>
    </p>

    <p v-if="hiddenCount > 0" class="kf-attachment-preview__more">还有 {{ hiddenCount }} 个附件未显示</p>
  </div>
</template>

<script setup lang="ts">
/**
 * KfAttachmentPreview — 附件预览（列表 / 九宫格）。
 *
 * 组件不上传、不下载、不生成预览 URL：thumbnailSrc / url 都由宿主准备。
 * 上传进度只是展示，组件不轮询也不推断完成状态。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import { formatBytes } from '../shared/format'
import type {
  KfAttachmentItem,
  KfAttachmentKind,
  KfAttachmentPreviewEmits,
  KfAttachmentPreviewProps,
  KfAttachmentStatus,
} from './types'

const props = withDefaults(defineProps<KfAttachmentPreviewProps>(), {
  files: () => [],
  removable: true,
  layout: 'list',
  maxVisible: 0,
  emptyText: '暂无附件',
  ariaLabel: '附件',
})

const emit = defineEmits<KfAttachmentPreviewEmits>()

const KIND_ICON: Record<KfAttachmentKind, string> = {
  file: 'file-text',
  image: 'image',
  audio: 'book-open',
  video: 'image',
  code: 'code',
  link: 'link',
}

const visible = computed(() =>
  props.maxVisible > 0 ? props.files.slice(0, props.maxVisible) : props.files,
)
const hiddenCount = computed(() => props.files.length - visible.value.length)

function statusOf(item: KfAttachmentItem): KfAttachmentStatus {
  return item.status ?? 'ready'
}

function iconOf(item: KfAttachmentItem): string {
  return KIND_ICON[item.kind ?? 'file']
}

function sizeOf(item: KfAttachmentItem): string {
  return formatBytes(item.size) || '未知大小'
}

function progressValue(item: KfAttachmentItem): number {
  const raw = item.progress
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  return Math.min(100, Math.max(0, Math.round(raw)))
}

function progressOf(item: KfAttachmentItem): string {
  const raw = item.progress
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return '…'
  return `${progressValue(item)}%`
}
</script>

<style scoped>
.kf-attachment-preview {
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-attachment-preview__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kf-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-attachment-preview--list .kf-attachment-preview__item {
  flex: 1 1 220px;
  max-width: 100%;
}
.kf-attachment-preview--grid .kf-attachment-preview__item {
  flex: 0 0 auto;
  width: 108px;
}
.kf-attachment-preview__item {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-width: 0;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
}
.kf-attachment-preview__item--error {
  border-color: var(--kf-danger);
}
.kf-attachment-preview__open {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
  padding: var(--kf-space-2);
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.kf-attachment-preview--grid .kf-attachment-preview__open {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}
.kf-attachment-preview__open:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: calc(var(--kf-focus-ring-width) * -1);
}
.kf-attachment-preview__thumb {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  overflow: hidden;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-attachment-preview--grid .kf-attachment-preview__thumb {
  width: 100%;
  height: 64px;
}
.kf-attachment-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kf-attachment-preview__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.kf-attachment-preview__name {
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-attachment-preview__sub {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-attachment-preview__item--error .kf-attachment-preview__sub {
  color: var(--kf-danger);
}
.kf-attachment-preview__track {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--kf-muted);
}
.kf-attachment-preview__bar {
  display: block;
  height: 100%;
  background: var(--kf-primary);
  transition: width var(--kf-motion-base) ease;
}
.kf-attachment-preview__remove {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 6px;
  border: 0;
  border-radius: var(--kf-radius-full);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-attachment-preview--grid .kf-attachment-preview__remove {
  position: absolute;
  top: 4px;
  right: 0;
  margin-right: 0;
  background: var(--kf-overlay);
  /* 遮罩上的控件用「深色表面上的前景色」，与主题无关 */
  color: var(--kf-tooltip-foreground);
}
.kf-attachment-preview__remove:hover {
  background: var(--kf-muted);
  color: var(--kf-danger);
}
.kf-attachment-preview__remove:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-attachment-preview__empty {
  margin: 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-attachment-preview__more {
  margin: var(--kf-space-2) 0 0;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
@media (prefers-reduced-motion: reduce) {
  .kf-attachment-preview__bar {
    transition: none;
  }
}
</style>
