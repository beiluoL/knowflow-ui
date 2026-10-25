import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfInterviewQuestion from '../interview-question/KfInterviewQuestion.vue'
import KfInterviewFeedback from '../interview-feedback/KfInterviewFeedback.vue'
import KfInterviewScore from '../interview-score/KfInterviewScore.vue'

describe('KfInterviewQuestion', () => {
  it('渲染题号、分类、难度与建议时长', () => {
    const wrapper = mount(KfInterviewQuestion, {
      props: {
        question: '请介绍一次你主导的性能优化',
        index: 2,
        total: 5,
        category: '项目经验',
        difficulty: 'hard',
        timeLimit: '3 分钟',
      },
    })
    expect(wrapper.get('.kf-interview-question__index').text()).toBe('第 2 题')
    expect(wrapper.get('.kf-interview-question__total').text()).toBe('/ 5')
    expect(wrapper.get('.kf-interview-question__category').text()).toBe('项目经验')
    expect(wrapper.get('.kf-interview-question__difficulty').text()).toBe('困难')
    expect(wrapper.get('.kf-interview-question__time').text()).toContain('3 分钟')
    expect(wrapper.get('.kf-interview-question__text').text()).toBe('请介绍一次你主导的性能优化')
  })

  it('未作答时显示开始按钮并派发 start', async () => {
    const wrapper = mount(KfInterviewQuestion, { props: { question: 'q' } })
    const button = wrapper.get('.kf-interview-question__btn--primary')
    expect(button.text()).toContain('开始作答')

    await button.trigger('click')
    expect(wrapper.emitted('start')).toHaveLength(1)
  })

  it('作答中切换为结束按钮并派发 finish', async () => {
    const wrapper = mount(KfInterviewQuestion, { props: { question: 'q', answering: true } })
    expect(wrapper.classes()).toContain('kf-interview-question--answering')
    expect(wrapper.find('.kf-interview-question__btn--primary').exists()).toBe(false)

    await wrapper.get('.kf-interview-question__btn--stop').trigger('click')
    expect(wrapper.emitted('finish')).toHaveLength(1)
  })

  it('已答标记与追问块按需渲染', () => {
    const wrapper = mount(KfInterviewQuestion, {
      props: { question: 'q', answered: true, followUp: '具体指标是多少？' },
    })
    expect(wrapper.get('.kf-interview-question__answered').text()).toBe('已回答')
    expect(wrapper.get('.kf-interview-question__follow-up').text()).toContain('具体指标是多少？')
  })

  it('无分类 / 难度时不渲染对应徽标', () => {
    const wrapper = mount(KfInterviewQuestion, { props: { question: 'q' } })
    expect(wrapper.find('.kf-interview-question__category').exists()).toBe(false)
    expect(wrapper.find('.kf-interview-question__difficulty').exists()).toBe(false)
  })
})

