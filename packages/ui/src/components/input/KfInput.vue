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
      class="kf-input"
      :class="{ 'kf-input--error': !!error, 'kf-input--disabled': disabled, 'kf-input--readonly': readonly }"
    >
      <slot name="prefix">
        <KfIcon v-if="prefixIconName" :name="prefixIconName" :size="16" class="kf-input__icon" />
      </slot>
      <input
        v-bind="controlAttrs"
        :id="inputId"
        class="kf-input__control"
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
      <slot name="suffix">
        <KfIcon v-if="suffixIconName" :name="suffixIconName" :size="16" class="kf-input__icon" />
      </slot>
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
 *
 * 类名：.kf-input（表面）/ .kf-input__control（原生 input）/ .kf-input__icon（前后置图标），
 * 修饰符 .kf-input--error / --disabled / --readonly。
 */
import { computed, ref, useAttrs, useId } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import KfFormField from '../form-field/KfFormField.vue'
import type { KfInputEmits, KfInputProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<KfInputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<KfInputEmits>()

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
.kf-input {
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
.kf-input:hover:not(.kf-input--disabled) {
  background: var(--kf-field-hover);
}
.kf-input:focus-within {
  background: var(--kf-field-active);
  box-shadow: none;
  outline: 0;
}
.kf-input.kf-input--error {
  background: var(--kf-field-error-bg);
}
.kf-input.kf-input--disabled {
  background: var(--kf-field-disabled);
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-input__icon {
  flex: none;
  color: var(--kf-muted-foreground);
  pointer-events: none;
}
.kf-input__control {
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
.kf-input__control:focus,
.kf-input__control:focus-visible {
  border: 0;
  outline: 0;
  box-shadow: none;
}
.kf-input__control::placeholder {
  color: var(--kf-field-placeholder, #6b7280);
  opacity: 1;
}
.kf-input--disabled .kf-input__control {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-input__control[readonly] {
  cursor: text;
}
@media (forced-colors: active) {
  .kf-input:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kf-input {
    transition: none;
  }
}
</style>
