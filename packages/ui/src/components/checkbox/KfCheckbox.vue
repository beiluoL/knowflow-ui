<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :for="as === 'label' ? controlId : undefined"
    :class="[
      'kf-checkbox',
      ($attrs.class as string | undefined),
      { 'kf-checkbox--disabled': disabled, 'kf-checkbox--embedded': as === 'span' },
    ]"
    :style="($attrs.style as string | undefined)"
  >
    <span class="kf-checkbox-box" :class="{ 'kf-checkbox-box-mixed': indeterminate }">
      <input
        v-bind="inputAttrs"
        :id="controlId"
        v-model="model"
        type="checkbox"
        class="kf-checkbox-input"
        :value="value === undefined ? 'on' : value"
        :true-value="trueValue === undefined ? true : trueValue"
        :false-value="falseValue === undefined ? false : falseValue"
        :indeterminate.prop="indeterminate"
        :disabled="disabled"
        :aria-checked="indeterminate ? 'mixed' : undefined"
        @change="handleChange"
      />
      <KfIcon
        v-if="indeterminate"
        name="minus"
        :size="14"
        class="kf-checkbox-mark"
        aria-hidden="true"
      />
      <KfIcon v-else name="check" :size="14" class="kf-checkbox-mark kf-checkbox-check" aria-hidden="true" />
    </span>
    <span v-if="label || $slots.default" class="kf-checkbox-label"><slot>{{ label }}</slot></span>
  </component>
</template>

<script setup lang="ts" generic="T = boolean">
/**
 * KfCheckbox — 迁移自 KnowFlow frontend/src/components/ui/Checkbox.vue
 *
 * 视觉：20×20 正方形、3px 微圆角、品牌蓝选中、白色 Check、无默认灰影、
 *      与文字 8px 间距、整行可点（默认渲染 <label>）。
 * 语义：原生 input 承担键盘与表单语义（Tab / Space / 表单提交），
 *      焦点环只画在可见方框上，不使用全局 outline:none。
 */
import { computed, useAttrs, useId } from 'vue'
import KfIcon from '../icon/KfIcon.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** v-model 值；数组/Set 场景由原生 checkbox 语义处理 */
    modelValue?: T
    /** 受控 checked（优先于 modelValue），用于纯展示态 */
    checked?: boolean
    label?: string
    disabled?: boolean
    /** 半选态：视觉显示横线，并设置 aria-checked="mixed" */
    indeterminate?: boolean
    /** 原生 value（数组收集时使用） */
    value?: unknown
    trueValue?: unknown
    falseValue?: unknown
    modelModifiers?: Record<string, boolean>
    /** label：整行可点（默认）；span：嵌入列表行时避免嵌套 label */
    as?: 'label' | 'span'
  }>(),
  { checked: undefined, label: '', disabled: false, indeterminate: false, as: 'label' },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [checked: boolean]
  'native-change': [event: Event]
}>()

const attrs = useAttrs()
const generatedId = `kf-checkbox-${useId()}`
const controlId = computed(() => (typeof attrs.id === 'string' ? attrs.id : generatedId))

/** data-* 落在根节点（便于 e2e 定位），其余属性透传给原生 input */
const rootAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-'))),
)
const inputAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !['class', 'style', 'id'].includes(key) && !key.startsWith('data-')),
  ),
)

const model = computed<unknown>({
  get: () => (props.checked !== undefined ? props.checked : (props.modelValue ?? false)),
  set: (value) => {
    if (!props.disabled) emit('update:modelValue', value as T)
  },
})

function handleChange(event: Event) {
  if (props.disabled) return
  emit('change', (event.target as HTMLInputElement).checked)
  emit('native-change', event)
}
</script>

<style scoped>
.kf-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--kf-checkbox-gap, 8px);
  min-height: var(--kf-checkbox-hit-size, 32px);
  min-width: var(--kf-checkbox-hit-size, 32px);
  max-width: 100%;
  margin: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  filter: none;
  cursor: pointer;
  user-select: none;
  font-size: var(--kf-fs-body-md, 14px);
  font-weight: 400;
  line-height: var(--kf-lh-body-md, 1.571429);
}
.kf-checkbox--embedded {
  min-width: var(--kf-checkbox-size, 20px);
  min-height: var(--kf-checkbox-size, 20px);
}

