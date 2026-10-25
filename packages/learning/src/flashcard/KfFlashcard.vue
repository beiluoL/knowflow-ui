<template>
  <article class="kf-flashcard" :class="{ 'kf-flashcard--flipped': isFlipped, 'kf-flashcard--disabled': disabled }">
    <header v-if="tags.length || index || $slots.meta" class="kf-flashcard__head">
      <span v-if="index" class="kf-flashcard__position">
        <span class="kf-flashcard__position-current">{{ index }}</span>
        <span v-if="total" class="kf-flashcard__position-total">/ {{ total }}</span>
      </span>
      <span v-for="tag in tags" :key="tag" class="kf-flashcard__tag">{{ tag }}</span>
      <slot name="meta" />
    </header>

    <button
      type="button"
      class="kf-flashcard__surface"
      :aria-label="isFlipped ? `显示${frontLabel}` : `显示${backLabel}`"
      :disabled="disabled || !flippable"
      @click="toggle"
    >
      <span class="kf-flashcard__label">{{ isFlipped ? backLabel : frontLabel }}</span>

      <span class="kf-flashcard__content" aria-live="polite">
        <template v-if="isFlipped">
          <slot name="back">
            <span class="kf-flashcard__text">{{ back || '（背面为空）' }}</span>
          </slot>
        </template>
        <template v-else>
          <slot name="front">
            <span class="kf-flashcard__text">{{ front || '（正面为空）' }}</span>
          </slot>
        </template>
      </span>
    </button>

    <footer class="kf-flashcard__foot">
      <button
        v-if="flippable"
        type="button"
        class="kf-flashcard__flip"
        :disabled="disabled"
        @click="toggle"
      >
        <KfIcon name="refresh-cw" :size="13" aria-hidden="true" />
        <span>{{ isFlipped ? `看${frontLabel}` : `看${backLabel}` }}</span>
      </button>
      <span v-if="hint" class="kf-flashcard__hint">{{ hint }}</span>
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
/**
 * KfFlashcard — 闪卡（正面问题 / 背面答案）。
 *
 * 组件不含任何记忆算法：不计算下次复习时间、不记录评分、不读写学习记录。
 * 是否翻面、翻面后调用哪个评分组件，全部由宿主决定。
 *
 * 受控语义：传入 `flipped` 时完全受控（点击只 emit，不自行改值）；
 * 未传入时组件内部维护状态，方便独立预览与 Storybook 式演示。
 */
import { computed, ref, watch } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfFlashcardEmits, KfFlashcardProps } from './types'

const props = withDefaults(defineProps<KfFlashcardProps>(), {
  front: '',
  back: '',
  flipped: undefined,
  flippable: true,
  frontLabel: '问题',
  backLabel: '答案',
  hint: '',
  tags: () => [],
  index: 0,
  total: 0,
  disabled: false,
  ariaLabel: '',
})

const emit = defineEmits<KfFlashcardEmits>()

const inner = ref(false)
const controlled = computed(() => props.flipped !== undefined)
const isFlipped = computed(() => (controlled.value ? Boolean(props.flipped) : inner.value))

// 受控切换为受控时，用外部值覆盖内部残留状态，避免「翻过又被重置」的错位
watch(
  () => props.flipped,
  (value) => {
    if (value !== undefined) inner.value = value
  },
)

function toggle(): void {
  if (props.disabled || !props.flippable) return
  const next = !isFlipped.value
  if (!controlled.value) inner.value = next
  emit('update:flipped', next)
  emit('flip', next)
}
</script>

<style scoped>
.kf-flashcard {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-flashcard__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.kf-flashcard__position {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-variant-numeric: tabular-nums;
}
.kf-flashcard__position-current {
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
}
.kf-flashcard__tag {
  padding: 1px 6px;
  border-radius: var(--kf-tag-radius);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
.kf-flashcard__surface {
  display: flex;
  flex-direction: column;
  gap: var(--kf-space-3);
  align-items: stretch;
  box-sizing: border-box;
  width: 100%;
  min-height: 180px;
  padding: var(--kf-space-4);
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-lg);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--kf-motion-fast) ease, box-shadow var(--kf-motion-fast) ease;
}
.kf-flashcard__surface:hover:not(:disabled) {
  border-color: var(--kf-primary);
  box-shadow: var(--kf-shadow-card);
}
.kf-flashcard__surface:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-flashcard__surface:disabled {
  cursor: default;
}
.kf-flashcard--flipped .kf-flashcard__surface {
  background: var(--kf-primary-subtle);
  border-color: var(--kf-primary);
}
.kf-flashcard__label {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
  font-weight: var(--kf-fw-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.kf-flashcard__content {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
.kf-flashcard__text {
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-lg);
  line-height: var(--kf-lh-body-lg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-align: center;
  width: 100%;
}
.kf-flashcard__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--kf-space-2);
  min-width: 0;
}
.kf-flashcard__flip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: var(--kf-control-height-sm);
  padding: 0 10px;
  border: 1px solid var(--kf-border);
  border-radius: var(--kf-radius-sm);
  background: var(--kf-card);
  color: var(--kf-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  font-weight: var(--kf-fw-label);
  cursor: pointer;
}
.kf-flashcard__flip:hover:not(:disabled) {
  background: var(--kf-muted);
}
.kf-flashcard__flip:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: var(--kf-focus-ring-offset);
}
.kf-flashcard__flip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kf-flashcard__hint {
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-xs);
}
@media (prefers-reduced-motion: reduce) {
  .kf-flashcard__surface {
    transition: none;
  }
}
</style>