describe('KfInterviewFeedback', () => {
  const dimensions = [
    { key: 'logic', label: '逻辑结构', score: 88, comment: '层次清晰' },
    { key: 'depth', label: '技术深度', score: 62 },
    { key: 'comm', label: '表达', score: 40, maxScore: 50 },
  ]

  it('维度进度条按比例着色并暴露 progressbar 语义', () => {
    const wrapper = mount(KfInterviewFeedback, { props: { dimensions } })
    const bars = wrapper.findAll('[role="progressbar"]')
    expect(bars).toHaveLength(3)
    expect(bars[0].attributes('aria-valuenow')).toBe('88')
    expect(bars[0].attributes('aria-valuemax')).toBe('100')
    expect(bars[2].attributes('aria-valuemax')).toBe('50')

    const fills = wrapper.findAll('.kf-interview-feedback__bar')
    expect(fills[0].attributes('style')).toContain('width: 88%')
    expect(fills[1].attributes('style')).toContain('width: 62%')
    expect(fills[2].attributes('style')).toContain('width: 80%')
  })

  it('按比例给出 good / warn / bad 三档色调', () => {
    const wrapper = mount(KfInterviewFeedback, { props: { dimensions } })
    const fills = wrapper.findAll('.kf-interview-feedback__bar')
    expect(fills[0].classes()).toContain('kf-interview-feedback__bar--good')
    expect(fills[1].classes()).toContain('kf-interview-feedback__bar--warn')
    // 40/50 = 80%，按比例仍属 good 档
    expect(fills[2].classes()).toContain('kf-interview-feedback__bar--good')

    const bad = mount(KfInterviewFeedback, { props: { dimensions: [{ key: 'x', label: 'x', score: 40 }] } })
    expect(bad.get('.kf-interview-feedback__bar').classes()).toContain('kf-interview-feedback__bar--bad')
  })

  it('展示分值、总评与评语', () => {
    const wrapper = mount(KfInterviewFeedback, {
      props: { dimensions, overall: '整体不错，深度待加强', title: '复盘' },
    })
    expect(wrapper.get('.kf-interview-feedback__title').text()).toBe('复盘')
    expect(wrapper.get('.kf-interview-feedback__overall').text()).toBe('整体不错，深度待加强')
    expect(wrapper.get('.kf-interview-feedback__comment').text()).toBe('层次清晰')
    expect(wrapper.get('.kf-interview-feedback__dimension-score').text().replace(/\s+/g, ' ')).toBe('88 / 100')
  })

  it('亮点与待改进列表分别渲染', () => {
    const wrapper = mount(KfInterviewFeedback, {
      props: { strengths: ['结构清晰', '举例具体'], improvements: ['补充数据'] },
    })
    expect(wrapper.findAll('.kf-interview-feedback__list-item')).toHaveLength(3)
    expect(wrapper.get('.kf-interview-feedback__list-title--good').text()).toBe('亮点')
    expect(wrapper.get('.kf-interview-feedback__list-title--warn').text()).toBe('待改进')
  })

  it('越界分数被裁剪，不撑破进度条', () => {
    const wrapper = mount(KfInterviewFeedback, {
      props: { dimensions: [{ key: 'x', label: '异常', score: 250 }] },
    })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get('.kf-interview-feedback__bar').attributes('style')).toContain('width: 100%')
  })

  it('无维度时展示占位文案', () => {
    const wrapper = mount(KfInterviewFeedback, { props: { dimensions: [], emptyText: '暂无评分' } })
    expect(wrapper.get('.kf-interview-feedback__empty').text()).toBe('暂无评分')
  })

  it('showScores=false 隐藏分值', () => {
    const wrapper = mount(KfInterviewFeedback, { props: { dimensions, showScores: false } })
    expect(wrapper.find('.kf-interview-feedback__dimension-score').exists()).toBe(false)
  })
})

describe('KfInterviewScore', () => {
  it('环形图暴露完整 aria-label，并绘制圆环', () => {
    const wrapper = mount(KfInterviewScore, { props: { score: 86, maxScore: 100 } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('综合得分 86 分，满分 100 分，良好')
    expect(wrapper.findAll('circle')).toHaveLength(2)
    expect(wrapper.get('.kf-interview-score__value').text()).toBe('86')
    expect(wrapper.get('.kf-interview-score__max').text()).toBe('/ 100')
  })

  it('进度按比例换算成 stroke-dashoffset', () => {
    const half = mount(KfInterviewScore, { props: { score: 50, maxScore: 100 } })
    const circumference = 2 * Math.PI * 34
    const offset = Number(half.findAll('circle')[1].attributes('stroke-dashoffset'))
    expect(offset).toBeCloseTo(circumference / 2, 1)

    const full = mount(KfInterviewScore, { props: { score: 100 } })
    expect(Number(full.findAll('circle')[1].attributes('stroke-dashoffset'))).toBe(0)
  })

  it('默认档位随比例变化，level 可覆盖', () => {
    expect(mount(KfInterviewScore, { props: { score: 95 } }).get('.kf-interview-score__level').text()).toBe('优秀')
    expect(mount(KfInterviewScore, { props: { score: 78 } }).get('.kf-interview-score__level').text()).toBe('良好')
    expect(mount(KfInterviewScore, { props: { score: 65 } }).get('.kf-interview-score__level').text()).toBe('合格')
    expect(mount(KfInterviewScore, { props: { score: 30 } }).get('.kf-interview-score__level').text()).toBe('待提升')
    expect(
      mount(KfInterviewScore, { props: { score: 30, level: 'A' } }).get('.kf-interview-score__level').text(),
    ).toBe('A')
  })

  it('分数越界与非法满分被兜底，不出现 NaN', () => {
    const over = mount(KfInterviewScore, { props: { score: 200 } })
    expect(over.get('.kf-interview-score__value').text()).toBe('100')

    const bad = mount(KfInterviewScore, { props: { score: 50, maxScore: 0 } })
    expect(bad.get('.kf-interview-score__max').text()).toBe('/ 100')
  })

  it('size 与 tone 影响类名，showLevel=false 隐藏档位', () => {
    const wrapper = mount(KfInterviewScore, { props: { score: 90, size: 'lg' } })
    expect(wrapper.classes()).toContain('kf-interview-score--lg')
    expect(wrapper.classes()).toContain('kf-interview-score--good')

    const noLevel = mount(KfInterviewScore, { props: { score: 90, showLevel: false } })
    expect(noLevel.find('.kf-interview-score__level').exists()).toBe(false)
    expect(noLevel.attributes('aria-label')).not.toContain('优秀')
  })
})