.kf-checkbox-box {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--kf-checkbox-size, 20px);
  height: var(--kf-checkbox-size, 20px);
  border: var(--kf-checkbox-border-width, 1px) solid var(--kf-border);
  border-radius: var(--kf-checkbox-radius, 3px);
  background: var(--kf-card);
  box-shadow: none;
  filter: none;
  outline: 0;
  transition:
    border-color var(--kf-control-motion, 160ms),
    background-color var(--kf-control-motion, 160ms);
}
.kf-checkbox-box:has(input:checked),
.kf-checkbox-box-mixed {
  background: var(--kf-primary);
  border-color: var(--kf-primary);
}

/* 原生 input 透明覆盖在方框上：保留 Tab/Space/表单提交，视觉由方框承担 */
.kf-checkbox-input,
.kf-checkbox-input:focus,
.kf-checkbox-input:focus-visible {
  position: absolute;
  inset: 0;
  opacity: 0;
  appearance: none;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  box-shadow: none;
  filter: none;
  outline: 0;
  cursor: inherit;
}

.kf-checkbox-mark {
  width: var(--kf-checkbox-mark-size, 14px);
  height: var(--kf-checkbox-mark-size, 14px);
  flex: none;
  display: block;
  color: var(--kf-primary-foreground);
  pointer-events: none;
}
.kf-checkbox-check {
  visibility: hidden;
}
.kf-checkbox-box:has(input:checked) > .kf-checkbox-check {
  visibility: visible;
}

.kf-checkbox-label {
  min-width: 0;
  font-size: var(--kf-fs-body-md, 14px);
  font-weight: 400;
  line-height: var(--kf-lh-body-md, 1.571429);
  color: var(--kf-foreground);
  overflow-wrap: anywhere;
}

.kf-checkbox:hover:not(.kf-checkbox--disabled) .kf-checkbox-box {
  border-color: var(--kf-primary);
}

/* 键盘焦点只画在可见方框上；鼠标点击不出现焦点环 */
.kf-checkbox-box:has(input:focus-visible:not(:disabled)) {
  outline: var(--kf-checkbox-focus-width, 2px) solid var(--kf-primary);
  outline-offset: var(--kf-checkbox-focus-offset, 2px);
  box-shadow: none;
}

.kf-checkbox--disabled {
  cursor: not-allowed;
}
.kf-checkbox--disabled .kf-checkbox-box {
  background: var(--kf-muted);
  border-color: var(--kf-border);
}
.kf-checkbox--disabled .kf-checkbox-box:has(input:checked),
.kf-checkbox--disabled .kf-checkbox-box-mixed {
  background: var(--kf-muted-foreground);
  border-color: var(--kf-muted-foreground);
}
.kf-checkbox--disabled .kf-checkbox-label {
  color: var(--kf-muted-foreground);
}

@media (pointer: coarse) {
  .kf-checkbox {
    min-height: var(--kf-checkbox-touch-size, 44px);
    min-width: var(--kf-checkbox-touch-size, 44px);
  }
  .kf-checkbox--embedded {
    min-width: var(--kf-checkbox-size, 20px);
    min-height: var(--kf-checkbox-size, 20px);
  }
}

@media (forced-colors: active) {
  .kf-checkbox-box {
    forced-color-adjust: none;
    background: Canvas;
    border-color: CanvasText;
  }
  .kf-checkbox-box:has(input:checked),
  .kf-checkbox-box-mixed {
    background: Highlight;
    border-color: Highlight;
  }
  .kf-checkbox-mark {
    color: HighlightText;
  }
  .kf-checkbox-box:has(input:focus-visible) {
    outline: var(--kf-checkbox-focus-width, 2px) solid Highlight;
    outline-offset: var(--kf-checkbox-focus-offset, 2px);
  }
  .kf-checkbox--disabled .kf-checkbox-box {
    border-color: GrayText;
  }
  .kf-checkbox--disabled .kf-checkbox-label {
    color: GrayText;
  }
}
</style>
