/**
 * @beiluol/knowflow-ai — 与模型无关的 AI 展示组件。
 *
 * 设计原则（写进包边界，避免后续漂移）：
 *   1. 不发请求：没有 fetch / axios / WebSocket / EventSource，任何网络动作都在宿主；
 *   2. 不绑模型：组件不出现 openai / deepseek / claude 等具体供应商字段；
 *   3. 不做业务：不读 Pinia、不碰 Router、不写学习记录；
 *   4. 不渲染不可信 HTML：Markdown 走 token 解析 + 元素渲染，全包零 v-html。
 *
 * 依赖方向：`@beiluol/knowflow-ai` → `@beiluol/knowflow-ui` → `@beiluol/knowflow-tokens`，单向。
 */

/* ── 消息与输入 ───────────────────────────────────────────── */
export * from './chat-message/index'
export * from './chat-composer/index'

/* ── 内容渲染 ─────────────────────────────────────────────── */
export * from './markdown/index'
export * from './code-block/index'

/* ── 推理与工具 ───────────────────────────────────────────── */
export * from './thinking-panel/index'
export * from './agent-trace/index'
export * from './tool-call-card/index'
export * from './execution-status/index'

/* ── 检索与引用 ───────────────────────────────────────────── */
export * from './citation-card/index'
export * from './source-list/index'
export * from './evidence-panel/index'

/* ── 附件 ─────────────────────────────────────────────────── */
export * from './attachment-preview/index'

/* ── 共享工具（公开：宿主做同样格式化时可复用） ─────────────── */
export { formatBytes, formatScore } from './shared/format'
export { splitByTerms } from './shared/highlight'
export type { KfTextSegment } from './shared/highlight'

export const version = '0.2.0'
