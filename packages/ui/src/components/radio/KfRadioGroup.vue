<template>
  <div
    class="kf-radio-group"
    :class="[`kf-radio-group--${direction}`, { 'kf-radio-group--disabled': disabled }]"
    role="radiogroup"
    :aria-label="label || undefined"
    :aria-required="required || undefined"
    :aria-disabled="disabled || undefined"
  >
    <span v-if="label" class="kf-radio-group__label">{{ label }}</span>
    <div class="kf-radio-group__options">
      <KfRadio
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :label="option.label"
        :disabled="option.disabled"
        :size="size"
      />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KfRadioGroup — 单选组容器。
 *
 * 用 provide 把「当前值 / name / 禁用 / 尺寸」传给子 KfRadio，子项只负责渲染，
 * 不各自维护一份状态 —— 避免宿主忘记同步 name 导致方向键跨组窜跳。
 */
import { computed, provide, ref, useId, watch } from 'vue'
import KfRadio from './KfRadio.vue'
import { KF_RADIO_GROUP } from './context'
import type { KfRadioGroupEmits, KfRadioGroupProps } from './types'

const props = withDefaults(defineProps<KfRadioGroupProps>(), {
  modelValue: undefined,
  options: () => [],
  name: '',
  disabled: false,
  direction: 'vertical',
  size: 'md',
  label: '',
  required: false,
})

const emit = defineEmits<KfRadioGroupEmits>()

const groupName = computed(() => props.name || `kf-radio-${useId()}`)
const model = ref(props.modelValue)
watch(
  () => props.modelValue,
  (value) => {
    model.value = value
  },
)

provide(KF_RADIO_GROUP, {
  modelValue: model,
  name: groupName,
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  select: (value: string | number | boolean) => {
    if (props.disabled) return
    model.value = value
    emit('update:modelValue', value)
    emit('change', value)
  },
})
</script>

<style scoped>
.kf-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-1);
  font-family: var(--kf-font-sans);
  min-width: 0;
}
.kf-radio-group__label {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
  line-height: var(--kf-lh-body-sm);
}
.kf-radio-group__options {
  display: flex;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-radio-group--vertical .kf-radio-group__options {
  flex-direction: column;
}
.kf-radio-group--horizontal .kf-radio-group__options {
  flex-flow: row wrap;
  gap: var(--kf-space-4);
}
</style>
