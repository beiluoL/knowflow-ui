<template>
  <div class="prop-controls">
    <div v-for="spec in specs" :key="spec.name" class="prop-row">
      <div class="prop-row__head">
        <code class="prop-row__name">{{ spec.name }}</code>
        <button class="prop-row__reset" type="button" title="重置该属性" @click="emit('patch', spec.name, spec.defaultValue)">
          重置
        </button>
      </div>

      <KfCheckbox
        v-if="spec.control === 'boolean'"
        :model-value="state[spec.name] === true"
        :label="state[spec.name] === true ? 'true' : 'false'"
        @update:model-value="emit('patch', spec.name, $event)"
      />

      <select
        v-else-if="spec.control === 'select'"
        class="prop-select"
        :value="String(state[spec.name])"
        @change="onSelectChange(spec, $event)"
      >
        <option v-for="option in spec.options" :key="String(option.value)" :value="String(option.value)">
          {{ option.label }}
        </option>
      </select>

      <KfInput
        v-else-if="spec.control === 'number'"
        :model-value="Number(state[spec.name])"
        type="number"
        @update:model-value="emit('patch', spec.name, Number($event))"
      />

      <KfInput
        v-else
        :model-value="String(state[spec.name])"
        placeholder="留空则为默认值"
        @update:model-value="emit('patch', spec.name, $event)"
      />

      <p class="prop-row__desc">{{ spec.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KfCheckbox, KfInput } from '@beiluol/knowflow-ui'
import type { PropSpec, PropState } from '../stories/types'

const props = defineProps<{ specs: PropSpec[]; state: PropState }>()
const emit = defineEmits<{ patch: [key: string, value: string | number | boolean] }>()

function onSelectChange(spec: PropSpec, event: Event) {
  const raw = (event.target as HTMLSelectElement).value
  const matched = spec.options?.find((option) => String(option.value) === raw)
  emit('patch', spec.name, matched ? matched.value : raw)
}

/** 供父组件模板调试时读取当前值（避免 TS 未使用告警） */
void props
</script>

<style scoped>
.prop-controls {
  display: grid;
  gap: var(--kf-space-4);
}
.prop-row {
  display: grid;
  gap: 6px;
}
.prop-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kf-space-2);
}
.prop-row__name {
  font-family: var(--kf-font-mono);
  font-size: var(--kf-fs-body-sm);
  font-weight: 600;
  color: var(--kf-foreground);
}
.prop-row__reset {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: var(--kf-fs-xs);
  color: var(--kf-muted-foreground);
  cursor: pointer;
  border-radius: var(--kf-radius-xs);
}
.prop-row__reset:hover {
  color: var(--kf-primary);
}
.prop-row__desc {
  margin: 0;
  font-size: var(--kf-fs-xs);
  line-height: 1.5;
  color: var(--kf-muted-foreground);
}
.prop-select {
  box-sizing: border-box;
  width: 100%;
  height: var(--kf-input-height);
  padding: 0 var(--kf-field-padding);
  border: 0;
  border-radius: var(--kf-field-radius);
  background: var(--kf-field-surface);
  color: var(--kf-foreground);
  font-family: var(--kf-font-sans);
  font-size: var(--kf-fs-body-md);
  cursor: pointer;
  outline: 0;
}
.prop-select:focus-visible {
  outline: 2px solid var(--kf-ring);
  outline-offset: 2px;
}
</style>
