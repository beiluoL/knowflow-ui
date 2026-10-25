<template>
  <KfFormField
    :class="($attrs.class as string | undefined)"
    :style="($attrs.style as string | undefined)"
    :control-id="textareaId"
    :label="label"
    :required="required"
    :help="help"
    :error="error"
  >
    <div
      class="kf-textarea"
      :class="{
        'kf-textarea--error': !!error,
        'kf-textarea--disabled': disabled,
        'kf-textarea--readonly': readonly,
      }"
    >
      <textarea
        ref="control"
        v-bind="controlAttrs"
        :id="textareaId"
        class="kf-textarea__control"
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="descriptionId"
        :style="autoResize ? { height: 'auto', minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` } : undefined"
        @input="onInput"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
    </div>
    <template v-if="maxlength && showCount" #meta>
      <span class="kf-textarea__count">{{ count }}/{{ maxlength }}</span>
    </template>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfTextarea — 多行输入。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Textarea.vue。
 * 解耦：去掉 @/ 别名、全局 .kb-field/.kb-textarea 样式表与 global Icon，
 * 改为 KfFormField + scoped + --kf-* 令牌（与 KfInput 共用同一套表单表面）。
 *
 * 与原实现的两处实质差异：
 *   1. **补 IME 保护**：原 Textarea 在 compositionstart→end 期间会把拼音中间态 emit 出去，
 *      而 KfInput 已经做了保护 —— 同一份库里两个输入控件行为不一致，这里统一；
 *   2. autoResize 的高度上限用 Math.max(minHeight, maxHeight) 兜底，避免宿主传反了导致 0 高度。
 */
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'
import KfFormField from '../form-field/KfFormField.vue'
import type { KfTextareaEmits, KfTextareaProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<KfTextareaProps>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  rows: 4,
  showCount: false,
  required: false,
  disabled: false,
  readonly: false,
  autoResize: false,
  minHeight: 96,
  maxHeight: 320,
})

const emit = defineEmits<KfTextareaEmits>()
const attrs = useAttrs()

const controlAttrs = computed<Record<string, unknown>>(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !['class', 'style', 'id', 'aria-describedby'].includes(key)),
  ),
)

const generatedId = `kf-textarea-${useId()}`
const textareaId = computed(() => String(attrs.id ?? generatedId))
const descriptionId = computed(
  () =>
    [
      attrs['aria-describedby'],
      props.help ? `${textareaId.value}-help` : undefined,
      props.error ? `${textareaId.value}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
)

const control = ref<HTMLTextAreaElement | null>(null)
const composing = ref(false)
const count = computed(() => props.modelValue.length)

function onInput(event: Event): void {
  if (composing.value) return
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  if (props.autoResize) void nextTick(resize)
}

function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  if (props.autoResize) void nextTick(resize)
}

function resize(): void {
  const el = control.value
  if (!el || !props.autoResize) return
  const ceiling = Math.max(props.minHeight, props.maxHeight)
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, ceiling)}px`
  el.style.overflowY = el.scrollHeight > ceiling ? 'auto' : 'hidden'
}

watch(
  () => props.modelValue,
  () => {
    if (props.autoResize) void nextTick(resize)
  },
)

onMounted(() => {
  if (props.autoResize) resize()
})
</script>

<style scoped>
/* 与 KfInput 同一套表面：浅灰底 + 圆角，内部控件透明、无边框 */
.kf-textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 10px var(--kf-field-padding, 12px);
  border: 0;
  border-radius: var(--kf-field-radius, 10px);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  transition: background-color var(--kf-control-motion, 160ms) ease;
}
.kf-textarea:hover:not(.kf-textarea--disabled) {
  background: var(--kf-field-hover);
}
.kf-textarea:focus-within {
  background: var(--kf-field-active);
}
.kf-textarea--error {
  background: var(--kf-field-error-bg);
}
.kf-textarea--disabled {
  background: var(--kf-field-disabled);
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-textarea__control {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  resize: vertical;
  outline: 0;
  appearance: none;
}
.kf-textarea--disabled .kf-textarea__control {
  cursor: not-allowed;
  resize: none;
}
.kf-textarea__control::placeholder {
  color: var(--kf-field-placeholder);
  opacity: 1;
}
.kf-textarea__count {
  display: block;
  margin-top: var(--kf-space-1);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
@media (forced-colors: active) {
  .kf-textarea:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-textarea {
    transition: none;
  }
}
</style>
