<template>
  <KfDialog
    :open="open"
    :title="title"
    :description="description"
    :message="message"
    :variant="variant"
    :icon="icon"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :loading="loading"
    :disabled="disabled"
    :error="error"
    :width="width"
    :persistent="persistent"
    :close-on-overlay="closeOnOverlay"
    :close-on-esc="closeOnEsc"
    :placement="placement"
    :show-cancel="showCancel"
    confirmation
    scrollable
    @update:open="emit('update:open', $event)"
    @confirm="emit('confirm', $event)"
    @cancel="emit('cancel')"
  >
    <slot />
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </KfDialog>
</template>

<script setup lang="ts">
/**
 * KfConfirmDialog — 确认弹窗。
 *
 * 迁移自 KnowFlow frontend/src/components/ui/ConfirmDialog.vue。
 * 它**不是**第二套弹窗引擎：只是 KfDialog 的 confirmation 预设，
 * 复用同一份焦点管理、滚动锁与 modal-stack。原项目的做法是对的，这里保持不变。
 */
import KfDialog from '../dialog/KfDialog.vue'
import type { KfConfirmDialogEmits, KfConfirmDialogProps } from './types'

withDefaults(defineProps<KfConfirmDialogProps>(), {
  open: false,
  title: '确认操作',
  description: '',
  message: '',
  variant: 'default',
  icon: '',
  confirmText: '继续操作',
  cancelText: '取消',
  loading: false,
  disabled: false,
  error: '',
  width: 'sm',
  persistent: false,
  closeOnOverlay: true,
  closeOnEsc: true,
  placement: 'center',
  showCancel: true,
})

const emit = defineEmits<KfConfirmDialogEmits>()
</script>
