import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KfThinkingPanel from '../thinking-panel/KfThinkingPanel.vue'
import KfAgentTrace from '../agent-trace/KfAgentTrace.vue'
import KfToolCallCard from '../tool-call-card/KfToolCallCard.vue'
import KfExecutionStatus from '../execution-status/KfExecutionStatus.vue'

describe('KfThinkingPanel', () => {
  it('默认折叠：aria-expanded=false 且正文隐藏', () => {
    const wrapper = mount(KfThinkingPanel, { props: { content: '先分析问题' } })
    const head = wrapper.get('button.kf-thinking-panel__head')
    expect(head.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.kf-thinking-panel__body').attributes('style')).toContain('display: none')
  })

  it('点击标题展开并派发 toggle', async () => {
    const wrapper = mount(KfThinkingPanel, { props: { content: '推理内容' } })
    await wrapper.get('button.kf-thinking-panel__head').trigger('click')

    expect(wrapper.get('button.kf-thinking-panel__head').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('toggle')).toEqual([[true]])
    expect(wrapper.get('.kf-thinking-panel__text').text()).toBe('推理内容')
  })

  it('streaming 时初始展开并显示思考中状态', () => {
    const wrapper = mount(KfThinkingPanel, { props: { streaming: true, content: '正在想' } })
    expect(wrapper.get('button.kf-thinking-panel__head').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('.kf-thinking-panel__live').attributes('role')).toBe('status')
  })

  it('流式开始会自动展开（即便此前被用户收起）', async () => {
    const wrapper = mount(KfThinkingPanel, { props: { content: 'x' } })
    await wrapper.setProps({ streaming: true })
    expect(wrapper.get('button.kf-thinking-panel__head').attributes('aria-expanded')).toBe('true')
  })

  it('streaming 且无内容时按钮禁用，避免展开空面板', async () => {
    const wrapper = mount(KfThinkingPanel, { props: { streaming: true } })
    const head = wrapper.get('button.kf-thinking-panel__head')
    expect(head.attributes('disabled')).toBeDefined()
    await head.trigger('click')
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })

  it('collapsible=false 时使用非按钮容器且始终展开', () => {
    const wrapper = mount(KfThinkingPanel, {
      props: { collapsible: false, content: '一直显示' },
    })
    expect(wrapper.find('button.kf-thinking-panel__head').exists()).toBe(false)
    // v-show 隐藏时会写入内联 display:none；可见时该 attribute 直接不存在
    expect(wrapper.get('.kf-thinking-panel__body').isVisible()).toBe(true)
  })

  it('content 为空时展示占位文案而非空白', () => {
    const wrapper = mount(KfThinkingPanel, { props: { defaultOpen: true, emptyText: '没有思考内容' } })
    expect(wrapper.get('.kf-thinking-panel__empty').text()).toBe('没有思考内容')
  })

  it('自定义插槽覆盖默认文本渲染', () => {
    const wrapper = mount(KfThinkingPanel, {
      props: { defaultOpen: true, content: 'x' },
      slots: { default: '<div class="custom-body">自定义</div>' },
    })
    expect(wrapper.find('.custom-body').exists()).toBe(true)
    expect(wrapper.find('.kf-thinking-panel__text').exists()).toBe(false)
  })
})

describe('KfAgentTrace', () => {
  const steps = [
    { id: 's1', title: '拆解问题', kind: 'plan' as const, status: 'success' as const, duration: '120ms' },
    { id: 's2', title: '检索知识库', kind: 'tool' as const, status: 'running' as const },
    { id: 's3', title: '生成答案', kind: 'final' as const, status: 'error' as const, detail: '调用超时' },
  ]

  it('按顺序渲染步骤并标记 aria-current', () => {
    const wrapper = mount(KfAgentTrace, { props: { steps } })
    const items = wrapper.findAll('.kf-agent-trace__item')
    expect(items).toHaveLength(3)
    expect(items[1].attributes('aria-current')).toBe('step')
    expect(items[0].attributes('aria-current')).toBeUndefined()
  })

  it('运行 / 失败 / 跳过状态各有独立类名与文案', () => {
    const wrapper = mount(KfAgentTrace, { props: { steps } })
    expect(wrapper.findAll('.kf-agent-trace__item')[1].classes()).toContain('kf-agent-trace__item--running')
    expect(wrapper.get('.kf-agent-trace__status--error').text()).toBe('失败')
    expect(wrapper.get('.kf-agent-trace__status--running').text()).toBe('进行中')

    const skipped = mount(KfAgentTrace, {
      props: { steps: [{ id: 'x', title: '跳过项', status: 'skipped' }] },
    })
    expect(skipped.text()).toContain('已跳过')
  })

  it('点击步骤标题派发 select', async () => {
    const wrapper = mount(KfAgentTrace, { props: { steps } })
    await wrapper.findAll('.kf-agent-trace__title-btn')[0].trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([steps[0], 0])
  })

  it('详情默认收起，点击后展开且 aria-expanded 同步', async () => {
    const wrapper = mount(KfAgentTrace, { props: { steps } })
    const toggle = wrapper.get('.kf-agent-trace__detail-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.kf-agent-trace__detail').attributes('style')).toContain('display: none')

    await toggle.trigger('click')
    expect(wrapper.get('.kf-agent-trace__detail-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('.kf-agent-trace__detail').text()).toBe('调用超时')
  })

  it('expandedIds 指定初始展开项', () => {
    const wrapper = mount(KfAgentTrace, { props: { steps, expandedIds: ['s3'] } })
    expect(wrapper.get('.kf-agent-trace__detail-toggle').attributes('aria-expanded')).toBe('true')
  })

  it('compact 隐藏描述与详情，仅保留步骤标题', () => {
    const wrapper = mount(KfAgentTrace, {
      props: { steps: [{ id: 'a', title: '步骤', description: '说明', detail: '详情' }], compact: true },
    })
    expect(wrapper.find('.kf-agent-trace__desc').exists()).toBe(false)
    expect(wrapper.find('.kf-agent-trace__detail-toggle').exists()).toBe(false)
    expect(wrapper.text()).toContain('步骤')
  })

  it('空步骤展示占位文案', () => {
    const wrapper = mount(KfAgentTrace, { props: { steps: [], emptyText: '暂无步骤' } })
    expect(wrapper.get('.kf-agent-trace__empty').text()).toBe('暂无步骤')
  })
})

describe('KfToolCallCard', () => {
  it('审批请求态展示允许 / 拒绝按钮，且只发事件', async () => {
    const wrapper = mount(KfToolCallCard, {
      props: { name: 'search_docs', approval: 'requested', approveLabel: '允许执行', rejectLabel: '拒绝' },
    })
    const buttons = wrapper.findAll('.kf-tool-call-card__btn')
    expect(buttons).toHaveLength(2)

    await buttons[1].trigger('click')
    await buttons[0].trigger('click')

    expect(wrapper.emitted('reject')).toHaveLength(1)
    expect(wrapper.emitted('approve')).toHaveLength(1)
  })

  it('已批准 / 已拒绝各显示一条只读说明', () => {
    const approved = mount(KfToolCallCard, { props: { name: 'x', approval: 'approved' } })
    expect(approved.get('.kf-tool-call-card__approval-note').text()).toBe('已确认执行')

    const rejected = mount(KfToolCallCard, { props: { name: 'x', approval: 'rejected' } })
    expect(rejected.text()).toContain('已拒绝执行')
  })

  it('默认折叠，点击头部展开并派发 toggle', async () => {
    const wrapper = mount(KfToolCallCard, { props: { name: 'run_sql', args: '{"q":"select 1"}' } })
    const toggle = wrapper.get('.kf-tool-call-card__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.kf-tool-call-card__body').attributes('style')).toContain('display: none')

    await toggle.trigger('click')
    expect(wrapper.get('.kf-tool-call-card__toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('toggle')).toEqual([[true]])
  })

  it('展开后按纯文本渲染入参与结果（JSON 不被解析）', async () => {
    const wrapper = mount(KfToolCallCard, {
      props: { name: 'run', defaultOpen: true, args: '{"a":1}', result: '<b>ok</b>' },
    })
    expect(wrapper.get('.kf-tool-call-card__pre').text()).toBe('{"a":1}')
    expect(wrapper.findAll('.kf-tool-call-card__pre')[1].text()).toBe('<b>ok</b>')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('失败态显示错误块与失败状态', () => {
    const wrapper = mount(KfToolCallCard, {
      props: { name: 'run', status: 'error', error: '权限不足', defaultOpen: true },
    })
    expect(wrapper.classes()).toContain('kf-tool-call-card--error')
    expect(wrapper.get('.kf-tool-call-card__state').text()).toBe('失败')
    expect(wrapper.get('.kf-tool-call-card__pre--error').text()).toBe('权限不足')
  })

  it('无详情时展示占位文案', () => {
    const wrapper = mount(KfToolCallCard, { props: { name: 'run', defaultOpen: true } })
    expect(wrapper.get('.kf-tool-call-card__placeholder').text()).toBe('暂无调用详情')
  })
})

describe('KfExecutionStatus', () => {
  it('容器是 role=status 且带 aria-live', () => {
    const wrapper = mount(KfExecutionStatus, { props: { status: 'running' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('有进度时渲染 progressbar 与百分比', () => {
    const wrapper = mount(KfExecutionStatus, { props: { status: 'running', progress: 42 } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('42')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.get('.kf-execution-status__percent').text()).toBe('42%')
  })

  it('进度越界被裁剪到 0–100', () => {
    const over = mount(KfExecutionStatus, { props: { status: 'running', progress: 180 } })
    expect(over.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')

    const under = mount(KfExecutionStatus, { props: { status: 'running', progress: -20 } })
    expect(under.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('进度未知时用不确定动效，不伪造 progressbar', () => {
    const wrapper = mount(KfExecutionStatus, { props: { status: 'running', progress: null } })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    expect(wrapper.find('.kf-execution-status__track--indeterminate').exists()).toBe(true)
  })

  it('可取消时仅在运行 / 排队态显示取消按钮', async () => {
    const running = mount(KfExecutionStatus, { props: { status: 'running', cancellable: true } })
    await running.get('.kf-execution-status__cancel').trigger('click')
    expect(running.emitted('cancel')).toHaveLength(1)

    const success = mount(KfExecutionStatus, { props: { status: 'success', cancellable: true } })
    expect(success.find('.kf-execution-status__cancel').exists()).toBe(false)
  })

  it('label 覆盖默认文案，description 作为次要说明', () => {
    const wrapper = mount(KfExecutionStatus, {
      props: { status: 'error', label: '生成失败', description: '上游超时' },
    })
    expect(wrapper.get('.kf-execution-status__label').text()).toContain('生成失败')
    expect(wrapper.get('.kf-execution-status__desc').text()).toBe('上游超时')
  })

  it('idle 态不显示加载动效也不占用 aria-busy', () => {
    const wrapper = mount(KfExecutionStatus, { props: { status: 'idle' } })
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(wrapper.find('.kf-execution-status__track--indeterminate').exists()).toBe(false)
  })
})
