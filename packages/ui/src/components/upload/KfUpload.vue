<template>
  <div class="kf-upload" :class="{ 'kf-upload--disabled': disabled, 'kf-upload--dragging': dragging }">
    <div
      class="kf-upload__zone"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled || undefined"
      :aria-label="ariaLabel"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="input"
        class="kf-upload__input"
        type="file"
        :accept="accept || undefined"
        :multiple="multiple"
        :disabled="disabled"
        tabindex="-1"
        aria-hidden="true"
        @change="onChange"
      />

      <slot>
        <KfIcon name="upload" :size="20" class="kf-upload__icon" aria-hidden="true" />
        <p class="kf-upload__title">{{ dragText }}</p>
        <p v-if="hint" class="kf-upload__hint">{{ hint }}</p>
      </slot>
    </div>

    <ul v-if="files.length" class="kf-upload__list" role="list">
      <li
        v-for="file in files"
        :key="file.id"
        class="kf-upload__item"
        :class="`kf-upload__item--${file.status || 'ready'}`"
      >
        <KfIcon name="file-text" :size="14" class="kf-upload__file-icon" aria-hidden="true" />
        <span class="kf-upload__file-name" :title="file.name">{{ file.name }}</span>
        <span class="kf-upload__file-meta">{{ metaOf(file) }}</span>

        <button
          v-if="file.status === 'error'"
          type="button"
          class="kf-upload__action"
          :disabled="disabled"
          @click="emit('retry', file.id)"
        >
          重试
        </button>
        <button
          type="button"
          class="kf-upload__action kf-upload__action--remove"
          :aria-label="`移除 ${file.name}`"
          :disabled="disabled"
          @click="emit('remove', file.id)"
        >
          <KfIcon name="x" :size="12" aria-hidden="true" />
        </button>

        <span v-if="file.status === 'uploading'" class="kf-upload__track" aria-hidden="true">
          <span class="kf-upload__bar" :style="{ width: `${progressOf(file)}%` }" />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * KfUpload — 本地文件选择与校验。
 *
 * 明确不做的事：不发请求、不生成 objectURL、不做分片/断点续传。
 * 组件只把「通过校验的 File 列表」交给宿主，进度与结果由宿主回填 files。
 * 因此它既能被真实上传实现复用，也不会把上传策略写死在 UI 库里。
 */
import { ref } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import { formatFileSize } from '../shared/format'
import type { KfUploadEmits, KfUploadFile, KfUploadProps, KfUploadRejectReason } from './types'

const props = withDefaults(defineProps<KfUploadProps>(), {
  accept: '',
  multiple: false,
  maxSizeMb: 0,
  maxCount: 0,
  files: () => [],
  disabled: false,
  hint: '',
  dragText: '点击或拖拽文件到此处',
  ariaLabel: '上传文件',
})

const emit = defineEmits<KfUploadEmits>()

const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

function openPicker(): void {
  if (props.disabled) return
  input.value?.click()
}

function onDragOver(): void {
  if (props.disabled) return
  dragging.value = true
}

function onDragLeave(): void {
  dragging.value = false
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  if (props.disabled) return
  const dropped = event.dataTransfer?.files
  if (dropped?.length) handle(Array.from(dropped))
}

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement
  if (target.files?.length) handle(Array.from(target.files))
  // 重置 input，保证同一个文件可以再次选择
  target.value = ''
}

function matchesAccept(file: File): boolean {
  if (!props.accept) return true
  return props.accept.split(',').some((rule) => {
    const token = rule.trim().toLowerCase()
    if (!token) return false
    if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token)
    if (token.endsWith('/*')) return file.type.toLowerCase().startsWith(token.slice(0, -1))
    return file.type.toLowerCase() === token
  })
}

function handle(list: File[]): void {
  const accepted: File[] = []

  for (const file of list) {
    let reason: KfUploadRejectReason | null = null
    if (!matchesAccept(file)) reason = 'type'
    else if (props.maxSizeMb > 0 && file.size > props.maxSizeMb * 1024 * 1024) reason = 'size'

    if (!reason && props.maxCount > 0) {
      const projected = props.files.length + accepted.length
      if (projected >= props.maxCount) reason = 'count'
    }

    if (reason) {
      emit('reject', { file, reason })
      continue
    }
    accepted.push(file)
  }

  if (accepted.length === 0) return

  const next: KfUploadFile[] = [
    ...props.files,
    ...accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready' as const,
    })),
  ]

  emit('update:files', next)
  emit('select', accepted)
}

function metaOf(file: KfUploadFile): string {
  if (file.status === 'error') return file.errorText || '上传失败'
  if (file.status === 'uploading') return `上传中 ${progressOf(file)}%`
  if (file.status === 'success') return '已完成'
  return formatFileSize(file.size)
}

function progressOf(file: KfUploadFile): number {
  const raw = file.progress
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  return Math.min(100, Math.max(0, Math.round(raw)))
}
</script>

<style scoped>
.kf-upload {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-upload__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  padding: var(--kf-space-5) var(--kf-space-4);
  border: 1px dashed var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  color: var(--kf-muted-foreground);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--kf-motion-fast) ease, background var(--kf-motion-fast) ease;
}
.kf-upload__zone:hover,
.kf-upload--dragging .kf-upload__zone {
  border-color: var(--kf-primary);
  background: var(--kf-primary-subtle);
}
.kf-upload__zone:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-upload--disabled .kf-upload__zone {
  opacity: 0.6;
  cursor: not-allowed;
}
.kf-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.kf-upload__icon {
  color: var(--kf-primary);
}
.kf-upload__title {
  margin: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
}
.kf-upload__hint {
  margin: 0;
  font-size: var(--kf-fs-xs);
}
.kf-upload__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.kf-upload__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  min-width: 0;
  padding: 5px 8px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  overflow: hidden;
}
.kf-upload__item--error {
  border-color: var(--kf-danger);
}
.kf-upload__file-icon {
  flex: none;
  color: var(--kf-muted-foreground);
}
.kf-upload__file-name {
  flex: 1 1 auto;
  overflow: hidden;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-upload__file-meta {
  flex: none;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-upload__item--error .kf-upload__file-meta {
  color: var(--kf-danger);
}
.kf-upload__action {
  flex: none;
  height: 20px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-primary);
  font-family: inherit;
  font-size: var(--kf-fs-xs);
  cursor: pointer;
}
.kf-upload__action--remove {
  color: var(--kf-muted-foreground);
}
.kf-upload__action:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-upload__action:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-upload__track {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--kf-muted);
}
.kf-upload__bar {
  display: block;
  height: 100%;
  background: var(--kf-primary);
  transition: width var(--kf-motion-base) ease;
}
@media (prefers-reduced-motion: reduce) {
  .kf-upload__zone,
  .kf-upload__bar {
    transition: none;
  }
}
</style>
