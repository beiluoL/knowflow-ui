/** KfButton 公共类型（从 SFC 抽出，便于消费者 `import type` 与 d.ts 复用） */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'
export type ButtonIconPosition = 'left' | 'right'
