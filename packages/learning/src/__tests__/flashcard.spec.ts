import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfFlashcard from '../flashcard/KfFlashcard.vue'
import KfFlashcardRating from '../flashcard-rating/KfFlashcardRating.vue'
import KfReviewProgress from '../review-progress/KfReviewProgress.vue'

describe('KfFlashcard', () => {
  it('默认展示正面，点击后切到背面（非受控）', async () => {
    const wrapper = mount(KfFlashcard, { props: { front: '什么是 RAG', back: '检索增强生成' } })
    expect(wrapper.get('.kf-flashcard__label').text()).toBe('问题')
    expect(wrapper.get('.kf-flashcard__text').text()).toBe('什么是 RAG')

    await wrapper.get('.kf-flashcard__surface').trigger('click')

    expect(wrapper.get('.kf-flashcard__label').text()).toBe('答案')
    expect(wrapper.get('.kf-flashcard__text').text()).toBe('检索增强生成')
    expect(wrapper.emitted('flip')).toEqual([[true]])
    expect(wrapper.emitted('update:flipped')).toEqual([[true]])
  })

  it('受控模式下点击只发事件，展示仍跟随 props', async () => {
    const wrapper = mount(KfFlashcard, {
      props: { front: '正', back: '反', flipped: false },
    })
    await wrapper.get('.kf-flashcard__surface').trigger('click')

    expect(wrapper.emitted('update:flipped')).toEqual([[true]])
    expect(wrapper.get('.kf-flashcard__text').text()).toBe('正')

    await wrapper.setProps({ flipped: true })
    expect(wrapper.get('.kf-flashcard__text').text()).toBe('反')
  })

  it('flippable=false 时按钮禁用且不派发事件', async () => {
    const wrapper = mount(KfFlashcard, {
      props: { front: '正', back: '反', flippable: false },
    })
    const surface = wrapper.get('.kf-flashcard__surface')
    expect(surface.attributes('disabled')).toBeDefined()
    await surface.trigger('click')
    expect(wrapper.emitted('flip')).toBeUndefined()
    expect(wrapper.find('.kf-flashcard__flip').exists()).toBe(false)
  })

  it('disabled 时两个入口都不可用', async () => {
    const wrapper = mount(KfFlashcard, { props: { front: '正', disabled: true } })
    expect(wrapper.get('.kf-flashcard__surface').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.kf-flashcard__flip').attributes('disabled')).toBeDefined()
  })

  it('flip 按钮与卡片点击语义一致，aria-label 描述下一步动作', async () => {
    const wrapper = mount(KfFlashcard, { props: { front: '正', back: '反' } })
    expect(wrapper.get('.kf-flashcard__surface').attributes('aria-label')).toBe('显示答案')

    await wrapper.get('.kf-flashcard__flip').trigger('click')
    expect(wrapper.get('.kf-flashcard__surface').attributes('aria-label')).toBe('显示问题')
    expect(wrapper.get('.kf-flashcard__flip').text()).toContain('看问题')
  })

  it('题号 / 标签 / 插槽元信息渲染在头部', () => {
    const wrapper = mount(KfFlashcard, {
      props: { index: 2, total: 10, tags: ['算法'], front: 'x' },
      slots: { meta: '<span class="custom-meta">来源</span>' },
    })
    expect(wrapper.get('.kf-flashcard__position').text()).toContain('2')
    expect(wrapper.get('.kf-flashcard__position-total').text()).toBe('/ 10')
    expect(wrapper.get('.kf-flashcard__tag').text()).toBe('算法')
    expect(wrapper.find('.custom-meta').exists()).toBe(true)
  })

  it('空内容时给出占位而不是空白卡片', () => {
    const wrapper = mount(KfFlashcard, {})
    expect(wrapper.get('.kf-flashcard__text').text()).toBe('（正面为空）')
  })
})

describe('KfFlashcardRating', () => {
  it('渲染四个默认档位并带着色语义类', () => {
    const wrapper = mount(KfFlashcardRating, {})
    const buttons = wrapper.findAll('.kf-flashcard-rating__button')
    expect(wrapper.findAll('.kf-flashcard-rating__label').map((n) => n.text())).toEqual([
      '忘记',
      '困难',
      '一般',
      '简单',
    ])
    expect(buttons[0].classes()).toContain('kf-flashcard-rating__button--danger')
    expect(buttons[3].classes()).toContain('kf-flashcard-rating__button--success')
  })

  it('点击派发 update:modelValue 与 select', async () => {
    const wrapper = mount(KfFlashcardRating, {})
    await wrapper.findAll('.kf-flashcard-rating__button')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe(3)
  })

  it('选中项 aria-checked=true 且带选中类', () => {
    const wrapper = mount(KfFlashcardRating, { props: { modelValue: 2 } })
    const buttons = wrapper.findAll('.kf-flashcard-rating__button')
    expect(buttons[1].attributes('aria-checked')).toBe('true')
    expect(buttons[1].classes()).toContain('kf-flashcard-rating__button--selected')
    expect(buttons[0].attributes('aria-checked')).toBe('false')
  })

  it('radiogroup 只保留一个 tabindex=0，方向键移动焦点', async () => {
    const wrapper = mount(KfFlashcardRating, { props: { modelValue: 1 } })
    const buttons = wrapper.findAll('.kf-flashcard-rating__button')
    expect(buttons.map((b) => b.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1'])

    await buttons[0].trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[1].attributes('tabindex')).toBe('0')

    await buttons[1].trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[0].attributes('tabindex')).toBe('0')

    await buttons[0].trigger('keydown', { key: 'End' })
    expect(buttons[3].attributes('tabindex')).toBe('0')
  })

  it('方向键在首尾循环', async () => {
    const wrapper = mount(KfFlashcardRating, { props: { modelValue: 1 } })
    const buttons = wrapper.findAll('.kf-flashcard-rating__button')

    await buttons[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[3].attributes('tabindex')).toBe('0')

    await buttons[3].trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[0].attributes('tabindex')).toBe('0')
  })

  it('disabled 时不响应点击与键盘', async () => {
    const wrapper = mount(KfFlashcardRating, { props: { disabled: true, modelValue: 1 } })
    const buttons = wrapper.findAll('.kf-flashcard-rating__button')
    expect(buttons[0].attributes('disabled')).toBeDefined()

    await buttons[1].trigger('click')
    await buttons[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(buttons[0].attributes('tabindex')).toBe('0')
  })

  it('interval 由宿主提供，showInterval=false 时不展示', () => {
    const options = [
      { value: 1, label: '忘记', interval: '10 分钟' },
      { value: 2, label: '一般', interval: '3 天' },
    ]
    const shown = mount(KfFlashcardRating, { props: { options } })
    expect(shown.findAll('.kf-flashcard-rating__interval').map((n) => n.text())).toEqual(['10 分钟', '3 天'])

    const hidden = mount(KfFlashcardRating, { props: { options, showInterval: false } })
    expect(hidden.find('.kf-flashcard-rating__interval').exists()).toBe(false)
  })

  it('chooseByValue 供宿主快捷键调用，越界值被忽略', () => {
    const wrapper = mount(KfFlashcardRating, {})
    const api = wrapper.vm as unknown as { chooseByValue: (value: number) => void }

    api.chooseByValue(4)
    expect(wrapper.emitted('update:modelValue')).toEqual([[4]])

    api.chooseByValue(99)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })
})

describe('KfReviewProgress', () => {
  it('按 completed / total 计算百分比与 aria 值', () => {
    const wrapper = mount(KfReviewProgress, { props: { total: 40, completed: 10 } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('10')
    expect(bar.attributes('aria-valuemax')).toBe('40')
    expect(bar.attributes('aria-valuetext')).toBe('已完成 10 / 40')
    expect(wrapper.get('.kf-review-progress__bar').attributes('style')).toContain('width: 25%')
  })

  it('remaining 未传时按差值推导，传入时以传入值为准', () => {
    const derived = mount(KfReviewProgress, { props: { total: 10, completed: 4 } })
    expect(derived.get('.kf-review-progress__remaining').text()).toBe('还剩 6 张')

    const explicit = mount(KfReviewProgress, { props: { total: 10, completed: 4, remaining: 2 } })
    expect(explicit.get('.kf-review-progress__remaining').text()).toBe('还剩 2 张')
  })

  it('全部完成时切换文案并进入 done 态', () => {
    const wrapper = mount(KfReviewProgress, { props: { total: 5, completed: 5 } })
    expect(wrapper.classes()).toContain('kf-review-progress--done')
    expect(wrapper.get('.kf-review-progress__label').text()).toBe('今日复习已完成')
    expect(wrapper.get('.kf-review-progress__bar').attributes('style')).toContain('width: 100%')
  })

  it('total=0 时百分比为 0，不出现 NaN', () => {
    const wrapper = mount(KfReviewProgress, { props: { total: 0, completed: 0 } })
    expect(wrapper.get('.kf-review-progress__bar').attributes('style')).toContain('width: 0%')
  })

  it('completed 超过 total 时被裁剪，百分比不超过 100', () => {
    const wrapper = mount(KfReviewProgress, { props: { total: 4, completed: 99 } })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('4')
    expect(wrapper.get('.kf-review-progress__bar').attributes('style')).toContain('width: 100%')
  })

  it('breakdown 统计项按宿主给定原样展示', () => {
    const wrapper = mount(KfReviewProgress, {
      props: {
        total: 20,
        completed: 5,
        breakdown: [
          { label: '新卡', value: 12 },
          { label: '复习卡', value: 8 },
        ],
      },
    })
    const chips = wrapper.findAll('.kf-review-progress__chip')
    expect(chips.map((chip) => chip.text().replace(/\s+/g, ' '))).toEqual(['新卡 12', '复习卡 8'])
  })

  it('showCounts=false 隐藏计数', () => {
    const wrapper = mount(KfReviewProgress, { props: { total: 3, completed: 1, showCounts: false } })
    expect(wrapper.find('.kf-review-progress__counts').exists()).toBe(false)
  })
})
