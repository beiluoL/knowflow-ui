<template>
  <label
    class="kf-radio"
    :class="[`kf-radio--${size}`, { 'kf-radio--disabled': isDisabled, 'kf-radio--checked': isChecked }]"
  >
    <span class="kf-radio__box" aria-hidden="true">
      <input
        class="kf-radio__input"
        type="radio"
        :name="radioName"
        :value="String(value)"
        :checked="isChecked"
        :disabled="isDisabled"
        :aria-checked="isChecked"
        @change="onChange"
      />
      <span class="kf-radio__dot" />
    </span>
    <span v-if="label || $slots.default" class="kf-radio__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup lang="ts">
/**
 * KfRadio — 单选。
 *
 * 对应 V5 的 Radio 条目（原项目只有 ReferenceDemos 里的裸 input 参考，无生产组件）。
 * 设计取舍与 KfCheckbox 一致：**原生 input 承担语义与键盘**（方向键在同名 radio 间移动、
 * Space 选中、可被表单提交），视觉层只是覆盖在上面的自定义圆环；
 * 焦点环画在可见圆环上，不使用全局 outline:none。
 *
 * 既支持独立使用（modelValue），也支持包在 KfRadioGroup 里（从注入上下文读值）。
 */
import { computed, inject } from 'vue'
import { KF_RADIO_GROUP } from './context'
import type { KfRadioEmits, KfRadioProps } from './types'

const props = withDefaults(defineProps<KfRadioProps>(), {
  label: '',
  disabled: false,
  modelValue: undefined,
  name: '',
  size: undefined,
})

const emit = defineEmits<KfRadioEmits>()
const group = inject(KF_RADIO_GROUP, null)

const isDisabled = computed(() => props.disabled || !!group?.disabled.value)
const size = computed(() => props.size ?? group?.size.value ?? 'md')
const radioName = computed(() => props.name || group?.name.value || undefined)

const isChecked = computed(() => {
  const current = group ? group.modelValue.value : props.modelValue
  return current === props.value
})

function onChange(event: Event): void {
  if (isDisabled.value) return
  if (group) group.select(props.value)
  else emit('update:modelValue', props.value)
  emit('change', props.value, event)
}
</script>

<style scoped>
.kf-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-space-2);
  min-height: var(--kf-checkbox-hit-size);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  color: var(--kf-foreground);
  cursor: pointer;
}
.kf-radio--disabled {
  color: var(--kf-muted-foreground);
  cursor: not-allowed;
}
.kf-radio__box {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--kf-checkbox-size);
  height: var(--kf-checkbox-size);
  border: var(--kf-checkbox-border-width) solid var(--kf-border);
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
  transition: border-color var(--kf-motion-fast) ease, background-color var(--kf-motion-fast) ease;
}
.kf-radio__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.kf-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--kf-radius-full);
  background: var(--kf-primary-foreground);
  transform: scale(0);
  transition: transform var(--kf-motion-fast) ease;
}
.kf-radio--checked .kf-radio__box {
  border-color: var(--kf-primary);
  background: var(--kf-primary);
}
.kf-radio--checked .kf-radio__dot {
  transform: scale(1);
}
.kf-radio--disabled .kf-radio__box {
  background: var(--kf-muted);
  border-color: var(--kf-border);
}
.kf-radio--disabled.kf-radio--checked .kf-radio__box {
  background: color-mix(in srgb, var(--kf-primary) 45%, var(--kf-card));
  border-color: transparent;
}
.kf-radio:hover:not(.kf-radio--disabled) .kf-radio__box {
  border-color: var(--kf-primary);
}
.kf-radio__box:has(.kf-radio__input:focus-visible) {
  outline: var(--kf-focus-ring-width) solid var(--kf-primary);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-radio__label {
  min-width: 0;
}
@media (prefers-reduced-motion: reduce) {
  .kf-radio__box,
  .kf-radio__dot {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-radio__box {
    border-color: CanvasText;
  }
  .kf-radio--checked .kf-radio__box {
    background: Highlight;
  }
}
</style>
