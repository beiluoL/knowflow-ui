<template>
  <KfFormField
    :control-id="inputId"
    :label="label"
    :required="false"
    :help="help"
    :error="error"
  >
    <div
      class="kf-tags-input"
      :class="{ 'kf-tags-input--error': !!error, 'kf-tags-input--disabled': disabled }"
      @click="focusInput"
    >
      <span v-for="tag in modelValue" :key="tag" class="kf-tags-input__tag">
        <span class="kf-tags-input__tag-label">{{ tag }}</span>
        <button
          type="button"
          class="kf-tags-input__remove"
          :aria-label="`移除 ${tag}`"
          :disabled="disabled || readonly"
          @click.stop="remove(tag)"
        >
          <KfIcon name="x" :size="12" aria-hidden="true" />
        </button>
      </span>
      <input
        :id="inputId"
        ref="control"
        class="kf-tags-input__control"
        type="text"
        autocomplete="off"
        :value="draft"
        :placeholder="modelValue.length ? '' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-label="ariaLabel || label || undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="descriptionId"
        @input="draft = ($event.target as HTMLInputElement).value"
        @keydown="onKeydown"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
        @blur="onBlur"
      />
    </div>
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfTagsInput — 标签输入。
 *
 * 对应 V5 的 TagsInput 条目（原项目只有 Demo）。
 * 三个真实场景的坑都处理了：
 *   1. **中文输入法**：composition 期间按 Enter 是「选词」不是「提交标签」，
 *      否则用拼音输入「学习」会先提交一个 "xuexi"；
 *   2. 去重：默认拒绝重复标签，避免同一标签出现两次（宿主再按 value 做 key 就出重复 key）；
 *   3. 空输入按 Backspace 删最后一个 —— 这是标签输入的通用肌肉记忆。
 */
import { computed, ref, useId } from 'vue'
import KfFormField from '../form-field/KfFormField.vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfTagsInputEmits, KfTagsInputProps } from './types'

const props = withDefaults(defineProps<KfTagsInputProps>(), {
  modelValue: () => [],
  placeholder: '输入后按 Enter 添加',
  label: '',
  help: '',
  error: '',
  disabled: false,
  readonly: false,
  max: Infinity,
  allowDuplicates: false,
  addOnBlur: true,
  ariaLabel: '',
})

const emit = defineEmits<KfTagsInputEmits>()

const inputId = `kf-tags-input-${useId()}`
const descriptionId = computed(
  () =>
    [props.help ? `${inputId}-help` : undefined, props.error ? `${inputId}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)

const control = ref<HTMLInputElement | null>(null)
const draft = ref('')
const composing = ref(false)

function focusInput(): void {
  if (props.disabled || props.readonly) return
  control.value?.focus()
}

function commitDraft(): void {
  const value = draft.value.trim()
  if (!value) {
    draft.value = ''
    return
  }
  if (props.modelValue.length >= props.max) {
    draft.value = ''
    return
  }
  const exists = props.modelValue.includes(value)
  if (exists && !props.allowDuplicates) {
    draft.value = ''
    return
  }
  const next = [...props.modelValue, value]
  draft.value = ''
  emit('update:modelValue', next)
  emit('add', value)
}

function remove(tag: string): void {
  if (props.disabled || props.readonly) return
  const next = props.modelValue.filter((item) => item !== tag)
  emit('update:modelValue', next)
  emit('remove', tag)
}

function onKeydown(event: KeyboardEvent): void {
  if (composing.value) return
  if (event.key === 'Enter') {
    event.preventDefault()
    commitDraft()
    return
  }
  if (event.key === 'Backspace' && draft.value === '' && props.modelValue.length) {
    event.preventDefault()
    remove(props.modelValue[props.modelValue.length - 1])
  }
}

function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  draft.value = (event.target as HTMLInputElement).value
}

function onBlur(): void {
  if (props.addOnBlur) commitDraft()
}
</script>

<style scoped>
.kf-tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: var(--kf-input-height);
  padding: 6px var(--kf-space-3);
  border: 0;
  border-radius: var(--kf-field-radius);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  cursor: text;
  transition: background-color var(--kf-control-motion) ease;
}
.kf-tags-input:focus-within {
  background: var(--kf-field-active);
}
.kf-tags-input--error {
  background: var(--kf-field-error-bg);
}
.kf-tags-input--disabled {
  background: var(--kf-field-disabled);
  cursor: not-allowed;
}
.kf-tags-input__tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
  height: 24px;
  padding: 0 4px 0 8px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-caption);
  line-height: 1.5;
}
.kf-tags-input__tag-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kf-tags-input__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  cursor: pointer;
}
.kf-tags-input__remove:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-tags-input__remove:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-tags-input__control {
  flex: 1;
  min-width: 80px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  outline: 0;
}
.kf-tags-input__control::placeholder {
  color: var(--kf-field-placeholder);
  opacity: 1;
}
@media (forced-colors: active) {
  .kf-tags-input:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-tags-input {
    transition: none;
  }
}
</style>
