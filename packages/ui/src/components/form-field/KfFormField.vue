<template>
  <div class="kf-form-field" :class="{ 'kf-form-field--unlabelled': !label }">
    <label v-if="label" :for="controlId" class="kf-form-label">
      {{ label }}<span v-if="required" class="kf-form-required" aria-hidden="true"> *</span>
    </label>
    <div class="kf-form-field__control"><slot /></div>
    <div v-if="help || error || $slots.meta" class="kf-form-field__meta">
      <p v-if="help" :id="`${controlId}-help`" class="kf-form-help">{{ help }}</p>
      <p v-if="error" :id="`${controlId}-error`" class="kf-form-error">{{ error }}</p>
      <slot name="meta" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 内部组件（v0.1.0 不从公共入口导出）：label / control / meta 三轨结构。
 * 与 KnowFlow FormField 的 DOM 契约一致，供 KfInput 复用，避免为 label 再写一套。
 */
defineProps<{
  controlId: string
  label?: string
  required?: boolean
  help?: string
  error?: string
}>()
</script>

<style scoped>
.kf-form-field {
  display: grid;
  row-gap: var(--kf-field-label-gap, 8px);
  min-width: 0;
  width: 100%;
  align-content: start;
}
.kf-form-label {
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
.kf-form-required,
.kf-form-error {
  color: var(--kf-danger-text);
}
.kf-form-help {
  color: var(--kf-muted-foreground);
}
</style>
