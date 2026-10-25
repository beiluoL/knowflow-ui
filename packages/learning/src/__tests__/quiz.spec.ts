import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfQuestionCard from '../question-card/KfQuestionCard.vue'
import KfAnswerOptions from '../answer-options/KfAnswerOptions.vue'
import KfAnswerFeedback from '../answer-feedback/KfAnswerFeedback.vue'
import KfQuizProgress from '../quiz-progress/KfQuizProgress.vue'
import KfQuizResult from '../quiz-result/KfQuizResult.vue'

describe('KfQuestionCard', () => {
  it('渲染题号、题型、难度、分值与标签', () => {
    const wrapper = mount(KfQuestionCard, {
      props: {
        question: 'HTTP 与 HTTPS 的区别？',
        type: 'essay',
        index: 3,
        total: 10,
        difficulty: 'hard',
        points: 8,
        tags: ['网络'],
      },
    })
    expect(wrapper.get('.kf-question-card__index').text()).toBe('第 3 题')
    expect(wrapper.get('.kf-question-card__total').text()).toBe('共 10 题')
    expect(wrapper.get('.kf-question-card__type').text()).toBe('论述题')
    expect(wrapper.get('.kf-question-card__difficulty').text()).toBe('较难')
    expect(wrapper.get('.kf-question-card__points').text()).toBe('8 分')
    expect(wrapper.get('.kf-question-card__tag').text()).toBe('网络')
    expect(wrapper.get('.kf-question-card__text').text()).toBe('HTTP 与 HTTPS 的区别？')
  })

  it('题干默认插槽优先于 question 文本', () => {
    const wrapper = mount(KfQuestionCard, {
      props: { question: '纯文本' },
      slots: { default: '<pre class="rich">富文本题干</pre>' },
    })
    expect(wrapper.find('.rich').exists()).toBe(true)
    expect(wrapper.find('.kf-question-card__text').exists()).toBe(false)
  })

  it('提示默认收起，点击展开并派发 hint 事件', async () => {
    const wrapper = mount(KfQuestionCard, { props: { question: 'q', hint: '先想对称加密' } })
    const toggle = wrapper.get('.kf-question-card__hint-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.kf-question-card__hint').attributes('style')).toContain('display: none')

    await toggle.trigger('click')

    expect(wrapper.get('.kf-question-card__hint-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('.kf-question-card__hint').text()).toBe('先想对称加密')
    expect(wrapper.emitted('hint')).toEqual([[true]])
  })

  it('无 hint 时不渲染提示区', () => {
    const wrapper = mount(KfQuestionCard, { props: { question: 'q' } })
    expect(wrapper.find('.kf-question-card__hint-toggle').exists()).toBe(false)
  })

  it('空题干展示占位文案', () => {
    const wrapper = mount(KfQuestionCard, {})
    expect(wrapper.get('.kf-question-card__text').text()).toBe('（题干为空）')
  })
})

describe('KfAnswerOptions', () => {
  const options = [
    { value: 'a', label: '选项 A' },
    { value: 'b', label: '选项 B' },
    { value: 'c', label: '选项 C', description: '补充说明' },
  ]

  it('单选使用原生 radio，点击派发单个 value', async () => {
    const wrapper = mount(KfAnswerOptions, { props: { options } })
    const inputs = wrapper.findAll('input')
    expect(inputs.map((input) => input.attributes('type'))).toEqual(['radio', 'radio', 'radio'])
    expect(wrapper.attributes('role')).toBe('radiogroup')

    await inputs[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('b')
  })

  it('多选使用 checkbox，点击在数组里增删', async () => {
    const wrapper = mount(KfAnswerOptions, {
      props: { options, mode: 'multiple', modelValue: ['a'] },
    })
    expect(wrapper.findAll('input')[0].attributes('type')).toBe('checkbox')
    expect(wrapper.attributes('role')).toBe('group')

    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])

    await wrapper.setProps({ modelValue: ['a'] })
    await wrapper.findAll('input')[0].setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]])
  })

  it('选中项渲染 selected 类与「已选」提示', () => {
    const wrapper = mount(KfAnswerOptions, { props: { options, modelValue: 'b' } })
    const items = wrapper.findAll('.kf-answer-options__option')
    expect(items[1].classes()).toContain('kf-answer-options__option--selected')
    expect(items[1].text()).toContain('已选')
    expect(items[0].classes()).not.toContain('kf-answer-options__option--selected')
  })

  it('揭示答案后按 correctValues 着色：正确 / 错误 / 漏选', () => {
    const wrapper = mount(KfAnswerOptions, {
      props: { options, mode: 'multiple', modelValue: ['b'], revealed: true, correctValues: ['a', 'b'] },
    })
    const items = wrapper.findAll('.kf-answer-options__option')
    expect(items[0].classes()).toContain('kf-answer-options__option--missed')
    expect(items[1].classes()).toContain('kf-answer-options__option--correct')
    expect(items[2].classes()).toContain('kf-answer-options__option--idle')
    expect(wrapper.text()).toContain('漏选')
  })

  it('选中了错误答案时渲染 wrong 类', () => {
    const wrapper = mount(KfAnswerOptions, {
      props: { options, modelValue: 'c', revealed: true, correctValues: ['a'] },
    })
    expect(wrapper.findAll('.kf-answer-options__option')[2].classes()).toContain('kf-answer-options__option--wrong')
  })

  it('disabled 与单项 disabled 都阻止交互', async () => {
    const wrapper = mount(KfAnswerOptions, {
      props: { options: [options[0], { ...options[1], disabled: true }] },
    })
    expect(wrapper.findAll('input')[1].attributes('disabled')).toBeDefined()
    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    const allDisabled = mount(KfAnswerOptions, { props: { options, disabled: true } })
    expect(allDisabled.findAll('input').every((input) => input.attributes('disabled') !== undefined)).toBe(true)
  })

  it('选项字母按位置生成，description 作为次要说明', () => {
    const wrapper = mount(KfAnswerOptions, { props: { options } })
    expect(wrapper.findAll('.kf-answer-options__letter').map((n) => n.text())).toEqual(['A', 'B', 'C'])
    expect(wrapper.get('.kf-answer-options__desc').text()).toBe('补充说明')
  })
})

