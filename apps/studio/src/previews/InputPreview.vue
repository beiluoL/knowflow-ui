<template>
  <div class="preview-stack">
    <div class="preview-stack__field">
      <KfInput
        :model-value="modelValue"
        :label="label"
        :placeholder="placeholder"
        :type="type"
        :help="help"
        :error="error"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :prefix-icon-name="prefixIcon"
        :suffix-icon-name="suffixIcon"
        @update:model-value="emit('patch', 'modelValue', $event)"
        @focus="emit('event', 'focus')"
        @blur="emit('event', 'blur')"
      />
    </div>
    <div class="preview-stack__meta">
      <span>值绑定</span>
      <code>{{ modelValue === '' ? '（空）' : modelValue }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KfInput } from '@beiluol/knowflow-ui'
import type { PropState } from '../stories/types'
import { iconOrUndefined } from '../stories/previews'

const props = defineProps<{ state: PropState }>()
const emit = defineEmits<{ patch: [key: string, value: string | number | boolean]; event: [name: string] }>()

function str(key: string): string {
  const value = props.state[key]
  return typeof value === 'string' ? value : ''
}

const modelValue = computed(() => {
  const value = props.state.modelValue
  return typeof value === 'string' || typeof value === 'number' ? value : ''
})
const label = computed(() => str('label'))
const placeholder = computed(() => str('placeholder'))
const type = computed(() => str('type') || 'text')
const help = computed(() => str('help') || undefined)
const error = computed(() => str('error') || undefined)
const required = computed(() => props.state.required === true)
const disabled = computed(() => props.state.disabled === true)
const readonly = computed(() => props.state.readonly === true)
const prefixIcon = computed(() => iconOrUndefined(props.state.prefixIconName))
const suffixIcon = computed(() => iconOrUndefined(props.state.suffixIconName))
</script>
