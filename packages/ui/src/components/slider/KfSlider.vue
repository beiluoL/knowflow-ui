<template>
  <div class="kf-slider" :class="{ 'kf-slider--disabled': disabled }">
    <div v-if="label || showValue || $slots.value" class="kf-slider__header">
      <span class="kf-slider__label">{{ label }}</span>
      <span class="kf-slider__value">
        <slot name="value">{{ clamped }}{{ suffix }}</slot>
      </span>
    </div>
    <input
      class="kf-slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="clamped"
      :disabled="disabled"
      :aria-label="ariaLabel || label || undefined"
      :aria-valuetext="`${clamped}${suffix}`"
      :style="{ '--kf-slider-pct': `${percent}%` }"
      @input="onInput"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * KfSlider — 滑块。
 *
 * 对应 V5 的 Slider 条目（原项目只有 Demo，直接用了原生 range 但没有任何样式与状态）。
 * 关键取舍：**保留原生 input[type=range]**。范围控件的键盘步进、读屏播报、
 * 触摸拖拽都由浏览器实现，自己用 div 重写只会丢能力。视觉层用 appearance:none 重绘轨道与滑块。
 */
import { computed } from 'vue'
import type { KfSliderEmits, KfSliderProps } from './types'

const props = withDefaults(defineProps<KfSliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  label: '',
  showValue: false,
  suffix: '',
  ariaLabel: '',
})

const emit = defineEmits<KfSliderEmits>()

const clamped = computed(() => {
  const value = Number(props.modelValue)
  if (Number.isNaN(value)) return props.min
  return Math.min(props.max, Math.max(props.min, value))
})

const percent = computed(() => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return ((clamped.value - props.min) / span) * 100
})

function onInput(event: Event): void {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}

function onChange(event: Event): void {
  emit('change', Number((event.target as HTMLInputElement).value))
}
</script>

<style scoped>
.kf-slider {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-slider__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--kf-space-2);
}
.kf-slider__label {
  min-width: 0;
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-sm);
  font-weight: var(--kf-fw-label);
}
.kf-slider__value {
  flex: none;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
  font-variant-numeric: tabular-nums;
}
.kf-slider__input {
  box-sizing: border-box;
  width: 100%;
  height: var(--kf-slider-thumb);
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
}
.kf-slider__input::-webkit-slider-runnable-track {
  height: var(--kf-slider-track);
  border-radius: var(--kf-radius-full);
  background: linear-gradient(
    to right,
    var(--kf-primary) 0%,
    var(--kf-primary) var(--kf-slider-pct, 0%),
    var(--kf-muted) var(--kf-slider-pct, 0%),
    var(--kf-muted) 100%
  );
}
.kf-slider__input::-moz-range-track {
  height: var(--kf-slider-track);
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
}
.kf-slider__input::-moz-range-progress {
  height: var(--kf-slider-track);
  border-radius: var(--kf-radius-full);
  background: var(--kf-primary);
}
.kf-slider__input::-webkit-slider-thumb {
  box-sizing: border-box;
  width: var(--kf-slider-thumb);
  height: var(--kf-slider-thumb);
  margin-top: calc((var(--kf-slider-track) - var(--kf-slider-thumb)) / 2);
  border: 2px solid var(--kf-primary);
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
  appearance: none;
  transition: box-shadow var(--kf-motion-fast) ease;
}
.kf-slider__input::-moz-range-thumb {
  box-sizing: border-box;
  width: var(--kf-slider-thumb);
  height: var(--kf-slider-thumb);
  border: 2px solid var(--kf-primary);
  border-radius: var(--kf-radius-full);
  background: var(--kf-card);
}
.kf-slider__input:hover::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px var(--kf-primary-soft);
}
.kf-slider__input:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
  border-radius: var(--kf-radius-full);
}
.kf-slider--disabled .kf-slider__input {
  cursor: not-allowed;
  opacity: 0.5;
}
@media (prefers-reduced-motion: reduce) {
  .kf-slider__input::-webkit-slider-thumb {
    transition: none;
  }
}
@media (forced-colors: active) {
  .kf-slider__input::-webkit-slider-thumb {
    border-color: CanvasText;
  }
}
</style>
