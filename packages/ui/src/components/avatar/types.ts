export type KfAvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type KfAvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface KfAvatarProps {
  /** 头像图片地址；加载失败自动回退到 icon/首字母 */
  src?: string
  /** 图片替代文本（默认取 name） */
  alt?: string
  /** 姓名：用于生成首字母回退 */
  name?: string
  size?: KfAvatarSize
  /** 在线状态点 */
  status?: KfAvatarStatus
  showStatus?: boolean
  /** 回退图标名 */
  iconName?: string
}

export interface KfAvatarEmits {
  /** 图片加载失败（宿主可据此上报或换源） */
  error: [event: Event]
}
