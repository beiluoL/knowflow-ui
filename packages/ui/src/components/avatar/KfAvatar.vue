<template>
  <span class="kf-avatar" :class="`kf-avatar--${size}`">
    <img v-if="src && !failed" :src="src" :alt="alt || name || ''" class="kf-avatar__image" @error="onError" />
    <span v-else class="kf-avatar__fallback" :aria-hidden="alt || name ? undefined : 'true'">
      <KfIcon v-if="iconName" :name="iconName" :size="iconPx" class="kf-avatar__icon" />
      <span v-else class="kf-avatar__initials">{{ initials }}</span>
    </span>
    <span v-if="showStatus" class="kf-avatar__status" :class="`kf-avatar__status--${status}`" aria-hidden="true" />
  </span>
</template>

<script setup lang="ts">
/**
 * KfAvatar — 头像。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/Avatar.vue。
 * 变更：
 *   1. 图片失败从「静默 ignore」改为 failed 状态 + emit('error')：原实现的 handleError 是空函数，
 *      注释写着 fallback 但实际不会切回图标/首字母（img 仍在 DOM 里，只是空白）；
 *   2. ring-2 ring-white 换成 --kf-card，暗色模式下不再出现白圈；
 *   3. 无 alt/name 时对读屏隐藏回退文本，避免念出无意义的空字符。
 */
import { computed, ref, watch } from 'vue'
import KfIcon from '../icon/KfIcon.vue'
import type { KfAvatarEmits, KfAvatarProps, KfAvatarSize } from './types'

const props = withDefaults(defineProps<KfAvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  status: 'offline',
  showStatus: false,
  iconName: 'user',
})

const emit = defineEmits<KfAvatarEmits>()

const ICON_PX: Record<KfAvatarSize, number> = { sm: 16, md: 20, lg: 24, xl: 32 }
const iconPx = computed(() => ICON_PX[props.size])

const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const initials = computed(() => (props.name ? props.name.trim().charAt(0).toUpperCase() : ''))

function onError(event: Event): void {
  failed.value = true
  emit('error', event)
}
</script>

<style scoped>
.kf-avatar {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--kf-radius-full);
  background: var(--kf-muted);
  color: var(--kf-muted-foreground);
  font-family: var(--kf-font-sans);
  font-weight: var(--kf-fw-label);
  vertical-align: middle;
}
.kf-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--kf-fs-caption);
}
.kf-avatar--md {
  width: 40px;
  height: 40px;
  font-size: var(--kf-fs-body-md);
}
.kf-avatar--lg {
  width: 48px;
  height: 48px;
  font-size: var(--kf-fs-body-lg);
}
.kf-avatar--xl {
  width: 64px;
  height: 64px;
  font-size: var(--kf-fs-h4);
}
.kf-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kf-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  user-select: none;
}
.kf-avatar__initials {
  line-height: 1;
}
.kf-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  width: 25%;
  height: 25%;
  min-width: 8px;
  min-height: 8px;
  border-radius: var(--kf-radius-full);
  box-shadow: 0 0 0 2px var(--kf-card);
}
.kf-avatar__status--online {
  background: var(--kf-success);
}
.kf-avatar__status--offline {
  background: var(--kf-muted-foreground);
}
.kf-avatar__status--busy {
  background: var(--kf-danger);
}
.kf-avatar__status--away {
  background: var(--kf-warning-color);
}
</style>