describe('KfAnswerFeedback', () => {
  it('正确态使用 role=status 并提供默认标题', () => {
    const wrapper = mount(KfAnswerFeedback, { props: { status: 'correct' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.get('.kf-answer-feedback__title').text()).toBe('回答正确')
    expect(wrapper.classes()).toContain('kf-answer-feedback--correct')
  })

  it('错误 / 部分正确 / 跳过各有默认文案', () => {
    expect(mount(KfAnswerFeedback, { props: { status: 'incorrect' } }).text()).toContain('回答错误')
    expect(mount(KfAnswerFeedback, { props: { status: 'partial' } }).text()).toContain('部分正确')
    expect(mount(KfAnswerFeedback, { props: { status: 'skipped' } }).text()).toContain('已跳过')
  })

  it('对比区展示用户答案与正确答案', () => {
    const wrapper = mount(KfAnswerFeedback, {
      props: { status: 'incorrect', answer: 'B', correctAnswer: 'A' },
    })
    const rows = wrapper.findAll('.kf-answer-feedback__dd')
    expect(rows[0].text()).toBe('B')
    expect(rows[1].text()).toBe('A')
    expect(rows[1].classes()).toContain('kf-answer-feedback__dd--correct')
  })

  it('解析区渲染 explanation 或默认插槽', () => {
    const text = mount(KfAnswerFeedback, { props: { explanation: '因为…' } })
    expect(text.get('.kf-answer-feedback__explain-text').text()).toBe('因为…')

    const slot = mount(KfAnswerFeedback, { slots: { default: '<div class="custom-explain">富文本</div>' } })
    expect(slot.find('.custom-explain').exists()).toBe(true)
  })

  it('retryable 时点击再试一次派发 retry', async () => {
    const wrapper = mount(KfAnswerFeedback, { props: { status: 'incorrect', retryable: true } })
    await wrapper.get('.kf-answer-feedback__retry').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)

    const noRetry = mount(KfAnswerFeedback, { props: { status: 'correct' } })
    expect(noRetry.find('.kf-answer-feedback__retry').exists()).toBe(false)
  })

  it('score 仅在提供时展示', () => {
    expect(mount(KfAnswerFeedback, { props: { score: '2/3' } }).get('.kf-answer-feedback__score').text()).toBe('2/3')
    expect(mount(KfAnswerFeedback, { props: { score: '  ' } }).find('.kf-answer-feedback__score').exists()).toBe(false)
  })
})

describe('KfQuizProgress', () => {
  const items = [
    { id: 1, status: 'correct' as const },
    { id: 2, status: 'incorrect' as const },
    { id: 3, status: 'answered' as const },
    { id: 4 },
  ]

  it('汇总已答与对错数量', () => {
    const wrapper = mount(KfQuizProgress, { props: { items } })
    expect(wrapper.get('.kf-quiz-progress__summary-main').text()).toBe('已答 3 / 4')
    expect(wrapper.get('.kf-quiz-progress__ok').text()).toBe('对 1')
    expect(wrapper.get('.kf-quiz-progress__bad').text()).toBe('错 1')
  })

  it('每题按状态着色，当前题带 aria-current', () => {
    const wrapper = mount(KfQuizProgress, { props: { items, current: 1 } })
    const dots = wrapper.findAll('.kf-quiz-progress__dot')
    expect(dots[0].classes()).toContain('kf-quiz-progress__dot--correct')
    expect(dots[1].classes()).toContain('kf-quiz-progress__dot--incorrect')
    expect(dots[2].classes()).toContain('kf-quiz-progress__dot--answered')
    expect(dots[3].classes()).toContain('kf-quiz-progress__dot--unanswered')
    expect(dots[1].attributes('aria-current')).toBe('step')
  })

  it('点击题号派发 jump，jumpable=false 时渲染为非按钮', async () => {
    const wrapper = mount(KfQuizProgress, { props: { items, jumpable: true } })
    await wrapper.findAll('.kf-quiz-progress__dot')[2].trigger('click')
    expect(wrapper.emitted('jump')).toEqual([[2]])

    const readonly = mount(KfQuizProgress, { props: { items, jumpable: false } })
    expect(readonly.findAll('button.kf-quiz-progress__dot')).toHaveLength(0)
    await readonly.findAll('.kf-quiz-progress__dot')[0].trigger('click')
    expect(readonly.emitted('jump')).toBeUndefined()
  })

  it('showSummary=false 隐藏汇总', () => {
    const wrapper = mount(KfQuizProgress, { props: { items, showSummary: false } })
    expect(wrapper.find('.kf-quiz-progress__summary').exists()).toBe(false)
  })

  it('label 覆盖题号显示', () => {
    const wrapper = mount(KfQuizProgress, { props: { items: [{ id: 'a', label: 'Q1' }] } })
    expect(wrapper.get('.kf-quiz-progress__dot').text()).toBe('Q1')
  })
})

describe('KfQuizResult', () => {
  it('展示分数、通过徽标与统计项', () => {
    const wrapper = mount(KfQuizResult, {
      props: { score: 86, passScore: 60, total: 10, correct: 8, incorrect: 2, skipped: 0, duration: '05:20' },
    })
    expect(wrapper.get('.kf-quiz-result__score-value').text()).toBe('86')
    expect(wrapper.get('.kf-quiz-result__badge').text()).toBe('通过')
    expect(wrapper.classes()).toContain('kf-quiz-result--passed')
    expect(wrapper.get('.kf-quiz-result__duration').text()).toBe('用时 05:20')
    expect(wrapper.findAll('.kf-quiz-result__stat')).toHaveLength(4)
  })

  it('低于通过线显示未通过', () => {
    const wrapper = mount(KfQuizResult, { props: { score: 55, passScore: 60 } })
    expect(wrapper.get('.kf-quiz-result__badge').text()).toBe('未通过')
    expect(wrapper.classes()).toContain('kf-quiz-result--failed')
  })

  it('越界分数被裁剪到 0–100', () => {
    expect(mount(KfQuizResult, { props: { score: 180 } }).get('.kf-quiz-result__score-value').text()).toBe('100')
    expect(mount(KfQuizResult, { props: { score: -10 } }).get('.kf-quiz-result__score-value').text()).toBe('0')
  })

  it('统计项为 null 时不渲染该块', () => {
    const wrapper = mount(KfQuizResult, { props: { score: 70, total: 10, correct: 7 } })
    const stats = wrapper.findAll('.kf-quiz-result__stat')
    // total 与 correct 各一块；incorrect / skipped 为 null 不渲染
    expect(stats).toHaveLength(2)
    expect(stats[1].classes()).toContain('kf-quiz-result__stat--ok')
  })

  it('操作按钮派发 retry / review', async () => {
    const wrapper = mount(KfQuizResult, { props: { score: 70 } })
    const buttons = wrapper.findAll('.kf-quiz-result__btn')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('review')).toHaveLength(1)
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('label 置空时不渲染对应按钮', () => {
    const wrapper = mount(KfQuizResult, { props: { score: 70, reviewLabel: '', retryLabel: '' } })
    expect(wrapper.find('.kf-quiz-result__foot').exists()).toBe(false)
  })

  it('showPass=false 隐藏通过徽标与通过线', () => {
    const wrapper = mount(KfQuizResult, { props: { score: 70, showPass: false } })
    expect(wrapper.find('.kf-quiz-result__badge').exists()).toBe(false)
    expect(wrapper.find('.kf-quiz-result__pass-line').exists()).toBe(false)
  })
})
