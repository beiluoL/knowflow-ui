<template>
  <article
    class="kf-chat-message"
    :class="[`kf-chat-message--${role}`, { 'kf-chat-message--pending': pending }]"
    :aria-label="ariaLabel || displayName"
  >
    <span class="kf-chat-message__avatar" aria-hidden="true">
      <slot name="avatar">
        <img v-if="avatarSrc" :src="avatarSrc" alt="" class="kf-chat-message__avatar-img" />
        <KfIcon v-else :name="avatarIcon || DEFAULT_ICON[role]" :size="16" />
      </slot>
    </span>

    <div class="kf-chat-message__main">
      <header class="kf-chat-message__head">
        <span class="kf-chat-message__name">{{ displayName }}</span>
        <span v-if="timestamp" class="kf-chat-message__time">{{ timestamp }}</span>
        <span v-if="status === 'sending'" class="kf-chat-message__status">发送中…</span>
        <span v-else-if="status === 'error'" class="kf-chat-message__status kf-chat-message__status--error">
          发送失败
        </span>
      </header>

      <div class="kf-chat-message__bubble">
        <slot />
        <span v-if="pending" class="kf-chat-message__typing" role="status" aria-label="正在生成">
          <span class="kf-chat-message__dot" />
          <span class="kf-chat-message__dot" />
          <span class="kf-chat-message__dot" />
        </span>
      </div>

      <footer v-if="actions.length || $slots.actions || $slots.footer" class="kf-chat-message__foot">
        <slot name="actions">
          <button
            v-for="action in actions"
            :key="action.key"
            type="button"
            class="kf-chat-message__action"
            :disabled="action.disabled"
            @click="emit('action', action.key)"
          >
            <KfIcon v-if="action.iconName" :name="action.iconName" :size="13" aria-hidden="true" />
            <span>{{ action.label }}</span>
          </button>
        </slot>
        <slot name="footer" />
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * KfChatMessage — 对话消息气泡（纯展示）。
 *
 * 迁移自 V5 的 AIChat 场景 Fixture 与 KnowFlow 聊天页的视觉规则。
 * 组件不持有消息状态、不发请求、不做 Markdown 解析 ——
 * 内容由宿主通过默认插槽传入（通常是 KfMarkdownRenderer）。
 */
import { computed } from 'vue'
import { KfIcon } from '@beiluol/knowflow-ui'
import type { KfChatMessageEmits, KfChatMessageProps, KfChatRole } from './types'

const DEFAULT_ICON: Record<KfChatRole, string> = {
  user: 'user',
  assistant: 'sparkles',
  system: 'info',
}

const DEFAULT_NAME: Record<KfChatRole, string> = {
  user: '我',
  assistant: 'AI 助手',
  system: '系统',
}

const props = withDefaults(defineProps<KfChatMessageProps>(), {
  role: 'assistant',
  name: '',
  avatarSrc: '',
  avatarIcon: '',
  timestamp: '',
  status: 'sent',
  actions: () => [],
  pending: false,
  ariaLabel: '',
})

const emit = defineEmits<KfChatMessageEmits>()

const displayName = computed(() => props.name || DEFAULT_NAME[props.role])
</script>

<style scoped>
.kf-chat-message {
  display: flex;
  align-items: flex-start;
  gap: var(--kf-space-2);
  box-sizing: border-box;
  min-width: 0;
  font-family: var(--kf-font-sans);
}
.kf-chat-message--user {
  flex-direction: row-reverse;
}
.kf-chat-message__avatar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
}
.kf-chat-message--assistant .kf-chat-message__avatar {
  background: var(--kf-primary-subtle);
  color: var(--kf-primary);
}
.kf-chat-message__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kf-chat-message__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: min(100%, 720px);
}
.kf-chat-message--user .kf-chat-message__main {
  align-items: flex-end;
}
.kf-chat-message__head {
  display: flex;
  align-items: baseline;
  gap: var(--kf-space-2);
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-caption);
}
.kf-chat-message--user .kf-chat-message__head {
  flex-direction: row-reverse;
}
.kf-chat-message__name {
  color: var(--kf-foreground);
  font-weight: var(--kf-fw-label);
}
.kf-chat-message__status--error {
  color: var(--kf-danger);
}
.kf-chat-message__bubble {
  box-sizing: border-box;
  min-width: 0;
  padding: 10px var(--kf-space-3);
  border-radius: var(--kf-radius-md);
  background: var(--kf-card);
  border: 1px solid var(--kf-border);
  color: var(--kf-foreground);
  font-size: var(--kf-fs-body-md);
  line-height: var(--kf-lh-body-md);
  overflow-wrap: anywhere;
}
.kf-chat-message--user .kf-chat-message__bubble {
  border-color: transparent;
  background: var(--kf-primary);
  color: var(--kf-primary-foreground);
}
.kf-chat-message--system .kf-chat-message__bubble {
  background: var(--kf-muted);
  border-color: transparent;
  color: var(--kf-muted-foreground);
  font-size: var(--kf-fs-body-sm);
}
.kf-chat-message--pending .kf-chat-message__bubble {
  color: var(--kf-muted-foreground);
}
.kf-chat-message__typing {
  display: inline-flex;
  gap: 3px;
  margin-left: 2px;
  vertical-align: middle;
}
.kf-chat-message__dot {
  width: 4px;
  height: 4px;
  border-radius: var(--kf-radius-full);
  background: currentColor;
  animation: kf-chat-blink 1.2s infinite ease-in-out;
}
.kf-chat-message__dot:nth-child(2) {
  animation-delay: 0.2s;
}
.kf-chat-message__dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes kf-chat-blink {
  0%,
  80%,
  100% {
    opacity: 0.25;
  }
  40% {
    opacity: 1;
  }
}
.kf-chat-message__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}
.kf-chat-message__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--kf-radius-xs);
  background: transparent;
  color: var(--kf-muted-foreground);
  font-family: inherit;
  font-size: var(--kf-fs-caption);
  cursor: pointer;
}
.kf-chat-message__action:hover:not(:disabled) {
  background: var(--kf-muted);
  color: var(--kf-foreground);
}
.kf-chat-message__action:focus-visible {
  outline: var(--kf-focus-ring-width) solid var(--kf-ring);
  outline-offset: 1px;
}
.kf-chat-message__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .kf-chat-message__dot {
    animation: none;
    opacity: 0.6;
  }
}
</style>
