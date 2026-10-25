<template>
  <div class="kf-chat-composer" :class="{ 'kf-chat-composer--disabled': disabled, 'kf-chat-composer--busy': busy }">
    <ul v-if="attachments.length" class="kf-chat-composer__attachments">
      <li
        v-for="file in attachments"
        :key="file.id"
        class="kf-chat-composer__attachment"
        :class="`kf-chat-composer__attachment--${file.status || 'ready'}`"
      >
        <KfIcon name="file-text" :size="14" class="kf-chat-composer__attachment-icon" aria-hidden="true" />
        <span class="kf-chat-composer__attachment-name">{{ file.name }}</span>
        <span v-if="file.size !== undefined" class="kf-chat-composer__attachment-size">{{ formatSize(file.size) }}</span>
        <button
          type="button"
          class="kf-chat-composer__attachment-remove"
          :aria-label="`移除 ${file.name}`"
          @click="emit('removeAttachment', file.id)"
        >
          <KfIcon name="x" :size="12" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <p v-if="error" class="kf-chat-composer__error" role="alert">{{ error }}</p>

    <textarea
      ref="control"
      class="kf-chat-composer__input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength || undefined"
      :aria-label="ariaLabel || placeholder"
      :aria-busy="busy || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :style="{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }"
      rows="1"
      @input="onInput"
      @compositionstart="composing = true"
      @compositionend="onCompositionEnd"
      @keydown="onKeydown"
    />

    <div class="kf-chat-composer__bar">
      <div class="kf-chat-composer__tools">
        <slot name="toolbar">
          <button
            v-if="showAttach"
            type="button"
            class="kf-chat-composer__icon-button"
            aria-label="添加附件"
            :disabled="disabled || busy"
            @click="emit('attach')"
          >
            <KfIcon name="file-plus" :size="16" aria-hidden="true" />
          </button>
        </slot>
      </div>

      <div class="kf-chat-composer__actions">
        <span v-if="maxLength" class="kf-chat-composer__count" :class="{ 'kf-chat-composer__count--over': count >= maxLength }">
          {{ count }}/{{ maxLength }}
        </span>
        <button
          v-if="busy && stoppable"
          type="button"
          class="kf-chat-composer__send kf-chat-composer__send--stop"
          aria-label="停止生成"
          @click="emit('stop')"
        >
          <KfIcon name="square" :size="14" aria-hidden="true" />
          <span class="kf-chat-composer__send-label">停止</span>
        </button>
        <button
          v-else
          type="button"
          class="kf-chat-composer__send"
          :disabled="disabled || busy || !canSubmit"
          aria-label="发送"
          @click="submit"
        >
          <KfIcon name="send" :size="14" aria-hidden="true" />
          <span class="kf-chat-composer__send-label">发送</span>
        </button>
      </div>
    </div>

    <div v-if="$slots.hint || hint" class="kf-chat-composer__hint">
      <slot name="hint">{{ hint }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfChatComposer — 对话输入区（纯 UI）。
 *
 * 迁移自 KnowFlow frontend/src/components/ai/AIComposer.vue 的输入契约，
 * 但剥离了模型选择、知识库开关等业务状态：那些通过 #toolbar 插槽由宿主提供。
 * 组件只负责：受控文本、IME 保护、Enter 提交 / Shift+Enter 换行、自动撑高、附件列表展示。
 * **不发请求**，submit 只是意图信号；清空草稿由宿主决定（失败时保留内容更合理）。
 */
import { computed, nextTick, ref, watch } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfChatComposerEmits, KfChatComposerProps } from './types'

const props = withDefaults(defineProps<KfChatComposerProps>(), {
  modelValue: '',
  placeholder: '输入你的问题…',
  disabled: false,
  busy: false,
  stoppable: true,
  maxLength: 0,
  minHeight: 44,
  maxHeight: 160,
  showAttach: true,
  attachments: () => [],
  hint: '',
  ariaLabel: '',
  error: '',
})

const emit = defineEmits<KfChatComposerEmits>()

const control = ref<HTMLTextAreaElement | null>(null)
const composing = ref(false)

const count = computed(() => props.modelValue.length)
const canSubmit = computed(() => props.modelValue.trim().length > 0)

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function resize(): void {
  const el = control.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(Math.max(el.scrollHeight, props.minHeight), props.maxHeight)}px`
  el.style.overflowY = el.scrollHeight > props.maxHeight ? 'auto' : 'hidden'
}

function onInput(event: Event): void {
  if (composing.value) return
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  void nextTick(resize)
}

function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  void nextTick(resize)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter') return
  // 中文输入法选词时的 Enter 不能触发发送
  if (composing.value || (event as KeyboardEvent & { isComposing?: boolean }).isComposing) return
  if (event.shiftKey) return
  event.preventDefault()
  submit()
}

function submit(): void {
  if (props.disabled || props.busy || !canSubmit.value) return
  emit('submit', props.modelValue)
}

watch(
  () => props.modelValue,
  () => void nextTick(resize),
)

defineExpose({ focus: () => control.value?.focus() })
</script>

<style scoped>
.kf-chat-composer {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: var(--kf-space-2) var(--kf-space-3);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  font-family: var(--kf-font-sans);
  transition: border-color var(--kf-motion-fast) ease;
}
.kf-chat-composer:focus-within {
  border-color: var(--kf-primary);
}
.kf-chat-composer--disabled {
  background: var(--kf-muted);
}
.kf-chat-composer__error {
  margin: 0;
  color: var(--kf-destructive);
  font-size: var(--kf-fs-caption);
  line-height: 1.5;
}
.kf-chat-composer__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.kf-chat-composer__attachment {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  height: 24px;
  padding: 0 4px 0 7px;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-muted);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-chat-composer__attachment--error {
  color: var(--kf-danger);
}
.kf-chat-composer__attachment--uploading {
  color: var(--kf-muted-foreground);
}
.kf-chat-composer__attachment-icon {
  flex: none;
}
.kf-chat-composer__attachment-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-chat-composer__attachment-size {
  flex: none;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-chat-composer__attachment-remove {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.kf-chat-composer__attachment-remove:hover {
  background: var(--kf-card);
}
.kf-chat-composer__input {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  resize: none;
  outline: 0;
}
.kf-chat-composer__input::placeholder {
  color: var(--kf-field-placeholder);
  opacity: 1;
}
.kf-chat-composer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2);
}
.kf-chat-composer__tools,
.kf-chat-composer__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-chat-composer__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-chat-composer__icon-button:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-chat-composer__icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-chat-composer__count {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  font-variant-numeric: tabular-nums;
}
.kf-chat-composer__count--over {
  color: var(--kf-danger);
}
.kf-chat-composer__send {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--kf-radius-sm);
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-chat-composer__send:hover:not(:disabled) {
  background: var(--kf-primary-hover);
}
.kf-chat-composer__send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kf-chat-composer__send--stop {
  background: var(--kf-card);
  border: 1px solid var(--kf-border);
  color: var(--kf-foreground);
}
.kf-chat-composer__send--stop:hover {
  background: var(--kf-muted);
}
.kf-chat-composer__send:focus-visible,
.kf-chat-composer__icon-button:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-chat-composer__hint {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
@media (prefers-reduced-motion: reduce) {
  .kf-chat-composer {
    transition: none;
  }
}
</style>
