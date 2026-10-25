<template>
  <div class="preview-inline">
    <KfButton
      :variant="variant"
      :size="size"
      :disabled="bool('disabled')"
      :loading="bool('loading')"
      :icon-only="bool('iconOnly')"
      :block="bool('block')"
      :icon-name="icon"
      :icon-position="iconPosition"
      :aria-label="ariaLabel || undefined"
      @click="emit('event', 'click')"
    >
      <template v-if="!bool('iconOnly')">{{ label }}</template>
    </KfButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KfButton } from '@beiluol/knowflow-ui'
import type { ButtonIconPosition, ButtonSize, ButtonVariant } from '@beiluol/knowflow-ui'
import type { PropState } from '../stories/types'
import { iconOrUndefined } from '../stories/previews'

const props = defineProps<{ state: PropState }>()
const emit = defineEmits<{ event: [name: string] }>()

function bool(key: string): boolean {
  return props.state[key] === true
}
function str(key: string): string {
  return typeof props.state[key] === 'string' ? (props.state[key] as string) : ''
}

const variant = computed(() => str('variant') as ButtonVariant)
const size = computed(() => str('size') as ButtonSize)
const label = computed(() => str('label') || '按钮')
const icon = computed(() => iconOrUndefined(props.state.iconName))
const iconPosition = computed(() => str('iconPosition') as ButtonIconPosition)
const ariaLabel = computed(() => str('ariaLabel'))
</script>
