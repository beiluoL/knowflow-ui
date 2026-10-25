<template>
  <KfFormField
    :class="($attrs.class as string | undefined)"
    :style="($attrs.style as string | undefined)"
    :control-id="inputId"
    :label="label"
    :required="required"
    :help="help"
    :error="error"
  >
    <div
      class="kf-field"
      :class="{ 'kf-field--error': !!error, 'kf-field--disabled': disabled, 'kf-field--readonly': readonly }"
    >
      <KfIcon v-if="prefixIconName" :name="prefixIconName" :size="16" class="kf-field__icon" />
      <input
        v-bind="controlAttrs"
        :id="inputId"
        class="kf-input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="descriptionId"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      <KfIcon v-if="suffixIconName" :name="suffixIconName" :size="16" class="kf-field__icon" />
    </div>
  </KfFormField>
</template>

<script setup lang="ts">
/**
 * KfInput — 迁移自 KnowFlow frontend/src/components/ui/Input.vue
 *
 * 迁移中移除的耦合：@/ 别名、Tailwind 原子类（px-3 py-2 text-sm …）、
 * 全局 .kb-field/.kb-input 样式表、global Icon。样式改为组件内 scoped + --kf-* 令牌。
 *
 * 保留的契约：v-model、label/error/help 关联、前后置图标、属性透传、
 * 原生语义（disabled/readonly/required/aria-invalid/aria-describedby）、
 * 输入法组合期不把中间态推给父组件。
 */
import { computed, ref, useAttrs, useId } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import KfFormField from '../form-field/KfFormField.vue'
import type { BuiltinIconName } from '../icon/registry'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** v-model 值 */
    modelValue?: string | number
    /** 原生 input type */
    type?: string
    placeholder?: string
    /** 字段标签，同时作为 label 关联文本 */
    label?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** 辅助说明（关联 aria-describedby） */
    help?: string
    /** 错误信息（设置 aria-invalid + aria-describedby） */
    error?: string
    prefixIconName?: BuiltinIconName | (string & {})
    suffixIconName?: BuiltinIconName | (string & {})
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()

/** class/style/id/aria-describedby 由组件控制，其余原生属性透传给 input */
const controlAttrs = computed<Record<string, unknown>>(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([key]) => !['class', 'style', 'id', 'aria-describedby'].includes(key),
    ),
  ),
)

const generatedId = `kf-input-${useId()}`
const inputId = computed(() => String(attrs.id ?? generatedId))
const descriptionId = computed(
  () =>
    [
      attrs['aria-describedby'],
      props.help ? `${inputId.value}-help` : undefined,
      props.error ? `${inputId.value}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
)

/** IME 组合输入期间不向外 emit，避免拼音字母被写进 v-model */
const composing = ref(false)

function onInput(event: Event) {
  if (composing.value) return
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onCompositionStart() {
  composing.value = true
}

function onCompositionEnd(event: CompositionEvent) {
  composing.value = false
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
/* 浅灰表面承载背景与圆角，内部 input 透明；聚焦不新增 border/outline/ring */
.kf-field {
  display: flex;
  align-items: center;
  gap: var(--kf-space-3, 12px);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: var(--kf-input-height, 44px);
  padding-inline: var(--kf-field-padding, 12px);
  border: 0;
  border-radius: var(--kf-field-radius, 10px);
  background: var(--kf-field-surface, #e8ecf1);
  color: var(--kf-foreground);
  transition: background-color var(--kf-control-motion, 160ms) ease;
}
.kf-field:hover:not(.kf-field--disabled) {
  background: var(--kf-field-hover);
}
.kf-field:focus-within {
  background: var(--kf-field-active);
  box-shadow: none;
  outline: 0;
}
.kf-field.kf-field--error {
  background: var(--kf-field-error-bg);
}
.kf-field.kf-field--disabled {
  background: var(--kf-field-disabled);
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-field__icon {
  flex: none;
  color: var(--kf-muted-foreground);
  pointer-events: none;
}
.kf-input {
  display: block;
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md, 14px);
  line-height: var(--kf-lh-body-md, 1.571429);
  box-shadow: none;
  outline: 0;
  appearance: none;
}
/* 仅移除「输入框自带」的聚焦框；键盘可达性由父级 :focus-within 表面反馈承载 */
.kf-input:focus,
.kf-input:focus-visible {
  border: 0;
  outline: 0;
  box-shadow: none;
}
.kf-input::placeholder {
  color: var(--kf-field-placeholder, #6b7280);
  opacity: 1;
}
.kf-field--disabled .kf-input {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-input[readonly] {
  cursor: text;
}
@media (forced-colors: active) {
  .kf-field:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-field {
    transition: none;
  }
}
</style>
