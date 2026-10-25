<template>
  <aside class="st-props" aria-label="属性面板">
    <header class="st-props__head">
      <div>
        <h3 class="st-props__title">Properties</h3>
        <p class="st-props__sub">{{ editable.length }} 个可调参数 · 实时生效</p>
      </div>
      <button type="button" class="st-link-button" @click="$emit('reset')">重置</button>
    </header>

    <div v-if="!editable.length" class="st-props__empty">
      该条目没有可在面板调节的参数（Props 为空或全部为只读）。下方「实测样式」仍会读取真实渲染值。
    </div>

    <div v-else class="st-props__list">
      <div v-for="spec in editable" :key="spec.name" class="st-control">
        <label class="st-control__label" :for="`prop-${spec.name}`">
          <span class="st-control__name">{{ spec.name }}</span>
          <span class="st-control__type">{{ spec.type }}</span>
        </label>

        <KfSwitch
          v-if="spec.type === 'boolean'"
          :model-value="Boolean(values[spec.name])"
          size="sm"
          :aria-label="spec.name"
          @update:model-value="(value: boolean) => update(spec.name, value)"
        />

        <KfSelect
          v-else-if="spec.options?.length"
          :model-value="String(values[spec.name] ?? '')"
          :options="spec.options.map((option) => ({ label: option, value: option }))"
          @update:model-value="(value: string | string[]) => update(spec.name, value)"
        />

        <KfNumberInput
          v-else-if="spec.type === 'number'"
          :model-value="typeof values[spec.name] === 'number' ? (values[spec.name] as number) : null"
          :show-controls="true"
          @update:model-value="(value: number | null) => update(spec.name, value)"
        />

        <KfInput
          v-else
          :id="`prop-${spec.name}`"
          :model-value="String(values[spec.name] ?? '')"
          :placeholder="spec.sourceDefault"
          @update:model-value="(value: string | number) => update(spec.name, value)"
        />
      </div>
    </div>

    <section class="st-inspector" aria-label="实测样式">
      <h4 class="st-inspector__title">实测样式（getComputedStyle）</h4>
      <p v-if="!Object.keys(metrics).length" class="st-inspector__empty">未取到测量目标</p>
      <dl v-else class="st-inspector__grid">
        <template v-for="row in metricRows" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd :title="row.value">{{ row.value }}</dd>
        </template>
      </dl>
      <p class="st-inspector__note">
        读到的是当前主题下的真实计算值，不是源码里写的数字。
      </p>
    </section>
  </aside>
</template>

<script setup lang="ts">
/**
 * 右侧属性面板：改 Prop + 看实测样式。
 *
 * 只渲染 `editable=true` 的参数；`modelValue` / `open` / `options` 这类
 * 「由画布状态驱动」的参数不在面板里出现，避免出现「面板改空、画布仍显示选中项」
 * 的两套真相。
 */
import { computed } from 'vue'
import { KfInput, KfNumberInput, KfSelect, KfSwitch } from '@beiluol/knowflow-ui'
import type { PlaygroundEntry } from '../registry/types'

const props = defineProps<{
  entry: PlaygroundEntry
  values: Record<string, unknown>
  metrics: Record<string, string>
}>()

const emit = defineEmits<{
  update: [name: string, value: unknown]
  reset: []
}>()

const editable = computed(() => props.entry.props.filter((spec) => spec.editable))

function update(name: string, value: unknown): void {
  emit('update', name, value)
}

const METRIC_LABELS: Array<[string, string]> = [
  ['width', 'width'],
  ['height', 'height'],
  ['padding', 'padding'],
  ['margin', 'margin'],
  ['gap', 'gap'],
  ['fontSize', 'font-size'],
  ['fontWeight', 'font-weight'],
  ['lineHeight', 'line-height'],
  ['display', 'display'],
  ['border', 'border'],
  ['radius', 'border-radius'],
  ['shadow', 'box-shadow'],
  ['color', 'color'],
  ['background', 'background'],
]

const metricRows = computed(() =>
  METRIC_LABELS.filter(([key]) => props.metrics[key]).map(([key, label]) => ({
    label,
    value: props.metrics[key],
  })),
)
</script>
