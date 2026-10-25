/**
 * @beiluol/knowflow-learning — 学习、复习、测验的展示组件。
 *
 * 包边界（写进代码，避免后续被业务逻辑反向侵蚀）：
 *   1. 不含记忆算法：没有 FSRS / SM-2 / 间隔计算，下次复习时间由宿主提供；
 *   2. 不含学习记录：不读写本地存储、不发请求、不记账；
 *   3. 不含判分逻辑：对错、得分、评级全部由宿主给出，组件只负责呈现；
 *   4. 不含 AI 评分：面试反馈的分数字段就是普通 number，来源由宿主决定。
 *
 * 依赖方向：`@beiluol/knowflow-learning` → `@beiluol/knowflow-ui` → `@beiluol/knowflow-tokens`，单向。
 */

/* ── 闪卡与复习 ───────────────────────────────────────────── */
export * from './flashcard/index'
export * from './flashcard-rating/index'
export * from './review-progress/index'

/* ── 测验 ─────────────────────────────────────────────────── */
export * from './question-card/index'
export * from './answer-options/index'
export * from './answer-feedback/index'
export * from './quiz-progress/index'
export * from './quiz-result/index'

/* ── 面试 ─────────────────────────────────────────────────── */
export * from './interview-question/index'
export * from './interview-feedback/index'
export * from './interview-score/index'

export const version = '0.2.0'
