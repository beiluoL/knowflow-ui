<template>
  <div class="kf-form-field" :class="{ 'kf-form-field--unlabelled': !label }">
    <label v-if="label" :for="controlId" class="kf-form-field__label">
      {{ label }}<span v-if="required" class="kf-form-field__required" aria-hidden="true"> *</span>
    </label>
    <div class="kf-form-field__control"><slot /></div>
    <div v-if="help || error || $slots.meta" class="kf-form-field__meta">
      <p v-if="help" :id="`${controlId}-help`" class="kf-form-field__help">{{ help }}</p>
      <p v-if="error" :id="`${controlId}-error`" class="kf-form-field__error">{{ error }}</p>
      <slot name="meta" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 内部组件（v0.1.0 不从公共入口导出）：label / control / meta 三轨结构。
 * 与 KnowFlow FormField 的 DOM 契约一致，供 KfInput 复用，避免为 label 再写一套。
 *
 * 类名：.kf-form-field（根）/ __label / __control / __meta / __help / __error / __required。
 */
import type { KfFormFieldProps } from './types'

defineProps<KfFormFieldProps>()
</script>

<style scoped>
.kf-form-field {
  display: grid;
  row-gap: var(--kf-field-label-gap, 8px);
  min-width: 0;
  width: 100%;
  align-content: start;
}
.kf-form-field__label {
  display: block;
  min-width: 0;
  margin: 0;
  font-size: var(--kf-fs-body-sm, 13px);
  line-height: var(--kf-lh-body-sm, 1.538462);
  font-weight: var(--kf-fw-label, 500);
  color: var(--kf-foreground);
  overflow-wrap: anywhere;
}
.kf-form-field__control {
  min-width: 0;
}
.kf-form-field__meta {
  min-width: 0;
  display: grid;
  gap: var(--kf-space-1, 4px);
  font-size: var(--kf-fs-caption, 12px);
  line-height: var(--kf-lh-caption, 1.5);
  overflow-wrap: anywhere;
}
.kf-form-field__required,
.kf-form-field__error {
  color: var(--kf-danger-text);
}
.kf-form-field__help {
  color: var(--kf-muted-foreground);
}
</style>
