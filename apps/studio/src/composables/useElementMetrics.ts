/**
 * 真实 DOM 尺寸测量：Studio 的「实际尺寸」面板只读浏览器真实布局值，
 * 不读源码里写的 token 数字，避免"文档写 38px、实际渲染 40px"的自证式谎言。
 *
 * 测量目标由 story.measureSelector 指定，必须落在组件自身上（如 .kf-button），
 * 而不是外层包装 —— 否则量到的是容器的继承样式，会得出"字重 400 / 背景透明"的假数据。
 */
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface ElementMetrics {
  width: number
  height: number
  fontSize: string
  fontWeight: string
  lineHeight: string
  background: string
  color: string
  borderRadius: string
  gap: string
  boxShadow: string
  outline: string
}

const EMPTY: ElementMetrics = {
  width: 0,
  height: 0,
  fontSize: '',
  fontWeight: '',
  lineHeight: '',
  background: '',
  color: '',
  borderRadius: '',
  gap: '',
  boxShadow: '',
  outline: '',
}

export function useElementMetrics(hostRef: Ref<HTMLElement | null>, selector: () => string) {
  const metrics = ref<ElementMetrics>({ ...EMPTY })
  let observer: ResizeObserver | null = null
  let raf = 0

  function measure() {
    const host = hostRef.value
    if (!host) return
    const target =
      (host.querySelector(selector()) as HTMLElement | null) ??
      (host.querySelector('[data-measure]') as HTMLElement | null) ??
      host
    const rect = target.getBoundingClientRect()
    const style = window.getComputedStyle(target)
    metrics.value = {
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      background: style.backgroundColor,
      color: style.color,
      borderRadius: style.borderRadius,
      gap: style.gap,
      boxShadow: style.boxShadow === 'none' ? 'none' : style.boxShadow,
      outline: style.outlineStyle === 'none' ? 'none' : `${style.outlineWidth} ${style.outlineStyle}`,
    }
  }

  function schedule() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    // 组件可能在自己的 mounted 之后才插入目标节点，再补测一次
    requestAnimationFrame(measure)
    const host = hostRef.value
    if (host && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule)
      observer.observe(host)
    }
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    observer?.disconnect()
  })

  return { metrics, measure: schedule }
}
