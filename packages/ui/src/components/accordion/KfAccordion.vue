<template>
  <div class="kf-accordion">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * KfAccordion — 折叠面板容器。
 *
 * 对应 V5 的 Accordion 条目（原项目用原生 <details> 做参考实现）。
 * 这里为什么不用 <details>：<details> 无法可靠地受控（open 属性与用户点击会打架），
 * 且多项互斥逻辑得靠 JS 补；改用 button + aria-expanded + region 的组合，
 * 语义等价、状态可控，键盘行为仍是原生 button 的 Enter/Space。
 */
import { computed, provide, ref, watch } from 'vue'
import { KF_ACCORDION } from './context'
import type { KfAccordionEmits, KfAccordionProps } from './types'

const props = withDefaults(defineProps<KfAccordionProps>(), {
  modelValue: () => [],
  multiple: false,
  collapsible: true,
})

const emit = defineEmits<KfAccordionEmits>()

const openNames = ref<string[]>([...props.modelValue])
watch(
  () => props.modelValue,
  (value) => {
    openNames.value = [...value]
  },
)

const openSet = computed(() => new Set(openNames.value))

function commit(next: string[]): void {
  openNames.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

provide(KF_ACCORDION, {
  openNames,
  isOpen: (name: string) => openSet.value.has(name),
  toggle: (name: string) => {
    const isOpen = openSet.value.has(name)
    if (isOpen && !props.collapsible) return
    if (isOpen) {
      commit(openNames.value.filter((item) => item !== name))
      return
    }
    commit(props.multiple ? [...openNames.value, name] : [name])
  },
})
</script>

<style scoped>
.kf-accordion {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  overflow: hidden;
  font-family: var(--kf-font-sans);
}
</style>
