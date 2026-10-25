/**
 * KfButton 模块入口。
 * 消费者可 `import { KfButton } from '@beiluol/knowflow-ui/...'`（若开启子路径）
 * 或直接从根入口导入；两者指向同一份实现，不产生重复实例。
 */
export { default as KfButton } from './KfButton.vue'
export type {
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  ButtonVariant,
  KfButtonEmits,
  KfButtonProps,
  KfButtonSlots,
} from './types'
