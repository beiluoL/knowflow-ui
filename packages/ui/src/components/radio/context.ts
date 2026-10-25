import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { KfRadioSize } from './types'

/** KfRadioGroup 向子 KfRadio 暴露的最小契约（不暴露 ref 之外的内部状态） */
export interface KfRadioGroupContext {
  modelValue: Ref<string | number | boolean | undefined>
  name: ComputedRef<string>
  disabled: ComputedRef<boolean>
  size: ComputedRef<KfRadioSize>
  select: (value: string | number | boolean) => void
}

export const KF_RADIO_GROUP: InjectionKey<KfRadioGroupContext> = Symbol('kf-radio-group')
