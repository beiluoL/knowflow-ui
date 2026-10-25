import type { InjectionKey, Ref } from 'vue'

export interface KfAccordionContext {
  openNames: Ref<string[]>
  toggle: (name: string) => void
  isOpen: (name: string) => boolean
}

export const KF_ACCORDION: InjectionKey<KfAccordionContext> = Symbol('kf-accordion')
