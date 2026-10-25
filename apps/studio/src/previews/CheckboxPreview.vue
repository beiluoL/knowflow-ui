<template>
  <div class="preview-stack preview-stack--left">
    <div class="preview-stack__field">
      <KfCheckbox
        :model-value="modelValue"
        :label="label"
        :indeterminate="indeterminate"
        :disabled="disabled"
        @update:model-value="emit('patch', 'modelValue', $event)"
        @change="emit('event', $event ? 'change: true' : 'change: false')"
      />
    </div>
    <div class="preview-stack__meta">
      <span>v-model</span>
      <code>{{ modelValue }}<template v-if="indeterminate"> · indeterminate</template></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KfCheckbox } from '@beiluol/knowflow-ui'
import type { PropState } from '../stories/types'

const props = defineProps<{ state: PropState }>()
const emit = defineEmits<{ patch: [key: string, value: string | number | boolean]; event: [name: string] }>()

const modelValue = computed(() => props.state.modelValue === true)
const label = computed(() => (typeof props.state.label === 'string' ? props.state.label : ''))
const indeterminate = computed(() => props.state.indeterminate === true)
const disabled = computed(() => props.state.disabled === true)
</script>
