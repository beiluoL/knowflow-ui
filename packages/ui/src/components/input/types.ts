/** KfInput 公共类型 */
export type InputModelValue = string | number
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | (string & {})
