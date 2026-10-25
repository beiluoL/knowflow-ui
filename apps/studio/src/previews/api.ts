/**
 * 预览画布与组件之间的唯一契约。
 *
 * 预览组件不直接持有「注册表」或「面板状态」：它拿到一份 `PreviewApi`，
 * 通过 `set()` 把用户交互写回面板（面板再回流为 props），通过 `log()` 记录事件。
 * 这样「面板改值 → 组件重渲染」与「组件改值 → 面板同步」是同一条链路，
 * 不会出现两套状态互相覆盖。
 */
import type { PlaygroundEntry, PlaygroundStory } from '../registry/types'

export interface PreviewApi {
  entry: PlaygroundEntry
  story: PlaygroundStory
  /** 当前生效的 Props（面板值的快照） */
  values: Record<string, unknown>
  /** 合并后的 Fixture（条目级 + Story 级） */
  fixture: Record<string, unknown>
  /** 写回一个 Prop（会同步到右侧面板） */
  set(name: string, value: unknown): void
  /** 记录一次事件（展示在「事件」区域） */
  log(event: string, payload?: unknown): void
}

/** Story 里 `fixture.ui` 的宽松形状 */
export interface StoryFixtureFlags {
  empty?: boolean
  busy?: boolean
  tableEmpty?: boolean
  searchLoading?: boolean
  searchError?: boolean
  cardLoading?: boolean
  longContent?: boolean
  toolStatus?: string
  query?: string
  open?: boolean
}
